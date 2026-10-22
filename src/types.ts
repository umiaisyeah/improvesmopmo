export type VerificationStatus =
  | 'VERIFIED'
  | 'MISMATCH'
  | 'NOT FOUND'
  | 'NEED SUPPORT'
  | 'REVIEW'
  | 'VISUAL_REVIEW';

export type ProgramDomain =
  | 'ELECTRICAL'
  | 'PIPING_WATER'
  | 'CIVIL_STRUCTURE'
  | 'MECHANICAL_HVAC'
  | 'INSTRUMENTATION_SCADA'
  | 'GENERAL_PROCUREMENT'
  | 'UNIVERSAL_MULTI';

export interface ProgramProfileConfig {
  id: string;
  domain: ProgramDomain;
  name: string;
  icon: string;
  badgeColor: string;
  description: string;
  positiveKeywords: string[];
  negativeBoundaries: Record<string, string[]>;
  mandatoryEvidenceTypes: string[];
  unitMatchers: string[];
  toleranceRules: {
    maxRabDeltaPct: number;
    allowEquivalentBrands: boolean;
    strictMaterialSpec: boolean;
  };
}

export type TechnicalCategory =
  | 'Material Change'
  | 'Dimension Change'
  | 'Quantity Change'
  | 'Configuration Change'
  | 'Method Change'
  | 'Scope Change'
  | 'Location Change'
  | 'Installation Change'
  | 'Specification Change'
  | 'No Technical Change';

export type ExceptionPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ProjectIdentity {
  projectName: string;
  projectCode: string;
  subproject: string;
  location: string;
  contractor: string;
  poNumber: string;
  baplNumber: string;
  date: string;
  revision: string;
  packageContractInfo: string;
  // Comparison against Excel
  excelProjectCode?: string;
  excelPoNumber?: string;
  identityMatchStatus: 'MATCH' | 'MISMATCH' | 'REVIEW';
  mismatchDetails?: string[];
}

export interface TechnicalChange {
  change_id: string; // e.g. "CHG-001"
  item: string;
  attribute: string; // e.g. "Bentuk Tiang & Dimensi Pipa"
  parameter: string;
  baseline: string;
  proposed: string; // JusTek claim
  actual_bapl: string; // Extracted from BAPL
  unit: string;
  cause: string;
  risk: string;
  benefit: string;
  category: TechnicalCategory;
  has_financial_change: boolean;
  match: boolean;
  evidence_found: boolean;
  evidence_page?: number;
  evidence_snippet?: string;
  evidence_document?: string;
  superseded_info?: string;
  revision_history?: Array<{
    source_document: string;
    page: number;
    statement: string;
    date?: string;
    is_latest: boolean;
  }>;
  ocr_confidence: number;
  matching_confidence: number;
  technical_status: VerificationStatus;
  final_status: VerificationStatus;
  evidence_ids: string[];
  sub_specs_baseline?: string[];
  sub_specs_proposed?: string[];
  sub_specs_differences?: string[];
  implicit_correlation_analysis?: string;
  evidence_type?: 'EXPLICIT' | 'IMPLICIT' | 'NONE';
  implicit_rationale?: string;
  multi_evidence?: Array<{
    doc_name: string;
    doc_type: string;
    page: number;
    snippet: string;
    statement: string;
    is_explicit: boolean;
    explanation?: string;
  }>;
}

