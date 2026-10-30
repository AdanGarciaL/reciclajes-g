import React, { useState, useEffect, useMemo } from 'react';
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
  Pencil,
  Layers,
  Search,
  Plus,
  ArrowRight,
  ClipboardCheck,
  FileCheck,
} from 'lucide-react';
import {
  getCustomDatabase,
  addOrUpdateCustomChip,
  addMultipleCustomChips,
  deleteCustomChip,
  getAllEditableCatalog,
  getPendingSuggestions,
  addPendingSuggestion,
  addMultiplePendingSuggestions,
  removePendingSuggestion,
  verifyAdminPin,
  setAdminPin,
  getDatabaseStats,
  normalizeCode,
  detectCpuInsteadOfMemory,
} from '../services/icEngine';

const CAPACITIES = ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
const RAM_OPTIONS = ['', '512MB', '1GB', '2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '24GB'];
const BRANDS = [
  'Samsung',
  'Micron',
  'SK Hynix',
  'SanDisk / WD',
  'Kioxia / Toshiba',
  'Apple / iPhone NAND',
  'Kingston',
  'FORESEE (Longsys)',
  'YMTC (Yangtze Memory)',
  'BIWIN',
  'Rayson',
  'SkyHigh / Cypress',
];
const TYPES = ['eMCP', 'uMCP', 'eMMC', 'UFS', 'NVMe NAND', 'LPDDR RAM'];

function createEmptyRow(defaultBrand = 'Samsung', defaultStorage = '64GB') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    code: '',
    storage: defaultStorage,
    manufacturer: defaultBrand,
    ram: '4GB',
    type: 'eMCP',
    notes: '',
  };
}

