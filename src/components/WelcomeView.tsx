import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Layers,
  FileCheck2,
  Droplet,
  Sparkles,
} from 'lucide-react';
import { DashboardLogo } from './DashboardLogo';

interface WelcomeViewProps {
  onEnterDashboard: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onEnterDashboard,
}) => {
  return (
    <div className="relative h-screen max-h-screen w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#001733] via-[#002b5b] to-[#001026] text-white selection:bg-amber-400 selection:text-slate-950">
      {/* Dynamic Animated Ambient Background Elements with Playful Blue & Sunny Yellow Tones */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Animated Water Wave Blue Gradients */}
        <div className="absolute -top-[25%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-[#0054a6]/25 to-[#00a3e0]/20 blur-3xl animate-water-pulse" />
        {/* Cheerful Warm Sunny Yellow Halo Ambient */}
        <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-bl from-amber-400/15 via-yellow-500/10 to-transparent blur-3xl animate-water-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-[20%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-bl from-[#009ee2]/20 to-[#002b5b]/30 blur-3xl animate-water-pulse" style={{ animationDelay: '3s' }} />
        
        {/* Subtle Water Caustic Grid */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, #facc15 2%, transparent 0%)`,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Ambient Floating Luminous Particles with Sunny Gold & Cyan Sparkles */}
        <div className="absolute top-1/4 left-1/6 w-2 h-2 rounded-full bg-amber-400/70 blur-xs animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 right-1/5 w-2.5 h-2.5 rounded-full bg-cyan-300/60 blur-xs animate-ping" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-yellow-300/60 blur-xs animate-ping" style={{ animationDuration: '5s', animationDelay: '2.5s' }} />
      </div>

      {/* Top Header Bar on Welcome Gate */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-white/10 backdrop-blur-sm shrink-0">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="p-1 rounded-xl bg-gradient-to-br from-sky-400/20 to-amber-400/20 border border-amber-300/30 backdrop-blur-md shadow-xs flex items-center justify-center">
            <DashboardLogo size="sm" showText={false} animated={false} />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase font-sans flex items-center gap-1.5">
              <span>PRIMA &bull; PT AIR BERSIH JAKARTA</span>
              <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </span>
            <span className="block text-[10px] text-cyan-200/80 font-semibold tracking-wider">
              Project Records, Intelligence, Monitoring and Assurance
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-semibold text-slate-200 bg-white/5 border border-amber-400/30 px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ring-2 ring-amber-300/40" />
          <span className="hidden sm:inline">Sistem Verifikasi Siap Digunakan</span>
          <span className="sm:hidden">Sistem Aktif</span>
        </div>
      </header>

      {/* Main Content Hero - Compact & Viewport-Constrained for Laptop Screens */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 max-w-4xl mx-auto text-center min-h-0 py-1 sm:py-2">
        
        {/* Animated Custom Dashboard Logo with Blue & Sunny Yellow Halo */}
        <div className="mb-2 sm:mb-3">
          <DashboardLogo size="lg" showText={false} animated={true} />
        </div>

        {/* Corporate System Tag Badge with Blue & Yellow Gradient */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-sky-500/20 via-amber-400/20 to-blue-500/20 border border-amber-400/40 text-amber-200 text-[10px] sm:text-xs font-semibold tracking-wide uppercase mb-2 sm:mb-2.5 backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Sistem Penjaminan Mutu &amp; Kepatuhan Audit Proyek Cyclical</span>
        </div>

        {/* Primary Welcome Title with PRIMA and its Full Expansion */}
        <div className="mb-2 sm:mb-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none font-sans">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-amber-300 drop-shadow-md">
              PRIMA
            </span>
          </h1>
          <div className="mt-1.5 text-sm sm:text-base md:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-yellow-200 to-amber-300 tracking-wide">
            Project Records, Intelligence, Monitoring and Assurance
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-300/90 mt-1 uppercase tracking-wider">
            Dashboard Verifikasi Berita Acara &amp; Rekonsiliasi Finansial Terpadu
          </div>
        </div>

        {/* Introductory Overview Statement */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed mb-2.5 sm:mb-4 text-balance line-clamp-2 sm:line-clamp-none">
          Platform terintegrasi penjamin mutu dan verifikasi dokumen PT Air Bersih Jakarta, memastikan akurasi data teknis lapangan, rekonsiliasi anggaran biaya, dan kepatuhan audit pada proyek cyclical instalasi air minum DKI Jakarta.
        </p>

        {/* Three Core Corporate Pillars - Compact & Cheerful Yellow + Blue Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-3xl mb-3 sm:mb-4">
          <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-sky-400/20 hover:border-amber-400/40 backdrop-blur-md hover:bg-white/[0.07] transition-all group">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">Integritas Dokumen</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300/80 leading-tight">
              Validasi silang otomatis BAPL, Mutual Check, dan Justifikasi Teknis.
            </p>
          </div>

          <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-amber-400/25 hover:border-amber-400/50 backdrop-blur-md hover:bg-white/[0.07] transition-all group">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">Presisi Rekonsiliasi</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300/80 leading-tight">
              Pemeriksaan delta volume, batas toleransi CCO 10%, dan RAB.
            </p>
          </div>

          <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-blue-400/20 hover:border-amber-400/40 backdrop-blur-md hover:bg-white/[0.07] transition-all group">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-400/30 text-blue-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">Kesiapan Audit</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300/80 leading-tight">
              Matriks traceability lengkap dan siap telaah auditor SPI dan BPK.
            </p>
          </div>
        </div>

        {/* Action Button - Enter Dashboard with Playful Blue & Yellow Gradient */}
        <div className="flex items-center justify-center w-full sm:w-auto">
          <button
            type="button"
            id="btn-enter-dashboard"
            onClick={onEnterDashboard}
            className="w-full sm:w-auto px-7 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-[#0054a6] via-[#009ee2] to-amber-500 hover:from-[#004690] hover:via-[#008cc8] hover:to-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)] hover:shadow-[0_0_35px_rgba(251,191,36,0.55)] ring-2 ring-amber-400/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </main>

      {/* Footer - Compact */}
      <footer className="relative z-10 w-full px-4 py-2 border-t border-white/10 text-center text-[10px] sm:text-xs text-slate-400 backdrop-blur-sm shrink-0">
        <p>
          &copy; {new Date().getFullYear()} PT Air Bersih Jakarta &bull; Departemen PMO Cyclical &bull; Sistem Terpadu Penjamin Mutu Proyek
        </p>
      </footer>
    </div>
  );
};

export default WelcomeView;
