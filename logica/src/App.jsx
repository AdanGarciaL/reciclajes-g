import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  VolumeX,
  Database,
  Plus,
  Minus,
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
  ChevronRight,
} from 'lucide-react';
import {
  decodeChipOffline,
  searchChipsInstant,
  lookupOnlineFallbackAndLearn,
  getDatabaseStats,
  normalizeCode,
  detectCpuInsteadOfMemory,
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

const QUICK_LOT_BUCKETS = [
  { key: '16GB', label: '4–16GB', pill: 'bg-sky-400 text-black border-sky-200', border: 'border-sky-500/35' },
  { key: '32GB', label: '32GB', pill: 'bg-cyan-400 text-black border-cyan-200', border: 'border-cyan-500/35' },
  { key: '64GB', label: '64GB', pill: 'bg-emerald-400 text-black border-emerald-200', border: 'border-emerald-500/45' },
  { key: '128GB', label: '128GB', pill: 'bg-amber-400 text-black border-amber-200', border: 'border-amber-500/45' },
  { key: '256GB', label: '256GB', pill: 'bg-purple-500 text-white border-purple-300', border: 'border-purple-500/45' },
  { key: '512GB+', label: '512G–2TB', pill: 'bg-rose-500 text-white border-rose-300', border: 'border-rose-500/45' },
];

function getCapacityTheme(storageStr) {
  const s = String(storageStr || '').toUpperCase().trim();
  const num = parseInt(s.replace(/\D/g, ''), 10) || 0;
  if (s.includes('TB') || num >= 512) {
    return {
      badge: 'bg-rose-500 text-white border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.35)]',
      card: 'border-rose-500/65 bg-gradient-to-br from-[#1d0910] via-[#0d1510] to-[#070d09]',
      accentText: 'text-rose-300',
      dot: 'bg-rose-400',
    };
  }
  if (num === 256) {
    return {
      badge: 'bg-purple-500 text-white border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.35)]',
      card: 'border-purple-500/65 bg-gradient-to-br from-[#170b24] via-[#0d1510] to-[#070d09]',
      accentText: 'text-purple-300',
      dot: 'bg-purple-400',
    };
  }
  if (num === 128) {
    return {
      badge: 'bg-amber-400 text-black border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.3)]',
      card: 'border-amber-400/70 bg-gradient-to-br from-[#1f1606] via-[#0d1510] to-[#070d09]',
      accentText: 'text-amber-300',
      dot: 'bg-amber-400',
    };
  }
  if (num === 64) {
    return {
      badge: 'bg-emerald-400 text-black border-emerald-200 shadow-[0_0_22px_rgba(52,211,153,0.35)]',
      card: 'border-emerald-400/75 bg-gradient-to-br from-[#072617] via-[#0b1911] to-[#060c08]',
      accentText: 'text-emerald-300',
      dot: 'bg-emerald-400',
    };
  }
  if (num === 32) {
    return {
      badge: 'bg-cyan-400 text-black border-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.3)]',
      card: 'border-cyan-400/65 bg-gradient-to-br from-[#062026] via-[#0b1712] to-[#060c08]',
      accentText: 'text-cyan-300',
      dot: 'bg-cyan-400',
    };
  }
  return {
    badge: 'bg-sky-400 text-black border-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.3)]',
    card: 'border-sky-400/65 bg-gradient-to-br from-[#071c29] via-[#0b1712] to-[#060c08]',
    accentText: 'text-sky-300',
    dot: 'bg-sky-400',
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
    setToastMsg(`+1 (${cap}) sumado al lote`);
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
    { id: 'search', label: 'Escáner', icon: Search },
    { id: 'tables', label: 'Catálogo', icon: Table2 },
    { id: 'tutorial', label: 'Guía IC', icon: Eye },
    { id: 'batch', label: 'Lote', icon: PackageCheck, badge: totalBatchPieces },
  ];

  const headerShieldClass =
    isStandalone && isIOS
      ? 'ios-top-shield-standalone'
      : isIOS
        ? 'ios-top-shield-iphone'
        : 'ios-top-shield';

  return (
    <div className="min-h-dvh flex flex-col text-white pb-24 md:pb-10">
      {/* ===================================================================== */}
      {/* CABECERA INDUSTRIAL DE ALTA PRECISIÓN — SÓLIDA EN iOS / ANDROID       */}
      {/* ===================================================================== */}
      <header
        className={`sticky top-0 z-30 ${headerShieldClass} pb-2 px-2.5 sm:px-4 border-b border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.85)]`}
      >
        <div className="max-w-5xl mx-auto rounded-2xl pro-panel px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Marca e Indicador de Sistema */}
            <div className="flex items-center gap-2.5 min-w-0">
              {!isStandalone && (
                <a
                  href="../index.html#app-logica"
                  title="Volver a ecologicagarcia.com"
                  className="hidden sm:inline-flex px-2.5 py-1.5 rounded-xl pro-inset hover:border-emerald-400/50 text-emerald-300 text-xs font-bold items-center gap-1 transition shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Web</span>
                </a>
              )}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-black flex items-center justify-center shadow-[0_0_16px_rgba(52,211,153,0.35)] shrink-0">
                <Cpu className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black tracking-tight text-white text-sm sm:text-base leading-none truncate">
                    ECO LÓGICA <span className="text-emerald-400">GARCÍA</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-mono font-bold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    PRO
                  </span>
                </div>
                {!compactKeyboardMode && (
                  <span className="text-[10px] text-emerald-200/70 font-mono font-medium block truncate mt-0.5">
                    {dbStats.totalOfflineCount.toLocaleString()} IC · 4GB–2TB
                  </span>
                )}
              </div>
            </div>

            {/* Navegación Desktop */}
            <nav
              className="hidden md:flex items-center gap-1 p-1 rounded-xl pro-inset"
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
                      active
                        ? 'bg-emerald-400 text-black shadow-[0_0_14px_rgba(52,211,153,0.35)]'
                        : 'text-emerald-100/80 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
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
                className="flex items-center p-0.5 rounded-xl pro-inset"
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
                        active ? 'bg-emerald-400 text-black' : 'text-emerald-200/80 hover:text-white'
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
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl pro-inset hover:border-emerald-400/50 text-emerald-300 font-bold text-xs flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">App</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                aria-label={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
                className={`p-2 rounded-xl pro-inset text-xs font-bold transition ${
                  voiceEnabled ? 'text-emerald-300 border-emerald-400/40' : 'text-gray-500'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="relative px-2.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center gap-1 shadow-[0_0_14px_rgba(52,211,153,0.3)] transition"
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

      {/* ===================================================================== */}
      {/* CONTENEDOR PRINCIPAL                                                  */}
      {/* ===================================================================== */}
      <main
        ref={scannerTopRef}
        className="max-w-5xl w-full mx-auto px-2.5 sm:px-4 pt-2.5 sm:pt-3.5 flex-1"
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
        {/* 1. CONSOLA ESCÁNER (DIRECTA, INDUSTRIAL Y A PRUEBA DE TECLADO)    */}
        {/* ================================================================= */}
        {activeTab === 'search' && (
          <div className="space-y-3">
            {/* MÓDULO PRINCIPAL DE LECTURA: INPUT + TELEMETRÍA DE CAPACIDAD */}
            <div className="rounded-2xl pro-panel-elevated p-3 sm:p-4 space-y-2.5">
              {/* Barra superior de estado del lector */}
              {!compactKeyboardMode && (
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cpuWarning
                          ? 'bg-rose-500 animate-ping'
                          : activeResult && theme
                            ? theme.dot
                            : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300/90">
                      {cpuWarning
                        ? 'Alerta: Chip sin almacenamiento'
                        : activeResult
                          ? `Memoria detectada · ${activeResult.manufacturer}`
                          : 'Lector de Código IC (eMMC · eMCP · UFS · NAND)'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400 hidden sm:inline">
                    Prioridad: Capacidad Máxima
                  </span>
                </div>
              )}

              {/* Campo de entrada con badge en vivo integrado */}
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
                  placeholder="Escribe el código (ej. KMDP6001, JXE77, H9HP52, KLUFG8)"
                  aria-label="Código del chip"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="w-full pl-11 pr-32 py-3 sm:py-3.5 rounded-xl pro-inset focus:border-emerald-400 focus:outline-none font-mono font-black text-base sm:text-xl text-white placeholder:text-emerald-100/35 placeholder:font-sans placeholder:font-medium placeholder:text-xs sm:placeholder:text-sm tracking-wider transition"
                />

                {/* Badge instantáneo dentro del input (siempre visible arriba del teclado) */}
                <div className="absolute right-2 flex items-center gap-1.5">
                  {activeResult && theme && (
                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs sm:text-sm border ${theme.badge}`}
                    >
                      {activeResult.storage}
                    </span>
                  )}
                  {cpuWarning && (
                    <span className="px-2 py-1 rounded-lg bg-rose-500 text-white font-mono font-black text-[11px] border border-rose-300">
                      {cpuWarning.isRamOnlyWarning ? 'SOLO RAM' : 'CPU / NO NAND'}
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
              {/* ALERTA DE CHIP EQUIVOCADO (PURA RAM O PROCESADOR)             */}
              {/* ============================================================= */}
              {cpuWarning && (
                <div
                  role="alert"
                  className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-rose-950/95 to-[#16070b] border-2 border-rose-500/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black text-white truncate">
                        {cpuWarning.isRamOnlyWarning
                          ? `SOLO RAM (${cpuWarning.ramDetected || cpuWarning.cpuBrand}) — Sin Almacenamiento`
                          : `${cpuWarning.cpuType} (${cpuWarning.cpuBrand}) — No es Memoria`}
                      </div>
                      <p className="text-[11px] sm:text-xs text-rose-200/90 leading-snug mt-0.5">
                        Busca el chip de memoria a un lado: <strong className="font-mono text-white">KLM, KLU, KM, H9, HN8T, JZ, SDIN, THG</strong>.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-mono font-black text-xs shrink-0">
                    0 GB
                  </span>
                </div>
              )}

              {/* ============================================================= */}
              {/* TARJETA DE TELEMETRÍA DE CAPACIDAD (SIEMPRE ARRIBA DEL TECLADO)*/}
              {/* ============================================================= */}
              {activeResult && theme && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl border-2 p-3 sm:p-4 transition-all ${theme.card}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Bloque Izquierdo: Lectura Gigante de GB + Desglose de Código */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <div
                          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 font-mono font-black text-3xl sm:text-5xl tracking-tight leading-none ${theme.badge}`}
                        >
                          {activeResult.storage}
                        </div>
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-300/90 mt-1">
                          Capacidad Máx
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        {/* Código con segmento clave iluminado */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {activeDiff ? (
                            <div className="font-mono font-black text-base sm:text-xl flex items-center flex-wrap break-all tracking-wide">
                              <span className="text-gray-300">{activeDiff.pre}</span>
                              <span
                                className={`px-1.5 py-0.2 mx-0.5 rounded-md font-black text-sm sm:text-lg border ${theme.badge}`}
                              >
                                {activeDiff.highlight}
                              </span>
                              <span className="text-gray-300">{activeDiff.post}</span>
                            </div>
                          ) : (
                            <div className="font-mono font-black text-base sm:text-xl text-white truncate">
                              {activeResult.code}
                            </div>
                          )}

                          {activeDiff?.why && (
                            <span className="px-2 py-0.5 rounded-md bg-black/50 border border-white/15 font-mono text-[11px] font-bold text-emerald-300">
                              {activeDiff.why}
                            </span>
                          )}
                        </div>

                        {/* Fila de Especificaciones Técnicas */}
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                            {activeResult.manufacturer}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-200 font-mono font-semibold">
                            {activeResult.type}
                          </span>
                          {hasDualMemoryInChip && (
                            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-gray-300 font-mono">
                              RAM {activeResult.ram} (Ignorar)
                            </span>
                          )}
                          {activeResult.correctedTo && (
                            <span className="text-[11px] font-mono text-amber-300 font-bold">
                              Corrige: {activeResult.correctedFrom} → {activeResult.correctedTo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bloque Derecho: Acciones Táctiles */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      <button
                        type="button"
                        onClick={() => speakChipResult(activeResult, true, false)}
                        aria-label="Escuchar capacidad"
                        className="p-2.5 rounded-xl bg-black/50 hover:bg-black/80 border border-white/15 text-emerald-300 transition"
                        title="Repetir voz"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditChipModal(activeResult)}
                        aria-label="Editar chip"
                        className="px-3 py-2.5 rounded-xl bg-black/50 hover:bg-white/10 border border-white/15 text-emerald-200 font-bold text-xs flex items-center gap-1 transition"
                      >
                        <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addChipToBatch(activeResult)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(52,211,153,0.4)] transition"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Sumar {activeResult.storage}</span>
                      </button>
                    </div>
                  </div>

                  {/* Si el usuario escribió solo el inicio del código y hay varias capacidades en esa familia */}
                  {Array.isArray(activeResult.alternativeCapacities) &&
                    activeResult.alternativeCapacities.length > 1 && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono text-amber-200">
                        <span>
                          Serie con variantes ({activeResult.alternativeCapacities.join(' · ')}) — priorizando capacidad máxima ({activeResult.storage}).
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* Estado sin coincidencias */}
              {query.trim().length >= 2 && !activeResult && suggestions.length === 0 && !cpuWarning && (
                <div className="p-3 rounded-xl pro-inset flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-gray-300">
                    {isSearchingOnline
                      ? `Consultando código "${query}"...`
                      : `Código "${query}" no registrado en catálogo`}
                  </span>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs shrink-0 transition"
                  >
                    + Registrar Chip
                  </button>
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* COINCIDENCIAS RÁPIDAS (ORDENADAS DE MAYOR A MENOR CAPACIDAD)  */}
            {/* ============================================================= */}
            {suggestions.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300/75">
                    Coincidencias ({suggestions.length}) · Mayor capacidad primero
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {suggestions.map((item, idx) => {
                    const itemTheme = getCapacityTheme(item.storage);
                    const diff = highlightCodeDifference(item);
                    return (
                      <button
                        key={`${item.code}-${item.partNumber}-${idx}`}
                        type="button"
                        onClick={() => handleSelectChip(item)}
                        className="px-3.5 py-2.5 rounded-xl pro-panel hover:border-emerald-400/50 flex items-center justify-between gap-2 text-left transition"
                      >
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-xs sm:text-sm flex items-center flex-wrap break-all">
                            <span className="text-gray-300">{diff.pre}</span>
                            <span className={`px-1 py-0.2 mx-0.5 rounded font-black ${itemTheme.badge}`}>
                              {diff.highlight}
                            </span>
                            <span className="text-gray-300">{diff.post}</span>
                          </div>
                          <div className="text-[11px] text-emerald-200/70 truncate mt-0.5">
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
              </div>
            )}

            {/* ============================================================= */}
            {/* PANELES DE OPERACIÓN RÁPIDA (VISIBLES CUANDO NO SE ESCRIBE)   */}
            {/* ============================================================= */}
            {!query && (
              <div className="space-y-3">
                {/* 1. Prefijos Rápidos por Marca */}
                <div className="rounded-2xl pro-panel p-3 sm:p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-emerald-300/80">
                      Acceso Rápido por Serie IC
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tables')}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                    >
                      <span>Ver catálogo completo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {QUICK_PREFIXES.map((p) => {
                      const targetVal = p.value || p.label;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleSelectChip({ code: targetVal })}
                          className="px-2.5 py-2 rounded-xl pro-inset hover:border-emerald-400/60 flex flex-col items-start justify-center text-left transition group"
                        >
                          <span className="font-mono font-black text-xs sm:text-sm text-white group-hover:text-emerald-300">
                            {p.label}
                          </span>
                          <span className="text-[10px] text-emerald-200/60 truncate w-full">
                            {p.brand}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Barra de Conteo Rápido de Lote por Capacidad (4GB a 2TB) */}
                <div className="rounded-2xl pro-panel p-3 sm:p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-emerald-300/80">
                        Conteo Rápido de Lote
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black font-mono font-black text-[11px]">
                        {totalBatchPieces} pzas
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('batch')}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                    >
                      <span>Corte / WhatsApp</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                    {QUICK_LOT_BUCKETS.map((b) => {
                      const count = batchCounts[b.key] || 0;
                      return (
                        <div
                          key={b.key}
                          className={`rounded-xl pro-inset p-2 border ${b.border} flex flex-col justify-between gap-2`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono font-black text-[10px] border ${b.pill}`}
                            >
                              {b.label}
                            </span>
                            <span className="font-mono font-black text-base sm:text-lg text-white">
                              {count}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => handleAdjustBatchCount(b.key, -1)}
                              disabled={count <= 0}
                              aria-label={`Restar 1 a ${b.label}`}
                              className="py-1 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-25 text-white flex items-center justify-center transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustBatchCount(b.key, 1)}
                              aria-label={`Sumar 1 a ${b.label}`}
                              className="py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/30 text-emerald-300 flex items-center justify-center transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Historial de Lecturas Recientes */}
                <div className="rounded-2xl pro-panel p-3 sm:p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-emerald-300/80">
                      Lecturas Recientes
                    </span>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Base de Datos
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
                          className="p-2.5 rounded-xl pro-inset hover:border-emerald-400/50 flex items-center justify-between gap-2 text-left transition"
                        >
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-xs flex items-center flex-wrap break-all">
                              <span className="text-gray-300">{diff.pre}</span>
                              <span className={`px-1 rounded font-black ${itemTheme.badge}`}>
                                {diff.highlight}
                              </span>
                              <span className="text-gray-300">{diff.post}</span>
                            </div>
                            <span className="text-[10px] text-emerald-200/65 block truncate mt-0.5">
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
        {/* 2. VISTA CATÁLOGO POR MARCA                                       */}
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

      {/* ===================================================================== */}
      {/* BARRA INFERIOR MÓVIL — SE OCULTA AL ABRIR EL TECLADO                  */}
      {/* ===================================================================== */}
      {!compactKeyboardMode && (
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#050a07] border-t border-emerald-500/25 px-2.5 pt-1.5 ios-bottom-dock shadow-[0_-10px_30px_rgba(0,0,0,0.95)]"
          role="tablist"
          aria-label="Navegación móvil"
        >
          <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto p-1 rounded-2xl pro-panel">
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
                      ? 'bg-emerald-400 text-black font-black shadow-[0_0_14px_rgba(52,211,153,0.35)]'
                      : 'text-emerald-100/75 hover:text-white font-semibold'
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
            className="relative w-full max-w-md rounded-3xl pro-panel-elevated overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/20 bg-black/40">
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
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl pro-inset">
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
                  <div className="p-3.5 rounded-2xl pro-inset space-y-2">
                    <p>1. Abre el menú de Chrome (⋮) arriba a la derecha.</p>
                    <p>2. Toca <strong>Instalar aplicación</strong> o <strong>Agregar a pantalla principal</strong>.</p>
                  </div>
                </div>
              )}

              {installPlatformTab === 'ios' && (
                <div className="p-3.5 rounded-2xl pro-inset space-y-2 text-xs sm:text-sm text-emerald-100">
                  <p className="flex items-center gap-1 flex-wrap">
                    1. En Safari, toca <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline text-emerald-400" /> en la barra inferior.
                  </p>
                  <p>2. Elige <strong>Agregar a inicio</strong> y confirma en <strong>Agregar</strong>.</p>
                </div>
              )}

              {installPlatformTab === 'pc' && (
                <div className="p-3.5 rounded-2xl pro-inset space-y-2 text-xs sm:text-sm text-emerald-100">
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
          className="fixed bottom-16 md:bottom-4 left-3 right-3 z-50 max-w-3xl mx-auto p-3.5 rounded-2xl pro-panel-elevated flex items-center justify-between gap-3 flex-wrap"
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
