import { Project, IPALocation, DiscrepancyReport } from '../types';

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
    supervisingConsultant: 'PT Sucofindo (Persero)',
    startDate: '2026-01-15',
    endDate: '2026-08-15',
    revisedEndDate: '2026-09-10',
    contractValue: 5850000000,
    realizationValue: 3217500000,
    realizationPercentage: 55.0,
    justificationDelta: 412500000,
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
          fieldVolume: 405,
          unitPrice: 3200000,
          linkedBaId: 'BA-BR2-01',
          linkedBaItemName: 'Pipa HDPE OD 600 mm PN 10 SDR 17',
          evidenceStatus: 'NAME_MISMATCH',
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
          fieldVolume: 38.5,
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
          fieldVolume: 120,
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
          { role: 'Team Leader Pengawas', name: 'Ir. Ahmad Zarkasih', institution: 'PT Sucofindo (Persero)', isSigned: true, signedAt: '2026-02-04 16:15', signatureHash: 'SCF-SIG-11029' },
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
          { role: 'Konsultan Pengawas', name: 'Ir. Ahmad Zarkasih', institution: 'PT Sucofindo (Persero)', isSigned: true, signedAt: '2026-03-12 15:45', signatureHash: 'SCF-SIG-22319' },
          { role: 'Pelaksana Lapangan', name: 'Dedi Kurniawan, ST', institution: 'PT Tirta Sarana Konstruksi', isSigned: true, signedAt: '2026-03-12 16:00', signatureHash: 'TSK-SIG-88122' }
        ],
        items: [
          { id: 'BAI-03', rawNameInBA: 'Beton K300 Selubung Pipa Pelindung Kabel PLN', canonicalWbsCode: 'CIV-08', measuredVolume: 38.5, unit: 'm3', stationing: 'STA 0+180 s/d 0+218.5', complianceStatus: 'SESUAI', testResultNotes: 'Volume dihitung berdasarkan dimensi' }
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
    supervisingConsultant: 'PT Sucofindo (Persero)',
    startDate: '2026-02-01',
    endDate: '2026-09-30',
    contractValue: 4720000000,
    realizationValue: 1888000000,
    realizationPercentage: 40.0,
    justificationDelta: 185000000,
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
        { step: 'Pengajuan Draf', actor: 'Suryo Pratama, ST', role: 'Project Manager', date: '2026-02-28', status: 'APPROVED', comments: 'Pengajuan tambahan perkuatan struktur clarifier' },
        { step: 'Verifikasi Site PMO', actor: 'Fauzi Rahmat, ST', role: 'Site Engineer', date: '2026-03-02', status: 'APPROVED', comments: 'Pengujian hammer test valid' }
      ],
      items: [
        {
          id: 'ITM-PJ1-01',
          wbsCode: 'STR-02',
          itemName: 'Injection Epoxy Grout Retak Dinding Beton Kedalaman > 50mm',
          unit: 'titik',
          dedVolume: 50,
          fieldVolume: 95,
          unitPrice: 1200000,
          linkedBaId: 'BA-PJ1-01',
          linkedBaItemName: 'Titik Injeksi Retak Epoxy Dinding Clarifier',
          evidenceStatus: 'VERIFIED',
          similarityScore: 89,
          justificationReason: 'Volume bertambah signifikan akibat temuan retak tersembunyi.'
        },
        {
          id: 'ITM-PJ1-02',
          wbsCode: 'LIN-05',
          itemName: 'Coating Polyurea Food Grade Anti Bakteri Dinding Basah',
          unit: 'm2',
          dedVolume: 350,
          fieldVolume: 420,
          unitPrice: 450000,
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
        notes: 'Ditemukan retak struktural di balik lapisan plesteran lama.',
        status: 'TERBIT',
        weatherCondition: 'Cerah',
        signatories: [
          { role: 'Site Engineer', name: 'Fauzi Rahmat, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-02-18 16:30', signatureHash: 'ABJ-SIG-45129' },
          { role: 'Supervisi Pengawas', name: 'Ir. Tri Maryanto', institution: 'PT Sucofindo (Persero)', isSigned: true, signedAt: '2026-02-18 16:45', signatureHash: 'SCF-SIG-77218' }
        ],
        items: [
          { id: 'BAIPJ-01', rawNameInBA: 'Titik Injeksi Retak Epoxy Dinding Clarifier', canonicalWbsCode: 'STR-02', measuredVolume: 95, unit: 'titik', stationing: 'Clarifier 2', complianceStatus: 'DEVIASI_DISETUJUI' }
        ],
        attachments: []
      }
    ]
  },
  {
    id: 'PRJ-PLG-003',
    code: 'CYC-PLG-2026-002',
    name: 'Penggantian Media Filter Silika & Anthracite Serta Otomasi Valve Backwash IPA Pulogadung',
    ipa: 'IPA Pulogadung',
    contractorName: 'PT Cipta Aneka Air Minum',
    supervisingConsultant: 'PT Sucofindo (Persero)',
    startDate: '2026-01-10',
    endDate: '2026-06-30',
    contractValue: 7150000000,
    realizationValue: 5005000000,
    realizationPercentage: 70.0,
    justificationDelta: -85000000,
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
        technicalSolutionRecommended: 'Mempertahankan 40% nozzle yang masih presisi dan mengalihkan anggaran ke peningkatan kualitas anthracite grade premium.',
        qualityImpact: 'Turbiditas air filter turun dari 0.8 NTU menjadi 0.25 NTU.'
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
        { step: 'Pengesahan', actor: 'Dr. Ir. Bagus Wicaksono, MM', role: 'Kadep', date: '2026-02-15', status: 'APPROVED', comments: 'Disetujui' }
      ],
      items: [
        {
          id: 'ITM-PLG-01',
          wbsCode: 'FLT-01',
          itemName: 'Media Anthracite Premium Filter Karbon Aktif Bersertifikat',
          unit: 'ton',
          dedVolume: 120,
          fieldVolume: 150,
          unitPrice: 22000000,
          linkedBaId: 'BA-PLG-01',
          linkedBaItemName: 'Anthracite Karbon Filter Premium Grade A',
          evidenceStatus: 'VERIFIED',
          similarityScore: 88,
          justificationReason: 'Meningkatkan ketebalan bed filter.'
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
        notes: 'Layak beroperasi.',
        status: 'TERBIT',
        weatherCondition: 'Cerah',
        signatories: [
          { role: 'Site Engineer', name: 'Rudi Hartono, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-01-18 15:00', signatureHash: 'ABJ-SIG-19284' },
          { role: 'Pengawas Teknis', name: 'Ir. Wahyu Hidayat', institution: 'PT Sucofindo (Persero)', isSigned: true, signedAt: '2026-01-18 15:30', signatureHash: 'SCF-SIG-98442' }
        ],
        items: [],
        attachments: []
      }
    ]
  },
  {
    id: 'PRJ-PJ2-004',
    code: 'CYC-PJ2-2026-003',
    name: 'Modernisasi Otomasi Dosing Kimia Koagulan & SCADA PLC IPA Pejompongan 2',
    ipa: 'IPA Pejompongan 2',
    contractorName: 'PT Elmecon Otomasi Mandiri',
    supervisingConsultant: 'PT Sucofindo (Persero)',
    startDate: '2026-02-15',
    endDate: '2026-07-31',
    contractValue: 3950000000,
    realizationValue: 1580000000,
    realizationPercentage: 40.0,
    justificationDelta: 495000000, // Updated to 495 Juta (12.53%) for STOP_WORK trigger
    progressPhysicalPlanned: 42.0,
    progressPhysicalActual: 40.0,
    progressDeviation: -2.0,
    status: 'STOP_WORK', // Automatically derived STOP_WORK
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
        additionalWorksValue: 560000000,
        reducedWorksValue: 65000000,
        netVarianceValue: 495000000,
        revisedContractValue: 4445000000,
        variancePercentage: 12.53, // > 10% threshold -> Triggers STOP_WORK
        budgetSource: 'CAPEX PMO CYCLICAL 2026'
      },
      currentApprovalStage: 4,
      approvalHistory: [
        { step: 'Draf Kontraktor', actor: 'Denny Susanto, ST', role: 'Project Manager', date: '2026-03-18', status: 'APPROVED', comments: 'Pengajuan upgrade smart dosing pump' },
        { step: 'Verifikasi Site PMO', actor: 'Fauzi Rahmat, ST', role: 'Site PMO', date: '2026-03-20', status: 'APPROVED', comments: 'BA Peninjauan Lapangan dan data historis kekeruhan terbukti' }
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
          fieldVolume: 2,
          unitPrice: 62500000,
          linkedBaId: 'BA-PJ2-01',
          linkedBaItemName: 'Sensor Streaming Current Detector Monitoring Koagulan',
          evidenceStatus: 'VERIFIED',
          similarityScore: 79,
          justificationReason: 'Diperlukan untuk otomatisasi pengaturan flow rate pompa koagulan.'
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
        notes: 'Pemeriksaan bersama mencatat lonjakan turbidity.',
        status: 'TERBIT',
        weatherCondition: 'Hujan Deras',
        signatories: [
          { role: 'Site Engineer PMO', name: 'Fauzi Rahmat, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: '2026-03-15 14:00', signatureHash: 'ABJ-SIG-77112' },
          { role: 'Konsultan Pengawas', name: 'Ir. Handoyo Broto', institution: 'PT Sucofindo (Persero)', isSigned: true, signedAt: '2026-03-15 14:30', signatureHash: 'SCF-SIG-44109' }
        ],
        items: [],
        attachments: []
      }
    ]
  }
];

