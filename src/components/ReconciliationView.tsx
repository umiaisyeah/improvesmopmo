import React, { useState } from 'react';
import {
  Project,
  MasterItem,
  MasterItemMapping,
  ReconciliationRow,
  ReconciliationStatus,
} from '../types';
import {
  performThreeWayReconciliation,
  performChronologyCheck,
  calculateProjectReadinessScore,
} from '../services/reconciliation';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  ShieldAlert,
  Clock,
  Building2,
  Link as LinkIcon,
  HelpCircle,
  FileText,
  Sliders,
  Check,
  ShieldCheck,
  Tag,
} from 'lucide-react';

interface ReconciliationViewProps {
  projects: Project[];
  masterItems: MasterItem[];
  mappings: MasterItemMapping[];
  onOpenBaDetail: (baId: string) => void;
  onOpenProjectDetail: (projectId: string) => void;
  onLinkItemToBA: (projectId: string, itemId: string, baId: string, baItemName: string) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  projects,
  masterItems,
  mappings,
  onOpenBaDetail,
  onOpenProjectDetail,
  onLinkItemToBA,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [tolerancePct, setTolerancePct] = useState<number>(0);

  // Local state tracking immediately linked items for smooth visual feedback
  const [locallyLinkedItems, setLocallyLinkedItems] = useState<Record<string, string>>({});

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  if (!selectedProject) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        Belum ada proyek yang terdaftar di portofolio.
      </div>
    );
  }

  const reconciliation = performThreeWayReconciliation(
    selectedProject,
    masterItems,
    mappings,
    tolerancePct
  );
  const chronology = performChronologyCheck(selectedProject);
  const readiness = calculateProjectReadinessScore(selectedProject, masterItems, mappings);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleLinkItem = (row: ReconciliationRow) => {
    const baIdToUse = row.baLapanganId || row.baMc0Id || 'BA-BR2-01';
    onLinkItemToBA(selectedProject.id, row.masterItemId, baIdToUse, row.masterItemName);
    setLocallyLinkedItems((prev) => ({
      ...prev,
      [row.masterItemId]: baIdToUse,
    }));
  };

  const getStatusBadge = (status: ReconciliationStatus, isLinked: boolean) => {
    if (isLinked) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 shrink-0 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>TERVALIDASI BA</span>
        </span>
      );
    }

    switch (status) {
      case 'SESUAI':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>SESUAI</span>
          </span>
        );
      case 'TANPA_BUKTI':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1 shrink-0">
            <ShieldAlert className="w-3 h-3" />
            <span>TANPA BUKTI BA</span>
          </span>
        );
      case 'VOLUME_BEDA':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            <span>VOLUME BEDA</span>
          </span>
        );
      case 'MELEBIHI_BA':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            <span>MELEBIHI BA</span>
          </span>
        );
      case 'TIDAK_DIKLAIM':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-700 flex items-center gap-1 shrink-0">
            <HelpCircle className="w-3 h-3" />
            <span>TIDAK DIKLAIM</span>
          </span>
        );
      case 'NAMA_BELUM_DIPETAKAN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-700 flex items-center gap-1 shrink-0">
            <HelpCircle className="w-3 h-3" />
            <span>BELUM DIPETAKAN</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002b5b] via-[#0054a6] to-[#f59e0b] rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs tracking-wider uppercase mb-1">
            <Scale className="w-4 h-4" />
            <span>Rekonsiliasi Tiga Arah (DED vs BA MC-0/Lapangan vs JT/JF)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Pusat Rekonsiliasi &amp; Validasi Bukti Berita Acara
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-2xl">
            Memastikan setiap klaim perubahan volume di Justifikasi Teknis (JT) &amp; Finansial (JF) didukung bukti konkret pengukuran Berita Acara Lapangan.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs shrink-0 w-full md:w-auto">
          <label className="text-[10px] font-bold text-amber-200 block uppercase tracking-wider mb-1">
            Pilih Proyek Operasional:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl border border-white/30 focus:outline-none cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name.slice(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards & Tolerance Slider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Dukungan Bukti BA
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {reconciliation.summary.supportedPercentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({reconciliation.summary.statusCounts.SESUAI} / {reconciliation.summary.totalItems} Item)
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Item perubahan JT/JF terbukti sinkron dengan BA.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Nilai Item Bermasalah
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {formatRupiah(reconciliation.summary.totalProblematicValue)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Akurasi finansial selisih volume x harga satuan OE.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Skor Kesiapan Dokumen
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                readiness.totalScore >= 80
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : readiness.totalScore >= 60
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {readiness.totalScore} / 100
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            {readiness.blockingIssues.length === 0
              ? '✅ Bebas dari blocking submission gate'
              : `⚠️ Ditemukan ${readiness.blockingIssues.length} item blocking!`}
          </p>
        </div>

        {/* Configurable Tolerance Box */}
        <div className="bg-sky-50/80 dark:bg-sky-950/30 rounded-3xl border border-sky-200 dark:border-sky-900/60 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
              Toleransi Selisih
            </span>
            <span className="font-mono font-bold text-xs text-sky-900 dark:text-sky-200 bg-sky-200 dark:bg-sky-900 px-2 py-0.5 rounded">
              {tolerancePct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={tolerancePct}
            onChange={(e) => setTolerancePct(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <p className="text-[10px] text-sky-800 dark:text-sky-300/80">
            Toleransi perbedaan volume antara klaim JT/JF dan hasil ukur BA Peninjauan Lapangan (Default 0%).
          </p>
        </div>
      </div>

      {/* Main 3-Way Reconciliation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Tabel Matriks Rekonsiliasi Tiga Arah Per Item</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proyek: <strong>{selectedProject.name}</strong> ({selectedProject.code})
            </p>
          </div>

          {/* Status Breakdown Legend */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">
              Sesuai: {reconciliation.summary.statusCounts.SESUAI}
            </span>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded">
              Tanpa Bukti: {reconciliation.summary.statusCounts.TANPA_BUKTI}
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded">
              Volume Beda: {reconciliation.summary.statusCounts.VOLUME_BEDA}
            </span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded">
              Unmapped: {reconciliation.summary.statusCounts.NAMA_BELUM_DIPETAKAN}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Master Item (WBS) &amp; Pelabelan BA</th>
                <th className="p-3 text-right">Volume DED</th>
                <th className="p-3 text-right">BA MC-0</th>
                <th className="p-3 text-right">BA Lapangan</th>
                <th className="p-3 text-right">Klaim JT/JF</th>
                <th className="p-3 text-right">Selisih</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Keterangan / Aksi Tautan BA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {reconciliation.rows.map((row, rIdx) => {
                // Effective linked BA ID calculation (from row props or local state or default evidence match)
                const effectiveLinkedBaId =
                  row.linkedBaId ||
                  locallyLinkedItems[row.masterItemId] ||
                  (row.evidenceStatus === 'VERIFIED' ? row.baLapanganId || row.baMc0Id : undefined);

                const isLinked = Boolean(effectiveLinkedBaId);

                return (
                  <tr
                    key={rIdx}
                    className={`transition-colors ${
                      isLinked
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-[11px]">
                          {row.masterItemCode}
                        </span>
                        {isLinked && (
                          <span className="p-0.5 bg-emerald-600 text-white rounded-full" title="Item Tervalidasi Ke Berita Acara">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <span className="font-bold text-slate-900 dark:text-white block">{row.masterItemName}</span>
                      <span className="text-[10px] text-slate-400">Satuan: {row.unit}</span>

                      {/* VISUAL CHECKLIST INDICATOR BADGE REFERENCING linkedBaId */}
                      {isLinked && (
                        <div className="pt-1 flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>TERVALIDASI BA: {effectiveLinkedBaId}</span>
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-right font-mono font-medium">{row.dedVolume}</td>

                    <td className="p-3 text-right font-mono font-medium">
                      {row.baMc0Id ? (
                        <button
                          type="button"
                          onClick={() => onOpenBaDetail(row.baMc0Id!)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{row.baMc0Volume}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="p-3 text-right font-mono font-medium">
                      {row.baLapanganId ? (
                        <button
                          type="button"
                          onClick={() => onOpenBaDetail(row.baLapanganId!)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{row.baLapanganVolume}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {row.jtFieldVolume}
                    </td>

                    <td className="p-3 text-right font-mono font-bold">
                      <span
                        className={
                          row.volumeDelta === 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : row.status === 'MELEBIHI_BA' || row.status === 'TANPA_BUKTI'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {row.volumeDelta > 0 ? `${row.volumeDelta}` : '0'} {row.unit}
                      </span>
                    </td>

                    <td className="p-3 text-center">{getStatusBadge(row.status, isLinked)}</td>

                    <td className="p-3 space-y-1.5">
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                        {row.notes}
                      </p>

                      {/* ACTION BUTTON WITH INTERACTIVE CHECKLIST BADGE */}
                      {isLinked ? (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <button
                            type="button"
                            onClick={() => onOpenBaDetail(effectiveLinkedBaId!)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-black inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all hover:scale-105"
                            title={`Lihat Detail Berkas BA: ${effectiveLinkedBaId}`}
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-white" />
                            <span>✅ Terhubung: {effectiveLinkedBaId}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLinkItem(row)}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                            title="Tautkan ulang item ini ke Berita Acara"
                          >
                            Tautkan Ulang
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleLinkItem(row)}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#0054a6] border border-sky-200 rounded-lg text-[10.5px] font-extrabold inline-flex items-center gap-1 cursor-pointer transition-all hover:scale-105 shadow-2xs"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>Hubungkan ke BA</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cek Kronologi & Skor Kesiapan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Cek Kronologi Dokumen */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Cek Kronologi &amp; Kelengkapan Dokumen</span>
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                readiness.chronologyPassed
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {readiness.chronologyPassed ? 'LOLOS CEK KRONOLOGI' : 'TERDAPAT ANOMALI'}
            </span>
          </div>

          <div className="space-y-2.5">
            {chronology.map((chk) => (
              <div
                key={chk.id}
                className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                  chk.passed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                }`}
              >
                <div
                  className={`p-1 rounded-full shrink-0 mt-0.5 ${
                    chk.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold">{chk.title}</h4>
                  <p className="text-[11px] opacity-90 mt-0.5">{chk.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Pekerjaan Yang Harus Dibereskan */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Prasyarat Pengajuan (Submission Gate)</span>
            </h3>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Skor: {readiness.totalScore} / 100
            </span>
          </div>

          {readiness.pendingTasks.length === 0 ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs space-y-1">
              <span className="font-bold block">
                🎉 Seluruh prasyarat dan kelengkapan dokumen telah terpenuhi!
              </span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Dokumen siap diajukan untuk tahap verifikasi lanjutan dan pengesahan Kadep PMO.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                Daftar Tugas Yang Harus Dibereskan Sebelum Pengajuan:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {readiness.pendingTasks.map((task, tIdx) => (
                  <li
                    key={tIdx}
                    className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2"
                  >
                    <span className="text-rose-600 font-bold">&bull;</span>
                    <span className="text-[11px] font-medium leading-tight">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
