import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck, 
  Droplet,
  FileSpreadsheet,
  ArrowRight,
  Layers,
  Clock
} from 'lucide-react';
import { Project, IPALocation } from '../types';
import { IPA_LIST } from '../data/mockData';

interface ExecutiveOverviewProps {
  projects: Project[];
  selectedIpa: IPALocation | 'ALL';
  onSelectIpa: (ipa: IPALocation) => void;
  onOpenProjectDetail: (projectId: string) => void;
  onOpenVerificationTab: () => void;
  unresolvedIssueCount: number;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  projects,
  selectedIpa,
  onSelectIpa,
  onOpenProjectDetail,
  onOpenVerificationTab,
  unresolvedIssueCount,
}) => {
  const filteredProjects = selectedIpa === 'ALL' 
    ? projects 
    : projects.filter(p => p.ipa === selectedIpa);

  // Financial aggregates
  const totalContract = filteredProjects.reduce((acc, p) => acc + p.contractValue, 0);
  const totalRealization = filteredProjects.reduce((acc, p) => acc + p.realizationValue, 0);
  const totalJustificationDelta = filteredProjects.reduce((acc, p) => acc + p.justificationDelta, 0);
  const realizationPct = totalContract > 0 ? (totalRealization / totalContract) * 100 : 0;
  
  // Berita Acara counts
  const allBAs = filteredProjects.flatMap(p => p.beritaAcaraList);
  const mc0Count = allBAs.filter(b => b.baType === 'MC-0').length;
  const plCount = allBAs.filter(b => b.baType === 'Peninjauan Lapangan').length;
  const tkCount = allBAs.filter(b => b.baType === 'Tes Komisioning').length;
  const mc100Count = allBAs.filter(b => b.baType === 'MC-100').length;

  const formatRupiah = (val: number) => {
    if (Math.abs(val) >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(2)} Milyar`;
    }
    if (Math.abs(val) >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(1)} Juta`;
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner for Verification Issues */}
      {unresolvedIssueCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Ditemukan {unresolvedIssueCount} Catatan Verifikasi Pada Dokumen Justifikasi
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Perlu Tindakan PMO</span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Ada perubahan volume Justek tanpa bukti Berita Acara pendukung serta perbedaan penulisan istilah nama item dengan BA.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenVerificationTab}
            className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Buka Modul Verifikasi Otomatis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pagu Kontrak */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Nilai Kontrak Awal</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{formatRupiah(totalContract)}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{filteredProjects.length} Proyek Konstruksi & Pemeliharaan</span>
            </p>
          </div>
        </div>

        {/* Card 2: Realisasi Anggaran */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Realisasi Anggaran</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{formatRupiah(totalRealization)}</div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, realizationPct)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-medium">
              <span>Progres Pencairan:</span>
              <span className="text-emerald-700 font-bold">{realizationPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Deviasi Justifikasi Finansial */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deviasi Jusfin (Adendum)</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              totalJustificationDelta > 0 ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {totalJustificationDelta > 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-bold ${totalJustificationDelta > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {totalJustificationDelta > 0 ? '+' : ''}{formatRupiah(totalJustificationDelta)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalContract > 0 ? ((totalJustificationDelta / totalContract) * 100).toFixed(2) : 0}% dari kontrak awal DED
            </p>
          </div>
        </div>

        {/* Card 4: Digital Berita Acara Stat */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Berita Acara Terverifikasi</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{allBAs.length} Dokumen</div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[11px]">
              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">MC-0: {mc0Count}</span>
              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">Lap: {plCount}</span>
              <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-mono">Komi: {tkCount}</span>
              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">MC-100: {mc100Count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 IPA Water Treatment Plants Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sebaran 6 Instalasi Pengolahan Air (IPA) PMO Cyclical</h3>
            <p className="text-xs text-slate-500">Status kontrak, justifikasi teknis-finansial, dan realisasi anggaran tiap plant</p>
          </div>
          {selectedIpa !== 'ALL' && (
            <button
              onClick={() => onSelectIpa('IPA Buaran 1')} // or click reset
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              Tampilkan Semua IPA
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {IPA_LIST.map((ipa) => {
            const ipaProjects = projects.filter(p => p.ipa === ipa.id);
            const contractVal = ipaProjects.reduce((sum, p) => sum + p.contractValue, 0);
            const realizVal = ipaProjects.reduce((sum, p) => sum + p.realizationValue, 0);
            const deltaVal = ipaProjects.reduce((sum, p) => sum + p.justificationDelta, 0);
            const pct = contractVal > 0 ? (realizVal / contractVal) * 100 : 0;
            const hasPendingJustek = ipaProjects.some(p => p.justifikasi && p.justifikasi.status !== 'DISETUJUI');

            return (
              <div
                key={ipa.id}
                onClick={() => onSelectIpa(ipa.id)}
                className={`bg-white rounded-xl border p-4.5 cursor-pointer transition-all hover:shadow-md hover:border-blue-400 group relative ${
                  selectedIpa === ipa.id ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {ipa.name}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-500">Kapasitas: {ipa.capacity}</span>
                    </div>
                  </div>
                  {hasPendingJustek ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Ada Justek Aktif
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Stabil
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-1">{ipa.description}</p>

                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Proyek Aktif:</span>
                    <span className="font-semibold text-slate-800">{ipaProjects.length} Proyek</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Nilai Kontrak:</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(contractVal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Deviasi Justifikasi:</span>
                    <span className={`font-semibold ${deltaVal > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                      {deltaVal > 0 ? `+${formatRupiah(deltaVal)}` : deltaVal < 0 ? formatRupiah(deltaVal) : 'Rp 0'}
                    </span>
                  </div>

                  <div className="pt-1">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Realisasi Anggaran</span>
                      <span className="font-bold text-blue-700">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Justifikasi & Berita Acara Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daftar Justifikasi Teknis & Finansial Dalam Proses Review</h3>
            <p className="text-xs text-slate-500">Monitoring perubahan DED vs Lapangan dan tahapan persetujuan berjenjang</p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
            Alur: Kontraktor &rarr; Site PMO &rarr; Reviewer Teknis &rarr; Finansial &rarr; Kadep
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Proyek & IPA</th>
                <th className="py-3 px-4">No. Justek / Jusfin</th>
                <th className="py-3 px-4">Anomali Lapangan vs DED</th>
                <th className="py-3 px-4">Nilai Variance (Adendum)</th>
                <th className="py-3 px-4">Status & Tahap Approval</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects
                .filter(p => p.justifikasi)
                .map((project) => {
                  const justek = project.justifikasi!;
                  const isPositive = justek.financialSummary.netVarianceValue >= 0;

                  return (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-[220px]">
                        <div className="font-bold text-slate-900 truncate" title={project.name}>
                          {project.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-mono text-blue-700 bg-blue-50 px-1 py-0.2 rounded font-semibold">{project.code}</span>
                          <span>&bull;</span>
                          <span className="text-slate-600 font-medium">{project.ipa}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-slate-800 font-semibold">{justek.numberJustek}</div>
                        <div className="font-mono text-[10px] text-slate-500">{justek.numberJusfin}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <p className="line-clamp-2 text-slate-600 text-xs">
                          {justek.engineeringContext.fieldAnomalyFound}
                        </p>
                        <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          Akar: {justek.engineeringContext.rootCauseCategory.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`font-bold ${isPositive ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {isPositive ? '+' : ''}{formatRupiah(justek.financialSummary.netVarianceValue)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          ({isPositive ? '+' : ''}{justek.financialSummary.variancePercentage}%)
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            justek.status === 'DISETUJUI'
                              ? 'bg-emerald-100 text-emerald-800'
                              : justek.status === 'REVIEW_FINANSIAL'
                              ? 'bg-purple-100 text-purple-800'
                              : justek.status === 'REVIEW_TEKNIS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {justek.status.replace(/_/g, ' ')}
                          </span>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Tahap {justek.currentApprovalStage} dari 5</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onOpenProjectDetail(project.id)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Buka Justek
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
