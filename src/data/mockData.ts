import { Project, IPALocation } from '../types';

export const IPA_LIST: { id: IPALocation; name: string; capacity: string; description: string; color: string }[] = [
  { id: 'IPA Buaran 1', name: 'IPA Buaran 1', capacity: '3.000 Lps', description: 'Instalasi pengolahan air wilayah timur, sumber Saluran Tarum Barat', color: 'from-blue-600 to-cyan-700' },
  { id: 'IPA Buaran 2', name: 'IPA Buaran 2', capacity: '3.000 Lps', description: 'Pengolahan tahap II dengan sistem pulsator & filter gravitas', color: 'from-cyan-600 to-teal-700' },
  { id: 'IPA Buaran 3', name: 'IPA Buaran 3', capacity: '3.000 Lps', description: 'Ekspansi modern dengan sistem SCADA terdistribusi & reservoir booster', color: 'from-teal-600 to-emerald-700' },
  { id: 'IPA Pejompongan 1', name: 'IPA Pejompongan 1', capacity: '2.000 Lps', description: 'Instalasi legendaris melayani Jakarta Pusat & Selatan, rehabilitasi clarifier', color: 'from-indigo-600 to-blue-700' },
  { id: 'IPA Pejompongan 2', name: 'IPA Pejompongan 2', capacity: '3.600 Lps', description: 'Pusat distribusi barat & selatan, modernisasi pompa & dosing klorin', color: 'from-sky-600 to-blue-800' },
  { id: 'IPA Pulogadung', name: 'IPA Pulogadung', capacity: '4.000 Lps', description: 'Instalasi kapasitas tertinggi, filtrasi multimedia & backwash otomatis', color: 'from-blue-700 to-indigo-900' },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ-BR2-001',
    code: 'CYC-BR2-2026-001',
    name: 'Optimalisasi Pulsator Clarifier & Jalur Pipa Distribusi Utama IPA Buaran 2',
    ipa: 'IPA Buaran 2',
    contractorName: 'PT Tirta Sarana Konstruksi',
    supervisingConsultant: 'PT Virama Karya (Persero)',
    startDate: '2026-01-15',
    endDate: '2026-08-15',
    revisedEndDate: '2026-09-10',
    contractValue: 5850000000, // Rp 5.85 Milyar
    realizationValue: 3217500000,
    realizationPercentage: 55.0,
    justificationDelta: 412500000, // + Rp 412.5 Juta (+7.05%)
    progressPhysicalPlanned: 62.5,
    progressPhysicalActual: 56.0,
    progressDeviation: -6.5,
    status: 'MENUNGGU_JUSTIFIKASI',
    justifikasi: {
      id: 'JST-BR2-001',
      projectId: 'PRJ-BR2-001',
      numberJustek: '028/JUSTEK/PMO-CYC/ABJ/III/2026',
      numberJusfin: '019/JUSFIN/PMO-CYC/ABJ/III/2026',
      submissionDate: '2026-03-24',
      status: 'VERIFIKASI_BA',
      urgencyLevel: 'TINGGI',
      engineeringContext: {
        dedBaselineDescription: 'Sesuai DED awal, trase pipa distribusi dia 600mm direncanakan melintas sisi selatan sedimentasi basin dengan galian open trench kedalaman 1,5m.',
        fieldAnomalyFound: 'Saat galian MC-0 dan peninjauan bersama, ditemukan jaringan kabel tegangan menengah 20kV PLN serta utilitas pipa eksisting asbes semen (AC) dia 400mm yang tidak terdata pada gambar as-built drawing 1998.',
        rootCauseCategory: 'OBSTRUKSI_UTILITAS_EKSISTING',
        technicalSolutionRecommended: 'Pengalihan rute (re-routing) pipa sepanjang 85 meter memutar sisi barat dengan metode jacketing pelindung baja, serta penggantian spesifikasi valve ke resilient seated gate valve PN16.',
        qualityImpact: 'Mencegah resiko blackout operasional IPA dan kebocoran air baku saat pelaksanaan galian berlangsung.'
      },
      financialSummary: {
        originalContractValue: 5850000000,
        additionalWorksValue: 590000000,
        reducedWorksValue: 177500000,
        netVarianceValue: 412500000,
        revisedContractValue: 6262500000,
        variancePercentage: 7.05,
        budgetSource: 'CAPEX PMO CYCLICAL 2026'
      },
      currentApprovalStage: 2,
      approvalHistory: [
        {
          step: 'Penyusunan Usulan Draf',
          actor: 'Ir. Hendra Saputra',
          role: 'Project Manager (PT Tirta Sarana Konstruksi)',
          date: '2026-03-22 14:30',
          status: 'APPROVED',
          comments: 'Pengajuan Justek dan Jusfin akibat temuan pipa eksisting dan kabel PLN 20kV.'
        },
        {
          step: 'Verifikasi Berita Acara & Lembar Ukur Lapangan',
          actor: 'Bambang Wijanarko, ST',
          role: 'Site Engineer PMO Cyclical',
          date: '2026-03-25 10:15',
          status: 'PENDING',
          comments: 'Sedang dilakukan pencocokan item lembar ukur MC-0 dan Berita Acara Peninjauan Lapangan.'
        }
      ],
      items: [
        {
          id: 'ITEM-01',
          wbsCode: 'PIP-01',
          itemName: 'Pipa HDPE Dia 600mm PN10 SDR17 Lengkap Sambungan Stub End',
          unit: 'm',
          dedVolume: 320,
          fieldVolume: 405, // +85 m
          unitPrice: 3200000,
          linkedBaId: 'BA-BR2-01',
          linkedBaItemName: 'Pipa HDPE OD 600 mm PN 10 SDR 17',
          evidenceStatus: 'NAME_MISMATCH', // slight name disparity!
          similarityScore: 84,
          justificationReason: 'Re-routing jalur pipa menghindari benturan dengan kabel 20kV PLN eksisting.'
        },
        {
          id: 'ITEM-02',
          wbsCode: 'VLV-04',
          itemName: 'Butterfly Valve Dia 600mm Flange PN16 Gearbox Cast Iron',
          unit: 'unit',
          dedVolume: 4,
          fieldVolume: 4,
          unitPrice: 42500000,
          linkedBaId: 'BA-BR2-01',
          linkedBaItemName: 'Butterfly Valve DN 600 PN16 Gearbox Manual',
          evidenceStatus: 'VERIFIED',
          similarityScore: 92,
          justificationReason: 'Volume tetap sesuai desain DED.'
        },
        {
          id: 'ITEM-03',
          wbsCode: 'CIV-08',
          itemName: 'Proteksi Jacketing Pipa Beton Bertulang Mutu K-300 Pelindung Trase',
          unit: 'm3',
          dedVolume: 0,
          fieldVolume: 38.5, // Pekerjaan Tambah Baru
          unitPrice: 1850000,
          linkedBaId: 'BA-BR2-02',
          linkedBaItemName: 'Beton K300 Selubung Pipa Pelindung Kabel PLN',
          evidenceStatus: 'VERIFIED',
          similarityScore: 78,
          justificationReason: 'Wajib dipasang sesuai rekomendasi safety PLN saat melintas di atas kabel tegangan tinggi.'
        },
        {
          id: 'ITEM-04',
          wbsCode: 'GAL-11',
          itemName: 'Galian Tanah Manual Area Utilitas Khusus Kedalaman > 2m',
          unit: 'm3',
          dedVolume: 0,
          fieldVolume: 120, // Tambah tanpa BA!
          unitPrice: 350000,
          evidenceStatus: 'MISSING_BA',
          similarityScore: 0,
          justificationReason: 'Klaim galian manual hati-hati di sekeliling kabel PLN.'
        }
      ]
    },
    beritaAcaraList: [
      {
        id: 'BA-BR2-01',
        projectId: 'PRJ-BR2-001',
        ipa: 'IPA Buaran 2',
        baType: 'MC-0',
        baNumber: '007/BA-MC0/PMO-CYC/ABJ/II/2026',
        date: '2026-02-04',
        locationDetails: 'Area Distribusi Utama Zona B, IPA Buaran 2 (STA 0+000 s/d 0+320)',
        agenda: 'Pemeriksaan Bersama Kondisi Awal Lapangan (Mutual Check 0%) dan Penentuan Elevasi Trase Pipa',
        notes: 'Hasil pengukuran titik nol menunjukkan elevasi lahan sesuai desain, namun terdeteksi anomali utilitas bawah tanah di STA 0+180.',
        status: 'TERBIT',
        weatherCondition: 'Cerah Berawan',
        signatories: [
          { role: 'Site Engineer', name: 'Bambang Wijanarko, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-02-04 16:00', signatureHash: 'ABJ-SIG-84920' },
          { role: 'Team Leader Pengawas', name: 'Ir. Ahmad Zarkasih', institution: 'PT Virama Karya (Persero)', isSigned: true, signedAt: '2026-02-04 16:15', signatureHash: 'VRM-SIG-11029' },
          { role: 'Project Manager Kontraktor', name: 'Ir. Hendra Saputra', institution: 'PT Tirta Sarana Konstruksi', isSigned: true, signedAt: '2026-02-04 16:30', signatureHash: 'TSK-SIG-77341' }
        ],
        items: [
          { id: 'BAI-01', rawNameInBA: 'Pipa HDPE OD 600 mm PN 10 SDR 17', canonicalWbsCode: 'PIP-01', measuredVolume: 405, unit: 'm', stationing: 'STA 0+000 s/d STA 0+405', complianceStatus: 'DEVIASI_DISETUJUI', testResultNotes: 'Panjang trase bertambah 85m karena detour utilitas' },
          { id: 'BAI-02', rawNameInBA: 'Butterfly Valve DN 600 PN16 Gearbox Manual', canonicalWbsCode: 'VLV-04', measuredVolume: 4, unit: 'unit', stationing: 'Chamber Valve V-1 s/d V-4', complianceStatus: 'SESUAI', testResultNotes: 'Kondisi fisik segel utuh dan sertifikat uji pabrik terlampir' }
        ],
        attachments: [
          {
            id: 'ATT-01',
            title: 'Foto Anomali Trase Pipa & Kabel Bawah Tanah PLN',
            type: 'FOTO_LAPANGAN',
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-02-04 17:00',
            caption: 'Ekskavasi uji titik STA 0+185 memperlihatkan warning tape dan beton pelindung kabel 20kV PLN',
            stationingOrLocation: 'STA 0+185 Zona Distribusi Selatan'
          },
          {
            id: 'ATT-02',
            title: 'Lembar Ukur Pengukuran Trase Bersama (Backup Data)',
            type: 'LEMBAR_UKUR',
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-02-04 17:20',
            caption: 'Tanda tangan surveyor PT Air Bersih Jakarta dan Kontraktor Pelaksana',
            stationingOrLocation: 'STA 0+000 - STA 0+405'
          }
        ]
      },
      {
        id: 'BA-BR2-02',
        projectId: 'PRJ-BR2-001',
        ipa: 'IPA Buaran 2',
        baType: 'Peninjauan Lapangan',
        baNumber: '018/BA-PL/PMO-CYC/ABJ/III/2026',
        date: '2026-03-12',
        locationDetails: 'Perlintasan Jalur Trase Pipa Distribusi dan Kabel Tegangan Menengah PLN',
        agenda: 'Inspeksi Bersama Bersama PLN UP3 Pondok Kopi dan Penetapan Selubung Beton K-300',
        notes: 'Pihak PLN mensyaratkan selubung beton minimal K-300 tebal 20cm dengan wiremesh M8 di sekeliling pipa sepanjang 38,5 meter.',
        status: 'TERBIT',
        weatherCondition: 'Hujan Gerimis',
        signatories: [
          { role: 'Site Engineer PMO', name: 'Bambang Wijanarko, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-03-12 15:30', signatureHash: 'ABJ-SIG-99120' },
          { role: 'Konsultan Pengawas', name: 'Ir. Ahmad Zarkasih', institution: 'PT Virama Karya (Persero)', isSigned: true, signedAt: '2026-03-12 15:45', signatureHash: 'VRM-SIG-22319' },
          { role: 'Pelaksana Lapangan', name: 'Dedi Kurniawan, ST', institution: 'PT Tirta Sarana Konstruksi', isSigned: true, signedAt: '2026-03-12 16:00', signatureHash: 'TSK-SIG-88122' }
        ],
        items: [
          { id: 'BAI-03', rawNameInBA: 'Beton K300 Selubung Pipa Pelindung Kabel PLN', canonicalWbsCode: 'CIV-08', measuredVolume: 38.5, unit: 'm3', stationing: 'STA 0+180 s/d 0+218.5', complianceStatus: 'SESUAI', testResultNotes: 'Volume dihitung berdasarkan dimensi 0.9m x 0.9m x 38.5m dikurangi volume pipa' }
        ],
        attachments: [
          {
            id: 'ATT-03',
            title: 'Sketsa Rute Alternatif Disetujui PLN',
            type: 'GAMBAR_SKETSA',
            url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-03-12 16:30',
            caption: 'Denah koordinat perlintasan pipa air bersih dan kabel utilitas',
            stationingOrLocation: 'STA 0+180'
          }
        ]
      }
    ]
  },
  {
    id: 'PRJ-PJ1-002',
    code: 'CYC-PJ1-2026-004',
    name: 'Rehabilitasi Clarifier Heritage & Penggantian Pipa Header Sedimentasi IPA Pejompongan 1',
    ipa: 'IPA Pejompongan 1',
    contractorName: 'PT Total Bangun Tirta',
    supervisingConsultant: 'PT Ciriajasa Cipta Mandiri',
    startDate: '2026-02-01',
    endDate: '2026-09-30',
    contractValue: 4720000000, // Rp 4.72 Milyar
    realizationValue: 1888000000,
    realizationPercentage: 40.0,
    justificationDelta: 185000000, // + Rp 185 Juta (+3.92%)
    progressPhysicalPlanned: 45.0,
    progressPhysicalActual: 43.5,
    progressDeviation: -1.5,
    status: 'BERJALAN',
    justifikasi: {
      id: 'JST-PJ1-002',
      projectId: 'PRJ-PJ1-002',
      numberJustek: '015/JUSTEK/PMO-CYC/ABJ/II/2026',
      numberJusfin: '011/JUSFIN/PMO-CYC/ABJ/II/2026',
      submissionDate: '2026-02-28',
      status: 'REVIEW_TEKNIS',
      urgencyLevel: 'SEDANG',
      engineeringContext: {
        dedBaselineDescription: 'Penggantian baffle plate baja galvanis dan re-coating struktur beton clarifier unit 2 & 3.',
        fieldAnomalyFound: 'Kondisi dinding beton clarifier heritage yang dibangun tahun 1957 mengalami delaminasi dan spalling lebih dalam (hingga 8cm) pada zona pasang surut air olahan.',
        rootCauseCategory: 'STRUKTUR_TANAH',
        technicalSolutionRecommended: 'Perkuatan struktur dengan metode injection epoxy non-shrink grout dan penambahan anti-corrosion polyurea lining tahan klorin.',
        qualityImpact: 'Memastikan integritas struktur beton heritage dapat bertahan minimal 25 tahun ke depan.'
      },
      financialSummary: {
        originalContractValue: 4720000000,
        additionalWorksValue: 245000000,
        reducedWorksValue: 60000000,
        netVarianceValue: 185000000,
        revisedContractValue: 4905000000,
        variancePercentage: 3.92,
        budgetSource: 'CAPEX PMO CYCLICAL 2026'
      },
      currentApprovalStage: 3,
      approvalHistory: [
        {
          step: 'Penyusunan Usulan Draf',
          actor: 'Suryo Pratama, ST',
          role: 'Project Manager (PT Total Bangun Tirta)',
          date: '2026-02-27 11:00',
          status: 'APPROVED',
          comments: 'Pengajuan Justek berdasarkan temuan degradasi beton clarifier.'
        },
        {
          step: 'Verifikasi Berita Acara Lapangan',
          actor: 'Fauzi Rahmat, ST',
          role: 'Site Engineer PMO Pejompongan',
          date: '2026-03-02 09:30',
          status: 'APPROVED',
          comments: 'BA Peninjauan Lapangan No. 008/BA-PL telah diverifikasi bersama Konsultan Pengawas.'
        },
        {
          step: 'Review Teknis & Spesifikasi',
          actor: 'Ir. Didik Prasetyo, MT',
          role: 'Lead Technical Reviewer PMO',
          date: '2026-03-05 14:00',
          status: 'PENDING',
          comments: 'Sedang mengevaluasi kompatibilitas polyurea coating terhadap sertifikasi food-grade (air minum).'
        }
      ],
      items: [
        {
          id: 'ITEM-PJ-01',
          wbsCode: 'STR-02',
          itemName: 'Injeksi Epoxy Non-Shrink Grout Retak Beton Struktur Clarifier',
          unit: 'titik',
          dedVolume: 40,
          fieldVolume: 95,
          unitPrice: 1650000,
          linkedBaId: 'BA-PJ1-01',
          linkedBaItemName: 'Titik Injeksi Retak Epoxy Dinding Clarifier',
          evidenceStatus: 'VERIFIED',
          similarityScore: 89,
          justificationReason: 'Jumlah retak rambut dan delaminasi lebih banyak dari baseline visual inspection luar.'
        },
        {
          id: 'ITEM-PJ-02',
          wbsCode: 'LIN-05',
          itemName: 'Pelapisan Polyurea Anti-Klorin Food Grade Bersertifikat NSF-61',
          unit: 'm2',
          dedVolume: 350,
          fieldVolume: 420,
          unitPrice: 420000,
          linkedBaId: 'BA-PJ1-01',
          linkedBaItemName: 'Coating Polyurea Tahan Kimia Klorin Dinding Air',
          evidenceStatus: 'NAME_MISMATCH',
          similarityScore: 76,
          justificationReason: 'Perluasan area pelapisan hingga bibir limpasan weir plate.'
        }
      ]
    },
    beritaAcaraList: [
      {
        id: 'BA-PJ1-01',
        projectId: 'PRJ-PJ1-002',
        ipa: 'IPA Pejompongan 1',
        baType: 'Peninjauan Lapangan',
        baNumber: '008/BA-PL/PMO-CYC/ABJ/II/2026',
        date: '2026-02-18',
        locationDetails: 'Clarifier Unit 2, Instalasi Pengolahan Air Pejompongan 1',
        agenda: 'Uji Core Drill & Hammer Test Struktur Beton Clarifier Usia 60+ Tahun',
        notes: 'Ditemukan retak struktural di balik lapisan plesteran lama sedalam 6-8cm. Disepakati menambah perbaikan injeksi epoxy.',
        status: 'TERBIT',
        weatherCondition: 'Cerah',
        signatories: [
          { role: 'Site Engineer', name: 'Fauzi Rahmat, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-02-18 16:30', signatureHash: 'ABJ-SIG-45129' },
          { role: 'Supervisi Pengawas', name: 'Ir. Tri Maryanto', institution: 'PT Ciriajasa Cipta Mandiri', isSigned: true, signedAt: '2026-02-18 16:45', signatureHash: 'CCM-SIG-77218' },
          { role: 'Site Manager', name: 'Suryo Pratama, ST', institution: 'PT Total Bangun Tirta', isSigned: true, signedAt: '2026-02-18 17:00', signatureHash: 'TBT-SIG-33109' }
        ],
        items: [
          { id: 'BAIPJ-01', rawNameInBA: 'Titik Injeksi Retak Epoxy Dinding Clarifier', canonicalWbsCode: 'STR-02', measuredVolume: 95, unit: 'titik', stationing: 'Clarifier 2 Sektor A, B, C', complianceStatus: 'DEVIASI_DISETUJUI', testResultNotes: 'Kedalaman penetrasi resin 75mm memenuhi syarat penutupan retak' },
          { id: 'BAIPJ-02', rawNameInBA: 'Coating Polyurea Tahan Kimia Klorin Dinding Air', canonicalWbsCode: 'LIN-05', measuredVolume: 420, unit: 'm2', stationing: 'Baffle Wall & Weir Plate', complianceStatus: 'SESUAI', testResultNotes: 'Uji adhesi pull-off test > 2.5 MPa' }
        ],
        attachments: [
          {
            id: 'ATT-PJ-01',
            title: 'Hasil Hammer Test dan Mapping Retak Beton Clarifier 2',
            type: 'HASIL_LAB',
            url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-02-19 09:00',
            caption: 'Dokumentasi penandaan spalling beton menggunakan cat penanda',
            stationingOrLocation: 'Clarifier 2 Dinding Sisi Barat'
          }
        ]
      }
    ]
  },
  {
    id: 'PRJ-PLG-003',
    code: 'CYC-PLG-2026-002',
    name: 'Penggantian Media Filter Silika & Anthracite Serta Otomasi Valve Backwash IPA Pulogadung',
    ipa: 'IPA Pulogadung',
    contractorName: 'PT Cipta Aneka Air Minum',
    supervisingConsultant: 'PT Yodya Karya (Persero)',
    startDate: '2026-01-10',
    endDate: '2026-06-30',
    contractValue: 7150000000, // Rp 7.15 Milyar
    realizationValue: 5005000000,
    realizationPercentage: 70.0,
    justificationDelta: -85000000, // Efisiensi penghematan Rp 85 Juta (-1.19%)
    progressPhysicalPlanned: 75.0,
    progressPhysicalActual: 78.5,
    progressDeviation: 3.5,
    status: 'BERJALAN',
    justifikasi: {
      id: 'JST-PLG-003',
      projectId: 'PRJ-PLG-003',
      numberJustek: '009/JUSTEK/PMO-CYC/ABJ/I/2026',
      numberJusfin: '007/JUSFIN/PMO-CYC/ABJ/I/2026',
      submissionDate: '2026-01-28',
      effectiveDate: '2026-02-15',
      status: 'DISETUJUI',
      urgencyLevel: 'STANDAR',
      engineeringContext: {
        dedBaselineDescription: 'Penggantian 12 bak filter dengan media pasir silika mesh 8-16 dan garnet sand.',
        fieldAnomalyFound: 'Kondisi nozzle strainer eksisting masih memiliki ketahanan mekanik 90% setelah dibersihkan secara ultrasonik.',
        rootCauseCategory: 'OPTIMALISASI_PROSES_AIR',
        technicalSolutionRecommended: 'Mempertahankan 40% nozzle yang masih presisi dan mengalihkan anggaran ke peningkatan kualitas anthracite grade premium dengan uniformity coefficient < 1.3.',
        qualityImpact: 'Turbiditas air filter turun dari 0.8 NTU menjadi 0.25 NTU, menghemat frekuensi backwash hingga 30%.'
      },
      financialSummary: {
        originalContractValue: 7150000000,
        additionalWorksValue: 180000000,
        reducedWorksValue: 265000000,
        netVarianceValue: -85000000,
        revisedContractValue: 7065000000,
        variancePercentage: -1.19,
        budgetSource: 'CAPEX PMO CYCLICAL 2026'
      },
      currentApprovalStage: 5,
      approvalHistory: [
        { step: 'Penyusunan Draf', actor: 'Ir. Kevin Sanjaya', role: 'Kontraktor', date: '2026-01-28', status: 'APPROVED', comments: 'Optimalisasi media filter' },
        { step: 'Verifikasi Site PMO', actor: 'Rudi Hartono, ST', role: 'Site Engineer Pulogadung', date: '2026-01-30', status: 'APPROVED', comments: 'BA MC-0 dan uji lab nozzle valid' },
        { step: 'Review Teknis', actor: 'Ir. Didik Prasetyo, MT', role: 'Lead Technical Reviewer', date: '2026-02-05', status: 'APPROVED', comments: 'Spesifikasi anthracite premium sangat bagus' },
        { step: 'Review Finansial', actor: 'Siti Rahmawati, SE, Ak', role: 'Financial PMO', date: '2026-02-10', status: 'APPROVED', comments: 'Terjadi net deduction Rp 85 juta (efisiensi)' },
        { step: 'Pengesahan Kepala PMO', actor: 'Dr. Ir. Bagus Wicaksono, MM', role: 'Kadep PMO Cyclical', date: '2026-02-15', status: 'APPROVED', comments: 'Adendum I disahkan dan diterbitkan.' }
      ],
      items: [
        {
          id: 'ITM-PLG-01',
          wbsCode: 'FLT-01',
          itemName: 'Media Anthracite Premium Filter Karbon Aktif Bersertifikat Halal & NSF',
          unit: 'ton',
          dedVolume: 120,
          fieldVolume: 150,
          unitPrice: 22000000,
          linkedBaId: 'BA-PLG-01',
          linkedBaItemName: 'Anthracite Karbon Filter Premium Grade A',
          evidenceStatus: 'VERIFIED',
          similarityScore: 88,
          justificationReason: 'Meningkatkan ketebalan bed filter untuk penurunan zat organik air baku sungai.'
        },
        {
          id: 'ITM-PLG-02',
          wbsCode: 'FLT-04',
          itemName: 'Penggantian Nozzle Strainer Bak Filter PP Food Grade',
          unit: 'buah',
          dedVolume: 4800,
          fieldVolume: 2880, // Pengurangan volume
          unitPrice: 85000,
          linkedBaId: 'BA-PLG-01',
          linkedBaItemName: 'Nozzle Strainer Plastik PP Saringan Bawah Bak',
          evidenceStatus: 'VERIFIED',
          similarityScore: 82,
          justificationReason: 'Pengurangan pekerjaan karena 40% nozzle eksisting lulus uji hidrolik.'
        }
      ]
    },
    beritaAcaraList: [
      {
        id: 'BA-PLG-01',
        projectId: 'PRJ-PLG-003',
        ipa: 'IPA Pulogadung',
        baType: 'MC-0',
        baNumber: '002/BA-MC0/PMO-CYC/ABJ/I/2026',
        date: '2026-01-18',
        locationDetails: 'Gedung Filtrasi Tahap II IPA Pulogadung',
        agenda: 'Pemeriksaan Visual & Uji Nozzle Strainer 12 Bak Filter',
        notes: 'Sebagian besar nozzle strainer pada filter 1 s/d 5 masih sangat layak setelah flushing berkala.',
        status: 'TERBIT',
        weatherCondition: 'Cerah',
        signatories: [
          { role: 'Site Engineer PMO', name: 'Rudi Hartono, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-01-18 15:00', signatureHash: 'ABJ-SIG-19284' },
          { role: 'Pengawas Teknis', name: 'Ir. Wahyu Hidayat', institution: 'PT Yodya Karya (Persero)', isSigned: true, signedAt: '2026-01-18 15:30', signatureHash: 'YDY-SIG-98442' }
        ],
        items: [
          { id: 'BAIPLG-01', rawNameInBA: 'Anthracite Karbon Filter Premium Grade A', canonicalWbsCode: 'FLT-01', measuredVolume: 150, unit: 'ton', stationing: 'Bak Filter No. 1 s/d 12', complianceStatus: 'SESUAI' },
          { id: 'BAIPLG-02', rawNameInBA: 'Nozzle Strainer Plastik PP Saringan Bawah Bak', canonicalWbsCode: 'FLT-04', measuredVolume: 2880, unit: 'buah', stationing: 'Underdrain Filter System', complianceStatus: 'DEVIASI_DISETUJUI' }
        ],
        attachments: [
          {
            id: 'ATT-PLG-01',
            title: 'Sertifikat Uji Lab Kualitas Anthracite',
            type: 'HASIL_LAB',
            url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-01-20 10:00',
            caption: 'Hasil uji densitas dan koefisien keseragaman media filter',
            stationingOrLocation: 'Lab Kualitas Air ABJ'
          }
        ]
      },
      {
        id: 'BA-PLG-02',
        projectId: 'PRJ-PLG-003',
        ipa: 'IPA Pulogadung',
        baType: 'Tes Komisioning',
        baNumber: '006/BA-TK/PMO-CYC/ABJ/IV/2026',
        date: '2026-04-10',
        locationDetails: 'Filter Bay No. 1 - 4 IPA Pulogadung',
        agenda: 'Uji Coba Pengoperasian Filter Air Bersih & Tes Kekeruhan (Turbiditas)',
        notes: 'Hasil tes menunjukkan air olahan memenuhi standar Permenkes 2/2023 dengan kekeruhan 0.22 NTU.',
        status: 'TERBIT',
        weatherCondition: 'Cerah',
        waterQualityMetrics: {
          turbidityNTU: 0.22,
          pH: 7.35,
          chlorinePPM: 1.15,
          flowRateLPS: 420
        },
        signatories: [
          { role: 'Site Engineer PMO', name: 'Rudi Hartono, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-04-10 16:00', signatureHash: 'ABJ-SIG-33291' },
          { role: 'Laboran Pengendali Mutu', name: 'Dra. Endang Sulastri', institution: 'PT Air Bersih Jakarta (QA/QC)', isSigned: true, signedAt: '2026-04-10 16:15', signatureHash: 'ABJ-SIG-44910' }
        ],
        items: [
          { id: 'BAIPLG-03', rawNameInBA: 'Uji Turbiditas Hasil Filter Air Minum', canonicalWbsCode: 'TES-01', measuredVolume: 4, unit: 'bak', stationing: 'Filter 1 s/d 4', complianceStatus: 'SESUAI', testResultNotes: 'Rata-rata 0.22 NTU (dibawah ambang batas 0.5 NTU)' }
        ],
        attachments: [
          {
            id: 'ATT-PLG-02',
            title: 'Foto Display Sensor Turbidity Online Transmitter',
            type: 'FOTO_LAPANGAN',
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-04-10 16:30',
            caption: 'Sensor menunjukkan angka 0.22 NTU stabil selama 6 jam continuous run',
            stationingOrLocation: 'Effluent Channel Filter 1-4'
          }
        ]
      }
    ]
  },
  {
    id: 'PRJ-PJ2-004',
    code: 'CYC-PJ2-2026-003',
    name: 'Modernisasi Otomasi Dosing Kimia Koagulan & SCADA PLC IPA Pejompongan 2',
    ipa: 'IPA Pejompongan 2',
    contractorName: 'PT Elmecon Otomasi Mandiri',
    supervisingConsultant: 'PT Bina Karya (Persero)',
    startDate: '2026-02-15',
    endDate: '2026-07-31',
    contractValue: 3950000000,
    realizationValue: 1580000000,
    realizationPercentage: 40.0,
    justificationDelta: 275000000,
    progressPhysicalPlanned: 42.0,
    progressPhysicalActual: 40.0,
    progressDeviation: -2.0,
    status: 'MENUNGGU_JUSTIFIKASI',
    justifikasi: {
      id: 'JST-PJ2-004',
      projectId: 'PRJ-PJ2-004',
      numberJustek: '022/JUSTEK/PMO-CYC/ABJ/III/2026',
      numberJusfin: '016/JUSFIN/PMO-CYC/ABJ/III/2026',
      submissionDate: '2026-03-18',
      status: 'REVIEW_FINANSIAL',
      urgencyLevel: 'TINGGI',
      engineeringContext: {
        dedBaselineDescription: 'Penggantian dosing pump koagulan poli-aluminium klorida (PAC) tipe diafragma mekanis 6 unit.',
        fieldAnomalyFound: 'Fluktuasi kekeruhan air baku Kali Krukut meningkat tajam saat musim hujan dari 150 NTU melonjak ke 1.800 NTU sehingga memerlukan dosing pump presisi dengan motor servo inverter dan feedback loop streaming.',
        rootCauseCategory: 'PENINGKATAN_SPESIFIKASI',
        technicalSolutionRecommended: 'Upgrade spesifikasi ke Dosing Pump Digital Solenoid Smart Inverter kapasitas 0-250 L/h lengkap dengan sensor streaming current monitor (SCM).',
        qualityImpact: 'Efisiensi pemakaian bahan kimia koagulan hingga 22% dan mencegah flok carryover ke bak sedimentasi.'
      },
      financialSummary: {
        originalContractValue: 3950000000,
        additionalWorksValue: 340000000,
        reducedWorksValue: 65000000,
        netVarianceValue: 275000000,
        revisedContractValue: 4225000000,
        variancePercentage: 6.96,
        budgetSource: 'CAPEX PMO CYCLICAL 2026'
      },
      currentApprovalStage: 4,
      approvalHistory: [
        { step: 'Draf Kontraktor', actor: 'Denny Susanto, ST', role: 'Project Manager', date: '2026-03-18', status: 'APPROVED', comments: 'Pengajuan upgrade smart dosing pump' },
        { step: 'Verifikasi Site PMO', actor: 'Fauzi Rahmat, ST', role: 'Site PMO', date: '2026-03-20', status: 'APPROVED', comments: 'BA Peninjauan Lapangan dan data historis kekeruhan terbukti' },
        { step: 'Review Teknis', actor: 'Ir. Didik Prasetyo, MT', role: 'Lead Technical Reviewer', date: '2026-03-26', status: 'APPROVED', comments: 'Secara teknis disetujui untuk akurasi dosis kimia' },
        { step: 'Review Finansial', actor: 'Siti Rahmawati, SE, Ak', role: 'Financial PMO', date: '2026-03-29', status: 'PENDING', comments: 'Sedang mengecek kewajaran harga satuan pompa inverter (OE perbandingan).' }
      ],
      items: [
        {
          id: 'ITM-PJ2-01',
          wbsCode: 'ELC-02',
          itemName: 'Dosing Pump Smart Digital Inverter PAC Kapasitas 250 L/h Auto Control',
          unit: 'unit',
          dedVolume: 6,
          fieldVolume: 6,
          unitPrice: 58000000,
          linkedBaId: 'BA-PJ2-01',
          linkedBaItemName: 'Pompa Injeksi PAC Smart Inverter Otomatis 250 Lph',
          evidenceStatus: 'NAME_MISMATCH',
          similarityScore: 81,
          justificationReason: 'Spesifikasi diupgrade dari pompa diafragma analog menjadi smart servo inverter.'
        },
        {
          id: 'ITM-PJ2-02',
          wbsCode: 'INS-08',
          itemName: 'Streaming Current Monitor (SCM) Sensor Kebutuhan Koagulan Real-time',
          unit: 'set',
          dedVolume: 0,
          fieldVolume: 2, // Tambah Baru
          unitPrice: 62500000,
          linkedBaId: 'BA-PJ2-01',
          linkedBaItemName: 'Sensor Streaming Current Detector Monitoring Koagulan',
          evidenceStatus: 'VERIFIED',
          similarityScore: 79,
          justificationReason: 'Diperlukan untuk otomatisasi pengaturan flow rate pompa koagulan sesuai perubahan kekeruhan seketika.'
        }
      ]
    },
    beritaAcaraList: [
      {
        id: 'BA-PJ2-01',
        projectId: 'PRJ-PJ2-004',
        ipa: 'IPA Pejompongan 2',
        baType: 'Peninjauan Lapangan',
        baNumber: '011/BA-PL/PMO-CYC/ABJ/III/2026',
        date: '2026-03-15',
        locationDetails: 'Ruang Dosing Kimia & Gedung Koagulasi IPA Pejompongan 2',
        agenda: 'Evaluasi Kinerja Dosing Pump Eksisting dan Kebutuhan Kontrol Otomatis SCM',
        notes: 'Pemeriksaan bersama mencatat adanya lonjakan turbidity ekstrem dan rekomendasi penggantian ke smart inverter dosing pump.',
        status: 'TERBIT',
        weatherCondition: 'Hujan Deras',
        signatories: [
          { role: 'Site Engineer PMO', name: 'Fauzi Rahmat, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-03-15 14:00', signatureHash: 'ABJ-SIG-77112' },
          { role: 'Konsultan Supervisi', name: 'Ir. Handoyo Broto', institution: 'PT Bina Karya (Persero)', isSigned: true, signedAt: '2026-03-15 14:30', signatureHash: 'BNK-SIG-44109' }
        ],
        items: [
          { id: 'BAIPJ2-01', rawNameInBA: 'Pompa Injeksi PAC Smart Inverter Otomatis 250 Lph', canonicalWbsCode: 'ELC-02', measuredVolume: 6, unit: 'unit', stationing: 'Chemical Building Skid 1-6', complianceStatus: 'DEVIASI_DISETUJUI' },
          { id: 'BAIPJ2-02', rawNameInBA: 'Sensor Streaming Current Detector Monitoring Koagulan', canonicalWbsCode: 'INS-08', measuredVolume: 2, unit: 'set', stationing: 'Inlet Flash Mixing Well', complianceStatus: 'SESUAI' }
        ],
        attachments: [
          {
            id: 'ATT-PJ2-01',
            title: 'Grafik Kekeruhan Air Baku & Kebutuhan Dosis PAC',
            type: 'LEMBAR_UKUR',
            url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-03-15 16:00',
            caption: 'Data SCADA historis 30 hari menunjukkan fluktuasi turbidity ekstrem',
            stationingOrLocation: 'Intake Kali Krukut'
          }
        ]
      }
    ]
  },
  {
    id: 'PRJ-BR3-005',
    code: 'CYC-BR3-2026-002',
    name: 'Pembangunan Pipa Interkoneksi Transmisi Air Baku & Pemasangan Ultrasonic Flow Meter IPA Buaran 3',
    ipa: 'IPA Buaran 3',
    contractorName: 'PT Nindya Tirta Utama',
    supervisingConsultant: 'PT Virama Karya (Persero)',
    startDate: '2026-03-01',
    endDate: '2026-11-30',
    contractValue: 8400000000,
    realizationValue: 1260000000,
    realizationPercentage: 15.0,
    justificationDelta: 0,
    progressPhysicalPlanned: 18.0,
    progressPhysicalActual: 17.5,
    progressDeviation: -0.5,
    status: 'BERJALAN',
    beritaAcaraList: [
      {
        id: 'BA-BR3-01',
        projectId: 'PRJ-BR3-005',
        ipa: 'IPA Buaran 3',
        baType: 'MC-0',
        baNumber: '014/BA-MC0/PMO-CYC/ABJ/III/2026',
        date: '2026-03-08',
        locationDetails: 'Jalur Pipa Transmisi Air Baku Tarum Barat ke Intake Buaran 3',
        agenda: 'Pemeriksaan Bersama Kondisi Fisik Lapangan dan Uji Soil Investigation',
        notes: 'Semua trase pipa telah disurvei bersama tanpa ada halangan utilitas mayor.',
        status: 'TERBIT',
        weatherCondition: 'Cerah',
        signatories: [
          { role: 'Site Engineer PMO', name: 'Bambang Wijanarko, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-03-08 15:00', signatureHash: 'ABJ-SIG-66128' },
          { role: 'Project Manager', name: 'Ir. Antonius Yoga', institution: 'PT Nindya Tirta Utama', isSigned: true, signedAt: '2026-03-08 15:30', signatureHash: 'NTU-SIG-88192' }
        ],
        items: [
          { id: 'BAIBR3-01', rawNameInBA: 'Pipa Baja Spiral Welded Dia 1000mm Tebal 10mm', canonicalWbsCode: 'PIP-10', measuredVolume: 550, unit: 'm', stationing: 'STA 0+000 - 0+550', complianceStatus: 'SESUAI' },
          { id: 'BAIBR3-02', rawNameInBA: 'Ultrasonic Flow Meter Insertion DN1000 4-Beam Akurasi 0.5%', canonicalWbsCode: 'FLW-01', measuredVolume: 2, unit: 'set', stationing: 'Manhole Metering M-1 & M-2', complianceStatus: 'SESUAI' }
        ],
        attachments: [
          {
            id: 'ATT-BR3-01',
            title: 'Dokumentasi Patok Trase Jalur Pipa Air Baku STA 0+000',
            type: 'FOTO_LAPANGAN',
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-03-08 16:30',
            caption: 'Pemasangan patok acuan elevasi tanah dan koordinat geodetik',
            stationingOrLocation: 'STA 0+000 Sisi Kanal Tarum Barat'
          }
        ]
      }
    ]
  },
  {
    id: 'PRJ-BR1-006',
    code: 'CYC-BR1-2026-003',
    name: 'Overhaul Pompa Distribusi Sentrifugal Horizontal 500 Lps & Penggantian Motor 400 kW IPA Buaran 1',
    ipa: 'IPA Buaran 1',
    contractorName: 'PT Aquatech Engineering Indonesia',
    supervisingConsultant: 'PT Ciriajasa Cipta Mandiri',
    startDate: '2025-11-01',
    endDate: '2026-04-30',
    contractValue: 3600000000,
    realizationValue: 3420000000,
    realizationPercentage: 95.0,
    justificationDelta: 120000000,
    progressPhysicalPlanned: 100.0,
    progressPhysicalActual: 98.0,
    progressDeviation: -2.0,
    status: 'BERJALAN',
    justifikasi: {
      id: 'JST-BR1-006',
      projectId: 'PRJ-BR1-006',
      numberJustek: '003/JUSTEK/PMO-CYC/ABJ/I/2026',
      numberJusfin: '002/JUSFIN/PMO-CYC/ABJ/I/2026',
      submissionDate: '2026-01-14',
      effectiveDate: '2026-02-01',
      status: 'DISETUJUI',
      urgencyLevel: 'TINGGI',
      engineeringContext: {
        dedBaselineDescription: 'Rewinding motor listrik eksisting 400 kW dan penggantian bearing mechanical seal pompa 3 unit.',
        fieldAnomalyFound: 'Saat pembongkaran impeller pompa unit 2, ditemukan kavitasi parah dan erosi pada sudu-sudu impeller serta shaft mengalami runout melebihi batas toleransi 0.08mm.',
        rootCauseCategory: 'KONDISI_DARURAT',
        technicalSolutionRecommended: 'Penggantian 1 unit impeller duplex stainless steel baru tahan abrasi dan balancing dinamis poros pompa.',
        qualityImpact: 'Mencegah trip getaran mendadak yang dapat menghentikan suplai air ke area Jakarta Utara.'
      },
      financialSummary: {
        originalContractValue: 3600000000,
        additionalWorksValue: 120000000,
        reducedWorksValue: 0,
        netVarianceValue: 120000000,
        revisedContractValue: 3720000000,
        variancePercentage: 3.33,
        budgetSource: 'CADANGAN KONTINGENSI'
      },
      currentApprovalStage: 5,
      approvalHistory: [
        { step: 'Draf Kontraktor', actor: 'Ir. Gunawan Wibowo', role: 'Project Manager', date: '2026-01-14', status: 'APPROVED', comments: 'Pengajuan darurat impeller kavitasi' },
        { step: 'Site PMO', actor: 'Bambang Wijanarko, ST', role: 'Site PMO', date: '2026-01-16', status: 'APPROVED', comments: 'Pengukuran runout shaft valid di bengkel bubut' },
        { step: 'Review Teknis', actor: 'Ir. Didik Prasetyo, MT', role: 'Lead Technical Reviewer', date: '2026-01-20', status: 'APPROVED', comments: 'Material duplex stainless steel disetujui' },
        { step: 'Review Finansial', actor: 'Siti Rahmawati, SE, Ak', role: 'Financial PMO', date: '2026-01-25', status: 'APPROVED', comments: 'Sumber dana kontingensi PMO tersedia' },
        { step: 'Pengesahan Kadep', actor: 'Dr. Ir. Bagus Wicaksono, MM', role: 'Kadep PMO Cyclical', date: '2026-02-01', status: 'APPROVED', comments: 'Adendum disetujui untuk kesinambungan pelayanan air' }
      ],
      items: [
        {
          id: 'ITM-BR1-01',
          wbsCode: 'PMP-01',
          itemName: 'Pengadaan Impeller Duplex Stainless Steel 2205 Pompa 500 Lps',
          unit: 'unit',
          dedVolume: 0,
          fieldVolume: 1,
          unitPrice: 120000000,
          linkedBaId: 'BA-BR1-02',
          linkedBaItemName: 'Impeller Pompa Sentrifugal 500 Lps Duplex SS',
          evidenceStatus: 'VERIFIED',
          similarityScore: 91,
          justificationReason: 'Penggantian akibat kavitasi dan keretakan sudu impeller lama.'
        }
      ]
    },
    beritaAcaraList: [
      {
        id: 'BA-BR1-01',
        projectId: 'PRJ-BR1-006',
        ipa: 'IPA Buaran 1',
        baType: 'MC-0',
        baNumber: '001/BA-MC0/PMO-CYC/ABJ/XI/2025',
        date: '2025-11-08',
        locationDetails: 'Rumah Pompa Distribusi Utama IPA Buaran 1',
        agenda: 'Pembongkaran Awal dan Pengecekan Kondisi Pompa Unit 1, 2, dan 3',
        notes: 'Unit 1 & 3 dalam kondisi aus wajar, Unit 2 mengalami vibrasi abnormal.',
        status: 'TERBIT',
        signatories: [
          { role: 'Site Engineer PMO', name: 'Bambang Wijanarko, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2025-11-08 16:00', signatureHash: 'ABJ-SIG-11928' }
        ],
        items: [
          { id: 'BAIBR1-01', rawNameInBA: 'Overhaul Mekanikal Pompa Sentrifugal 500 Lps', canonicalWbsCode: 'PMP-00', measuredVolume: 3, unit: 'unit', stationing: 'Pompa P-1, P-2, P-3', complianceStatus: 'SESUAI' }
        ],
        attachments: []
      },
      {
        id: 'BA-BR1-02',
        projectId: 'PRJ-BR1-006',
        ipa: 'IPA Buaran 1',
        baType: 'Peninjauan Lapangan',
        baNumber: '004/BA-PL/PMO-CYC/ABJ/I/2026',
        date: '2026-01-10',
        locationDetails: 'Workshop Rekondisi Pompa & Ruang Pompa Buaran 1',
        agenda: 'Inspeksi Kerusakan Impeller dan Uji Runout Shaft Pompa Unit 2',
        notes: 'Disepakati mengganti 1 set impeller duplex baru untuk menjamin keandalan pompa.',
        status: 'TERBIT',
        signatories: [
          { role: 'Site Engineer PMO', name: 'Bambang Wijanarko, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-01-10 15:30', signatureHash: 'ABJ-SIG-44910' }
        ],
        items: [
          { id: 'BAIBR1-02', rawNameInBA: 'Impeller Pompa Sentrifugal 500 Lps Duplex SS', canonicalWbsCode: 'PMP-01', measuredVolume: 1, unit: 'unit', stationing: 'Pompa P-2', complianceStatus: 'DEVIASI_DISETUJUI' }
        ],
        attachments: [
          {
            id: 'ATT-BR1-01',
            title: 'Foto Erosi Kavitasi Sudu Impeller Eksisting',
            type: 'FOTO_LAPANGAN',
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-01-10 16:00',
            caption: 'Tampak keretakan dan lubang pori kavitasi pada blade impeller eksisting',
            stationingOrLocation: 'Impeller Pompa 2 Buaran 1'
          }
        ]
      },
      {
        id: 'BA-BR1-03',
        projectId: 'PRJ-BR1-006',
        ipa: 'IPA Buaran 1',
        baType: 'Tes Komisioning',
        baNumber: '012/BA-TK/PMO-CYC/ABJ/III/2026',
        date: '2026-03-20',
        locationDetails: 'Rumah Pompa Buaran 1',
        agenda: 'Running Test Beban Penuh Pompa 2 Pasca Penggantian Impeller',
        notes: 'Tekanan discharge mencapai 6.2 bar pada debit 515 lps, vibrasi 1.8 mm/s RMS (Standar ISO 10816 Zone A Good).',
        status: 'TERBIT',
        waterQualityMetrics: {
          pressureBar: 6.2,
          flowRateLPS: 515
        },
        signatories: [
          { role: 'Site Engineer PMO', name: 'Bambang Wijanarko, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-03-20 17:00', signatureHash: 'ABJ-SIG-99182' }
        ],
        items: [
          { id: 'BAIBR1-03', rawNameInBA: 'Running Test Beban Penuh Pompa Distribusi 500 Lps', canonicalWbsCode: 'TES-02', measuredVolume: 1, unit: 'unit', stationing: 'Pompa P-2', complianceStatus: 'SESUAI' }
        ],
        attachments: [
          {
            id: 'ATT-BR1-02',
            title: 'Grafik Analisis Vibrasi Pompa Pasca Overhaul',
            type: 'LEMBAR_UKUR',
            url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-03-20 17:30',
            caption: 'Spektrum getaran menunjukkan kondisi operasional prima',
            stationingOrLocation: 'Bearing Drive End & Non-Drive End'
          }
        ]
      },
      {
        id: 'BA-BR1-04',
        projectId: 'PRJ-BR1-006',
        ipa: 'IPA Buaran 1',
        baType: 'MC-100',
        baNumber: '005/BA-MC100/PMO-CYC/ABJ/IV/2026',
        date: '2026-04-12',
        locationDetails: 'Area Distribusi Utama IPA Buaran 1',
        agenda: 'Mutual Check 100% (MC-100) dan Serah Terima Fisik Pertama (PHO)',
        notes: 'Seluruh lingkup pekerjaan overhaul dan penggantian motor serta impeller telah diselesaikan 100% dan lulus uji komisioning.',
        status: 'TERBIT',
        signatories: [
          { role: 'Site Engineer PMO', name: 'Bambang Wijanarko, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-04-12 11:00', signatureHash: 'ABJ-SIG-55910' },
          { role: 'Konsultan Pengawas', name: 'Ir. Tri Maryanto', institution: 'PT Ciriajasa Cipta Mandiri', isSigned: true, signedAt: '2026-04-12 11:30', signatureHash: 'CCM-SIG-88123' },
          { role: 'Direktur Kontraktor', name: 'Ir. Gunawan Wibowo', institution: 'PT Aquatech Engineering Indonesia', isSigned: true, signedAt: '2026-04-12 12:00', signatureHash: 'AEI-SIG-33019' }
        ],
        items: [
          { id: 'BAIBR1-04', rawNameInBA: 'Pekerjaan Overhaul & Impeller Duplex Terpasang 100%', canonicalWbsCode: 'MC-100-ALL', measuredVolume: 1, unit: 'ls', stationing: 'Pompa P-1, P-2, P-3', complianceStatus: 'SESUAI' }
        ],
        attachments: [
          {
            id: 'ATT-BR1-03',
            title: 'Foto Pompa Unit 2 Beroperasi Penuh Siap Serah Terima',
            type: 'FOTO_LAPANGAN',
            url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-04-12 12:30',
            caption: 'Pekerjaan selesai 100% dan telah memasuki masa pemeliharaan (warranty)',
            stationingOrLocation: 'Rumah Pompa Buaran 1'
          }
        ]
      }
    ]
  }
];

