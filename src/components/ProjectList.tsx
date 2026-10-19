import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Droplet,
  ExternalLink,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Project, IPALocation } from '../types';

interface ProjectListProps {
  projects: Project[];
  selectedIpa: IPALocation | 'ALL';
  onOpenProjectDetail: (projectId: string) => void;
  onOpenBaDetail: (baId: string) => void;
  onOpenCreateBaModal: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedIpa,
  onOpenProjectDetail,
  onOpenBaDetail,
  onOpenCreateBaModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BERJALAN' | 'MENUNGGU_JUSTIFIKASI' | 'KRITIS' | 'SELESAI'>('ALL');

  const filtered = projects.filter((p) => {
    const matchIpa = selectedIpa === 'ALL' || p.ipa === selectedIpa;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.contractorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchIpa && matchSearch && matchStatus;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari proyek, nomor kontrak, atau kontraktor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-medium">Status Proyek:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="BERJALAN">Berjalan</option>
            <option value="MENUNGGU_JUSTIFIKASI">Menunggu Justifikasi (Hold)</option>
            <option value="SELESAI">Selesai</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filtered.map((project) => {
          const justek = project.justifikasi;
          const hasJustek = !!justek;
          const isDeviasiNegative = project.progressDeviation < 0;

          return (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left Section: Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="bg-blue-50 text-blue-800 font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                      {project.code}
                    </span>
                    <span className="font-semibold text-cyan-800 flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5" />
                      {project.ipa}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500">Kontraktor: <strong className="text-slate-700">{project.contractorName}</strong></span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500">Supervisi: <strong className="text-slate-700">{project.supervisingConsultant}</strong></span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer"
                      onClick={() => onOpenProjectDetail(project.id)}>
                    {project.name}
                  </h3>

                  {/* Financial & Physical Progress Mini-metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Nilai Kontrak Awal</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{formatRupiah(project.contractValue)}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Realisasi Keuangan</span>
                      <span className="font-bold text-emerald-700 mt-0.5 block">
                        {formatRupiah(project.realizationValue)} ({project.realizationPercentage}%)
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Progres Fisik</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-bold text-slate-900">{project.progressPhysicalActual}%</span>
                        <span className={`text-[10px] font-semibold ${isDeviasiNegative ? 'text-red-600' : 'text-emerald-600'}`}>
                          ({isDeviasiNegative ? '' : '+'}{project.progressDeviation}%)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Deviasi Jusfin (Adendum)</span>
                      <span className={`font-bold mt-0.5 block ${
                        project.justificationDelta > 0 ? 'text-amber-700' : project.justificationDelta < 0 ? 'text-blue-700' : 'text-slate-500'
                      }`}>
                        {project.justificationDelta > 0 ? `+${formatRupiah(project.justificationDelta)}` : project.justificationDelta < 0 ? formatRupiah(project.justificationDelta) : 'Rp 0'}
                      </span>
                    </div>
                  </div>

                  {/* Berita Acara Chips */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                    <span className="text-slate-500 font-medium">Digital Berita Acara ({project.beritaAcaraList.length}):</span>
                    {project.beritaAcaraList.map(ba => (
                      <button
                        key={ba.id}
                        onClick={() => onOpenBaDetail(ba.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3 text-cyan-600" />
                        <span>{ba.baType}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => onOpenCreateBaModal(project.id)}
                      className="text-blue-700 hover:text-blue-900 text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      + Tambah BA
                    </button>
                  </div>
                </div>

                {/* Right Section: Justek Status & Main Button */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 lg:w-56 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {hasJustek ? (
                    <div className="lg:text-right space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
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
                      <div className="text-[11px] text-slate-500 flex items-center lg:justify-end gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tahap {justek.currentApprovalStage} dari 5</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Belum Ada Justifikasi</span>
                  )}

                  <button
                    onClick={() => onOpenProjectDetail(project.id)}
                    className="w-full sm:w-auto lg:w-full px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Lihat Justek & Finansial</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
