import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Copy, Check, Filter, Download, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RawBaplPage } from '../types';

interface RawBaplViewProps {
  pages: RawBaplPage[];
  initialPage?: number;
  highlightText?: string;
}

export const RawBaplView: React.FC<RawBaplViewProps> = ({ pages, initialPage = 1, highlightText }) => {
  const [selectedPageKey, setSelectedPageKey] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>(highlightText || '');
  const [copied, setCopied] = useState<boolean>(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);

  const handleReupload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Stub for re-upload functionality
    console.log("Re-uploading:", e.target.files?.[0]);
  };

  const handleReprocess = () => {
    // Stub for re-process functionality
    console.log("Reprocessing OCR...");
  };

  // Function to extract only the survey result section
  const extractSurveyResult = (text: string) => {
    const surveySectionMatch = text.match(/(?:HASIL SURVEI|SURVEY RESULT|HASIL PEMERIKSAAN)[\s\S]*?(?=\n\n|$)/i);
    return surveySectionMatch ? surveySectionMatch[0] : text;
  };

  // Group pages by source document
  const sources = useMemo(() => {
    return Array.from(new Set(pages.map((p) => p.source || 'BAPL Utama')));
  }, [pages]);

  const filteredPages = useMemo(() => {
    let result = pages;
    if (selectedSource !== 'ALL') {
      result = result.filter((p) => (p.source || 'BAPL Utama') === selectedSource);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((p) => p.extracted_text.toLowerCase().includes(q));
    }
    return result;
  }, [pages, selectedSource, searchTerm]);

  // Generate unique page identifier key
  const getPageKey = (p: RawBaplPage, idx: number) => `${p.source || 'BAPL'}_p${p.page}_idx${idx}`;

  useEffect(() => {
    if (filteredPages.length > 0) {
      if (initialPage) {
        const foundIdx = filteredPages.findIndex((p) => p.page === initialPage);
        if (foundIdx >= 0) {
          setSelectedPageKey(getPageKey(filteredPages[foundIdx], foundIdx));
        } else {
            setSelectedPageKey(getPageKey(filteredPages[0], 0));
        }
      } else {
        setSelectedPageKey(getPageKey(filteredPages[0], 0));
      }
    }
  }, [initialPage, filteredPages]);

  useEffect(() => {
    if (highlightText && scrollRef.current) {
        const el = scrollRef.current.querySelector(`[data-text*="${highlightText.toLowerCase()}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-yellow-200');
            setTimeout(() => el.classList.remove('bg-yellow-200'), 3000);
        }
    }
  }, [highlightText, selectedPageKey]);

  const activePageIdx = useMemo(() => {
    const idx = filteredPages.findIndex((p, i) => getPageKey(p, i) === selectedPageKey);
    return idx >= 0 ? idx : 0;
  }, [filteredPages, selectedPageKey]);

  const activePage = filteredPages[activePageIdx] || pages[0];

  useEffect(() => {
    if (activePage?.imageUrl && canvasRef.current) {
      import('../utils/imageProcessor').then(({ enhanceImageReadability }) => {
        enhanceImageReadability(activePage.imageUrl!, canvasRef.current!).then(setEnhancedImageUrl);
      });
    } else {
        setEnhancedImageUrl(null);
    }
  }, [activePage]);

  const handleCopy = () => {
    if (activePage) {
      navigator.clipboard.writeText(activePage.extracted_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAll = () => {
    const fullTranscript = pages
      .map(
        (p) =>
          `========================================================================\n` +
          `DOKUMEN: ${p.source} | HALAMAN: ${p.page} | OCR CONFIDENCE: ${Math.round(p.ocr_confidence * 100)}%\n` +
          `========================================================================\n\n` +
          `${p.extracted_text}\n\n`
      )
      .join('\n');

    const blob = new Blob([fullTranscript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transkrip_Lengkap_OCR_BAPL_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Multimodal OCR Vision Verified
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Total {pages.length} Halaman Terpindai
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-1.5">
              <FileText className="w-5 h-5 text-slate-700" />
              Hasil Transkrip OCR Dokumen BAPL
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transkrip lengkap hasil pembacaan teks ketikan form baku, catatan tulisan tangan pengawas lapangan, angka pengukuran opname, dan stempel dokumen BAPL.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kata di transkrip..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-56"
              />
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin Halaman</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Unduh TXT Semua Hal</span>
            </button>
          </div>
        </div>

        {/* Source Document Filter Tabs */}
        {sources.length > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Dokumen:
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedSource('ALL');
                if (pages.length > 0) {
                  setSelectedPageKey(getPageKey(pages[0], 0));
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedSource === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Berkas ({pages.length} Hal)
            </button>
            {sources.map((src, idx) => {
              const count = pages.filter((p) => p.source === src).length;
              return (
                <button
                  key={`src_${src}_${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedSource(src);
                    const firstInDocIdx = pages.findIndex((p) => p.source === src);
                    if (firstInDocIdx >= 0) {
                      setSelectedPageKey(getPageKey(pages[firstInDocIdx], firstInDocIdx));
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 max-w-xs truncate ${
                    selectedSource === src
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={src}
                >
                  📄 {src} ({count} Hal)
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page selector sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Daftar Halaman ({filteredPages.length})
            </span>
          </div>
          <div className="space-y-1 max-h-[620px] overflow-y-auto pr-1">
            {filteredPages.map((p, pIdx) => {
              const key = getPageKey(p, pIdx);
              const isSelected = selectedPageKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPageKey(key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />
                    <div className="truncate">
                      <p className="truncate leading-tight">Halaman {p.page}</p>
                      {sources.length > 1 && (
                        <p
                          className={`text-[9px] truncate font-mono mt-0.5 ${
                            isSelected ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {p.source}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono shrink-0 ml-1 ${
                      isSelected ? 'text-emerald-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {Math.round(p.ocr_confidence * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Page Content View */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 text-xs gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 font-mono px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                  HALAMAN {activePage?.page}
                </span>
                <span className="text-slate-600 font-medium truncate max-w-md">
                  Dokumen: {activePage?.source || 'BAPL Utama'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Akurasi OCR: {Math.round((activePage?.ocr_confidence || 0.95) * 100)}%
                </span>
                {activePage?.detected_ink_colors && activePage.detected_ink_colors.map((ink, i) => (
                  <span
                    key={`ink_${ink}_${i}`}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      ink.toLowerCase().includes('biru') || ink.toLowerCase().includes('blue')
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : ink.toLowerCase().includes('merah') || ink.toLowerCase().includes('red')
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {ink.toLowerCase().includes('biru') || ink.toLowerCase().includes('blue')
                      ? '🔵'
                      : ink.toLowerCase().includes('merah') || ink.toLowerCase().includes('red')
                      ? '🔴'
                      : '✍️'} {ink}
                  </span>
                ))}
                {activePage?.has_visual_elements && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    📐 Sketsa / Foto Fisik
                  </span>
                )}
              </div>
            </div>

            {/* Split View Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Content */}
                <div className="space-y-4">
                  <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">
                        Scan Asli Dokumen: <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => window.open(activePage?.imageUrl, '_blank')}>Buka di Tab Baru</span>
                    </span>
                    {activePage?.imageUrl ? (
                        <div className="space-y-4">
                            <img src={activePage.imageUrl} alt="BAPL Scan Asli" className="w-full rounded border border-slate-300" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-48 bg-slate-200 rounded text-slate-400 text-xs">Tidak ada gambar</div>
                    )}
                  </div>
                </div>

                {/* OCR Transcribed Text Box - Survey Result Only */}
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Hasil Transkrip OCR (Bagian Survei)</span>
                    <div 
                        ref={scrollRef}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-xs text-slate-100 leading-relaxed whitespace-pre-wrap max-h-[580px] overflow-y-auto shadow-inner select-text"
                    >
                        <div>
                            {extractSurveyResult(activePage?.extracted_text || "")}
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Jumlah Karakter: {activePage?.extracted_text?.length || 0} karakter</span>
            <span className="font-medium text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Transkripsi Berita Acara Peninjauan Lapangan (BAPL) Siap Audit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
