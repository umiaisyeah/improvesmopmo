import React, { useState } from 'react';
import {
  FileSearch,
  Search,
  FileText,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Stamp,
  Layers,
  FileCheck,
  Building2,
  Tag,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { EvidenceRecord } from '../types';
import { StatusBadge } from './TechnicalVerificationView';
import { HighlightedText } from './HighlightedText';

interface EvidenceViewProps {
  evidences: EvidenceRecord[];
  onViewRawBapl?: (page: number) => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ evidences, onViewRawBapl }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BAPL' | 'MCO' | 'TestReport'>('ALL');
  const [expandedContexts, setExpandedContexts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleContext = (id: string) => {
    setExpandedContexts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyEvidence = (ev: EvidenceRecord) => {
    const textToCopy = `[EVIDENCE ${ev.evidence_id}] ${ev.item_name || ev.change_id}
Dokumen: ${ev.document} (Halaman ${ev.page})
Sumber: ${ev.source} (${ev.source_type})
Status: ${ev.evidence_status}
Kutipan Fakta:
"${ev.snippet}"
${ev.verified_specs ? `\nSpesifikasi Terverifikasi:\n${ev.verified_specs.map(s => `- ${s}`).join('\n')}` : ''}
${ev.implicit_correlation_note ? `\nKorelasi Teknis: ${ev.implicit_correlation_note}` : ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(ev.evidence_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = evidences.filter((e) => {
    const matchesSearch =
      e.evidence_id.toLowerCase().includes(search.toLowerCase()) ||
      e.change_id.toLowerCase().includes(search.toLowerCase()) ||
      (e.item_name && e.item_name.toLowerCase().includes(search.toLowerCase())) ||
      e.snippet.toLowerCase().includes(search.toLowerCase()) ||
      (e.clause_title && e.clause_title.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'BAPL') return e.source === 'BAPL';
    if (activeFilter === 'MCO') return e.source === 'MCO' || e.source === 'Drawing';
    if (activeFilter === 'TestReport') return e.source === 'TestReport';
    return true;
  });

  const countBapl = evidences.filter((e) => e.source === 'BAPL').length;
  const countMco = evidences.filter((e) => e.source === 'MCO' || e.source === 'Drawing').length;
  const countTest = evidences.filter((e) => e.source === 'TestReport').length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <FileSearch className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Daftar Bukti Lengkap &amp; Transkrip Evidence Lapangan
                </h2>
                <p className="text-xs text-slate-500">
                  Kutipan komprehensif, klausul transkrip BAPL, spesifikasi teknis teruji fisik, dan rantai legalitas pengesahan.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({evidences.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('BAPL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeFilter === 'BAPL'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BAPL Lapangan ({countBapl})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('MCO')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeFilter === 'MCO'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                MC-0 / DED ({countMco})
              </button>
              {countTest > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('TestReport')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeFilter === 'TestReport'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Uji Teknis ({countTest})
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kata kunci bukti..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full sm:w-56"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filtered.map((ev, idx) => {
          const isExpanded = !!expandedContexts[ev.evidence_id];
          const isCopied = copiedId === ev.evidence_id;

          return (
            <div
              key={`${ev.evidence_id}_${idx}`}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1.5">
                    <FileSearch className="w-3.5 h-3.5 text-purple-700" />
                    {ev.evidence_id}
                  </span>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                    {ev.change_id}
                  </span>
                  {ev.item_name && (
                    <span className="text-xs font-bold text-slate-900">
                      {ev.item_name}
                    </span>
                  )}
                  {ev.evidence_type === 'EXPLICIT' && (
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      BUKTI EKSPLISIT
                    </span>
                  )}
                  {ev.evidence_type === 'IMPLICIT' && (
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      BUKTI IMPLISIT
                    </span>
                  )}
                  {ev.doc_type && (
                    <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {ev.doc_type}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={ev.evidence_status} />
                  <button
                    type="button"
                    onClick={() => handleCopyEvidence(ev)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    title="Salin ringkasan bukti lengkap"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Salin Bukti</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-Header: Clause Title & Origin */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span>{ev.clause_title || 'Hasil Pemeriksaan Opname Fisik & Pengujian'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {ev.document} (Hal {ev.page})
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    Metode: {ev.source_type}
                  </span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Akurasi OCR: {Math.round(ev.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Snippet Box (High-Contrast Quotation) */}
              <div className="bg-slate-900 text-slate-100 font-mono p-4 rounded-xl text-xs leading-relaxed border border-slate-800 shadow-inner relative">
                <div className="text-[10px] uppercase font-sans tracking-wider text-purple-400 font-bold mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {ev.source === 'MCO'
                      ? 'Kutipan Dokumen MC-0 (Mutual Check Awal):'
                      : ev.source === 'TestReport'
                      ? 'Kutipan Laporan Uji Teknis / Sertifikasi:'
                      : 'Kutipan Transkrip BAPL (Berita Acara Peninjauan Lapangan):'}
                  </span>
                  <span className="text-slate-400 text-[10px] normal-case font-mono">
                    Halaman {ev.page}
                  </span>
                </div>
                <div className="whitespace-pre-wrap text-slate-100 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  &ldquo;
                  <HighlightedText
                    text={ev.snippet}
                    matchTarget={[ev.item_name || '', ev.clause_title || '', ...(ev.verified_specs || [])]}
                    isDarkTheme={true}
                  />
                  &rdquo;
                </div>
              </div>

              {/* Verified Sub-Specifications & Fact Badges */}
              {ev.verified_specs && ev.verified_specs.length > 0 && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>Rincian Sub-Spesifikasi &amp; Parameter Fisik Terverifikasi:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {ev.verified_specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-white p-2.5 rounded-lg border border-blue-200/60 text-slate-800 flex items-start gap-2 shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="text-[11px] leading-snug">
                          <HighlightedText text={spec} matchTarget={[ev.snippet, ev.item_name || '']} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Implicit Correlation Note (if applicable) */}
              {ev.implicit_correlation_note && (
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-950">
                    <Layers className="w-4 h-4 text-purple-700" />
                    <span>Korelasi Logika Teknis &amp; Finansial:</span>
                  </div>
                  <p className="text-[11px] text-purple-900 leading-relaxed">
                    <HighlightedText
                      text={ev.implicit_correlation_note}
                      matchTarget={[ev.item_name || '', ev.snippet, ...(ev.verified_specs || [])]}
                    />
                  </p>
                </div>
              )}

              {/* Full Context Section (Collapsible) */}
              {ev.full_clause && ev.full_clause !== ev.snippet && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleContext(ev.evidence_id)}
                    className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      {isExpanded ? 'Sembunyikan Konteks Lengkap Halaman' : 'Lihat Konteks Transkrip Paragraf Lengkap'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-4 bg-white text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed border-t border-slate-200">
                      <HighlightedText
                        text={ev.full_clause}
                        matchTarget={[ev.item_name || '', ev.snippet, ...(ev.verified_specs || [])]}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Authenticity Seals & Actions Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-2">
                  {ev.authenticity_indicators && ev.authenticity_indicators.map((auth, aIdx) => (
                    <span
                      key={aIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <Stamp className="w-3 h-3 text-slate-500" />
                      {auth}
                    </span>
                  ))}
                </div>

                {onViewRawBapl && (
                  <button
                    type="button"
                    onClick={() => onViewRawBapl(ev.page)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors self-end sm:self-auto cursor-pointer"
                  >
                    <span>Buka Transkrip Hal {ev.page}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
