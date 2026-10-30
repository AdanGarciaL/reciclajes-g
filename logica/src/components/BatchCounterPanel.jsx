import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, Share2, Copy, Check, PackageCheck } from 'lucide-react';

const BUCKETS = [
  {
    key: '16GB',
    label: '4 / 8 / 16 GB',
    shortLabel: '4–16 GB',
    pill: 'bg-sky-400 text-black border-sky-200',
    card: 'border-sky-500/35',
  },
  {
    key: '32GB',
    label: '32 GB',
    shortLabel: '32 GB',
    pill: 'bg-cyan-400 text-black border-cyan-200',
    card: 'border-cyan-500/35',
  },
  {
    key: '64GB',
    label: '64 GB',
    shortLabel: '64 GB',
    pill: 'bg-emerald-400 text-black border-emerald-200',
    card: 'border-emerald-500/45',
  },
  {
    key: '128GB',
    label: '128 GB',
    shortLabel: '128 GB',
    pill: 'bg-amber-400 text-black border-amber-200',
    card: 'border-amber-500/45',
  },
  {
    key: '256GB',
    label: '256 GB',
    shortLabel: '256 GB',
    pill: 'bg-purple-500 text-white border-purple-300',
    card: 'border-purple-500/45',
  },
  {
    key: '512GB+',
    label: '512GB / 1TB / 2TB',
    shortLabel: '512G–2TB',
    pill: 'bg-rose-500 text-white border-rose-300',
    card: 'border-rose-500/45',
  },
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
  onSetCount,
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
      clientName ? `Cliente: *${clientName.trim()}*` : `Fecha: ${dateStr}`,
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
      // Fallback
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(buildSummaryText());
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }

  function handleDirectInput(bucketKey, rawVal) {
    const parsed = parseInt(String(rawVal).replace(/\D/g, ''), 10);
    const nextVal = Number.isNaN(parsed) ? 0 : Math.min(9999, Math.max(0, parsed));
    if (onSetCount) {
      onSetCount(bucketKey, nextVal);
    } else {
      const current = counts[bucketKey] || 0;
      onAdjustCount(bucketKey, nextVal - current);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl pro-panel-elevated p-4 sm:p-5 space-y-4">
        {/* Cabecera del Lote */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/35 text-emerald-400 flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white leading-none">
                  Corte de Lote por Capacidad
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-400 text-black">
                  {totalBoards} pzas
                </span>
              </div>
              <p className="text-xs text-emerald-200/70 mt-1">
                Suma con los botones o escribe la cantidad directa en cada capacidad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Cliente o referencia del lote..."
              aria-label="Nombre del cliente o lote"
              className="flex-1 sm:w-56 px-3.5 py-2 rounded-xl pro-inset text-base sm:text-xs text-white focus:outline-none focus:border-emerald-400"
            />
            {totalBoards > 0 && (
              <button
                type="button"
                onClick={onResetBatch}
                aria-label="Reiniciar conteo del lote"
                className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1 transition shrink-0"
                title="Poner lote en cero"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            )}
          </div>
        </div>

        {/* Grid de 6 Capacidades con entrada directa y botones -1 / +1 / +5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {BUCKETS.map((b) => {
            const val = counts[b.key] || 0;
            return (
              <div
                key={b.key}
                className={`rounded-2xl pro-inset border ${b.card} p-3.5 flex flex-col justify-between gap-3`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs sm:text-sm border ${b.pill}`}
                  >
                    {b.label}
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={val}
                    onChange={(e) => handleDirectInput(b.key, e.target.value)}
                    aria-label={`Cantidad para ${b.label}`}
                    className="w-20 text-right px-2.5 py-1 rounded-xl bg-black/50 border border-white/10 focus:border-emerald-400 focus:outline-none text-2xl font-black text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAdjustCount(b.key, -1)}
                    disabled={val <= 0}
                    aria-label={`Restar 1 a ${b.label}`}
                    className="py-2 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-25 text-white font-mono font-bold text-xs flex items-center justify-center gap-0.5 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustCount(b.key, 1)}
                    aria-label={`Sumar 1 a ${b.label}`}
                    className="py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/35 text-emerald-300 font-mono font-black text-xs flex items-center justify-center gap-0.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustCount(b.key, 5)}
                    aria-label={`Sumar 5 a ${b.label}`}
                    className="py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-black text-xs flex items-center justify-center transition"
                  >
                    +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen en vivo y botones de exportación */}
        <div className="pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {totalBoards === 0 ? (
              <span className="text-xs text-gray-400 font-mono">
                Sin piezas registradas en el lote actual
              </span>
            ) : (
              BUCKETS.filter((b) => (counts[b.key] || 0) > 0).map((b) => (
                <span
                  key={b.key}
                  className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-gray-200"
                >
                  <strong className="text-white">{b.shortLabel}:</strong> {counts[b.key]}
                </span>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              disabled={totalBoards === 0}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl pro-inset hover:border-emerald-400/50 disabled:opacity-35 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado' : 'Copiar Corte'}</span>
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={totalBoards === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-35 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(52,211,153,0.35)] transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
