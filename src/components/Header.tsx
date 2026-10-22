import React from 'react';
import {
  Menu,
  ChevronRight,
  Home,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { VerificationResult } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { RealTimeClock } from './RealTimeClock';

interface HeaderProps {
  result: VerificationResult | null;
  onOpenConfig?: () => void;
  onOpenReview?: () => void;
  onOpenReset?: () => void;
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
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-sky-100 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors"
    >
      {/* Decorative top gradient line combining PT Air Bersih Jakarta Blue & Cheerful Sunny Yellow */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#002b5b] via-[#0054a6] via-[#00a3e0] to-[#f59e0b]" />

      <div className="w-full px-3 sm:px-5">
        <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2.5 flex-wrap lg:flex-nowrap">
          {/* Left: Sidebar Toggle, Logo & Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
            {/* Sidebar Toggle Button */}
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title="Buka / Tutup Menu Navigasi Sidebar"
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#0054a6] dark:hover:text-cyan-400 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Logo: Click to return to Welcome Page */}
            <div
              onClick={onNavigateWelcome}
              className="flex items-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              title="Kembali ke Laman Selamat Datang"
            >
              <CompanyLogo className="h-7 sm:h-8 w-auto" />
            </div>

            {/* Context Breadcrumbs */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              <button
                type="button"
                onClick={onNavigateWelcome}
                className="text-[#0054a6] dark:text-cyan-400 hover:text-[#003b73] dark:hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Pengantar</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
              {activeProjectCode && (
                <>
                  <span className="font-mono font-bold text-[#0054a6] dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 px-2 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-800 shrink-0">
                    {activeProjectCode}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                </>
              )}
              <span className="font-bold text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-800 px-2.5 py-1 rounded-lg truncate">
                {activeTabName || 'Dashboard Executive'}
              </span>
            </div>
          </div>

          {/* Right: Realtime Clock and Dark/Light Mode Toggle */}
          <div className="flex items-center space-x-2 shrink-0 ml-auto">
            {/* Real-time Date and Clock */}
            <RealTimeClock className="inline-flex" />

            {/* Dark / Light Mode Toggle Button */}
            <button
              id="btn-toggle-dark-mode"
              type="button"
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
              className="p-2 rounded-xl text-slate-700 dark:text-amber-300 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
