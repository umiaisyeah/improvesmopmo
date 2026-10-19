import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  ExternalLink,
  PlusCircle,
  Filter,
  Droplet
} from 'lucide-react';
import { Project, BeritaAcara, IPALocation, BAType } from '../types';

interface BeritaAcaraListProps {
  projects: Project[];
  selectedIpa: IPALocation | 'ALL';
  onOpenBaDetail: (baId: string) => void;
  onOpenCreateBaModal: (projectId?: string) => void;
}

export const BeritaAcaraList: React.FC<BeritaAcaraListProps> = ({
  projects,
  selectedIpa,
  onOpenBaDetail,
  onOpenCreateBaModal,
}) => {
  const [typeFilter, setTypeFilter] = useState<BAType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all Berita Acara with their project info
  const allBAs = projects.flatMap(p => 
    p.beritaAcaraList.map(ba => ({
      ...ba,
      projectName: p.name,
      projectCode: p.code,
      contractorName: p.contractorName,
    }))
  );

  const filtered = allBAs.filter(ba => {
    const matchIpa = selectedIpa === 'ALL' || ba.ipa === selectedIpa;
    const matchType = typeFilter === 'ALL' || ba.baType === typeFilter;
    const matchSearch = ba.baNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ba.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ba.agenda.toLowerCase().includes(searchQuery.toLowerCase());
    return matchIpa && matchType && matchSearch;
  });

  const getBadgeColor = (type: BAType) => {
    switch (type) {
      case 'MC-0': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Peninjauan Lapangan': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Tes Komisioning': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'MC-100': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner explaining BA Digitalization */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Digitalisasi Berita Acara Pelaksanaan & Konstruksi IPA
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Standar dokumentasi acuan formal PMO Cyclical: <strong>MC-0 (Titik Nol)</strong>, <strong>Peninjauan Lapangan (Kajian Justek)</strong>, <strong>Tes Komisioning (Uji Mutu & Beban)</strong>, dan <strong>MC-100 (Serah Terima Fisik PHO)</strong>.
          </p>
        </div>

        <button
          onClick={() => onOpenCreateBaModal()}
          className="self-start md:self-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Berita Acara Baru</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor Berita Acara, agenda, atau nama proyek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-medium">Jenis BA:</span>
          {(['ALL', 'MC-0', 'Peninjauan Lapangan', 'Tes Komisioning', 'MC-100'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                typeFilter === type
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'Semua Jenis BA' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Berita Acara Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ba) => (
          <div
            key={ba.id}
            onClick={() => onOpenBaDetail(ba.id)}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(ba.baType)}`}>
                  {ba.baType}
                </span>
                <span className="font-mono text-xs text-slate-500 font-semibold">{ba.date}</span>
              </div>

              <div>
                <h3 className="text-xs font-mono font-bold text-blue-900 tracking-tight group-hover:text-blue-700">
                  {ba.baNumber}
                </h3>
                <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                  {ba.agenda}
                </h4>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">{ba.ipa}</span>
                  <span>&bull;</span>
                  <span className="truncate">{ba.projectName}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                "{ba.notes}"
              </p>

              {/* Items summary */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>{ba.items.length} Item Lapangan Terukur</span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  {ba.attachments.length} Bukti Foto / Lembar Ukur
                </span>
              </div>
            </div>

            {/* Footer with Signatories check */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{ba.signatories.filter(s => s.isSigned).length}/{ba.signatories.length} Pihak Telah TTD Elektronik</span>
              </div>
              <span className="text-blue-700 font-semibold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Buka Dokumen &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
