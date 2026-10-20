import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface VerificationProgressProps {
  currentStep: number;
  stepName: string;
  detail: string;
  percentage: number;
}

const STEPS = [
  '1. Reading documents',
  '2. OCR',
  '3. Extracting data',
  '4. Reading RAB',
  '5. Reading JusTek',
  '6. Reading JusFin',
  '7. Technical verification',
  '8. Financial verification',
  '9. Traceability',
  '10. Generating Excel',
];

export const VerificationProgress: React.FC<VerificationProgressProps> = ({
  currentStep,
  stepName,
  detail,
  percentage,
}) => {
  return (
    <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-4xl mx-auto my-8 border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
            Pipeline Eksekusi Otomatis
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            Langkah {currentStep} dari 10: {stepName}
          </h3>
        </div>
        <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2.5 mb-6 overflow-hidden">
        <div
          className="bg-linear-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Live Log Terminal Output */}
      <div className="bg-slate-950/80 rounded-xl p-3 font-mono text-xs text-slate-300 border border-slate-800/80 mb-6 flex items-start gap-2">
        <span className="text-emerald-400 select-none">&gt;</span>
        <span className="truncate">{detail || 'Memulai verifikasi sistem...'}</span>
      </div>

      {/* 10-Step Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <div
              key={step}
              className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 transition-colors ${
                isCurrent
                  ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50 font-semibold'
                  : isDone
                  ? 'text-emerald-400 font-medium'
                  : 'text-slate-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
