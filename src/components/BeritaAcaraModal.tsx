import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Check, 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  CheckCircle2, 
  Droplet, 
  FileText, 
  Plus, 
  ExternalLink,
  Award,
  Maximize2
} from 'lucide-react';
import { BeritaAcara, UserRole } from '../types';

interface BeritaAcaraModalProps {
  beritaAcara: BeritaAcara;
  projectName: string;
  userRole: UserRole;
  onClose: () => void;
  onSignBA: (baId: string) => void;
}

export const BeritaAcaraModal: React.FC<BeritaAcaraModalProps> = ({
  beritaAcara,
  projectName,
  userRole,
  onClose,
  onSignBA,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const getBATitle = () => {
    switch (beritaAcara.baType) {
      case 'MC-0':
        return 'BERITA ACARA PEMERIKSAAN BERSAMA TITIK AWAL 0% (MUTUAL CHECK - 0)';
      case 'Peninjauan Lapangan':
        return 'BERITA ACARA PENINJAUAN & KAJIAN TEKNIS BERSAMA LAPANGAN';
      case 'Tes Komisioning':
        return 'BERITA ACARA PENGUJIAN TESTING & COMMISSIONING OPERASIONAL IPA';
      case 'MC-100':
        return 'BERITA ACARA PEMERIKSAAN HASIL PEKERJAAN 100% (MUTUAL CHECK - 100 / PHO)';
      default:
        return 'BERITA ACARA TEKNIS LAPANGAN';
    }
  };

  const isUserSignatory = beritaAcara.signatories.some(s => 
    (userRole === 'Site Engineer PMO' && s.role.includes('Site Engineer')) ||
    (userRole === 'Kepala Departemen PMO' && s.role.includes('PMO'))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-cyan-500 text-slate-900 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
              {beritaAcara.baType}
            </span>
            <span className="text-slate-300 font-mono">{beritaAcara.baNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Cetak PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Sheet */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 print-page bg-white font-serif">
          
          {/* Official Letterhead (Kop Surat Resmi) */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold text-lg">
                <Droplet className="w-7 h-7 fill-white text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-wider text-slate-900 font-sans uppercase">
                  PT AIR BERSIH JAKARTA
                </h1>
                <h2 className="text-xs font-semibold text-slate-700 font-sans tracking-wide">
                  DEPARTEMEN PMO CYCLICAL &bull; DIVISI PENGENDALIAN KONSTRUKSI IPA
                </h2>
                <p className="text-[10px] text-slate-500 font-sans">
                  Gedung Tirta Lt. 4, Jl. Penjernihan II, Jakarta Pusat &bull; Telp: (021) 570-9800 &bull; pmo@airbersihjakarta.id
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-sans">
              <span className="font-bold text-blue-900 block font-mono">{beritaAcara.baNumber}</span>
              <span className="text-slate-500 text-[11px]">Unit: {beritaAcara.ipa}</span>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center space-y-1 font-sans">
            <h3 className="text-sm font-bold text-slate-900 uppercase underline decoration-2 underline-offset-4 tracking-wide">
              {getBATitle()}
            </h3>
            <p className="text-xs font-semibold text-slate-700">
              Nomor: {beritaAcara.baNumber}
            </p>
          </div>

          {/* Opening Paragraph */}
          <div className="text-xs text-slate-800 leading-relaxed font-sans space-y-2">
            <p>
              Pada hari ini, tanggal <strong>{new Date(beritaAcara.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>, 
              bertempat di lingkungan operasional <strong>{beritaAcara.ipa} ({beritaAcara.locationDetails})</strong>, 
              telah dilaksanakan pemeriksaan bersama untuk pekerjaan:
            </p>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-semibold text-slate-900">
              "{projectName}"
            </div>
            <p>
              Adapun rincian agenda pelaksanaan dan pemeriksaan fisik di lapangan meliputi: <em>{beritaAcara.agenda}</em>.
            </p>
          </div>

          {/* Water Quality / Test Metrics if Commissioning */}
          {beritaAcara.waterQualityMetrics && (
            <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-3.5 font-sans text-xs space-y-1.5">
              <div className="font-bold text-cyan-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-700" />
                <span>Hasil Pengujian Kualitas & Parameter Operasional (Uji Beban):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {beritaAcara.waterQualityMetrics.turbidityNTU !== undefined && (
                  <div className="bg-white p-2 rounded border border-cyan-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Kekeruhan (Turbidity)</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{beritaAcara.waterQualityMetrics.turbidityNTU} NTU</span>
                    <span className="text-[9px] text-emerald-600 block">&le; 0.5 NTU (Lulus)</span>
                  </div>
                )}
                {beritaAcara.waterQualityMetrics.pH !== undefined && (
                  <div className="bg-white p-2 rounded border border-cyan-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Derajat Keasaman (pH)</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{beritaAcara.waterQualityMetrics.pH}</span>
                    <span className="text-[9px] text-emerald-600 block">Std: 6.5 - 8.5</span>
                  </div>
                )}
                {beritaAcara.waterQualityMetrics.pressureBar !== undefined && (
                  <div className="bg-white p-2 rounded border border-cyan-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Tekanan Uji Pipa</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{beritaAcara.waterQualityMetrics.pressureBar} Bar</span>
                    <span className="text-[9px] text-emerald-600 block">Stabil 2 Jam</span>
                  </div>
                )}
                {beritaAcara.waterQualityMetrics.flowRateLPS !== undefined && (
                  <div className="bg-white p-2 rounded border border-cyan-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Kapasitas Debit Aliran</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{beritaAcara.waterQualityMetrics.flowRateLPS} Lps</span>
                    <span className="text-[9px] text-emerald-600 block">Sesuai Rating</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Itemized Table */}
          <div className="space-y-2 font-sans">
            <h4 className="text-xs font-bold text-slate-900 uppercase">
              Tabel Hasil Pengukuran Riil & Verifikasi Lapangan:
            </h4>
            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[10px] uppercase font-bold text-slate-700">
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">Uraian Item Pekerjaan / Material Di Lapangan</th>
                    <th className="py-2 px-3">WBS</th>
                    <th className="py-2 px-3 text-right">Volume Terukur</th>
                    <th className="py-2 px-3">Lokasi / STA</th>
                    <th className="py-2 px-3">Status Kesesuaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {beritaAcara.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="py-2 px-3 text-center">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900">{item.rawNameInBA}</div>
                        {item.testResultNotes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">{item.testResultNotes}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-blue-700 font-semibold">{item.canonicalWbsCode || '-'}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{item.measuredVolume} {item.unit}</td>
                      <td className="py-2 px-3 text-slate-600 text-[11px]">{item.stationing}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.complianceStatus === 'SESUAI'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.complianceStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Recommendations */}
          <div className="font-sans text-xs space-y-1">
            <h4 className="font-bold text-slate-900 uppercase">Catatan Kesimpulan Bersama:</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 italic">
              "{beritaAcara.notes}"
            </div>
          </div>

          {/* Photographic Attachments & Measurement Sheets */}
          {beritaAcara.attachments.length > 0 && (
            <div className="space-y-2 font-sans">
              <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-700" />
                <span>Lampiran Bukti Konkret & Lembar Ukur Pendukung:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {beritaAcara.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 space-y-2 hover:border-blue-400 transition-colors"
                  >
                    <div className="relative group overflow-hidden rounded-md h-36 bg-slate-200">
                      <img
                        src={att.url}
                        alt={att.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => setSelectedPhoto(att.url)}
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{att.title}</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{att.caption}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Lokasi: {att.stationingOrLocation}</span>
                        <span>{att.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Digital Signatories Block */}
          <div className="pt-6 font-sans border-t border-slate-300">
            <div className="text-center text-xs font-bold text-slate-800 uppercase mb-4">
              Pihak-Pihak Yang Memeriksa dan Menandatangani Bersama:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              {beritaAcara.signatories.map((sig, i) => (
                <div key={i} className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 flex flex-col justify-between h-40">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">{sig.role}</span>
                    <span className="text-[11px] font-semibold text-slate-800 block">{sig.institution}</span>
                  </div>

                  {sig.isSigned ? (
                    <div className="my-auto py-1">
                      <div className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Tanda Tangan Digital Sah</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5">{sig.signatureHash}</div>
                      <div className="text-[9px] text-slate-500">{sig.signedAt}</div>
                    </div>
                  ) : (
                    <div className="my-auto text-[11px] text-amber-600 font-semibold italic">
                      Menunggu Tanda Tangan
                    </div>
                  )}

                  <div className="border-t border-slate-300 pt-1">
                    <div className="font-bold text-slate-900 text-xs">{sig.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="text-xs text-slate-500">
            Status Dokumen: <strong className="text-emerald-700 font-bold">TERBIT RESMI & TERDAFTAR SISTEM PMO</strong>
          </div>

          <div className="flex items-center gap-2">
            {isUserSignatory && (
              <button
                onClick={() => onSignBA(beritaAcara.id)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Bubuhkan TTD Elektronik ({userRole})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox photo modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-3xl max-h-[85vh] relative">
            <img src={selectedPhoto} alt="Bukti Zoom" className="max-h-[80vh] w-auto rounded-lg shadow-2xl" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
