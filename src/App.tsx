import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  FileCheck,
  Calculator,
  GitCommit,
  FileSearch,
  ShieldAlert,
  FileText,
  Sparkles,
  Download,
  FolderSync,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  Home,
  Layers,
} from 'lucide-react';
import {
  VerificationResult,
  SystemConfig,
  HumanReview,
  DocumentPackage,
  PrimaUser,
} from './types';
import { DEFAULT_CONFIG } from './config/defaultConfig';
import { runVerificationPipeline } from './services/verificationPipeline';
import { downloadVerificationExcel } from './services/excelGenerator';
import { downloadVerificationPdf } from './services/pdfGenerator';
import {
  loadAllStoredPackages,
  persistAllPackages,
  persistSinglePackage,
  removePackageFromStorage,
  clearAllStoredPackages,
  persistActivePackageId,
  getStoredActivePackageId,
  exportPackagesBackup,
  importPackagesBackup,
} from './services/storageService';
import { autoCategorizeIpa } from './utils/ipaCategorizer';
import { getStoredUser, logoutUser } from './services/authService';
import { LoginModal } from './components/LoginModal';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { VerificationProgress } from './components/VerificationProgress';
import { DashboardView } from './components/DashboardView';
import { TechnicalVerificationView } from './components/TechnicalVerificationView';
import { FinancialVerificationView } from './components/FinancialVerificationView';
import { TraceabilityView } from './components/TraceabilityView';
import { EvidenceView } from './components/EvidenceView';
import { ExceptionsView } from './components/ExceptionsView';
import { RawBaplView } from './components/RawBaplView';
import { HumanReviewModal } from './components/HumanReviewModal';
import { ConfigModal } from './components/ConfigModal';
import { DocumentPackageBar } from './components/DocumentPackageBar';
import { ResetModal } from './components/ResetModal';
import { DeletePackageModal } from './components/DeletePackageModal';
import { Sidebar, TabType } from './components/Sidebar';
import { WelcomeView } from './components/WelcomeView';
import { ProgramDatabaseView } from './components/ProgramDatabaseView';
import { PortfolioWorkspace } from './components/PortfolioWorkspace';

export const EMPTY_RESULT: VerificationResult = {
  project: {
    projectCode: 'BELUM ADA DOKUMEN',
    projectName: 'Belum ada dokumen atau program yang diunggah ke PRIMA',
    subproject: 'Instalasi Pengolahan Air (IPA) Jakarta',
    location: 'Wilayah Operasional PAM Jaya / ABJ',
    contractor: 'Belum Ditentukan',
    poNumber: '-',
    baplNumber: '-',
    date: new Date().toISOString().split('T')[0],
    revision: 'Rev.0',
    packageContractInfo: 'Standar Proyek Cyclical',
    identityMatchStatus: 'MATCH',
  },
  generated_at: new Date().toISOString(),
  config: DEFAULT_CONFIG,
  changes: [],
  financial_items: [],
  total_rab: {
    rab_initial: 0,
    rab_revised: 0,
    system_calculated_delta: 0,
    system_calculated_percentage: 0,
    stated_jusfin_delta: 0,
    delta_match: true,
    threshold_percentage: 0.1,
    threshold_exceeded: false,
    proposal_modification_required: false,
    status: 'VERIFIED',
    explanation: 'Belum ada data anggaran yang diunggah.',
  },
  traceability: [],
  evidences: [],
  exceptions: [],
  raw_bapl: [],
  human_review: {
    pmo_review_status: 'PENDING',
    pmo_comments: 'Belum ada berkas dokumen yang diunggah untuk ditinjau.',
    final_decision: 'PENDING',
    reviewed_by: '-',
    review_date: '-',
  },
  summary: {
    total_items: 0,
    verified: 0,
    mismatch: 0,
    need_support: 0,
    review: 0,
    not_found: 0,
    ba_anomalies_count: 0,
    unreferenced_financial_count: 0,
  },
  technical_summary: {
    material_changes: 0,
    quantity_changes: 0,
    scope_changes: 0,
    method_changes: 0,
    dimension_changes: 0,
  },
};

const STORAGE_KEY = 'bapl_verification_packages_v1';

