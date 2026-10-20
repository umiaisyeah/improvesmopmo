import {
  VerificationResult,
  SystemConfig,
  ProjectIdentity,
  TechnicalChange,
  FinancialItem,
  TotalRabVerification,
  TraceabilityRecord,
  EvidenceRecord,
  ExceptionRecord,
  RawBaplPage,
  HumanReview,
} from '../types';
import { DEFAULT_CONFIG } from '../config/defaultConfig';

export const GOLDEN_PROJECT_IDENTITY: ProjectIdentity = {
  projectName: 'Cyclical Maintenance',
  projectCode: '46223A',
  subproject: 'Penggantian IPP Area Gedung Distribusi, Filter, dan Substation',
  location: 'Gedung Distribusi, Filter, & Substation Unit Induk',
  contractor: 'PT. Rekatama Elektrikal Mandiri',
  poNumber: 'PO-46223-PLN-2026',
  baplNumber: 'BAPL/46223A/CM-IPP/VIII/2026',
  date: '2026-08-14',
  revision: 'Rev.01',
  packageContractInfo: 'Paket Pekerjaan Pemeliharaan Sistem Proteksi Petir Area Distribusi',
  excelProjectCode: '46223A',
  excelPoNumber: 'PO-46223-PLN-2026',
  identityMatchStatus: 'MATCH',
};

export const GOLDEN_RAW_BAPL: RawBaplPage[] = [
  {
    page: 1,
    source: 'BAPL/46223A/CM-IPP/VIII/2026',
    extracted_text: `BERITA ACARA PENINJAUAN LAPANGAN (BAPL)
Nomor: BAPL/46223A/CM-IPP/VIII/2026
Kode Proyek: 46223A
Nomor PO: PO-46223-PLN-2026
Proyek: Cyclical Maintenance
Subproyek: Penggantian IPP Area Gedung Distribusi, Filter, dan Substation
Tanggal Pemeriksaan: 14 Agustus 2026
Kontraktor Pelaksana: PT. Rekatama Elektrikal Mandiri
Konsultan Pengawas / PMO: Tim Pengawas Lapangan PLN Unit Induk

Berdasarkan hasil peninjauan bersama di lokasi Gedung Distribusi, Filter, dan Substation, telah dilakukan verifikasi fisik, pengukuran dimensi, dan pengujian terhadap item pekerjaan proteksi petir terpasang.`,
    ocr_confidence: 0.98,
    has_visual_elements: false,
  },
  {
    page: 2,
    source: 'BAPL/46223A/CM-IPP/VIII/2026',
    extracted_text: `HASIL PEMERIKSAAN FISIK & STRUKTUR TIANG PENANGKAL PETIR:
1. Tiang Penyangga Penangkal Petir H = 5 Meter:
   - Kondisi terpasang: Tiang pipa ROUND / BULAT, bahan Hot Dip Galvanized.
   - Dimensi pipa bertingkat: 2" (bawah) dan 2.5" (atas), lengkap klem penahan & baseplate 300x300x12 mm.
   - Kesesuaian fisik: Terpasang kokoh pada dinding parapet Gedung Filter.

2. Tiang Penyangga Penangkal Petir H = 15 Meter:
   - Kondisi terpasang: Tiang pipa ROUND / BULAT bertingkat teleskopik, bahan Hot Dip Galvanized.
   - Dimensi pipa bertingkat aktual: 2" - 2.5" - 3" - 4" - 5" (5 segmen pipa bulat).
   - Pengikatan: Baseplate 400x400x16 mm dengan 4 anchor bolt M20 dan tali labrang / guy wire 4 arah.
   - Status visual: Terpasang tegak lurus, tidak ada lendutan.`,
    ocr_confidence: 0.96,
    has_visual_elements: true,
  },
  {
    page: 3,
    source: 'BAPL/46223A/CM-IPP/VIII/2026',
    extracted_text: `HASIL PENGUKURAN PANJANG KABEL COAXIAL (DOWN CONDUCTOR):
Pengukuran panjang fisik kabel coaxial 2 x 35 mm terpasang pada cable tray dan jalur proteksi petir:
- Rute Jalur Gedung Distribusi: 58,2 m
- Rute Jalur Gedung Filter: 62,0 m
- Rute Jalur Substation: 56,2 m
--------------------------------------------------
TOTAL PANJANG AKTUAL TERPASANG = 176,4 Meter
(Catatan: Berkurang 3,6 Meter dari baseline 180 Meter karena optimasi rute tarikan lurus pada tray horizontal).`,
    ocr_confidence: 0.97,
    has_visual_elements: false,
  },
  {
    page: 4,
    source: 'BAPL/46223A/CM-IPP/VIII/2026',
    extracted_text: `HASIL PEMERIKSAAN JASA PEMASANGAN & PENGKABELAN:
- Pekerjaan instalasi kabel coaxial 2 x 35 mm terpasang pada tiang galvanis dan tray pelindung.
- Telah dilakukan terminasi kabel, pemasangan klem isolasi, dan penyambungan ke sistem grounding H = 12 m.
- Pengujian nilai tahanan pembumian (earth tester):
  * Gedung Distribusi: 1,42 Ohm (< 2 Ohm) - MEMENUHI SYARAT
  * Gedung Filter: 1,65 Ohm (< 2 Ohm) - MEMENUHI SYARAT
  * Substation: 1,18 Ohm (< 2 Ohm) - MEMENUHI SYARAT
Catatan: Seluruh jasa terminasi coaxial & grounding telah selesai 100%.`,
    ocr_confidence: 0.94,
    has_visual_elements: false,
  },
  {
    page: 5,
    source: 'BAPL/46223A/CM-IPP/VIII/2026',
    extracted_text: `CATATAN AKHIR & PEMERIKSAAN AIR TERMINAL:
- Air Terminal Unit proteksi petir telah terpasang pada ujung tiang H=15m dan tiang H=5m.
- Fisik terminal terpasang dari bahan tembaga berlapis stainless.
(CATATAN KHUSUS PMO: Tidak tercantum pencatatan tipe Early Streamer Emission / ESE maupun radius proteksi R=105m pada sertifikat lapangan BAPL ini; hanya tertulis terpasang terminal petir utama).

Dibuat & disahkan oleh:
1. Kontraktor Pelaksana: PT. Rekatama Elektrikal Mandiri (Ir. Hendra Saputra - Project Manager)
2. Pengawas Lapangan PLN: (Ahmad Fauzi - Site Engineer)
3. Koordinator PMO: (Dewantara - PMO Lead)`,
    ocr_confidence: 0.95,
    has_visual_elements: true,
  },
];

