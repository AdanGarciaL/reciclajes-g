import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  VolumeX,
  Database,
  Plus,
  Cpu,
  X,
  CheckCircle2,
  Table2,
  Eye,
  PackageCheck,
  AlertTriangle,
  Download,
  Smartphone,
  Share,
  ArrowLeft,
  Pencil,
} from 'lucide-react';
import {
  decodeChipOffline,
  searchChipsInstant,
  lookupOnlineFallbackAndLearn,
  getDatabaseStats,
  normalizeCode,
  detectCpuInsteadOfMemory,
  capacityToGbNumber,
  safeGetStorage,
  safeSetStorage,
} from './services/icEngine';
import { QUICK_PREFIXES, SEED_IC_CATALOG } from './data/seedCatalog';
import { speakChipResult, playDetectionBeep } from './services/voiceService';
import AdminDatabaseModal from './components/AdminDatabaseModal';
import BatchCounterPanel, { normalizeBucketKey } from './components/BatchCounterPanel';
import BrandTablesView, { highlightCodeDifference } from './components/BrandTablesView';
import VisualTutorialView from './components/VisualTutorialView';

const TEXT_SCALE_OPTIONS = [
  { id: 'normal', shortLabel: 'A', fullLabel: 'Letra Estándar' },
  { id: 'large', shortLabel: 'A+', fullLabel: 'Letra Grande' },
  { id: 'xlarge', shortLabel: 'A++', fullLabel: 'Letra Extra Grande' },
];

