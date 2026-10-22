import React, { useState } from 'react';
import { 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ExternalLink,
  Building2,
  Check,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';
import { ProposalModifikasi, Project, TigresRef } from '../types';
import { getDeviation, isProjectStopWork } from '../services/deviationRules';

interface ProposalModifikasiViewProps {
  projects: Project[];
  proposals: ProposalModifikasi[];
  thresholdPct: number;
  onCreateProposal: (projectId: string) => void;
  onSubmitProposal: (proposalId: string, tigresRef: TigresRef) => void;
  onDecideProposal: (
    proposalId: string, 
    party: 'SUCOFINDO' | 'PAMJAYA', 
    decision: 'APPROVED' | 'REJECTED', 
    decidedBy: string, 
    note: string, 
    tigresRef: TigresRef
  ) => void;
  onOpenProjectDetail: (projectId: string) => void;
}

export const ProposalModifikasiView: React.FC<ProposalModifikasiViewProps> = ({
  projects,
  proposals,
  thresholdPct,
  onCreateProposal,
  onSubmitProposal,
  onDecideProposal,
  onOpenProjectDetail,
}) => {
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'STOP_WORK' | 'ACTIVE'>('ALL');
  const [decidingModalPropId, setDecidingModalPropId] = useState<string | null>(null);
  const [decidingParty, setDecidingParty] = useState<'SUCOFINDO' | 'PAMJAYA'>('SUCOFINDO');
  const [officerName, setOfficerName] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [tigresFolder, setTigresFolder] = useState('/Tigres/PMO/Adendum/Persetujuan/');
  const [tigresDocNum, setTigresDocNum] = useState('SK-APP/2026/001');
  const [tigresUrl, setTigresUrl] = useState('https://tigres.airbersihjakarta.id/doc/approval');

  // Projects exceeding threshold
  const projectsExceeding = projects.filter(p => {
    const dev = getDeviation(p, thresholdPct);
    return dev.exceedsThreshold;
  });

  const stopWorkProjects = projects.filter(p => isProjectStopWork(p, proposals, thresholdPct));

  const handleOpenDecision = (propId: string, party: 'SUCOFINDO' | 'PAMJAYA') => {
    setDecidingModalPropId(propId);
    setDecidingParty(party);
    setOfficerName(party === 'SUCOFINDO' ? 'Ir. Ahmad Zarkasih (Lead Consultant)' : 'Drs. H. M. Ridwan, MM (Kadiv Teknik PAMJAYA)');
  };

  const submitDecision = (decision: 'APPROVED' | 'REJECTED') => {
    if (!decidingModalPropId) return;
    if (!tigresFolder || !tigresDocNum || !tigresUrl) {
      alert('Referensi Tigres (Folder, Nomor Dokumen, dan Link) wajib diisi lengkap.');
      return;
    }
    onDecideProposal(
      decidingModalPropId,
      decidingParty,
      decision,
      officerName || 'Pejabat Berwenang',
      decisionNote || `Persetujuan formal pihak ${decidingParty}`,
      { folderPath: tigresFolder, docNumber: tigresDocNum, url: tigresUrl }
    );
    setDecidingModalPropId(null);
    setDecisionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner for Stop Work Projects */}
      <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        stopWorkProjects.length > 0
          ? 'bg-gradient-to-r from-red-950 via-rose-900 to-slate-900 text-white border-rose-500'
          : 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-500'
      }`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              stopWorkProjects.length > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
            }`}>
              {stopWorkProjects.length > 0 ? 'STATUS STOP WORK AKTIF' : 'KONTROL DEVIASI AMAN'}
            </span>
            <span className="text-xs text-slate-300 font-mono">Batas Ambang: ±{thresholdPct}%</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {stopWorkProjects.length > 0 
              ? `${stopWorkProjects.length} Proyek Memerlukan Proposal Modifikasi & Persetujuan Bersama`
              : 'Semua Proyek Dalam Batas Toleransi Atau Telah Disetujui Bersama'}
          </h2>
          <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
            Sesuai aturan PMO Cyclical PT Air Bersih Jakarta, proyek dengan deviasi melampaui ±{thresholdPct}% otomatis berstatus <strong>STOP_WORK</strong> hingga Proposal Modifikasi disetujui bersama oleh Konsultan Pengawas (Sucofindo) dan PAMJAYA.
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/10 text-center shrink-0">
          <span className="text-2xl font-black font-mono text-amber-300 block">{stopWorkProjects.length}</span>
          <span className="text-[10px] text-slate-300 uppercase tracking-wider">Proyek Stop Work</span>
        </div>
      </div>

      {/* Projects Exceeding Threshold Without Proposal */}
      {projectsExceeding.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Proyek Melebihi Ambang Batas &amp; Daftar Draf Proposal Modifikasi</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsExceeding.map(proj => {
              const dev = getDeviation(proj, thresholdPct);
              const prop = proposals.find(p => p.projectId === proj.id);
              const isStop = isProjectStopWork(proj, proposals, thresholdPct);

              return (
                <div key={proj.id} className={`rounded-xl border p-4 space-y-3 flex flex-col justify-between ${
                  isStop ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {proj.code}
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        isStop ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isStop ? 'STOP WORK' : 'MELEBIHI AMBANG'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{proj.name}</h4>
                    
                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 font-mono">
                      <div className="flex justify-between">
                        <span>Deviasi Efektif:</span>
                        <span className="font-bold text-rose-600">+{dev.effectivePct}% (Ambang: {thresholdPct}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Selisih Nilai:</span>
                        <span className="font-bold text-slate-900">Rp {(proj.justificationDelta / 1_000_000).toFixed(1)} Juta</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenProjectDetail(proj.id)}
                      className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Detail Proyek</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {!prop ? (
                      <button
                        onClick={() => onCreateProposal(proj.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs hover:from-blue-800 hover:to-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat Proposal</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        Proposal Dibuat
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List of All Proposals */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Draf &amp; Status Persetujuan Proposal Modifikasi Bersama (Sucofindo &amp; PAMJAYA)
        </h3>

        <div className="space-y-4">
          {proposals.map(prop => {
            const sucofindo = prop.approvals.find(a => a.party === 'SUCOFINDO');
            const pamjaya = prop.approvals.find(a => a.party === 'PAMJAYA');

            const isFullyApproved = prop.status === 'DISETUJUI';
            const isRejected = prop.status === 'DITOLAK';

            return (
              <div key={prop.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        {prop.proposalNumber}
                      </span>
                      <span className="text-slate-500 font-mono">Proyek: <strong>{prop.projectCode}</strong></span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isFullyApproved ? 'bg-emerald-100 text-emerald-800' : isRejected ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Status: {prop.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{prop.projectName}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Deviasi Pemicu: <strong className="text-rose-600">+{prop.triggerDeviationPct}%</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {prop.summary}
                </p>

                {/* Tigres Ref if submitted */}
                {prop.tigresRef && prop.tigresRef.folderPath && (
                  <div className="text-xs text-slate-500 bg-cyan-50/50 p-2.5 rounded-lg border border-cyan-200 flex items-center justify-between">
                    <span className="font-mono text-cyan-900 truncate">
                      📁 Ref Tigres: <strong>{prop.tigresRef.folderPath}</strong> (No: {prop.tigresRef.docNumber})
                    </span>
                    {prop.tigresRef.url && (
                      <a href={prop.tigresRef.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 shrink-0 font-medium">
                        <span>Buka Tigres</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Separate Approval Panels for Sucofindo and Pamjaya */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Sucofindo Panel */}
                  <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    sucofindo?.status === 'APPROVED' ? 'bg-emerald-50/60 border-emerald-300' : sucofindo?.status === 'REJECTED' ? 'bg-rose-50/60 border-rose-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-700" />
                        <span>Konsultan Pengawas: PT Sucofindo (Persero)</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        sucofindo?.status === 'APPROVED' ? 'bg-emerald-600 text-white' : sucofindo?.status === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sucofindo?.status || 'PENDING'}
                      </span>
                    </div>

                    {sucofindo?.decidedBy && (
                      <p className="text-slate-600">
                        Diputuskan oleh: <strong>{sucofindo.decidedBy}</strong> ({sucofindo.decidedAt})<br />
                        Catatan: {sucofindo.note}
                      </p>
                    )}

                    {sucofindo?.status === 'PENDING' && (
                      <button
                        onClick={() => handleOpenDecision(prop.id, 'SUCOFINDO')}
                        className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Input Keputusan Sucofindo
                      </button>
                    )}
                  </div>

                  {/* PAMJAYA Panel */}
                  <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    pamjaya?.status === 'APPROVED' ? 'bg-emerald-50/60 border-emerald-300' : pamjaya?.status === 'REJECTED' ? 'bg-rose-50/60 border-rose-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-cyan-700" />
                        <span>Pemilik Proyek: PAMJAYA</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        pamjaya?.status === 'APPROVED' ? 'bg-emerald-600 text-white' : pamjaya?.status === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pamjaya?.status || 'PENDING'}
                      </span>
                    </div>

                    {pamjaya?.decidedBy && (
                      <p className="text-slate-600">
                        Diputuskan oleh: <strong>{pamjaya.decidedBy}</strong> ({pamjaya.decidedAt})<br />
                        Catatan: {pamjaya.note}
                      </p>
                    )}

                    {pamjaya?.status === 'PENDING' && (
                      <button
                        onClick={() => handleOpenDecision(prop.id, 'PAMJAYA')}
                        className="w-full py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Input Keputusan PAMJAYA
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Modal */}
      {decidingModalPropId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Input Keputusan Proposal ({decidingParty})
              </h3>
              <button onClick={() => setDecidingModalPropId(null)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Pejabat / Pimpinan Berwenang</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-slate-800 font-medium"
                  placeholder="Contoh: Ir. Ahmad Zarkasih"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Evaluasi / Catatan Pengesahan</label>
                <textarea
                  rows={2}
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-slate-800"
                  placeholder="Catatan teknis atau finansial..."
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Referensi Tigres (Wajib untuk Bukti Persetujuan)</span>
                <div>
                  <label className="text-[11px] text-slate-500 block">Folder Path Tigres</label>
                  <input
                    type="text"
                    value={tigresFolder}
                    onChange={(e) => setTigresFolder(e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block">Nomor Dokumen</label>
                    <input
                      type="text"
                      value={tigresDocNum}
                      onChange={(e) => setTigresDocNum(e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">URL / Link Akses</label>
                    <input
                      type="text"
                      value={tigresUrl}
                      onChange={(e) => setTigresUrl(e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => submitDecision('REJECTED')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Tolak (REJECTED)
                </button>
                <button
                  onClick={() => submitDecision('APPROVED')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Setujui (APPROVED)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalModifikasiView;
