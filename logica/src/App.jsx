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
  WifiOff,
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

function getCapacityTheme(storageStr) {
  const s = String(storageStr || '').toUpperCase().trim();
  const num = parseInt(s.replace(/\D/g, ''), 10) || 0;
  if (s.includes('TB') || num >= 512) {
    return {
      badge: 'bg-rose-500 text-white border-rose-300',
      card: 'border-rose-500/50 bg-[#081f12]',
    };
  }
  if (num === 256) {
    return {
      badge: 'bg-purple-500 text-white border-purple-300',
      card: 'border-purple-500/50 bg-[#081f12]',
    };
  }
  if (num === 128) {
    return {
      badge: 'bg-amber-400 text-black border-amber-200',
      card: 'border-amber-400/50 bg-[#081f12]',
    };
  }
  if (num === 64) {
    return {
      badge: 'bg-emerald-400 text-black border-emerald-200',
      card: 'border-emerald-400/60 bg-[#081f12]',
    };
  }
  if (num === 32) {
    return {
      badge: 'bg-cyan-400 text-black border-cyan-200',
      card: 'border-cyan-400/50 bg-[#081f12]',
    };
  }
  return {
    badge: 'bg-sky-400 text-black border-sky-200',
    card: 'border-sky-400/50 bg-[#081f12]',
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

  const [recentHistory, setRecentHistory] = useState(() =>
    safeGetStorage('eco_recent_history_v1', SEED_IC_CATALOG.slice(0, 6))
  );

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
  const [petalsPaused, setPetalsPaused] = useState(() => {
    try {
      return localStorage.getItem('eco_temporada_petals_paused_v1') === '1';
    } catch {
      return false;
    }
  });

  function togglePetals() {
    setPetalsPaused((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('eco_temporada_petals_paused_v1', next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }

  function handleAcceptCookies(mode = 'accepted') {
    try {
      localStorage.setItem('eco_cookie_notice_accepted_v1', mode);
    } catch {
      // ignorar
    }
    setCookieAccepted(true);
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

    // Si viene ?instalar=1 desde la página principal, abre la guía o lanza el instalador
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

    // 1. Verificar si escribió el código de un Procesador (CPU) en lugar del chip de Memoria
    const cpuDetected = detectCpuInsteadOfMemory(clean);
    setCpuWarning(cpuDetected);

    // 2. Buscar sugerencias instantáneas (con corrección óptica integrada)
    const instantList = searchChipsInstant(clean, 8);
    setSuggestions(instantList);

    // 3. Decodificación directa offline
    const direct = decodeChipOffline(clean);
    if (direct && (direct.storage || direct.ram)) {
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

    setActiveResult(null);
    if (clean.length >= 4 && !cpuDetected) {
      let cancelled = false;
      setIsSearchingOnline(true);
      const timer = setTimeout(async () => {
        const learned = await lookupOnlineFallbackAndLearn(clean);
        if (!cancelled) {
          setIsSearchingOnline(false);
          if (learned) {
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
  }, [query]);

  function pushToRecent(chip) {
    if (!chip || !chip.code) return;
    setRecentHistory((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const filtered = list.filter((x) => normalizeCode(x.code) !== normalizeCode(chip.code));
      const next = [chip, ...filtered].slice(0, 6);
      safeSetStorage('eco_recent_history_v1', next);
      return next;
    });
  }

  function handleSelectChip(chip) {
    if (!chip) return;
    const targetCode = chip.code || chip.partNumber;
    setActiveTab('search');
    setQuery(targetCode);
    const full = decodeChipOffline(targetCode) || chip;
    setActiveResult(full);
    lastSpokenCodeRef.current = `${normalizeCode(targetCode)}:${full.storage}`;
    playDetectionBeep(full.storage);
    speakChipResult(full, voiceEnabled, false);
    pushToRecent(full);
  }

  function addChipToBatch(chip) {
    if (!chip || !chip.storage) return;
    const bucket = normalizeBucketKey(chip.storage);
    setBatchCounts((prev) => ({
      ...prev,
      [bucket]: (prev[bucket] || 0) + 1,
    }));
    playDetectionBeep(chip.storage);
    speakChipResult(chip, voiceEnabled, true);
    setToastMsg(`+1 (${chip.storage}) sumada al lote`);
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

  const navItems = [
    { id: 'search', label: 'Buscador', icon: Search },
    { id: 'tables', label: 'Tablas', icon: Table2 },
    { id: 'tutorial', label: 'Guía Visual', icon: Eye },
    { id: 'batch', label: 'Mi Lote', icon: PackageCheck, badge: totalBatchPieces },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-[#04120a] text-white pb-24 md:pb-10">
      {/* CABECERA MINIMALISTA Y PROFESIONAL */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#04120a]/95 border-b border-emerald-500/15">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Identidad Eco Lógica García + Regreso al sitio web */}
          <div className="flex items-center gap-2 min-w-0">
            {!isStandalone && (
              <a
                href="../index.html#app-logica"
                title="Volver a ecologicagarcia.com"
                aria-label="Volver a la página principal de Eco Lógica García"
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sitio</span>
              </a>
            )}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black tracking-tight text-white text-xs sm:text-base leading-none truncate">
                ECO LÓGICA <span className="text-emerald-400">GARCÍA</span>
              </h1>
              <span className="text-[10px] sm:text-[11px] text-emerald-300/70 font-medium block truncate mt-0.5">
                {dbStats.totalOfflineCount.toLocaleString()} chips registrados
              </span>
            </div>
          </div>

          {/* Navegación Desktop */}
          <nav
            className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-[#081f12] border border-emerald-500/20"
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
                      : 'text-emerald-100/75 hover:text-white'
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

          {/* Controles Rápidos: Instalar App + Día de Muertos + Voz + Base de Datos */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {!isStandalone && (
              <button
                type="button"
                onClick={handleInstallClick}
                aria-label="Instalar aplicación en el celular o PC"
                title="Instalar App en Android, iPhone o PC"
                className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs flex items-center gap-1 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Instalar</span>
              </button>
            )}

            <button
              type="button"
              onClick={togglePetals}
              aria-label={petalsPaused ? 'Activar pétalos de cempasúchil' : 'Pausar pétalos'}
              title={petalsPaused ? 'Pétalos pausados' : 'Día de Muertos activo'}
              className={`p-1.5 sm:p-2 rounded-xl border text-xs font-bold transition ${
                !petalsPaused
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-gray-500'
              }`}
            >
              <span className="text-xs sm:text-sm">🏵️</span>
            </button>

            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              aria-label={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
              className={`p-1.5 sm:p-2 rounded-xl border text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                voiceEnabled
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-gray-500'
              }`}
              title={voiceEnabled ? 'Voz activada' : 'Voz en silencio'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              aria-label="Abrir Base de Datos"
              className="relative px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">BD</span>
              {dbStats.pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center border border-black">
                  {dbStats.pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Cenefa de Papel Picado Artesanal (Temporada Día de Muertos) */}
        <div className="logica-papel-picado" aria-hidden="true" />
      </header>

      {/* Lluvia ligera de Pétalos de Cempasúchil flotantes en el fondo */}
      {!petalsPaused && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
          {[6, 18, 31, 44, 57, 70, 83, 94].map((left, idx) => (
            <span
              key={left}
              className="logica-petal"
              style={{
                left: `${left}%`,
                animationDuration: `${14 + (idx % 4) * 2.5}s`,
                animationDelay: `-${idx * 2.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* CONTENEDOR CENTRAL LIMPIO Y PROFESIONAL */}
      <main className="max-w-5xl w-full mx-auto px-3 sm:px-4 pt-3 sm:pt-6 flex-1">
        {toastMsg && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-400 text-black font-black text-xs shadow-2xl flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
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
                <p className="text-[11px] text-emerald-200/75 truncate">
                  Acceso rápido desde tu pantalla de inicio, Android, iPhone y PC.
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
        {/* 1. VISTA BUSCADOR                                                 */}
        {/* ================================================================= */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            {/* Barra de Atajos de Prefijos */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PREFIXES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setQuery(p.label);
                    inputRef.current?.focus();
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    query.startsWith(p.label)
                      ? 'bg-emerald-400 text-black border-emerald-200'
                      : 'bg-[#081f12] text-emerald-200 border-emerald-500/20 hover:border-emerald-400/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Buscador Principal */}
            <div className="relative">
              <Search className="w-5 h-5 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                onKeyDown={handleSearchKeyDown}
                placeholder="Código del chip (ej. JZ008, KMDP6001, H9TQ27...)"
                aria-label="Escribir código del chip IC"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#081f12] border-2 border-emerald-500/35 focus:border-emerald-400 focus:outline-none font-mono font-black text-lg sm:text-xl text-white placeholder:text-emerald-100/30 placeholder:font-sans placeholder:font-medium placeholder:text-sm tracking-wide transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ALERTA INTELIGENTE SI ESCRIBIÓ UN PROCESADOR (CPU) EN VEZ DE MEMORIA */}
            {cpuWarning && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-400/60 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-100 space-y-1">
                  <div className="font-black text-amber-300">
                    Detectado: {cpuWarning.cpuType} ({cpuWarning.cpuBrand})
                  </div>
                  <p>{cpuWarning.message}</p>
                </div>
              </div>
            )}

            {/* TARJETA DE RESULTADO LIMPIA Y DIRECTA */}
            {activeResult && theme ? (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-3xl border-2 p-5 sm:p-6 shadow-2xl space-y-5 ${theme.card}`}
              >
                {/* Aviso si se auto-corrigió un error óptico (ej. JZOO8 -> JZ008) */}
                {activeResult.correctedTo && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Auto-corregido: {activeResult.correctedFrom} ➔ {activeResult.correctedTo}
                  </div>
                )}

                {/* Fila Principal: Capacidad Gigante + Botón Sumar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-300/70 block mb-1">
                      Almacenamiento
                    </span>
                    <div
                      className={`inline-flex px-5 sm:px-6 py-2 sm:py-2.5 rounded-2xl border-2 font-mono font-black text-4xl sm:text-6xl tracking-tight shadow-xl ${theme.badge}`}
                    >
                      {activeResult.storage || 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => speakChipResult(activeResult, true, false)}
                      aria-label="Repetir capacidad en voz alta"
                      className="p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 text-emerald-300 transition shrink-0"
                      title="Escuchar voz"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => addChipToBatch(activeResult)}
                      className="flex-1 sm:flex-none px-4 sm:px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition"
                    >
                      <Plus className="w-4 h-4" /> Sumar al Lote
                    </button>
                  </div>
                </div>

                {/* 3 Datos Directos: Marca · RAM · Tipo */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-2 border-t border-white/10">
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#04120a] border border-white/5">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-300/60 block">
                      Marca
                    </span>
                    <span className="text-xs sm:text-base font-black text-white truncate block mt-0.5">
                      {activeResult.manufacturer}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#04120a] border border-white/5">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-300/60 block">
                      RAM
                    </span>
                    <span className="text-xs sm:text-base font-black text-emerald-300 truncate block mt-0.5">
                      {activeResult.ram || '—'}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#04120a] border border-white/5">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-300/60 block">
                      Tipo
                    </span>
                    <span className="text-xs sm:text-base font-black text-white truncate block mt-0.5">
                      {activeResult.type}
                    </span>
                  </div>
                </div>

                {/* Barra de Código con la Diferencia Remarcada */}
                {activeDiff && (
                  <div className="px-4 py-3 rounded-2xl bg-[#04120a] border border-emerald-500/25 flex items-center justify-between gap-2 text-xs">
                    <div className="font-mono font-bold text-sm flex items-center">
                      <span className="text-gray-400">{activeDiff.pre}</span>
                      <span className={`px-1.5 py-0.5 mx-0.5 rounded font-black ${theme.badge}`}>
                        {activeDiff.highlight}
                      </span>
                      <span className="text-gray-400">{activeDiff.post}</span>
                    </div>
                    <span className="font-bold text-emerald-300">{activeDiff.why}</span>
                  </div>
                )}
              </div>
            ) : query.trim().length >= 2 && suggestions.length === 0 && !cpuWarning ? (
              <div className="p-4 rounded-2xl bg-[#081f12] border border-emerald-500/25 flex items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-bold text-white">
                  {isSearchingOnline
                    ? `Buscando "${query}"...`
                    : `Código "${query}" no registrado aún`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdminOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-400 text-black font-black text-xs shrink-0"
                >
                  + Agregar
                </button>
              </div>
            ) : null}

            {/* Sugerencias limpias cuando escribe */}
            {suggestions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((item) => {
                  const itemTheme = getCapacityTheme(item.storage);
                  const diff = highlightCodeDifference(item);
                  return (
                    <button
                      key={`${item.code}-${item.partNumber}`}
                      type="button"
                      onClick={() => handleSelectChip(item)}
                      className="p-3.5 rounded-2xl bg-[#081f12] hover:bg-[#0b2918] border border-emerald-500/20 flex items-center justify-between gap-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      <div className="min-w-0">
                        <div className="font-mono font-bold text-sm flex items-center">
                          <span className="text-gray-300">{diff.pre}</span>
                          <span className={`px-1.5 py-0.2 mx-0.5 rounded font-black ${itemTheme.badge}`}>
                            {diff.highlight}
                          </span>
                          <span className="text-gray-300 truncate">{diff.post}</span>
                        </div>
                        <div className="text-xs text-emerald-200/70 mt-0.5">
                          {item.manufacturer} · {diff.why}
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-xl font-mono font-black text-sm border shrink-0 ${itemTheme.badge}`}
                      >
                        {item.storage}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Acceso rápido a recientes cuando el buscador está vacío */}
            {!query && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/60 px-1">
                  Accesos Rápidos
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {recentHistory.map((item) => {
                    const itemTheme = getCapacityTheme(item.storage);
                    const diff = highlightCodeDifference(item);
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleSelectChip(item)}
                        className="p-3 rounded-2xl bg-[#081f12] hover:bg-[#0b2918] border border-emerald-500/15 flex items-center justify-between gap-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                      >
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-xs flex items-center">
                            <span className="text-gray-300">{diff.pre}</span>
                            <span className={`px-1 rounded font-black ${itemTheme.badge}`}>
                              {diff.highlight}
                            </span>
                            <span className="text-gray-300 truncate">{diff.post}</span>
                          </div>
                          <span className="text-[11px] text-emerald-300/60 block truncate mt-0.5">
                            {item.manufacturer}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs border shrink-0 ${itemTheme.badge}`}
                        >
                          {item.storage}
                        </span>
                      </button>
                    );
                  })}
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

      {/* BARRA DE NAVEGACIÓN INFERIOR ESTILO iOS PARA iPHONE 14 PRO Y ANDROID */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-2xl bg-[#04120a]/95 border-t border-emerald-500/20 px-2 pb-[env(safe-area-inset-bottom,8px)] pt-1.5"
        role="tablist"
        aria-label="Navegación móvil"
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
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
                className={`relative py-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition ${
                  active ? 'text-emerald-400 font-black' : 'text-gray-400 font-semibold'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] leading-none">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute top-1 right-4 px-1.5 py-0.2 rounded-full bg-emerald-400 text-black font-mono font-black text-[10px]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MODAL DE INSTALACIÓN PARA ANDROID Y IPHONE */}
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
              Esta aplicación utiliza almacenamiento local únicamente para guardar tus preferencias (como tu contador de lote e historial reciente), sin cookies de rastreo ni publicidad.{' '}
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

      {/* MODAL BASE DE DATOS Y PIN ADMIN */}
      <AdminDatabaseModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        initialCode={activeResult ? '' : query}
        onDatabaseUpdated={() => {
          setDbStats(getDatabaseStats());
          if (query) {
            const refreshed = decodeChipOffline(query);
            if (refreshed) setActiveResult(refreshed);
          }
        }}
      />
    </div>
  );
}
