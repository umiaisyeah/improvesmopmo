import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { HumanReview } from '../types';

interface HumanReviewModalProps {
  initialReview: HumanReview;
  onSave: (review: HumanReview) => void;
  onClose: () => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  initialReview,
  onSave,
  onClose,
}) => {
  const [status, setStatus] = useState(initialReview.pmo_review_status);
  const [auditorName, setAuditorName] = useState(initialReview.reviewed_by || 'Tim Auditor PMO');
  const [comments, setComments] = useState(initialReview.pmo_comments || '');
  const [decision, setDecision] = useState(initialReview.final_decision || 'PENDING AUDIT');

  const handleSave = () => {
    onSave({
      pmo_review_status: status,
      reviewed_by: auditorName,
      pmo_comments: comments,
      final_decision: decision,
      review_date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">PMO Auditor Sign-Off & Review</h3>
              <p className="text-xs text-slate-500">Lembar Pengesahan Audit dan Keputusan Amandemen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 py-4 text-xs">
          {/* Status Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Keputusan Status Audit</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatus('APPROVED');
                  setDecision('DISETUJUI DENGAN CATATAN PENYESUAIAN');
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  status === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>APPROVED</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('CONDITIONAL');
                  setDecision('DISETUJUI BERSYARAT (MCO & AHS WAJIB DIPENUHI)');
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  status === 'CONDITIONAL'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>CONDITIONAL</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('REJECTED');
                  setDecision('DITOLAK KARENA DISKREPANSI FINANSIAL / KETIADAAN BUKTI');
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  status === 'REJECTED'
                    ? 'border-rose-500 bg-rose-50/60 text-rose-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>REJECTED</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('PENDING');
                  setDecision('PENDING AUDIT');
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  status === 'PENDING'
                    ? 'border-purple-500 bg-purple-50/60 text-purple-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>PENDING</span>
              </button>
            </div>
          </div>

          {/* Auditor Name */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Auditor / Lead PMO</label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
              placeholder="Contoh: Ir. Budi Santoso, ST, MT (Lead PMO)"
            />
          </div>

          {/* Comments */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Catatan & Rekomendasi Auditor
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs leading-relaxed"
              placeholder="Tuliskan arahan formal untuk Project Manager dan Kontraktor..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
          >
            Simpan Keputusan Audit
          </button>
        </div>
      </div>
    </div>
  );
};
