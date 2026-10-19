import React, { useState } from 'react';
import { 
  Project, 
  IPALocation, 
  UserRole, 
  DiscrepancyReport,
  BeritaAcara 
} from './types';
import { INITIAL_PROJECTS, INITIAL_DISCREPANCIES } from './data/mockData';
import { auditJustifikasiEvidence } from './utils/matchingEngine';
import { Navbar } from './components/Navbar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { ProjectList } from './components/ProjectList';
import { VerificationEngineView } from './components/VerificationEngineView';
import { BeritaAcaraList } from './components/BeritaAcaraList';
import { TimelineView } from './components/TimelineView';
import { JustifikasiModal } from './components/JustifikasiModal';
import { BeritaAcaraModal } from './components/BeritaAcaraModal';
import { CreateDocumentModal } from './components/CreateDocumentModal';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [issues, setIssues] = useState<DiscrepancyReport[]>(INITIAL_DISCREPANCIES);
  const [selectedIpa, setSelectedIpa] = useState<IPALocation | 'ALL'>('ALL');
  const [currentTab, setCurrentTab] = useState<'overview' | 'projects' | 'verification' | 'beritaAcara' | 'timeline'>('overview');
  const [userRole, setUserRole] = useState<UserRole>('Site Engineer PMO');

  // Modal view states
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeBaId, setActiveBaId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [preselectedProjForCreate, setPreselectedProjForCreate] = useState<string | undefined>(undefined);

  // Quick toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Find active records for modals
  const activeProject = projects.find(p => p.id === activeProjectId);
  const allBAs = projects.flatMap(p => p.beritaAcaraList);
  const activeBA = allBAs.find(b => b.id === activeBaId);
  const activeBAProject = activeBA ? projects.find(p => p.id === activeBA.projectId) : undefined;

  const unresolvedCount = issues.filter(i => !i.resolved).length;

  // Resolve issue (e.g. 1-click sync name variation or volume confirmation)
  const handleResolveIssue = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    // Update issue list
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, resolved: true } : i));

    // Update project item status
    setProjects(prevProjects => 
      prevProjects.map(proj => {
        if (proj.id !== issue.projectId || !proj.justifikasi) return proj;
        
        const updatedItems = proj.justifikasi.items.map(item => {
          if (item.itemName.includes(issue.justekItemName) || issue.justekItemName.includes(item.itemName)) {
            return {
              ...item,
              evidenceStatus: 'VERIFIED' as const,
              similarityScore: 100,
              linkedBaItemName: issue.baItemName || item.linkedBaItemName
            };
          }
          return item;
        });

        return {
          ...proj,
          justifikasi: {
            ...proj.justifikasi,
            items: updatedItems
          }
        };
      })
    );

    showToast(`Berhasil menyelesaikan rekonsiliasi: ${issue.justekItemName}`);
  };

  // Link item to BA
  const handleLinkItemToBA = (projectId: string, itemId: string, baId: string, baItemName: string) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id !== projectId || !proj.justifikasi) return proj;
      const updatedItems = proj.justifikasi.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            linkedBaId: baId,
            linkedBaItemName: baItemName,
            evidenceStatus: 'VERIFIED' as const,
            similarityScore: 100
          };
        }
        return item;
      });
      return {
        ...proj,
        justifikasi: {
          ...proj.justifikasi,
          items: updatedItems
        }
      };
    }));
    showToast('Item berhasil ditautkan ke Berita Acara pendukung!');
  };

  // Advance approval stage
  const handleAdvanceApproval = (projectId: string, nextStage: number, note: string) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id !== projectId || !proj.justifikasi) return proj;

      const isCompleted = nextStage === 5;
      const newStatus = isCompleted ? 'DISETUJUI' : 
                        nextStage === 3 ? 'REVIEW_TEKNIS' :
                        nextStage === 4 ? 'REVIEW_FINANSIAL' : 'VERIFIKASI_BA';

      const newHistory = [
        ...proj.justifikasi.approvalHistory,
        {
          step: `Tahap ${proj.justifikasi.currentApprovalStage} Disetujui`,
          actor: userRole,
          role: userRole,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'APPROVED' as const,
          comments: note
        }
      ];

      return {
        ...proj,
        status: isCompleted ? 'BERJALAN' : proj.status,
        justifikasi: {
          ...proj.justifikasi,
          currentApprovalStage: nextStage,
          status: newStatus,
          approvalHistory: newHistory
        }
      };
    }));

    showToast(`Tahap persetujuan berhasil diperbarui oleh ${userRole}!`);
  };

  // Request revision
  const handleRequestRevision = (projectId: string, note: string) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id !== projectId || !proj.justifikasi) return proj;

      const newHistory = [
        ...proj.justifikasi.approvalHistory,
        {
          step: `Permintaan Revisi Dokumen`,
          actor: userRole,
          role: userRole,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'REVISION_REQUESTED' as const,
          comments: note
        }
      ];

      return {
        ...proj,
        justifikasi: {
          ...proj.justifikasi,
          status: 'REVISI_DIBUTUHKAN',
          approvalHistory: newHistory
        }
      };
    }));

    showToast(`Dokumen dikembalikan untuk revisi.`);
  };

  // Sign Berita Acara
  const handleSignBA = (baId: string) => {
    setProjects(prev => prev.map(proj => {
      const updatedBAs = proj.beritaAcaraList.map(ba => {
        if (ba.id !== baId) return ba;
        const updatedSignatories = ba.signatories.map(s => {
          if (s.role.toLowerCase().includes('site engineer') || s.role.toLowerCase().includes('pmo')) {
            return {
              ...s,
              isSigned: true,
              signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              signatureHash: `ABJ-DIGI-${Math.floor(Math.random() * 900000 + 100000)}`
            };
          }
          return s;
        });
        return {
          ...ba,
          signatories: updatedSignatories
        };
      });

      return {
        ...proj,
        beritaAcaraList: updatedBAs
      };
    }));

    showToast(`Tanda tangan elektronik ${userRole} berhasil dibubuhkan.`);
  };

  // Create new Berita Acara
  const handleCreateBeritaAcara = (targetProjectId: string, newBaData: any) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id !== targetProjectId) return proj;
      const updatedBAs = [newBaData, ...proj.beritaAcaraList];

      // Re-audit items if project has justifikasi
      if (proj.justifikasi) {
        const { auditedItems } = auditJustifikasiEvidence(
          proj.id,
          proj.name,
          proj.justifikasi.items,
          updatedBAs
        );
        return {
          ...proj,
          beritaAcaraList: updatedBAs,
          justifikasi: {
            ...proj.justifikasi,
            items: auditedItems
          }
        };
      }

      return {
        ...proj,
        beritaAcaraList: updatedBAs
      };
    }));

    showToast(`Berita Acara ${newBaData.baType} No. ${newBaData.baNumber} berhasil diterbitkan.`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Navbar with role switcher & search */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedIpa={selectedIpa}
        setSelectedIpa={setSelectedIpa}
        userRole={userRole}
        setUserRole={setUserRole}
        unresolvedIssueCount={unresolvedCount}
        onOpenCreateModal={() => {
          setPreselectedProjForCreate(undefined);
          setIsCreateModalOpen(true);
        }}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <ExecutiveOverview
            projects={projects}
            selectedIpa={selectedIpa}
            onSelectIpa={(ipa) => {
              setSelectedIpa(ipa);
            }}
            onOpenProjectDetail={(pId) => setActiveProjectId(pId)}
            onOpenVerificationTab={() => setCurrentTab('verification')}
            unresolvedIssueCount={unresolvedCount}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectList
            projects={projects}
            selectedIpa={selectedIpa}
            onOpenProjectDetail={(pId) => setActiveProjectId(pId)}
            onOpenBaDetail={(baId) => setActiveBaId(baId)}
            onOpenCreateBaModal={(pId) => {
              setPreselectedProjForCreate(pId);
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {currentTab === 'verification' && (
          <VerificationEngineView
            projects={projects}
            issues={issues}
            onResolveIssue={handleResolveIssue}
            onLinkItemToBA={handleLinkItemToBA}
            onOpenProjectDetail={(pId) => setActiveProjectId(pId)}
            onOpenBaDetail={(baId) => setActiveBaId(baId)}
            onOpenCreateBaModal={(pId) => {
              setPreselectedProjForCreate(pId);
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {currentTab === 'beritaAcara' && (
          <BeritaAcaraList
            projects={projects}
            selectedIpa={selectedIpa}
            onOpenBaDetail={(baId) => setActiveBaId(baId)}
            onOpenCreateBaModal={(pId) => {
              setPreselectedProjForCreate(pId);
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {currentTab === 'timeline' && (
          <TimelineView
            projects={projects}
            selectedIpa={selectedIpa}
            onOpenProjectDetail={(pId) => setActiveProjectId(pId)}
            onOpenBaDetail={(baId) => setActiveBaId(baId)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">PT Air Bersih Jakarta</span>
          <span>&bull;</span>
          <span>Departemen PMO Cyclical</span>
          <span>&bull;</span>
          <span>Sistem Kendali Mutu & Rekonsiliasi Berita Acara</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>IPA Buaran 1, 2, 3</span>
          <span>&bull;</span>
          <span>IPA Pejompongan 1, 2</span>
          <span>&bull;</span>
          <span>IPA Pulogadung</span>
        </div>
      </footer>

      {/* Justifikasi Detail & Review Modal */}
      {activeProject && (
        <JustifikasiModal
          project={activeProject}
          userRole={userRole}
          onClose={() => setActiveProjectId(null)}
          onAdvanceApproval={handleAdvanceApproval}
          onRequestRevision={handleRequestRevision}
          onOpenBaDetail={(baId) => {
            setActiveProjectId(null);
            setActiveBaId(baId);
          }}
        />
      )}

      {/* Berita Acara Detail & Print Modal */}
      {activeBA && (
        <BeritaAcaraModal
          beritaAcara={activeBA}
          projectName={activeBAProject?.name || 'Proyek PMO Cyclical'}
          userRole={userRole}
          onClose={() => setActiveBaId(null)}
          onSignBA={handleSignBA}
        />
      )}

      {/* Create Document Modal */}
      {isCreateModalOpen && (
        <CreateDocumentModal
          projects={projects}
          preselectedProjectId={preselectedProjForCreate}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateBeritaAcara={handleCreateBeritaAcara}
          onCreateJustifikasi={() => {}}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-70 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