export const GOLDEN_CHANGES: TechnicalChange[] = [
  {
    change_id: 'CHG-001',
    item: 'Tiang Penyangga H = 5 Meter',
    attribute: 'Bentuk Tiang & Dimensi Pipa',
    parameter: 'Geometry & Diameter Tiang',
    baseline: 'Tiang Hexagonal (segi enam), pipa 1.5" - 2" - 2.5"',
    proposed: 'Tiang Round (bulat), pipa 2" - 2.5"',
    actual_bapl: '[HASIL PEMERIKSAAN FISIK & STRUKTUR TIANG PENANGKAL PETIR - Poin 1] Tiang pipa ROUND / BULAT, bahan Hot Dip Galvanized. Dimensi pipa bertingkat: 2" (bawah) dan 2.5" (atas), lengkap klem penahan & baseplate 300x300x12 mm. Kesesuaian fisik: Terpasang kokoh pada dinding parapet Gedung Filter.',
    unit: 'Unit',
    cause: 'Ketersediaan material fabrikasi round pipe galvanis lebih cepat dan tahan korosi lingkungan gardu.',
    risk: 'Jika tetap hexagonal, lead time fabrikasi bertambah 4 minggu dan berpotensi menunda COD.',
    benefit: 'Stabilitas aerodinamis lebih baik terhadap beban angin dan instalasi lebih presisi.',
    category: 'Material Change',
    has_financial_change: false,
    match: true,
    evidence_found: true,
    evidence_page: 2,
    evidence_snippet: `1. Tiang Penyangga Penangkal Petir H = 5 Meter:
   - Kondisi terpasang: Tiang pipa ROUND / BULAT, bahan Hot Dip Galvanized.
   - Dimensi pipa bertingkat: 2" (bawah) dan 2.5" (atas), lengkap klem penahan & baseplate 300x300x12 mm.
   - Kesesuaian fisik: Terpasang kokoh pada dinding parapet Gedung Filter.`,
    ocr_confidence: 0.96,
    matching_confidence: 0.98,
    technical_status: 'VERIFIED',
    final_status: 'VERIFIED',
    evidence_ids: ['EV-001'],
    implicit_correlation_analysis: 'KORELASI TEKNIS & FINANSIAL: Temuan fisik pipa round Hot Dip Galvanized 2"-2.5" pada BAPL Hal 2 mengonfirmasi justifikasi teknis bahwa bentuk silindris memiliki koefisien drag angin lebih rendah (Cd ~0.7 vs Cd ~1.2 pada heksagonal) saat dipasang di parapet atas. Secara finansial, harga satuan tetap kompensatif (Rp 28.500.000) tanpa menimbulkan selisih penambahan biaya pada JusFin (Delta Rp 0).',
  },
  {
    change_id: 'CHG-002',
    item: 'Tiang Penyangga H = 15 Meter',
    attribute: 'Bentuk Tiang & Dimensi Teleskopik',
    parameter: 'Geometry & Segment Pipa',
    baseline: 'Tiang Hexagonal, pipa 1.5" - 2" - 2.5"',
    proposed: 'Tiang Round (bulat) teleskopik 5 segmen: 2" - 2.5" - 3" - 4" - 5"',
    actual_bapl: '[HASIL PEMERIKSAAN FISIK & STRUKTUR TIANG PENANGKAL PETIR - Poin 2] Tiang pipa ROUND / BULAT bertingkat teleskopik, bahan Hot Dip Galvanized. Dimensi pipa bertingkat aktual: 2" - 2.5" - 3" - 4" - 5" (5 segmen pipa bulat). Pengikatan: Baseplate 400x400x16 mm dengan 4 anchor bolt M20 dan tali labrang / guy wire 4 arah. Status visual: Terpasang tegak lurus, tidak ada lendutan.',
    unit: 'Unit',
    cause: 'Struktur tiang 15 meter memerlukan momen inersia lebih besar untuk menahan hembusan angin kencang area terbuka.',
    risk: 'Kelemahan struktur tiang jika menggunakan dimensi kecil 1.5" pada ketinggian 15m.',
    benefit: 'Kapasitas lentur meningkat signifikan, memenuhi standar kekuatan struktur menara penangkal petir.',
    category: 'Dimension Change',
    has_financial_change: false,
    match: true,
    evidence_found: true,
    evidence_page: 2,
    evidence_snippet: `2. Tiang Penyangga Penangkal Petir H = 15 Meter:
   - Kondisi terpasang: Tiang pipa ROUND / BULAT bertingkat teleskopik, bahan Hot Dip Galvanized.
   - Dimensi pipa bertingkat aktual: 2" - 2.5" - 3" - 4" - 5" (5 segmen pipa bulat).
   - Pengikatan: Baseplate 400x400x16 mm dengan 4 anchor bolt M20 dan tali labrang / guy wire 4 arah.
   - Status visual: Terpasang tegak lurus, tidak ada lendutan.`,
    ocr_confidence: 0.96,
    matching_confidence: 0.97,
    technical_status: 'VERIFIED',
    final_status: 'VERIFIED',
    evidence_ids: ['EV-002'],
    implicit_correlation_analysis: 'KORELASI TEKNIS & FINANSIAL: Pemasangan 5 segmen teleskopik hingga diameter 5" dengan baseplate 400x400x16 mm pada BAPL Hal 2 secara struktural mengamankan momen lentur beban lateral tinggi (ketinggian 15 m di area terbuka). Kontraktor menyerap penyesuaian dimensi ini dalam harga kontrak awal (Rp 75.000.000), sehingga selaras 100% dengan Justifikasi Teknis dan Justifikasi Finansial (Zero Cost Variance).',
  },
  {
    change_id: 'CHG-003',
    item: 'Kabel Coaxial Down Conductor',
    attribute: 'Panjang Penarikan Kabel',
    parameter: 'Quantity Kabel',
    baseline: '180,0 Meter (Kabel Coaxial 2 x 35 mm)',
    proposed: '176,4 Meter (penyesuaian rute cable tray aktual)',
    actual_bapl: '[HASIL PENGUKURAN PANJANG KABEL COAXIAL - Total Aktual] Pengukuran panjang fisik kabel coaxial 2 x 35 mm terpasang: Rute Gedung Distribusi: 58,2 m, Rute Gedung Filter: 62,0 m, Rute Substation: 56,2 m. TOTAL PANJANG AKTUAL TERPASANG = 176,4 Meter (Berkurang 3,6 Meter dari baseline 180 Meter karena optimasi rute tarikan lurus pada tray horizontal).',
    unit: 'Meter',
    cause: 'Optimasi rute penarikan kabel horizontal pada cable tray eksisting tanpa belokan berlebih.',
    risk: 'Pemborosan kabel jika dipotong sesuai estimasi awal 180m.',
    benefit: 'Impedansi jalur grounding lebih rendah karena rute lebih pendek dan penghematan biaya material.',
    category: 'Quantity Change',
    has_financial_change: true,
    match: true,
    evidence_found: true,
    evidence_page: 3,
    evidence_snippet: `HASIL PENGUKURAN PANJANG KABEL COAXIAL (DOWN CONDUCTOR):
Pengukuran panjang fisik kabel coaxial 2 x 35 mm terpasang pada cable tray dan jalur proteksi petir:
- Rute Jalur Gedung Distribusi: 58,2 m
- Rute Jalur Gedung Filter: 62,0 m
- Rute Jalur Substation: 56,2 m
--------------------------------------------------
TOTAL PANJANG AKTUAL TERPASANG = 176,4 Meter
(Catatan: Berkurang 3,6 Meter dari baseline 180 Meter karena optimasi rute tarikan lurus pada tray horizontal).`,
    ocr_confidence: 0.97,
    matching_confidence: 0.99,
    technical_status: 'VERIFIED',
    final_status: 'VERIFIED',
    evidence_ids: ['EV-003'],
    implicit_correlation_analysis: 'KORELASI TEKNIS & FINANSIAL: Hasil pengukuran rute 3 gedung (58,2m + 62,0m + 56,2m = 176,4m) pada BAPL Hal 3 secara langsung membuktikan efisiensi rute tarikan kabel (penurunan 3,6 meter dari baseline 180m). Secara finansial, ini berkorelasi persis dengan Justifikasi Finansial: Volume berkurang dari 180 m menjadi 176,4 m x Rp 475.000/m menghasilkan efisiensi/penghematan biaya sebesar -Rp 1.710.000.',
  },
  {
    change_id: 'CHG-004',
    item: 'Jasa Pemasangan & Pengkabelan',
    attribute: 'Scope Pekerjaan & Metode Instalasi',
    parameter: 'Metode Instalasi Coaxial & Grounding',
    baseline: 'Kabel NYA 70 mm + clamp / wiring tiang crane',
    proposed: 'Kabel coaxial 2 x 35 mm + tiang galvanis + sistem pembumian grounding H = 12 m',
    actual_bapl: '[HASIL PEMERIKSAAN JASA PEMASANGAN & PENGKABELAN] Pekerjaan instalasi kabel coaxial 2 x 35 mm terpasang pada tiang galvanis dan tray pelindung. Telah dilakukan terminasi kabel, pemasangan klem isolasi, dan penyambungan ke sistem grounding H = 12 m. Pengujian nilai tahanan pembumian (earth tester): Gedung Distribusi: 1,42 Ohm, Gedung Filter: 1,65 Ohm, Substation: 1,18 Ohm (< 2 Ohm - MEMENUHI SYARAT). Seluruh jasa terminasi coaxial & grounding telah selesai 100%.',
    unit: 'Lot / Paket',
    cause: 'Penyesuaian terhadap tipe kabel coaxial yang membutuhkan metode grounding khusus terisolasi hingga elektroda tanah.',
    risk: 'Sistem proteksi induksi kilat petir tidak berfungsi optimal bila menggunakan metode lama NYA.',
    benefit: 'Sistem proteksi petir terisolasi penuh, mencegah flashover ke struktur bangunan gedung.',
    category: 'Scope Change',
    has_financial_change: true,
    match: true,
    evidence_found: true,
    evidence_page: 4,
    evidence_snippet: `HASIL PEMERIKSAAN JASA PEMASANGAN & PENGKABELAN:
- Pekerjaan instalasi kabel coaxial 2 x 35 mm terpasang pada tiang galvanis dan tray pelindung.
- Telah dilakukan terminasi kabel, pemasangan klem isolasi, dan penyambungan ke sistem grounding H = 12 m.
- Pengujian nilai tahanan pembumian (earth tester):
  * Gedung Distribusi: 1,42 Ohm (< 2 Ohm) - MEMENUHI SYARAT
  * Gedung Filter: 1,65 Ohm (< 2 Ohm) - MEMENUHI SYARAT
  * Substation: 1,18 Ohm (< 2 Ohm) - MEMENUHI SYARAT
Catatan: Seluruh jasa terminasi coaxial & grounding telah selesai 100%.`,
    ocr_confidence: 0.94,
    matching_confidence: 0.91,
    technical_status: 'VERIFIED',
    final_status: 'REVIEW',
    evidence_ids: ['EV-004'],
    implicit_correlation_analysis: 'KORELASI TEKNIS & FINANSIAL: Data pengukuran tahanan tanah pada BAPL Hal 4 (Distribusi 1,42 Ω, Filter 1,65 Ω, Substation 1,18 Ω) secara implisit membuktikan bahwa pemancangan elektroda pembumian sedalam 12 meter dan terminasi kabel khusus coaxial telah tereksekusi dengan benar (memenuhi syarat SNI < 2 Ohm). Pada JusFin, jasa instalasi disesuaikan dari Rp 35.000.000 menjadi Rp 42.000.000 (+Rp 7.000.000) yang terjustifikasi oleh kompleksitas terminasi kabel coaxial isolasi tinggi.',
  },
  {
    change_id: 'CHG-005',
    item: 'Air Terminal Unit',
    attribute: 'Teknologi & Radius Proteksi Petir',
    parameter: 'Spesifikasi Tipe Proteksi',
    baseline: 'Air Terminal Proteksi Petir Standar',
    proposed: 'Air Terminal Unit teknologi ESE (Early Streamer Emission) radius R = 105 m',
    actual_bapl: '[CATATAN AKHIR & PEMERIKSAAN AIR TERMINAL] Air Terminal Unit proteksi petir telah terpasang pada ujung tiang H=15m dan tiang H=5m. Fisik terminal terpasang dari bahan tembaga berlapis stainless. (CATATAN KHUSUS PMO: Tidak tercantum pencatatan tipe Early Streamer Emission / ESE maupun radius proteksi R=105m pada sertifikat lapangan BAPL ini; hanya tertulis terpasang terminal petir utama).',
    unit: 'Unit',
    cause: 'Kebutuhan radius proteksi menyeluruh untuk menjangkau gedung switchyard distribusi.',
    risk: 'Radius proteksi tidak mencakup area terluar jika bukan tipe ESE teruji.',
    benefit: 'Satu unit terminal mampu memproteksi area lebih luas dengan efisiensi tiang tinggi.',
    category: 'Specification Change',
    has_financial_change: false,
    match: false,
    evidence_found: false,
    evidence_page: 5,
    evidence_snippet: `CATATAN AKHIR & PEMERIKSAAN AIR TERMINAL:
- Air Terminal Unit proteksi petir telah terpasang pada ujung tiang H=15m dan tiang H=5m.
- Fisik terminal terpasang dari bahan tembaga berlapis stainless.
(CATATAN KHUSUS PMO: Tidak tercantum pencatatan tipe Early Streamer Emission / ESE maupun radius proteksi R=105m pada sertifikat lapangan BAPL ini; hanya tertulis terpasang terminal petir utama).`,
    ocr_confidence: 0.95,
    matching_confidence: 0.45,
    technical_status: 'NOT FOUND',
    final_status: 'NEED SUPPORT',
    evidence_ids: ['EV-005'],
    implicit_correlation_analysis: 'KORELASI TEKNIS & FINANSIAL: Audit sistem mendeteksi kesenjangan kritis (Gap Detection). Kontraktor mengklaim tipe ESE Radius 105m di JusTek, namun BAPL Hal 5 hanya mencatat fisik tembaga berlapis stainless tanpa menyertakan sertifikat uji lab radius ESE (NF C 17-102). Rekomendasi PMO: Tahan pengesahan teknis terminal petir sampai kontraktor melampirkan Factory Acceptance Test (FAT) / Sertifikat Radius Uji resmi.',
  },
];

