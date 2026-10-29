import React from 'react';
import {
  ShieldCheck,
  Compass,
  FileCheck2,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { UserPartyRole, PrimaUser } from '../types';
import { loginWithRole } from '../services/authService';
import { DashboardLogo } from './DashboardLogo';

interface LoginModalProps {
  isOpen?: boolean;
  currentUser?: PrimaUser | null;
  onLoginSuccess: (user: PrimaUser) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = true,
  onLoginSuccess,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSelectRole = (role: UserPartyRole) => {
    const user = loginWithRole(role);
    onLoginSuccess(user);
  };

  const roleMeta: Record<
    UserPartyRole,
    {
      title: string;
      fullName: string;
      icon: React.ElementType;
      tagColor: string;
      borderColor: string;
      hoverClasses: string;
      bgCard: string;
      badge: string;
      focusTasks: string[];
    }
  > = {
    PMO: {
      title: 'PMO',
      fullName: 'Project Management Office',
      icon: FileCheck2,
      tagColor: 'bg-blue-600 text-white shadow-blue-500/20',
      borderColor: 'border-blue-300 dark:border-blue-800',
      hoverClasses: 'hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1',
      bgCard: 'bg-gradient-to-b from-blue-50/70 to-white dark:from-blue-950/30 dark:to-slate-900',
      badge: 'Verifikator Teknis & Fisik BAPL',
      focusTasks: [
        'Verifikasi bukti fisik lapangan & Berita Acara (BAPL)',
        'Analisa Justifikasi Teknis (JusTek) & Justifikasi Finansial',
        'Pencocokan lembar ukur aktual vs baseline kontrak',
      ],
    },
    PLANNING: {
      title: 'Planning',
      fullName: 'Planning & Engineering',
      icon: Compass,
      tagColor: 'bg-emerald-600 text-white shadow-emerald-500/20',
      borderColor: 'border-emerald-300 dark:border-emerald-800',
      hoverClasses: 'hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1',
      bgCard: 'bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/30 dark:to-slate-900',
      badge: 'Penilai Baseline Kontrak MC-0 & DED',
      focusTasks: [
        'Validasi baseline kontrak awal MC-0 & Detail Engineering Design',
        'Evaluasi jadwal baseline pelaksanaan vs kompensasi deviasi',
        'Kesesuaian volume rencana awal DED dengan alokasi CAPEX',
      ],
    },
    PGO: {
      title: 'PGO',
      fullName: 'Project Governance Office',
      icon: ShieldCheck,
      tagColor: 'bg-purple-600 text-white shadow-purple-500/20',
      borderColor: 'border-purple-300 dark:border-purple-800',
      hoverClasses: 'hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1',
      bgCard: 'bg-gradient-to-b from-purple-50/70 to-white dark:from-purple-950/30 dark:to-slate-900',
      badge: 'Pengawas Tata Kelola, CCO 10% & SPI',
      focusTasks: [
        'Penjaminan kepatuhan tata kelola kontrak & evaluasi amandemen CCO 10%',
        'Audit trail rekonsiliasi finansial & mitigasi temuan BPK RI / SPI',
        'Penerbitan surat rekomendasi governance & persetujuan manajemen',
      ],
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header with PRIMA Branding */}
        <div className="p-6 bg-gradient-to-r from-[#002b5b] via-[#0054a6] to-[#f59e0b] text-white relative shrink-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
              <DashboardLogo size="sm" showText={false} animated={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider uppercase font-sans">
                  PRIMA LOGIN
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-2xs">
                  PILIH PIHAK PEMERIKSA
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium">
                Project Records, Intelligence, Monitoring and Assurance &bull; PT Air Bersih Jakarta
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-100">
          <div className="text-center space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pilih Pihak Pemeriksa untuk Langsung Masuk</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Silakan langsung pilih pihak Anda di bawah ini untuk mengakses dashboard PRIMA secara instan:
            </p>
          </div>

          {/* 3 Role Selection Cards - Direct One-Click Sign In */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {(['PMO', 'PLANNING', 'PGO'] as UserPartyRole[]).map((role) => {
              const meta = roleMeta[role];
              const Icon = meta.icon;

              return (
                <div
                  key={role}
                  onClick={() => handleSelectRole(role)}
                  className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group shadow-xs ${meta.bgCard} ${meta.borderColor} ${meta.hoverClasses}`}
                  title={`Klik untuk langsung masuk ke dashboard PRIMA sebagai ${meta.fullName}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`p-2 rounded-xl ${meta.tagColor} shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                        {role}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#0054a6] dark:group-hover:text-amber-400 transition-colors mt-1">
                      {meta.fullName}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRole(role);
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#0054a6] to-[#0077c8] group-hover:from-[#004690] group-hover:to-amber-500 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Masuk PRIMA</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} PT Air Bersih Jakarta &bull; Departemen PMO &bull; Planning &bull; PGO (SPI)</span>
        </div>
      </div>
    </div>
  );
};
