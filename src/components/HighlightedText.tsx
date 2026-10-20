import React from 'react';

interface HighlightedTextProps {
  text?: string | null;
  matchTarget?: string | string[] | null;
  className?: string;
  isDarkTheme?: boolean;
}

/**
 * Common Indonesian & technical noise words that should NEVER be highlighted.
 */
const COMMON_STOP_WORDS = new Set([
  'yang', 'untuk', 'pada', 'dari', 'dengan', 'atau', 'dan', 'oleh', 'ini', 'itu', 'adalah',
  'sesuai', 'berdasarkan', 'telah', 'dilakukan', 'dalam', 'atas', 'karena', 'agar', 'bisa',
  'item', 'pekerjaan', 'kondisi', 'semula', 'menjadi', 'sebelum', 'sesudah', 'usulan',
  'tidak', 'hanya', 'antara', 'terdapat', 'sebesar', 'nilai', 'harga', 'total', 'biaya',
  'hasil', 'pemeriksaan', 'lapangan', 'proyek', 'kontrak', 'revisi', 'dokumen', 'catatan',
  'terpasang', 'jumlah', 'satuan', 'volume', 'spesifikasi', 'klausul', 'berita', 'acara',
  'peninjauan', 'pengadaan', 'pemasangan', 'pelaksanaan', 'administrasi', 'klarifikasi',
  'kebutuhan', 'penyesuaian', 'rekomendasi', 'kesimpulan', 'status', 'verifikasi', 'bukti',
  'koreksi', 'tambah', 'kurang', 'lingkup', 'perubahan', 'posisi', 'arah', 'lokasi', 'tempat',
  'serta', 'juga', 'maupun', 'secara', 'akan', 'yaitu', 'sebagai', 'maka', 'apabila', 'jika'
]);

/**
 * Extracts substantive technical keywords, specifications, ratings, dimensions,
 * and exact quantities/numbers for cross-document highlighting.
 * Ensures NO common words or generic letters ever get extracted.
 */
export function extractTechnicalTokens(target: string | string[] | undefined | null): string[] {
  if (!target) return [];

  const rawStrings = Array.isArray(target) ? target : [target];
  const combined = rawStrings.filter(Boolean).join(' ');
  if (!combined.trim()) return [];

  const tokens = new Set<string>();

  // 1. Technical dimensions, ratings, standards, codes (e.g. "PN16", "DN300", "M20x85", "SS304", "SS316", "DIN-F4", "EN-GJS-500-7")
  const specMatches = combined.match(
    /\b(?:pn\s*\d+|dn\s*\d+|m\s*\d+(?:\s*[xX*]\s*\d+)?|sch\s*\d+|class\s*\d+|din(?:-[a-z0-9]+|\s+[a-z0-9]+)?|astm\s*[a-z0-9]+|ss\s*304|ss\s*316|ggg\s*50|en-gjs-[a-z0-9-]+)\b/gi
  );
  if (specMatches) {
    specMatches.forEach((m) => {
      const clean = m.trim();
      if (clean.length >= 3) tokens.add(clean);
    });
  }

  // 2. Specific numbers with physical units (e.g. "270 mm", "5 mm", "8.5 bar", "220 Nm", "176,4 m", "15 m", "5 m", "2 inch", "4 inch")
  const numUnitMatches = combined.match(
    /\b\d+(?:[.,]\d+)?\s*(?:mm2|mm²|mm|cm|meter|m'|m|inch|"|”|pcs|unit|set|btg|kg|ton|%|bar|kpa|mpa|v|watt|kw|kva|nm)\b/gi
  );
  if (numUnitMatches) {
    numUnitMatches.forEach((m) => {
      const clean = m.trim();
      // Exclude simple "1" or "0" without unit
      if (clean.length >= 2 && !/^[0-9]$/.test(clean)) {
        tokens.add(clean);
      }
    });
  }

  // 3. Exact multi-word technical materials and equipment names
  const technicalPhrases = [
    'gate valve', 'check valve', 'butterfly valve', 'ball valve', 'globe valve',
    'spiral wound', 'ductile iron', 'stainless steel', 'carbon steel', 'cast iron',
    'full face', 'resilient seated', 'handwheel', 'double flange', 'all flange',
    'air terminal', 'down conductor', 'coaxial', 'lightning protection',
    'hydrostatic', 'hydrotest', 'torque wrench', 'cross-pattern', 'o-ring'
  ];

  const lowerCombined = combined.toLowerCase();
  for (const phrase of technicalPhrases) {
    if (lowerCombined.includes(phrase)) {
      tokens.add(phrase);
    }
  }

  // 4. Standalone specific technical words (minimum 4 characters, strictly non-stopwords)
  const technicalWords = [
    'epdm', 'gasket', 'flens', 'flange', 'baut', 'bolt', 'fastener', 'washer',
    'katup', 'valve', 'pipa', 'fitting', 'elbow', 'spool', 'nozzle', 'seal',
    'kabel', 'tiang', 'monopole', 'teleskopik', 'grounding', 'pembumian'
  ];

  for (const tw of technicalWords) {
    const wordRegex = new RegExp(`\\b${tw}\\b`, 'i');
    if (wordRegex.test(combined)) {
      tokens.add(tw);
    }
  }

  // Sort descending by length so longer phrases match first before substrings
  return Array.from(tokens).filter(Boolean).sort((a, b) => b.length - a.length);
}

/**
 * Highlights matching words, numbers, and technical terms inside text cleanly.
 * Strictly uses word boundaries so it NEVER shreds or splits regular words.
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  matchTarget,
  className = '',
  isDarkTheme = false,
}) => {
  if (!text) return null;
  if (!matchTarget) return <span className={className}>{text}</span>;

  const tokens = extractTechnicalTokens(matchTarget);
  if (tokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedTokens = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  // Ensure word boundaries around each token to NEVER split inside ordinary words
  const pattern = escapedTokens
    .map((t) => {
      // If token starts/ends with alphanumeric characters, wrap with \b
      const startB = /^[a-zA-Z0-9]/.test(t) ? '\\b' : '';
      const endB = /[a-zA-Z0-9]$/.test(t) ? '\\b' : '';
      return `${startB}${t}${endB}`;
    })
    .join('|');

  let regex: RegExp;
  try {
    regex = new RegExp(`(${pattern})`, 'gi');
  } catch (e) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(regex);
  if (parts.length <= 1) {
    return <span className={className}>{text}</span>;
  }

  const tokenLowerSet = new Set(tokens.map((t) => t.toLowerCase()));

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        const partLower = part.toLowerCase();

        // Exact match or matches one of the extracted substantive tokens
        const isMatch = tokenLowerSet.has(partLower) || tokens.some((t) => t.toLowerCase() === partLower);

        if (isMatch) {
          if (isDarkTheme) {
            return (
              <mark
                key={i}
                className="bg-amber-400/25 text-amber-200 font-bold px-1 py-0.5 rounded border border-amber-400/30"
                title="Sesuai & Cocok dengan Klausul Dokumen"
              >
                {part}
              </mark>
            );
          }
          return (
            <mark
              key={i}
              className="bg-amber-200/90 text-amber-950 font-bold px-1 py-0.2 rounded border border-amber-300"
              title="Sesuai & Cocok dengan Klausul Dokumen"
            >
              {part}
            </mark>
          );
        }

        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
};

export default HighlightedText;
