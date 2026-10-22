import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  ArrowRight, 
  Trash2, 
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { DocumentPackage } from '../types';

interface ProgramDatabaseViewProps {
  packages: DocumentPackage[];
  activePackageId: string;
  onSelectPackage: (id: string) => void;
  onOpenUpload: () => void;
  onDeletePackage: (id: string) => void;
}

export const ProgramDatabaseView: React.FC<ProgramDatabaseViewProps> = ({
  packages,
  activePackageId,
  onSelectPackage,
  onOpenUpload,
  onDeletePackage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPackages = packages.filter((pkg) => {
    const q = searchQuery.toLowerCase();
    return (
      pkg.projectCode.toLowerCase().includes(q) ||
      pkg.projectName.toLowerCase().includes(q) ||
      pkg.title.toLowerCase().includes(q) ||
      (pkg.result?.project?.location && pkg.result.project.location.toLowerCase().includes(q)) ||
      (pkg.result?.project?.contractor && pkg.result.project.contractor.toLowerCase().includes(q))
    );
  });

  const totalPrograms = packages.length;
  const matchCount = packages.filter((p) => p.result?.total_rab?.delta_match).length;
  const mismatchCount = totalPrograms - matchCount;

  return (
    <div className="space-y-6">
      {/* Hero Banner for Program Database */}
      <div className="bg-gradient-to-r from-[#002b5b] via-[#0054a6] to-[#f59e0b] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-xs transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>Database Program &amp; Dokumen Siklis PMO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pusat Himpunan Data Program 6 IPA
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Semua unggahan dokumen Justifikasi Teknis, JusFin, RAB, dan Berita Acara Lapangan (MC-0, Peninjauan Lapangan, RNA, BOQ, BOM, Tes Commissioning) terhimpun secara aman dan tersinkronisasi di sini.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 ring-2 ring-white/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ Unggah Program / Dokumen Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan kode proyek, nama program, lokasi/IPA, atau kontraktor..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0054a6]"
          />
        </div>

        {/* Quick Stats badges */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-300 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0054a6]" />
            <span>Total Program: {totalPrograms}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sinkron: {matchCount}</span>
          </div>
          {mismatchCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Ada Selisih: {mismatchCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Program Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPackages.map((pkg) => {
          const isSelected = pkg.id === activePackageId;
          const hasMatch = pkg.result?.total_rab?.delta_match ?? true;
          const changeCount = pkg.result?.changes?.length || 0;
          const locationName = pkg.result?.project?.location || 'IPA Jakarta';
          const contractor = pkg.result?.project?.contractor || 'Kontraktor Mitra';

          return (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-xs hover:shadow-md relative group ${
                isSelected
                  ? 'border-[#0054a6] ring-2 ring-[#0054a6]/30 dark:border-cyan-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-sky-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-[#0054a6] dark:text-cyan-300 border border-sky-200 dark:border-sky-800">
                    {pkg.projectCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hasMatch ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                        Sinkron
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200">
                        Ada Selisih
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#0054a6] dark:group-hover:text-cyan-400 transition-colors">
                    {pkg.projectName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{locationName} &bull; {contractor}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Item JusTek</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{changeCount} Perubahan</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Upload</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(pkg.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectPackage(pkg.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0054a6] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#0054a6] hover:text-white'
                  }`}
                >
                  <span>{isSelected ? 'Sedang Ditinjau' : 'Buka Dashboard Program'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {packages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeletePackage(pkg.id)}
                    title="Hapus Program dari Database"
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredPackages.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8">
            <Database className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h4 className="text-lg font-black text-slate-700 dark:text-slate-200">Database PRIMA Masih Kosong</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              Belum ada program atau dokumen yang diunggah ke dalam database. Mulailah dengan mengunggah pasangan dokumen proyek baru untuk mengisi database PRIMA.
            </p>
            <button
              type="button"
              onClick={onOpenUpload}
              className="mt-6 px-6 py-3 rounded-2xl bg-[#0054a6] hover:bg-[#004690] text-white font-bold text-sm shadow-lg flex items-center gap-2 mx-auto transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Dokumen Pertama</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramDatabaseView;
