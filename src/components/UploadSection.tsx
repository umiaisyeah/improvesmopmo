import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Files,
  X,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  Plus,
  Layers,
  FolderSync,
  FileCheck,
  FileCode,
  ShieldCheck,
  Zap,
  Droplets,
  Building2,
  Cog,
  Radio,
  Package,
} from 'lucide-react';
import { downloadSampleProjectExcel } from '../services/templateGenerator';
import { ProgramDomain } from '../types';
import { PROGRAM_PROFILES } from '../config/programProfiles';

interface UploadSectionProps {
  onRunVerification: (
    baplFiles: File[],
    justekFiles: File[],
    excelFiles: File[],
    supportingFiles: File[],
    packageName?: string
  ) => void;
  onLoadGoldenCase: () => void;
  isProcessing: boolean;
  onClose?: () => void;
  existingPackageCount?: number;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onRunVerification,
  onLoadGoldenCase,
  isProcessing,
  onClose,
  existingPackageCount = 1,
}) => {
  const [baplFiles, setBaplFiles] = useState<File[]>([]);
  const [justekFiles, setJustekFiles] = useState<File[]>([]);
  const [excelFiles, setExcelFiles] = useState<File[]>([]);
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const [packageName, setPackageName] = useState<string>(
    `Program ${existingPackageCount + 1}`
  );
  const [dragActive, setDragActive] = useState<'bapl' | 'justek' | 'excel' | 'support' | null>(null);

  const baplInputRef = useRef<HTMLInputElement>(null);
  const justekInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const supportInputRef = useRef<HTMLInputElement>(null);

  // Slot 1: BAPL Files (PDF / Scan)
  const handleAddBaplFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setBaplFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...(filtered.length > 0 ? filtered : newFiles)];
    });
  };
  const removeBaplFile = (index: number) => {
    setBaplFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Slot 2: JusTek Files (PDF)
  const handleAddJustekFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setJustekFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...(filtered.length > 0 ? filtered : newFiles)];
    });
  };
  const removeJustekFile = (index: number) => {
    setJustekFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Slot 3: Excel Files (JusFin & RAB)
  const handleAddExcelFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setExcelFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prev, ...(filtered.length > 0 ? filtered : newFiles)];
    });
  };
  const removeExcelFile = (index: number) => {
    setExcelFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Slot 4: Supporting Files (MC-0 / DED / Lampiran)
  const handleSupportFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    setSupportingFiles((prev) => [...prev, ...list]);
  };
  const removeSupportFile = (index: number) => {
    setSupportingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRun = () => {
    onRunVerification(baplFiles, justekFiles, excelFiles, supportingFiles, packageName.trim());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isExcel = (name: string) => /\.(xlsx|xls|csv)$/i.test(name);
  const isPdf = (name: string) => /\.pdf$/i.test(name);
  const isWord = (name: string) => /\.(docx|doc)$/i.test(name);

  return (
    <div className="bg-slate-50 border-b border-slate-200 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Quick Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <FolderSync className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Verifikasi Pasangan Dokumen &amp; Rekonsiliasi Perubahan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah berkas sesuai slot spesifik di bawah untuk audit menyeluruh: BAPL (PDF), Justek (PDF), File Excel JusFin/RAB, dan Dokumen Pendukung (MC-0/DED).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-quick-golden"
              type="button"
              onClick={onLoadGoldenCase}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Gunakan Data Test 46223A</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                title="Tutup Panel Upload"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Package Title / Identifier Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            Nama / Label Pasangan Dokumen:
          </label>
          <div className="flex-1 relative flex items-center">
            <input
              id="input-package-name"
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder={`Contoh: Program ${existingPackageCount + 1}: Proyek 46308 - Rehabilitasi Backwash & Pompa`}
              className="w-full pl-3 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-semibold transition-all"
            />
            {packageName && (
              <button
                type="button"
                onClick={() => setPackageName('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Kosongkan nama paket"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-400 hidden lg:inline whitespace-nowrap">
            Tersimpan independen untuk setiap paket
          </span>
        </div>

        {/* Program Domain & Clear Boundary Shield Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-4 shadow-xs border border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  Sistem Adaptif Multi-Program &amp; Batasan Disiplin Ketat
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Isolasi Anti-Tercampur Aktif
                  </span>
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Engine secara dinamis membatasi pencarian: nilai ohm/uji kelistrikan tidak akan dikutip untuk dimensi tiang/pipa fisik; uji hidrostatis valve tidak akan tertukar dengan item sipil.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Siap untuk Semua Jenis Program</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mr-1">Domain Program:</span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-teal-300 border border-teal-500/40 flex items-center gap-1">
              🌐 Universal Multi-Disiplin
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] text-amber-300 bg-amber-950/50 border border-amber-500/30 flex items-center gap-1">
              ⚡ Elektrikal &amp; Grounding
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] text-blue-300 bg-blue-950/50 border border-blue-500/30 flex items-center gap-1">
              💧 Pemipaan &amp; Valve WTP
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 flex items-center gap-1">
              🏗️ Sipil &amp; Struktur Beton
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 flex items-center gap-1">
              ⚙️ Mekanikal &amp; HVAC
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] text-indigo-300 bg-indigo-950/50 border border-indigo-500/30 flex items-center gap-1">
              📡 SCADA &amp; Instrumentasi
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] text-purple-300 bg-purple-950/50 border border-purple-500/30 flex items-center gap-1">
              📦 Pengadaan Umum
            </span>
          </div>
        </div>

        {/* 4 Dedicated Upload Dropzones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SLOT 1: Dokumen Pembuktian Lapangan & Fisik (BAPL, FAT, Back Up Volume) */}
          <div
            className={`border-2 border-dashed rounded-xl p-4 transition-all bg-white flex flex-col justify-between ${
              dragActive === 'bapl'
                ? 'border-blue-500 bg-blue-50/50'
                : baplFiles.length > 0
                ? 'border-blue-400 bg-blue-50/10'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive('bapl');
            }}
            onDragLeave={() => setDragActive(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(null);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleAddBaplFiles(e.dataTransfer.files);
              }
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  1. Dokumen Bukti (BAPL, FAT, Volume)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {baplFiles.length > 0 ? `${baplFiles.length} Berkas` : 'BAPL / FAT / Vol'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Unggah seluruh berkas pembuktian fisik &amp; lapangan: <strong>BAPL</strong>, <strong>FAT (Pabrik)</strong>, <strong>Back Up Volume</strong>, dan <strong>Laporan Uji Teknis</strong> (.pdf, .xlsx, scan).
              </p>

              {baplFiles.length > 0 ? (
                <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
                  {baplFiles.map((file, idx) => {
                    const nameLower = file.name.toLowerCase();
                    let badgeLabel = 'BAPL Lapangan';
                    let badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                    if (nameLower.includes('fat')) {
                      badgeLabel = 'FAT (Pabrik)';
                      badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
                    } else if (nameLower.includes('volume') || nameLower.includes('backup') || nameLower.includes('back_up') || nameLower.includes('opname')) {
                      badgeLabel = 'Back Up Volume';
                      badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                    } else if (nameLower.includes('test') || nameLower.includes('uji') || nameLower.includes('commissioning')) {
                      badgeLabel = 'Uji Teknis';
                      badgeClass = 'bg-purple-100 text-purple-900 border-purple-300';
                    }

                    return (
                      <div
                        key={idx}
                        className="bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between text-xs transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-5 h-5 rounded bg-blue-200 text-blue-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-blue-950 truncate text-[11px]">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${badgeClass}`}>
                                {badgeLabel}
                              </span>
                              <span className="text-[10px] text-blue-700">
                                • {formatFileSize(file.size)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBaplFile(idx)}
                          className="p-1 hover:text-rose-600 text-slate-400 shrink-0 cursor-pointer"
                          title="Hapus berkas ini"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => baplInputRef.current?.click()}
                  className="cursor-pointer text-center py-6 px-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                  <UploadCloud className="w-7 h-7 text-blue-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Pilih Dokumen Bukti (BAPL, FAT, Volume)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Format PDF, Excel (.xlsx), atau Gambar Scan</p>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => baplInputRef.current?.click()}
                className="text-[11px] text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Bukti (BAPL/FAT/Volume)</span>
              </button>
              {baplFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBaplFiles([])}
                  className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            <input
              ref={baplInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => handleAddBaplFiles(e.target.files)}
            />
          </div>

          {/* SLOT 2: Dokumen JusTek (PDF / Excel) */}
          <div
            className={`border-2 border-dashed rounded-xl p-4 transition-all bg-white flex flex-col justify-between ${
              dragActive === 'justek'
                ? 'border-indigo-500 bg-indigo-50/50'
                : justekFiles.length > 0
                ? 'border-indigo-400 bg-indigo-50/10'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive('justek');
            }}
            onDragLeave={() => setDragActive(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(null);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleAddJustekFiles(e.dataTransfer.files);
              }
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  2. Dokumen JusTek (PDF / Excel)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {justekFiles.length > 0 ? `${justekFiles.length} Berkas` : 'PDF / Excel'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Dokumen Justifikasi Teknis format <strong>PDF</strong> atau file <strong>Excel</strong> terpisah, berisi latar belakang, tinjauan teknik, dan spesifikasi usulan fungsi pengganti.
              </p>

              {justekFiles.length > 0 ? (
                <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
                  {justekFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-2.5 flex items-center justify-between text-xs transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className={`w-5 h-5 rounded font-bold text-[10px] flex items-center justify-center shrink-0 ${
                          isPdf(file.name)
                            ? 'bg-indigo-200 text-indigo-900'
                            : isWord(file.name)
                            ? 'bg-blue-200 text-blue-900'
                            : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {isPdf(file.name) ? 'PDF' : isWord(file.name) ? 'DOC' : isExcel(file.name) ? 'XLS' : idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-indigo-950 truncate text-[11px]">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-indigo-700">
                            {formatFileSize(file.size)} • {isPdf(file.name) ? 'PDF Justifikasi Teknis' : isWord(file.name) ? 'Word Justifikasi Teknis' : isExcel(file.name) ? 'Excel Justifikasi Teknis' : 'Dokumen JusTek'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeJustekFile(idx)}
                        className="p-1 hover:text-rose-600 text-slate-400 shrink-0 cursor-pointer"
                        title="Hapus berkas ini"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => justekInputRef.current?.click()}
                  className="cursor-pointer text-center py-6 px-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                  <UploadCloud className="w-7 h-7 text-indigo-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Pilih JusTek (PDF / Excel)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Format .pdf, .xlsx, .xls, .docx</p>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => justekInputRef.current?.click()}
                className="text-[11px] text-indigo-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah JusTek</span>
              </button>
              {justekFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setJustekFiles([])}
                  className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            <input
              ref={justekInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.docx,.txt"
              className="hidden"
              onChange={(e) => handleAddJustekFiles(e.target.files)}
            />
          </div>

          {/* SLOT 3: File Excel (JusFin, JusTek & RAB / Multi-Sheet Gabungan) */}
          <div
            className={`border-2 border-dashed rounded-xl p-4 transition-all bg-white flex flex-col justify-between ${
              dragActive === 'excel'
                ? 'border-emerald-500 bg-emerald-50/50'
                : excelFiles.length > 0
                ? 'border-emerald-400 bg-emerald-50/20'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive('excel');
            }}
            onDragLeave={() => setDragActive(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(null);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleAddExcelFiles(e.dataTransfer.files);
              }
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  3. File Excel (JusFin, JusTek &amp; RAB)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {excelFiles.length > 0 ? `${excelFiles.length} Excel` : 'Excel / Multi-Sheet'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Workbook Excel memuat Sheet JusFin, Sheet RAB Semula vs Usulan, dan Sheet JusTek (bila JusTek &amp; JusFin digabung 1 file).
              </p>
              <div className="mb-3 px-2 py-1.5 rounded bg-emerald-50/60 border border-emerald-200/60 text-[10px] text-emerald-800">
                💡 <em>Bisa upload 1 file Excel gabungan (JusFin + JusTek + RAB) atau multi-file Excel terpisah.</em>
              </div>

              {excelFiles.length > 0 ? (
                <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
                  {excelFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className={`w-5 h-5 rounded font-bold text-[10px] flex items-center justify-center shrink-0 ${
                          isPdf(file.name) ? 'bg-indigo-100 text-indigo-900' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {isPdf(file.name) ? 'PDF' : 'XLS'}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-emerald-950 truncate text-[11px]">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-emerald-700">
                            {formatFileSize(file.size)} • Sheet JusFin, JusTek &amp; RAB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExcelFile(idx)}
                        className="p-1 hover:text-rose-600 text-slate-400 shrink-0 cursor-pointer"
                        title="Hapus berkas ini"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => excelInputRef.current?.click()}
                  className="cursor-pointer text-center py-6 px-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                  <UploadCloud className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Pilih File Excel (JusFin/JusTek/RAB)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Format .xlsx, .xls, .csv, atau .pdf</p>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => excelInputRef.current?.click()}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Excel</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSampleProjectExcel();
                  }}
                  className="text-[10px] text-slate-500 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Template Excel
                </button>
              </div>

              {excelFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExcelFiles([])}
                  className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            <input
              ref={excelInputRef}
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.pdf"
              className="hidden"
              onChange={(e) => handleAddExcelFiles(e.target.files)}
            />
          </div>

          {/* SLOT 4: Dokumen Pendukung (DED, MC-0, & Lampiran Lain) */}
          <div
            className={`border-2 border-dashed rounded-xl p-4 transition-all bg-white flex flex-col justify-between ${
              dragActive === 'support'
                ? 'border-purple-500 bg-purple-50/50'
                : supportingFiles.length > 0
                ? 'border-purple-400 bg-purple-50/20'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive('support');
            }}
            onDragLeave={() => setDragActive(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(null);
              handleSupportFiles(e.dataTransfer.files);
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Files className="w-4 h-4 text-purple-600" />
                  4. Dokumen Pendukung (DED / MC-0)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  {supportingFiles.length > 0 ? `${supportingFiles.length} File` : 'Opsional'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Dokumen MC-0, Gambar DED/As-built, Laporan Uji Teknis, Surat Permohonan, atau Lampiran Lainnya.
              </p>

              {supportingFiles.length > 0 ? (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {supportingFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-50 border border-purple-200 rounded-lg p-2 flex items-center justify-between text-[11px]"
                    >
                      <span className="truncate font-medium text-purple-900">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSupportFile(idx)}
                        className="hover:text-rose-600 text-slate-400 p-0.5 cursor-pointer"
                        title="Hapus berkas ini"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => supportInputRef.current?.click()}
                  className="cursor-pointer text-center py-6 px-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                  <UploadCloud className="w-7 h-7 text-purple-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Pilih Dokumen Pendukung</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mendukung PDF, DWG, Gambar</p>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => supportInputRef.current?.click()}
                className="text-[11px] text-purple-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pendukung</span>
              </button>
              {supportingFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSupportingFiles([])}
                  className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            <input
              ref={supportInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.dwg,.xlsx,.xls,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => handleSupportFiles(e.target.files)}
            />
          </div>
        </div>

        {/* Verification Trigger & Document Pairing Review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Rincian Pasangan Dokumen Lengkap
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {packageName || 'Paket Dokumen Baru'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  {baplFiles.length > 0 ? `${baplFiles.length} Dokumen BAPL (PDF)` : 'BAPL Standar/Test'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
                  <FileCheck className="w-3.5 h-3.5" />
                  {justekFiles.length > 0 ? `${justekFiles.length} Dokumen JusTek (PDF/XLS)` : 'JusTek Standar/Test'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  {excelFiles.length > 0 ? `${excelFiles.length} File Excel JusFin/JusTek/RAB` : 'Excel Standar/Test'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                  <Files className="w-3.5 h-3.5" />
                  {supportingFiles.length} Dokumen Pendukung (MC-0/DED)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                * Sistem akan menganalisis keseluruhan isi setiap berkas, merekonsiliasi perubahan jenis pekerjaan, perubahan kuantitas, perubahan harga, dan memverifikasi kesesuaian fakta BAPL/MC-0 ke dalam JusTek dan JusFin.
              </p>
            </div>

            <button
              id="btn-run-verification"
              type="button"
              onClick={handleRun}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-sm transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              <span>Kaji &amp; Verifikasi Menyeluruh Pasangan Dokumen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