export default function AdminDatabaseModal({
  isOpen,
  onClose,
  initialCode = '',
  initialEditChip = null,
  onDatabaseUpdated,
}) {
  const [activeTab, setActiveTab] = useState('add');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Sub-modo en la pestaña Agregar: 'single' (1 o varios códigos iguales) | 'multi' (tabla de varios chips distintos)
  const [entryMode, setEntryMode] = useState('single');

  // Estado de edición de un chip existente
  const [editingOriginalCode, setEditingOriginalCode] = useState(null);
  const [editingPendingId, setEditingPendingId] = useState(null);
  const [originalChipData, setOriginalChipData] = useState(null);

  // Campos del formulario individual / rápido
  const [code, setCode] = useState('');
  const [storage, setStorage] = useState('64GB');
  const [ram, setRam] = useState('4GB');
  const [manufacturer, setManufacturer] = useState('Samsung');
  const [type, setType] = useState('eMCP');
  const [notes, setNotes] = useState('');

  // Filas para modo Tabla Multi-Chip
  const [multiRows, setMultiRows] = useState(() => [
    createEmptyRow('Samsung', '64GB'),
    createEmptyRow('Samsung', '128GB'),
    createEmptyRow('Micron', '64GB'),
  ]);

  // Estado de Paso de Revisión Obligatorio (Paso 2)
  const [reviewData, setReviewData] = useState(null);

  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [customList, setCustomList] = useState([]);
  const [allCatalogList, setAllCatalogList] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [stats, setStats] = useState(getDatabaseStats());

  // Filtros en pestaña Catálogo / Editar
  const [catalogViewScope, setCatalogViewScope] = useState('custom'); // 'custom' | 'all'
  const [catalogSearch, setCatalogSearch] = useState('');

  const [bulkText, setBulkText] = useState('');
  const [newPinValue, setNewPinValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      refreshLists();
      setStatusMsg('');
      setErrorMsg('');
      setPinError('');
      setReviewData(null);

      if (initialEditChip && initialEditChip.code) {
        startEditingChip(initialEditChip);
      } else if (initialCode) {
        setEditingOriginalCode(null);
        setEditingPendingId(null);
        setOriginalChipData(null);
        setEntryMode('single');
        setActiveTab('add');
        setCode(normalizeCode(initialCode));
      }
    }
  }, [isOpen, initialCode, initialEditChip]);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (reviewData) {
          setReviewData(null);
        } else {
          onClose();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, reviewData, onClose]);

  function refreshLists() {
    const custom = getCustomDatabase();
    setCustomList(custom);
    setAllCatalogList(getAllEditableCatalog());
    setPendingList(getPendingSuggestions());
    setStats(getDatabaseStats());
    if (onDatabaseUpdated) onDatabaseUpdated();
  }

  function startEditingChip(chip, pendingId = null) {
    if (!chip || !chip.code) return;
    const clean = normalizeCode(chip.code);
    setEditingOriginalCode(clean);
    setEditingPendingId(pendingId);
    setOriginalChipData({
      code: clean,
      storage: chip.storage || '64GB',
      ram: chip.ram || null,
      manufacturer: chip.manufacturer || 'Samsung',
      type: chip.type || 'eMCP',
      notes: chip.notes || '',
    });
    setEntryMode('single');
    setActiveTab('add');
    setCode(clean);
    setStorage(
      CAPACITIES.includes(String(chip.storage || '').toUpperCase())
        ? String(chip.storage).toUpperCase()
        : '64GB'
    );
    setRam(chip.ram ? String(chip.ram).toUpperCase() : '');
    const matchedBrand =
      BRANDS.find((b) => b.toLowerCase().includes(String(chip.manufacturer || '').toLowerCase())) ||
      chip.manufacturer ||
      'Samsung';
    setManufacturer(matchedBrand);
    setType(TYPES.includes(chip.type) ? chip.type : 'eMCP');
    setNotes(chip.notes || '');
    setStatusMsg('');
    setErrorMsg('');
  }

  function cancelEditing() {
    setEditingOriginalCode(null);
    setEditingPendingId(null);
    setOriginalChipData(null);
    setCode('');
    setNotes('');
    setErrorMsg('');
  }

  function handleUnlockPin(e) {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setIsAdminUnlocked(true);
      setPinError('');
      setPinInput('');
      setStatusMsg('Acceso verificado. Puedes agregar o editar chips con el paso de revisión.');
    } else {
      setPinError('Código PIN incorrecto. Se requiere autorización para continuar.');
    }
  }

  // PASO 1: Validar formulario y abrir PASO DE REVISIÓN (Individual / Edición)
  function handleProceedToReview(e) {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    if (editingOriginalCode) {
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

      setReviewData({
        type: 'edit',
        originalCode: editingOriginalCode,
        originalData: originalChipData || {
          code: editingOriginalCode,
          storage: '—',
          ram: '—',
          manufacturer: '—',
          type: '—',
        },
        payload: {
          code: cleanCode,
          storage,
          ram: ram || null,
          manufacturer,
          type,
          notes,
        },
      });
      return;
    }

    const rawTokens = String(code || '')
      .split(/[,;\s\r\n]+/)
      .map((t) => normalizeCode(t))
      .filter((t) => t.length >= 3);

    const uniqueCodes = Array.from(new Set(rawTokens));

    if (uniqueCodes.length === 0) {
      setErrorMsg('Ingresa al menos un código IC válido de 3 o más caracteres.');
      return;
    }

    for (const c of uniqueCodes) {
      const cpuCheck = detectCpuInsteadOfMemory(c);
      if (cpuCheck) {
        setErrorMsg(`${c}: ${cpuCheck.message}`);
        return;
      }
    }

    const payloadArray = uniqueCodes.map((c) => ({
      code: c,
      storage,
      ram: ram || null,
      manufacturer,
      type,
      notes,
    }));

    setReviewData({
      type: 'single',
      chips: payloadArray,
    });
  }

  // PASO 1B: Validar tabla multi-chip y abrir PASO DE REVISIÓN
  function handleProceedMultiTableToReview(e) {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    const filledRows = multiRows
      .map((r) => ({
        ...r,
        cleanCode: normalizeCode(r.code),
      }))
      .filter((r) => r.cleanCode.length >= 3);

    if (filledRows.length === 0) {
      setErrorMsg('Escribe al menos un código IC válido (mínimo 3 caracteres) en la tabla.');
      return;
    }

    for (const r of filledRows) {
      const cpuCheck = detectCpuInsteadOfMemory(r.cleanCode);
      if (cpuCheck) {
        setErrorMsg(`Fila ${r.cleanCode}: ${cpuCheck.message}`);
        return;
      }
    }

    const chipsToSave = filledRows.map((r) => ({
      code: r.cleanCode,
      storage: r.storage,
      ram: r.ram || null,
      manufacturer: r.manufacturer,
      type: r.type,
      notes: r.notes || '',
    }));

    setReviewData({
      type: 'multi',
      chips: chipsToSave,
    });
  }

  // PASO 2A: Confirmar revisión y APROBAR DIRECTO en Base Oficial
  function handleConfirmAndApplyOfficial() {
    if (!reviewData) return;

    if (reviewData.type === 'edit') {
      addOrUpdateCustomChip(reviewData.payload, reviewData.originalCode);
      if (editingPendingId) {
        removePendingSuggestion(editingPendingId);
      }
      setStatusMsg(`Revisión aprobada: Chip ${reviewData.payload.code} actualizado en la Base Oficial.`);
      setEditingOriginalCode(null);
      setEditingPendingId(null);
      setOriginalChipData(null);
      setCode('');
      setNotes('');
    } else if (reviewData.type === 'single' || reviewData.type === 'multi') {
      const count = addMultipleCustomChips(reviewData.chips);
      setStatusMsg(`Revisión aprobada: ${count} chip(s) guardados en la Base Oficial.`);
      setCode('');
      setNotes('');
      setMultiRows([
        createEmptyRow('Samsung', '64GB'),
        createEmptyRow('Samsung', '128GB'),
        createEmptyRow('Micron', '64GB'),
      ]);
    } else if (reviewData.type === 'import') {
      const count = addMultipleCustomChips(reviewData.chips);
      setStatusMsg(`Revisión aprobada: ${count} chip(s) importados en la Base Oficial.`);
      setBulkText('');
    }

    setReviewData(null);
    refreshLists();
  }

  // PASO 2B: Guardar en Buzón de Revisión (Pendiente para verificación posterior)
  function handleSendToPendingReview() {
    if (!reviewData) return;

    if (reviewData.type === 'edit') {
      addPendingSuggestion({
        ...reviewData.payload,
        isEdit: true,
        originalCode: reviewData.originalCode,
        originalData: reviewData.originalData,
      });
      setStatusMsg(`Edición de ${reviewData.payload.code} guardada en Buzón de Revisión pendiente.`);
      setEditingOriginalCode(null);
      setEditingPendingId(null);
      setOriginalChipData(null);
      setCode('');
      setNotes('');
    } else if (reviewData.type === 'single' || reviewData.type === 'multi') {
      const count = addMultiplePendingSuggestions(reviewData.chips);
      setStatusMsg(`${count} chip(s) guardados en el Buzón de Revisión pendiente.`);
      setCode('');
      setNotes('');
    } else if (reviewData.type === 'import') {
      const count = addMultiplePendingSuggestions(reviewData.chips);
      setStatusMsg(`${count} chip(s) de la lista enviados al Buzón de Revisión.`);
      setBulkText('');
    }

    setReviewData(null);
    refreshLists();
  }

  function updateMultiRow(id, field, value) {
    setMultiRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  function removeMultiRow(id) {
    setMultiRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function addMoreRows(count = 1) {
    setMultiRows((prev) => {
      const last = prev[prev.length - 1] || { manufacturer: 'Samsung', storage: '64GB' };
      const added = Array.from({ length: count }, () =>
        createEmptyRow(last.manufacturer, last.storage)
      );
      return [...prev, ...added];
    });
  }

  function handleApproveSuggestion(sug) {
    if (sug.isEdit && sug.originalCode) {
      addOrUpdateCustomChip(
        {
          code: sug.code,
          storage: sug.storage,
          ram: sug.ram || null,
          manufacturer: sug.manufacturer,
          type: sug.type,
          notes: sug.notes,
        },
        sug.originalCode
      );
    } else {
      addOrUpdateCustomChip({
        code: sug.code,
        storage: sug.storage,
        ram: sug.ram || null,
        manufacturer: sug.manufacturer,
        type: sug.type,
        notes: sug.notes,
      });
    }
    removePendingSuggestion(sug.id);
    refreshLists();
    setStatusMsg(`Revisión concluida: Código ${sug.code} aprobado y activo.`);
  }

  function handleApproveAllSuggestions() {
    if (pendingList.length === 0) return;
    for (const sug of pendingList) {
      if (sug.isEdit && sug.originalCode) {
        addOrUpdateCustomChip(
          {
            code: sug.code,
            storage: sug.storage,
            ram: sug.ram || null,
            manufacturer: sug.manufacturer,
            type: sug.type,
            notes: sug.notes,
          },
          sug.originalCode
        );
      } else {
        addOrUpdateCustomChip({
          code: sug.code,
          storage: sug.storage,
          ram: sug.ram || null,
          manufacturer: sug.manufacturer,
          type: sug.type,
          notes: sug.notes,
        });
      }
      removePendingSuggestion(sug.id);
    }
    refreshLists();
    setStatusMsg(`Se revisaron y aprobaron los ${pendingList.length} registros pendientes.`);
  }

  function handleBulkImportProceed() {
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

    const parsedChips = [];
    let skipped = 0;

    for (const line of lines) {
      let parts = line.split(/[,;\t]+/).map((p) => p.trim()).filter(Boolean);
      if (parts.length === 1 && /\s+/.test(line)) {
        parts = line.split(/\s+/).map((p) => p.trim()).filter(Boolean);
      }

      if (parts.length >= 2) {
        const [c, cap, brand, tp, rm] = parts;
        const cleanC = normalizeCode(c);
        const cleanCap = String(cap || '64GB').toUpperCase().trim();
        const normalizedCap = /^\d+$/.test(cleanCap) ? `${cleanCap}GB` : cleanCap;

        if (cleanC && cleanC.length >= 3 && cleanC !== 'CODIGO' && cleanC !== 'CODE') {
          parsedChips.push({
            code: cleanC,
            storage: normalizedCap || '64GB',
            manufacturer: brand || 'Samsung',
            type: tp || 'eMCP',
            ram: rm || null,
          });
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    if (parsedChips.length === 0) {
      setErrorMsg('No se encontraron renglones válidos. Usa el formato: CODIGO, CAPACIDAD, MARCA');
      return;
    }

    setReviewData({
      type: 'import',
      chips: parsedChips,
      skipped,
    });
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

  // Lista filtrada para la pestaña Catálogo / Editar
  const displayedCatalog = useMemo(() => {
    const sourceList =
      catalogViewScope === 'all' ||
      (catalogViewScope === 'custom' && customList.length === 0 && catalogSearch.trim())
        ? allCatalogList
        : customList.map((c) => ({ ...c, isCustom: true }));

    const q = catalogSearch.trim().toUpperCase();
    if (!q) return sourceList.slice(0, 120);

    return sourceList
      .filter((item) => {
        const codeMatch = String(item.code || '').toUpperCase().includes(q);
        const brandMatch = String(item.manufacturer || '').toUpperCase().includes(q);
        const capMatch = String(item.storage || '').toUpperCase().includes(q);
        const notesMatch = String(item.notes || '').toUpperCase().includes(q);
        return codeMatch || brandMatch || capMatch || notesMatch;
      })
      .slice(0, 120);
  }, [catalogViewScope, customList, allCatalogList, catalogSearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Administración y Edición de Base de Datos"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#062011] border border-emerald-500/35 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Superior */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-emerald-500/20 bg-[#04160b]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span>Gestión y Edición de Chips IC</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {stats.totalOfflineCount.toLocaleString()}
                </span>
              </h3>
              <p className="text-xs text-emerald-300/75 truncate">
                {isAdminUnlocked
                  ? 'PIN Verificado — Edición y altas protegidas con revisión obligatoria'
                  : 'Acceso Protegido — Se requiere PIN para editar o agregar información'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            CASO 1: BLOQUEO POR PIN (OBLIGATORIO PARA CUALQUIER ALTA O EDICIÓN)
           ========================================================================= */}
        {!isAdminUnlocked ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border-2 border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg sm:text-xl font-black text-white">
                Se Requiere PIN de Autorización
              </h4>
              <p className="text-xs sm:text-sm text-emerald-200/80 max-w-md mx-auto">
                {editingOriginalCode
                  ? `Para editar el chip "${editingOriginalCode}", debes ingresar primero el PIN de Administrador.`
                  : 'Para agregar nuevos chips o modificar información del catálogo, ingresa el código PIN de autorización.'}
              </p>
            </div>

            <form onSubmit={handleUnlockPin} className="w-full max-w-xs space-y-3 pt-2">
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Código PIN"
                aria-label="Código PIN de Administrador"
                className="w-full px-4 py-3 rounded-2xl bg-[#031209] border-2 border-emerald-500/40 text-center font-mono font-black text-xl text-white tracking-widest focus:outline-none focus:border-emerald-400 placeholder:text-gray-500 placeholder:font-sans placeholder:text-sm"
              />
              {pinError && (
                <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 font-bold">
                  {pinError}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs shadow-lg transition"
                >
                  Desbloquear
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* =========================================================================
             CASO 2: SESIÓN DESBLOQUEADA CON PIN
             ========================================================================= */
          <>
            {/* Barra de Sesión Admin Verificada */}
            <div className="px-4 sm:px-5 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                PIN Verificado — Cada alta o edición pasará por un paso de revisión antes de aplicar
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAdminUnlocked(false);
                  setReviewData(null);
                }}
                className="text-xs font-semibold text-emerald-200 hover:text-white underline shrink-0"
              >
                Bloquear
              </button>
            </div>

            {/* Pestañas de Navegación */}
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 px-4 sm:px-5 pt-3 border-b border-emerald-500/20 bg-[#051a0e]">
              <button
                type="button"
                onClick={() => {
                  setReviewData(null);
                  setActiveTab('add');
                }}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {editingOriginalCode ? (
                  <Pencil className="w-4 h-4 text-amber-400" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
                {editingOriginalCode ? `Editando: ${editingOriginalCode}` : 'Agregar Chips'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setReviewData(null);
                  setActiveTab('catalog');
                }}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'catalog'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar / Catálogo ({customList.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setReviewData(null);
                  setActiveTab('pending');
                }}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Inbox className="w-4 h-4" />
                Buzón de Revisión ({pendingList.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setReviewData(null);
                  setActiveTab('import');
                }}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'import'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                Pegar Lista / Excel
              </button>

              <button
                type="button"
                onClick={() => {
                  setReviewData(null);
                  setActiveTab('pin');
                }}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'pin'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                PIN
              </button>
            </div>

            {/* Contenedor de Contenido Principal */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {statusMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-semibold text-emerald-200 flex items-center justify-between gap-2">
                  <span>{statusMsg}</span>
                  <button
                    type="button"
                    onClick={() => setStatusMsg('')}
                    className="text-emerald-300 hover:text-white"
                  >
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
                  <button
                    type="button"
                    onClick={() => setErrorMsg('')}
                    className="text-rose-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* =========================================================================
                  PASO 2: PANTALLA DE REVISIÓN OBLIGATORIA ("Y DESPUÉS UNA REVISIÓN")
                 ========================================================================= */}
              {reviewData ? (
                <div className="p-5 rounded-3xl bg-[#031209] border-2 border-emerald-400/40 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-400 text-black">
                        <ClipboardCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">
                          Paso 2: Revisión de Información
                        </h4>
                        <p className="text-xs text-emerald-300/80">
                          Verifica minuciosamente los datos antes de aplicar a la base oficial.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewData(null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comparativa si es Edición de un Chip Existente */}
                  {reviewData.type === 'edit' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 font-semibold">
                        Modificando chip existente:{' '}
                        <strong className="font-mono text-white underline">
                          {reviewData.originalCode}
                        </strong>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Columna Antes */}
                        <div className="p-3.5 rounded-2xl bg-[#081f12] border border-white/10 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            Información Anterior
                          </span>
                          <div className="space-y-1.5 text-xs font-mono">
                            <p className="text-gray-300">
                              Código:{' '}
                              <strong className="text-white">
                                {reviewData.originalData.code}
                              </strong>
                            </p>
                            <p className="text-gray-300">
                              Capacidad:{' '}
                              <span className="px-2 py-0.5 rounded bg-black/40 text-gray-200 font-bold border border-white/10">
                                {reviewData.originalData.storage}
                              </span>
                            </p>
                            <p className="text-gray-300">
                              Marca:{' '}
                              <span className="text-white">
                                {reviewData.originalData.manufacturer}
                              </span>
                            </p>
                            <p className="text-gray-300">
                              RAM:{' '}
                              <span className="text-white">
                                {reviewData.originalData.ram || 'Sin RAM'}
                              </span>
                            </p>
                            <p className="text-gray-300">
                              Tipo:{' '}
                              <span className="text-white">
                                {reviewData.originalData.type}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Columna Después (Nueva Información) */}
                        <div className="p-3.5 rounded-2xl bg-[#082816] border-2 border-emerald-400/50 space-y-2 shadow-lg">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Nueva Información Revisada
                          </span>
                          <div className="space-y-1.5 text-xs font-mono">
                            <p className="text-emerald-100 flex items-center gap-1">
                              Código:{' '}
                              <strong className="text-white underline">
                                {reviewData.payload.code}
                              </strong>
                              {reviewData.payload.code !== reviewData.originalCode && (
                                <span className="text-[10px] text-amber-300 font-sans font-bold">
                                  (Renombrado)
                                </span>
                              )}
                            </p>
                            <p className="text-emerald-100 flex items-center gap-1.5">
                              Capacidad:{' '}
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-400 text-black font-black text-sm shadow">
                                {reviewData.payload.storage}
                              </span>
                            </p>
                            <p className="text-emerald-100">
                              Marca:{' '}
                              <strong className="text-white">
                                {reviewData.payload.manufacturer}
                              </strong>
                            </p>
                            <p className="text-emerald-100">
                              RAM:{' '}
                              <strong className="text-emerald-300">
                                {reviewData.payload.ram || 'Sin RAM'}
                              </strong>
                            </p>
                            <p className="text-emerald-100">
                              Tipo:{' '}
                              <strong className="text-white">
                                {reviewData.payload.type}
                              </strong>
                            </p>
                            {reviewData.payload.notes && (
                              <p className="text-emerald-200/80 text-[11px] font-sans">
                                Notas: {reviewData.payload.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detalle si es Alta de Chip(s) Nuevos */}
                  {(reviewData.type === 'single' ||
                    reviewData.type === 'multi' ||
                    reviewData.type === 'import') && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-xs text-emerald-200">
                        Se registrarán{' '}
                        <strong className="text-white">{reviewData.chips.length}</strong> chip(s)
                        nuevos tras tu revisión:
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {reviewData.chips.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-[#081f12] border border-emerald-500/20 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="font-mono font-bold text-white text-sm">
                                {c.code}
                              </div>
                              <div className="text-xs text-emerald-300/70">
                                {c.manufacturer} · {c.type} {c.ram ? `· RAM ${c.ram}` : ''}
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-emerald-400 text-black font-black text-xs">
                              {c.storage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones de Acción de la Revisión */}
                  <div className="pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => setReviewData(null)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition text-center"
                    >
                      ← Regresar a Corregir
                    </button>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleSendToPendingReview}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold text-xs border border-amber-400/30 transition text-center"
                        title="Guardar en buzón para que sea revisado más tarde"
                      >
                        Enviar a Buzón de Revisión
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmAndApplyOfficial}
                        className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5"
                      >
                        <FileCheck className="w-4 h-4" />
                        Revisión Concluida: Aprobar y Guardar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* =========================================================================
                   PESTAÑAS DE CONTENIDO CUANDO NO ESTÁ ACTIVA LA PREVISUALIZACIÓN DE REVISIÓN
                   ========================================================================= */
                <>
                  {/* TAB 1: FORMULARIO DE ALTA O EDICIÓN */}
                  {activeTab === 'add' && (
                    <div className="space-y-4">
                      {/* Banner si estamos editando un chip */}
                      {editingOriginalCode ? (
                        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-amber-300 shrink-0" />
                            <div>
                              <p className="text-xs font-extrabold text-amber-200">
                                Modo Edición — Chip original:{' '}
                                <span className="font-mono underline">
                                  {editingOriginalCode}
                                </span>
                              </p>
                              <p className="text-[11px] text-amber-100/80">
                                Realiza tus modificaciones y pulsa en &ldquo;Continuar a
                                Revisión&rdquo; para validar los cambios.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-amber-200 text-xs font-bold border border-amber-400/30"
                          >
                            Cancelar edición
                          </button>
                        </div>
                      ) : (
                        /* Selector Rápido vs Tabla Multi-Chip */
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#031209] p-2 rounded-2xl border border-emerald-500/20">
                          <span className="text-xs font-bold text-emerald-200 px-2">
                            ¿Cómo deseas agregar?
                          </span>
                          <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setEntryMode('single')}
                              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                                entryMode === 'single'
                                  ? 'bg-emerald-400 text-black shadow'
                                  : 'bg-[#072314] text-emerald-200 hover:text-white'
                              }`}
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              Rápido (1 o varios iguales)
                            </button>
                            <button
                              type="button"
                              onClick={() => setEntryMode('multi')}
                              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                                entryMode === 'multi'
                                  ? 'bg-emerald-400 text-black shadow'
                                  : 'bg-[#072314] text-emerald-200 hover:text-white'
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5" />
                              Varios Chips Distintos (Tabla)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* MODO A: FORMULARIO INDIVIDUAL O VARIOS CÓDIGOS IGUALES */}
                      {(entryMode === 'single' || editingOriginalCode) && (
                        <form onSubmit={handleProceedToReview} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-emerald-300 mb-1">
                                {editingOriginalCode
                                  ? 'Código del Chip IC *'
                                  : 'Código(s) del Chip IC * (puedes separar varios con coma)'}
                              </label>
                              <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder={
                                  editingOriginalCode
                                    ? 'Ej. KMDP6001DA'
                                    : 'Ej. JZ008  ó  JZ008, JZ009, JZ010'
                                }
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
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
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
                            className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <ArrowRight className="w-4 h-4" />
                            {editingOriginalCode
                              ? 'Continuar a Revisión de Cambios'
                              : 'Continuar a Revisión del Chip'}
                          </button>
                        </form>
                      )}

                      {/* MODO B: TABLA MULTI-CHIP */}
                      {entryMode === 'multi' && !editingOriginalCode && (
                        <form onSubmit={handleProceedMultiTableToReview} className="space-y-3">
                          <div className="p-3 rounded-2xl bg-[#031209] border border-emerald-500/20 text-xs text-emerald-200/90 flex flex-wrap items-center justify-between gap-2">
                            <span>
                              Llena los chips que deseas ingresar y pasa a la pantalla de revisión:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => addMoreRows(1)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1 border border-emerald-500/30"
                              >
                                <Plus className="w-3.5 h-3.5" /> +1 renglón
                              </button>
                              <button
                                type="button"
                                onClick={() => addMoreRows(5)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1 border border-emerald-500/30"
                              >
                                <Plus className="w-3.5 h-3.5" /> +5 renglones
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2.5 max-h-[44dvh] overflow-y-auto pr-1">
                            {multiRows.map((row, index) => (
                              <div
                                key={row.id}
                                className="p-3 rounded-2xl bg-[#031209] border border-emerald-500/25 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                              >
                                <div className="sm:col-span-4 flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-emerald-400/70 w-5 shrink-0">
                                    #{index + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={row.code}
                                    onChange={(e) =>
                                      updateMultiRow(row.id, 'code', e.target.value.toUpperCase())
                                    }
                                    placeholder="Código IC (ej. JZ008)"
                                    className="w-full px-3 py-2 rounded-xl bg-[#072414] border border-emerald-500/30 font-mono font-bold text-white text-base sm:text-xs focus:outline-none focus:border-emerald-400"
                                  />
                                </div>

                                <div className="grid grid-cols-2 sm:col-span-5 gap-2">
                                  <select
                                    value={row.storage}
                                    onChange={(e) =>
                                      updateMultiRow(row.id, 'storage', e.target.value)
                                    }
                                    aria-label="Capacidad"
                                    className="px-2.5 py-2 rounded-xl bg-[#072414] border border-emerald-500/30 text-emerald-300 font-extrabold text-base sm:text-xs focus:outline-none focus:border-emerald-400"
                                  >
                                    {CAPACITIES.map((c) => (
                                      <option key={c} value={c}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>

                                  <select
                                    value={row.manufacturer}
                                    onChange={(e) =>
                                      updateMultiRow(row.id, 'manufacturer', e.target.value)
                                    }
                                    aria-label="Marca"
                                    className="px-2.5 py-2 rounded-xl bg-[#072414] border border-emerald-500/30 text-white font-semibold text-base sm:text-xs focus:outline-none focus:border-emerald-400"
                                  >
                                    {BRANDS.map((b) => (
                                      <option key={b} value={b}>
                                        {b}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-center gap-2 sm:col-span-3">
                                  <select
                                    value={row.ram}
                                    onChange={(e) =>
                                      updateMultiRow(row.id, 'ram', e.target.value)
                                    }
                                    aria-label="RAM"
                                    className="flex-1 px-2.5 py-2 rounded-xl bg-[#072414] border border-emerald-500/30 text-gray-200 font-semibold text-base sm:text-xs focus:outline-none focus:border-emerald-400"
                                  >
                                    {RAM_OPTIONS.map((r) => (
                                      <option key={r} value={r}>
                                        {r ? `RAM ${r}` : 'Sin RAM'}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => removeMultiRow(row.id)}
                                    disabled={multiRows.length <= 1}
                                    title="Quitar renglón"
                                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 disabled:opacity-30 transition shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Continuar a Revisión de la Lista Multi-Chip
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* TAB 2: EDITAR / CATÁLOGO */}
                  {activeTab === 'catalog' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-[#031209] border border-emerald-500/25 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setCatalogViewScope('custom')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                                catalogViewScope === 'custom'
                                  ? 'bg-emerald-400 text-black'
                                  : 'bg-[#072414] text-emerald-200 hover:text-white'
                              }`}
                            >
                              Mis Agregados / Editados ({customList.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setCatalogViewScope('all')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                                catalogViewScope === 'all'
                                  ? 'bg-emerald-400 text-black'
                                  : 'bg-[#072414] text-emerald-200 hover:text-white'
                              }`}
                            >
                              Todo el Catálogo ({allCatalogList.length})
                            </button>
                          </div>

                          {customList.length > 0 && (
                            <button
                              type="button"
                              onClick={handleExportCsv}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> Exportar CSV
                            </button>
                          )}
                        </div>

                        <div className="relative">
                          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                            placeholder="Buscar chip por código, marca o capacidad para editar..."
                            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#072414] border border-emerald-500/30 font-mono text-base sm:text-xs text-white focus:outline-none focus:border-emerald-400"
                          />
                          {catalogSearch && (
                            <button
                              type="button"
                              onClick={() => setCatalogSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {displayedCatalog.length === 0 ? (
                        <div className="text-center py-8 px-4 rounded-2xl bg-[#031209] border border-emerald-500/20 space-y-2">
                          <p className="text-emerald-300/80 text-xs font-semibold">
                            {catalogViewScope === 'custom' && !catalogSearch
                              ? 'Aún no has agregado ni editado chips manuales.'
                              : 'No se encontraron chips con esa búsqueda.'}
                          </p>
                          {catalogViewScope === 'custom' && (
                            <button
                              type="button"
                              onClick={() => setCatalogViewScope('all')}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30"
                            >
                              Ver y editar chips de Todo el Catálogo ({allCatalogList.length})
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[46dvh] overflow-y-auto pr-1">
                          {displayedCatalog.map((item) => (
                            <div
                              key={item.code}
                              className="p-3 rounded-2xl bg-[#031209] border border-emerald-500/25 flex items-center justify-between gap-2.5"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-white text-sm break-all">
                                    {item.code}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-400 text-black font-black text-xs">
                                    {item.storage}
                                  </span>
                                  {item.ram && (
                                    <span className="px-2 py-0.5 rounded-lg bg-emerald-900/60 text-emerald-200 text-xs font-semibold">
                                      RAM {item.ram}
                                    </span>
                                  )}
                                  {item.isCustom && (
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                                      Editado / Propio
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-emerald-300/70 mt-0.5">
                                  {item.manufacturer} · {item.type}
                                  {item.notes ? ` · ${item.notes}` : ''}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => startEditingChip(item)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-400 hover:text-black text-emerald-300 font-extrabold text-xs border border-emerald-500/35 transition flex items-center gap-1.5"
                                  title="Editar este chip"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>

                                {item.isCustom && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteCustomChip(item.code);
                                      refreshLists();
                                      setStatusMsg(`Chip personalizado ${item.code} eliminado.`);
                                    }}
                                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition"
                                    title="Eliminar código personalizado"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: BUZÓN DE REVISIÓN Y APROBACIÓN */}
                  {activeTab === 'pending' && (
                    <div className="space-y-2.5">
                      {pendingList.length > 1 && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleApproveAllSuggestions}
                            className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center gap-1.5 shadow"
                          >
                            <Check className="w-4 h-4" /> Aprobar todos tras revisión ({pendingList.length})
                          </button>
                        </div>
                      )}

                      {pendingList.length === 0 ? (
                        <div className="text-center py-8 text-emerald-300/60 text-xs">
                          No hay códigos pendientes de revisión en el buzón.
                        </div>
                      ) : (
                        pendingList.map((sug) => (
                          <div
                            key={sug.id}
                            className="p-3.5 rounded-2xl bg-[#031209] border border-emerald-500/25 flex items-center justify-between gap-3 flex-wrap"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-white text-sm">
                                  {sug.code}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                                  {sug.storage}
                                </span>
                                {sug.ram && (
                                  <span className="px-2 py-0.5 rounded-lg bg-white/10 text-gray-200 text-xs">
                                    RAM {sug.ram}
                                  </span>
                                )}
                                {sug.isEdit && (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                                    Edición de: {sug.originalCode}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-emerald-300/70 mt-0.5">
                                {sug.manufacturer} · {sug.type}
                                {sug.originalData && sug.originalData.storage !== sug.storage && (
                                  <span className="text-amber-300 font-medium ml-1">
                                    (Cambia de {sug.originalData.storage} a {sug.storage})
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleApproveSuggestion(sug)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditingChip(sug, sug.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-bold text-xs flex items-center gap-1"
                                title="Editar antes de aprobar"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  removePendingSuggestion(sug.id);
                                  refreshLists();
                                }}
                                className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                                title="Rechazar y eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 4: IMPORTAR / EXPORTAR EXCEL CSV */}
                  {activeTab === 'import' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[#031209] border border-emerald-500/25 space-y-2.5">
                        <h4 className="font-bold text-sm text-white">
                          Pegar lista masiva desde Excel, WhatsApp o Bloc de Notas
                        </h4>
                        <p className="text-xs text-emerald-300/75">
                          Escribe un chip por renglón:{' '}
                          <code className="text-emerald-300">
                            CODIGO, CAPACIDAD, MARCA, TIPO, RAM
                          </code>{' '}
                          (o simplemente <code className="text-emerald-300">CODIGO 64GB</code>).
                          Al pulsar continuar se abrirá la pantalla de revisión.
                        </p>
                        <textarea
                          rows={5}
                          value={bulkText}
                          onChange={(e) => setBulkText(e.target.value)}
                          placeholder={`JZ299, 128GB, Micron, uMCP, 6GB\nKMDP6001XX, 64GB, Samsung, eMCP, 4GB\nH9HQ15AECMBDAR, 128GB, SK Hynix`}
                          className="w-full p-3 rounded-xl bg-[#062011] border border-emerald-500/30 font-mono text-base sm:text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleBulkImportProceed}
                            className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs flex items-center gap-1.5"
                          >
                            <ArrowRight className="w-4 h-4" /> Continuar a Revisión de la Lista
                          </button>
                          <button
                            type="button"
                            onClick={handleExportCsv}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5"
                          >
                            <Download className="w-4 h-4" /> Descargar Respaldo (.CSV)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: ACTUALIZAR PIN */}
                  {activeTab === 'pin' && (
                    <div className="p-4 rounded-2xl bg-[#031209] border border-emerald-500/25 space-y-3">
                      <h4 className="font-bold text-sm text-white">
                        Actualizar PIN de Administrador
                      </h4>
                      <p className="text-xs text-emerald-300/70">
                        Este PIN es requerido obligatoriamente para agregar chips o editar la
                        información de la base de datos.
                      </p>
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
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