export const GOLDEN_FINANCIAL_ITEMS: FinancialItem[] = [
  {
    change_id: 'CHG-001',
    item: 'Tiang Penyangga H = 5 Meter',
    unit: 'Unit',
    qty_initial: 2,
    qty_revised: 2,
    delta_qty: 0,
    unit_price_initial: 18500000,
    unit_price_revised: 18500000,
    delta_unit_price: 0,
    total_initial: 37000000,
    total_revised: 37000000,
    calculated_initial: 37000000,
    calculated_revised: 37000000,
    delta_value: 0,
    delta_percentage: 0,
    threshold_exceeded: false,
    proposal_modification_required: false,
    justification: 'Perubahan bentuk tiang dari hexagonal ke round tidak mengubah harga satuan kontrak (lump-sum per unit sesuai penawaran).',
    stated_jusfin_delta: 0,
    calculation_status: 'VERIFIED',
    financial_status: 'VERIFIED',
    explanation: 'Kuantitas dan harga satuan tetap sama. Tidak ada dampak finansial.',
    evidence_found: true,
    evidence_type: 'EXPLICIT',
    actual_bapl: '[PEMERIKSAAN TIANG PENYANGGA H=5M] Tiang penyangga penangkal petir tipe Round Pipe galvanis H = 5 meter terpasang pada dak atap Gedung Distribusi dan Gedung Filter (2 unit).',
    evidence_snippet: 'Tiang penyangga penangkal petir tipe Round Pipe galvanis H = 5 meter terpasang pada dak atap Gedung Distribusi dan Gedung Filter (2 unit).',
    evidence_page: 2,
    multi_evidence: [
      {
        doc_name: 'BAPL_Proyek_46223A.pdf',
        doc_type: 'BAPL',
        page: 2,
        snippet: 'Tiang penyangga penangkal petir tipe Round Pipe galvanis H = 5 meter terpasang pada dak atap Gedung Distribusi dan Gedung Filter (2 unit).',
        statement: 'Kondisi fisik 100% terpasang sesuai peninjauan lapangan.',
        is_explicit: true,
      },
    ],
  },
  {
    change_id: 'CHG-002',
    item: 'Tiang Penyangga H = 15 Meter',
    unit: 'Unit',
    qty_initial: 1,
    qty_revised: 1,
    delta_qty: 0,
    unit_price_initial: 65000000,
    unit_price_revised: 65000000,
    delta_unit_price: 0,
    total_initial: 65000000,
    total_revised: 65000000,
    calculated_initial: 65000000,
    calculated_revised: 65000000,
    delta_value: 0,
    delta_percentage: 0,
    threshold_exceeded: false,
    proposal_modification_required: false,
    justification: 'Modifikasi dimensi tiang 5 segmen teleskopik diakomodasi dalam harga kontrak tiang 15m tanpa eskalasi biaya.',
    stated_jusfin_delta: 0,
    calculation_status: 'VERIFIED',
    financial_status: 'VERIFIED',
    explanation: 'Kuantitas dan harga satuan tetap sama. Tidak ada dampak finansial.',
    evidence_found: true,
    evidence_type: 'EXPLICIT',
    actual_bapl: '[PEMERIKSAAN TIANG PENYANGGA H=15M] Tiang penyangga penangkal petir tipe Monopole Octagonal teleskopik 5 segmen H = 15 meter telah didirikan pada pondasi tapak dekat switchyard.',
    evidence_snippet: 'Tiang penyangga penangkal petir tipe Monopole Octagonal teleskopik 5 segmen H = 15 meter telah didirikan pada pondasi tapak dekat switchyard.',
    evidence_page: 2,
    multi_evidence: [
      {
        doc_name: 'BAPL_Proyek_46223A.pdf',
        doc_type: 'BAPL',
        page: 2,
        snippet: 'Tiang penyangga penangkal petir tipe Monopole Octagonal teleskopik 5 segmen H = 15 meter telah didirikan pada pondasi tapak dekat switchyard.',
        statement: 'Kondisi fisik 100% terpasang.',
        is_explicit: true,
      },
    ],
  },
  {
    change_id: 'CHG-003',
    item: 'Kabel Coaxial Down Conductor 2 x 35 mm',
    unit: 'Meter',
    qty_initial: 180.0,
    qty_revised: 176.4,
    delta_qty: -3.6,
    unit_price_initial: 900000,
    unit_price_revised: 900000,
    delta_unit_price: 0,
    total_initial: 162000000,
    total_revised: 158760000,
    calculated_initial: 162000000,
    calculated_revised: 158760000,
    delta_value: -3240000,
    delta_percentage: -0.02, // -2%
    threshold_exceeded: false,
    proposal_modification_required: false,
    justification: 'Penurunan kuantitas tarikan kabel sebesar 3,6 meter hasil opname aktual BAPL menghasilkan penghematan Rp 3.240.000.',
    stated_jusfin_delta: -3240000,
    calculation_status: 'VERIFIED',
    financial_status: 'VERIFIED',
    explanation: 'Perhitungan sistem Qty x Harga Satuan konsisten 100% dengan dokumen revisi.',
    evidence_found: true,
    evidence_type: 'EXPLICIT',
    actual_bapl: '[HASIL PENGUKURAN KABEL DOWN CONDUCTOR] Total panjang penarikan terpasang aktual = 176,4 meter (Distribusi 58,2m + Filter 62,0m + Substation 56,2m).',
    evidence_snippet: 'Total panjang penarikan terpasang aktual = 176,4 meter.',
    evidence_page: 3,
    multi_evidence: [
      {
        doc_name: 'BAPL_Proyek_46223A.pdf',
        doc_type: 'BAPL',
        page: 3,
        snippet: 'Total panjang penarikan terpasang aktual = 176,4 meter.',
        statement: 'Opname fisik aktual 176,4 Meter.',
        is_explicit: true,
      },
    ],
  },
  {
    change_id: 'CHG-004',
    item: 'Jasa Pemasangan & Pengkabelan Sistem Proteksi',
    unit: 'Lot',
    qty_initial: 1,
    qty_revised: 1,
    delta_qty: 0,
    unit_price_initial: 64350000,
    unit_price_revised: 58295376,
    delta_unit_price: -6054624,
    total_initial: 64350000,
    total_revised: 58295376,
    calculated_initial: 64350000,
    calculated_revised: 58295376,
    delta_value: -6054624,
    delta_percentage: -0.094089, // -9.41%
    threshold_exceeded: false,
    proposal_modification_required: false,
    justification: 'JusFin menyatakan efisiensi pekerjaan terminasi dan pengkabelan sebesar Rp 6.054.624, namun rincian breakdown HPS sub-item belum dilampirkan.',
    stated_jusfin_delta: -6054624,
    calculation_status: 'VERIFIED',
    financial_status: 'REVIEW',
    explanation: 'Perhitungan matematis benar, namun dasar penetapan penurunan harga satuan jasa memerlukan rincian analisa harga satuan (AHS).',
    evidence_found: true,
    evidence_type: 'IMPLICIT',
    actual_bapl: '[HASIL PEMERIKSAAN JASA PEMASANGAN & PENGKABELAN] Instalasi kabel coaxial terpasang pada tiang dan tray pelindung. Pengujian nilai tahanan pembumian (< 2 Ohm - MEMENUHI SYARAT). Jasa selesai 100%.',
    evidence_snippet: 'Pengujian nilai tahanan pembumian (< 2 Ohm - MEMENUHI SYARAT). Seluruh jasa terminasi coaxial & grounding telah selesai 100%.',
    evidence_page: 4,
    implicit_rationale: 'Hasil uji nilai tahanan tanah (< 2 Ohm) pada 3 gedung membuktikan pemancangan grounding 12m dan terminasi coaxial tuntas.',
    multi_evidence: [
      {
        doc_name: 'BAPL_Proyek_46223A.pdf',
        doc_type: 'BAPL',
        page: 4,
        snippet: 'Pengujian nilai tahanan pembumian (< 2 Ohm - MEMENUHI SYARAT). Seluruh jasa terminasi coaxial & grounding telah selesai 100%.',
        statement: 'Membuktikan pemancangan elektroda pembumian 12m dan terminasi coaxial tuntas.',
        is_explicit: false,
        explanation: 'Data tahanan pembumian terukur membuktikan bahwa pekerjaan instalasi pembumian elektroda 12m dan terminasi telah selesai.',
      },
    ],
  },
  {
    change_id: 'CHG-005',
    item: 'Air Terminal Unit Proteksi Petir',
    unit: 'Unit',
    qty_initial: 1,
    qty_revised: 1,
    delta_qty: 0,
    unit_price_initial: 85000000,
    unit_price_revised: 85000000,
    delta_unit_price: 0,
    total_initial: 85000000,
    total_revised: 85000000,
    calculated_initial: 85000000,
    calculated_revised: 85000000,
    delta_value: 0,
    delta_percentage: 0,
    threshold_exceeded: false,
    proposal_modification_required: false,
    justification: 'Harga terminal unit tetap sama sesuai kontrak awal.',
    stated_jusfin_delta: 0,
    calculation_status: 'VERIFIED',
    financial_status: 'VERIFIED',
    explanation: 'Nilai finansial tidak berubah. Namun status teknis menunggu pembuktian spesifikasi ESE.',
    evidence_found: false,
    evidence_type: 'NONE',
    actual_bapl: '[CATATAN AKHIR & PEMERIKSAAN AIR TERMINAL] Tidak tercantum pencatatan tipe Early Streamer Emission / ESE maupun radius proteksi R=105m pada sertifikat lapangan BAPL.',
    evidence_snippet: 'Tidak tercantum pencatatan tipe Early Streamer Emission / ESE maupun radius proteksi R=105m pada sertifikat lapangan BAPL.',
    evidence_page: 5,
    multi_evidence: [],
  },
];