export const INITIAL_DISCREPANCIES: DiscrepancyReport[] = [
  {
    id: 'DISC-01',
    projectId: 'PRJ-BR2-001',
    projectName: 'Optimalisasi Pulsator Clarifier & Jalur Pipa Distribusi Utama IPA Buaran 2',
    ipa: 'IPA Buaran 2',
    type: 'NAMING_VARIATION',
    severity: 'MEDIUM',
    justekItemName: 'Pipa HDPE Dia 600mm PN10 SDR17 Lengkap Sambungan Stub End',
    baItemName: 'Pipa HDPE OD 600 mm PN 10 SDR 17',
    confidenceMatch: 84,
    suggestedAction: 'Tautkan item JusTek ke Berita Acara BA-BR2-01 dengan keselarasan nama baku WBS PIP-01.',
    resolved: false
  },
  {
    id: 'DISC-02',
    projectId: 'PRJ-BR2-001',
    projectName: 'Optimalisasi Pulsator Clarifier & Jalur Pipa Distribusi Utama IPA Buaran 2',
    ipa: 'IPA Buaran 2',
    type: 'UNSUBSTANTIATED_JUSTEK',
    severity: 'HIGH',
    justekItemName: 'Galian Tanah Manual Area Utilitas Khusus Kedalaman > 2m',
    suggestedAction: 'Item galian tidak tercantum pada Berita Acara MC-0. Wajib dibuat Berita Acara Peninjauan Lapangan tambahan atau revisi.',
    resolved: false
  },
  {
    id: 'DISC-03',
    projectId: 'PRJ-PJ1-002',
    projectName: 'Rehabilitasi Clarifier Heritage & Penggantian Pipa Header Sedimentasi',
    ipa: 'IPA Pejompongan 1',
    type: 'NAMING_VARIATION',
    severity: 'LOW',
    justekItemName: 'Coating Polyurea Food Grade Anti Bakteri Dinding Basah',
    baItemName: 'Coating Polyurea Tahan Kimia Klorin Dinding Air',
    confidenceMatch: 76,
    suggestedAction: 'Standarisasi penulisan nomenklatur bahan pelapis dinding kolam air olahan.',
    resolved: false
  }
];
