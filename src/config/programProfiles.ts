import { ProgramDomain, ProgramProfileConfig } from '../types';

export const PROGRAM_PROFILES: Record<ProgramDomain, ProgramProfileConfig> = {
  ELECTRICAL: {
    id: 'profile-electrical',
    domain: 'ELECTRICAL',
    name: 'Sistem Elektrikal, Grounding & Proteksi Petir',
    icon: 'Zap',
    badgeColor: 'amber',
    description: 'Verifikasi instalasi penangkal petir, grounding/pembumian, kabel daya, panel TM/TR, transformator, dan proteksi kelistrikan.',
    positiveKeywords: [
      'tiang penangkal', 'tiang galvanis', 'terminal petir', 'air terminal', 'ese', 'early streamer',
      'kabel coaxial', 'down conductor', 'copper', 'tembaga', 'bc 50', 'nyy', 'nym',
      'grounding', 'pembumian', 'earth tester', 'ohm', 'tahanan tanah', 'rod grounding',
      'lightning counter', 'penangkal petir', 'head terminal', 'surat garansi', 'radius proteksi',
      'panel distribusi', 'mcb', 'mccb', 'trafo', 'klem isolasi', 'substation', 'switchyard'
    ],
    negativeBoundaries: {
      'tiang': ['ohm', 'tahanan', 'earth tester', 'gasket', 'valve', 'pompa', 'ductile iron', 'slump beton', 'tekanan bar'],
      'kabel': ['ohm', 'tahanan', 'earth tester', 'tiang bulat 5m', 'tiang 15m', 'gate valve', 'flange'],
      'terminal': ['ohm', 'tahanan', 'earth tester', 'gasket', 'valve', 'pipa hdpe'],
      'jasa_instalasi': ['gasket', 'valve dn300', 'pipa hdpe', 'beton k300']
    },
    mandatoryEvidenceTypes: [
      'Berita Acara Pemeriksaan Fisik (BAPL)',
      'Laporan Pengujian Tahanan Pembumian (Earth Tester / Nilai Ohm)',
      'Surat Jaminan Garansi Pabrikan (Air Terminal & ESE)',
      'As-Built Drawing Jalur Down Conductor'
    ],
    unitMatchers: ['ohm', 'Ω', 'meter', 'm', 'set', 'titik', 'unit', 'roll', 'btg', 'kva', 'ampere', 'a', 'v', 'volt'],
    toleranceRules: {
      maxRabDeltaPct: 0.10,
      allowEquivalentBrands: true,
      strictMaterialSpec: true,
    }
  },

  PIPING_WATER: {
    id: 'profile-piping',
    domain: 'PIPING_WATER',
    name: 'Sistem Pemipaan, Katup (Valve), Pompa & WTP',
    icon: 'Droplets',
    badgeColor: 'blue',
    description: 'Verifikasi pengadaan pipa transmisi/distribusi, gate/butterfly valve, fitting, flange, pompa air, dan instalasi unit pengolahan air.',
    positiveKeywords: [
      'gate valve', 'butterfly valve', 'check valve', 'ball valve', 'air release valve',
      'dn 300', 'dn 200', 'dn 150', 'dn 100', 'dn 400', 'dn 500', 'dn 600',
      'pn 10', 'pn 16', 'pn 25', 'din-f4', 'din-f5', 'ductile iron', 'ggg50', 'ggg-50', 'cast iron',
      'gasket epdm', 'full face', 'bolt & nut', 'ss 304', 'ss 316', 'baut m20',
      'pipa hdpe', 'pipa gip', 'pipa ppr', 'pipa ductile', 'flange adaptor', 'gibault joint',
      'pompa sentrifugal', 'submersible', 'pompa booster', 'flow meter', 'water meter', 'wtp', 'ipa'
    ],
    negativeBoundaries: {
      'valve': ['kabel coaxial', 'penangkal petir', 'terminal ese', 'tahanan ohm', 'beton bertulang', 'cat dinding'],
      'gasket': ['kabel', 'tiang', 'ohm', 'terminal petir', 'pompa sentrifugal'],
      'baut_nut': ['kabel', 'tiang', 'ohm', 'terminal petir', 'earth tester'],
      'pipa': ['kabel coaxial', 'penangkal petir', 'terminal ese', 'tahanan ohm'],
      'pompa': ['tiang petir', 'tahanan ohm pembumian', 'gasket epdm 5mm']
    },
    mandatoryEvidenceTypes: [
      'Berita Acara Opname Fisik & Dimensi Lapangan',
      'Mill Test Certificate / Sertifikat Material Pabrik (Ductile Iron/SS)',
      'Laporan Uji Tekanan Hidrostatis (Hydrostatic Pressure Test)',
      'Dokumentasi Visual / Foto Fisik Terpasang'
    ],
    unitMatchers: ['dn', 'pn', 'bar', 'psi', 'mm', 'inch', 'meter', 'm', 'unit', 'set', 'pcs', 'buah', 'm3/jam', 'lps', 'kw'],
    toleranceRules: {
      maxRabDeltaPct: 0.10,
      allowEquivalentBrands: true,
      strictMaterialSpec: true,
    }
  },

  CIVIL_STRUCTURE: {
    id: 'profile-civil',
    domain: 'CIVIL_STRUCTURE',
    name: 'Pekerjaan Sipil, Struktur Beton & Gedung',
    icon: 'Building2',
    badgeColor: 'emerald',
    description: 'Verifikasi pekerjaan struktur, pondasi, pembesian, cor beton, arsitektur, dinding, atap, dan infrastruktur sipil.',
    positiveKeywords: [
      'pondasi', 'foot plate', 'bored pile', 'tiang pancang', 'beton k-250', 'beton k-300', 'beton k-350', 'fc 25', 'fc 30',
      'besi beton', 'besi ulir', 'deformed bar', 'wiremesh', 'bekisting', 'pembesian',
      'balok', 'kolom', 'plat lantai', 'sloof', 'galian tanah', 'urugan', 'pemadatan',
      'pasangan bata', 'plesteran', 'acian', 'keramik', 'granit', 'cat dinding', 'weathercoat',
      'rangka atap baja ringan', 'baja wf', 'h-beam', 'plat buhul', 'spandek', 'drainase', 'saluran u-ditch'
    ],
    negativeBoundaries: {
      'beton_struktur': ['kabel coaxial', 'gate valve pn16', 'tahanan ohm', 'air terminal ese', 'pompa booster'],
      'pembesian': ['kabel nyy', 'gasket epdm', 'valve', 'ohm'],
      'galian_pondasi': ['tahanan pembumian', 'kabel data', 'flange adaptor'],
      'baja_profil': ['kabel coaxial', 'gasket epdm', 'uji kebocoran pipa']
    },
    mandatoryEvidenceTypes: [
      'Berita Acara Pengukuran Volume Opname Lapangan (Joint Survey)',
      'Laporan Hasil Uji Kuat Tekan Beton (Uji Lab Silinder/Kubus 28 Hari)',
      'Sertifikat Uji Tarik Baja Tulangan / Mill Certificate',
      'Shop Drawing & As-Built Drawing Terverifikasi Konsultan Pengawas'
    ],
    unitMatchers: ['m3', 'm2', 'm1', 'meter', 'kg', 'ton', 'btg', 'lembar', 'titik', 'ls', 'lot'],
    toleranceRules: {
      maxRabDeltaPct: 0.10,
      allowEquivalentBrands: true,
      strictMaterialSpec: true,
    }
  },

  MECHANICAL_HVAC: {
    id: 'profile-mechanical',
    domain: 'MECHANICAL_HVAC',
    name: 'Mekanikal, Tata Udara (HVAC) & Utilitas Pabrik',
    icon: 'Cog',
    badgeColor: 'cyan',
    description: 'Verifikasi sistem pendingin udara (chiller/VRF/split), ducting, ventilasi, genset, kompresor, dan utilitas mekanis.',
    positiveKeywords: [
      'chiller', 'ahu', 'air handling unit', 'fcu', 'fan coil unit', 'vrf', 'ac split duct',
      'ducting bjls', 'diffuser', 'grille', 'volume damper', 'fire damper', 'insulasi armaflex',
      'pipa tembaga refrigerant', 'r410a', 'r32', 'exhaust fan', 'fresh air fan', 'blower',
      'genset', 'diesel generator', 'tangki solar', 'cooling tower', 'boiler', 'kompresor udara'
    ],
    negativeBoundaries: {
      'chiller_ac': ['tiang petir 15m', 'tahanan ohm', 'pondasi u-ditch', 'gate valve dn300'],
      'ducting': ['kabel coaxial', 'gasket epdm 5mm', 'besi beton ulir'],
      'genset': ['air terminal ese', 'pipa ppr', 'cat dinding exterior']
    },
    mandatoryEvidenceTypes: [
      'Berita Acara Commissioning & Testing (TAB - Testing Adjusting Balancing)',
      'Sertifikat Kapasitas Pendingin / Efisiensi COP Pabrikan',
      'Laporan Pengujian Sound Level & Vibrasi',
      'Checklist Pemeriksaan Fisik & Aksesoris'
    ],
    unitMatchers: ['tr', 'btu/h', 'cfm', 'm3/h', 'kw', 'kva', 'unit', 'set', 'm2', 'm1', 'kg', 'lot'],
    toleranceRules: {
      maxRabDeltaPct: 0.10,
      allowEquivalentBrands: true,
      strictMaterialSpec: true,
    }
  },

  INSTRUMENTATION_SCADA: {
    id: 'profile-scada',
    domain: 'INSTRUMENTATION_SCADA',
    name: 'Instrumentasi, Otomasi, SCADA & Jaringan IT',
    icon: 'Radio',
    badgeColor: 'indigo',
    description: 'Verifikasi sistem kontrol PLC/RTU, telemetri SCADA, sensor/transmitter, fiber optik, dan perangkat jaringan komunikasi.',
    positiveKeywords: [
      'plc', 'programmable logic controller', 'rtu', 'remote terminal unit', 'scada', 'hmi', 'human machine interface',
      'transmitter', 'pressure transmitter', 'ultrasonic level', 'radar level', 'flowmeter elektromagnetik',
      'kabel fiber optik', 'fo 24 core', 'otdr test', 'patch cord', 'otb', 'switch manageable', 'router',
      'modbus', 'profibus', 'ethernet/ip', 'dnp3', 'ups online', 'panel marshalling', 'enclosure ip65', 'cctv ip', 'nvr'
    ],
    negativeBoundaries: {
      'plc_scada': ['tiang bulat galvanis', 'cor beton k300', 'gate valve dn300 pn16'],
      'sensor_transmitter': ['kabel petir coaxial', 'baut m20', 'spandek atap'],
      'fiber_optik': ['gasket epdm', 'pompa sentrifugal', 'plesteran dinding']
    },
    mandatoryEvidenceTypes: [
      'Factory Acceptance Test (FAT) & Site Acceptance Test (SAT)',
      'Laporan Kalibrasi Sensor / Sertifikat Kalibrasi Instrument',
      'Laporan Pengujian Redaman Fiber Optik (OTDR Measurement)',
      'Dokumen Log Integrasi Signal I/O List & SCADA Screen Mapping'
    ],
    unitMatchers: ['point', 'channel', 'unit', 'set', 'node', 'meter', 'm', 'core', 'lot', 'ls', 'port', 'db', 'ma'],
    toleranceRules: {
      maxRabDeltaPct: 0.10,
      allowEquivalentBrands: true,
      strictMaterialSpec: true,
    }
  },

  GENERAL_PROCUREMENT: {
    id: 'profile-general',
    domain: 'GENERAL_PROCUREMENT',
    name: 'Pengadaan Barang, Peralatan & Jasa Umum',
    icon: 'Package',
    badgeColor: 'purple',
    description: 'Verifikasi pengadaan komoditas barang umum, suku cadang, perangkat IT, perabot, dan jasa layanan teknis.',
    positiveKeywords: [
      'pengadaan', 'perangkat', 'peralatan', 'unit', 'komputer', 'laptop', 'server', 'printer',
      'furniture', 'meja', 'kursi', 'suku cadang', 'spare part', 'consumables', 'alat ukur',
      'lisensi software', 'jasa pemeliharaan', 'jasa instalasi', 'jasa pelatihan', 'seragam kerja'
    ],
    negativeBoundaries: {},
    mandatoryEvidenceTypes: [
      'Berita Acara Serah Terima Barang (BAST) / BAPL Fisik',
      'Surat Jalan / Packing List dari Supplier / Distributor Resmi',
      'Kartu Garansi Resmi & Kelengkapan User Manual',
      'Pemeriksaan Kesesuaian Tipe, Seri & Jumlah Barang'
    ],
    unitMatchers: ['unit', 'set', 'buah', 'pcs', 'lot', 'ls', 'paket', 'dus', 'kotak', 'roll', 'bulan', 'orang'],
    toleranceRules: {
      maxRabDeltaPct: 0.10,
      allowEquivalentBrands: true,
      strictMaterialSpec: false,
    }
  },

  UNIVERSAL_MULTI: {
    id: 'profile-universal',
    domain: 'UNIVERSAL_MULTI',
    name: 'Multi-Disiplin Fleksibel & Cerdas (Auto-Adaptive)',
    icon: 'Sparkles',
    badgeColor: 'teal',
    description: 'Engine universal adaptif yang menganalisis spektrum multi-disiplin secara otomatis dan menerapkan batasan domain dinamis pada setiap item proyek.',
    positiveKeywords: [],
    negativeBoundaries: {},
    mandatoryEvidenceTypes: [
      'Berita Acara Pemeriksaan Lapangan (BAPL Fisik)',
      'Dokumen Justifikasi Teknis (JusTek)',
      'RAB Baseline & RAB Revisi (JusFin)',
      'Dokumen Pendukung Teknis Terkait'
    ],
    unitMatchers: ['unit', 'set', 'buah', 'pcs', 'm', 'meter', 'm2', 'm3', 'kg', 'ton', 'lot', 'ls', 'btg', 'titik'],
    toleranceRules: {
      maxRabDeltaPct: 0.10,
      allowEquivalentBrands: true,
      strictMaterialSpec: true,
    }
  }
};