function getCapacityTheme(storageStr) {
  const s = String(storageStr || '').toUpperCase().trim();
  const num = parseInt(s.replace(/\D/g, ''), 10) || 0;
  if (s.includes('TB') || num >= 512) {
    return {
      badge: 'bg-rose-500 text-white border-rose-300',
      card: 'border-rose-500/60 bg-[#071d11]',
    };
  }
  if (num === 256) {
    return {
      badge: 'bg-purple-500 text-white border-purple-300',
      card: 'border-purple-500/60 bg-[#071d11]',
    };
  }
  if (num === 128) {
    return {
      badge: 'bg-amber-400 text-black border-amber-200',
      card: 'border-amber-400/65 bg-[#071d11]',
    };
  }
  if (num === 64) {
    return {
      badge: 'bg-emerald-400 text-black border-emerald-200',
      card: 'border-emerald-400/70 bg-[#071d11]',
    };
  }
  if (num === 32) {
    return {
      badge: 'bg-cyan-400 text-black border-cyan-200',
      card: 'border-cyan-400/60 bg-[#071d11]',
    };
  }
  return {
    badge: 'bg-sky-400 text-black border-sky-200',
    card: 'border-sky-400/60 bg-[#071d11]',
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('search');

  const [query, setQuery] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return (params.get('q') || '').toUpperCase().trim();
    } catch {
      return '';
    }
  });
  const [activeResult, setActiveResult] = useState(null);
  const [cpuWarning, setCpuWarning] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  // Detección de teclado móvil (Android / iPhone) para que nunca tape la capacidad
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [textScale, setTextScale] = useState(() => {
    try {
      const saved = localStorage.getItem('eco_text_scale_v1');
      if (saved === 'normal' || saved === 'large' || saved === 'xlarge') return saved;
    } catch {
      // ignore
    }
    return 'normal';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-text-scale', textScale);
      localStorage.setItem('eco_text_scale_v1', textScale);
    } catch {
      // ignore
    }
  }, [textScale]);

  // Detectar apertura de teclado virtual en iOS y Android mediante visualViewport
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const initialHeight = window.innerHeight;

    function handleViewportResize() {
      const heightDiff = initialHeight - vv.height;
      setIsKeyboardOpen(heightDiff > 130);
    }

    vv.addEventListener('resize', handleViewportResize);
    return () => vv.removeEventListener('resize', handleViewportResize);
  }, []);

  function handleSelectTextScale(nextScale) {
    setTextScale(nextScale);
    const found = TEXT_SCALE_OPTIONS.find((o) => o.id === nextScale);
    if (found) {
      setToastMsg(found.fullLabel);
      setTimeout(() => setToastMsg(''), 1500);
    }
  }

  const [recentHistory, setRecentHistory] = useState(() => {
    const saved = safeGetStorage('eco_recent_history_v1', null);
    if (Array.isArray(saved) && saved.length > 0) {
      return saved.map((x) => ({
        ...x,
        storage: x.storage || x.capacity || '64GB',
        manufacturer: x.manufacturer || x.brand || 'Samsung',
      }));
    }
    return SEED_IC_CATALOG.slice(0, 6).map((x) => ({
      ...x,
      storage: x.storage || x.capacity,
      manufacturer: x.manufacturer || x.brand,
    }));
  });

  const [batchCounts, setBatchCounts] = useState(() =>
    safeGetStorage('eco_batch_counts_v1', {
      '16GB': 0,
      '32GB': 0,
      '64GB': 0,
      '128GB': 0,
      '256GB': 0,
      '512GB+': 0,
    })
  );
  const [clientName, setClientName] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [editingChipTarget, setEditingChipTarget] = useState(null);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [dbStats, setDbStats] = useState(() => getDatabaseStats());

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  });
  const [isIOS] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  });
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installPlatformTab, setInstallPlatformTab] = useState(() => {
    if (typeof navigator === 'undefined') return 'android';
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'pc';
  });
  const [cookieAccepted, setCookieAccepted] = useState(() => {
    try {
      return Boolean(localStorage.getItem('eco_cookie_notice_accepted_v1'));
    } catch {
      return true;
    }
  });

  function handleAcceptCookies(mode = 'accepted') {
    try {
      localStorage.setItem('eco_cookie_notice_accepted_v1', mode);
    } catch {
      // ignore
    }
    setCookieAccepted(true);
  }

  function openAddModal() {
    setEditingChipTarget(null);
    setIsAdminOpen(true);
  }

  function openEditChipModal(chip) {
    if (!chip) return;
    setEditingChipTarget(chip);
    setIsAdminOpen(true);
  }

  const inputRef = useRef(null);
  const scannerTopRef = useRef(null);
  const lastSpokenCodeRef = useRef('');

  const totalBatchPieces = Object.values(batchCounts).reduce((acc, v) => acc + (v || 0), 0);

  useEffect(() => {
    function onBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    function onAppInstalled() {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsInstallModalOpen(false);
      setToastMsg('Aplicación instalada');
      setTimeout(() => setToastMsg(''), 2500);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('instalar') === '1' && !isStandalone) {
        setIsInstallModalOpen(true);
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [isStandalone]);

  async function handleInstallClick() {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
        return;
      } catch {
        // fallback to modal
      }
    }
    setIsInstallModalOpen(true);
  }

  useEffect(() => {
    safeSetStorage('eco_batch_counts_v1', batchCounts);
  }, [batchCounts]);

  useEffect(() => {
    const clean = normalizeCode(query);
    if (!clean || clean.length < 2) {
      setActiveResult(null);
      setCpuWarning(null);
      setSuggestions([]);
      setIsSearchingOnline(false);
      lastSpokenCodeRef.current = '';
      return;
    }

    const cpuDetected = detectCpuInsteadOfMemory(clean);
    setCpuWarning(cpuDetected);

    const instantList = searchChipsInstant(clean, 8);
    setSuggestions(instantList);

    const direct = decodeChipOffline(clean);
    if (direct) {
      if (direct.isPureDram || (!direct.storage && direct.ram)) {
        setActiveResult(null);
        setCpuWarning({
          isCpuWarning: true,
          isRamOnlyWarning: true,
          wrongChipCategory: 'RAM_ONLY',
          code: direct.code || clean,
          cpuBrand: direct.manufacturer || 'DRAM',
          cpuType: `Chip de pura RAM (${direct.ram || 'LPDDR'})`,
          ramDetected: direct.ram,
        });
        setIsSearchingOnline(false);
        return;
      }

      if (direct.storage) {
        setActiveResult(direct);
        setIsSearchingOnline(false);

        const isStrongMatch =
          normalizeCode(direct.code) === clean ||
          normalizeCode(direct.partNumber) === clean ||
          Boolean(direct.correctedTo) ||
          (clean.length >= 5 && !direct.matchedFromPartial);

        if (isStrongMatch && lastSpokenCodeRef.current !== `${clean}:${direct.storage}`) {
          lastSpokenCodeRef.current = `${clean}:${direct.storage}`;
          playDetectionBeep(direct.storage);
          speakChipResult(direct, voiceEnabled, false);
          pushToRecent(direct);
        }
        return;
      }
    }

    setActiveResult(null);
    if (clean.length >= 4 && !cpuDetected) {
      let cancelled = false;
      setIsSearchingOnline(true);
      const timer = setTimeout(async () => {
        const learned = await lookupOnlineFallbackAndLearn(clean);
        if (!cancelled) {
          setIsSearchingOnline(false);
          if (learned && learned.storage) {
            setActiveResult(learned);
            setDbStats(getDatabaseStats());
            playDetectionBeep(learned.storage);
            speakChipResult(learned, voiceEnabled, false);
            pushToRecent(learned);
          }
        }
      }, 280);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
  }, [query, catalogVersion]);

  function pushToRecent(chip) {
    if (!chip || !chip.code) return;
    const normalizedChip = {
      ...chip,
      storage: chip.storage || chip.capacity || '64GB',
      manufacturer: chip.manufacturer || chip.brand || 'Samsung',
    };
    setRecentHistory((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const filtered = list.filter((x) => normalizeCode(x.code) !== normalizeCode(normalizedChip.code));
      const next = [normalizedChip, ...filtered].slice(0, 6);
      safeSetStorage('eco_recent_history_v1', next);
      return next;
    });
  }

  function handleSelectChip(chip) {
    if (!chip) return;
    const targetCode = chip.code || chip.partNumber || chip.value;
    if (!targetCode) return;
    setActiveTab('search');
    setQuery(targetCode);
    const full = decodeChipOffline(targetCode) || {
      ...chip,
      code: targetCode,
      storage: chip.storage || chip.capacity,
      manufacturer: chip.manufacturer || chip.brand,
    };
    if (full && full.storage) {
      setActiveResult(full);
      lastSpokenCodeRef.current = `${normalizeCode(targetCode)}:${full.storage}`;
      playDetectionBeep(full.storage);
      speakChipResult(full, voiceEnabled, false);
      pushToRecent(full);
    }
  }

  function addChipToBatch(chip) {
    const cap = chip?.storage || chip?.capacity;
    if (!chip || !cap) return;
    const bucket = normalizeBucketKey(cap);
    setBatchCounts((prev) => ({
      ...prev,
      [bucket]: (prev[bucket] || 0) + 1,
    }));
    playDetectionBeep(cap);
    speakChipResult({ ...chip, storage: cap }, voiceEnabled, true);
    setToastMsg(`+1 (${cap}) al lote`);
    setTimeout(() => setToastMsg(''), 1400);
  }

  function handleAdjustBatchCount(bucketKey, delta) {
    setBatchCounts((prev) => ({
      ...prev,
      [bucketKey]: Math.max(0, (prev[bucketKey] || 0) + delta),
    }));
  }

  function handleResetBatch() {
    setBatchCounts({ '16GB': 0, '32GB': 0, '64GB': 0, '128GB': 0, '256GB': 0, '512GB+': 0 });
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Escape') {
      setQuery('');
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeResult) {
        speakChipResult(activeResult, true, false);
        inputRef.current?.blur();
      } else if (suggestions.length > 0) {
        handleSelectChip(suggestions[0]);
        inputRef.current?.blur();
      }
    }
  }

  const theme = activeResult ? getCapacityTheme(activeResult.storage) : null;
  const activeDiff = activeResult ? highlightCodeDifference(activeResult) : null;

  const hasDualMemoryInChip = Boolean(
    activeResult &&
      activeResult.storage &&
      activeResult.ram &&
      !String(activeResult.ram).toLowerCase().includes('sin ram')
  );

  const compactKeyboardMode = isInputFocused || isKeyboardOpen;

  const navItems = [
    { id: 'search', label: 'Buscador', icon: Search },
    { id: 'tables', label: 'Tablas', icon: Table2 },
    { id: 'tutorial', label: 'Guía', icon: Eye },
    { id: 'batch', label: 'Lote', icon: PackageCheck, badge: totalBatchPieces },
  ];

  const headerShieldClass =
    isStandalone && isIOS
      ? 'ios-top-shield-standalone'
      : isIOS
        ? 'ios-top-shield-iphone'
        : 'ios-top-shield';

  return (
    <div className="min-h-dvh flex flex-col bg-[#030e08] text-white pb-24 md:pb-10">
      {/* CABECERA SÓLIDA — ANTI-DIFUMINACIÓN EN iOS Y COMPACTA CUANDO SE ABRE EL TECLADO */}
      <header
        className={`sticky top-0 z-30 ${headerShieldClass} pb-1.5 px-2.5 sm:px-4 border-b border-emerald-500/25 shadow-[0_8px_24px_rgba(0,0,0,0.9)]`}
      >
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#072214] border border-emerald-400/45 px-3 sm:px-4 py-2 space-y-1.5 md:space-y-0">
          <div className="flex items-center justify-between gap-2">
            {/* Identidad */}
            <div className="flex items-center gap-2 min-w-0">
              {!isStandalone && (
                <a
                  href="../index.html#app-logica"
                  title="Volver a ecologicagarcia.com"
                  className="hidden sm:inline-flex px-2.5 py-1.5 rounded-xl bg-[#04140b] hover:bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 text-xs font-bold items-center gap-1 transition shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sitio</span>
                </a>
              )}
              <div className="w-8 h-8 rounded-xl bg-emerald-400 text-black flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h1 className="font-black tracking-tight text-white text-sm sm:text-base leading-none truncate">
                  ECO LÓGICA <span className="text-emerald-400">GARCÍA</span>
                </h1>
                {!compactKeyboardMode && (
                  <span className="text-[10px] text-emerald-200/80 font-semibold block truncate mt-0.5">
                    {dbStats.totalOfflineCount.toLocaleString()} chips · 4GB a 2TB
                  </span>
                )}
              </div>
            </div>

            {/* Navegación Desktop */}
            <nav
              className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#04140b] border border-emerald-500/30"
              role="tablist"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition ${
                      active ? 'bg-emerald-400 text-black' : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                          active ? 'bg-black text-emerald-400' : 'bg-emerald-400 text-black'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Controles Rápidos */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="flex items-center p-0.5 rounded-xl bg-[#04140b] border border-emerald-400/35"
                role="group"
                aria-label="Tamaño de letra"
              >
                {TEXT_SCALE_OPTIONS.map((opt) => {
                  const active = textScale === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectTextScale(opt.id)}
                      title={opt.fullLabel}
                      aria-pressed={active}
                      className={`px-2 py-1 rounded-lg font-mono text-xs font-black transition ${
                        active ? 'bg-emerald-400 text-black' : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      {opt.shortLabel}
                    </button>
                  );
                })}
              </div>

              {!isStandalone && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  title="Instalar App"
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#04140b] hover:bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 font-bold text-xs flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">Instalar</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                aria-label={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
                className={`p-2 rounded-xl border text-xs font-bold transition ${
                  voiceEnabled
                    ? 'bg-[#04140b] border-emerald-400/50 text-emerald-300'
                    : 'bg-[#04140b] border-white/15 text-gray-400'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="relative px-2.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center gap-1 shadow transition"
              >
                <Database className="w-3.5 h-3.5" />
                <span>+Chip</span>
                {dbStats.pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center border border-black">
                    {dbStats.pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL — DISEÑADO PARA QUE EL TECLADO NUNCA TAPE LA CAPACIDAD */}
      <main
        ref={scannerTopRef}
        className="max-w-5xl w-full mx-auto px-2.5 sm:px-4 pt-2 sm:pt-3 flex-1"
      >
        {toastMsg && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-emerald-400 text-black font-black text-xs shadow-2xl flex items-center gap-1.5 whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            {toastMsg}
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. VISTA BUSCADOR (DIRECTA, AL GRANO Y A PRUEBA DE TECLADO MÓVIL)  */}
        {/* ================================================================= */}
        {activeTab === 'search' && (
          <div className="space-y-2.5">
            {/* BLOQUE STICKY DE LECTURA: INPUT + CAPACIDAD INMEDIATA ARRIBA DEL TECLADO */}
            <div className="rounded-2xl bg-[#072012] border border-emerald-500/35 p-2.5 sm:p-3.5 shadow-xl space-y-2">
              {/* Input con indicador de capacidad integrado en la misma barra */}
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-emerald-400 absolute left-3.5 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 180)}
                  onChange={(e) => setQuery(e.target.value.toUpperCase())}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Código del chip (ej. KMDP6001, JXE77, H9HP52)"
                  aria-label="Código del chip"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="w-full pl-11 pr-32 py-3 sm:py-3.5 rounded-xl bg-[#031009] border-2 border-emerald-400/45 focus:border-emerald-300 focus:outline-none font-mono font-black text-base sm:text-xl text-white placeholder:text-emerald-100/35 placeholder:font-sans placeholder:font-medium placeholder:text-xs sm:placeholder:text-sm tracking-wide transition"
                />

                {/* Badge instantáneo dentro del input (visible incluso con teclado abierto) */}
                <div className="absolute right-2 flex items-center gap-1">
                  {activeResult && theme && (
                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs sm:text-sm border ${theme.badge}`}
                    >
                      {activeResult.storage}
                    </span>
                  )}
                  {cpuWarning && (
                    <span className="px-2 py-1 rounded-lg bg-rose-500 text-white font-mono font-black text-[11px]">
                      {cpuWarning.isRamOnlyWarning ? 'SOLO RAM' : 'NO ES MEMORIA'}
                    </span>
                  )}
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        inputRef.current?.focus();
                      }}
                      aria-label="Limpiar código"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* ============================================================= */}
              {/* RESULTADO INMEDIATO JUSTO DEBAJO DEL INPUT (SIEMPRE VISIBLE)  */}
              {/* ============================================================= */}
              {cpuWarning && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-950/90 border-2 border-rose-400/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black text-white truncate">
                        {cpuWarning.isRamOnlyWarning
                          ? `Chip equivocado: Solo RAM (${cpuWarning.ramDetected || cpuWarning.cpuBrand})`
                          : `Chip equivocado: ${cpuWarning.cpuType} (${cpuWarning.cpuBrand})`}
                      </div>
                      <p className="text-[11px] sm:text-xs text-rose-200 leading-snug">
                        Lee el otro chip grande de la placa (KLM, KLU, KM, H9, HN8T, JZ, SDIN o THG).
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-mono font-black text-xs shrink-0">
                    IGNORAR
                  </span>
                </div>
              )}

              {activeResult && theme && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl border-2 p-3 sm:p-4 ${theme.card}`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* Capacidad Gigante + Marca/Código al grano */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`px-4 sm:px-5 py-2 rounded-xl border-2 font-mono font-black text-3xl sm:text-5xl tracking-tight shrink-0 ${theme.badge}`}
                      >
                        {activeResult.storage}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase">
                            Capacidad Máxima
                          </span>
                          {activeResult.correctedTo && (
                            <span className="text-[10px] font-mono text-amber-300 font-bold">
                              ({activeResult.correctedFrom} → {activeResult.correctedTo})
                            </span>
                          )}
                        </div>

                        {activeDiff ? (
                          <div className="font-mono font-bold text-sm sm:text-base flex items-center flex-wrap break-all">
                            <span className="text-gray-300">{activeDiff.pre}</span>
                            <span className={`px-1.5 py-0.2 mx-0.5 rounded font-black text-xs sm:text-sm ${theme.badge}`}>
                              {activeDiff.highlight}
                            </span>
                            <span className="text-gray-300">{activeDiff.post}</span>
                          </div>
                        ) : (
                          <div className="font-mono font-black text-sm sm:text-base text-white truncate">
                            {activeResult.code}
                          </div>
                        )}

                        <div className="text-xs text-emerald-200/90 font-semibold flex items-center gap-1.5 flex-wrap">
                          <span className="text-white font-bold">{activeResult.manufacturer}</span>
                          <span>·</span>
                          <span>{activeResult.type}</span>
                          {hasDualMemoryInChip && (
                            <>
                              <span>·</span>
                              <span className="text-gray-400">
                                RAM {activeResult.ram} (Ignorar RAM)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botones directos: Voz, Editar, +Lote */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => speakChipResult(activeResult, true, false)}
                        aria-label="Escuchar capacidad"
                        className="p-2.5 rounded-xl bg-[#04120a] hover:bg-black border border-white/15 text-emerald-300 transition"
                        title="Voz"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditChipModal(activeResult)}
                        aria-label="Editar chip"
                        className="px-3 py-2.5 rounded-xl bg-[#04120a] hover:bg-white/10 border border-emerald-500/30 text-emerald-200 font-bold text-xs flex items-center gap-1 transition"
                      >
                        <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addChipToBatch(activeResult)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-1 shadow transition"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Sumar {activeResult.storage}</span>
                      </button>
                    </div>
                  </div>

                  {/* Aviso compacto solo si escribió un prefijo incompleto con varias capacidades */}
                  {Array.isArray(activeResult.alternativeCapacities) &&
                    activeResult.alternativeCapacities.length > 1 && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] text-amber-200">
                        <span>
                          Variantes de esta serie: <strong>{activeResult.alternativeCapacities.join(' / ')}</strong> (Mostrando capacidad máxima: {activeResult.storage})
                        </span>
                      </div>
                    )}
                </div>
              )}

              {query.trim().length >= 2 && !activeResult && suggestions.length === 0 && !cpuWarning && (
                <div className="p-3 rounded-xl bg-[#04120a] border border-emerald-500/25 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-200">
                    {isSearchingOnline ? `Buscando "${query}"...` : `Sin registro para "${query}"`}
                  </span>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="px-3 py-1.5 rounded-lg bg-emerald-400 text-black font-black text-xs shrink-0"
                  >
                    + Agregar
                  </button>
                </div>
              )}
            </div>

            {/* LISTA COMPACTA DE SUGERENCIAS (Mayor capacidad arriba) */}
            {suggestions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {suggestions.map((item, idx) => {
                  const itemTheme = getCapacityTheme(item.storage);
                  const diff = highlightCodeDifference(item);
                  return (
                    <button
                      key={`${item.code}-${item.partNumber}-${idx}`}
                      type="button"
                      onClick={() => handleSelectChip(item)}
                      className="px-3 py-2.5 rounded-xl bg-[#071f12] hover:bg-[#0b2918] border border-emerald-500/25 flex items-center justify-between gap-2 text-left transition"
                    >
                      <div className="min-w-0">
                        <div className="font-mono font-bold text-xs sm:text-sm flex items-center flex-wrap break-all">
                          <span className="text-gray-300">{diff.pre}</span>
                          <span className={`px-1 py-0.2 mx-0.5 rounded font-black ${itemTheme.badge}`}>
                            {diff.highlight}
                          </span>
                          <span className="text-gray-300">{diff.post}</span>
                        </div>
                        <div className="text-[11px] text-emerald-200/75 truncate">
                          {item.manufacturer} · {item.type}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs sm:text-sm border shrink-0 ${itemTheme.badge}`}
                      >
                        {item.storage}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ATAJOS Y RECIENTES (Solo cuando no está escribiendo) */}
            {!query && (
              <div className="space-y-3">
                {/* Atajos Rápidos */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {QUICK_PREFIXES.map((p) => {
                    const targetVal = p.value || p.label;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleSelectChip({ code: targetVal })}
                        className="px-2.5 py-1.5 rounded-xl bg-[#071f12] hover:bg-[#0b2918] text-emerald-200 border border-emerald-500/25 font-mono text-xs font-bold shrink-0 transition"
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Recientes */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/70">
                      Recientes
                    </span>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Administrar Base
                    </button>
                  </div>

                  <div
                    className={`grid gap-1.5 ${
                      textScale === 'xlarge'
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3'
                    }`}
                  >
                    {recentHistory.map((item) => {
                      const cap = item.storage || item.capacity || '64GB';
                      const itemTheme = getCapacityTheme(cap);
                      const diff = highlightCodeDifference(item);
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => handleSelectChip(item)}
                          className="p-2.5 rounded-xl bg-[#071f12] hover:bg-[#0b2918] border border-emerald-500/20 flex items-center justify-between gap-2 text-left transition"
                        >
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-xs flex items-center flex-wrap break-all">
                              <span className="text-gray-300">{diff.pre}</span>
                              <span className={`px-1 rounded font-black ${itemTheme.badge}`}>
                                {diff.highlight}
                              </span>
                              <span className="text-gray-300">{diff.post}</span>
                            </div>
                            <span className="text-[11px] text-emerald-300/70 block truncate mt-0.5">
                              {item.manufacturer || item.brand}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs border shrink-0 ${itemTheme.badge}`}
                          >
                            {cap}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. VISTA TABLAS POR MARCA                                         */}
        {/* ================================================================= */}
        {activeTab === 'tables' && (
          <BrandTablesView
            onSelectChip={handleSelectChip}
            onAddChipToBatch={addChipToBatch}
            onEditChip={openEditChipModal}
            catalogVersion={catalogVersion}
          />
        )}

        {/* ================================================================= */}
        {/* 3. VISTA GUÍA VISUAL                                              */}
        {/* ================================================================= */}
        {activeTab === 'tutorial' && <VisualTutorialView />}

        {/* ================================================================= */}
        {/* 4. VISTA LOTE                                                     */}
        {/* ================================================================= */}
        {activeTab === 'batch' && (
          <BatchCounterPanel
            counts={batchCounts}
            onAdjustCount={handleAdjustBatchCount}
            onResetBatch={handleResetBatch}
            clientName={clientName}
            setClientName={setClientName}
          />
        )}
      </main>

      {/* BARRA INFERIOR MÓVIL — SE OCULTA AUTOMÁTICAMENTE AL ABRIR EL TECLADO PARA NO TAPAR NADA */}
      {!compactKeyboardMode && (
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#030e08] border-t border-emerald-500/30 px-2.5 pt-1.5 ios-bottom-dock shadow-[0_-8px_25px_rgba(0,0,0,0.95)]"
          role="tablist"
          aria-label="Navegación móvil"
        >
          <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto p-1 rounded-2xl bg-[#072214] border border-emerald-400/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${
                    active
                      ? 'bg-emerald-400 text-black font-black'
                      : 'text-emerald-100/80 hover:text-white font-semibold'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] leading-none">{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className={`absolute top-1 right-2 px-1.5 py-0.2 rounded-full font-mono font-black text-[10px] ${
                        active ? 'bg-black text-emerald-400' : 'bg-emerald-400 text-black'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* MODAL DE INSTALACIÓN */}
      {isInstallModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsInstallModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-[#062011] border border-emerald-500/35 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/20 bg-[#04160b]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-black text-white text-sm sm:text-base">
                  Instalar Aplicación
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#031209] border border-emerald-500/20">
                <button
                  type="button"
                  onClick={() => setInstallPlatformTab('android')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition ${
                    installPlatformTab === 'android'
                      ? 'bg-emerald-400 text-black'
                      : 'text-emerald-200/75 hover:text-white'
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setInstallPlatformTab('ios')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition ${
                    installPlatformTab === 'ios'
                      ? 'bg-emerald-400 text-black'
                      : 'text-emerald-200/75 hover:text-white'
                  }`}
                >
                  iPhone / iPad
                </button>
                <button
                  type="button"
                  onClick={() => setInstallPlatformTab('pc')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition ${
                    installPlatformTab === 'pc'
                      ? 'bg-emerald-400 text-black'
                      : 'text-emerald-200/75 hover:text-white'
                  }`}
                >
                  PC / Laptop
                </button>
              </div>

              {installPlatformTab === 'android' && (
                <div className="space-y-3 text-xs sm:text-sm text-emerald-100">
                  {deferredPrompt && (
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <Download className="w-4 h-4" /> Instalar ahora
                    </button>
                  )}
                  <div className="p-3.5 rounded-2xl bg-[#031209] border border-emerald-500/20 space-y-2">
                    <p>1. Abre el menú de Chrome (⋮) arriba a la derecha.</p>
                    <p>2. Toca <strong>Instalar aplicación</strong> o <strong>Agregar a pantalla principal</strong>.</p>
                  </div>
                </div>
              )}

              {installPlatformTab === 'ios' && (
                <div className="p-3.5 rounded-2xl bg-[#031209] border border-emerald-500/20 space-y-2 text-xs sm:text-sm text-emerald-100">
                  <p className="flex items-center gap-1 flex-wrap">
                    1. En Safari, toca <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline text-emerald-400" /> en la barra inferior.
                  </p>
                  <p>2. Elige <strong>Agregar a inicio</strong> y confirma en <strong>Agregar</strong>.</p>
                </div>
              )}

              {installPlatformTab === 'pc' && (
                <div className="p-3.5 rounded-2xl bg-[#031209] border border-emerald-500/20 space-y-2 text-xs sm:text-sm text-emerald-100">
                  <p>1. En Chrome o Edge, haz clic en el ícono de instalar en la barra de direcciones.</p>
                  <p>2. Confirma en <strong>Instalar</strong>.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AVISO DE ALMACENAMIENTO LOCAL */}
      {!cookieAccepted && !compactKeyboardMode && (
        <aside
          role="region"
          className="fixed bottom-16 md:bottom-4 left-3 right-3 z-50 max-w-3xl mx-auto p-3.5 rounded-2xl bg-[#04160b] border border-emerald-400/40 shadow-2xl flex items-center justify-between gap-3 flex-wrap"
        >
          <p className="text-xs text-emerald-100/90">
            Usamos almacenamiento local para guardar tu lote y preferencias.
          </p>
          <button
            type="button"
            onClick={() => handleAcceptCookies('accepted')}
            className="px-4 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs"
          >
            Aceptar
          </button>
        </aside>
      )}

      {/* MODAL BASE DE DATOS Y EDICIÓN CON PIN ADMIN */}
      <AdminDatabaseModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setEditingChipTarget(null);
        }}
        initialCode={activeResult ? '' : query}
        initialEditChip={editingChipTarget}
        onDatabaseUpdated={() => {
          setDbStats(getDatabaseStats());
          setCatalogVersion((v) => v + 1);
          if (query) {
            const refreshed = decodeChipOffline(query);
            if (refreshed) setActiveResult(refreshed);
          }
        }}
      />
    </div>
  );
}