export interface FinancialItem {
  change_id: string;
  item: string;
  unit: string;
  qty_initial: number;
  qty_revised: number;
  delta_qty: number;
  unit_price_initial: number;
  unit_price_revised: number;
  delta_unit_price: number;
  total_initial: number;
  total_revised: number;
  calculated_initial: number;
  calculated_revised: number;
  delta_value: number;
  delta_percentage: number;
  threshold_exceeded: boolean;
  proposal_modification_required: boolean;
  justification: string;
  stated_jusfin_delta?: number;
  calculation_status: 'VERIFIED' | 'MISMATCH';
  financial_status: VerificationStatus;
  explanation?: string;
  is_changed?: boolean;
  sub_specs_initial?: string[];
  sub_specs_revised?: string[];
  sub_specs_differences?: string[];
  evidence_found?: boolean;
  evidence_type?: 'EXPLICIT' | 'IMPLICIT' | 'NONE';
  implicit_rationale?: string;
  actual_bapl?: string;
  evidence_page?: number;
  evidence_snippet?: string;
  traceability_ref_id?: string;
  has_valid_ba_ref?: boolean;
  ba_anomaly_type?:
    | 'NONE'
    | 'ANOMALI_ANGKA_TANPA_REFERENSI_BA'
    | 'ANOMALI_DEVIASI_NILAI_BA'
    | 'ANOMALI_DIMENSI_SATUAN'
    | 'ANOMALI_HARGA_TANPA_AHSP';
  ba_anomaly_description?: string;
  ba_reference_clause?: {
    doc_name: string;
    doc_type: string;
    page: number;
    clause: string;
    matched_qty?: number;
    matched_price?: number;
    matched_unit?: string;
  };
  multi_evidence?: Array<{
    doc_name: string;
    doc_type: string;
    page: number;
    snippet: string;
    statement: string;
    is_explicit: boolean;
    explanation?: string;
  }>;
}

export interface TotalRabVerification {
  rab_initial: number;
  rab_revised: number;
  system_calculated_delta: number;
  system_calculated_percentage: number;
  stated_jusfin_delta: number;
  delta_match: boolean;
  threshold_percentage: number; // e.g. 0.10 (10%)
  threshold_exceeded: boolean;
  proposal_modification_required: boolean;
  status: VerificationStatus;
  explanation: string;
}

export interface TraceabilityRecord {
  change_id: string;
  item: string;
  rab_initial: string;
  justek_claim: string;
  bapl_evidence: string;
  rab_revised: string;
  jusfin_claim: string;
  mco_document: string;
  evidence_refs: string;
  technical_status: VerificationStatus;
  financial_status: VerificationStatus;
  final_status: VerificationStatus;
  chain_consistent: boolean;
  notes: string;
  superseded_info?: string;
  evidence_document?: string;
  evidence_type?: 'EXPLICIT' | 'IMPLICIT' | 'NONE';
  implicit_rationale?: string;
  traceability_ref_id?: string;
  has_valid_ba_ref?: boolean;
  ba_anomaly_type?: string;
  ba_anomaly_description?: string;
  multi_evidence?: Array<{
    doc_name: string;
    doc_type: string;
    page: number;
    snippet: string;
    statement: string;
    is_explicit: boolean;
    explanation?: string;
  }>;
}

export interface EvidenceRecord {
  evidence_id: string; // e.g. "EV-001"
  change_id: string;
  item_name?: string;
  source: 'BAPL' | 'JusTek' | 'JusFin' | 'RAB' | 'MCO' | 'Drawing' | 'TestReport' | 'PO';
  document: string;
  page: number;
  snippet: string;
  full_clause?: string;
  clause_title?: string;
  verified_specs?: string[];
  cross_references?: string[];
  field_facts?: Array<{ label: string; value: string; is_match: boolean }>;
  authenticity_indicators?: string[];
  implicit_correlation_note?: string;
  source_type: 'OCR' | 'Native Text' | 'Visual / Drawing' | 'Table' | 'As-built Sketch';
  confidence: number;
  evidence_status: VerificationStatus;
  is_superseded?: boolean;
  superseded_by?: string;
  revision_tag?: string;
  is_explicit?: boolean;
  evidence_type?: 'EXPLICIT' | 'IMPLICIT' | 'NONE';
  explanation?: string;
  doc_type?: string;
}

export type ExceptionCategoryType =
  | 'BELUM_MASUK_JUSTEK_JUSFIN'
  | 'BUKTI_KURANG_LENGKAP'
  | 'DEVIASI_ANGKA_VOLUME'
  | 'OUTPUT_FORMAL_TANPA_BUKTI'
  | 'KESALAHAN_ARITMETIKA'
  | 'KETIDAKSINKRONAN_REKAP'
  | 'ANOMALI_ANGKA_TANPA_REFERENSI_BA'
  | 'ANOMALI_DEVIASI_NILAI_BA'
  | 'ANOMALI_DIMENSI_SATUAN'
  | 'ANOMALI_HARGA_TANPA_AHSP';

