import { createEngine } from '@itxtech/fdnext-core';
import { SEED_IC_CATALOG } from '../data/seedCatalog';

const STORAGE_KEYS = {
  CUSTOM_DB: 'eco_custom_db_v1',
  AUTO_LEARNED_DB: 'eco_auto_learned_db_v1',
  PENDING_SUGGESTIONS: 'eco_pending_suggestions_v1',
  ADMIN_PIN: 'eco_admin_pin_v2', // Actualizado a v2 con PIN maestro 252002
  RECENT_SEARCHES: 'eco_recent_searches_v1',
  BATCH_ITEMS: 'eco_batch_items_v1',
};

const DEFAULT_MASTER_PIN = '252002';

// Almacenamiento seguro en memoria por si Safari está en Modo Privado estricto
const memoryFallbackStore = {};

export function safeGetStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return key in memoryFallbackStore ? memoryFallbackStore[key] : fallbackValue;
    }
    return JSON.parse(raw);
  } catch {
    return key in memoryFallbackStore ? memoryFallbackStore[key] : fallbackValue;
  }
}

export function safeSetStorage(key, value) {
  memoryFallbackStore[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Singleton de @itxtech/fdnext-core (25,300+ chips y 15,427 códigos FBGA Micron 100% offline)
let fdEngine = null;
function getFdEngine() {
  if (!fdEngine) {
    try {
      fdEngine = createEngine();
    } catch (err) {
      console.error('Error inicializando motor fdnext-core:', err);
    }
  }
  return fdEngine;
}

// Normaliza un código IC quitando espacios y caracteres invisibles/especiales al inicio y final
export function normalizeCode(raw) {
  if (!raw) return '';
  return String(raw)
    .toUpperCase()
    .trim()
    .replace(/^[.\-_/\\,\s]+|[.\-_/\\,\s]+$/g, '')
    .replace(/\s+/g, '');
}

// Detecta si el usuario escribió por error el código del Procesador (CPU) en vez de la Memoria
export function detectCpuInsteadOfMemory(rawQuery) {
  const q = normalizeCode(rawQuery);
  if (!q || q.length < 4) return null;

  const cpuPatterns = [
    { regex: /^(SM|SDM|MSM|APQ)\d{3,4}[A-Z0-9]*$/, brand: 'Qualcomm Snapdragon', type: 'Procesador (CPU)' },
    { regex: /^MT6[5789]\d{2}[A-Z0-9]*$/, brand: 'MediaTek Helio / Dimensity', type: 'Procesador (CPU)' },
    { regex: /^(SC98|SC77|UMS9|UMS5|T606|T610|T612|T616|T618)\d*[A-Z0-9]*$/, brand: 'Unisoc / Spreadtrum', type: 'Procesador (CPU)' },
    { regex: /^(S5E\d{4}|EXYNOS\d+)[A-Z0-9]*$/, brand: 'Samsung Exynos', type: 'Procesador (CPU)' },
    { regex: /^(HI36\d{2}|HI62\d{2}|KIRIN\d+)[A-Z0-9]*$/, brand: 'Huawei HiSilicon Kirin', type: 'Procesador (CPU)' },
    { regex: /^APL\d{4}[A-Z0-9]*$/, brand: 'Apple Serie A (CPU iPhone)', type: 'Procesador (CPU)' },
    { regex: /^PM(I|M)?\d{3,4}[A-Z0-9]*$/, brand: 'Qualcomm PMIC', type: 'Chip de Carga / Energía (PMIC)' },
  ];

  for (const pat of cpuPatterns) {
    if (pat.regex.test(q)) {
      return {
        isCpuWarning: true,
        code: q,
        cpuBrand: pat.brand,
        cpuType: pat.type,
        message: `"${q}" es un ${pat.type} (${pat.brand}). No contiene los GB de almacenamiento. Lee el chip de Memoria que está justo al lado (empieza con KLM, KM, H9, JZ, SDIN o THG).`,
      };
    }
  }
  return null;
}

// Genera variantes inteligentes corrigiendo errores humanos comunes al leer el chip (O <-> 0, I <-> 1, etc.)
export function generateOpticalCandidates(rawInput) {
  if (!rawInput) return [];
  const rawStr = String(rawInput).toUpperCase().trim();

  // Si el usuario escribió varios bloques separados por espacio (ej. "6MA92 JZ008" o "SEC KMDP6001DA")
  const tokens = rawStr
    .split(/[\s,;\/|]+/)
    .map((t) => normalizeCode(t))
    .filter((t) => t.length >= 2);

  const fullNormalized = normalizeCode(rawStr);
  const baseList = tokens.length > 1 ? [fullNormalized, ...tokens] : [fullNormalized];

  const candidates = [];
  const seen = new Set();
  const addCandidate = (c) => {
    if (c && c.length >= 2 && !seen.has(c)) {
      seen.add(c);
      candidates.push(c);
    }
  };

  for (const token of baseList) {
    addCandidate(token);

    // 1. Corrección para códigos Micron FBGA de 5 caracteres (ej. JZOO8 -> JZ008, J2008 -> JZ008)
    if (token.length === 5 && /^[A-Z0-9]{5}$/.test(token)) {
      const firstTwoLetters = token
        .slice(0, 2)
        .replace(/0/g, 'O')
        .replace(/1/g, 'I')
        .replace(/2/g, 'Z')
        .replace(/5/g, 'S')
        .replace(/8/g, 'B');
      const lastThreeDigits = token
        .slice(2)
        .replace(/O/g, '0')
        .replace(/Q/g, '0')
        .replace(/I/g, '1')
        .replace(/L/g, '1')
        .replace(/Z/g, '2')
        .replace(/S/g, '5')
        .replace(/B/g, '8');
      addCandidate(firstTwoLetters + lastThreeDigits);
    }

    // 2. Corrección en Samsung KM...6001 (ej. KMDP6OO1 -> KMDP6001, KLMAGIJETD -> KLMAG1JETD)
    if (token.startsWith('KM') || token.startsWith('KL')) {
      const fixedSamsung = token
        .replace(/6OO1/g, '6001')
        .replace(/60O1/g, '6001')
        .replace(/6O01/g, '6001')
        .replace(/1OO1/g, '1001')
        .replace(/7OO1/g, '7001')
        .replace(/8OO1/g, '8001')
        .replace(/9OO1/g, '9001')
        .replace(/-BO/g, '-B0');
      addCandidate(fixedSamsung);
    }

    // 3. Corrección en SK Hynix (ej. H9T0 -> H9TQ, H9HQ con O -> 0)
    if (token.startsWith('H9') || token.startsWith('H2')) {
      const fixedHynix = token
        .replace(/^H9T0/, 'H9TQ')
        .replace(/^H9H0/, 'H9HQ')
        .replace(/^H9TQO/, 'H9TQ0');
      addCandidate(fixedHynix);
    }

    // 4. Corrección en SanDisk (ej. SD1N -> SDIN, o falta de guion antes de 16G/32G/64G/128G/256G)
    if (token.startsWith('SDIN') || token.startsWith('SD1N')) {
      const fixedSdin = token.replace(/^SD1N/, 'SDIN');
      addCandidate(fixedSdin);
      const withDash = fixedSdin.replace(/([A-Z0-9]{4})(8G|16G|32G|64G|128G|256G|512G)$/, '$1-$2');
      addCandidate(withDash);
    }
  }

  return candidates;
}

// Convierte densidades en Mbit o Gb (gigabits) a GB legibles (ej. 32Gb -> 4GB)
function formatStorageCapacity(rawVal, unit) {
  if (!rawVal && rawVal !== 0) return null;
  if (typeof rawVal === 'number') {
    if (unit === 'Mbit') {
      const gb = rawVal / 8192;
      if (gb >= 1024) return `${Math.round(gb / 1024)}TB`;
      if (gb >= 1) return `${Math.round(gb)}GB`;
      return `${Math.round(gb * 1024)}MB`;
    }
  }
  const str = String(rawVal).toUpperCase().trim();
  const tbMatch = str.match(/(\d+(?:\.\d+)?)\s*TB/i);
  if (tbMatch) return `${tbMatch[1]}TB`;

  const gbMatch = str.match(/(\d+(?:\.\d+)?)\s*GB/i);
  if (gbMatch) {
    const origMatch = String(rawVal).match(/(\d+(?:\.\d+)?)\s*(GB|Gb)/);
    if (origMatch && origMatch[2] === 'Gb') {
      const bytes = Number(origMatch[1]) / 8;
      return bytes >= 1 ? `${bytes}GB` : `${Math.round(bytes * 1024)}MB`;
    }
    return `${gbMatch[1]}GB`;
  }
  return str.split(' ')[0];
}

function formatRamFromGb(rawStr) {
  if (!rawStr) return null;
  const s = String(rawStr).trim();
  const gbitMatch = s.match(/^(\d+(?:\.\d+)?)\s*Gb\b/);
  if (gbitMatch) {
    const gbits = parseFloat(gbitMatch[1]);
    const gbytes = gbits / 8;
    if (gbytes >= 1) {
      return Number.isInteger(gbytes) ? `${gbytes}GB` : `${gbytes.toFixed(1)}GB`;
    }
    return `${Math.round(gbytes * 1024)}MB`;
  }
  const gbyteMatch = s.match(/(\d+(?:\.\d+)?)\s*GB/i);
  if (gbyteMatch) return `${gbyteMatch[1]}GB`;
  return s;
}

// Extrae la información limpia de un resultado de decodePart de @itxtech/fdnext-core
function parseFdnextDecodeResult(res, queryFallback) {
  if (!res || res.status !== 'ok' || !res.device) return null;
  const dev = res.device;
  const blocks = Array.isArray(res.blocks) ? res.blocks : [];

  let storage = null;
  let storageTech = null;
  let ram = null;
  let ramTech = null;
  let pkg = null;

  for (const b of blocks) {
    if (!Array.isArray(b.fields)) continue;
    for (const f of b.fields) {
      if (f.key === 'storage_density' || f.key === 'density') {
        storage = f.display || formatStorageCapacity(f.value, f.unit);
        if (typeof f.value === 'string' && f.value.includes(' ')) {
          const parts = f.value.split(' ');
          storage = parts[0];
          if (!storageTech && parts[1]) storageTech = parts.slice(1).join(' ');
        }
      }
      if (f.key === 'storage_interface' || f.key === 'product_version') {
        storageTech = f.display || String(f.value);
      }
      if (f.key === 'dram_density') {
        ram = formatRamFromGb(f.display || f.value);
      }
      if (f.key === 'dram_type') {
        ramTech = f.display || String(f.value);
      }
      if (f.key === 'package') {
        pkg = String(f.display || f.value).split(',')[0].trim();
      }
    }
  }

  if (!storage && res.subtitle) {
    const m = res.subtitle.match(/\b(\d+\s*(?:GB|TB))\b/i);
    if (m) storage = m[1].toUpperCase().replace(/\s+/g, '');
  }
  if (!ram && res.subtitle) {
    const m = res.subtitle.match(/\b(\d+\s*Gb)\b/);
    if (m) ram = formatRamFromGb(m[1]);
  }

  if (dev.chipKind === 'dram' && storage && !ram) {
    ram = formatRamFromGb(storage);
    storage = null;
  }

  if (!storage && !ram) return null;

  const prodTypeMap = {
    emcp: 'eMCP',
    umcp: 'uMCP',
    emmc: 'eMMC',
    ufs: 'UFS',
    raw_nand: 'NAND',
    lpddr4: 'LPDDR4',
    lpddr4x: 'LPDDR4X',
    lpddr5: 'LPDDR5',
  };

  const type =
    prodTypeMap[dev.productType] ||
    prodTypeMap[dev.chipKind] ||
    (dev.productType ? dev.productType.toUpperCase() : 'IC');

  const code = dev.markingCode || dev.partNumber || queryFallback;
  const partNumber = dev.partNumber || code;

  return {
    code,
    partNumber,
    storage: storage ? String(storage).toUpperCase().replace(/\s+/g, '') : null,
    ram: ram ? String(ram).toUpperCase().replace(/\s+/g, '') : null,
    manufacturer: dev.vendor?.name || 'Desconocido',
    type,
    tech: [storageTech, ramTech].filter(Boolean).join(' + ') || type,
    package: pkg || null,
    source: 'Motor Industrial Offline',
  };
}

// Reglas heurísticas de ingeniería de fabricantes
export function heuristicDecode(rawCode) {
  const code = normalizeCode(rawCode);
  if (code.length < 4) return null;

  // 1. SAMSUNG eMMC (KLM + A/B/C/D/E/F + G...) y UFS (KLU + C/D/E/F/G + G...)
  if (/^KLM[ABCDEFG]G/.test(code)) {
    const capMap = { A: '16GB', B: '32GB', C: '64GB', D: '128GB', E: '256GB', F: '512GB', G: '1TB' };
    const cap = capMap[code[3]];
    if (cap) {
      return {
        code,
        partNumber: code,
        storage: cap,
        ram: null,
        manufacturer: 'Samsung',
        type: 'eMMC',
        tech: 'eMMC 5.1',
        package: 'BGA153',
        source: 'Regla Oficial Samsung',
      };
    }
  }

  if (/^KLU[CDEFG]G/.test(code)) {
    const capMap = { C: '64GB', D: '128GB', E: '256GB', F: '512GB', G: '1TB' };
    const cap = capMap[code[3]];
    if (cap) {
      return {
        code,
        partNumber: code,
        storage: cap,
        ram: null,
        manufacturer: 'Samsung',
        type: 'UFS',
        tech: 'UFS 2.1 / 3.1 / 4.0',
        package: 'BGA153',
        source: 'Regla Oficial Samsung',
      };
    }
  }

  // Samsung eMCP / uMCP familias comunes
  const samsungMcpPrefixes = [
    { prefix: 'KMFE', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMQE', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMQD', storage: '32GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMQX', storage: '32GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMGD', storage: '32GB', ram: '3GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMDD', storage: '32GB', ram: '3GB', type: 'eMCP', tech: 'eMMC + LPDDR4X' },
    { prefix: 'KMDP', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC + LPDDR4X' },
    { prefix: 'KMDH', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC + LPDDR3/4X' },
    { prefix: 'KMGX', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMRP', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMRC', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMDV', storage: '128GB', ram: '4GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR4X' },
    { prefix: 'KM8V7', storage: '64GB', ram: '4GB', type: 'uMCP', tech: 'UFS + LPDDR4X' },
    { prefix: 'KM8V8', storage: '128GB', ram: '6GB', type: 'uMCP', tech: 'UFS + LPDDR4X' },
    { prefix: 'KM8V9', storage: '256GB', ram: '8GB', type: 'uMCP', tech: 'UFS + LPDDR4X' },
    { prefix: 'KM8F8', storage: '128GB', ram: '6GB', type: 'uMCP', tech: 'UFS 3.1 + LPDDR5' },
    { prefix: 'KM8F9', storage: '256GB', ram: '8GB', type: 'uMCP', tech: 'UFS 3.1 + LPDDR5' },
  ];
  for (const rule of samsungMcpPrefixes) {
    if (code.startsWith(rule.prefix)) {
      return {
        code,
        partNumber: code,
        storage: rule.storage,
        ram: rule.ram,
        manufacturer: 'Samsung',
        type: rule.type,
        tech: rule.tech,
        package: 'BGA254 / BGA221',
        source: 'Regla Oficial Samsung',
      };
    }
  }

  // 2. SK HYNIX eMCP / uMCP / eMMC
  if (/^H9(TQ|HP|HK|HQ|TU)/.test(code) && code.length >= 6) {
    const isUfs = code.startsWith('H9HQ') || code.startsWith('H9TU');
    const codeDigits = code.slice(4, 6);
    const hynixCapMap = {
      '64': { storage: '8GB', ram: '1GB' },
      '17': { storage: '16GB', ram: '2GB' },
      '18': { storage: '16GB', ram: '2GB' },
      '26': { storage: '32GB', ram: '2GB' },
      '27': { storage: '32GB', ram: '3GB' },
      '32': { storage: '32GB', ram: '3GB' },
      '52': { storage: '64GB', ram: '4GB' },
      '53': { storage: isUfs ? '256GB' : '64GB', ram: isUfs ? '8GB' : '4GB' },
      '65': { storage: '64GB', ram: '4GB' },
      '15': { storage: '128GB', ram: '6GB' },
      '16': { storage: '128GB', ram: '4GB' },
      '21': { storage: '256GB', ram: '8GB' },
    };
    const match = hynixCapMap[codeDigits];
    if (match) {
      return {
        code,
        partNumber: code,
        storage: match.storage,
        ram: match.ram,
        manufacturer: 'SK Hynix',
        type: isUfs ? 'uMCP' : 'eMCP',
        tech: isUfs ? 'UFS + LPDDR4X/5' : 'eMMC 5.1 + LPDDR3/4X',
        package: 'BGA254 / BGA221',
        source: 'Regla Oficial SK Hynix',
      };
    }
  }

  if (/^H26M/.test(code) && code.length >= 6) {
    const c = code.slice(4, 6);
    const map = { '41': '8GB', '42': '8GB', '52': '16GB', '54': '16GB', '64': '32GB', '78': '64GB', '91': '64GB' };
    if (map[c]) {
      return {
        code,
        partNumber: code,
        storage: map[c],
        ram: null,
        manufacturer: 'SK Hynix',
        type: 'eMMC',
        tech: 'eMMC 5.1',
        package: 'BGA153',
        source: 'Regla Oficial SK Hynix',
      };
    }
  }

  // 3. MICRON MTFC
  const mtfcMatch = code.match(/^MTFC(\d+G)/);
  if (mtfcMatch) {
    return {
      code,
      partNumber: code,
      storage: `${mtfcMatch[1]}B`,
      ram: null,
      manufacturer: 'Micron',
      type: 'eMMC',
      tech: 'eMMC 5.1',
      package: 'BGA153',
      source: 'Regla Oficial Micron',
    };
  }

  // 4. SANDISK / WD
  if (code.startsWith('SDIN')) {
    const capMatch = code.match(/[-_]?(\d{1,3})G\b/) || code.match(/(8|16|32|64|128|256|512)G/);
    if (capMatch) {
      const num = capMatch[1];
      return {
        code,
        partNumber: code,
        storage: `${num}GB`,
        ram: null,
        manufacturer: 'SanDisk / WD',
        type: code.includes('DDH') || code.includes('FD') ? 'UFS' : 'eMMC',
        tech: 'Managed Flash',
        package: 'BGA153',
        source: 'Regla Oficial SanDisk',
      };
    }
  }

  // 5. KIOXIA / TOSHIBA
  if (/^THG(BM|AF|BX|LF)/.test(code) && code.length >= 8) {
    const isUfs = code.startsWith('THGAF') || code.startsWith('THGLF');
    const isIphone = code.startsWith('THGBX');
    const densityCode = code.slice(6, 8);
    const toshibaMap = {
      G5: '4GB',
      G6: '8GB',
      G7: '16GB',
      G8: '32GB',
      G9: '64GB',
      T0: '128GB',
      T1: '256GB',
      T2: '512GB',
      T3: '1TB',
    };
    if (toshibaMap[densityCode]) {
      return {
        code,
        partNumber: code,
        storage: toshibaMap[densityCode],
        ram: null,
        manufacturer: isIphone ? 'Toshiba / Kioxia (iPhone)' : 'Kioxia / Toshiba',
        type: isIphone ? 'NVMe NAND' : isUfs ? 'UFS' : 'eMMC',
        tech: isIphone ? 'Apple PCIe NAND' : isUfs ? 'UFS 2.1 / 3.1' : 'eMMC 5.1',
        package: isIphone ? 'BGA110' : 'BGA153',
        source: 'Regla Oficial Kioxia/Toshiba',
      };
    }
  }

  return null;
}

// ============================================================================
// GESTIÓN DE BASE DE DATOS LOCAL + PERSONALIZADA + AUTO-APRENDIZAJE
// ============================================================================

export function getCustomDatabase() {
  const list = safeGetStorage(STORAGE_KEYS.CUSTOM_DB, []);
  return Array.isArray(list) ? list : [];
}

export function saveCustomDatabase(list) {
  safeSetStorage(STORAGE_KEYS.CUSTOM_DB, Array.isArray(list) ? list : []);
}

export function getAutoLearnedDatabase() {
  const list = safeGetStorage(STORAGE_KEYS.AUTO_LEARNED_DB, []);
  return Array.isArray(list) ? list : [];
}

export function addOrUpdateCustomChip(chip, originalCodeToReplace = null) {
  const code = normalizeCode(chip?.code);
  if (!code || code.length < 3) return null;
  let list = getCustomDatabase();

  if (originalCodeToReplace) {
    const oldNorm = normalizeCode(originalCodeToReplace);
    if (oldNorm && oldNorm !== code) {
      list = list.filter((item) => normalizeCode(item.code) !== oldNorm);
    }
  }

  const entry = {
    code,
    partNumber: chip.partNumber ? normalizeCode(chip.partNumber) : code,
    storage: String(chip.storage || '64GB').toUpperCase().trim(),
    ram: chip.ram ? String(chip.ram).toUpperCase().trim() : null,
    manufacturer: chip.manufacturer || 'Samsung',
    type: chip.type || 'eMCP',
    tech: chip.tech || chip.type || 'eMCP',
    package: chip.package || null,
    notes: chip.notes || '',
    updatedAt: new Date().toISOString(),
    source: 'Base Eco Lógica García',
  };

  const idx = list.findIndex((item) => normalizeCode(item.code) === code);
  if (idx >= 0) {
    list[idx] = entry;
  } else {
    list.unshift(entry);
  }
  saveCustomDatabase(list);
  return entry;
}

export function addMultipleCustomChips(chipsArray) {
  if (!Array.isArray(chipsArray) || chipsArray.length === 0) return 0;
  const list = getCustomDatabase();
  let count = 0;

  for (let i = chipsArray.length - 1; i >= 0; i--) {
    const chip = chipsArray[i];
    const code = normalizeCode(chip?.code);
    if (!code || code.length < 3) continue;

    const entry = {
      code,
      partNumber: chip.partNumber ? normalizeCode(chip.partNumber) : code,
      storage: String(chip.storage || '64GB').toUpperCase().trim(),
      ram: chip.ram ? String(chip.ram).toUpperCase().trim() : null,
      manufacturer: chip.manufacturer || 'Samsung',
      type: chip.type || 'eMCP',
      tech: chip.tech || chip.type || 'eMCP',
      package: chip.package || null,
      notes: chip.notes || '',
      updatedAt: new Date().toISOString(),
      source: 'Base Eco Lógica García',
    };

    const idx = list.findIndex((item) => normalizeCode(item.code) === code);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }
    count++;
  }

  if (count > 0) {
    saveCustomDatabase(list);
  }
  return count;
}

export function deleteCustomChip(code) {
  const norm = normalizeCode(code);
  const list = getCustomDatabase().filter((item) => normalizeCode(item.code) !== norm);
  saveCustomDatabase(list);
  return list;
}

export function getAllEditableCatalog() {
  const custom = getCustomDatabase();
  const auto = getAutoLearnedDatabase();
  const seen = new Set();
  const merged = [];

  for (const item of custom) {
    const k = normalizeCode(item.code);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    merged.push({ ...item, isCustom: true });
  }
  for (const item of auto) {
    const k = normalizeCode(item.code);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    merged.push({ ...item, isAutoLearned: true });
  }
  for (const item of SEED_IC_CATALOG) {
    const k = normalizeCode(item.code);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    merged.push({ ...item, isSeed: true });
  }
  return merged;
}

export function getPendingSuggestions() {
  const list = safeGetStorage(STORAGE_KEYS.PENDING_SUGGESTIONS, []);
  return Array.isArray(list) ? list : [];
}

export function addPendingSuggestion(suggestion) {
  const list = getPendingSuggestions();
  const code = normalizeCode(suggestion?.code);
  if (!code || code.length < 3) return list;
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code,
    storage: suggestion.storage || '64GB',
    ram: suggestion.ram || '',
    manufacturer: suggestion.manufacturer || 'Desconocido',
    type: suggestion.type || 'eMCP',
    notes: suggestion.notes || '',
    submittedBy: suggestion.submittedBy || 'Operador',
    createdAt: new Date().toISOString(),
    isEdit: Boolean(suggestion.isEdit),
    originalCode: suggestion.originalCode ? normalizeCode(suggestion.originalCode) : null,
    originalData: suggestion.originalData || null,
  };
  const next = [item, ...list.filter((x) => x.code !== code && x.originalCode !== code)];
  safeSetStorage(STORAGE_KEYS.PENDING_SUGGESTIONS, next);
  return next;
}

export function addMultiplePendingSuggestions(suggestionsArray) {
  if (!Array.isArray(suggestionsArray) || suggestionsArray.length === 0) return 0;
  let list = getPendingSuggestions();
  let count = 0;

  for (let i = suggestionsArray.length - 1; i >= 0; i--) {
    const suggestion = suggestionsArray[i];
    const code = normalizeCode(suggestion?.code);
    if (!code || code.length < 3) continue;
    const item = {
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      code,
      storage: suggestion.storage || '64GB',
      ram: suggestion.ram || '',
      manufacturer: suggestion.manufacturer || 'Desconocido',
      type: suggestion.type || 'eMCP',
      notes: suggestion.notes || '',
      submittedBy: suggestion.submittedBy || 'Operador',
      createdAt: new Date().toISOString(),
      isEdit: Boolean(suggestion.isEdit),
      originalCode: suggestion.originalCode ? normalizeCode(suggestion.originalCode) : null,
      originalData: suggestion.originalData || null,
    };
    list = [item, ...list.filter((x) => x.code !== code && x.originalCode !== code)];
    count++;
  }

  if (count > 0) {
    safeSetStorage(STORAGE_KEYS.PENDING_SUGGESTIONS, list);
  }
  return count;
}

export function removePendingSuggestion(id) {
  const next = getPendingSuggestions().filter((x) => x.id !== id);
  safeSetStorage(STORAGE_KEYS.PENDING_SUGGESTIONS, next);
  return next;
}

export function getAdminPin() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN);
    return saved && saved.trim().length >= 4 ? saved.trim() : DEFAULT_MASTER_PIN;
  } catch {
    return DEFAULT_MASTER_PIN;
  }
}

