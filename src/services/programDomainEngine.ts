import { ProgramDomain, ProgramProfileConfig } from '../types';
import { PROGRAM_PROFILES } from '../config/programProfiles';

/**
 * Program & Domain Boundary Engine
 * Provides intelligent domain detection, strict cross-discipline isolation,
 * and flexible rule enforcement for any uploaded engineering/procurement program.
 */

export interface DomainDetectionResult {
  detectedDomain: ProgramDomain;
  confidence: number;
  matchedKeywords: string[];
  appliedProfile: ProgramProfileConfig;
  domainDisciplineBreakdown: Record<ProgramDomain, number>;
}

/**
 * Analyzes uploaded document text to automatically identify the project domain.
 */
export function detectProgramDomain(
  documentsText: string,
  preferredDomain?: ProgramDomain
): DomainDetectionResult {
  if (preferredDomain && preferredDomain !== 'UNIVERSAL_MULTI' && PROGRAM_PROFILES[preferredDomain]) {
    return {
      detectedDomain: preferredDomain,
      confidence: 1.0,
      matchedKeywords: ['User Preferred Domain'],
      appliedProfile: PROGRAM_PROFILES[preferredDomain],
      domainDisciplineBreakdown: {
        ELECTRICAL: preferredDomain === 'ELECTRICAL' ? 100 : 0,
        PIPING_WATER: preferredDomain === 'PIPING_WATER' ? 100 : 0,
        CIVIL_STRUCTURE: preferredDomain === 'CIVIL_STRUCTURE' ? 100 : 0,
        MECHANICAL_HVAC: preferredDomain === 'MECHANICAL_HVAC' ? 100 : 0,
        INSTRUMENTATION_SCADA: preferredDomain === 'INSTRUMENTATION_SCADA' ? 100 : 0,
        GENERAL_PROCUREMENT: preferredDomain === 'GENERAL_PROCUREMENT' ? 100 : 0,
        UNIVERSAL_MULTI: 0,
      },
    };
  }

  const textLower = (documentsText || '').toLowerCase();
  const scores: Record<ProgramDomain, number> = {
    ELECTRICAL: 0,
    PIPING_WATER: 0,
    CIVIL_STRUCTURE: 0,
    MECHANICAL_HVAC: 0,
    INSTRUMENTATION_SCADA: 0,
    GENERAL_PROCUREMENT: 0,
    UNIVERSAL_MULTI: 1,
  };

  const matchedKeywordsMap: Record<ProgramDomain, string[]> = {
    ELECTRICAL: [],
    PIPING_WATER: [],
    CIVIL_STRUCTURE: [],
    MECHANICAL_HVAC: [],
    INSTRUMENTATION_SCADA: [],
    GENERAL_PROCUREMENT: [],
    UNIVERSAL_MULTI: [],
  };

  for (const [domainKey, profile] of Object.entries(PROGRAM_PROFILES)) {
    const domain = domainKey as ProgramDomain;
    if (domain === 'UNIVERSAL_MULTI') continue;

    for (const kw of profile.positiveKeywords) {
      const kwLower = kw.toLowerCase();
      if (textLower.includes(kwLower)) {
        // Weight longer and more specific keywords higher
        const weight = kwLower.split(' ').length > 1 ? 3 : 1;
        scores[domain] += weight;
        if (!matchedKeywordsMap[domain].includes(kw)) {
          matchedKeywordsMap[domain].push(kw);
        }
      }
    }
  }

  // Find dominant domain
  let topDomain: ProgramDomain = 'UNIVERSAL_MULTI';
  let topScore = 0;
  let totalScore = 0;

  for (const [domainKey, score] of Object.entries(scores)) {
    const domain = domainKey as ProgramDomain;
    totalScore += score;
    if (score > topScore && domain !== 'UNIVERSAL_MULTI') {
      topScore = score;
      topDomain = domain;
    }
  }

  // If score is too low or evenly spread across multiple domains, fallback to UNIVERSAL_MULTI
  const confidence = totalScore > 0 ? Math.min(0.99, Number((topScore / Math.max(1, totalScore)).toFixed(2))) : 0.5;

  if (topScore < 3) {
    topDomain = 'UNIVERSAL_MULTI';
  }

  const selectedDomain = preferredDomain && preferredDomain !== 'UNIVERSAL_MULTI' ? preferredDomain : topDomain;

  return {
    detectedDomain: selectedDomain,
    confidence,
    matchedKeywords: matchedKeywordsMap[selectedDomain] || [],
    appliedProfile: PROGRAM_PROFILES[selectedDomain] || PROGRAM_PROFILES.UNIVERSAL_MULTI,
    domainDisciplineBreakdown: scores,
  };
}

/**
 * Returns strict negative boundary exclusions for a specific item to prevent cross-domain contamination.
 */
