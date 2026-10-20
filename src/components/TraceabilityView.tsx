import React, { useState } from 'react';
import { GitCommit, Search, CheckCircle2, AlertTriangle, ArrowRight, Shield, Eye, X, Copy, Check } from 'lucide-react';
import { TraceabilityRecord } from '../types';
import { StatusBadge } from './TechnicalVerificationView';
import { HighlightedText } from './HighlightedText';

interface TraceabilityViewProps {
  records: TraceabilityRecord[];
}

export const TraceabilityView: React.FC<TraceabilityViewProps> = ({ records }) => {
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<TraceabilityRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = records.filter(
    (r) =>
      r.item.toLowerCase().includes(search.toLowerCase()) ||
      r.change_id.toLowerCase().includes(search.toLowerCase()) ||
      (r.traceability_ref_id && r.traceability_ref_id.toLowerCase().includes(search.toLowerCase())) ||
      r.bapl_evidence.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (r: TraceabilityRecord) => {
    const txt = `[${r.change_id}] ${r.item}
Traceability ID: ${r.traceability_ref_id || '-'}
1. RAB Awal: ${r.rab_initial}
2. JusTek Claim: ${r.justek_claim}
3. BAPL Evidence: ${r.bapl_evidence}
4. RAB Revisi: ${r.rab_revised}
5. JusFin Claim: ${r.jusfin_claim}
6. Dokumen MCO: ${r.mco_document}
Konsistensi: ${r.chain_consistent ? 'LENGKAP' : 'GAPS'}
Status Final: ${r.final_status}`;

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-indigo-600" />
              End-to-End Traceability Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rantai penelusuran dokumen: DED / RAB Awal &rarr; JusTek &rarr; BAPL &rarr; RAB Revisi &rarr; JusFin &rarr; MCO Approval. Klik baris untuk teks lengkap.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari item dalam rantai..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* Traceability Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 w-16">ID</th>
                <th className="py-3 px-4 min-w-44">Item Pekerjaan</th>
                <th className="py-3 px-3 min-w-32">1. RAB Awal</th>
                <th className="py-3 px-3 min-w-36">2. JusTek Claim</th>
                <th className="py-3 px-4 min-w-44 bg-slate-100/70">3. BAPL Evidence</th>
                <th className="py-3 px-3 min-w-36">4. RAB Revisi</th>
                <th className="py-3 px-3 min-w-32">5. JusFin</th>
                <th className="py-3 px-3 min-w-28">6. MCO Docs</th>
                <th className="py-3 px-3 w-24 text-center">Konsistensi</th>
                <th className="py-3 px-3 w-28 text-center">Final Status</th>
                <th className="py-3 px-3 w-16 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((r, idx) => (
                <tr
                  key={`${r.change_id}_${idx}`}
                  onClick={() => setSelectedRecord(r)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                    <div>{r.change_id}</div>
                    {r.traceability_ref_id && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {r.traceability_ref_id}
                      </span>
                    )}
                    {r.ba_anomaly_type && r.ba_anomaly_type !== 'NONE' && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-600 text-white animate-pulse">
                        ⚠️ ANOMALI BA
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {r.item}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 text-[11px]">{r.rab_initial}</td>
                  <td className="py-3.5 px-3 text-slate-700 text-[11px]">{r.justek_claim}</td>
                  <td className="py-3.5 px-4 text-emerald-950 font-medium text-[11px] bg-slate-50/70">
                    <div className="space-y-1">
                      {r.evidence_type === 'EXPLICIT' && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          BUKTI EKSPLISIT
                        </span>
                      )}
                      {r.evidence_type === 'IMPLICIT' && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          BUKTI IMPLISIT
                        </span>
                      )}
                      {(!r.evidence_type || r.evidence_type === 'NONE') && r.bapl_evidence.includes('TIDAK ADA BUKTI') && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          TIDAK ADA BUKTI
                        </span>
                      )}
                      <p className="line-clamp-2">{r.bapl_evidence}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 text-[11px]">{r.rab_revised}</td>
                  <td className="py-3.5 px-3 text-slate-600 text-[11px]">{r.jusfin_claim}</td>
                  <td className="py-3.5 px-3 font-mono text-[10px]">
                    <span className={`inline-block px-1.5 py-0.5 rounded ${
                      r.mco_document.toLowerCase().includes('approved') || r.mco_document.toLowerCase().includes('mc-0')
                        ? 'bg-purple-50 text-purple-900 border border-purple-200 font-semibold'
                        : r.mco_document.toLowerCase().includes('draft')
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'text-slate-500'
                    }`}>
                      {r.mco_document}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {r.chain_consistent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        LENGKAP
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        GAPS
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <StatusBadge status={r.final_status} />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(r);
                      }}
                      className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors inline-flex items-center justify-center"
                      title="Lihat seluruh teks rantai audit"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 text-white">
                    {selectedRecord.change_id}
                  </span>
                  <StatusBadge status={selectedRecord.final_status} />
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      selectedRecord.chain_consistent
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Rantai: {selectedRecord.chain_consistent ? 'Lengkap & Sinkron' : 'Ada Discrepancy'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-1 leading-snug">
                  {selectedRecord.item}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedRecord)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    1. RAB Awal (Baseline Kontrak)
                  </span>
                  <p className="text-slate-900 font-medium leading-relaxed">
                    {selectedRecord.rab_initial}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                    2. Klaim Justifikasi Teknis (JusTek)
                  </span>
                  <p className="text-slate-900 font-medium leading-relaxed">
                    {selectedRecord.justek_claim}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      3. Bukti Fisik Lapangan &amp; Multi-Dokumen (BAPL / FAT / MC-0 / Back Up Volume)
                    </span>
                    {selectedRecord.evidence_type === 'EXPLICIT' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-200/80 text-emerald-900">
                        BUKTI EKSPLISIT
                      </span>
                    )}
                    {selectedRecord.evidence_type === 'IMPLICIT' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200/80 text-amber-900">
                        BUKTI IMPLISIT (DEDUKSI REKAYASA)
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-950 font-semibold leading-relaxed">
                    <HighlightedText
                      text={selectedRecord.bapl_evidence}
                      matchTarget={[selectedRecord.item, selectedRecord.justek_claim, selectedRecord.rab_revised, selectedRecord.rab_initial]}
                    />
                  </p>

                  {selectedRecord.implicit_rationale && (
                    <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-200 text-slate-800 text-[11px] leading-relaxed">
                      <strong className="text-purple-900 font-bold block mb-0.5">Penjelasan Deduksi Rekayasa:</strong>
                      <HighlightedText
                        text={selectedRecord.implicit_rationale}
                        matchTarget={[selectedRecord.item, selectedRecord.justek_claim, selectedRecord.bapl_evidence]}
                      />
                    </div>
                  )}

                  {selectedRecord.multi_evidence && selectedRecord.multi_evidence.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                        Daftar Dokumen Yang Memberikan Bukti ({selectedRecord.multi_evidence.length} Berkas):
                      </span>
                      <div className="space-y-1.5 font-mono text-[10.5px]">
                        {selectedRecord.multi_evidence.map((doc, dIdx) => (
                          <div key={dIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                            <div className="flex items-center justify-between text-slate-800 font-bold">
                              <span className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-800 border border-indigo-200">{doc.doc_type} (Hal {doc.page})</span>
                              <span className="text-slate-500 font-normal truncate max-w-[200px]">{doc.doc_name}</span>
                            </div>
                            <p className="text-slate-700 italic">
                              &ldquo;
                              <HighlightedText
                                text={doc.snippet}
                                matchTarget={[selectedRecord.item, selectedRecord.justek_claim, selectedRecord.rab_revised, selectedRecord.bapl_evidence]}
                              />
                              &rdquo;
                            </p>
                            {doc.explanation && (
                              <p className="text-[10px] text-slate-500 font-sans border-t border-slate-100 pt-1 mt-1">
                                <HighlightedText
                                  text={doc.explanation}
                                  matchTarget={[selectedRecord.item, selectedRecord.justek_claim]}
                                />
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    4. Nilai RAB Revisi (Proposed Adjustment)
                  </span>
                  <p className="text-slate-900 font-medium leading-relaxed">{selectedRecord.rab_revised}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                    5. Justifikasi Finansial (JusFin)
                  </span>
                  <p className="text-slate-900 font-medium leading-relaxed">{selectedRecord.jusfin_claim}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block mb-1">
                    6. Persetujuan Manajemen Kontrak (MCO Document)
                  </span>
                  <p className="text-slate-900 font-mono font-medium leading-relaxed">{selectedRecord.mco_document}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
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
