import * as XLSX from 'xlsx';
import { normalizeNumber, isCategoryHeaderOrNonItem } from './normalizer';

export interface ParsedExcelData {
  projectInfo: Partial<{
    projectName: string;
    projectCode: string;
    subproject: string;
    location: string;
    contractor: string;
    poNumber: string;
    baplNumber: string;
    date: string;
    revision: string;
  }>;
  rabInitial: Array<{
    itemNo?: string;
    item: string;
    unit: string;
    qty: number;
    unitPrice: number;
    total: number;
    subSpecs?: string[];
  }>;
  rabRevised: Array<{
    itemNo?: string;
    item: string;
    unit: string;
    qty: number;
    unitPrice: number;
    total: number;
    subSpecs?: string[];
  }>;
  jusTek: Array<{
    changeId: string;
    item: string;
    baseline: string;
    proposed: string;
    cause: string;
    risk: string;
    benefit: string;
  }>;
  jusFin: Array<{
    changeId: string;
    item: string;
    totalInitial: number;
    totalRevised: number;
    statedDelta: number;
    justification: string;
  }>;
  statedTotalInitial?: number;
  statedTotalRevised?: number;
  statedTotalJusFinDelta?: number;
  selectedSheets?: Record<string, { sheetName: string; allCandidates: string[]; reason: string }>;
  auditNotes?: string[];
  warnings: string[];
}

function isValidSideAndType(
  keyName: string,
  side?: 'initial' | 'revised' | 'delta',
  typeGuard?: 'unitPrice' | 'total' | 'qty' | 'unit' | 'item'
): boolean {
  const lowerK = keyName.toLowerCase();
  if (side === 'initial') {
    if (lowerK.includes('sebelum')) {
      // "sebelum revisi" / "sebelum perubahan" -> explicitly initial
    } else if (
      lowerK.includes('revisi') ||
      lowerK.includes('revised') ||
      lowerK.includes('menjadi') ||
      lowerK.includes('usulan') ||
      lowerK.includes('proposed') ||
      lowerK.includes('akhir') ||
      lowerK.includes('_1') ||
      lowerK.includes('delta') ||
      lowerK.includes('selisih') ||
      lowerK.includes('deviasi') ||
      lowerK.includes('setelah') ||
      lowerK.includes('sesudah')
    ) {
      return false;
    }
  } else if (side === 'revised') {
    if (
      lowerK.includes('setelah') ||
      lowerK.includes('sesudah') ||
      lowerK.includes('kontrak baru') ||
      lowerK.includes('kontrak revisi') ||
      lowerK.includes('kontrak usulan') ||
      lowerK.includes('revisi') ||
      lowerK.includes('revised') ||
      lowerK.includes('menjadi') ||
      lowerK.includes('usulan') ||
      lowerK.includes('proposed')
    ) {
      // Explicitly revised/proposed
      if (
        lowerK.includes('delta') ||
        lowerK.includes('selisih') ||
        lowerK.includes('deviasi') ||
        lowerK.includes('kurang') ||
        lowerK.includes('tambah') ||
        lowerK.includes('+/-')
      ) {
        return false;
      }
    } else {
      if (
        lowerK.includes('awal') ||
        lowerK.includes('semula') ||
        lowerK.includes('baseline') ||
        lowerK.includes('sebelum') ||
        lowerK.includes('_0') ||
        lowerK.includes('delta') ||
        lowerK.includes('selisih') ||
        lowerK.includes('deviasi') ||
        lowerK.includes('kurang') ||
        lowerK.includes('tambah') ||
        lowerK.includes('+/-')
      ) {
        return false;
      }
      if (
        lowerK.includes('kontrak') &&
        !lowerK.includes('revisi') &&
        !lowerK.includes('baru') &&
        !lowerK.includes('usulan') &&
        !lowerK.includes('menjadi') &&
        !lowerK.includes('amandemen') &&
        !lowerK.includes('addendum')
      ) {
        return false;
      }
    }
  } else if (side === 'delta') {
    if (
      !lowerK.includes('delta') &&
      !lowerK.includes('selisih') &&
      !lowerK.includes('deviasi') &&
      !lowerK.includes('varian') &&
      !lowerK.includes('+/-') &&
      !lowerK.includes('+ / -') &&
      !lowerK.includes('tambah') &&
      !lowerK.includes('kurang') &&
      !lowerK.includes('perubahan') &&
      !lowerK.includes('kompensasi')
    ) {
      return false;
    }
  }

  if (typeGuard === 'unitPrice') {
    if (
      lowerK.includes('total') ||
      lowerK.includes('subtotal') ||
      lowerK.includes('jumlah harga') ||
      lowerK.includes('total harga') ||
      lowerK.includes('biaya total') ||
      lowerK.includes('nilai total') ||
      (lowerK.includes('jumlah') && !lowerK.includes('satuan'))
    ) {
      return false;
    }
  } else if (typeGuard === 'total') {
    if (
      (lowerK.includes('satuan') || lowerK.includes('unit price') || lowerK.includes('/unit') || lowerK.includes('per unit')) &&
      !lowerK.includes('total') &&
      !lowerK.includes('jumlah') &&
      !lowerK.includes('nilai')
    ) {
      return false;
    }
  } else if (typeGuard === 'qty') {
    if (
      lowerK.includes('harga') ||
      lowerK.includes('price') ||
      lowerK.includes('tarif') ||
      lowerK.includes('total') ||
      lowerK.includes('subtotal') ||
      lowerK.includes('biaya') ||
      lowerK.includes('nilai') ||
      (lowerK.includes('rp') && !lowerK.includes('qty'))
    ) {
      return false;
    }
  } else if (typeGuard === 'unit') {
    if (
      lowerK.includes('price') ||
      lowerK.includes('harga') ||
      lowerK.includes('total') ||
      lowerK.includes('jumlah') ||
      lowerK.includes('biaya') ||
      lowerK.includes('nilai')
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Robust cell getter matching keys with normalization (stripping spaces, symbols, lowercase)
 * and strict side separation (initial vs revised vs delta) and type guarding.
 */
export function getCol(
  row: any,
  keys: string[],
  side?: 'initial' | 'revised' | 'delta',
  typeGuard?: 'unitPrice' | 'total' | 'qty' | 'unit' | 'item'
): any {
  if (!row) return undefined;

  // 1. Direct exact match with side & type guard validation
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      if (isValidSideAndType(key, side, typeGuard)) {
        if (typeGuard === 'unit') {
          const s = String(row[key]).trim();
          if (/^-?\d+([.,]\d+)?$/.test(s)) continue; // ignore pure numbers for units
        }
        return row[key];
      }
    }
  }

  // 2. Normalized match with strict side constraints & type protection
  const cleanKeys = Object.keys(row);
  for (const k of cleanKeys) {
    const val = row[k];
    if (val === undefined || val === null || String(val).trim() === '') continue;

    if (!isValidSideAndType(k, side, typeGuard)) {
      continue;
    }

    if (typeGuard === 'unit') {
      const s = String(val).trim();
      if (/^-?\d+([.,]\d+)?$/.test(s)) continue; // ignore pure numbers for units
    }

    const lowerK = k.toLowerCase();
    const normalizedK = lowerK.replace(/[\s_\-():/.,[\]]/g, '');

    for (const target of keys) {
      const normalizedTarget = target.toLowerCase().replace(/[\s_\-():/.,[\]]/g, '');
      // Strict matching: exact normalized match OR target is a clear substring of k
      if (normalizedK === normalizedTarget) {
        return val;
      }
      if (normalizedTarget.length >= 3 && normalizedK.includes(normalizedTarget)) {
        return val;
      }
      if (normalizedK.length >= 4 && normalizedTarget.includes(normalizedK)) {
        if (
          normalizedK === 'harga' ||
          normalizedK === 'total' ||
          normalizedK === 'jumlah' ||
          normalizedK === 'nilai' ||
          normalizedK === 'biaya' ||
          normalizedK === 'qty'
        ) {
          continue;
        }
        return val;
      }
    }
  }
  return undefined;
}

/**
 * Verifies that two item names belong to compatible work categories.
 * For example, "Pengadaan Gate Valve" MUST NEVER match "Jasa Pembongkaran Gate Valve"
 * or "Tes Fungsi Gate Valve". However, specification/dimension changes of the SAME item family
 * (e.g., Bolt M24 vs Bolt M20, Pipe 4" vs Pipe 6", Cable 35mm2 vs Cable 50mm2, Gate Valve SS vs Gate Valve DI)
 * ARE compatible and should be paired as Material/Dimension Changes.
 */
/**
 * Computes substantive similarity between two engineering/RAB item names.
 * Filters out generic noise words ("pekerjaan", "pengadaan", "pemasangan", "item", "dan", "di", "ke", "untuk").
 * Returns a score between 0.0 and 1.0.
 */
export function computeItemSimilarity(nameA?: string, nameB?: string): number {
  if (!nameA || !nameB) return 0;
  const a = nameA.toLowerCase().trim();
  const b = nameB.toLowerCase().trim();
  if (a === b) return 1.0;

  const noise = new Set([
    'pekerjaan', 'pengadaan', 'pemasangan', 'pemasangan/pengadaan', 'instalasi', 'jasa',
    'item', 'no', 'nomor', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan',
    'type', 'tipe', 'unit', 'buah', 'titik', 'lokasi', 'revisi', 'awal', 'kontrak', 'kegiatan'
  ]);

  const cleanTokensA = a.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !noise.has(w));
  const cleanTokensB = b.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !noise.has(w));

  if (cleanTokensA.length === 0 || cleanTokensB.length === 0) {
    return 0;
  }

  const setB = new Set(cleanTokensB);
  const common = cleanTokensA.filter((w) => setB.has(w));
  const union = new Set([...cleanTokensA, ...cleanTokensB]);

  const jaccard = common.length / union.size;

  // Bonus if entire core substring is contained
  const coreA = cleanTokensA.join(' ');
  const coreB = cleanTokensB.join(' ');
  if (coreA.includes(coreB) || coreB.includes(coreA)) {
    return Math.max(jaccard, 0.75);
  }

  return jaccard;
}

/**
 * Verifies that two item names belong to compatible work categories.
 * For example, "Pengadaan Gate Valve" MUST NEVER match "Jasa Pembongkaran Gate Valve"
 * or "Tes Fungsi Gate Valve". Moreover, completely different work domains
 * (Tanah/Galian vs Pipa vs Tiang vs Lining/Cat vs Kabel) will NEVER match.
 */
