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
  DollarSign,
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Project, BAType, IPALocation, JustifikasiDocument, BOQItem, MasterItem } from '../types';

interface CreateDocumentModalProps {
  projects: Project[];
  masterItems?: MasterItem[];
  preselectedProjectId?: string;
  onClose: () => void;
  onCreateBeritaAcara: (projectId: string, baData: any) => void;
  onCreateJustifikasi: (projectId: string, justekData: any) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  projects,
  masterItems = [],
  preselectedProjectId,
  onClose,
  onCreateBeritaAcara,
  onCreateJustifikasi,
}) => {
  const [docType, setDocType] = useState<'BERITA_ACARA' | 'JUSTIFIKASI'>('BERITA_ACARA');
  const [projectId, setProjectId] = useState(preselectedProjectId || projects[0]?.id || '');

  const selectedProj = projects.find(p => p.id === projectId) || projects[0];

  // ================= BERITA ACARA FORM STATES =================
  const [baType, setBaType] = useState<BAType>('Peninjauan Lapangan');
  const [baNumber, setBaNumber] = useState(`0${Math.floor(Math.random() * 80 + 20)}/BA-PL/PMO-CYC/ABJ/IV/2026`);
  const [baDate, setBaDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationDetails, setLocationDetails] = useState('Zona Distribusi Utama, Area Sedimentasi Basin');
  const [agenda, setAgenda] = useState('Inspeksi Bersama Hasil Pengukuran Titik Anomali & Rekomendasi Modifikasi Jalur Pipa');
  const [notes, setNotes] = useState('Kondisi lapangan memerlukan penyesuaian volume dan metode kerja perkuatan struktur.');
  const [baItems, setBaItems] = useState([
    { id: '1', rawNameInBA: 'Pipa HDPE Dia 400mm PN10 SDR17 SNI', canonicalWbsCode: 'PIP-04', measuredVolume: 120, unit: 'm', stationing: 'STA 0+150 - 0+270', complianceStatus: 'SESUAI' as const }
  ]);

  // ================= JUSTIFIKASI FORM STATES =================
  const [numberJustek, setNumberJustek] = useState(`0${Math.floor(Math.random() * 80 + 30)}/JUSTEK/PMO-CYC/ABJ/IV/2026`);
  const [numberJusfin, setNumberJusfin] = useState(`0${Math.floor(Math.random() * 80 + 30)}/JUSFIN/PMO-CYC/ABJ/IV/2026`);
  const [dedBaselineDesc, setDedBaselineDesc] = useState('Pemasangan jaringan perpipaan dan valve distribusi sesuai spesifikasi gambar DED awal.');
  const [fieldAnomalyDesc, setFieldAnomalyDesc] = useState('Ditemukan deviasi kontur tanah dan utilitas bawah tanah eksisting yang menghalangi trase DED.');
  const [rootCauseCategory, setRootCauseCategory] = useState<'OBSTRUKSI_UTILITAS_EKSISTING' | 'STRUKTUR_TANAH' | 'OPTIMALISASI_PROSES_AIR' | 'PENINGKATAN_SPESIFIKASI' | 'KONDISI_DARURAT'>('OBSTRUKSI_UTILITAS_EKSISTING');
  const [techSolution, setTechSolution] = useState('Pengalihan rute (re-routing) dan penambahan selubung proteksi khusus pada pipa air.');
  const [qualityImpact, setQualityImpact] = useState('Menjamin keandalan distribusi air olahan dan mencegah resiko kebocoran pipa transmisi.');
  const [urgencyLevel, setUrgencyLevel] = useState<'TINGGI' | 'SEDANG' | 'STANDAR'>('TINGGI');
  const [budgetSource, setBudgetSource] = useState<'CAPEX PMO CYCLICAL 2026' | 'CADANGAN KONTINGENSI' | 'REALOKASI POS ANGGARAN'>('CAPEX PMO CYCLICAL 2026');

  const [justekItems, setJustekItems] = useState<BOQItem[]>([
    {
      id: 'JIT-1',
      wbsCode: 'PIP-04',
      itemName: 'Pemasangan Pipa HDPE Dia 400mm PN10 SDR17 SNI',
      unit: 'm',
      dedVolume: 80,
      fieldVolume: 120,
      unitPrice: 2450000,
      evidenceStatus: 'VERIFIED',
      justificationReason: 'Penambahan panjang trase pipa menghindari kabel utilitas eksisting.'
    }
  ]);

  // Financial calculations
  const originalContract = selectedProj?.contractValue || 5000000000;
  const additionalWorks = justekItems.reduce((acc, it) => {
    const delta = it.fieldVolume - it.dedVolume;
    return delta > 0 ? acc + (delta * it.unitPrice) : acc;
  }, 0);
  const reducedWorks = justekItems.reduce((acc, it) => {
    const delta = it.fieldVolume - it.dedVolume;
    return delta < 0 ? acc + (Math.abs(delta) * it.unitPrice) : acc;
  }, 0);
  const netVariance = additionalWorks - reducedWorks;
  const revisedContract = originalContract + netVariance;
  const variancePct = originalContract > 0 ? ((netVariance / originalContract) * 100) : 0;

  // Add Item in BA
  const handleAddBaItem = () => {
    setBaItems([
      ...baItems,
      {
        id: Date.now().toString(),
        rawNameInBA: '',
        canonicalWbsCode: '',
        measuredVolume: 1,
        unit: 'm',
        stationing: 'Area IPA',
        complianceStatus: 'SESUAI'
      }
    ]);
  };

  const handleRemoveBaItem = (idx: number) => {
    setBaItems(baItems.filter((_, i) => i !== idx));
  };

  // Add Item in Justifikasi
  const handleAddJustekItem = () => {
    setJustekItems([
      ...justekItems,
      {
        id: `JIT-${Date.now()}`,
        wbsCode: `WBS-0${justekItems.length + 1}`,
        itemName: '',
        unit: 'unit',
        dedVolume: 0,
        fieldVolume: 1,
        unitPrice: 1000000,
        evidenceStatus: 'MISSING_BA',
        justificationReason: 'Kebutuhan penyesuaian teknis lapangan.'
      }
    ]);
  };

  const handleRemoveJustekItem = (idx: number) => {
    setJustekItems(justekItems.filter((_, i) => i !== idx));
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

  const handleSubmitJustifikasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProj) return;

    const newJustifikasi: JustifikasiDocument = {
      id: `JST-${Date.now()}`,
      projectId: selectedProj.id,
      numberJustek,
      numberJusfin,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'VERIFIKASI_BA',
      urgencyLevel,
      engineeringContext: {
        dedBaselineDescription: dedBaselineDesc,
        fieldAnomalyFound: fieldAnomalyDesc,
        rootCauseCategory,
        technicalSolutionRecommended: techSolution,
        qualityImpact,
      },
      financialSummary: {
        originalContractValue: originalContract,
        additionalWorksValue: additionalWorks,
        reducedWorksValue: reducedWorks,
        netVarianceValue: netVariance,
        revisedContractValue: revisedContract,
        variancePercentage: parseFloat(variancePct.toFixed(2)),
        budgetSource
      },
      items: justekItems,
      currentApprovalStage: 2,
      approvalHistory: [
        {
          step: 'Penyusunan Usulan Draf Kontraktor',
          actor: selectedProj.contractorName,
          role: 'Kontraktor Pelaksana',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'APPROVED',
          comments: `Pengajuan Justifikasi Teknis & Finansial akibat deviasi lapangan.`
        },
        {
          step: 'Verifikasi Berita Acara & Lembar Ukur Lapangan',
          actor: 'Site Engineer PMO',
          role: 'Site Engineer PMO',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'PENDING',
          comments: 'Menunggu kelengkapan dokumen pendukung Berita Acara.'
        }
      ]
    };

    onCreateJustifikasi(selectedProj.id, newJustifikasi);
    onClose();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Input Dokumen Digital PMO Cyclical</h3>
              <p className="text-xs text-slate-300">PT Air Bersih Jakarta &bull; 6 Instalasi Pengolahan Air</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Document Type Switcher Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => setDocType('BERITA_ACARA')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              docType === 'BERITA_ACARA'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Digital Berita Acara (MC-0 &bull; Lapangan &bull; Komisioning &bull; MC-100)</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType('JUSTIFIKASI')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              docType === 'JUSTIFIKASI'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Justifikasi Teknis & Finansial (Justek & Jusfin)</span>
          </button>
        </div>

        {/* Content Body */}
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

          {/* ================= FORM BERITA ACARA ================= */}
          {docType === 'BERITA_ACARA' && (
            <form onSubmit={handleSubmitBA} className="space-y-4">
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
                    onClick={handleAddBaItem}
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
                            onClick={() => handleRemoveBaItem(idx)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Nama Item di BA (contoh: Pipa HDPE Dia 400mm)"
                          value={item.rawNameInBA}
                          onChange={(e) => {
                            const copy = [...baItems];
                            copy[idx].rawNameInBA = e.target.value;
                            setBaItems(copy);
                          }}
                          className="p-2 border border-slate-300 rounded text-xs bg-white text-slate-900"
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
                          className="p-2 border border-slate-300 rounded text-xs bg-white font-mono text-slate-900"
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
                          className="p-2 border border-slate-300 rounded text-xs bg-white font-mono text-slate-900"
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
                          className="p-2 border border-slate-300 rounded text-xs bg-white text-slate-900"
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
                          className="p-2 border border-slate-300 rounded text-xs bg-white text-slate-900"
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

              {/* Submit BA button */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Terbitkan Berita Acara</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= FORM JUSTIFIKASI TEKNIS & FINANSIAL ================= */}
          {docType === 'JUSTIFIKASI' && (
            <form onSubmit={handleSubmitJustifikasi} className="space-y-4">
              
              {/* Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wide block">Nomor Justifikasi Teknis (Justek):</label>
                  <input
                    type="text"
                    value={numberJustek}
                    onChange={(e) => setNumberJustek(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-900"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wide block">Nomor Justifikasi Finansial (Jusfin):</label>
                  <input
                    type="text"
                    value={numberJusfin}
                    onChange={(e) => setNumberJusfin(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Root Cause & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wide block">Kategori Akar Anomali:</label>
                  <select
                    value={rootCauseCategory}
                    onChange={(e) => setRootCauseCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="OBSTRUKSI_UTILITAS_EKSISTING">Obstruksi Utilitas Eksisting (Kabel/Pipa)</option>
                    <option value="STRUKTUR_TANAH">Kondisi Struktur Tanah / Labil</option>
                    <option value="OPTIMALISASI_PROSES_AIR">Optimalisasi Proses Pengolahan Air</option>
                    <option value="PENINGKATAN_SPESIFIKASI">Peningkatan Spesifikasi Material / Pompa</option>
                    <option value="KONDISI_DARURAT">Kondisi Darurat / Force Majeure</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wide block">Tingkat Urgensi Persetujuan:</label>
                  <select
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="TINGGI">Tinggi (Kritis Operasional)</option>
                    <option value="SEDANG">Sedang</option>
                    <option value="STANDAR">Standar</option>
                  </select>
                </div>
              </div>

              {/* DED baseline vs field anomaly */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wide block">Kondisi Desain Awal (DED Baseline):</label>
                  <textarea
                    value={dedBaselineDesc}
                    onChange={(e) => setDedBaselineDesc(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-amber-800 uppercase tracking-wide block">Temuan Fakta Anomali Lapangan:</label>
                  <textarea
                    value={fieldAnomalyDesc}
                    onChange={(e) => setFieldAnomalyDesc(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 border border-amber-300 bg-amber-50/30 rounded-lg text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Technical Solution & Quality Impact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wide block">Solusi Teknis Yang Direkomendasikan:</label>
                  <textarea
                    value={techSolution}
                    onChange={(e) => setTechSolution(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wide block">Dampak Mutu Air Olahan & Operasional:</label>
                  <textarea
                    value={qualityImpact}
                    onChange={(e) => setQualityImpact(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Items / BOQ table */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase tracking-wide">
                    Rincian Item Pekerjaan Tambah / Kurang ({justekItems.length}):
                  </label>
                  <button
                    type="button"
                    onClick={handleAddJustekItem}
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Item BOQ</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {justekItems.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Item #{idx + 1}</span>
                        {justekItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveJustekItem(idx)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Kode WBS (contoh: PIP-04)"
                          value={item.wbsCode}
                          onChange={(e) => {
                            const copy = [...justekItems];
                            copy[idx].wbsCode = e.target.value;
                            setJustekItems(copy);
                          }}
                          className="p-2 border border-slate-300 rounded text-xs bg-white font-mono text-slate-900"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Uraian Nama Item Pekerjaan"
                          value={item.itemName}
                          onChange={(e) => {
                            const copy = [...justekItems];
                            copy[idx].itemName = e.target.value;
                            setJustekItems(copy);
                          }}
                          className="p-2 border border-slate-300 rounded text-xs bg-white text-slate-900 sm:col-span-2"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Vol. DED:</span>
                          <input
                            type="number"
                            value={item.dedVolume}
                            onChange={(e) => {
                              const copy = [...justekItems];
                              copy[idx].dedVolume = parseFloat(e.target.value) || 0;
                              setJustekItems(copy);
                            }}
                            className="w-full p-2 border border-slate-300 rounded text-xs bg-white font-mono text-slate-900"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Vol. Lapangan:</span>
                          <input
                            type="number"
                            value={item.fieldVolume}
                            onChange={(e) => {
                              const copy = [...justekItems];
                              copy[idx].fieldVolume = parseFloat(e.target.value) || 0;
                              setJustekItems(copy);
                            }}
                            className="w-full p-2 border border-slate-300 rounded text-xs bg-white font-mono text-slate-900 font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Satuan:</span>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => {
                              const copy = [...justekItems];
                              copy[idx].unit = e.target.value;
                              setJustekItems(copy);
                            }}
                            className="w-full p-2 border border-slate-300 rounded text-xs bg-white text-slate-900"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Harga Satuan (Rp):</span>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const copy = [...justekItems];
                              copy[idx].unitPrice = parseFloat(e.target.value) || 0;
                              setJustekItems(copy);
                            }}
                            className="w-full p-2 border border-slate-300 rounded text-xs bg-white font-mono text-slate-900"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Alasan Perubahan / Catatan Justifikasi..."
                        value={item.justificationReason}
                        onChange={(e) => {
                          const copy = [...justekItems];
                          copy[idx].justificationReason = e.target.value;
                          setJustekItems(copy);
                        }}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white text-slate-900 italic"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary preview */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wide">
                  Ringkasan Finansial Justifikasi (Otomatis):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Kontrak Awal:</span>
                    <span className="font-bold text-white">{formatRupiah(originalContract)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Pekerjaan Tambah (+):</span>
                    <span className="font-bold text-amber-400">+{formatRupiah(additionalWorks)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Pekerjaan Kurang (-):</span>
                    <span className="font-bold text-emerald-400">-{formatRupiah(reducedWorks)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Deviasi Bersih (Jusfin):</span>
                    <span className="font-bold text-cyan-300">
                      {netVariance >= 0 ? '+' : ''}{formatRupiah(netVariance)} ({variancePct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Justifikasi buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Ajukan Dokumen Justifikasi Teknis & Finansial</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
