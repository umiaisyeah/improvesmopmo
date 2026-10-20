import { SystemConfig } from '../types';

export const DEFAULT_CONFIG: SystemConfig = {
  financial_threshold_percentage: 0.10, // 10%
  quantity_tolerance: 0.001,
  money_tolerance: 100, // Toleransi pembulatan Rp 100
  pmo_organization: 'PMO System - Verification Division',
  auto_flag_discrepancy: true,
  active_program_domain: 'UNIVERSAL_MULTI',
  auto_detect_domain: true,
  strict_domain_boundaries: true,
};

export const VERIFICATION_STATUS_META = {
  VERIFIED: {
    label: 'VERIFIED',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badge: 'bg-emerald-600 text-white',
    description: 'Informasi ditemukan dalam sumber pembanding dan nilainya konsisten.',
  },
  MISMATCH: {
    label: 'MISMATCH',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    badge: 'bg-rose-600 text-white',
    description: 'Informasi ditemukan tetapi nilainya/isinya berbeda dengan sumber kebenaran.',
  },
  'NOT FOUND': {
    label: 'NOT FOUND',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    badge: 'bg-amber-600 text-white',
    description: 'Klaim ada pada JusTek/JusFin tetapi tidak ditemukan pada BAPL/dokumen sumber.',
  },
  'NEED SUPPORT': {
    label: 'NEED SUPPORT',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'bg-blue-600 text-white',
    description: 'Informasi mungkin benar tetapi membutuhkan dokumen pendukung lain (MCO, test report, drawing, PO).',
  },
  REVIEW: {
    label: 'REVIEW',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    badge: 'bg-purple-600 text-white',
    description: 'Informasi membutuhkan pemeriksaan manusia karena sistem tidak dapat menentukan hasil secara aman.',
  },
  VISUAL_REVIEW: {
    label: 'VISUAL REVIEW',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badge: 'bg-indigo-600 text-white',
    description: 'Ukuran/kondisi hanya terlihat pada gambar/drawing/as-built markup, bukan text OCR biasa.',
  },
} as const;
