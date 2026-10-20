import React, { useState } from 'react';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  Layers,
  Eye,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  HelpCircle,
  AlertCircle,
  FileSearch,
} from 'lucide-react';
import { FinancialItem, TotalRabVerification, TechnicalChange } from '../types';
import { formatRupiah, formatPercentage, formatQuantity } from '../services/normalizer';
import { StatusBadge } from './TechnicalVerificationView';
import { isNameCompatible } from '../services/excelParser';
import { HighlightedText } from './HighlightedText';

interface FinancialVerificationViewProps {
  items: FinancialItem[];
  totalRab: TotalRabVerification;
  technicalChanges?: TechnicalChange[];
}

export const FinancialVerificationView: React.FC<FinancialVerificationViewProps> = ({
  items,
  totalRab,
  technicalChanges = [],
}) => {
  const [selectedItem, setSelectedItem] = useState<FinancialItem | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [filterMode, setFilterMode] = useState<
    'all' | 'changed' | 'increase' | 'decrease' | 'unchanged' | 'anomaly' | 'unreferenced'
  >('changed');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiModelUsed, setAiModelUsed] = useState<string | null>(null);

  // Helper to find associated technical change with strict matching (no random fallback)
  const getLinkedTechChange = (changeId: string, itemName?: string): TechnicalChange | undefined => {
    if (!itemName) {
      return technicalChanges.find((tc) => tc.change_id === changeId);
    }
    let match = technicalChanges.find((tc) => tc.item.trim().toLowerCase() === itemName.trim().toLowerCase());
    if (!match) {
      match = technicalChanges.find((tc) => tc.change_id === changeId && isNameCompatible(tc.item, itemName));
    }
    if (!match) {
      match = technicalChanges.find((tc) => isNameCompatible(tc.item, itemName));
    }
    return match;
  };

  const handleRunAiAudit = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai-analyze-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comparisonItems: items,
          prompt: 'Lakukan audit holistik end-to-end terhadap seluruh baris dan kolom tabel Justifikasi Finansial & RAB. Analisis korelasi Awal vs Revisi, perubahan spesifikasi, peniadaan item (Dinolkan), dan item baru.',
        }),
      });
      const data = await response.json();
      if (data.success && data.analysis) {
        setAiAuditResult(data.analysis);
        setAiModelUsed(data.modelUsed || 'gemini-3.1-pro-preview');
      } else {
        setAiError(data.warning || data.error || 'Gagal memproses analisis AI.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Koneksi ke server AI gagal.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const hasDelta = item.is_changed !== undefined ? item.is_changed : (Math.abs(item.delta_value) > 0 || Math.abs(item.delta_qty) > 0 || Math.abs(item.delta_unit_price) > 0);
    if (filterMode === 'all') return true;
    if (filterMode === 'changed') return hasDelta;
    if (filterMode === 'increase') return item.delta_value > 0;
    if (filterMode === 'decrease') return item.delta_value < 0;
    if (filterMode === 'unchanged') return !hasDelta;
    if (filterMode === 'anomaly') return item.ba_anomaly_type && item.ba_anomaly_type !== 'NONE';
    if (filterMode === 'unreferenced') return item.has_valid_ba_ref === false || item.ba_anomaly_type === 'ANOMALI_ANGKA_TANPA_REFERENSI_BA';
    return true;
  });

  const countChanged = items.filter((i) => i.is_changed !== undefined ? i.is_changed : (Math.abs(i.delta_value) > 0 || Math.abs(i.delta_qty) > 0)).length;
  const countIncrease = items.filter((i) => i.delta_value > 0).length;
  const countDecrease = items.filter((i) => i.delta_value < 0).length;
  const countUnchanged = items.filter((i) => i.is_changed !== undefined ? !i.is_changed : (Math.abs(i.delta_value) === 0 && Math.abs(i.delta_qty) === 0)).length;
  const countAnomalies = items.filter((i) => i.ba_anomaly_type && i.ba_anomaly_type !== 'NONE').length;
  const countUnreferenced = items.filter((i) => i.has_valid_ba_ref === false || i.ba_anomaly_type === 'ANOMALI_ANGKA_TANPA_REFERENSI_BA').length;

  const handleCopyDetails = (item: FinancialItem, tech?: TechnicalChange) => {
    const textToCopy = `[${item.change_id}] ${item.item}
Satuan: ${item.unit}
Qty Awal: ${item.qty_initial} | Qty Revisi: ${item.qty_revised} (Delta: ${item.delta_qty})
Harga Satuan: Rp ${item.unit_price_revised.toLocaleString('id-ID')}
Total Awal: Rp ${item.calculated_initial.toLocaleString('id-ID')}
Total Revisi: Rp ${item.calculated_revised.toLocaleString('id-ID')}
Delta Finansial: Rp ${item.delta_value.toLocaleString('id-ID')} (${item.delta_percentage.toFixed(2)}%)
Status Aritmatika: ${item.calculation_status}
Status Finansial: ${item.financial_status}
Justifikasi Finansial: ${item.justification}
${
  tech
    ? `\nKORELASI TEKNIS:
Baseline (Kontrak/DED): ${tech.baseline}
BAPL Aktual (Fisik): ${tech.actual_bapl}
JusTek Usulan: ${tech.proposed}
Sebab (Cause): ${tech.cause}
Risiko (Risk): ${tech.risk}
Manfaat (Benefit): ${tech.benefit}`
    : ''
}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedTech = selectedItem ? getLinkedTechChange(selectedItem.change_id, selectedItem.item) : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                Verifikasi Finansial (Khusus Approval JusFin)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Pilar Approval JusFin (Angka & Plafon 10%)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fokus eksklusif untuk <strong className="text-emerald-700">Approval Justifikasi Finansial (JusFin)</strong>: Mengaudit perhitungan matematis RAB Awal vs Revisi, delta biaya (Rp), kewajaran harga satuan, dan batas toleransi amandemen 10%. Terpisah dari aspek teknis fisik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Deterministic Math Engine
            </span>
          </div>
        </div>
      </div>

      {/* Critical Comparison: JusFin Stated vs Calculated */}
      <div
        className={`rounded-2xl border-2 p-6 shadow-xs ${
          totalRab.delta_match
            ? 'bg-emerald-50/50 border-emerald-300'
            : 'bg-rose-50/70 border-rose-300'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  totalRab.delta_match
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {totalRab.status}
              </span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Audit Rekapitulasi JusFin vs Kalkulasi Sistem
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
              {totalRab.explanation}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px] font-sans font-medium">
                Tertulis pada JusFin
              </span>
              <span className="text-sm font-bold text-rose-700">
                {formatRupiah(totalRab.stated_jusfin_delta)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px] font-sans font-medium">
                Hasil Hitung Sistem (Revisi - Awal)
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {formatRupiah(totalRab.system_calculated_delta)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Integrated Analysis Action Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold tracking-wide">
              AI Integrated Deep Audit: Analisis Menyeluruh Seluruh Baris &amp; Kolom Excel
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Tier 1 Pro: {aiModelUsed || 'gemini-3.1-pro-preview'}
            </span>
          </div>
          <p className="text-xs text-blue-200/80 leading-relaxed max-w-2xl">
            Menganalisis korespondensi setiap baris dari Kontrak Awal vs Usulan Revisi, memverifikasi substitusi material, item dinolkan/ditiadakan, item pekerjaan tambah, dan validitas rumus aritmatika secara holistik dengan hierarki model terbaik.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunAiAudit}
          disabled={isAiLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isAiLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Memproses Seluruh Dokumen...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jalankan Audit AI Menyeluruh</span>
            </>
          )}
        </button>
      </div>

      {aiError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {aiAuditResult && (() => {
        const auditItems: any[] = Array.isArray(aiAuditResult)
          ? aiAuditResult
          : Array.isArray(aiAuditResult.items)
          ? aiAuditResult.items
          : Array.isArray(aiAuditResult.hasil_audit)
          ? aiAuditResult.hasil_audit
          : [];

        const summaryText =
          typeof aiAuditResult === 'object' && !Array.isArray(aiAuditResult)
            ? aiAuditResult.summary || aiAuditResult.ringkasan || null
            : null;

        return (
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  AI AUDIT RESULT
                </span>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Hasil Analisis &amp; Rekonsiliasi AI Terintegrasi
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setAiAuditResult(null)}
                className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {summaryText && (
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Ringkasan Audit AI:
                </p>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  {summaryText}
                </p>
              </div>
            )}

            {auditItems.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                  <span>Daftar Verifikasi Per Item ({auditItems.length} item dianalisis):</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3 w-28">ID &amp; Status</th>
                        <th className="p-3">Item Pekerjaan</th>
                        <th className="p-3 w-32 text-center">Aritmatika</th>
                        <th className="p-3">Catatan Audit AI &amp; Justifikasi Lapangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {auditItems.map((aiItem, i) => {
                        const statusKey = (aiItem.category || aiItem.engineering_status || aiItem.status || '').toUpperCase();
                        let badgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
                        let label = 'Tetap';

                        if (statusKey.includes('SPEC') || statusKey.includes('PRICE') || statusKey.includes('UBAH')) {
                          badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                          label = 'Ubah Spesifikasi / Harga';
                        } else if (statusKey.includes('NEW') || statusKey.includes('SUBST') || statusKey.includes('TAMBAH')) {
                          badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                          label = 'Item Baru / Substitusi';
                        } else if (statusKey.includes('ELIM') || statusKey.includes('NOL') || statusKey.includes('KURANG') || statusKey.includes('TIADA')) {
                          badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                          label = 'Ditiadakan / 0';
                        } else if (statusKey.includes('VOL')) {
                          badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                          label = 'Ubah Volume';
                        }

                        const isValid = aiItem.is_arithmetic_valid !== false;

                        return (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 align-top">
                              <div className="font-mono font-bold text-slate-900 text-[11px]">
                                {aiItem.change_id || `ITEM-${i + 1}`}
                              </div>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badgeClass}`}>
                                {label}
                              </span>
                            </td>
                            <td className="p-3 align-top font-medium text-slate-900">
                              {aiItem.item}
                            </td>
                            <td className="p-3 align-top text-center">
                              {isValid ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  Cek Ulang
                                </span>
                              )}
                            </td>
                            <td className="p-3 align-top text-slate-700 leading-relaxed text-xs">
                              {aiItem.audit_notes || aiItem.catatan || aiItem.justification || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {typeof aiAuditResult === 'string' ? aiAuditResult : JSON.stringify(aiAuditResult, null, 2)}
              </div>
            )}
          </div>
        );
      })()}

      {/* Anomaly Detection Banner if anomalies found */}
      {countAnomalies > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                Sistem Deteksi Anomali Pipeline: {countAnomalies} Anomali Terdeteksi pada Angka Finansial
              </h4>
              <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">
                Ditemukan {countUnreferenced > 0 ? `${countUnreferenced} item perubahan angka TANPA referensi Berita Acara valid` : ''}
                {countUnreferenced > 0 && countAnomalies - countUnreferenced > 0 ? ' dan ' : ''}
                {countAnomalies - countUnreferenced > 0 ? `${countAnomalies - countUnreferenced} item dengan deviasi kuantitas/harga terhadap Berita Acara` : ''}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilterMode('anomaly')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Tampilkan Item Anomali ({countAnomalies})</span>
          </button>
        </div>
      )}

      {/* Financial Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Item ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('changed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'changed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              Item Berubah ({countChanged})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('increase')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'increase'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              Pekerjaan Tambah (+{countIncrease})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('decrease')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'decrease'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Ditiadakan / Efisiensi (-{countDecrease})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('unchanged')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'unchanged'
                  ? 'bg-slate-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tetap ({countUnchanged})
            </button>
            {countAnomalies > 0 && (
              <button
                type="button"
                onClick={() => setFilterMode('anomaly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  filterMode === 'anomaly'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Anomali BA ({countAnomalies})</span>
              </button>
            )}
            {countUnreferenced > 0 && (
              <button
                type="button"
                onClick={() => setFilterMode('unreferenced')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  filterMode === 'unreferenced'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                Tanpa Ref BA ({countUnreferenced})
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">
            Menampilkan {filteredItems.length} dari {items.length} item
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 w-10 text-center"></th>
                <th className="py-3 px-3 w-20">ID</th>
                <th className="py-3 px-4 min-w-56">Item Pekerjaan</th>
                <th className="py-3 px-2 w-16 text-center">Unit</th>
                <th className="py-3 px-3 text-right">Qty Awal</th>
                <th className="py-3 px-3 text-right">Qty Revisi</th>
                <th className="py-3 px-3 text-right">Delta Qty</th>
                <th className="py-3 px-3 text-right">Harga Satuan (Rev)</th>
                <th className="py-3 px-3 text-right">Total Awal (Rp)</th>
                <th className="py-3 px-3 text-right">Total Revisi (Rp)</th>
                <th className="py-3 px-3 text-right">Financial Delta</th>
                <th className="py-3 px-2 text-center w-16">Delta %</th>
                <th className="py-3 px-3 text-center">Aritmatika</th>
                <th className="py-3 px-3 text-center">Status Finansial</th>
                <th className="py-3 px-3 w-20 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((f, idx) => {
                const linkedTech = getLinkedTechChange(f.change_id, f.item);
                const isExpanded = expandedRowId === f.change_id;

                return (
                  <React.Fragment key={`${f.change_id}_${idx}`}>
                    <tr
                      onClick={() => setSelectedItem(f)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td
                        className="py-3 px-2 text-center text-slate-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRowId(isExpanded ? null : f.change_id);
                        }}
                      >
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                          title="Buka / tutup rincian inline"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {f.change_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {f.item}
                          </span>
                          {/* Traceability ID Badge */}
                          {f.traceability_ref_id && f.has_valid_ba_ref && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200"
                              title={`Traceability Reference ID: ${f.traceability_ref_id}`}
                            >
                              REF: {f.traceability_ref_id}
                            </span>
                          )}
                          {/* Anomaly Badges */}
                          {f.ba_anomaly_type === 'ANOMALI_ANGKA_TANPA_REFERENSI_BA' && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-rose-600 text-white shadow-2xs animate-pulse"
                              title={f.ba_anomaly_description || 'Perubahan angka tanpa referensi Berita Acara'}
                            >
                              ⚠️ ANOMALI: TANPA REFERENSI BA
                            </span>
                          )}
                          {f.ba_anomaly_type === 'ANOMALI_DEVIASI_NILAI_BA' && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-600 text-white shadow-2xs"
                              title={f.ba_anomaly_description || 'Deviasi kuantitas terhadap Berita Acara'}
                            >
                              ⚠️ ANOMALI: DEVIASI ANGKA BA
                            </span>
                          )}
                          {f.ba_anomaly_type === 'ANOMALI_DIMENSI_SATUAN' && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-purple-600 text-white shadow-2xs"
                              title={f.ba_anomaly_description || 'Perbedaan dimensi / satuan fisik'}
                            >
                              ⚠️ ANOMALI: SATUAN/DIMENSI
                            </span>
                          )}
                          {(f.evidence_type === 'EXPLICIT' || linkedTech?.evidence_type === 'EXPLICIT') && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              BUKTI EKSPLISIT
                            </span>
                          )}
                          {(f.evidence_type === 'IMPLICIT' || linkedTech?.evidence_type === 'IMPLICIT') && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              BUKTI IMPLISIT
                            </span>
                          )}
                          {((f.evidence_found === false || f.evidence_type === 'NONE') && (!linkedTech || linkedTech.evidence_type === 'NONE')) && (
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              TIDAK ADA BUKTI
                            </span>
                          )}
                        </div>
                        {/* Sub-spesifikasi teknis di baris bawah */}
                        {((f.sub_specs_differences && f.sub_specs_differences.length > 0) ||
                          (linkedTech?.sub_specs_differences && linkedTech.sub_specs_differences.length > 0)) && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {(f.sub_specs_differences || linkedTech?.sub_specs_differences || []).map((diff, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200"
                                title="Perubahan sub-spesifikasi teknis tertulis di bawah item"
                              >
                                {diff}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5" title={f.justification}>
                          {f.justification}
                        </p>
                      </td>
                      <td className="py-3.5 px-2 text-center text-slate-500">{f.unit}</td>
                      <td className="py-3.5 px-3 text-right font-mono">{formatQuantity(f.qty_initial)}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                        {formatQuantity(f.qty_revised)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span
                          className={`font-semibold ${
                            f.delta_qty < 0
                              ? 'text-emerald-700'
                              : f.delta_qty > 0
                              ? 'text-rose-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {f.delta_qty > 0 ? '+' : ''}
                          {formatQuantity(f.delta_qty)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span className="font-semibold text-slate-900 block">{formatRupiah(f.unit_price_revised)}</span>
                        {f.delta_unit_price !== 0 && (
                          <span className="text-[10px] text-slate-400 block font-sans">
                            Awal: {formatRupiah(f.unit_price_initial)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        {formatRupiah(f.calculated_initial)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50">
                        {formatRupiah(f.calculated_revised)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        <span
                          className={
                            f.delta_value < 0
                              ? 'text-emerald-700'
                              : f.delta_value > 0
                              ? 'text-rose-700'
                              : 'text-slate-400'
                          }
                        >
                          {formatRupiah(f.delta_value)}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono text-[11px]">
                        {formatPercentage(f.delta_percentage, 2)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            f.calculation_status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {f.calculation_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={f.financial_status} />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(f);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors inline-flex items-center gap-1 text-[10px] font-semibold"
                          title="Klik untuk melihat teks dan kalkulasi lengkap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </button>
                      </td>
                    </tr>

                    {/* Inline Expander Row: Kajian 3 Pilar Perubahan */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={15} className="p-4">
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                                  {f.change_id}
                                </span>
                                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                  <Scale className="w-4 h-4 text-indigo-600" />
                                  Kajian Komprehensif Perubahan: Deskripsi Pekerjaan, Kuantitas &amp; Harga
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedItem(f)}
                                className="text-xs text-blue-600 hover:underline font-semibold"
                              >
                                Buka Modal Dialog Penuh &rarr;
                              </button>
                            </div>

                            {/* 3-Pillar Kajian Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              {/* Pilar 1: Deskripsi & Sub-Spesifikasi di Bawahnya */}
                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1 mb-1">
                                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                                    1. Kajian Deskripsi &amp; Sub-Spesifikasi Bawah
                                  </span>
                                  <span className="font-bold text-slate-900 block text-xs">
                                    {f.item}
                                  </span>
                                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                    {f.justification}
                                  </p>

                                  {/* Sub-spesifikasi differences */}
                                  {((f.sub_specs_differences && f.sub_specs_differences.length > 0) ||
                                    (linkedTech?.sub_specs_differences && linkedTech.sub_specs_differences.length > 0)) && (
                                    <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-1">
                                      <span className="text-[9.5px] font-bold text-indigo-800 uppercase tracking-wider block">
                                        Perubahan Spesifikasi Tertulis di Bawahnya:
                                      </span>
                                      <div className="space-y-0.5 font-mono text-[10px]">
                                        {(f.sub_specs_differences || linkedTech?.sub_specs_differences || []).map((diff, sIdx) => (
                                          <div key={sIdx} className="bg-indigo-50/80 px-2 py-0.5 rounded text-indigo-950 border border-indigo-200">
                                            {diff}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {linkedTech && (
                                  <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-200/60">
                                    Kategori: <strong className="text-slate-800 font-semibold">{linkedTech.category}</strong>
                                  </div>
                                )}
                              </div>

                              {/* Pilar 2: Quantity (Kuantitas / Volume) */}
                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1 mb-1">
                                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                                    2. Kajian Kuantitas (Volume &amp; Satuan)
                                  </span>
                                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                                      <span className="text-[9px] text-slate-400 block font-sans">Volume Semula:</span>
                                      <span className="font-bold text-slate-800 text-xs">
                                        {formatQuantity(f.qty_initial)} {f.unit}
                                      </span>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                                      <span className="text-[9px] text-slate-400 block font-sans">Volume Menjadi:</span>
                                      <span className="font-bold text-slate-900 text-xs">
                                        {formatQuantity(f.qty_revised)} {f.unit}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500 font-medium">Delta Volume:</span>
                                    <span className={`font-mono font-bold ${
                                      f.delta_qty > 0 ? 'text-rose-700' : f.delta_qty < 0 ? 'text-emerald-700' : 'text-slate-600'
                                    }`}>
                                      {f.delta_qty > 0 ? '+' : ''}{formatQuantity(f.delta_qty)} {f.unit}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-200/60 pt-2">
                                  {f.delta_qty === 0
                                    ? 'Volume fisik konstan sesuai kontrak awal.'
                                    : f.qty_initial === 0
                                    ? 'Item baru ditambahkan (+100% volume).'
                                    : f.qty_revised === 0
                                    ? 'Item ditiadakan / dieliminasi (-100% volume).'
                                    : `Penyesuaian kebutuhan volume lapangan sebesar ${f.delta_qty > 0 ? '+' : ''}${formatQuantity(f.delta_qty)} ${f.unit}.`}
                                </p>
                              </div>

                              {/* Pilar 3: Harga (Harga Satuan & Total Anggaran) */}
                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1 mb-1">
                                    <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                                    3. Kajian Harga (Satuan &amp; Total Biaya)
                                  </span>
                                  <div className="space-y-1.5 pt-1 font-mono text-[11px]">
                                    <div className="flex justify-between bg-white p-2 rounded-lg border border-slate-200">
                                      <span className="text-slate-500 font-sans text-[10px]">Harga Satuan:</span>
                                      <div className="text-right">
                                        <span className="font-bold text-slate-900">{formatRupiah(f.unit_price_revised)}</span>
                                        {f.delta_unit_price !== 0 && (
                                          <span className="block text-[9.5px] text-slate-400 font-sans">
                                            Awal: {formatRupiah(f.unit_price_initial)} (Delta: {f.delta_unit_price > 0 ? '+' : ''}{formatRupiah(f.delta_unit_price)})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex justify-between bg-white p-2 rounded-lg border border-slate-200">
                                      <span className="text-slate-500 font-sans text-[10px]">Total Anggaran:</span>
                                      <div className="text-right">
                                        <span className="text-[9.5px] text-slate-400 block font-sans">
                                          Semula: {formatRupiah(f.calculated_initial)}
                                        </span>
                                        <span className="font-bold text-slate-900 block">
                                          Menjadi: {formatRupiah(f.calculated_revised)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 font-bold">
                                      <span className="text-slate-700 font-sans text-[10px]">Delta Total:</span>
                                      <span className={f.delta_value > 0 ? 'text-rose-700' : f.delta_value < 0 ? 'text-emerald-700' : 'text-slate-600'}>
                                        {f.delta_value > 0 ? '+' : ''}{formatRupiah(f.delta_value)} ({formatPercentage(f.delta_percentage)})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-2 font-sans">
                                  <span>Status Aritmatika: <strong className="text-emerald-700">{f.calculation_status}</strong></span>
                                  <span>Status: <strong className="text-slate-800">{f.financial_status}</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Evidence & Multi-Document Corroboration Section */}
                            {(() => {
                              const effEvType = f.evidence_type || linkedTech?.evidence_type || (linkedTech?.evidence_found ? 'EXPLICIT' : 'NONE');
                              const effDocs = f.multi_evidence || linkedTech?.multi_evidence || [];
                              const effSnippet = f.evidence_snippet || linkedTech?.evidence_snippet || f.actual_bapl || linkedTech?.actual_bapl;
                              const effRationale = f.implicit_rationale || linkedTech?.implicit_rationale;

                              return (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                      <FileSearch className="w-3.5 h-3.5 text-purple-600" />
                                      Pemeriksaan Bukti Multi-Dokumen (FAT, BA MC-0/100, Back Up Volume, BAPL)
                                    </span>
                                    {effEvType === 'EXPLICIT' && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        BUKTI EKSPLISIT (Tertulis Langsung)
                                      </span>
                                    )}
                                    {effEvType === 'IMPLICIT' && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                        BUKTI IMPLISIT (Deduksi Rekayasa)
                                      </span>
                                    )}
                                    {effEvType === 'NONE' && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                        TIDAK ADA BUKTI (Di Seluruh Dokumen yang Diunggah)
                                      </span>
                                    )}
                                  </div>

                                  {effSnippet && (
                                    <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono mb-2">
                                      <span className="text-purple-400 font-sans text-[10px] block font-bold mb-0.5">
                                        Kutipan Temuan Dokumen Resmi:
                                      </span>
                                      &ldquo;
                                      <HighlightedText
                                        text={effSnippet}
                                        matchTarget={[f.item, f.unit, f.justification || '', f.explanation || '']}
                                        isDarkTheme={true}
                                      />
                                      &rdquo;
                                    </div>
                                  )}

                                  {effRationale && (
                                    <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 text-[11px] text-purple-950 mb-2">
                                      <strong className="text-purple-900 font-bold block mb-0.5">Penjelasan Deduksi Teknis:</strong>
                                      <HighlightedText
                                        text={effRationale}
                                        matchTarget={[f.item, f.justification || '', f.explanation || '']}
                                      />
                                    </div>
                                  )}

                                  {effDocs.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                        {effDocs.length} Berkas Bukti Terverifikasi Saling Mengonfirmasi (Corroborating Evidence):
                                      </span>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {effDocs.map((doc, dIdx) => (
                                          <div key={dIdx} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] space-y-0.5">
                                            <div className="flex items-center justify-between font-bold text-slate-800">
                                              <span>{doc.doc_type} (Hal {doc.page})</span>
                                              <span className="text-slate-500 font-normal truncate max-w-[150px]">{doc.doc_name}</span>
                                            </div>
                                            <p className="text-slate-600 line-clamp-2 italic font-mono">
                                              &ldquo;
                                              <HighlightedText
                                                text={doc.snippet}
                                                matchTarget={[f.item, f.justification || '', f.explanation || '']}
                                              />
                                              &rdquo;
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100/90 border-t-2 border-slate-300 font-semibold text-slate-900">
              {/* Subtotal of currently filtered items if filter is active */}
              {filteredItems.length !== items.length && (
                <tr className="border-b border-slate-200 text-slate-700 bg-slate-50 text-[11px]">
                  <td colSpan={8} className="py-2.5 px-4 text-right font-medium">
                    Subtotal Baris Tampil ({filteredItems.length} dari {items.length} item):
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">
                    {formatRupiah(filteredItems.reduce((acc, it) => acc + it.calculated_initial, 0))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">
                    {formatRupiah(filteredItems.reduce((acc, it) => acc + it.calculated_revised, 0))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">
                    {formatRupiah(filteredItems.reduce((acc, it) => acc + it.delta_value, 0))}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              )}
              {/* Authoritative Total Project RAB Row */}
              <tr className="bg-slate-900 text-white font-bold text-xs">
                <td colSpan={8} className="py-3.5 px-4 text-right uppercase tracking-wider font-mono text-[11px]">
                  TOTAL REKAPITULASI RAB KONTRAK (OTORITAS RESMI):
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                  {formatRupiah(totalRab.rab_initial)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-emerald-300 bg-slate-800">
                  {formatRupiah(totalRab.rab_revised)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono">
                  <span className={totalRab.system_calculated_delta < 0 ? 'text-emerald-400' : totalRab.system_calculated_delta > 0 ? 'text-rose-400' : 'text-slate-200'}>
                    {formatRupiah(totalRab.system_calculated_delta)}
                  </span>
                </td>
                <td className="py-3.5 px-2 text-center font-mono text-[11px] text-slate-300">
                  {formatPercentage(totalRab.system_calculated_percentage, 2)}
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${totalRab.delta_match ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                    {totalRab.status}
                  </span>
                </td>
                <td colSpan={2} className="py-3.5 px-3 text-center text-[10px] text-slate-300 font-sans">
                  {totalRab.delta_match ? 'Delta Sesuai 100%' : 'Terdapat Selisih'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Comprehensive Modal: Full Untruncated Text & Baseline-to-BAPL Correlation */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-900 text-white">
                    {selectedItem.change_id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      selectedItem.calculation_status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    ARITMATIKA: {selectedItem.calculation_status}
                  </span>
                  <StatusBadge status={selectedItem.financial_status} />
                  {selectedTech && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedTech.category}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-1 leading-snug">
                  {selectedItem.item}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyDetails(selectedItem, selectedTech)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  title="Salin rincian lengkap ke clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin Rincian</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Traceability ID & Berita Acara Reference Verification Card */}
              <div
                className={`p-4 rounded-xl border ${
                  selectedItem.ba_anomaly_type && selectedItem.ba_anomaly_type !== 'NONE'
                    ? 'bg-rose-50 border-rose-300'
                    : selectedItem.has_valid_ba_ref
                    ? 'bg-blue-50/70 border-blue-200'
                    : 'bg-slate-50 border-slate-200'
                } space-y-2.5`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className={`w-4 h-4 ${selectedItem.ba_anomaly_type && selectedItem.ba_anomaly_type !== 'NONE' ? 'text-rose-600' : 'text-blue-600'}`} />
                    <span className="font-bold uppercase tracking-wider text-[11px] text-slate-900">
                      Rujukan Dokumen Berita Acara &amp; Traceability ID
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedItem.traceability_ref_id && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-800 border border-slate-300 shadow-2xs">
                        ID: {selectedItem.traceability_ref_id}
                      </span>
                    )}
                    {selectedItem.has_valid_ba_ref ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Rujukan BA Terverifikasi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                        ⚠️ Tanpa Rujukan Berita Acara
                      </span>
                    )}
                  </div>
                </div>

                {/* Reference Details or Anomaly Details */}
                {selectedItem.ba_anomaly_description && (
                  <div className="p-2.5 rounded-lg bg-white border border-rose-200 text-rose-900 font-medium text-[11px] leading-relaxed">
                    <span className="font-bold block text-rose-700 mb-0.5">⚠️ Temuan Anomali Pipeline:</span>
                    {selectedItem.ba_anomaly_description}
                  </div>
                )}

                {selectedItem.ba_reference_clause && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 text-[11px] text-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Dokumen: <strong>{selectedItem.ba_reference_clause.doc_name}</strong> ({selectedItem.ba_reference_clause.doc_type})</span>
                      <span>Halaman/Sheet: {selectedItem.ba_reference_clause.page}</span>
                    </div>
                    <p className="font-mono text-slate-900 italic">
                      "{selectedItem.ba_reference_clause.clause}"
                    </p>
                    {selectedItem.ba_reference_clause.matched_qty !== undefined && (
                      <div className="text-[10px] text-emerald-700 font-bold">
                        Kuantitas Terekam di BA: {selectedItem.ba_reference_clause.matched_qty} {selectedItem.ba_reference_clause.matched_unit || selectedItem.unit}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Comprehensive 3-Pillar Kajian (Deskripsi Pekerjaan & Sub-Spesifikasi Bawah, Quantity, Harga) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>Kajian Komprehensif 3 Pilar Perubahan Kontrak</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Pillar 1 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                      1. Deskripsi &amp; Sub-Spesifikasi Bawah
                    </span>
                    <span className="font-semibold text-slate-900 block text-xs">
                      {selectedItem.item}
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {selectedItem.justification}
                    </p>
                    {/* Sub-specs if available */}
                    {((selectedItem.sub_specs_differences && selectedItem.sub_specs_differences.length > 0) ||
                      (selectedTech?.sub_specs_differences && selectedTech.sub_specs_differences.length > 0)) && (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <span className="text-[9.5px] font-bold text-indigo-700 uppercase tracking-wider block">
                          Perubahan Baris Sub-Spesifikasi:
                        </span>
                        <div className="space-y-1 font-mono text-[10px]">
                          {(selectedItem.sub_specs_differences || selectedTech?.sub_specs_differences || []).map((diff, idx) => (
                            <div key={idx} className="bg-white p-1.5 rounded border border-indigo-100 text-indigo-950 font-medium">
                              {diff}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pillar 2 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      2. Kajian Quantity (Volume)
                    </span>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9.5px] text-slate-500 font-sans block">Volume Semula:</span>
                        <span className="font-bold text-slate-800">{formatQuantity(selectedItem.qty_initial)} {selectedItem.unit}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9.5px] text-slate-500 font-sans block">Volume Menjadi:</span>
                        <span className="font-bold text-slate-900">{formatQuantity(selectedItem.qty_revised)} {selectedItem.unit}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 font-bold flex justify-between">
                        <span className="text-slate-600 font-sans text-[10px]">Selisih Volume:</span>
                        <span className={selectedItem.delta_qty > 0 ? 'text-rose-700' : selectedItem.delta_qty < 0 ? 'text-emerald-700' : 'text-slate-500'}>
                          {selectedItem.delta_qty > 0 ? '+' : ''}{formatQuantity(selectedItem.delta_qty)} {selectedItem.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                      3. Kajian Harga &amp; Anggaran
                    </span>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9.5px] text-slate-500 font-sans block">Harga Satuan Unit:</span>
                        <span className="font-bold text-slate-900">{formatRupiah(selectedItem.unit_price_revised)}</span>
                        {selectedItem.delta_unit_price !== 0 && (
                          <span className="block text-[9px] text-slate-400 font-sans">
                            Awal: {formatRupiah(selectedItem.unit_price_initial)} (Delta: {selectedItem.delta_unit_price > 0 ? '+' : ''}{formatRupiah(selectedItem.delta_unit_price)})
                          </span>
                        )}
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[9.5px] text-slate-500 font-sans block">Nilai Total Revisi:</span>
                        <span className="font-bold text-slate-900">{formatRupiah(selectedItem.calculated_revised)}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 font-bold flex justify-between">
                        <span className="text-slate-600 font-sans text-[10px]">Delta Finansial:</span>
                        <span className={selectedItem.delta_value > 0 ? 'text-rose-700' : selectedItem.delta_value < 0 ? 'text-emerald-700' : 'text-slate-500'}>
                          {selectedItem.delta_value > 0 ? '+' : ''}{formatRupiah(selectedItem.delta_value)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Korelasi Baseline (Kontrak Awal) vs Aktual BAPL */}
              {selectedTech && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span>Korelasi Baseline &amp; BAPL Aktual Lapangan</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Baseline */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        1. Kondisi Baseline (Kontrak Awal / DED):
                      </span>
                      <p className="text-slate-800 text-xs font-medium leading-relaxed">
                        {selectedTech.baseline}
                      </p>
                    </div>

                    {/* BAPL Actual */}
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-300 space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        2. Kondisi Fisik Aktual (Opname BAPL):
                      </span>
                      <p className="text-emerald-950 text-xs font-semibold leading-relaxed">
                        {selectedTech.actual_bapl}
                      </p>
                    </div>
                  </div>

                  {/* JusTek Usulan */}
                  <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                      3. Usulan Justifikasi Teknis (JusTek):
                    </span>
                    <p className="text-slate-900 text-xs leading-relaxed font-medium">
                      {selectedTech.proposed}
                    </p>
                  </div>

                  {/* Cause, Risk, Benefit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                        Penyebab (Root Cause):
                      </span>
                      <p className="text-[11px] text-slate-700 leading-relaxed">{selectedTech.cause}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                      <span className="text-[10px] font-bold text-rose-900 uppercase block mb-1">
                        Risiko Teknikal (Engineering Risk):
                      </span>
                      <p className="text-[11px] text-slate-700 leading-relaxed">{selectedTech.risk}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase block mb-1">
                        Manfaat (Benefit):
                      </span>
                      <p className="text-[11px] text-slate-700 leading-relaxed">{selectedTech.benefit}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Pemeriksaan Bukti Multi-Dokumen (FAT, BA MC-0/100, Back Up Volume, BAPL) */}
              {(() => {
                const effEvType = selectedItem.evidence_type || selectedTech?.evidence_type || (selectedTech?.evidence_found ? 'EXPLICIT' : 'NONE');
                const effDocs = selectedItem.multi_evidence || selectedTech?.multi_evidence || [];
                const effSnippet = selectedItem.evidence_snippet || selectedTech?.evidence_snippet || selectedItem.actual_bapl || selectedTech?.actual_bapl;
                const effRationale = selectedItem.implicit_rationale || selectedTech?.implicit_rationale;

                return (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                        <FileSearch className="w-4 h-4 text-purple-600" />
                        <span>Pemeriksaan Bukti Multi-Dokumen &amp; Fakta Lapangan (FAT, BA MC-0/100, BAPL, Back Up Volume)</span>
                      </div>
                      {effEvType === 'EXPLICIT' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          BUKTI EKSPLISIT
                        </span>
                      )}
                      {effEvType === 'IMPLICIT' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          BUKTI IMPLISIT (DEDUKSI REKAYASA)
                        </span>
                      )}
                      {effEvType === 'NONE' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          TIDAK ADA BUKTI (Di Seluruh Dokumen yang Diunggah)
                        </span>
                      )}
                    </div>

                    {effSnippet && (
                      <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-mono leading-relaxed border border-slate-800">
                        <span className="text-purple-400 font-sans text-[10px] block font-bold uppercase tracking-wider mb-1">
                          Kutipan Klausul / Temuan Tertulis Dokumen Lapangan:
                        </span>
                        &ldquo;
                        <HighlightedText
                          text={effSnippet}
                          matchTarget={[selectedItem.item, selectedItem.unit, selectedItem.justification || '', selectedItem.explanation || '']}
                          isDarkTheme={true}
                        />
                        &rdquo;
                      </div>
                    )}

                    {effRationale && (
                      <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-950">
                        <span className="text-purple-900 font-bold block text-[11px] mb-1">
                          Penjelasan Deduksi Rekayasa (Engineering Justification Rationale):
                        </span>
                        <p className="leading-relaxed">
                          <HighlightedText
                            text={effRationale}
                            matchTarget={[selectedItem.item, selectedItem.justification || '', selectedItem.explanation || '']}
                          />
                        </p>
                      </div>
                    )}

                    {effDocs.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                          Daftar {effDocs.length} Dokumen Pendukung Terverifikasi yang Saling Mengonfirmasi:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {effDocs.map((doc, dIdx) => (
                            <div key={dIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold text-slate-800">
                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700 text-[10.5px]">
                                  {doc.doc_type} (Hal {doc.page})
                                </span>
                                <span className="text-slate-500 font-medium text-[11px] truncate max-w-[180px]">{doc.doc_name}</span>
                              </div>
                              <p className="text-slate-700 italic font-mono text-[11px] leading-relaxed">
                                &ldquo;
                                <HighlightedText
                                  text={doc.snippet}
                                  matchTarget={[selectedItem.item, selectedItem.justification || '', selectedItem.explanation || '']}
                                />
                                &rdquo;
                              </p>
                              {doc.explanation && (
                                <p className="text-[10px] text-slate-500 border-t border-slate-200/60 pt-1 mt-1 font-sans">
                                  <HighlightedText
                                    text={doc.explanation}
                                    matchTarget={[selectedItem.item]}
                                  />
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Section 2: Audit Kalkulasi Aritmatika Detail */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Rincian Kalkulasi Aritmatika (Step-by-Step)</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Volume &amp; Satuan</span>
                      <span className="font-bold text-slate-900">
                        {formatQuantity(selectedItem.qty_initial)} {selectedItem.unit} &rarr;{' '}
                        {formatQuantity(selectedItem.qty_revised)} {selectedItem.unit}
                      </span>
                      <span className="text-[10px] text-blue-600 block mt-0.5">
                        Delta: {selectedItem.delta_qty > 0 ? '+' : ''}
                        {formatQuantity(selectedItem.delta_qty)} {selectedItem.unit}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Harga Satuan Unit</span>
                      <span className="font-bold text-slate-900 block text-xs">
                        {formatRupiah(selectedItem.unit_price_initial)} &rarr; {formatRupiah(selectedItem.unit_price_revised)}
                      </span>
                      <span className="text-[10px] text-blue-600 block mt-0.5 font-sans font-semibold">
                        Delta Satuan: {selectedItem.delta_unit_price > 0 ? '+' : ''}
                        {formatRupiah(selectedItem.delta_unit_price)} / {selectedItem.unit}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-sans block">Delta Finansial Total</span>
                      <span
                        className={`font-bold block ${
                          selectedItem.delta_value < 0
                            ? 'text-emerald-700'
                            : selectedItem.delta_value > 0
                            ? 'text-rose-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {formatRupiah(selectedItem.delta_value)}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        ({formatPercentage(selectedItem.delta_percentage, 2)} dari Total Awal)
                      </span>
                    </div>
                  </div>

                  {/* Formula Breakdown */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Total Awal (Qty Awal × Harga Awal):</span>
                      <span className="text-slate-700">
                        {formatQuantity(selectedItem.qty_initial)} {selectedItem.unit} × {formatRupiah(selectedItem.unit_price_initial)} ={' '}
                        <strong className="text-slate-900">{formatRupiah(selectedItem.calculated_initial)}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1">
                      <span className="text-slate-500 font-sans">Total Revisi (Qty Revisi × Harga Revisi):</span>
                      <span className="text-slate-700">
                        {formatQuantity(selectedItem.qty_revised)} {selectedItem.unit} × {formatRupiah(selectedItem.unit_price_revised)} ={' '}
                        <strong className="text-emerald-800 font-bold">{formatRupiah(selectedItem.calculated_revised)}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                      <span className="text-slate-700 font-sans">Selisih Total (Revisi - Awal):</span>
                      <span className={selectedItem.delta_value > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                        {selectedItem.delta_value > 0 ? '+' : ''}{formatRupiah(selectedItem.delta_value)}
                      </span>
                    </div>
                    {selectedItem.delta_unit_price !== 0 && (
                      <div className="text-[10px] text-slate-500 font-sans bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                        *Catatan Audit: Selisih harga satuan adalah {selectedItem.delta_unit_price > 0 ? '+' : ''}{formatRupiah(selectedItem.delta_unit_price)} per {selectedItem.unit}. Untuk {formatQuantity(selectedItem.qty_revised)} {selectedItem.unit}, total delta finansial bernilai {formatRupiah(selectedItem.delta_value)} ({formatPercentage(selectedItem.delta_percentage, 2)}).
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Justifikasi Finansial Lengkap */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  Teks Lengkap Justifikasi Finansial
                </span>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-slate-800 leading-relaxed text-xs whitespace-pre-wrap">
                    {selectedItem.justification}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Dokumen referensi: Lembar BAPL Fisik &amp; Dokumen JusFin
              </span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-2xs"
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
