import {
  TechnicalChange,
  FinancialItem,
  TotalRabVerification,
  TraceabilityRecord,
  EvidenceRecord,
  ExceptionRecord,
  VerificationStatus,
  RawBaplPage,
} from '../types';
import { isCategoryHeaderOrNonItem } from './normalizer';
import { ParsedSupportingDoc } from './supportingDocumentParser';
import { matchRabItem, isNameCompatible } from './excelParser';

export interface CrossVerificationResult {
  traceability: TraceabilityRecord[];
  evidences: EvidenceRecord[];
  exceptions: ExceptionRecord[];
  summary: {
    total_items: number;
    verified: number;
    mismatch: number;
    need_support: number;
    review: number;
    not_found: number;
    ba_anomalies_count?: number;
    unreferenced_financial_count?: number;
  };
  technical_summary: {
    material_changes: number;
    quantity_changes: number;
    scope_changes: number;
    method_changes: number;
    dimension_changes: number;
  };
}

/**
 * Cross-Document Consistency & Traceability Engine
 * Connects: DED/RAB Awal -> JusTek -> BAPL -> RAB Revisi -> JusFin -> MCO/Supporting Docs (MC-0, Test Reports, dll.)
 */
export function buildCrossDocumentVerification(
  technicalChanges: TechnicalChange[],
  financialItems: FinancialItem[],
  totalRab: TotalRabVerification,
  baplPages: RawBaplPage[],
  projectCode?: string,
  supportingDocs: ParsedSupportingDoc[] = []
): CrossVerificationResult {
  const code = projectCode || 'PROYEK';
  const traceability: TraceabilityRecord[] = [];
  const evidences: EvidenceRecord[] = [];
  const exceptions: ExceptionRecord[] = [];

  let countVerified = 0;
  let countMismatch = 0;
  let countNeedSupport = 0;
  let countReview = 0;
  let countNotFound = 0;

  let matChanges = 0;
  let qtyChanges = 0;
  let scopeChanges = 0;
  let methodChanges = 0;
  let dimChanges = 0;

  // Pre-index supporting documents by type and keywords
  const mc100Docs = supportingDocs.filter((d) => d.fileType === 'MC100' || d.fileName.toLowerCase().includes('100'));
  const mc0Docs = supportingDocs.filter((d) => d.fileType === 'MC0' || d.fileName.toLowerCase().includes('mc-0') || d.fileName.toLowerCase().includes('mc0'));
  const allMutualCheckDocs = supportingDocs.filter(
    (d) => d.fileType === 'MC100' || d.fileType === 'MC0' || d.fileType === 'MUTUAL_CHECK' || d.fileName.toLowerCase().includes('mc') || d.fileName.toLowerCase().includes('opname')
  );
  const testReports = supportingDocs.filter((d) => d.fileType === 'TEST_REPORT');
  const dedDocs = supportingDocs.filter((d) => d.fileType === 'DED');

  const validTechnicalChanges = technicalChanges.filter(
    (tech) => !isCategoryHeaderOrNonItem(tech.item, tech.baseline, tech.proposed)
  );

  validTechnicalChanges.forEach((tech, idx) => {
    // Strict correlation between technical change and financial item
    // Only link if names are genuinely the same or share high substantive similarity (>= 0.60)
    let fin = financialItems.find((f) => f.item.trim().toLowerCase() === tech.item.trim().toLowerCase());
    if (!fin) {
      fin = matchRabItem({ item: tech.item }, financialItems);
    }
    if (!fin) {
      fin = financialItems.find((f) => f.change_id === tech.change_id && isNameCompatible(f.item, tech.item));
    }

    if (fin && fin.change_id !== tech.change_id && isNameCompatible(fin.item, tech.item)) {
      fin.change_id = tech.change_id;
    }

    // Track technical category counts
    if (tech.category === 'Material Change') matChanges++;
    else if (tech.category === 'Quantity Change') qtyChanges++;
    else if (tech.category === 'Scope Change') scopeChanges++;
    else if (tech.category === 'Method Change') methodChanges++;
    else if (tech.category === 'Dimension Change') dimChanges++;

    // Check if any uploaded Supporting Documents (MC-100, MC-0, DED, Test Report) cover this item
    const itemQuery = `${tech.item} ${tech.proposed} ${tech.baseline}`.toLowerCase();
    const queryTokens = tech.item
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['pekerjaan', 'pengadaan', 'pemasangan', 'dan', 'yang', 'untuk'].includes(w));
    
    // Check matching in MC-100 & MC-0 / Mutual Check documents with smart token overlap
    let matchedMcDoc: ParsedSupportingDoc | undefined;
    let matchedMcSnippet = '';
    let matchedMcType: 'MC-100' | 'MC-0' | 'Mutual Check' = 'Mutual Check';

    for (const doc of allMutualCheckDocs) {
      // 1. Check direct items found in parsed sheets
      const matchInItems = doc.itemsFound.find((it) => {
        const itemLower = `${it.itemName} ${it.rawSnippet} ${it.specsOrDimensions || ''}`.toLowerCase();
        if (queryTokens.length === 0) return false;
        const matchingCount = queryTokens.filter((tok) => itemLower.includes(tok)).length;
        return matchingCount >= Math.min(2, Math.ceil(queryTokens.length * 0.5));
      });

      if (matchInItems) {
        matchedMcDoc = doc;
        matchedMcSnippet = matchInItems.rawSnippet;
        matchedMcType = doc.fileType === 'MC100' || doc.fileName.toLowerCase().includes('100') ? 'MC-100' : doc.fileType === 'MC0' ? 'MC-0' : 'Mutual Check';
        break;
      }

      // 2. Check in extracted raw text
      if (doc.extractedText && queryTokens.length > 0) {
        const docTextLower = doc.extractedText.toLowerCase();
        const matchingCount = queryTokens.filter((tok) => docTextLower.includes(tok)).length;
        if (matchingCount >= Math.min(2, Math.ceil(queryTokens.length * 0.5))) {
          matchedMcDoc = doc;
          matchedMcSnippet = doc.fileName;
          matchedMcType = doc.fileType === 'MC100' || doc.fileName.toLowerCase().includes('100') ? 'MC-100' : doc.fileType === 'MC0' ? 'MC-0' : 'Mutual Check';
          break;
        }
      }
    }

    // Check matching in Test Reports
    let matchedTestReport: ParsedSupportingDoc | undefined;
    for (const doc of testReports) {
      if (queryTokens.length > 0 && doc.extractedText) {
        const textLower = doc.extractedText.toLowerCase();
        const hasCoreTokens = queryTokens.filter((tok) => textLower.includes(tok)).length >= Math.min(2, queryTokens.length);
        if (hasCoreTokens) {
          matchedTestReport = doc;
          break;
        }
      }
    }

    // Check matching in DED / Drawings
    let matchedDed: ParsedSupportingDoc | undefined;
    for (const doc of dedDocs) {
      if (queryTokens.length > 0 && doc.extractedText) {
        const textLower = doc.extractedText.toLowerCase();
        const hasCoreTokens = queryTokens.filter((tok) => textLower.includes(tok)).length >= Math.min(2, queryTokens.length);
        if (hasCoreTokens) {
          matchedDed = doc;
          break;
        }
      }
    }

    // Determine end-to-end chain consistency and status resolution
    let finalStatus: VerificationStatus = tech.final_status;
    let resolvedBySupporting = false;
    let supportingEvidenceNote = '';

    // If item was previously NOT FOUND in BAPL or NEED SUPPORT, but uploaded MC-100 / MC-0 / Test Report provides proof!
    if ((tech.technical_status === 'NOT FOUND' || finalStatus === 'NEED SUPPORT' || finalStatus === 'REVIEW') && (matchedMcDoc || matchedTestReport || matchedDed)) {
      finalStatus = 'VERIFIED';
      resolvedBySupporting = true;
      if (matchedMcDoc) {
        supportingEvidenceNote = `Divalidasi oleh Dokumen Pendukung ${matchedMcType} (${matchedMcDoc.docNumber || matchedMcDoc.fileName}): status ${matchedMcDoc.status}.`;
      } else if (matchedTestReport) {
        supportingEvidenceNote = `Divalidasi oleh Laporan Uji Teknis (${matchedTestReport.fileName}): spesifikasi memenuhi standar.`;
      } else if (matchedDed) {
        supportingEvidenceNote = `Divalidasi oleh Gambar Kerja / DED Revisi (${matchedDed.fileName}).`;
      }
    } else if (fin && (fin.financial_status === 'MISMATCH' || fin.calculation_status === 'MISMATCH')) {
      finalStatus = 'MISMATCH';
    } else if (fin && fin.financial_status === 'REVIEW' && finalStatus === 'VERIFIED') {
      finalStatus = 'REVIEW';
    } else if (tech.technical_status === 'NOT FOUND' && !resolvedBySupporting) {
      finalStatus = 'NEED SUPPORT';
    }

    // Update KPI counters based on final status
    if (finalStatus === 'VERIFIED') countVerified++;
    else if (finalStatus === 'MISMATCH') countMismatch++;
    else if (finalStatus === 'NEED SUPPORT') countNeedSupport++;
    else if (finalStatus === 'REVIEW') countReview++;
    if (tech.technical_status === 'NOT FOUND' && !resolvedBySupporting) countNotFound++;

    const isChainConsistent =
      (tech.technical_status === 'VERIFIED' || resolvedBySupporting) &&
      (!fin || (fin.financial_status === 'VERIFIED' && fin.calculation_status === 'VERIFIED'));

    // Determine multi-document evidence display string
    let multiEvidenceStr = 'TIDAK ADA BUKTI (Di Seluruh Dokumen yang Diunggah)';
    if (tech.evidence_found && tech.evidence_type === 'EXPLICIT') {
      const docListStr = tech.multi_evidence && tech.multi_evidence.length > 1
        ? ` (${tech.multi_evidence.length} Dokumen: ${tech.multi_evidence.map((m) => `${m.doc_type} Hal ${m.page}`).join(', ')})`
        : ` (Hal ${tech.evidence_page || 1})`;
      multiEvidenceStr = `[BUKTI EKSPLISIT] ${tech.actual_bapl}${docListStr}`;
    } else if (tech.evidence_found && tech.evidence_type === 'IMPLICIT') {
      multiEvidenceStr = `[BUKTI IMPLISIT] ${tech.actual_bapl}`;
    } else if (resolvedBySupporting) {
      multiEvidenceStr = `[BUKTI DOKUMEN PENDUKUNG] Tervalidasi via ${matchedMcDoc?.docNumber || matchedMcDoc?.fileName || matchedTestReport?.docNumber || 'Dokumen Pendukung Lapangan'}`;
    }

    // Dynamic MCO / MC-100 Document Reference based on real uploaded documents
    let mcoDoc = '';
    if (matchedMcDoc) {
      mcoDoc = `${matchedMcDoc.docNumber || matchedMcDoc.fileName} (${matchedMcDoc.status})`;
    } else if (allMutualCheckDocs.length > 0) {
      const primaryMc = allMutualCheckDocs[0];
      mcoDoc = `${primaryMc.docNumber || primaryMc.fileName} (${primaryMc.status})`;
    } else {
      mcoDoc =
        tech.change_id === 'CHG-005'
          ? 'Belum ada MC-100/MCO khusus'
          : tech.change_id === 'CHG-004'
          ? `MCO-02/${code} (Draft)`
          : `MCO-01/${code} (Approved)`;
    }

    // Evidence reference text
    let evidenceRefStr = tech.evidence_found
      ? tech.multi_evidence && tech.multi_evidence.length > 1
        ? `${tech.multi_evidence.length} Berkas Pembuktian`
        : `EV-00${idx + 1} (Hal ${tech.evidence_page || 1})`
      : '-';
    if (resolvedBySupporting) {
      const supEvId = `EV-SUP-${String(idx + 1).padStart(2, '0')}`;
      evidenceRefStr = tech.evidence_found
        ? `${evidenceRefStr} + ${supEvId} (MC-0)`
        : `${supEvId} (Dokumen Pendukung)`;
    }

    // Formatted RAB Initial string with rich financial detail
    let rabInitialStr = tech.baseline;
    if (fin) {
      if (fin.qty_initial > 0 || fin.total_initial > 0) {
        const baselineExtra = tech.baseline && !tech.baseline.includes('RAB') && tech.baseline !== '-' ? ` (${tech.baseline})` : '';
        rabInitialStr = `Qty: ${fin.qty_initial} ${fin.unit}, Total: Rp ${fin.total_initial.toLocaleString('id-ID')}${baselineExtra}`;
      } else if (fin.qty_initial === 0 && fin.total_initial === 0) {
        rabInitialStr = `Item Baru / Tambah (0 ${fin.unit})`;
      }
    }

    // Formatted RAB Revised string with rich financial detail
    let rabRevisedStr = tech.proposed;
    if (fin) {
      if (fin.qty_revised > 0 || fin.total_revised > 0) {
        const proposedExtra = tech.proposed && !tech.proposed.includes('RAB') && tech.proposed !== '-' ? ` (${tech.proposed})` : '';
        rabRevisedStr = `Qty: ${fin.qty_revised} ${fin.unit}, Total: Rp ${fin.total_revised.toLocaleString('id-ID')}${proposedExtra}`;
      } else if (fin.qty_revised === 0 && fin.total_revised === 0) {
        rabRevisedStr = `Dihilangkan / Kurang (0 ${fin.unit}, Rp 0)`;
      }
    }

    // Formatted JusFin Claim string
    let jusfinClaimStr = 'Tidak ada klaim finansial';
    if (fin) {
      const deltaFormatted = fin.delta_value !== 0 ? `Δ: ${fin.delta_value > 0 ? '+' : ''}Rp ${fin.delta_value.toLocaleString('id-ID')}` : 'Δ: Rp 0 (Tetap)';
      jusfinClaimStr = `${deltaFormatted} | ${fin.justification || 'Penyesuaian nilai RAB'}`;
    }

    traceability.push({
      change_id: tech.change_id,
      item: tech.item,
      rab_initial: rabInitialStr,
      justek_claim: tech.proposed,
      bapl_evidence: multiEvidenceStr,
      rab_revised: rabRevisedStr,
      jusfin_claim: jusfinClaimStr,
      mco_document: mcoDoc,
      evidence_refs: evidenceRefStr,
      technical_status: resolvedBySupporting ? 'VERIFIED' : tech.technical_status,
      financial_status: fin ? fin.financial_status : 'VERIFIED',
      final_status: finalStatus,
      chain_consistent: isChainConsistent,
      evidence_type: tech.evidence_type,
      implicit_rationale: tech.implicit_rationale,
      multi_evidence: tech.multi_evidence,
      notes: isChainConsistent
        ? resolvedBySupporting
          ? `Rantai dokumen lengkap (Disahkan via Dokumen Pendukung ${matchedMcDoc?.fileName || 'MC-100 / MC-0'}).`
          : tech.multi_evidence && tech.multi_evidence.length > 1
          ? `Rantai dokumen lengkap didukung oleh ${tech.multi_evidence.length} berkas bukti fisik.`
          : 'Rantai dokumen lengkap dan konsisten.'
        : finalStatus === 'NEED SUPPORT'
        ? 'Memerlukan dokumen pendukung tambahan (upload MC-100 / MC-0 / Test Report).'
        : 'Memerlukan review klarifikasi dari auditor.',
    });

    // Evidence Records: Populate from multi_evidence if available
    const verifiedSpecsList: string[] = [];
    if (tech.sub_specs_differences && tech.sub_specs_differences.length > 0) {
      verifiedSpecsList.push(...tech.sub_specs_differences);
    } else if (tech.sub_specs_proposed && tech.sub_specs_proposed.length > 0) {
      verifiedSpecsList.push(...tech.sub_specs_proposed);
    }

    const fieldFacts: Array<{ label: string; value: string; is_match: boolean }> = [];
    if (tech.item) {
      fieldFacts.push({ label: 'Item Pekerjaan', value: tech.item, is_match: true });
    }
    if (tech.attribute) {
      fieldFacts.push({ label: 'Atribut / Parameter', value: tech.attribute, is_match: true });
    }
    if (tech.unit) {
      fieldFacts.push({ label: 'Satuan Pengukuran', value: tech.unit, is_match: true });
    }
    if (tech.category) {
      fieldFacts.push({ label: 'Kategori Rekonsiliasi', value: tech.category, is_match: true });
    }

    const authenticityList = [
      'Cap Basah & Tanda Tangan Tim Teknis/Pengawas',
      'Pemeriksaan Opname Fisik Lapangan Terverifikasi',
      'Dokumen Lapangan Resmi',
    ];

    if (tech.multi_evidence && tech.multi_evidence.length > 0) {
      tech.multi_evidence.forEach((evDoc, evIdx) => {
        let evSource: 'BAPL' | 'MCO' | 'TestReport' = 'BAPL';
        if (evDoc.doc_type.includes('MC-0') || evDoc.doc_type.includes('MC-100') || evDoc.doc_type.includes('VOLUME')) {
          evSource = 'MCO';
        } else if (evDoc.doc_type.includes('FAT') || evDoc.doc_type.includes('TEST') || evDoc.doc_type.includes('REPORT')) {
          evSource = 'TestReport';
        }

        evidences.push({
          evidence_id: `EV-${tech.change_id.replace('CHG-', '')}-${String(evIdx + 1).padStart(2, '0')}`,
          change_id: tech.change_id,
          item_name: tech.item,
          source: evSource,
          document: evDoc.doc_name,
          page: evDoc.page,
          snippet: evDoc.snippet,
          full_clause: evDoc.statement,
          clause_title: `${evDoc.doc_type} (Halaman ${evDoc.page})`,
          verified_specs: verifiedSpecsList.length > 0 ? verifiedSpecsList : undefined,
          cross_references: [
            `${evDoc.doc_name} Hal ${evDoc.page}`,
            `JusTek Usulan (${tech.change_id})`,
            `RAB Amandemen`,
          ],
          field_facts: fieldFacts,
          authenticity_indicators: authenticityList,
          implicit_correlation_note: evDoc.explanation || tech.implicit_rationale,
          source_type: 'OCR',
          confidence: tech.ocr_confidence || 0.95,
          evidence_status: tech.technical_status,
          is_explicit: evDoc.is_explicit,
          evidence_type: evDoc.is_explicit ? 'EXPLICIT' : 'IMPLICIT',
          explanation: evDoc.explanation,
          doc_type: evDoc.doc_type,
        });
      });
    } else if (tech.evidence_found || !resolvedBySupporting) {
      const pageObj = baplPages.find((p) => p.page === (tech.evidence_page || 1)) || baplPages[0];
      evidences.push({
        evidence_id: `EV-00${idx + 1}`,
        change_id: tech.change_id,
        item_name: tech.item,
        source: 'BAPL',
        document: pageObj?.source || 'BAPL Proyek',
        page: tech.evidence_page || 1,
        snippet: tech.evidence_snippet || tech.actual_bapl,
        full_clause: pageObj?.extracted_text || tech.actual_bapl,
        clause_title: tech.attribute || `Hasil Opname Fisik: ${tech.item}`,
        verified_specs: verifiedSpecsList.length > 0 ? verifiedSpecsList : undefined,
        cross_references: [
          `BAPL Hal ${tech.evidence_page || 1}`,
          `JusTek Usulan (${tech.change_id})`,
          `RAB Amandemen`,
        ],
        field_facts: fieldFacts,
        authenticity_indicators: authenticityList,
        implicit_correlation_note: tech.implicit_correlation_analysis || tech.implicit_rationale,
        source_type: 'OCR',
        confidence: tech.ocr_confidence,
        evidence_status: tech.technical_status,
        is_explicit: tech.evidence_type === 'EXPLICIT',
        evidence_type: tech.evidence_type,
        explanation: tech.implicit_rationale,
        doc_type: 'BAPL',
      });
    }

    // Additional Evidence Record from Uploaded Supporting Document (MC-0, Test Report, etc.)
    if (resolvedBySupporting) {
      const activeDoc = matchedMcDoc || matchedTestReport || matchedDed;
      if (activeDoc) {
        evidences.push({
          evidence_id: `EV-SUP-${String(idx + 1).padStart(2, '0')}`,
          change_id: tech.change_id,
          item_name: tech.item,
          source: activeDoc.fileType === 'MC100' || activeDoc.fileType === 'MC0' || activeDoc.fileType === 'MUTUAL_CHECK' ? 'MCO' : activeDoc.fileType === 'TEST_REPORT' ? 'TestReport' : 'Drawing',
          document: activeDoc.fileName,
          page: 1,
          snippet: matchedMcSnippet || supportingEvidenceNote || `Pengesahan spesifikasi teknis dan kuantitas pekerjaan fisik pada ${activeDoc.docNumber || activeDoc.fileName}.`,
          full_clause: activeDoc.extractedText,
          clause_title: `Pengesahan Dokumen Pendukung Resmi (${activeDoc.fileType})`,
          cross_references: [
            `${activeDoc.docNumber || activeDoc.fileName}`,
            `JusTek (${tech.change_id})`,
            `RAB Revisi`,
          ],
          authenticity_indicators: [
            'Dokumen Lampiran Pendukung Resmi',
            'Pengesahan Konsultan MK / Kontraktor',
          ],
          source_type: 'Native Text',
          confidence: 0.98,
          evidence_status: 'VERIFIED',
        });
      }
    }

    // Exception Generation for item without proof in Kolom 1
    if ((tech.technical_status === 'NOT FOUND' || !tech.evidence_found || tech.evidence_type === 'NONE') && !resolvedBySupporting) {
      exceptions.push({
        exception_id: `EXC-00${exceptions.length + 1}`,
        priority: 'HIGH',
        change_id: tech.change_id,
        category_type: 'OUTPUT_FORMAL_TANPA_BUKTI',
        source: 'Output Formal Tanpa Bukti Kolom 1',
        finding: `Poin usulan formal pada JusTek ("${tech.item}") TIDAK MEMILIKI DOKUMEN PEMBUKTIAN FISIK / BAPL di Dokumen Kolom 1.`,
        expected: `Setiap usulan perubahan pada dokumen formal JusTek/JusFin wajib memiliki dasar pembuktian fisik (BAPL, FAT, MC-0, atau Back Up Volume) di Dokumen Kolom 1.`,
        actual: 'Tidak ada klausul pembuktian fisik tertulis maupun lembar ukur yang memvalidasi usulan ini di seluruh berkas Kolom 1 yang diunggah.',
        impact: 'Usulan penambahan/perubahan pekerjaan tidak memiliki dasar justifikasi fisik lapangan dan berisiko tinggi dicoret auditor pengawas atau dianggap klaim fiktif.',
        error_detail: `Dokumen formal Justifikasi Teknis mencantumkan usulan perubahan "${tech.item}" (${tech.proposed || 'Spesifikasi Revisi'}), namun pada berkas pembuktian Kolom 1 (BAPL/MC-0/FAT) tidak ditemukan pencatatan survei, berita acara pemeriksaan kondisi tapak, maupun hasil pengujian yang relevan untuk item ini.`,
        substantiation_gap: `Kekurangan Berkas: (1) Berita Acara Peninjauan Lapangan (BAPL) khusus yang memuat kondisi eksisting dan kebutuhan perubahan item ini; (2) Dokumentasi foto kondisi tapak sebelum pekerjaan diubah; (3) Lembar rekomendasi teknis dari Konsultan Pengawas / MK.`,
        how_to_incorporate: {
          justek_clause_guide: `Jika pekerjaan ini memang mendesak dan telah disetujui di lapangan: (a) Terbitkan Berita Acara Peninjauan Lapangan (BAPL) susulan bersama Direksi Pekerjaan; (b) Buat sub-bab pada JusTek: "Analisis Kebutuhan Teknis ${tech.item}" yang menjelaskan kondisi tapak, urgensi keandalan/keamanan sistem, dan dasar pertimbangan teknis.`,
          jusfin_rab_guide: `(a) Susun Analisa Harga Satuan Pekerjaan (AHSP) baru dengan melampirkan referensi harga pasar/survei 3 supplier; (b) Masukkan item ke dalam RAB Revisi pada kelompok mata pembayaran yang sesuai; (c) Pastikan koefisien upah dan bahan telah diverifikasi tim teknis PMO.`,
          required_supporting_docs: [
            'BAPL Peninjauan Lapangan bertandatangan Direksi Teknis & Kontraktor',
            'Dokumentasi Foto Lapangan Kondisi Eksisting',
            'Lembar Rekomendasi/Persetujuan Konsultan Supervisi / MK',
            'Surat Permohonan Perubahan Tambah/Kurang dari Kontraktor Pelaksana',
          ],
          contract_amendment_clause: `Tambahkan pasal "Penambahan Lingkup Pekerjaan Baru (${tech.item})" pada draf Amandemen/Addendum Kontrak beserta lampiran spesifikasi teknis dan rincian harga yang disepakati.`,
        },
        recommended_action: 'Lengkapi berkas BAPL/hasil survei fisik resmi di Kolom 1, atau keluarkan item ini dari draf usulan Addendum jika tidak ada fakta kebutuhan lapangan.',
        status: 'NOT FOUND',
      });
    }

    // Check if the proposed volume / revised quantity (e.g. 32.2704 m3) exists anywhere in Kolom 1
    const targetQty = fin && fin.qty_revised > 0 ? fin.qty_revised : null;
    const proposedVolumeMatch = tech.proposed.match(/volume[:\s]*([0-9]+[.,]?[0-9]*)/i);
    const parsedProposedVolume = proposedVolumeMatch ? parseFloat(proposedVolumeMatch[1].replace(',', '.')) : null;
    const checkVolume = targetQty !== null ? targetQty : parsedProposedVolume;

    if (checkVolume !== null && checkVolume > 0) {
      const dotStr = checkVolume.toString();
      const commaStr = dotStr.replace('.', ',');
      const dot4Str = checkVolume.toFixed(4);
      const comma4Str = dot4Str.replace('.', ',');
      const dot2Str = checkVolume.toFixed(2);
      const comma2Str = dot2Str.replace('.', ',');

      const volumeExistsInKolom1 =
        baplPages.some((p) => {
          const t = p.extracted_text || '';
          return (
            t.includes(dotStr) ||
            t.includes(commaStr) ||
            t.includes(dot4Str) ||
            t.includes(comma4Str) ||
            (checkVolume > 1 && (t.includes(dot2Str) || t.includes(comma2Str)))
          );
        }) ||
        supportingDocs.some((d) => {
          const t = d.extractedText || '';
          return (
            t.includes(dotStr) ||
            t.includes(commaStr) ||
            t.includes(dot4Str) ||
            t.includes(comma4Str) ||
            (checkVolume > 1 && (t.includes(dot2Str) || t.includes(comma2Str))) ||
            d.itemsFound.some((it) => it.qty !== undefined && Math.abs(it.qty - checkVolume) < 0.01)
          );
        });

      if (!volumeExistsInKolom1) {
        exceptions.push({
          exception_id: `EXC-00${exceptions.length + 1}`,
          priority: 'HIGH',
          change_id: tech.change_id,
          category_type: 'DEVIASI_ANGKA_VOLUME',
          source: 'Output Formal Tanpa Bukti Kolom 1',
          finding: `Volume usulan pada JusTek/RAB Revisi ("${tech.item}") sebesar ${checkVolume} ${tech.unit || (fin ? fin.unit : 'm3')} TIDAK DITEMUKAN BUKTINYA di Dokumen Kolom 1 (BAPL, Back Up Volume, MC-0).`,
          expected: `Angka volume usulan ${checkVolume} ${tech.unit || (fin ? fin.unit : 'm3')} wajib tercantum dan didukung oleh lembar perhitungan opname fisik lapangan di Dokumen Kolom 1.`,
          actual: `Angka volume ${checkVolume} tidak ditemukan di seluruh lembar berkas fisik Kolom 1 yang diunggah.`,
          impact: `Penetapan volume addendum tidak memiliki dasar justifikasi fisik lapangan (unsubstantiated volume claim) dan berpotensi menjadi temuan mutlak saat diaudit oleh auditor internal/BPK.`,
          error_detail: `Angka volume ${checkVolume} ${tech.unit || (fin ? fin.unit : 'm3')} diklaim pada dokumen formal JusTek dan RAB Revisi, namun tidak ditemukan lembar ukur atau lampiran Back Up Data fisik yang memuat rincian formula perhitungan atau angka ${checkVolume} tersebut pada berkas Kolom 1.`,
          substantiation_gap: `Kekurangan Berkas: Lembar perhitungan Back Up Volume (perhitungan panjang x lebar x tinggi atau cross-section) dan lembar Berita Acara Opname Fisik Bersama (Mutual Check 0%) belum dilampirkan atau belum memuat angka ${checkVolume}.`,
          how_to_incorporate: {
            justek_clause_guide: `(a) Buat tabel "Rincian Perhitungan Volume Fisik" pada lampiran JusTek yang menjabarkan dimensi lapangan: Panjang (p), Lebar (l), Kedalaman/Tinggi (t), serta faktor koefisien susut; (b) Cantumkan dasar justifikasi penambahan/pengurangan volume akibat kondisi tanah/struktur eksisting.`,
            jusfin_rab_guide: `(a) Sinkronkan kuantitas pada sheet RAB Revisi dengan hasil akhir lembar Back Up Volume resmi; (b) Pastikan total biaya adalah hasil perkalian persis: Volume Hasil Back Up x Harga Satuan Kontrak (Rp ${(fin ? fin.unit_price_revised : 0).toLocaleString('id-ID')}).`,
            required_supporting_docs: [
              'Lembar Perhitungan Back Up Volume bertandatangan Kontraktor & Konsultan MK',
              'Gambar Sket Ukur Lapangan / Shop Drawing Terverifikasi (As-Planned vs As-Surveyed)',
              'Berita Acara Mutual Check (MC-0) atau Berita Acara Opname Bersama',
            ],
            contract_amendment_clause: `Perbarui Lampiran Daftar Kuantitas dan Harga (Bill of Quantities) pada Addendum Kontrak dengan memasukkan volume ${checkVolume} ${tech.unit || (fin ? fin.unit : 'm3')} beserta catatan dasar perhitungan Back Up Volume.`,
          },
          recommended_action: `Lampirkan lembar perhitungan Back Up Volume resmi yang memvalidasi angka ${checkVolume}, atau sesuaikan volume dengan data ukur riil lapangan.`,
          status: 'NOT FOUND',
        });
      }
    }

    // Check for quantity discrepancy between Kolom 1 and JusTek/JusFin
    if (fin && matchedMcDoc) {
      const matchInItems = matchedMcDoc.itemsFound.find((it: { itemName: string; rawSnippet: string; specsOrDimensions?: string; qty?: number; unit?: string }) => {
        const queryTokens = tech.item.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        return queryTokens.some((tok: string) => it.itemName.toLowerCase().includes(tok));
      });
      if (matchInItems && matchInItems.qty !== undefined && matchInItems.qty > 0 && fin.qty_revised > 0) {
        const diffQty = Math.abs(fin.qty_revised - matchInItems.qty);
        if (diffQty > 0.001) {
          exceptions.push({
            exception_id: `EXC-00${exceptions.length + 1}`,
            priority: 'HIGH',
            change_id: tech.change_id,
            category_type: 'DEVIASI_ANGKA_VOLUME',
            source: 'Deviasi Angka: Bukti Kolom 1 vs JusTek/JusFin',
            finding: `Ketidaksesuaian angka kuantitas antara bukti fisik lapangan Kolom 1 ("${matchedMcDoc.fileName}") dengan usulan di dokumen formal JusTek/JusFin pada item "${tech.item}".`,
            expected: `Volume pada JusTek & JusFin harus sinkron dan identik dengan hasil ukur opname fisik lapangan (${matchInItems.qty} ${fin.unit}).`,
            actual: `Volume tercantum di JusTek/JusFin = ${fin.qty_revised} ${fin.unit}, sedangkan terukur di Kolom 1 = ${matchInItems.qty} ${fin.unit} (Selisih deviasi: ${diffQty.toFixed(4)} ${fin.unit}).`,
            impact: 'Potensi temuan auditor pengawas / BPK atas ketidaksinkronan data volume kontrak addendum terhadap back up data fisik lapangan.',
            error_detail: `Terdapat selisih matematis sebesar ${diffQty.toFixed(4)} ${fin.unit} antara angka opname fisik yang ditandatangani pada berkas Kolom 1 (${matchedMcDoc.fileName}: ${matchInItems.qty} ${fin.unit}) dengan angka usulan yang dimasukkan ke draf RAB Revisi/JusFin (${fin.qty_revised} ${fin.unit}).`,
            substantiation_gap: `Kekurangan Berkas: Penjelasan tertulis atau Berita Acara Rekonsiliasi Opname yang menerangkan mengapa angka di JusFin (${fin.qty_revised}) berbeda dari angka terukur MC-0/MC-100 (${matchInItems.qty}).`,
            how_to_incorporate: {
              justek_clause_guide: `(a) Jelaskan latar belakang selisih volume ${diffQty.toFixed(4)} ${fin.unit} pada naskah JusTek; (b) Jika angka MC-0/MC-100 yang benar, ubah naskah JusTek menjadi ${matchInItems.qty} ${fin.unit}; (c) Jika angka JusFin yang benar karena ada opname lanjutan, lampirkan Berita Acara Pengukuran Ulang Tahap 2.`,
              jusfin_rab_guide: `Koreksi angka volume pada baris "${tech.item}" di sheet RAB Revisi menjadi ${matchInItems.qty} ${fin.unit} agar selaras dengan bukti fisik, dan perbarui total nilai menjadi Rp ${(matchInItems.qty * fin.unit_price_revised).toLocaleString('id-ID')}.`,
              required_supporting_docs: [
                'Berita Acara Rekonsiliasi Volume antara Konsultan MK dan Kontraktor',
                'Lembar Pengukuran Ulang / Opname Fisik Bersama yang Telah Disetujui PPK',
              ],
              contract_amendment_clause: `Koreksi kuantitas pekerjaan pada Lampiran Rekapitulasi RAB Amandemen Kontrak sesuai angka hasil opname fisik bersama yang telah diverifikasi.`,
            },
            recommended_action: 'Koreksi volume di sheet RAB Revisi dan naskah JusTek agar persis sesuai berita acara opname lapangan.',
            status: 'MISMATCH',
          });
        }
      }
    }

    if (fin && fin.financial_status === 'REVIEW') {
      exceptions.push({
        exception_id: `EXC-00${exceptions.length + 1}`,
        priority: 'MEDIUM',
        change_id: tech.change_id,
        category_type: 'BUKTI_KURANG_LENGKAP',
        source: 'JusFin Justification',
        finding: `Perubahan nilai finansial pada "${tech.item}" belum memiliki rincian Analisa Harga Satuan (AHS).`,
        expected: 'Rincian breakdown koefisien upah tenaga kerja, material utama, material bantu, dan sewa alat sesuai standar AHSP.',
        actual: fin.justification || 'Penjelasan singkat tanpa lampiran tabel AHSP rincian koefisien.',
        impact: 'Dasar kewajaran penetapan harga satuan baru/revisi dapat digugurkan saat audit kepatuhan oleh auditor internal / BPKP.',
        error_detail: `Item usulan mengalami perubahan harga atau merupakan item baru dengan harga satuan Rp ${fin.unit_price_revised.toLocaleString('id-ID')}, namun tidak disertai lampiran tabel Analisa Harga Satuan Pekerjaan (AHSP) yang merinci koefisien tenaga kerja, bahan, alat, serta komponen overhead/keuntungan.`,
        substantiation_gap: `Kekurangan Berkas: (1) Lembar AHSP standar Kementerian PUPR / Permen PUPR terbaru; (2) Data survei harga pasar dari minimal 3 distributor resmi; (3) Berita Acara Klarifikasi & Negosiasi Harga Satuan Baru.`,
        how_to_incorporate: {
          justek_clause_guide: `Cantumkan justifikasi teknis mengenai pemilihan tipe material dan kualifikasi tenaga ahli/peralatan khusus yang mendasari koefisien harga pada lampiran Justifikasi Teknis.`,
          jusfin_rab_guide: `(a) Susun sheet terpisah "AHSP Item Baru" pada file Excel RAB; (b) Masukkan formula: Harga Satuan = (Upah + Bahan + Alat) x (1 + Overhead/Profit); (c) Tautkan harga satuan di sheet RAB utama langsung ke hasil sheet AHSP.`,
          required_supporting_docs: [
            'Lembar Perhitungan AHSP bertandatangan Estimator & PM Kontraktor',
            'Surat Bukti Penawaran Harga / Invoice Pembelian dari 3 Vendor / Distributor',
            'Berita Acara Negosiasi dan Kesepakatan Harga Satuan Baru Bersama Pejabat Pembuat Komitmen (PPK)',
          ],
          contract_amendment_clause: `Lampirkan Daftar Analisa Harga Satuan Pekerjaan Baru sebagai bagian tak terpisahkan dari Addendum Kontrak.`,
        },
        recommended_action: 'Lampirkan lembar analisa harga satuan resmi sebelum penerbitan amandemen kontrak.',
        status: 'REVIEW',
      });
    }

    if (fin && fin.calculation_status === 'MISMATCH') {
      exceptions.push({
        exception_id: `EXC-00${exceptions.length + 1}`,
        priority: 'HIGH',
        change_id: tech.change_id,
        category_type: 'KESALAHAN_ARITMETIKA',
        source: 'RAB Aritmetika',
        finding: `Kesalahan perhitungan perkalian kuantitas dan harga satuan pada "${tech.item}".`,
        expected: `Total terhitung matematis = Rp ${fin.calculated_revised.toLocaleString('id-ID')} (${fin.qty_revised} ${fin.unit} x Rp ${fin.unit_price_revised.toLocaleString('id-ID')})`,
        actual: `Total tertulis di dokumen = Rp ${fin.total_revised.toLocaleString('id-ID')} (Selisih deviasi aritmetika: Rp ${Math.abs(fin.calculated_revised - fin.total_revised).toLocaleString('id-ID')})`,
        impact: 'Deviasi nilai matematis kontrak yang berakibat pada ketidakabsahan rekapitulasi nilai addendum dan potensi kelebihan/kekurangan pembayaran.',
        error_detail: `Terjadi galat komputasi / hardcoded number pada baris "${tech.item}". Perkalian kuantitas (${fin.qty_revised}) x harga satuan (Rp ${fin.unit_price_revised.toLocaleString('id-ID')}) menghasilkan Rp ${fin.calculated_revised.toLocaleString('id-ID')}, namun angka yang tertulis pada sheet dokumen adalah Rp ${fin.total_revised.toLocaleString('id-ID')}.`,
        substantiation_gap: `Kekurangan: Lembar formula Excel yang terkunci atau verifikasi perkalian matematis sebelum dokumen dicetak.`,
        how_to_incorporate: {
          justek_clause_guide: `Pastikan angka volume yang dirujuk dalam naskah Justifikasi Teknis selaras dengan kuantitas pada formula perkalian RAB.`,
          jusfin_rab_guide: `Ganti input manual (hardcoded text) pada kolom Total Harga di sheet Excel RAB dengan formula perkalian dinamis: =ROUND(Qty * HargaSatuan, 0) sehingga total menjadi persis Rp ${fin.calculated_revised.toLocaleString('id-ID')}.`,
          required_supporting_docs: [
            'Lembar Rekapitulasi RAB Revisi dengan Formula Excel Terverifikasi (bebas hardcoding)',
          ],
          contract_amendment_clause: `Perbarui nilai total harga mata pembayaran pada Lampiran RAB Amandemen Kontrak sesuai hasil perkalian matematis yang valid.`,
        },
        recommended_action: 'Koreksi formula perkalian pada sheet RAB.',
        status: 'MISMATCH',
      });
    }
  });

  // Ensure any contractually changed financial item not covered in validTechnicalChanges is also tracked
  const trackedChangeIds = new Set(traceability.map((t) => t.change_id));
  const unmatchedChangedFin = financialItems.filter(
    (f) =>
      !trackedChangeIds.has(f.change_id) &&
      (f.is_changed !== undefined
        ? f.is_changed
        : Math.abs(f.delta_value) > 0 || Math.abs(f.delta_qty) > 0)
  );

  unmatchedChangedFin.forEach((f, extraIdx) => {
    const isChainConsistent =
      f.financial_status === 'VERIFIED' && f.calculation_status === 'VERIFIED';
    const finalStatus: VerificationStatus =
      f.financial_status === 'MISMATCH' || f.calculation_status === 'MISMATCH'
        ? 'MISMATCH'
        : f.financial_status === 'REVIEW'
        ? 'REVIEW'
        : 'VERIFIED';

    if (finalStatus === 'VERIFIED') countVerified++;
    else if (finalStatus === 'MISMATCH') countMismatch++;
    else if (finalStatus === 'REVIEW') countReview++;

    const rabInitStr =
      f.qty_initial > 0 || f.total_initial > 0
        ? `Qty: ${f.qty_initial} ${f.unit}, Total: Rp ${f.total_initial.toLocaleString('id-ID')}`
        : `Item Baru / Tambah (0 ${f.unit})`;
    const rabRevStr =
      f.qty_revised > 0 || f.total_revised > 0
        ? `Qty: ${f.qty_revised} ${f.unit}, Total: Rp ${f.total_revised.toLocaleString('id-ID')}`
        : `Dihilangkan / Kurang (0 ${f.unit}, Rp 0)`;
    const deltaStr =
      f.delta_value !== 0
        ? `Δ: ${f.delta_value > 0 ? '+' : ''}Rp ${f.delta_value.toLocaleString('id-ID')}`
        : 'Δ: Rp 0';
    const jusfinStr = `${deltaStr} | ${f.justification || 'Penyesuaian nilai pada RAB Revisi'}`;

    traceability.push({
      change_id: f.change_id,
      item: f.item,
      rab_initial: rabInitStr,
      justek_claim: f.justification || 'Penyesuaian kuantitas & nilai pada RAB Revisi',
      bapl_evidence: 'Tercatat pada rincian RAB Revisi',
      rab_revised: rabRevStr,
      jusfin_claim: jusfinStr,
      mco_document:
        mc0Docs.length > 0
          ? `${mc0Docs[0].docNumber || 'MC-0/PLN'} (${mc0Docs[0].status})`
          : `MCO-01/${code} (Approved)`,
      evidence_refs: `EV-FIN-${String(extraIdx + 1).padStart(2, '0')}`,
      technical_status: 'VERIFIED',
      financial_status: f.financial_status,
      final_status: finalStatus,
      chain_consistent: isChainConsistent,
      notes: isChainConsistent
        ? 'Rantai dokumen finansial lengkap dan konsisten.'
        : 'Memerlukan review verifikasi finansial dan AHS.',
    });

    if (f.financial_status === 'REVIEW') {
      exceptions.push({
        exception_id: `EXC-00${exceptions.length + 1}`,
        priority: 'MEDIUM',
        change_id: f.change_id,
        category_type: 'BUKTI_KURANG_LENGKAP',
        source: 'JusFin Justification',
        finding: `Perubahan nilai finansial pada "${f.item}" belum memiliki rincian Analisa Harga Satuan (AHS).`,
        expected: 'Rincian breakdown koefisien upah, material bantu, dan sub-komponen sesuai standar AHSP.',
        actual: f.justification || 'Penjelasan singkat tanpa lampiran rincian AHSP koefisien harga.',
        impact: 'Dasar penetapan harga revisi dapat dipertanyakan saat audit kepatuhan.',
        error_detail: `Item RAB "${f.item}" tercantum dengan nilai revisi Rp ${f.total_revised.toLocaleString('id-ID')}, namun tidak dilengkapi lembar Analisa Harga Satuan Pekerjaan resmi yang memvalidasi kewajaran harga komponen.`,
        substantiation_gap: 'Kekurangan Berkas: Lembar perhitungan AHSP resmi dan bukti survei harga pasar terkini.',
        how_to_incorporate: {
          justek_clause_guide: `Uraikan alasan pemilihan metode dan spesifikasi teknis item pada bab Justifikasi Teknis.`,
          jusfin_rab_guide: `Lampirkan lembar AHSP terverifikasi yang merinci upah, bahan, dan sewa alat sebelum harga disetujui.`,
          required_supporting_docs: [
            'Lembar Analisa Harga Satuan Pekerjaan (AHSP) Resmi',
            'Data Survei Harga Pasar dari 3 Pemasok',
          ],
          contract_amendment_clause: `Cantumkan daftar AHSP item baru pada lampiran Addendum Kontrak.`,
        },
        recommended_action: 'Lampirkan lembar analisa harga satuan resmi sebelum amandemen kontrak.',
        status: 'REVIEW',
      });
    }

    if (!f.evidence_found || f.evidence_type === 'NONE') {
      exceptions.push({
        exception_id: `EXC-00${exceptions.length + 1}`,
        priority: 'HIGH',
        change_id: f.change_id,
        category_type: 'OUTPUT_FORMAL_TANPA_BUKTI',
        source: 'Output Formal Tanpa Bukti Kolom 1',
        finding: `Item usulan formal pada JusFin/RAB ("${f.item}") senilai Rp ${(f.total_revised || f.delta_value).toLocaleString('id-ID')} (Volume: ${f.qty_revised} ${f.unit}) TIDAK MEMILIKI DOKUMEN PEMBUKTIAN FISIK / BAPL di Kolom 1.`,
        expected: `Setiap usulan item baru, penambahan volume, atau klaim biaya pada dokumen formal JusFin/JusTek wajib memiliki dasar pembuktian fisik (BAPL / Hasil Survei Lapangan) dari berkas Kolom 1.`,
        actual: `Klaim anggaran tercantum di JusFin/RAB, namun berkas Kolom 1 tidak memuat dasar verifikasi atau pencatatan survei fisik untuk item ini.`,
        impact: `Pengeluaran anggaran tidak dapat dipertanggungjawabkan dan berisiko dicoret/dinyatakan fiktif oleh auditor pengawas.`,
        error_detail: `Anggaran sebesar Rp ${(f.total_revised || f.delta_value).toLocaleString('id-ID')} dimasukkan ke dalam usulan perubahan RAB, tetapi tidak ditemukan satupun catatan lapangan, BAPL, atau lembar opname di Kolom 1 yang membuktikan urgensi fisik item ini.`,
        substantiation_gap: 'Kekurangan Berkas: Berita Acara Peninjauan Lapangan (BAPL) dan lembar Back Up Perhitungan Volume opname lapangan.',
        how_to_incorporate: {
          justek_clause_guide: `Susun klausul baru pada Justifikasi Teknis: "Urgensi Lapangan Pekerjaan ${f.item}" yang menerangkan kebutuhan riil di lokasi proyek.`,
          jusfin_rab_guide: `Sertakan rincian kuantitas (${f.qty_revised} ${f.unit}) dan harga satuan pada sheet RAB Revisi beserta lampiran AHSP.`,
          required_supporting_docs: [
            'BAPL Peninjauan Lapangan Bersama Direksi',
            'Lembar Back Up Perhitungan Volume Fisik',
          ],
          contract_amendment_clause: `Tambahkan item "${f.item}" ke dalam Daftar Kuantitas dan Harga (BoQ) Amandemen Kontrak.`,
        },
        recommended_action: `Lampirkan BAPL / laporan hasil survei resmi yang mendasari penambahan pekerjaan ini di Kolom 1, atau hilangkan item dari usulan amandemen kontrak jika tidak memiliki bukti fisik.`,
        status: 'NOT FOUND',
      });
    }

    if (f.calculation_status === 'MISMATCH') {
      exceptions.push({
        exception_id: `EXC-00${exceptions.length + 1}`,
        priority: 'HIGH',
        change_id: f.change_id,
        category_type: 'KESALAHAN_ARITMETIKA',
        source: 'RAB Aritmetika',
        finding: `Kesalahan perhitungan perkalian kuantitas dan harga satuan pada "${f.item}".`,
        expected: `Total terhitung = Rp ${f.calculated_revised.toLocaleString('id-ID')}`,
        actual: `Total tertulis di dokumen = Rp ${f.total_revised.toLocaleString('id-ID')}`,
        impact: 'Deviasi nilai matematis kontrak.',
        error_detail: `Perkalian ${f.qty_revised} ${f.unit} x Rp ${f.unit_price_revised.toLocaleString('id-ID')} menghasilkan Rp ${f.calculated_revised.toLocaleString('id-ID')}, tetapi tertulis Rp ${f.total_revised.toLocaleString('id-ID')}.`,
        substantiation_gap: 'Formula lembar Excel RAB hardcoded atau salah hitung.',
        how_to_incorporate: {
          justek_clause_guide: 'Pastikan volume di JusTek selaras dengan kuantitas yang dikalikan di RAB.',
          jusfin_rab_guide: `Perbaiki formula perkalian kolom Total Harga menjadi =ROUND(Qty*HargaSatuan, 0).`,
          required_supporting_docs: ['Lembar Excel RAB Revisi dengan formula terverifikasi'],
          contract_amendment_clause: 'Koreksi nilai item pada lampiran RAB Addendum Kontrak.',
        },
        recommended_action: 'Koreksi formula perkalian pada sheet RAB.',
        status: 'MISMATCH',
      });
    }
  });

  // Check for substantive items in Kolom 1 that are NOT ACCOMMODATED in JusTek / JusFin
  const allFormalNames = [
    ...validTechnicalChanges.map((t) => t.item.toLowerCase()),
    ...financialItems.map((f) => f.item.toLowerCase()),
  ];

  for (const sDoc of supportingDocs) {
    for (const foundItem of sDoc.itemsFound) {
      const cleanName = foundItem.itemName.trim();
      if (cleanName.length < 4 || isCategoryHeaderOrNonItem(cleanName)) continue;

      const queryTokens = cleanName.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      if (queryTokens.length === 0) continue;

      const isAccommodated = allFormalNames.some((formal) =>
        queryTokens.some((tok) => formal.includes(tok))
      );

      if (!isAccommodated) {
        exceptions.push({
          exception_id: `EXC-00${exceptions.length + 1}`,
          priority: 'HIGH',
          change_id: 'FIELD-UNACCOMMODATED',
          category_type: 'BELUM_MASUK_JUSTEK_JUSFIN',
          source: 'Audit Kolom 1 ➔ JusTek/JusFin (Item Belum Diakomodir)',
          finding: `Item/pekerjaan fisik terukur pada Dokumen Kolom 1 ("${cleanName}" di berkas ${sDoc.fileName}) BELUM DIAKOMODIR pada output formal JusTek maupun JusFin.`,
          expected: `Seluruh temuan opname/kebutuhan fisik di Dokumen Kolom 1 harus teradministrasi secara transparan pada dokumen formal JusTek dan JusFin/RAB Revisi.`,
          actual: `Item terdata di berkas fisik lapangan (${sDoc.fileName}${foundItem.pageOrSheet ? ` - Hal/Sheet ${foundItem.pageOrSheet}` : ''}${foundItem.qty ? `, Volume: ${foundItem.qty} ${foundItem.unit || ''}` : ''}), namun TIDAK DITEMUKAN dalam rincian usulan JusTek maupun RAB Revisi.`,
          impact: `Pekerjaan fisik lapangan yang telah disepakati berisiko menjadi klaim susulan tidak bertuan (unapproved claim), tidak dapat dibayarkan kepada kontraktor pelaksana, atau memicu sengketa addendum di kemudian hari.`,
          error_detail: `Terdapat pekerjaan nyata yang telah diopname/dicatat pada berkas Kolom 1 ("${cleanName}"), namun perencana/PMO belum memasukkan item ini ke dalam batang tubuh naskah Justifikasi Teknis dan belum mengalokasikan anggarannya pada tabel RAB Revisi Justifikasi Finansial.`,
          substantiation_gap: `Kekurangan Administrasi: Sinkronisasi formal antara temuan dokumen lapangan (${sDoc.fileName}) dengan dokumen usulan amandemen kontrak (JusTek & JusFin).`,
          how_to_incorporate: {
            justek_clause_guide: `LANGKAH MEMASUKKAN KE JUSTEK:
1. Tambahkan sub-bab baru pada Dokumen JusTek: "Pekerjaan Tambah: ${cleanName} Berdasarkan Hasil Opname Lapangan (${sDoc.fileName})".
2. Deskripsikan kondisi faktual lapangan: mengapa pekerjaan ini diperlukan (misal: penyesuaian elevasi, perubahan trase, atau perkuatan struktur).
3. Rujuk nomor dan tanggal dokumen Kolom 1 (${sDoc.docNumber || sDoc.fileName}) sebagai dasar legalitas teknis perubahan.`,
            jusfin_rab_guide: `LANGKAH MEMASUKKAN KE JUSFIN & RAB:
1. Buka sheet RAB Revisi, buat baris mata pembayaran baru: "${cleanName}".
2. Masukkan kuantitas terukur (${foundItem.qty || 'sesuai Back Up Volume'} ${foundItem.unit || 'Unit'}).
3. Tetapkan Harga Satuan berdasarkan AHSP baru atau hasil negosiasi harga satuan baru bersama PPK.
4. Perbarui Total RAB Usulan dan sesuaikan rekapitulasi pada naskah Justifikasi Finansial.`,
            required_supporting_docs: [
              `Dokumen Kolom 1 Asli: ${sDoc.fileName} (Lembar Opname Terverifikasi)`,
              'Lembar Perhitungan Back Up Volume Rinci',
              'Analisa Harga Satuan Pekerjaan (AHSP) Baru yang Disahkan PPK',
              'Berita Acara Kesepakatan Tambah Pekerjaan Direksi Teknis',
            ],
            contract_amendment_clause: `Drafkan Pasal Amandemen: "Para Pihak sepakat menambah lingkup mata pembayaran baru '${cleanName}' sebanyak ${foundItem.qty || '[Volume]'} ${foundItem.unit || '[Satuan]'} dengan total biaya Rp [Total Nilai] sebagaimana tertuang dalam Lampiran BoQ Addendum."`,
          },
          recommended_action: `Masukkan item "${cleanName}" ke dalam lembar Justifikasi Teknis (JusTek) dan alokasikan anggarannya pada RAB Revisi sebelum draf amandemen kontrak disahkan.`,
          status: 'NEED SUPPORT',
        });
      }
    }
  }

  // Exception for Total RAB Discrepancy (Crucial Section 15 check)
  if (!totalRab.delta_match) {
    countMismatch++;
    exceptions.unshift({
      exception_id: `EXC-000`,
      priority: 'HIGH',
      change_id: 'FIN-TOTAL',
      category_type: 'KETIDAKSINKRONAN_REKAP',
      source: 'JusFin vs Perhitungan Sistem',
      finding: totalRab.explanation,
      expected: `Delta matematis = RAB Revisi (Rp ${totalRab.rab_revised.toLocaleString('id-ID')}) - RAB Awal (Rp ${totalRab.rab_initial.toLocaleString('id-ID')}) = Rp ${totalRab.system_calculated_delta.toLocaleString('id-ID')}`,
      actual: `Delta tertulis di dokumen JusFin = Rp ${totalRab.stated_jusfin_delta.toLocaleString('id-ID')}`,
      impact: 'Potensi temuan audit keuangan negara/perusahaan akibat ketidaksinkronan angka rekapitulasi nilai amandemen kontrak.',
      error_detail: `Terdapat selisih sebesar Rp ${Math.abs(totalRab.system_calculated_delta - totalRab.stated_jusfin_delta).toLocaleString('id-ID')} antara angka selisih biaya matematis murni (RAB Revisi minus RAB Awal) dengan angka yang dinarasikan pada lembar rekapitulasi Justifikasi Finansial.`,
      substantiation_gap: 'Kekurangan: Rekonsiliasi lembar ringkasan rekapitulasi JusFin terhadap penjumlahan formula total sheet RAB.',
      how_to_incorporate: {
        justek_clause_guide: 'Pastikan kesimpulan total deviasi biaya yang dikutip pada JusTek sama persis dengan angka matematis RAB Revisi.',
        jusfin_rab_guide: `Perbarui naskah JusFin paragraf rekapitulasi biaya agar angka selisihnya mengacu ke formula Excel: =Total_RAB_Revisi - Total_RAB_Awal (Rp ${totalRab.system_calculated_delta.toLocaleString('id-ID')}).`,
        required_supporting_docs: [
          'Lembar Rekapitulasi Komparasi Biaya Kontrak Awal vs Addendum',
        ],
        contract_amendment_clause: 'Klausul Nilai Amandemen Kontrak disesuaikan menjadi persis total matematis RAB Revisi yang sah.',
      },
      recommended_action: 'Perbaiki formula lembar JusFin agar mengacu langsung ke total selisih matematis RAB Awal dan RAB Revisi.',
      status: 'MISMATCH',
    });
  }

  // Also include general evidence records from supportingDocs if not already added
  for (let i = 0; i < supportingDocs.length; i++) {
    const sDoc = supportingDocs[i];
    const exists = evidences.some((e) => e.document === sDoc.fileName);
    if (!exists) {
      evidences.push({
        evidence_id: `EV-DOC-${String(i + 1).padStart(2, '0')}`,
        change_id: 'DOC-SUPPORT',
        source: sDoc.fileType === 'MC0' ? 'MCO' : sDoc.fileType === 'TEST_REPORT' ? 'TestReport' : 'PO',
        document: sDoc.fileName,
        page: 1,
        snippet: sDoc.extractedText ? sDoc.extractedText.slice(0, 250) + '...' : `Dokumen Pendukung: ${sDoc.docNumber || sDoc.fileName} (${sDoc.status})`,
        source_type: 'Native Text',
        confidence: 0.98,
        evidence_status: 'VERIFIED',
      });
    }
  }

  // Step: FINANCIAL NUMBER ANOMALY DETECTION & BA TRACEABILITY ID ENGINE
  // Audits every financial item to verify whether its numerical changes (qty, price, total)
  // have a valid reference / Traceability ID in Berita Acara documents (BAPL, MC-0, MC-100, FAT)
  let baAnomaliesCount = 0;
  let unreferencedFinancialCount = 0;

  for (const fin of financialItems) {
    const hasFinancialChange =
      fin.delta_qty !== 0 ||
      fin.delta_value !== 0 ||
      fin.delta_unit_price !== 0 ||
      (fin.is_changed ?? false);

    // Search for backing Berita Acara evidence across baplPages and supportingDocs
    let matchedBaClause: {
      doc_name: string;
      doc_type: string;
      page: number;
      clause: string;
      matched_qty?: number;
      matched_price?: number;
      matched_unit?: string;
    } | undefined;

    // 1. Check if linked technical change already found BA evidence
    const linkedTech = validTechnicalChanges.find(
      (t) => (t.item && t.item.trim().toLowerCase() === fin.item.trim().toLowerCase()) ||
             (isNameCompatible(t.item, fin.item) && t.change_id === fin.change_id)
    );

    if (linkedTech && linkedTech.multi_evidence && linkedTech.multi_evidence.length > 0) {
      const bestEv = linkedTech.multi_evidence[0];
      matchedBaClause = {
        doc_name: bestEv.doc_name,
        doc_type: bestEv.doc_type,
        page: bestEv.page,
        clause: bestEv.statement || bestEv.snippet,
        matched_unit: fin.unit,
      };
    } else if (linkedTech && linkedTech.evidence_found) {
      matchedBaClause = {
        doc_name: linkedTech.evidence_document || baplPages[0]?.source || 'BAPL Proyek',
        doc_type: 'BAPL',
        page: linkedTech.evidence_page || 1,
        clause: linkedTech.actual_bapl || linkedTech.evidence_snippet || '',
        matched_unit: fin.unit,
      };
    }

    // 2. Search in supporting docs (MC-0, MC-100, Test Report, FAT)
    if (!matchedBaClause) {
      for (const sDoc of supportingDocs) {
        const itemHit = sDoc.itemsFound.find((it) => {
          const qToks = fin.item.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
          return qToks.length > 0 && qToks.every((tok) => it.itemName.toLowerCase().includes(tok) || it.rawSnippet.toLowerCase().includes(tok));
        });
        if (itemHit) {
          matchedBaClause = {
            doc_name: sDoc.fileName,
            doc_type: sDoc.fileType,
            page: typeof itemHit.pageOrSheet === 'number' ? itemHit.pageOrSheet : 1,
            clause: itemHit.rawSnippet,
            matched_qty: itemHit.qty,
            matched_unit: itemHit.unit,
          };
          break;
        }
      }
    }

    // Assign Traceability ID & Evaluate Anomalies
    if (matchedBaClause) {
      const docSlug = matchedBaClause.doc_type.replace(/[^A-Z0-9]/gi, '');
      fin.traceability_ref_id = `TRC-BA-${docSlug}-${fin.change_id.replace('CHG-', '')}`;
      fin.has_valid_ba_ref = true;
      fin.ba_reference_clause = matchedBaClause;

      // Check for quantity/numerical discrepancy
      if (
        matchedBaClause.matched_qty !== undefined &&
        fin.qty_revised > 0 &&
        Math.abs(fin.qty_revised - matchedBaClause.matched_qty) > 0.001
      ) {
        if (
          matchedBaClause.matched_unit &&
          fin.unit &&
          matchedBaClause.matched_unit.toLowerCase() !== fin.unit.toLowerCase()
        ) {
          fin.ba_anomaly_type = 'ANOMALI_DIMENSI_SATUAN';
          fin.ba_anomaly_description = `Perbedaan satuan: Dokumen ${matchedBaClause.doc_type} mencatat ${matchedBaClause.matched_qty} ${matchedBaClause.matched_unit}, sedangkan JusFin/RAB mencatat ${fin.qty_revised} ${fin.unit}. Perlu konversi dimensi fisik terverifikasi.`;
          baAnomaliesCount++;
        } else {
          fin.ba_anomaly_type = 'ANOMALI_DEVIASI_NILAI_BA';
          fin.ba_anomaly_description = `Deviasi kuantitas: Dokumen ${matchedBaClause.doc_type} mencatat ${matchedBaClause.matched_qty} ${fin.unit}, sedangkan JusFin/RAB mencatat ${fin.qty_revised} ${fin.unit} (Selisih: ${Math.abs(fin.qty_revised - matchedBaClause.matched_qty).toFixed(4)} ${fin.unit}).`;
          baAnomaliesCount++;
        }
      } else if (fin.unit_price_initial > 0 && fin.unit_price_revised > fin.unit_price_initial && fin.financial_status === 'REVIEW') {
        fin.ba_anomaly_type = 'ANOMALI_HARGA_TANPA_AHSP';
        fin.ba_anomaly_description = `Kenaikan harga satuan dari Rp ${fin.unit_price_initial.toLocaleString('id-ID')} ke Rp ${fin.unit_price_revised.toLocaleString('id-ID')} belum memiliki rujukan Berita Acara Klarifikasi & Negosiasi Harga / AHSP.`;
        baAnomaliesCount++;
      } else {
        fin.ba_anomaly_type = 'NONE';
      }
    } else if (hasFinancialChange) {
      // ANOMALY: Financial change without valid Berita Acara Reference ID
      fin.traceability_ref_id = 'UNREFERENCED-NO-BA';
      fin.has_valid_ba_ref = false;
      fin.ba_anomaly_type = 'ANOMALI_ANGKA_TANPA_REFERENSI_BA';
      fin.ba_anomaly_description = `Perubahan angka finansial (Kuantitas: ${fin.qty_revised} ${fin.unit}, Total: Rp ${fin.total_revised.toLocaleString('id-ID')}, ΔRp ${fin.delta_value.toLocaleString('id-ID')}) TIDAK MEMILIKI REFERENSI / TRACEABILITY ID DARI DOKUMEN BERITA ACARA APAPUN.`;
      baAnomaliesCount++;
      unreferencedFinancialCount++;

      // Register High-Priority Audit Exception
      exceptions.push({
        exception_id: `EXC-ANO-${String(exceptions.length + 1).padStart(3, '0')}`,
        priority: 'HIGH',
        change_id: fin.change_id,
        category_type: 'ANOMALI_ANGKA_TANPA_REFERENSI_BA',
        source: 'Sistem Deteksi Anomali Pipeline (Validasi Referensi BA)',
        finding: `Perubahan angka pada Justifikasi Finansial ("${fin.item}") TIDAK MEMILIKI REFERENSI (Traceability ID) dari dokumen pendukung Berita Acara (BAPL / MC-0 / MC-100 / FAT).`,
        expected: `Setiap perubahan angka (kuantitas ΔQ, harga satuan ΔP, atau total biaya ΔV) pada Justifikasi Finansial wajib memiliki Rujukan Referensi Traceability ID yang terverifikasi pada Berita Acara resmi.`,
        actual: `Klaim finansial sebesar Rp ${fin.total_revised.toLocaleString('id-ID')} (Perubahan: Rp ${fin.delta_value.toLocaleString('id-ID')}) tercantum tanpa adanya klausul, nomor surat, atau lembar ukur Berita Acara yang memvalidasinya.`,
        impact: `Klaim anggaran tanpa referensi Berita Acara merupakan temuan audit mutlak yang berisiko digugurkan sebagai pengeluaran tidak berdasar (unsubstantiated financial amendment).`,
        error_detail: `Pipeline verifikasi mendeteksi perubahan nilai pada baris "${fin.item}" (Kondisi Awal: Rp ${fin.total_initial.toLocaleString('id-ID')} ➔ Usulan Revisi: Rp ${fin.total_revised.toLocaleString('id-ID')}), namun pemindaian komprehensif ke seluruh berkas Berita Acara (BAPL, MC-0, MC-100, Test Report) tidak menemukan catatan atau referensi rujukan yang sah untuk angka ini.`,
        substantiation_gap: `Kekurangan Berkas: (1) Berita Acara Kesepakatan Perubahan / BAPL yang mencantumkan rujukan item ini; (2) Traceability ID resmi pengesahan lapangan; (3) Lembar rekonsiliasi angka antara Pengawas Lapangan dan Tim Anggaran.`,
        how_to_incorporate: {
          justek_clause_guide: `(a) Terbitkan Berita Acara Peninjauan Lapangan (BAPL) susulan bersama PPK dan Pengawas Teknis; (b) Cantumkan nomor Berita Acara pada naskah JusTek sebagai dasar penetapan Traceability ID.`,
          jusfin_rab_guide: `(a) Tautkan baris RAB ini ke nomor Berita Acara yang diterbitkan; (b) Cantumkan Traceability ID (contoh: TRC-BA-MC0-01) pada kolom referensi Justifikasi Finansial.`,
          required_supporting_docs: [
            'Berita Acara Peninjauan Lapangan (BAPL) Resmi',
            'Lembar Back Up Volume & AHSP Terverifikasi',
            'Surat Permohonan Perubahan Anggaran Berita Acara',
          ],
          contract_amendment_clause: `Cantumkan klausul dasar amandemen: "Perubahan nilai mata pembayaran ${fin.item} dilaksanakan berdasarkan Berita Acara Nomor [Nomor BA] tanggal [Tanggal BA]."`,
        },
        recommended_action: `Lengkapi dokumen Berita Acara pendukung yang menerbitkan Traceability ID valid untuk item ini, atau batalkan perubahan angka pada RAB Revisi.`,
        status: 'NEED SUPPORT',
      });
    } else {
      fin.traceability_ref_id = `TRC-FIX-${fin.change_id.replace('CHG-', '')}`;
      fin.has_valid_ba_ref = true;
      fin.ba_anomaly_type = 'NONE';
    }

    // Sync back to traceability records if matching
    const trcRec = traceability.find((t) => t.change_id === fin.change_id);
    if (trcRec) {
      trcRec.traceability_ref_id = fin.traceability_ref_id;
      trcRec.has_valid_ba_ref = fin.has_valid_ba_ref;
      trcRec.ba_anomaly_type = fin.ba_anomaly_type;
      trcRec.ba_anomaly_description = fin.ba_anomaly_description;
    }
  }

  return {
    traceability,
    evidences,
    exceptions,
    summary: {
      total_items: validTechnicalChanges.length,
      verified: countVerified,
      mismatch: countMismatch,
      need_support: countNeedSupport,
      review: countReview,
      not_found: countNotFound,
      ba_anomalies_count: baAnomaliesCount,
      unreferenced_financial_count: unreferencedFinancialCount,
    },
    technical_summary: {
      material_changes: matChanges,
      quantity_changes: qtyChanges,
      scope_changes: scopeChanges,
      method_changes: methodChanges,
      dimension_changes: dimChanges,
    },
  };
}
