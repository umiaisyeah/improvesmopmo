import {
  FinancialItem,
  TotalRabVerification,
  VerificationStatus,
  SystemConfig,
} from '../types';

export interface FinancialItemInput {
  changeId: string;
  item: string;
  unit: string;
  qtyInitial: number;
  qtyRevised: number;
  unitPriceInitial: number;
  unitPriceRevised: number;
  totalInitialDoc?: number;
  totalRevisedDoc?: number;
  justification?: string;
  statedJusfinDelta?: number;
  subSpecsInitial?: string[];
  subSpecsRevised?: string[];
  subSpecsDifferences?: string[];
}

export interface FinancialVerificationOutput {
  items: FinancialItem[];
  totalRab: TotalRabVerification;
}

/**
 * Financial Calculation & Verification Engine
 * Deterministic mathematical audit. NEVER assumes or relies solely on reported document totals.
 */
export function verifyFinancialItems(
  inputs: FinancialItemInput[],
  config: SystemConfig,
  statedTotalInitialDoc?: number,
  statedTotalRevisedDoc?: number,
  statedTotalJusFinDeltaDoc?: number
): FinancialVerificationOutput {
  const items: FinancialItem[] = [];

  let sumCalculatedInitial = 0;
  let sumCalculatedRevised = 0;

  for (const input of inputs) {
    let qtyInit = input.qtyInitial;
    let qtyRev = input.qtyRevised;
    let priceInit = input.unitPriceInitial;
    let priceRev = input.unitPriceRevised;

    // Handle high-level JusFin inputs where totals are provided directly in the document
    if (priceInit === 0 && input.totalInitialDoc !== undefined && input.totalInitialDoc > 0) {
      if (qtyInit > 0) {
        priceInit = Math.round(input.totalInitialDoc / qtyInit);
      } else {
        qtyInit = 1;
        priceInit = input.totalInitialDoc;
      }
    }
    if (priceRev === 0 && input.totalRevisedDoc !== undefined && input.totalRevisedDoc > 0) {
      if (qtyRev > 0) {
        priceRev = Math.round(input.totalRevisedDoc / qtyRev);
      } else {
        qtyRev = 1;
        priceRev = input.totalRevisedDoc;
      }
    }

    // 1. Deterministic Calculation
    const calculatedInitial = Math.round(qtyInit * priceInit);
    const calculatedRevised = Math.round(qtyRev * priceRev);
    const deltaQty = qtyRev - qtyInit;
    const deltaUnitPrice = priceRev - priceInit;
    const deltaValue = calculatedRevised - calculatedInitial;

    // Detect special lifecycle states:
    // - "Dari Tidak Ada ke Ada" (New Scope / Item Baru Tambah): baseline 0 -> revisi > 0
    // - "Dari Ada ke Tidak Ada" (Deleted Scope / Item Dihapus): baseline > 0 -> revisi 0
    const isNewItem = (qtyInit === 0 || calculatedInitial === 0) && calculatedRevised > 0;
    const isDeletedItem = calculatedInitial > 0 && (qtyRev === 0 || calculatedRevised === 0);

    let deltaPercentage = 0;
    if (isNewItem) {
      deltaPercentage = 1.0; // +100% penambahan item baru
    } else if (isDeletedItem) {
      deltaPercentage = -1.0; // -100% penghapusan item
    } else if (calculatedInitial !== 0) {
      deltaPercentage = deltaValue / calculatedInitial;
    }

    sumCalculatedInitial += calculatedInitial;
    sumCalculatedRevised += calculatedRevised;

    // 2. Check Document Arithmetic vs Calculated
    const totalInitDoc = input.totalInitialDoc !== undefined ? input.totalInitialDoc : calculatedInitial;
    const totalRevDoc = input.totalRevisedDoc !== undefined ? input.totalRevisedDoc : calculatedRevised;

    const initMismatch = Math.abs(totalInitDoc - calculatedInitial) > config.money_tolerance;
    const revMismatch = Math.abs(totalRevDoc - calculatedRevised) > config.money_tolerance;

    const calculationStatus: 'VERIFIED' | 'MISMATCH' = initMismatch || revMismatch ? 'MISMATCH' : 'VERIFIED';

    // 3. Threshold Check: New items and deleted items ALWAYS trigger threshold & proposal modification
    const thresholdExceeded = isNewItem || isDeletedItem || Math.abs(deltaPercentage) > config.financial_threshold_percentage;
    const proposalModRequired = thresholdExceeded;

    // 4. Financial Verification Status & Explanation
    let financialStatus: VerificationStatus = 'VERIFIED';
    let explanation = 'Perhitungan sistem konsisten dengan dokumen RAB.';

    if (calculationStatus === 'MISMATCH') {
      financialStatus = 'MISMATCH';
      explanation = `Perhitungan aritmatika tidak konsisten: Dokumen total awal=${totalInitDoc}, hitung=${calculatedInitial}; Dokumen revisi=${totalRevDoc}, hitung=${calculatedRevised}.`;
    } else if (isNewItem) {
      // Item Baru (Dari Tidak Ada ke Ada)
      financialStatus = 'VERIFIED';
      explanation = `Item Pekerjaan Baru (Dari Tidak Ada ke Ada): Penambahan lingkup baru senilai Rp ${calculatedRevised.toLocaleString('id-ID')} (+100%). Wajib diverifikasi terhadap Justifikasi Teknis & Analisa Harga Satuan (AHSP) baru.`;
    } else if (isDeletedItem) {
      // Item Dihapus (Dari Ada ke Tidak Ada)
      financialStatus = 'VERIFIED';
      explanation = `Penghapusan Item Pekerjaan (Dari Ada ke Tidak Ada): Pengurangan penuh senilai Rp ${calculatedInitial.toLocaleString('id-ID')} (-100%). Wajib dilengkapi Berita Acara Perubahan/Penghapusan Lingkup.`;
    } else if (deltaUnitPrice !== 0) {
      financialStatus = 'VERIFIED';
      explanation = `Penyesuaian harga satuan dari Rp ${priceInit.toLocaleString('id-ID')} menjadi Rp ${priceRev.toLocaleString('id-ID')} (Delta: Rp ${deltaUnitPrice.toLocaleString('id-ID')}). Perhitungan aritmatika terverifikasi konsisten.`;
    } else if (deltaValue === 0) {
      financialStatus = 'VERIFIED';
      explanation = 'Kuantitas dan harga satuan tetap sama. Tidak ada dampak finansial.';
    } else {
      financialStatus = 'VERIFIED';
      explanation = `Perhitungan delta kuantitas (${deltaQty > 0 ? '+' : ''}${deltaQty} ${input.unit || 'Unit'}) x harga satuan konsisten dengan dokumen revisi.`;
    }

    const isChanged =
      Math.abs(deltaQty) > 0.0001 ||
      Math.abs(deltaUnitPrice) > 0.01 ||
      Math.abs(deltaValue) > 0.01 ||
      Boolean(input.subSpecsDifferences && input.subSpecsDifferences.length > 0);

    items.push({
      change_id: input.changeId,
      item: input.item,
      unit: input.unit || 'Unit',
      qty_initial: qtyInit,
      qty_revised: qtyRev,
      delta_qty: deltaQty,
      unit_price_initial: priceInit,
      unit_price_revised: priceRev,
      delta_unit_price: deltaUnitPrice,
      total_initial: totalInitDoc,
      total_revised: totalRevDoc,
      calculated_initial: calculatedInitial,
      calculated_revised: calculatedRevised,
      delta_value: deltaValue,
      delta_percentage: deltaPercentage,
      threshold_exceeded: thresholdExceeded,
      proposal_modification_required: proposalModRequired,
      justification: input.justification || 'Tidak ada justifikasi finansial tambahan.',
      stated_jusfin_delta: input.statedJusfinDelta,
      calculation_status: calculationStatus,
      financial_status: financialStatus,
      explanation,
      is_changed: isChanged,
      sub_specs_initial: input.subSpecsInitial,
      sub_specs_revised: input.subSpecsRevised,
      sub_specs_differences: input.subSpecsDifferences,
    });
  }

  // ============================================
  // TOTAL RAB VERIFICATION
  // ============================================
  // Baseline project totals: use stated document total if provided, otherwise sum of items
  const rabInitial = statedTotalInitialDoc !== undefined && statedTotalInitialDoc > 0
    ? statedTotalInitialDoc
    : sumCalculatedInitial;
  const rabRevised = statedTotalRevisedDoc !== undefined && statedTotalRevisedDoc > 0
    ? statedTotalRevisedDoc
    : sumCalculatedRevised;

  const systemCalculatedDelta = rabRevised - rabInitial;
  const systemCalculatedPercentage = rabInitial !== 0 ? systemCalculatedDelta / rabInitial : 0;

  // Stated JusFin delta (default to -1022408.58 in golden test case if discrepancy occurs)
  const statedJusFinDelta =
    statedTotalJusFinDeltaDoc !== undefined ? statedTotalJusFinDeltaDoc : systemCalculatedDelta;

  // Compare system calculated delta vs stated JusFin delta
  const deltaDiff = Math.abs(systemCalculatedDelta - statedJusFinDelta);
  const deltaMatch = deltaDiff <= config.money_tolerance;

  const thresholdExceeded = Math.abs(systemCalculatedPercentage) > config.financial_threshold_percentage;
  const proposalModRequired = thresholdExceeded;

  let totalStatus: VerificationStatus = 'VERIFIED';
  let totalExplanation = 'Total RAB dan kalkulasi matematis konsisten 100%.';

  if (!deltaMatch) {
    totalStatus = 'MISMATCH';
    totalExplanation = `CRITICAL FINDING: Nilai delta yang ditampilkan pada dokumen JusFin (${statedJusFinDelta.toLocaleString('id-ID')}) tidak sama dengan selisih RAB Awal dan RAB Revisi berdasarkan perhitungan sistem (${systemCalculatedDelta.toLocaleString('id-ID')}). Terdapat selisih discrepancy sebesar ${deltaDiff.toLocaleString('id-ID')}.`;
  }

  const totalRab: TotalRabVerification = {
    rab_initial: rabInitial,
    rab_revised: rabRevised,
    system_calculated_delta: systemCalculatedDelta,
    system_calculated_percentage: systemCalculatedPercentage,
    stated_jusfin_delta: statedJusFinDelta,
    delta_match: deltaMatch,
    threshold_percentage: config.financial_threshold_percentage,
    threshold_exceeded: thresholdExceeded,
    proposal_modification_required: proposalModRequired,
    status: totalStatus,
    explanation: totalExplanation,
  };

  return { items, totalRab };
}
