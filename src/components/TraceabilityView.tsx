import React, { useState, useMemo } from 'react';
import {
  GitCommit,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Eye,
  X,
  Copy,
  Check,
  Calendar,
  Clock,
  Layers,
  FileCheck,
  FileText,
  ShieldCheck,
  Activity,
  Sliders,
  Award,
  ChevronRight,
  Filter,
  Info,
  TrendingUp,
  FileSpreadsheet,
  ExternalLink,
  ChevronDown,
  Building2,
  UserCheck,
  HelpCircle,
  Hash,
} from 'lucide-react';
import {
  TraceabilityRecord,
  ProjectIdentity,
  TechnicalChange,
  FinancialItem,
  EvidenceRecord,
  TotalRabVerification,
  VerificationStatus,
} from '../types';
import { StatusBadge } from './TechnicalVerificationView';
import { HighlightedText } from './HighlightedText';

export interface TraceabilityViewProps {
  records: TraceabilityRecord[];
  project?: ProjectIdentity;
  changes?: TechnicalChange[];
  financialItems?: FinancialItem[];
  evidences?: EvidenceRecord[];
  totalRab?: TotalRabVerification;
  onDownloadPdf?: () => void;
}

export type TimelineStageId = 'ALL' | 'MC-0' | 'JUSTEK' | 'BAPL' | 'KOMISIONING' | 'MC-100';

interface StageDefinition {
  id: TimelineStageId;
  code: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  stageNumber: number;
  dateStr: string;
  docNumber: string;
  docCategory: string;
  signatories: string;
  description: string;
  highlightColor: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    iconBg: string;
    ring: string;
  };
  auditFocus: string;
  evidenceItemsCount: number;
  status: 'VERIFIED' | 'REVIEW' | 'IN_PROGRESS' | 'COMPLETED';
}