export interface HowToIncorporateGuide {
  justek_clause_guide: string;
  jusfin_rab_guide: string;
  required_supporting_docs: string[];
  contract_amendment_clause: string;
}

export interface ExceptionRecord {
  exception_id: string;
  priority: ExceptionPriority;
  change_id: string;
  source: string;
  finding: string;
  expected: string;
  actual: string;
  impact: string;
  recommended_action: string;
  status: VerificationStatus;
  category_type?: ExceptionCategoryType;
  error_detail?: string;
  substantiation_gap?: string;
  how_to_incorporate?: HowToIncorporateGuide;
  document_reference?: {
    source_name: string;
    page_or_sheet?: string | number;
    quoted_text?: string;
  };
}

export interface RawBaplPage {
  page: number;
  source: string;
  extracted_text: string;
  ocr_confidence: number;
  has_visual_elements: boolean;
  doc_index?: number;
  doc_total?: number;
  doc_date?: string;
  doc_rank?: number;
  is_latest_doc?: boolean;
  detected_ink_colors?: string[]; // e.g. ['Tinta Biru', 'Tinta Merah', 'Tinta Hitam']
  handwritten_sections?: Array<{
    text: string;
    ink_color?: string;
    type?: 'Opname Fisik' | 'Catatan Lapangan' | 'Koreksi Angka' | 'Paraf / Tanda Tangan' | 'Stempel';
  }>;
}

export interface SystemConfig {
  financial_threshold_percentage: number; // default 0.10 (10%)
  quantity_tolerance: number; // default 0.001
  money_tolerance: number; // default 1 (Rp1)
  pmo_organization: string;
  auto_flag_discrepancy: boolean;
  string_matching_threshold?: number;
  auto_generate_excel?: boolean;
  active_program_domain?: ProgramDomain;
  auto_detect_domain?: boolean;
  strict_domain_boundaries?: boolean;
  custom_program_profiles?: ProgramProfileConfig[];
}

export interface HumanReview {
  pmo_review_status:
    | 'PENDING'
    | 'VERIFIED_ACCEPT'
    | 'CONDITIONAL_APPROVAL'
    | 'REJECT_REVISE'
    | 'APPROVED'
    | 'CONDITIONAL'
    | 'REJECTED';
  pmo_comments: string;
  final_decision: string;
  reviewed_by: string;
  review_date: string;
}

export interface VerificationResult {
  project: ProjectIdentity;
  config: SystemConfig;
  changes: TechnicalChange[];
  financial_items: FinancialItem[];
  total_rab: TotalRabVerification;
  traceability: TraceabilityRecord[];
  evidences: EvidenceRecord[];
  exceptions: ExceptionRecord[];
  raw_bapl: RawBaplPage[];
  human_review: HumanReview;
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
  program_profile?: {
    domain: ProgramDomain;
    name: string;
    autoDetected: boolean;
    confidence: number;
    matchedKeywords: string[];
    boundariesApplied: string[];
  };
  audit_notes?: string[];
  selected_sheets?: Record<string, { sheetName: string; allCandidates: string[]; reason: string }>;
  multi_bapl_summary?: {
    total_documents: number;
    sorted_files: string[];
    superseded_count: number;
    details: string[];
  };
  supporting_documents?: Array<{
    fileName: string;
    fileType: string;
    docNumber?: string;
    status: string;
    itemsResolvedCount: number;
    snippet: string;
  }>;
  generated_at: string;
}

export interface DocumentPackage {
  id: string;
  title: string;
  projectCode: string;
  projectName: string;
  baplFiles: { name: string; size: number; pageCount?: number }[];
  justekFiles?: { name: string; size: number }[];
  excelFiles?: { name: string; size: number }[];
  projectFiles?: { name: string; size: number; type?: string }[];
  excelFileName?: string;
  supportingFiles: { name: string; size: number }[];
  createdAt: string;
  status: 'COMPLETED' | 'PROCESSING' | 'ERROR';
  result: VerificationResult;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  category: 'BAPL' | 'JUSTEK_PDF' | 'EXCEL_PROJECT' | 'SUPPORTING';
  contentBase64?: string;
  text?: string;
  sheets?: Record<string, any[]>;
}

// Re-export domain types for water project, Berita Acara, and justification components
export * from './types/index';

