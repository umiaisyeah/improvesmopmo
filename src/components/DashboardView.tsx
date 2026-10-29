import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  XCircle,
  TrendingDown,
  Building2,
  FileSpreadsheet,
  Download,
  AlertOctagon,
  ArrowUpRight,
  ShieldCheck,
  Trash2,
  Layers,
  Sparkles,
  RefreshCw,
  FileText,
  Scale,
  Calculator,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { VerificationResult, DocumentPackage } from '../types';
import { formatRupiah, formatPercentage, formatQuantity } from '../services/normalizer';
import { downloadVerificationExcel } from '../services/excelGenerator';
import { downloadVerificationPdf } from '../services/pdfGenerator';
import { DeadlineReminderCard } from './DeadlineReminderCard';
import { calculateDeadlineInfo } from '../utils/deadlineChecker';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardViewProps {
  result: VerificationResult;
  packages?: DocumentPackage[];
  onSelectTab: (tabId: string) => void;
  onDeleteCurrentPackage?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  result,
  packages,
  onSelectTab,
  onDeleteCurrentPackage,
}) => {
  const { project, summary, total_rab, exceptions, technical_summary } = result;
  const [dashboardItemFilter, setDashboardItemFilter] = useState<'all' | 'changed'>('all');
  const deadlineInfo = calculateDeadlineInfo(project, result.generated_at);

  // Compute monthly incoming document trend categorized by match / mismatch
  const chartData = React.useMemo(() => {
    const pkgs = packages && packages.length > 0 ? packages : [
      {
        id: 'mock-current',
        projectCode: project.projectCode,
        projectName: project.projectName,
        title: project.projectName,
        baplFiles: [],
        excelFileName: 'rab.xlsx',
        supportingFiles: [],
        createdAt: result.generated_at || new Date().toISOString(),
        status: 'COMPLETED',
        result: result,
      } as DocumentPackage
    ];

    const map = new Map<string, { month: string; match: number; mismatch: number; total: number }>();

    pkgs.forEach((pkg) => {
      const dateObj = new Date(pkg.createdAt || Date.now());
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = dateObj.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

      if (!map.has(monthKey)) {
        map.set(monthKey, { month: monthLabel, match: 0, mismatch: 0, total: 0 });
      }

      const entry = map.get(monthKey)!;
      entry.total += 1;
      const isMatch = pkg.result?.total_rab?.delta_match ?? true;
      if (isMatch) {
        entry.match += 1;
      } else {
        entry.mismatch += 1;
      }
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, val]) => val);
  }, [packages, result]);

  return (
    <div className="space-y-6">
      {/* Project Identity & Executive Banner with Playful Blue & Sunny Yellow Accents */}
      <div className="bg-gradient-to-r from-sky-50/70 via-white to-amber-50/40 rounded-2xl border-l-4 border-l-amber-400 border border-sky-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-sky-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-gradient-to-r from-[#0054a6] via-[#0080c8] to-amber-500 text-white font-mono shadow-2xs ring-1 ring-amber-300/40">
                {project.projectCode}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  project.identityMatchStatus === 'MATCH'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                Identitas: {project.identityMatchStatus}
              </span>
              <span className="text-xs text-slate-400">• Rev: {project.revision}</span>

              {/* Visual Deadline Flag Badge */}
              {project.projectCode !== 'BELUM ADA DOKUMEN' && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs ${deadlineInfo.badgeClasses}`}
                  title={`Batas Waktu SLA: ${deadlineInfo.deadlineDateStr}. ${deadlineInfo.recommendation}`}
                >
                  <span>
                    {deadlineInfo.urgency === 'OVERDUE'
                      ? '🚨'
                      : deadlineInfo.urgency === 'CRITICAL'
                      ? '⏳'
                      : deadlineInfo.urgency === 'WARNING'
                      ? '⚠️'
                      : '✅'}
                  </span>
                  <span>{deadlineInfo.badgeLabel}</span>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {project.projectName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{project.subproject}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('traceability')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0054a6] bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
            >
              <span>Lihat Rantai Traceability</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#0054a6]" />
            </button>
            <button
              id="btn-export-excel-dashboard"
              type="button"
              onClick={() => downloadVerificationExcel(result)}
              title="Unduh Kertas Kerja Lengkap 9 Sheets Excel untuk Paket Ini"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:from-emerald-700 hover:to-amber-600 shadow-xs ring-2 ring-amber-400/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Export Excel</span>
            </button>
            <button
              id="btn-export-pdf-dashboard"
              type="button"
              onClick={() => downloadVerificationPdf(result)}
              title="Unduh Laporan Ringkasan Hasil Verifikasi Audit (Format PDF Siap Dibagikan)"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 shadow-xs ring-2 ring-rose-400/30 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Export Ringkasan PDF</span>
            </button>
            {onDeleteCurrentPackage && (
              <button
                id="btn-delete-package-dashboard"
                type="button"
                onClick={onDeleteCurrentPackage}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                title="Hapus paket dokumen ini dari daftar"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Hapus Paket</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Metadata Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Nomor BAPL</span>
            <span className="font-semibold text-slate-800 font-mono truncate block" title={project.baplNumber}>
              {project.baplNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Nomor PO / Kontrak</span>
            <span className="font-semibold text-slate-800 font-mono truncate block" title={project.poNumber}>
              {project.poNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Kontraktor Pelaksana</span>
            <span className="font-semibold text-slate-800 truncate block" title={project.contractor}>
              {project.contractor}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Tanggal Pemeriksaan</span>
            <span className="font-semibold text-slate-800 block">{project.date}</span>
          </div>
        </div>

        {/* Recharts Monthly Ingress Trend & Match/Mismatch Categorization */}
        <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0054a6]" />
                <span>Tren Bulanan Masuk Dokumen (Kategori Sesuai vs Mismatch)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Analisis tren volume dokumen masuk per bulan berdasarkan tanggal pembuatan (createdAt) terbagi atas status kesesuaian RAB.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300">Sesuai (Match)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500" />
                <span className="text-slate-700 dark:text-slate-300">Mismatch (Selisih)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  }}
                />
                <Legend />
                <Bar dataKey="match" name="Sesuai (Match)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="mismatch" name="Mismatch (Selisih)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Domain & Cross-Domain Boundary Protection Banner */}
        {result.program_profile && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">
                    Profil Program: {result.program_profile.name}
                  </span>
                  {result.program_profile.autoDetected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      Auto-Adaptive ({Math.round(result.program_profile.confidence * 100)}%)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Proteksi Batasan Disiplin Aktif: Pencarian klausa substansi terisolasi dari domain asing (e.g. data uji Ohm/listrik tidak mencemari tiang/pipa mekanis).
                </p>
              </div>
            </div>
            {result.program_profile.matchedKeywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                <span className="text-slate-400 font-mono">Kata Kunci:</span>
                {result.program_profile.matchedKeywords.slice(0, 4).map((kw, kIdx) => (
                  <span key={kIdx} className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Multi-Document & Sheet Selection Audit Trail */}
        {((result.selected_sheets && Object.keys(result.selected_sheets).length > 0) ||
          result.multi_bapl_summary ||
          (result.audit_notes && result.audit_notes.length > 0)) && (
          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-6 p-5 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Hasil Seleksi Otomatis: Sheet Excel & Berkas BAPL Versi Terbaru
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sistem mendeteksi dan menggunakan lembar/berkas yang paling mutakhir (revisi terbaru) serta memperbarui poin pekerjaan lama secara otomatis.
                  </p>
                </div>
              </div>
              {result.multi_bapl_summary && result.multi_bapl_summary.superseded_count > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 w-fit">
                  <RefreshCw className="w-3 h-3 text-amber-700" />
                  <span>{result.multi_bapl_summary.superseded_count} Poin Diperbarui Dokumen Terbaru</span>
                </span>
              )}
            </div>

            {/* Selected Sheets breakdown */}
            {result.selected_sheets && Object.keys(result.selected_sheets).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {result.selected_sheets.jusFin && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Sheet Justifikasi Finansial Terpilih
                    </span>
                    <span className="font-bold text-emerald-800 font-mono text-sm block">
                      {result.selected_sheets.jusFin.sheetName}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Alasan: {result.selected_sheets.jusFin.reason}
                    </span>
                    {result.selected_sheets.jusFin.allCandidates.length > 1 && (
                      <span className="text-[10px] text-slate-400 italic block mt-0.5">
                        Kandidat lain: {result.selected_sheets.jusFin.allCandidates.filter((s) => s !== result.selected_sheets?.jusFin?.sheetName).join(', ')}
                      </span>
                    )}
                  </div>
                )}
                {result.selected_sheets.rab && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Sheet RAB Revisi Terpilih
                    </span>
                    <span className="font-bold text-emerald-800 font-mono text-sm block">
                      {result.selected_sheets.rab.sheetName}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Alasan: {result.selected_sheets.rab.reason}
                    </span>
                  </div>
                )}
                {result.selected_sheets.jusTek && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Sheet Justifikasi Teknis Terpilih
                    </span>
                    <span className="font-bold text-emerald-800 font-mono text-sm block">
                      {result.selected_sheets.jusTek.sheetName}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Alasan: {result.selected_sheets.jusTek.reason}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Audit Notes and Document Sequences */}
            {result.audit_notes && result.audit_notes.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {result.audit_notes.map((note, nIdx) => (
                  <div
                    key={nIdx}
                    className="flex items-start gap-2 text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Supporting Documents (MC-0, Test Report, DED) Integration Banner */}
            {result.supporting_documents && result.supporting_documents.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Dokumen Pendukung Terintegrasi Pintar ({result.supporting_documents.length} Berkas)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    Otomatis Validasi Traceability & MCO
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {result.supporting_documents.map((doc, dIdx) => (
                    <div key={dIdx} className="bg-white p-2.5 rounded-xl border border-purple-200 text-xs">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 truncate" title={doc.fileName}>{doc.fileName}</span>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                          {doc.fileType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center justify-between">
                        <span>No: <strong className="text-purple-900 font-mono">{doc.docNumber || '-'}</strong></span>
                        <span className="font-semibold text-emerald-700">{doc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Deadline & SLA Reminder Widget */}
      {project.projectCode !== 'BELUM ADA DOKUMEN' ? (
        <DeadlineReminderCard project={project} createdAt={result.generated_at} />
      ) : (
        <div className="rounded-2xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-gradient-to-r from-amber-50/70 via-sky-50/50 to-white dark:from-slate-900 dark:to-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Pemantauan Tenggat Waktu &amp; SLA
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Siaga Otomatis</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                Kalkulasi Deadline Otomatis Berdasarkan Tanggal Verifikasi BAPL
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
                Setelah dokumen BAPL atau pasangan program diunggah, PRIMA akan otomatis menghitung masa tenggat SLA (7, 14, atau 30 hari), memberikan visual flag urgensi (H-3, H-0, Overdue), dan membunyikan alarm visual pada header.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DUAL-TRACK EXECUTIVE APPROVAL STATUS: JusTek vs JusFin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Track 1: Approval Justifikasi Teknis (JusTek) */}
        <div
          onClick={() => onSelectTab('technical')}
          className="bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-300 p-5 shadow-xs cursor-pointer transition-all hover:translate-y-[-1px] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Pilar Verifikasi 1
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Approval Justifikasi Teknis (JusTek)
                </h3>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                summary.mismatch === 0 && summary.review === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : summary.mismatch > 0
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {summary.mismatch === 0 && summary.review === 0
                ? 'TEKNIS DISETUJUI'
                : summary.mismatch > 0
                ? 'ADA DEVIAASI TEKNIS'
                : 'PERLU KLARIFIKASI'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Fokus: Membuktikan kesesuaian fisik lapangan (BAPL & DED) terhadap klausul usulan teknis (spesifikasi, material, dimensi).
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center font-mono text-xs">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Terverifikasi</span>
              <span className="font-bold text-emerald-700">{summary.verified} Item</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Butuh Bukti</span>
              <span className="font-bold text-blue-700">{summary.need_support} Item</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Mismatch Fisik</span>
              <span className="font-bold text-rose-700">{summary.mismatch} Item</span>
            </div>
          </div>
        </div>

        {/* Track 2: Approval Justifikasi Finansial (JusFin) */}
        <div
          onClick={() => onSelectTab('financial')}
          className="bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 p-5 shadow-xs cursor-pointer transition-all hover:translate-y-[-1px] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Pilar Verifikasi 2
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Approval Justifikasi Finansial (JusFin)
                </h3>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                total_rab.delta_match && !total_rab.proposal_modification_required
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {total_rab.delta_match && !total_rab.proposal_modification_required
                ? 'FINANSIAL OK (<= 10%)'
                : !total_rab.delta_match
                ? 'SELISIH ANGKA JUSFIN'
                : 'PLAFON > 10% (CCO)'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Fokus: Membuktikan kebenaran matematis RAB Awal vs Revisi, kesesuaian angka klaim dokumen JusFin, dan batas toleransi amandemen kontrak 10%.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center font-mono text-xs">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Delta Biaya</span>
              <span className="font-bold text-slate-900">{formatRupiah(total_rab.system_calculated_delta)}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Deviasi (%)</span>
              <span className="font-bold text-emerald-700">{formatPercentage(total_rab.system_calculated_percentage)}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-sans block">Plafon 10%</span>
              <span className="font-bold text-emerald-800">
                {!total_rab.proposal_modification_required ? 'TERPENUHI' : 'MELEBIHI'}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* KPI Cards: The 5 Standard Verification Statuses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Changes */}
        <div
          onClick={() => onSelectTab('technical')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Perubahan</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{summary.total_items}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Item Pekerjaan Terdaftar</span>
        </div>

        {/* Verified */}
        <div
          onClick={() => onSelectTab('technical')}
          className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 hover:border-emerald-300 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">VERIFIED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{summary.verified}</div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Tervalidasi Konsisten</span>
        </div>

        {/* Mismatch */}
        <div
          onClick={() => onSelectTab('financial')}
          className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 hover:border-rose-300 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-rose-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">MISMATCH</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900">{summary.mismatch}</div>
          <span className="text-[11px] text-rose-700 mt-1 block">Deviasi Perhitungan / Data</span>
        </div>

        {/* Need Support */}
        <div
          onClick={() => onSelectTab('technical')}
          className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 hover:border-blue-300 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-blue-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">NEED SUPPORT</span>
            <HelpCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">{summary.need_support}</div>
          <span className="text-[11px] text-blue-700 mt-1 block">Butuh Bukti Tambahan (MCO)</span>
        </div>

        {/* Review */}
        <div
          onClick={() => onSelectTab('exceptions')}
          className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 hover:border-purple-300 shadow-2xs cursor-pointer transition-all hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between text-purple-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">REVIEW</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">{summary.review}</div>
          <span className="text-[11px] text-purple-700 mt-1 block">Audit Auditor Diperlukan</span>
        </div>
      </div>

      {/* Financial Comparison & Impact Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Totals & Discrepancy Callout */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              Verifikasi Total Nilai RAB & Dampak Finansial
            </h3>
            <span className="text-xs text-slate-500">Kalkulasi Ulang Sistem vs JusFin</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-slate-400 text-xs font-medium block">RAB Awal (Baseline)</span>
              <span className="text-lg font-black text-slate-900 block mt-1">
                {formatRupiah(total_rab.rab_initial)}
              </span>
              <span className="text-[11px] text-slate-500">Total nilai DED kontrak</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-slate-400 text-xs font-medium block">RAB Revisi (Actual)</span>
              <span className="text-lg font-black text-slate-900 block mt-1">
                {formatRupiah(total_rab.rab_revised)}
              </span>
              <span className="text-[11px] text-slate-500">Hasil penyesuaian lapangan</span>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <span className="text-emerald-700 text-xs font-medium block">Financial Delta (Hitung)</span>
              <span className="text-lg font-black text-emerald-900 block mt-1">
                {formatRupiah(total_rab.system_calculated_delta)}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold block">
                {formatPercentage(total_rab.system_calculated_percentage)}
              </span>
            </div>
          </div>

          {/* CRITICAL FINDING: Stated JusFin Discrepancy Callout (Section 15) */}
          {!total_rab.delta_match && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 flex items-start gap-3.5">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0 mt-0.5">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                    CRITICAL FINANCIAL MISMATCH
                  </span>
                  <span className="text-xs font-bold text-rose-900">
                    Discrepancy Angka JusFin vs Kalkulasi RAB
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {total_rab.explanation}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
                  <div>
                    <span className="text-rose-600 block text-[10px]">Tertulis pada Dokumen JusFin:</span>
                    <span className="font-bold text-rose-900">{formatRupiah(total_rab.stated_jusfin_delta)}</span>
                  </div>
                  <div>
                    <span className="text-rose-600 block text-[10px]">Perhitungan Sistem (Revisi - Awal):</span>
                    <span className="font-bold text-emerald-900">{formatRupiah(total_rab.system_calculated_delta)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Threshold Rule Check (Section 21) */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-800 block">
                Threshold Approval Amandemen: {total_rab.threshold_percentage * 100}%
              </span>
              <span className="text-slate-500">
                ABS(Delta %) = {Math.abs(total_rab.system_calculated_percentage * 100).toFixed(4)}% &lt;= 10%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Proposal Modification:</span>
              <span
                className={`font-bold px-2.5 py-1 rounded text-xs ${
                  total_rab.proposal_modification_required
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {total_rab.proposal_modification_required ? 'REQUIRED' : 'NOT REQUIRED'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Technical Categories Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Kategori Perubahan Teknis
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Material Changes</span>
                <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                  {technical_summary.material_changes}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Dimension Changes</span>
                <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                  {technical_summary.dimension_changes}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Quantity Changes</span>
                <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                  {technical_summary.quantity_changes}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Scope Changes</span>
                <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                  {technical_summary.scope_changes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Method Changes</span>
                <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                  {technical_summary.method_changes}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => onSelectTab('technical')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold hover:underline"
            >
              Buka Matriks Detail Teknis &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Kajian Komprehensif Perubahan: Deskripsi Pekerjaan, Quantity, & Harga */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Kajian 3 Pilar Perubahan Kontrak: Deskripsi Pekerjaan, Kuantitas &amp; Harga
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                Audit Menyeluruh Excel
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Telaah menyeluruh atas perubahan lingkup pekerjaan serta sub-spesifikasi yang tertulis di baris bawahnya, pergeseran volume fisik (quantity), dan komparasi harga satuan serta total anggaran.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDashboardItemFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dashboardItemFilter === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Seluruh Baris Data ({result.financial_items.length})
              </button>
              <button
                type="button"
                onClick={() => setDashboardItemFilter('changed')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dashboardItemFilter === 'changed'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hanya Item Berubah ({result.financial_items.filter((f) => f.delta_qty !== 0 || f.delta_unit_price !== 0 || f.delta_value !== 0).length})
              </button>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('financial')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold hover:underline inline-flex items-center gap-1 px-2.5 py-1.5"
            >
              Buka Matriks Finansial &rarr;
            </button>
          </div>
        </div>

        {/* Changed Items Kajian List */}
        <div className="space-y-3">
          {result.financial_items
            .filter((f) => {
              if (dashboardItemFilter === 'all') return true;
              return (
                f.delta_qty !== 0 ||
                f.delta_unit_price !== 0 ||
                f.delta_value !== 0 ||
                (f.sub_specs_differences && f.sub_specs_differences.length > 0)
              );
            })
            .map((f, idx) => {
              const linkedTech = result.changes.find(
                (c) => c.change_id.trim().toUpperCase() === f.change_id.trim().toUpperCase()
              );
              const subDiffs =
                (f.sub_specs_differences && f.sub_specs_differences.length > 0)
                  ? f.sub_specs_differences
                  : (linkedTech?.sub_specs_differences || []);

              return (
                <div
                  key={`${f.change_id}_${idx}`}
                  className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        {f.change_id}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">{f.item}</span>
                      {f.traceability_ref_id && f.has_valid_ba_ref && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          REF: {f.traceability_ref_id}
                        </span>
                      )}
                      {f.ba_anomaly_type === 'ANOMALI_ANGKA_TANPA_REFERENSI_BA' && (
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-rose-600 text-white animate-pulse">
                          ⚠️ ANOMALI: TANPA REF BA
                        </span>
                      )}
                      {f.ba_anomaly_type === 'ANOMALI_DEVIASI_NILAI_BA' && (
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-600 text-white">
                          ⚠️ DEVIASI ANGKA BA
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          f.calculation_status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        ARITMATIKA: {f.calculation_status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                        {f.financial_status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Pilar 1: Deskripsi Pekerjaan & Sub-Spesifikasi */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                          1. Deskripsi &amp; Sub-Spesifikasi
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-sans mt-1">
                          {f.justification}
                        </p>

                        {subDiffs.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-1">
                            <span className="text-[9.5px] font-bold text-indigo-800 uppercase tracking-wider block">
                              Sub-Spesifikasi Tertulis di Bawahnya:
                            </span>
                            <div className="space-y-0.5 font-mono text-[10px]">
                              {subDiffs.map((d, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="bg-indigo-50/80 px-2 py-0.5 rounded text-indigo-950 border border-indigo-200"
                                >
                                  {d}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {linkedTech && (
                        <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1 mt-1">
                          BAPL Fisik: <strong className="text-slate-700 font-medium">{linkedTech.actual_bapl}</strong>
                        </div>
                      )}
                    </div>

                    {/* Pilar 2: Quantity (Volume & Satuan) */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          2. Kuantitas (Volume &amp; Satuan)
                        </span>
                        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                          <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="text-[9px] text-slate-400 block font-sans">Semula:</span>
                            <span className="font-bold text-slate-800">
                              {formatQuantity(f.qty_initial)} {f.unit}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="text-[9px] text-slate-400 block font-sans">Menjadi:</span>
                            <span className="font-bold text-slate-900">
                              {formatQuantity(f.qty_revised)} {f.unit}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100 text-[11px]">
                          <span className="text-slate-500 font-sans">Delta Volume:</span>
                          <span
                            className={`font-mono font-bold ${
                              f.delta_qty > 0
                                ? 'text-rose-700'
                                : f.delta_qty < 0
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {f.delta_qty > 0 ? '+' : ''}
                            {formatQuantity(f.delta_qty)} {f.unit}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1 mt-1 font-sans">
                        {f.delta_qty === 0 ? 'Volume fisik tetap sesuai kontrak awal.' : 'Penyesuaian volume kebutuhan fisik.'}
                      </div>
                    </div>

                    {/* Pilar 3: Harga (Harga Satuan & Total Biaya) */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                          <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                          3. Harga Satuan &amp; Total Biaya
                        </span>
                        <div className="space-y-1 pt-1 font-mono text-[11px]">
                          <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-100">
                            <span className="text-slate-500 font-sans text-[10px]">Harga Satuan:</span>
                            <span className="font-bold text-slate-900">{formatRupiah(f.unit_price_revised)}</span>
                          </div>
                          {f.delta_unit_price !== 0 && (
                            <div className="text-[9.5px] text-slate-400 text-right font-sans">
                              Awal: {formatRupiah(f.unit_price_initial)} (Delta: {f.delta_unit_price > 0 ? '+' : ''}{formatRupiah(f.delta_unit_price)})
                            </div>
                          )}
                          <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-100">
                            <span className="text-slate-500 font-sans text-[10px]">Total Revisi:</span>
                            <span className="font-bold text-slate-900">{formatRupiah(f.calculated_revised)}</span>
                          </div>
                          <div className="flex justify-between items-center p-1.5 bg-slate-50 rounded border border-slate-100 font-bold">
                            <span className="text-slate-700 font-sans text-[10px]">Delta Total:</span>
                            <span className={f.delta_value > 0 ? 'text-rose-700' : f.delta_value < 0 ? 'text-emerald-700' : 'text-slate-600'}>
                              {f.delta_value > 0 ? '+' : ''}{formatRupiah(f.delta_value)} ({formatPercentage(f.delta_percentage)})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1 mt-1 font-sans">
                        Nilai Semula: {formatRupiah(f.calculated_initial)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Critical Findings List (Master Prompt Section 26) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Temuan Kritis & Rekomendasi Audit PMO
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar anomali dan tindak lanjut sebelum persetujuan amandemen kontrak
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('exceptions')}
            className="text-xs text-blue-700 hover:underline font-semibold"
          >
            Lihat semua temuan ({exceptions.length})
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {exceptions.map((exc, idx) => (
            <div key={`${exc.exception_id}_${idx}`} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                    exc.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : exc.priority === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {exc.priority}
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">{exc.finding}</span>
                  <p className="text-slate-600 mt-0.5 text-[11px]">
                    <span className="font-semibold text-slate-700">Rekomendasi: </span>
                    {exc.recommended_action}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                  exc.status === 'MISMATCH'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : exc.status === 'NEED SUPPORT'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {exc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