export function getItemExclusionBoundaries(
  itemName: string,
  proposedText: string,
  activeDomain: ProgramDomain = 'UNIVERSAL_MULTI',
  strictMode = true
): string[] {
  if (!strictMode) return [];

  const combined = `${itemName} ${proposedText}`.toLowerCase();
  const exclusions: string[] = [];

  // 1. Check active domain specific boundaries
  const profile = PROGRAM_PROFILES[activeDomain];
  if (profile && profile.negativeBoundaries) {
    for (const [key, exclList] of Object.entries(profile.negativeBoundaries)) {
      if (combined.includes(key.toLowerCase()) || key.split('_').some((k) => combined.includes(k))) {
        exclusions.push(...exclList);
      }
    }
  }

  // 2. Discipline Isolation Universal Rules:
  // Item Tiang / Struktur Fisik -> STRICTLY EXCLUDE cables, coaxial measurements, electrical ohm tests, valves, gaskets
  if (
    (/\b(?:tiang|pole|struktur|pondasi|rangka|baseplate|anchor|monopole|menara)\b/i.test(combined) ||
      combined.includes('5m') ||
      combined.includes('15m') ||
      combined.includes('pipa galvanis')) &&
    !combined.includes('jasa') &&
    !combined.includes('pemasangan kabel')
  ) {
    exclusions.push(
      'kabel',
      'coaxial',
      'pengukuran kabel',
      'down conductor',
      'tarikan kabel',
      'cable tray',
      'ohm',
      'tahanan',
      'earth tester',
      'gasket',
      'valve',
      'katup',
      'hydrostatic',
      'tekanan bar',
      '0,85 ohm',
      '1,42 ohm',
      '1,65 ohm',
      '1,18 ohm'
    );
  }

  // Item Kabel / Down Conductor -> STRICTLY EXCLUDE poles, baseplates, monopole telescopics, valves, gaskets, grounding ohm tests
  if (
    (/\b(?:kabel|conductor|cable|feeder|fo)\b/i.test(combined) || combined.includes('coaxial')) &&
    !combined.includes('jasa') &&
    !combined.includes('terminasi')
  ) {
    exclusions.push(
      'tiang',
      'pole',
      'monopole',
      'pipa bulat',
      'round pipe',
      '5 segmen',
      'baseplate',
      'anchor bolt',
      'teleskopik',
      'ohm',
      'tahanan',
      'earth tester',
      'gate valve',
      'katup',
      'gasket',
      'baut & mur'
    );
  }

  // Item Terminal Petir / Air Terminal -> STRICTLY EXCLUDE cable length opname, poles, grounding resistance, valves
  if (/\b(?:air terminal|terminal petir|head terminal|ese)\b/i.test(combined)) {
    exclusions.push(
      'kabel coaxial',
      'pengukuran kabel',
      '176,4',
      '176.4',
      'tiang pipa round',
      'tiang 5m',
      'tiang 15m',
      'ohm',
      'tahanan',
      'earth tester',
      'gasket',
      'valve',
      'katup'
    );
  }

  // Item Lining / Coating / Cat / Tangki -> STRICTLY EXCLUDE mechanical valves, gates, piping mechanicals, electrical poles, cables, ohm tests
  if (/\b(?:lining|lapisan|coating|cat|epoxy|tangki|reservoir|tandon|layer)\b/i.test(combined)) {
    exclusions.push(
      'gate valve',
      'valve',
      'katup',
      'handwheel',
      'dn 300',
      'dn300',
      'dn 200',
      'dn 150',
      'pn 16',
      'pn16',
      'ductile iron',
      'ggg50',
      'ggg-50',
      'tiang',
      'monopole',
      'kabel coaxial',
      'down conductor',
      'terminal petir',
      'earth tester',
      'tahanan pembumian',
      'ohm'
    );
  }

  // Item Katup / Gate Valve / Butterfly -> STRICTLY EXCLUDE cables, poles, bolts, gaskets, electrical ohm tests, and tank lining
  if (/\b(?:valve|katup|gate|butterfly|check)\b/i.test(combined)) {
    exclusions.push(
      'kabel coaxial',
      'pengukuran kabel',
      'air terminal',
      'penangkal petir',
      'tahanan ohm',
      'earth tester',
      'tiang bulat',
      'tiang monopole',
      'baut & mur',
      'bolt & nut',
      'gasket epdm',
      'lining',
      'lapisan lining',
      'coating tangki',
      'pengecekan layer'
    );
  }

  // Item Gasket & Flange -> STRICTLY EXCLUDE cables, poles, valves, bolts, electrical tests
  if (/\b(?:gasket|paking|packing|penyekat flens)\b/i.test(combined)) {
    exclusions.push(
      'kabel',
      'coaxial',
      'tiang',
      'pole',
      'ohm',
      'terminal petir',
      'earth tester',
      'gate valve dn 300',
      'baut & mur',
      'bolt & nut'
    );
  }

  // Item Fastener / Baut & Mur -> STRICTLY EXCLUDE cables, poles, valves, gaskets, electrical tests
  if (/\b(?:bolt|nut|baut|mur|fastener)\b/i.test(combined)) {
    exclusions.push(
      'kabel',
      'coaxial',
      'tiang',
      'pole',
      'ohm',
      'terminal petir',
      'earth tester',
      'gate valve dn 300',
      'gasket epdm 5mm'
    );
  }

  // Item Pekerjaan Sipil / Beton -> STRICTLY EXCLUDE electrical cables, mechanical valves
  if (/\b(?:beton|cor|pondasi|bekisting|plesteran|keramik)\b/i.test(combined)) {
    exclusions.push('kabel coaxial', 'tahanan ohm', 'earth tester', 'gate valve', 'flange pn16');
  }

  // Remove duplicates
  return Array.from(new Set(exclusions));
}

/**
 * Checks if a candidate sentence contains cross-domain boundary violations.
 */
export function hasBoundaryViolation(
  statement: string,
  exclusionKeywords: string[]
): boolean {
  if (!statement || exclusionKeywords.length === 0) return false;
  const lower = statement.toLowerCase();
  return exclusionKeywords.some((ex) => ex.length > 1 && lower.includes(ex.toLowerCase()));
}

/**
 * Cleans extracted BAPL substance of boundary violations and noisy preambles.
 */
export function sanitizeSubstanceByDomain(
  substance: string,
  domain: ProgramDomain
): string {
  if (!substance) return '';
  return substance
    .replace(/^\[.*?\]\s*/, '')
    .replace(/^(?:poin\s*[0-9]+|item\s*#?[0-9]+|[0-9]+[.)])[:\s]*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}
