import { ProjectIdentity } from '../types';

export type DeadlineUrgency =
  | 'OVERDUE'       // Terlewat (< 0 hari)
  | 'CRITICAL'      // Mendekati deadline (0 - 3 hari)
  | 'WARNING'       // Perhatian (4 - 7 hari)
  | 'SAFE'          // Aman (> 7 hari)
  | 'UNKNOWN';

export interface DeadlineInfo {
  verificationDateStr: string;     // Tanggal pemeriksaan BAPL / verifikasi
  verificationDate: Date;
  deadlineDateStr: string;         // Tanggal batas akhir penyelesaian SLA / Justifikasi
  deadlineDate: Date;
  daysRemaining: number;           // Sisa hari menuju deadline (bisa negatif jika terlewat)
  hoursRemaining: number;          // Sisa jam
  isOverdue: boolean;              // true jika lewat deadline
  isNearDeadline: boolean;         // true jika 0 <= daysRemaining <= 3
  urgency: DeadlineUrgency;
  badgeLabel: string;              // e.g., "⏳ Sisa 2 Hari (H-2)", "🚨 Terlewat 3 Hari"
  shortBadge: string;              // e.g., "H-2", "Lewat 3h", "H-10"
  badgeClasses: string;            // Tailwind classes untuk lencana visual
  cardBorderClasses: string;       // Tailwind classes untuk border kartu
  slaDays: number;                 // Total durasi SLA (default 14 hari)
  progressPercentage: number;      // 0 - 100% (persentase waktu SLA yang telah terpakai)
  recommendation: string;          // Rekomendasi audit / tindak lanjut operasional
  actionUrgency: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Parsing tanggal fleksibel untuk format ISO (2026-10-25), Indonesia (14 Agustus 2026),
 * atau slash (14/08/2026).
 */
export function parseFlexibleDate(dateStr?: string): Date | null {
  if (!dateStr || dateStr === '-' || dateStr === 'BELUM ADA DOKUMEN') {
    return null;
  }

  // Cek format nama bulan Indonesia atau angka
  const bulanMap: Record<string, number> = {
    januari: 0, jan: 0, '1': 0, '01': 0,
    februari: 1, feb: 1, '2': 1, '02': 1,
    maret: 2, mar: 2, '3': 2, '03': 2,
    april: 3, apr: 3, '4': 3, '04': 3,
    mei: 4, may: 4, '5': 4, '05': 4,
    juni: 5, jun: 5, '6': 5, '06': 5,
    juli: 6, jul: 6, '7': 6, '07': 6,
    agustus: 7, ags: 7, aug: 7, '8': 7, '08': 7,
    september: 8, sep: 8, '9': 8, '09': 8,
    oktober: 9, okt: 9, oct: 9, '10': 9,
    november: 10, nov: 10, '11': 10,
    desember: 11, des: 11, dec: 11, '12': 11,
  };

  const clean = dateStr.trim().toLowerCase();

  // Format standar ISO: YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m <= 11) {
      return new Date(y, m, d);
    }
  }

  const parts = clean.split(/[\s,/-]+/);

  if (parts.length >= 3) {
    // Pola 1: DD Bulan/MM YYYY (e.g. 14 Agustus 2026 atau 14/08/2026)
    const day = parseInt(parts[0], 10);
    const month = bulanMap[parts[1]];
    const year = parseInt(parts[2], 10);

    if (!isNaN(day) && month !== undefined && !isNaN(year) && year > 1900) {
      return new Date(year, month, day);
    }

    // Pola 2: YYYY Bulan/MM DD (e.g. 2026 Oktober 25)
    const year2 = parseInt(parts[0], 10);
    const month2 = bulanMap[parts[1]];
    const day2 = parseInt(parts[2], 10);
    if (!isNaN(year2) && month2 !== undefined && !isNaN(day2) && year2 > 1900) {
      return new Date(year2, month2, day2);
    }
  }

  // Cek konstruktor Date langsung sebagai fallback
  const directDate = new Date(dateStr);
  if (!isNaN(directDate.getTime())) {
    return directDate;
  }

  return null;
}

/**
 * Format tanggal ke bahasa Indonesia singkat (e.g., 29 Okt 2026)
 */
