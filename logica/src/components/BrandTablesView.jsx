import React, { useState, useMemo } from 'react';
import { Plus, Search, X, Pencil, ArrowUpDown } from 'lucide-react';
import {
  getAllEditableCatalog,
  capacityToGbNumber,
  getUsageProfile,
  getMostSearchedChips,
  normalizeCode,
} from '../services/icEngine';

// Extrae la anatomía exacta del código (Inicio + Clave de Capacidad + Terminación) y explicación técnica MIC
export function highlightCodeDifference(item) {
  if (!item || !item.code) {
    return { pre: '', highlight: '', post: '', why: '', ruleDetail: '' };
  }
  const rawCode = String(item.code || '').toUpperCase();
  const repCode = String(item.representativePart || item.partNumber || rawCode).toUpperCase();
  const code = rawCode.length < 7 && repCode.startsWith(rawCode) ? repCode : rawCode;
  const isCompletedFromPrefix = code !== rawCode;
  const cap = item.storage || item.capacity || '64GB';

  if (/^KL[MU][48ABCDEFGH]G/.test(code)) {
    const seg = code.slice(3, 5);
    return {
      pre: code.slice(0, 3),
      highlight: seg,
      post: code.slice(5),
      isCompletedFromPrefix,
      why: `Clave "${seg}" = ${cap}`,
      ruleDetail: `Regla Samsung ${code.startsWith('KLU') ? 'UFS' : 'eMMC'}: las letras "${seg}" en la posición 4–5 definen ${cap} (4G=4GB, 8G=8GB, AG=16GB, BG=32GB, CG=64GB, DG=128GB, EG=256GB, FG=512GB, GG=1TB).`,
    };
  }

  if (/^KM[23589][VFPLHBC][6789]/.test(code)) {
    const seg = code.slice(3, 5);
    return {
      pre: code.slice(0, 3),
      highlight: seg,
      post: code.slice(5),
      isCompletedFromPrefix,
      why: `Clave "${seg}" = ${cap}`,
      ruleDetail: `Regla Samsung uMCP (MIC): la 4.ª letra "${code[3]}" define el almacenamiento UFS (${code[3]} = ${cap}; P/H/C=64GB, V/L=128GB, F/B=256GB) y el 5.º dígito "${code[4]}" define la RAM (${item.ram || 'LPDDR4X/5'}).`,
    };
  }

  if (/^KM[A-Z0-9]{2}/.test(code)) {
    const seg = code.slice(2, 4);
    const ninth = code.length >= 10 ? code.slice(8, 10) : '';
    return {
      pre: 'KM',
      highlight: seg,
      post: code.slice(4),
      isCompletedFromPrefix,
      why: `Serie "${seg}" = ${cap}`,
      ruleDetail: `Regla Samsung eMCP (MIC): la serie "KM${seg}"${ninth ? ` con bloque "${ninth}"` : ''} corresponde a ${cap} de almacenamiento Flash eMMC + ${item.ram ? `${item.ram} RAM` : 'RAM integrada'}.`,
    };
  }

  if (/^(H9TP|H9TQ|H9HP|H9HK|H9HQ|H9QT|H9HR|H26M|H28U|H28S|HN8T)/.test(code) && code.length >= 6) {
    const seg = code.slice(4, 6);
    return {
      pre: code.slice(0, 4),
      highlight: seg,
      post: code.slice(6),
      isCompletedFromPrefix,
      why: `Código "${seg}" = ${cap}`,
      ruleDetail: `Regla SK Hynix (MIC): los caracteres "${seg}" en la posición 5–6 de "${code.slice(0, 6)}" indican ${cap} de almacenamiento Flash.`,
    };
  }

  const sdinMatch = code.match(/^(SDIN[A-Z0-9]+-)(\d+[GT]B?)(.*)$/);
  if (sdinMatch) {
    return {
      pre: sdinMatch[1],
      highlight: sdinMatch[2],
      post: sdinMatch[3] || '',
      isCompletedFromPrefix,
      why: `Final "${sdinMatch[2]}" = ${cap}`,
      ruleDetail: `Regla SanDisk / WD iNAND: el número después del guion ("-${sdinMatch[2]}") indica directamente ${cap} de almacenamiento.`,
    };
  }

  if (/^THG(BM|AF|BX|LF|JF|BH)/.test(code) && code.length >= 8) {
    const m = code.slice(4, 10).match(/(G[56789]|T[01234])/);
    if (m) {
      const idx = code.indexOf(m[1], 4);
      return {
        pre: code.slice(0, idx),
        highlight: m[1],
        post: code.slice(idx + 2),
        isCompletedFromPrefix,
        why: `Centro "${m[1]}" = ${cap}`,
        ruleDetail: `Regla Kioxia / Toshiba: el código central "${m[1]}" define ${cap} (G5=4GB, G6=8GB, G7=16GB, G8=32GB, G9=64GB, T0=128GB, T1=256GB, T2=512GB, T3=1TB).`,
      };
    }
  }

  if (/^K[56][AB][3456789]/.test(code)) {
    return {
      pre: code.slice(0, 3),
      highlight: code.slice(3, 4),
      post: code.slice(4),
      isCompletedFromPrefix,
      why: `Clave "${code[3]}" = ${cap}`,
      ruleDetail: `Regla Apple / Kioxia NAND: el 4.º carácter "${code[3]}" define directamente ${cap} de almacenamiento NAND.`,
    };
  }

  if (/^KICM22[345678]/.test(code)) {
    return {
      pre: 'KICM',
      highlight: code.slice(4, 7),
      post: code.slice(7),
      isCompletedFromPrefix,
      why: `Clave "${code.slice(4, 7)}" = ${cap}`,
      ruleDetail: `Regla Apple / Kioxia NAND: el bloque "${code.slice(4, 7)}" indica ${cap} de almacenamiento.`,
    };
  }

  const h23Match = code.match(/^(H23[QB0]|H2JTD)(DG8|EG8|EH8|FG8|1T8|158|2T8|4T8|8T8)(.*)$/);
  if (h23Match) {
    return {
      pre: h23Match[1],
      highlight: h23Match[2],
      post: h23Match[3] || '',
      isCompletedFromPrefix,
      why: `Clave "${h23Match[2]}" = ${cap}`,
      ruleDetail: `Regla Apple / SK Hynix NAND: el bloque "${h23Match[2]}" indica ${cap} (DG8=16GB, EG8=32GB, FG8=64GB, 1T8=128GB, 2T8=256GB, 4T8=512GB).`,
    };
  }

  const embeddedGbMatch = code.match(/^([A-Z0-9_-]*?)(004G|008G|016G|032G|064G|128G|256G|512G|4G|8G|16G|32G|64G|1T|2T)([A-Z0-9_-]*)$/);
  if (embeddedGbMatch && embeddedGbMatch[1].length >= 2) {
    return {
      pre: embeddedGbMatch[1],
      highlight: embeddedGbMatch[2],
      post: embeddedGbMatch[3] || '',
      isCompletedFromPrefix,
      why: `Clave "${embeddedGbMatch[2]}" = ${cap}`,
      ruleDetail: `El bloque numérico "${embeddedGbMatch[2]}" dentro del código indica directamente ${cap} de almacenamiento.`,
    };
  }

  if (/^J[A-Z0-9]{4}$/.test(rawCode)) {
    return {
      pre: rawCode.slice(0, 2),
      highlight: rawCode.slice(2),
      post: item.partNumber && item.partNumber !== rawCode ? ` → ${item.partNumber}` : '',
      isCompletedFromPrefix: false,
      why: `FBGA "${rawCode}" = ${cap}`,
      ruleDetail: `Código corto FBGA de Micron ("${rawCode}") decodificado en base oficial MIC${item.partNumber && item.partNumber !== rawCode ? ` como ${item.partNumber}` : ''} = ${cap}.`,
    };
  }

  if (item.ruleSegment && code.includes(item.ruleSegment.toUpperCase())) {
    const seg = item.ruleSegment.toUpperCase();
    const idx = code.indexOf(seg);
    return {
      pre: code.slice(0, idx),
      highlight: code.slice(idx, idx + seg.length),
      post: code.slice(idx + seg.length),
      isCompletedFromPrefix,
      why: `Clave "${seg}" = ${cap}`,
      ruleDetail: item.explanation || `El segmento "${seg}" identifica la capacidad de ${cap} en esta serie.`,
    };
  }

  return {
    pre: '',
    highlight: code,
    post: '',
    isCompletedFromPrefix,
    why: `Capacidad ${cap}`,
    ruleDetail: item.explanation || item.notes || `Memoria verificada de ${cap}.`,
  };
}

