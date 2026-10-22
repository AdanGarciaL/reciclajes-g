import React, { useState, useEffect } from 'react';
import {
  Database,
  Lock,
  PlusCircle,
  Check,
  Trash2,
  Download,
  Upload,
  X,
  KeyRound,
  Sparkles,
  Inbox,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  getCustomDatabase,
  addOrUpdateCustomChip,
  deleteCustomChip,
  getPendingSuggestions,
  addPendingSuggestion,
  removePendingSuggestion,
  verifyAdminPin,
  setAdminPin,
  getDatabaseStats,
  normalizeCode,
  detectCpuInsteadOfMemory,
} from '../services/icEngine';

const CAPACITIES = ['8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
const RAM_OPTIONS = ['', '1GB', '2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'];
const BRANDS = [
  'Samsung',
  'Micron',
  'SK Hynix',
  'SanDisk / WD',
  'Kioxia / Toshiba',
  'Kingston',
  'Foresee',
  'YMTC',
  'Apple / iPhone NAND',
];
const TYPES = ['eMCP', 'uMCP', 'eMMC', 'UFS', 'NVMe NAND', 'LPDDR RAM'];

export default function AdminDatabaseModal({
  isOpen,
  onClose,
  initialCode = '',
  onDatabaseUpdated,
}) {
  const [activeTab, setActiveTab] = useState('add');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [code, setCode] = useState('');
  const [storage, setStorage] = useState('64GB');
  const [ram, setRam] = useState('4GB');
  const [manufacturer, setManufacturer] = useState('Samsung');
  const [type, setType] = useState('eMCP');
  const [notes, setNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [customList, setCustomList] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [stats, setStats] = useState(getDatabaseStats());

  const [bulkText, setBulkText] = useState('');
  const [newPinValue, setNewPinValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialCode) setCode(normalizeCode(initialCode));
      refreshLists();
      setStatusMsg('');
      setErrorMsg('');
      setPinError('');
    }
  }, [isOpen, initialCode]);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  function refreshLists() {
    setCustomList(getCustomDatabase());
    setPendingList(getPendingSuggestions());
    setStats(getDatabaseStats());
    if (onDatabaseUpdated) onDatabaseUpdated();
  }

  function handleUnlockPin(e) {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setIsAdminUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Código PIN de Administrador incorrecto.');
    }
  }

  function handleSaveChip(e) {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    const cleanCode = normalizeCode(code);
    if (!cleanCode || cleanCode.length < 3) {
      setErrorMsg('Ingresa un código IC válido de al menos 3 caracteres.');
      return;
    }

    const cpuCheck = detectCpuInsteadOfMemory(cleanCode);
    if (cpuCheck) {
      setErrorMsg(cpuCheck.message);
      return;
    }

    if (isAdminUnlocked) {
      addOrUpdateCustomChip({
        code: cleanCode,
        storage,
        ram: ram || null,
        manufacturer,
        type,
        notes,
      });
      setStatusMsg(`Chip ${cleanCode} guardado en la Base Oficial.`);
    } else {
      addPendingSuggestion({
        code: cleanCode,
        storage,
        ram: ram || null,
        manufacturer,
        type,
        notes,
      });
      setStatusMsg(`Código ${cleanCode} enviado al Buzón para revisión del Administrador.`);
    }

    setCode('');
    setNotes('');
    refreshLists();
  }

  function handleApproveSuggestion(sug) {
    addOrUpdateCustomChip({
      code: sug.code,
      storage: sug.storage,
      ram: sug.ram || null,
      manufacturer: sug.manufacturer,
      type: sug.type,
      notes: sug.notes,
    });
    removePendingSuggestion(sug.id);
    refreshLists();
    setStatusMsg(`Código ${sug.code} aprobado.`);
  }

  function handleBulkImport() {
    setErrorMsg('');
    setStatusMsg('');
    if (!bulkText.trim()) {
      setErrorMsg('Pega al menos un renglón con el formato: CODIGO, CAPACIDAD, MARCA');
      return;
    }

    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    let imported = 0;
    let skipped = 0;

    for (const line of lines) {
      const parts = line.split(/[,;\t]+/).map((p) => p.trim());
      if (parts.length >= 2) {
        const [c, cap, brand, tp, rm] = parts;
        const cleanC = normalizeCode(c);
        if (cleanC && cleanC.length >= 3 && cleanC !== 'CODIGO' && cleanC !== 'CODE') {
          addOrUpdateCustomChip({
            code: cleanC,
            storage: cap || '64GB',
            manufacturer: brand || 'Samsung',
            type: tp || 'eMCP',
            ram: rm || null,
          });
          imported++;
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    setBulkText('');
    refreshLists();
    setStatusMsg(
      `Se importaron ${imported} chips correctamente.${skipped > 0 ? ` (${skipped} renglones omitidos)` : ''}`
    );
  }

  function handleExportCsv() {
    const rows = [
      ['CODIGO', 'CAPACIDAD', 'RAM', 'FABRICANTE', 'TIPO', 'NOTAS'],
      ...customList.map((item) => [
        item.code,
        item.storage || '',
        item.ram || '',
        item.manufacturer || '',
        item.type || '',
        (item.notes || '').replace(/,/g, ' '),
      ]),
    ];
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecologica_garcia_chips_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Administración de Base de Datos"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#062011] border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/20 bg-[#04160b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                Base de Datos Eco Lógica
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {stats.totalOfflineCount.toLocaleString()}
                </span>
              </h3>
              <p className="text-xs text-emerald-300/70">
                {isAdminUnlocked ? 'Modo Administrador Activo' : 'Modo Operador (Lectura y Sugerencias)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de estado Admin PIN (Sin revelar el PIN en ningún lado) */}
        {!isAdminUnlocked ? (
          <form
            onSubmit={handleUnlockPin}
            className="px-5 py-3 bg-[#031209] border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 text-xs text-emerald-200 font-medium">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Acceso Administrador:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="password"
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresa tu PIN Admin"
                aria-label="PIN de Administrador"
                className="flex-1 sm:w-40 px-3 py-1.5 rounded-xl bg-[#072614] border border-emerald-500/30 text-base sm:text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="px-4 py-2 sm:py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs transition shrink-0"
              >
                Entrar
              </button>
            </div>
            {pinError && <p className="w-full text-xs text-rose-400 font-semibold">{pinError}</p>}
          </form>
        ) : (
          <div className="px-5 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Administrador Verificado
            </span>
            <button
              type="button"
              onClick={() => {
                setIsAdminUnlocked(false);
                if (activeTab === 'import' || activeTab === 'pin') setActiveTab('add');
              }}
              className="text-xs font-semibold text-emerald-200 hover:text-white underline"
            >
              Bloquear Admin
            </button>
          </div>
        )}

        {/* Pestañas */}
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 px-5 pt-3 border-b border-emerald-500/20 bg-[#051a0e]">
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {isAdminUnlocked ? 'Agregar Chip' : 'Sugerir Código'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Pendientes ({pendingList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            Agregados ({customList.length})
          </button>

          {isAdminUnlocked && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'import'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                Excel / CSV
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pin')}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'pin'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                PIN
              </button>
            </>
          )}
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4">
          {statusMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-semibold text-emerald-200 flex items-center justify-between">
              <span>{statusMsg}</span>
              <button type="button" onClick={() => setStatusMsg('')} className="text-emerald-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-xs font-semibold text-rose-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button type="button" onClick={() => setErrorMsg('')} className="text-rose-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: AGREGAR O SUGERIR CHIP */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveChip} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    Código del Chip IC *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ej. JZ008 o KMDP6001DA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#031209] border border-emerald-500/30 font-mono font-bold text-white text-base sm:text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    Fabricante / Marca
                  </label>
                  <select
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#031209] border border-emerald-500/30 text-white text-base sm:text-sm font-semibold focus:outline-none focus:border-emerald-400"
                  >
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1.5">
                  Capacidad de Almacenamiento *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {CAPACITIES.map((cap) => (
                    <button
                      type="button"
                      key={cap}
                      onClick={() => setStorage(cap)}
                      className={`py-2 rounded-xl font-extrabold text-xs border transition ${
                        storage === cap
                          ? 'bg-emerald-400 text-black border-emerald-200 shadow-lg'
                          : 'bg-[#031209] text-emerald-200 border-emerald-500/25 hover:border-emerald-400'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    Memoria RAM (Opcional)
                  </label>
                  <select
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#031209] border border-emerald-500/30 text-white text-base sm:text-sm font-semibold focus:outline-none focus:border-emerald-400"
                  >
                    {RAM_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r ? `${r} RAM` : 'Solo Almacenamiento (Sin RAM)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    Tipo de Chip
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#031209] border border-emerald-500/30 text-white text-base sm:text-sm font-semibold focus:outline-none focus:border-emerald-400"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  Notas opcionales
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Modelo o referencia..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#031209] border border-emerald-500/30 text-white text-base sm:text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isAdminUnlocked ? 'Guardar en Base de Datos Oficial' : 'Enviar Sugerencia al Admin'}
              </button>
            </form>
          )}

          {/* TAB 2: BUZÓN DE SUGERENCIAS PENDIENTES */}
          {activeTab === 'pending' && (
            <div className="space-y-2.5">
              {pendingList.length === 0 ? (
                <div className="text-center py-8 text-emerald-300/60 text-xs">
                  No hay códigos pendientes de revisión.
                </div>
              ) : (
                pendingList.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-3.5 rounded-2xl bg-[#031209] border border-emerald-500/25 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{sug.code}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                          {sug.storage}
                        </span>
                        {sug.ram && (
                          <span className="px-2 py-0.5 rounded-lg bg-white/10 text-gray-200 text-xs">
                            RAM {sug.ram}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-300/70 mt-0.5">
                        {sug.manufacturer} · {sug.type}
                      </p>
                    </div>

                    {isAdminUnlocked ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApproveSuggestion(sug)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removePendingSuggestion(sug.id);
                            refreshLists();
                          }}
                          className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-300/80 font-medium">
                        Requiere PIN
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: MIS CHIPS PERSONALIZADOS */}
          {activeTab === 'catalog' && (
            <div className="space-y-2.5">
              {customList.length === 0 ? (
                <div className="text-center py-8 text-emerald-300/60 text-xs">
                  Aún no has agregado chips personalizados manuales.
                </div>
              ) : (
                customList.map((item) => (
                  <div
                    key={item.code}
                    className="p-3 rounded-2xl bg-[#031209] border border-emerald-500/25 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{item.code}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-400 text-black font-black text-xs">
                          {item.storage}
                        </span>
                        {item.ram && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-900/60 text-emerald-200 text-xs font-semibold">
                            RAM {item.ram}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-300/70 mt-0.5">
                        {item.manufacturer} · {item.type}
                      </p>
                    </div>
                    {isAdminUnlocked && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteCustomChip(item.code);
                          refreshLists();
                        }}
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition"
                        title="Eliminar código"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: IMPORTAR / EXPORTAR EXCEL CSV */}
          {activeTab === 'import' && isAdminUnlocked && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#031209] border border-emerald-500/25 space-y-2">
                <h4 className="font-bold text-sm text-white">Pegar lista desde Excel o CSV</h4>
                <p className="text-xs text-emerald-300/70">
                  Formato por renglón: <code className="text-emerald-300">CODIGO, CAPACIDAD, MARCA, TIPO, RAM</code>
                </p>
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`JZ299, 128GB, Micron, uMCP, 6GB\nKMDP6001XX, 64GB, Samsung, eMCP, 4GB`}
                  className="w-full p-3 rounded-xl bg-[#062011] border border-emerald-500/30 font-mono text-base sm:text-xs text-white focus:outline-none focus:border-emerald-400"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" /> Importar Lista
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Descargar Excel (.CSV)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CAMBIAR PIN */}
          {activeTab === 'pin' && isAdminUnlocked && (
            <div className="p-4 rounded-2xl bg-[#031209] border border-emerald-500/25 space-y-3">
              <h4 className="font-bold text-sm text-white">Actualizar PIN de Administrador</h4>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  value={newPinValue}
                  onChange={(e) => setNewPinValue(e.target.value)}
                  placeholder="Nuevo PIN (mín. 4 dígitos)"
                  className="px-3.5 py-2 rounded-xl bg-[#062011] border border-emerald-500/30 font-mono text-base sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (setAdminPin(newPinValue)) {
                      setStatusMsg('PIN de Administrador actualizado correctamente.');
                      setNewPinValue('');
                    } else {
                      setErrorMsg('El PIN debe tener al menos 4 dígitos.');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-400 text-black font-extrabold text-xs"
                >
                  Guardar PIN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
