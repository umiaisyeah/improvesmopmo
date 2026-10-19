import { BOQItem, BeritaAcara, DiscrepancyReport } from '../types';

/**
 * Normalizes Indonesian technical construction and water utility terms
 */
export function normalizeTechnicalTerms(str: string): string {
  let cleaned = str.toLowerCase();

  // Normalize punctuation and symbols
  cleaned = cleaned.replace(/[øØ]/g, 'dia ');
  cleaned = cleaned.replace(/[×x]/g, 'x');
  cleaned = cleaned.replace(/["'”’]/g, ' inch ');
  cleaned = cleaned.replace(/[-_/\\]/g, ' ');

  // Replace common water treatment engineering abbreviations
  const dictionary: Record<string, string> = {
    'pengadaan dan pemasangan': 'pasang',
    'pengadaan & pemasangan': 'pasang',
    'supply and install': 'pasang',
    'pemasangan': 'pasang',
    'instalasi': 'pasang',
    'pengadaan': 'pasang',
    'diameter': 'dia',
    'dia.': 'dia',
    'dn': 'dia',
    'od': 'dia',
    'meter lari': 'm',
    'meter': 'm',
    'm1': 'm',
    'm\'': 'm',
    'buah': 'unit',
    'bh': 'unit',
    'ttk': 'titik',
    'centrifugal': 'sentrifugal',
    'submersible': 'celup',
    'gate valve': 'gv',
    'butterfly valve': 'bfv',
    'check valve': 'cv',
    'pn-10': 'pn10',
    'pn 10': 'pn10',
    'pn-16': 'pn16',
    'pn 16': 'pn16',
    'sdr-17': 'sdr17',
    'sdr 17': 'sdr17',
    'sdr-11': 'sdr11',
    'sdr 11': 'sdr11',
  };

  for (const [key, val] of Object.entries(dictionary)) {
    cleaned = cleaned.replace(new RegExp(`\\b${key}\\b`, 'gi'), val);
  }

  // Remove multiple consecutive spaces
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Calculates Token Jaccard Similarity between two technical strings
 */
export function calculateTokenSimilarity(s1: string, s2: string): number {
  const norm1 = normalizeTechnicalTerms(s1);
  const norm2 = normalizeTechnicalTerms(s2);

  const tokens1 = new Set(norm1.split(' ').filter(t => t.length > 1));
  const tokens2 = new Set(norm2.split(' ').filter(t => t.length > 1));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
}

/**
 * Standard Levenshtein distance
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Combined hybrid matching score (0% to 100%)
 */
export function computeMatchScore(nameJustek: string, nameBA: string): number {
  const normJustek = normalizeTechnicalTerms(nameJustek);
  const normBA = normalizeTechnicalTerms(nameBA);

  if (normJustek === normBA) return 100;

  const jaccard = calculateTokenSimilarity(nameJustek, nameBA);
  
  const maxLen = Math.max(normJustek.length, normBA.length);
  const levDist = levenshteinDistance(normJustek, normBA);
  const levSimilarity = Math.max(0, 1 - levDist / maxLen);

  // Bonus if numbers match (e.g. 400, 16, 250)
  const nums1 = (nameJustek.match(/\d+(\.\d+)?/g) || []).sort();
  const nums2 = (nameBA.match(/\d+(\.\d+)?/g) || []).sort();
  const numsMatch = nums1.length > 0 && nums1.join(',') === nums2.join(',');
  const numberBonus = numsMatch ? 0.15 : 0;

  const combined = (jaccard * 0.6) + (levSimilarity * 0.4) + numberBonus;
  return Math.min(100, Math.round(combined * 100));
}

/**
 * Cross-verification auditor between Justifikasi BOQ Items and Berita Acara records
 */
export function auditJustifikasiEvidence(
  projectId: string,
  projectName: string,
  items: BOQItem[],
  beritaAcaraList: BeritaAcara[]
): {
  auditedItems: BOQItem[];
  issues: DiscrepancyReport[];
} {
  const issues: DiscrepancyReport[] = [];
  const allBaItems = beritaAcaraList.flatMap(ba => 
    ba.items.map(item => ({
      ...item,
      baId: ba.id,
      baNumber: ba.baNumber,
      baType: ba.baType,
      hasAttachments: ba.attachments.length > 0,
      photoCount: ba.attachments.filter(a => a.type === 'FOTO_LAPANGAN').length
    }))
  );

  const auditedItems = items.map(item => {
    // If volume did not change from DED baseline, no concrete BA verification needed
    const volumeChanged = Math.abs(item.fieldVolume - item.dedVolume) > 0.001;

    // Search best candidate in all BA items
    let bestMatch: typeof allBaItems[0] | null = null;
    let highestScore = 0;

    for (const baItem of allBaItems) {
      // Check code match first
      if (item.wbsCode && baItem.canonicalWbsCode && item.wbsCode === baItem.canonicalWbsCode) {
        bestMatch = baItem;
        highestScore = 98;
        break;
      }

      const score = computeMatchScore(item.itemName, baItem.rawNameInBA);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = baItem;
      }
    }

    const updated = { ...item };

    if (!volumeChanged) {
      updated.evidenceStatus = 'VERIFIED';
      updated.similarityScore = 100;
      return updated;
    }

    if (!bestMatch || highestScore < 60) {
      updated.evidenceStatus = 'MISSING_BA';
      updated.similarityScore = highestScore;
      issues.push({
        id: `ISSUE-${item.id}-NOBA`,
        projectId,
        projectName,
        ipa: (beritaAcaraList[0]?.ipa) || 'IPA Buaran 1',
        type: 'UNSUBSTANTIATED_JUSTEK',
        severity: 'HIGH',
        justekItemName: item.itemName,
        confidenceMatch: highestScore,
        suggestedAction: `Item Justifikasi '${item.itemName}' mengalami perubahan volume (+${(item.fieldVolume - item.dedVolume).toFixed(1)} ${item.unit}) tetapi tidak ditemukan bukti Berita Acara pendukung (MC-0 atau Peninjauan Lapangan). Terbitkan BA Peninjauan Lapangan segera.`,
        resolved: false
      });
      return updated;
    }

    updated.linkedBaId = bestMatch.baId;
    updated.linkedBaItemName = bestMatch.rawNameInBA;
    updated.similarityScore = highestScore;

    // Check volume claim vs measured volume in BA
    if (item.fieldVolume > bestMatch.measuredVolume * 1.05) {
      updated.evidenceStatus = 'VOLUME_OVER_CLAIM';
      issues.push({
        id: `ISSUE-${item.id}-VOLOVER`,
        projectId,
        projectName,
        ipa: (beritaAcaraList[0]?.ipa) || 'IPA Buaran 1',
        type: 'VOLUME_MISMATCH',
        severity: 'HIGH',
        justekItemName: item.itemName,
        baItemName: bestMatch.rawNameInBA,
        confidenceMatch: highestScore,
        suggestedAction: `Volume yang diklaim pada Justifikasi (${item.fieldVolume} ${item.unit}) melebihi volume riil yang diverifikasi di ${bestMatch.baType} (${bestMatch.measuredVolume} ${bestMatch.unit}). Sesuaikan volume Justifikasi agar tidak ditolak auditor.`,
        resolved: false
      });
      return updated;
    }

    // Check naming disparity (problem 2)
    if (highestScore < 95 && highestScore >= 60) {
      updated.evidenceStatus = 'NAME_MISMATCH';
      issues.push({
        id: `ISSUE-${item.id}-NAMEMIS`,
        projectId,
        projectName,
        ipa: (beritaAcaraList[0]?.ipa) || 'IPA Buaran 1',
        type: 'NAMING_VARIATION',
        severity: 'MEDIUM',
        justekItemName: item.itemName,
        baItemName: bestMatch.rawNameInBA,
        confidenceMatch: highestScore,
        suggestedAction: `Nama item pada Justifikasi '${item.itemName}' berbeda penulisan dengan di BA '${bestMatch.rawNameInBA}' (Tingkat Kemiripan ${highestScore}%). Klik tombol Sinkronkan Nama untuk standardisasi ke WBS resmi.`,
        resolved: false
      });
      return updated;
    }

    updated.evidenceStatus = 'VERIFIED';
    return updated;
  });

  return { auditedItems, issues };
}
