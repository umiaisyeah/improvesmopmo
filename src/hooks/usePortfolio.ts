import { useState, useEffect } from 'react';
import { Project, ProposalModifikasi, DiscrepancyReport, ProjectGate, TigresRef, UserRole } from '../types';
import { INITIAL_PROJECTS, INITIAL_DISCREPANCIES } from '../data/mockData';
import { isProjectStopWork } from '../services/deviationRules';

const STORAGE_KEY = 'pmo_portfolio_v1';

export function usePortfolio() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROJECTS;
  });

  const [proposals, setProposals] = useState<ProposalModifikasi[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_proposals`);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial draft proposal for PRJ-PJ2-004 (Pejompongan 2) which has 12.53% deviation
    return [
      {
        id: 'PROP-PJ2-001',
        projectId: 'PRJ-PJ2-004',
        projectCode: 'CYC-PJ2-2026-003',
        projectName: 'Modernisasi Otomasi Dosing Kimia Koagulan & SCADA PLC IPA Pejompongan 2',
        ipa: 'IPA Pejompongan 2',
        proposalNumber: 'PRP/CYC-PJ2/2026/001',
        triggerDeviationPct: 12.53,
        netVarianceValue: 495000000,
        thresholdPct: 10,
        summary: 'Deviasi anggaran melampaui batas toleransi 10% akibat penambahan sensor SCM dan upgrade smart dosing pump inverter untuk mengatasi lonjakan turbiditas Kali Krukut.',
        status: 'DIAJUKAN',
        tigresRef: {
          folderPath: '/Tigres/Pejompongan2/Adendum/ProposalModifikasi/',
          docNumber: 'PROP/CYC-PJ2/2026/001',
          url: 'https://tigres.airbersihjakarta.id/doc/prop-pj2-001'
        },
        approvals: [
          { party: 'SUCOFINDO', status: 'PENDING' },
          { party: 'PAMJAYA', status: 'PENDING' }
        ],
        createdAt: '2026-03-19T09:00:00.000Z'
      }
    ];
  });

  const [issues, setIssues] = useState<DiscrepancyReport[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_issues`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DISCREPANCIES;
  });

  const [gates, setGates] = useState<ProjectGate[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gates`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROJECTS.map(p => ({
      projectId: p.id,
      items: [
        { id: 'g1', taskName: 'Walkdown DED vs lapangan bersama kontraktor & pengawas', isCompleted: true, checkedBy: 'Bambang Wijanarko, ST', checkedAt: '2026-02-04' },
        { id: 'g2', taskName: 'Survei utilitas eksisting (kabel PLN / pipa AC)', isCompleted: true, checkedBy: 'Fauzi Rahmat, ST', checkedAt: '2026-02-06' },
        { id: 'g3', taskName: 'Pengujian data geoteknik / struktur eksisting', isCompleted: false },
        { id: 'g4', taskName: 'Pencocokan item BoQ dengan nama baku wbs', isCompleted: true, checkedBy: 'Rudi Hartono, ST', checkedAt: '2026-02-10' },
        { id: 'g5', taskName: 'Review DED oleh Site Engineer & Lead Technical Reviewer', isCompleted: false },
        { id: 'g6', taskName: 'Draf BA MC-0 sudah diunggah ke Tigres', isCompleted: true, checkedBy: 'Admin PMO', checkedAt: '2026-02-11' },
      ]
    }));
  });

  const [thresholdPct, setThresholdPct] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_threshold`);
      if (saved) return Number(saved);
    } catch {}
    return 10;
  });

  const [userRole, setUserRole] = useState<UserRole>('Site Engineer PMO');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_proposals`, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_issues`, JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gates`, JSON.stringify(gates));
  }, [gates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_threshold`, thresholdPct.toString());
  }, [thresholdPct]);

  // Derived Stop Work status update
  const evaluatedProjects = projects.map(p => {
    const isStopWork = isProjectStopWork(p, proposals, thresholdPct);
    const newStatus = isStopWork ? 'STOP_WORK' : (p.status === 'STOP_WORK' ? 'MENUNGGU_JUSTIFIKASI' : p.status);
    return {
      ...p,
      status: newStatus as any
    };
  });

  // Actions
  const setThreshold = (val: number) => {
    setThresholdPct(val);
  };

  const createBeritaAcara = (projectId: string, baData: any) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          beritaAcaraList: [baData, ...p.beritaAcaraList]
        };
      }
      return p;
    }));
  };

  const createJustifikasi = (projectId: string, jtData: any) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          justificationDelta: jtData.financialSummary.netVarianceValue,
          status: 'MENUNGGU_JUSTIFIKASI',
          justifikasi: jtData
        };
      }
      return p;
    }));
  };

  const signBA = (baId: string, signatoryRole: string, officerName: string, tigresRef?: TigresRef) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      beritaAcaraList: p.beritaAcaraList.map(ba => {
        if (ba.id === baId) {
          const updatedSigs = ba.signatories.map(s => {
            if (s.role.toLowerCase().includes(signatoryRole.toLowerCase()) || s.name === officerName) {
              return {
                ...s,
                isSigned: true,
                signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                signatureHash: `SIG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
              };
            }
            return s;
          });
          return {
            ...ba,
            signatories: updatedSigs,
            tigresRef: tigresRef || ba.tigresRef
          };
        }
        return ba;
      })
    })));
  };

  const advanceApproval = (projectId: string, nextStage: number, comments: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId && p.justifikasi) {
        const stage = nextStage || Math.min(6, p.justifikasi.currentApprovalStage + 1);
        const newHistory = [
          ...p.justifikasi.approvalHistory,
          {
            step: `Tahap Approval ${stage}`,
            actor: userRole,
            role: userRole,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'APPROVED' as const,
            comments: comments || 'Disetujui ke tahap selanjutnya'
          }
        ];
        const newStatus = stage >= 5 ? 'DISETUJUI' : p.justifikasi.status;
        return {
          ...p,
          justifikasi: {
            ...p.justifikasi,
            currentApprovalStage: stage,
            status: newStatus,
            approvalHistory: newHistory
          }
        };
      }
      return p;
    }));
  };

  const requestRevision = (projectId: string, comments: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId && p.justifikasi) {
        const newHistory = [
          ...p.justifikasi.approvalHistory,
          {
            step: 'Permintaan Revisi',
            actor: userRole,
            role: userRole,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'REVISION_REQUESTED' as const,
            comments: comments || 'Perlu perbaikan dokumen pendukung'
          }
        ];
        return {
          ...p,
          justifikasi: {
            ...p.justifikasi,
            status: 'REVISI_DIBUTUHKAN',
            approvalHistory: newHistory
          }
        };
      }
      return p;
    }));
  };

  const resolveIssue = (issueId: string) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, resolved: true } : i));
  };

  const linkItemToBA = (projectId: string, itemId: string, baId: string, baItemName: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId && p.justifikasi) {
        const updatedItems = p.justifikasi.items.map(it => {
          if (it.id === itemId) {
            return {
              ...it,
              linkedBaId: baId,
              linkedBaItemName: baItemName,
              evidenceStatus: 'VERIFIED' as const,
              similarityScore: 98
            };
          }
          return it;
        });
        return {
          ...p,
          justifikasi: {
            ...p.justifikasi,
            items: updatedItems
          }
        };
      }
      return p;
    }));
  };

  const createProposal = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    const newProp: ProposalModifikasi = {
      id: `PROP-${Date.now()}`,
      projectId: proj.id,
      projectCode: proj.code,
      projectName: proj.name,
      ipa: proj.ipa,
      proposalNumber: `PRP/${proj.code.split('-')[1]}/2026/0${proposals.length + 1}`,
      triggerDeviationPct: proj.justifikasi?.financialSummary.variancePercentage || 12.0,
      netVarianceValue: proj.justificationDelta,
      thresholdPct,
      summary: `Pengajuan Adendum Kontrak & Modifikasi Pekerjaan untuk Proyek ${proj.name} karena deviasi melebihi ambang batas ${thresholdPct}%.`,
      status: 'DRAFT',
      approvals: [
        { party: 'SUCOFINDO', status: 'PENDING' },
        { party: 'PAMJAYA', status: 'PENDING' }
      ],
      createdAt: new Date().toISOString()
    };
    setProposals(prev => [newProp, ...prev]);
  };

  const submitProposal = (proposalId: string, tigresRef: TigresRef) => {
    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'DIAJUKAN', tigresRef } : p));
  };

  const decideProposal = (
    proposalId: string, 
    party: 'SUCOFINDO' | 'PAMJAYA', 
    decision: 'APPROVED' | 'REJECTED', 
    decidedBy: string, 
    note: string, 
    tigresRef: TigresRef
  ) => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        const updatedApprovals = p.approvals.map(a => {
          if (a.party === party) {
            return {
              ...a,
              status: decision,
              decidedBy,
              decidedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              note,
              tigresRef
            };
          }
          return a;
        });

        const allApproved = updatedApprovals.every(a => a.status === 'APPROVED');
        const anyRejected = updatedApprovals.some(a => a.status === 'REJECTED');
        let newStatus = p.status;
        if (anyRejected) newStatus = 'DITOLAK';
        else if (allApproved) newStatus = 'DISETUJUI';

        return {
          ...p,
          status: newStatus,
          approvals: updatedApprovals
        };
      }
      return p;
    }));
  };

  const getGate = (projectId: string) => {
    return gates.find(g => g.projectId === projectId) || { projectId, items: [] };
  };

  const toggleGate = (projectId: string, gateItemId: string, officerName: string) => {
    setGates(prev => prev.map(g => {
      if (g.projectId === projectId) {
        const updatedItems = g.items.map(item => {
          if (item.id === gateItemId) {
            const nextCompleted = !item.isCompleted;
            return {
              ...item,
              isCompleted: nextCompleted,
              checkedBy: nextCompleted ? officerName : undefined,
              checkedAt: nextCompleted ? new Date().toISOString().split('T')[0] : undefined
            };
          }
          return item;
        });
        return { ...g, items: updatedItems };
      }
      return g;
    }));
  };

  const resetPortfolio = () => {
    localStorage.removeItem(`${STORAGE_KEY}_projects`);
    localStorage.removeItem(`${STORAGE_KEY}_proposals`);
    localStorage.removeItem(`${STORAGE_KEY}_issues`);
    localStorage.removeItem(`${STORAGE_KEY}_gates`);
    localStorage.removeItem(`${STORAGE_KEY}_threshold`);
    setProjects(INITIAL_PROJECTS);
    setProposals([]);
    setIssues(INITIAL_DISCREPANCIES);
    setThresholdPct(10);
  };

  return {
    projects: evaluatedProjects,
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
  };
}
