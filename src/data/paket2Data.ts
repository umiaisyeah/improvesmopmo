import { DocumentPackage, VerificationResult } from '../types';
import { DEFAULT_CONFIG } from '../config/defaultConfig';

export const PAKET_2_VERIFICATION_RESULT: VerificationResult = {
  project: {
    projectName: 'Rehabilitasi Backwash Pump & Katup Header',
    projectCode: '46308',
    subproject: 'Penggantian Backwash Pump Gate Valve & Flange Fasteners',
    location: 'Water Treatment Plant (WTP) - Ruang Pompa Backwash Unit 1-3',
    contractor: 'PT. Berkah Rekatama Nusantara (BRN)',
    poNumber: 'PO-46308-MEP-2026',
    baplNumber: 'BRN-ABJ46-46308-PJ1-MEP-BAPL-01',
    date: '2026-09-18',
    revision: 'Rev.02',
    packageContractInfo: 'Paket Pekerjaan MEP & Penggantian Gate Valve Pompa Backwash',
    excelProjectCode: '46308',
    excelPoNumber: 'PO-46308-MEP-2026',
    identityMatchStatus: 'MATCH',
  },
  config: DEFAULT_CONFIG,
  changes: [
    {
      change_id: 'CHG-001',
      item: 'Gate Valve DN 300 mm PN16 (With Handwheel)',
      attribute: 'Spesifikasi Material Disc, Koneksi Flens, dan Dimensi Face to Face',
      parameter: 'Disc DI EN-GJS-500-7 + EPDM, Double Flange PN16, F2F DIN-F4 (270 mm)',
      baseline: 'Kontrak Awal: Gate Valve DN 300 mm PN16 (With Handwheel), Material Body Ductile Iron GGG50, Face to Face DIN 3202-F4, Connection All Flange PN16, Disc SS304, Seat EPDM, Garansi 2 tahun, Qty 3 Unit @ Rp 55.000.000 (Total Rp 165.000.000)',
      proposed: 'JusTek Usulan: Gate Valve DN 300 mm PN16 (With Handwheel), Material Body Ductile Iron GGG50, Face to Face DIN - F4 (270 mm), Connection Double Flange PN16, Disc Ductile Iron EN-GJS-500-7 + EPDM, Seat EPDM, Garansi 2 tahun, Qty 3 Unit @ Rp 53.840.000 (Total Rp 161.520.000)',
      actual_bapl: '[HASIL PEMERIKSAAN FISIK KATUP HEADER - Poin 1] Gate Valve DN 300 mm PN 16 (with Handwheel): Body Material Ductile Iron GGG50, Face-to-face standard DIN-F4 (270 mm). Rating Tekanan Double Flange PN 16. Disc Ductile Iron dilapisi EPDM vulcanized. Seat EPDM resilient seated, 100% leak tight. Stem Stainless Steel SS 316 dengan seal ganda O-ring NBR. Dilengkapi Handwheel manual cast iron dia. 300 mm. Jumlah Terpasang: 3 (tiga) unit pada header suction pompa backwash No. 1, 2, dan 3. Uji operasional hydrostatis & buka-tutup sempurna dengan torsi ringan tanpa kebocoran.',
      unit: 'Unit',
      cause: 'Penyesuaian spesifikasi sub-komponen disc menjadi Ductile Iron EN-GJS-500-7 dilapisi EPDM untuk keandalan sealing air backwash, koneksi Double Flange PN16, serta kesesuaian dimensi instalasi Face to Face DIN-F4 (270 mm) pada header pompa eksisting.',
      risk: 'Jika tidak disesuaikan, terjadi ketidaksesuaian dimensi panjang pemasangan (face to face) dan koneksi flens pada header perpipaan pompa backwash.',
      benefit: 'Kesesuaian dimensi presisi 270 mm tanpa modifikasi pipa, sealing katup lebih kedap dengan disc DI+EPDM, serta efisiensi anggaran pengadaan sebesar Rp 3.480.000.',
      category: 'Material Change',
      has_financial_change: true,
      match: true,
      evidence_found: true,
      evidence_page: 1,
      evidence_snippet: `HASIL PEMERIKSAAN FISIK KATUP HEADER:
1) Gate Valve DN 300 mm PN 16 (with Handwheel):
   - Body Material: Ductile Iron GGG50, Face-to-face standard DIN-F4 (270 mm).
   - Rating Tekanan: Double Flange PN 16.
   - Disc: Ductile Iron dilapisi EPDM vulcanized.
   - Seat: EPDM resilient seated, 100% leak tight.
   - Stem: Stainless Steel SS 316 dengan seal ganda O-ring NBR.
   - Pengoperasian: Dilengkapi Handwheel manual cast iron dia. 300 mm.
   - Jumlah Terpasang: 3 (tiga) unit pada header suction pompa backwash No. 1, 2, dan 3.
   - Status Uji Operasi: Dilakukan uji buka-tutup (hydrostatic & operational test), katup membuka dan menutup sempurna dengan torsi ringan tanpa kebocoran.`,
      ocr_confidence: 0.98,
      matching_confidence: 0.98,
      technical_status: 'VERIFIED',
      final_status: 'VERIFIED',
      evidence_ids: ['EV-001'],
      implicit_correlation_analysis: 'KORELASI TEKNIS & FINANSIAL: Temuan fisik dimensi F2F 270 mm dan disc Ductile Iron + EPDM pada BAPL Hal 1 secara teknis menyelesaikan alignment nozzle pompa tanpa perlu perombakan pipa header suction eksisting. Pada JusFin, harga satuan terkoreksi wajar dari Rp 55.000.000 menjadi Rp 53.840.000, menghasilkan penghematan biaya total sebesar -Rp 3.480.000.',
      sub_specs_baseline: [
        'Material Body: Ductile Iron GGG-50',
        'Face to Face: DIN 3202-F4',
        'Connection: All Flange PN16',
        'Disc: SS304',
        'Seat: EPDM',
        'Garansi: 2 Tahun',
      ],
      sub_specs_proposed: [
        'Material Body: Ductile Iron GGG-50',
        'Face to Face: DIN - F4 (270 mm)',
        'Connection: Double Flange PN16',
        'Disc: Ductile Iron EN-GJS-500-7 + EPDM',
        'Seat: EPDM',
        'Garansi: 2 Tahun',
      ],
      sub_specs_differences: [
        'Face to Face: DIN 3202-F4 ➔ DIN - F4 (270 mm)',
        'Connection: All Flange PN16 ➔ Double Flange PN16',
        'Disc: SS304 ➔ Ductile Iron EN-GJS-500-7 + EPDM',
      ],
    },
    {
      change_id: 'CHG-002',
      item: 'Gasket DN 300 mm, t=5mm, Full Face, EPDM',
      attribute: 'Penyekat Sambungan Flens DN 300',
      parameter: 'Material EPDM Full Face, Ketebalan 5 mm',
      baseline: 'Kontrak Awal: Gasket DN 300 mm, t=5mm, Full Face, EPDM, Qty 6 Pcs @ Rp 179.400',
      proposed: 'JusTek Usulan: Gasket DN 300 mm, t=5mm, Full Face, EPDM, Qty 6 Pcs @ Rp 179.400 (Tetap)',
      actual_bapl: '[HASIL PEMERIKSAAN GASKET & SAMBUNGAN FLENS] Gasket EPDM 5 mm terpasang 6 pcs pada sambungan flens 3 unit gate valve DN 300 (2 sisi flens per katup) dengan kerapatan sempurna tanpa kebocoran pada tekanan uji 8.5 bar.',
      unit: 'Pcs',
      cause: 'Spesifikasi gasket sesuai standar awal dan tidak memerlukan perubahan.',
      risk: 'Tidak ada risiko; material terpasang sesuai spesifikasi.',
      benefit: 'Kerapatan sambungan flens terjaga optimal.',
      category: 'No Technical Change',
      has_financial_change: false,
      match: true,
      evidence_found: true,
      evidence_page: 2,
      evidence_snippet: `HASIL PEMERIKSAAN GASKET & SAMBUNGAN FLENS:
- Gasket EPDM ketebalan 5 mm tipe Full Face terpasang pada 6 titik sambungan flens (suction & discharge 3 unit katup Gate Valve DN 300).
- Tidak ditemukan rembesan atau kebocoran fluida pada uji tekanan operasional 8.5 bar.`,
      ocr_confidence: 0.99,
      matching_confidence: 0.98,
      technical_status: 'VERIFIED',
      final_status: 'VERIFIED',
      evidence_ids: ['EV-003'],
      implicit_correlation_analysis: 'KORELASI TEKNIS & FINANSIAL: Jumlah 6 pcs gasket EPDM 5 mm di BAPL berkorelasi implisit dengan 3 unit katup berkonfigurasi double flange (3 katup x 2 flange = 6 titik sambungan). Biaya tetap stabil di Rp 1.076.400 tanpa varians anggaran.',
    },
    {
      change_id: 'CHG-003',
      item: 'Bolt & Nut [ M24-120/83], SS304',
      attribute: 'Pengikat Flens Ukuran M24 (Ditiadakan)',
      parameter: 'Diameter Baut M24',
      baseline: 'Kontrak Awal: Bolt & Nut [ M24-120/83], SS304, Qty 72 Pcs @ Rp 135.000 (Total Rp 9.720.000)',
      proposed: 'JusTek Usulan: Ditiadakan / Dinolkan (Volume 0 Pcs) karena digantikan ukuran M20 sesuai lubang flens katup',
      actual_bapl: '[HASIL PEMERIKSAAN FASTENER - Peniadaan M24] Baut M24 ditiadakan dan diganti dengan baut M20x85 SS304 karena diameter lubang flens DN 300 PN16 standar adalah 23 mm (tidak muat baut M24). Tidak ada pengadaan/pemasangan baut M24 di lapangan.',
      unit: 'Pcs',
      cause: 'Lubang baut flens katup PN16 standar pabrikan adalah 23 mm yang dirancang untuk baut M20, sehingga baut M24 tidak dapat digunakan.',
      risk: 'Jika dipaksakan memperbesar lubang flens, akan merusak integritas tekanan katup PN16.',
      benefit: 'Pengalihan anggaran secara tertib administrasi ke baut M20x85.',
      category: 'Dimension Change',
      has_financial_change: true,
      match: true,
      evidence_found: true,
      evidence_page: 2,
      evidence_snippet: `HASIL PEMERIKSAAN FASTENER & PENGENCANGAN FLENS:
- Baut M24 ditiadakan (0 pcs terpasang) karena diameter lubang flens DN 300 PN16 adalah 23 mm yang hanya kompatibel dengan baut M20.
- Seluruh kebutuhan fastener dialihkan ke baut M20 x 85 mm SS304.`,
      ocr_confidence: 0.97,
      matching_confidence: 0.96,
      technical_status: 'VERIFIED',
      final_status: 'VERIFIED',
      evidence_ids: ['EV-002'],
      implicit_correlation_analysis: 'KORELASI TEKNIS & FINANSIAL: Standar lubang flens EN 1092-2 untuk DN 300 PN16 adalah 12 lubang x 23 mm per flens. Menggunakan baut M24 secara mekanis mustahil tanpa merusak bodi katup. Pada JusFin, peniadaan 72 pcs M24 mengurangi anggaran sebesar -Rp 9.720.000.',
    },
    {
      change_id: 'CHG-004',
      item: 'Bolt & Nut [M20 x 85], SS304',
      attribute: 'Dimensi & Standar Pengikat Flens PN16 (Item Baru/Pengganti)',
      parameter: 'Diameter Baut M20, Panjang 85 mm SS304',
      baseline: 'Kontrak Awal: Belum tercantum (Item Baru / Substitusi Baut M24), Qty 0 Pcs',
      proposed: 'JusTek Usulan: Bolt & Nut [M20 x 85], SS304, Qty 72 Pcs @ Rp 96.360 (Total Rp 6.937.920)',
      actual_bapl: '[HASIL PEMERIKSAAN FASTENER & PENGENCANGAN FLENS - Poin 2] Baut & Mur Flens: Bolt & Nut [M20 x 85], SS304. Material Stainless Steel Grade SS304 (A2-70) anti karat. Dimensi Baut M20 panjang 85 mm full-threaded dengan 2 flat washer SS304 & 1 spring washer. Terpasang 72 pcs (12 baut per sambungan flens x 6 titik flens pada 3 gate valve). Dikencangkan silang (cross-pattern) menggunakan torque wrench pada nilai 220 Nm. Terpasang rapat tanpa kebocoran.',
      unit: 'Pcs',
      cause: 'Lubang baut flens standar DN 300 PN16 adalah diameter 23 mm (sesuai baut M20x85).',
      risk: 'Tidak ada risiko; pemasangan presisi 100% mengikuti standar flens EN 1092-2 PN16.',
      benefit: 'Pemasangan presisi 100% mengikuti standar flange EN 1092-2 PN16, material SS304 tahan karat permanen di ruang pompa basah.',
      category: 'Dimension Change',
      has_financial_change: true,
      match: true,
      evidence_found: true,
      evidence_page: 2,
      evidence_snippet: `HASIL PEMERIKSAAN FASTENER & PENGENCANGAN FLENS:
2) Baut & Mur Flens: Bolt & Nut [M20 x 85], SS304
   - Material: Stainless Steel Grade SS304 (A2-70) anti karat.
   - Dimensi Aktual: Baut M20 panjang 85 mm full-threaded dengan 2 flat washer SS304 & 1 spring washer.
   - Jumlah Terpasang: 72 pcs (12 baut per sambungan flens x 6 titik flens pada 3 gate valve).
   - Torsi Pengencangan: Telah dikencangkan silang (cross-pattern) menggunakan torque wrench terkalibrasi pada nilai 220 Nm.
   - Status: Terpasang rapat, tidak ada lendutan atau kebocoran gasket pada saat uji tekanan kerja pompa (8.5 bar).`,
      ocr_confidence: 0.97,
      matching_confidence: 0.95,
      technical_status: 'VERIFIED',
      final_status: 'VERIFIED',
      evidence_ids: ['EV-002'],
      implicit_correlation_analysis: 'KORELASI TEKNIS & FINANSIAL: Kuantitas 72 pcs M20x85 terpasang dihitung secara presisi: 3 unit katup double flange x 2 sisi = 6 sambungan flens x 12 lubang = 72 pcs. Biaya penambahan 72 pcs @ Rp 96.360 (+Rp 6.937.920) jika disandingkan dengan peniadaan item M24 (-Rp 9.720.000) menghasilkan efisiensi netto sebesar -Rp 2.782.080 (Penghematan Negara).',
    },
  ],
  financial_items: [
    {
      change_id: 'CHG-001',
      item: 'Gate Valve DN 300 mm PN16 (With Handwheel)',
      unit: 'Unit',
      qty_initial: 3,
      qty_revised: 3,
      delta_qty: 0,
      unit_price_initial: 55000000,
      unit_price_revised: 53840000,
      delta_unit_price: -1160000,
      total_initial: 165000000,
      total_revised: 161520000,
      calculated_initial: 165000000,
      calculated_revised: 161520000,
      delta_value: -3480000,
      delta_percentage: -0.0211,
      threshold_exceeded: false,
      proposal_modification_required: false,
      justification: 'Penyesuaian spesifikasi sub-komponen material Gate Valve DN 300 mm PN16 (Disc Ductile Iron EN-GJS-500-7 + EPDM, Double Flange PN16, F2F DIN-F4 270 mm) menghasilkan efisiensi harga satuan dari Rp 55.000.000 menjadi Rp 53.840.000 (penghematan Rp 3.480.000).',
      stated_jusfin_delta: -3480000,
      calculation_status: 'VERIFIED',
      financial_status: 'VERIFIED',
      explanation: 'Perhitungan delta nilai (Rp 161.520.000 - Rp 165.000.000 = -Rp 3.480.000) konsisten 100% dengan JusFin dan RAB usulan (3 Unit × Rp 53.840.000/Unit vs Kontrak Awal 3 Unit × Rp 55.000.000/Unit). Terjadi efisiensi/penghematan biaya sebesar -2,11%.',
      sub_specs_initial: [
        'Material Body: Ductile Iron GGG-50',
        'Face to Face: DIN 3202-F4',
        'Connection: All Flange PN16',
        'Disc: SS304',
        'Seat: EPDM',
        'Garansi: 2 Tahun',
      ],
      sub_specs_revised: [
        'Material Body: Ductile Iron GGG-50',
        'Face to Face: DIN - F4 (270 mm)',
        'Connection: Double Flange PN16',
        'Disc: Ductile Iron EN-GJS-500-7 + EPDM',
        'Seat: EPDM',
        'Garansi: 2 Tahun',
      ],
      sub_specs_differences: [
        'Face to Face: DIN 3202-F4 ➔ DIN - F4 (270 mm)',
        'Connection: All Flange PN16 ➔ Double Flange PN16',
        'Disc: SS304 ➔ Ductile Iron EN-GJS-500-7 + EPDM',
      ],
    },
    {
      change_id: 'CHG-002',
      item: 'Gasket DN 300 mm, t=5mm, Full Face, EPDM',
      unit: 'Pcs',
      qty_initial: 6,
      qty_revised: 6,
      delta_qty: 0,
      unit_price_initial: 179400,
      unit_price_revised: 179400,
      delta_unit_price: 0,
      total_initial: 1076400,
      total_revised: 1076400,
      calculated_initial: 1076400,
      calculated_revised: 1076400,
      delta_value: 0,
      delta_percentage: 0,
      threshold_exceeded: false,
      proposal_modification_required: false,
      justification: 'Spesifikasi dan kuantitas gasket EPDM 5 mm tetap sesuai kontrak awal, tidak terdapat penyesuaian biaya.',
      stated_jusfin_delta: 0,
      calculation_status: 'VERIFIED',
      financial_status: 'VERIFIED',
      explanation: 'Item tidak mengalami perubahan kuantitas maupun harga satuan (6 Pcs @ Rp 179.400 = Rp 1.076.400).',
    },
    {
      change_id: 'CHG-003',
      item: 'Bolt & Nut [ M24-120/83], SS304',
      unit: 'Pcs',
      qty_initial: 72,
      qty_revised: 0,
      delta_qty: -72,
      unit_price_initial: 135000,
      unit_price_revised: 135000,
      delta_unit_price: 0,
      total_initial: 9720000,
      total_revised: 0,
      calculated_initial: 9720000,
      calculated_revised: 0,
      delta_value: -9720000,
      delta_percentage: -1.0,
      threshold_exceeded: true,
      proposal_modification_required: true,
      justification: 'Pekerjaan baut M24 ditiadakan (-72 Pcs) karena lubang flens katup DN 300 PN16 adalah 23 mm (sesuai baut M20).',
      stated_jusfin_delta: -9720000,
      calculation_status: 'VERIFIED',
      financial_status: 'VERIFIED',
      explanation: 'Pengurangan biaya akibat peniadaan item M24 (0 - Rp 9.720.000 = -Rp 9.720.000).',
    },
    {
      change_id: 'CHG-004',
      item: 'Bolt & Nut [M20 x 85], SS304',
      unit: 'Pcs',
      qty_initial: 0,
      qty_revised: 72,
      delta_qty: 72,
      unit_price_initial: 0,
      unit_price_revised: 96360,
      delta_unit_price: 96360,
      total_initial: 0,
      total_revised: 6937920,
      calculated_initial: 0,
      calculated_revised: 6937920,
      delta_value: 6937920,
      delta_percentage: 1.0,
      threshold_exceeded: true,
      proposal_modification_required: true,
      justification: 'Pekerjaan tambah item pengganti baut M20x85 SS304 sebanyak 72 Pcs @ Rp 96.360 untuk menghubungkan 6 sambungan flens Gate Valve DN 300 PN16.',
      stated_jusfin_delta: 6937920,
      calculation_status: 'VERIFIED',
      financial_status: 'VERIFIED',
      explanation: 'Penambahan item baru baut M20x85 SS304 (72 Pcs × Rp 96.360 = Rp 6.937.920). Efisiensi netto terhadap substitusi M24 adalah Rp 6.937.920 - Rp 9.720.000 = -Rp 2.782.080.',
    },
  ],
  total_rab: {
    rab_initial: 175796400,
    rab_revised: 169534320,
    system_calculated_delta: -6262080,
    system_calculated_percentage: -0.0356,
    stated_jusfin_delta: -6262080,
    delta_match: true,
    threshold_percentage: 0.10,
    threshold_exceeded: false,
    proposal_modification_required: false,
    status: 'VERIFIED',
    explanation: 'Total RAB dan rekapitulasi JusFin terverifikasi konsisten 100%. Total nilai Kontrak Awal Rp 175.796.400, Usulan Revisi Rp 169.534.320, dengan efisiensi/penghematan biaya netto sebesar -Rp 6.262.080 (-3,56%).',
  },
  traceability: [
    {
      change_id: 'CHG-001',
      item: 'Gate Valve DN 300 mm PN16 (With Handwheel)',
      rab_initial: 'Gate Valve DN 300 mm PN16 (With Handwheel), Disc SS304, F2F DIN 3202-F4, All Flange (3 Unit @ Rp 55.000.000 = Rp 165.000.000)',
      justek_claim: 'Ubah sub-spesifikasi: Disc DI EN-GJS-500-7 + EPDM, Double Flange PN16, Face-to-Face DIN-F4 (270 mm)',
      bapl_evidence: 'BAPL Hal 1: Terpasang 3 unit Gate Valve DN 300 PN 16 (with Handwheel) - Ductile Iron GGG50, DIN-F4 (270 mm), Double Flange PN 16, Disc DI+EPDM',
      rab_revised: 'Gate Valve DN 300 mm PN16 (With Handwheel), Disc DI+EPDM, Double Flange, F2F DIN-F4 (3 Unit @ Rp 53.840.000 = Rp 161.520.000)',
      jusfin_claim: 'Efisiensi biaya material -Rp 3.480.000 (-2,11%)',
      mco_document: 'MCO-01/46308 (Approved)',
      evidence_refs: 'EV-001 (BAPL Hal 1)',
      technical_status: 'VERIFIED',
      financial_status: 'VERIFIED',
      final_status: 'VERIFIED',
      chain_consistent: true,
      notes: 'Rantai perubahan teknis & finansial Gate Valve konsisten 100% dari Kontrak Awal hingga BAPL aktual lapangan.',
    },
    {
      change_id: 'CHG-002',
      item: 'Gasket DN 300 mm, t=5mm, Full Face, EPDM',
      rab_initial: 'Gasket EPDM 5 mm (6 Pcs @ Rp 179.400 = Rp 1.076.400)',
      justek_claim: 'Spesifikasi tetap sesuai kontrak awal',
      bapl_evidence: 'BAPL Hal 2: Terpasang 6 pcs Gasket EPDM 5 mm pada flens pipa',
      rab_revised: 'Gasket EPDM 5 mm (6 Pcs @ Rp 179.400 = Rp 1.076.400)',
      jusfin_claim: 'Tidak ada perubahan biaya (Rp 0)',
      mco_document: 'MCO-01/46308 (Approved)',
      evidence_refs: 'EV-003 (BAPL Hal 2)',
      technical_status: 'VERIFIED',
      financial_status: 'VERIFIED',
      final_status: 'VERIFIED',
      chain_consistent: true,
      notes: 'Item tetap, tidak ada deviasi kuantitas atau harga.',
    },
    {
      change_id: 'CHG-003',
      item: 'Bolt & Nut [ M24-120/83], SS304',
      rab_initial: 'Bolt & Nut M24 x 120 (72 Pcs @ Rp 135.000 = Rp 9.720.000)',
      justek_claim: 'Ditiadakan (0 Pcs) karena digantikan baut M20x85 sesuai lubang flens PN16',
      bapl_evidence: 'BAPL Hal 2: Baut M24 dinolkan dan digantikan baut M20x85',
      rab_revised: 'Bolt & Nut M24 (0 Pcs = Rp 0)',
      jusfin_claim: 'Pengurangan biaya -Rp 9.720.000',
      mco_document: 'MCO-01/46308 (Approved)',
      evidence_refs: 'EV-002 (BAPL Hal 2)',
      technical_status: 'VERIFIED',
      financial_status: 'VERIFIED',
      final_status: 'VERIFIED',
      chain_consistent: true,
      notes: 'Konsisten, pekerjaan ditiadakan dan dialihkan ke item M20.',
    },
    {
      change_id: 'CHG-004',
      item: 'Bolt & Nut [M20 x 85], SS304',
      rab_initial: 'Item Baru / Semula belum ada (0 Pcs = Rp 0)',
      justek_claim: 'Penyesuaian dimensi baut flens PN16 ke baut M20x85 SS304 (72 Pcs @ Rp 96.360)',
      bapl_evidence: 'BAPL Hal 2: Terpasang 72 pcs Bolt & Nut M20x85 SS304 pada flens pipa',
      rab_revised: 'Bolt & Nut M20 x 85 SS304 (72 Pcs @ Rp 96.360 = Rp 6.937.920)',
      jusfin_claim: 'Penambahan item baru +Rp 6.937.920',
      mco_document: 'MCO-01/46308 (Approved)',
      evidence_refs: 'EV-002 (BAPL Hal 2)',
      technical_status: 'VERIFIED',
      financial_status: 'VERIFIED',
      final_status: 'VERIFIED',
      chain_consistent: true,
      notes: 'Pemasangan baut M20x85 terverifikasi 100% pada BAPL, RAB revisi, dan JusFin.',
    },
  ],
  evidences: [
    {
      evidence_id: 'EV-001',
      change_id: 'CHG-001',
      item_name: 'Gate Valve DN 300 mm PN16 (With Handwheel)',
      source: 'BAPL',
      document: 'BRN-ABJ46-46308-PJ1-MEP-BAPL-01',
      page: 1,
      snippet: 'Gate Valve DN 300 mm PN 16 (with Handwheel) - Ductile Iron GGG50, DIN-F4 (270 mm), Double Flange PN 16, Disc DI EN-GJS-500-7 + EPDM, Seat EPDM, terpasang 3 unit pada header pompa backwash.',
      full_clause: `[HASIL PEMERIKSAAN FISIK KATUP HEADER]
1) Gate Valve DN 300 mm PN 16 (with Handwheel):
   - Body Material: Ductile Iron GGG50, Face-to-face standard DIN-F4 (270 mm).
   - Rating Tekanan: Double Flange PN 16.
   - Disc: Ductile Iron dilapisi EPDM vulcanized.
   - Seat: EPDM resilient seated, 100% leak tight.
   - Stem: Stainless Steel SS 316 dengan seal ganda O-ring NBR.
   - Pengoperasian: Dilengkapi Handwheel manual cast iron dia. 300 mm.
   - Jumlah Terpasang: 3 (tiga) unit pada header suction pompa backwash No. 1, 2, dan 3.
   - Status Uji Operasi: Dilakukan uji buka-tutup (hydrostatic & operational test), katup membuka dan menutup sempurna dengan torsi ringan tanpa kebocoran pada tekanan 8.5 bar.`,
      clause_title: 'Hasil Pemeriksaan Fisik & Uji Tekanan Gate Valve DN 300 Ruang Pompa Backwash',
      verified_specs: [
        'Body: Ductile Iron GGG50, Face to Face DIN-F4 (270 mm)',
        'Koneksi: Double Flange PN 16',
        'Disc: DI EN-GJS-500-7 + EPDM, Seat EPDM Resilient',
        'Pengujian Tekanan: Lolos uji hidrostatis operasional 8.5 bar',
      ],
      cross_references: [
        'BRN-ABJ46-46308-PJ1-MEP-BAPL-01 (Hal 1)',
        'JusTek Usulan CHG-001',
        'RAB Amandemen No. 1',
      ],
      authenticity_indicators: [
        'Cap Basah & Tanda Tangan Tim Pengawas PAM / ABJ',
        'Pemeriksaan Hydrostatic Test Lapangan Terverifikasi',
      ],
      implicit_correlation_note: 'Kuantitas terpasang 3 unit gate valve double flange berpasangan dengan 6 pcs gasket EPDM dan 72 pcs baut M20x85.',
      source_type: 'OCR',
      confidence: 0.98,
      evidence_status: 'VERIFIED',
    },
    {
      evidence_id: 'EV-002',
      change_id: 'CHG-002',
      item_name: 'Gasket DN 300 mm, t=5mm, Full Face, EPDM',
      source: 'BAPL',
      document: 'BRN-ABJ46-46308-PJ1-MEP-BAPL-01',
      page: 2,
      snippet: 'Gasket EPDM ketebalan 5 mm tipe Full Face terpasang pada 6 titik sambungan flens (suction & discharge 3 unit katup Gate Valve DN 300), tidak ada kebocoran pada tekanan 8.5 bar.',
      full_clause: `[HASIL PEMERIKSAAN GASKET & SAMBUNGAN FLENS]
- Gasket EPDM ketebalan 5 mm tipe Full Face terpasang pada 6 titik sambungan flens (suction & discharge 3 unit katup Gate Valve DN 300).
- Tidak ditemukan rembesan atau kebocoran fluida pada uji tekanan operasional 8.5 bar.`,
      clause_title: 'Hasil Pemeriksaan Gasket EPDM 5 mm Sambungan Flens DN 300',
      verified_specs: [
        'Material: EPDM Full Face, Ketebalan t = 5 mm',
        'Jumlah Terpasang: 6 Pcs (2 sisi x 3 unit katup)',
        'Kerapatan: 100% Kedap pada tekanan uji 8.5 bar',
      ],
      cross_references: [
        'BRN-ABJ46-46308-PJ1-MEP-BAPL-01 (Hal 2)',
        'RAB Amandemen No. 2',
      ],
      authenticity_indicators: [
        'Opname Bersama Pengawas Lapangan',
      ],
      source_type: 'OCR',
      confidence: 0.99,
      evidence_status: 'VERIFIED',
    },
    {
      evidence_id: 'EV-003',
      change_id: 'CHG-003',
      item_name: 'Bolt & Nut [M20 x 85], SS304 (Pengganti M24)',
      source: 'BAPL',
      document: 'BRN-ABJ46-46308-PJ1-MEP-BAPL-01',
      page: 2,
      snippet: 'Baut & Mur Flens: Bolt & Nut [M20 x 85], SS304 terpasang 72 pcs (12 baut per flens x 6 titik flens pada 3 gate valve) dengan torque wrench 220 Nm.',
      full_clause: `[HASIL PEMERIKSAAN FASTENER & PENGENCANGAN FLENS]
2) Baut & Mur Flens: Bolt & Nut [M20 x 85], SS304
   - Material: Stainless Steel Grade SS304 (A2-70) anti karat.
   - Dimensi Aktual: Baut M20 panjang 85 mm full-threaded dengan 2 flat washer SS304 & 1 spring washer.
   - Jumlah Terpasang: 72 pcs (12 baut per sambungan flens x 6 titik flens pada 3 gate valve).
   - Torsi Pengencangan: Telah dikencangkan silang (cross-pattern) menggunakan torque wrench terkalibrasi pada nilai 220 Nm.
   - Status: Terpasang rapat, tidak ada lendutan atau kebocoran gasket pada saat uji tekanan kerja pompa (8.5 bar).`,
      clause_title: 'Hasil Pemeriksaan Fastener Stainless Steel M20x85 SS304 & Pengujian Torsi',
      verified_specs: [
        'Dimensi: M20 x 85 mm Full-Threaded SS304 Grade A2-70',
        'Kelengkapan: 2 Flat Washer + 1 Spring Washer SS304',
        'Kuantitas Terpasang: 72 Pcs (6 flens x 12 baut)',
        'Torsi Pengencangan: 220 Nm (Torque Wrench Terkalibrasi)',
      ],
      cross_references: [
        'BRN-ABJ46-46308-PJ1-MEP-BAPL-01 (Hal 2)',
        'Log Sheet Kalibrasi Kunci Torsi No. TW-2026',
        'RAB Amandemen No. 3',
      ],
      authenticity_indicators: [
        'Pengukuran Torsi Disaksikan Tim Pengawas',
        'Cap Basah Kontraktor & Konsultan Pengawas',
      ],
      implicit_correlation_note: 'KORELASI TEKNIS & FINANSIAL: 72 Pcs M20x85 menggantikan 72 Pcs M24. Penurunan harga satuan dari Rp 135.000 ke Rp 96.360 menghasilkan penghematan total sebesar Rp 2.782.080.',
      source_type: 'OCR',
      confidence: 0.97,
      evidence_status: 'VERIFIED',
    },
  ],
  exceptions: [],
  raw_bapl: [
    {
      page: 1,
      source: 'BRN-ABJ46-46308-PJ1-MEP-BAPL-01',
      extracted_text: `BERITA ACARA PEMERIKSAAN LAPANGAN (BAPL)
Nomor: BRN-ABJ46-46308-PJ1-MEP-BAPL-01
Proyek: Rehabilitasi Backwash Pump & Katup Header
Subproyek: Penggantian Backwash Pump Gate Valve & Flange Fasteners
Lokasi: Water Treatment Plant (WTP) - Ruang Pompa Backwash Unit 1-3
Kontraktor: PT. Berkah Rekatama Nusantara (BRN)
Nomor PO: PO-46308-MEP-2026
Tanggal: 18 September 2026

HASIL PEMERIKSAAN FISIK KATUP HEADER:
1) Gate Valve DN 300 mm PN 16 (with Handwheel):
   - Body Material: Ductile Iron GGG50, Face-to-face standard DIN-F4 (270 mm).
   - Rating Tekanan: Double Flange PN 16.
   - Disc: Ductile Iron dilapisi EPDM vulcanized.
   - Seat: EPDM resilient seated, 100% leak tight.
   - Stem: Stainless Steel SS 316 dengan seal ganda O-ring NBR.
   - Pengoperasian: Dilengkapi Handwheel manual cast iron dia. 300 mm.
   - Jumlah Terpasang: 3 (tiga) unit pada header suction pompa backwash No. 1, 2, dan 3.
   - Status Uji Operasi: Dilakukan uji buka-tutup (hydrostatic & operational test), katup membuka dan menutup sempurna dengan torsi ringan tanpa kebocoran.`,
      ocr_confidence: 0.98,
      has_visual_elements: true,
    },
    {
      page: 2,
      source: 'BRN-ABJ46-46308-PJ1-MEP-BAPL-01',
      extracted_text: `HASIL PEMERIKSAAN FASTENER & PENGENCANGAN FLENS:
2) Baut & Mur Flens: Bolt & Nut [M20 x 85], SS304
   - Material: Stainless Steel Grade SS304 (A2-70) anti karat.
   - Dimensi Aktual: Baut M20 panjang 85 mm full-threaded dengan 2 flat washer SS304 & 1 spring washer.
   - Jumlah Terpasang: 72 pcs (12 baut per sambungan flens x 6 titik flens pada 3 gate valve).
   - Torsi Pengencangan: Telah dikencangkan silang (cross-pattern) menggunakan torque wrench terkalibrasi pada nilai 220 Nm.
   - Status: Terpasang rapat, tidak ada lendutan atau kebocoran gasket pada saat uji tekanan kerja pompa (8.5 bar).`,
      ocr_confidence: 0.97,
      has_visual_elements: false,
    },
  ],
  human_review: {
    pmo_review_status: 'APPROVED',
    pmo_comments: 'Hasil verifikasi teknis dan finansial telah sesuai dengan kondisi fisik terpasang di lapangan dan analisa kompensasi anggaran.',
    final_decision: 'DISETUJUI (APPROVED) UNTUK PENERBITAN AMANDEMEN KONTRAK',
    reviewed_by: 'Tim PMO & Tim Verifikasi Pengadaan',
    review_date: '2026-09-20',
  },
  summary: {
    total_items: 2,
    verified: 2,
    mismatch: 0,
    need_support: 0,
    review: 0,
    not_found: 0,
  },
  technical_summary: {
    material_changes: 1,
    quantity_changes: 0,
    scope_changes: 0,
    method_changes: 0,
    dimension_changes: 1,
  },
  program_profile: {
    domain: 'PIPING_WATER',
    name: 'Sistem Pemipaan, Katup (Valve), Pompa & WTP',
    autoDetected: true,
    confidence: 0.99,
    matchedKeywords: ['gate valve', 'dn 300', 'pn 16', 'gasket epdm', 'bolt & nut ss 304'],
    boundariesApplied: ['valve', 'gasket', 'baut_nut', 'pipa', 'pompa'],
  },
  generated_at: '2026-09-20T23:18:00.000Z',
};

export const DEFAULT_PAKET_2: DocumentPackage = {
  id: 'pkg-46308-PJ1',
  title: 'Program 2: Proyek 46308 - Rehabilitasi Backwash & Pompa',
  projectCode: '46308',
  projectName: 'Rehabilitasi Backwash Pump & Katup Header',
  baplFiles: [
    {
      name: 'BRN-ABJ46-46308-PJ1-MEP-Rehabilitasi Backwash.pdf',
      size: 1845200,
      pageCount: 2,
    },
  ],
  projectFiles: [
    {
      name: 'BRN-ABJ46-46308-PJ1-MEP-Rehabilitasi Backwash Justifikasi.pdf',
      size: 1536000,
      type: 'PDF',
    },
    {
      name: '46308-JUSTIFIKASI FINANSIAL KONSTRUKSI.xlsx',
      size: 222822,
      type: 'EXCEL',
    },
  ],
  excelFileName: '46308-JUSTIFIKASI FINANSIAL KONSTRUKSI.xlsx',
  supportingFiles: [],
  createdAt: '2026-09-20T23:15:00.000Z',
  status: 'COMPLETED',
  result: PAKET_2_VERIFICATION_RESULT,
};
