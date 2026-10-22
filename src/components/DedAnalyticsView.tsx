import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Droplet,
  ExternalLink,
  Check
} from 'lucide-react';
import { Project, IPALocation, ProjectGate } from '../types';
import { IPA_LIST } from '../data/mockData';
import { getDeviation } from '../services/deviationRules';

interface DedAnalyticsViewProps {
  projects: Project[];
  thresholdPct: number;
  setThreshold: (val: number) => void;
  gates: ProjectGate[];
  onToggleGate: (projectId: string, gateItemId: string, officerName: string) => void;
  onOpenProjectDetail: (projectId: string) => void;
}

export const DedAnalyticsView: React.FC<DedAnalyticsViewProps> = ({
  projects,
  thresholdPct,
  setThreshold,
  gates,
  onToggleGate,
  onOpenProjectDetail,
}) => {
  const [selectedProjectForGate, setSelectedProjectForGate] = useState<string>(projects[0]?.id || '');

  // Analytics Calculations
  const totalProjects = projects.length;
  const projectsWithDedChanges = projects.filter(p => !!p.justifikasi);
  const dedChangePct = totalProjects > 0 ? (projectsWithDedChanges.length / totalProjects) * 100 : 0;

  const deviations = projects.map(p => getDeviation(p, thresholdPct));
  const exceedingCount = deviations.filter(d => d.exceedsThreshold).length;

  const absDeviationsSum = deviations.reduce((acc, d) => acc + Math.abs(d.effectivePct), 0);
  const avgAbsDeviation = totalProjects > 0 ? (absDeviationsSum / totalProjects).toFixed(2) : '0';

  // Preventable changes (OBSTRUKSI_UTILITAS_EKSISTING and STRUKTUR_TANAH)
  const preventableCount = projects.filter(p => {
    const cat = p.justifikasi?.engineeringContext.rootCauseCategory;
    return cat === 'OBSTRUKSI_UTILITAS_EKSISTING' || cat === 'STRUKTUR_TANAH';
  }).length;

  // Root Cause Breakdown
  const rootCauseCounts: Record<string, number> = {
    'OBSTRUKSI_UTILITAS_EKSISTING': 0,
    'STRUKTUR_TANAH': 0,
    'OPTIMALISASI_PROSES_AIR': 0,
    'PENINGKATAN_SPESIFIKASI': 0,
    'KONDISI_DARURAT': 0,
  };

  projects.forEach(p => {
    const cat = p.justifikasi?.engineeringContext.rootCauseCategory;
    if (cat && rootCauseCounts[cat] !== undefined) {
      rootCauseCounts[cat]++;
    }
  });

  const activeGate = gates.find(g => g.projectId === selectedProjectForGate) || { projectId: selectedProjectForGate, items: [] };
  const completedGateCount = activeGate.items.filter(i => i.isCompleted).length;
  const totalGateCount = activeGate.items.length;
  const gateProgressPct = totalGateCount > 0 ? (completedGateCount / totalGateCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Threshold Slider */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Analitik DED &amp; Kontrol Gate MC-0 Proyek Cyclical</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Analisis komparatif perubahan gambar rencana (DED) terhadap realisasi lapangan. Menilai kategori akar masalah (root cause), potensi deviasi yang dapat dicegah, serta kepatuhan Gate MC-0 sebelum konstruksi.
          </p>
        </div>

        {/* Threshold Slider Controller */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[280px] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Ambang Batas Deviasi (Threshold)</span>
            </span>
            <span className="text-blue-700 font-mono text-sm">&plusmn;{thresholdPct}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="0.5"
            value={thresholdPct}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>5% (Ketat)</span>
            <span>10% (Standar)</span>
            <span>25% (Longgar)</span>
          </div>
        </div>
      </div>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proyek Perubahan DED</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{projectsWithDedChanges.length} <span className="text-xs font-normal text-slate-500">({dedChangePct.toFixed(0)}% dari total)</span></div>
          <p className="text-[11px] text-slate-500 mt-1">Memiliki Justifikasi Teknis &amp; Finansial</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Melebihi Ambang &plusmn;{thresholdPct}%</span>
          <div className={`text-2xl font-black mt-1 ${exceedingCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {exceedingCount} Proyek
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Wajib Proposal Modifikasi &amp; Stop Work</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Deviasi Absolut</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{avgAbsDeviation}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Selisih volume / nilai terhadap DED</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potensi Dicegah (Utilitas/Tanah)</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{preventableCount} Proyek</div>
          <p className="text-[11px] text-slate-500 mt-1">Obstruksi utilitas &amp; struktur tanah</p>
        </div>
      </div>

      {/* Root Cause & IPA Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Root Cause Category Chart/List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Distribusi Kategori Akar Masalah (Root Cause Category)
          </h3>

          <div className="space-y-3 text-xs">
            {Object.entries(rootCauseCounts).map(([cat, count]) => {
              const total = projectsWithDedChanges.length || 1;
              const pct = (count / total) * 100;
              const labelMap: Record<string, string> = {
                'OBSTRUKSI_UTILITAS_EKSISTING': 'Obstruksi Utilitas Eksisting (Kabel/Pipa)',
                'STRUKTUR_TANAH': 'Struktur Tanah / Delaminasi Beton Heritage',
                'OPTIMALISASI_PROSES_AIR': 'Optimalisasi Proses Pengolahan Air & Efisiensi',
                'PENINGKATAN_SPESIFIKASI': 'Peningkatan Spesifikasi Alat (Upgrade Inverter/SCM)',
                'KONDISI_DARURAT': 'Kondisi Darurat Operasional IPA'
              };

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{labelMap[cat] || cat}</span>
                    <span className="font-mono">{count} Proyek ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MC-0 Gate Checklist Controller */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Gate Validasi Pra-Konstruksi (MC-0)</span>
            </h3>

            <select
              value={selectedProjectForGate}
              onChange={(e) => setSelectedProjectForGate(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.name.substring(0, 35)}...</option>
              ))}
            </select>
          </div>

          {/* Progress Bar for Gate */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Kepatuhan Gate MC-0</span>
              <span className={gateProgressPct === 100 ? 'text-emerald-700' : 'text-amber-700'}>
                {gateProgressPct.toFixed(0)}% Selesai ({completedGateCount}/{totalGateCount} Butir)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all ${gateProgressPct === 100 ? 'bg-emerald-600' : 'bg-amber-500'}`} 
                style={{ width: `${gateProgressPct}%` }}
              ></div>
            </div>
            {gateProgressPct < 100 && (
              <p className="text-[11px] text-amber-800 font-medium flex items-center gap-1 pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Peringatan: Gate MC-0 belum 100% lengkap. Eksekusi fisik beresiko temuan audit.</span>
              </p>
            )}
          </div>

          {/* Checklist Items */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {activeGate.items.map(item => (
              <div
                key={item.id}
                onClick={() => onToggleGate(selectedProjectForGate, item.id, 'Site Engineer PMO')}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  item.isCompleted ? 'bg-emerald-50/50 border-emerald-200 text-slate-900 font-medium' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                    item.isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {item.isCompleted && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="truncate">{item.taskName}</span>
                </div>

                {item.isCompleted && item.checkedBy && (
                  <span className="text-[10px] text-emerald-700 font-mono shrink-0">
                    {item.checkedBy} ({item.checkedAt})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Deviation Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Tabel Komparasi Deviasi Proyek (Dinyatakan vs Kalkulasi Item BoQ)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3 font-bold">Kode &amp; Proyek</th>
                <th className="p-3 font-bold">IPA</th>
                <th className="p-3 font-bold">Nilai Kontrak</th>
                <th className="p-3 font-bold">Deviasi Dinyatakan (%)</th>
                <th className="p-3 font-bold">Deviasi Item BoQ (%)</th>
                <th className="p-3 font-bold">Status Verifikasi</th>
                <th className="p-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(p => {
                const dev = getDeviation(p, thresholdPct);
                const hasUnderstatement = dev.summaryUnderstated;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="p-3">
                      <span className="font-mono font-bold text-blue-700 block">{p.code}</span>
                      <span className="text-slate-800 font-semibold">{p.name.substring(0, 45)}...</span>
                    </td>
                    <td className="p-3 text-cyan-800 font-semibold">{p.ipa}</td>
                    <td className="p-3 font-mono font-medium">Rp {(p.contractValue / 1_000_000).toLocaleString('id-ID')} Juta</td>
                    <td className="p-3 font-mono font-bold">{dev.statedPct}%</td>
                    <td className="p-3 font-mono font-bold text-blue-800">{dev.calculatedPct}%</td>
                    <td className="p-3">
                      {dev.exceedsThreshold ? (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-100 text-rose-800">
                          &gt; Ambang ({thresholdPct}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                          Aman
                        </span>
                      )}
                      {hasUnderstatement && (
                        <span className="block text-[10px] text-amber-700 font-medium mt-0.5">
                          ⚠️ Ringkasan lebih kecil dari item (&gt;0.5%)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onOpenProjectDetail(p.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Detail
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

export default DedAnalyticsView;