export const TraceabilityView: React.FC<TraceabilityViewProps> = ({
  records = [],
  project,
  changes = [],
  financialItems = [],
  evidences = [],
  totalRab,
  onDownloadPdf,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'matrix' | 'combined'>('combined');
  const [selectedStage, setSelectedStage] = useState<TimelineStageId>('ALL');
  const [search, setSearch] = useState('');
  const [consistencyFilter, setConsistencyFilter] = useState<'ALL' | 'LENGKAP' | 'GAPS'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<TraceabilityRecord | null>(null);
  const [selectedItemForTimeline, setSelectedItemForTimeline] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fallback defaults from project data if available
  const projectCode = project?.projectCode || '46223A';
  const projectName = project?.projectName || 'Cyclical Maintenance - Penggantian IPP Area Distribusi';
  const contractorName = project?.contractor || 'PT. Rekatama Elektrikal Mandiri';
  const locationName = project?.location || 'Gedung Distribusi, Filter & Substation';
  const baplNumber = project?.baplNumber || `BAPL/${projectCode}/CM-IPP/VIII/2026`;
  const poNumber = project?.poNumber || `PO-${projectCode}-PLN-2026`;
  const baseDate = project?.date || '2026-08-14';

  // Dynamic Timeline Stages Definition
  const timelineStages: StageDefinition[] = useMemo(() => {
    return [
      {
        id: 'MC-0',
        code: 'MC-0',
        shortLabel: 'Mutual Check 0%',
        title: 'MC-0 (Mutual Check 0%) & Baseline Kontrak',
        subtitle: 'Kick-off Survey Lapangan Bersama & Penetapan Titik Nol',
        stageNumber: 1,
        dateStr: '15 Juli 2026',
        docNumber: `BA-MC0/${projectCode}/VII/2026`,
        docCategory: 'Berita Acara Survey Bersama & Baseline DED',
        signatories: 'Kontraktor Pelaksana, Konsultan Pengawas, Tim Teknis PMO ABJ',
        description:
          'Pengukuran bersama kondisi eksisting nol persen di lapangan sebelum mobilisasi fisik. Menyelaraskan gambar Detail Engineering Design (DED) dengan kondisi riil serta mengunci volume baseline RAB awal.',
        highlightColor: {
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
          iconBg: 'bg-blue-600 text-white',
          ring: 'ring-blue-500',
        },
        auditFocus: 'Validasi elevasi tanah, trase pipa/jalur kabel awal, dan kuantitas baseline RAB.',
        evidenceItemsCount: records.length,
        status: 'VERIFIED',
      },
      {
        id: 'JUSTEK',
        code: 'JusTek & JusFin',
        shortLabel: 'Rekayasa & JusTek',
        title: 'Justifikasi Teknis (JusTek) & Justifikasi Finansial (JusFin)',
        subtitle: 'Kajian Rekayasa Lapangan, Perubahan Spesifikasi & Usulan CCO',
        stageNumber: 2,
        dateStr: '28 Juli 2026',
        docNumber: `JUSTEK-${projectCode}/PLN/2026`,
        docCategory: 'Dokumen Justifikasi Teknis & Analisa Finansial (CCO)',
        signatories: 'Project Manager, Lead Technical Reviewer PMO, Financial Reviewer',
        description:
          'Ditemukan kendala fisik lapangan atau optimalisasi fabrikasi (seperti transisi tiang heksagonal ke bulat teleskopik, efisiensi penarikan rute kabel coaxial, perkuatan bracket). Pengajuan justifikasi teknis dan RAB revisi.',
        highlightColor: {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
          badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
          iconBg: 'bg-amber-500 text-white',
          ring: 'ring-amber-500',
        },
        auditFocus: 'Pemeriksaan dasar perhitungan analisa harga satuan (AHSP), toleransi variansi anggaran, dan kompensasi jadwal.',
        evidenceItemsCount: records.filter((r) => r.justek_claim && !r.justek_claim.includes('Tidak ada')).length,
        status: 'REVIEW',
      },
      {
        id: 'BAPL',
        code: 'BAPL Lapangan',
        shortLabel: 'Opname Fisik BAPL',
        title: 'Berita Acara Peninjauan / Opname Lapangan (BAPL)',
        subtitle: 'Pemeriksaan Fisik Terpasang, Pengukuran Aktual & Bukti Multi-Dokumen',
        stageNumber: 3,
        dateStr: baseDate,
        docNumber: baplNumber,
        docCategory: 'Berita Acara Pemeriksaan Fisik Lapangan & Lembar Ukur',
        signatories: 'Site Inspector Kontraktor, Konsultan Pengawas Lapangan, Site Engineer PMO',
        description:
          'Peninjauan fisik bersama di lokasi gedung instalasi (Distribusi, Filter, Substation). Melakukan opname fisik riil, pengukuran dimensi bertingkat, verifikasi material terpasang, dan pembuktian visual OCR.',
        highlightColor: {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
          iconBg: 'bg-emerald-600 text-white',
          ring: 'ring-emerald-500',
        },
        auditFocus: 'Pencocokan hasil opname fisik dengan klausul BAPL (kabel terpasang 176,4 m, tiang pipa bulat galvanis, paraf dan stempel resmi).',
        evidenceItemsCount: records.filter((r) => r.bapl_evidence && !r.bapl_evidence.includes('TIDAK ADA')).length,
        status: 'VERIFIED',
      },
      {
        id: 'KOMISIONING',
        code: 'Komisioning',
        shortLabel: 'Uji Fungsi & FAT',
        title: 'Tes Komisioning & Pengujian Kelaikan Operasional',
        subtitle: 'Pengukuran Parameter Kinerja, Tahanan Tanah & Uji Beban',
        stageNumber: 4,
        dateStr: '20 Agustus 2026',
        docNumber: `BA-COMM/${projectCode}/VIII/2026`,
        docCategory: 'Berita Acara Pengujian Kelaikan & Laporan Earth Tester',
        signatories: 'Lead Commissioning Engineer, Tim QA/QC, Konsultan Pengawas',
        description:
          'Pengujian operasional seluruh sistem yang terpasang. Meliputi uji tahanan pembumian (< 2 Ohm pada Gedung Distribusi, Filter, Substation), uji kontinuitas instalasi, dan sertifikasi kelaikan teknis sebelum penyerahan.',
        highlightColor: {
          bg: 'bg-indigo-50 dark:bg-indigo-950/40',
          text: 'text-indigo-700 dark:text-indigo-300',
          border: 'border-indigo-200 dark:border-indigo-800',
          badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
          iconBg: 'bg-indigo-600 text-white',
          ring: 'ring-indigo-500',
        },
        auditFocus: 'Validasi hasil uji laboratorium / alat ukur terkalibrasi dan pemenuhan standar kepatuhan teknis PUIL/SPLN/SNI.',
        evidenceItemsCount: records.filter(
          (r) =>
            r.bapl_evidence.toLowerCase().includes('uji') ||
            r.bapl_evidence.toLowerCase().includes('tahanan') ||
            r.bapl_evidence.toLowerCase().includes('ohm') ||
            r.bapl_evidence.toLowerCase().includes('komisioning')
        ).length || 2,
        status: 'VERIFIED',
      },
      {
        id: 'MC-100',
        code: 'MC-100 & BAST',
        shortLabel: 'MC-100 & BAST',
        title: 'MC-100 (Mutual Check 100%) & Serah Terima Pekerjaan (BAST)',
        subtitle: 'Rekonsiliasi Akhir Volume, As-Built Drawing & Penutupan Traceability',
        stageNumber: 5,
        dateStr: '28 Agustus 2026',
        docNumber: `BA-MC100/${projectCode}/VIII/2026 & MCO Approval`,
        docCategory: 'Berita Acara Mutual Check 100% & BAST I (PHO)',
        signatories: 'Direktur Kontraktor, Kepala Departemen PMO ABJ, Tim SPI/BPK Auditor',
        description:
          'Pemeriksaan akhir bersama untuk memverifikasi 100% volume realisasi terhadap kontrak adendum. Pengesahan as-built drawing final, penerbitan approval MCO, serta penutupan berkas audit secara akuntabel.',
        highlightColor: {
          bg: 'bg-purple-50 dark:bg-purple-950/40',
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-800',
          badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
          iconBg: 'bg-purple-600 text-white',
          ring: 'ring-purple-500',
        },
        auditFocus: 'Penyelesaian seluruh temuan audit (exceptions), rekonsiliasi selisih nilai RAB revisi, dan penutupan rantai penelusuran.',
        evidenceItemsCount: records.filter((r) => r.chain_consistent).length,
        status: 'COMPLETED',
      },
    ];
  }, [records, projectCode, baplNumber, baseDate]);

  // Active selected stage metadata
  const currentStageInfo = useMemo(() => {
    if (selectedStage === 'ALL') return null;
    return timelineStages.find((s) => s.id === selectedStage) || null;
  }, [selectedStage, timelineStages]);

  // Filtering records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search filter
      const matchesSearch =
        r.item.toLowerCase().includes(search.toLowerCase()) ||
        r.change_id.toLowerCase().includes(search.toLowerCase()) ||
        (r.traceability_ref_id && r.traceability_ref_id.toLowerCase().includes(search.toLowerCase())) ||
        r.bapl_evidence.toLowerCase().includes(search.toLowerCase()) ||
        r.justek_claim.toLowerCase().includes(search.toLowerCase());

      // Consistency filter
      const matchesConsistency =
        consistencyFilter === 'ALL' ||
        (consistencyFilter === 'LENGKAP' && r.chain_consistent) ||
        (consistencyFilter === 'GAPS' && !r.chain_consistent);

      // Stage filter
      let matchesStage = true;
      if (selectedStage === 'MC-0') {
        matchesStage = Boolean(r.rab_initial && r.rab_initial.trim().length > 0);
      } else if (selectedStage === 'JUSTEK') {
        matchesStage = Boolean(r.justek_claim && !r.justek_claim.toLowerCase().includes('tidak ada perubahan'));
      } else if (selectedStage === 'BAPL') {
        matchesStage = Boolean(r.bapl_evidence && !r.bapl_evidence.includes('TIDAK ADA BUKTI'));
      } else if (selectedStage === 'KOMISIONING') {
        matchesStage = Boolean(
          r.bapl_evidence.toLowerCase().includes('uji') ||
            r.bapl_evidence.toLowerCase().includes('tahanan') ||
            r.bapl_evidence.toLowerCase().includes('ohm') ||
            r.item.toLowerCase().includes('jasa') ||
            r.item.toLowerCase().includes('terminal')
        );
      } else if (selectedStage === 'MC-100') {
        matchesStage = Boolean(r.mco_document && r.mco_document.toLowerCase().includes('approved'));
      }

      return matchesSearch && matchesConsistency && matchesStage;
    });
  }, [records, search, consistencyFilter, selectedStage]);

  const handleCopy = (r: TraceabilityRecord) => {
    const txt = `[${r.change_id}] ${r.item}
Traceability ID: ${r.traceability_ref_id || '-'}
1. Tahap MC-0 (Baseline): ${r.rab_initial}
2. Tahap JusTek & CCO: ${r.justek_claim}
3. Tahap BAPL Lapangan: ${r.bapl_evidence}
4. Tahap RAB Revisi: ${r.rab_revised}
5. Tahap JusFin: ${r.jusfin_claim}
6. Tahap MC-100 (MCO Docs): ${r.mco_document}
Konsistensi Rantai: ${r.chain_consistent ? 'LENGKAP & SINKRON' : 'DITEMUKAN GAPS / ANOMALI'}
Status Akhir: ${r.final_status}`;

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalItems = records.length;
  const consistentItems = records.filter((r) => r.chain_consistent).length;
  const gapItems = totalItems - consistentItems;
  const consistencyPct = totalItems > 0 ? Math.round((consistentItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Header & Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <GitCommit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Rantai Audit Traceability Dokumen Konstruksi
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {projectCode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Kronologi Perubahan Dokumen: MC-0 &rarr; BAPL Lapangan &rarr; MC-100
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Penelusuran urutan perubahan dokumen secara kronologis mulai dari baseline kontrak (MC-0), usulan Justifikasi Teknis (JusTek), pembuktian fisik opname lapangan (BAPL), uji komisioning, hingga mutual check akhir (MC-100).
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Visual Timeline</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('combined')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'combined'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Terpadu (Split)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'matrix'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Matriks Tabel</span>
              </button>
            </div>

            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                title="Unduh Laporan Ringkasan Hasil Verifikasi Audit (Format PDF Siap Dibagikan)"
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 ring-2 ring-rose-400/30"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>Export Ringkasan PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Context & Progress Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Proyek / Pekerjaan
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5" title={projectName}>
              {projectName}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Kontraktor Pelaksana
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {contractorName}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Integritas Rantai Audit
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {consistencyPct}% Konsisten
              </span>
              <span className="text-[10px] text-slate-400">
                ({consistentItems}/{totalItems} Item)
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              No. BAPL Fisik Utama
            </span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-400 truncate block mt-0.5" title={baplNumber}>
              {baplNumber}
            </span>
          </div>
        </div>
      </div>

      {/* VISUAL TIMELINE COMPONENT (Rendered in 'timeline' and 'combined' modes) */}
      {(viewMode === 'timeline' || viewMode === 'combined') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Alur Kronologis Milestone Dokumen Konstruksi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Klik salah satu tahapan milestone untuk menyaring dan menginspeksi rincian perubahan pada fase tersebut.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedStage('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStage === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Lihat Semua Tahapan ({records.length} Item)
              </button>
            </div>
          </div>

          {/* Chronological Milestone Track / Rail */}
          <div className="relative pt-2 pb-4">
            {/* Horizontal Line connecting stages */}
            <div className="hidden md:block absolute top-12 left-10 right-10 h-1 bg-gradient-to-r from-blue-500 via-amber-400 via-emerald-500 via-indigo-500 to-purple-600 rounded-full z-0 opacity-70" />

            {/* Stage Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 relative z-10">
              {timelineStages.map((stage, idx) => {
                const isSelected = selectedStage === stage.id;

                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStage(isSelected ? 'ALL' : stage.id)}
                    className={`rounded-2xl p-4 transition-all cursor-pointer border text-left flex flex-col justify-between group relative ${
                      isSelected
                        ? `${stage.highlightColor.bg} ${stage.highlightColor.border} ring-2 ${stage.highlightColor.ring} shadow-md scale-[1.02]`
                        : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-2xs'
                    }`}
                  >
                    {/* Top Node Indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-110 ${
                          stage.highlightColor.iconBg
                        }`}
                      >
                        {stage.stageNumber}
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stage.status === 'COMPLETED' || stage.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {stage.status === 'COMPLETED' ? 'Selesai' : stage.status === 'VERIFIED' ? 'Terverifikasi' : 'Review'}
                      </span>
                    </div>

                    {/* Stage Meta */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold font-mono text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{stage.dateStr}</span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors">
                        {stage.shortLabel}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {stage.subtitle}
                      </p>
                    </div>

                    {/* Bottom Document Stamp Badge */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                      <span className="font-mono font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[110px]">
                        {stage.code}
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                        <span>Detail</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Stage Detailed Spotlight Card */}
          {currentStageInfo && (
            <div className={`p-5 rounded-2xl border ${currentStageInfo.highlightColor.bg} ${currentStageInfo.highlightColor.border} animate-in fade-in duration-200`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider ${currentStageInfo.highlightColor.badgeBg}`}>
                      Tahap {currentStageInfo.stageNumber} dari 5: {currentStageInfo.code}
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {currentStageInfo.dateStr}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      Ref: {currentStageInfo.docNumber}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {currentStageInfo.title}
                  </h3>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentStageInfo.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Pihak Pemeriksa &amp; Penandatangan (Tripartit)
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {currentStageInfo.signatories}
                      </span>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Fokus Verifikasi &amp; Standar Audit
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {currentStageInfo.auditFocus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex md:flex-col items-center justify-between gap-3">
                  <div className="bg-white/90 dark:bg-slate-900/90 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Item Terkait
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {filteredRecords.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Item Pekerjaan</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedStage('ALL')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Reset Filter Tahap
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Visual Step Cards by Item in Timeline Mode */}
          {viewMode === 'timeline' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Urutan Evolusi Dokumen Tiap Item Pekerjaan (MC-0 &rarr; BAPL &rarr; MC-100)
                </h4>
                <span className="text-xs text-slate-500">
                  Menampilkan {filteredRecords.length} dari {records.length} item
                </span>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-slate-500">
                  <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tidak ada item pekerjaan yang cocok dengan filter aktif
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Silakan ubah kata kunci pencarian atau reset filter tahapan di atas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((item, idx) => (
                    <div
                      key={`${item.change_id}_timeline_${idx}`}
                      className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                      {/* Item Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded-lg">
                            {item.change_id}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {item.item}
                            </h4>
                            {item.traceability_ref_id && (
                              <span className="text-[10px] font-mono text-blue-700 dark:text-blue-300">
                                Ref: {item.traceability_ref_id}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.chain_consistent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Rantai Sinkron
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              Ditemukan Gaps
                            </span>
                          )}
                          <StatusBadge status={item.final_status} />
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(item)}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-blue-50 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                            title="Tinjau Detail Berkas Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Visual Item Timeline Track (5-Step Horizontal Sequence) */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 pt-1 text-xs">
                        {/* Step 1: MC-0 */}
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-1.5 relative">
                          <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                            <span>1. MC-0 (Baseline)</span>
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 font-medium text-[11px] leading-relaxed line-clamp-3">
                            {item.rab_initial || 'Sesuai DED Awal'}
                          </p>
                          <span className="text-[9.5px] text-slate-400 block font-mono">
                            Dokumen: DED &amp; RAB Kontrak
                          </span>
                        </div>

                        {/* Step 2: JusTek */}
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-1.5 relative">
                          <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                            <span>2. Usulan JusTek</span>
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 font-medium text-[11px] leading-relaxed line-clamp-3">
                            {item.justek_claim}
                          </p>
                          <span className="text-[9.5px] text-slate-400 block font-mono">
                            Dokumen: JusTek &amp; CCO
                          </span>
                        </div>

                        {/* Step 3: BAPL Lapangan */}
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-1.5 relative ring-1 ring-emerald-400/40">
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                            <span>3. BAPL Lapangan</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <p className="text-emerald-950 dark:text-emerald-200 font-semibold text-[11px] leading-relaxed line-clamp-3">
                            {item.bapl_evidence}
                          </p>
                          <div className="flex items-center justify-between text-[9.5px] text-emerald-700 dark:text-emerald-400 font-mono">
                            <span>{item.evidence_type === 'EXPLICIT' ? 'Bukti Eksplisit' : 'Bukti Deduksi'}</span>
                            <span>{item.evidence_refs || 'BAPL Fisik'}</span>
                          </div>
                        </div>

                        {/* Step 4: RAB Revisi & JusFin */}
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 relative">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                            <span>4. RAB Revisi &amp; JusFin</span>
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 font-medium text-[11px] leading-relaxed line-clamp-3">
                            {item.rab_revised}
                          </p>
                          <span className="text-[9.5px] text-slate-400 block font-mono">
                            {item.jusfin_claim}
                          </span>
                        </div>

                        {/* Step 5: MC-100 & MCO */}
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 space-y-1.5 relative">
                          <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                            <span>5. MC-100 / MCO</span>
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                          </div>
                          <p className="text-slate-900 dark:text-slate-100 font-mono font-bold text-[11px] leading-relaxed truncate">
                            {item.mco_document}
                          </p>
                          <span className="text-[9.5px] text-purple-600 dark:text-purple-400 block font-bold">
                            {item.chain_consistent ? 'Status: Approved 100%' : 'Status: Perlu Penyesuaian'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TRACEABILITY TABLE MATRIX (Rendered in 'matrix' and 'combined' modes) */}
      {(viewMode === 'matrix' || viewMode === 'combined') && (
        <div className="space-y-4">
          {/* Table Header Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Matriks Traceability Dokumen 6 Pilar
              </h3>
              <span className="text-xs text-slate-400">
                ({filteredRecords.length} dari {records.length} baris)
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Consistency Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setConsistencyFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    consistencyFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setConsistencyFilter('LENGKAP')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    consistencyFilter === 'LENGKAP'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Lengkap ({consistentItems})
                </button>
                <button
                  type="button"
                  onClick={() => setConsistencyFilter('GAPS')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    consistencyFilter === 'GAPS'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Gaps ({gapItems})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari item, klaim, bukti..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-52"
                />
              </div>
            </div>
          </div>

          {/* Traceability Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-3 w-16">ID</th>
                    <th className="py-3.5 px-4 min-w-44">Item Pekerjaan</th>
                    <th className="py-3.5 px-3 min-w-32 bg-blue-50/40 dark:bg-blue-950/20">
                      1. MC-0 (RAB Awal)
                    </th>
                    <th className="py-3.5 px-3 min-w-36 bg-amber-50/40 dark:bg-amber-950/20">
                      2. JusTek Claim
                    </th>
                    <th className="py-3.5 px-4 min-w-48 bg-emerald-50/60 dark:bg-emerald-950/30">
                      3. BAPL Lapangan (Evidence)
                    </th>
                    <th className="py-3.5 px-3 min-w-36">4. RAB Revisi</th>
                    <th className="py-3.5 px-3 min-w-32">5. JusFin</th>
                    <th className="py-3.5 px-3 min-w-28 bg-purple-50/40 dark:bg-purple-950/20">
                      6. MC-100 (MCO)
                    </th>
                    <th className="py-3.5 px-3 w-24 text-center">Konsistensi</th>
                    <th className="py-3.5 px-3 w-28 text-center">Final Status</th>
                    <th className="py-3.5 px-3 w-16 text-center">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="font-semibold block">Tidak ada catatan traceability yang sesuai.</span>
                        <span className="text-[11px]">Silakan sesuaikan filter pencarian Anda.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr
                        key={`${r.change_id}_${idx}`}
                        onClick={() => setSelectedRecord(r)}
                        className="hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                          <div>{r.change_id}</div>
                          {r.traceability_ref_id && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {r.traceability_ref_id}
                            </span>
                          )}
                          {r.ba_anomaly_type && r.ba_anomaly_type !== 'NONE' && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-600 text-white animate-pulse">
                              ⚠️ ANOMALI BA
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <div>{r.item}</div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                            Evolusi: MC-0 &rarr; BAPL &rarr; MC-100
                          </span>
                        </td>

                        {/* 1. MC-0 RAB Awal */}
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] bg-blue-50/20 dark:bg-blue-950/10">
                          {r.rab_initial}
                        </td>

                        {/* 2. JusTek Claim */}
                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 text-[11px] bg-amber-50/20 dark:bg-amber-950/10">
                          {r.justek_claim}
                        </td>

                        {/* 3. BAPL Lapangan */}
                        <td className="py-3.5 px-4 text-emerald-950 dark:text-emerald-200 font-medium text-[11px] bg-emerald-50/40 dark:bg-emerald-950/20">
                          <div className="space-y-1">
                            {r.evidence_type === 'EXPLICIT' && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                                BUKTI EKSPLISIT
                              </span>
                            )}
                            {r.evidence_type === 'IMPLICIT' && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                BUKTI IMPLISIT
                              </span>
                            )}
                            {(!r.evidence_type || r.evidence_type === 'NONE') && r.bapl_evidence.includes('TIDAK ADA BUKTI') && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-200">
                                TIDAK ADA BUKTI
                              </span>
                            )}
                            <p className="line-clamp-2 leading-relaxed">{r.bapl_evidence}</p>
                          </div>
                        </td>

                        {/* 4. RAB Revisi */}
                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 text-[11px]">
                          {r.rab_revised}
                        </td>

                        {/* 5. JusFin Claim */}
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                          {r.jusfin_claim}
                        </td>

                        {/* 6. MCO Document */}
                        <td className="py-3.5 px-3 font-mono text-[10px] bg-purple-50/20 dark:bg-purple-950/10">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded ${
                              r.mco_document.toLowerCase().includes('approved') || r.mco_document.toLowerCase().includes('mc-0')
                                ? 'bg-purple-50 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold'
                                : r.mco_document.toLowerCase().includes('draft')
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'text-slate-500'
                            }`}
                          >
                            {r.mco_document}
                          </span>
                        </td>

                        {/* Konsistensi */}
                        <td className="py-3.5 px-3 text-center">
                          {r.chain_consistent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              LENGKAP
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              GAPS
                            </span>
                          )}
                        </td>

                        {/* Final Status */}
                        <td className="py-3.5 px-3 text-center">
                          <StatusBadge status={r.final_status} />
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(r);
                            }}
                            className="p-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Lihat seluruh teks rantai audit kronologis"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FULL DETAIL MODAL WITH CHRONOLOGICAL TIMELINE TRACK */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                    {selectedRecord.change_id}
                  </span>
                  <StatusBadge status={selectedRecord.final_status} />
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      selectedRecord.chain_consistent
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    Rantai: {selectedRecord.chain_consistent ? 'Lengkap & Sinkron' : 'Ada Discrepancy'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-0.5 leading-snug">
                  {selectedRecord.item}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedRecord)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
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
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Visual Timeline & Full Evidence */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Chronological Stepper Inside Modal */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Urutan Kronologis Perubahan Dokumen (MC-0 &rarr; BAPL &rarr; MC-100):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300">
                    <span className="font-bold block">1. MC-0</span>
                    <span className="text-[9px] text-blue-600 dark:text-blue-400">Baseline DED</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300">
                    <span className="font-bold block">2. JusTek</span>
                    <span className="text-[9px] text-amber-600 dark:text-amber-400">Rekayasa &amp; CCO</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-300">
                    <span className="font-bold block">3. BAPL Lapangan</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400">Opname Fisik</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-200">
                    <span className="font-bold block">4. RAB Revisi</span>
                    <span className="text-[9px] text-slate-500">JusFin Delta</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300">
                    <span className="font-bold block">5. MC-100</span>
                    <span className="text-[9px] text-purple-600 dark:text-purple-400">MCO Approval</span>
                  </div>
                </div>
              </div>

              {/* Full Details Sequence */}
              <div className="space-y-3.5">
                {/* 1. MC-0 RAB Awal */}
                <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 block mb-1">
                    1. MC-0 (Baseline Kontrak Awal &amp; DED)
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {selectedRecord.rab_initial}
                  </p>
                </div>

                {/* 2. JusTek Claim */}
                <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                    2. Klaim Justifikasi Teknis (JusTek)
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {selectedRecord.justek_claim}
                  </p>
                </div>

                {/* 3. BAPL Lapangan */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      3. Bukti Fisik Lapangan &amp; Multi-Dokumen (BAPL Lapangan / Opname Fisik)
                    </span>
                    {selectedRecord.evidence_type === 'EXPLICIT' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                        BUKTI EKSPLISIT
                      </span>
                    )}
                    {selectedRecord.evidence_type === 'IMPLICIT' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                        BUKTI IMPLISIT (DEDUKSI REKAYASA)
                      </span>
                    )}
                  </div>
                  <p className="text-emerald-950 dark:text-emerald-100 font-semibold leading-relaxed">
                    <HighlightedText
                      text={selectedRecord.bapl_evidence}
                      matchTarget={[selectedRecord.item, selectedRecord.justek_claim, selectedRecord.rab_revised, selectedRecord.rab_initial]}
                    />
                  </p>

                  {selectedRecord.implicit_rationale && (
                    <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed">
                      <strong className="text-purple-900 dark:text-purple-300 font-bold block mb-0.5">
                        Penjelasan Deduksi Rekayasa:
                      </strong>
                      <HighlightedText
                        text={selectedRecord.implicit_rationale}
                        matchTarget={[selectedRecord.item, selectedRecord.justek_claim, selectedRecord.bapl_evidence]}
                      />
                    </div>
                  )}

                  {selectedRecord.multi_evidence && selectedRecord.multi_evidence.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Daftar Dokumen Yang Memberikan Bukti ({selectedRecord.multi_evidence.length} Berkas):
                      </span>
                      <div className="space-y-1.5 font-mono text-[10.5px]">
                        {selectedRecord.multi_evidence.map((doc, dIdx) => (
                          <div key={dIdx} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-0.5">
                            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold">
                              <span className="bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {doc.doc_type} (Hal {doc.page})
                              </span>
                              <span className="text-slate-500 font-normal truncate max-w-[200px]">{doc.doc_name}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 italic">
                              &ldquo;
                              <HighlightedText
                                text={doc.snippet}
                                matchTarget={[selectedRecord.item, selectedRecord.justek_claim, selectedRecord.rab_revised, selectedRecord.bapl_evidence]}
                              />
                              &rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Nilai RAB Revisi */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    4. Nilai RAB Revisi (Proposed Adjustment)
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {selectedRecord.rab_revised}
                  </p>
                </div>

                {/* 5. JusFin Claim */}
                <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 block mb-1">
                    5. Justifikasi Finansial (JusFin)
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    {selectedRecord.jusfin_claim}
                  </p>
                </div>

                {/* 6. MC-100 & MCO Document */}
                <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 block mb-1">
                    6. MC-100 &amp; Dokumen Persetujuan MCO
                  </span>
                  <p className="text-slate-900 dark:text-slate-100 font-mono font-bold leading-relaxed">
                    {selectedRecord.mco_document}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors cursor-pointer"
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