export const GOLDEN_TOTAL_RAB: TotalRabVerification = {
  rab_initial: 988293278,
  rab_revised: 978998654,
  system_calculated_delta: -9294624, // 978,998,654 - 988,293,278
  system_calculated_percentage: -0.0094047, // -0.94047%
  stated_jusfin_delta: -1022408.58, // Discrepancy highlighted in Master Prompt Section 15!
  delta_match: false,
  threshold_percentage: 0.10, // 10%
  threshold_exceeded: false, // |-0.94%| < 10%
  proposal_modification_required: false,
  status: 'MISMATCH',
  explanation:
    'CRITICAL FINDING: Nilai yang ditampilkan pada dokumen JusFin (-Rp 1.022.408,58) tidak sama dengan selisih RAB Awal dan RAB Revisi berdasarkan perhitungan sistem (-Rp 9.294.624,00). Terdapat indikasi salah input formula pada rekapitulasi JusFin.',
};

export const GOLDEN_TRACEABILITY: TraceabilityRecord[] = [
  {
    change_id: 'CHG-001',
    item: 'Tiang Penyangga H = 5 Meter',
    rab_initial: 'Tiang Hexagonal pipa 1.5"-2"-2.5" (2 Unit, Rp 37.000.000)',
    justek_claim: 'Ubah ke Tiang Round 2"-2.5" karena ketersediaan fabrikasi cepat',
    bapl_evidence: 'BAPL Hal 2: Terpasang Tiang Round pipa galvanis 2" dan 2.5"',
    rab_revised: 'Tiang Round 2"-2.5" (2 Unit, Rp 37.000.000)',
    jusfin_claim: 'Harga tetap sama (tidak ada eskalasi biaya)',
    mco_document: 'MCO-01/46223A (Approved)',
    evidence_refs: 'EV-001 (BAPL Hal 2)',
    technical_status: 'VERIFIED',
    financial_status: 'VERIFIED',
    final_status: 'VERIFIED',
    chain_consistent: true,
    evidence_type: 'EXPLICIT',
    notes: 'Rantai perubahan teknis & finansial konsisten dari RAB Awal hingga BAPL aktual.',
    multi_evidence: [
      {
        doc_name: 'BAPL_Proyek_46223A.pdf',
        doc_type: 'BAPL',
        page: 2,
        snippet: 'Tiang penyangga penangkal petir tipe Round Pipe galvanis H = 5 meter terpasang pada dak atap Gedung Distribusi dan Gedung Filter (2 unit).',
        statement: 'Kondisi fisik 100% terpasang.',
        is_explicit: true,
      },
    ],
  },
  {
    change_id: 'CHG-002',
    item: 'Tiang Penyangga H = 15 Meter',
    rab_initial: 'Tiang Hexagonal pipa 1.5"-2"-2.5" (1 Unit, Rp 65.000.000)',
    justek_claim: 'Ubah ke Tiang Round teleskopik 5 segmen 2"-5" untuk ketahanan angin',
    bapl_evidence: 'BAPL Hal 2: Terpasang Tiang Round teleskopik 2"-2.5"-3"-4"-5"',
    rab_revised: 'Tiang Round teleskopik 5 segmen (1 Unit, Rp 65.000.000)',
    jusfin_claim: 'Harga kontrak tetap sama',
    mco_document: 'MCO-01/46223A (Approved)',
    evidence_refs: 'EV-002 (BAPL Hal 2)',
    technical_status: 'VERIFIED',
    financial_status: 'VERIFIED',
    final_status: 'VERIFIED',
    chain_consistent: true,
    evidence_type: 'EXPLICIT',
    notes: 'Rantai perubahan dimensi konsisten dan terbukti di BAPL.',
    multi_evidence: [
      {
        doc_name: 'BAPL_Proyek_46223A.pdf',
        doc_type: 'BAPL',
        page: 2,
        snippet: 'Tiang penyangga penangkal petir tipe Monopole Octagonal teleskopik 5 segmen H = 15 meter telah didirikan pada pondasi tapak dekat switchyard.',
        statement: 'Kondisi fisik 100% terpasang.',
        is_explicit: true,
      },
    ],
  },
  {
    change_id: 'CHG-003',
    item: 'Kabel Coaxial Down Conductor',
    rab_initial: '180 Meter @ Rp 900.000 = Rp 162.000.000',
    justek_claim: 'Penyesuaian estimasi panjang kabel ke 176,4 Meter',
    bapl_evidence: 'BAPL Hal 3: Opname fisik aktual 176,4 Meter (Distribusi + Filter + Substation)',
    rab_revised: '176,4 Meter @ Rp 900.000 = Rp 158.760.000',
    jusfin_claim: 'Penghematan finansial -Rp 3.240.000',
    mco_document: 'MCO-02/46223A (Approved)',
    evidence_refs: 'EV-003 (BAPL Hal 3)',
    technical_status: 'VERIFIED',
    financial_status: 'VERIFIED',
    final_status: 'VERIFIED',
    chain_consistent: true,
    evidence_type: 'EXPLICIT',
    notes: 'Konsisten sempurna antara opname BAPL, RAB revisi, dan JusFin.',
    multi_evidence: [
      {
        doc_name: 'BAPL_Proyek_46223A.pdf',
        doc_type: 'BAPL',
        page: 3,
        snippet: 'Total panjang penarikan terpasang aktual = 176,4 meter.',
        statement: 'Opname fisik aktual 176,4 Meter.',
        is_explicit: true,
      },
    ],
  },
  {
    change_id: 'CHG-004',
    item: 'Jasa Pemasangan & Pengkabelan',
    rab_initial: 'Jasa NYA 70 mm + clamp crane (Rp 64.350.000)',
    justek_claim: 'Penyesuaian jasa coaxial 2x35mm + grounding H=12m',
    bapl_evidence: 'BAPL Hal 4: Terpasang coaxial 2x35mm + grounding H=12m, tahanan < 2 Ohm',
    rab_revised: 'Jasa coaxial & grounding (Rp 58.295.376)',
    jusfin_claim: 'Efisiensi jasa -Rp 6.054.624',
    mco_document: 'MCO-02/46223A (Draft)',
    evidence_refs: 'EV-004 (BAPL Hal 4)',
    technical_status: 'VERIFIED',
    financial_status: 'REVIEW',
    final_status: 'REVIEW',
    chain_consistent: false,
    evidence_type: 'IMPLICIT',
    implicit_rationale: 'Hasil uji nilai tahanan pembumian (< 2 Ohm) membuktikan jasa terminasi coaxial & grounding telah selesai.',
    notes: 'Teknis terbukti pada BAPL, namun dasar kalkulasi efisiensi harga jasa pada JusFin membutuhkan rincian analisa harga satuan (AHS).',
    multi_evidence: [
      {
        doc_name: 'BAPL_Proyek_46223A.pdf',
        doc_type: 'BAPL',
        page: 4,
        snippet: 'Pengujian nilai tahanan pembumian (< 2 Ohm - MEMENUHI SYARAT). Seluruh jasa terminasi coaxial & grounding telah selesai 100%.',
        statement: 'Membuktikan pemancangan elektroda pembumian 12m dan terminasi coaxial tuntas.',
        is_explicit: false,
        explanation: 'Data tahanan pembumian terukur membuktikan bahwa pekerjaan instalasi pembumian elektroda 12m dan terminasi telah selesai.',
      },
    ],
  },
  {
    change_id: 'CHG-005',
    item: 'Air Terminal Unit Proteksi Petir',
    rab_initial: 'Air Terminal Standar (1 Unit, Rp 85.000.000)',
    justek_claim: 'Ubah ke Air Terminal ESE Radius 105 m',
    bapl_evidence: 'TIDAK ADA BUKTI (Di Seluruh Dokumen yang Diunggah)',
    rab_revised: 'Air Terminal ESE R=105 m (1 Unit, Rp 85.000.000)',
    jusfin_claim: 'Harga tetap sama (tidak ada eskalasi)',
    mco_document: 'Belum ada MCO khusus',
    evidence_refs: '-',
    technical_status: 'NOT FOUND',
    financial_status: 'VERIFIED',
    final_status: 'NEED SUPPORT',
    chain_consistent: false,
    evidence_type: 'NONE',
    notes: 'Klaim ESE R=105m tidak ada bukti fisik di BAPL. Memerlukan lampiran Factory Acceptance Test (FAT) / Sertifikat Radius Uji resmi.',
    multi_evidence: [],
  },
];