export function verifyAdminPin(inputPin) {
  const clean = String(inputPin || '').trim();
  // Siempre permite el PIN maestro configurado o el PIN maestro de respaldo 252002
  return clean === getAdminPin() || clean === DEFAULT_MASTER_PIN;
}

export function setAdminPin(newPin) {
  const clean = String(newPin || '').trim();
  if (clean.length >= 4) {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, clean);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// ============================================================================
// MOTOR DE BÚSQUEDA Y DECODIFICACIÓN UNIFICADO CON AUTO-CORRECCIÓN ÓPTICA
// ============================================================================

function decodeSingleCandidateOffline(q) {
  if (!q || q.length < 2) return null;

  // 1. Base de Datos Propia del Admin (Eco Lógica García)
  const customList = getCustomDatabase();
  const exactCustom = customList.find(
    (c) => normalizeCode(c.code) === q || (c.partNumber && normalizeCode(c.partNumber) === q)
  );
  if (exactCustom) {
    return { ...exactCustom, source: 'Base Eco Lógica García (Admin)' };
  }

  // 2. Catálogo Semilla Curado y Auto-Aprendido
  const autoList = getAutoLearnedDatabase();
  const combinedSeed = [...autoList, ...SEED_IC_CATALOG];
  const exactSeed = combinedSeed.find(
    (c) =>
      normalizeCode(c.code) === q ||
      (c.partNumber && normalizeCode(c.partNumber) === q) ||
      normalizeCode(c.code).split('-')[0] === q
  );
  if (exactSeed) {
    return {
      ...exactSeed,
      source: exactSeed.source || 'Catálogo Verificado',
    };
  }

  // 3. Motor Industrial Offline @itxtech/fdnext-core
  const eng = getFdEngine();
  if (eng) {
    try {
      const fdRes = eng.decodePart({ query: q, lang: 'eng' });
      const parsed = parseFdnextDecodeResult(fdRes, q);
      if (parsed && parsed.storage) {
        return parsed;
      }

      if (q.length >= 5) {
        const searchRes = eng.searchParts({ query: q, lang: 'eng', limit: 5 });
        if (searchRes?.status === 'ok' && Array.isArray(searchRes.items) && searchRes.items.length > 0) {
          const bestItem = searchRes.items[0];
          const targetPart = bestItem.device?.markingCode || bestItem.device?.partNumber || bestItem.label;
          if (targetPart) {
            const fullDecode = eng.decodePart({ query: targetPart, lang: 'eng' });
            const parsedBest = parseFdnextDecodeResult(fullDecode, targetPart);
            if (parsedBest && parsedBest.storage) {
              return {
                ...parsedBest,
                matchedFromPartial: q !== normalizeCode(targetPart),
              };
            }
          }
        }
      }
    } catch {
      // Continuar a heurística
    }
  }

  // 4. Motor Heurístico de Nomenclatura
  const heur = heuristicDecode(q);
  if (heur) return heur;

  return null;
}

export function decodeChipOffline(rawQuery) {
  const candidates = generateOpticalCandidates(rawQuery);
  if (candidates.length === 0) return null;

  const originalNorm = candidates[0];

  for (const cand of candidates) {
    const res = decodeSingleCandidateOffline(cand);
    if (res && (res.storage || res.ram)) {
      if (cand !== originalNorm) {
        return {
          ...res,
          correctedFrom: originalNorm,
          correctedTo: cand,
        };
      }
      return res;
    }
  }

  return null;
}

// Búsqueda instantánea de sugerencias con soporte de corrección óptica
export function searchChipsInstant(rawQuery, limit = 10) {
  const candidates = generateOpticalCandidates(rawQuery);
  if (candidates.length === 0) return [];

  const results = [];
  const seen = new Set();

  const pushUnique = (item) => {
    if (!item || !item.code) return;
    const key = normalizeCode(item.code);
    if (seen.has(key)) return;
    seen.add(key);
    results.push(item);
  };

  const allLocal = [...getCustomDatabase(), ...getAutoLearnedDatabase(), ...SEED_IC_CATALOG];

  for (const q of candidates) {
    if (q.length < 2) continue;

    for (const item of allLocal) {
      const codeNorm = normalizeCode(item.code);
      const pnNorm = normalizeCode(item.partNumber || '');
      if (codeNorm.includes(q) || pnNorm.includes(q)) {
        pushUnique({
          ...item,
          source: item.source || 'Catálogo Eco Lógica García',
        });
        if (results.length >= limit) return results;
      }
    }

    const eng = getFdEngine();
    if (eng) {
      try {
        const searchRes = eng.searchParts({ query: q, lang: 'eng', limit: limit });
        if (searchRes?.status === 'ok' && Array.isArray(searchRes.items)) {
          for (const it of searchRes.items) {
            const marking = it.device?.markingCode;
            const pn = it.device?.partNumber || it.label;
            const displayCode = marking || pn;
            if (!displayCode) continue;

            let storage = null;
            let ram = null;
            if (Array.isArray(it.fields)) {
              for (const f of it.fields) {
                if (f.key === 'density' || f.key === 'storage_density') {
                  storage = f.display || formatStorageCapacity(f.value, f.unit);
                }
                if (f.key === 'dram_density') {
                  ram = formatRamFromGb(f.display || f.value);
                }
              }
            }

            let fullDecoded = null;
            if (!storage || it.device?.productType === 'emcp' || it.device?.productType === 'umcp') {
              const dec = eng.decodePart({ query: displayCode, lang: 'eng' });
              fullDecoded = parseFdnextDecodeResult(dec, displayCode);
            }

            pushUnique(
              fullDecoded || {
                code: displayCode,
                partNumber: pn,
                storage: storage ? String(storage).toUpperCase().replace(/\s+/g, '') : 'Ver detalle',
                ram: ram,
                manufacturer: it.device?.vendor?.name || 'Desconocido',
                type: (it.device?.productType || 'IC').toUpperCase(),
                tech: (it.badges || []).join(' · '),
                source: 'Motor Industrial Offline',
              }
            );
            if (results.length >= limit) return results;
          }
        }
      } catch {
        // Ignorar errores de búsqueda parcial
      }
    }
  }

  if (results.length === 0) {
    for (const q of candidates) {
      const heur = heuristicDecode(q);
      if (heur) {
        pushUnique(heur);
        break;
      }
    }
  }

  return results;
}

// Auto-Aprendizaje Online Opcional
export async function lookupOnlineFallbackAndLearn(rawQuery) {
  const candidates = generateOpticalCandidates(rawQuery);
  const q = candidates[0];
  if (!q || q.length < 3) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3200);
    const resp = await fetch(`https://api.mobileicchecker.com/ic/${encodeURIComponent(q)}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const d = await resp.json();
      if (d && d.name && (d.storage?.capacity || d.ram?.capacity)) {
        const learned = {
          code: normalizeCode(d.name),
          partNumber: normalizeCode(d.name),
          storage: d.storage?.capacity ? String(d.storage.capacity).toUpperCase().replace(/\s+/g, '') : null,
          ram: d.ram?.capacity ? String(d.ram.capacity).toUpperCase().replace(/\s+/g, '') : null,
          manufacturer: d.manufacturer || 'Desconocido',
          type: d.type || 'IC',
          tech: [d.storage?.tech, d.storage?.version, d.ram?.tech].filter(Boolean).join(' '),
          package: d.package || null,
          learnedAt: new Date().toISOString(),
          source: 'Auto-Aprendido Online',
        };

        const list = getAutoLearnedDatabase();
        if (!list.some((x) => normalizeCode(x.code) === learned.code)) {
          const next = [learned, ...list];
          safeSetStorage(STORAGE_KEYS.AUTO_LEARNED_DB, next);
        }
        return learned;
      }
    }
  } catch {
    // Sin internet o CORS bloqueado, continúa 100% offline
  }
  return null;
}

export function getDatabaseStats() {
  const customCount = getCustomDatabase().length;
  const learnedCount = getAutoLearnedDatabase().length;
  const seedCount = SEED_IC_CATALOG.length;
  const pendingCount = getPendingSuggestions().length;
  const industrialCount = 25325;

  return {
    customCount,
    learnedCount,
    seedCount,
    pendingCount,
    industrialCount,
    totalOfflineCount: industrialCount + seedCount + customCount + learnedCount,
  };
}
