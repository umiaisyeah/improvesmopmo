import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Edit2,
  Tag,
  Sliders,
  Check,
  X,
  PlusCircle,
  Database,
} from 'lucide-react';
import { MasterItem, MasterItemMapping } from '../types';
import { computeMatchScore } from '../utils/matchingEngine';

interface MasterItemViewProps {
  masterItems: MasterItem[];
  mappings: MasterItemMapping[];
  autoMatchThreshold: number;
  setAutoMatchThreshold: (val: number) => void;
  onAddMasterItem: (item: Omit<MasterItem, 'id'>) => void;
  onUpdateMasterItem: (id: string, updates: Partial<MasterItem>) => void;
  onAddAlias: (masterItemId: string, alias: string) => void;
  onDeactivateMasterItem: (id: string) => void;
  onConfirmMapping: (mappingId: string, masterItemId: string) => void;
  onRejectMapping: (mappingId: string) => void;
  onCreateMasterFromRawText: (
    mappingId: string,
    canonicalName: string,
    code: string,
    unit: string,
    category: string
  ) => void;
}

export const MasterItemView: React.FC<MasterItemViewProps> = ({
  masterItems,
  mappings,
  autoMatchThreshold,
  setAutoMatchThreshold,
  onAddMasterItem,
  onUpdateMasterItem,
  onAddAlias,
  onDeactivateMasterItem,
  onConfirmMapping,
  onRejectMapping,
  onCreateMasterFromRawText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form states for adding new master item
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('m');
  const [newCategory, setNewCategory] = useState('Pekerjaan Perpipaan');
  const [newAlias, setNewAlias] = useState('');

  // Alias inline edit state
  const [addingAliasForId, setAddingAliasForId] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState('');

  // Create Master from Raw modal state
  const [createFromRawMapping, setCreateFromRawMapping] = useState<MasterItemMapping | null>(null);
  const [rawFormName, setRawFormName] = useState('');
  const [rawFormCode, setRawFormCode] = useState('');
  const [rawFormUnit, setRawFormUnit] = useState('unit');
  const [rawFormCategory, setRawFormCategory] = useState('Pekerjaan Umum');

  // Unique categories
  const categories = Array.from(new Set(masterItems.map((m) => m.category)));

  // Filtered Master Items
  const filteredMasterItems = masterItems.filter((mi) => {
    const matchesSearch =
      mi.canonicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mi.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mi.aliases.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || mi.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Unmapped or pending confirmation mappings
  const pendingMappings = mappings.filter((m) => {
    if (m.status === 'CONFIRMED') return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;
    onAddMasterItem({
      code: newCode.trim().toUpperCase(),
      canonicalName: newName.trim(),
      unit: newUnit,
      category: newCategory,
      aliases: newAlias.trim() ? [newAlias.trim()] : [],
      active: true,
    });
    setShowAddModal(false);
    setNewCode('');
    setNewName('');
    setNewAlias('');
  };

  const handleSaveAlias = (id: string) => {
    if (aliasInput.trim()) {
      onAddAlias(id, aliasInput.trim());
      setAliasInput('');
      setAddingAliasForId(null);
    }
  };

  const handleOpenCreateFromRaw = (map: MasterItemMapping) => {
    setCreateFromRawMapping(map);
    setRawFormName(map.rawText);
    setRawFormCode(`WBS-${Math.floor(100 + Math.random() * 900)}`);
    setRawFormUnit('unit');
    setRawFormCategory('Pekerjaan Umum');
  };

  const handleSaveMasterFromRaw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFromRawMapping || !rawFormName.trim()) return;
    onCreateMasterFromRawText(
      createFromRawMapping.id,
      rawFormName.trim(),
      rawFormCode.trim().toUpperCase(),
      rawFormUnit,
      rawFormCategory
    );
    setCreateFromRawMapping(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002b5b] via-[#0054a6] to-[#009ee2] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs tracking-wider uppercase mb-1">
            <Database className="w-4 h-4" />
            <span>Katalog Master Item Baku WBS &amp; Nomenklatur</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Database Master Item Standards (BoQ)</h2>
          <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-2xl">
            Satu standar nama baku dan kode WBS untuk mencocokkan berbagai variasi penulisan nama item di DED, BA MC-0, BA Peninjauan Lapangan, dan Justifikasi.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Master Item</span>
        </button>
      </div>

      {/* Auto Match Threshold Slider Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Ambang Batas Pencocokan Otomatis (Auto-Match Threshold)</h4>
            <p className="text-[11px] text-slate-500">
              Skor &ge; {autoMatchThreshold}% otomatis dipetakan (AUTO). Skor 70% &ndash; {autoMatchThreshold - 1}% masuk antrean konfirmasi. &lt; 70% berstatus UNMAPPED.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
            {autoMatchThreshold}%
          </span>
          <input
            type="range"
            min="75"
            max="98"
            value={autoMatchThreshold}
            onChange={(e) => setAutoMatchThreshold(Number(e.target.value))}
            className="w-32 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Panel Item Belum Terpetakan */}
      {pendingMappings.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="text-sm font-bold text-amber-900">
                Item Belum Terpetakan / Membutuhkan Konfirmasi ({pendingMappings.length})
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-800">
              Tinjau kandidat teratas dan konfirmasi pemetaan nama baku
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingMappings.map((map) => {
              // Calculate top 3 candidates from active master items
              const candidates = masterItems
                .filter((mi) => mi.active)
                .map((mi) => ({
                  item: mi,
                  score: computeMatchScore(map.rawText, mi.canonicalName),
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

              const topMatch = candidates[0];

              return (
                <div
                  key={map.id}
                  className="bg-white rounded-xl border border-amber-300 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Sumber: {map.source}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">"{map.rawText}"</h4>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        map.status === 'AUTO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {map.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      3 Kandidat Master Item Teratas:
                    </span>
                    {candidates.map((cand, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-800">
                        <span className="truncate pr-2 font-medium">
                          {cand.item.code} - {cand.item.canonicalName}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                              cand.score >= autoMatchThreshold
                                ? 'bg-emerald-100 text-emerald-800'
                                : cand.score >= 70
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {cand.score}%
                          </span>
                          <button
                            onClick={() => onConfirmMapping(map.id, cand.item.id)}
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Pilih
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => handleOpenCreateFromRaw(map)}
                      className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Buat Master Baru Dari Teks Ini</span>
                    </button>

                    <button
                      onClick={() => onRejectMapping(map.id)}
                      className="text-rose-600 hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Abaikan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Master Items Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search & Category Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode WBS, nama baku, atau alias..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Kategori ({masterItems.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Master Items Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-28">Kode WBS</th>
                <th className="p-3">Nama Baku Master</th>
                <th className="p-3 w-20">Satuan</th>
                <th className="p-3 w-44">Kategori</th>
                <th className="p-3">Sebutan Alias (Istilah BA/JusTek)</th>
                <th className="p-3 w-24 text-center">Status</th>
                <th className="p-3 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredMasterItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada Master Item yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMasterItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-700 bg-blue-50/40">{item.code}</td>
                    <td className="p-3 font-bold text-slate-900">{item.canonicalName}</td>
                    <td className="p-3 font-mono text-slate-600">{item.unit}</td>
                    <td className="p-3 font-medium text-slate-600">{item.category}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.aliases.map((alias, aIdx) => (
                          <span
                            key={aIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                          >
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>{alias}</span>
                          </span>
                        ))}

                        {addingAliasForId === item.id ? (
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="text"
                              autoFocus
                              value={aliasInput}
                              onChange={(e) => setAliasInput(e.target.value)}
                              placeholder="Tambah alias..."
                              className="px-2 py-0.5 border border-blue-400 rounded text-[11px] focus:outline-none"
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveAlias(item.id)}
                            />
                            <button
                              onClick={() => handleSaveAlias(item.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setAddingAliasForId(null)}
                              className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAddingAliasForId(item.id);
                              setAliasInput('');
                            }}
                            className="text-blue-600 hover:text-blue-800 text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Alias</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeactivateMasterItem(item.id)}
                        className={`text-[11px] font-bold underline cursor-pointer ${
                          item.active ? 'text-slate-500 hover:text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {item.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add New Master Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Tambah Master Item WBS Baru</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kode WBS Baku *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: PIP-05, VLV-08, CIV-12"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Baku Master *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pipa HDPE Dia 400mm PN10 SDR17 SNI"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan *</label>
                  <input
                    type="text"
                    required
                    placeholder="m, unit, m3, ton, set"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Pekerjaan Perpipaan">Pekerjaan Perpipaan</option>
                    <option value="Aksesoris & Valve">Aksesoris &amp; Valve</option>
                    <option value="Pekerjaan Sipil & Struktur">Pekerjaan Sipil &amp; Struktur</option>
                    <option value="Pekerjaan Tanah">Pekerjaan Tanah</option>
                    <option value="Pekerjaan Otomasi & Elektrikal">Pekerjaan Otomasi &amp; Elektrikal</option>
                    <option value="Pekerjaan Instrumentasi & SCADA">Pekerjaan Instrumentasi &amp; SCADA</option>
                    <option value="Mekanikal & Pompa">Mekanikal &amp; Pompa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sebutan Alias Awal (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal sebutan di BA: Pipa HDPE 400mm SDR17"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Master Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Master Item from Raw Text */}
      {createFromRawMapping && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-600" />
                <span>Buat Master Item dari Teks Dokumen Raw</span>
              </h3>
              <button
                onClick={() => setCreateFromRawMapping(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMasterFromRaw} className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Teks Raw Dokumen:</span>
                <p className="font-bold text-slate-900 mt-0.5">"{createFromRawMapping.rawText}"</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Baku Master Item</label>
                <input
                  type="text"
                  required
                  value={rawFormName}
                  onChange={(e) => setRawFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode WBS</label>
                  <input
                    type="text"
                    required
                    value={rawFormCode}
                    onChange={(e) => setRawFormCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={rawFormUnit}
                    onChange={(e) => setRawFormUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  value={rawFormCategory}
                  onChange={(e) => setRawFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateFromRawMapping(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs"
                >
                  Buat &amp; Petakan Otomatis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