export function isNameCompatible(nameA?: string, nameB?: string): boolean {
  if (!nameA || !nameB) return false;
  const a = nameA.toLowerCase().trim();
  const b = nameB.toLowerCase().trim();
  if (a === b) return true;

  // 1. Clashing semantic category: JASA / PEMASANGAN / PEMBONGKARAN vs SUPPLY MATERIAL
  const isJasaA = a.includes('jasa') || a.includes('service') || a.includes('bongkar') || a.includes('pasang') || a.includes('instalasi') || a.includes('pemasangan') || a.includes('pembongkaran');
  const isJasaB = b.includes('jasa') || b.includes('service') || b.includes('bongkar') || b.includes('pasang') || b.includes('instalasi') || b.includes('pemasangan') || b.includes('pembongkaran');
  if (isJasaA !== isJasaB) return false;

  // 2. Clashing semantic category: TESTING / COMMISSIONING / PENGUJIAN vs SUPPLY/JASA
  const isTesA = a.includes('tes') || a.includes('test') || a.includes('commissioning') || a.includes('pengujian') || a.includes('komisioning') || a.includes('hydrotest') || a.includes('fat') || a.includes('sat');
  const isTesB = b.includes('tes') || b.includes('test') || b.includes('commissioning') || b.includes('pengujian') || b.includes('komisioning') || b.includes('hydrotest') || b.includes('fat') || b.includes('sat');
  if (isTesA !== isTesB) return false;

  // 3. Clashing engineering domains:
  // TANAH / CIVIL vs PIPA vs KABEL vs TIANG vs VALVE vs CAT/LINING
  const isTanahA = a.includes('tanah') || a.includes('galian') || a.includes('urugan') || a.includes('pondasi') || a.includes('beton') || a.includes('pasir') || a.includes('clearing');
  const isTanahB = b.includes('tanah') || b.includes('galian') || b.includes('urugan') || b.includes('pondasi') || b.includes('beton') || b.includes('pasir') || b.includes('clearing');
  if (!isJasaA && (isTanahA !== isTanahB) && (isTanahA || isTanahB)) return false;

  const isLiningA = a.includes('lining') || a.includes('tangki') || a.includes('coating') || a.includes('cat') || a.includes('painting') || a.includes('epoxy') || a.includes('blasting');
  const isLiningB = b.includes('lining') || b.includes('tangki') || b.includes('coating') || b.includes('cat') || b.includes('painting') || b.includes('epoxy') || b.includes('blasting');
  if (!isJasaA && (isLiningA !== isLiningB) && (isLiningA || isLiningB)) return false;

  const isPipaA = a.includes('pipa') || a.includes('pipe') || a.includes('hdpe') || a.includes('pvc') || a.includes('fitting') || a.includes('flange') || a.includes('elbow') || a.includes('tee');
  const isPipaB = b.includes('pipa') || b.includes('pipe') || b.includes('hdpe') || b.includes('pvc') || b.includes('fitting') || b.includes('flange') || b.includes('elbow') || b.includes('tee');
  if (!isJasaA && (isPipaA !== isPipaB) && (isPipaA || isPipaB)) return false;

  const isBautA = a.includes('baut') || a.includes('bolt') || a.includes('fastener') || a.includes('mur');
  const isBautB = b.includes('baut') || b.includes('bolt') || b.includes('fastener') || b.includes('mur');
  if (isBautA !== isBautB) return false;

  const isGasketA = a.includes('gasket') || a.includes('paking') || a.includes('packing');
  const isGasketB = b.includes('gasket') || b.includes('paking') || b.includes('packing');
  if (isGasketA !== isGasketB) return false;

  const isValveA = a.includes('valve') || a.includes('katup') || a.includes('kran');
  const isValveB = b.includes('valve') || b.includes('katup') || b.includes('kran');
  if (!isJasaA && !isTesA && (isValveA !== isValveB)) return false;

  const isKabelA = a.includes('kabel') || a.includes('cable') || a.includes('conductor') || a.includes('grounding') || a.includes('pentanahan');
  const isKabelB = b.includes('kabel') || b.includes('cable') || b.includes('conductor') || b.includes('grounding') || b.includes('pentanahan');
  if (!isJasaA && (isKabelA !== isKabelB)) return false;

  const isTiangA = a.includes('tiang') || a.includes('pole') || a.includes('tower');
  const isTiangB = b.includes('tiang') || b.includes('pole') || b.includes('tower');
  if (!isJasaA && (isTiangA !== isTiangB)) return false;

  // Substantive similarity requirement
  const similarity = computeItemSimilarity(a, b);
  return similarity >= 0.40;
}

/**
 * Robust matching between Revised and Initial items.
 * Prioritizes exact name matching, then normalized string matching, then index alignment,
 * and only uses item numbers when names are semantically compatible.
 */
export function matchRabItem<T extends { item?: string; itemNo?: string }>(
  rev: { item?: string; itemNo?: string },
  initialList: T[],
  indexInList?: number
): T | undefined {
  if (!rev || !initialList || initialList.length === 0) return undefined;

  const cleanRev = (rev.item || '').trim().toLowerCase();
  const normalizedRev = cleanRev.replace(/[^a-z0-9]/g, '');

  // 1. Exact item name match (case-insensitive & trimmed)
  const exactMatch = initialList.find(
    (it) => it.item && it.item.trim().toLowerCase() === cleanRev
  );
  if (exactMatch) return exactMatch;

  // 2. Normalized alphanumeric match
  if (normalizedRev.length >= 3) {
    const normMatch = initialList.find((it) => {
      if (!it.item) return false;
      const n = it.item.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return n === normalizedRev;
    });
    if (normMatch) return normMatch;
  }

  // 3. Same position index match IF both items are compatible
  if (indexInList !== undefined && indexInList >= 0 && indexInList < initialList.length) {
    const candidateAtIdx = initialList[indexInList];
    if (candidateAtIdx && candidateAtIdx.item && isNameCompatible(candidateAtIdx.item, rev.item)) {
      const cName = candidateAtIdx.item.trim().toLowerCase();
      if (cName === cleanRev || (candidateAtIdx.itemNo && rev.itemNo && candidateAtIdx.itemNo === rev.itemNo)) {
        return candidateAtIdx;
      }
    }
  }

  // 4. Match by itemNo ONLY IF item names are compatible (never match Section I No. 1 to Section IV No. 1!)
  if (rev.itemNo && rev.itemNo !== '-' && rev.itemNo !== '') {
    const noMatches = initialList.filter((it) => it.itemNo === rev.itemNo);
    for (const m of noMatches) {
      if (m.item && isNameCompatible(m.item, rev.item)) {
        return m;
      }
    }
  }

  // 5. Fuzzy token overlap match with semantic compatibility check
  const revWords = cleanRev.split(/\s+/).filter((w) => w.length > 2);
  if (revWords.length > 0) {
    let bestScore = 0;
    let bestMatch: T | undefined = undefined;
    for (const it of initialList) {
      if (!it.item || !isNameCompatible(it.item, rev.item)) continue;
      const itWords = it.item.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const overlap = revWords.filter((w) => itWords.includes(w)).length;
      const score = overlap / Math.max(revWords.length, itWords.length);
      if (score >= 0.6 && score > bestScore) {
        bestScore = score;
        bestMatch = it;
      }
    }
    if (bestMatch) return bestMatch;
  }

  // 6. Direct index fallback if index is valid and name is compatible
  if (indexInList !== undefined && indexInList >= 0 && indexInList < initialList.length) {
    const candidate = initialList[indexInList];
    if (candidate && candidate.item && isNameCompatible(candidate.item, rev.item)) {
      return candidate;
    }
  }

  return undefined;
}

/**
 * Intelligent Table Parser: Automatically detects the header row even if there are
 * logos, titles, blank rows, merged multi-level headers, or unlabelled columns.
 */
function smartParseTable(sheet: XLSX.WorkSheet | undefined): any[] {
  if (!sheet) return [];

  // Convert to 2D array without assumptions
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
  if (!rows || rows.length === 0) return [];

  const headerKeywords = [
    'item', 'pekerjaan', 'uraian', 'deskripsi', 'barang', 'rincian', 'nama', 'scope', 'komponen',
    'qty', 'volume', 'satuan', 'unit', 'harga', 'price', 'rate', 'tarif', 'total', 'jumlah', 'biaya', 'nilai',
    'baseline', 'proposed', 'usulan', 'alasan', 'cause', 'risiko', 'risk', 'manfaat', 'benefit',
    'awal', 'revisi', 'selisih', 'delta', 'justifikasi', 'keterangan', 'id', 'no', 'nomor', 'change', 'ref', 'kompensasi'
  ];

  let bestHeaderRowIdx = -1;
  let maxKeywordScore = 0;

  // Search up to the first 60 rows for the table header (supports long title blocks and metadata headers)
  const scanLimit = Math.min(rows.length, 60);
  for (let r = 0; r < scanLimit; r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;

    let score = 0;
    for (const cell of row) {
      if (typeof cell === 'string' || typeof cell === 'number') {
        const str = String(cell).toLowerCase().replace(/[\s_\-()]/g, '');
        if (headerKeywords.some((kw) => str.includes(kw))) {
          score++;
        }
      }
    }

    if (score > maxKeywordScore) {
      maxKeywordScore = score;
      bestHeaderRowIdx = r;
    }
  }

  // If a solid header row was found (>= 2 matching keywords)
  if (bestHeaderRowIdx >= 0 && maxKeywordScore >= 2) {
    const rawHeaders1 = rows[bestHeaderRowIdx] || [];
    const rawHeaders2 = rows[bestHeaderRowIdx + 1] || [];

    // Check if the next row is a sub-header (e.g. "Baseline | Revisi" on row 1, "Qty | Harga | Total" on row 2)
    let isMultiLevelHeader = false;
    if (bestHeaderRowIdx + 1 < rows.length && Array.isArray(rawHeaders2)) {
      let subScore = 0;
      for (const cell of rawHeaders2) {
        if (typeof cell === 'string' || typeof cell === 'number') {
          const str = String(cell).toLowerCase().replace(/[\s_\-()]/g, '');
          if (['qty', 'volume', 'harga', 'price', 'total', 'jumlah', 'satuan', 'unit', 'rp', 'nilai'].some((kw) => str.includes(kw))) {
            subScore++;
          }
        }
      }
      if (subScore >= 2) {
        isMultiLevelHeader = true;
      }
    }

    const rawHeaders: string[] = [];
    let lastTopHeader = '';
    const colCount = Math.max(rawHeaders1.length, isMultiLevelHeader ? rawHeaders2.length : 0);

    for (let c = 0; c < colCount; c++) {
      const top = String(rawHeaders1[c] || '').trim();
      if (top.length > 0 && !top.startsWith('__')) {
        lastTopHeader = top;
      }

      let headerName = '';
      if (isMultiLevelHeader) {
        const sub = String(rawHeaders2[c] || '').trim();
        if (sub.length > 0) {
          if (top.length > 0 && top.toLowerCase() !== sub.toLowerCase()) {
            headerName = `${top} ${sub}`;
          } else if (lastTopHeader && lastTopHeader.toLowerCase() !== sub.toLowerCase()) {
            headerName = `${lastTopHeader} ${sub}`;
          } else {
            headerName = sub;
          }
        } else if (top.length > 0) {
          headerName = top;
        } else if (lastTopHeader.length > 0) {
          headerName = lastTopHeader;
        } else {
          headerName = `__COL_${c}`;
        }
      } else {
        headerName = top.length > 0 ? top : `__COL_${c}`;
      }
      rawHeaders.push(headerName);
    }

    // Count occurrences of each base header name to handle duplicates
    const headerFrequency: Record<string, number> = {};
    for (const h of rawHeaders) {
      if (h && !h.startsWith('__')) {
        const norm = h.toLowerCase().trim();
        headerFrequency[norm] = (headerFrequency[norm] || 0) + 1;
      }
    }

    const seenHeaderCounts: Record<string, number> = {};
    const headers: string[] = [];

    for (let c = 0; c < colCount; c++) {
      const headerName = rawHeaders[c];
      if (!headerName || headerName.startsWith('__')) {
        headers.push(`__COL_${c}`);
        continue;
      }

      const lower = headerName.toLowerCase();
      const norm = lower.trim();
      const currentCount = seenHeaderCounts[norm] || 0;
      seenHeaderCounts[norm] = currentCount + 1;

      // Check if headerName ALREADY contains an explicit side or delta indicator
      const hasInitialWord =
        lower.includes('awal') ||
        lower.includes('semula') ||
        lower.includes('baseline') ||
        lower.includes('kontrak awal') ||
        lower.includes('sebelum') ||
        lower.includes('initial');
      const hasRevisedWord =
        lower.includes('revisi') ||
        lower.includes('revised') ||
        lower.includes('menjadi') ||
        lower.includes('usulan') ||
        lower.includes('proposed') ||
        lower.includes('akhir') ||
        lower.includes('sesudah') ||
        lower.includes('kontrak baru') ||
        lower.includes('kontrak revisi') ||
        lower.includes('amandemen') ||
        lower.includes('addendum');
      const hasDeltaWord =
        lower.includes('delta') ||
        lower.includes('selisih') ||
        lower.includes('deviasi') ||
        lower.includes('varian') ||
        lower.includes('kurang') ||
        lower.includes('tambah') ||
        lower.includes('+/-') ||
        lower.includes('+ / -');

      const isNeutralRepeated = headerFrequency[norm] >= 2 && !hasInitialWord && !hasRevisedWord && !hasDeltaWord;

      if (isNeutralRepeated) {
        if (currentCount === 0) {
          headers.push(`${headerName} Awal`);
        } else if (currentCount === 1) {
          headers.push(`${headerName} Revisi`);
        } else if (currentCount === 2) {
          headers.push(`${headerName} Selisih`);
        } else {
          headers.push(`${headerName}_${currentCount}`);
        }
      } else if (currentCount > 0) {
        headers.push(`${headerName}_${currentCount}`);
      } else {
        headers.push(headerName);
      }
    }

    const startDataRow = isMultiLevelHeader ? bestHeaderRowIdx + 2 : bestHeaderRowIdx + 1;
    const parsedObjects: any[] = [];

    for (let r = startDataRow; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.every((c) => c === undefined || c === null || String(c).trim() === '')) {
        continue;
      }

      const obj: any = {};
      let validCellCount = 0;
      for (let c = 0; c < headers.length; c++) {
        const val = row[c];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          validCellCount++;
          obj[headers[c]] = val;
        }
        // Also save positional indices for fallback
        obj[`__COL_${c}`] = val;
      }
      if (validCellCount > 0) {
        parsedObjects.push(obj);
      }
    }
    return parsedObjects;
  }

  // Fallback to standard sheet_to_json
  return XLSX.utils.sheet_to_json(sheet);
}