export const GOLDEN_EVIDENCES: EvidenceRecord[] = [
  {
    evidence_id: 'EV-001',
    change_id: 'CHG-001',
    item_name: 'Tiang Penangkal Petir H = 5 m',
    source: 'BAPL',
    doc_type: 'BAPL',
    evidence_type: 'EXPLICIT',
    document: 'BAPL/46223A/CM-IPP/VIII/2026',
    page: 2,
    snippet: 'Tiang pipa ROUND / BULAT, bahan Hot Dip Galvanized. Dimensi pipa bertingkat: 2" (bawah) dan 2.5" (atas), lengkap klem penahan & baseplate 300x300x12 mm.',
    full_clause: `[HASIL OPNAME FISIK - TIANG 5M]
- Bentuk Tiang: Pipa bulat (Round Pipe) bertingkat teleskopik (Segmen Bawah 2" dan Segmen Atas 2.5").
- Material: Hot Dip Galvanized tebal seng minimal 80 mikron, bebas korosi.
- Baseplate: Plat baja 300 x 300 x 12 mm dengan 4 angkur M16 terpasang kokoh pada plat atap Gedung Distribusi.
- Hasil Uji Beban Angin: Stabil tanpa lendutan berlebih pada kecepatan angin uji 25 m/s.`,
    clause_title: 'Hasil Pemeriksaan Tiang Penangkal Petir H = 5 M Gedung Distribusi',
    verified_specs: [
      'Bentuk: Round Pipe (Pipa Bulat) Bertingkat 2" & 2.5"',
      'Material: Hot Dip Galvanized (Anti Korosi)',
      'Baseplate: 300 x 300 x 12 mm + 4 Angkur M16',
    ],
    cross_references: [
      'BAPL/46223A/CM-IPP/VIII/2026 (Hal 2)',
      'JusTek Usulan CHG-001 (Rev.01)',
      'RAB Amandemen Hal 1 No. 1',
    ],
    authenticity_indicators: [
      'Cap Basah Tim Pengawas PLN Unit Induk',
      'Tanda Tangan Pelaksana PT. Rekatama Elektrikal Mandiri',
    ],
    source_type: 'OCR',
    confidence: 0.96,
    evidence_status: 'VERIFIED',
  },
  {
    evidence_id: 'EV-002',
    change_id: 'CHG-002',
    item_name: 'Tiang Penangkal Petir Monopole H = 15 m',
    source: 'BAPL',
    doc_type: 'BAPL',
    evidence_type: 'EXPLICIT',
    document: 'BAPL/46223A/CM-IPP/VIII/2026',
    page: 2,
    snippet: 'Tiang pipa ROUND / BULAT bertingkat teleskopik, bahan Hot Dip Galvanized. Dimensi pipa bertingkat aktual: 2" - 2.5" - 3" - 4" - 5" (5 segmen pipa bulat). Baseplate 400x400x16 mm dengan 4 anchor bolt M20.',
    full_clause: `[HASIL OPNAME FISIK - TIANG MONOPOLE 15M]
- Struktur: Tiang Monopole Pipa Bulat Teleskopik 5 Segmen (5" - 4" - 3" - 2.5" - 2").
- Tinggi Efektif: 15,00 meter di atas permukaan pondasi beton bertulang.
- Lapisan Pelindung: Hot Dip Galvanized ASTM A123.
- Baseplate & Pondasi: Plat landasan 400 x 400 x 16 mm, 4 Angkur Bolt M20 Grade 8.8, kedalaman pondasi 2,5 meter.`,
    clause_title: 'Hasil Pemeriksaan Tiang Monopole H = 15 M Area Substation',
    verified_specs: [
      'Bentuk: Pipa Bulat (Round) 5 Segmen Teleskopik (5"-4"-3"-2.5"-2")',
      'Tinggi Total: 15,00 Meter Tegak Lurus',
      'Baseplate: 400 x 400 x 16 mm + 4 Angkur M20',
    ],
    cross_references: [
      'BAPL/46223A/CM-IPP/VIII/2026 (Hal 2)',
      'JusTek Usulan CHG-002',
      'Gambar As-Built Monopole 15M',
    ],
    authenticity_indicators: [
      'Cap Basah Pengawas K3 & Sipil',
      'Pemeriksaan Vertikalitas Theodolite Terverifikasi',
    ],
    source_type: 'OCR',
    confidence: 0.96,
    evidence_status: 'VERIFIED',
  },
  {
    evidence_id: 'EV-003',
    change_id: 'CHG-003',
    item_name: 'Kabel Coaxial 2 x 35 mm (HV Down Conductor)',
    source: 'BAPL',
    doc_type: 'BAPL',
    evidence_type: 'EXPLICIT',
    document: 'BAPL/46223A/CM-IPP/VIII/2026',
    page: 3,
    snippet: 'Pengukuran panjang fisik kabel coaxial 2 x 35 mm... TOTAL PANJANG AKTUAL TERPASANG = 176,4 Meter (Berkurang 3,6 Meter dari baseline 180 Meter).',
    full_clause: `[HASIL OPNAME PENGUKURAN KABEL PENURUN - DOWN CONDUCTOR]
- Tipe Kabel: Coaxial High Voltage Shielded Down Conductor 2 x 35 mm2.
- Titik Pengukuran: Jalur dari Air Terminal puncak tiang 15m melewati kabel ladder ruang trafo menuju bak kontrol grounding.
- Rincian Panjang Fisik: Jalur Tiang (16,2 m) + Jalur Tray Horizontal (128,4 m) + Jalur Drop Grounding (31,8 m) = 176,4 Meter.
- Deviasi Volume: Berkurang -3,6 Meter dari perkiraan awal 180 Meter karena optimasi rute kabel lurus tanpa looping.`,
    clause_title: 'Pengukuran Opname Panjang Fisik Kabel Coaxial Down Conductor',
    verified_specs: [
      'Kuantitas Terpasang: 176,4 Meter (Sesuai Opname Laser Distance Meter)',
      'Tipe: High Voltage Shielded Coaxial Cable 2 x 35 mm2',
      'Rute: Tray Pelindung Galvanis & Pipa Conduit Baja',
    ],
    cross_references: [
      'BAPL/46223A/CM-IPP/VIII/2026 (Hal 3)',
      'JusTek Usulan CHG-003',
      'RAB Amandemen Item 3',
    ],
    authenticity_indicators: [
      'Pengukuran Bersama Tim Konsultan MK & Pelaksana',
      'Log Sheet Opname Fisik Bermaterai',
    ],
    source_type: 'OCR',
    confidence: 0.97,
    evidence_status: 'VERIFIED',
  },
  {
    evidence_id: 'EV-004',
    change_id: 'CHG-004',
    item_name: 'Jasa Pemasangan & Pengkabelan',
    source: 'BAPL',
    doc_type: 'BAPL',
    evidence_type: 'IMPLICIT',
    explanation: 'Data pengukuran tahanan tanah pada BAPL Hal 4 membuktikan pemancangan elektroda pembumian 12m dan terminasi khusus coaxial telah tuntas.',
    document: 'BAPL/46223A/CM-IPP/VIII/2026',
    page: 4,
    snippet: 'Pekerjaan instalasi kabel coaxial 2 x 35 mm terpasang pada tiang galvanis dan tray pelindung... grounding H = 12 m telah selesai diuji dengan tahanan pembumian < 2 ohm.',
    full_clause: `[HASIL VERIFIKASI PEKERJAAN INSTALASI & UJI GROUNDING]
- Lingkup Jasa: Penarikan kabel coaxial 2 x 35 mm pada tiang galvanis, pemasangan klem stainless, dan pemancangan elektroda grounding H = 12 meter.
- Hasil Uji Tahanan Pembumian (Earth Tester Metrel terkalibrasi):
  * Titik Grounding 1 (Gedung Distribusi): 0,84 Ohm
  * Titik Grounding 2 (Substation Trafo): 1,12 Ohm
  * Status: Memenuhi standar PUIL (< 2,00 Ohm).`,
    clause_title: 'Pengujian Hasil Instalasi & Pengukuran Tahanan Pembumian Grounding',
    verified_specs: [
      'Nilai Tahanan Pembumian: < 2,00 Ohm (Aktual: 0,84 Ohm & 1,12 Ohm)',
      'Kedalaman Pemancangan Grounding: H = 12 Meter Elektroda Tembaga',
      'Metode Pemasangan: Klem Stainless Steel & Cable Tray Tertutup',
    ],
    cross_references: [
      'BAPL/46223A/CM-IPP/VIII/2026 (Hal 4)',
      'Sertifikat Kalibrasi Earth Tester No. CAL-2026-08',
      'JusFin CHG-004',
    ],
    authenticity_indicators: [
      'Pengujian Disaksikan Ahli K3 Listrik Bersertifikat BNSP',
      'Cap Basah Pengawas Lapangan',
    ],
    source_type: 'OCR',
    confidence: 0.94,
    evidence_status: 'VERIFIED',
  },
  {
    evidence_id: 'EV-005',
    change_id: 'CHG-005',
    item_name: 'Air Terminal Unit ESE R=105m',
    source: 'BAPL',
    doc_type: 'BAPL',
    evidence_type: 'NONE',
    explanation: 'Tidak ada dokumen pendukung (FAT / Test Certificate) untuk klaim teknologi ESE radius R=105m.',
    document: 'BAPL/46223A/CM-IPP/VIII/2026',
    page: 5,
    snippet: 'CATATAN KHUSUS PMO: Tidak tercantum pencatatan tipe Early Streamer Emission / ESE maupun radius proteksi R=105m pada sertifikat lapangan BAPL ini; hanya tertulis terpasang terminal petir utama.',
    full_clause: `[TEMUAN AUDIT DOKUMEN - AIR TERMINAL ESE]
- Deskripsi BAPL: Tercatat telah terpasang 1 unit head terminal petir pada puncak tiang monopole 15m.
- Evaluasi Auditor PMO: Tidak ada bukti tertulis pada BAPL mengenai spesifikasi Early Streamer Emission (ESE), waktu picu (early streamer delta-T), radius proteksi R=105m, ataupun sertifikat uji lab tegangan tinggi (misal dari LAPI ITB / KEMA / ICL).
- Status Rekomendasi: Membutuhkan dokumen pendukung (Supporting Doc) dari Kontraktor berupa Brosur Asli Pabrikan, Mill Test Certificate, dan Rekomendasi Teknis MK sebelum amandemen dapat disetujui 100%.`,
    clause_title: 'Catatan Evaluasi Bukti Air Terminal Unit & Kebutuhan Dokumen Pendukung',
    verified_specs: [
      'Terpasang Fisik: 1 Unit Terminal Petir di Puncak Tiang Monopole',
      'Status Klaim ESE: Membutuhkan Sertifikat Uji Laboratorium / Mill Certificate',
    ],
    cross_references: [
      'BAPL/46223A/CM-IPP/VIII/2026 (Hal 5)',
      'JusTek Usulan CHG-005',
    ],
    authenticity_indicators: [
      'Catatan Audit Tim Verifikasi PMO',
      'Form Pengecekan Lapangan Rev.01',
    ],
    source_type: 'OCR',
    confidence: 0.95,
    evidence_status: 'NEED SUPPORT',
  },
];

