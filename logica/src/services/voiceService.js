// Servicio de Voz en Español (TTS) y Sonido de Confirmación para Eco Lógica García
// Optimizado para iOS (iPhone 14 Pro), Android y Web.

let audioCtx = null;

function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Emite un tono corto de confirmación al detectar un chip
export function playDetectionBeep(storageStr) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const num = parseInt(String(storageStr || '').replace(/\D/g, ''), 10) || 32;
    // Frecuencia más aguda conforme mayor es la capacidad (64GB, 128GB, 256GB+)
    const baseFreq = num >= 256 ? 880 : num >= 128 ? 740 : num >= 64 ? 660 : 520;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  } catch {
    // Ignorar si el navegador bloquea el audio antes de interacción
  }
}

function formatCapacityForSpeech(cap) {
  if (!cap) return '';
  const s = String(cap).toUpperCase().trim();
  if (s.endsWith('TB')) {
    const n = s.replace('TB', '').trim();
    return n === '1' ? '1 Terabyte' : `${n} Terabytes`;
  }
  if (s.endsWith('GB')) {
    const n = s.replace('GB', '').trim();
    return `${n} Gigas`;
  }
  if (s.endsWith('MB')) {
    const n = s.replace('MB', '').trim();
    return `${n} Megabytes`;
  }
  return s;
}

export function speakChipResult(chip, enabled = true, shortMode = false) {
  if (!enabled || !chip || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const storageText = formatCapacityForSpeech(chip.storage);
    const ramText = chip.ram ? `${formatCapacityForSpeech(chip.ram)} de RAM` : '';
    const brandText = chip.manufacturer ? chip.manufacturer.replace('/', ' ') : '';

    let phrase = '';
    if (shortMode) {
      phrase = storageText || ramText || chip.code;
    } else {
      const parts = [];
      if (storageText) parts.push(storageText);
      if (brandText && brandText !== 'Desconocido') parts.push(brandText);
      if (ramText) parts.push(ramText);
      phrase = parts.join(', ');
    }

    if (!phrase) return;

    const utter = new SpeechSynthesisUtterance(phrase);
    utter.lang = 'es-MX';
    utter.rate = 1.12; // Rápido y claro para trabajo en lote
    utter.pitch = 1.0;

    // Seleccionar voz en español si está disponible (iOS Paulina / Mónica / Juan)
    const voices = window.speechSynthesis.getVoices();
    const esVoice =
      voices.find((v) => v.lang.includes('es-MX')) ||
      voices.find((v) => v.lang.startsWith('es'));
    if (esVoice) {
      utter.voice = esVoice;
    }

    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.warn('Error en síntesis de voz:', e);
  }
}
