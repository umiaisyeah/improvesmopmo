/**
 * Normalization Engine for Technical Terms & Indonesian Financial Numbers
 */

/**
 * Normalizes Indonesian and International numbers/currencies into pure JS float.
 * Handles:
 * - "Rp988.293.278" -> 988293278
 * - "Rp 988.293.278" -> 988293278
 * - "176,4" / "176.4" / "176,4000" -> 176.4
 * - "-Rp9.294.624" -> -9294624
 * - "-Rp1.022.408,58" -> -1022408.58
 * - "(9.294.624)" -> -9294624
 * - "-0,94047%" -> -0.0094047
 */
export function normalizeNumber(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') return isNaN(input) ? 0 : input;

  let str = input.toString().trim();
  if (!str) return 0;

  // Handle accounting negative parentheses "(123.456)"
  let isNegative = false;
  if (str.startsWith('(') && str.endsWith(')')) {
    isNegative = true;
    str = str.slice(1, -1).trim();
  } else if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1).trim();
  }

  // Remove currency prefixes, spaces, and percent signs
  const isPercent = str.includes('%');
  str = str.replace(/[RpRP$\s%]/g, '');

  // Distinguish Indonesian formatting ("1.000.000,50") vs US ("1,000,000.50")
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      // Indonesian format: dots are thousands, comma is decimal (e.g. "1.022.408,58")
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: commas are thousands, dot is decimal (e.g. "1,022,408.58")
      str = str.replace(/,/g, '');
    }
  } else if (hasComma && !hasDot) {
    // Check if comma is decimal (e.g., "176,4" or "176,4000")
    // If comma has 3 digits after it and it's an integer-like length (e.g. "1,000" vs "1,5"),
    // usually in Indonesia a single comma with 1 or 2 or 4 decimals is decimal:
    const parts = str.split(',');
    if (parts[1] && (parts[1].length !== 3 || parts[0].length <= 3)) {
      str = parts[0] + '.' + parts[1];
    } else if (parts[1] && parts[1].length === 3) {
      // Could be thousand separator "1,000" or 3 decimals "0,123"
      if (parts[0] === '0' || parts[0].length <= 2) {
        str = parts[0] + '.' + parts[1];
      } else {
        str = parts.join('');
      }
    }
  } else if (!hasComma && hasDot) {
    // Has dot, no comma. E.g. "988.293.278" (thousands) or "176.4" (decimal)
    const parts = str.split('.');
    if (parts.length > 2) {
      // Multiple dots -> definitely thousand separators: "988.293.278"
      str = parts.join('');
    } else if (parts.length === 2) {
      // Single dot. If followed by 3 digits and preceding is 1-3 digits, likely thousand separator:
      if (parts[1].length === 3 && parts[0].length >= 1 && parseInt(parts[0], 10) > 0 && !parts[1].endsWith('0')) {
        // e.g. "1.500" could be thousand or 1.500. Standard in Indonesian engineering:
        // usually 1.500 is thousand. But let's check magnitude:
        // if length of part 1 is not 3, it's decimal. E.g. "176.4" is decimal.
        // If length of part 1 is 3 and it's like "100.000", it's thousand.
        // If it's "176.4", decimal.
      }
    }
  }

  let num = parseFloat(str);
  if (isNaN(num)) return 0;
  if (isNegative) num = -num;
  if (isPercent) num = num / 100;

  return num;
}

/**
 * Normalizes technical strings into canonical comparison tokens.
 * E.g.:
 * - "2 x 35 mm" -> "COAXIAL_2X35_MM"
 * - "bulat" -> "ROUND"
 * - "galvanis" -> "GALVANIZED"
 */
