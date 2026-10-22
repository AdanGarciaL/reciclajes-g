import React, { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { SEED_IC_CATALOG } from '../data/seedCatalog';
import { getCustomDatabase } from '../services/icEngine';

// Extrae la parte exacta que define la capacidad con una etiqueta corta de 3 palabras
export function highlightCodeDifference(item) {
  if (!item || !item.code) {
    return { pre: '', highlight: '', post: '', why: '' };
  }
  const code = String(item.code || '').toUpperCase();
  const cap = item.storage || '64GB';

  if (/^KL[MU][ABCDEFG]G/.test(code)) {
    return {
      pre: code.slice(0, 3),
      highlight: code.slice(3, 4),
      post: code.slice(4),
      why: `Letra "${code[3]}" = ${cap}`,
    };
  }

  if (/^KM8[VF][789]/.test(code)) {
    return {
      pre: code.slice(0, 4),
      highlight: code.slice(4, 5),
      post: code.slice(5),
      why: `Dígito "${code[4]}" = ${cap}`,
    };
  }

  if (/^KM[A-Z]{2}/.test(code)) {
    return {
      pre: 'KM',
      highlight: code.slice(2, 4),
      post: code.slice(4),
      why: `Serie "${code.slice(2, 4)}" = ${cap}`,
    };
  }

  if (/^(H9TQ|H9HP|H9HK|H9HQ|H26M|H28U|H28S)/.test(code) && code.length >= 6) {
    return {
      pre: code.slice(0, 4),
      highlight: code.slice(4, 6),
      post: code.slice(6),
      why: `Código "${code.slice(4, 6)}" = ${cap}`,
    };
  }

  const sdinMatch = code.match(/^(SDIN[A-Z0-9]+-)(\d+G)(.*)$/);
  if (sdinMatch) {
    return {
      pre: sdinMatch[1],
      highlight: sdinMatch[2],
      post: sdinMatch[3] || '',
      why: `Final "${sdinMatch[2]}" = ${cap}`,
    };
  }

  if (/^THG(BM|AF|BX|LF)/.test(code) && code.length >= 8) {
    return {
      pre: code.slice(0, 6),
      highlight: code.slice(6, 8),
      post: code.slice(8),
      why: `Centro "${code.slice(6, 8)}" = ${cap}`,
    };
  }

  if (/^K[56]A[4567]/.test(code)) {
    return {
      pre: code.slice(0, 3),
      highlight: code.slice(3, 4),
      post: code.slice(4),
      why: `Número "${code[3]}" = ${cap}`,
    };
  }

  if (/^J[A-Z]\d{3}$/.test(code)) {
    return {
      pre: code.slice(0, 2),
      highlight: code.slice(2),
      post: '',
      why: `FBGA "${code}" = ${cap}`,
    };
  }

  return {
    pre: '',
    highlight: code,
    post: '',
    why: `Capacidad ${cap}`,
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

export default function BrandTablesView({ onSelectChip, onAddChipToBatch }) {
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCapacity, setSelectedCapacity] = useState('ALL');
  const [tableFilter, setTableFilter] = useState('');

  const brandTabs = [
    { id: 'ALL', label: 'Todas' },
    { id: 'Samsung', label: 'Samsung' },
    { id: 'SK Hynix', label: 'SK Hynix' },
    { id: 'Micron', label: 'Micron' },
    { id: 'SanDisk', label: 'SanDisk' },
    { id: 'Kioxia', label: 'Toshiba / iPhone' },
  ];

  const capacityTabs = ['ALL', '8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];

  const allCatalog = useMemo(() => {
    const custom = getCustomDatabase();
    const seen = new Set();
    const merged = [];
    for (const item of [...custom, ...SEED_IC_CATALOG]) {
      const k = String(item.code).toUpperCase();
      if (!seen.has(k)) {
        seen.add(k);
        merged.push(item);
      }
    }
    return merged;
  }, []);

  const filteredCatalog = useMemo(() => {
    return allCatalog.filter((item) => {
      const mfg = String(item.manufacturer || '').toLowerCase();
      if (selectedBrand !== 'ALL') {
        const b = selectedBrand.toLowerCase();
        if (b.includes('kioxia')) {
          if (!mfg.includes('kioxia') && !mfg.includes('toshiba') && !mfg.includes('iphone')) {
            return false;
          }
        } else if (!mfg.includes(b)) {
          return false;
        }
      }

      if (selectedCapacity !== 'ALL') {
        if (String(item.storage || '').toUpperCase() !== selectedCapacity) {
          return false;
        }
      }

      if (tableFilter.trim()) {
        const q = tableFilter.toUpperCase().trim();
        const matchCode = String(item.code || '').toUpperCase().includes(q);
        const matchPn = String(item.partNumber || '').toUpperCase().includes(q);
        const matchBrand = String(item.manufacturer || '').toUpperCase().includes(q);
        if (!matchCode && !matchPn && !matchBrand) return false;
      }

      return true;
    });
  }, [allCatalog, selectedBrand, selectedCapacity, tableFilter]);

  return (
    <div className="space-y-3.5">
      {/* BARRA COMPACTA DE FILTROS */}
      <div className="rounded-3xl bg-[#081f12] border border-emerald-500/25 p-4 space-y-3">
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
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  selectedBrand === b.id
                    ? 'bg-emerald-400 text-black border-emerald-200 shadow'
                    : 'bg-[#04120a] text-emerald-100/80 border-emerald-500/20 hover:border-emerald-400/50'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              placeholder="Filtrar en lista..."
              aria-label="Filtrar códigos en la tabla"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#04120a] border border-emerald-500/25 text-base sm:text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
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

        {/* Filtro de Capacidades */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {capacityTabs.map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => setSelectedCapacity(cap)}
              className={`px-3 py-1 rounded-lg text-xs font-black font-mono border transition shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                selectedCapacity === cap
                  ? 'bg-white text-black border-white'
                  : 'bg-[#04120a] text-emerald-200/80 border-white/10 hover:border-emerald-400/50'
              }`}
            >
              {cap === 'ALL' ? 'Todos los GB' : cap}
            </button>
          ))}
        </div>
      </div>

      {/* GRID ADAPTATIVO O MENSAJE VACÍO */}
      {filteredCatalog.length === 0 ? (
        <div className="rounded-3xl bg-[#081f12] border border-emerald-500/20 p-8 text-center space-y-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredCatalog.map((item) => {
            const diff = highlightCodeDifference(item);
            const pillStyle = getCapacityPillStyle(item.storage);
            return (
              <div
                key={item.code}
                className="p-3.5 rounded-2xl bg-[#081f12] hover:bg-[#0b2918] border border-emerald-500/20 flex items-center justify-between gap-3 transition"
              >
                <button
                  type="button"
                  onClick={() => onSelectChip(item)}
                  className="min-w-0 text-left flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl"
                >
                  <div className="font-mono font-bold text-sm sm:text-base flex items-center flex-wrap">
                    <span className="text-gray-300">{diff.pre}</span>
                    <span
                      className={`px-1.5 py-0.5 mx-0.5 rounded-md font-black text-xs sm:text-sm shadow ${pillStyle}`}
                    >
                      {diff.highlight}
                    </span>
                    <span className="text-gray-300">{diff.post}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 text-xs text-emerald-200/80 flex-wrap">
                    <span className="font-bold text-white">{item.manufacturer}</span>
                    <span>•</span>
                    <span className="text-emerald-300 font-semibold">{diff.why}</span>
                    {item.ram && (
                      <>
                        <span>•</span>
                        <span className="text-gray-300">RAM {item.ram}</span>
                      </>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm sm:text-base border ${pillStyle}`}
                  >
                    {item.storage}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddChipToBatch(item)}
                    aria-label={`Sumar ${item.code} de ${item.storage} al lote`}
                    className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black transition shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
