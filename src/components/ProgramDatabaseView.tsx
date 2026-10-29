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
  Sparkles,
  Droplet,
  Tag,
  Clock,
  MapPin,
  Activity,
  ShieldCheck,
  UploadCloud,
  Waves,
  Gauge,
  Filter,
  ChevronDown,
  X,
  RotateCcw,
} from 'lucide-react';
import { DocumentPackage, IPALocation } from '../types';
import { autoCategorizeIpa, ALL_IPA_LOCATIONS, IPALocationMeta } from '../utils/ipaCategorizer';
import { calculateDeadlineInfo, DeadlineUrgency } from '../utils/deadlineChecker';

interface ProgramDatabaseViewProps {
  packages: DocumentPackage[];
  activePackageId: string;
  onSelectPackage: (id: string) => void;
  onOpenUpload: () => void;
  onDownloadExcel: () => void;
  onDownloadPdf?: () => void;
  onDeletePackage: (id: string) => void;
}

export const ProgramDatabaseView: React.FC<ProgramDatabaseViewProps> = ({
  packages,
  activePackageId,
  onSelectPackage,
  onOpenUpload,
  onDownloadExcel,
  onDownloadPdf,
  onDeletePackage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIpa, setSelectedIpa] = useState<IPALocation | 'ALL'>('ALL');
  const [deadlineFilter, setDeadlineFilter] = useState<'ALL' | 'CRITICAL' | 'OVERDUE' | 'SAFE'>('ALL');
  const [showIpaDirectory, setShowIpaDirectory] = useState<boolean>(true);

  // Compute deadline info for all packages
  const packageDeadlineMap = new Map<string, ReturnType<typeof calculateDeadlineInfo>>();
  packages.forEach((pkg) => {
    packageDeadlineMap.set(pkg.id, calculateDeadlineInfo(pkg.result?.project, pkg.createdAt));
  });

  const nearDeadlineCount = Array.from(packageDeadlineMap.values()).filter((d) => d.isNearDeadline).length;
  const overdueCount = Array.from(packageDeadlineMap.values()).filter((d) => d.isOverdue).length;

  const filteredPackages = packages.filter((pkg) => {
    const q = searchQuery.toLowerCase();
    const pkgIpa = pkg.ipa || autoCategorizeIpa(pkg.projectName, pkg.result?.project?.location);
    const matchesIpa = selectedIpa === 'ALL' || pkgIpa === selectedIpa;

    const dInfo = packageDeadlineMap.get(pkg.id) || calculateDeadlineInfo(pkg.result?.project, pkg.createdAt);
    const matchesDeadline =
      deadlineFilter === 'ALL' ||
      (deadlineFilter === 'CRITICAL' && dInfo.isNearDeadline) ||
      (deadlineFilter === 'OVERDUE' && dInfo.isOverdue) ||
      (deadlineFilter === 'SAFE' && dInfo.urgency === 'SAFE');

    const matchesSearch =
      pkg.projectCode.toLowerCase().includes(q) ||
      pkg.projectName.toLowerCase().includes(q) ||
      pkg.title.toLowerCase().includes(q) ||
      pkgIpa.toLowerCase().includes(q) ||
      (pkg.result?.project?.location && pkg.result.project.location.toLowerCase().includes(q)) ||
      (pkg.result?.project?.contractor && pkg.result.project.contractor.toLowerCase().includes(q));

    return matchesIpa && matchesDeadline && matchesSearch;
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
              Semua unggahan dokumen Justifikasi Teknis, JusFin, RAB, dan Berita Acara Lapangan (MC-0, Peninjauan Lapangan, RNA, BOQ, BOM, Tes Commissioning) terhimpun secara aman dan tersinkronisasi pada 6 Instalasi Pengolahan Air (IPA) PT Air Bersih Jakarta.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onDownloadExcel}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 ring-2 ring-white/30"
              title="Unduh Kertas Kerja Excel untuk verifikasi dokumen"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Kertas Kerja Excel</span>
            </button>
            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 ring-2 ring-white/30"
                title="Unduh ringkasan hasil audit format PDF"
              >
                <FileText className="w-4 h-4" />
                <span>Unduh Laporan PDF</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0054a6] to-amber-500 hover:from-[#004690] hover:to-amber-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 ring-2 ring-white/30"
              title="Unggah pasangan dokumen proyek baru"
            >
              <Plus className="w-4 h-4 text-amber-200" />
              <span>+ Upload Pasangan Dokumen ...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats, Search & IPA Category Dropdown Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input & IPA Dropdown Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
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

          {/* DROPDOWN FILTER KATEGORI IPA */}
          <div className="relative shrink-0 min-w-[240px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 text-[#0054a6] dark:text-cyan-400">
              <Droplet className="w-4 h-4" />
            </div>
            <select
              id="select-ipa-category-toolbar"
              value={selectedIpa}
              onChange={(e) => setSelectedIpa(e.target.value as IPALocation | 'ALL')}
              aria-label="Filter Berdasarkan Kategori IPA"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border-2 border-sky-300 dark:border-sky-700 bg-sky-50/70 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0054a6] focus:border-[#0054a6] cursor-pointer appearance-none transition-colors shadow-2xs"
            >
              <option value="ALL">🌐 Semua Kategori IPA ({packages.length})</option>
              {ALL_IPA_LOCATIONS.map((ipa) => {
                const count = packages.filter(
                  (p) => (p.ipa || autoCategorizeIpa(p.projectName, p.result?.project?.location)) === ipa.id
                ).length;
                return (
                  <option key={ipa.id} value={ipa.id}>
                    💧 {ipa.name} ({ipa.code}) — {count} Program
                  </option>
                );
              })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Quick Stats badges */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-300 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0054a6]" />
            <span>Total Program: {totalPrograms}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-bold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#0054a6]" />
            <span>6 IPA Siaga</span>
          </div>
          {nearDeadlineCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold flex items-center gap-1.5 shadow-2xs animate-pulse ring-2 ring-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>⏳ {nearDeadlineCount} Dekat Deadline</span>
            </div>
          )}
          {overdueCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-extrabold flex items-center gap-1.5 shadow-2xs animate-pulse ring-2 ring-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>🚨 {overdueCount} Lewat SLA</span>
            </div>
          )}
          {totalPrograms > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sinkron: {matchCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Deadline Urgency Filter Tabs (Visible if programs exist) */}
      {totalPrograms > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Filter Pengingat Tenggat Waktu (SLA Verifikasi):</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Status Batas Waktu Berdasarkan Tanggal Verifikasi
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setDeadlineFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                deadlineFilter === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Semua Tenggat ({packages.length})
            </button>
            <button
              type="button"
              onClick={() => setDeadlineFilter('CRITICAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                deadlineFilter === 'CRITICAL'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              <span>⏳ Mendekati Deadline (H &le; 3)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono">
                {nearDeadlineCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDeadlineFilter('OVERDUE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                deadlineFilter === 'OVERDUE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              <span>🚨 Terlewat SLA</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono">
                {overdueCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDeadlineFilter('SAFE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                deadlineFilter === 'SAFE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              <span>✅ Tenggat Aman</span>
            </button>
          </div>
        </div>
      )}

      {/* 6 IPA Categorization Filter Section with Dropdown & Pills */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4.5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#0054a6] dark:text-cyan-400">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                Filter Berbasis Kategori IPA (PT Air Bersih Jakarta)
              </span>
              <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                Pilih salah satu IPA dari dropdown untuk menyaring daftar program di database
              </span>
            </div>
          </div>

          {/* Dropdown Selector Component */}
          <div className="flex items-center gap-2">
            <label htmlFor="select-ipa-category-dropdown" className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 hidden sm:inline">
              Pilih IPA:
            </label>
            <div className="relative min-w-[220px]">
              <select
                id="select-ipa-category-dropdown"
                value={selectedIpa}
                onChange={(e) => setSelectedIpa(e.target.value as IPALocation | 'ALL')}
                className="w-full pl-3 pr-8 py-1.5 rounded-xl border-2 border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0054a6] cursor-pointer appearance-none shadow-2xs"
              >
                <option value="ALL">🌐 Semua 6 IPA ({packages.length} Program)</option>
                {ALL_IPA_LOCATIONS.map((ipa) => {
                  const count = packages.filter(
                    (p) => (p.ipa || autoCategorizeIpa(p.projectName, p.result?.project?.location)) === ipa.id
                  ).length;
                  return (
                    <option key={ipa.id} value={ipa.id}>
                      💧 {ipa.name} ({ipa.code}) — {count} Program
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {selectedIpa !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedIpa('ALL')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                title="Reset filter IPA kembali ke Semua IPA"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Selection Buttons / Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedIpa('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedIpa === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Semua IPA ({packages.length})
          </button>

          {ALL_IPA_LOCATIONS.map((ipa) => {
            const count = packages.filter(
              (p) => (p.ipa || autoCategorizeIpa(p.projectName, p.result?.project?.location)) === ipa.id
            ).length;
            const isSelected = selectedIpa === ipa.id;

            return (
              <button
                key={ipa.id}
                type="button"
                onClick={() => setSelectedIpa(ipa.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0054a6] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{ipa.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Filter Indicator Banner */}
        {selectedIpa !== 'ALL' && (
          <div className="bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-xl p-2.5 px-3.5 flex items-center justify-between text-xs text-sky-900 dark:text-sky-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>
                Filter IPA Aktif: <strong>{selectedIpa}</strong> &bull; Ditemukan {filteredPackages.length} program terdaftar
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIpa('ALL')}
              className="text-xs font-bold text-[#0054a6] dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Tampilkan Semua Program</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SECTION: 6 IPA DIRECTORY SHOWCASE (Displayed when no packages are uploaded, or toggleable) */}
      {(packages.length === 0 || selectedIpa !== 'ALL' || filteredPackages.length === 0) && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-amber-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 rounded-2xl border border-sky-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#0054a6] text-white flex items-center justify-center shrink-0 shadow-md">
                <Building2 className="w-6 h-6 text-amber-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    6 Instalasi Pengolahan Air (IPA)
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Dinaungi PT Air Bersih Jakarta
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {packages.length === 0
                    ? 'Fasilitas Operasional 6 IPA Siap Menerima Unggahan Dokumen Proyek'
                    : `Direktori Fasilitas IPA PT Air Bersih Jakarta (${selectedIpa === 'ALL' ? '6 IPA Lengkap' : selectedIpa})`}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Setiap dokumen BAPL, Justifikasi Teknis, dan RAB yang diunggah ke PRIMA akan otomatis terklasifikasi ke salah satu dari 6 IPA ini sesuai wilayah dan nama program.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 hover:from-[#004690] hover:to-amber-600 shadow-md ring-2 ring-amber-400/30 transition-all cursor-pointer shrink-0"
            >
              <UploadCloud className="w-4 h-4 text-amber-200" />
              <span>+ Unggah Dokumen Program</span>
            </button>
          </div>

          {/* 6 IPA Facility Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_IPA_LOCATIONS.filter((ipa) => selectedIpa === 'ALL' || ipa.id === selectedIpa).map((ipa) => {
              const ipaPackageCount = packages.filter(
                (p) => (p.ipa || autoCategorizeIpa(p.projectName, p.result?.project?.location)) === ipa.id
              ).length;

              return (
                <div
                  key={ipa.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#0054a6] dark:hover:border-cyan-500 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Accent Top Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0054a6] via-[#009ee2] to-amber-400" />

                  <div className="space-y-3">
                    {/* Header: Name, Code & Live Status */}
                    <div className="flex items-start justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-[#0054a6] dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Droplet className="w-5 h-5 text-[#0054a6] dark:text-cyan-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#0054a6] dark:group-hover:text-cyan-400 transition-colors">
                              {ipa.name}
                            </h4>
                            <span className="font-mono text-[10px] font-black px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {ipa.code}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                            {ipa.distributionZone}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          ipaPackageCount > 0
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300'
                        }`}
                      >
                        {ipaPackageCount > 0 ? `${ipaPackageCount} Program Aktif` : 'Siap Unggah'}
                      </span>
                    </div>

                    {/* Facility Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {ipa.description}
                    </p>

                    {/* Operational Attributes Grid */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-sky-500" />
                          <span>Kapasitas Desain:</span>
                        </span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                          {ipa.capacity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Waves className="w-3 h-3 text-blue-500" />
                          <span>Sumber Air Baku:</span>
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={ipa.waterSource}>
                          {ipa.waterSource}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>Fasilitas Sistem:</span>
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={ipa.facilityType}>
                          {ipa.facilityType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action: Upload or View Program */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenUpload}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-[#0054a6] hover:text-white bg-sky-50 hover:bg-[#0054a6] border border-sky-200 dark:bg-slate-800 dark:text-cyan-300 dark:hover:bg-[#0054a6] dark:hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Unggah Dokumen untuk {ipa.name}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Program Grid for Uploaded Packages */}
      {packages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0054a6]" />
              <span>Daftar Dokumen Program Terdaftar ({filteredPackages.length} dari {totalPrograms})</span>
            </h3>
            <span className="text-xs text-slate-500">
              Menampilkan berkas verifikasi aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPackages.map((pkg) => {
              const isSelected = pkg.id === activePackageId;
              const hasMatch = pkg.result?.total_rab?.delta_match ?? true;
              const pkgIpa = pkg.ipa || autoCategorizeIpa(pkg.projectName, pkg.result?.project?.location);
              const dInfo = packageDeadlineMap.get(pkg.id) || calculateDeadlineInfo(pkg.result?.project, pkg.createdAt);

              return (
                <div
                  key={pkg.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between relative group ${
                    isSelected
                      ? 'border-[#0054a6] ring-2 ring-[#0054a6]/20 bg-sky-50/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Badges Bar: IPA, Verification, & Deadline Flag */}
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 6 IPA Auto-Categorization Badge */}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0054a6] text-white flex items-center gap-1 shadow-2xs">
                          <Droplet className="w-3 h-3 text-amber-300" />
                          <span>{pkgIpa}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {pkg.projectCode}
                        </span>
                      </div>

                      {/* Visual Deadline Urgent Flag Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 shadow-2xs ${dInfo.badgeClasses}`}
                        title={`Batas Waktu SLA: ${dInfo.deadlineDateStr}. ${dInfo.recommendation}`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{dInfo.shortBadge}</span>
                      </span>
                    </div>

                    {/* Program Title & Project Name */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0054a6] transition-colors">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {pkg.projectName}
                      </p>
                    </div>

                    {/* Meta Info: BAPL Files, Excel, Location */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-blue-500" />
                          <span>Berkas BAPL:</span>
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {pkg.baplFiles.map((f) => f.name).join(', ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                          <span>RAB Excel:</span>
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {pkg.excelFileName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Target SLA:</span>
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                          {dInfo.deadlineDateStr}
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

                    {onDeletePackage && (
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDatabaseView;
