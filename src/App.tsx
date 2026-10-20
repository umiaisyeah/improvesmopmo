import React, { useState, useEffect, useRef } from 'react';
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
  Cloud,
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
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, googleSignOut } from './services/googleDriveAuth';

type TabType =
  | 'dashboard'
  | 'technical'
  | 'financial'
  | 'traceability'
  | 'evidence'
  | 'exceptions'
  | 'raw_bapl';

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
      if (savedActive) {
        return savedActive;
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[parsed.length - 1].id;
        }
      }
    } catch (e) {}
    return DEFAULT_PAKET_2.id;
  });

  const isStorageReady = useRef(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Load authoritative full package data from high-capacity IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    loadAllStoredPackages().then((stored) => {
      if (!isMounted) return;
      if (stored !== null) {
        // High capacity IndexedDB packages retrieved - ensures no user package is ever truncated
        setPackages(stored);
        isStorageReady.current = true;
        if (stored.length > 0) {
          getStoredActivePackageId().then((storedActiveId) => {
            if (!isMounted) return;
            if (storedActiveId && stored.some((p) => p.id === storedActiveId)) {
              setActivePackageId(storedActiveId);
            } else {
              setActivePackageId(stored[stored.length - 1].id);
            }
          });
        } else {
          setActivePackageId('');
        }
      } else {
        // Clean install on new browser: persist default starter packages into IndexedDB
        persistAllPackages([INITIAL_PACKAGE, DEFAULT_PAKET_2]);
        isStorageReady.current = true;
      }
    });

    return () => {
      isMounted = false;
    };
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
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedRawBaplPage, setSelectedRawBaplPage] = useState<number>(1);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showReset, setShowReset] = useState<boolean>(false);
  const [packageToDelete, setPackageToDelete] = useState<DocumentPackage | null>(null);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Google Drive Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState<boolean>(false);

  // Listen to Google OAuth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

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
        packageName,
        isGoldenTestCase: baplFiles.length === 0 && justekFiles.length === 0 && excelFiles.length === 0,
        customConfig: config,
        onProgress: (step, stepName, detail, pct) => {
          setProgress({ step, stepName, detail, percentage: pct });
        },
      });

      const newPackageId = `pkg-${Date.now()}`;
      const defaultTitle =
        packageName?.trim() ||
        `Program ${packages.length + 1}: ${
          output.project.projectCode || 'PROYEK'
        } - ${output.project.projectName || 'Hasil Verifikasi'}`;

      const primaryExcelName = excelFiles.find((f) => /\.(xlsx|xls|csv)$/i.test(f.name))?.name;

      const newPkg: DocumentPackage = {
        id: newPackageId,
        title: defaultTitle,
        projectCode: output.project.projectCode || 'PROYEK',
        projectName: output.project.projectName || 'Verifikasi Pasangan Dokumen',
        baplFiles:
          baplFiles.length > 0
            ? baplFiles.map((f) => ({ name: f.name, size: f.size }))
            : [
                {
                  name: `BAPL_${output.project.projectCode || 'LAPANGAN'}.pdf`,
                  size: 1428500,
                  pageCount: output.raw_bapl.length,
                },
              ],
        justekFiles: justekFiles.map((f) => ({
          name: f.name,
          size: f.size,
        })),
        excelFiles: excelFiles.map((f) => ({
          name: f.name,
          size: f.size,
        })),
        projectFiles: [
          ...justekFiles.map((f) => ({ name: f.name, size: f.size, type: 'PDF' })),
          ...excelFiles.map((f) => ({ name: f.name, size: f.size, type: 'Excel' })),
        ],
        excelFileName: primaryExcelName || (excelFiles.length > 0 ? excelFiles[0].name : undefined),
        supportingFiles: supportingFiles.map((f) => ({
          name: f.name,
          size: f.size,
        })),
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
        result: output,
      };

      // Add to packages list and persist immediately to high-capacity storage
      await persistSinglePackage(newPkg);
      setPackages((prev) => [...prev, newPkg]);
      setActivePackageId(newPackageId);
      setActiveTab('dashboard');
    } catch (err: any) {
      console.error('Pipeline execution error:', err);
      setPipelineError(
        err?.message || 'Terjadi kendala saat memproses berkas. Pastikan format berkas Excel atau PDF valid dan tidak terenkripsi/rusak.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadGoldenCase = () => {
    const existingGolden = packages.find((p) => p.projectCode === '46223A');
    if (existingGolden) {
      setActivePackageId(existingGolden.id);
      setActiveTab('dashboard');
      setShowUpload(false);
    } else {
      setPackages((prev) => [INITIAL_PACKAGE, ...prev]);
      setActivePackageId(INITIAL_PACKAGE.id);
      setActiveTab('dashboard');
      setShowUpload(false);
    }
  };

  const handleRenamePackage = (pkgId: string, newTitle: string) => {
    setPackages((prev) => {
      const updated = prev.map((p) => (p.id === pkgId ? { ...p, title: newTitle } : p));
      persistAllPackages(updated);
      return updated;
    });
  };

  const handleResetToGolden = async () => {
    const defaultPkgs = [INITIAL_PACKAGE, DEFAULT_PAKET_2];
    await persistAllPackages(defaultPkgs);
    setPackages(defaultPkgs);
    setActivePackageId(INITIAL_PACKAGE.id);
    setActiveTab('dashboard');
    setShowUpload(false);
  };

  const handleClearAll = async () => {
    await clearAllStoredPackages();
    setPackages([]);
    setActivePackageId('');
    setShowUpload(true);
  };

  const handleDeletePackage = async (pkgId: string) => {
    await removePackageFromStorage(pkgId);
    setPackages((prev) => {
      const updated = prev.filter((p) => p.id !== pkgId);
      persistAllPackages(updated);
      if (activePackageId === pkgId) {
        if (updated.length > 0) {
          setActivePackageId(updated[0].id);
        } else {
          setActivePackageId('');
          setShowUpload(true);
        }
      }
      return updated;
    });
  };

  const handleSaveReview = (review: HumanReview) => {
    if (!activePackage) return;
    const updatedResult = {
      ...activePackage.result,
      human_review: review,
    };
    setPackages((prev) => {
      const updated = prev.map((p) =>
        p.id === activePackage.id ? { ...p, result: updatedResult } : p
      );
      persistAllPackages(updated);
      return updated;
    });
  };

  const handleExportBackup = () => {
    if (packages.length === 0) return;
    exportPackagesBackup(packages);
  };

  const handleImportBackup = async (file: File) => {
    try {
      const imported = await importPackagesBackup(file);
      // Merge: replace existing duplicates with imported version, keep others
      const importedIds = new Set(imported.map((p) => p.id));
      const merged = [
        ...packages.filter((p) => !importedIds.has(p.id)),
        ...imported,
      ];
      await persistAllPackages(merged);
      setPackages(merged);
      if (imported.length > 0) {
        setActivePackageId(imported[imported.length - 1].id);
      }
      setImportNotification(
        `Berhasil memulihkan ${imported.length} paket dokumen dari berkas cadangan JSON! Data tersimpan permanen di database browser.`
      );
      setTimeout(() => setImportNotification(null), 6000);
    } catch (err: any) {
      setPipelineError(
        err?.message || 'Gagal mengimpor berkas cadangan JSON. Pastikan format file sesuai.'
      );
    }
  };

  const emptyStateFileInputRef = useRef<HTMLInputElement>(null);

  const handleGoogleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleAccessToken(res.accessToken);
        setImportNotification(`Google Drive terhubung dengan akun ${res.user.email}!`);
        setTimeout(() => setImportNotification(null), 5000);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
    }
  };

  const handleGoogleLogout = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setGoogleAccessToken(null);
    setImportNotification('Koneksi Google Drive telah diputuskan.');
    setTimeout(() => setImportNotification(null), 4000);
  };

  const handleImportFromDrive = async (pkg: DocumentPackage) => {
    const existingIds = new Set(packages.map((p) => p.id));
    const merged = existingIds.has(pkg.id)
      ? packages.map((p) => (p.id === pkg.id ? pkg : p))
      : [...packages, pkg];

    await persistAllPackages(merged);
    setPackages(merged);
    setActivePackageId(pkg.id);
    setActiveTab('dashboard');
    setShowGoogleDriveModal(false);
    setImportNotification(`Paket "${pkg.title}" berhasil dimuat dari Google Drive!`);
    setTimeout(() => setImportNotification(null), 5000);
  };

  const highExceptionsCount =
    result?.exceptions.filter((e) => e.priority === 'HIGH').length || 0;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Primary Header with Reset Button */}
      <Header
        result={result}
        onOpenUpload={() => setShowUpload(!showUpload)}
        onLoadGoldenCase={handleLoadGoldenCase}
        onOpenConfig={() => setShowConfig(true)}
        onOpenReview={() => setShowReview(true)}
        onOpenReset={() => setShowReset(true)}
        onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
        googleUser={googleUser}
        isProcessing={isProcessing}
      />

      {/* Expandable Upload Panel */}
      {showUpload && (
        <UploadSection
          onRunVerification={handleRunPipeline}
          onLoadGoldenCase={handleLoadGoldenCase}
          isProcessing={isProcessing}
          onClose={() => setShowUpload(false)}
          existingPackageCount={packages.length}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
            onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
            isGoogleDriveConnected={Boolean(googleUser && googleAccessToken)}
          />
        )}

        {/* Progress Stepper during active run */}
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
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FolderSync className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Belum Ada Pasangan Dokumen
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Sistem telah di-reset. Silakan upload pasangan dokumen BAPL (bisa multi-dokumen), Justek, Jusfin &amp; RAB di atas, atau muat data sampel acuan, atau pulihkan dari file cadangan JSON / Google Drive.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Dokumen Sekarang</span>
              </button>
              <button
                type="button"
                onClick={() => emptyStateFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 rotate-180" />
                <span>Pulihkan Cadangan (JSON)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGoogleDriveModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Buka dari Google Drive</span>
              </button>
              <button
                type="button"
                onClick={handleLoadGoldenCase}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Muat Golden Test Case</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation & Content */}
        {result && !isProcessing && (
          <div className="space-y-6">
            {/* Tab Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
              <button
                id="tab-dashboard"
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Executive</span>
              </button>

              <button
                id="tab-technical"
                type="button"
                onClick={() => setActiveTab('technical')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'technical'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Verifikasi Teknis (Approval JusTek)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700">
                  {result.changes.length}
                </span>
              </button>

              <button
                id="tab-financial"
                type="button"
                onClick={() => setActiveTab('financial')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'financial'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Verifikasi Finansial (Approval JusFin)</span>
                {!result.total_rab.delta_match && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    Diff
                  </span>
                )}
              </button>

              <button
                id="tab-traceability"
                type="button"
                onClick={() => setActiveTab('traceability')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'traceability'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <GitCommit className="w-4 h-4" />
                <span>Matriks Traceability</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700">
                  {result.traceability.length}
                </span>
              </button>

              <button
                id="tab-evidence"
                type="button"
                onClick={() => setActiveTab('evidence')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'evidence'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Automated BAPL Verification System &copy; 2026 • Standar PMO &amp; Audit Kepatuhan Kontrak
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Multi-BAPL Document Extractor</span>
            <span>•</span>
            <span>Independent Document Pairing Engine</span>
            <span>•</span>
            <span>Deterministic Math Recalculator</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showReview && result && (
        <HumanReviewModal
          initialReview={result.human_review}
          onSave={handleSaveReview}
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

      {showGoogleDriveModal && (
        <GoogleDriveModal
          user={googleUser}
          accessToken={googleAccessToken}
          packages={packages}
          onLogin={handleGoogleLogin}
          onLogout={handleGoogleLogout}
          onImportFromDrive={handleImportFromDrive}
          onClose={() => setShowGoogleDriveModal(false)}
        />
      )}
    </div>
  );
}
