/**
 * Multi-Document & Multi-Sheet Versioning and Recency Engine
 * 
 * Provides deterministic sorting, recency scoring, and superseding logic for:
 * 1. Multiple Excel sheets (e.g. JusFin, JusTek, RAB Revisi revisions)
 * 2. Multiple BAPL documents (chronological field survey reports, revision 1 vs revision 2)
 * 3. Cross-document change item overwriting (newest document takes precedence)
 */

export interface DocumentRecencyMeta {
  name: string;
  score: number;
  revision?: number;
  dateStr?: string;
  isExplicitFinal: boolean;
  sequenceNumber?: number;
  reason: string;
}

/**
 * Normalizes an item name to a canonical key for cross-document deduplication and matching
 */
export function normalizeItemKey(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Computes a deterministic recency score based on filename conventions, revision numbers,
 * dates, status tags, and file modification timestamps.
 */
export function calculateDocumentRecencyScore(fileName: string, lastModified?: number): DocumentRecencyMeta {
  const lower = fileName.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  let revision: number | undefined;
  let dateStr: string | undefined;
  let sequenceNumber: number | undefined;
  let isExplicitFinal = false;

  // 1. Explicit Final / Approved / Latest Keywords (+25,000 pts)
  if (/\b(final|terbaru|latest|approved|disetujui|fix|acc|signed|akhir|revisi akhir|clear|ok)\b/i.test(lower)) {
    score += 25000;
    isExplicitFinal = true;
    reasons.push('Status: Final/Terbaru/Approved (+25000)');
  }

  // 2. Explicit Revision Number (e.g. "Rev.02", "Rev 2", "Revisi 3", "v2", "R2")
  const revMatch = lower.match(/(?:rev|revisi|r|v)[\s._-]*([0-9]+(?:\.[0-9]+)?)/i);
  if (revMatch && revMatch[1]) {
    const revNum = parseFloat(revMatch[1]);
    if (!isNaN(revNum)) {
      revision = revNum;
      const pts = Math.round(revNum * 2500);
      score += pts;
      reasons.push(`Revisi: Rev.${revNum} (+${pts})`);
    }
  }

  // 3. Sequence / Part Number (e.g. "BAPL-02", "BAPL 2", "Part 2", "(2)")
  const seqMatch = lower.match(/(?:bapl|ba|doc|dokumen|part|tahap)[\s._-]*0*([0-9]+)/i);
  if (seqMatch && seqMatch[1]) {
    const sNum = parseInt(seqMatch[1], 10);
    if (!isNaN(sNum)) {
      sequenceNumber = sNum;
      const pts = sNum * 1200;
      score += pts;
      reasons.push(`Nomor Urut Dokumen: #${sNum} (+${pts})`);
    }
  } else {
    // Check trailing number in parentheses or suffix like "file (2).pdf" or "bapl_2.pdf"
    const trailingMatch = lower.match(/[\s_(-]([0-9]+)\)?\.[a-z0-9]+$/i);
    if (trailingMatch && trailingMatch[1]) {
      const tNum = parseInt(trailingMatch[1], 10);
      if (!isNaN(tNum) && tNum > 0 && tNum < 50) {
        sequenceNumber = tNum;
        const pts = tNum * 800;
        score += pts;
        reasons.push(`Suffix Index: #${tNum} (+${pts})`);
      }
    }
  }

  // 4. Date Detection
  // ISO: YYYY-MM-DD or YYYYMMDD
  const isoDateMatch = lower.match(/(20[2-3][0-9])[-_/.](0[1-9]|1[0-2])[-_/.](0[1-9]|[12][0-9]|3[01])/);
  const compactDateMatch = lower.match(/(20[2-3][0-9])(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/);
  // DD-MM-YYYY
  const dmyDateMatch = lower.match(/(0[1-9]|[12][0-9]|3[01])[-_/.](0[1-9]|1[0-2])[-_/.](20[2-3][0-9])/);

  if (isoDateMatch) {
    const y = parseInt(isoDateMatch[1], 10);
    const m = parseInt(isoDateMatch[2], 10);
    const d = parseInt(isoDateMatch[3], 10);
    dateStr = `${isoDateMatch[0]}`;
    const dateWeight = y * 1000 + m * 50 + d;
    score += dateWeight;
    reasons.push(`Tanggal Dokumen: ${dateStr} (+${dateWeight})`);
  } else if (compactDateMatch) {
    const y = parseInt(compactDateMatch[1], 10);
    const m = parseInt(compactDateMatch[2], 10);
    const d = parseInt(compactDateMatch[3], 10);
    dateStr = `${compactDateMatch[1]}-${compactDateMatch[2]}-${compactDateMatch[3]}`;
    const dateWeight = y * 1000 + m * 50 + d;
    score += dateWeight;
    reasons.push(`Tanggal Dokumen: ${dateStr} (+${dateWeight})`);
  } else if (dmyDateMatch) {
    const d = parseInt(dmyDateMatch[1], 10);
    const m = parseInt(dmyDateMatch[2], 10);
    const y = parseInt(dmyDateMatch[3], 10);
    dateStr = `${dmyDateMatch[0]}`;
    const dateWeight = y * 1000 + m * 50 + d;
    score += dateWeight;
    reasons.push(`Tanggal Dokumen: ${dateStr} (+${dateWeight})`);
  } else {
    // Indonesian / English month names
    const months = [
      { name: 'jan', val: 1 }, { name: 'feb', val: 2 }, { name: 'mar', val: 3 },
      { name: 'apr', val: 4 }, { name: 'mei', val: 5 }, { name: 'may', val: 5 },
      { name: 'jun', val: 6 }, { name: 'jul', val: 7 }, { name: 'agu', val: 8 }, { name: 'aug', val: 8 },
      { name: 'sep', val: 9 }, { name: 'okt', val: 10 }, { name: 'oct', val: 10 },
      { name: 'nov', val: 11 }, { name: 'des', val: 12 }, { name: 'dec', val: 12 }
    ];
    for (const m of months) {
      if (lower.includes(m.name)) {
        dateStr = `Bulan ${m.name}`;
        const weight = 2026 * 1000 + m.val * 50;
        score += weight;
        reasons.push(`Indikator Bulan: ${m.name} (+${weight})`);
        break;
      }
    }
  }

  // 5. File System Timestamp Tiebreaker (if available)
  if (lastModified && lastModified > 0) {
    // Normalize to days since Jan 2024
    const daysSince = Math.round((lastModified - 1704067200000) / (1000 * 60 * 60 * 24));
    if (daysSince > 0) {
      score += Math.min(daysSince, 500);
      reasons.push(`Timestamp Berkas (+${Math.min(daysSince, 500)})`);
    }
  }

  return {
    name: fileName,
    score,
    revision,
    dateStr,
    sequenceNumber,
    isExplicitFinal,
    reason: reasons.length > 0 ? reasons.join(', ') : 'Urutan berkas standar',
  };
}

/**
 * Sorts files in ASCENDING order (oldest first, newest last).
 * In sequential processing pipelines, processing in this order ensures that
 * data from newer files naturally and reliably overwrites data from older files.
 */
export function sortDocumentsAscending<T extends { name: string; lastModified?: number }>(files: T[]): T[] {
  if (!files || files.length <= 1) return files ? [...files] : [];
  return [...files].sort((a, b) => {
    const metaA = calculateDocumentRecencyScore(a.name, a.lastModified);
    const metaB = calculateDocumentRecencyScore(b.name, b.lastModified);
    return metaA.score - metaB.score;
  });
}

/**
 * Sorts files in DESCENDING order (newest / most authoritative first).
 */
export function sortDocumentsDescending<T extends { name: string; lastModified?: number }>(files: T[]): T[] {
  if (!files || files.length <= 1) return files ? [...files] : [];
  return [...files].sort((a, b) => {
    const metaA = calculateDocumentRecencyScore(a.name, a.lastModified);
    const metaB = calculateDocumentRecencyScore(b.name, b.lastModified);
    return metaB.score - metaA.score;
  });
}

/**
 * Merges a list of items across multiple chronological documents.
 * If a change point or item appears in both an earlier document and a newer document,
 * the newer document's version OVERWRITES the earlier one, and a record of the update is generated.
 */
export function mergeItemsWithPrecedence<T>(
  existingList: T[],
  newList: T[],
  getKey: (item: T) => string,
  onSupersede?: (older: T, newer: T, key: string) => void
): T[] {
  const map = new Map<string, T>();

  // Add earlier items first
  for (const item of existingList) {
    const key = getKey(item);
    if (key) {
      map.set(key, item);
    }
  }

  // Overwrite with newer items
  for (const item of newList) {
    const key = getKey(item);
    if (key) {
      if (map.has(key)) {
        const older = map.get(key)!;
        onSupersede?.(older, item, key);
      }
      map.set(key, item);
    } else {
      // If no valid key, append
      map.set(`idx_${map.size}`, item);
    }
  }

  return Array.from(map.values());
}
