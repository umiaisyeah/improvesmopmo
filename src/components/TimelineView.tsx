import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Droplet,
  ExternalLink
} from 'lucide-react';
import { Project, IPALocation } from '../types';

interface TimelineViewProps {
  projects: Project[];
  selectedIpa: IPALocation | 'ALL';
  onOpenProjectDetail: (projectId: string) => void;
  onOpenBaDetail: (baId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  projects,
  selectedIpa,
  onOpenProjectDetail,
  onOpenBaDetail,
}) => {
  const filtered = selectedIpa === 'ALL'
    ? projects
    : projects.filter(p => p.ipa === selectedIpa);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Monitoring Timeline Pengerjaan & Milestone Berita Acara
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Visualisasi komparasi jadwal baseline DED vs revisi target akibat Justifikasi Teknis serta pemetaan tanggal realisasi Berita Acara (MC-0, Lapangan, Komisioning, MC-100).
          </p>
        </div>
      </div>

      {/* Projects Timeline Cards */}
      <div className="space-y-4">
        {filtered.map((project) => {
          const hasRevisedEnd = !!project.revisedEndDate;
          const isDeviasiLag = project.progressDeviation < 0;

          return (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
            >
              {/* Project Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {project.code}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{project.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="text-cyan-800 font-semibold">{project.ipa}</span>
                      <span>&bull;</span>
                      <span>Kontraktor: {project.contractorName}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenProjectDetail(project.id)}
                  className="self-start sm:self-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Justek</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress and Schedule Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Physical Progress */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold">Progres Fisik Riil vs Rencana:</span>
                    <span className={`font-bold ${isDeviasiLag ? 'text-red-600' : 'text-emerald-600'}`}>
                      Deviasi: {isDeviasiLag ? '' : '+'}{project.progressDeviation}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, project.progressPhysicalActual)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Realisasi: <strong>{project.progressPhysicalActual}%</strong></span>
                    <span>Rencana Awal DED: <strong>{project.progressPhysicalPlanned}%</strong></span>
                  </div>
                </div>

                {/* DED Baseline Schedule */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 uppercase tracking-wide text-[10px] font-bold block">
                    Jadwal Baseline DED Kontrak
                  </span>
                  <div className="text-slate-900 font-bold font-mono text-xs">
                    {project.startDate} s/d {project.endDate}
                  </div>
                  <span className="text-[11px] text-slate-500 block">Masa Pelaksanaan Kontrak Awal</span>
                </div>

                {/* Revised Schedule if any */}
                <div className={`p-3 rounded-lg border space-y-1 ${
                  hasRevisedEnd ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={`uppercase tracking-wide text-[10px] font-bold block ${
                    hasRevisedEnd ? 'text-amber-800' : 'text-slate-500'
                  }`}>
                    Target Selesai Pasca Justifikasi Teknis
                  </span>
                  <div className="font-bold font-mono text-xs text-slate-900">
                    {hasRevisedEnd ? project.revisedEndDate : 'Tidak Ada Perubahan Waktu'}
                  </div>
                  {hasRevisedEnd && (
                    <span className="text-[11px] text-amber-700 block font-medium">
                      + Kompensasi deviasi utilitas bawah tanah
                    </span>
                  )}
                </div>
              </div>

              {/* Milestones from Berita Acara Timeline */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  Rantai Milestone Berita Acara Terbit:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {(['MC-0', 'Peninjauan Lapangan', 'Tes Komisioning', 'MC-100'] as const).map((type) => {
                    const ba = project.beritaAcaraList.find(b => b.baType === type);

                    return (
                      <div
                        key={type}
                        onClick={() => ba && onOpenBaDetail(ba.id)}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          ba
                            ? 'bg-blue-50/50 border-blue-200 hover:border-blue-400 cursor-pointer shadow-2xs'
                            : 'bg-slate-50 border-dashed border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{type}</span>
                          {ba ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-300" />
                          )}
                        </div>

                        {ba ? (
                          <div className="mt-2 space-y-0.5">
                            <div className="font-mono text-[10px] text-slate-500">{ba.date}</div>
                            <div className="text-[11px] font-semibold text-slate-700 truncate">{ba.baNumber}</div>
                            <div className="text-[10px] text-blue-700 font-medium">Klik untuk lihat &rarr;</div>
                          </div>
                        ) : (
                          <div className="mt-2 text-[11px] text-slate-400 italic">
                            Belum diterbitkan
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