export function formatIndoDate(d: Date): string {
  const bulanNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return `${d.getDate()} ${bulanNames[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Menghitung status tenggat waktu & pengingat SLA berdasarkan data verifikasi proyek.
 * Mengacu pada tanggal BAPL dan standar SLA penjaminan mutu (default 14 hari kerja / kalender).
 */
export function calculateDeadlineInfo(
  project?: ProjectIdentity,
  createdAt?: string,
  customSlaDays: number = 14,
  customDeadlineDate?: string
): DeadlineInfo {
  const now = new Date();

  // 1. Dapatkan tanggal acuan verifikasi / BAPL
  let baseDate = parseFlexibleDate(project?.date);
  if (!baseDate && createdAt) {
    baseDate = new Date(createdAt);
  }
  if (!baseDate || isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  // 2. Tentukan target deadline
  let deadline: Date;
  if (customDeadlineDate) {
    const parsedCustom = parseFlexibleDate(customDeadlineDate);
    deadline = parsedCustom || new Date(baseDate.getTime() + customSlaDays * 24 * 60 * 60 * 1000);
  } else if (project?.deadlineDate) {
    const parsedProjectDeadline = parseFlexibleDate(project.deadlineDate);
    deadline = parsedProjectDeadline || new Date(baseDate.getTime() + customSlaDays * 24 * 60 * 60 * 1000);
  } else {
    // Default: Tanggal verifikasi BAPL + durasi SLA
    deadline = new Date(baseDate.getTime() + customSlaDays * 24 * 60 * 60 * 1000);
  }

  // 3. Hitung selisih waktu
  const diffMs = deadline.getTime() - now.getTime();
  const totalDays = customSlaDays;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));

  // Persentase SLA terpakai (0% saat awal, 100% saat tepat di deadline, >100% saat lewat)
  const totalSlaMs = customSlaDays * 24 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, now.getTime() - baseDate.getTime());
  const progressPercentage = Math.min(100, Math.max(0, Math.round((elapsedMs / totalSlaMs) * 100)));

  const isOverdue = daysRemaining < 0;
  const isNearDeadline = daysRemaining >= 0 && daysRemaining <= 3;

  let urgency: DeadlineUrgency = 'SAFE';
  let badgeLabel = '';
  let shortBadge = '';
  let badgeClasses = '';
  let cardBorderClasses = '';
  let recommendation = '';
  let actionUrgency: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

  if (isOverdue) {
    const overdueDays = Math.abs(daysRemaining);
    urgency = 'OVERDUE';
    badgeLabel = `🚨 Terlewat ${overdueDays} Hari`;
    shortBadge = `Lewat ${overdueDays}h`;
    badgeClasses = 'bg-rose-600 text-white border-rose-700 shadow-sm animate-pulse';
    cardBorderClasses = 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20';
    recommendation = `Tenggat waktu verifikasi telah terlampaui ${overdueDays} hari. Segera lakukan eskalasi percepatan Berita Acara Justifikasi dan CCO kepada PMO / PGO untuk menghindari catatan kepatuhan SPI.`;
    actionUrgency = 'URGENT';
  } else if (isNearDeadline) {
    urgency = 'CRITICAL';
    const hLabel = daysRemaining === 0 ? 'Hari Ini (H-0)' : `H-${daysRemaining}`;
    badgeLabel = `⏳ Mendekati Deadline (${hLabel})`;
    shortBadge = hLabel;
    badgeClasses = 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/50 animate-pulse';
    cardBorderClasses = 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/30';
    recommendation = `Tersisa ${daysRemaining === 0 ? 'kurang dari 24 jam' : `${daysRemaining} hari`} sebelum batas SLA berakhir. Pastikan rekonsiliasi RAB, justifikasi teknis, dan dokumen pendukung sudah lengkap diperiksa.`;
    actionUrgency = 'HIGH';
  } else if (daysRemaining <= 7) {
    urgency = 'WARNING';
    badgeLabel = `⚠️ Perhatian (Sisa ${daysRemaining} Hari)`;
    shortBadge = `H-${daysRemaining}`;
    badgeClasses = 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700';
    cardBorderClasses = 'border-amber-300/80 dark:border-amber-600/50';
    recommendation = `Waktu telaah SLA tersisa ${daysRemaining} hari. Reviewer PMO & Planning disarankan segera mereviu lembar justifikasi finansial.`;
    actionUrgency = 'MEDIUM';
  } else {
    urgency = 'SAFE';
    badgeLabel = `✅ Tenggat Aman (Sisa ${daysRemaining} Hari)`;
    shortBadge = `H-${daysRemaining}`;
    badgeClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700';
    cardBorderClasses = 'border-emerald-300/50 dark:border-emerald-700/50';
    recommendation = `Siklus verifikasi dalam batas SLA aman (${daysRemaining} hari tersisa). Lanjutkan telaah rutin berkas BAPL.`;
    actionUrgency = 'LOW';
  }

  return {
    verificationDateStr: formatIndoDate(baseDate),
    verificationDate: baseDate,
    deadlineDateStr: formatIndoDate(deadline),
    deadlineDate: deadline,
    daysRemaining,
    hoursRemaining,
    isOverdue,
    isNearDeadline,
    urgency,
    badgeLabel,
    shortBadge,
    badgeClasses,
    cardBorderClasses,
    slaDays: customSlaDays,
    progressPercentage,
    recommendation,
    actionUrgency,
  };
}