export default function App() {
  // Synchronous initial state from localStorage (excluding previous permanent packages pkg-46223A & pkg-46308)
  const [packages, setPackages] = useState<DocumentPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed: DocumentPackage[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => p.id !== 'pkg-46223A' && p.id !== 'pkg-46308');
        }
      }
    } catch (e) {
      console.warn('Initial localStorage read:', e);
    }
    return [];
  });

  const [activePackageId, setActivePackageId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('bapl_active_package_id');
      if (savedActive && savedActive !== 'pkg-46223A' && savedActive !== 'pkg-46308') {
        return savedActive;
      }
    } catch (e) {
      // ignore
    }
    return '';
  });

  // Authentication State with PMO, Planning, and PGO checking parties
  const [currentUser, setCurrentUser] = useState<PrimaUser | null>(() => getStoredUser());
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const [importNotification, setImportNotification] = useState<string | null>(null);
  const isStorageReady = useRef<boolean>(false);

  // High-capacity indexed/local storage loader
  useEffect(() => {
    async function initStorage() {
      try {
        const stored = await loadAllStoredPackages();
        const filtered = (stored || []).filter(
          (p) => p.id !== 'pkg-46223A' && p.id !== 'pkg-46308'
        );
        if (filtered.length > 0) {
          setPackages(filtered);
          const savedActive = await getStoredActivePackageId();
          if (savedActive && filtered.some((p) => p.id === savedActive)) {
            setActivePackageId(savedActive);
          } else {
            setActivePackageId(filtered[0].id);
          }
        } else {
          setPackages([]);
          setActivePackageId('');
        }
      } catch (err) {
        console.error('Failed to initialize storage:', err);
      } finally {
        isStorageReady.current = true;
      }
    }
    initStorage();
  }, []);

  // Sync to high-capacity storage whenever packages state changes
  useEffect(() => {
    if (!isStorageReady.current) return;
    persistAllPackages(packages);
  }, [packages]);

  // Sync active package ID
  useEffect(() => {
    if (!isStorageReady.current) return;
    if (activePackageId) {
      persistActivePackageId(activePackageId);
    }
  }, [activePackageId]);

  // Dedicated pre-dashboard entry state: Welcome page is shown first when link is opened
  const [hasEnteredDashboard, setHasEnteredDashboard] = useState<boolean>(false);

  // Dark / Light Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pmo_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      try {
        localStorage.setItem('pmo_theme', 'dark');
      } catch {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('pmo_theme', 'light');
      } catch {}
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleEnterDashboard = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setHasEnteredDashboard(true);
    setActiveTab('dashboard');
    try {
      sessionStorage.setItem('pmo_has_entered_dashboard', 'true');
    } catch {}
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setHasEnteredDashboard(false);
    try {
      sessionStorage.removeItem('pmo_has_entered_dashboard');
    } catch {}
  };

  const handleLoginSuccess = (user: PrimaUser) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    setHasEnteredDashboard(true);
    setActiveTab('dashboard');
    try {
      sessionStorage.setItem('pmo_has_entered_dashboard', 'true');
    } catch {}
  };

  const handleNavigateWelcome = () => {
    setHasEnteredDashboard(false);
    try {
      sessionStorage.setItem('pmo_has_entered_dashboard', 'false');
    } catch {}
  };

  // Default active view inside the dashboard
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedRawBaplPage, setSelectedRawBaplPage] = useState<number>(1);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showReset, setShowReset] = useState<boolean>(false);
  const [packageToDelete, setPackageToDelete] = useState<DocumentPackage | null>(null);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const getActiveTabLabel = (tab: TabType): string => {
    switch (tab) {
      case 'welcome':
        return 'Laman Selamat Datang';
      case 'dashboard':
        return 'Dashboard Executive';
      case 'program_database':
        return 'Database Program';
      case 'technical':
        return 'Verifikasi Teknis (JusTek)';
      case 'financial':
        return 'Verifikasi Finansial (JusFin & RAB)';
      case 'traceability':
        return 'Matriks Traceability';
      case 'evidence':
        return 'Audit Evidence';
      case 'exceptions':
        return 'Exceptions & Temuan Audit';
      case 'raw_bapl':
        return 'Hasil OCR & Raw BAPL';
      case 'p_overview':
        return 'Portofolio: Ringkasan 6 IPA';
      case 'p_projects':
        return 'Portofolio: Project & Justifikasi';
      case 'p_timeline':
        return 'Portofolio: Timeline Pengerjaan';
      case 'p_ba':
        return 'Portofolio: Berita Acara Digital';
      case 'p_verification':
        return 'Portofolio: Cek Bukti & Nama Item';
      case 'p_proposal':
        return 'Portofolio: Proposal Modifikasi';
      case 'p_ded':
        return 'Portofolio: Analitik DED & Gate MC-0';
      case 'p_master':
        return 'Portofolio: Master Item Baku';
      case 'p_reconcile':
        return 'Portofolio: Rekonsiliasi JT/JF vs BA';
      default:
        return 'Dashboard Executive';
    }
  };

  // Pipeline Execution State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{
    step: number;
    stepName: string;
    detail: string;
    percentage: number;
  }>({
    step: 0,
    stepName: '',
    detail: '',
    percentage: 0,
  });

  // Current active package and active result (falls back to EMPTY_RESULT to maintain layout structure)
  const activePackage =
    packages.find((p) => p.id === activePackageId) || packages[0] || null;
  const result = activePackage ? activePackage.result : EMPTY_RESULT;

  const handleRunPipeline = async (
    baplFiles: File[],
    justekFiles: File[],
    excelFiles: File[],
    supportingFiles: File[],
    packageName?: string
  ) => {
    setIsProcessing(true);
    setPipelineError(null);
    setShowUpload(false);

    try {
      const output = await runVerificationPipeline({
        baplFiles,
        justekFiles,
        excelFiles,
        supportingFiles,
        customConfig: config,
        onProgress: (step, stepName, detail, percentage) =>
          setProgress({ step, stepName, detail, percentage }),
      });

      // Construct a new DocumentPackage
      const newPackageId = `pkg-${Date.now()}`;
      const projectCode = output.project.projectCode || `PRJ-${packages.length + 1}`;
      const programLabel = packageName || `Program ${packages.length + 1}: ${output.project.projectName}`;

      // Auto-categorize uploaded program into one of the 6 IPAs
      const detectedIpa = autoCategorizeIpa(
        `${programLabel} ${output.project.projectName} ${projectCode}`,
        baplFiles.map((f) => f.name).join(' ')
      );

      const newPackage: DocumentPackage = {
        id: newPackageId,
        title: programLabel,
        projectCode,
        projectName: output.project.projectName,
        ipa: detectedIpa,
        baplFiles: baplFiles.map((f) => ({
          name: f.name,
          size: f.size,
          pageCount: output.raw_bapl ? output.raw_bapl.length : 1,
        })),
        excelFileName: excelFiles[0]?.name || 'RAB_Data.xlsx',
        supportingFiles: supportingFiles.map((f) => ({
          name: f.name,
          size: f.size,
        })),
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
        result: output,
      };

      const updated = [newPackage, ...packages];
      await persistAllPackages(updated);
      setPackages(updated);
      setActivePackageId(newPackageId);
      setActiveTab('dashboard');
    } catch (err: any) {
      console.error('Pipeline failure:', err);
      setPipelineError(
        err?.message || 'Terjadi kesalahan sistem saat memproses dokumen.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    const updated = packages.filter((p) => p.id !== packageId);
    await removePackageFromStorage(packageId);
    await persistAllPackages(updated);
    setPackages(updated);

    if (activePackageId === packageId) {
      if (updated.length > 0) {
        setActivePackageId(updated[0].id);
      } else {
        setActivePackageId('');
      }
    }
  };

  const handleRenamePackage = async (packageId: string, newTitle: string) => {
    const updated = packages.map((p) =>
      p.id === packageId ? { ...p, title: newTitle } : p
    );
    await persistAllPackages(updated);
    setPackages(updated);
  };

  const handleResetToGolden = async () => {
    await clearAllStoredPackages();
    setPackages([]);
    setActivePackageId('');
    setActiveTab('dashboard');
    setShowReset(false);
  };

  const handleClearAll = async () => {
    await clearAllStoredPackages();
    setPackages([]);
    setActivePackageId('');
    setShowReset(false);
  };

  const handleExportBackup = () => {
    exportPackagesBackup(packages);
  };

  const handleImportBackup = async (file: File) => {
    try {
      const imported = await importPackagesBackup(file);
      const existingIds = new Set(packages.map((p) => p.id));
      const combined = [...packages];

      let addedCount = 0;
      for (const p of imported) {
        if (!existingIds.has(p.id)) {
          combined.push(p);
          addedCount++;
        }
      }

      await persistAllPackages(combined);
      setPackages(combined);
      if (imported.length > 0) {
        setActivePackageId(imported[0].id);
      }
      setImportNotification(
        `Berhasil memulihkan ${imported.length} paket data (${addedCount} paket baru ditambahkan)!`
      );
      setTimeout(() => setImportNotification(null), 5000);
    } catch (err: any) {
      alert(`Gagal memulihkan file cadangan: ${err.message}`);
    }
  };

  const emptyStateFileInputRef = useRef<HTMLInputElement>(null);

  const highExceptionsCount =
    result?.exceptions.filter((e) => e.priority === 'HIGH').length || 0;

  if (!hasEnteredDashboard) {
    return (
      <>
        <WelcomeView
          onEnterDashboard={handleEnterDashboard}
          currentUser={currentUser}
          onOpenLogin={() => setShowLoginModal(true)}
        />
        {showLoginModal && (
          <LoginModal
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex font-sans antialiased relative w-full max-w-full selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
      {/* Interactive Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'welcome') {
            handleNavigateWelcome();
          } else {
            setActiveTab(tab);
            setShowUpload(false);
          }
          if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
        }}
        packages={packages}
        activePackageId={activePackageId}
        onSelectPackage={(id) => {
          setActivePackageId(id);
          setShowUpload(false);
          if (activeTab === 'welcome') {
            setActiveTab('dashboard');
          }
          if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
        }}
        onAddNewPackage={() => setShowUpload(true)}
        onOpenConfig={() => setShowConfig(true)}
        onOpenReset={() => setShowReset(true)}
        result={result}
        highExceptionsCount={highExceptionsCount}
        isProcessing={isProcessing}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Column - Fixed Viewport with Locked Header */}
      <div
        className={`flex-1 flex flex-col h-screen max-h-screen min-w-0 transition-all duration-300 ease-in-out w-full max-w-full overflow-hidden ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Primary Header - Pinned and Locked at Top (Does Not Scroll) */}
        <div className="shrink-0 z-40 w-full shadow-xs">
          <Header
            result={result}
            onOpenConfig={() => setShowConfig(true)}
            onOpenReview={() => setShowReview(true)}
            onOpenReset={() => setShowReset(true)}
            onDownloadPdf={() => result && downloadVerificationPdf(result)}
            isProcessing={isProcessing}
            onToggleSidebar={() => {
              if (window.innerWidth < 768) {
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            activeTabName={getActiveTabLabel(activeTab)}
            activeProjectCode={activePackage?.projectCode}
            onNavigateWelcome={handleNavigateWelcome}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            currentUser={currentUser}
            onOpenLogin={() => setShowLoginModal(true)}
            onLogout={handleLogout}
          />
        </div>

        {/* Expandable Upload Panel */}
        {showUpload && (
          <div className="shrink-0 z-30 w-full overflow-y-auto max-h-[70vh]">
            <UploadSection
              onRunVerification={handleRunPipeline}
              isProcessing={isProcessing}
              onClose={() => setShowUpload(false)}
              existingPackageCount={packages.length}
            />
          </div>
        )}

        {/* Scrollable Content Container (Header stays locked at top while this scrolls) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col justify-between">
          <main className="flex-1 w-full max-w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-5">
            {/* Success / Notification Banner for Backup Restore */}
            {importNotification && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-xs font-semibold text-emerald-900">{importNotification}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setImportNotification(null)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 rounded-md hover:bg-emerald-100 transition-colors"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Error Notification Banner if pipeline fails */}
            {pipelineError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Kendala Pemrosesan Dokumen</h4>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{pipelineError}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPipelineError(null);
                      setShowUpload(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-2xs"
                  >
                    Unggah Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => setPipelineError(null)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-700 hover:bg-rose-100/60 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {/* Progress Indicator for Live Processing */}
            {isProcessing && (
              <VerificationProgress
                currentStep={progress.step}
                stepName={progress.stepName}
                detail={progress.detail}
                percentage={progress.percentage}
              />
            )}

            {/* Compute if current tab is portfolio tab */}
            {(() => {
              const isPortfolioTab = activeTab.startsWith('p_');

              return (
                <>
                  {/* Empty State Banner when no packages uploaded: Preserves Full Dashboard Layout for standard tabs */}
                  {packages.length === 0 && !isProcessing && !isPortfolioTab && (
                    <div className="bg-gradient-to-r from-sky-50 via-amber-50/50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-amber-300 dark:border-amber-500/50 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
                          <FolderSync className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950">
                              Status: Belum Ada Dokumen
                            </span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Layout dashboard dipertahankan
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                            Belum Ada Pasangan Program atau Dokumen Proyek yang Diunggah
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
                            Dashboard tetap menampilkan struktur lengkap dengan nilai awal 0. Setiap berkas yang Anda unggah akan otomatis dikategorikan ke salah satu dari 6 IPA Jakarta (IPA Buaran 1, 2, 3, IPA Pejompongan 1, 2, atau IPA Pulogadung).
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                        <button
                          type="button"
                          onClick={() => setShowUpload(true)}
                          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#0054a6] via-[#0080c8] to-amber-500 hover:from-[#004690] hover:to-amber-600 shadow-xs ring-2 ring-amber-400/30 transition-all cursor-pointer"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Upload Program / Dokumen</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verification Workspace (Dashboard, Technical, Financial, etc. vs Portfolio Workspace) */}
                  <div className="space-y-5">
                    {/* Render PortfolioWorkspace if on a portfolio tab */}
                    {isPortfolioTab ? (
                      <PortfolioWorkspace
                        activeTab={activeTab}
                        onOpenDocumentVerificationEngine={() => setActiveTab('dashboard')}
                        currentUser={currentUser}
                      />
                    ) : (
                      <>
                        {/* Document Package Bar: Lists every uploaded and processed document pair */}
                        {packages.length > 0 && !isProcessing && (
                          <DocumentPackageBar
                            packages={packages}
                            activePackageId={activePackageId}
                            onSelectPackage={(id) => {
                              setActivePackageId(id);
                              setShowUpload(false);
                            }}
                            onDeletePackage={handleDeletePackage}
                            onRequestDeletePackage={(pkg) => setPackageToDelete(pkg)}
                            onRenamePackage={handleRenamePackage}
                            onAddNewPackage={() => setShowUpload(true)}
                            onExportBackup={handleExportBackup}
                            onImportBackup={handleImportBackup}
                          />
                        )}

            {/* Tab Navigation & Content */}
            {result && !isProcessing && (
              <div className="space-y-5">
                {/* Tab Bar - Compact & Scroll-Safe on Laptops */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-sky-100 scrollbar-none">
                  <button
                    id="tab-welcome-header"
                    type="button"
                    onClick={handleNavigateWelcome}
                    title="Kembali ke Laman Selamat Datang"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all text-slate-600 hover:text-[#0054a6] hover:bg-sky-50 dark:text-slate-300 dark:hover:text-cyan-400 dark:hover:bg-slate-800"
                  >
                    <Home className="w-3.5 h-3.5 text-[#0054a6] dark:text-cyan-400" />
                    <span>Laman Selamat Datang</span>
                  </button>

                    <button
                      id="tab-dashboard"
                      type="button"
                      onClick={() => setActiveTab('dashboard')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === 'dashboard'
                          ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Executive Dashboard</span>
                    </button>

                    <button
                      id="tab-program_database"
                      type="button"
                      onClick={() => setActiveTab('program_database')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === 'program_database'
                          ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Database Program</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                        {packages.length}
                      </span>
                    </button>

                    <button
                      id="tab-technical"
                      type="button"
                      onClick={() => setActiveTab('technical')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        activeTab === 'technical'
                          ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Verifikasi Teknis</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                        {result.changes.length}
                      </span>
                    </button>

                    <button
                      id="tab-financial"
                      type="button"
                      onClick={() => setActiveTab('financial')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        activeTab === 'financial'
                          ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Verifikasi Finansial</span>
                      {!result.total_rab.delta_match ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                          Selisih
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                          Cocok
                        </span>
                      )}
                    </button>

                    <button
                      id="tab-traceability"
                      type="button"
                      onClick={() => setActiveTab('traceability')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        activeTab === 'traceability'
                          ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <GitCommit className="w-4 h-4" />
                      <span>Traceability</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                        {result.traceability.length}
                      </span>
                    </button>

                    <button
                      id="tab-evidence"
                      type="button"
                      onClick={() => setActiveTab('evidence')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        activeTab === 'evidence'
                          ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <FileSearch className="w-4 h-4" />
                      <span>Audit Evidence</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700">
                        {result.evidences.length}
                      </span>
                    </button>

                    <button
                      id="tab-exceptions"
                      type="button"
                      onClick={() => setActiveTab('exceptions')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        activeTab === 'exceptions'
                          ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Exceptions &amp; Temuan</span>
                      {highExceptionsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                          {highExceptionsCount} HIGH
                        </span>
                      )}
                    </button>

                    <button
                      id="tab-raw_bapl"
                      type="button"
                      onClick={() => setActiveTab('raw_bapl')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        activeTab === 'raw_bapl'
                          ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Hasil OCR &amp; Raw BAPL</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                        {result.raw_bapl.length} Hal
                      </span>
                    </button>
                  </div>

                  {/* Active View Component */}
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === 'program_database' && (
                      <ProgramDatabaseView
                        packages={packages}
                        activePackageId={activePackageId}
                        onSelectPackage={(id) => {
                          setActivePackageId(id);
                          setActiveTab('dashboard');
                        }}
                        onOpenUpload={() => setShowUpload(true)}
                        onDownloadExcel={() => result && downloadVerificationExcel(result)}
                        onDownloadPdf={() => result && downloadVerificationPdf(result)}
                        onDeletePackage={handleDeletePackage}
                      />
                    )}

                    {activeTab === 'dashboard' && (
                      <DashboardView
                        result={result}
                        packages={packages}
                        onSelectTab={(tab) => setActiveTab(tab as TabType)}
                        onDeleteCurrentPackage={
                          activePackage ? () => setPackageToDelete(activePackage) : undefined
                        }
                      />
                    )}

                    {activeTab === 'technical' && (
                      <TechnicalVerificationView changes={result.changes} />
                    )}

                    {activeTab === 'financial' && (
                      <FinancialVerificationView
                        totalRab={result.total_rab}
                        items={result.financial_items}
                        technicalChanges={result.changes}
                      />
                    )}

                    {activeTab === 'traceability' && (
                      <TraceabilityView
                        records={result.traceability}
                        project={result.project}
                        changes={result.changes}
                        financialItems={result.financial_items}
                        evidences={result.evidences}
                        totalRab={result.total_rab}
                        onDownloadPdf={() => result && downloadVerificationPdf(result)}
                      />
                    )}

                    {activeTab === 'evidence' && (
                      <EvidenceView
                        evidences={result.evidences}
                        onViewRawBapl={(page) => {
                          setSelectedRawBaplPage(page);
                          setActiveTab('raw_bapl');
                        }}
                      />
                    )}

                    {activeTab === 'exceptions' && (
                      <ExceptionsView exceptions={result.exceptions} />
                    )}

                    {activeTab === 'raw_bapl' && (
                      <RawBaplView
                        pages={result.raw_bapl}
                        initialPage={selectedRawBaplPage}
                      />
                    )}
                  </motion.div>
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  })()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-sky-100 py-4 mt-8 text-center text-xs text-slate-500 w-full shrink-0">
          <div className="w-full max-w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              PMO Cyclical Verifikasi Justifikasi Teknis &amp; Finansial &copy; 2026 &bull; PT Air Bersih Jakarta
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>SLA: 6 IPA Jakarta</span>
              <span>&bull;</span>
              <span>Standar SPI &amp; BPK RI</span>
            </div>
          </div>
        </footer>
      </div>
    </div>

    {/* Modals */}
      {showReview && result && (
        <HumanReviewModal
          initialReview={result.human_review}
          onSave={(updatedReview: HumanReview) => {
            const updatedResult: VerificationResult = {
              ...result,
              human_review: updatedReview,
            };
            const updatedPackages = packages.map((p) =>
              p.id === activePackageId ? { ...p, result: updatedResult } : p
            );
            const targetPkg = updatedPackages.find((p) => p.id === activePackageId);
            if (targetPkg) {
              persistSinglePackage(targetPkg);
            }
            setPackages(updatedPackages);
            setShowReview(false);
          }}
          onClose={() => setShowReview(false)}
        />
      )}

      {showConfig && (
        <ConfigModal
          config={config}
          onSave={(newCfg) => setConfig(newCfg)}
          onClose={() => setShowConfig(false)}
        />
      )}

      {showReset && (
        <ResetModal
          onResetToGolden={handleResetToGolden}
          onClearAll={handleClearAll}
          onClose={() => setShowReset(false)}
        />
      )}

      {showLoginModal && (
        <LoginModal
          currentUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {packageToDelete && (
        <DeletePackageModal
          pkg={packageToDelete}
          totalPackages={packages.length}
          onConfirmDelete={(id) => {
            handleDeletePackage(id);
            setPackageToDelete(null);
          }}
          onClose={() => setPackageToDelete(null)}
        />
      )}
    </div>
  );
}