export function parseProjectExcel(fileData: ArrayBuffer): ParsedExcelData {
  const wb = XLSX.read(fileData, { type: 'array' });
  const warnings: string[] = [];
  const auditNotes: string[] = [];
  const selectedSheets: Record<string, { sheetName: string; allCandidates: string[]; reason: string }> = {};

  const result: ParsedExcelData = {
    projectInfo: {},
    rabInitial: [],
    rabRevised: [],
    jusTek: [],
    jusFin: [],
    selectedSheets,
    auditNotes,
    warnings,
  };

  const sheetNames = wb.SheetNames;

  /**
   * Intelligent Multi-Sheet Selector:
   * When an Excel file has multiple sheets for a category (e.g. JusFin, RAB Revisi, JusTek),
   * detects all candidate sheets and sorts them by recency/authority using:
   * 1. Status Keywords: "final", "terbaru", "approved", "disetujui", "fix", "acc", "signed", "latest", "revisi akhir"
   * 2. Revision Numbers: "Rev 3" > "Rev 2" > "Rev 1" > "Rev 0", "v2", "R3"
   * 3. Embedded Dates: e.g. "2026-09-20", "20-09-2026", "20 September 2026"
   * 4. Suffix Numbers: "JusFin (2)", "JusFin_3"
   * 5. Position in Workbook: later sheet index conventionally represents newer revisions
   * 6. Content Check: ensures the selected sheet contains valid data rows (not just blank headers)
   */
  const findLatestSheet = (
    keywords: string[],
    categoryLabel = 'Sheet'
  ): { sheetName: string | undefined; candidates: string[]; reason: string } => {
    const candidates: { name: string; score: number; details: string; index: number }[] = [];

    for (let i = 0; i < sheetNames.length; i++) {
      const name = sheetNames[i];
      const normalizedName = name.toLowerCase().replace(/[\s_\-():/.,[\]]/g, '');
      const isMatch = keywords.some((kw) => normalizedName.includes(kw.toLowerCase().replace(/[\s_\-():/.,[\]]/g, '')));
      if (!isMatch) continue;

      const lower = name.toLowerCase();
      let score = 0;
      const detailParts: string[] = [];

      // Check data rows count and content density
      const sheet = wb.Sheets[name];
      const rows = sheet ? XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false }) : [];
      if (rows.length < 2) {
        // Empty or header-only sheet - heavily penalize
        score -= 50000;
        detailParts.push('Kosong/Data Minim (<2 baris)');
      } else {
        // Content density check: count rows with actual text and numbers
        let contentRows = 0;
        for (const r of rows) {
          if (Array.isArray(r) && r.some((c) => c !== undefined && c !== null && String(c).trim() !== '')) {
            contentRows++;
          }
        }
        score += Math.min(contentRows * 10, 1000);
      }

      // 1. Keyword Penalty for Draft / Old / Backup / Deprecated sheets
      if (/\b(draft|lama|old|backup|bck|copy|ignore|temp|batal|cancel|superseded|arsip|archive|sebelum)\b/i.test(lower)) {
        score -= 40000;
        detailParts.push('Status: Draft/Lama/Backup (-40000)');
      }

      // 2. Keyword bonus for Final / Approved / Latest / Addendum
      if (/\b(final|terbaru|latest|approved|disetujui|fix|acc|signed|akhir|revisi akhir|clear|ok|mutakhir)\b/i.test(lower)) {
        score += 35000;
        detailParts.push('Status: Final/Terbaru/Approved (+35000)');
      }
      if (/\b(addendum|amandemen|adendum|perubahan|usulan)\b/i.test(lower)) {
        score += 10000;
        detailParts.push('Status: Addendum/Usulan (+10000)');
      }

      // 2. Explicit Revision Number
      // e.g. "Rev.03", "Rev 2", "Revisi 3", "v2", "R3"
      const revMatch = lower.match(/(?:rev|revisi|r|v)[\s._-]*([0-9]+(?:\.[0-9]+)?)/i);
      if (revMatch && revMatch[1]) {
        const revNum = parseFloat(revMatch[1]);
        if (!isNaN(revNum)) {
          score += Math.round(revNum * 2000);
          detailParts.push(`Revisi: Rev.${revNum} (+${Math.round(revNum * 2000)})`);
        }
      } else {
        // Trailing number like "JusFin (2)" or "JusFin 2" or "Jusfin_2"
        const trailingNumMatch = lower.match(/[\s_(-]([0-9]+)\)?$/);
        if (trailingNumMatch && trailingNumMatch[1]) {
          const tNum = parseInt(trailingNumMatch[1], 10);
          if (!isNaN(tNum) && tNum > 0 && tNum < 100) {
            score += tNum * 500;
            detailParts.push(`Nomor Versi: #${tNum} (+${tNum * 500})`);
          }
        }
      }

      // 3. Date Detection in sheet name
      const isoDateMatch = lower.match(/(20[2-3][0-9])[-_/.](0[1-9]|1[0-2])[-_/.](0[1-9]|[12][0-9]|3[01])/);
      const compactDateMatch = lower.match(/(20[2-3][0-9])(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/);
      const dmyDateMatch = lower.match(/(0[1-9]|[12][0-9]|3[01])[-_/.](0[1-9]|1[0-2])[-_/.](20[2-3][0-9])/);

      if (isoDateMatch) {
        const y = parseInt(isoDateMatch[1], 10);
        const m = parseInt(isoDateMatch[2], 10);
        const d = parseInt(isoDateMatch[3], 10);
        const dateWeight = y * 1000 + m * 50 + d;
        score += dateWeight;
        detailParts.push(`Tanggal: ${isoDateMatch[0]} (+${dateWeight})`);
      } else if (compactDateMatch) {
        const y = parseInt(compactDateMatch[1], 10);
        const m = parseInt(compactDateMatch[2], 10);
        const d = parseInt(compactDateMatch[3], 10);
        const dateWeight = y * 1000 + m * 50 + d;
        score += dateWeight;
        detailParts.push(`Tanggal: ${compactDateMatch[0]} (+${dateWeight})`);
      } else if (dmyDateMatch) {
        const d = parseInt(dmyDateMatch[1], 10);
        const m = parseInt(dmyDateMatch[2], 10);
        const y = parseInt(dmyDateMatch[3], 10);
        const dateWeight = y * 1000 + m * 50 + d;
        score += dateWeight;
        detailParts.push(`Tanggal: ${dmyDateMatch[0]} (+${dateWeight})`);
      } else {
        // Month names e.g. "Sept", "September", "Okt", etc.
        const months = [
          { name: 'jan', val: 1 }, { name: 'feb', val: 2 }, { name: 'mar', val: 3 },
          { name: 'apr', val: 4 }, { name: 'mei', val: 5 }, { name: 'may', val: 5 },
          { name: 'jun', val: 6 }, { name: 'jul', val: 7 }, { name: 'agu', val: 8 }, { name: 'aug', val: 8 },
          { name: 'sep', val: 9 }, { name: 'okt', val: 10 }, { name: 'oct', val: 10 },
          { name: 'nov', val: 11 }, { name: 'des', val: 12 }, { name: 'dec', val: 12 }
        ];
        for (const m of months) {
          if (lower.includes(m.name)) {
            score += 2026 * 1000 + m.val * 50;
            detailParts.push(`Bulan: ${m.name} (+${m.val * 50})`);
            break;
          }
        }
      }

      // 4. Position in Workbook: Sheet Index (Later sheets to the right are conventionally newer revisions)
      const posBonus = i * 20;
      score += posBonus;
      detailParts.push(`Posisi sheet ke-${i + 1} (+${posBonus})`);

      candidates.push({
        name,
        score,
        details: detailParts.join(', '),
        index: i,
      });
    }

    if (candidates.length === 0) {
      return { sheetName: undefined, candidates: [], reason: 'Tidak ditemukan sheet yang cocok' };
    }

    // Sort descending by score
    candidates.sort((a, b) => b.score - a.score);

    const best = candidates[0];
    const allCandidateNames = candidates.map((c) => c.name);
    const reason = candidates.length > 1
      ? `Terdeteksi ${candidates.length} lembar kerja untuk ${categoryLabel}: [${allCandidateNames.join(', ')}]. Sistem secara otomatis memilih sheet terbaru: "${best.name}" (${best.details}).`
      : `Menggunakan lembar kerja "${best.name}".`;

    return {
      sheetName: best.name,
      candidates: allCandidateNames,
      reason,
    };
  };

  const findSheet = (keywords: string[]): string | undefined => {
    return sheetNames.find((name) => {
      const lower = name.toLowerCase().replace(/[\s_\-():/.,[\]]/g, '');
      return keywords.some((kw) => lower.includes(kw));
    });
  };

  // 1. ProjectInfo Sheet
  const infoSheetName = findSheet(['projectinfo', 'info', 'proyek', 'identitas', 'metadata', 'informasiproyek', 'header']);
  if (infoSheetName) {
    const sheet = wb.Sheets[infoSheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (const r of rows) {
      if (!r || r.length < 2) continue;
      const key = String(r[0] || '').toLowerCase().trim();
      const val = String(r[1] || '').trim();
      if (!val) continue;

      if (key.includes('code') || key.includes('kode')) result.projectInfo.projectCode = val;
      else if (key.includes('subproject') || key.includes('subproyek') || key.includes('sub program')) result.projectInfo.subproject = val;
      else if (key.includes('project') || key.includes('proyek') || key.includes('program')) result.projectInfo.projectName = val;
      else if (key.includes('location') || key.includes('lokasi') || key.includes('tempat')) result.projectInfo.location = val;
      else if (key.includes('contractor') || key.includes('kontraktor') || key.includes('pelaksana') || key.includes('penyedia')) result.projectInfo.contractor = val;
      else if (key.includes('po') || key.includes('purchase order')) result.projectInfo.poNumber = val;
      else if (key.includes('bapl') || key.includes('berita acara')) result.projectInfo.baplNumber = val;
      else if (key.includes('date') || key.includes('tanggal')) result.projectInfo.date = val;
      else if (key.includes('rev') || key.includes('revisi')) result.projectInfo.revision = val;
    }
  }

  // Aliases definition for initial, revised, and general financial fields
  const unitPriceInitAliases = [
    'Harga Satuan Awal', 'Harga Satuan Semula', 'Harga Satuan (Awal)', 'Harga Satuan Kontrak',
    'Unit Price Awal', 'Tarif Awal', 'Harga Awal', 'Harga Satuan_0', 'Harga Satuan',
    'Unit Price (Rp)', 'Unit Price', 'UnitPrice', 'Tarif', 'Hrg Satuan', 'Harga/Satuan', 'Harga / Satuan',
    'Tarif (Rp)', 'Biaya Satuan', 'Unit Rate', 'Rate', 'Price (Rp)', 'Nilai Satuan'
  ];
  const unitPriceRevAliases = [
    'Harga Satuan Revisi', 'Harga Satuan Menjadi', 'Harga Satuan Usulan', 'Harga Satuan (Revisi)',
    'Harga Satuan Akhir', 'Unit Price Revisi', 'Tarif Revisi', 'Harga Revisi', 'Harga Satuan_1', 'Harga Satuan',
    'Unit Price (Rp)', 'Unit Price', 'UnitPrice', 'Tarif', 'Hrg Satuan', 'Harga/Satuan', 'Harga / Satuan',
    'Tarif (Rp)', 'Biaya Satuan', 'Unit Rate', 'Rate', 'Price (Rp)', 'Harga Usulan', 'Nilai Satuan'
  ];
  const qtyInitAliases = [
    'Qty Awal', 'Volume Awal', 'Kuantitas Awal', 'Qty Initial', 'Vol Awal', 'Baseline Qty',
    'Qty Semula', 'Volume Semula', 'Kuantitas Semula', 'Qty Kontrak', 'Volume Kontrak',
    'Qty_0', 'Volume_0', 'Qty', 'Volume', 'Kuantitas', 'Vol', 'Jumlah'
  ];
  const qtyRevAliases = [
    'Qty Revisi', 'Volume Revisi', 'Kuantitas Revisi', 'Qty Revised', 'Vol Revisi', 'Proposed Qty',
    'Qty Menjadi', 'Volume Menjadi', 'Kuantitas Menjadi', 'Qty Usulan', 'Volume Usulan', 'Qty Akhir',
    'Qty_1', 'Volume_1', 'Qty', 'Volume', 'Kuantitas', 'Vol', 'Jumlah'
  ];
  const totalInitAliases = [
    'Total Awal (Rp)', 'Total Awal', 'Jumlah Awal (Rp)', 'Jumlah Awal', 'Total Semula', 'Jumlah Semula',
    'Subtotal Awal', 'Total Kontrak', 'Nilai Awal', 'Biaya Awal', 'Total Initial (Rp)', 'Total Initial',
    'Total_0', 'Total (Rp)', 'Total', 'Jumlah (Rp)', 'Jumlah', 'Subtotal', 'Nilai (Rp)', 'Nilai', 'Sub Total',
    'Jumlah Harga (Rp)', 'Jumlah Harga', 'Total Harga (Rp)', 'Total Harga', 'Jml Harga (Rp)', 'Jml Harga',
    'Total Biaya (Rp)', 'Total Biaya', 'Total Nilai (Rp)', 'Total Nilai'
  ];
  const totalRevAliases = [
    'Total Revisi (Rp)', 'Total Revisi', 'Jumlah Revisi (Rp)', 'Jumlah Revisi', 'Total Menjadi', 'Jumlah Menjadi',
    'Subtotal Revisi', 'Total Usulan', 'Nilai Revisi', 'Biaya Revisi', 'Total Revised (Rp)', 'Total Revised',
    'Total_1', 'Total (Rp)', 'Total', 'Jumlah (Rp)', 'Jumlah', 'Subtotal', 'Nilai (Rp)', 'Nilai', 'Sub Total',
    'Jumlah Harga (Rp)', 'Jumlah Harga', 'Total Harga (Rp)', 'Total Harga', 'Jml Harga (Rp)', 'Jml Harga',
    'Total Biaya (Rp)', 'Total Biaya', 'Total Nilai (Rp)', 'Total Nilai'
  ];
  const itemAliases = [
    'Jenis Pekerjaan', 'Item Pekerjaan', 'Item', 'Uraian Pekerjaan', 'Uraian', 'Deskripsi',
    'Pekerjaan', 'Nama Barang', 'Rincian', 'Komponen', 'Scope', 'Deskripsi Pekerjaan'
  ];

  // Helper to extract items from a side-by-side or standard sheet
  function extractRabFromSheet(raw: any[], sheetName: string) {
    const initItems: Array<{ itemNo?: string; item: string; unit: string; qty: number; unitPrice: number; total: number; subSpecs?: string[] }> = [];
    const revItems: Array<{ itemNo?: string; item: string; unit: string; qty: number; unitPrice: number; total: number; subSpecs?: string[] }> = [];
    const extractedScopeChanges: Array<{
      item: string;
      baseline: string;
      proposed: string;
      cause: string;
      totalAwal: number;
      totalRev: number;
      delta: number;
    }> = [];

    const isSubSpecLine = (txt: string) => {
      const clean = txt.trim().toLowerCase();
      if (!clean) return false;
      if (clean.includes(':')) return true;
      if (/^[-*•·]\s+/.test(clean)) return true;
      if (/^(?:material|face to face|connection|disc|seat|garansi|dimensi|standar|type|tipe|brand|merk|tekanan|spesifikasi|body|hydrotest|fat|sat|testing|pengujian)\b/i.test(clean)) return true;
      if (clean.includes('fat/sat') || clean.includes('hydrotest') || clean.includes('pengujian fungsi') || clean.includes('tes fungsi')) return true;
      return false;
    };

    // Check if the sheet contains side-by-side (initial and revised) columns
    const sampleRow = raw[0] || {};
    const sampleKeys = Object.keys(sampleRow);
    const hasInitialKeys = sampleKeys.some((k) => isValidSideAndType(k, 'initial'));
    const hasRevisedKeys = sampleKeys.some((k) => isValidSideAndType(k, 'revised'));
    const isSideBySide = hasInitialKeys && hasRevisedKeys;

    // Extract side text (ignoring pure numbers)
    const extractRowSideText = (r: any, side: 'initial' | 'revised'): string => {
      const keys = Object.keys(r);
      const relevantKeys = keys.filter((k) => {
        if (k.startsWith('__COL_')) return false;
        if (!isSideBySide) return true;
        return isValidSideAndType(k, side);
      });

      const textParts: string[] = [];
      for (const k of relevantKeys) {
        const val = r[k];
        if (typeof val === 'string' && val.trim().length > 0) {
          const cleanVal = val.trim();
          if (!/^-?\d+([.,]\d+)?$/.test(cleanVal)) {
            textParts.push(cleanVal);
          }
        }
      }

      if (textParts.length === 0 && isSideBySide) {
        const colKeys = keys
          .filter((k) => k.startsWith('__COL_'))
          .sort((a, b) => {
            const idxA = parseInt(a.replace('__COL_', ''), 10);
            const idxB = parseInt(b.replace('__COL_', ''), 10);
            return idxA - idxB;
          });
        const half = Math.floor(colKeys.length / 2);
        const targetCols = side === 'initial' ? colKeys.slice(0, half) : colKeys.slice(half);
        for (const ck of targetCols) {
          const val = r[ck];
          if (typeof val === 'string' && val.trim().length > 0) {
            const cleanVal = val.trim();
            if (!/^-?\d+([.,]\d+)?$/.test(cleanVal)) {
              textParts.push(cleanVal);
            }
          }
        }
      }

      return textParts.join(' ').replace(/\s*:\s*/g, ' : ').trim();
    };

    interface RawRowBlock {
      itemNoAwal?: string;
      itemNoRev?: string;
      itemAwal: string;
      itemRev: string;
      unitAwal: string;
      unitRev: string;
      qtyAwal: number;
      priceAwal: number;
      totalAwal: number;
      qtyRev: number;
      priceRev: number;
      totalRev: number;
      subSpecsAwal: string[];
      subSpecsRev: string[];
      rowJustification: string;
      paired?: boolean;
    }

    const extractedTotals = {
      subTotalInitial: 0,
      subTotalRevised: 0,
      grandTotalInitial: 0,
      grandTotalRevised: 0,
      ppnInitial: 0,
      ppnRevised: 0,
    };

    const rawBlocks: RawRowBlock[] = [];

    for (let idx = 0; idx < raw.length; idx++) {
      const r = raw[idx];
      const itemAwal = String(getCol(r, itemAliases, 'initial') || (!isSideBySide ? getCol(r, itemAliases) : '') || '').trim();
      const itemRev = String(getCol(r, itemAliases, 'revised') || (!isSideBySide ? getCol(r, itemAliases) : '') || itemAwal).trim();
      const mainItem = itemRev || itemAwal || String(getCol(r, itemAliases) || '').trim();

      const itemNoAwal = String(getCol(r, ['Item No', 'No', 'Nomor', 'ID', 'No.'], 'initial') || getCol(r, ['Item No', 'No', 'Nomor', 'ID', 'No.']) || '').trim();
      const itemNoRev = String(getCol(r, ['Item No', 'No', 'Nomor', 'ID', 'No.'], 'revised') || itemNoAwal).trim();

      const unitAwal = String(getCol(r, ['Unit', 'Satuan'], 'initial', 'unit') || getCol(r, ['Unit', 'Satuan'], undefined, 'unit') || 'Unit').trim();
      const unitRev = String(getCol(r, ['Unit', 'Satuan'], 'revised', 'unit') || unitAwal).trim();

      let qtyAwal = 0;
      let priceAwal = 0;
      let totalAwal = 0;
      let qtyRev = 0;
      let priceRev = 0;
      let totalRev = 0;

      if (isSideBySide) {
        qtyAwal = normalizeNumber(getCol(r, qtyInitAliases, 'initial', 'qty') ?? 0);
        priceAwal = normalizeNumber(getCol(r, unitPriceInitAliases, 'initial', 'unitPrice') ?? 0);
        const totalAwalVal = getCol(r, totalInitAliases, 'initial', 'total');
        totalAwal = totalAwalVal !== undefined ? normalizeNumber(totalAwalVal) : Math.round(qtyAwal * priceAwal);

        qtyRev = normalizeNumber(getCol(r, qtyRevAliases, 'revised', 'qty') ?? 0);
        priceRev = normalizeNumber(getCol(r, unitPriceRevAliases, 'revised', 'unitPrice') ?? 0);
        const totalRevVal = getCol(r, totalRevAliases, 'revised', 'total');
        totalRev = totalRevVal !== undefined ? normalizeNumber(totalRevVal) : Math.round(qtyRev * priceRev);
      } else {
        qtyAwal = normalizeNumber(getCol(r, qtyInitAliases, 'initial', 'qty') ?? getCol(r, ['Qty', 'Volume', 'Kuantitas', 'Vol'], undefined, 'qty') ?? 0);
        priceAwal = normalizeNumber(getCol(r, unitPriceInitAliases, 'initial', 'unitPrice') ?? getCol(r, ['Harga Satuan', 'Unit Price', 'Hrg Satuan'], undefined, 'unitPrice') ?? 0);
        const totalAwalVal = getCol(r, totalInitAliases, 'initial', 'total');
        totalAwal = totalAwalVal !== undefined ? normalizeNumber(totalAwalVal) : Math.round(qtyAwal * priceAwal);

        qtyRev = normalizeNumber(getCol(r, qtyRevAliases, 'revised', 'qty') ?? getCol(r, ['Qty', 'Volume', 'Kuantitas', 'Vol'], undefined, 'qty') ?? 0);
        priceRev = normalizeNumber(getCol(r, unitPriceRevAliases, 'revised', 'unitPrice') ?? getCol(r, ['Harga Satuan', 'Unit Price', 'Hrg Satuan'], undefined, 'unitPrice') ?? 0);
        const totalRevVal = getCol(r, totalRevAliases, 'revised', 'total');
        totalRev = totalRevVal !== undefined ? normalizeNumber(totalRevVal) : Math.round(qtyRev * priceRev);
      }

      // Check if this row is a summary / total / PPN row
      const lowerItem = mainItem.toLowerCase();
      const isTotalSub =
        /^(?:total\s*sub|sub\s*total|subtotal|total\s*bagian|total\s*seksi|sub\s*jumlah|total\s*program|jumlah\s*program|subtotal\s*program|total\s*kegiatan|jumlah\s*kegiatan|total\s*paket|jumlah\s*paket|total\s*divisi|jumlah\s*divisi|total\s*bab|jumlah\s*bab)\b/i.test(lowerItem) ||
        /^(?:total|jumlah|subtotal|sub\s*total)\s+(?:sub\s*)?(?:program|kegiatan|paket|seksi|bagian|divisi|bab)\b/i.test(lowerItem) ||
        lowerItem.includes('total sub') ||
        lowerItem.includes('sub total') ||
        lowerItem.includes('subtotal') ||
        lowerItem.includes('total program') ||
        lowerItem.includes('jumlah program') ||
        lowerItem.includes('total kegiatan') ||
        lowerItem.includes('jumlah kegiatan') ||
        lowerItem.includes('total paket') ||
        lowerItem.includes('total divisi') ||
        lowerItem.includes('total (excl');
      const isPpn =
        /^(?:ppn|pajak\s*pertambahan\s*nilai)\b/i.test(lowerItem) ||
        (lowerItem.includes('ppn') && !lowerItem.includes('+ ppn') && !lowerItem.includes('include ppn'));
      const isGrandTotal =
        !isTotalSub &&
        !isPpn &&
        (/^(?:grand\s*total|total\s*akhir|total\s*rab|total\s*keseluruhan|jumlah\s*total|jumlah\s*keseluruhan|total\s*biaya|total\s*harga|total\s*kontrak|total\s*nilai|total\s*pekerjaan|jumlah\s*akhir|jumlah\s*rab|jumlah\s*biaya|jumlah\s*harga|jumlah|total)\b/i.test(lowerItem) ||
          lowerItem.includes('grand total') ||
          lowerItem.includes('total akhir') ||
          lowerItem.includes('total rab') ||
          lowerItem.includes('jumlah total') ||
          lowerItem.includes('total keseluruhan') ||
          lowerItem.includes('total sub + ppn') ||
          lowerItem.includes('total include ppn') ||
          lowerItem.includes('total setelah ppn') ||
          (lowerItem.startsWith('total') && !isTotalSub && !lowerItem.includes('program') && !lowerItem.includes('kegiatan')) ||
          (lowerItem.startsWith('jumlah') && !isTotalSub && !lowerItem.includes('program') && !lowerItem.includes('kegiatan')));

      if (isGrandTotal && (totalAwal > 0 || totalRev > 0)) {
        extractedTotals.grandTotalInitial = Math.max(extractedTotals.grandTotalInitial, totalAwal);
        extractedTotals.grandTotalRevised = Math.max(extractedTotals.grandTotalRevised, totalRev);
      } else if (isTotalSub && (totalAwal > 0 || totalRev > 0)) {
        extractedTotals.subTotalInitial = Math.max(extractedTotals.subTotalInitial, totalAwal);
        extractedTotals.subTotalRevised = Math.max(extractedTotals.subTotalRevised, totalRev);
      } else if (isPpn && (totalAwal > 0 || totalRev > 0)) {
        extractedTotals.ppnInitial = Math.max(extractedTotals.ppnInitial, totalAwal);
        extractedTotals.ppnRevised = Math.max(extractedTotals.ppnRevised, totalRev);
      }

      // CRITICAL: Any summary, subtotal, grand total, or PPN row represents document metadata/aggregates,
      // NOT a billable contract line item. Continuing here prevents double-counting the summary into rawBlocks!
      if (isGrandTotal || isTotalSub || isPpn) {
        continue;
      }

      // Check if this row is a Program, Kegiatan, Division, or Section Title Header
      // e.g. "PROGRAM 7", "PROGRAM KE-7", "PROGRAM VII", "7. PROGRAM ..."
      const isProgramHeader =
        /^(?:program|sub\s*program|kegiatan|sub\s*kegiatan|paket|divisi|seksi|bab|bagian)\s*(?:ke\s*[-–—]?)?[0-9a-zivx]+/i.test(mainItem) ||
        /^(?:[0-9a-zivx]+[\.\)\-\:\s]+)(?:program|sub\s*program|kegiatan|sub\s*kegiatan|paket)\b/i.test(mainItem);

      if (isProgramHeader) {
        // If the program header row has a subtotal, capture it as subtotal, but DO NOT treat as a billable item
        if (totalAwal > 0) extractedTotals.subTotalInitial = Math.max(extractedTotals.subTotalInitial, totalAwal);
        if (totalRev > 0) extractedTotals.subTotalRevised = Math.max(extractedTotals.subTotalRevised, totalRev);
        continue;
      }

      const rowJustification = String(
        getCol(r, ['Keterangan', 'Justifikasi', 'Alasan', 'Catatan', 'Ket', 'Keterangan Perubahan', 'Alasan Perubahan', 'Penjelasan', 'Keterangan / Justifikasi']) || ''
      ).trim();

      // Arithmetic reconciliation & auto-correction
      if (qtyRev > 1 && priceRev === totalRev && totalRev > 0) {
        priceRev = Math.round(totalRev / qtyRev);
      }
      if (qtyAwal > 1 && priceAwal === totalAwal && totalAwal > 0) {
        priceAwal = Math.round(totalAwal / qtyAwal);
      }

      // Check financial presence
      const hasAwalFinancials = priceAwal > 0 || totalAwal > 0 || qtyAwal > 0;
      const hasRevFinancials = priceRev > 0 || totalRev > 0 || qtyRev > 0;

      // Check side text
      const textAwal = extractRowSideText(r, 'initial');
      const textRev = extractRowSideText(r, 'revised');

      // Sub-specification line detection
      const isHeader = isCategoryHeaderOrNonItem(mainItem, itemAwal, itemRev, Math.max(qtyAwal, qtyRev), Math.max(priceAwal, priceRev), Math.max(totalAwal, totalRev));
      const isSpecRow =
        !hasAwalFinancials &&
        !hasRevFinancials &&
        rawBlocks.length > 0 &&
        !isHeader &&
        (!itemNoAwal && !itemNoRev || isSubSpecLine(textAwal) || isSubSpecLine(textRev) || isSubSpecLine(itemAwal) || isSubSpecLine(itemRev));

      if (isSpecRow && rawBlocks.length > 0) {
        const lastBlock = rawBlocks[rawBlocks.length - 1];
        const specAwal = (textAwal || itemAwal).trim();
        const specRev = (textRev || itemRev).trim();
        if (specAwal && specAwal !== '-' && !lastBlock.subSpecsAwal.includes(specAwal)) lastBlock.subSpecsAwal.push(specAwal);
        if (specRev && specRev !== '-' && !lastBlock.subSpecsRev.includes(specRev)) lastBlock.subSpecsRev.push(specRev);
        continue;
      }

      if (isHeader) continue;

      if (hasAwalFinancials || hasRevFinancials || mainItem.length > 0) {
        rawBlocks.push({
          itemNoAwal,
          itemNoRev,
          itemAwal,
          itemRev,
          unitAwal,
          unitRev,
          qtyAwal,
          priceAwal,
          totalAwal,
          qtyRev,
          priceRev,
          totalRev,
          subSpecsAwal: [],
          subSpecsRev: [],
          rowJustification,
        });
      }
    }

    // REKONSILIASI PERUBAHAN DITULIS DI BAWAHNYA (Underneath Revision Pairing)
    // In Indonesian engineering spreadsheets, when an item is modified, row A (top)
    // has the baseline item zeroed in revision (qtyRev = 0), and row B (underneath)
    // specifies the replacement with revised specifications and pricing (qtyRev > 0).
    interface FinalItemBlock {
      itemNo: string;
      item: string;
      unit: string;
      qtyAwal: number;
      priceAwal: number;
      totalAwal: number;
      qtyRev: number;
      priceRev: number;
      totalRev: number;
      subSpecsAwal: string[];
      subSpecsRev: string[];
      rowJustification: string;
      isUnderneathRevision?: boolean;
      originalTopItem?: string;
      originalBottomItem?: string;
    }

    const finalBlocks: FinalItemBlock[] = [];

    for (let i = 0; i < rawBlocks.length; i++) {
      const top = rawBlocks[i];
      if (top.paired) continue;

      const isTopZeroedRev = top.qtyAwal > 0 && (top.qtyRev === 0 || top.totalRev === 0);

      let pairedWithIdx = -1;
      if (isTopZeroedRev) {
        for (let j = i + 1; j < Math.min(rawBlocks.length, i + 6); j++) {
          const candidate = rawBlocks[j];
          if (candidate.paired) continue;

          const isCandidateNewRev = (candidate.qtyAwal === 0 || candidate.totalAwal === 0) && candidate.qtyRev > 0;
          if (!isCandidateNewRev) continue;

          if (!isNameCompatible(top.itemAwal || top.itemRev, candidate.itemRev || candidate.itemAwal)) continue;

          const normTop = (top.itemAwal || top.itemRev).toLowerCase().replace(/[^a-z0-9]/g, ' ');
          const normBottom = (candidate.itemRev || candidate.itemAwal).toLowerCase().replace(/[^a-z0-9]/g, ' ');

          const wordsTop = normTop.split(/\s+/).filter((w) => w.length >= 2);
          const wordsBottom = normBottom.split(/\s+/).filter((w) => w.length >= 2);
          const shared = wordsTop.filter((w) => wordsBottom.includes(w));

          const bothGateValve = normTop.includes('gate') && normTop.includes('valve') && normBottom.includes('gate') && normBottom.includes('valve');
          const sameVolAndUnit = Math.abs(top.qtyAwal - candidate.qtyRev) < 0.001;

          if (bothGateValve || shared.length >= 2 || (sameVolAndUnit && j === i + 1)) {
            pairedWithIdx = j;
            break;
          }
        }
      }

      if (pairedWithIdx >= 0) {
        const bottom = rawBlocks[pairedWithIdx];
        top.paired = true;
        bottom.paired = true;

        const chosenItem = bottom.itemRev || top.itemAwal;
        const chosenUnit = bottom.unitRev || top.unitAwal || 'Unit';
        const subSpecsAwal = top.subSpecsAwal.length > 0 ? top.subSpecsAwal : top.subSpecsRev;
        const subSpecsRev = bottom.subSpecsRev.length > 0 ? bottom.subSpecsRev : bottom.subSpecsAwal;

        finalBlocks.push({
          itemNo: top.itemNoAwal || bottom.itemNoRev || `${finalBlocks.length + 1}`,
          item: chosenItem,
          unit: chosenUnit,
          qtyAwal: top.qtyAwal,
          priceAwal: top.priceAwal,
          totalAwal: top.totalAwal,
          qtyRev: bottom.qtyRev,
          priceRev: bottom.priceRev,
          totalRev: bottom.totalRev,
          subSpecsAwal,
          subSpecsRev,
          rowJustification: bottom.rowJustification || top.rowJustification,
          isUnderneathRevision: true,
          originalTopItem: top.itemAwal,
          originalBottomItem: bottom.itemRev,
        });
      } else {
        const mainItemName = top.itemRev || top.itemAwal || `Item #${finalBlocks.length + 1}`;
        finalBlocks.push({
          itemNo: top.itemNoRev || top.itemNoAwal || `${finalBlocks.length + 1}`,
          item: mainItemName,
          unit: top.unitRev || top.unitAwal || 'Unit',
          qtyAwal: top.qtyAwal,
          priceAwal: top.priceAwal,
          totalAwal: top.totalAwal,
          qtyRev: top.qtyRev,
          priceRev: top.priceRev,
          totalRev: top.totalRev,
          subSpecsAwal: top.subSpecsAwal,
          subSpecsRev: top.subSpecsRev,
          rowJustification: top.rowJustification,
          isUnderneathRevision: false,
        });
      }
    }

    // Populate initItems, revItems, and extractedScopeChanges
    for (const fb of finalBlocks) {
      if (isCategoryHeaderOrNonItem(fb.item, undefined, undefined, Math.max(fb.qtyAwal, fb.qtyRev), Math.max(fb.priceAwal, fb.priceRev), Math.max(fb.totalAwal, fb.totalRev))) {
        continue;
      }
      if (fb.qtyAwal === 0 && fb.qtyRev === 0 && fb.totalAwal === 0 && fb.totalRev === 0) {
        continue;
      }

      initItems.push({
        itemNo: fb.itemNo,
        item: fb.item,
        unit: fb.unit,
        qty: fb.qtyAwal,
        unitPrice: fb.priceAwal,
        total: fb.totalAwal,
        subSpecs: fb.subSpecsAwal,
      });

      revItems.push({
        itemNo: fb.itemNo,
        item: fb.item,
        unit: fb.unit,
        qty: fb.qtyRev,
        unitPrice: fb.priceRev,
        total: fb.totalRev,
        subSpecs: fb.subSpecsRev,
      });

      const deltaTotal = fb.totalRev - fb.totalAwal;
      const isQtyChanged = Math.abs(fb.qtyAwal - fb.qtyRev) > 0.0001;
      const isPriceChanged = Math.abs(fb.priceAwal - fb.priceRev) > 1;
      const isTotalChanged = Math.abs(deltaTotal) > 1;

      if (fb.isUnderneathRevision) {
        // Detailed sub-specifications differences
        if (fb.subSpecsRev.length > 0 && fb.subSpecsAwal.length > 0) {
          for (const rSpec of fb.subSpecsRev) {
            const [rKeyRaw, ...rValParts] = rSpec.split(':');
            const rKey = rKeyRaw.trim().toLowerCase();
            const rVal = rValParts.join(':').trim();

            const aSpecMatch = fb.subSpecsAwal.find((s) => s.split(':')[0].trim().toLowerCase() === rKey);
            if (aSpecMatch) {
              const aVal = aSpecMatch.split(':').slice(1).join(':').trim();
              if (aVal && rVal && aVal.toLowerCase() !== rVal.toLowerCase()) {
                extractedScopeChanges.push({
                  item: `${fb.item} (${rKeyRaw.trim()})`,
                  baseline: `${rKeyRaw.trim()}: ${aVal}`,
                  proposed: `${rKeyRaw.trim()}: ${rVal}`,
                  cause: fb.rowJustification || `Penyesuaian spesifikasi sub-komponen teknis ${rKeyRaw.trim()} dari ${aVal} menjadi ${rVal} sesuai kebutuhan operasional dan posisi pipa eksisting.`,
                  totalAwal: 0,
                  totalRev: 0,
                  delta: 0,
                });
              }
            }
          }
        }

        let causeText = fb.rowJustification;
        if (!causeText) {
          const subDiffs: string[] = [];
          for (const rSpec of fb.subSpecsRev) {
            const [rK, ...rV] = rSpec.split(':');
            const aMatch = fb.subSpecsAwal.find((s) => s.split(':')[0].trim().toLowerCase() === rK.trim().toLowerCase());
            if (aMatch && aMatch.split(':').slice(1).join(':').trim().toLowerCase() !== rV.join(':').trim().toLowerCase()) {
              subDiffs.push(`${rK.trim()}: ${rV.join(':').trim()}`);
            }
          }
          causeText = `Penyesuaian spesifikasi sub-komponen teknis (${subDiffs.join(', ') || 'optimasi teknis'}) dan penyesuaian harga satuan dari Rp ${fb.priceAwal.toLocaleString('id-ID')} menjadi Rp ${fb.priceRev.toLocaleString('id-ID')} (Delta: ${deltaTotal >= 0 ? '+' : ''}Rp ${deltaTotal.toLocaleString('id-ID')}).`;
        }

        extractedScopeChanges.push({
          item: fb.item,
          baseline: `Semula: ${fb.originalTopItem || fb.item} (Volume: ${fb.qtyAwal} ${fb.unit} @ Rp ${fb.priceAwal.toLocaleString('id-ID')} = Rp ${fb.totalAwal.toLocaleString('id-ID')})`,
          proposed: `Menjadi: ${fb.originalBottomItem || fb.item} (Volume: ${fb.qtyRev} ${fb.unit} @ Rp ${fb.priceRev.toLocaleString('id-ID')} = Rp ${fb.totalRev.toLocaleString('id-ID')})`,
          cause: causeText,
          totalAwal: fb.totalAwal,
          totalRev: fb.totalRev,
          delta: deltaTotal,
        });
      } else {
        if (fb.qtyAwal > 0 && fb.qtyRev === 0) {
          extractedScopeChanges.push({
            item: fb.item,
            baseline: `Tercantum pada Kontrak/RAB Awal: ${fb.item} (Volume: ${fb.qtyAwal} ${fb.unit} @ Rp ${fb.priceAwal.toLocaleString('id-ID')} = Rp ${fb.totalAwal.toLocaleString('id-ID')})`,
            proposed: `Dihilangkan / Ditiadakan dari lingkup pekerjaan revisi (0 ${fb.unit})`,
            cause: fb.rowJustification || 'Optimalisasi lingkup pekerjaan dan peniadaan item (Pekerjaan Kurang).',
            totalAwal: fb.totalAwal,
            totalRev: 0,
            delta: -fb.totalAwal,
          });
        } else if (fb.qtyAwal === 0 && fb.qtyRev > 0) {
          extractedScopeChanges.push({
            item: fb.item,
            baseline: `Tidak ada pada Kontrak/RAB Awal (0 ${fb.unit})`,
            proposed: `Pekerjaan Tambah: ${fb.item} (Volume: ${fb.qtyRev} ${fb.unit} @ Rp ${fb.priceRev.toLocaleString('id-ID')} = Rp ${fb.totalRev.toLocaleString('id-ID')})`,
            cause: fb.rowJustification || 'Penambahan pekerjaan baru (Pekerjaan Tambah) sesuai kebutuhan teknis lapangan.',
            totalAwal: 0,
            totalRev: fb.totalRev,
            delta: fb.totalRev,
          });
        } else if (isQtyChanged || isPriceChanged || isTotalChanged) {
          extractedScopeChanges.push({
            item: fb.item,
            baseline: `Semula: ${fb.item} (Volume: ${fb.qtyAwal} ${fb.unit} @ Rp ${fb.priceAwal.toLocaleString('id-ID')} = Rp ${fb.totalAwal.toLocaleString('id-ID')})`,
            proposed: `Menjadi: ${fb.item} (Volume: ${fb.qtyRev} ${fb.unit} @ Rp ${fb.priceRev.toLocaleString('id-ID')} = Rp ${fb.totalRev.toLocaleString('id-ID')})`,
            cause: fb.rowJustification || `Penyesuaian kuantitas/harga satuan pada pekerjaan (${isQtyChanged ? `Vol: ${fb.qtyAwal} -> ${fb.qtyRev}` : ''} ${isPriceChanged ? `Harga: Rp ${fb.priceAwal.toLocaleString('id-ID')} -> Rp ${fb.priceRev.toLocaleString('id-ID')}` : ''}).`,
            totalAwal: fb.totalAwal,
            totalRev: fb.totalRev,
            delta: deltaTotal,
          });
        }
      }
    }

    return { initItems, revItems, extractedScopeChanges, extractedTotals };
  }

  // 2. Scan for RAB sheets
  const rabInitSheetName = findSheet(['rabinitial', 'rabawal', 'rabawalproyek', 'baseline', 'rabkontrak', 'kontrakawal']);
  const rabRevResolution = findLatestSheet(
    ['rabrevised', 'rabrevisi', 'revisirab', 'revised', 'rabusulan', 'usulanrab', 'rabakhir', 'perbandingan', 'rekaprab', 'rab'],
    'RAB Revisi'
  );
  const rabRevSheetName = rabRevResolution.sheetName;

  if (rabRevResolution.sheetName) {
    selectedSheets.rabRevised = {
      sheetName: rabRevResolution.sheetName,
      allCandidates: rabRevResolution.candidates,
      reason: rabRevResolution.reason,
    };
    if (rabRevResolution.candidates.length > 1) {
      warnings.push(`[Multi-Sheet RAB Revisi] ${rabRevResolution.reason}`);
      auditNotes.push(`[Multi-Sheet RAB Revisi] ${rabRevResolution.reason}`);
    }
  }

  // If a single sheet contains side-by-side data OR RAB Revisi is selected
  if (rabRevSheetName && (!rabInitSheetName || rabInitSheetName === rabRevSheetName)) {
    const raw = smartParseTable(wb.Sheets[rabRevSheetName]);
    const { initItems, revItems, extractedScopeChanges, extractedTotals } = extractRabFromSheet(raw, rabRevSheetName);
    result.rabRevised = revItems;
    if (initItems.length > 0) {
      result.rabInitial = initItems;
    }

    const bestTotalInit = extractedTotals.grandTotalInitial > 0
      ? extractedTotals.grandTotalInitial
      : (extractedTotals.subTotalInitial > 0 ? extractedTotals.subTotalInitial : 0);
    const bestTotalRev = extractedTotals.grandTotalRevised > 0
      ? extractedTotals.grandTotalRevised
      : (extractedTotals.subTotalRevised > 0 ? extractedTotals.subTotalRevised : 0);

    const sumRevItems = revItems.reduce((acc, it) => acc + (it.total || (it.qty * it.unitPrice) || 0), 0);
    const sumInitItems = initItems.reduce((acc, it) => acc + (it.total || (it.qty * it.unitPrice) || 0), 0);

    if (bestTotalInit > 0) {
      result.statedTotalInitial = bestTotalInit;
    } else if (sumInitItems > 0) {
      result.statedTotalInitial = sumInitItems;
    }

    if (bestTotalRev > 0) {
      result.statedTotalRevised = bestTotalRev;
    } else if (sumRevItems > 0) {
      result.statedTotalRevised = sumRevItems;
    }

    // Guard: Only upgrade to sum of items if no authoritative grand total was captured and only a section subtotal was found
    if (extractedTotals.grandTotalRevised === 0 && sumRevItems > 0 && (result.statedTotalRevised === undefined || sumRevItems > result.statedTotalRevised)) {
      result.statedTotalRevised = sumRevItems;
    }
    if (extractedTotals.grandTotalInitial === 0 && sumInitItems > 0 && (result.statedTotalInitial === undefined || sumInitItems > result.statedTotalInitial)) {
      result.statedTotalInitial = sumInitItems;
    }

    if (result.statedTotalInitial !== undefined && result.statedTotalRevised !== undefined) {
      result.statedTotalJusFinDelta = result.statedTotalRevised - result.statedTotalInitial;
    }

    // Add detected scope changes to JusTek if not already recorded
    for (const sc of extractedScopeChanges) {
      if (!result.jusTek.some((j) => j.item.trim().toLowerCase() === sc.item.trim().toLowerCase())) {
        result.jusTek.push({
          changeId: `CHG-${String(result.jusTek.length + 1).padStart(3, '0')}`,
          item: sc.item,
          baseline: sc.baseline,
          proposed: sc.proposed,
          cause: sc.cause,
          risk: sc.delta < 0
            ? 'Tidak ada risiko teknis; tertib administrasi karena efisiensi anggaran.'
            : 'Perlu verifikasi kesesuaian fisik, dimensi instalasi, dan standar sambungan di lapangan.',
          benefit: sc.delta < 0
            ? 'Efisiensi anggaran proyek dan kepastian administrasi fisik.'
            : 'Memastikan keandalan operasi sistem instalasi dan kesesuaian standar teknis.',
        });
      }
    }
  } else {
    // Separate sheets for RAB Initial and RAB Revised
    if (rabInitSheetName) {
      const raw = smartParseTable(wb.Sheets[rabInitSheetName]);
      const { initItems, extractedTotals } = extractRabFromSheet(raw, rabInitSheetName);
      result.rabInitial = initItems;
      const bestTotalInit = extractedTotals.grandTotalInitial > 0
        ? extractedTotals.grandTotalInitial
        : (extractedTotals.subTotalInitial > 0 ? extractedTotals.subTotalInitial : 0);
      const sumInit = initItems.reduce((acc, it) => acc + (it.total || (it.qty * it.unitPrice) || 0), 0);
      if (bestTotalInit > 0) {
        result.statedTotalInitial = bestTotalInit;
      } else if (sumInit > 0) {
        result.statedTotalInitial = sumInit;
      }
      if (extractedTotals.grandTotalInitial === 0 && sumInit > 0 && (result.statedTotalInitial === undefined || sumInit > result.statedTotalInitial)) {
        result.statedTotalInitial = sumInit;
      }
    }
    if (rabRevSheetName) {
      const raw = smartParseTable(wb.Sheets[rabRevSheetName]);
      const { revItems, initItems, extractedScopeChanges, extractedTotals } = extractRabFromSheet(raw, rabRevSheetName);
      result.rabRevised = revItems;
      if (result.rabInitial.length === 0 && initItems.length > 0) {
        result.rabInitial = initItems;
      }
      const bestTotalRev = extractedTotals.grandTotalRevised > 0
        ? extractedTotals.grandTotalRevised
        : (extractedTotals.subTotalRevised > 0 ? extractedTotals.subTotalRevised : 0);
      const sumRev = revItems.reduce((acc, it) => acc + (it.total || (it.qty * it.unitPrice) || 0), 0);
      if (bestTotalRev > 0) {
        result.statedTotalRevised = bestTotalRev;
      } else if (sumRev > 0) {
        result.statedTotalRevised = sumRev;
      }
      if (extractedTotals.grandTotalRevised === 0 && sumRev > 0 && (result.statedTotalRevised === undefined || sumRev > result.statedTotalRevised)) {
        result.statedTotalRevised = sumRev;
      }
      if (result.statedTotalInitial !== undefined && result.statedTotalRevised !== undefined) {
        result.statedTotalJusFinDelta = result.statedTotalRevised - result.statedTotalInitial;
      }
      for (const sc of extractedScopeChanges) {
        if (!result.jusTek.some((j) => j.item.trim().toLowerCase() === sc.item.trim().toLowerCase())) {
          result.jusTek.push({
            changeId: `CHG-${String(result.jusTek.length + 1).padStart(3, '0')}`,
            item: sc.item,
            baseline: sc.baseline,
            proposed: sc.proposed,
            cause: sc.cause,
            risk: sc.delta < 0
              ? 'Tidak ada risiko teknis; tertib administrasi karena efisiensi anggaran.'
              : 'Perlu verifikasi kesesuaian fisik, dimensi instalasi, dan standar sambungan di lapangan.',
            benefit: sc.delta < 0
              ? 'Efisiensi anggaran proyek dan kepastian administrasi fisik.'
              : 'Memastikan keandalan operasi sistem instalasi dan kesesuaian standar teknis.',
          });
        }
      }

      // Cross-compare sub-specifications between separate RAB sheets
      for (let rIdx = 0; rIdx < result.rabRevised.length; rIdx++) {
        const revItem = result.rabRevised[rIdx];
        const matchInit = matchRabItem(revItem, result.rabInitial, rIdx);
        if (matchInit && matchInit.subSpecs && revItem.subSpecs) {
          for (const rSpec of revItem.subSpecs) {
            const cleanR = rSpec.trim();
            if (!cleanR) continue;

            if (cleanR.includes(':')) {
              const rParts = cleanR.split(':');
              const rKey = rParts[0].trim().toLowerCase();
              const rVal = rParts.slice(1).join(':').trim();

              const iSpecMatch = matchInit.subSpecs.find((s) => s.split(':')[0].trim().toLowerCase() === rKey);
              if (iSpecMatch) {
                const iVal = iSpecMatch.split(':').slice(1).join(':').trim();
                if (iVal && rVal && iVal.toLowerCase() !== rVal.toLowerCase()) {
                  if (!result.jusTek.some((j) => j.proposed.toLowerCase().includes(rVal.toLowerCase()))) {
                    result.jusTek.push({
                      changeId: `CHG-00${result.jusTek.length + 1}`,
                      item: `${revItem.item} (${rParts[0].trim()})`,
                      baseline: `${rParts[0].trim()}: ${iVal}`,
                      proposed: `${rParts[0].trim()}: ${rVal}`,
                      cause: `Penyesuaian spesifikasi sub-komponen ${rParts[0].trim()} pada ${revItem.item}`,
                      risk: 'Perlu verifikasi kesesuaian fisik dan dimensi di lapangan.',
                      benefit: 'Memastikan keandalan operasi dan kesesuaian standar sistem.',
                    });
                  }
                }
              }
            } else {
              // Non key-value detail (e.g. Hydrotest (dilakukan pada saat FAT/SAT))
              const hasExact = matchInit.subSpecs.some((s) => s.trim().toLowerCase() === cleanR.toLowerCase());
              if (!hasExact && !result.jusTek.some((j) => j.proposed.toLowerCase().includes(cleanR.toLowerCase()))) {
                result.jusTek.push({
                  changeId: `CHG-00${result.jusTek.length + 1}`,
                  item: `${revItem.item}`,
                  baseline: 'Tidak tercantum rincian teknis khusus',
                  proposed: cleanR,
                  cause: `Penyesuaian catatan teknis pada ${revItem.item}`,
                  risk: 'Perlu konfirmasi ketersediaan fasilitas pengujian.',
                  benefit: 'Memastikan kepatuhan teknis.',
                });
              }
            }
          }
        }
      }
    }
  }

  // 4. JusTek (Justifikasi Teknis)
  const justekResolution = findLatestSheet(
    ['justek', 'justifikasiteknis', 'teknis', 'technical', 'usulanteknis', 'analisateknis'],
    'Justifikasi Teknis'
  );
  const justekSheetName = justekResolution.sheetName;
  if (justekResolution.sheetName) {
    selectedSheets.jusTek = {
      sheetName: justekResolution.sheetName,
      allCandidates: justekResolution.candidates,
      reason: justekResolution.reason,
    };
    if (justekResolution.candidates.length > 1) {
      warnings.push(`[Multi-Sheet JusTek] ${justekResolution.reason}`);
      auditNotes.push(`[Multi-Sheet JusTek] ${justekResolution.reason}`);
    }
  }

  if (justekSheetName) {
    const raw = smartParseTable(wb.Sheets[justekSheetName]);
    const baselineAliases = [
      'Kondisi Awal (Baseline)', 'Kondisi Awal', 'Baseline', 'Semula', 'Kondisi Semula',
      'Spesifikasi Awal', 'Spesifikasi Kontrak', 'Spesifikasi Semula', 'Kontrak Awal',
      'Sebelum Perubahan', 'Sebelum', 'Kondisi Lapangan Semula', 'Kondisi Eksisting',
      'Eksisting', 'RAB Awal', 'Spesifikasi Baseline', 'Baseline Spesifikasi', 'Kondisi Awal Kontrak'
    ];
    const proposedAliases = [
      'Usulan Perubahan (Proposed)', 'Usulan Perubahan', 'Proposed', 'Usulan', 'Perubahan',
      'Menjadi', 'Kondisi Usulan', 'Spesifikasi Usulan', 'Spesifikasi Revisi', 'Spesifikasi Baru',
      'Kondisi Revisi', 'Sesudah Perubahan', 'Sesudah', 'Rekomendasi', 'Usulan Teknis',
      'Kondisi Baru', 'Spesifikasi Proposed', 'Revisi', 'Usulan Baru'
    ];
    const causeAliases = [
      'Alasan Teknis (Cause)', 'Alasan Teknis', 'Alasan', 'Cause', 'Latar Belakang', 'Penyebab',
      'Alasan Perubahan', 'Dasar Pertimbangan', 'Kebutuhan Lapangan', 'Analisa Teknis',
      'Justifikasi Teknis', 'Justifikasi', 'Keterangan Teknis', 'Kajian Teknis', 'Penjelasan'
    ];
    const riskAliases = [
      'Risiko Bila Tidak Dilakukan', 'Risiko', 'Risk', 'Dampak Risiko', 'Dampak Bila Tidak Dilakukan',
      'Dampak', 'Mitigasi Risiko', 'Konsekuensi', 'Analisa Risiko', 'Risiko Teknis'
    ];
    const benefitAliases = [
      'Manfaat Perubahan', 'Manfaat', 'Benefit', 'Keuntungan', 'Efisiensi Teknis',
      'Dampak Positif', 'Output', 'Hasil yang Diharapkan', 'Keuntungan Teknis'
    ];
    const justekItemAliases = [
      'Item Pekerjaan', 'Item', 'Uraian', 'Deskripsi', 'Pekerjaan', 'Nama Barang', 'Uraian Pekerjaan',
      'Nama Pekerjaan', 'Komponen', 'Rincian Pekerjaan', 'Lingkup Pekerjaan', 'Scope'
    ];

    const parsedJusTek = raw
      .filter((r) => {
        const item = String(getCol(r, justekItemAliases) || '').trim();
        const baseline = String(getCol(r, baselineAliases) || '-').trim();
        const proposed = String(getCol(r, proposedAliases) || '-').trim();
        const cause = String(getCol(r, causeAliases) || '-').trim();

        if (isCategoryHeaderOrNonItem(item, baseline, proposed)) return false;
        return (item.length > 0 && item !== '-') && ((proposed.length > 0 && proposed !== '-') || (baseline.length > 0 && baseline !== '-') || (cause.length > 0 && cause !== '-'));
      })
      .map((r, idx) => ({
        changeId: String(getCol(r, ['Change ID', 'ChangeId', 'ID', 'No', 'Nomor', 'Kode', 'Kode Perubahan', 'Ref', 'Item No']) || `CHG-${String(idx + 1).padStart(3, '0')}`),
        item: String(getCol(r, justekItemAliases) || `Item Pekerjaan #${idx + 1}`).trim(),
        baseline: String(getCol(r, baselineAliases) || '-').trim(),
        proposed: String(getCol(r, proposedAliases) || '-').trim(),
        cause: String(getCol(r, causeAliases) || '-').trim(),
        risk: String(getCol(r, riskAliases) || '-').trim(),
        benefit: String(getCol(r, benefitAliases) || '-').trim(),
      }));

    if (parsedJusTek.length > 0) {
      result.jusTek = parsedJusTek;
    }
  }

  // 5. JusFin (Justifikasi Finansial)
  const jusfinResolution = findLatestSheet(
    [
      'jusfin', 'justifikasifinansial', 'justifikasikeuangan', 'finansial', 'financial',
      'keuangan', 'biaya', 'cost', 'kompensasi', 'perhitungan', 'budget', 'anggaran',
      'rekapfinansial', 'rekapbiaya', 'rekapitulasi', 'analisabiaya', 'perhitunganbiaya', 'penyesuaianbiaya',
      'matriksfinansial', 'matriksjusfin', 'deviasibiaya', 'usulanbiaya', 'selisihbiaya'
    ],
    'Justifikasi Finansial (JusFin)'
  );
  const jusfinSheetName = jusfinResolution.sheetName;
  if (jusfinResolution.sheetName) {
    selectedSheets.jusFin = {
      sheetName: jusfinResolution.sheetName,
      allCandidates: jusfinResolution.candidates,
      reason: jusfinResolution.reason,
    };
    if (jusfinResolution.candidates.length > 1) {
      warnings.push(`[Multi-Sheet JusFin] ${jusfinResolution.reason}`);
      auditNotes.push(`[Multi-Sheet JusFin] ${jusfinResolution.reason}`);
    }
  }

  if (jusfinSheetName) {
    const raw = smartParseTable(wb.Sheets[jusfinSheetName]);

    const initCostAliases = [
      'Nilai Awal (Rp)', 'Nilai Awal', 'Total Awal (Rp)', 'Total Awal', 'RAB Awal (Rp)', 'RAB Awal',
      'Biaya Awal', 'Sebelum', 'Baseline (Rp)', 'Baseline', 'Harga Awal', 'Jumlah Awal',
      'Total Initial (Rp)', 'Total Initial', 'Initial Cost', 'Biaya Kontrak Awal', 'Kontrak Awal',
      'Nilai Kontrak', 'Total Kontrak', 'Harga Kontrak', 'Biaya Semula', 'Total Semula', 'Jumlah Semula', 'Nilai Semula'
    ];
    const revCostAliases = [
      'Nilai Revisi (Rp)', 'Nilai Revisi', 'Total Revisi (Rp)', 'Total Revisi', 'RAB Revisi (Rp)', 'RAB Revisi',
      'Biaya Revisi', 'Sesudah', 'Proposed (Rp)', 'Proposed', 'Harga Revisi', 'Jumlah Revisi',
      'Total Revised (Rp)', 'Total Revised', 'Revised Cost', 'Biaya Usulan', 'Nilai Akhir', 'Usulan Akhir',
      'Biaya Lapangan', 'Nilai Menjadi', 'Total Menjadi', 'Jumlah Menjadi', 'Biaya Menjadi', 'Total Usulan',
      'Jumlah Usulan', 'Nilai Usulan', 'RAB Usulan', 'RAB Akhir', 'Nilai Amandemen', 'Total Amandemen'
    ];
    const deltaAliases = [
      'Delta Stated (Rp)', 'Delta Stated', 'Delta (Rp)', 'Delta', 'Selisih (Rp)', 'Selisih',
      'Deviasi (Rp)', 'Deviasi', 'Perubahan (Rp)', 'Perubahan', 'Varian (Rp)', 'Varian', 'Variance',
      'Kompensasi (Rp)', 'Kompensasi', 'Selisih Biaya', '+/- (Rp)', '+/-', 'Penambahan/Pengurangan',
      'Tambah / (Kurang)', 'Tambah / Kurang', '+ / -', 'Tambah(Kurang)', 'Tambah/(Kurang)', 'Tambah/Kurang',
      'Deviasi Biaya', 'Selisih Nilai', 'Perubahan Biaya', 'Kenaikan/Penurunan', 'Penambahan / (Pengurangan)'
    ];
    const justifAliases = [
      'Justifikasi Finansial', 'Justifikasi', 'Alasan Finansial', 'Keterangan', 'Penjelasan', 'Alasan',
      'Catatan', 'Dasar Perhitungan', 'Analisa', 'Keterangan / Justifikasi', 'Kompensasi Anggaran',
      'Sumber Dana', 'Analisa Biaya', 'Catatan Finansial', 'Alasan Perubahan Biaya', 'Justifikasi Biaya',
      'Keterangan Penyesuaian', 'Catatan Perubahan', 'Analisa Finansial'
    ];
    const idAliases = ['Change ID', 'ChangeId', 'ID', 'No', 'Nomor', 'Kode', 'Kode Perubahan', 'Item No', 'Ref'];

    const validRows: any[] = [];
    for (const r of raw) {
      const item = String(getCol(r, itemAliases) || '').trim();
      const justif = String(getCol(r, justifAliases) || '').trim();
      const lowerItem = item.toLowerCase();
      const isTotalRow =
        lowerItem.includes('total') ||
        lowerItem.includes('rekap') ||
        lowerItem.includes('jumlah') ||
        lowerItem.includes('subtotal') ||
        lowerItem.includes('sub total') ||
        lowerItem.includes('ppn') ||
        /^(?:total|grand\s*total|sub\s*total|total\s*sub|jumlah\s*total|ppn\b)/i.test(item);

      if (isTotalRow) {
        const statedInit = getCol(r, initCostAliases) ?? getCol(r, totalInitAliases, 'initial');
        const statedRev = getCol(r, revCostAliases) ?? getCol(r, totalRevAliases, 'revised');
        const statedD = getCol(r, deltaAliases) ?? getCol(r, ['Delta', 'Selisih', 'Deviasi', '+/-']);

        if (statedInit !== undefined && statedInit !== null) result.statedTotalInitial = normalizeNumber(statedInit);
        if (statedRev !== undefined && statedRev !== null) result.statedTotalRevised = normalizeNumber(statedRev);
        if (statedD !== undefined && statedD !== null) result.statedTotalJusFinDelta = normalizeNumber(statedD);
      } else {
        const totInit = normalizeNumber(getCol(r, initCostAliases) || 0);
        const totRev = normalizeNumber(getCol(r, revCostAliases) || 0);
        const delta = normalizeNumber(getCol(r, deltaAliases) || (totRev - totInit));

        if (isCategoryHeaderOrNonItem(item)) {
          continue;
        }

        if (item.length > 0 || justif.length > 0 || getCol(r, deltaAliases) !== undefined) {
          validRows.push(r);
        }
      }
    }

    result.jusFin = validRows.map((r, idx) => {
      const item = String(getCol(r, itemAliases) || `Item Finansial #${idx + 1}`).trim();
      const totInit = normalizeNumber(getCol(r, initCostAliases));
      const totRev = normalizeNumber(getCol(r, revCostAliases));
      const statedDeltaVal = getCol(r, deltaAliases);
      const statedDelta = statedDeltaVal !== undefined ? normalizeNumber(statedDeltaVal) : (totRev - totInit);
      const justification = String(getCol(r, justifAliases) || 'Penyesuaian nilai anggaran berdasarkan kalkulasi teknis & RAB revisi.').trim();

      const unit = String(getCol(r, ['Unit', 'Satuan'], undefined, 'unit') || 'Unit').trim();
      const qtyInit = normalizeNumber(getCol(r, qtyInitAliases, 'initial', 'qty') ?? getCol(r, ['Qty', 'Volume', 'Kuantitas', 'Vol'], undefined, 'qty'));
      const qtyRev = normalizeNumber(getCol(r, qtyRevAliases, 'revised', 'qty') ?? getCol(r, ['Qty', 'Volume', 'Kuantitas', 'Vol'], undefined, 'qty'));
      const pInit = normalizeNumber(getCol(r, unitPriceInitAliases, 'initial', 'unitPrice') ?? getCol(r, ['Harga Satuan', 'Unit Price', 'Hrg Satuan'], undefined, 'unitPrice'));
      const pRev = normalizeNumber(getCol(r, unitPriceRevAliases, 'revised', 'unitPrice') ?? getCol(r, ['Harga Satuan', 'Unit Price', 'Hrg Satuan'], undefined, 'unitPrice'));

      return {
        changeId: String(getCol(r, idAliases) || `CHG-${String(idx + 1).padStart(3, '0')}`),
        item,
        unit,
        qtyInitial: qtyInit > 0 ? qtyInit : undefined,
        qtyRevised: qtyRev > 0 ? qtyRev : undefined,
        unitPriceInitial: pInit > 0 ? pInit : undefined,
        unitPriceRevised: pRev > 0 ? pRev : undefined,
        totalInitial: totInit,
        totalRevised: totRev,
        statedDelta,
        justification,
      };
    });

    // If RAB revised has not been populated yet, extract full granular items if available in JusFin sheet
    if (result.rabRevised.length === 0) {
      const { initItems, revItems } = extractRabFromSheet(raw, jusfinSheetName);
      if (revItems.length > 0 && revItems.some((i) => i.qty > 0 && i.unitPrice > 0)) {
        result.rabInitial = initItems;
        result.rabRevised = revItems;
      }
    }
  }

  // 6. Universal Fallback if no sheets were matched
  if (result.rabRevised.length === 0 && result.jusFin.length === 0) {
    const candidateSheetName = findSheet(['rab', 'boq', 'data', 'sheet1', 'proyek']) || sheetNames[0];
    if (candidateSheetName) {
      const raw = smartParseTable(wb.Sheets[candidateSheetName]);
      const { initItems, revItems } = extractRabFromSheet(raw, candidateSheetName);
      result.rabInitial = initItems;
      result.rabRevised = revItems;
    }
  }

  // 7. Auto-synthesize JusFin and JusTek from comprehensive Left vs Right RAB comparison if not present as standalone sheets
  if (result.jusFin.length === 0 && (result.rabRevised.length > 0 || result.rabInitial.length > 0)) {
    const candidateJusfin: Array<{
      item: string;
      totalInitial: number;
      totalRevised: number;
      statedDelta: number;
      justification: string;
      isChanged: boolean;
    }> = [];

    const processedInitItemNos = new Set<string>();

    // Compare each item in Revised with Initial
    for (let rIdx = 0; rIdx < result.rabRevised.length; rIdx++) {
      const r = result.rabRevised[rIdx];
      const matchInit = matchRabItem(r, result.rabInitial, rIdx);

      if (matchInit) {
        if (matchInit.itemNo) processedInitItemNos.add(matchInit.itemNo);
        else processedInitItemNos.add(matchInit.item.toLowerCase());

        const totInit = matchInit.total !== undefined ? matchInit.total : (matchInit.qty * matchInit.unitPrice);
        const totRev = r.total !== undefined ? r.total : (r.qty * r.unitPrice);
        const delta = totRev - totInit;
        const isQtyChanged = Math.abs((r.qty || 0) - (matchInit.qty || 0)) > 0.0001;
        const isPriceChanged = Math.abs((r.unitPrice || 0) - (matchInit.unitPrice || 0)) > 0.01;
        const isTotalChanged = Math.abs(delta) > 0.01;

        let subDiffs: string[] = [];
        if (r.subSpecs && matchInit.subSpecs && r.subSpecs.length > 0) {
          for (const rSpec of r.subSpecs) {
            const cleanR = rSpec.trim();
            if (!cleanR) continue;
            if (cleanR.includes(':')) {
              const [rK, ...rV] = cleanR.split(':');
              const aMatch = matchInit.subSpecs.find((s) => s.split(':')[0].trim().toLowerCase() === rK.trim().toLowerCase());
              if (aMatch) {
                const aVal = aMatch.split(':').slice(1).join(':').trim();
                const rVal = rV.join(':').trim();
                if (aVal.toLowerCase() !== rVal.toLowerCase()) {
                  subDiffs.push(`${rK.trim()}: ${aVal} -> ${rVal}`);
                }
              } else {
                subDiffs.push(`+ ${cleanR}`);
              }
            } else {
              const hasExact = matchInit.subSpecs.some((s) => s.trim().toLowerCase() === cleanR.toLowerCase());
              if (!hasExact) {
                subDiffs.push(`+ ${cleanR}`);
              }
            }
          }
        }

        let justif = 'Kuantitas, harga satuan, dan spesifikasi tetap sama (Tidak ada perubahan).';
        if (subDiffs.length > 0) {
          justif = `Penyesuaian spesifikasi sub-komponen teknis (${subDiffs.join(', ')}) dan penyesuaian harga satuan dari Rp ${matchInit.unitPrice.toLocaleString('id-ID')} menjadi Rp ${r.unitPrice.toLocaleString('id-ID')} (Delta: ${delta >= 0 ? '+' : ''}Rp ${delta.toLocaleString('id-ID')}).`;
        } else if (isPriceChanged && !isQtyChanged) {
          justif = `Penyesuaian harga satuan dari Rp ${matchInit.unitPrice.toLocaleString('id-ID')} menjadi Rp ${r.unitPrice.toLocaleString('id-ID')} (Delta: Rp ${(r.unitPrice - matchInit.unitPrice).toLocaleString('id-ID')}).`;
        } else if (isQtyChanged && !isPriceChanged) {
          justif = `Penyesuaian kuantitas/volume dari ${matchInit.qty} ${r.unit} menjadi ${r.qty} ${r.unit}.`;
        } else if (isQtyChanged && isPriceChanged) {
          justif = `Penyesuaian volume (${matchInit.qty} -> ${r.qty} ${r.unit}) dan harga satuan (Rp ${matchInit.unitPrice.toLocaleString('id-ID')} -> Rp ${r.unitPrice.toLocaleString('id-ID')}).`;
        }

        candidateJusfin.push({
          item: r.item,
          totalInitial: totInit,
          totalRevised: totRev,
          statedDelta: delta,
          justification: justif,
          isChanged: isQtyChanged || isPriceChanged || isTotalChanged || subDiffs.length > 0,
        });
      } else {
        // Item in Revised but NOT in Initial -> PEKERJAAN TAMBAH (Dari Tidak Ada ke Ada)
        const totRev = r.total !== undefined ? r.total : (r.qty * r.unitPrice);
        candidateJusfin.push({
          item: r.item,
          totalInitial: 0,
          totalRevised: totRev,
          statedDelta: totRev,
          justification: `Pekerjaan Tambah (Item Baru): Penambahan lingkup pekerjaan baru senilai Rp ${totRev.toLocaleString('id-ID')}.`,
          isChanged: true,
        });
      }
    }

    // Now check items in Initial that are NOT in Revised -> PEKERJAAN KURANG (Dari Ada ke Tidak Ada)
    for (const init of result.rabInitial) {
      const key = init.itemNo ? init.itemNo : init.item.toLowerCase();
      if (!processedInitItemNos.has(key)) {
        const totInit = init.total !== undefined ? init.total : (init.qty * init.unitPrice);
        candidateJusfin.push({
          item: init.item,
          totalInitial: totInit,
          totalRevised: 0,
          statedDelta: -totInit,
          justification: `Pekerjaan Kurang (Item Ditiadakan): Peniadaan lingkup pekerjaan semula senilai Rp ${totInit.toLocaleString('id-ID')}.`,
          isChanged: true,
        });
      }
    }

    const changedOnly = candidateJusfin.filter((c) => c.isChanged);
    const target = changedOnly.length > 0 ? changedOnly : candidateJusfin;

    result.jusFin = target.map((c, idx) => ({
      changeId: `CHG-${String(idx + 1).padStart(3, '0')}`,
      item: c.item,
      totalInitial: c.totalInitial,
      totalRevised: c.totalRevised,
      statedDelta: c.statedDelta,
      justification: c.justification,
    }));
  }

  // 8. Auto-synthesize JusTek if empty
  if (result.jusTek.length === 0 && (result.rabRevised.length > 0 || result.rabInitial.length > 0)) {
    const jusTekItems: Array<{
      item: string;
      baseline: string;
      proposed: string;
      cause: string;
      risk: string;
      benefit: string;
    }> = [];

    const processedInitKeys = new Set<string>();

    for (let revIdx = 0; revIdx < result.rabRevised.length; revIdx++) {
      const rev = result.rabRevised[revIdx];
      const init = matchRabItem(rev, result.rabInitial, revIdx);

      if (init) {
        if (init.itemNo) processedInitKeys.add(init.itemNo);
        else processedInitKeys.add(init.item.toLowerCase());

        const qtyDiff = Math.abs((rev.qty || 0) - (init.qty || 0)) > 0.0001;
        const priceDiff = Math.abs((rev.unitPrice || 0) - (init.unitPrice || 0)) > 0.01;

        if (qtyDiff || priceDiff) {
          let baseline = `Volume: ${init.qty} ${init.unit}, Harga Satuan: Rp ${init.unitPrice.toLocaleString('id-ID')}`;
          let proposed = `Volume: ${rev.qty} ${rev.unit}, Harga Satuan: Rp ${rev.unitPrice.toLocaleString('id-ID')}`;
          let cause = 'Penyesuaian kebutuhan riil teknis dan optimasi biaya pekerjaan di lapangan.';

          if (priceDiff && !qtyDiff) {
            cause = `Penyesuaian harga satuan seiring optimasi sub-komponen teknis dan efisiensi pelaksanaan.`;
          } else if (qtyDiff && !priceDiff) {
            cause = `Penyesuaian volume fisik berdasarkan hasil pengukuran mutual check awal (MC-0) / opname lapangan.`;
          }

          jusTekItems.push({
            item: rev.item,
            baseline,
            proposed,
            cause,
            risk: 'Deviasi teknis bila tidak disesuaikan dengan kondisi riil lapangan.',
            benefit: 'Kesesuaian administrasi kontrak dan ketepatan alokasi anggaran.',
          });
        }
      } else {
        jusTekItems.push({
          item: rev.item,
          baseline: `Tidak ada pada rincian RAB awal (0 ${rev.unit})`,
          proposed: `Pekerjaan Tambah: Volume ${rev.qty} ${rev.unit}, Harga Satuan Rp ${rev.unitPrice.toLocaleString('id-ID')}`,
          cause: 'Kebutuhan teknis lapangan penambahan item baru.',
          risk: 'Keterlambatan operasional bila item baru tidak disediakan.',
          benefit: 'Menyempurnakan fungsi sistem instalasi secara menyeluruh.',
        });
      }
    }

    // Check deleted items
    for (const init of result.rabInitial) {
      const key = init.itemNo ? init.itemNo : init.item.toLowerCase();
      if (!processedInitKeys.has(key)) {
        jusTekItems.push({
          item: init.item,
          baseline: `Tercantum pada rincian RAB awal: Volume ${init.qty} ${init.unit}, Harga Satuan Rp ${init.unitPrice.toLocaleString('id-ID')}`,
          proposed: 'Dihilangkan / ditiadakan dari lingkup pekerjaan revisi (0 unit)',
          cause: 'Optimalisasi ruang lingkup dan efisiensi anggaran proyek.',
          risk: 'Tidak ada risiko teknis; tertib administrasi karena lingkup tidak ditagihkan.',
          benefit: 'Efisiensi anggaran proyek.',
        });
      }
    }

    result.jusTek = jusTekItems.map((item, idx) => ({
      changeId: `CHG-${String(idx + 1).padStart(3, '0')}`,
      ...item,
    }));
  }

  return result;
}

