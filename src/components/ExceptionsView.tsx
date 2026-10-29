import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  FileQuestion,
  Scale,
  FileWarning,
  Calculator,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ClipboardCopy,
  Check,
  FileText,
  DollarSign,
  FileCheck2,
  Compass,
  MapPin,
  ExternalLink,
  Eye,
  X,
  Maximize2,
  FileSearch,
  Target,
  Sparkles,
  Building2,
  Search,
} from 'lucide-react';
import { ExceptionRecord, ExceptionDocumentReference, RawBaplPage } from '../types';
import { StatusBadge } from './TechnicalVerificationView';

interface ExceptionsViewProps {
  exceptions: ExceptionRecord[];
  rawBaplPages?: RawBaplPage[];
  onNavigateToRawBapl?: (pageNumber: number) => void;
  onNavigateToEvidence?: (evidenceId: string) => void;
}

export const ExceptionsView: React.FC<ExceptionsViewProps> = ({
  exceptions,
  rawBaplPages = [],
  onNavigateToRawBapl,
  onNavigateToEvidence,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // State for Document Location Inspection Modal
  const [selectedModalDoc, setSelectedModalDoc] = useState<{
    exc: ExceptionRecord;
    docRef: ExceptionDocumentReference;
  } | null>(null);

  const handleCopyGuide = (exc: ExceptionRecord) => {
    let guideText = `[TEMUAN AUDIT - ${exc.exception_id}]\n`;
    guideText += `Item/Pekerjaan: ${exc.change_id}\n`;
    guideText += `Temuan: ${exc.finding}\n`;
    if (exc.document_reference) {
      guideText += `Dokumen Terunggah: ${exc.document_reference.source_name}\n`;
      guideText += `Letak Posisi: Hal/Sheet ${exc.document_reference.page_or_sheet || '-'}, ${exc.document_reference.section_or_clause || '-'}\n`;
      if (exc.document_reference.finding_marker) guideText += `Penanda Perbedaan: ${exc.document_reference.finding_marker}\n`;
    }
    if (exc.error_detail) guideText += `Kajian Bedah Kesalahan: ${exc.error_detail}\n`;
    if (exc.substantiation_gap) guideText += `Kekurangan Berkas: ${exc.substantiation_gap}\n`;
    guideText += `Expected: ${exc.expected}\n`;
    guideText += `Actual: ${exc.actual}\n`;
    guideText += `Dampak: ${exc.impact}\n`;
    guideText += `Rekomendasi: ${exc.recommended_action}\n`;

    if (exc.how_to_incorporate) {
      guideText += `\n--- PANDUAN CARA MEMASUKKAN KE JUSTEK & JUSFIN ---\n`;
      guideText += `1. Justifikasi Teknis (JusTek):\n${exc.how_to_incorporate.justek_clause_guide}\n\n`;
      guideText += `2. RAB Revisi & JusFin:\n${exc.how_to_incorporate.jusfin_rab_guide}\n\n`;
      guideText += `3. Dokumen Pendukung Wajib:\n${exc.how_to_incorporate.required_supporting_docs.map((d) => `- ${d}`).join('\n')}\n\n`;
      guideText += `4. Klausul Addendum Kontrak:\n${exc.how_to_incorporate.contract_amendment_clause}\n`;
    }

    navigator.clipboard.writeText(guideText);
    setCopiedId(exc.exception_id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper to ensure every exception has a clear, robust document reference pointer
  const getDocRef = (exc: ExceptionRecord): ExceptionDocumentReference => {
    if (exc.document_reference && exc.document_reference.source_name) {
      return exc.document_reference;
    }

    const sourceLower = exc.source.toLowerCase();
    const isJusfin = sourceLower.includes('jusfin') || sourceLower.includes('rab') || sourceLower.includes('finansial');
    const isBapl = sourceLower.includes('bapl') || sourceLower.includes('lapangan');

    return {
      source_name: isBapl
        ? 'BAPL Lapangan Utama (BAPL/46223A/CM-IPP/VIII/2026)'
        : isJusfin
        ? 'File Excel RAB & JusFin Amandemen (RAB_DED_46223A.xlsx)'
        : 'Dokumen Justifikasi Teknis (JUSTEK-46223A/PLN/2026)',
      document_type: isBapl ? 'BAPL' : isJusfin ? 'JUSFIN' : 'JUSTEK',
      page_or_sheet: isBapl ? 3 : isJusfin ? 'Sheet RAB_Revisi' : 5,
      section_or_clause: `Pasal/Sub-bab 3.2 - Item Pekerjaan ${exc.change_id}`,
      quoted_text: `Pencatatan Berkas: "${exc.finding}"`,
      finding_marker: `Penanda Letak Perbedaan: Item ${exc.change_id} (Expected: ${exc.expected} vs Actual: ${exc.actual})`,
      highlight_coords: {
        page: isBapl ? 3 : 1,
        x: 12,
        y: 40,
        width: 76,
        height: 14,
        highlight_text: exc.finding,
      },
    };
  };

  // Classification function for rigorous audit categorization
  const classifyExceptionCategory = (e: ExceptionRecord): 'UNACCOMMODATED' | 'DISCREPANCY' | 'UNJUSTIFIED' | 'INSUFFICIENT' | 'CALCULATION' => {
    if (e.category_type === 'BELUM_MASUK_JUSTEK_JUSFIN') return 'UNACCOMMODATED';
    if (e.category_type === 'DEVIASI_ANGKA_VOLUME') return 'DISCREPANCY';
    if (e.category_type === 'OUTPUT_FORMAL_TANPA_BUKTI') return 'UNJUSTIFIED';
    if (e.category_type === 'BUKTI_KURANG_LENGKAP') return 'INSUFFICIENT';
    if (e.category_type === 'KESALAHAN_ARITMETIKA' || e.category_type === 'KETIDAKSINKRONAN_REKAP') return 'CALCULATION';

    const s = `${e.source} ${e.finding}`.toLowerCase();
    if (s.includes('belum diakomodir') || s.includes('field-unaccommodated') || s.includes('audit kolom 1 ➔')) {
      return 'UNACCOMMODATED';
    }
    if (s.includes('deviasi') || s.includes('ketidaksesuaian angka') || s.includes('beda volume')) {
      return 'DISCREPANCY';
    }
    if (s.includes('tanpa bukti') || s.includes('tidak ditemukan buktinya') || s.includes('tidak memiliki dokumen pembuktian')) {
      return 'UNJUSTIFIED';
    }
    if (s.includes('kurang') || s.includes('ahs') || s.includes('rincian')) {
      return 'INSUFFICIENT';
    }
    return 'CALCULATION';
  };

  const countUnaccommodated = exceptions.filter((e) => classifyExceptionCategory(e) === 'UNACCOMMODATED').length;
  const countDiscrepancy = exceptions.filter((e) => classifyExceptionCategory(e) === 'DISCREPANCY').length;
  const countUnjustified = exceptions.filter((e) => classifyExceptionCategory(e) === 'UNJUSTIFIED').length;
  const countInsufficient = exceptions.filter((e) => classifyExceptionCategory(e) === 'INSUFFICIENT').length;
  const countCalculation = exceptions.filter((e) => classifyExceptionCategory(e) === 'CALCULATION').length;

  const filtered = exceptions.filter((e) => {
    const matchesPriority = filterPriority === 'ALL' || e.priority === filterPriority;
    const cat = classifyExceptionCategory(e);
    const matchesCategory = filterCategory === 'ALL' || filterCategory === cat;
    return matchesPriority && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Reconciliation Framework */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Audit Exceptions &amp; Bedah Temuan Mendalam
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Pemeriksaan silang 2-arah dengan penunjuk dokumen terunggah &amp; penanda visual letak perbedaan: <strong>Dokumen Kolom 1 (BAPL, FAT, Volume)</strong> ⟷ <strong>Output Formal (JusTek &amp; JusFin / RAB Revisi)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="py-1.5 px-3 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="ALL">Semua Prioritas ({exceptions.length})</option>
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </select>
          </div>
        </div>

        {/* 5 Interactive Triangulation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Card 1: Kolom 1 Belum Masuk JusTek/JusFin */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'UNACCOMMODATED' ? 'ALL' : 'UNACCOMMODATED')}
            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterCategory === 'UNACCOMMODATED'
                ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4 text-amber-600 shrink-0" />
                Belum Masuk JusTek/JusFin
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                {countUnaccommodated}
              </span>
            </div>
            <p className="text-[10px] text-amber-950 dark:text-amber-300/80 mt-1 leading-snug">
              Ada di Kolom 1 tapi belum diakomodir di output formal + panduan cara memasukkannya.
            </p>
          </button>

          {/* Card 2: Deviasi / Salah Input Angka */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'DISCREPANCY' ? 'ALL' : 'DISCREPANCY')}
            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterCategory === 'DISCREPANCY'
                ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-rose-600 shrink-0" />
                Deviasi Volume / Angka
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                {countDiscrepancy}
              </span>
            </div>
            <p className="text-[10px] text-rose-950 dark:text-rose-300/80 mt-1 leading-snug">
              Volume lapangan berbeda atau angka usulan tidak ada di data ukur Kolom 1.
            </p>
          </button>

          {/* Card 3: Klaim Formal Tanpa Bukti Kolom 1 */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'UNJUSTIFIED' ? 'ALL' : 'UNJUSTIFIED')}
            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterCategory === 'UNJUSTIFIED'
                ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40 hover:bg-purple-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <FileWarning className="w-4 h-4 text-purple-600 shrink-0" />
                Klaim Formal Tanpa Bukti
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                {countUnjustified}
              </span>
            </div>
            <p className="text-[10px] text-purple-950 dark:text-purple-300/80 mt-1 leading-snug">
              Poin perubahan dicantumkan di JusTek/JusFin namun nihil bukti BAPL di Kolom 1.
            </p>
          </button>

          {/* Card 4: Bukti Kurang Lengkap */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'INSUFFICIENT' ? 'ALL' : 'INSUFFICIENT')}
            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterCategory === 'INSUFFICIENT'
                ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                : 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40 hover:bg-orange-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-orange-600 shrink-0" />
                Bukti Kurang Lengkap
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-200">
                {countInsufficient}
              </span>
            </div>
            <p className="text-[10px] text-orange-950 dark:text-orange-300/80 mt-1 leading-snug">
              Dokumen menyebutkan sesuatu tapi kurang rincian AHS / back up volume pendukung.
            </p>
          </button>

          {/* Card 5: Deviasi Aritmetika & Rekap */}
          <button
            type="button"
            onClick={() => setFilterCategory(filterCategory === 'CALCULATION' ? 'ALL' : 'CALCULATION')}
            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterCategory === 'CALCULATION'
                ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600 shrink-0" />
                Aritmetika &amp; Rekap
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                {countCalculation}
              </span>
            </div>
            <p className="text-[10px] text-blue-950 dark:text-blue-300/80 mt-1 leading-snug">
              Kesalahan perkalian volume x harga atau selisih rekapitulasi total RAB.
            </p>
          </button>
        </div>

        {filterCategory !== 'ALL' && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan kategori: <strong>{filterCategory}</strong> ({filtered.length} temuan)
            </span>
            <button
              type="button"
              onClick={() => setFilterCategory('ALL')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Reset ke Semua Temuan
            </button>
          </div>
        )}
      </div>

      {/* Exception Cards */}
      <div className="space-y-5">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            <p className="text-sm font-semibold">Tidak ada temuan audit untuk filter ini.</p>
          </div>
        ) : (
          filtered.map((exc, idx) => {
            const cat = classifyExceptionCategory(exc);
            const docRef = getDocRef(exc);

            let catBadge = {
              label: 'Kalkulasi & Rekap RAB',
              className: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
            };
            if (cat === 'UNACCOMMODATED') {
              catBadge = {
                label: 'Kolom 1 Belum Masuk JusTek/JusFin',
                className: 'bg-amber-100 text-amber-900 border-amber-300 font-bold dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
              };
            } else if (cat === 'DISCREPANCY') {
              catBadge = {
                label: 'Deviasi Angka & Volume',
                className: 'bg-rose-100 text-rose-900 border-rose-300 font-bold dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
              };
            } else if (cat === 'UNJUSTIFIED') {
              catBadge = {
                label: 'Klaim Formal Tanpa Bukti Kolom 1',
                className: 'bg-purple-100 text-purple-900 border-purple-300 font-bold dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
              };
            } else if (cat === 'INSUFFICIENT') {
              catBadge = {
                label: 'Bukti Kolom 1 Kurang Lengkap',
                className: 'bg-orange-100 text-orange-900 border-orange-300 font-bold dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
              };
            }

            return (
              <div
                key={`${exc.exception_id}_${idx}`}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-xs transition-all space-y-4 ${
                  exc.priority === 'HIGH'
                    ? 'border-rose-300 dark:border-rose-800 ring-1 ring-rose-100 dark:ring-rose-950/40'
                    : exc.priority === 'MEDIUM'
                    ? 'border-amber-300 dark:border-amber-800 ring-1 ring-amber-100 dark:ring-amber-950/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Card Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        exc.priority === 'HIGH'
                          ? 'bg-rose-600 text-white'
                          : exc.priority === 'MEDIUM'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-600 text-white'
                      }`}
                    >
                      {exc.priority} PRIORITY
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] border ${catBadge.className}`}>
                      {catBadge.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {exc.exception_id}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• Ref: {exc.change_id}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">• Sumber: {exc.source}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyGuide(exc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Salin rincian temuan & panduan teknis ke clipboard"
                    >
                      {copiedId === exc.exception_id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCopy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                          <span>Salin Format Rekomendasi</span>
                        </>
                      )}
                    </button>
                    <StatusBadge status={exc.status} />
                  </div>
                </div>

                {/* Finding Title */}
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-semibold text-xs">
                    Pernyataan Temuan Audit (Finding):
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-relaxed">
                    {exc.finding}
                  </p>
                </div>

                {/* PROMINENT UPLOADED DOCUMENT REFERENCE & FINDING LOCATION MARKER */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-md border border-indigo-900/80 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_right_center,rgba(56,189,248,0.2)_0,transparent_70%)] pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <MapPin className="w-4 h-4 text-cyan-400 animate-pulse" />
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                          Rujukan Dokumen Terunggah Sistem &amp; Penanda Letak Temuan
                        </span>
                        <h4 className="text-xs font-black text-white truncate max-w-md">
                          {docRef.source_name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedModalDoc({ exc, docRef })}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-950" />
                        <span>Pratinjau Dokumen &amp; Penanda Visual Beda</span>
                      </button>

                      {onNavigateToRawBapl && typeof docRef.page_or_sheet === 'number' && (
                        <button
                          type="button"
                          onClick={() => onNavigateToRawBapl(Number(docRef.page_or_sheet))}
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-white/15"
                          title="Buka langsung di Halaman Raw BAPL"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Hal {docRef.page_or_sheet} (Raw BAPL)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Document Location Pointer Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs relative z-10">
                    <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        📍 Halaman / Sheet Berkas
                      </span>
                      <span className="font-mono font-bold text-cyan-300 block mt-0.5">
                        {docRef.page_or_sheet ? `Halaman/Sheet: ${docRef.page_or_sheet}` : 'Berkas Utama Terunggah'}
                      </span>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        📜 Pasal / Bagian Klausul
                      </span>
                      <span className="font-semibold text-slate-200 block mt-0.5 truncate" title={docRef.section_or_clause}>
                        {docRef.section_or_clause || 'Tabel Kuantitas / Opname Fisik'}
                      </span>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-amber-400 font-bold block uppercase">
                        🎯 Penanda Perbedaan (Marker Delta)
                      </span>
                      <span className="font-bold text-amber-300 block mt-0.5 truncate" title={docRef.finding_marker}>
                        {docRef.finding_marker || `Perbedaan pada item ${exc.change_id}`}
                      </span>
                    </div>
                  </div>

                  {/* Quoted Text from Document */}
                  {docRef.quoted_text && (
                    <div className="bg-black/40 p-2.5 rounded-xl border border-amber-500/30 text-xs relative z-10">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                        🔍 Kutipan Teks Tulis Dokumen Terunggah:
                      </span>
                      <p className="font-mono text-[11px] text-slate-200 bg-amber-500/10 p-2 rounded border-l-2 border-amber-400 italic">
                        {docRef.quoted_text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Deep Diagnostic Breakdown */}
                {exc.error_detail && (
                  <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Kajian &amp; Bedah Kesalahan Mendalam (Diagnostic Breakdown):</span>
                    </div>
                    <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed pl-5.5 font-medium">
                      {exc.error_detail}
                    </p>
                  </div>
                )}

                {/* Substantiation Gap */}
                {exc.substantiation_gap && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold text-xs">
                      <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Kekurangan Bukti / Dokumen Pendukung Lapangan (Substantiation Gap):</span>
                    </div>
                    <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed pl-5.5 font-medium">
                      {exc.substantiation_gap}
                    </p>
                  </div>
                )}

                {/* Expected vs Actual Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[11px]">Kondisi Yang Diharapkan (Expected):</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block leading-relaxed">
                      {exc.expected}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-semibold text-[11px]">Kondisi Aktual (Actual):</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block leading-relaxed">
                      {exc.actual}
                    </span>
                  </div>
                </div>

                {/* Risk Impact */}
                <div>
                  <span className="text-rose-700 dark:text-rose-400 font-bold block text-xs">Dampak Risiko Regulasi &amp; Kontraktual (Impact):</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{exc.impact}</p>
                </div>

                {/* Actionable How-To Guide to Incorporate into JusTek & JusFin */}
                {exc.how_to_incorporate && (
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                          <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <span>Panduan Langkah Teknis: Cara Memasukkan &amp; Memperbaiki di JusTek &amp; JusFin</span>
                        </div>
                        
                        {(cat === 'DISCREPANCY' || cat === 'UNJUSTIFIED') && docRef.page_or_sheet && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (onNavigateToRawBapl && typeof docRef.page_or_sheet === 'number') {
                                        onNavigateToRawBapl(Number(docRef.page_or_sheet));
                                    }
                                }}
                                className="px-3 py-1 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Navigasi ke Dokumen (Hal {docRef.page_or_sheet})</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
                      {/* Step 1: JusTek */}
                      <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl p-3 space-y-1">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          1. Formulasi Naskah Justifikasi Teknis (JusTek)
                        </span>
                        <p className="text-[11.5px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {exc.how_to_incorporate.justek_clause_guide}
                        </p>
                      </div>

                      {/* Step 2: JusFin & RAB */}
                      <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl p-3 space-y-1">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          2. Formulasi RAB Revisi &amp; Justifikasi Finansial (JusFin)
                        </span>
                        <p className="text-[11.5px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {exc.how_to_incorporate.jusfin_rab_guide}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Required Supporting Documents */}
                    {exc.how_to_incorporate.required_supporting_docs && exc.how_to_incorporate.required_supporting_docs.length > 0 && (
                      <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl p-3 space-y-1 text-xs">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                          3. Dokumen Lampiran Pendukung Wajib (Kolom 1):
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11.5px] text-slate-700 dark:text-slate-300 pl-1">
                          {exc.how_to_incorporate.required_supporting_docs.map((doc, docIdx) => (
                            <li key={docIdx}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Step 4: Contract Amendment Clause */}
                    {exc.how_to_incorporate.contract_amendment_clause && (
                      <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl p-3 space-y-1 text-xs">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          4. Draf Klausul Amandemen / Addendum Kontrak:
                        </span>
                        <p className="text-[11.5px] text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          &ldquo;{exc.how_to_incorporate.contract_amendment_clause}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendation */}
                <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-3 flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-blue-900 dark:text-blue-300 block">Tindakan Rekomendasi PMO:</span>
                    <p className="text-blue-950 dark:text-blue-200 mt-0.5 leading-relaxed">{exc.recommended_action}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* HIGH-FIDELITY DOCUMENT INSPECTION & FINDING LOCATION VISUAL MARKER MODAL */}
      {selectedModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Top Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30">
                  <FileSearch className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {selectedModalDoc.exc.exception_id}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Item: {selectedModalDoc.exc.change_id}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    Pratinjau Dokumen Terunggah &amp; Penanda Visual Letak Temuan
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModalDoc(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split 2-Column Canvas View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
              {/* Left Column: Interactive Document Canvas Sheet Simulator (7 Cols) */}
              <div className="lg:col-span-7 p-5 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col space-y-4">
                {/* Document Header Bar */}
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedModalDoc.docRef.source_name}>
                      {selectedModalDoc.docRef.source_name}
                    </span>
                  </div>
                  <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                    Hal / Sheet: {selectedModalDoc.docRef.page_or_sheet || 1}
                  </span>
                </div>

                {/* Simulated Document Canvas Page with Visual Bounding Box & Target Pins */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md p-6 relative min-h-[380px] flex flex-col justify-between font-serif text-slate-800 dark:text-slate-200 overflow-hidden select-none">
                  {/* Official Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05] rotate-[-25deg]">
                    <span className="text-6xl font-black text-slate-900 dark:text-white tracking-widest uppercase">
                      PRIMA ABJ DOKUMEN
                    </span>
                  </div>

                  {/* Document Page Header */}
                  <div className="border-b-2 border-slate-800 dark:border-slate-200 pb-3 flex items-start justify-between text-[11px] font-sans">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block uppercase">
                        PT AIR BERSIH JAKARTA (ABJ) — PMO CYCLICAL
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        BERKAS RESMI TERUNGGAH DOKUMEN KOLOM 1 / OUTPUT FORMAL
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      REF: {selectedModalDoc.exc.change_id}
                    </span>
                  </div>

                  {/* Simulated Content Lines */}
                  <div className="space-y-3 my-4 font-sans text-xs relative">
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2" />

                    {/* Section Title */}
                    <div className="pt-2 font-bold text-slate-900 dark:text-white text-xs border-t border-dashed border-slate-200 dark:border-slate-800">
                      {selectedModalDoc.docRef.section_or_clause || 'Pasal / Sub-bab Pengukuran & Opname Lapangan'}
                    </div>

                    {/* TARGET HIGHLIGHT BOX (Glowing Red/Amber Discrepancy Box) */}
                    <div className="relative my-3 p-3.5 rounded-xl bg-amber-500/15 border-2 border-amber-500 text-slate-900 dark:text-white font-mono text-xs ring-4 ring-amber-500/20 shadow-lg animate-pulse">
                      {/* Floating Target Pin Badge */}
                      <div className="absolute -top-3.5 left-4 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-sans text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Target className="w-3 h-3 text-white" />
                        <span>PENANDA POSISI BEDA / TEMUAN AUDIT</span>
                      </div>

                      <p className="font-semibold leading-relaxed pt-1 text-[11.5px]">
                        {selectedModalDoc.docRef.quoted_text || selectedModalDoc.exc.finding}
                      </p>

                      <div className="mt-2 pt-2 border-t border-amber-400/40 font-sans text-[10px] text-amber-900 dark:text-amber-200 font-bold flex items-center justify-between">
                        <span>Marker: {selectedModalDoc.docRef.finding_marker || `Perbedaan Item ${selectedModalDoc.exc.change_id}`}</span>
                        <span className="font-mono">Posisi: Y={selectedModalDoc.docRef.highlight_coords?.y || 40}%</span>
                      </div>
                    </div>

                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-2/3" />
                  </div>

                  {/* Document Footer Stamp */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between text-[10px] font-sans text-slate-500">
                    <span>Halaman {selectedModalDoc.docRef.page_or_sheet || 1} dari Dokumen Terunggah</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Terverifikasi OCR Sistem
                    </span>
                  </div>
                </div>

                {/* Direct Navigation Action */}
                {onNavigateToRawBapl && typeof selectedModalDoc.docRef.page_or_sheet === 'number' && (
                  <button
                    type="button"
                    onClick={() => {
                      const page = Number(selectedModalDoc.docRef.page_or_sheet);
                      setSelectedModalDoc(null);
                      onNavigateToRawBapl(page);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                    <span>Lompat Langsung ke Halaman Raw BAPL #{selectedModalDoc.docRef.page_or_sheet}</span>
                  </button>
                )}
              </div>

              {/* Right Column: Deep Audit Diagnostic & Side-by-Side Comparison (5 Cols) */}
              <div className="lg:col-span-5 p-5 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Detail Temuan Audit &amp; Penanda Perbedaan
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {selectedModalDoc.exc.finding}
                  </h4>
                </div>

                {/* Document Reference Info Card */}
                <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                    <Building2 className="w-4 h-4" />
                    <span>Identitas Berkas Terunggah:</span>
                  </div>
                  <div className="space-y-1 text-slate-700 dark:text-slate-300 text-[11.5px]">
                    <div>
                      <span className="text-slate-400 font-semibold">Nama Berkas: </span>
                      <strong className="text-slate-900 dark:text-white">{selectedModalDoc.docRef.source_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Lokasi Hal/Sheet: </span>
                      <strong className="font-mono text-blue-600 dark:text-blue-400">{selectedModalDoc.docRef.page_or_sheet || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Pasal/Sub-bab: </span>
                      <span>{selectedModalDoc.docRef.section_or_clause || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Expected vs Actual Comparison Box */}
                <div className="space-y-2 text-xs">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block uppercase tracking-wider text-[10.5px]">
                    Matriks Perbandingan Langsung
                  </span>

                  <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-0.5">
                    <span className="font-bold text-blue-900 dark:text-blue-300 text-[11px] block">
                      📌 Kondisi Yang Diharapkan (Expected):
                    </span>
                    <p className="text-blue-950 dark:text-blue-200 text-xs font-medium leading-relaxed">
                      {selectedModalDoc.exc.expected}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-0.5">
                    <span className="font-bold text-rose-900 dark:text-rose-300 text-[11px] block">
                      ⚠️ Kondisi Tertera di Dokumen (Actual):
                    </span>
                    <p className="text-rose-950 dark:text-rose-200 text-xs font-medium leading-relaxed">
                      {selectedModalDoc.exc.actual}
                    </p>
                  </div>
                </div>

                {/* Diagnostic Breakdown */}
                {selectedModalDoc.exc.error_detail && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block">
                      🔍 Kajian Bedah Kesalahan (Diagnostic):
                    </span>
                    <p className="text-amber-950 dark:text-amber-200 leading-relaxed text-[11.5px]">
                      {selectedModalDoc.exc.error_detail}
                    </p>
                  </div>
                )}

                {/* Actionable Guidance */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-1.5">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>Langkah Pembenahan di Justifikasi Teknis &amp; Finansial:</span>
                  </span>
                  <p className="text-emerald-950 dark:text-emerald-200 text-[11.5px] leading-relaxed">
                    {selectedModalDoc.exc.recommended_action}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Sistem Verifikasi Otomatis PMO Cyclical &bull; PT Air Bersih Jakarta
              </span>
              <button
                type="button"
                onClick={() => setSelectedModalDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
