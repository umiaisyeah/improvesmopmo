import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Check, 
  Droplet,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Project, BAType, IPALocation } from '../types';

interface CreateDocumentModalProps {
  projects: Project[];
  preselectedProjectId?: string;
  onClose: () => void;
  onCreateBeritaAcara: (projectId: string, baData: any) => void;
  onCreateJustifikasi: (projectId: string, justekData: any) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  projects,
  preselectedProjectId,
  onClose,
  onCreateBeritaAcara,
  onCreateJustifikasi,
}) => {
  const [docType, setDocType] = useState<'BERITA_ACARA' | 'JUSTIKASI'>('BERITA_ACARA');
  const [projectId, setProjectId] = useState(preselectedProjectId || projects[0]?.id || '');

  // BA Form States
  const [baType, setBaType] = useState<BAType>('Peninjauan Lapangan');
  const [baNumber, setBaNumber] = useState(`0${Math.floor(Math.random() * 80 + 20)}/BA-PL/PMO-CYC/ABJ/IV/2026`);
  const [baDate, setBaDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationDetails, setLocationDetails] = useState('Zona Distribusi Utama, Area Sedimentasi Basin');
  const [agenda, setAgenda] = useState('Inspeksi Bersama Hasil Pengukuran Titik Anomali & Rekomendasi Modifikasi Jalur Pipa');
  const [notes, setNotes] = useState('Kondisi lapangan memerlukan penyesuaian volume dan metode kerja perkuatan struktur.');
  const [baItems, setBaItems] = useState([
    { id: '1', rawNameInBA: 'Pipa HDPE Dia 400mm PN10 SDR17 SNI', canonicalWbsCode: 'PIP-04', measuredVolume: 120, unit: 'm', stationing: 'STA 0+150 - 0+270', complianceStatus: 'SESUAI' as const }
  ]);

  const selectedProj = projects.find(p => p.id === projectId);

  const handleAddItem = () => {
    setBaItems([
      ...baItems,
      {
        id: Date.now().toString(),
        rawNameInBA: '',
        canonicalWbsCode: '',
        measuredVolume: 1,
        unit: 'unit',
        stationing: 'Area Kerja',
        complianceStatus: 'SESUAI'
      }
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setBaItems(baItems.filter((_, i) => i !== idx));
  };

  const handleSubmitBA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProj) return;

    const newBA = {
      id: `BA-${Date.now()}`,
      projectId: selectedProj.id,
      ipa: selectedProj.ipa,
      baType,
      baNumber,
      date: baDate,
      locationDetails,
      agenda,
      notes,
      items: baItems.map((item, idx) => ({
        ...item,
        id: `BAI-${Date.now()}-${idx}`
      })),
      attachments: [
        {
          id: `ATT-${Date.now()}`,
          title: `Foto Dokumentasi ${baType}`,
          type: 'FOTO_LAPANGAN' as const,
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
          uploadedAt: `${baDate} 14:00`,
          caption: 'Dokumentasi peninjauan fisik bersama tim supervisi & site PMO',
          stationingOrLocation: locationDetails
        }
      ],
      signatories: [
        { role: 'Site Engineer PMO', name: 'Bambang Wijanarko, ST', institution: 'PT Air Bersih Jakarta (PMO)', isSigned: true, signedAt: `${baDate} 15:00`, signatureHash: `ABJ-SIG-${Math.floor(Math.random() * 90000 + 10000)}` },
        { role: 'Supervisi Konsultan', name: 'Ir. Ahmad Zarkasih', institution: 'Konsultan Pengawas', isSigned: true, signedAt: `${baDate} 15:30`, signatureHash: `KNS-SIG-${Math.floor(Math.random() * 90000 + 10000)}` },
        { role: 'Project Manager Kontraktor', name: selectedProj.contractorName, institution: selectedProj.contractorName, isSigned: true, signedAt: `${baDate} 16:00`, signatureHash: `KTR-SIG-${Math.floor(Math.random() * 90000 + 10000)}` }
      ],
      status: 'TERBIT' as const
    };

    onCreateBeritaAcara(selectedProj.id, newBA);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Input Dokumen Digital PMO Cyclical</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Project selector */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wide block">
              Pilih Proyek & Lokasi IPA:
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.ipa}] - {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          {/* BA Type */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wide block">
              Jenis Berita Acara Yang Diterbitkan:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['MC-0', 'Peninjauan Lapangan', 'Tes Komisioning', 'MC-100'] as BAType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBaType(type)}
                  className={`p-2 rounded-lg font-semibold text-center border transition-all cursor-pointer ${
                    baType === type
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wide block">Nomor Berita Acara Resmi:</label>
              <input
                type="text"
                value={baNumber}
                onChange={(e) => setBaNumber(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-900"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wide block">Tanggal Pelaksanaan:</label>
              <input
                type="date"
                value={baDate}
                onChange={(e) => setBaDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900"
                required
              />
            </div>
          </div>

          {/* Location & Agenda */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wide block">Lokasi Spesifik di Lingkungan IPA:</label>
            <input
              type="text"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900"
              placeholder="Contoh: Gedung Filtrasi, Saluran Intake, atau STA 0+000 s/d 0+350"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wide block">Agenda & Uraian Pemeriksaan Bersama:</label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={2}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          {/* Items measured */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 uppercase tracking-wide">
                Item Pekerjaan / Material Terukur di Lapangan ({baItems.length}):
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {baItems.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600">Item #{idx + 1}</span>
                    {baItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Item (contoh: Pipa HDPE 400mm)"
                      value={item.rawNameInBA}
                      onChange={(e) => {
                        const copy = [...baItems];
                        copy[idx].rawNameInBA = e.target.value;
                        setBaItems(copy);
                      }}
                      className="p-2 border border-slate-300 rounded text-xs bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Kode WBS / Acuan (opsional)"
                      value={item.canonicalWbsCode}
                      onChange={(e) => {
                        const copy = [...baItems];
                        copy[idx].canonicalWbsCode = e.target.value;
                        setBaItems(copy);
                      }}
                      className="p-2 border border-slate-300 rounded text-xs bg-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Volume"
                      value={item.measuredVolume}
                      onChange={(e) => {
                        const copy = [...baItems];
                        copy[idx].measuredVolume = parseFloat(e.target.value) || 0;
                        setBaItems(copy);
                      }}
                      className="p-2 border border-slate-300 rounded text-xs bg-white font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Satuan (m, m3, unit)"
                      value={item.unit}
                      onChange={(e) => {
                        const copy = [...baItems];
                        copy[idx].unit = e.target.value;
                        setBaItems(copy);
                      }}
                      className="p-2 border border-slate-300 rounded text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="STA / Lokasi"
                      value={item.stationing}
                      onChange={(e) => {
                        const copy = [...baItems];
                        copy[idx].stationing = e.target.value;
                        setBaItems(copy);
                      }}
                      className="p-2 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wide block">Kesimpulan & Catatan Lapangan:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmitBA}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan & Terbitkan Berita Acara</span>
          </button>
        </div>

      </div>
    </div>
  );
};
