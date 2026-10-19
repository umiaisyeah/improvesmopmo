import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  UserCheck, 
  PlusCircle, 
  Droplet,
  Layers,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { UserRole, IPALocation } from '../types';

interface NavbarProps {
  currentTab: 'overview' | 'projects' | 'verification' | 'beritaAcara' | 'timeline';
  setCurrentTab: (tab: 'overview' | 'projects' | 'verification' | 'beritaAcara' | 'timeline') => void;
  selectedIpa: IPALocation | 'ALL';
  setSelectedIpa: (ipa: IPALocation | 'ALL') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  unresolvedIssueCount: number;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedIpa,
  setSelectedIpa,
  userRole,
  setUserRole,
  unresolvedIssueCount,
  onOpenCreateModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 font-medium text-cyan-400">
            <Droplet className="w-3.5 h-3.5 fill-cyan-400" />
            PT AIR BERSIH JAKARTA
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-normal">Departemen PMO Cyclical &bull; Divisi Pengendalian Proyek & Konstruksi IPA</span>
        </div>
        <div className="flex items-center space-x-4 mt-1 sm:mt-0">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Server Terhubung &bull; 6 IPA Aktif</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Peran Aktif:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="Site Engineer PMO" className="bg-slate-800 text-white">Site Engineer PMO</option>
              <option value="Lead Technical Reviewer" className="bg-slate-800 text-white">Lead Technical Reviewer</option>
              <option value="Financial & Commercial PMO" className="bg-slate-800 text-white">Financial & Commercial PMO</option>
              <option value="Kepala Departemen PMO" className="bg-slate-800 text-white">Kepala Departemen PMO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-cyan-600 to-teal-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">PMO Cyclical Portal</h1>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Justek & Berita Acara
                </span>
              </div>
              <p className="text-xs text-slate-500">Sistem Verifikasi DED vs Lapangan & Digitalisasi BA (MC-0 &bull; Lapangan &bull; Komisioning &bull; MC-100)</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('overview')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                currentTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Ikhtisar & IPA
            </button>

            <button
              onClick={() => setCurrentTab('projects')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                currentTab === 'projects'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Justek & Finansial
            </button>

            <button
              onClick={() => setCurrentTab('beritaAcara')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                currentTab === 'beritaAcara'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Digital Berita Acara
            </button>

            <button
              onClick={() => setCurrentTab('timeline')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                currentTab === 'timeline'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Timeline & Kurva S
            </button>

            <button
              onClick={() => setCurrentTab('verification')}
              className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                currentTab === 'verification'
                  ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${unresolvedIssueCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              Verifikasi Otomatis
              {unresolvedIssueCount > 0 && (
                <span className="bg-amber-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                  {unresolvedIssueCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenCreateModal}
              className="bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Berita Acara / Justek</span>
            </button>
          </div>
        </div>

        {/* Sub-bar Filter IPA Selection */}
        <div className="py-2.5 border-t border-slate-100 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium whitespace-nowrap">
            <span>Filter Unit IPA:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedIpa('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedIpa === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua 6 IPA
            </button>
            {(['IPA Buaran 1', 'IPA Buaran 2', 'IPA Buaran 3', 'IPA Pejompongan 1', 'IPA Pejompongan 2', 'IPA Pulogadung'] as IPALocation[]).map((ipa) => (
              <button
                key={ipa}
                onClick={() => setSelectedIpa(ipa)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedIpa === ipa
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ipa}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