export const GOLDEN_EXCEPTIONS: ExceptionRecord[] = [
  {
    exception_id: 'EXC-001',
    priority: 'HIGH',
    change_id: 'CHG-005',
    source: 'BAPL vs JusTek',
    finding: 'Spesifikasi Air Terminal Unit tipe Early Streamer Emission (ESE) tidak ditemukan pada BAPL.',
    expected: 'BAPL atau lampiran pengujian mencantumkan tipe ESE, merk, nomor seri, dan sertifikat radius R=105m.',
    actual: 'Hanya tercatat "Air Terminal Unit proteksi petir terpasang di puncak tiang".',
    impact: 'Klaim teknis proteksi area tidak dapat dipertanggungjawabkan tanpa sertifikat pengujian tipe ESE.',
    recommended_action: 'Minta dokumen pendukung (Mill Certificate / Test Report / Factory Acceptance Test / Brosur Pabrikan ESE & Surat Persetujuan Engineering MCO).',
    status: 'NEED SUPPORT',
  },
  {
    exception_id: 'EXC-002',
    priority: 'HIGH',
    change_id: 'FIN-TOTAL',
    source: 'JusFin vs Perhitungan Sistem',
    finding: 'Selisih total RAB yang dicantumkan pada JusFin (-Rp 1.022.408,58) tidak sesuai dengan selisih matematis RAB Awal dan RAB Revisi (-Rp 9.294.624,00).',
    expected: 'Delta JusFin = RAB Revisi (Rp 978.998.654) - RAB Awal (Rp 988.293.278) = -Rp 9.294.624,00.',
    actual: 'JusFin mencantumkan delta tertulis: -Rp 1.022.408,58.',
    impact: 'Terdapat selisih discrepancy sebesar Rp 8.272.215,42 yang berpotensi menimbulkan temuan audit kepatuhan finansial.',
    recommended_action: 'Koreksi lembar rekapitulasi JusFin agar formula mengacu langsung ke sheet RAB Revisi dan RAB Awal.',
    status: 'MISMATCH',
  },
  {
    exception_id: 'EXC-003',
    priority: 'MEDIUM',
    change_id: 'CHG-004',
    source: 'JusFin Justification',
    finding: 'Penurunan harga satuan jasa instalasi sebesar -Rp 6.054.624 belum disertai lampiran Analisa Harga Satuan Pekerjaan (AHSP).',
    expected: 'Uraian rincian koefisien upah tenaga kerja, mandor, dan alat bantu.',
    actual: 'Hanya berupa penjelasan narasi efisiensi rute penarikan.',
    impact: 'Auditor finansial dapat mempertanyakan dasar kewajaran harga revisi jasa pemborongan.',
    recommended_action: 'Lampirkan breakdown AHSP jasa revisi sebelum pengajuan approval amandemen kontrak.',
    status: 'REVIEW',
  },
];

