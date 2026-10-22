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
} from 'lucide-react';
import {
  VerificationResult,
  SystemConfig,
  HumanReview,
  DocumentPackage,
} from './types';
import { DEFAULT_CONFIG } from './config/defaultConfig';
import { GOLDEN_TEST_CASE_RESULT } from './data/goldenTestCase';
import { DEFAULT_PAKET_2 } from './data/paket2Data';
import { runVerificationPipeline } from './services/verificationPipeline';
import { downloadVerificationExcel } from './services/excelGenerator';
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

const INITIAL_PACKAGE: DocumentPackage = {
  id: 'pkg-46223A',
  title: 'Program 1: Proyek 46223A - Sistem Proteksi Petir',
  projectCode: '46223A',
  projectName:
    'Cyclical Maintenance - Penggantian IPP Area Gedung Distribusi, Filter, dan Substation',
  baplFiles: [
    { name: 'BAPL_Proyek_46223A_Fisik.pdf', size: 1428500, pageCount: 5 },
  ],
  excelFileName: 'RAB_JusTek_JusFin_46223A.xlsx',
  supportingFiles: [
    { name: 'DED_Drawing_Petir_46223A.pdf', size: 3120000 },
    { name: 'MCO_Approval_PLN.pdf', size: 840000 },
  ],
  createdAt: '2026-08-14T09:30:00.000Z',
  status: 'COMPLETED',
  result: GOLDEN_TEST_CASE_RESULT,
};

const STORAGE_KEY = 'bapl_verification_packages_v1';

export default function App() {
  // Synchronous initial state from localStorage if available (fast first render)
  const [packages, setPackages] = useState<DocumentPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed: DocumentPackage[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Initial localStorage read:', e);
    }
    return [INITIAL_PACKAGE, DEFAULT_PAKET_2];
  });

  const [activePackageId, setActivePackageId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('bapl_active_package_id');
      if (savedActive) return savedActive;
    } catch (e) {
      // ignore
    }
    return 'pkg-46223A';
  });

  const [importNotification, setImportNotification] = useState<string | null>(null);
  const isStorageReady = useRef<boolean>(false);

  // High-capacity indexed/local storage loader
  useEffect(() => {
    async function initStorage() {
      try {
        const stored = await loadAllStoredPackages();
        if (stored && stored.length > 0) {
          setPackages(stored);
          const savedActive = await getStoredActivePackageId();
          if (savedActive && stored.some((p) => p.id === savedActive)) {
            setActivePackageId(savedActive);
          } else {
            setActivePackageId(stored[0].id);
          }
        } else {
          // Seed initial defaults into persistent storage
          await persistAllPackages([INITIAL_PACKAGE, DEFAULT_PAKET_2]);
          await persistActivePackageId(INITIAL_PACKAGE.id);
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

  // Current active package and active result
  const activePackage =
    packages.find((p) => p.id === activePackageId) || packages[0] || null;
  const result = activePackage ? activePackage.result : null;

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
      const newPackage: DocumentPackage = {
        id: newPackageId,
        title: packageName || `Program ${packages.length + 1}: ${output.project.projectName}`,
        projectCode,
        projectName: output.project.projectName,
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

  const handleLoadGoldenCase = async () => {
    setIsProcessing(true);
    setProgress({
      step: 1,
      stepName: 'Memuat Data Acuan',
      detail: 'Menyiapkan paket acuan Proyek 46223A',
      percentage: 30,
    });

    setTimeout(async () => {
      setProgress({
        step: 5,
        stepName: 'Selesai',
        detail: 'Paket acuan Proyek 46223A siap ditinjau',
        percentage: 100,
      });

      const existingGolden = packages.find((p) => p.id === 'pkg-46223A');
      if (existingGolden) {
        setActivePackageId('pkg-46223A');
      } else {
        const updated = [INITIAL_PACKAGE, ...packages];
        await persistAllPackages(updated);
        setPackages(updated);
        setActivePackageId(INITIAL_PACKAGE.id);
      }
      setActiveTab('dashboard');
      setIsProcessing(false);
    }, 400);
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
    await persistAllPackages([INITIAL_PACKAGE, DEFAULT_PAKET_2]);
    await persistActivePackageId(INITIAL_PACKAGE.id);
    setPackages([INITIAL_PACKAGE, DEFAULT_PAKET_2]);
    setActivePackageId(INITIAL_PACKAGE.id);
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
      <WelcomeView
        onEnterDashboard={handleEnterDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex font-sans antialiased relative w-full max-w-full overflow-x-hidden selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
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
        onDownloadExcel={() => result && downloadVerificationExcel(result)}
        result={result}
        highExceptionsCount={highExceptionsCount}
        isProcessing={isProcessing}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Column - Fluid Layout Automatically Resizing on Sidebar Toggle */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out w-full max-w-full overflow-x-hidden ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Primary Header with Batas Domain, Clock, and Dark Mode Toggle */}
        <Header
          result={result}
          onOpenConfig={() => setShowConfig(true)}
          onOpenReview={() => setShowReview(true)}
          onOpenReset={() => setShowReset(true)}
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
        />

        {/* Expandable Upload Panel */}
        {showUpload && (
          <UploadSection
            onRunVerification={handleRunPipeline}
            isProcessing={isProcessing}
            onClose={() => setShowUpload(false)}
            existingPackageCount={packages.length}
          />
        )}

        {/* Main Content Area - Fluid width without clipping */}
        <main className="flex-1 w-full max-w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-5 overflow-x-hidden min-h-0">
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

          {/* Empty State when all packages cleared */}
          {packages.length === 0 && !isProcessing && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
              <input
                type="file"
                ref={emptyStateFileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportBackup(file);
                  e.target.value = '';
                }}
                accept=".json,application/json"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0054a6] flex items-center justify-center mx-auto">
                <FolderSync className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Belum Ada Pasangan Dokumen
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Sistem telah di-reset. Silakan upload pasangan dokumen BAPL, Justek, Jusfin &amp; RAB menggunakan tombol di bawah atau pulihkan dari file cadangan JSON.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#0054a6] via-[#0080c8] to-amber-500 hover:from-[#004690] hover:to-amber-600 shadow-xs ring-2 ring-amber-400/30 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Dokumen Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={() => emptyStateFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 rotate-180" />
                  <span>Pulihkan Cadangan (JSON)</span>
                </button>
              </div>
            </div>
          )}

          {/* Verification Workspace (Dashboard, Technical, Financial, etc.) */}
          <div className="space-y-5">
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
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        activeTab === 'dashboard'
                          ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Executive Dashboard</span>
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
                        onDeletePackage={handleDeletePackage}
                      />
                    )}

                    {activeTab === 'dashboard' && (
                      <DashboardView
                        result={result}
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
                      <TraceabilityView records={result.traceability} />
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
            </div>
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
