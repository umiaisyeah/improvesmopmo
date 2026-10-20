import React, { useState, useRef } from 'react';
import {
  Layers,
  FileText,
  FileSpreadsheet,
  Files,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  FolderSync,
  Pencil,
  Check,
  X,
  Database,
  UploadCloud,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import { DocumentPackage } from '../types';
import { downloadVerificationExcel } from '../services/excelGenerator';

interface DocumentPackageBarProps {
  packages: DocumentPackage[];
  activePackageId: string;
  onSelectPackage: (packageId: string) => void;
  onDeletePackage: (packageId: string) => void;
  onAddNewPackage: () => void;
  onRequestDeletePackage?: (pkg: DocumentPackage) => void;
  onRenamePackage?: (packageId: string, newTitle: string) => void;
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => void;
  onOpenGoogleDrive?: () => void;
  isGoogleDriveConnected?: boolean;
}

export const DocumentPackageBar: React.FC<DocumentPackageBarProps> = ({
  packages,
  activePackageId,
  onSelectPackage,
  onDeletePackage,
  onAddNewPackage,
  onRequestDeletePackage,
  onRenamePackage,
  onExportBackup,
  onImportBackup,
  onOpenGoogleDrive,
  isGoogleDriveConnected,
}) => {
  const [expandedDetails, setExpandedDetails] = useState<boolean>(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>('');
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleStartRename = (pkg: DocumentPackage, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPackageId(pkg.id);
    setEditTitleValue(pkg.title);
  };

  const handleSaveRename = (pkgId: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editTitleValue.trim() && onRenamePackage) {
      onRenamePackage(pkgId, editTitleValue.trim());
    }
    setEditingPackageId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPackageId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportBackup) {
      onImportBackup(file);
    }
    // reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const activePackage =
    packages.find((p) => p.id === activePackageId) || packages[0];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FolderSync className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Daftar Pasangan Dokumen Terverifikasi
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                {packages.length} Pasangan Terdaftar
              </span>
              <span
                title="Semua paket dokumen yang Anda unggah tersimpan permanen di memori browser (IndexedDB) dan tidak akan hilang saat aplikasi ditutup/direfresh."
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Penyimpanan Permanen Aktif</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Setiap pasangan dokumen tersimpan permanen di memori database browser dan menetap sampai Anda menghapusnya sendiri.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input for JSON Backup Import */}
          <input
            type="file"
            ref={importFileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          {onExportBackup && packages.length > 0 && (
            <button
              id="btn-export-packages-backup"
              type="button"
              onClick={onExportBackup}
              title="Cadangkan seluruh paket yang terdaftar ke file JSON di komputer Anda"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Cadangkan (JSON)</span>
            </button>
          )}

          {onImportBackup && (
            <button
              id="btn-import-packages-backup"
              type="button"
              onClick={() => importFileInputRef.current?.click()}
              title="Pulihkan paket dokumen dari file cadangan JSON"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>Pulihkan (JSON)</span>
            </button>
          )}

          {onOpenGoogleDrive && (
            <button
              id="btn-packagebar-google-drive"
              type="button"
              onClick={onOpenGoogleDrive}
              title="Kelola sinkronisasi Google Drive untuk paket dokumen"
              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isGoogleDriveConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${isGoogleDriveConnected ? 'text-emerald-600' : 'text-blue-600'}`} />
              <span>{isGoogleDriveConnected ? 'Google Drive Aktif' : 'Google Drive'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpandedDetails(!expandedDetails)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <span>Rincian File</span>
            {expandedDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            id="btn-add-new-package"
            type="button"
            onClick={onAddNewPackage}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Upload Pasangan Baru</span>
          </button>
        </div>
      </div>

      {/* Package Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {packages.map((pkg, idx) => {
          const isActive = pkg.id === activePackageId;
          const deltaPct = pkg.result.total_rab.system_calculated_percentage * 100;
          const withinThreshold = !pkg.result.total_rab.threshold_exceeded;

          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(pkg.id)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between relative group ${
                isActive
                  ? 'border-blue-600 bg-blue-50/20 shadow-xs ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
              }`}
            >
              <div>
                {/* Status & Package Label */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Program {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {pkg.projectCode || 'PROYEK'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {withinThreshold ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        10% OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        &gt; 10%
                      </span>
                    )}

                    {/* Delete button (accessible for any package) */}
                    <button
                      id={`btn-delete-pkg-${pkg.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRequestDeletePackage) {
                          onRequestDeletePackage(pkg);
                        } else {
                          onDeletePackage(pkg.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title={`Hapus paket ${pkg.projectCode || ''}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & In-place Rename */}
                {editingPackageId === pkg.id ? (
                  <div
                    className="mb-2 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      id={`input-rename-pkg-${pkg.id}`}
                      type="text"
                      value={editTitleValue}
                      onChange={(e) => setEditTitleValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(pkg.id, e);
                        if (e.key === 'Escape') handleCancelRename(e as any);
                      }}
                      autoFocus
                      className="w-full text-xs font-semibold px-2 py-1 rounded border border-blue-500 bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleSaveRename(pkg.id, e)}
                      className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      title="Simpan Nama Paket"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                      title="Batal"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1 mb-2 group/title">
                    <h3
                      className={`text-xs font-bold truncate flex-1 ${
                        isActive ? 'text-blue-950' : 'text-slate-800'
                      }`}
                      title={pkg.title}
                    >
                      {pkg.title}
                    </h3>
                    <button
                      id={`btn-edit-title-pkg-${pkg.id}`}
                      type="button"
                      onClick={(e) => handleStartRename(pkg, e)}
                      className="opacity-0 group-hover/title:opacity-100 p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-opacity"
                      title="Ubah Nama / Label Paket Ini"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Composition badges: BAPL, Excel, Pendukung */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] mb-3">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                    <FileText className="w-3 h-3" />
                    {pkg.baplFiles.length} BAPL
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    <FileSpreadsheet className="w-3 h-3" />
                    JusTek &amp; JusFin
                  </span>
                  {pkg.supportingFiles.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                      <Files className="w-3 h-3" />
                      {pkg.supportingFiles.length} Pendukung
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Financial Delta & Select/Download Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    RAB Revisi &amp; Delta
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {formatRupiah(pkg.result.total_rab.rab_revised)}
                    <span
                      className={`ml-1 text-[10px] font-semibold ${
                        pkg.result.total_rab.system_calculated_delta < 0
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      ({deltaPct >= 0 ? `+${deltaPct.toFixed(2)}%` : `${deltaPct.toFixed(2)}%`})
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    id={`btn-delete-card-action-${pkg.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRequestDeletePackage) {
                        onRequestDeletePackage(pkg);
                      } else {
                        onDeletePackage(pkg.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                    title="Hapus paket dokumen ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadVerificationExcel(pkg.result);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors"
                    title="Download Excel 9 Sheets untuk paket ini"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPackage(pkg.id);
                    }}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isActive ? 'Aktif' : 'Buka'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Details: File Breakdown for Active Package */}
      {expandedDetails && activePackage && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-150 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Rincian File dalam {activePackage.title}
            </span>
            <div className="flex items-center space-x-2.5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Diproses: {new Date(activePackage.createdAt).toLocaleString('id-ID')}
              </span>
              <button
                id="btn-delete-active-pkg-details"
                type="button"
                onClick={() => {
                  if (onRequestDeletePackage) {
                    onRequestDeletePackage(activePackage);
                  } else {
                    onDeletePackage(activePackage.id);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                title="Hapus paket dokumen yang sedang aktif"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Hapus Paket Ini</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* BAPL Files */}
            <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Dokumen BAPL ({activePackage.baplFiles.length})
              </span>
              <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {activePackage.baplFiles.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-[11px] text-slate-700 font-mono truncate"
                  >
                    <span className="truncate">📄 {f.name}</span>
                    <span className="text-slate-400 shrink-0 ml-1">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Excel / PDF Project Files */}
            <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Berkas JusTek, JusFin &amp; RAB ({activePackage.projectFiles?.length || (activePackage.excelFileName ? 1 : 0)})
              </span>
              {activePackage.projectFiles && activePackage.projectFiles.length > 0 ? (
                <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {activePackage.projectFiles.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-[11px] text-slate-700 font-mono truncate"
                    >
                      <span className="truncate">
                        {f.type === 'PDF' || f.name.endsWith('.pdf') ? '📕' : '📊'} {f.name}
                      </span>
                      <span className="text-slate-400 shrink-0 ml-1">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-700 font-mono truncate">
                  📊 {activePackage.excelFileName || 'Ekstraksi Otomatis Dokumen BAPL'}
                </p>
              )}
              <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                <p>• RAB Awal: {formatRupiah(activePackage.result.total_rab.rab_initial)}</p>
                <p>• RAB Revisi: {formatRupiah(activePackage.result.total_rab.rab_revised)}</p>
                <p>• Rekap Justifikasi Teknis &amp; Finansial terintegrasi</p>
              </div>
            </div>

            {/* Supporting Files */}
            <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
                Dokumen Pendukung ({activePackage.supportingFiles.length})
              </span>
              {activePackage.supportingFiles.length > 0 ? (
                <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {activePackage.supportingFiles.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-[11px] text-slate-700 font-mono truncate"
                    >
                      <span className="truncate">📎 {f.name}</span>
                      <span className="text-slate-400 shrink-0 ml-1">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Tidak ada dokumen pendukung tambahan.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