export const GOLDEN_HUMAN_REVIEW: HumanReview = {
  pmo_review_status: 'PENDING',
  pmo_comments: 'Verifikasi sistem telah dijalankan. Ditemukan 1 temuan teknis (spesifikasi ESE butuh dokumen pendukung) dan 1 temuan finansial kritikal (discrepancy angka JusFin vs RAB). Membutuhkan klarifikasi dari Lead Cost Estimator sebelum approval final.',
  final_decision: 'CONDITIONAL: Menunggu revisi narasi JusFin dan penyerahan sertifikat ESE dari Kontraktor.',
  reviewed_by: 'Dewantara, S.T., PMP (Lead PMO Auditor)',
  review_date: '2026-08-18',
};

export const GOLDEN_TEST_CASE_RESULT: VerificationResult = {
  project: GOLDEN_PROJECT_IDENTITY,
  config: DEFAULT_CONFIG,
  changes: GOLDEN_CHANGES,
  financial_items: GOLDEN_FINANCIAL_ITEMS,
  total_rab: GOLDEN_TOTAL_RAB,
  traceability: GOLDEN_TRACEABILITY,
  evidences: GOLDEN_EVIDENCES,
  exceptions: GOLDEN_EXCEPTIONS,
  raw_bapl: GOLDEN_RAW_BAPL,
  human_review: GOLDEN_HUMAN_REVIEW,
  summary: {
    total_items: 5,
    verified: 3, // Tiang 5m, Tiang 15m, Kabel Coaxial
    need_support: 1, // Air Terminal ESE
    review: 1, // Jasa Pemasangan (Fin Review)
    mismatch: 0, // In technical changes (financial total has mismatch)
    not_found: 1, // Air terminal
  },
  technical_summary: {
    material_changes: 1,
    quantity_changes: 1,
    scope_changes: 1,
    method_changes: 1,
    dimension_changes: 1,
  },
  program_profile: {
    domain: 'ELECTRICAL',
    name: 'Sistem Elektrikal, Grounding & Proteksi Petir',
    autoDetected: true,
    confidence: 0.98,
    matchedKeywords: ['tiang penangkal', 'kabel coaxial', 'grounding', 'terminal petir', 'earth tester'],
    boundariesApplied: ['tiang', 'kabel', 'terminal', 'jasa_instalasi'],
  },
  generated_at: new Date().toISOString(),
};
