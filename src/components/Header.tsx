import React from 'react';
import {
  Menu,
  ChevronRight,
  Home,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { VerificationResult } from '../types';
import { DashboardLogo } from './DashboardLogo';
import { RealTimeClock } from './RealTimeClock';

interface HeaderProps {
  result: VerificationResult | null;
  onOpenConfig?: () => void;
  onOpenReview?: () => void;
  onOpenReset?: () => void;
  onDownloadPdf?: () => void;
  isProcessing?: boolean;
  onToggleSidebar?: () => void;
  activeTabName?: string;
  activeProjectCode?: string;
  onNavigateWelcome?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  result,
  onOpenConfig,
  onOpenReview,
  onOpenReset,
  onDownloadPdf,
  isProcessing = false,
  onToggleSidebar,
  activeTabName,
  activeProjectCode,
  onNavigateWelcome,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header
      id="app-header"
      className="bg-gradient-to-r from-[#002b5b] via-[#0054a6] to-[#f59e0b] dark:from-[#041527] dark:via-[#07264a] dark:to-[#92400e] text-white shadow-md sticky top-0 z-50 transition-colors"
    >
      {/* Running Text Marquee Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-amber-500 text-white font-extrabold text-[11px] py-1 px-3 overflow-hidden whitespace-nowrap shadow-xs flex items-center border-b border-white/20">
        <span className="bg-black/20 text-white px-2 py-0.5 rounded text-[9px] font-mono mr-2 shrink-0 animate-pulse">
          PRIMA 🚀
        </span>
        {React.createElement('marquee' as any, { scrollamount: "5", className: "font-bold tracking-wide" }, "PRIMA: Project Records, Intelligence, Monitoring and Assurance - Sistem Verifikasi Dokumen Proyek PMO Cyclical PT Air Bersih Jakarta 🚀")}
      </div>

      <div className="w-full px-3 sm:px-5">
        <div className="flex items-center justify-between py-2.5 sm:py-3 gap-2.5 flex-wrap lg:flex-nowrap">
          {/* Left: Sidebar Toggle, Logo & Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
            {/* Sidebar Toggle Button */}
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title="Buka / Tutup Menu Navigasi Sidebar"
                className="p-2 rounded-xl text-white hover:bg-white/20 border border-white/30 transition-colors cursor-pointer shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Logo PRIMA: Click to return to Welcome Page */}
            <div
              onClick={onNavigateWelcome}
              className="flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-95 transition-all group"
              title="PRIMA (Project Records, Intelligence, Monitoring and Assurance) - Kembali ke Laman Pengantar"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 relative flex items-center justify-center shrink-0">
                <DashboardLogo size="sm" showText={false} animated={true} />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-black text-sm sm:text-base tracking-wider text-white group-hover:text-amber-300 transition-colors font-sans">
                    PRIMA
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-2xs">
                    PMO
                  </span>
                </div>
                <span className="hidden xl:inline-block text-[9px] text-sky-100/90 font-medium tracking-tight whitespace-nowrap mt-0.5">
                  Project Records, Intelligence, Monitoring and Assurance
                </span>
              </div>
            </div>

            {/* Context Breadcrumbs */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-sky-100 font-medium truncate">
              <button
                type="button"
                onClick={onNavigateWelcome}
                className="text-amber-200 hover:text-white font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Pengantar</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
              {activeProjectCode && (
                <>
                  <span className="font-mono font-bold text-amber-300 bg-black/30 px-2 py-0.5 rounded-md border border-amber-400/40 shrink-0">
                    {activeProjectCode}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
                </>
              )}
              <span className="font-bold text-white bg-black/20 px-2.5 py-1 rounded-lg truncate">
                {activeTabName || 'Dashboard Executive'}
              </span>
            </div>
          </div>

          {/* Right: PDF export, Realtime Clock and Dark/Light Mode Toggle */}
          <div className="flex items-center space-x-2 shrink-0 ml-auto">
            {result && onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                title="Unduh Laporan Ringkasan Hasil Verifikasi Audit (PDF)"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all cursor-pointer shadow-xs hover:scale-105"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>Unduh Laporan PDF</span>
              </button>
            )}

            {/* Real-time Date and Clock */}
            <div className="text-white">
              <RealTimeClock className="inline-flex text-white font-semibold" />
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              id="btn-toggle-dark-mode"
              type="button"
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
              className="p-2 rounded-xl text-amber-200 bg-black/30 hover:bg-black/50 border border-white/30 transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-300 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-sky-100 transition-transform hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