export const INITIAL_DISCREPANCIES = [
  {
    id: 'DISC-01',
    projectId: 'PRJ-BR2-001',
    projectName: 'Optimalisasi Pulsator Clarifier & Jalur Pipa Distribusi Utama IPA Buaran 2',
    ipa: 'IPA Buaran 2' as IPALocation,
    type: 'UNSUBSTANTIATED_JUSTEK' as const,
    severity: 'HIGH' as const,
    justekItemName: 'Galian Tanah Manual Area Utilitas Khusus Kedalaman > 2m (120 m3, Rp 42.000.000)',
    baItemName: undefined,
    confidenceMatch: 0,
    suggestedAction: 'Perubahan volume tidak memiliki Berita Acara pendukung (MC-0 atau Peninjauan Lapangan). Terbitkan BA Peninjauan Lapangan atau batalkan klaim biaya.',
    resolved: false
  },
  {
    id: 'DISC-02',
    projectId: 'PRJ-BR2-001',
    projectName: 'Optimalisasi Pulsator Clarifier & Jalur Pipa Distribusi Utama IPA Buaran 2',
    ipa: 'IPA Buaran 2' as IPALocation,
    type: 'NAMING_VARIATION' as const,
    severity: 'MEDIUM' as const,
    justekItemName: 'Pipa HDPE Dia 600mm PN10 SDR17 Lengkap Sambungan Stub End',
    baItemName: 'Pipa HDPE OD 600 mm PN 10 SDR 17',
    confidenceMatch: 84,
    suggestedAction: 'Penulisan sedikit berbeda antar dokumen meski merujuk ke item WBS yang sama (PIP-01). Klik untuk rekonsiliasi otomatis.',
    resolved: false
  },
  {
    id: 'DISC-03',
    projectId: 'PRJ-PJ2-004',
    projectName: 'Modernisasi Otomasi Dosing Kimia Koagulan & SCADA PLC IPA Pejompongan 2',
    ipa: 'IPA Pejompongan 2' as IPALocation,
    type: 'NAMING_VARIATION' as const,
    severity: 'MEDIUM' as const,
    justekItemName: 'Dosing Pump Smart Digital Inverter PAC Kapasitas 250 L/h Auto Control',
    baItemName: 'Pompa Injeksi PAC Smart Inverter Otomatis 250 Lph',
    confidenceMatch: 81,
    suggestedAction: 'Nama di Justifikasi menggunakan istilah bahasa Inggris (Dosing Pump), di BA memakai bahasa Indonesia (Pompa Injeksi). Klik untuk menautkan secara resmi.',
    resolved: false
  }
];
