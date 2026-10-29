import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Hourglass,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { ProjectIdentity } from '../types';
import { calculateDeadlineInfo, DeadlineInfo } from '../utils/deadlineChecker';

interface DeadlineReminderCardProps {
  project: ProjectIdentity;
  createdAt?: string;
  onUpdateDeadline?: (newDeadlineDate: string) => void;
}

export const DeadlineReminderCard: React.FC<DeadlineReminderCardProps> = ({
  project,
  createdAt,
  onUpdateDeadline,
}) => {
  const [selectedSlaDays, setSelectedSlaDays] = useState<number>(project.slaDays || 14);
  const [customDeadline, setCustomDeadline] = useState<string>(project.deadlineDate || '');
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const deadlineInfo: DeadlineInfo = calculateDeadlineInfo(
    project,
    createdAt,
    selectedSlaDays,
    customDeadline || undefined
  );

  const handleSlaPreset = (days: number) => {
    setSelectedSlaDays(days);
    setCustomDeadline('');
  };

  const isCriticalOrOverdue = deadlineInfo.urgency === 'OVERDUE' || deadlineInfo.urgency === 'CRITICAL';

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs relative overflow-hidden ${
        deadlineInfo.urgency === 'OVERDUE'
          ? 'bg-gradient-to-r from-rose-50/90 via-red-50/50 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 border-rose-300 dark:border-rose-700/80 ring-2 ring-rose-500/20'
          : deadlineInfo.urgency === 'CRITICAL'
          ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/30'
          : deadlineInfo.urgency === 'WARNING'
          ? 'bg-gradient-to-r from-yellow-500/10 via-amber-50/50 to-white dark:from-yellow-950/30 dark:via-slate-900 dark:to-slate-900 border-yellow-300 dark:border-yellow-700/60'
          : 'bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border-emerald-300 dark:border-emerald-700/60'
      }`}
    >
      {/* Background soft ambient accent */}
      <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full opacity-10 pointer-events-none blur-2xl bg-amber-400" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Flag & Urgent Status */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              deadlineInfo.urgency === 'OVERDUE'
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-100 dark:ring-rose-950'
                : deadlineInfo.urgency === 'CRITICAL'
                ? 'bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-md ring-4 ring-amber-100 dark:ring-amber-950 animate-bounce-subtle'
                : deadlineInfo.urgency === 'WARNING'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
            }`}
          >
            {deadlineInfo.urgency === 'OVERDUE' ? (
              <AlertOctagon className="w-6 h-6" />
            ) : deadlineInfo.urgency === 'CRITICAL' ? (
              <Hourglass className="w-6 h-6 animate-spin-slow" />
            ) : deadlineInfo.urgency === 'WARNING' ? (
              <Clock className="w-5 h-5 text-amber-700 dark:text-amber-300" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${deadlineInfo.badgeClasses}`}
              >
                {deadlineInfo.urgency === 'OVERDUE' && <AlertTriangle className="w-3.5 h-3.5" />}
                {deadlineInfo.urgency === 'CRITICAL' && <Hourglass className="w-3.5 h-3.5 animate-spin-slow" />}
                {deadlineInfo.urgency === 'WARNING' && <Clock className="w-3.5 h-3.5" />}
                {deadlineInfo.urgency === 'SAFE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{deadlineInfo.badgeLabel}</span>
              </span>

              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                SLA Penjaminan Mutu &amp; Kepatuhan Justifikasi
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
              {deadlineInfo.urgency === 'OVERDUE' && 'Peringatan: Tenggat Waktu Verifikasi Telah Lewat!'}
              {deadlineInfo.urgency === 'CRITICAL' && 'Perhatian Utama: Program Mendekati Batas Akhir Tenggat Waktu'}
              {deadlineInfo.urgency === 'WARNING' && 'Pengingat: Waktu Verifikasi Berada dalam Pantauan Khusus'}
              {deadlineInfo.urgency === 'SAFE' && 'Status Jadwal: Verifikasi Berjalan Sesuai Timeline SLA'}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {deadlineInfo.recommendation}
            </p>
          </div>
        </div>

        {/* Right Side: Key Date Milestones & SLA Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-slate-800">
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 px-3.5 shadow-2xs flex items-center justify-between sm:justify-start gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tanggal BAPL
              </span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {deadlineInfo.verificationDateStr}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <span>Tenggat Deadline</span>
                {isCriticalOrOverdue && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </span>
              <span
                className={`text-xs font-black font-mono ${
                  deadlineInfo.isOverdue
                    ? 'text-rose-600 dark:text-rose-400'
                    : deadlineInfo.isNearDeadline
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {deadlineInfo.deadlineDateStr}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Atur SLA</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* SLA Progress Bar Indicator */}
      <div className="mt-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Progres Timeline SLA ({selectedSlaDays} Hari Kerja)
            </span>
            &bull;
            <span>
              {deadlineInfo.isOverdue
                ? `Terlambat ${Math.abs(deadlineInfo.daysRemaining)} hari`
                : `${deadlineInfo.daysRemaining} hari tersisa`}
            </span>
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {deadlineInfo.progressPercentage}% Terpakai
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              deadlineInfo.urgency === 'OVERDUE'
                ? 'bg-rose-600'
                : deadlineInfo.urgency === 'CRITICAL'
                ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                : deadlineInfo.urgency === 'WARNING'
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, deadlineInfo.progressPercentage)}%` }}
          />
        </div>
      </div>

      {/* Expandable SLA & Deadline Config Panel */}
      {showConfig && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 -mx-4 -mb-4 p-4 rounded-b-2xl animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Standar SLA / Batas Waktu Kustom:</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Pilih rentang SLA tinjauan teknis atau atur tanggal tenggat kustom sesuai klausul kontrak/addendum.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: '7 Hari (CCO Mendesak)', days: 7 },
                { label: '14 Hari (Standar PMO)', days: 14 },
                { label: '30 Hari (Siklis Kontrak)', days: 30 },
              ].map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handleSlaPreset(preset.days)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    selectedSlaDays === preset.days && !customDeadline
                      ? 'bg-[#0054a6] text-white border-[#0054a6] shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-[11px] text-slate-400">Atau input:</span>
                <input
                  type="date"
                  value={customDeadline}
                  onChange={(e) => {
                    setCustomDeadline(e.target.value);
                    if (onUpdateDeadline) onUpdateDeadline(e.target.value);
                  }}
                  className="px-2 py-0.5 rounded-lg text-[11px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
