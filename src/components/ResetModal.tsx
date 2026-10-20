import React from 'react';
import { RotateCcw, AlertTriangle, Sparkles, Trash2, X } from 'lucide-react';

interface ResetModalProps {
  onResetToGolden: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  onResetToGolden,
  onClearAll,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reset Sistem & Dokumen</h3>
              <p className="text-xs text-slate-500">Konfirmasi pemulihan atau pembersihan data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Perhatian Auditor:</span>
            Tindakan reset akan mempengaruhi daftar pasangan dokumen dan hasil verifikasi yang sedang dibuka. Pilih salah satu opsi di bawah:
          </div>
        </div>

        <div className="space-y-3">
          {/* Option 1: Reset to Golden Case */}
          <button
            type="button"
            onClick={() => {
              onResetToGolden();
              onClose();
            }}
            className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-start space-x-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-950">
                1. Reset ke Golden Test Case 46223A
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Kembalikan sistem ke data acuan Proyek 46223A (Sistem Proteksi Petir, RAB Rp 988jt vs Rp 978jt, 5 temuan teknis & matriks lengkap).
              </p>
            </div>
          </button>

          {/* Option 2: Clear All */}
          <button
            type="button"
            onClick={() => {
              onClearAll();
              onClose();
            }}
            className="w-full text-left p-3.5 rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 transition-all flex items-start space-x-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-rose-900 block group-hover:text-rose-950">
                2. Kosongkan Semua Data &amp; Mulai dari Nol (Permanen)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Hapus seluruh riwayat pasangan dokumen secara permanen dari browser. Data yang di-reset tidak akan dimunculkan kembali saat halaman dimuat ulang.
              </p>
            </div>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
