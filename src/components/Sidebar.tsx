import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileCheck,
  Calculator,
  GitCommit,
  FileSearch,
  ShieldAlert,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UploadCloud,
  FileSpreadsheet,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  Plus,
} from 'lucide-react';
import { DocumentPackage, VerificationResult } from '../types';
import { DashboardLogo } from './DashboardLogo';

export type TabType =
  | 'welcome'
  | 'dashboard'
  | 'program_database'
  | 'technical'
  | 'financial'
  | 'traceability'
  | 'evidence'
  | 'exceptions'
  | 'raw_bapl';

interface NavItem {
  id: TabType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  group: 'main' | 'verification' | 'evidence' | 'compliance';
  getBadge?: (result: VerificationResult | null, highExceptions: number) => {
    text: string;
    variant: 'default' | 'danger' | 'success' | 'warning' | 'info';
  } | null;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Executive',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
    group: 'main',
    getBadge: (res) => {
      if (!res) return null;
      return { text: 'Overview', variant: 'default' };
    },
  },
  {
    id: 'program_database',
    label: 'Database Program',
    shortLabel: 'Database',
    icon: Layers,
    group: 'main',
    getBadge: () => ({ text: 'Arsip', variant: 'info' }),
  },
  {
    id: 'technical',
    label: 'Verifikasi Teknis (JusTek)',
    shortLabel: 'Verif Teknis',
    icon: FileCheck,
    group: 'verification',
    getBadge: (res) => {
      if (!res || !res.changes) return null;
      return { text: `${res.changes.length} Item`, variant: 'default' };
    },
  },
  {
    id: 'financial',
    label: 'Verifikasi Finansial (JusFin)',
    shortLabel: 'Verif Finansial',
    icon: Calculator,
    group: 'verification',
    getBadge: (res) => {
      if (!res) return null;
      if (!res.total_rab.delta_match) {
        return { text: 'Selisih', variant: 'danger' };
      }
      return { text: 'Cocok', variant: 'success' };
    },
  },
  {
    id: 'traceability',
    label: 'Matriks Traceability',
    shortLabel: 'Traceability',
    icon: GitCommit,
    group: 'verification',
    getBadge: (res) => {
      if (!res || !res.traceability) return null;
      return { text: `${res.traceability.length} Jalur`, variant: 'default' };
    },
  },
  {
    id: 'evidence',
    label: 'Audit Evidence (Dokumen)',
    shortLabel: 'Evidence',
    icon: FileSearch,
    group: 'evidence',
    getBadge: (res) => {
      if (!res || !res.evidences) return null;
      return { text: `${res.evidences.length} Bukti`, variant: 'default' };
    },
  },
  {
    id: 'raw_bapl',
    label: 'Hasil OCR & Raw BAPL',
    shortLabel: 'Raw OCR',
    icon: FileText,
    group: 'evidence',
    getBadge: (res) => {
      if (!res || !res.raw_bapl) return null;
      return { text: `${res.raw_bapl.length} Hal`, variant: 'info' };
    },
  },
  {
    id: 'exceptions',
    label: 'Temuan & Exception',
    shortLabel: 'Temuan',
    icon: ShieldAlert,
    group: 'compliance',
    getBadge: (_res, highCount) => {
      if (highCount > 0) {
        return { text: `${highCount} Kritis`, variant: 'danger' };
      }
      return null;
    },
  },
];

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  packages: DocumentPackage[];
  activePackageId: string;
  onSelectPackage: (packageId: string) => void;
  onAddNewPackage: () => void;
  onOpenConfig: () => void;
  onOpenReset: () => void;
  result: VerificationResult | null;
  highExceptionsCount: number;
  isProcessing: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  packages,
  activePackageId,
  onSelectPackage,
  onAddNewPackage,
  onOpenConfig,
  onOpenReset,
  result,
  highExceptionsCount,
  isProcessing,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const activePackage = packages.find((p) => p.id === activePackageId) || packages[0];

  const handleTabClick = (tab: TabType) => {
    onSelectTab(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const getBadgeClasses = (variant: 'default' | 'danger' | 'success' | 'warning' | 'info') => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30 animate-pulse';
      case 'success':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'info':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const renderGroup = (
    title: string,
    groupKey: 'main' | 'verification' | 'evidence' | 'compliance'
  ) => {
    const items = NAV_ITEMS.filter((item) => item.group === groupKey);
    return (
      <div className="space-y-1">
        {!isCollapsed && (
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300/80 flex items-center justify-between">
            <span>{title}</span>
          </div>
        )}
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = item.getBadge?.(result, highExceptionsCount);

            return (
              <button
                id={`tab-${item.id}`}
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                title={isCollapsed ? `${item.label} ${badge ? `(${badge.text})` : ''}` : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0054a6] via-[#0077c8] to-amber-500 text-white shadow-md shadow-sky-950/40 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {/* Active Indicator bar on left */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-300 rounded-r-full shadow-xs" />
                )}

                <div
                  className={`shrink-0 p-1 rounded-lg transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                    <span className="truncate">{item.label}</span>
                    {badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ml-1.5 ${getBadgeClasses(
                          badge.variant
                        )}`}
                      >
                        {badge.text}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile/Small Tablet Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-gradient-to-b from-[#061e38] via-[#09294d] to-[#041527] text-white border-r border-[#0e355c] transition-all duration-300 ease-in-out shadow-2xl ${
          // Mobile open / close
          isMobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop / Laptop collapse state
          isCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="p-3.5 border-b border-[#0e355c] flex items-center justify-between shrink-0 bg-black/20">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="bg-white/10 rounded-lg p-1 shrink-0">
                <DashboardLogo size="sm" showText={false} animated={true} className="h-6 w-auto" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-white tracking-tight truncate flex items-center gap-1.5">
                  <span>PRIMA</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-cyan-300 truncate">
                  Project Records, Intelligence, Monitoring and Assurance
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto bg-white/10 rounded-lg p-1">
              <DashboardLogo size="sm" showText={false} animated={true} className="h-5 w-auto" />
            </div>
          )}

          {/* Desktop/Laptop Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Perbesar Sidebar' : 'Kecilkan Sidebar'}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-amber-300" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {/* Scrollable Nav Item Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {renderGroup('Ikhtisar', 'main')}
          {renderGroup('Verifikasi Utama', 'verification')}
          {renderGroup('Data & Bukti Lapangan', 'evidence')}
          {renderGroup('Kepatuhan & Temuan', 'compliance')}
        </div>

        {/* Quick Action Footer Controls */}
        <div className="p-2.5 border-t border-[#0e355c] bg-slate-950/60 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">


              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 px-1">
                <button
                  type="button"
                  onClick={onOpenConfig}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <Sliders className="w-3 h-3 text-slate-400" />
                  <span>Ambang Batas</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenReset}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center">

              <button
                type="button"
                onClick={onOpenConfig}
                title="Pengaturan Ambang Batas"
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* User / Department Info Footer */}
        <div className="p-2.5 border-t border-[#0e355c] bg-black/40 flex items-center justify-between text-xs shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0054a6] to-[#009ee2] flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                PRIMA
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white truncate">
                  Reviewer Teknis &amp; Finansial
                </div>
                <div className="text-[10px] text-cyan-300 truncate">
                  PRIMA &bull; Aktif
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0054a6] to-[#009ee2] flex items-center justify-center text-white font-bold text-[9px]">
                PRIMA
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
