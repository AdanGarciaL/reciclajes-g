import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

// Guía Maestra 100% Visual, Directa y Completa (De 4GB a 2TB en todas las marcas)
const VISUAL_BRANDS = [
  {
    id: 'samsung',
    name: 'Samsung',
    ruleTitle: 'Mira la 4ª letra en KLM/KLU (4G a HG) o las letras de serie en KM (eMCP/uMCP)',
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
        label: 'Serie KLM (eMMC) y KLU (UFS) — 4º Carácter = Capacidad (4GB a 2TB)',
        steps: [
          { codePre: 'KLM', key: '4G', codePost: '1FE...', cap: '4 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'KLM', key: '8G', codePost: '1GE...', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'KLM', key: 'AG', codePost: '1JE...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'KLM', key: 'BG', codePost: '2JE...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'KLM', key: 'CG', codePost: '4JE...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'KLU', key: 'DG', codePost: '4UH...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'KLU', key: 'EG', codePost: '8UH...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'KLU', key: 'FG', codePost: '8RH...', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'KLU', key: 'GG', codePost: 'ARH...', cap: '1 TB', color: 'bg-rose-600 text-white' },
          { codePre: 'KLU', key: 'HG', codePost: 'ARH...', cap: '2 TB', color: 'bg-rose-700 text-white' },
        ],
      },
      {
        label: 'Serie KM (eMCP / uMCP: Almacenamiento + RAM Juntos)',
        steps: [
          { codePre: 'KM', key: 'K5', codePost: 'X000...', cap: '4 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'KM', key: 'K7/FN', codePost: '1001...', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'KM', key: 'QE/R31', codePost: '6001...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'KM', key: 'GD/DH/R82', codePost: '6001...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'KM', key: 'DP/RP/RX', codePost: '6001...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'KM', key: '8V7/5L9', codePost: '001...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'KM', key: '8F9/5P9', codePost: '001...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'KM', key: '9P9/9F9', codePost: '001...', cap: '512 GB', color: 'bg-rose-500 text-white' },
        ],
      },
    ],
  },
  {
    id: 'skhynix',
    name: 'SK Hynix',
    ruleTitle: 'Mira los 2 dígitos después de H26M / H28U / H9TQ / H9HP / H9HQ / HN8T',
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
        label: 'eMMC (H26M) y UFS (H28U / H28S / HN8T) — De 4GB a 1TB',
        steps: [
          { codePre: 'H26M', key: '31', codePost: '003...', cap: '4 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'H26M', key: '41/42', codePost: '204...', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'H26M', key: '52/54', codePost: '208...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'H26M', key: '64', codePost: '208...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'H26M', key: '78', codePost: '208...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'HN8T', key: '05', codePost: 'DEH...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'HN8T', key: '15', codePost: 'DEH...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'HN8T', key: '25', codePost: 'DEH...', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'HN8T', key: '35', codePost: 'DEH...', cap: '1 TB', color: 'bg-rose-600 text-white' },
        ],
      },
      {
        label: 'eMCP y uMCP (H9TP / H9TQ / H9HP / H9HQ / H9QT / H9HR)',
        steps: [
          { codePre: 'H9TP', key: '32', codePost: 'A4G...', cap: '4 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'H9TQ', key: '64', codePost: 'A8G...', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'H9TQ', key: '17', codePost: 'ABJ...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'H9TQ', key: '26/27', codePost: 'ADF...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'H9HP', key: '52/54', codePost: 'ACP...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'H9HQ', key: '15/16', codePost: 'AEC...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'H9HQ', key: '21', codePost: 'AEC...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'H9HR', key: '56', codePost: 'JFA...', cap: '512 GB', color: 'bg-rose-500 text-white' },
        ],
      },
    ],
  },
  {
    id: 'micron',
    name: 'Micron (JW/JX/JZ)',
    ruleTitle: 'Escribe los 5 caracteres del código FBGA (JW, JX, JY, JZ, JC) en el buscador',
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
        label: 'Códigos Cortos FBGA Micron (5 caracteres) — De 4GB a 1TB',
        steps: [
          { codePre: 'JW', key: '578', codePost: '', cap: '4 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'JW', key: '812', codePost: '', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'JWA', key: '61', codePost: '', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'JW', key: '968', codePost: '', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'JXD', key: '89', codePost: '', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'JXE', key: '77', codePost: '', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'JY', key: '010', codePost: '', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'JZ', key: '034', codePost: '', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'JC', key: '088', codePost: '', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'JC', key: '101', codePost: '', cap: '1 TB', color: 'bg-rose-600 text-white' },
        ],
      },
      {
        label: 'Códigos Largos Micron (MTFC y MT29TZZZ)',
        steps: [
          { codePre: 'MTFC', key: '4G', codePost: 'ACA...', cap: '4 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'MTFC', key: '16G', codePost: 'AKA...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'MTFC', key: '32G', codePost: 'AKA...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'MT29...', key: 'D8', codePost: 'JKF...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'MT29...', key: 'D9', codePost: 'JKF...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'MTFC', key: '256G', codePost: 'AXA...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'MTFC', key: '512G', codePost: 'AXA...', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'MTFC', key: '1T', codePost: '0GA...', cap: '1 TB', color: 'bg-rose-600 text-white' },
        ],
      },
    ],
  },
  {
    id: 'sandisk',
    name: 'SanDisk / WD',
    ruleTitle: 'Lee el número al final después del guion (-4G, -16G, -32G, -64G, -128G, -1T)',
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
        label: 'Series SDIN7 / SDIN8 / SDIN9 / SDINADF / SDINBDA / SDINBDD / SDINFD',
        steps: [
          { codePre: 'SDIN7DP2-', key: '4G', codePost: '', cap: '4 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'SDIN8DE2-', key: '8G', codePost: '', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'SDIN8DE4-', key: '16G', codePost: '', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'SDINBDA4-', key: '32G', codePost: '', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'SDINBDA4-', key: '64G', codePost: '', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'SDINBDA4-', key: '128G', codePost: '', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'SDINBDA4-', key: '256G', codePost: '', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'SDINFDQ6-', key: '512G', codePost: '', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'SDINFDO4-', key: '1T', codePost: '', cap: '1 TB', color: 'bg-rose-600 text-white' },
        ],
      },
    ],
  },
  {
    id: 'kioxia',
    name: 'Kioxia / Toshiba',
    ruleTitle: 'Mira los 2 caracteres centrales en THGBM / THGLF / THGAF / THGJF (G5 a T3)',
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
        label: 'Código Central Toshiba / Kioxia (eMMC THGBM, eMCP THGLF y UFS THGAF / THGJF)',
        steps: [
          { codePre: 'THGBMN', key: 'G5', codePost: 'D1L...', cap: '4 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'THGBMF', key: 'G6', codePost: 'C1L...', cap: '8 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'THGBMF', key: 'G7', codePost: 'C2L...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'THGBMH', key: 'G8', codePost: 'C2L...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'THGAF8', key: 'G9', codePost: 'T43...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'THGAF8', key: 'T0', codePost: 'T43...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'THGAF8', key: 'T1', codePost: 'T83...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'THGJFG', key: 'T2', codePost: 'T84...', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'THGJFG', key: 'T3', codePost: 'T84...', cap: '1 TB', color: 'bg-rose-600 text-white' },
        ],
      },
    ],
  },
  {
    id: 'iphone',
    name: 'Apple / iPhone NAND',
    ruleTitle: 'Identifica NAND de iPhone (BGA60 / BGA70 / BGA110 / BGA315) de 16GB a 2TB',
    chip: {
      top: 'APPLE INC',
      pre: 'H23B',
      key: '1T8',
      post: '2D7AEQ',
      bot: 'BGA110 NAND',
      result: '128 GB',
    },
    groups: [
      {
        label: 'SK Hynix (H23Q / H23B) y SanDisk (SDM / SDSB) para iPhone',
        steps: [
          { codePre: 'H23Q', key: 'DG8', codePost: 'UD1...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'H23Q', key: 'EG8', codePost: 'I26...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'H23Q', key: 'FG8', codePost: '2D6...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'H23B', key: '1T8', codePost: '2D7...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'H23Q', key: '2T8', codePost: '3G6...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'H23Q', key: '4T8', codePost: '3G6...', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'H23Q', key: '8T8', codePost: '3G6...', cap: '1 TB', color: 'bg-rose-600 text-white' },
          { codePre: 'SDM...-', key: '064G', codePost: '', cap: '64 GB', color: 'bg-emerald-400 text-black' },
        ],
      },
      {
        label: 'Toshiba / Kioxia para iPhone (KICM / TSB / K5A / K6A / K6B)',
        steps: [
          { codePre: 'TSB', key: '3243', codePost: '', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'KICM', key: '223', codePost: '', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'KICM', key: '224', codePost: ' / TSB4226', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'KICM', key: '225', codePost: ' / K6A6', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'KICM', key: '226', codePost: ' / K6A7', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'KICM', key: '227', codePost: ' / K6A8', cap: '1 TB', color: 'bg-rose-600 text-white' },
          { codePre: 'K6B', key: '9', codePost: 'RB5896', cap: '2 TB', color: 'bg-rose-700 text-white' },
        ],
      },
    ],
  },
  {
    id: 'otras',
    name: 'FORESEE / Kingston / YMTC / Otras',
    ruleTitle: 'En FORESEE, Kingston, BIWIN, Rayson, SCY y Phison los GB vienen directos en el código',
    chip: {
      top: 'FORESEE',
      pre: 'FEMDNN',
      key: '064G',
      post: '-A3A56',
      bot: 'L2145001',
      result: '64 GB',
    },
    groups: [
      {
        label: 'FORESEE (FEMDNN / NCEM / FEUFS) y Kingston (EMMC / EMCP / UFS)',
        steps: [
          { codePre: 'FEMDNN', key: '004G', codePost: '...', cap: '4 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'FEMDNN', key: '016G', codePost: '...', cap: '16 GB', color: 'bg-sky-400 text-black' },
          { codePre: 'FEMDNN', key: '032G', codePost: '...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'FEMDNN', key: '064G', codePost: '...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'FEMDNN', key: '128G', codePost: '...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'FEUFS', key: '256G', codePost: '...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'EMMC', key: '64G', codePost: '-TY29', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: '', key: '256UMCP', codePost: '64...', cap: '256 GB', color: 'bg-purple-500 text-white' },
        ],
      },
      {
        label: 'YMTC (Huawei), BIWIN, Rayson, SCY, Phison y Silicon Motion',
        steps: [
          { codePre: 'YMEC', key: '6A', codePost: '2TB...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
          { codePre: 'YMEC', key: '7C', codePost: '0TG...', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'YMN', key: '08T', codePost: 'E1B...', cap: '128 GB', color: 'bg-amber-400 text-black' },
          { codePre: 'YMN', key: '09T', codePost: 'F1B...', cap: '256 GB', color: 'bg-purple-500 text-white' },
          { codePre: 'YMN', key: '10T', codePost: 'G1B...', cap: '512 GB', color: 'bg-rose-500 text-white' },
          { codePre: 'YMN', key: '11T', codePost: 'H1B...', cap: '1 TB', color: 'bg-rose-600 text-white' },
          { codePre: 'BWCT...', key: '64G', codePost: '', cap: '64 GB', color: 'bg-emerald-400 text-black' },
          { codePre: 'RS70B', key: '32G', codePost: '4S...', cap: '32 GB', color: 'bg-cyan-400 text-black' },
        ],
      },
    ],
  },
];

export default function VisualTutorialView() {
  const [activeId, setActiveId] = useState('samsung');
  const brand = VISUAL_BRANDS.find((b) => b.id === activeId) || VISUAL_BRANDS[0];

  return (
    <div className="space-y-3.5">
      {/* SELECTOR DE MARCA LIMPIO */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {VISUAL_BRANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiveId(b.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap border transition ${
              activeId === b.id
                ? 'bg-emerald-400 text-black border-emerald-200 shadow-[0_0_16px_rgba(52,211,153,0.3)]'
                : 'pro-panel text-emerald-100/80 hover:border-emerald-400/50'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* PANEL PRINCIPAL: CHIP ILUSTRADO + ESCALERA VISUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* COLUMNA IZQUIERDA: ILUSTRACIÓN DEL CHIP (QUÉ RENGLÓN LEER) */}
        <div className="lg:col-span-5 rounded-2xl pro-panel-elevated p-4 sm:p-5 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between text-xs font-bold text-emerald-300/80 mb-3">
            <span>Anatomía del Chip {brand.name}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
              Renglón Central
            </span>
          </div>

          {/* Dibujo del Chip Físico */}
          <div className="w-full max-w-[18.5rem] min-h-[16rem] rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 border-2 border-neutral-700 shadow-2xl p-4 sm:p-5 flex flex-col justify-between gap-2 my-1">
            <div className="flex items-center justify-between">
              <span className="w-3 h-3 rounded-full bg-neutral-500" />
              <span className="text-[10px] font-mono text-neutral-500 tracking-widest">
                MEMORIA IC
              </span>
            </div>

            <div className="space-y-2.5 my-auto">
              {/* Renglón 1: Ignorar */}
              <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-xs font-mono text-gray-500">
                <span className="line-through">{brand.chip.top}</span>
                <span className="text-[10px] text-rose-400/80 font-sans font-bold">Lote</span>
              </div>

              {/* Renglón 2: LEER ESTE */}
              <div className="px-3 py-2.5 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 shadow-lg">
                <div className="font-mono text-base sm:text-lg font-black text-white flex items-center justify-center flex-wrap">
                  <span>{brand.chip.pre}</span>
                  <span className="px-2 py-0.5 mx-1 rounded-lg bg-emerald-400 text-black shadow">
                    {brand.chip.key}
                  </span>
                  <span>{brand.chip.post}</span>
                </div>
                <div className="text-[10px] text-emerald-300 font-mono font-bold mt-1 uppercase tracking-wider">
                  Leer este renglón
                </div>
              </div>

              {/* Renglón 3: Ignorar */}
              <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-xs font-mono text-gray-500">
                <span className="line-through">{brand.chip.bot}</span>
                <span className="text-[10px] text-rose-400/80 font-sans font-bold">Serie</span>
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

        {/* COLUMNA DERECHA: ESCALERA DE CAPACIDADES */}
        <div className="lg:col-span-7 rounded-2xl pro-panel-elevated p-4 sm:p-5 flex flex-col justify-between space-y-4">
          {brand.groups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <div className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-300">
                {grp.label}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {grp.steps.map((st, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2.5 rounded-xl pro-inset flex flex-col items-center justify-center gap-1.5 text-center"
                  >
                    <span
                      className={`px-2.5 py-0.5 rounded-lg font-mono font-black text-xs sm:text-sm ${st.color}`}
                    >
                      {st.cap}
                    </span>

                    <div className="font-mono text-xs sm:text-sm font-bold flex items-center justify-center flex-wrap">
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

          {/* Regla rápida CPU vs Memoria */}
          <div className="p-3 rounded-xl pro-inset flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Memoria: Samsung, Hynix, Micron, SanDisk, Kioxia, iPhone, FORESEE, Kingston, YMTC</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-300/80 font-medium">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Ignorar CPU: Qualcomm SM/MSM, MediaTek MT, Apple APL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
