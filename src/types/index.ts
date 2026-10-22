export type IPALocation = 
  | 'IPA Buaran 1'
  | 'IPA Buaran 2'
  | 'IPA Buaran 3'
  | 'IPA Pejompongan 1'
  | 'IPA Pejompongan 2'
  | 'IPA Pulogadung';

export type BAType = 
  | 'MC-0' 
  | 'Peninjauan Lapangan' 
  | 'Tes Komisioning' 
  | 'MC-100';

export type ApprovalStatus = 
  | 'DRAFT'
  | 'VERIFIKASI_BA'
  | 'REVIEW_TEKNIS'
  | 'REVIEW_FINANSIAL'
  | 'PENGESAHAN_KADEP'
  | 'DISETUJUI'
  | 'REVISI_DIBUTUHKAN';

export type UserRole = 
  | 'Site Engineer PMO'
  | 'Lead Technical Reviewer'
  | 'Financial & Commercial PMO'
  | 'Kepala Departemen PMO';

export interface TigresRef {
  folderPath?: string;
  url?: string;
  docNumber?: string;
}

export interface ProposalApprovalParty {
  party: 'SUCOFINDO' | 'PAMJAYA';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedBy?: string;
  decidedAt?: string;
  note?: string;
  tigresRef?: TigresRef;
}

export interface ProposalModifikasi {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  ipa: IPALocation;
  proposalNumber: string;
  triggerDeviationPct: number;
  netVarianceValue: number;
  thresholdPct: number;
  summary: string;
  status: 'DRAFT' | 'DIAJUKAN' | 'DISETUJUI' | 'DITOLAK';
  tigresRef?: TigresRef;
  approvals: ProposalApprovalParty[];
  createdAt: string;
}

export interface GateChecklistItem {
  id: string;
  taskName: string;
  isCompleted: boolean;
  checkedBy?: string;
  checkedAt?: string;
}

export interface ProjectGate {
  projectId: string;
  items: GateChecklistItem[];
}

export interface BOQItem {
  id: string;
  wbsCode: string; // e.g., "CIV-01", "PIP-04"
  itemName: string;
  unit: string;
  dedVolume: number;
  fieldVolume: number;
  unitPrice: number;
  // Evidence linking
  linkedBaId?: string;
  linkedBaItemName?: string;
  evidenceStatus: 'VERIFIED' | 'MISSING_BA' | 'NAME_MISMATCH' | 'VOLUME_OVER_CLAIM';
  similarityScore?: number; // 0-100%
  justificationReason: string;
}

export interface AttachmentProof {
  id: string;
  title: string;
  type: 'FOTO_LAPANGAN' | 'LEMBAR_UKUR' | 'HASIL_LAB' | 'GAMBAR_SKETSA';
  url: string;
  uploadedAt: string;
  caption: string;
  stationingOrLocation: string;
}

export interface BeritaAcaraItem {
  id: string;
  rawNameInBA: string;
  canonicalWbsCode?: string;
  measuredVolume: number;
  unit: string;
  stationing: string;
  testResultNotes?: string;
  complianceStatus: 'SESUAI' | 'DEVIASI_DISETUJUI' | 'TIDAK_MEMENUHI_SYARAT';
}

export interface DigitalSignatory {
  role: string;
  name: string;
  institution: string; // e.g., 'PT Air Bersih Jakarta (PMO)', 'PT Wijaya Konstruksi (Kontraktor)', 'PT Sucofindo (Persero) (Pengawas)'
  signedAt?: string;
  isSigned: boolean;
  signatureHash?: string;
}

export interface BeritaAcara {
  id: string;
  projectId: string;
  ipa: IPALocation;
  baType: BAType;
  baNumber: string; // e.g. "014/BA-MC0/PMO-CYC/ABJ/IV/2026"
  date: string;
  locationDetails: string;
  agenda: string;
  notes: string;
  items: BeritaAcaraItem[];
  attachments: AttachmentProof[];
  signatories: DigitalSignatory[];
  status: 'DRAFT' | 'VERIFIKASI' | 'TERBIT';
  weatherCondition?: string;
  waterQualityMetrics?: {
    turbidityNTU?: number;
    pH?: number;
    chlorinePPM?: number;
    pressureBar?: number;
    flowRateLPS?: number;
  };
  tigresRef?: TigresRef;
}

export interface ApprovalHistory {
  step: string;
  actor: string;
  role: string;
  date: string;
  status: 'APPROVED' | 'REVISION_REQUESTED' | 'PENDING';
  comments: string;
}

export interface JustifikasiDocument {
  id: string;
  projectId: string;
  numberJustek: string; // e.g. "JUSTEK/CYC-BR2/2026/003"
  numberJusfin: string; // e.g. "JUSFIN/CYC-BR2/2026/003"
  submissionDate: string;
  effectiveDate?: string;
  status: ApprovalStatus;
  urgencyLevel: 'TINGGI' | 'SEDANG' | 'STANDAR';
  
  // Justifikasi Teknis specifics
  engineeringContext: {
    dedBaselineDescription: string;
    fieldAnomalyFound: string;
    rootCauseCategory: 'STRUKTUR_TANAH' | 'OBSTRUKSI_UTILITAS_EKSISTING' | 'OPTIMALISASI_PROSES_AIR' | 'PENINGKATAN_SPESIFIKASI' | 'KONDISI_DARURAT';
    technicalSolutionRecommended: string;
    qualityImpact: string;
  };

  // Justifikasi Finansial specifics
  financialSummary: {
    originalContractValue: number;
    additionalWorksValue: number; // Pekerjaan Tambah
    reducedWorksValue: number;    // Pekerjaan Kurang
    netVarianceValue: number;     // (+ / -)
    revisedContractValue: number;
    variancePercentage: number;   // % change
    budgetSource: 'CAPEX PMO CYCLICAL 2026' | 'CADANGAN KONTINGENSI' | 'REALOKASI POS ANGGARAN';
  };

  items: BOQItem[];
  approvalHistory: ApprovalHistory[];
  currentApprovalStage: number; // 1 to 5
  tigresRef?: TigresRef;
}

export type ProjectStatus = 'BERJALAN' | 'MENUNGGU_JUSTIFIKASI' | 'KRITIS' | 'SELESAI' | 'STOP_WORK';

export interface Project {
  id: string;
  code: string; // e.g., "CYC-BR1-2026-01"
  name: string;
  ipa: IPALocation;
  contractorName: string;
  supervisingConsultant: string;
  startDate: string;
  endDate: string;
  revisedEndDate?: string;
  
  // Financials
  contractValue: number;
  realizationValue: number;
  realizationPercentage: number;
  justificationDelta: number;
  
  // Progress
  progressPhysicalPlanned: number;
  progressPhysicalActual: number;
  progressDeviation: number; // actual - planned
  status: ProjectStatus;
  
  // Relations
  justifikasi?: JustifikasiDocument;
  beritaAcaraList: BeritaAcara[];
}

export interface DiscrepancyReport {
  id: string;
  projectId: string;
  projectName: string;
  ipa: IPALocation;
  type: 'UNSUBSTANTIATED_JUSTEK' | 'NAMING_VARIATION' | 'VOLUME_MISMATCH';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  justekItemName: string;
  baItemName?: string;
  confidenceMatch?: number;
  suggestedAction: string;
  resolved: boolean;
}
