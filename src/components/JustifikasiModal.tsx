import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  ArrowRight, 
  Clock, 
  Send, 
  RotateCcw, 
  Printer, 
  Check, 
  ShieldAlert, 
  ExternalLink,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Project, JustifikasiDocument, UserRole } from '../types';

interface JustifikasiModalProps {
  project: Project;
  userRole: UserRole;
  onClose: () => void;
  onAdvanceApproval: (projectId: string, nextStage: number, note: string) => void;
  onRequestRevision: (projectId: string, note: string) => void;
  onOpenBaDetail: (baId: string) => void;
}

export const JustifikasiModal: React.FC<JustifikasiModalProps> = ({
  project,
  userRole,
  onClose,
  onAdvanceApproval,
  onRequestRevision,
  onOpenBaDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'engineering' | 'boq' | 'financial' | 'workflow'>('engineering');
  const [approvalNote, setApprovalNote] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  const justek = project.justifikasi;
  if (!justek) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const steps = [
    { num: 1, title: 'Draf Usulan', roleReq: 'Kontraktor Pelaksana', roleDesc: 'Pengajuan dokumen teknis & backup data' },
    { num: 2, title: 'Verifikasi Site PMO', roleReq: 'Site Engineer PMO', roleDesc: 'Pencocokan lembar ukur & BA Lapangan' },
    { num: 3, title: 'Review Teknis', roleReq: 'Lead Technical Reviewer', roleDesc: 'Evaluasi kesesuaian spesifikasi & mutu air' },
    { num: 4, title: 'Review Finansial', roleReq: 'Financial & Commercial PMO', roleDesc: 'Pemeriksaan kewajaran harga (OE) & anggaran' },
    { num: 5, title: 'Pengesahan Kadep', roleReq: 'Kepala Departemen PMO', roleDesc: 'Penerbitan Adendum Kontrak Resmi' },
  ];

  const canApproveCurrentStage = () => {
    if (justek.status === 'DISETUJUI') return false;
    if (justek.currentApprovalStage === 2 && userRole === 'Site Engineer PMO') return true;
    if (justek.currentApprovalStage === 3 && userRole === 'Lead Technical Reviewer') return true;
    if (justek.currentApprovalStage === 4 && userRole === 'Financial & Commercial PMO') return true;
    if (justek.currentApprovalStage === 5 && userRole === 'Kepala Departemen PMO') return true;
    return false;
  };

  const handleApprove = () => {
    const nextStage = Math.min(5, justek.currentApprovalStage + 1);
    const defaultNote = approvalNote || `Disetujui oleh ${userRole} pada ${new Date().toLocaleDateString('id-ID')}`;
    onAdvanceApproval(project.id, nextStage, defaultNote);
    setApprovalNote('');
  };

  const handleRevision = () => {
    if (!approvalNote.trim()) {
      alert('Harap masukkan catatan poin-poin yang perlu direvisi.');
      return;
    }
    onRequestRevision(project.id, approvalNote);
    setShowRevisionInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap text-xs mb-1.5">
              <span className="bg-blue-600 text-white font-mono px-2 py-0.5 rounded text-[11px] font-bold">
                {project.code}
              </span>
              <span className="text-cyan-400 font-semibold">{project.ipa}</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-300">Kontraktor: {project.contractorName}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
              {project.name}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
              <span>No. Justek: <strong className="text-white font-mono">{justek.numberJustek}</strong></span>
              <span>&bull;</span>
              <span>No. Jusfin: <strong className="text-white font-mono">{justek.numberJusfin}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Cetak Berkas Justifikasi"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Step Workflow Stepper Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {steps.map((step) => {
              const isPast = justek.currentApprovalStage > step.num || justek.status === 'DISETUJUI';
              const isCurrent = justek.currentApprovalStage === step.num && justek.status !== 'DISETUJUI';

              return (
                <div
                  key={step.num}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                    isPast
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isPast
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isPast ? <Check className="w-3 h-3" /> : step.num}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold leading-tight">{step.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{step.roleReq}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 px-5 flex items-center gap-4 bg-white text-xs">
          <button
            onClick={() => setActiveTab('engineering')}
            className={`py-3 font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'engineering'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Justifikasi Teknis (DED vs Lapangan)</span>
          </button>

          <button
            onClick={() => setActiveTab('boq')}
            className={`py-3 font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'boq'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Rincian Pekerjaan & Bukti BA ({justek.items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`py-3 font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'financial'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Justifikasi Finansial (Jusfin / Adendum)</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'workflow'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Log Persetujuan & Komentar</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: ENGINEERING CONTEXT (JUSTEK) */}
          {activeTab === 'engineering' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DED Baseline */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      Desain Awal (Detail Engineering Design - DED)
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Baseline Kontrak</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {justek.engineeringContext.dedBaselineDescription}
                  </p>
                </div>

                {/* Field Anomaly Found */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Anomali Kondisi Lapangan Riil (Temuan Bersama)
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">Fakta Fisik</span>
                  </div>
                  <p className="text-amber-950 leading-relaxed bg-white p-3 rounded-lg border border-amber-200">
                    {justek.engineeringContext.fieldAnomalyFound}
                  </p>
                </div>
              </div>

              {/* Technical Recommendation & Quality Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block">
                    Solusi Teknis Yang Direkomendasikan:
                  </span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {justek.engineeringContext.technicalSolutionRecommended}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block">
                    Dampak Terhadap Kualitas Air & Operasional IPA:
                  </span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {justek.engineeringContext.qualityImpact}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-blue-900">Kategori Akar Masalah</h4>
                  <p className="text-blue-800 mt-0.5">
                    Klasifikasi: <strong className="uppercase">{justek.engineeringContext.rootCauseCategory.replace(/_/g, ' ')}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Tingkat Urgensi</span>
                  <span className="bg-blue-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {justek.urgencyLevel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOQ ITEMS & EVIDENCE VERIFICATION */}
          {activeTab === 'boq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">Rincian Perubahan Volume & Bukti Berita Acara Pendukung</h4>
                  <p className="text-slate-500">Pemeriksaan silang volume kontrak DED vs volume lapangan terverifikasi di Berita Acara</p>
                </div>
                <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded">
                  {justek.items.length} Item Pekerjaan
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                      <th className="py-2.5 px-3">WBS & Item Justifikasi</th>
                      <th className="py-2.5 px-3 text-right">Vol DED</th>
                      <th className="py-2.5 px-3 text-right">Vol Lapangan</th>
                      <th className="py-2.5 px-3 text-right">Selisih (+/-)</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Total Selisih</th>
                      <th className="py-2.5 px-3">Status Bukti BA</th>
                      <th className="py-2.5 px-3 text-center">Tautan BA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {justek.items.map((item) => {
                      const deltaVol = item.fieldVolume - item.dedVolume;
                      const deltaCost = deltaVol * item.unitPrice;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 max-w-[220px]">
                            <span className="font-mono text-blue-700 font-bold bg-blue-50 px-1 py-0.2 rounded text-[10px]">
                              {item.wbsCode}
                            </span>
                            <div className="font-semibold text-slate-900 mt-0.5">{item.itemName}</div>
                            <div className="text-[10px] text-slate-500 italic mt-0.5">{item.justificationReason}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono">{item.dedVolume} {item.unit}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{item.fieldVolume} {item.unit}</td>
                          <td className={`py-3 px-3 text-right font-mono font-bold ${
                            deltaVol > 0 ? 'text-amber-700' : deltaVol < 0 ? 'text-blue-700' : 'text-slate-500'
                          }`}>
                            {deltaVol > 0 ? `+${deltaVol}` : deltaVol} {item.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[11px]">{formatRupiah(item.unitPrice)}</td>
                          <td className={`py-3 px-3 text-right font-mono font-bold text-[11px] ${
                            deltaCost > 0 ? 'text-amber-700' : deltaCost < 0 ? 'text-emerald-700' : 'text-slate-500'
                          }`}>
                            {deltaCost > 0 ? `+${formatRupiah(deltaCost)}` : deltaCost < 0 ? formatRupiah(deltaCost) : 'Rp 0'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.evidenceStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.evidenceStatus === 'MISSING_BA'
                                ? 'bg-red-100 text-red-800'
                                : item.evidenceStatus === 'NAME_MISMATCH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.evidenceStatus === 'VERIFIED' ? 'Terverifikasi BA' :
                               item.evidenceStatus === 'MISSING_BA' ? 'Tanpa Bukti BA' :
                               item.evidenceStatus === 'NAME_MISMATCH' ? 'Penamaan Beda' : 'Over-Claim'}
                            </span>
                            {item.linkedBaItemName && item.evidenceStatus === 'NAME_MISMATCH' && (
                              <div className="text-[9px] text-slate-500 mt-0.5">
                                BA: {item.linkedBaItemName}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {item.linkedBaId ? (
                              <button
                                onClick={() => onOpenBaDetail(item.linkedBaId!)}
                                className="p-1 text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                                title="Buka Berita Acara Pendukung"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-red-500 italic">Belum Ada</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL RECAP (JUSFIN) */}
          {activeTab === 'financial' && (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-slate-500 uppercase tracking-wide font-bold block">Nilai Kontrak Awal (DED)</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {formatRupiah(justek.financialSummary.originalContractValue)}
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                  <span className="text-amber-800 uppercase tracking-wide font-bold block">Pekerjaan Tambah (+)</span>
                  <div className="text-xl font-bold text-amber-700 mt-1">
                    +{formatRupiah(justek.financialSummary.additionalWorksValue)}
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
                  <span className="text-emerald-800 uppercase tracking-wide font-bold block">Pekerjaan Kurang (-)</span>
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    -{formatRupiah(justek.financialSummary.reducedWorksValue)}
                  </div>
                </div>
              </div>

              {/* Summary Total Variance */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-cyan-300 text-[10px] uppercase tracking-wider font-bold block">
                    Total Nilai Kontrak Baru (Usulan Adendum)
                  </span>
                  <div className="text-2xl font-bold text-white mt-0.5">
                    {formatRupiah(justek.financialSummary.revisedContractValue)}
                  </div>
                  <p className="text-slate-300 text-xs mt-1">
                    Sumber Anggaran: <strong>{justek.financialSummary.budgetSource}</strong>
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-3 border border-white/20 text-right">
                  <span className="text-xs text-slate-300 block">Selisih Bersih (Net Variance)</span>
                  <div className="text-lg font-bold text-amber-300">
                    {justek.financialSummary.netVarianceValue >= 0 ? '+' : ''}
                    {formatRupiah(justek.financialSummary.netVarianceValue)}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-300">
                    ({justek.financialSummary.netVarianceValue >= 0 ? '+' : ''}{justek.financialSummary.variancePercentage}% dari kontrak)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORKFLOW LOG & HISTORY */}
          {activeTab === 'workflow' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900">Riwayat Penelaahan & Persetujuan Dokumen</h4>
              <div className="space-y-3">
                {justek.approvalHistory.map((h, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-full mt-0.5 ${
                        h.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {h.status === 'APPROVED' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{h.step}</div>
                        <div className="text-[11px] text-slate-600">
                          {h.actor} &bull; <span className="font-medium">{h.role}</span>
                        </div>
                        <p className="text-slate-700 mt-1 italic bg-white p-2 rounded border border-slate-200">
                          "{h.comments}"
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">{h.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Role-Based Sign-off Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Peran Anda Saat Ini:</span>
            <span className="bg-slate-800 text-white font-bold px-2.5 py-0.5 rounded-full">
              {userRole}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canApproveCurrentStage() ? (
              <>
                <button
                  onClick={() => setShowRevisionInput(!showRevisionInput)}
                  className="px-3 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Minta Revisi
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Setujui Tahap Ini ({steps.find(s => s.num === justek.currentApprovalStage)?.title})</span>
                </button>
              </>
            ) : justek.status === 'DISETUJUI' ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" /> Justifikasi Telah Disahkan (Adendum Resmi Terbit)
              </span>
            ) : (
              <span className="text-xs text-slate-500 italic">
                Menunggu giliran persetujuan dari: <strong>{steps.find(s => s.num === justek.currentApprovalStage)?.roleReq}</strong>
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Revision comment input overlay */}
        {showRevisionInput && (
          <div className="p-4 bg-red-50 border-t border-red-200 space-y-2">
            <label className="text-xs font-bold text-red-900 block">
              Catatan Revisi untuk Kontraktor / Tim Teknis:
            </label>
            <textarea
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Contoh: Lampirkan bukti foto galian kabel PLN dan sertifikat hasil uji tarik..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-lg border border-red-300 bg-white text-slate-900"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRevisionInput(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleRevision}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded"
              >
                Kirim Permintaan Revisi
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
