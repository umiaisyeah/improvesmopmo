import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Eye,
  FileText,
  FileCheck,
  Tag,
} from 'lucide-react';
import { TechnicalChange, VerificationStatus } from '../types';
import { HighlightedText } from './HighlightedText';

interface TechnicalVerificationViewProps {
  changes: TechnicalChange[];
}

export const TechnicalVerificationView: React.FC<TechnicalVerificationViewProps> = ({ changes }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [scopeFilter, setScopeFilter] = useState<'changed_only' | 'all'>('changed_only');
  const [selectedChange, setSelectedChange] = useState<TechnicalChange | null>(null);

  const isItemChanged = (item: TechnicalChange) => {
    const base = item.baseline.trim().toLowerCase();
    const prop = item.proposed.trim().toLowerCase();
    const act = item.actual_bapl.trim().toLowerCase();
    return (
      base !== prop ||
      act !== base ||
      item.category !== 'No Technical Change' ||
      prop.includes('tambah') ||
      prop.includes('kurang') ||
      prop.includes('ganti') ||
      item.technical_status === 'MISMATCH' ||
      item.technical_status === 'REVIEW'
    );
  };

  const changedCount = changes.filter(isItemChanged).length;

  const filtered = changes.filter((item) => {
    if (scopeFilter === 'changed_only' && !isItemChanged(item)) {
      return false;
    }

    const matchesSearch =
      item.item.toLowerCase().includes(search.toLowerCase()) ||
      item.change_id.toLowerCase().includes(search.toLowerCase()) ||
      item.proposed.toLowerCase().includes(search.toLowerCase()) ||
      item.actual_bapl.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || item.technical_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Verifikasi Teknis (Khusus Approval JusTek)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Pilar Approval JusTek (Fisik & Spesifikasi)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fokus eksklusif untuk <strong className="text-blue-700">Approval Justifikasi Teknis (JusTek)</strong>: Memverifikasi kesesuaian fisik terpasang dalam BAPL terhadap klausul usulan teknis (spesifikasi, material, dimensi). Tidak dicampur dengan audit finansial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scope Filter Toggle (Changed vs All) */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setScopeFilter('changed_only')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  scopeFilter === 'changed_only'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hanya Item Berubah ({changedCount})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  scopeFilter === 'all'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Item ({changes.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari item, ID, klaim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-48"
              />
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-3 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="MISMATCH">MISMATCH</option>
              <option value="NOT FOUND">NOT FOUND</option>
              <option value="NEED SUPPORT">NEED SUPPORT</option>
              <option value="REVIEW">REVIEW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-24">Change ID</th>
                <th className="py-3.5 px-4 min-w-44">Item Pekerjaan</th>
                <th className="py-3.5 px-4 min-w-48">Baseline (RAB Awal)</th>
                <th className="py-3.5 px-4 min-w-56">Bukti Fisik (BAPL / FAT / MC-0 / Vol)</th>
                <th className="py-3.5 px-4 min-w-52">JusTek Usulan</th>
                <th className="py-3.5 px-3 w-20 text-center">Match</th>
                <th className="py-3.5 px-4 w-32">Evidence</th>
                <th className="py-3.5 px-4 w-32 text-center">Status Teknis</th>
                <th className="py-3.5 px-3 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item, idx) => (
                <tr
                  key={`${item.change_id}_${idx}`}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedChange(item)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {item.change_id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{item.item}</span>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {item.category}
                      </span>
                      {item.superseded_info && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300" title={item.superseded_info}>
                          Diperbarui Dok. Terbaru
                        </span>
                      )}
                      {item.multi_evidence && item.multi_evidence.length > 1 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {item.multi_evidence.length} Dokumen Bukti
                        </span>
                      )}
                    </div>
                    {/* Sub-spesifikasi teknis di baris bawah */}
                    {item.sub_specs_differences && item.sub_specs_differences.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.sub_specs_differences.map((diff, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200"
                            title="Perubahan sub-spesifikasi tertulis di bawah item"
                          >
                            {diff}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px] leading-relaxed">
                    {item.baseline}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 text-[11px] leading-relaxed bg-slate-50/50">
                    {item.actual_bapl}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-[11px] leading-relaxed">
                    {item.proposed}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {item.match ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        MATCH
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        DIFF
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.evidence_found ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200 block w-fit">
                            Hal {item.evidence_page}
                          </span>
                          {item.evidence_type === 'EXPLICIT' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Eksplisit
                            </span>
                          )}
                          {item.evidence_type === 'IMPLICIT' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Implisit
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          OCR: {Math.round(item.ocr_confidence * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Tidak Ada Bukti
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={item.technical_status} />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChange(item);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Lihat Detail Evidence & Justifikasi"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal for Selected Change */}
      {selectedChange && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                    {selectedChange.change_id}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Kategori: {selectedChange.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedChange.item}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChange(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl">
                <div>
                  <span className="text-slate-400 block font-semibold">Kondisi Awal (Baseline)</span>
                  <span className="text-slate-900 font-medium mt-0.5 block">
                    {selectedChange.baseline}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Usulan JusTek (Proposed)</span>
                  <span className="text-blue-700 font-medium mt-0.5 block">
                    {selectedChange.proposed}
                  </span>
                </div>
              </div>

              {selectedChange.superseded_info && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-950 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-950">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Konfirmasi Multi-Dokumen (Pemeriksaan Lintas Berkas)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-900">{selectedChange.superseded_info}</p>
                  {selectedChange.revision_history && selectedChange.revision_history.length > 1 && (
                    <div className="mt-2.5 pt-2 border-t border-blue-200/70 space-y-1">
                      <span className="font-semibold text-[10px] uppercase tracking-wider text-blue-950 block">
                        Daftar Berkas Pembuktian Terkait:
                      </span>
                      {selectedChange.revision_history.map((rev, rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between text-[11px] bg-white px-2.5 py-1 rounded border border-blue-100">
                          <span className="truncate max-w-[380px] text-slate-800">{rev.source_document} (Hal {rev.page}): {rev.statement}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                            Terverifikasi
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fakta Fisik & Tipe Bukti */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold block">
                    Fakta Lapangan &amp; Bukti Fisik (Actual)
                  </span>
                  {selectedChange.evidence_found && selectedChange.evidence_type === 'EXPLICIT' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      BUKTI EKSPLISIT (Tertulis Langsung)
                    </span>
                  )}
                  {selectedChange.evidence_found && selectedChange.evidence_type === 'IMPLICIT' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      BUKTI IMPLISIT (Deduksi Rekayasa)
                    </span>
                  )}
                  {(!selectedChange.evidence_found || selectedChange.evidence_type === 'NONE') && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      TIDAK ADA BUKTI (Di Seluruh Dokumen)
                    </span>
                  )}
                </div>
                <div className={`rounded-xl p-3.5 font-medium leading-relaxed text-xs sm:text-sm border ${
                  selectedChange.evidence_found
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-200 text-rose-950'
                }`}>
                  <HighlightedText
                    text={selectedChange.actual_bapl}
                    matchTarget={[selectedChange.item, selectedChange.proposed, selectedChange.baseline]}
                  />
                </div>
              </div>

              {/* Rationale Deduksi Rekayasa (Khusus Bukti Implisit) */}
              {selectedChange.implicit_rationale && (
                <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Uraian Mengapa Klausul Ini Menjadi Bukti (Alasan Teknis / Deduksi Implisit):</span>
                  </div>
                  <p className="text-xs text-amber-950 font-normal leading-relaxed pl-5">
                    <HighlightedText
                      text={selectedChange.implicit_rationale}
                      matchTarget={[selectedChange.item, selectedChange.proposed, selectedChange.baseline, selectedChange.actual_bapl]}
                    />
                  </p>
                </div>
              )}

              {/* Sub-spesifikasi yang tertulis di bawahnya */}
              {selectedChange.sub_specs_differences && selectedChange.sub_specs_differences.length > 0 && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 space-y-2">
                  <span className="text-indigo-950 font-bold text-xs uppercase tracking-wider block">
                    Perubahan Sub-Spesifikasi Tertulis di Baris Bawah:
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {selectedChange.sub_specs_differences.map((diff, sIdx) => (
                      <div key={sIdx} className="bg-white p-2 rounded-lg border border-indigo-100 text-indigo-950 flex items-center justify-between">
                        <span>
                          <HighlightedText
                            text={diff}
                            matchTarget={[selectedChange.item, selectedChange.actual_bapl]}
                          />
                        </span>
                        <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">Tervalidasi Bukti</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Document Corroboration (Daftar Dokumen Yang Memberikan Bukti) */}
              {selectedChange.multi_evidence && selectedChange.multi_evidence.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-bold text-xs uppercase tracking-wider block">
                      Daftar Dokumen Yang Memberikan Bukti ({selectedChange.multi_evidence.length} Berkas):
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">Lintas Berkas Kolom 1</span>
                  </div>
                  <div className="space-y-2">
                    {selectedChange.multi_evidence.map((ev, eIdx) => {
                      let typeBadge = 'bg-blue-100 text-blue-900 border-blue-300';
                      if (ev.doc_type.includes('FAT')) typeBadge = 'bg-amber-100 text-amber-900 border-amber-300';
                      else if (ev.doc_type.includes('MC-0') || ev.doc_type.includes('MC-100')) typeBadge = 'bg-teal-100 text-teal-900 border-teal-300';
                      else if (ev.doc_type.includes('VOLUME')) typeBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                      else if (ev.doc_type.includes('TEST')) typeBadge = 'bg-purple-100 text-purple-900 border-purple-300';

                      return (
                        <div key={eIdx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${typeBadge}`}>
                                {ev.doc_type}
                              </span>
                              <span className="font-semibold text-slate-900 truncate text-xs">
                                {ev.doc_name} (Halaman {ev.page})
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              ev.is_explicit
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {ev.is_explicit ? 'Bukti Eksplisit' : 'Bukti Implisit'}
                            </span>
                          </div>
                          <div className="bg-slate-900 text-slate-100 font-mono p-2.5 rounded text-[11px] leading-relaxed whitespace-pre-wrap">
                            &quot;
                            <HighlightedText
                              text={ev.snippet.replace(/^["'“”]+|["'“”]+$/g, '')}
                              matchTarget={[selectedChange.item, selectedChange.proposed, selectedChange.baseline, selectedChange.actual_bapl]}
                              isDarkTheme={true}
                            />
                            &quot;
                          </div>
                          {ev.explanation && (
                            <p className="text-[10.5px] text-amber-900 font-medium italic pt-0.5">
                              <HighlightedText
                                text={ev.explanation}
                                matchTarget={[selectedChange.item, selectedChange.proposed, selectedChange.baseline]}
                              />
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kutipan Evidence Dokumen Pembuktian */}
              {(!selectedChange.multi_evidence || selectedChange.multi_evidence.length === 0) && selectedChange.evidence_snippet && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 font-bold block">
                      Kutipan Evidence Dokumen Pembuktian (Halaman {selectedChange.evidence_page || 'Temuan'})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono font-semibold">
                      Teks Otentik Lengkap
                    </span>
                  </div>
                  <div className="bg-slate-900 text-slate-100 font-mono p-3.5 rounded-xl text-[11px] leading-relaxed whitespace-pre-wrap border border-slate-800 shadow-inner">
                    &quot;
                    <HighlightedText
                      text={selectedChange.evidence_snippet.replace(/^["'“”]+|["'“”]+$/g, '')}
                      matchTarget={[selectedChange.item, selectedChange.proposed, selectedChange.baseline, selectedChange.actual_bapl]}
                      isDarkTheme={true}
                    />
                    &quot;
                  </div>
                </div>
              )}

              {/* Analisis Korelasi Implisit & Rekayasa BAPL / FAT / Volume -> JusTek -> JusFin */}
              {selectedChange.implicit_correlation_analysis && (
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                  <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Analisis Korelasi Rekayasa &amp; Deduksi Implisit (Bukti Lapangan/FAT/Volume ➔ JusTek ➔ JusFin):</span>
                  </div>
                  <p className="text-xs text-blue-950 font-normal leading-relaxed">
                    {selectedChange.implicit_correlation_analysis}
                  </p>
                </div>
              )}

              {/* Justification Structure: Cause, Risk, Benefit */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                  Struktur Justifikasi Teknis (JusTek)
                </span>
                <div className="space-y-1.5">
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Alasan Teknis (Cause): </strong>
                    {selectedChange.cause}
                  </p>
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Risiko Bila Tidak Dilakukan (Risk): </strong>
                    {selectedChange.risk}
                  </p>
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Manfaat Perubahan (Benefit): </strong>
                    {selectedChange.benefit}
                  </p>
                </div>
              </div>

              {/* Confidence & Status */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center font-mono">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">OCR Conf.</span>
                  <span className="font-bold text-slate-800">
                    {Math.round(selectedChange.ocr_confidence * 100)}%
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Matching Conf.</span>
                  <span className="font-bold text-slate-800">
                    {Math.round(selectedChange.matching_confidence * 100)}%
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Status Akhir</span>
                  <StatusBadge status={selectedChange.final_status} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedChange(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const StatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          VERIFIED
        </span>
      );
    case 'MISMATCH':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3" />
          MISMATCH
        </span>
      );
    case 'NOT FOUND':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <HelpCircle className="w-3 h-3" />
          NOT FOUND
        </span>
      );
    case 'NEED SUPPORT':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <HelpCircle className="w-3 h-3" />
          NEED SUPPORT
        </span>
      );
    case 'REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <Clock className="w-3 h-3" />
          REVIEW
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};
