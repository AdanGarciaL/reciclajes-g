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
  Sparkles,
  Download,
  Smartphone,
  Share,
  ArrowLeft,
  Pencil,
  ShieldCheck,
  Layers,
  Zap,
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
  { id: 'normal', shortLabel: 'A', fullLabel: 'Letra Estándar (Normal)' },
  { id: 'large', shortLabel: 'A+', fullLabel: 'Letra Grande' },
  { id: 'xlarge', shortLabel: 'A++', fullLabel: 'Letra Extra Grande (Vista Mayor)' },
];

function getCapacityTheme(storageStr) {
  const s = String(storageStr || '').toUpperCase().trim();
  const num = parseInt(s.replace(/\D/g, ''), 10) || 0;
  if (s.includes('TB') || num >= 512) {
    return {
      badge: 'bg-rose-500 text-white border-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.45)]',
      card: 'border-rose-500/60 bg-gradient-to-br from-[#14070c] via-[#081f12] to-[#05140b]',
      accentText: 'text-rose-300',
      pillBg: 'bg-rose-500/15 border-rose-400/40 text-rose-200',
    };
  }
  if (num === 256) {
    return {
      badge: 'bg-purple-500 text-white border-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.45)]',
      card: 'border-purple-500/60 bg-gradient-to-br from-[#11081c] via-[#081f12] to-[#05140b]',
      accentText: 'text-purple-300',
      pillBg: 'bg-purple-500/15 border-purple-400/40 text-purple-200',
    };
  }
  if (num === 128) {
    return {
      badge: 'bg-amber-400 text-black border-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.4)]',
      card: 'border-amber-400/65 bg-gradient-to-br from-[#171205] via-[#081f12] to-[#05140b]',
      accentText: 'text-amber-300',
      pillBg: 'bg-amber-400/15 border-amber-400/40 text-amber-200',
    };
  }
  if (num === 64) {
    return {
      badge: 'bg-emerald-400 text-black border-emerald-200 shadow-[0_0_25px_rgba(52,211,153,0.45)]',
      card: 'border-emerald-400/70 bg-gradient-to-br from-[#062615] via-[#081f12] to-[#05140b]',
      accentText: 'text-emerald-300',
      pillBg: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200',
    };
  }
  if (num === 32) {
    return {
      badge: 'bg-cyan-400 text-black border-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.4)]',
      card: 'border-cyan-400/60 bg-gradient-to-br from-[#051d24] via-[#081f12] to-[#05140b]',
      accentText: 'text-cyan-300',
      pillBg: 'bg-cyan-400/15 border-cyan-400/40 text-cyan-200',
    };
  }
  return {
    badge: 'bg-sky-400 text-black border-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.35)]',
    card: 'border-sky-400/60 bg-gradient-to-br from-[#061926] via-[#081f12] to-[#05140b]',
    accentText: 'text-sky-300',
    pillBg: 'bg-sky-400/15 border-sky-400/40 text-sky-200',
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

  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Tamaño de texto accesible y adaptativo (normal | large | xlarge)
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

  function handleSelectTextScale(nextScale) {
    setTextScale(nextScale);
    const found = TEXT_SCALE_OPTIONS.find((o) => o.id === nextScale);
    if (found) {
      setToastMsg(found.fullLabel);
      setTimeout(() => setToastMsg(''), 1800);
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

  // Estado de Instalación PWA (Android + iPhone)
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
  const [installBannerDismissed, setInstallBannerDismissed] = useState(() =>
    Boolean(safeGetStorage('eco_install_banner_dismissed_v1', false))
  );
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
      // ignorar
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
      setToastMsg('¡Aplicación instalada en tu celular!');
      setTimeout(() => setToastMsg(''), 3000);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('instalar') === '1' && !isStandalone) {
        setIsInstallModalOpen(true);
      }
    } catch {
      // ignorar
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
        // Si falla el prompt nativo, abrir guía visual
      }
    }
    setIsInstallModalOpen(true);
  }

  function dismissInstallBanner() {
    setInstallBannerDismissed(true);
    safeSetStorage('eco_install_banner_dismissed_v1', true);
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

    // 1. Verificar si escribió el código de un Procesador (CPU), PMIC o Chip de PURA RAM
    const cpuDetected = detectCpuInsteadOfMemory(clean);
    setCpuWarning(cpuDetected);

    // 2. Buscar sugerencias instantáneas (ordenadas de Mayor a Menor Capacidad)
    const instantList = searchChipsInstant(clean, 8);
    setSuggestions(instantList);

    // 3. Decodificación directa offline
    const direct = decodeChipOffline(clean);
    if (direct) {
      // Si el motor detectó que es un chip de PURA RAM (sin almacenamiento), activar alerta de segundo chip
      if (direct.isPureDram || (!direct.storage && direct.ram)) {
        setActiveResult(null);
        setCpuWarning({
          isCpuWarning: true,
          isRamOnlyWarning: true,
          wrongChipCategory: 'RAM_ONLY',
          code: direct.code || clean,
          cpuBrand: direct.manufacturer || 'DRAM Mobile',
          cpuType: `Chip de PURA RAM (${direct.ram || 'LPDDR'})`,
          ramDetected: direct.ram,
          title: `¡CHIP EQUIVOCADO! Este código es SOLO MEMORIA RAM (${direct.ram || 'LPDDR'})`,
          message: `En esta placa hay 2 chips: "${direct.code || clean}" es únicamente la memoria RAM (${direct.ram || 'LPDDR'}) de ${direct.manufacturer || 'la lógica'} y NO tiene los GB de almacenamiento. Busca el SEGUNDO chip grande de la placa (Memoria UFS / eMMC / NAND) para ver la CAPACIDAD MÁXIMA real (64GB, 128GB, 256GB...).`,
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
    setToastMsg(`+1 (${cap}) sumada al lote`);
    setTimeout(() => setToastMsg(''), 1600);
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
      inputRef.current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeResult) {
        speakChipResult(activeResult, true, false);
      } else if (suggestions.length > 0) {
        handleSelectChip(suggestions[0]);
      }
    }
  }

  const theme = activeResult ? getCapacityTheme(activeResult.storage) : null;
  const activeDiff = activeResult ? highlightCodeDifference(activeResult) : null;

  // Detectar si el chip actual tiene 2 capacidades (Almacenamiento + RAM en el mismo chip eMCP/uMCP)
  const hasDualMemoryInChip = Boolean(
    activeResult &&
      activeResult.storage &&
      activeResult.ram &&
      !String(activeResult.ram).toLowerCase().includes('sin ram')
  );

  // Detectar la Capacidad Máxima entre todas las sugerencias actuales
  const maxSuggestionItem =
    suggestions.length > 0
      ? suggestions.reduce((best, curr) =>
          capacityToGbNumber(curr.storage) > capacityToGbNumber(best.storage) ? curr : best
        , suggestions[0])
      : null;

  const navItems = [
    { id: 'search', label: 'Escáner', icon: Search },
    { id: 'tables', label: 'Tablas', icon: Table2 },
    { id: 'tutorial', label: 'Guía Visual', icon: Eye },
    { id: 'batch', label: 'Mi Lote', icon: PackageCheck, badge: totalBatchPieces },
  ];

  const headerShieldClass =
    isStandalone && isIOS
      ? 'ios-top-shield-standalone'
      : isIOS
        ? 'ios-top-shield-iphone'
        : 'ios-top-shield';

  return (
    <div className="min-h-dvh flex flex-col bg-[#030e08] text-white pb-28 md:pb-10">
      {/* CABECERA SÓLIDA DE ALTO CONTRASTE — ANTI-DIFUMINACIÓN PARA IPHONE 14 PRO (LIQUID GLASS / DYNAMIC ISLAND) Y ANDROID */}
      <header
        className={`sticky top-0 z-30 ${headerShieldClass} pb-2 px-2.5 sm:px-4 border-b border-emerald-500/30 shadow-[0_12px_35px_rgba(0,0,0,0.92)]`}
      >
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-[#072616] via-[#082214] to-[#061c10] border-2 border-emerald-400/55 shadow-2xl px-3 sm:px-4 py-2.5 space-y-2 md:space-y-0">
          {/* Fila Principal: Identidad + Navegación Desktop + Botones Principales */}
          <div className="flex items-center justify-between gap-2">
            {/* Identidad Eco Lógica García */}
            <div className="flex items-center gap-2.5 min-w-0">
              {!isStandalone && (
                <a
                  href="../index.html#app-logica"
                  title="Volver a ecologicagarcia.com"
                  aria-label="Volver a la página principal de Eco Lógica García"
                  className="hidden sm:inline-flex px-2.5 py-2 rounded-xl bg-[#04140b] hover:bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 text-xs font-bold items-center gap-1.5 transition shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sitio</span>
                </a>
              )}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-300 to-emerald-500 text-black flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                <Cpu className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black tracking-tight text-white text-sm sm:text-base leading-none truncate">
                    ECO LÓGICA <span className="text-emerald-400">GARCÍA</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-400/20 border border-emerald-400/40 text-[10px] font-mono font-black text-emerald-300">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-emerald-200/90 font-semibold block truncate mt-0.5">
                  Detector de Capacidad Máxima · {dbStats.totalOfflineCount.toLocaleString()} Chips (4GB–2TB)
                </span>
              </div>
            </div>

            {/* Navegación Desktop */}
            <nav
              className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-[#04140b] border border-emerald-500/35"
              role="tablist"
              aria-label="Secciones principales"
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      active
                        ? 'bg-emerald-400 text-black shadow'
                        : 'text-emerald-100 hover:text-white'
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

            {/* Controles Rápidos Derecha */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Selector de Tamaño de Texto en Desktop/Tablet */}
              <div
                className="hidden sm:flex items-center p-0.5 rounded-xl bg-[#04140b] border border-emerald-400/40"
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
                      aria-label={opt.fullLabel}
                      aria-pressed={active}
                      className={`px-2 py-1 rounded-lg font-mono text-xs font-black transition ${
                        active
                          ? 'bg-emerald-400 text-black shadow'
                          : 'text-emerald-200 hover:text-white'
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
                  aria-label="Instalar aplicación en el celular o PC"
                  title="Instalar App en Android, iPhone o PC"
                  className="hidden sm:flex px-2.5 py-2 rounded-xl bg-[#04140b] hover:bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">Instalar</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                aria-label={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
                className={`p-2 rounded-xl border text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  voiceEnabled
                    ? 'bg-[#04140b] border-emerald-400/50 text-emerald-300'
                    : 'bg-[#04140b] border-white/15 text-gray-400'
                }`}
                title={voiceEnabled ? 'Voz activada' : 'Voz en silencio'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={openAddModal}
                aria-label="Abrir Base de Datos y Gestión de Chips"
                title="Agregar o editar chips en la Base de Datos (Con PIN)"
                className="relative px-3 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Database className="w-3.5 h-3.5" />
                <span>BD / +Chip</span>
                {dbStats.pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center border border-black">
                    {dbStats.pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Segunda Fila Exclusiva para Móvil (iPhone 14 Pro / Android): Letra A/A+/A++ + Instalar + Sitio */}
          <div className="flex sm:hidden items-center justify-between gap-2 pt-2 border-t border-emerald-500/25">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-emerald-200">Vista:</span>
              <div
                className="flex items-center p-0.5 rounded-xl bg-[#04140b] border border-emerald-400/40"
                role="group"
                aria-label="Tamaño de letra móvil"
              >
                {TEXT_SCALE_OPTIONS.map((opt) => {
                  const active = textScale === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectTextScale(opt.id)}
                      aria-pressed={active}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-black transition ${
                        active
                          ? 'bg-emerald-400 text-black shadow'
                          : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      {opt.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {!isStandalone && (
                <>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="px-2.5 py-1.5 rounded-xl bg-[#04140b] border border-emerald-400/40 text-emerald-300 font-extrabold text-[11px] flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instalar App</span>
                  </button>
                  <a
                    href="../index.html#app-logica"
                    className="px-2.5 py-1.5 rounded-xl bg-[#04140b] border border-white/15 text-emerald-200 font-bold text-[11px] flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Web</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENEDOR CENTRAL PROFESIONAL */}
      <main className="max-w-5xl w-full mx-auto px-3 sm:px-4 pt-3 sm:pt-5 flex-1">
        {toastMsg && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-20 sm:top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-400 text-black font-black text-xs shadow-2xl flex items-center gap-1.5 whitespace-nowrap border-2 border-white"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {toastMsg}
          </div>
        )}

        {/* BANNER DE INSTALACIÓN RÁPIDA EN CELULAR O PC */}
        {!isStandalone && !installBannerDismissed && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#082214] to-[#081f12] border border-emerald-400/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-400 text-black flex items-center justify-center shrink-0 shadow">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black text-white leading-tight">
                  Instala EcoLógica IC en tu Celular o PC / Laptop
                </p>
                <p className="text-[11px] text-emerald-200/75 break-words">
                  Funciona 100% sin internet y con pantalla blindada para iPhone y Android.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center gap-1.5 shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                {deferredPrompt ? 'Instalar ahora' : 'Cómo instalar'}
              </button>
              <button
                type="button"
                onClick={dismissInstallBanner}
                aria-label="Ocultar aviso de instalación"
                className="p-1.5 rounded-lg text-emerald-300/60 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. VISTA ESCÁNER INTELIGENTE DE CAPACIDAD MÁXIMA                   */}
        {/* ================================================================= */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            {/* CONSOLA DE ESCANEO PRO + DETECTOR DEL CHIP CORRECTO */}
            <div className="rounded-3xl bg-gradient-to-b from-[#082415] to-[#06190e] border-2 border-emerald-500/35 p-3.5 sm:p-5 shadow-2xl space-y-3.5">
              {/* Barra Superior de Diagnóstico en Vivo (Semáforo de Chip Correcto vs Equivocado) */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {cpuWarning ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 text-[11px] font-black uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {cpuWarning.isRamOnlyWarning
                        ? '¡Chip Equivocado! Es pura RAM (Busca el 2º chip)'
                        : `¡Chip Equivocado! Es ${cpuWarning.cpuType}`}
                    </span>
                  ) : activeResult ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ✓ Chip de Memoria Correcto · Capacidad Máxima: {activeResult.storage}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-[11px] font-bold">
                      <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Detector Inteligente: Identifica el Chip Correcto y su Capacidad Máxima
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-emerald-300/75 hidden sm:inline">
                  Auto-corrección óptica O↔0 / I↔1 activa
                </span>
              </div>

              {/* Buscador Principal de Alto Impacto */}
              <div className="relative">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value.toUpperCase())}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Escribe el código del chip (ej. KMDP6001, JXE77, H9HP52, KLUFG...)"
                  aria-label="Escribir código del chip IC"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="w-full pl-12 sm:pl-13 pr-12 py-4 rounded-2xl bg-[#031009] border-2 border-emerald-400/45 focus:border-emerald-300 focus:outline-none font-mono font-black text-lg sm:text-2xl text-white placeholder:text-emerald-100/35 placeholder:font-sans placeholder:font-semibold placeholder:text-xs sm:placeholder:text-sm tracking-wide shadow-inner transition"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Barra de Atajos Rápidos (Carga el valor real del código) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/80 shrink-0 mr-1">
                  Ejemplos:
                </span>
                {QUICK_PREFIXES.map((p) => {
                  const targetVal = p.value || p.label;
                  const isCurrent = normalizeCode(query) === normalizeCode(targetVal);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setQuery(targetVal);
                        inputRef.current?.focus();
                      }}
                      className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold border transition shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                        isCurrent
                          ? 'bg-emerald-400 text-black border-emerald-200 shadow'
                          : 'bg-[#04140b] text-emerald-200 border-emerald-500/25 hover:border-emerald-400/60'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =============================================================== */}
            {/* ALERTA CUANDO EL USUARIO LEE EL CHIP EQUIVOCADO (PURA RAM O CPU) */}
            {/* =============================================================== */}
            {cpuWarning && (
              <div
                role="alert"
                className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-950/90 via-[#1a0b0e] to-[#0f0708] border-2 border-rose-400/80 shadow-2xl space-y-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-500 text-white shrink-0 shadow-lg">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-500/25 border border-rose-400/40 text-rose-200 font-mono text-[10px] font-black uppercase">
                      {cpuWarning.isRamOnlyWarning
                        ? 'DETECTOR DE 2 CHIPS · CHIP DE PURA RAM'
                        : 'DETECTOR DE 2 CHIPS · NO ES LA MEMORIA'}
                    </span>
                    <h2 className="text-sm sm:text-lg font-black text-white leading-snug">
                      {cpuWarning.title || `Detectado: ${cpuWarning.cpuType} (${cpuWarning.cpuBrand})`}
                    </h2>
                    <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                      {cpuWarning.message}
                    </p>
                  </div>
                </div>

                {/* Comparativa visual de los 2 chips en la placa para que nunca se confundan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-black/50 border border-rose-500/40 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-rose-300 block">
                        ✕ Chip que escribiste (Ignorar)
                      </span>
                      <span className="font-mono font-black text-sm text-white">{cpuWarning.code}</span>
                      <span className="text-[11px] text-rose-200/80 block">{cpuWarning.cpuType}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-black text-xs border border-rose-400/30">
                      NO VALE
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-950/60 border-2 border-emerald-400/70 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-300 block">
                        ✓ Busca el 2º Chip en la placa (Leer este)
                      </span>
                      <span className="font-mono font-black text-xs sm:text-sm text-white">
                        KLM / KLU / KM / H9 / HN8T / JZ / SDIN / THG
                      </span>
                      <span className="text-[11px] text-emerald-200 block">
                        Ese chip te dará la Capacidad Máxima (32GB a 2TB)
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-400 text-black font-black text-xs shrink-0">
                      LEER ESTE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TARJETA DE RESULTADO PRO — CAPACIDAD MÁXIMA DESTACADA           */}
            {/* =============================================================== */}
            {activeResult && theme ? (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-3xl border-2 p-4 sm:p-6 shadow-2xl space-y-4 ${theme.card}`}
              >
                {/* Cintillo Superior: Confirmación de Chip Correcto + Auto-Corrección Óptica */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400 text-black text-xs font-black shadow">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      CHIP CORRECTO DE ALMACENAMIENTO
                    </span>

                    {activeResult.correctedTo && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-xs font-bold text-amber-200">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Corregido: {activeResult.correctedFrom} ➔ {activeResult.correctedTo}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono font-bold text-emerald-200/80">
                    {activeResult.source || 'Catálogo Verificado'}
                  </span>
                </div>

                {/* Fila Principal: CAPACIDAD MÁXIMA GIGANTE + Controles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300">
                        ★ CAPACIDAD MÁXIMA (ALMACENAMIENTO REAL)
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <div
                        className={`inline-flex px-6 sm:px-7 py-2.5 sm:py-3 rounded-2xl border-2 font-mono font-black text-5xl sm:text-6xl tracking-tight ${theme.badge}`}
                      >
                        {activeResult.storage || 'N/A'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs sm:text-sm font-black text-white font-mono">
                          {activeResult.code}
                        </div>
                        <div className="text-xs font-bold text-emerald-300">
                          {activeResult.manufacturer} · {activeResult.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción (Voz, Editar, Sumar al Lote) */}
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => speakChipResult(activeResult, true, false)}
                      aria-label="Repetir capacidad en voz alta"
                      className="p-3.5 rounded-2xl bg-[#04120a] hover:bg-black border border-emerald-400/35 text-emerald-300 transition shrink-0"
                      title="Escuchar capacidad en voz alta"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditChipModal(activeResult)}
                      aria-label="Editar información de este chip"
                      className="px-3.5 py-3.5 rounded-2xl bg-[#04120a] hover:bg-white/10 border border-emerald-500/35 text-emerald-200 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                      title="Editar este chip"
                    >
                      <Pencil className="w-4 h-4 text-emerald-400" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => addChipToBatch(activeResult)}
                      className="flex-1 sm:flex-none px-5 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(52,211,153,0.4)] transition"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" /> Sumar {activeResult.storage} al Lote
                    </button>
                  </div>
                </div>

                {/* =========================================================== */}
                {/* ACLARACIÓN AUTOMÁTICA SI EL CHIP TIENE 2 CAPACIDADES (eMCP/uMCP) */}
                {/* =========================================================== */}
                {hasDualMemoryInChip && (
                  <div className="p-3.5 rounded-2xl bg-[#04120a]/90 border-2 border-emerald-400/45 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <Layers className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                      <div className="text-xs">
                        <span className="font-black text-white block">
                          Este chip contiene 2 memorias integradas ({activeResult.type}):
                        </span>
                        <span className="text-emerald-200/85">
                          Toma siempre la <strong className="text-emerald-300 font-black">Capacidad Máxima ({activeResult.storage})</strong> para clasificar tu lógica e ignora la RAM.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-400 text-black font-mono font-black text-xs shadow">
                        ✓ VALE: {activeResult.storage}
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-mono font-bold text-xs line-through">
                        RAM: {activeResult.ram}
                      </div>
                    </div>
                  </div>
                )}

                {/* AVISO SI ESCRIBIÓ UN PREFIJO CORTO QUE TIENE VARIAS CAPACIDADES */}
                {Array.isArray(activeResult.alternativeCapacities) &&
                  activeResult.alternativeCapacities.length > 1 && (
                    <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <span className="text-amber-200 font-bold">
                        ⚡ Esta familia tiene {activeResult.alternativeCapacities.length} versiones ({activeResult.alternativeCapacities.join(' / ')}). Mostrando la{' '}
                        <strong className="text-amber-300 font-black">
                          Capacidad Máxima ({activeResult.storage})
                        </strong>.
                      </span>
                      <span className="text-[11px] font-mono text-amber-300">
                        Escribe 2 letras más para el modelo exacto
                      </span>
                    </div>
                  )}

                {/* 3 Datos Directos Adaptativos: Marca · Capacidad Máxima · RAM Secundaria */}
                <div className="adaptive-meta-grid pt-1">
                  <div className="p-3 rounded-2xl bg-[#04120a] border border-emerald-500/20">
                    <span className="text-[10px] uppercase font-bold text-emerald-300/75 block">
                      Fabricante / Marca
                    </span>
                    <span className="text-xs sm:text-base font-black text-white break-words block mt-0.5">
                      {activeResult.manufacturer}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#04120a] border border-emerald-400/40">
                    <span className="text-[10px] uppercase font-black text-emerald-300 block">
                      ★ Capacidad Máxima (ROM)
                    </span>
                    <span className="text-xs sm:text-base font-black text-emerald-400 break-words block mt-0.5 font-mono">
                      {activeResult.storage} ({activeResult.type})
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#04120a] border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      RAM Secundaria (No clasificar)
                    </span>
                    <span className="text-xs sm:text-base font-bold text-gray-300 break-words block mt-0.5">
                      {activeResult.ram || 'Solo Almacenamiento'}
                    </span>
                  </div>
                </div>

                {/* Desglose Anatómico del Código + Equipos Comunes */}
                {activeDiff && (
                  <div className="p-3.5 rounded-2xl bg-[#04120a] border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="font-mono font-bold text-sm sm:text-base flex items-center flex-wrap break-all">
                        <span className="text-gray-300">{activeDiff.pre}</span>
                        <span className={`px-2 py-0.5 mx-0.5 rounded-lg font-black ${theme.badge}`}>
                          {activeDiff.highlight}
                        </span>
                        <span className="text-gray-300">{activeDiff.post}</span>
                      </div>
                      <span className="font-black text-emerald-300">{activeDiff.why}</span>
                    </div>

                    {(activeResult.explanation || activeResult.commonModels || activeResult.notes) && (
                      <div className="pt-2 border-t border-white/10 text-xs text-emerald-100/85 space-y-1">
                        {activeResult.explanation && <p>{activeResult.explanation}</p>}
                        {(activeResult.commonModels || activeResult.notes) && (
                          <p className="text-gray-300">
                            <strong className="text-emerald-300">Equipos comunes: </strong>
                            {activeResult.commonModels || activeResult.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : query.trim().length >= 2 && suggestions.length === 0 && !cpuWarning ? (
              <div className="p-4 rounded-2xl bg-[#081f12] border border-emerald-500/25 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-white">
                  {isSearchingOnline
                    ? `Buscando "${query}" en base extendida...`
                    : `Código "${query}" no registrado aún`}
                </span>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-3.5 py-2 rounded-xl bg-emerald-400 text-black font-black text-xs shrink-0"
                >
                  + Agregar Chip
                </button>
              </div>
            ) : null}

            {/* =============================================================== */}
            {/* LISTA DE VARIANTES ORDENADAS POR CAPACIDAD MÁXIMA PRIMERO       */}
            {/* =============================================================== */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                    Coincidencias ordenadas por Capacidad Máxima ({suggestions.length})
                  </span>
                  {maxSuggestionItem && (
                    <span className="text-[11px] font-mono font-bold text-amber-300">
                      Máxima en lista: {maxSuggestionItem.storage}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((item, idx) => {
                    const itemTheme = getCapacityTheme(item.storage);
                    const diff = highlightCodeDifference(item);
                    const isMaxItem =
                      maxSuggestionItem &&
                      capacityToGbNumber(item.storage) === capacityToGbNumber(maxSuggestionItem.storage) &&
                      idx === 0;
                    return (
                      <button
                        key={`${item.code}-${item.partNumber}-${idx}`}
                        type="button"
                        onClick={() => handleSelectChip(item)}
                        className={`p-3.5 rounded-2xl bg-[#081f12] hover:bg-[#0b2918] border flex items-center justify-between gap-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                          isMaxItem ? 'border-emerald-400/70 shadow-lg' : 'border-emerald-500/20'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isMaxItem && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-black font-black text-[9px] uppercase">
                                ★ MÁXIMA
                              </span>
                            )}
                            <div className="font-mono font-bold text-sm flex items-center flex-wrap break-all">
                              <span className="text-gray-300">{diff.pre}</span>
                              <span className={`px-1.5 py-0.2 mx-0.5 rounded font-black ${itemTheme.badge}`}>
                                {diff.highlight}
                              </span>
                              <span className="text-gray-300">{diff.post}</span>
                            </div>
                          </div>
                          <div className="text-xs text-emerald-200/75 mt-1 truncate">
                            {item.manufacturer} · {diff.why}
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm border shrink-0 ${itemTheme.badge}`}
                        >
                          {item.storage}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* GUÍA RÁPIDA DE 2 CHIPS + RECIENTES CUANDO EL BUSCADOR ESTÁ VACÍO */}
            {/* =============================================================== */}
            {!query && (
              <div className="space-y-4 pt-1">
                {/* Tarjeta Educativa Rápida: ¿Cuál de los 2 chips de la lógica debo leer? */}
                <div className="rounded-3xl bg-[#071f12] border border-emerald-500/30 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      ¿Ves 2 chips grandes en la placa lógica? Lee siempre el de Almacenamiento:
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tutorial')}
                      className="text-xs font-black text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Ver Guía Visual Completa ➔
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-[#04120a] border-2 border-emerald-400/50 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400 block">
                          ✓ CHIP 1: MEMORIA FLASH (EL QUE VALE)
                        </span>
                        <span className="font-mono font-black text-xs sm:text-sm text-white block mt-0.5">
                          KLM · KLU · KM · H9 · HN8T · JZ · SDIN · THG
                        </span>
                        <span className="text-[11px] text-emerald-200/80 block">
                          Te da la Capacidad Máxima (16GB, 32GB, 64GB, 128GB, 256GB, 512GB, 1TB)
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-400 text-black font-black text-xs shrink-0">
                        CAP. MÁX
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#04120a] border border-rose-500/30 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-rose-400 block">
                          ✕ CHIP 2: PROCESADOR O PURA RAM (IGNORAR)
                        </span>
                        <span className="font-mono font-bold text-xs sm:text-sm text-gray-300 block mt-0.5">
                          Qualcomm SM/PM · MediaTek MT · RAM K4U/H9HCN/D9
                        </span>
                        <span className="text-[11px] text-gray-400 block">
                          Si lo escribes por error, el sistema te avisará de inmediato.
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black text-xs shrink-0">
                        IGNORAR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accesos Rápidos Recientes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/75">
                      Consultas Recientes
                    </span>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar / Editar Chips
                    </button>
                  </div>
                  <div
                    className={`grid gap-2 ${
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
                          className="p-3 rounded-2xl bg-[#081f12] hover:bg-[#0b2918] border border-emerald-500/25 flex items-center justify-between gap-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-xs flex items-center flex-wrap break-all">
                              <span className="text-gray-300">{diff.pre}</span>
                              <span className={`px-1 rounded font-black ${itemTheme.badge}`}>
                                {diff.highlight}
                              </span>
                              <span className="text-gray-300">{diff.post}</span>
                            </div>
                            <span className="text-[11px] text-emerald-300/75 block truncate mt-0.5">
                              {item.manufacturer || item.brand}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs border shrink-0 ${itemTheme.badge}`}
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
        {/* 4. VISTA MI LOTE (CONTADOR Y CORTE WHATSAPP)                      */}
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

      {/* BARRA DE NAVEGACIÓN INFERIOR DE ALTO CONTRASTE PARA IPHONE 14 PRO (LIQUID GLASS) Y ANDROID */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#030e08] border-t border-emerald-500/30 px-2.5 pt-2 ios-bottom-dock shadow-[0_-10px_30px_rgba(0,0,0,0.95)]"
        role="tablist"
        aria-label="Navegación móvil"
      >
        <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto p-1 rounded-2xl bg-[#072214] border-2 border-emerald-400/45 shadow-2xl">
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
                className={`relative py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                  active
                    ? 'bg-emerald-400 text-black font-black shadow'
                    : 'text-emerald-100/80 hover:text-white font-semibold'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] leading-none">{item.label}</span>
                {item.badge > 0 && (
                  <span
                    className={`absolute top-1 right-2.5 px-1.5 py-0.2 rounded-full font-mono font-black text-[10px] ${
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

      {/* MODAL DE INSTALACIÓN PARA ANDROID, IPHONE Y PC */}
      {isInstallModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Instalar aplicación en tu celular"
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
                <div>
                  <h3 className="font-black text-white text-sm sm:text-base">
                    Instalar en Celular o PC / Laptop
                  </h3>
                  <p className="text-[11px] text-emerald-300/75">
                    Acceso rápido desde tu pantalla de inicio en Android, iPhone, Windows y Mac
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(false)}
                aria-label="Cerrar guía de instalación"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Selector Android / iPhone / PC */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#031209] border border-emerald-500/20">
                <button
                  type="button"
                  onClick={() => setInstallPlatformTab('android')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition ${
                    installPlatformTab === 'android'
                      ? 'bg-emerald-400 text-black shadow'
                      : 'text-emerald-200/75 hover:text-white'
                  }`}
                >
                  🤖 Android
                </button>
                <button
                  type="button"
                  onClick={() => setInstallPlatformTab('ios')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition ${
                    installPlatformTab === 'ios'
                      ? 'bg-emerald-400 text-black shadow'
                      : 'text-emerald-200/75 hover:text-white'
                  }`}
                >
                  🍎 iPhone / iPad
                </button>
                <button
                  type="button"
                  onClick={() => setInstallPlatformTab('pc')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition ${
                    installPlatformTab === 'pc'
                      ? 'bg-emerald-400 text-black shadow'
                      : 'text-emerald-200/75 hover:text-white'
                  }`}
                >
                  💻 PC / Laptop
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
                      <Download className="w-4 h-4" /> Instalar en 1 toque ahora
                    </button>
                  )}
                  <div className="p-3.5 rounded-2xl bg-[#031209] border border-emerald-500/20 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                        1
                      </span>
                      <p>
                        Abre el menú de tu navegador Chrome tocando los{' '}
                        <strong className="text-emerald-300">tres puntos (⋮)</strong> arriba a la derecha.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                        2
                      </span>
                      <p>
                        Selecciona{' '}
                        <strong className="text-emerald-300">&ldquo;Instalar aplicación&rdquo;</strong> o{' '}
                        <strong className="text-emerald-300">&ldquo;Agregar a la pantalla principal&rdquo;</strong>.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                        3
                      </span>
                      <p>
                        Confirma en <strong className="text-emerald-300">Instalar</strong> y el ícono de{' '}
                        <strong>EcoLógica IC</strong> aparecerá junto a tus apps.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {installPlatformTab === 'ios' && (
                <div className="space-y-3 text-xs sm:text-sm text-emerald-100">
                  <div className="p-3.5 rounded-2xl bg-[#031209] border border-emerald-500/20 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                        1
                      </span>
                      <p className="flex-1">
                        En <strong>Safari</strong>, toca el botón{' '}
                        <strong className="text-emerald-300 inline-flex items-center gap-1">
                          Compartir <Share className="w-3.5 h-3.5 inline" />
                        </strong>{' '}
                        en la barra inferior de tu iPhone.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                        2
                      </span>
                      <p>
                        Desliza hacia abajo y toca{' '}
                        <strong className="text-emerald-300">&ldquo;Agregar a inicio&rdquo;</strong>{' '}
                        (Add to Home Screen).
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                        3
                      </span>
                      <p>
                        Toca <strong className="text-emerald-300">Agregar</strong> arriba a la derecha. ¡Listo!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {installPlatformTab === 'pc' && (
                <div className="space-y-3 text-xs sm:text-sm text-emerald-100">
                  {deferredPrompt && (
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <Download className="w-4 h-4" /> Instalar en mi PC / Laptop ahora
                    </button>
                  )}
                  <div className="p-3.5 rounded-2xl bg-[#031209] border border-emerald-500/20 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                        1
                      </span>
                      <p>
                        En <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong> desde tu PC o Laptop, mira el lado derecho de la barra de direcciones (URL).
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                        2
                      </span>
                      <p>
                        Haz clic en el ícono <strong className="text-emerald-300">&ldquo;Instalar Eco Lógica García&rdquo;</strong> o abre el menú <strong>⋮ ➔ Guardar y compartir ➔ Instalar página como app</strong>.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-black text-xs flex items-center justify-center shrink-0">
                        3
                      </span>
                      <p>
                        Se creará un acceso directo en tu Escritorio y Barra de tareas que abre en ventana propia para trabajar más rápido.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Una vez instalada, abre en pantalla completa desde tu dispositivo como aplicación oficial.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AVISO DE COOKIES Y ALMACENAMIENTO LOCAL (Solo la primera vez) */}
      {!cookieAccepted && (
        <aside
          role="region"
          aria-label="Aviso de cookies y almacenamiento local"
          className="fixed bottom-16 md:bottom-4 left-3 right-3 z-50 max-w-4xl mx-auto p-4 rounded-2xl bg-[#04160b]/95 backdrop-blur-xl border border-emerald-400/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
        >
          <div className="text-xs text-emerald-100/90 space-y-1">
            <strong className="text-white font-black block text-sm">
              Aviso de Cookies y Almacenamiento Local
            </strong>
            <p className="leading-relaxed">
              Esta aplicación utiliza almacenamiento local únicamente para guardar tus preferencias (como tu contador de lote, tamaño de letra e historial reciente), sin cookies de rastreo ni publicidad.{' '}
              <a
                href="../aviso-privacidad.html#cookies"
                className="text-emerald-400 underline font-bold hover:text-emerald-300"
              >
                Ver aviso de privacidad
              </a>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleAcceptCookies('essential')}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-emerald-100 font-bold text-xs transition"
            >
              Solo esenciales
            </button>
            <button
              type="button"
              onClick={() => handleAcceptCookies('accepted')}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs shadow transition"
            >
              Aceptar y continuar
            </button>
          </div>
        </aside>
      )}

      {/* MODAL BASE DE DATOS, MULTI-ALTA Y EDICIÓN CON PIN ADMIN */}
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
