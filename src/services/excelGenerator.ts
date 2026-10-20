import * as XLSX from 'xlsx';
import { VerificationResult } from '../types';
import { formatRupiah, formatPercentage, formatQuantity } from './normalizer';

/**
 * Generates the professional 9-sheet PMO Audit Working Paper:
 * BAPL_Verification_Result_[ProjectCode].xlsx
 */
export function generateVerificationExcel(result: VerificationResult): Uint8Array {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: Dashboard
  // ==========================================
  const dashData: any[][] = [
    ['AUTOMATED BAPL VERIFICATION SYSTEM - PMO WORKING PAPER'],
    ['Generated at:', new Date(result.generated_at).toLocaleString('id-ID')],
    [],
    ['PROJECT IDENTITY & CONTRACT INFORMATION'],
    ['Project Name', result.project.projectName],
    ['Project Code', result.project.projectCode],
    ['Subproject', result.project.subproject],
    ['Location', result.project.location],
    ['Contractor', result.project.contractor],
    ['PO Number', result.project.poNumber],
    ['BAPL Number', result.project.baplNumber],
    ['BAPL Date', result.project.date],
    ['Revision', result.project.revision],
    ['Contract Package', result.project.packageContractInfo],
    ['Identity Match Status', result.project.identityMatchStatus],
    [],
    ['EXECUTIVE SUMMARY & KPI STATUS'],
    ['Metric', 'Value', 'Notes / Threshold Rule'],
    ['Total Change Items', result.summary.total_items, 'Jumlah seluruh item perubahan teridentifikasi'],
    ['Verified', result.summary.verified, 'Item terkonfirmasi konsisten antar dokumen'],
    ['Mismatch', result.summary.mismatch, 'Ditemukan perbedaan substansial dengan BAPL / RAB'],
    ['Need Support', result.summary.need_support, 'Membutuhkan dokumen pendukung (MCO, test report, cert)'],
    ['Review', result.summary.review, 'Perlu konfirmasi & evaluasi kewajaran oleh auditor PMO'],
    [],
    ['FINANCIAL RECAPITULATION & IMPACT AUDIT'],
    ['RAB Initial (Baseline)', formatRupiah(result.total_rab.rab_initial), 'Total nilai baseline proyek'],
    ['RAB Revised', formatRupiah(result.total_rab.rab_revised), 'Total nilai revisi proyek'],
    ['Calculated Financial Delta', formatRupiah(result.total_rab.system_calculated_delta), 'Selisih matematis (Revisi - Awal)'],
    ['Calculated Financial Delta %', formatPercentage(result.total_rab.system_calculated_percentage), 'Persentase selisih terhadap RAB Awal'],
    ['Stated JusFin Delta', formatRupiah(result.total_rab.stated_jusfin_delta), 'Nilai selisih yang dicantumkan pada JusFin'],
    ['JusFin Discrepancy Status', result.total_rab.status, result.total_rab.explanation],
    ['Financial Threshold', `${result.config.financial_threshold_percentage * 100}%`, 'Batas toleransi deviasi proposal'],
    ['Proposal Modification Status', result.total_rab.proposal_modification_required ? 'REQUIRED' : 'NOT REQUIRED', 'Berdasarkan ABS(Delta %) > 10%'],
    [],
    ['TECHNICAL CHANGE CATEGORY BREAKDOWN'],
    ['Category', 'Count'],
    ['Material Changes', result.technical_summary.material_changes],
    ['Dimension Changes', result.technical_summary.dimension_changes],
    ['Quantity Changes', result.technical_summary.quantity_changes],
    ['Scope Changes', result.technical_summary.scope_changes],
    ['Method Changes', result.technical_summary.method_changes],
    [],
    ['HUMAN AUDITOR PMO SIGN-OFF'],
    ['PMO Review Status', result.human_review.pmo_review_status],
    ['Auditor Name', result.human_review.reviewed_by],
    ['Audit Date', result.human_review.review_date],
    ['Final Decision', result.human_review.final_decision],
    ['Auditor Comments', result.human_review.pmo_comments],
  ];

  const wsDashboard = XLSX.utils.aoa_to_sheet(dashData);
  wsDashboard['!cols'] = [{ wch: 30 }, { wch: 45 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard');

  // ==========================================
  // SHEET 2: Verification Result
  // ==========================================
  const vrHeaders = [
    'Change ID',
    'Item Pekerjaan',
    'Parameter Perubahan',
    'Kategori Teknis',
    'Status Teknis',
    'Status Finansial',
    'Status Final',
    'Catatan / Rekomendasi PMO',
  ];
  const vrRows = result.changes.map((chg) => {
    const fin = result.financial_items.find((f) => f.change_id === chg.change_id);
    return [
      chg.change_id,
      chg.item,
      chg.parameter,
      chg.category,
      chg.technical_status,
      fin ? fin.financial_status : 'N/A',
      chg.final_status,
      chg.final_status === 'VERIFIED'
        ? 'Data konsisten dan terverifikasi di lapangan.'
        : chg.final_status === 'NEED SUPPORT'
        ? 'Perlu melampirkan dokumen pendukung resmi.'
        : 'Perlu review lebih lanjut oleh Project Manager.',
    ];
  });
  const wsVerificationResult = XLSX.utils.aoa_to_sheet([vrHeaders, ...vrRows]);
  wsVerificationResult['!cols'] = [
    { wch: 14 },
    { wch: 35 },
    { wch: 28 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsVerificationResult, 'Verification Result');

  // ==========================================
  // SHEET 3: Technical Verification
  // ==========================================
  const techHeaders = [
    'Change ID',
    'Item Pekerjaan',
    'Parameter',
    'Baseline (RAB Awal)',
    'BAPL Actual (Fisik Lapangan)',
    'JusTek Usulan',
    'Match?',
    'Evidence Found?',
    'Evidence Page',
    'Evidence Snippet',
    'OCR Conf.',
    'Matching Conf.',
    'Technical Status',
  ];
  const techRows = result.changes.map((c) => [
    c.change_id,
    c.item,
    c.parameter,
    c.baseline,
    c.actual_bapl,
    c.proposed,
    c.match ? 'YES' : 'NO',
    c.evidence_found ? 'FOUND' : 'NOT FOUND',
    c.evidence_page ? `Hal ${c.evidence_page}` : '-',
    c.evidence_snippet || '-',
    `${Math.round(c.ocr_confidence * 100)}%`,
    `${Math.round(c.matching_confidence * 100)}%`,
    c.technical_status,
  ]);
  const wsTech = XLSX.utils.aoa_to_sheet([techHeaders, ...techRows]);
  wsTech['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 25 },
    { wch: 35 },
    { wch: 45 },
    { wch: 40 },
    { wch: 10 },
    { wch: 16 },
    { wch: 14 },
    { wch: 50 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTech, 'Technical Verification');

  // ==========================================
  // SHEET 4: Financial Verification
  // ==========================================
  const finHeaders = [
    'Change ID',
    'Item Pekerjaan',
    'Unit',
    'Qty Initial',
    'Qty Revised',
    'Delta Qty',
    'Unit Price Initial',
    'Unit Price Revised',
    'Total Initial (Doc)',
    'Total Revised (Doc)',
    'Calculated Initial',
    'Calculated Revised',
    'Delta Value',
    'Delta %',
    'Threshold (>10%)',
    'JusFin Justification',
    'Calculation Status',
    'Financial Status',
  ];
  const finRows = result.financial_items.map((f) => [
    f.change_id,
    f.item,
    f.unit,
    formatQuantity(f.qty_initial),
    formatQuantity(f.qty_revised),
    formatQuantity(f.delta_qty),
    formatRupiah(f.unit_price_initial),
    formatRupiah(f.unit_price_revised),
    formatRupiah(f.total_initial),
    formatRupiah(f.total_revised),
    formatRupiah(f.calculated_initial),
    formatRupiah(f.calculated_revised),
    formatRupiah(f.delta_value),
    formatPercentage(f.delta_percentage),
    f.threshold_exceeded ? 'EXCEEDED' : 'WITHIN LIMIT',
    f.justification,
    f.calculation_status,
    f.financial_status,
  ]);
  const wsFin = XLSX.utils.aoa_to_sheet([finHeaders, ...finRows]);
  wsFin['!cols'] = [
    { wch: 12 },
    { wch: 35 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 45 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsFin, 'Financial Verification');

  // ==========================================
  // SHEET 5: Traceability
  // ==========================================
  const traceHeaders = [
    'Change ID',
    'Item Pekerjaan',
    'RAB Initial',
    'JusTek Claim',
    'BAPL Evidence',
    'RAB Revised',
    'JusFin Claim',
    'MCO / Supporting Doc',
    'Evidence Reference',
    'Technical Status',
    'Financial Status',
    'Final Status',
  ];
  const traceRows = result.traceability.map((t) => [
    t.change_id,
    t.item,
    t.rab_initial,
    t.justek_claim,
    t.bapl_evidence,
    t.rab_revised,
    t.jusfin_claim,
    t.mco_document,
    t.evidence_refs,
    t.technical_status,
    t.financial_status,
    t.final_status,
  ]);
  const wsTrace = XLSX.utils.aoa_to_sheet([traceHeaders, ...traceRows]);
  wsTrace['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 35 },
    { wch: 35 },
    { wch: 45 },
    { wch: 35 },
    { wch: 30 },
    { wch: 25 },
    { wch: 25 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTrace, 'Traceability');

  // ==========================================
  // SHEET 6: Evidence
  // ==========================================
  const evHeaders = [
    'Evidence ID',
    'Change ID',
    'Source',
    'Document Name',
    'Page',
    'Evidence Snippet / Raw Text',
    'Source Type',
    'Confidence',
    'Evidence Status',
  ];
  const evRows = result.evidences.map((e) => [
    e.evidence_id,
    e.change_id,
    e.source,
    e.document,
    `Hal ${e.page}`,
    e.snippet,
    e.source_type,
    `${Math.round(e.confidence * 100)}%`,
    e.evidence_status,
  ]);
  const wsEv = XLSX.utils.aoa_to_sheet([evHeaders, ...evRows]);
  wsEv['!cols'] = [
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 32 },
    { wch: 10 },
    { wch: 60 },
    { wch: 16 },
    { wch: 12 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsEv, 'Evidence');

  // ==========================================
  // SHEET 7: Exceptions
  // ==========================================
  const excHeaders = [
    'Priority',
    'Change ID',
    'Source Dokumen',
    'Temuan Audit (Finding)',
    'Expected (Ketentuan)',
    'Actual (Kondisi Nyata)',
    'Dampak Finansial / Teknis',
    'Rekomendasi Tindakan PMO',
    'Status Temuan',
  ];
  const excRows = result.exceptions.map((ex) => [
    ex.priority,
    ex.change_id,
    ex.source,
    ex.finding,
    ex.expected,
    ex.actual,
    ex.impact,
    ex.recommended_action,
    ex.status,
  ]);
  const wsExc = XLSX.utils.aoa_to_sheet([excHeaders, ...excRows]);
  wsExc['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 45 },
    { wch: 40 },
    { wch: 40 },
    { wch: 40 },
    { wch: 45 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsExc, 'Exceptions');

  // ==========================================
  // SHEET 8: Raw BAPL
  // ==========================================
  const rawHeaders = ['Page', 'Source Document', 'Extracted OCR / Native Text', 'OCR Confidence'];
  const rawRows = result.raw_bapl.map((r) => [
    `Halaman ${r.page}`,
    r.source,
    r.extracted_text,
    `${Math.round(r.ocr_confidence * 100)}%`,
  ]);
  const wsRaw = XLSX.utils.aoa_to_sheet([rawHeaders, ...rawRows]);
  wsRaw['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 80 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw BAPL');

  // ==========================================
  // SHEET 9: Config
  // ==========================================
  const cfgHeaders = ['Parameter Konfigurasi', 'Nilai Sistem', 'Keterangan'];
  const cfgRows = [
    ['financial_threshold_percentage', `${result.config.financial_threshold_percentage * 100}%`, 'Threshold deviasi perubahan nilai proposal modification'],
    ['quantity_tolerance', result.config.quantity_tolerance.toString(), 'Toleransi pembulatan kuantitas fisik'],
    ['money_tolerance', formatRupiah(result.config.money_tolerance), 'Toleransi selisih pembulatan rupiah'],
    ['pmo_organization', result.config.pmo_organization, 'Divisi / Unit Penjamin Mutu Proyek'],
    ['auto_flag_discrepancy', result.config.auto_flag_discrepancy ? 'TRUE' : 'FALSE', 'Flag otomatis jika JusFin != perhitungan matematis'],
    ['system_version', 'v2.6.0-enterprise', 'Automated BAPL Verification Engine'],
    ['project_code', result.project.projectCode, 'Kode referensi proyek utama'],
  ];
  const wsCfg = XLSX.utils.aoa_to_sheet([cfgHeaders, ...cfgRows]);
  wsCfg['!cols'] = [{ wch: 32 }, { wch: 25 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsCfg, 'Config');

  // Generate binary output buffer
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return out;
}

/**
 * Helper to download the generated workbook directly in browser
 */
export function downloadVerificationExcel(result: VerificationResult): void {
  const binary = generateVerificationExcel(result);
  const blob = new Blob([binary as any], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fileName = `BAPL_Verification_Result_${result.project.projectCode || 'PROJECT'}.xlsx`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
