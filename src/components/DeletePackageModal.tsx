import React from 'react';
import {
  Trash2,
  AlertTriangle,
  X,
  FileText,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { DocumentPackage } from '../types';
import { formatRupiah } from '../services/normalizer';

interface DeletePackageModalProps {
  pkg: DocumentPackage | null;
  totalPackages: number;
  onConfirmDelete: (packageId: string) => void;
  onClose: () => void;
}

export const DeletePackageModal: React.FC<DeletePackageModalProps> = ({
  pkg,
  totalPackages,
  onConfirmDelete,
  onClose,
}) => {
  if (!pkg) return null;

  const isLastPackage = totalPackages <= 1;

  return (
    <div
      id="modal-delete-package"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Paket Dokumen</h3>
              <p className="text-xs text-slate-500">Konfirmasi penghapusan paket verifikasi</p>
            </div>
          </div>
          <button
            id="btn-close-delete-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Package Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white font-mono">
              {pkg.projectCode || 'PROYEK'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ID: {pkg.id.slice(0, 14)}...
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {pkg.title}
          </h4>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{pkg.baplFiles.length} Dokumen BAPL</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">RAB &amp; Justifikasi</span>
            </div>
            <div className="col-span-2 text-[11px] text-slate-500">
              Nilai RAB Revisi: <strong className="text-slate-800 font-mono">{formatRupiah(pkg.result.total_rab.rab_revised)}</strong>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Peringatan Penghapusan:</span>
            {isLastPackage ? (
              <span>
                Ini adalah <strong>satu-satunya paket</strong> dokumen yang terdaftar. Menghapus paket ini akan mengosongkan riwayat verifikasi dan membuka kembali halaman upload dokumen baru.
              </span>
            ) : (
              <span>
                Paket ini beserta seluruh matriks verifikasi teknis dan finansialnya akan dihapus dari daftar. Sistem akan mengalihkan tampilan aktif ke paket lain yang tersedia.
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex items-center justify-end space-x-2.5">
          <button
            id="btn-cancel-delete"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            onClick={() => {
              onConfirmDelete(pkg.id);
              onClose();
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Hapus Paket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
