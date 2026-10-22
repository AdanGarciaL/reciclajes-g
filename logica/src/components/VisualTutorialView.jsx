import React, { useState } from 'react';
import { CheckCircle2, XCircle, Cpu } from 'lucide-react';

// Guía 100% Visual, Directa y Sin Párrafos Largos
const VISUAL_BRANDS = [
  {
    id: 'samsung',
    name: 'Samsung',
    ruleTitle: 'Mira la 4ª letra (KLM/KLU) o las letras 3 y 4 (KM)',
    chip: {
      top: 'SEC 946 B041',
      pre: 'KLM',
      key: 'C',
      post: 'G4JENB',
      bot: 'GHC1589Q',
      result: '64 GB',
    },
    groups: [
      {
        label: 'Serie KLM / KLU (4ª Letra = Capacidad)',
        steps: [
          { codePre: 'KLM', key: 'A', codePost: 'G...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'KLM', key: 'B', codePost: 'G...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'KLM', key: 'C', codePost: 'G...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'KLU', key: 'D', codePost: 'G...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'KLU', key: 'E', codePost: 'G...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'KLU', key: 'F', codePost: 'G...', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'KLU', key: 'G', codePost: 'G...', cap: '1 TB', color: 'bg-rose-600 text-white' },
        ],
      },
      {
        label: 'Serie KM (Memoria + RAM Juntos)',
        steps: [
          { codePre: 'KM', key: 'QE', codePost: '6001...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'KM', key: 'QD', codePost: '6001...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'KM', key: 'GD', codePost: '6001...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'KM', key: 'DP', codePost: '6001...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'KM', key: 'DV', codePost: '6001...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'KM8V', key: '7', codePost: '001...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'KM8V', key: '8', codePost: '001...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'KM8V', key: '9', codePost: '001...', cap: '256 GB', color: 'bg-purple-500 text-white' },
        ],
      },
    ],
  },
  {
    id: 'skhynix',
    name: 'SK Hynix',
    ruleTitle: 'Mira los 2 números después de H9TQ / H9HP / H9HQ',
    chip: {
      top: 'SK hynix KOR',
      pre: 'H9HP',
      key: '52',
      post: 'ACPMMD',
      bot: 'AR60M 112A',
      result: '64 GB',
    },
    groups: [
      {
        label: 'Posición 5 y 6 (Los 2 números clave)',
        steps: [
          { codePre: 'H9TQ', key: '64', codePost: 'A8...', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'H9TQ', key: '17', codePost: 'AB...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'H9TQ', key: '26', codePost: 'AD...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'H9TQ', key: '27', codePost: 'AD...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'H9HP', key: '52', codePost: 'AC...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'H9HQ', key: '15', codePost: 'AE...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'H9HQ', key: '16', codePost: 'AE...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'H9HQ', key: '21', codePost: 'AF...', cap: '256 GB', color: 'bg-purple-500 text-white' },
        ],
      },
    ],
  },
  {
    id: 'micron',
    name: 'Micron',
    ruleTitle: 'Código corto de 5 caracteres (JZ/JW) en el renglón central',
    chip: {
      top: '6MA92',
      pre: 'JZ',
      key: '186',
      post: '',
      bot: 'BCXK623',
      result: '64 GB',
    },
    groups: [
      {
        label: 'Códigos Cortos FBGA más comunes',
        steps: [
          { codePre: 'JW', key: '962', codePost: '', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'JZ', key: '008', codePost: '', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'JZ', key: '005', codePost: '', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'JZ', key: '004', codePost: '', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'JZ', key: '045', codePost: '', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'JZ', key: '186', codePost: '', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'JZ', key: '112', codePost: '', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'JZ', key: '139', codePost: '', cap: '128 GB', color: 'bg-amber-400 text-black' },
        ],
      },
      {
        label: 'Código Largo MT29 / MTFC',
        steps: [
          { codePre: 'MT29...', key: 'D6', codePost: '...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'MT29...', key: 'D7', codePost: '...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'MT29...', key: 'D8', codePost: '...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'MT29...', key: 'D9', codePost: '...', cap: '128 GB', color: 'bg-amber-400 text-black' },
        ],
      },
    ],
  },
  {
    id: 'sandisk',
    name: 'SanDisk',
    ruleTitle: 'Lee el número al final después del guion (-16G, -32G, -64G)',
    chip: {
      top: 'SanDisk',
      pre: 'SDINBDA4-',
      key: '64G',
      post: '',
      bot: '9124D1234',
      result: '64 GB',
    },
    groups: [
      {
        label: 'Terminación directa en GB',
        steps: [
          { codePre: 'SDIN...-', key: '16G', codePost: '', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'SDIN...-', key: '32G', codePost: '', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'SDIN...-', key: '64G', codePost: '', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'SDIN...-', key: '128G', codePost: '', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'SDIN...-', key: '256G', codePost: '', cap: '256 GB', color: 'bg-purple-500 text-white' },
        ],
      },
    ],
  },
  {
    id: 'kioxia',
    name: 'Toshiba / iPhone',
    ruleTitle: 'Mira el código del centro: G7, G8, G9, T0, T1',
    chip: {
      top: 'TOSHIBA JPN',
      pre: 'THGBMJ',
      key: 'G9',
      post: 'C4LBAIR',
      bot: '1942KAE',
      result: '64 GB',
    },
    groups: [
      {
        label: 'Toshiba / Kioxia (THG...)',
        steps: [
          { codePre: 'THGBM.', key: 'G6', codePost: '...', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'THGBM.', key: 'G7', codePost: '...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'THGBM.', key: 'G8', codePost: '...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'THGBM.', key: 'G9', codePost: '...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'THGAF.', key: 'T0', codePost: '...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'THGAF.', key: 'T1', codePost: '...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'THGAF.', key: 'T2', codePost: '...', cap: '512 GB', color: 'bg-rose-500 text-white' },
        ],
      },
      {
        label: 'NAND de iPhone (K5A / K6A)',
        steps: [
          { codePre: 'K5A', key: '4', codePost: 'RB...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'K5A', key: '5', codePost: 'RB...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'K6A', key: '6', codePost: 'RB...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'K6A', key: '7', codePost: 'RB...', cap: '512 GB', color: 'bg-rose-500 text-white' },
        ],
      },
    ],
  },
];

export default function VisualTutorialView() {
  const [activeId, setActiveId] = useState('samsung');
  const brand = VISUAL_BRANDS.find((b) => b.id === activeId) || VISUAL_BRANDS[0];

  return (
    <div className="space-y-4">
      {/* SELECTOR DE MARCA LIMPIO */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {VISUAL_BRANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiveId(b.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap border transition ${
              activeId === b.id
                ? 'bg-emerald-400 text-black border-emerald-200 shadow-lg'
                : 'bg-[#081f12] text-emerald-100/80 border-emerald-500/20 hover:border-emerald-400/50'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* PANEL PRINCIPAL: CHIP ILUSTRADO + ESCALERA VISUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* COLUMNA IZQUIERDA: ILUSTRACIÓN DEL CHIP (QUÉ RENGLÓN LEER) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#081f12] border border-emerald-500/25 p-5 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between text-xs font-bold text-emerald-300/80 mb-3">
            <span>Anatomía del Chip {brand.name}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Renglón Central
            </span>
          </div>

          {/* Dibujo del Chip Físico */}
          <div className="w-full max-w-[270px] aspect-square rounded-3xl bg-gradient-to-b from-neutral-800 to-neutral-950 border-4 border-neutral-700 shadow-2xl p-5 flex flex-col justify-between my-1">
            <div className="flex items-center justify-between">
              <span className="w-3 h-3 rounded-full bg-neutral-500" />
              <span className="text-[10px] font-mono text-neutral-500 tracking-widest">
                MEMORIA IC
              </span>
            </div>

            <div className="space-y-3 my-auto">
              {/* Renglón 1: Ignorar */}
              <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-gray-500">
                <span className="line-through">{brand.chip.top}</span>
                <span className="text-[10px] text-rose-400/80 font-sans font-bold">✕ Lote</span>
              </div>

              {/* Renglón 2: LEER ESTE */}
              <div className="px-3 py-2.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 shadow-lg">
                <div className="font-mono text-base sm:text-lg font-black text-white flex items-center justify-center">
                  <span>{brand.chip.pre}</span>
                  <span className="px-2 py-0.5 mx-1 rounded-lg bg-emerald-400 text-black shadow">
                    {brand.chip.key}
                  </span>
                  <span>{brand.chip.post}</span>
                </div>
                <div className="text-[10px] text-emerald-300 font-bold mt-1 uppercase tracking-wider">
                  ✓ Leer este renglón
                </div>
              </div>

              {/* Renglón 3: Ignorar */}
              <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-gray-500">
                <span className="line-through">{brand.chip.bot}</span>
                <span className="text-[10px] text-rose-400/80 font-sans font-bold">✕ Serie</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-gray-400 font-medium">Capacidad:</span>
              <span className="px-3 py-0.5 rounded-lg bg-emerald-400 text-black font-mono font-black">
                {brand.chip.result}
              </span>
            </div>
          </div>

          <p className="text-xs font-bold text-emerald-200 mt-3">{brand.ruleTitle}</p>
        </div>

        {/* COLUMNA DERECHA: ESCALERA DE CAPACIDADES (DIRECTA Y SIN MUCHO TEXTO) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#081f12] border border-emerald-500/25 p-5 flex flex-col justify-between space-y-4">
          {brand.groups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                {grp.label}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {grp.steps.map((st, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-2xl bg-[#04120a] border border-emerald-500/20 flex flex-col items-center justify-center gap-2 text-center"
                  >
                    {/* Capacidad grande */}
                    <span
                      className={`px-3 py-0.5 rounded-lg font-mono font-black text-xs sm:text-sm ${st.color}`}
                    >
                      {st.cap}
                    </span>

                    {/* Código con parte remarcada */}
                    <div className="font-mono text-xs sm:text-sm font-bold flex items-center justify-center">
                      <span className="text-gray-400">{st.codePre}</span>
                      <span
                        className={`px-1.5 py-0.5 mx-0.5 rounded font-black text-xs sm:text-sm ${st.color}`}
                      >
                        {st.key}
                      </span>
                      <span className="text-gray-400">{st.codePost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Regla rápida CPU vs Memoria en 1 línea limpia */}
          <div className="p-3.5 rounded-2xl bg-[#04120a] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Lee el chip de Memoria (Samsung, Hynix, Micron, SanDisk, Toshiba)</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-300/80 font-medium">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Ignora el CPU (Qualcomm / MediaTek)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
