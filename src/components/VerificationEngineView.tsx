import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Link as LinkIcon, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  FileWarning, 
  FileText, 
  TrendingUp,
  ExternalLink,
  Info
} from 'lucide-react';
import { Project, DiscrepancyReport, BOQItem, BeritaAcara } from '../types';
import { computeMatchScore, normalizeTechnicalTerms } from '../utils/matchingEngine';

interface VerificationEngineViewProps {
  projects: Project[];
  issues: DiscrepancyReport[];
  onResolveIssue: (issueId: string) => void;
  onLinkItemToBA: (projectId: string, itemId: string, baId: string, baItemName: string) => void;
  onOpenProjectDetail: (projectId: string) => void;
  onOpenBaDetail: (baId: string) => void;
  onOpenCreateBaModal: (projectId: string) => void;
}

export const VerificationEngineView: React.FC<VerificationEngineViewProps> = ({
  projects,
  issues,
  onResolveIssue,
  onLinkItemToBA,
  onOpenProjectDetail,
  onOpenBaDetail,
  onOpenCreateBaModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'issues' | 'fuzzyMatcher' | 'matrix'>('issues');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Custom manual fuzzy tester states
  const [manualTextJustek, setManualTextJustek] = useState('Pemasangan Pipa HDPE OD 400mm PN10 SDR17');
  const [manualTextBA, setManualTextBA] = useState('Pipa HDPE Dia 400 mm SDR 17 PN 10 Ex. Wavin');

  const filteredIssues = issues.filter(issue => 
    issue.projectName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    issue.justekItemName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    issue.ipa.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const testScore = computeMatchScore(manualTextJustek, manualTextBA);
  const normJustek = normalizeTechnicalTerms(manualTextJustek);
  const normBA = normalizeTechnicalTerms(manualTextBA);

  return (
    <div className="space-y-6">
      {/* Top Banner Explaining the Automated Verification Engine */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0,transparent_70%)] pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Mesin Verifikasi & Rekonsiliasi Otomatis PMO Cyclical</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Pengecekan Konsistensi Justifikasi vs Berita Acara
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Menyelesaikan dua permasalahan krusial dalam pengendalian konstruksi IPA:
            <span className="block mt-1 text-slate-200">
              1. <strong>Mendeteksi perubahan volume Justek tanpa bukti Berita Acara konkret</strong> (MC-0, Lapangan, Komisioning, MC-100).
            </span>
            <span className="block mt-0.5 text-slate-200">
              2. <strong>Rekonsiliasi cerdas penulisan nama item</strong> yang berbeda istilah namun merujuk ke item WBS yang sama.
            </span>
          </p>

          <div className="flex flex-wrap gap-2.5 mt-4">
            <button
              onClick={() => setActiveSubTab('issues')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'issues'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Daftar Anomali & Rekomendasi ({issues.filter(i => !i.resolved).length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('fuzzyMatcher')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'fuzzyMatcher'
                  ? 'bg-cyan-500 text-slate-900 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pencocok Kemiripan Istilah (Fuzzy Matcher)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'matrix'
                  ? 'bg-emerald-500 text-slate-900 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Matriks Traceability Dokumen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: Issues List & Discrepancies */}
      {activeSubTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari isu berdasarkan proyek / nama item..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Menampilkan: <strong>{filteredIssues.length}</strong> catatan verifikasi</span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`bg-white rounded-xl border p-4 shadow-xs transition-all ${
                  issue.resolved
                    ? 'border-emerald-200 bg-emerald-50/20 opacity-75'
                    : issue.severity === 'HIGH'
                    ? 'border-amber-300 ring-1 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      issue.resolved
                        ? 'bg-emerald-100 text-emerald-700'
                        : issue.type === 'UNSUBSTANTIATED_JUSTEK'
                        ? 'bg-red-100 text-red-700'
                        : issue.type === 'VOLUME_MISMATCH'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {issue.resolved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          issue.type === 'UNSUBSTANTIATED_JUSTEK'
                            ? 'bg-red-100 text-red-800'
                            : issue.type === 'VOLUME_MISMATCH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.type === 'UNSUBSTANTIATED_JUSTEK'
                            ? 'Klaim Justek Tanpa Bukti BA'
                            : issue.type === 'VOLUME_MISMATCH'
                            ? 'Volume Melebihi Lembar Ukur'
                            : 'Perbedaan Penulisan Nama Item'}
                        </span>
                        <span className="text-xs font-semibold text-blue-700">{issue.ipa}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-xs font-medium text-slate-600">{issue.projectName}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Nama Di Justifikasi (Justek/Jusfin):</span>
                          <span className="font-semibold text-slate-900 mt-0.5 block">{issue.justekItemName}</span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Nama Pada Berita Acara Acuan:</span>
                          {issue.baItemName ? (
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="font-semibold text-slate-900">{issue.baItemName}</span>
                              {issue.confidenceMatch && (
                                <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  {issue.confidenceMatch}% Match
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-red-600 font-semibold italic mt-0.5 block">
                              Tidak ditemukan di Berita Acara manapun
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5 text-xs text-amber-900 mt-1">
                        <strong>Rekomendasi Verifikator PMO:</strong> {issue.suggestedAction}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {!issue.resolved ? (
                      <>
                        {issue.type === 'NAMING_VARIATION' ? (
                          <button
                            onClick={() => onResolveIssue(issue.id)}
                            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Sinkronkan & Simpan Alias</span>
                          </button>
                        ) : issue.type === 'UNSUBSTANTIATED_JUSTEK' ? (
                          <button
                            onClick={() => onOpenCreateBaModal(issue.projectId)}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Terbitkan BA Peninjauan Lapangan</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onResolveIssue(issue.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Tandai Selesai Direvisi</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenProjectDetail(issue.projectId)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <span>Buka Detail Proyek</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Telah Direkonsiliasi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Interactive Fuzzy Matcher & Normalizer Playground */}
      {activeSubTab === 'fuzzyMatcher' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              Simulator Normalisasi & Kecerdasan Pencocokan Istilah
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Uji coba algoritma cerdas yang secara otomatis mengenali bahwa variasi penulisan seperti
              <em> 'HDPE OD 400 SDR 17'</em> dan <em>'Pipa HDPE Dia 400mm PN10'</em> merupakan satu item fisik yang sama.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Penulisan di Dokumen Justifikasi Teknis / BOQ:
              </label>
              <textarea
                value={manualTextJustek}
                onChange={(e) => setManualTextJustek(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                placeholder="Contoh: Pemasangan Pipa HDPE OD 400mm PN10 SDR17"
              />
              <div className="text-[11px] text-slate-500">
                Token Ternormalisasi: <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded">{normJustek}</code>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Penulisan di Dokumen Berita Acara (MC-0 / Lapangan):
              </label>
              <textarea
                value={manualTextBA}
                onChange={(e) => setManualTextBA(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                placeholder="Contoh: Pipa HDPE Dia 400 mm SDR 17 PN 10 Ex. Wavin"
              />
              <div className="text-[11px] text-slate-500">
                Token Ternormalisasi: <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded">{normBA}</code>
              </div>
            </div>
          </div>

          {/* Result card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-white shadow-xs ${
                testScore >= 80 ? 'bg-emerald-600' : testScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                <span className="text-xl leading-none">{testScore}%</span>
                <span className="text-[9px] uppercase tracking-wider mt-0.5 font-semibold">Match</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {testScore >= 80 ? 'Identik / Sangat Mirip (Rekomendasi Auto-Merge)' : testScore >= 60 ? 'Kemiripan Sedang (Perlu Konfirmasi)' : 'Beda Item Fisik'}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Algoritma berhasil memetakan kesamaan diameter, rating tekanan (PN), rasio dimensi (SDR), dan jenis material pipa secara akurat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setManualTextJustek('Butterfly Valve Dia 600mm Flange PN16 Gearbox Cast Iron');
                  setManualTextBA('Butterfly Valve DN 600 PN16 Gearbox Manual');
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg font-medium hover:bg-slate-100 cursor-pointer"
              >
                Contoh Valve
              </button>
              <button
                onClick={() => {
                  setManualTextJustek('Dosing Pump Smart Digital Inverter PAC Kapasitas 250 L/h Auto Control');
                  setManualTextBA('Pompa Injeksi PAC Smart Inverter Otomatis 250 Lph');
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg font-medium hover:bg-slate-100 cursor-pointer"
              >
                Contoh Dosing Pump
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Full Audit Matrix Justek vs 4 Berita Acara */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Matriks Keterlacakan (Traceability Matrix) Pekerjaan Tambah/Kurang</h3>
            <p className="text-xs text-slate-500">
              Audit rantai verifikasi: DED &rarr; Justifikasi Teknis & Finansial &rarr; BA MC-0 &rarr; BA Peninjauan Lapangan &rarr; BA Komisioning &rarr; BA MC-100
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Proyek & WBS</th>
                  <th className="py-3 px-4">Item Pekerjaan</th>
                  <th className="py-3 px-4 text-center">Vol. DED</th>
                  <th className="py-3 px-4 text-center">Vol. Justek</th>
                  <th className="py-3 px-4 text-center">Bukti BA MC-0</th>
                  <th className="py-3 px-4 text-center">Bukti BA Lapangan</th>
                  <th className="py-3 px-4 text-center">Tes Komisioning</th>
                  <th className="py-3 px-4 text-center">Status Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {projects.flatMap(p => 
                  (p.justifikasi?.items || []).map((item, idx) => {
                    const hasMc0 = p.beritaAcaraList.some(b => b.baType === 'MC-0' && b.items.some(i => i.canonicalWbsCode === item.wbsCode));
                    const hasPl = p.beritaAcaraList.some(b => b.baType === 'Peninjauan Lapangan' && b.items.some(i => i.canonicalWbsCode === item.wbsCode));
                    const hasTk = p.beritaAcaraList.some(b => b.baType === 'Tes Komisioning');

                    return (
                      <tr key={`${p.id}-${item.id}`} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            {item.wbsCode}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-0.5">{p.ipa}</div>
                        </td>
                        <td className="py-3 px-4 max-w-[240px]">
                          <div className="font-semibold text-slate-900">{item.itemName}</div>
                          <div className="text-[10px] text-slate-500 italic mt-0.5">{item.justificationReason}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-medium">
                          {item.dedVolume} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                          {item.fieldVolume} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {hasMc0 ? (
                            <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[11px]">
                              <Check className="w-3 h-3 mr-1" /> Tertera
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {hasPl ? (
                            <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[11px]">
                              <Check className="w-3 h-3 mr-1" /> Terlampir BA
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {hasTk ? (
                            <span className="inline-flex items-center text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium text-[11px]">
                              <Check className="w-3 h-3 mr-1" /> Lulus
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Tahap Akhir</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.evidenceStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.evidenceStatus === 'MISSING_BA'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.evidenceStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
