import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, Share2, Copy, Check } from 'lucide-react';

const BUCKETS = [
  { key: '16GB', label: '4 / 8 / 16 GB', accent: 'border-sky-400/40 bg-sky-500/10 text-sky-300' },
  { key: '32GB', label: '32 GB', accent: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300' },
  { key: '64GB', label: '64 GB', accent: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300' },
  { key: '128GB', label: '128 GB', accent: 'border-amber-400/50 bg-amber-500/15 text-amber-300' },
  { key: '256GB', label: '256 GB', accent: 'border-purple-400/50 bg-purple-500/15 text-purple-300' },
  { key: '512GB+', label: '512GB / 1TB+', accent: 'border-rose-400/50 bg-rose-500/15 text-rose-300' },
];

export function normalizeBucketKey(storageStr) {
  const s = String(storageStr || '').toUpperCase().trim();
  if (s === '4GB' || s === '8GB' || s === '16GB') return '16GB';
  if (s === '32GB') return '32GB';
  if (s === '64GB') return '64GB';
  if (s === '128GB') return '128GB';
  if (s === '256GB') return '256GB';
  if (s === '512GB' || s === '1TB' || s === '2TB') return '512GB+';
  return '64GB';
}

export default function BatchCounterPanel({
  counts,
  onAdjustCount,
  onResetBatch,
  clientName,
  setClientName,
}) {
  const [copied, setCopied] = useState(false);
  const totalBoards = Object.values(counts).reduce((acc, v) => acc + (v || 0), 0);

  function buildSummaryText() {
    const dateStr = new Date().toLocaleDateString('es-MX');
    const lines = [
      `*ECO LÓGICA GARCÍA — CORTE DE LÓGICAS*`,
      clientName ? `Cliente: *${clientName}*` : `Fecha: ${dateStr}`,
      `────────────────────`,
    ];
    for (const b of BUCKETS) {
      const c = counts[b.key] || 0;
      if (c > 0) {
        lines.push(`• *${b.label}:* ${c} pzas`);
      }
    }
    lines.push(`────────────────────`);
    lines.push(`*TOTAL:* ${totalBoards} lógicas`);
    return lines.join('\n');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildSummaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback por si clipboard API requiere foco
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(buildSummaryText());
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="rounded-2xl pro-panel-elevated p-4 sm:p-5 space-y-4">
      {/* Cabecera limpia */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5">
            Contador de Lote
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-400 text-black">
              {totalBoards} pzas
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nombre del cliente..."
            aria-label="Nombre del cliente o lote"
            className="flex-1 sm:w-52 px-3.5 py-2 rounded-xl pro-inset text-base sm:text-xs text-white focus:outline-none focus:border-emerald-400"
          />
          {totalBoards > 0 && (
            <button
              type="button"
              onClick={onResetBatch}
              aria-label="Reiniciar conteo del lote"
              className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition"
              title="Reiniciar lote"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid de 6 Capacidades */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BUCKETS.map((b) => {
          const val = counts[b.key] || 0;
          return (
            <div
              key={b.key}
              className={`rounded-2xl border p-4 flex flex-col justify-between ${b.accent}`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs sm:text-sm font-black uppercase">{b.label}</span>
                <span className="text-3xl font-black text-white font-mono">{val}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onAdjustCount(b.key, -1)}
                  disabled={val <= 0}
                  aria-label={`Restar 1 a ${b.label}`}
                  className="py-2 rounded-xl bg-black/40 hover:bg-black/60 disabled:opacity-30 text-white flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustCount(b.key, 1)}
                  aria-label={`Sumar 1 a ${b.label}`}
                  className="py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={handleCopy}
          disabled={totalBoards === 0}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado' : 'Copiar Resumen'}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          disabled={totalBoards === 0}
          className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-black font-black text-xs flex items-center gap-1.5 shadow-lg transition"
        >
          <Share2 className="w-4 h-4" /> Enviar a WhatsApp
        </button>
      </div>
    </div>
  );
}
