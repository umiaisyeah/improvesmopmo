import React, { useState } from 'react';
import { 
  Building2, 
  Filter, 
  User, 
  Plus, 
  ShieldAlert, 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  CheckSquare, 
  FileSpreadsheet, 
  BarChart2, 
  Sliders,
  RotateCcw
} from 'lucide-react';
import { Project, IPALocation, UserRole, TigresRef } from '../types';
import { IPA_LIST } from '../data/mockData';
import { ExecutiveOverview } from './ExecutiveOverview';
import { ProjectList } from './ProjectList';
import { TimelineView } from './TimelineView';
import { BeritaAcaraList } from './BeritaAcaraList';
import { VerificationEngineView } from './VerificationEngineView';
import { ProposalModifikasiView } from './ProposalModifikasiView';
import { DedAnalyticsView } from './DedAnalyticsView';
import { JustifikasiModal } from './JustifikasiModal';
import { BeritaAcaraModal } from './BeritaAcaraModal';
import { CreateDocumentModal } from './CreateDocumentModal';
import { usePortfolio } from '../hooks/usePortfolio';
import { isProjectStopWork } from '../services/deviationRules';

interface PortfolioWorkspaceProps {
  activeTab: string; // e.g. 'p_overview', 'p_projects', etc.
  onOpenDocumentVerificationEngine: () => void;
}

