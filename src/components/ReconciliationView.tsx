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

  const getStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case 'SESUAI':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>SESUAI</span>
          </span>
        );
      case 'TANPA_BUKTI':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shrink-0">
            <ShieldAlert className="w-3 h-3" />
            <span>TANPA BUKTI BA</span>
          </span>
        );
      case 'VOLUME_BEDA':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            <span>VOLUME BEDA</span>
          </span>
        );
      case 'MELEBIHI_BA':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            <span>MELEBIHI BA</span>
          </span>
        );
      case 'TIDAK_DIKLAIM':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1 shrink-0">
            <HelpCircle className="w-3 h-3" />
            <span>TIDAK DIKLAIM</span>
          </span>
        );
      case 'NAMA_BELUM_DIPETAKAN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 shrink-0">
            <HelpCircle className="w-3 h-3" />
            <span>BELUM DIPETAKAN</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002b5b] via-[#0054a6] to-[#f59e0b] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs shrink-0 w-full md:w-auto">
          <label className="text-[10px] font-bold text-amber-200 block uppercase tracking-wider mb-1">
            Pilih Proyek Operasional:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg border border-white/30 focus:outline-none cursor-pointer"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Dukungan Bukti BA
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              {reconciliation.summary.supportedPercentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({reconciliation.summary.statusCounts.SESUAI} / {reconciliation.summary.totalItems} Item)
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Item perubahan JT/JF terbukti sinkron dengan BA.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Nilai Item Bermasalah
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-rose-600">
              {formatRupiah(reconciliation.summary.totalProblematicValue)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Akurasi finansial selisih volume x harga satuan OE.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Skor Kesiapan Dokumen
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                readiness.totalScore >= 80
                  ? 'text-emerald-600'
                  : readiness.totalScore >= 60
                  ? 'text-amber-600'
                  : 'text-rose-600'
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
        <div className="bg-sky-50/80 rounded-2xl border border-sky-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider">
              Toleransi Selisih
            </span>
            <span className="font-mono font-bold text-xs text-sky-900 bg-sky-200 px-2 py-0.5 rounded">
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
          <p className="text-[10px] text-sky-800">
            Toleransi perbedaan volume antara klaim JT/JF dan hasil ukur BA Peninjauan Lapangan (Default 0%).
          </p>
        </div>
      </div>

      {/* Main 3-Way Reconciliation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Tabel Matriks Rekonsiliasi Tiga Arah Per Item</span>
            </h3>
            <p className="text-xs text-slate-500">
              Proyek: <strong>{selectedProject.name}</strong> ({selectedProject.code})
            </p>
          </div>

          {/* Status Breakdown Legend */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
              Sesuai: {reconciliation.summary.statusCounts.SESUAI}
            </span>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
              Tanpa Bukti: {reconciliation.summary.statusCounts.TANPA_BUKTI}
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
              Volume Beda: {reconciliation.summary.statusCounts.VOLUME_BEDA}
            </span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
              Unmapped: {reconciliation.summary.statusCounts.NAMA_BELUM_DIPETAKAN}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Master Item (WBS)</th>
                <th className="p-3 text-right">Volume DED</th>
                <th className="p-3 text-right">BA MC-0</th>
                <th className="p-3 text-right">BA Lapangan</th>
                <th className="p-3 text-right">Klaim JT/JF</th>
                <th className="p-3 text-right">Selisih</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Keterangan / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {reconciliation.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <span className="font-mono font-bold text-blue-700 block text-[11px]">
                      {row.masterItemCode}
                    </span>
                    <span className="font-bold text-slate-900 block">{row.masterItemName}</span>
                    <span className="text-[10px] text-slate-400">Satuan: {row.unit}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-medium">{row.dedVolume}</td>
                  <td className="p-3 text-right font-mono font-medium">
                    {row.baMc0Id ? (
                      <button
                        onClick={() => onOpenBaDetail(row.baMc0Id!)}
                        className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5"
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
                        onClick={() => onOpenBaDetail(row.baLapanganId!)}
                        className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5"
                      >
                        <span>{row.baLapanganVolume}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {row.jtFieldVolume}
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    <span
                      className={
                        row.volumeDelta === 0
                          ? 'text-emerald-600'
                          : row.status === 'MELEBIHI_BA' || row.status === 'TANPA_BUKTI'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }
                    >
                      {row.volumeDelta > 0 ? `${row.volumeDelta}` : '0'} {row.unit}
                    </span>
                  </td>
                  <td className="p-3 text-center">{getStatusBadge(row.status)}</td>
                  <td className="p-3">
                    <p className="text-[11px] text-slate-600 leading-tight mb-1.5">{row.notes}</p>
                    {row.baLapanganId && (
                      <button
                        onClick={() =>
                          onLinkItemToBA(
                            selectedProject.id,
                            row.masterItemId,
                            row.baLapanganId!,
                            row.masterItemName
                          )
                        }
                        className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-[#0054a6] border border-sky-200 rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Hubungkan ke BA</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cek Kronologi & Skor Kesiapan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Cek Kronologi Dokumen */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Cek Kronologi &amp; Kelengkapan Dokumen</span>
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                readiness.chronologyPassed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
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
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/50 border-rose-200 text-rose-950'
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
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Prasyarat Pengajuan (Submission Gate)</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Skor: {readiness.totalScore} / 100
            </span>
          </div>

          {readiness.pendingTasks.length === 0 ? (
            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs space-y-1">
              <span className="font-bold block">
                🎉 Seluruh prasyarat dan kelengkapan dokumen telah terpenuhi!
              </span>
              <p className="text-[11px] text-emerald-800">
                Dokumen siap diajukan untuk tahap verifikasi lanjutan dan pengesahan Kadep PMO.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                Daftar Tugas Yang Harus Dibereskan Sebelum Pengajuan:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {readiness.pendingTasks.map((task, tIdx) => (
                  <li
                    key={tIdx}
                    className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2"
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
