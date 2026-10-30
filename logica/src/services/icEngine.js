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

// Convierte cualquier cadena de capacidad ("4GB", "128GB", "1TB", "2TB") a número en GB para comparar Capacidad Máxima
export function capacityToGbNumber(capStr) {
  if (!capStr) return 0;
  const s = String(capStr).toUpperCase().trim();
  const tbMatch = s.match(/(\d+(?:\.\d+)?)\s*T/);
  if (tbMatch) return parseFloat(tbMatch[1]) * 1024;
  const gbMatch = s.match(/(\d+(?:\.\d+)?)\s*G/);
  if (gbMatch) return parseFloat(gbMatch[1]);
  const mbMatch = s.match(/(\d+(?:\.\d+)?)\s*M/);
  if (mbMatch) return parseFloat(mbMatch[1]) / 1024;
  return 0;
}

// Detecta si el usuario escribió por error el código del Procesador (CPU), PMIC, RF o el chip de PURA RAM en vez del Almacenamiento
export function detectCpuInsteadOfMemory(rawQuery) {
  const q = normalizeCode(rawQuery);
  if (!q || q.length < 3) return null;

  // 1. Patrones de Procesadores (CPU), PMIC (Carga/Energía) y Radiofrecuencia (RF/WiFi)
  const cpuPatterns = [
    { regex: /^(SM|SDM|MSM|APQ|QCM)\d{3,4}[A-Z0-9]*$/, brand: 'Qualcomm Snapdragon', type: 'Procesador (CPU)', category: 'CPU' },
    { regex: /^MT6[5789]\d{2}[A-Z0-9]*$/, brand: 'MediaTek Helio / Dimensity', type: 'Procesador (CPU)', category: 'CPU' },
    { regex: /^MT63\d{2}[A-Z0-9]*$/, brand: 'MediaTek PMIC', type: 'Chip de Energía (PMIC)', category: 'PMIC' },
    { regex: /^MT8[1367]\d{2}[A-Z0-9]*$/, brand: 'MediaTek Tablet / SoC', type: 'Procesador (CPU)', category: 'CPU' },
    { regex: /^(SC98|SC77|UMS9|UMS5|T606|T610|T612|T616|T618|T700)\d*[A-Z0-9]*$/, brand: 'Unisoc / Spreadtrum', type: 'Procesador (CPU)', category: 'CPU' },
    { regex: /^(S5E\d{4}|EXYNOS\d+|SHANNON\d*)[A-Z0-9]*$/, brand: 'Samsung Exynos / Modem', type: 'Procesador / Modem', category: 'CPU' },
    { regex: /^(HI36\d{2}|HI62\d{2}|KIRIN\d+)[A-Z0-9]*$/, brand: 'Huawei HiSilicon Kirin', type: 'Procesador (CPU)', category: 'CPU' },
    { regex: /^APL\d{4}[A-Z0-9]*$/, brand: 'Apple Serie A (CPU iPhone)', type: 'Procesador (CPU)', category: 'CPU' },
    { regex: /^(PM|PMI|PMK|PMR|PMB|SMB)\d{3,4}[A-Z0-9]*$/, brand: 'Qualcomm PMIC', type: 'Chip de Carga / Energía (PMIC)', category: 'PMIC' },
    { regex: /^(S2MPU|S2MPS|S2DOS)\d+[A-Z0-9]*$/, brand: 'Samsung PMIC', type: 'Chip de Energía (PMIC)', category: 'PMIC' },
    { regex: /^(HI64\d{2}|HI65\d{2})[A-Z0-9]*$/, brand: 'HiSilicon PMIC', type: 'Chip de Energía / Audio', category: 'PMIC' },
    { regex: /^(338S|343S)\d+[A-Z0-9]*$/, brand: 'Apple PMIC / Audio IC', type: 'Chip de Energía / Audio (iPhone)', category: 'PMIC' },
    { regex: /^(SDR|WTR|WCN|QET|QPM|QDM)\d{3,4}[A-Z0-9]*$/, brand: 'Qualcomm RF / WiFi', type: 'Chip de Señal / WiFi / RF', category: 'RF' },
    { regex: /^(SKY\d{4,5}|QM\d{4,5})[A-Z0-9]*$/, brand: 'Skyworks / Qorvo', type: 'Amplificador de Señal (RF)', category: 'RF' },
  ];

  for (const pat of cpuPatterns) {
    if (pat.regex.test(q)) {
      return {
        isCpuWarning: true,
        wrongChipCategory: pat.category,
        code: q,
        cpuBrand: pat.brand,
        cpuType: pat.type,
        title: `Chip equivocado: ${pat.type} (${pat.brand})`,
        message: `"${q}" no tiene almacenamiento. Busca en la placa el chip de memoria (KLM, KLU, KM, H9, HN8T, JZ, SDIN, THG o KICM).`,
      };
    }
  }

  // 2. Patrones de Chips que son PURA MEMORIA RAM (DRAM LPDDR sin almacenamiento)
  const pureRamPatterns = [
    { regex: /^K4(U|F|E|B|A)[A-Z0-9]{4,}/, brand: 'Samsung LPDDR DRAM', type: 'Chip de PURA RAM (Sin Almacenamiento)' },
    { regex: /^K3(U|L|Q|R)[A-Z0-9]{4,}/, brand: 'Samsung LPDDR DRAM', type: 'Chip de PURA RAM (Sin Almacenamiento)' },
    { regex: /^H9(HC|TK|CC)NNN[A-Z0-9]*/, brand: 'SK Hynix LPDDR DRAM', type: 'Chip de PURA RAM (Sin Almacenamiento)' },
    { regex: /^H5(4G|TC|AN)[A-Z0-9]{3,}/, brand: 'SK Hynix DDR/LPDDR DRAM', type: 'Chip de PURA RAM (Sin Almacenamiento)' },
    { regex: /^MT(53|52|62|40|41)[A-Z0-9]{3,}/, brand: 'Micron LPDDR DRAM', type: 'Chip de PURA RAM (Sin Almacenamiento)' },
    { regex: /^EDF[A-Z0-9]{4,}/, brand: 'Micron / Elpida LPDDR DRAM', type: 'Chip de PURA RAM (Sin Almacenamiento)' },
    { regex: /^D[89][A-Z0-9]{3}$/, brand: 'Micron FBGA DRAM (D9/D8)', type: 'Chip de PURA RAM (Sin Almacenamiento)' },
  ];

  for (const ramPat of pureRamPatterns) {
    if (ramPat.regex.test(q)) {
      return {
        isCpuWarning: true,
        isRamOnlyWarning: true,
        wrongChipCategory: 'RAM_ONLY',
        code: q,
        cpuBrand: ramPat.brand,
        cpuType: ramPat.type,
        title: `Chip equivocado: Solo RAM (${ramPat.brand})`,
        message: `"${q}" es solo memoria RAM y no indica los GB del teléfono. Busca el otro chip de almacenamiento (KLU, KLM, HN8T, H28U, THGAF, SDIN, JZ o KICM).`,
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

  const isPureDram = dev.chipKind === 'dram' || (!storage && Boolean(ram));

  return {
    code,
    partNumber,
    storage: storage ? String(storage).toUpperCase().replace(/\s+/g, '') : null,
    ram: ram ? String(ram).toUpperCase().replace(/\s+/g, '') : null,
    manufacturer: dev.vendor?.name || 'Desconocido',
    type,
    tech: [storageTech, ramTech].filter(Boolean).join(' + ') || type,
    package: pkg || null,
    isPureDram,
    source: 'Motor Industrial Offline',
  };
}

// Reglas heurísticas de ingeniería de fabricantes (Desde 4GB hasta 2TB + Marcas Especiales)
export function heuristicDecode(rawCode) {
  const code = normalizeCode(rawCode);
  if (code.length < 4) return null;

  // 1. SAMSUNG eMMC (KLM4G=4GB, KLM8G=8GB, KLM + A/B/C/D/E/F/G/H + G...) y UFS (KLU + B/C/D/E/F/G/H + G...)
  if (/^KLM([48ABCDEFGH])G/.test(code)) {
    const capMap = {
      '4': '4GB',
      '8': '8GB',
      A: '16GB',
      B: '32GB',
      C: '64GB',
      D: '128GB',
      E: '256GB',
      F: '512GB',
      G: '1TB',
      H: '2TB',
    };
    const cap = capMap[code[3]];
    if (cap) {
      return {
        code,
        partNumber: code,
        storage: cap,
        ram: null,
        manufacturer: 'Samsung',
        type: 'eMMC',
        tech: 'eMMC 5.0 / 5.1',
        package: 'BGA153',
        source: 'Regla Oficial Samsung',
      };
    }
  }

  if (/^KLU([BCDEFGH])G/.test(code)) {
    const capMap = {
      B: '32GB',
      C: '64GB',
      D: '128GB',
      E: '256GB',
      F: '512GB',
      G: '1TB',
      H: '2TB',
    };
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

  // Samsung Apple NAND (KLACG...)
  if (code.startsWith('KLACG')) {
    return {
      code,
      partNumber: code,
      storage: '64GB',
      ram: null,
      manufacturer: 'Apple / iPhone NAND (Samsung)',
      type: 'NVMe NAND',
      tech: 'Apple PCIe NAND (BGA110)',
      package: 'BGA110',
      source: 'Regla Oficial Apple/Samsung',
    };
  }

  // Samsung eMCP / uMCP familias completas (4GB hasta 1TB)
  const samsungMcpPrefixes = [
    { prefix: 'KMK5', storage: '4GB', ram: '512MB', type: 'eMCP', tech: 'eMMC + LPDDR2' },
    { prefix: 'KMKJ', storage: '4GB', ram: '1GB', type: 'eMCP', tech: 'eMMC + LPDDR2' },
    { prefix: 'KMK7', storage: '8GB', ram: '1GB', type: 'eMCP', tech: 'eMMC + LPDDR2' },
    { prefix: 'KMF7', storage: '8GB', ram: '1GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMF8', storage: '8GB', ram: '1GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMFN', storage: '8GB', ram: '1GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMFJ', storage: '8GB', ram: '1GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMK8', storage: '8GB', ram: '1GB', type: 'eMCP', tech: 'eMMC + LPDDR2' },
    { prefix: 'KMQN', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMKN', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMFE', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMQE', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMQ7', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMQ8', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC + LPDDR3' },
    { prefix: 'KMR31', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3' },
    { prefix: 'KMR4Z', storage: '16GB', ram: '2GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3' },
    { prefix: 'KMR82', storage: '32GB', ram: '3GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3' },
    { prefix: 'KMRD', storage: '32GB', ram: '3GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3' },
    { prefix: 'KMQD', storage: '32GB', ram: '3GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3' },
    { prefix: 'KMQX', storage: '32GB', ram: '2GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3' },
    { prefix: 'KMGD', storage: '32GB', ram: '3GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR4X' },
    { prefix: 'KMGP', storage: '32GB', ram: '3GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR4X' },
    { prefix: 'KMDD', storage: '32GB', ram: '3GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR4X' },
    { prefix: 'KMDH', storage: '32GB', ram: '3GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR4X' },
    { prefix: 'KMDV', storage: '32GB', ram: '4GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR4X' },
    { prefix: 'KMDP', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR4X' },
    { prefix: 'KMGX', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3' },
    { prefix: 'KMRP', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3/4X' },
    { prefix: 'KMRX', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3' },
    { prefix: 'KMRC', storage: '64GB', ram: '4GB', type: 'eMCP', tech: 'eMMC 5.1 + LPDDR3' },
    { prefix: 'KM2V7', storage: '64GB', ram: '4GB', type: 'uMCP', tech: 'UFS 2.1 + LPDDR4X' },
    { prefix: 'KM5V7', storage: '64GB', ram: '4GB', type: 'uMCP', tech: 'UFS 2.1 + LPDDR4X' },
    { prefix: 'KM2V8', storage: '128GB', ram: '6GB', type: 'uMCP', tech: 'UFS 2.1 + LPDDR4X' },
    { prefix: 'KM3V6', storage: '128GB', ram: '6GB', type: 'uMCP', tech: 'UFS 2.1 + LPDDR4X' },
    { prefix: 'KM5V8', storage: '128GB', ram: '6GB', type: 'uMCP', tech: 'UFS 2.2 + LPDDR4X' },
    { prefix: 'KM2L9', storage: '128GB', ram: '6GB', type: 'uMCP', tech: 'UFS 2.2 + LPDDR4X' },
    { prefix: 'KM5L9', storage: '128GB', ram: '6GB', type: 'uMCP', tech: 'UFS 2.2 + LPDDR4X' },
    { prefix: 'KM8L9', storage: '128GB', ram: '8GB', type: 'uMCP', tech: 'UFS 3.1 + LPDDR4X' },
    { prefix: 'KM8V7', storage: '128GB', ram: '6GB', type: 'uMCP', tech: 'UFS 2.1 + LPDDR4X' },
    { prefix: 'KM8V8', storage: '128GB', ram: '8GB', type: 'uMCP', tech: 'UFS 2.2 + LPDDR4X' },
    { prefix: 'KM8V9', storage: '256GB', ram: '8GB', type: 'uMCP', tech: 'UFS 2.2 + LPDDR4X' },
    { prefix: 'KM8F8', storage: '128GB', ram: '8GB', type: 'uMCP', tech: 'UFS 3.1 + LPDDR5' },
    { prefix: 'KM8F9', storage: '256GB', ram: '8GB', type: 'uMCP', tech: 'UFS 3.1 + LPDDR5' },
    { prefix: 'KM5P9', storage: '256GB', ram: '8GB', type: 'uMCP', tech: 'UFS 3.1 + LPDDR5' },
    { prefix: 'KM9P9', storage: '512GB', ram: '12GB', type: 'uMCP', tech: 'UFS 3.1 + LPDDR5X' },
    { prefix: 'KM9F9', storage: '512GB', ram: '12GB', type: 'uMCP', tech: 'UFS 4.0 + LPDDR5X' },
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

  // 2. SK HYNIX eMCP / uMCP / eMMC / UFS / Apple NAND (De 4GB a 1TB)
  if (/^H9(TP|TQ|HP|HK|HQ|TU|QT|HR|AG)/.test(code) && code.length >= 6) {
    if (code.startsWith('H9AG9G')) {
      return {
        code,
        partNumber: code,
        storage: '64GB',
        ram: '4GB',
        manufacturer: 'SK Hynix',
        type: 'eMCP',
        tech: 'eMMC 5.1 + LPDDR4X',
        package: 'BGA254',
        source: 'Regla Oficial SK Hynix',
      };
    }
    if (code.startsWith('H9QT0G')) {
      return {
        code,
        partNumber: code,
        storage: '128GB',
        ram: '6GB',
        manufacturer: 'SK Hynix',
        type: 'uMCP',
        tech: 'UFS 2.2 + LPDDR4X',
        package: 'BGA254',
        source: 'Regla Oficial SK Hynix',
      };
    }
    if (code.startsWith('H9QT1G')) {
      return {
        code,
        partNumber: code,
        storage: '256GB',
        ram: '8GB',
        manufacturer: 'SK Hynix',
        type: 'uMCP',
        tech: 'UFS 3.1 + LPDDR4X/5',
        package: 'BGA254',
        source: 'Regla Oficial SK Hynix',
      };
    }
    if (code.startsWith('H9HR56')) {
      return {
        code,
        partNumber: code,
        storage: '512GB',
        ram: '8GB',
        manufacturer: 'SK Hynix',
        type: 'uMCP',
        tech: 'UFS 3.1 + LPDDR5',
        package: 'BGA254',
        source: 'Regla Oficial SK Hynix',
      };
    }

    const isUfs = code.startsWith('H9HQ') || code.startsWith('H9TU') || code.startsWith('H9QT') || code.startsWith('H9HR');
    const codeDigits = code.slice(4, 6);
    const hynixCapMap = {
      '32': { storage: code.startsWith('H9TP') ? '4GB' : '32GB', ram: code.startsWith('H9TP') ? '1GB' : '3GB' },
      '64': { storage: '8GB', ram: '1GB' },
      '65': { storage: code.startsWith('H9TP') ? '8GB' : '64GB', ram: code.startsWith('H9TP') ? '1GB' : '4GB' },
      '17': { storage: '16GB', ram: '2GB' },
      '18': { storage: '16GB', ram: '2GB' },
      '26': { storage: '32GB', ram: '2GB' },
      '27': { storage: '32GB', ram: '3GB' },
      '52': { storage: '64GB', ram: '4GB' },
      '53': { storage: isUfs ? '256GB' : '64GB', ram: isUfs ? '8GB' : '4GB' },
      '54': { storage: '64GB', ram: '4GB' },
      '15': { storage: '128GB', ram: '6GB' },
      '16': { storage: '128GB', ram: '4GB' },
      '21': { storage: '256GB', ram: '8GB' },
      '25': { storage: '512GB', ram: '12GB' },
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

  if (/^HN8T/.test(code) && code.length >= 6) {
    const c = code.slice(4, 6);
    const ufsMap = {
      '05': '128GB',
      '06': '128GB',
      '15': '256GB',
      '16': '256GB',
      '25': '512GB',
      '26': '512GB',
      '35': '1TB',
      '36': '1TB',
    };
    if (ufsMap[c]) {
      return {
        code,
        partNumber: code,
        storage: ufsMap[c],
        ram: null,
        manufacturer: 'SK Hynix',
        type: 'UFS',
        tech: 'UFS 3.1 / 4.0',
        package: 'BGA153',
        source: 'Regla Oficial SK Hynix',
      };
    }
  }

  if (/^H28[US]/.test(code) && code.length >= 6) {
    const c = code.slice(4, 6);
    const h28Map = {
      '62': '32GB',
      '6D': '32GB',
      '74': '64GB',
      '7Q': '64GB',
      '88': '128GB',
      '8Q': '128GB',
    };
    if (h28Map[c]) {
      return {
        code,
        partNumber: code,
        storage: h28Map[c],
        ram: null,
        manufacturer: 'SK Hynix',
        type: 'UFS',
        tech: 'UFS 2.1',
        package: 'BGA153',
        source: 'Regla Oficial SK Hynix',
      };
    }
  }

  if (/^H26M/.test(code) && code.length >= 6) {
    const c = code.slice(4, 6);
    const map = {
      '31': '4GB',
      '41': '8GB',
      '42': '8GB',
      '52': '16GB',
      '54': '16GB',
      '64': '32GB',
      '78': '64GB',
      '91': '64GB',
      '88': '128GB',
    };
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

  // SK Hynix Apple iPhone NAND (H23Q / H23B / H2JTD / H230)
  if (/^H2(3Q|3B|30|JTD)/.test(code)) {
    let appleCap = null;
    if (code.includes('DG8')) appleCap = '16GB';
    else if (code.includes('EG8') || code.includes('EH8')) appleCap = '32GB';
    else if (code.includes('FG8')) appleCap = '64GB';
    else if (code.includes('1T8') || code.includes('158')) appleCap = '128GB';
    else if (code.includes('2T8')) appleCap = '256GB';
    else if (code.includes('4T8')) appleCap = '512GB';
    else if (code.includes('8T8')) appleCap = '1TB';
    if (appleCap) {
      return {
        code,
        partNumber: code,
        storage: appleCap,
        ram: null,
        manufacturer: 'Apple / iPhone NAND (SK Hynix)',
        type: 'NVMe NAND',
        tech: 'Apple PCIe NAND (BGA70/110/315)',
        package: 'BGA110',
        source: 'Regla Oficial Apple/Hynix',
      };
    }
  }

  // 3. MICRON MTFC / MT29 (4GB hasta 1TB)
  const mtfcMatch = code.match(/^MTFC(\d+)(G|T)/);
  if (mtfcMatch) {
    const unit = mtfcMatch[2] === 'T' ? 'TB' : 'GB';
    return {
      code,
      partNumber: code,
      storage: `${mtfcMatch[1]}${unit}`,
      ram: null,
      manufacturer: 'Micron',
      type: Number(mtfcMatch[1]) >= 256 || unit === 'TB' ? 'UFS' : 'eMMC',
      tech: 'Managed Flash Micron',
      package: 'BGA153',
      source: 'Regla Oficial Micron',
    };
  }

  if (/^MT29F(\d+)T08/.test(code)) {
    const tbBits = Number(code.match(/^MT29F(\d+)T08/)[1]);
    const gbBytes = (tbBits * 1024) / 8;
    const capStr = gbBytes >= 1024 ? `${Math.round(gbBytes / 1024)}TB` : `${Math.round(gbBytes)}GB`;
    return {
      code,
      partNumber: code,
      storage: capStr,
      ram: null,
      manufacturer: 'Micron',
      type: 'NAND / UFS',
      tech: 'Micron 3D NAND',
      package: 'BGA153',
      source: 'Regla Oficial Micron',
    };
  }

  if (/^MT29[TV]ZZZ/.test(code)) {
    const dMatch = code.match(/D([456789A])/);
    const dMap = { '4': '4GB', '5': '8GB', '6': '16GB', '7': '32GB', '8': '64GB', '9': '128GB', A: '256GB' };
    if (dMatch && dMap[dMatch[1]]) {
      return {
        code,
        partNumber: code,
        storage: dMap[dMatch[1]],
        ram: null,
        manufacturer: 'Micron',
        type: code.startsWith('MT29V') ? 'uMCP' : 'eMCP',
        tech: 'Micron MCP',
        package: 'BGA221 / BGA254',
        source: 'Regla Oficial Micron',
      };
    }
  }

  // 4. SANDISK / WD (De 4GB hasta 1TB + Apple SDM/SDSB)
  if (code.startsWith('SDIN')) {
    const tbMatch = code.match(/[-_]?(\d)T\b/);
    if (tbMatch) {
      return {
        code,
        partNumber: code,
        storage: `${tbMatch[1]}TB`,
        ram: null,
        manufacturer: 'SanDisk / WD',
        type: 'UFS',
        tech: 'UFS 3.1 / 4.0',
        package: 'BGA153',
        source: 'Regla Oficial SanDisk',
      };
    }
    const capMatch = code.match(/[-_]?(\d{1,3})G\b/) || code.match(/(4|8|16|32|64|128|256|512)G/);
    if (capMatch) {
      const num = capMatch[1];
      return {
        code,
        partNumber: code,
        storage: `${num}GB`,
        ram: null,
        manufacturer: 'SanDisk / WD',
        type: code.includes('DDH') || code.includes('FD') ? 'UFS' : 'eMMC',
        tech: 'iNAND Managed Flash',
        package: 'BGA153',
        source: 'Regla Oficial SanDisk',
      };
    }
  }

  if (code.startsWith('SDM') || code.startsWith('SDSB')) {
    if (code === 'SDMFLBCB') {
      return {
        code,
        partNumber: code,
        storage: '16GB',
        ram: null,
        manufacturer: 'Apple / iPhone NAND (SanDisk)',
        type: 'NVMe NAND',
        tech: 'Apple NAND (BGA60)',
        package: 'BGA60',
        source: 'Regla Oficial Apple/SanDisk',
      };
    }
    const sdmCap = code.match(/0?(16|32|64|128|256|512)G/) || code.match(/(1|2)TB?/);
    if (sdmCap) {
      const isTb = code.includes('TB') || code.endsWith('1T') || code.endsWith('2T');
      return {
        code,
        partNumber: code,
        storage: isTb ? `${sdmCap[1]}TB` : `${sdmCap[1]}GB`,
        ram: null,
        manufacturer: 'Apple / iPhone NAND (SanDisk)',
        type: 'NVMe NAND',
        tech: 'Apple PCIe NAND (BGA70/110)',
        package: 'BGA110',
        source: 'Regla Oficial Apple/SanDisk',
      };
    }
  }

  // 5. KIOXIA / TOSHIBA Y APPLE IPHONE NAND (De 4GB a 2TB)
  if (/^THG(BM|AF|BX|LF|JF|BH)/.test(code) && code.length >= 7) {
    const isUfs = code.startsWith('THGAF') || code.startsWith('THGJF');
    const isEmcp = code.startsWith('THGLF');
    const isIphone = code.startsWith('THGBX') || code.startsWith('THGBH');
    const densityMatch = code.slice(4, 10).match(/(G[56789]|T[01234])/);
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
      T4: '2TB',
    };
    if (densityMatch && toshibaMap[densityMatch[1]]) {
      return {
        code,
        partNumber: code,
        storage: toshibaMap[densityMatch[1]],
        ram: null,
        manufacturer: isIphone ? 'Apple / iPhone NAND (Toshiba)' : 'Kioxia / Toshiba',
        type: isIphone ? 'NVMe NAND' : isUfs ? 'UFS' : isEmcp ? 'eMCP' : 'eMMC',
        tech: isIphone ? 'Apple PCIe NAND' : isUfs ? 'UFS 2.1 / 3.1 / 4.0' : 'eMMC 5.1',
        package: isIphone ? 'BGA70 / BGA110' : 'BGA153',
        source: 'Regla Oficial Kioxia/Toshiba',
      };
    }
  }

  // Apple Toshiba/Kioxia KICM / TSB / K5 / K6
  if (code.startsWith('KICM22')) {
    const kicmMap = { '3': '64GB', '4': '128GB', '5': '256GB', '6': '512GB', '7': '1TB', '8': '2TB' };
    const cap = kicmMap[code[6]];
    if (cap) {
      return {
        code,
        partNumber: code,
        storage: cap,
        ram: null,
        manufacturer: 'Apple / iPhone NAND (Kioxia)',
        type: 'NVMe NAND',
        tech: 'Apple PCIe NAND (BGA110/315)',
        package: 'BGA110 / BGA315',
        source: 'Regla Oficial Apple/Kioxia',
      };
    }
  }

  if (code.startsWith('TSB')) {
    let tsbCap = null;
    if (code.startsWith('TSB32')) tsbCap = '64GB';
    else if (code.startsWith('TSB4226')) tsbCap = '128GB';
    else if (code.startsWith('TSB4228')) tsbCap = '256GB';
    if (tsbCap) {
      return {
        code,
        partNumber: code,
        storage: tsbCap,
        ram: null,
        manufacturer: 'Apple / iPhone NAND (Toshiba)',
        type: 'NVMe NAND',
        tech: 'Apple PCIe NAND (BGA110)',
        package: 'BGA110',
        source: 'Regla Oficial Apple/Toshiba',
      };
    }
  }

  if (/^K[56][AB]([3456789])/.test(code)) {
    const kMap = {
      '3': '16GB',
      '4': '32GB',
      '5': '64GB',
      '6': code.startsWith('K6') ? '256GB' : '128GB',
      '7': '512GB',
      '8': '1TB',
      '9': '2TB',
    };
    const cap = kMap[code[3]];
    if (cap) {
      return {
        code,
        partNumber: code,
        storage: cap,
        ram: null,
        manufacturer: 'Apple / iPhone NAND (Kioxia)',
        type: 'NVMe NAND',
        tech: 'Apple PCIe NAND',
        package: 'BGA110 / BGA315',
        source: 'Regla Oficial Apple/Kioxia',
      };
    }
  }

  // 6. KINGSTON (EMMC04G..256G, UFS32G..256G, 08EMCP..256UMCP, 32EM16, 64EM32)
  const kingstonEmmc = code.match(/^(EMMC|UFS)0?(4|8|16|32|64|128|256)G?/);
  if (kingstonEmmc) {
    return {
      code,
      partNumber: code,
      storage: `${kingstonEmmc[2]}GB`,
      ram: null,
      manufacturer: 'Kingston',
      type: kingstonEmmc[1],
      tech: kingstonEmmc[1] === 'UFS' ? 'UFS 2.2 / 3.1' : 'eMMC 5.1',
      package: 'BGA153',
      source: 'Regla Oficial Kingston',
    };
  }
  const kingstonEmcp = code.match(/^0?(4|8|16|32|64|128|256)(EMCP|UMCP|EM\d{2})/);
  if (kingstonEmcp) {
    return {
      code,
      partNumber: code,
      storage: `${kingstonEmcp[1]}GB`,
      ram: null,
      manufacturer: 'Kingston',
      type: kingstonEmcp[2].startsWith('U') ? 'uMCP' : 'eMCP',
      tech: 'Kingston MCP',
      package: 'BGA221 / BGA254',
      source: 'Regla Oficial Kingston',
    };
  }

  // 7. FORESEE / LONGSYS (FEMDNN004G..512G, FEMDRM, NCEM...04G..256G, FEUFS...)
  const foreseeFemd = code.match(/^FEMD[A-Z]{1,2}0*(4|8|16|32|64|128|256|512)G/);
  if (foreseeFemd) {
    return {
      code,
      partNumber: code,
      storage: `${foreseeFemd[1]}GB`,
      ram: null,
      manufacturer: 'FORESEE (Longsys)',
      type: 'eMMC',
      tech: 'eMMC 5.1',
      package: 'BGA153',
      source: 'Regla Oficial FORESEE',
    };
  }
  if (code.startsWith('NCEM') || code.startsWith('FEUFS')) {
    const capM = code.match(/0?(4|8|16|32|64|128|256|512)G/);
    if (capM) {
      return {
        code,
        partNumber: code,
        storage: `${capM[1]}GB`,
        ram: null,
        manufacturer: 'FORESEE (Longsys)',
        type: code.startsWith('FEUFS') ? 'UFS' : 'eMMC',
        tech: 'FORESEE Managed Flash',
        package: 'BGA153',
        source: 'Regla Oficial FORESEE',
      };
    }
  }

  // 8. BIWIN (BWEMMC / BWUFS / BWCT...)
  const biwinMatch = code.match(/^BW(EMMC|UFS)0*(4|8|16|32|64|128|256|512)G/);
  if (biwinMatch) {
    return {
      code,
      partNumber: code,
      storage: `${biwinMatch[2]}GB`,
      ram: null,
      manufacturer: 'BIWIN',
      type: biwinMatch[1],
      tech: 'BIWIN Flash',
      package: 'BGA153',
      source: 'Regla Oficial BIWIN',
    };
  }
  if (code.startsWith('BWCT')) {
    const bwCap = code.match(/(4|8|16|32|64|128|256)G$/);
    if (bwCap) {
      return {
        code,
        partNumber: code,
        storage: `${bwCap[1]}GB`,
        ram: null,
        manufacturer: 'BIWIN',
        type: 'eMMC',
        tech: 'BIWIN eMMC 5.1',
        package: 'BGA153',
        source: 'Regla Oficial BIWIN',
      };
    }
  }

  // 9. YMTC (Yangtze Memory — YMEC6A/7C/8C & YMN08/09/10/11)
  if (code.startsWith('YMEC')) {
    const ymecMap = { '6': '32GB', '7': '64GB', '8': '128GB', '9': '256GB' };
    if (ymecMap[code[4]]) {
      return {
        code,
        partNumber: code,
        storage: ymecMap[code[4]],
        ram: null,
        manufacturer: 'YMTC (Yangtze Memory)',
        type: 'eMMC',
        tech: 'YMTC Xtacking eMMC 5.1',
        package: 'BGA153',
        source: 'Regla Oficial YMTC',
      };
    }
  }
  if (code.startsWith('YMN')) {
    const numPrefix = code.slice(3, 5);
    const numMap = { '08': '128GB', '09': '256GB', '10': '512GB', '11': '1TB' };
    const charMap = { E: '128GB', C: '128GB', F: '256GB', G: '512GB', H: '1TB' };
    const resolvedCap = numMap[numPrefix] || charMap[code[6]];
    if (resolvedCap) {
      return {
        code,
        partNumber: code,
        storage: resolvedCap,
        ram: null,
        manufacturer: 'YMTC (Yangtze Memory)',
        type: 'UFS',
        tech: 'YMTC 3D NAND UFS',
        package: 'BGA153',
        source: 'Regla Oficial YMTC',
      };
    }
  }

  // 10. RAYSON, SCY, PHISON, SILICON MOTION (SMI), SPECTEK, DOSILICON, XINCUN, SKYHIGH
  if (code.startsWith('RS70B') || code.startsWith('RSUFS')) {
    const rsCap = code.match(/0?(4|8|16|32|64|128|256)G/);
    if (rsCap) {
      return {
        code,
        partNumber: code,
        storage: `${rsCap[1]}GB`,
        ram: null,
        manufacturer: 'Rayson',
        type: code.startsWith('RSUFS') ? 'UFS' : 'eMMC / eMCP',
        tech: 'Rayson Embedded Flash',
        package: 'BGA153 / BGA254',
        source: 'Regla Oficial Rayson',
      };
    }
  }

  if (/^(SCY|DSEMMC|XCE|FBNL)/.test(code)) {
    const genCap = code.match(/0?(4|8|16|32|64|128|256)G/);
    if (genCap) {
      return {
        code,
        partNumber: code,
        storage: `${genCap[1]}GB`,
        ram: null,
        manufacturer: 'SCY / Dosilicon / Xincun',
        type: 'eMMC',
        tech: 'eMMC 5.1',
        package: 'BGA153',
        source: 'Regla Oficial OEM',
      };
    }
  }

  if (/^(PPE|PSE|PTE|SM66)/.test(code)) {
    const phCap = code.match(/[-_]?0?(4|8|16|32|64|128|256)G/);
    if (phCap) {
      return {
        code,
        partNumber: code,
        storage: `${phCap[1]}GB`,
        ram: null,
        manufacturer: code.startsWith('SM66') ? 'Silicon Motion (SMI)' : 'Phison',
        type: 'eMMC',
        tech: 'eMMC 5.1 Industrial',
        package: 'BGA153',
        source: 'Regla Oficial Phison/SMI',
      };
    }
  }

  if (code.startsWith('S4041-')) {
    const skyCap = code.match(/S4041-(\d+)B/);
    if (skyCap) {
      return {
        code,
        partNumber: code,
        storage: `${skyCap[1]}GB`,
        ram: null,
        manufacturer: 'SkyHigh / Cypress',
        type: 'eMMC',
        tech: 'eMMC 5.0',
        package: 'BGA153',
        source: 'Regla Oficial SkyHigh',
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
    merged.push({
      ...item,
      storage: item.storage || item.capacity,
      manufacturer: item.manufacturer || item.brand,
      notes: item.notes || item.commonModels || item.explanation || '',
      isSeed: true,
    });
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

function enrichWithSeedMetadata(resultObj) {
  if (!resultObj || !resultObj.code) return resultObj;
  if (resultObj.commonModels) return resultObj;
  const norm = normalizeCode(resultObj.code);
  const seedHit = SEED_IC_CATALOG.find(
    (s) =>
      normalizeCode(s.code) === norm ||
      norm.startsWith(normalizeCode(s.code).slice(0, 6)) ||
      (Array.isArray(s.aliases) && s.aliases.some((al) => normalizeCode(al) === norm))
  );
  if (seedHit && (seedHit.commonModels || seedHit.notes)) {
    return {
      ...resultObj,
      commonModels: seedHit.commonModels || seedHit.notes,
    };
  }
  return resultObj;
}

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

  // 2. Catálogo Semilla Curado y Auto-Aprendido (incluyendo todos los alias de cada familia)
  const autoList = getAutoLearnedDatabase();
  const combinedSeed = [...autoList, ...SEED_IC_CATALOG];
  const exactSeed = combinedSeed.find(
    (c) =>
      normalizeCode(c.code) === q ||
      (c.partNumber && normalizeCode(c.partNumber) === q) ||
      normalizeCode(c.code).split('-')[0] === q ||
      (Array.isArray(c.aliases) &&
        c.aliases.some((al) => normalizeCode(al) === q || normalizeCode(al).split('-')[0] === q))
  );
  if (exactSeed) {
    return {
      ...exactSeed,
      code: q,
      partNumber: exactSeed.partNumber || exactSeed.code,
      storage: exactSeed.storage || exactSeed.capacity,
      manufacturer: exactSeed.manufacturer || exactSeed.brand,
      commonModels: exactSeed.commonModels || exactSeed.notes || '',
      notes: exactSeed.notes || exactSeed.commonModels || exactSeed.explanation || '',
      source: exactSeed.source || 'Catálogo Verificado',
    };
  }

  // 3. Decodificación Exacta en Motor Industrial Offline @itxtech/fdnext-core
  let pureDramCandidate = null;
  const eng = getFdEngine();
  if (eng) {
    try {
      const fdRes = eng.decodePart({ query: q, lang: 'eng' });
      const parsed = parseFdnextDecodeResult(fdRes, q);
      if (parsed && parsed.storage) {
        return enrichWithSeedMetadata(parsed);
      }
      if (parsed && parsed.isPureDram) {
        pureDramCandidate = parsed;
      }
    } catch {
      // Continuar a heurística
    }
  }

  // 4. Regla Oficial Determinística de Fabricante (KLM8G=8GB, KLMCG=64GB, KMDP=64GB, H9HP52=64GB, etc.)
  const heur = heuristicDecode(q);
  if (heur) return enrichWithSeedMetadata(heur);

  // 5. Búsqueda parcial por prefijo (cuando el usuario escribió los primeros 4+ caracteres de una serie)
  if (q.length >= 4) {
    const partialCandidates = [];

    for (const c of combinedSeed) {
      const cNorm = normalizeCode(c.code);
      const aliasHit =
        Array.isArray(c.aliases) && c.aliases.find((al) => normalizeCode(al).startsWith(q));
      if (cNorm.startsWith(q) || aliasHit) {
        partialCandidates.push({
          ...c,
          code: aliasHit && !cNorm.startsWith(q) ? normalizeCode(aliasHit) : c.code,
          partNumber: c.partNumber || c.code,
          storage: c.storage || c.capacity,
          manufacturer: c.manufacturer || c.brand,
          commonModels: c.commonModels || c.notes || '',
          notes: c.notes || c.commonModels || c.explanation || '',
          matchedFromPartial: true,
          source: c.source || 'Catálogo Verificado',
        });
      }
    }

    if (eng) {
      try {
        const searchRes = eng.searchParts({ query: q, lang: 'eng', limit: 12 });
        if (searchRes?.status === 'ok' && Array.isArray(searchRes.items) && searchRes.items.length > 0) {
          for (const item of searchRes.items) {
            const targetPart = item.device?.markingCode || item.device?.partNumber || item.label;
            if (!targetPart) continue;
            const fullDecode = eng.decodePart({ query: targetPart, lang: 'eng' });
            const parsedItem = parseFdnextDecodeResult(fullDecode, targetPart);
            if (parsedItem && parsedItem.storage) {
              partialCandidates.push(
                enrichWithSeedMetadata({
                  ...parsedItem,
                  matchedFromPartial: q !== normalizeCode(targetPart),
                })
              );
            } else if (parsedItem && parsedItem.isPureDram && !pureDramCandidate) {
              pureDramCandidate = parsedItem;
            }
          }
        }
      } catch {
        // Ignorar
      }
    }

    if (partialCandidates.length > 0) {
      // Ordenar priorizando coincidencia exacta y luego CAPACIDAD MÁXIMA primero
      partialCandidates.sort((a, b) => {
        const aExact = normalizeCode(a.code) === q || normalizeCode(a.partNumber) === q ? 1 : 0;
        const bExact = normalizeCode(b.code) === q || normalizeCode(b.partNumber) === q ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        return capacityToGbNumber(b.storage) - capacityToGbNumber(a.storage);
      });
      const distinctCaps = Array.from(new Set(partialCandidates.map((m) => m.storage))).sort(
        (a, b) => capacityToGbNumber(b) - capacityToGbNumber(a)
      );
      return {
        ...partialCandidates[0],
        alternativeCapacities: distinctCaps.length > 1 ? distinctCaps : null,
      };
    }
  }

  if (pureDramCandidate) {
    return pureDramCandidate;
  }

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
      const matchedAlias = Array.isArray(item.aliases)
        ? item.aliases.find((al) => normalizeCode(al).includes(q))
        : null;
      if (codeNorm.includes(q) || pnNorm.includes(q) || matchedAlias) {
        pushUnique({
          ...item,
          code: matchedAlias && !codeNorm.includes(q) ? normalizeCode(matchedAlias) : item.code,
          partNumber: item.partNumber || item.code,
          storage: item.storage || item.capacity,
          manufacturer: item.manufacturer || item.brand,
          notes: item.notes || item.commonModels || item.explanation || '',
          source: item.source || 'Catálogo Eco Lógica García',
        });
      }
    }

    const eng = getFdEngine();
    if (eng) {
      try {
        const searchRes = eng.searchParts({ query: q, lang: 'eng', limit: limit * 2 });
        if (searchRes?.status === 'ok' && Array.isArray(searchRes.items)) {
          for (const it of searchRes.items) {
            // Ignorar chips que son únicamente memoria RAM sin almacenamiento en la lista de sugerencias
            if (it.device?.chipKind === 'dram') continue;

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

            if (fullDecoded && fullDecoded.isPureDram) continue;

            const candidateItem =
              fullDecoded || {
                code: displayCode,
                partNumber: pn,
                storage: storage ? String(storage).toUpperCase().replace(/\s+/g, '') : null,
                ram: ram,
                manufacturer: it.device?.vendor?.name || 'Desconocido',
                type: (it.device?.productType || 'IC').toUpperCase(),
                tech: (it.badges || []).join(' · '),
                source: 'Motor Industrial Offline',
              };

            if (candidateItem.storage) {
              pushUnique(candidateItem);
            }
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

  // Ordenar resultados priorizando coincidencia exacta y después de MAYOR A MENOR capacidad (Capacidad Máxima primero)
  const primaryQuery = candidates[0] || '';
  results.sort((a, b) => {
    const aExact = normalizeCode(a.code) === primaryQuery || normalizeCode(a.partNumber) === primaryQuery ? 1 : 0;
    const bExact = normalizeCode(b.code) === primaryQuery || normalizeCode(b.partNumber) === primaryQuery ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    const aStarts = normalizeCode(a.code).startsWith(primaryQuery) ? 1 : 0;
    const bStarts = normalizeCode(b.code).startsWith(primaryQuery) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;
    return capacityToGbNumber(b.storage) - capacityToGbNumber(a.storage);
  });

  return results.slice(0, limit);
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

// ============================================================================
// DETECTOR INTELIGENTE DE VARIANTES Y TERMINACIONES DIFERENTES
// Detecta:
// 1) Variantes del mismo chip con diferente terminación/sufijo (Misma Capacidad)
// 2) Variantes de la misma familia donde la terminación/clave cambia los GB
// ============================================================================

export function splitVariantTermination(referenceStem, targetCode) {
  const ref = normalizeCode(referenceStem);
  const code = normalizeCode(targetCode);
  if (!code) return { base: '', termination: '' };

  // Si tiene guion (ej. KMDP6001DA-B425 o SDINBDA4-64G), resaltar desde el último bloque o sufijo
  let commonLen = 0;
  const maxLen = Math.min(ref.length, code.length);
  while (commonLen < maxLen && ref[commonLen] === code[commonLen]) {
    commonLen++;
  }

  // Asegurar que al menos dejemos visible la terminación distinta (mínimo 2 caracteres finales si son iguales)
  if (commonLen >= code.length && code.length > 4) {
    const dashIdx = code.indexOf('-');
    if (dashIdx > 1) {
      return { base: code.slice(0, dashIdx), termination: code.slice(dashIdx) };
    }
    return { base: code.slice(0, code.length - 4), termination: code.slice(code.length - 4) };
  }

  if (commonLen < 2) {
    return { base: code.slice(0, 3), termination: code.slice(3) };
  }

  return {
    base: code.slice(0, commonLen),
    termination: code.slice(commonLen),
  };
}

export function analyzeChipVariants(rawQuery, activeChip = null) {
  const q = normalizeCode(rawQuery || activeChip?.code || '');
  if (!q || q.length < 3) {
    return {
      exactMatchFound: null,
      sameCapacityVariants: [],
      differentCapacityVariants: [],
      sameCapStem: '',
      seriesStem: '',
    };
  }

  const resolvedActive = activeChip && activeChip.storage ? activeChip : decodeChipOffline(q);
  const targetStorage = resolvedActive?.storage || null;
  const refCode = normalizeCode(resolvedActive?.code || q);

  // Determinar raíz de mismo chip (sameCapStem) y raíz de serie (seriesStem)
  let sameCapStem = q.slice(0, Math.min(q.length, 6));
  let seriesStem = q.slice(0, Math.min(q.length, 4));

  if (q.startsWith('SDIN')) {
    const dashIdx = q.indexOf('-');
    seriesStem = dashIdx > 3 ? q.slice(0, dashIdx + 1) : q.slice(0, Math.min(q.length, 8));
    sameCapStem = dashIdx > 3 ? q : seriesStem;
  } else if (/^KL[MU]/.test(q)) {
    sameCapStem = q.slice(0, Math.min(q.length, 5)); // ej. KLMCG, KLUDG
    seriesStem = q.slice(0, 3); // KLM o KLU
  } else if (q.startsWith('KM')) {
    sameCapStem = q.slice(0, Math.min(q.length, 5)); // ej. KMDP6, KM8V7
    seriesStem = q.slice(0, Math.min(q.length, 4)); // ej. KMDP, KM8V, KMD
    if (/^KM[DGRQ]/.test(q)) seriesStem = q.slice(0, 3);
  } else if (/^(H9|H26|H28|HN8T)/.test(q)) {
    sameCapStem = q.slice(0, Math.min(q.length, 6)); // ej. H9HP52, HN8T05
    seriesStem = q.slice(0, 4); // ej. H9HP, HN8T, H9HQ
  } else if (q.startsWith('THG')) {
    sameCapStem = q.slice(0, Math.min(q.length, 8)); // ej. THGAF8G9
    seriesStem = q.slice(0, Math.min(q.length, 6)); // ej. THGAF8
  } else if (/^(FEMD|FEUFS|NCEM)/.test(q)) {
    sameCapStem = q.slice(0, Math.min(q.length, 9));
    seriesStem = q.slice(0, Math.min(q.length, 6));
  } else if (/^J[WXYZC][A-Z0-9]{1,3}$/.test(q)) {
    sameCapStem = q.slice(0, 3);
    seriesStem = q.slice(0, 2);
  } else if (q.startsWith('KICM')) {
    sameCapStem = q.slice(0, Math.min(q.length, 7));
    seriesStem = 'KICM22';
  }

  // Recolectar todos los códigos y sus variantes/aliases conocidos
  const pool = [];
  const seenCodes = new Set();

  const addPoolItem = (codeStr, storage, manufacturer, type, ram) => {
    const cNorm = normalizeCode(codeStr);
    if (!cNorm || cNorm.length < 3 || !storage || seenCodes.has(cNorm)) return;
    seenCodes.add(cNorm);
    pool.push({
      code: cNorm,
      storage: String(storage).toUpperCase().trim(),
      manufacturer: manufacturer || 'Desconocido',
      type: type || 'IC',
      ram: ram || null,
    });
  };

  for (const item of getCustomDatabase()) {
    addPoolItem(item.code, item.storage, item.manufacturer, item.type, item.ram);
  }
  for (const item of getAutoLearnedDatabase()) {
    addPoolItem(item.code, item.storage, item.manufacturer, item.type, item.ram);
  }
  for (const item of SEED_IC_CATALOG) {
    const cap = item.storage || item.capacity;
    const mfg = item.manufacturer || item.brand;
    addPoolItem(item.code, cap, mfg, item.type, item.ram);
    if (Array.isArray(item.aliases)) {
      for (const al of item.aliases) {
        addPoolItem(al, cap, mfg, item.type, item.ram);
      }
    }
  }

  // Consultar también variantes reales en el motor industrial fdnext-core
  const eng = getFdEngine();
  if (eng && sameCapStem.length >= 3) {
    try {
      const queriesToRun = sameCapStem !== seriesStem && seriesStem.length >= 3
        ? [sameCapStem, seriesStem]
        : [sameCapStem];

      for (const sq of queriesToRun) {
        const sRes = eng.searchParts({ query: sq, lang: 'eng', limit: 12 });
        if (sRes?.status === 'ok' && Array.isArray(sRes.items)) {
          for (const it of sRes.items) {
            if (it.device?.chipKind === 'dram') continue;
            const targetPart = it.device?.markingCode || it.device?.partNumber || it.label;
            if (!targetPart) continue;
            const normTarget = normalizeCode(targetPart);
            if (seenCodes.has(normTarget)) continue;
            const dec = eng.decodePart({ query: targetPart, lang: 'eng' });
            const parsed = parseFdnextDecodeResult(dec, targetPart);
            if (parsed && parsed.storage && !parsed.isPureDram) {
              addPoolItem(parsed.code, parsed.storage, parsed.manufacturer, parsed.type, parsed.ram);
            }
          }
        }
      }
    } catch {
      // Ignorar errores de búsqueda
    }
  }

  let exactMatchFound = null;
  const sameCapacityVariants = [];
  const differentCapacityVariants = [];

  for (const cand of pool) {
    if (cand.code === q || cand.code.split('-')[0] === q) {
      if (!exactMatchFound) exactMatchFound = cand;
    }

    const matchesSameStem =
      cand.code.startsWith(sameCapStem) ||
      (sameCapStem.length >= 4 && refCode.startsWith(sameCapStem) && cand.code.startsWith(sameCapStem));

    const matchesSeriesStem =
      seriesStem.length >= 2 && cand.code.startsWith(seriesStem);

    if (!matchesSameStem && !matchesSeriesStem) continue;

    if (targetStorage && cand.storage === targetStorage && matchesSameStem) {
      const parts = splitVariantTermination(sameCapStem, cand.code);
      sameCapacityVariants.push({
        ...cand,
        basePart: parts.base,
        diffTermination: parts.termination || cand.code.slice(-3),
        isCurrent: cand.code === refCode || cand.code === q,
      });
    } else if (matchesSeriesStem && (!targetStorage || cand.storage !== targetStorage)) {
      const parts = splitVariantTermination(seriesStem, cand.code);
      differentCapacityVariants.push({
        ...cand,
        basePart: parts.base,
        diffTermination: parts.termination || cand.code.slice(seriesStem.length),
      });
    }
  }

  // Ordenar variantes de diferente capacidad de MAYOR A MENOR (Capacidad Máxima primero)
  differentCapacityVariants.sort(
    (a, b) => capacityToGbNumber(b.storage) - capacityToGbNumber(a.storage)
  );

  // Dejar hasta 1 variante representativa por capacidad o hasta 8 variantes clave para que sea directo y limpio
  const deduplicatedDiffCap = [];
  const capCountMap = {};
  for (const v of differentCapacityVariants) {
    const count = capCountMap[v.storage] || 0;
    if (count < 2 && deduplicatedDiffCap.length < 8) {
      capCountMap[v.storage] = count + 1;
      deduplicatedDiffCap.push(v);
    }
  }

  return {
    exactMatchFound,
    sameCapacityVariants: sameCapacityVariants.slice(0, 8),
    differentCapacityVariants: deduplicatedDiffCap,
    sameCapStem,
    seriesStem,
  };
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
