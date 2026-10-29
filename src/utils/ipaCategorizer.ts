import { IPALocation } from '../types';

export interface IPALocationMeta {
  id: IPALocation;
  name: string;
  code: string;
  badgeColor: string;
  description: string;
  capacity: string;
  distributionZone: string;
  facilityType: string;
  waterSource: string;
}

export const ALL_IPA_LOCATIONS: IPALocationMeta[] = [
  {
    id: 'IPA Buaran 1',
    name: 'IPA Buaran 1',
    code: 'BR-1',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
    description: 'Instalasi Pengolahan Air Buaran Tahap 1 - Wilayah Jakarta Timur',
    capacity: '3.000 L/detik',
    distributionZone: 'Jakarta Timur & Sebagian Jakarta Utara',
    facilityType: 'Pulsator Clarifier, Filtrasi Pasir Cepat, Reservoir',
    waterSource: 'Saluran Tarum Barat (Kalimalang)',
  },
  {
    id: 'IPA Buaran 2',
    name: 'IPA Buaran 2',
    code: 'BR-2',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300',
    description: 'Instalasi Pengolahan Air Buaran Tahap 2 - Sistem Pulsator Clarifier',
    capacity: '3.000 L/detik',
    distributionZone: 'Jakarta Timur & Sebagian Jakarta Pusat',
    facilityType: 'Pulsator Clarifier, Otomasi Koagulasi & Dosing',
    waterSource: 'Saluran Tarum Barat (Kalimalang)',
  },
  {
    id: 'IPA Buaran 3',
    name: 'IPA Buaran 3',
    code: 'BR-3',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300',
    description: 'Instalasi Pengolahan Air Buaran Tahap 3 - Sistem SCADA Terdistribusi',
    capacity: '3.000 L/detik',
    distributionZone: 'Penguatan Pasokan DKI Timur & Selatan',
    facilityType: 'SCADA Terdistribusi, Pipa Transmisi Utama',
    waterSource: 'Saluran Tarum Barat (Kalimalang)',
  },
  {
    id: 'IPA Pejompongan 1',
    name: 'IPA Pejompongan 1',
    code: 'PJ-1',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
    description: 'Instalasi Pengolahan Air Pejompongan 1 - Jakarta Pusat & Selatan',
    capacity: '2.000 L/detik',
    distributionZone: 'Jakarta Pusat, Jakarta Selatan & Kawasan Protokol',
    facilityType: 'Sedimentasi Konvensional, Filter Gravitasi Cepat',
    waterSource: 'Sungai Ciliwung & Waduk Jatiluhur',
  },
  {
    id: 'IPA Pejompongan 2',
    name: 'IPA Pejompongan 2',
    code: 'PJ-2',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
    description: 'Instalasi Pengolahan Air Pejompongan 2 - Pusat Distribusi Pompa & Dosing',
    capacity: '3.600 L/detik',
    distributionZone: 'Jakarta Pusat, Barat, & Kawasan Bisnis Utama',
    facilityType: 'Superpulsator, Pompa Distribusi Tekanan Tinggi',
    waterSource: 'Waduk Jatiluhur via Saluran Terbuka',
  },
  {
    id: 'IPA Pulogadung',
    name: 'IPA Pulogadung',
    code: 'PGD',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    description: 'Instalasi Pengolahan Air Pulogadung - Filtrasi Otomatis & Kapasitas Tinggi',
    capacity: '4.000 L/detik',
    distributionZone: 'Kawasan Industri Pulogadung & Jakarta Utara/Timur',
    facilityType: 'Filtrasi Otomatis, Desinfeksi Klorinasi Lanjut',
    waterSource: 'Saluran Tarum Barat & Saluran Penghubung',
  },
];

/**
 * Automatically categorizes an uploaded program/project into one of the 6 IPAs:
 * - IPA Buaran 1
 * - IPA Buaran 2
 * - IPA Buaran 3
 * - IPA Pejompongan 1
 * - IPA Pejompongan 2
 * - IPA Pulogadung
 */
export function autoCategorizeIpa(
  programName: string,
  extraContext?: string
): IPALocation {
  const combined = `${programName || ''} ${extraContext || ''}`.toLowerCase();

  // 1. Explicit numbering checks
  if (
    combined.includes('buaran 3') ||
    combined.includes('buaran iii') ||
    combined.includes('br3') ||
    combined.includes('br-3') ||
    combined.includes('br 3')
  ) {
    return 'IPA Buaran 3';
  }

  if (
    combined.includes('buaran 2') ||
    combined.includes('buaran ii') ||
    combined.includes('br2') ||
    combined.includes('br-2') ||
    combined.includes('br 2')
  ) {
    return 'IPA Buaran 2';
  }

  if (
    combined.includes('buaran 1') ||
    combined.includes('buaran i') ||
    combined.includes('br1') ||
    combined.includes('br-1') ||
    combined.includes('br 1')
  ) {
    return 'IPA Buaran 1';
  }

  if (
    combined.includes('pejompongan 2') ||
    combined.includes('pejompongan ii') ||
    combined.includes('pj2') ||
    combined.includes('pj-2') ||
    combined.includes('pj 2')
  ) {
    return 'IPA Pejompongan 2';
  }

  if (
    combined.includes('pejompongan 1') ||
    combined.includes('pejompongan i') ||
    combined.includes('pj1') ||
    combined.includes('pj-1') ||
    combined.includes('pj 1')
  ) {
    return 'IPA Pejompongan 1';
  }

  if (
    combined.includes('pulogadung') ||
    combined.includes('pulo gadung') ||
    combined.includes('pgd')
  ) {
    return 'IPA Pulogadung';
  }

  // 2. Broad names
  if (combined.includes('pejompongan')) {
    return 'IPA Pejompongan 1';
  }

  if (combined.includes('buaran')) {
    return 'IPA Buaran 1';
  }

  // 3. Domain / Asset engineering cues
  if (combined.includes('pulsator') || combined.includes('flange') || combined.includes('clarifier')) {
    return 'IPA Buaran 2';
  }

  if (combined.includes('scada') || combined.includes('telemetri') || combined.includes('substation')) {
    return 'IPA Buaran 3';
  }

  if (combined.includes('pompa backwash') || combined.includes('katup header') || combined.includes('dosing')) {
    return 'IPA Pejompongan 2';
  }

  if (combined.includes('sedimentasi') || combined.includes('ciliwung') || combined.includes('filter gravitas')) {
    return 'IPA Pejompongan 1';
  }

  if (combined.includes('multimedia') || combined.includes('intake')) {
    return 'IPA Pulogadung';
  }

  // Deterministic default based on program title hash to distribute fairly if ambiguous
  const hash = (programName || 'default').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const options: IPALocation[] = [
    'IPA Buaran 1',
    'IPA Buaran 2',
    'IPA Buaran 3',
    'IPA Pejompongan 1',
    'IPA Pejompongan 2',
    'IPA Pulogadung',
  ];
  return options[hash % options.length];
}