export function normalizeTechnicalTerm(term: string): string {
  if (!term) return '';
  let clean = term.toLowerCase().trim();

  // Pipe size normalization
  clean = clean.replace(/1[\s,-]*5["”\s]*(?:inch|in)?/g, '1.5_INCH');
  clean = clean.replace(/2["”\s]*(?:inch|in)?/g, '2_INCH');
  clean = clean.replace(/2[\s,-]*5["”\s]*(?:inch|in)?/g, '2.5_INCH');
  clean = clean.replace(/3["”\s]*(?:inch|in)?/g, '3_INCH');
  clean = clean.replace(/4["”\s]*(?:inch|in)?/g, '4_INCH');
  clean = clean.replace(/5["”\s]*(?:inch|in)?/g, '5_INCH');

  // Cable normalization
  clean = clean.replace(/2\s*[x×*]\s*35\s*(?:mm2|mm²|mm)?/g, 'COAXIAL_2X35_MM');
  clean = clean.replace(/nya\s*70\s*(?:mm2|mm²|mm)?/g, 'NYA_70_MM');

  // Shape normalization
  clean = clean.replace(/\b(bulat|round|pipa bulat|cylindrical)\b/g, 'ROUND');
  clean = clean.replace(/\b(heksagonal|hexagonal|segi enam|segi 6)\b/g, 'HEXAGONAL');
  clean = clean.replace(/\b(oktagonal|octagonal|segi delapan)\b/g, 'OCTAGONAL');

  // Finish / Coating
  clean = clean.replace(/\b(galvanis|galvanized|galvanised|hot dip galvanis|hdg)\b/g, 'GALVANIZED');

  // Terminal tech
  clean = clean.replace(/\b(ese|early streamer emission)\b/g, 'ESE');
  clean = clean.replace(/\b(konvensional|conventional|franklin)\b/g, 'CONVENTIONAL');

  return clean.toUpperCase().replace(/\s+/g, '_');
}

/**
 * Formats a number to Indonesian Rupiah currency string.
 * E.g. 988293278 -> "Rp 988.293.278"
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(abs);

  return `${isNegative ? '-' : ''}Rp ${formatted}`;
}

/**
 * Formats a decimal to percentage string.
 * E.g. -0.0094047 -> "-0,9405%"
 */
export function formatPercentage(val: number | null | undefined, decimals = 4): string {
  if (val === null || val === undefined || isNaN(val)) return '0,00%';
  const pct = val * 100;
  return pct.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }) + '%';
}

/**
 * Formats quantity with appropriate decimals.
 * E.g. 176.4 -> "176,4"
 */
export function formatQuantity(qty: number | null | undefined): string {
  if (qty === null || qty === undefined || isNaN(qty)) return '0';
  return qty.toLocaleString('id-ID', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
}

/**
 * Detects whether a row/item is merely a section/category header or a non-substantive title
 * in Indonesian engineering/procurement BOQ and RAB spreadsheets (e.g. "Supply Material", "Jasa", "Pekerjaan Persiapan").
 * Such headers must NEVER be treated as work items or change items.
 */
export function isCategoryHeaderOrNonItem(
  itemName: string | null | undefined,
  baseline?: string | null,
  proposed?: string | null,
  qty?: number | null,
  unitPrice?: number | null,
  total?: number | null
): boolean {
  if (!itemName) return true;
  const raw = String(itemName).trim();
  if (!raw || raw === '-' || raw === 'null' || raw === 'undefined') return true;

  // Clean string: lower case, strip numbering prefixes like "I. ", "1. ", "A. "
  const strippedPrefix = raw.replace(/^(?:[ivxlcdm]+|[a-z0-9]+)[\.\)\-\:\s]+/i, '').trim();
  const lower = raw.toLowerCase().replace(/[\s_\-():/.,[\]]/g, ' ').trim();
  const lowerStripped = strippedPrefix.toLowerCase().replace(/[\s_\-():/.,[\]]/g, ' ').trim();

  // 1. Known generic section / category headers in Indonesian engineering & procurement BOQ/RAB
  const genericHeaders = [
    'persiapan',
    'pekerjaan persiapan',
    'tahap persiapan',
    'pendahuluan',
    'pekerjaan pendahuluan',
    'tahap pendahuluan',
    'umum',
    'pekerjaan umum',
    'pekerjaan utama',
    'pekerjaan akhir',
    'pekerjaan penutup',
    'supply material',
    'supply and material',
    'supply and delivery',
    'supply delivery',
    'pengadaan material',
    'pengadaan barang',
    'material supply',
    'pekerjaan material',
    'material',
    'jasa',
    'pekerjaan jasa',
    'jasa pekerjaan',
    'jasa instalasi',
    'jasa konstruksi',
    'jasa pelaksanaan',
    'jasa pengujian',
    'jasa dan instalasi',
    'testing & commissioning',
    'testing and commissioning',
    'testing commissioning',
    'testing & commisioning',
    'tes & komisioning',
    'pengujian & komisioning',
    'komisioning',
    'commissioning',
    'services',
    'service',
    'installation',
    'jasa sipil',
    'sipil',
    'pekerjaan sipil',
    'pekerjaan arsitektur',
    'arsitektur',
    'pekerjaan mekanikal',
    'mekanikal',
    'pekerjaan elektrikal',
    'elektrikal',
    'pekerjaan struktur',
    'struktur',
    'pekerjaan instrumentasi',
    'instrumentasi',
    'pekerjaan plumbing',
    'plumbing',
    'pekerjaan pemipaan',
    'pekerjaan pembongkaran',
    'pembongkaran',
    'pekerjaan finishing',
    'finishing',
    'pekerjaan lain-lain',
    'pekerjaan lain lain',
    'lain-lain',
    'lain lain',
    'site survey',
    'survey',
    'survey lapangan',
    'survey lokasi',
    'joint survey',
    'survey bersama',
    'hasil survey',
    'peninjauan lapangan',
    'inspeksi lapangan',
    'preliminary survey',
    'pre-construction survey',
    'pengukuran lapangan',
    'pekerjaan tambah',
    'pekerjaan kurang',
    'pekerjaan tambah kurang',
    'k3',
    'k3l',
    'smkk',
    'manajemen k3',
    'keselamatan kerja',
    'lingkup pekerjaan',
    'scope of work',
    'uraian pekerjaan',
    'item pekerjaan',
    'nama barang',
    'deskripsi pekerjaan',
    'daftar kuantitas',
    'daftar kuantitas dan harga',
    'bill of quantity',
    'bill of quantities',
    'boq',
    'rincian biaya',
    'rincian pekerjaan',
    'rekapitulasi perubahan',
    'rincian perubahan',
    'subtotal',
    'sub total',
    'total sub',
    'total sub + ppn',
    'total sub + ppn 11%',
    'total sub + ppn 11 %',
    'total sub + ppn 10%',
    'total sub + ppn 12%',
    'total',
    'grand total',
    'jumlah total',
    'jumlah',
    'rekapitulasi',
    'rekap',
    'ppn',
    'ppn 11%',
    'ppn 11 %',
    'ppn 10%',
    'ppn 12%',
    'pajak',
    'total biaya',
    'biaya langsung',
    'biaya tidak langsung',
    'logo',
    'logo instansi',
    'kop surat',
    'identitas proyek',
    'informasi proyek',
    'data umum proyek',
    'catatan',
    'catatan khusus',
    'catatan tambahan',
    'keterangan tambahan',
    'kesimpulan',
    'rekomendasi',
    'summary',
  ];

  // 1. Check if string is a summary/total/ppn row (e.g. "Total Sub + PPN 11%", "Total Sub", "PPN 11%", "Jumlah Total", "Rekapitulasi", "Total Program 7", "Jumlah Program ke 7")
  const isSummaryRow =
    /^(?:total\s*sub|sub\s*total|subtotal|grand\s*total|total\s*akhir|total\s*rab|jumlah\s*total|total\s*keseluruhan|jumlah\s*keseluruhan|total\s*biaya|total\s*harga|jumlah\s*harga|jumlah\s*biaya|jumlah\s*akhir|jumlah\s*rab|ppn\s*\d*%?|total\s*sub\s*\+\s*ppn|total\s*setelah\s*ppn|total\s*include\s*ppn|total\s*termasuk\s*ppn|rekapitulasi|rekap\s*biaya|jumlah\s*seksi|total\s*seksi|jumlah\s*bagian|total\s*bagian|total\s*program|jumlah\s*program|subtotal\s*program|total\s*kegiatan|jumlah\s*kegiatan|total\s*paket|jumlah\s*paket|total\s*divisi|jumlah\s*divisi|total\s*bab|jumlah\s*bab)\b/i.test(raw) ||
    /^(?:total\s*sub|sub\s*total|subtotal|grand\s*total|total\s*akhir|total\s*rab|jumlah\s*total|total\s*keseluruhan|jumlah\s*keseluruhan|total\s*biaya|total\s*harga|jumlah\s*harga|jumlah\s*biaya|jumlah\s*akhir|jumlah\s*rab|ppn\s*\d*%?|total\s*sub\s*\+\s*ppn|total\s*setelah\s*ppn|total\s*include\s*ppn|total\s*termasuk\s*ppn|rekapitulasi|rekap\s*biaya|jumlah\s*seksi|total\s*seksi|jumlah\s*bagian|total\s*bagian|total\s*program|jumlah\s*program|subtotal\s*program|total\s*kegiatan|jumlah\s*kegiatan|total\s*paket|jumlah\s*paket|total\s*divisi|jumlah\s*divisi|total\s*bab|jumlah\s*bab)\b/i.test(strippedPrefix) ||
    /^(?:total|jumlah|subtotal|sub\s*total)\s*(?:sub\s*)?(?:program|kegiatan|paket|seksi|bagian|divisi|bab|lingkup|pekerjaan)?\s*(?:ke\s*[-–—]?)?[0-9a-zivx]*/i.test(raw) ||
    /^(?:total|jumlah|subtotal|sub\s*total)\s*(?:sub\s*)?(?:program|kegiatan|paket|seksi|bagian|divisi|bab|lingkup|pekerjaan)?\s*(?:ke\s*[-–—]?)?[0-9a-zivx]*/i.test(strippedPrefix) ||
    /^(?:total|jumlah|subtotal|grand\s*total|sub\s*total)\s*(?:\(rp\)|rp)?$/i.test(lower) ||
    /^(?:total|jumlah|subtotal|grand\s*total|sub\s*total)\s*(?:\(rp\)|rp)?$/i.test(lowerStripped) ||
    /^(?:total|jumlah)\s*(?:pekerjaan|proyek|kontrak|biaya|rab|harga|sub|seksi|bagian|fisik)?$/i.test(lower) ||
    /^(?:total|jumlah)\s*(?:pekerjaan|proyek|kontrak|biaya|rab|harga|sub|seksi|bagian|fisik)?$/i.test(lowerStripped) ||
    (lower.startsWith('total') && (lower.includes('ppn') || lower.includes('pajak') || lower.includes('kontrak') || lower.includes('keseluruhan') || lower.includes('biaya') || lower.includes('program') || lower.includes('kegiatan'))) ||
    (lower.startsWith('jumlah') && (lower.includes('ppn') || lower.includes('pajak') || lower.includes('kontrak') || lower.includes('keseluruhan') || lower.includes('biaya') || lower.includes('program') || lower.includes('kegiatan')));

  if (isSummaryRow) {
    return true;
  }

  // 2. Signature / Approval Blocks and Footer Roles (must always be filtered out)
  const signaturePatterns = [
    /\b(?:dibuat|diperiksa|disetujui|disahkan|disiapkan|diverifikasi|diketahui|diajukan|disepakati)\s*(?:oleh|pada|tgl|tanggal)?\b/i,
    /\b(?:mengetahui|menyetujui|yang menyerahkan|yang menerima|pihak\s*(?:pertama|kedua|ke\s*[12]))\b/i,
    /\b(?:tanda\s*tangan|ttd|nama\s*terang|nama\s*pejabat|nama\s*lengkap|jabatan|stempel)\b/i,
    /\b(?:kontraktor\s*pelaksana|konsultan\s*pengawas|pejabat\s*pembuat\s*komitmen|direksi\s*pekerjaan)\b/i,
    /\b(?:project\s*manager|site\s*manager|site\s*engineer|quality\s*control|hse\s*officer)\b/i,
    /\b(?:demikian\s*berita\s*acara|demikian\s*justifikasi|halaman\s*[0-9]+\s*dari)\b/i,
    /^(?:logo|logo:)\b/i,
    /^(?:hasil\s*survey|telah\s*dilakukan\s*survey|pelaksanaan\s*survey|kegiatan\s*survey|site\s*survey|joint\s*survey|peninjauan\s*lapangan)\b/i,
    /\b(?:site\s*survey|joint\s*survey|survey\s*lapangan|survey\s*lokasi|peninjauan\s*lapangan|pre-?\s*construction\s*survey|preliminary\s*survey)\b/i,
  ];

  for (const pattern of signaturePatterns) {
    if (pattern.test(raw) || pattern.test(strippedPrefix)) {
      return true;
    }
  }

  // 3. Known generic category/section headers: if text matches generic header, it is a section header,
  // NOT a standalone item, unless it has explicit individual unit price and non-zero quantity.
  const isGenericSectionTitle = genericHeaders.some((gh) => lower === gh || lowerStripped === gh);
  if (isGenericSectionTitle) {
    const hasExplicitIndividualPricing = Boolean(
      unitPrice !== null && unitPrice !== undefined && unitPrice > 0 &&
      qty !== null && qty !== undefined && qty > 0
    );
    if (!hasExplicitIndividualPricing) {
      return true;
    }
  }

  // 4. Pure Roman numeral or single section letter: e.g. "I", "II", "III", "IV", "V", "A", "B", "C"
  if (/^(?:[ivxlcdm]+|[a-z])[\.\)]?$/i.test(raw)) {
    return true;
  }

  // 5. Program, Section, Division, Chapter, Activity Grouping Headers:
  // e.g. "PROGRAM 7", "PROGRAM KE-7", "PROGRAM KE 7", "PROGRAM VII", "KEGIATAN 7", "SUB PROGRAM 7", "PAKET 7", "DIVISI 7", "BAB VII"
  const isProgramOrSectionHeader =
    /^(?:program|sub\s*program|kegiatan|sub\s*kegiatan|paket|sub\s*paket|divisi|division|seksi|section|bab|bagian|kelompok|kategori)\s*(?:ke\s*[-–—]?)?[0-9a-zivx]+/i.test(raw) ||
    /^(?:program|sub\s*program|kegiatan|sub\s*kegiatan|paket|sub\s*paket|divisi|division|seksi|section|bab|bagian|kelompok|kategori)\s*(?:ke\s*[-–—]?)?[0-9a-zivx]+/i.test(strippedPrefix) ||
    /^(?:[0-9a-zivx]+[\.\)\-\:\s]+)(?:program|sub\s*program|kegiatan|sub\s*kegiatan|paket)\b/i.test(raw);

  if (isProgramOrSectionHeader) {
    // If it's a program/section grouping header, even if it contains an aggregated subtotal in the row,
    // it is a category header, NOT an individual physical contract line item!
    const hasExplicitIndividualUnitAndQty = Boolean(
      unitPrice !== null && unitPrice !== undefined && unitPrice > 0 &&
      qty !== null && qty !== undefined && qty > 0 &&
      unitPrice !== total
    );
    if (!hasExplicitIndividualUnitAndQty) {
      return true;
    }
  }

  // 6. CRITICAL FINANCIAL GUARD: If this row has real positive money (price > 0 or total > 0 or qty*price > 0),
  // it is a billable payable work item in the contract.
  const hasSubstantialFinancials = Boolean(
    (total !== null && total !== undefined && total > 0) ||
    (unitPrice !== null && unitPrice !== undefined && unitPrice > 0 && qty !== null && qty !== undefined && qty > 0)
  );

  if (hasSubstantialFinancials) {
    return false;
  }

  // 4. Non-substantive row: If both baseline and proposed indicate 0 or empty, or no physical work scope
  const isZeroOrEmptyFormat = (s?: string | null) => {
    if (!s) return true;
    const clean = s.trim().toLowerCase();
    return (
      clean === '-' ||
      clean === '' ||
      clean === '0' ||
      clean === '0 unit @ rp 0' ||
      clean === '0 unit @ rp 0 = rp 0' ||
      clean === '0 unit @ 0' ||
      clean === '0 @ 0' ||
      clean === '0 unit' ||
      clean.startsWith('0 unit @ rp 0')
    );
  };

  const isBaselineProvided = baseline !== undefined && baseline !== null;
  const isProposedProvided = proposed !== undefined && proposed !== null;

  if (isBaselineProvided || isProposedProvided) {
    const hasNoBaseline = isZeroOrEmptyFormat(baseline);
    const hasNoProposed = isZeroOrEmptyFormat(proposed);
    const hasNoCost =
      (qty === undefined || qty === null || qty === 0) &&
      (unitPrice === undefined || unitPrice === null || unitPrice === 0) &&
      (total === undefined || total === null || total === 0);

    if (hasNoBaseline && hasNoProposed && (hasNoCost || isZeroOrEmptyFormat(baseline))) {
      return true;
    }
  }

  // If cost is explicitly 0 on all sides and item has no specific equipment/model name
  if (
    (qty === 0 || qty === null || qty === undefined) &&
    (unitPrice === 0 || unitPrice === null || unitPrice === undefined) &&
    (total === 0 || total === null || total === undefined) &&
    (isZeroOrEmptyFormat(baseline) && isZeroOrEmptyFormat(proposed))
  ) {
    return true;
  }

  return false;
}