export function getCapacityPillStyle(storageStr) {
  const s = String(storageStr || '').toUpperCase();
  const num = parseInt(s.replace(/\D/g, ''), 10) || 0;
  if (s.includes('TB') || num >= 512) return 'bg-rose-500 text-white border-rose-300';
  if (num === 256) return 'bg-purple-500 text-white border-purple-300';
  if (num === 128) return 'bg-amber-400 text-black border-amber-200';
  if (num === 64) return 'bg-emerald-400 text-black border-emerald-200';
  if (num === 32) return 'bg-cyan-400 text-black border-cyan-200';
  return 'bg-sky-400 text-black border-sky-200';
}

export default function BrandTablesView({
  onSelectChip,
  onAddChipToBatch,
  onEditChip,
  catalogVersion = 0,
  usageVersion = 0,
}) {
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCapacity, setSelectedCapacity] = useState('ALL');
  const [tableFilter, setTableFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'desc' | 'asc'

  const brandTabs = [
    { id: 'ALL', label: 'Todas' },
    { id: 'MOST_SEARCHED', label: 'Más Buscados' },
    { id: 'Samsung', label: 'Samsung' },
    { id: 'Micron', label: 'Micron (JW/JX/JZ)' },
    { id: 'SK Hynix', label: 'SK Hynix' },
    { id: 'SanDisk', label: 'SanDisk / WD' },
    { id: 'Kioxia', label: 'Kioxia / Toshiba' },
    { id: 'iPhone', label: 'Apple / iPhone NAND' },
    { id: 'Kingston', label: 'Kingston' },
    { id: 'FORESEE', label: 'FORESEE (Longsys)' },
    { id: 'YMTC', label: 'YMTC (Huawei)' },
    { id: 'RARE', label: 'BIWIN / Rayson / Phison / Otras' },
  ];

  const capacityTabs = ['ALL', '4GB', '8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];

  const usageMap = useMemo(() => {
    const profile = getUsageProfile();
    return profile.chips || {};
  }, [usageVersion, catalogVersion]);

  const allCatalog = useMemo(() => {
    return getAllEditableCatalog();
  }, [catalogVersion]);

  const filteredCatalog = useMemo(() => {
    const baseList =
      selectedBrand === 'MOST_SEARCHED' ? getMostSearchedChips(24) : allCatalog;

    const filtered = baseList.filter((item) => {
      const mfg = String(item.manufacturer || item.brand || '').toLowerCase();
      if (selectedBrand !== 'ALL' && selectedBrand !== 'MOST_SEARCHED') {
        const b = selectedBrand.toLowerCase();
        if (selectedBrand === 'iPhone') {
          if (!mfg.includes('apple') && !mfg.includes('iphone')) {
            return false;
          }
        } else if (selectedBrand === 'Kioxia') {
          if ((!mfg.includes('kioxia') && !mfg.includes('toshiba')) || mfg.includes('iphone')) {
            return false;
          }
        } else if (selectedBrand === 'RARE') {
          if (
            !mfg.includes('biwin') &&
            !mfg.includes('rayson') &&
            !mfg.includes('scy') &&
            !mfg.includes('phison') &&
            !mfg.includes('silicon') &&
            !mfg.includes('skyhigh') &&
            !mfg.includes('cypress') &&
            !mfg.includes('dosilicon') &&
            !mfg.includes('xincun')
          ) {
            return false;
          }
        } else if (!mfg.includes(b)) {
          return false;
        }
      }

      if (selectedCapacity !== 'ALL') {
        const capNorm = String(item.storage || item.capacity || '').toUpperCase();
        if (capNorm !== selectedCapacity) {
          return false;
        }
      }

      if (tableFilter.trim()) {
        const q = tableFilter.toUpperCase().trim();
        const matchCode = String(item.code || '').toUpperCase().includes(q);
        const matchPn = String(item.partNumber || '').toUpperCase().includes(q);
        const matchBrand = String(item.manufacturer || item.brand || '').toUpperCase().includes(q);
        const matchAliases =
          Array.isArray(item.aliases) && item.aliases.some((al) => String(al).toUpperCase().includes(q));
        const matchModels = String(item.commonModels || item.notes || '').toUpperCase().includes(q);
        if (!matchCode && !matchPn && !matchBrand && !matchAliases && !matchModels) return false;
      }

      return true;
    });

    if (sortOrder === 'desc') {
      return [...filtered].sort(
        (a, b) => capacityToGbNumber(b.storage || b.capacity) - capacityToGbNumber(a.storage || a.capacity)
      );
    }
    if (sortOrder === 'asc') {
      return [...filtered].sort(
        (a, b) => capacityToGbNumber(a.storage || a.capacity) - capacityToGbNumber(b.storage || b.capacity)
      );
    }
    return filtered;
  }, [allCatalog, selectedBrand, selectedCapacity, tableFilter, sortOrder, usageVersion]);

  function cycleSortOrder() {
    setSortOrder((prev) => (prev === 'default' ? 'desc' : prev === 'desc' ? 'asc' : 'default'));
  }

  const hasActiveFilter = selectedBrand !== 'ALL' || selectedCapacity !== 'ALL' || Boolean(tableFilter.trim());

  return (
    <div className="space-y-3">
      {/* BARRA DE FILTROS DEL CATÁLOGO */}
      <div className="rounded-2xl pro-panel-elevated p-3.5 sm:p-4 space-y-3">
        {/* Marcas + Buscador */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar" role="tablist">
            {brandTabs.map((b) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={selectedBrand === b.id}
                onClick={() => setSelectedBrand(b.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  selectedBrand === b.id
                    ? 'bg-emerald-400 text-black border-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.3)]'
                    : 'pro-inset text-emerald-100/80 hover:border-emerald-400/50'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              placeholder="Filtrar código, marca o equipo..."
              aria-label="Filtrar códigos en la tabla"
              className="w-full pl-9 pr-8 py-2 rounded-xl pro-inset text-base sm:text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
            />
            {tableFilter && (
              <button
                type="button"
                onClick={() => setTableFilter('')}
                aria-label="Limpiar filtro"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filtro de Capacidades + Ordenamiento */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            {capacityTabs.map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => setSelectedCapacity(cap)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border transition shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  selectedCapacity === cap
                    ? 'bg-white text-black border-white'
                    : 'pro-inset text-emerald-200/80 hover:border-emerald-400/50'
                }`}
              >
                {cap === 'ALL' ? 'Todos los GB' : cap}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('ALL');
                  setSelectedCapacity('ALL');
                  setTableFilter('');
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-200"
              >
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={cycleSortOrder}
              className="px-2.5 py-1 rounded-lg pro-inset hover:border-emerald-400/50 text-[11px] font-mono font-bold text-emerald-300 flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>
                {sortOrder === 'desc'
                  ? 'Mayor a Menor'
                  : sortOrder === 'asc'
                    ? 'Menor a Mayor'
                    : `${filteredCatalog.length} familias`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* GRID ADAPTATIVO O MENSAJE VACÍO */}
      {filteredCatalog.length === 0 ? (
        <div className="rounded-2xl pro-panel p-8 text-center space-y-2">
          <p className="text-sm font-bold text-white">No hay códigos con ese filtro exacto</p>
          <button
            type="button"
            onClick={() => {
              setSelectedBrand('ALL');
              setSelectedCapacity('ALL');
              setTableFilter('');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-400 text-black font-black text-xs"
          >
            Mostrar todos los chips
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredCatalog.map((item) => {
            const diff = highlightCodeDifference(item);
            const storageVal = item.storage || item.capacity || '64GB';
            const pillStyle = getCapacityPillStyle(storageVal);
            const stat = usageMap[normalizeCode(item.code)];
            const totalUses = stat ? (stat.readCount || 0) + (stat.batchCount || 0) : 0;
            return (
              <div
                key={item.code}
                className="p-3 rounded-2xl pro-panel hover:border-emerald-400/50 flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap transition"
              >
                <button
                  type="button"
                  onClick={() => onSelectChip(item)}
                  className="min-w-0 text-left flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl"
                >
                  <div className="font-mono font-bold text-sm sm:text-base flex items-center flex-wrap break-all">
                    <span className="text-gray-300">{diff.pre}</span>
                    <span
                      className={`px-1.5 py-0.5 mx-0.5 rounded-md font-black text-xs sm:text-sm shadow ${pillStyle}`}
                    >
                      {diff.highlight}
                    </span>
                    <span className="text-gray-300">{diff.post}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-200/80 flex-wrap">
                    <span className="font-bold text-white">{item.manufacturer || item.brand}</span>
                    <span>·</span>
                    <span className="text-emerald-300 font-mono font-semibold">{diff.why}</span>
                    {totalUses > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 font-mono font-black text-[10px]">
                        {totalUses}× leído
                      </span>
                    )}
                    {item.ram && item.ram !== 'Sin RAM integrada' && (
                      <>
                        <span>·</span>
                        <span className="text-gray-400 font-mono">RAM {item.ram}</span>
                      </>
                    )}
                    {item.isCustom && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                        Propio
                      </span>
                    )}
                  </div>

                  {Array.isArray(item.aliases) && item.aliases.length > 0 && (
                    <div className="mt-0.5 text-[11px] font-mono text-gray-400 truncate">
                      <span className="text-emerald-400/80 font-sans font-bold">Variantes: </span>
                      {item.aliases.slice(0, 4).join(', ')}
                      {item.aliases.length > 4 ? ` +${item.aliases.length - 4}` : ''}
                    </div>
                  )}

                  {(item.commonModels || item.notes) && (
                    <div className="mt-0.5 text-[11px] text-gray-400 truncate">
                      <span className="text-emerald-300/75 font-semibold">Equipos: </span>
                      {item.commonModels || item.notes}
                    </div>
                  )}
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm sm:text-base border ${pillStyle}`}
                  >
                    {storageVal}
                  </span>
                  {onEditChip && (
                    <button
                      type="button"
                      onClick={() => onEditChip(item)}
                      aria-label={`Editar chip ${item.code}`}
                      className="p-2 rounded-xl pro-inset hover:border-emerald-400/50 text-emerald-300 transition"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onAddChipToBatch(item)}
                    aria-label={`Sumar ${item.code} de ${storageVal} al lote`}
                    className="p-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black transition shadow"
                    title="Sumar +1 al lote"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
