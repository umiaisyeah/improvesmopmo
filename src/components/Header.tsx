import React from 'react';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  Sliders,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Cloud,
} from 'lucide-react';
import { VerificationResult } from '../types';
import { downloadVerificationExcel } from '../services/excelGenerator';
import { downloadSampleProjectExcel } from '../services/templateGenerator';
import { CompanyLogo } from './CompanyLogo';

interface HeaderProps {
  result: VerificationResult | null;
  onOpenUpload: () => void;
  onLoadGoldenCase: () => void;
  onOpenConfig: () => void;
  onOpenReview: () => void;
  onOpenReset: () => void;
  onOpenGoogleDrive?: () => void;
  googleUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  result,
  onOpenUpload,
  onLoadGoldenCase,
  onOpenConfig,
  onOpenReview,
  onOpenReset,
  onOpenGoogleDrive,
  googleUser,
  isProcessing,
}) => {
  return (
    <header
      id="app-header"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-3 gap-3">
          {/* Logo & System Title on Top Left */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Air Bersih Jakarta Logo */}
            <div className="flex items-center shrink-0">
              <CompanyLogo className="h-8 sm:h-9 w-auto" />
            </div>

            {/* Separator Divider */}
            <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

            {/* System Title & Subtitle */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                  AUTOMATED BAPL VERIFICATION SYSTEM
                </h1>
                <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  PMO Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block whitespace-nowrap mt-0.5">
                BAPL • Justifikasi Teknis • Justifikasi Finansial • RAB • BOQ/BOM • MCO
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Quick Load Golden Test Case */}
            <button
              id="btn-load-golden-case"
              type="button"
              onClick={onLoadGoldenCase}
              disabled={isProcessing}
              title="Load Golden Test Case Proyek 46223A"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Golden Test Case 46223A</span>
              <span className="sm:hidden">46223A</span>
            </button>

            {/* Download Sample Template */}
            <button
              id="btn-download-template"
              type="button"
              onClick={downloadSampleProjectExcel}
              title="Download Template Excel (RAB, JusTek, JusFin)"
              className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh Template Excel</span>
            </button>

            {/* Upload Files Button */}
            <button
              id="btn-upload-files"
              type="button"
              onClick={onOpenUpload}
              disabled={isProcessing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Dokumen</span>
            </button>

            {/* Google Drive Integration Button */}
            {onOpenGoogleDrive && (
              <button
                id="btn-open-google-drive"
                type="button"
                onClick={onOpenGoogleDrive}
                title={googleUser ? `Google Drive Terhubung: ${googleUser.email}` : "Hubungkan Google Drive"}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  googleUser
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Cloud className={`w-3.5 h-3.5 ${googleUser ? 'text-emerald-600' : 'text-blue-600'}`} />
                <span className="hidden sm:inline">
                  {googleUser ? 'Drive Terhubung' : 'Google Drive'}
                </span>
                {googleUser && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </button>
            )}

            {/* Threshold Config */}
            <button
              id="btn-config-threshold"
              type="button"
              onClick={onOpenConfig}
              title="Pengaturan Threshold Finansial & Toleransi"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Reset / Riset System Button */}
            <button
              id="btn-reset-system"
              type="button"
              onClick={onOpenReset}
              disabled={isProcessing}
              title="Riset / Reset Sistem & Pasangan Dokumen"
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-semibold">Reset</span>
            </button>

            {/* PMO Auditor Review Sign-off */}
            {result && (
              <button
                id="btn-pmo-signoff"
                type="button"
                onClick={onOpenReview}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Review Auditor</span>
              </button>
            )}

            {/* Download Excel 9 Sheets */}
            {result && (
              <button
                id="btn-download-excel-primary"
                type="button"
                onClick={() => downloadVerificationExcel(result)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel (9 Sheets)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
