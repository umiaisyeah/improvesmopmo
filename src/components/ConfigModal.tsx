import React, { useState } from 'react';
import { Sliders, X, Check, ShieldCheck, Cpu, Layers, Sparkles } from 'lucide-react';
import { SystemConfig, ProgramDomain } from '../types';
import { PROGRAM_PROFILES } from '../config/programProfiles';

interface ConfigModalProps {
  config: SystemConfig;
  onSave: (newConfig: SystemConfig) => void;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ config, onSave, onClose }) => {
  const [thresholdPct, setThresholdPct] = useState(config.financial_threshold_percentage * 100);
  const [moneyTol, setMoneyTol] = useState(config.money_tolerance);
  const [stringThreshold, setStringThreshold] = useState(
    (config.string_matching_threshold ?? 0.85) * 100
  );
  const [autoGenExcel, setAutoGenExcel] = useState(config.auto_generate_excel ?? true);
  const [activeDomain, setActiveDomain] = useState<ProgramDomain>(
    config.active_program_domain || 'UNIVERSAL_MULTI'
  );
  const [autoDetectDomain, setAutoDetectDomain] = useState(
    config.auto_detect_domain ?? true
  );
  const [strictBoundaries, setStrictBoundaries] = useState(
    config.strict_domain_boundaries ?? true
  );

  const handleSave = () => {
    onSave({
      ...config,
      financial_threshold_percentage: thresholdPct / 100,
      money_tolerance: moneyTol,
      string_matching_threshold: stringThreshold / 100,
      auto_generate_excel: autoGenExcel,
      active_program_domain: activeDomain,
      auto_detect_domain: autoDetectDomain,
      strict_domain_boundaries: strictBoundaries,
    });
    onClose();
  };

  const selectedProfile = PROGRAM_PROFILES[activeDomain];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Konfigurasi &amp; Batasan Domain Sistem</h3>
              <p className="text-xs text-slate-500">Parameter audit, isolasi disiplin teknik &amp; ambang batas toleransi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 py-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
          {/* Program Profile / Domain Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Profil Domain Program Proyek
              </label>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDetectDomain}
                  onChange={(e) => setAutoDetectDomain(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Auto-Deteksi Berkas
              </label>
            </div>

            <select
              value={activeDomain}
              onChange={(e) => {
                setActiveDomain(e.target.value as ProgramDomain);
                setAutoDetectDomain(false);
              }}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="UNIVERSAL_MULTI">🌐 Multi-Disiplin Fleksibel &amp; Cerdas (Auto-Adaptive)</option>
              <option value="ELECTRICAL">⚡ Sistem Elektrikal, Grounding &amp; Proteksi Petir</option>
              <option value="PIPING_WATER">💧 Sistem Pemipaan, Katup (Valve), Pompa &amp; WTP</option>
              <option value="CIVIL_STRUCTURE">🏗️ Pekerjaan Sipil, Struktur Beton &amp; Gedung</option>
              <option value="MECHANICAL_HVAC">⚙️ Mekanikal, Tata Udara (HVAC) &amp; Utilitas Pabrik</option>
              <option value="INSTRUMENTATION_SCADA">📡 Instrumentasi, Otomasi, SCADA &amp; Jaringan IT</option>
              <option value="GENERAL_PROCUREMENT">📦 Pengadaan Barang, Peralatan &amp; Jasa Umum</option>
            </select>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{selectedProfile.name}</span>
              </div>
              <p>{selectedProfile.description}</p>
            </div>
          </div>

          {/* Strict Discipline Boundary Isolation */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={strictBoundaries}
                onChange={(e) => setStrictBoundaries(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-emerald-950 block">
                  Isolasi Batasan Lintas Disiplin Ketat (Cross-Domain Isolation)
                </span>
                <span className="text-[11px] text-emerald-800 block mt-0.5 leading-relaxed">
                  Mencegah pencampuran data: data uji kelistrikan (Ohm) tidak akan dikutip untuk dimensi tiang/struktur fisik; uji kebocoran pipa/katup tidak akan bocor ke item elektrikal.
                </span>
              </div>
            </label>
          </div>

          {/* Financial Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">Threshold Finansial Amandemen</label>
              <span className="font-mono font-bold text-slate-900">{thresholdPct}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={thresholdPct}
              onChange={(e) => setThresholdPct(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Aturan: Jika |Delta %| &gt; {thresholdPct}%, amandemen memerlukan persetujuan khusus PMO.
            </span>
          </div>

          {/* Money Tolerance */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Toleransi Pembulatan Finansial (Rp)
            </label>
            <input
              type="number"
              value={moneyTol}
              onChange={(e) => setMoneyTol(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs font-mono"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Toleransi perbedaan selisih pembulatan desimal mata uang (default: Rp 1).
            </span>
          </div>

          {/* String Match */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">Toleransi Matching String Teknis</label>
              <span className="font-mono font-bold text-slate-900">{stringThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              step="1"
              value={stringThreshold}
              onChange={(e) => setStringThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Auto Gen Excel */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenExcel}
                onChange={(e) => setAutoGenExcel(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">
                Otomatis siapkan lembar kerja Excel 9-sheet saat pipeline selesai
              </span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
};