export const PortfolioWorkspace: React.FC<PortfolioWorkspaceProps> = ({
  activeTab,
  onOpenDocumentVerificationEngine,
}) => {
  const {
    projects,
    proposals,
    issues,
    gates,
    thresholdPct,
    userRole,
    setUserRole,
    setThreshold,
    createBeritaAcara,
    createJustifikasi,
    signBA,
    advanceApproval,
    requestRevision,
    resolveIssue,
    linkItemToBA,
    createProposal,
    submitProposal,
    decideProposal,
    getGate,
    toggleGate,
    resetPortfolio
  } = usePortfolio();

  const [selectedIpa, setSelectedIpa] = useState<IPALocation | 'ALL'>('ALL');
  const [modalProjectId, setModalProjectId] = useState<string | null>(null);
  const [modalBaId, setModalBaId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [preselectedProjIdForCreate, setPreselectedProjIdForCreate] = useState<string | undefined>(undefined);

  const stopWorkProjectsCount = projects.filter(p => isProjectStopWork(p, proposals, thresholdPct)).length;
  const unresolvedIssuesCount = issues.filter(i => !i.resolved).length;

  const handleOpenProjectDetail = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj && !proj.justifikasi) {
      setPreselectedProjIdForCreate(projectId);
      setShowCreateModal(true);
    } else {
      setModalProjectId(projectId);
    }
  };

  const handleOpenBaDetail = (baId: string) => {
    setModalBaId(baId);
  };

  const currentModalProject = projects.find(p => p.id === modalProjectId);
  const currentModalBa = projects.flatMap(p => p.beritaAcaraList).find(b => b.id === modalBaId);
  const modalBaProjectName = projects.find(p => p.beritaAcaraList.some(b => b.id === modalBaId))?.name || '';

  return (
    <div className="space-y-6">
      {/* Portfolio Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: IPA Filter & Role Simulation */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-600">Wilayah IPA:</span>
            <select
              value={selectedIpa}
              onChange={(e) => setSelectedIpa(e.target.value as any)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua 6 IPA Jakarta</option>
              {IPA_LIST.map(ipa => (
                <option key={ipa.id} value={ipa.id}>{ipa.name} ({ipa.capacity})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-600">Simulasi Peran:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="Site Engineer PMO">Site Engineer PMO</option>
              <option value="Lead Technical Reviewer">Lead Technical Reviewer</option>
              <option value="Financial & Commercial PMO">Financial & Commercial PMO</option>
              <option value="Kepala Departemen PMO">Kepala Departemen PMO</option>
            </select>
          </div>
        </div>

        {/* Right: Stop Work Alert Button & Input Dokumen Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {stopWorkProjectsCount > 0 && (
            <button
              onClick={() => {
                // switch or notify
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{stopWorkProjectsCount} Proyek STOP WORK</span>
            </button>
          )}

          <button
            onClick={() => {
              setPreselectedProjIdForCreate(undefined);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#0054a6] to-[#009ee2] hover:from-[#004690] hover:to-[#008cc8] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Dokumen (BA / Justifikasi)</span>
          </button>
        </div>
      </div>

      {/* Render Active Tab Component */}
      {activeTab === 'p_overview' && (
        <ExecutiveOverview
          projects={projects}
          selectedIpa={selectedIpa}
          onSelectIpa={setSelectedIpa}
          onOpenProjectDetail={handleOpenProjectDetail}
          onOpenVerificationTab={onOpenDocumentVerificationEngine}
          unresolvedIssueCount={unresolvedIssuesCount}
        />
      )}

      {activeTab === 'p_projects' && (
        <ProjectList
          projects={projects}
          selectedIpa={selectedIpa}
          onOpenProjectDetail={handleOpenProjectDetail}
          onOpenBaDetail={handleOpenBaDetail}
          onOpenCreateBaModal={(projId) => {
            setPreselectedProjIdForCreate(projId);
            setShowCreateModal(true);
          }}
        />
      )}

      {activeTab === 'p_timeline' && (
        <TimelineView
          projects={projects}
          selectedIpa={selectedIpa}
          onOpenProjectDetail={handleOpenProjectDetail}
          onOpenBaDetail={handleOpenBaDetail}
        />
      )}

      {activeTab === 'p_ba' && (
        <BeritaAcaraList
          projects={projects}
          selectedIpa={selectedIpa}
          onOpenBaDetail={handleOpenBaDetail}
          onOpenCreateBaModal={(projId) => {
            setPreselectedProjIdForCreate(projId);
            setShowCreateModal(true);
          }}
        />
      )}

      {activeTab === 'p_verification' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pusat Cek Bukti &amp; Pencocokan Nama Item (WBS)</h3>
              <p className="text-xs text-slate-600 mt-0.5">Membandingkan kesesuaian item Justifikasi Teknis terhadap Berita Acara lapangan.</p>
            </div>
            <button
              onClick={onOpenDocumentVerificationEngine}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Buka Mesin Verifikasi Dokumen PDF &amp; Excel
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Daftar Discrepancy &amp; Temuan Nama Item Berbeda</h4>
            <div className="space-y-2.5">
              {issues.map(issue => (
                <div key={issue.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">
                        {issue.type}
                      </span>
                      <span className="text-slate-500">{issue.projectName}</span>
                    </div>
                    <p className="font-bold text-slate-900">JusTek: "{issue.justekItemName}"</p>
                    {issue.baItemName && <p className="text-slate-600">BA Lapangan: "{issue.baItemName}"</p>}
                    <p className="text-blue-700 mt-1 font-medium">{issue.suggestedAction}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                    issue.resolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {issue.resolved ? 'Terkoreksi' : 'Belum Ditautkan'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'p_proposal' && (
        <ProposalModifikasiView
          projects={projects}
          proposals={proposals}
          thresholdPct={thresholdPct}
          onCreateProposal={createProposal}
          onSubmitProposal={submitProposal}
          onDecideProposal={decideProposal}
          onOpenProjectDetail={handleOpenProjectDetail}
        />
      )}

      {activeTab === 'p_ded' && (
        <DedAnalyticsView
          projects={projects}
          thresholdPct={thresholdPct}
          setThreshold={setThreshold}
          gates={gates}
          onToggleGate={toggleGate}
          onOpenProjectDetail={handleOpenProjectDetail}
        />
      )}

      {/* Modals */}
      {modalProjectId && currentModalProject && (
        <JustifikasiModal
          project={currentModalProject}
          userRole={userRole}
          onClose={() => setModalProjectId(null)}
          onAdvanceApproval={(projId, nextStage, comments) => advanceApproval(projId, nextStage, comments)}
          onRequestRevision={(projId, comments) => requestRevision(projId, comments)}
          onOpenBaDetail={(baId) => handleOpenBaDetail(baId)}
        />
      )}

      {modalBaId && currentModalBa && (
        <BeritaAcaraModal
          beritaAcara={currentModalBa}
          projectName={modalBaProjectName}
          userRole={userRole}
          onClose={() => setModalBaId(null)}
          onSignBA={(baId) => signBA(baId, userRole, 'Pejabat PMO')}
        />
      )}

      {showCreateModal && (
        <CreateDocumentModal
          projects={projects}
          preselectedProjectId={preselectedProjIdForCreate}
          onClose={() => setShowCreateModal(false)}
          onCreateBeritaAcara={(projId, baData) => {
            createBeritaAcara(projId, baData);
            setShowCreateModal(false);
          }}
          onCreateJustifikasi={(projId, jtData) => {
            createJustifikasi(projId, jtData);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PortfolioWorkspace;
