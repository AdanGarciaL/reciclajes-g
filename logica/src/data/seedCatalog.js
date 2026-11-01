/**
 * Base de Datos Maestra de Chips IC de Almacenamiento Móvil (eMMC / eMCP / UFS / uMCP / BGA NAND)
 * Cobertura integral desde 4GB hasta 2TB incluyendo Samsung, Micron, SK Hynix, SanDisk/WD,
 * Kioxia/Toshiba, Apple/iPhone NAND (BGA60/70/110/315), Kingston, FORESEE (Longsys),
 * YMTC (Yangtze Memory), BIWIN, Rayson, SCY, Phison, Silicon Motion (SMI), Spectek, SkyHigh y Dosilicon.
 */

export const QUICK_PREFIXES = [
  // Micron FBGA (4GB -> 1TB Verificados MIC)
  { label: 'JW187 (4GB)', value: 'JW187', brand: 'Micron' },
  { label: 'JWA61 (8GB)', value: 'JWA61', brand: 'Micron' },
  { label: 'JW300 (16GB)', value: 'JW300', brand: 'Micron' },
  { label: 'JZ034 (32GB)', value: 'JZ034', brand: 'Micron' },
  { label: 'JW895 (64GB)', value: 'JW895', brand: 'Micron' },
  { label: 'JWC56 (128GB)', value: 'JWC56', brand: 'Micron' },
  { label: 'JXE77 (128GB)', value: 'JXE77', brand: 'Micron' },
  { label: 'JZ115 (256GB)', value: 'JZ115', brand: 'Micron' },
  { label: 'JZ149 (512GB)', value: 'JZ149', brand: 'Micron' },
  { label: 'JZ529 (1TB)', value: 'JZ529', brand: 'Micron' },
  // Samsung eMMC / UFS / eMCP / uMCP (4GB -> 2TB)
  { label: 'KLM4G (4GB)', value: 'KLM4G1FE3B-B001', brand: 'Samsung' },
  { label: 'KLM8G (8GB)', value: 'KLM8G1GETF-B041', brand: 'Samsung' },
  { label: 'KLMAG (16GB)', value: 'KLMAG1JETD-B041', brand: 'Samsung' },
  { label: 'KLMBG (32GB)', value: 'KLMBG2JETD-B041', brand: 'Samsung' },
  { label: 'KMGX6 (32GB)', value: 'KMGX6001BM-B514', brand: 'Samsung' },
  { label: 'KLMCG (64GB)', value: 'KLMCG4JETD-B041', brand: 'Samsung' },
  { label: 'KMDP6 (64GB)', value: 'KMDP6001DA-B425', brand: 'Samsung' },
  { label: 'KMDH6 (64GB)', value: 'KMDH6001DA-B422', brand: 'Samsung' },
  { label: 'KLMDG (128GB)', value: 'KLMDG8JENB-B041', brand: 'Samsung' },
  { label: 'KM8V7 (128GB)', value: 'KM8V7001JM-B813', brand: 'Samsung' },
  { label: 'KLUEG (256GB)', value: 'KLUEG8UHDB-C2D1', brand: 'Samsung' },
  { label: 'KLUFG (512GB)', value: 'KLUFG8RHHD-B0G1', brand: 'Samsung' },
  { label: 'KLUGG (1TB)', value: 'KLUGGARHHD-B0G1', brand: 'Samsung' },
  { label: 'KLUHG (2TB)', value: 'KLUHGARHHD-B0H1', brand: 'Samsung' },
  // SK Hynix (4GB -> 1TB)
  { label: 'H26M3 (4GB)', value: 'H26M31003GMR', brand: 'SK Hynix' },
  { label: 'H26M5 (16GB)', value: 'H26M52208FPR', brand: 'SK Hynix' },
  { label: 'H9TQ2 (32GB)', value: 'H9TQ26ADFTMCUR', brand: 'SK Hynix' },
  { label: 'H9HP5 (64GB)', value: 'H9HP52ACPMMDAR', brand: 'SK Hynix' },
  { label: 'H9HQ1 (128GB)', value: 'H9HQ15AECMMDAR', brand: 'SK Hynix' },
  { label: 'HN8T1 (256GB)', value: 'HN8T15DEHKX075', brand: 'SK Hynix' },
  { label: 'HN8T2 (512GB)', value: 'HN8T25DEHKX077', brand: 'SK Hynix' },
  { label: 'HN8T3 (1TB)', value: 'HN8T35DEHKX079', brand: 'SK Hynix' },
  // SanDisk / Kioxia / Apple / Kingston / FORESEE / YMTC
  { label: 'SDINBDA4-64G', value: 'SDINBDA4-64G', brand: 'SanDisk' },
  { label: 'THGAF8T0 (128G)', value: 'THGAF8T0T43BAIR', brand: 'Kioxia / Toshiba' },
  { label: 'H23B1T8 (iPhone 128G)', value: 'H23B1T82D7AEQ-BC', brand: 'Apple / iPhone NAND' },
  { label: 'KICM225 (iPhone 256G)', value: 'KICM225-BGA110', brand: 'Apple / iPhone NAND' },
  { label: 'FEMDNN064G', value: 'FEMDNN064G-A3A56', brand: 'FORESEE (Longsys)' },
  { label: 'EMMC64G-TY29', value: 'EMMC64G-TY29', brand: 'Kingston' },
  { label: 'YMN09TF (256GB)', value: 'YMN09TF1B1HC3B', brand: 'YMTC (Yangtze Memory)' }
];

export const SEED_IC_CATALOG = [
  // ============================================================================
  // 1. SAMSUNG — eMMC 4.5 / 5.0 / 5.1 (Serie KLM) — 4GB a 256GB
  // ============================================================================
  {
    code: 'KLM4G1FE3B-B001',
    aliases: ['KLM4G1FE3B', 'KLM4G1YE4C', 'KLM4G1FEAC', 'KLM4G1YEMD'],
    brand: 'Samsung',
    type: 'eMMC 4.5 (NAND Flash)',
    capacity: '4GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '4G',
    explanation: 'En Samsung KLM, "4G" en las posiciones 4 y 5 indica 4GB de almacenamiento eMMC.',
    commonModels: 'Samsung Galaxy Pocket, J1 Ace, Grand Prime VE, ZTE Blade L2, Alcatel Pixi',
    package: 'BGA-153'
  },
  {
    code: 'KLM8G1GETF-B041',
    aliases: ['KLM8G1GETF', 'KLM8G1WEPD-B031', 'KLM8G1WEMB-B031', 'KLM8G1GEME-B041', 'KLM8G2FE3B'],
    brand: 'Samsung',
    type: 'eMMC 5.1 (NAND Flash)',
    capacity: '8GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '8G',
    explanation: 'En Samsung KLM, "8G" después de KLM indica exactamente 8GB de memoria Flash.',
    commonModels: 'Samsung J2 Prime, J1 Mini, Grand Prime+, Moto C, LG K4 / K8',
    package: 'BGA-153'
  },
  {
    code: 'KLMAG1JETD-B041',
    aliases: ['KLMAG1JETD', 'KLMAG2GEAC-B001', 'KLMAG1JENB-B041', 'KLMAG2WEPD-B031', 'KLMAG4FEAB'],
    brand: 'Samsung',
    type: 'eMMC 5.1 (NAND Flash)',
    capacity: '16GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'AG',
    explanation: 'En Samsung, la letra hexadecimal "A" antes de la G (AG) equivale siempre a 16GB.',
    commonModels: 'Samsung J3, J5, J7 Neo, A01 Core, Moto E4 / E5, Redmi Go',
    package: 'BGA-153'
  },
  {
    code: 'KLMBG2JETD-B041',
    aliases: ['KLMBG2JETD', 'KLMBG4GEAC-B001', 'KLMBG2JENB-B041', 'KLMBG4WEBC-B031'],
    brand: 'Samsung',
    type: 'eMMC 5.1 (NAND Flash)',
    capacity: '32GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'BG',
    explanation: 'En Samsung, la combinación "BG" después de KLM indica 32GB de almacenamiento.',
    commonModels: 'Samsung A10, A10s, A02s, J7 Prime 32GB, Moto G6 Play, Redmi 9A',
    package: 'BGA-153'
  },
  {
    code: 'KLMCG4JETD-B041',
    aliases: ['KLMCG4JETD', 'KLMCG2UCTA-B041', 'KLMCG8GEAC-B001', 'KLMCG4JENB-B041'],
    brand: 'Samsung',
    type: 'eMMC 5.1 (NAND Flash)',
    capacity: '64GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'CG',
    explanation: 'En Samsung, la combinación "CG" después de KLM indica 64GB de almacenamiento.',
    commonModels: 'Samsung A20, A20s, A12 64GB, Moto G7 Power, Xiaomi Redmi 9C 64GB',
    package: 'BGA-153'
  },
  {
    code: 'KLMDG8JENB-B041',
    aliases: ['KLMDG8JENB', 'KLMDG4UCTA-B041', 'KLMDGAWEBD-B031'],
    brand: 'Samsung',
    type: 'eMMC 5.1 (NAND Flash)',
    capacity: '128GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'DG',
    explanation: 'En Samsung, la combinación "DG" después de KLM indica 128GB de almacenamiento.',
    commonModels: 'Samsung A12 128GB, A21s 128GB, Moto G8 Power Lite, Huawei Y9s',
    package: 'BGA-153'
  },
  {
    code: 'KLMEG8UCTA-B041',
    aliases: ['KLMEG8UCTA', 'KLMEGARHHD'],
    brand: 'Samsung',
    type: 'eMMC 5.1 (NAND Flash)',
    capacity: '256GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'EG',
    explanation: 'En Samsung, la combinación "EG" indica 256GB de almacenamiento.',
    commonModels: 'Tablets industriales Samsung, consolas portátiles y módulos automotrices',
    package: 'BGA-153'
  },

  // ============================================================================
  // 2. SAMSUNG — UFS 2.0 / 2.1 / 3.0 / 3.1 / 4.0 (Serie KLU) — 32GB a 2TB
  // ============================================================================
  {
    code: 'KLUBG4G1CE-B0B1',
    aliases: ['KLUBG4G1CE', 'KLUBG4G1BD'],
    brand: 'Samsung',
    type: 'UFS 2.0 / 2.1',
    capacity: '32GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'BG',
    explanation: '"KLU" indica tecnología UFS de alta velocidad; "BG" indica 32GB.',
    commonModels: 'Samsung Galaxy S6 32GB, S7 32GB, Note 5 32GB',
    package: 'BGA-153 UFS'
  },
  {
    code: 'KLUCG4J1ED-B0C1',
    aliases: ['KLUCG4J1ED', 'KLUCG4J1CB-B0B1', 'KLUCG2K1EA-B0C1'],
    brand: 'Samsung',
    type: 'UFS 2.1',
    capacity: '64GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'CG',
    explanation: '"KLU" indica memoria UFS y "CG" indica 64GB de capacidad.',
    commonModels: 'Samsung Galaxy S8, S9, Note 8, A50 64GB, A70',
    package: 'BGA-153 UFS'
  },
  {
    code: 'KLUDG4UHDC-B0E1',
    aliases: ['KLUDG4UHDC', 'KLUDG8V1EE-B0C1', 'KLUDG4UHDB-B2D1', 'KLUDG8J1EB-B0B1'],
    brand: 'Samsung',
    type: 'UFS 2.1 / 3.0 / 3.1',
    capacity: '128GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'DG',
    explanation: '"KLU" indica memoria UFS y "DG" indica 128GB de capacidad.',
    commonModels: 'Samsung A51, A52, A71, S10, S20 FE, S21 128GB, Note 10',
    package: 'BGA-153 UFS'
  },
  {
    code: 'KLUEG8UHDB-C2D1',
    aliases: ['KLUEG8UHDB', 'KLUEG8U1EM-B0B1', 'KLUEG4RHHD-B0G1'],
    brand: 'Samsung',
    type: 'UFS 3.0 / 3.1 / 4.0',
    capacity: '256GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'EG',
    explanation: '"KLU" indica memoria UFS y "EG" indica 256GB de capacidad.',
    commonModels: 'Samsung Note 10+, S20, S21+, S22, S23 256GB, A54 256GB, Xiaomi Mi 11',
    package: 'BGA-153 UFS'
  },
  {
    code: 'KLUFG8RHHD-B0G1',
    aliases: ['KLUFG8RHHD', 'KLUFG8U1EM-B0C1', 'KLUFG8UHDB-B2D1'],
    brand: 'Samsung',
    type: 'UFS 3.1 / 4.0',
    capacity: '512GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'FG',
    explanation: '"KLU" indica memoria UFS y "FG" indica 512GB de capacidad.',
    commonModels: 'Samsung S21 Ultra, S22 Ultra, S23 Ultra, S24 Ultra 512GB, Z Fold 4/5',
    package: 'BGA-153 UFS'
  },
  {
    code: 'KLUGGARHHD-B0G1',
    aliases: ['KLUGGARHHD', 'KLUGG8U1EM-B0C1', 'KLUGG8UHDB'],
    brand: 'Samsung',
    type: 'UFS 3.1 / 4.0',
    capacity: '1TB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'GG',
    explanation: '"KLU" indica memoria UFS y "GG" indica 1TB (1024GB) de capacidad.',
    commonModels: 'Samsung S22 Ultra 1TB, S23 Ultra 1TB, S24 Ultra 1TB, Z Fold 5/6 1TB',
    package: 'BGA-153 UFS'
  },
  {
    code: 'KLUHGARHHD-B0H1',
    aliases: ['KLUHGARHHD', 'KLUHG8RHHD'],
    brand: 'Samsung',
    type: 'UFS 4.0 Ultra-Alta Densidad',
    capacity: '2TB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'HG',
    explanation: '"KLU" indica memoria UFS y "HG" indica 2TB (2048GB) de capacidad.',
    commonModels: 'Equipos Flagship Especiales / Tablets Pro / Módulos UFS 4.0 de 2TB',
    package: 'BGA-153 UFS'
  },

  // ============================================================================
  // 3. SAMSUNG — eMCP (eMMC + RAM LPDDR2/3/4X: Series KMK, KMF, KMQ, KMD, KMR, KMG)
  // ============================================================================
  {
    code: 'KMK5X000VM-B314',
    aliases: ['KMK5X000VM', 'KMK5U000VM-B309', 'KMK5W000VM'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 4.5 + LPDDR2)',
    capacity: '4GB',
    ram: '512MB / 1GB LPDDR2',
    ruleSegment: 'KMK5',
    explanation: 'En Samsung eMCP antiguos, el prefijo "KMK5" corresponde a 4GB de almacenamiento.',
    commonModels: 'Samsung Galaxy S3 Mini, Ace 4, Core 2, LG L70',
    package: 'BGA-162'
  },
  {
    code: 'KMK7X000VM-B314',
    aliases: ['KMK7X000VM', 'KMK7U000VM-B309', 'KMF720012M-B214'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.0 + LPDDR2/3)',
    capacity: '8GB',
    ram: '1GB LPDDR2/LPDDR3',
    ruleSegment: 'KMK7',
    explanation: 'El dígito "7" en KMK7 / KMF7 indica 8GB de almacenamiento Flash.',
    commonModels: 'Samsung Grand Prime, Core Prime, J1, Moto E2',
    package: 'BGA-162 / BGA-221'
  },
  {
    code: 'KMFN10012M-B214',
    aliases: ['KMFN10012M', 'KMFN60012M-B214', 'KMFE60012M-B214', 'KMFE60012A-B214', 'KMFJ20005A-B213', 'KMK8X000VM-B412', 'KMF820012M-B305'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.0 + LPDDR3)',
    capacity: '8GB',
    ram: '1GB LPDDR3',
    ruleSegment: 'KMF',
    explanation: 'En Samsung eMCP, la letra "F" después de KM (KMFN / KMFE / KMFJ / KMF8) indica 8GB de almacenamiento Flash + 1GB RAM.',
    commonModels: 'Samsung J2, Moto G3 8GB, LG K4, ZTE Blade A460',
    package: 'BGA-221'
  },
  {
    code: 'KMQN10006B-B318',
    aliases: ['KMQN10006B', 'KMQ7X000SA-B315', 'KMQ72000SM-B316', 'KMKN1000BM'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.1 + LPDDR3)',
    capacity: '16GB',
    ram: '2GB LPDDR3',
    ruleSegment: 'KMQN',
    explanation: 'Serie KMQN1 / KMQ7 de Samsung eMCP con 16GB de almacenamiento y 2GB RAM.',
    commonModels: 'Samsung J5 Prime, J7 2016, Moto G4 Play, Redmi 4A',
    package: 'BGA-221'
  },
  {
    code: 'KMQE60013M-B318',
    aliases: ['KMQE60013M', 'KMQE60013B-B318', 'KMQE10013M-B318', 'KMQD60013M-B318', 'KMQ820013M-B419', 'KMGE6001BM-B514'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.1 + LPDDR3)',
    capacity: '16GB',
    ram: '2GB / 3GB LPDDR3',
    ruleSegment: 'KMQE',
    explanation: 'En Samsung eMCP, KMQE / KMQD / KMQ8 / KMGE corresponden exactamente a 16GB de almacenamiento (verificado con MIC).',
    commonModels: 'Moto G5, Redmi Note 5A, Huawei Y6 / Y7, Vivo Y53',
    package: 'BGA-221 / BGA-254'
  },
  {
    code: 'KMR31000BM-B611',
    aliases: ['KMR31000BM', 'KMR31000BA-B614', 'KMR4Z0001A-B803'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.1 + LPDDR3)',
    capacity: '16GB',
    ram: '2GB / 3GB LPDDR3',
    ruleSegment: 'KMR31',
    explanation: 'En la familia KMR de Samsung, "KMR31" / "KMR4Z" corresponde a 16GB de almacenamiento.',
    commonModels: 'Xiaomi Redmi 4X 16GB, Moto E4 Plus, Oppo A37, Vivo Y55',
    package: 'BGA-221'
  },
  {
    code: 'KMGX6001BM-B514',
    aliases: ['KMGX6001BM', 'KMGX6001BA-B514', 'KMGD6001BM-B421', 'KMGP6001BM-B514', 'KMGP6001BA-B514', 'KMQX10013M-B419', 'KMQX60013A-B419', 'KMDX60018M-B425', 'KMDP6001BM-B421', 'KM4X6000BM-B421'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.1 + LPDDR3/4X)',
    capacity: '32GB',
    ram: '2GB / 3GB LPDDR3 / LPDDR4X',
    ruleSegment: 'KMGX',
    explanation: 'En Samsung eMCP, KMGX6 / KMGD6 / KMGP6 (con terminación BM/BA) y las series KMQX / KMDX / KMDP6001BM son siempre de 32GB eMMC (256Gb) + 2GB/3GB RAM (verificado en MIC).',
    commonModels: 'Samsung A10s, A20s, Moto G6, Redmi 6 / 8A, Realme C11, Moto E6s',
    package: 'BGA-221 / BGA-254'
  },
  {
    code: 'KMR820001M-B609',
    aliases: ['KMR820001M', 'KMR820001A-B609', 'KMRD60014M-B512'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.1 + LPDDR3)',
    capacity: '32GB',
    ram: '3GB / 4GB LPDDR3',
    ruleSegment: 'KMR82',
    explanation: 'En la familia KMR de Samsung, "KMR82" / "KMRD" indica 32GB de almacenamiento.',
    commonModels: 'Xiaomi Redmi Note 4X 32GB, Moto G5 Plus, Samsung J7 Pro, Vivo V5',
    package: 'BGA-221'
  },
  {
    code: 'KMDH6001DA-B422',
    aliases: ['KMDH6001DA', 'KMDH6001DA-B425', 'KMDH6001DM-B422', 'KMDV6001DM-B620', 'KMDV6001DA-B620', 'KMDC6001DA-B425', 'KMDT60018M-B425', 'KMDT60018M-B320'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.1 + LPDDR4X)',
    capacity: '64GB',
    ram: '3GB / 4GB LPDDR4X',
    ruleSegment: 'KMDH',
    explanation: 'En Samsung eMCP, la 3.ª letra "D" en KMDH6 / KMDV6 / KMDC6 / KMDT6 / KMDP6001DA indica 64GB de almacenamiento eMMC 5.1 (512Gb) + RAM LPDDR4X (verificado en MIC).',
    commonModels: 'Xiaomi Redmi 7 / 8 64GB, Redmi Note 7 / 8, Moto G7 / G8, Oppo A5',
    package: 'BGA-254'
  },
  {
    code: 'KMDP6001DA-B425',
    aliases: ['KMDP6001DA', 'KMDP60018M-B425', 'KMDP6001DB-B425', 'KM3H6001CA-B515', 'KM3P6001CM-B517'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.1 + LPDDR4X)',
    capacity: '64GB',
    ram: '3GB / 4GB / 6GB LPDDR4X',
    ruleSegment: 'KMDP6',
    explanation: 'El código "KMDP6001DA" (y KM3H6 / KM3P6) de Samsung integra 64GB de almacenamiento eMMC 5.1 + RAM LPDDR4X.',
    commonModels: 'Xiaomi Redmi Note 7, Redmi 9, Moto G7 / G8 Play, Oppo A9, Realme 5',
    package: 'BGA-254'
  },
  {
    code: 'KMRP60014M-B614',
    aliases: ['KMRP60014M', 'KMRX1000BM-B614', 'KMRX60014M-B614', 'KMRC10014M-B809', 'KMRC1000BM-B809'],
    brand: 'Samsung',
    type: 'eMCP (eMMC 5.1 + LPDDR3/4X)',
    capacity: '64GB',
    ram: '4GB LPDDR3 / LPDDR4X',
    ruleSegment: 'KMRP6',
    explanation: 'En Samsung, KMRP6 / KMRX1 integran 64GB de almacenamiento eMMC 5.1 + 4GB RAM.',
    commonModels: 'Xiaomi Mi A1 64GB, Redmi Note 4 64GB, Vivo V7+, Oppo F5',
    package: 'BGA-221'
  },

  // ============================================================================
  // 4. SAMSUNG — uMCP (UFS + RAM LPDDR4X / LPDDR5: Series KM2, KM3, KM5, KM8, KM9)
  // ============================================================================
  {
    code: 'KM5P9001DM-B424',
    aliases: ['KM5P9001DM', 'KM5P8001DM-B424', 'KM5H7001DM-B424', 'KM5H80018M-B424', 'KM5C7001DM-B421', 'KM2H7001CM-B706', 'KM2P8001CM-B518'],
    brand: 'Samsung',
    type: 'uMCP (UFS 2.1 / 2.2 + LPDDR4X)',
    capacity: '64GB',
    ram: '4GB / 6GB LPDDR4X',
    ruleSegment: 'KM5P9',
    explanation: 'En Samsung uMCP, la letra "P", "H" o "C" en la 4.ª posición (KM5P9, KM5P8, KM5H7, KM2H7, KM2P8) indica 64GB UFS + RAM LPDDR4X (verificado en MIC).',
    commonModels: 'Xiaomi Redmi Note 8 Pro 64GB, Redmi 10 64GB, Realme 6, Moto G9 Plus',
    package: 'BGA-254 uMCP'
  },
  {
    code: 'KM8V7001JM-B813',
    aliases: ['KM8V7001JM', 'KM8V7001JA-B813', 'KM8V8001JM-B813', 'KM8V9001JM-B813', 'KM2V7001JM-B813', 'KM2V7001CM-B706', 'KM5V7001DM-B621', 'KM2V8001CM-B707', 'KM5V8001DM-B622', 'KM3V6001CM-B705', 'KMAG9001PM-B814'],
    brand: 'Samsung',
    type: 'uMCP (UFS 2.1 / 2.2 + LPDDR4X/5)',
    capacity: '128GB',
    ram: '4GB / 6GB / 8GB LPDDR4X',
    ruleSegment: 'KM8V7',
    explanation: 'En Samsung uMCP, la letra "V" en la 4.ª posición (KM2V7, KM5V7, KM2V8, KM5V8, KM8V7, KM8V8, KM8V9, KM3V6) y KMAG9 son siempre de 128GB de almacenamiento (verificado en MIC).',
    commonModels: 'Xiaomi Redmi Note 9 Pro, Note 10 Pro, Poco X3, Samsung A32 / A52, Moto G60',
    package: 'BGA-254 uMCP'
  },
  {
    code: 'KM2L9001CM-B518',
    aliases: ['KM2L9001CM', 'KM5L9001DM-B424', 'KM5L9001DA-B424', 'KM8L9001JM-B624'],
    brand: 'Samsung',
    type: 'uMCP (UFS 2.2 / 3.1 + LPDDR4X)',
    capacity: '128GB',
    ram: '4GB / 6GB / 8GB LPDDR4X',
    ruleSegment: 'KM5L9',
    explanation: 'En Samsung uMCP, la letra "L" en la 4.ª posición (KM2L9 / KM5L9 / KM8L9) indica 128GB UFS.',
    commonModels: 'Samsung Galaxy A15, A16, A24, A25, Redmi Note 12 / 13, Moto G54',
    package: 'BGA-254 uMCP'
  },
  {
    code: 'KM8F9001JM-B813',
    aliases: ['KM8F9001JM', 'KM8F9001MM-B830', 'KM8F8001JM-B813', 'KM8F8001LM-B813', 'KM8B8001JM-B813', 'KM2B8001CM-B707', 'KM2F8001CM-B707', 'KMAIA001PM-B814', 'KMAS9001PM-B814', 'KMJIA001PM-B814', 'KMJS9001PM-B814'],
    brand: 'Samsung',
    type: 'uMCP (UFS 3.1 + LPDDR4X / LPDDR5)',
    capacity: '256GB',
    ram: '6GB / 8GB / 12GB LPDDR4X/5',
    ruleSegment: 'KM8F9',
    explanation: 'En Samsung uMCP, la letra "F" o "B" en la 4.ª posición (KM8F8, KM8F9, KM8B8, KM2F8, KM2B8) y KMAIA / KMAS9 / KMJIA / KMJS9 indican 256GB UFS (verificado en MIC).',
    commonModels: 'Poco F4 / F5, Redmi K50 / K60, Motorola Edge 30 / 40, Realme GT Neo',
    package: 'BGA-254 / BGA-297 uMCP'
  },
  {
    code: 'KM9P9001DM-B424',
    aliases: ['KM9P9001DM', 'KM9F9001JM-B830'],
    brand: 'Samsung',
    type: 'uMCP (UFS 3.1 / 4.0 + LPDDR5X)',
    capacity: '512GB',
    ram: '12GB / 16GB LPDDR5X',
    ruleSegment: 'KM9P9',
    explanation: 'Serie KM9P9 / KM9F9 de Samsung uMCP con 512GB de almacenamiento UFS + RAM LPDDR5X.',
    commonModels: 'Poco F5 Pro 512GB, Redmi Note 13 Pro+ 512GB, Realme GT 5, Moto Edge 50 Pro',
    package: 'BGA-254 / BGA-297 uMCP'
  },

  // ============================================================================
  // 5. MICRON — FBGA Codes Verificados MIC (JW / JX / JY / JZ / JC) & MTFC / MT29 — 4GB a 1TB
  // ============================================================================
  {
    code: 'JW187',
    aliases: ['JW200', 'JW240', 'JW243', 'JW246', 'JW314', 'JW812', 'JW857', 'JWB10', 'JWD18', 'MTFC4GACAJCN', 'MTFC4GACAAAM', 'MTFC4GLDEA', 'MTFC4GMTEA-1FWT'],
    brand: 'Micron',
    type: 'eMMC 5.0 / eMCP (FBGA Code Verificado MIC)',
    capacity: '4GB',
    ram: 'Sin RAM / 512MB–1GB',
    ruleSegment: 'JW187',
    explanation: 'Códigos cortos FBGA de Micron (JW187, JW200, JW812, JW857, JWB10, JWD18 y MTFC4G) verificados en MIC con 4GB de almacenamiento.',
    commonModels: 'Alcatel Pixi 4, ZTE Blade L3, Moto C 4GB, módems e IoT',
    package: 'BGA-153 / BGA-221'
  },
  {
    code: 'JWA61',
    aliases: ['JW211', 'JW244', 'JW298', 'JW312', 'JW313', 'JW330', 'JW365', 'MTFC8GAKAJCN', 'MTFC8GLDEA', 'MTFC8GACAAAM-1MWT'],
    brand: 'Micron',
    type: 'eMMC 5.1 / eMCP (FBGA Code Verificado MIC)',
    capacity: '8GB',
    ram: 'Sin RAM / 1GB LPDDR3',
    ruleSegment: 'JWA61',
    explanation: 'Códigos cortos FBGA de Micron (JWA61, JW211, JW244, JW298, JW312, JW330 y MTFC8G) verificados en MIC con 8GB de almacenamiento.',
    commonModels: 'Moto C Plus, Moto E3, Alcatel U5, Lenovo Tab 7',
    package: 'BGA-153 / BGA-221'
  },
  {
    code: 'JW300',
    aliases: ['JW326', 'JW327', 'JW328', 'JW329', 'JW351', 'JW411', 'JW412', 'JZ077', 'MTFC16GAKAECN', 'MT29TZZZ5D6JKFRL'],
    brand: 'Micron',
    type: 'eMMC 5.1 / eMCP (FBGA Code Verificado MIC)',
    capacity: '16GB',
    ram: 'Sin RAM / 2GB LPDDR3',
    ruleSegment: 'JW300',
    explanation: 'Códigos cortos FBGA de Micron (JW300, JW326, JW328, JW351, JW411, JZ077 y MTFC16G / D6) verificados en MIC con 16GB.',
    commonModels: 'Moto E4, Moto G4 Play, Xiaomi Redmi 5A, Nokia 2 / 3',
    package: 'BGA-153 / BGA-221'
  },
  {
    code: 'JZ034',
    aliases: ['JW304', 'JW414', 'JW415', 'JW416', 'JW451', 'JW483', 'JW547', 'JW968', 'JW993', 'JWB28', 'JXC45', 'MTFC32GAKAECN', 'MT29TZZZ5D7JKFRL', 'MT29TZZZ7D7JKKBT-107WH97V'],
    brand: 'Micron',
    type: 'eMCP / eMMC 5.1 (FBGA Code Verificado MIC)',
    capacity: '32GB',
    ram: '2GB / 3GB LPDDR3/4X',
    ruleSegment: 'JZ034',
    explanation: 'Códigos cortos FBGA de Micron (JZ034 = MT29TZZZ7D7JKKBT, JW304, JW414, JW547, JW968 y MTFC32G / D7) verificados en MIC con 32GB.',
    commonModels: 'Moto G6 Play, Moto E5 Plus, Redmi 6 / 6A 32GB, Honor 8A',
    package: 'BGA-221 / BGA-254'
  },
  {
    code: 'JW895',
    aliases: ['JWA11', 'JW673', 'JW778', 'JW779', 'JW786', 'JW793', 'JW820', 'JW830', 'JWB52', 'JXD89', 'JXF45', 'JXG31', 'MTFC64GAPALBH', 'MTFC64GJVDN-3MWT', 'MT29TZZZ8D8JKFRL', 'MT29TZZZAD8JKFRL'],
    brand: 'Micron',
    type: 'eMMC 5.1 / eMCP / uMCP (FBGA Code Verificado MIC)',
    capacity: '64GB',
    ram: '3GB / 4GB LPDDR3 / LPDDR4X',
    ruleSegment: 'JW895',
    explanation: 'Códigos cortos FBGA de Micron (JW895, JWA11, JW673, JW778, JWB52, JXD89, MTFC64G y MT29...D8) verificados en MIC con 64GB.',
    commonModels: 'Moto G7, Moto G8 Play, Redmi Note 8 64GB, Realme 5 / C3',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'JWC56',
    aliases: ['JWC57', 'JWC75', 'JWC76', 'JWC77', 'JWC78', 'JWD02', 'JWD03', 'JXE77', 'JXH88', 'JXI12', 'JXJ95', 'JY010', 'JY089', 'JY112', 'MTFC128GAZAQJP', 'MT29VZZZAD9DQKSM-046W9K9'],
    brand: 'Micron',
    type: 'uMCP / UFS 2.2 / eMMC (FBGA Code Verificado MIC)',
    capacity: '128GB',
    ram: '4GB / 6GB / 8GB LPDDR4X',
    ruleSegment: 'JWC56',
    explanation: 'Códigos cortos FBGA de Micron (JWC56, JWC75, JWD02, JXE77, JY010, MTFC128G y MT29...D9/C9) verificados en MIC con 128GB.',
    commonModels: 'Moto G9 Power, Moto G20 / G30 / G50, Redmi Note 9S / 10S, Realme 7 / 8',
    package: 'BGA-254 / BGA-153'
  },
  {
    code: 'JZ115',
    aliases: ['JZ059', 'JZ061', 'JZ124', 'JZ139', 'JZ146', 'JZ147', 'JZ161', 'JA012', 'JB045', 'MTFC256GAXATEA', 'MTFC256GAQAMEK-WTES', 'MT29F2T08EMHAF', 'MT29VZZZBDA1SKPR-046W12O'],
    brand: 'Micron',
    type: 'UFS 3.1 / uMCP / eMMC (FBGA Code Verificado MIC)',
    capacity: '256GB',
    ram: '8GB / 12GB LPDDR4X / LPDDR5',
    ruleSegment: 'JZ115',
    explanation: 'Códigos cortos FBGA de Micron (JZ115, JZ059, JZ061, JZ124, JZ146, MTFC256G y MT29...DA) verificados en MIC con 256GB.',
    commonModels: 'Motorola Edge 20 / 30 / 40, Xiaomi 11T / 12T, Poco X4 / X5 Pro 256GB',
    package: 'BGA-254 / BGA-153'
  },
  {
    code: 'JZ149',
    aliases: ['JZ222', 'JZ223', 'JZ241', 'JZ243', 'JZ248', 'JZ249', 'JZ347', 'JC088', 'JC065', 'JC092', 'MTFC512GAXATEA', 'MT29F4T08EMHAF'],
    brand: 'Micron',
    type: 'UFS 3.1 / 4.0 / uMCP (FBGA Code Verificado MIC)',
    capacity: '512GB',
    ram: '12GB / 16GB LPDDR5 / LPDDR5X',
    ruleSegment: 'JZ149',
    explanation: 'Códigos FBGA de Micron (JZ149, JZ222, JZ241, JZ347, JC088, MTFC512G y MT29F4T) verificados en MIC con 512GB.',
    commonModels: 'Motorola Edge 40 Pro / 50 Ultra, Xiaomi 13 / 13T Pro 512GB, Realme GT 5',
    package: 'BGA-254 / BGA-153 UFS'
  },
  {
    code: 'JZ529',
    aliases: ['JZ530', 'JZ593', 'JZ594', 'JZ626', 'JZ627', 'JZ657', 'JZ658', 'JC101', 'JC120', 'MTFC1T0GAXATEA', 'MTFC1TAYAXHE-WT', 'MT29F8T08EMHAF'],
    brand: 'Micron',
    type: 'UFS 4.0 (FBGA Code Verificado MIC)',
    capacity: '1TB',
    ram: '16GB LPDDR5X / Sin RAM',
    ruleSegment: 'JZ529',
    explanation: 'Códigos FBGA de Micron (JZ529, JZ593, JZ626, JZ657, JC101, MTFC1T y MT29F8T) verificados en MIC con 1TB (1024GB).',
    commonModels: 'Xiaomi 13 Ultra 1TB, 14 Ultra 1TB, OnePlus 12 1TB, Asus ROG Phone 8',
    package: 'BGA-153 UFS 4.0'
  },

  // ============================================================================
  // 6. SK HYNIX — eMMC (H26M), eMCP (H9TP/H9TQ/H9HP), UFS (H28U/H28S/HN8T), uMCP (H9HQ/H9QT)
  // ============================================================================
  {
    code: 'H26M31003GMR',
    aliases: ['H26M31001HPR', 'H26M31002GPR', 'H9TP32A4GDMCPR-KGM', 'H9TP32A8JDAC'],
    brand: 'SK Hynix',
    type: 'eMMC 4.5 / eMCP',
    capacity: '4GB',
    ram: 'Sin RAM / 512MB',
    ruleSegment: '31',
    explanation: 'En SK Hynix, "H26M31" o "H9TP32" (32 Gigabits = 4 Gigabytes) indica siempre 4GB.',
    commonModels: 'LG L50, L65, Leon, Alcatel Pixi, Huawei Y330 / Y520',
    package: 'BGA-153 / BGA-162'
  },
  {
    code: 'H26M41204HPR',
    aliases: ['H26M41208HPR', 'H26M42003GMR', 'H9TP65A8JDACPR', 'H9TQ64A8GTMCUR-KUM'],
    brand: 'SK Hynix',
    type: 'eMMC 5.0 / eMCP',
    capacity: '8GB',
    ram: 'Sin RAM / 1GB LPDDR3',
    ruleSegment: '41',
    explanation: 'En SK Hynix, "H26M41/42" o "H9TP65/H9TQ64" (64Gb = 8GB) indica 8GB de almacenamiento.',
    commonModels: 'LG K4, K8, Spirit, Huawei Y5 II, Moto E2, ZTE Blade L5',
    package: 'BGA-153 / BGA-221'
  },
  {
    code: 'H26M52208FPR',
    aliases: ['H26M52103FMR', 'H26M54002EMR', 'H9TQ17ABJTMCUR-KUM', 'H9TQ17ADFTMCUR'],
    brand: 'SK Hynix',
    type: 'eMMC 5.1 / eMCP',
    capacity: '16GB',
    ram: 'Sin RAM / 2GB LPDDR3',
    ruleSegment: '52',
    explanation: 'En SK Hynix, "H26M52/54" o "H9TQ17" indica exactamente 16GB de almacenamiento.',
    commonModels: 'LG K10, Q6, Xiaomi Redmi 4A, Redmi 5A, Huawei Y6 2018',
    package: 'BGA-153 / BGA-221'
  },
  {
    code: 'H26M64208EMR',
    aliases: ['H26M64103EMR', 'H9TQ26ADFTMCUR-KUM', 'H9TQ27ADFTMCUR', 'H9HP27ADAMADAR'],
    brand: 'SK Hynix',
    type: 'eMMC 5.1 / eMCP',
    capacity: '32GB',
    ram: '3GB LPDDR3 / LPDDR4X',
    ruleSegment: '64',
    explanation: 'En SK Hynix, "H26M64" o "H9TQ26 / H9TQ27 / H9HP27" indica 32GB de almacenamiento.',
    commonModels: 'Xiaomi Redmi 6, Redmi 7, LG K40 / K50, Huawei Y7 2019, Moto E6 Plus',
    package: 'BGA-153 / BGA-221 / BGA-254'
  },
  {
    code: 'H28U62301AMR',
    aliases: ['H28S6D302BMR'],
    brand: 'SK Hynix',
    type: 'UFS 2.1',
    capacity: '32GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '62',
    explanation: 'En SK Hynix UFS (H28U / H28S), el código "62" / "6D" indica 32GB UFS.',
    commonModels: 'LG G6 32GB, Xiaomi Mi 5 32GB, HTC U11',
    package: 'BGA-153 UFS'
  },
  {
    code: 'H9HP52ACPMMDAR',
    aliases: ['H26M78208CMR', 'H9TQ52ACLTMCUR-KUM', 'H9AG9G5ANBX100', 'H28U74301AMR', 'H28S7Q302BMR', 'H9HQ54AECMMDAR', 'H9HQ53ACPMMDAR-KEM', 'HN8G962EHKX039'],
    brand: 'SK Hynix',
    type: 'eMCP / UFS 2.1 / uMCP',
    capacity: '64GB',
    ram: '4GB LPDDR4X',
    ruleSegment: '52',
    explanation: 'En SK Hynix, "H26M78", "H28U74/H28S7Q", "H9TQ52 / H9HP52", "H9HQ53 / H9HQ54" o "HN8G9" corresponden a 64GB (verificado en MIC).',
    commonModels: 'Xiaomi Redmi Note 7, Redmi Note 8, Redmi 9, Moto G8 Power, Oppo A5 2020',
    package: 'BGA-254 / BGA-153'
  },
  {
    code: 'H9HQ15AECMMDAR',
    aliases: ['H26M88002AMR', 'H28U88301AMR', 'H9HQ16AECMMDAR', 'H9QT0GECN6X145', 'HN8T05DEHKX073'],
    brand: 'SK Hynix',
    type: 'uMCP / UFS 2.2 / 3.1',
    capacity: '128GB',
    ram: '4GB / 6GB / 8GB LPDDR4X',
    ruleSegment: '15',
    explanation: 'En SK Hynix, "H26M88", "H28U88", "H9HQ15/16", "H9QT0G" o "HN8T05" indican 128GB.',
    commonModels: 'Xiaomi Redmi Note 10 / 11, Poco M3 / M4 Pro, Moto G31 / G52, Honor X7 / X8',
    package: 'BGA-254 / BGA-153'
  },
  {
    code: 'HN8T15DEHKX075',
    aliases: ['H9HQ21AECMMDAR', 'H9QT1G6DN6X132', 'HN8T16DEHKX'],
    brand: 'SK Hynix',
    type: 'UFS 3.1 / uMCP',
    capacity: '256GB',
    ram: '8GB / 12GB LPDDR5',
    ruleSegment: '15',
    explanation: 'En SK Hynix de nueva generación, "HN8T15", "H9HQ21" o "H9QT1G" indican 256GB UFS.',
    commonModels: 'Xiaomi 12 / 13, Poco F4 / X5 Pro 256GB, OnePlus 10 Pro, Honor 70 / 90',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'HN8T25DEHKX077',
    aliases: ['H9HR56JFA3MEVR', 'HN8T26DEHKX'],
    brand: 'SK Hynix',
    type: 'UFS 3.1 / 4.0 / uMCP',
    capacity: '512GB',
    ram: '12GB / 16GB LPDDR5X',
    ruleSegment: '25',
    explanation: 'En SK Hynix, "HN8T25" o "H9HR56" corresponden a 512GB de almacenamiento UFS.',
    commonModels: 'Xiaomi 13 Pro, 14 Pro 512GB, OnePlus 11 / 12 512GB, Vivo X90 / X100',
    package: 'BGA-153 UFS'
  },
  {
    code: 'HN8T35DEHKX079',
    aliases: ['HN8T35DEHKX', 'HN8T36DEHKX'],
    brand: 'SK Hynix',
    type: 'UFS 4.0',
    capacity: '1TB',
    ram: 'Sin RAM integrada',
    ruleSegment: '35',
    explanation: 'En SK Hynix UFS 4.0, el código "HN8T35" corresponde a 1TB (1024GB).',
    commonModels: 'Xiaomi 14 Ultra 1TB, OnePlus 12 1TB, Oppo Find X7 Ultra 1TB',
    package: 'BGA-153 UFS 4.0'
  },

  // ============================================================================
  // 7. SANDISK / WESTERN DIGITAL — iNAND eMMC / eMCP / UFS (Serie SDIN) — 4GB a 1TB
  // ============================================================================
  {
    code: 'SDIN7DP2-4G',
    aliases: ['SDIN5D2-4G', 'SDIN7DU2-4G', 'SDIN8DE1-4G'],
    brand: 'SanDisk',
    type: 'iNAND eMMC 4.5',
    capacity: '4GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '4G',
    explanation: 'En SanDisk / Western Digital, el sufijo después del guion (-4G) indica directamente 4GB.',
    commonModels: 'Moto E1, Huawei Y320, Alcatel OneTouch, GPS y tablets básicas',
    package: 'BGA-153'
  },
  {
    code: 'SDIN8DE2-8G',
    aliases: ['SDIN7DP2-8G', 'SDIN9DW4-8G', 'SDINBDA4-8G', 'SDINADF4-8G'],
    brand: 'SanDisk',
    type: 'iNAND eMMC 5.0 / 5.1',
    capacity: '8GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '8G',
    explanation: 'El sufijo "-8G" al final del código SanDisk indica directamente 8GB.',
    commonModels: 'Moto G1 / G2 8GB, Huawei Y5, LG Spirit, ZTE Blade',
    package: 'BGA-153'
  },
  {
    code: 'SDIN8DE4-16G',
    aliases: ['SDIN9DW4-16G', 'SDINADF4-16G', 'SDINBDA4-16G', 'SDINBDD4-16G', 'SDINBDG4-16G'],
    brand: 'SanDisk',
    type: 'iNAND 7232 / 7550 eMMC 5.1',
    capacity: '16GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '16G',
    explanation: 'El sufijo "-16G" al final del código SanDisk indica directamente 16GB.',
    commonModels: 'Moto G3 / G4 16GB, Huawei P8 Lite, P9 Lite, Xiaomi Redmi 3S',
    package: 'BGA-153'
  },
  {
    code: 'SDINBDA4-32G',
    aliases: ['SDINADF4-32G', 'SDINBDD4-32G', 'SDINBDG4-32G', 'SDIN9DW4-32G', 'SDINCE4-32G'],
    brand: 'SanDisk',
    type: 'iNAND 7550 eMMC 5.1',
    capacity: '32GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '32G',
    explanation: 'El sufijo "-32G" al final del código SanDisk indica directamente 32GB.',
    commonModels: 'Moto G5S, Moto G6, Huawei Mate 10 Lite, P20 Lite 32GB, Xiaomi Mi A1',
    package: 'BGA-153'
  },
  {
    code: 'SDINBDA4-64G',
    aliases: ['SDINADF4-64G', 'SDINBDD4-64G', 'SDINBDG4-64G', 'SDINCE4-64G', 'SDINFDQ4-64G'],
    brand: 'SanDisk',
    type: 'iNAND 7550 eMMC 5.1 / UFS',
    capacity: '64GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '64G',
    explanation: 'El sufijo "-64G" al final del código SanDisk indica directamente 64GB.',
    commonModels: 'Huawei P20 Lite 64GB, P30 Lite, Moto Z2 Play, Moto One, Redmi Note 5/6 Pro',
    package: 'BGA-153'
  },
  {
    code: 'SDINBDA4-128G',
    aliases: ['SDINBDD4-128G', 'SDINBDG4-128G', 'SDINFDQ6-128G', 'SDINCE4-128G'],
    brand: 'SanDisk',
    type: 'iNAND eMMC 5.1 / UFS 2.1 / 3.1',
    capacity: '128GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '128G',
    explanation: 'El sufijo "-128G" al final del código SanDisk indica directamente 128GB.',
    commonModels: 'Huawei P30 Lite 128GB, Nova 5T, Moto One Fusion / Hyper, Google Pixel 4a',
    package: 'BGA-153'
  },
  {
    code: 'SDINBDA4-256G',
    aliases: ['SDINFDQ6-256G', 'SDINFDO4-256G', 'SDINBDG4-256G'],
    brand: 'SanDisk',
    type: 'iNAND UFS 3.1 / eMMC 5.1',
    capacity: '256GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '256G',
    explanation: 'El sufijo "-256G" al final del código SanDisk indica directamente 256GB.',
    commonModels: 'Huawei Mate 20 Pro / P30 Pro 256GB, Pixel 6 / 7 256GB, Steam Deck / Consolas',
    package: 'BGA-153'
  },
  {
    code: 'SDINFDQ6-512G',
    aliases: ['SDINFDO4-512G'],
    brand: 'SanDisk',
    type: 'iNAND UFS 3.1',
    capacity: '512GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '512G',
    explanation: 'El sufijo "-512G" al final del código SanDisk indica directamente 512GB.',
    commonModels: 'Google Pixel 7 Pro / 8 Pro 512GB, equipos gaming y flagships',
    package: 'BGA-153 UFS'
  },
  {
    code: 'SDINFDO4-1T',
    aliases: ['SDINFDQ6-1T'],
    brand: 'SanDisk',
    type: 'iNAND UFS 3.1 / 4.0',
    capacity: '1TB',
    ram: 'Sin RAM integrada',
    ruleSegment: '1T',
    explanation: 'El sufijo "-1T" al final del código SanDisk indica directamente 1 Terabyte (1024GB).',
    commonModels: 'Google Pixel 8 Pro / 9 Pro 1TB, consolas portátiles y flagships 1TB',
    package: 'BGA-153 UFS'
  },

  // ============================================================================
  // 8. KIOXIA / TOSHIBA — eMMC (THGBM), eMCP (THGLF), UFS (THGAF / THGJF) — 4GB a 1TB
  // ============================================================================
  {
    code: 'THGBMNG5D1LBAIL',
    aliases: ['THGBMAG5A1JBAIR', 'THGBMBG5D1KBAIL', 'THGBMDG5D1LBAIL'],
    brand: 'Kioxia / Toshiba',
    type: 'eMMC 5.0',
    capacity: '4GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'G5',
    explanation: 'En Kioxia / Toshiba, el código "G5" (2^5 = 32 Gigabits = 4 Gigabytes) indica 4GB.',
    commonModels: 'Equipos 3G, routers, GPS y celulares básicos',
    package: 'BGA-153'
  },
  {
    code: 'THGBMFG6C1LBAIL',
    aliases: ['THGBMJG6C1LBAIL', 'THGBMHG6C1LBAIL', 'THGBMAG6A1JBAIR'],
    brand: 'Kioxia / Toshiba',
    type: 'eMMC 5.0 / 5.1',
    capacity: '8GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'G6',
    explanation: 'En Kioxia / Toshiba, el código "G6" (2^6 = 64 Gigabits = 8 Gigabytes) indica 8GB.',
    commonModels: 'Huawei Y5, Sony Xperia E4, LG K4, tablets de 8GB',
    package: 'BGA-153'
  },
  {
    code: 'THGBMFG7C2LBAIL',
    aliases: ['THGBMJG7C2LBAIL', 'THGBMHG7C2LBAIL', 'THGLF2G7D2LBATR'],
    brand: 'Kioxia / Toshiba',
    type: 'eMMC 5.1 / eMCP',
    capacity: '16GB',
    ram: 'Sin RAM / 2GB LPDDR3',
    ruleSegment: 'G7',
    explanation: 'En Kioxia / Toshiba, el código "G7" indica 16GB de almacenamiento.',
    commonModels: 'Sony Xperia XA, Huawei P8 Lite, Xiaomi Redmi 3 / 4',
    package: 'BGA-153 / BGA-221'
  },
  {
    code: 'THGBMHG8C2LBAIL',
    aliases: ['THGBMJG8C2LBAIL', 'THGBMFG8C4LBAIR', 'THGLF2G8J4LBATR', 'THGAF8G8T23BAIL'],
    brand: 'Kioxia / Toshiba',
    type: 'eMMC 5.1 / eMCP / UFS 2.1',
    capacity: '32GB',
    ram: 'Sin RAM / 3GB LPDDR3',
    ruleSegment: 'G8',
    explanation: 'En Kioxia / Toshiba, el código "G8" (tanto en THGBM como en THGAF8G8) indica 32GB.',
    commonModels: 'Sony Xperia XZ, Huawei Mate 9 Lite, Xiaomi Mi 5 32GB, Nintendo Switch 32GB',
    package: 'BGA-153 / BGA-221'
  },
  {
    code: 'THGAF8G9T43BAIR',
    aliases: ['THGBMHG9C4LBAIR', 'THGBMJG9C4LBAIR', 'THGLF2G9J8LBATR', 'THGAF4G9N4LBAIR'],
    brand: 'Kioxia / Toshiba',
    type: 'UFS 2.1 / eMMC 5.1',
    capacity: '64GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'G9',
    explanation: 'En Kioxia / Toshiba, el código "G9" (como en THGAF8G9 o THGBMHG9) indica 64GB.',
    commonModels: 'Nintendo Switch OLED 64GB, Huawei P10 / P20, Sony Xperia XZ1 / XZ2, Mi Mix 2',
    package: 'BGA-153'
  },
  {
    code: 'THGAF8T0T43BAIR',
    aliases: ['THGBMHT0C8LBAIG', 'THGAF9T0T43BAIR', 'THGJFGT0T44BAIL'],
    brand: 'Kioxia / Toshiba',
    type: 'UFS 2.1 / 3.1 / eMMC 5.1',
    capacity: '128GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'T0',
    explanation: 'En Kioxia / Toshiba, cuando cambia de G a "T0" (1 Terabit = 128 Gigabytes) indica 128GB.',
    commonModels: 'Huawei P30 / Mate 20, Xiaomi Mi 9 / Mi 10, Google Pixel 5 / 6 128GB',
    package: 'BGA-153 UFS'
  },
  {
    code: 'THGAF8T1T83BAIR',
    aliases: ['THGAF9T1T83BAIR', 'THGJFGT1T84BAIL', 'THGJFLT1T84BAIL'],
    brand: 'Kioxia / Toshiba',
    type: 'UFS 3.1 / 4.0',
    capacity: '256GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'T1',
    explanation: 'En Kioxia / Toshiba, el código "T1" (2 Terabits = 256 Gigabytes) indica 256GB.',
    commonModels: 'Huawei P40 Pro, Mate 40 Pro, Xiaomi 12 Pro, Google Pixel 7 / 8 256GB',
    package: 'BGA-153 UFS'
  },
  {
    code: 'THGJFGT2T84BAIL',
    aliases: ['THGAFAT2T83BAIR', 'THGJFLT2T84BAIL'],
    brand: 'Kioxia / Toshiba',
    type: 'UFS 3.1 / 4.0',
    capacity: '512GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'T2',
    explanation: 'En Kioxia / Toshiba, el código "T2" (4 Terabits = 512 Gigabytes) indica 512GB.',
    commonModels: 'Huawei Mate 50 / 60 Pro 512GB, Xiaomi 13 / 14 Pro 512GB',
    package: 'BGA-153 UFS'
  },
  {
    code: 'THGJFGT3T84BAIL',
    aliases: ['THGJFLT3T84BAIL', 'THGAFAT3T83BAIR'],
    brand: 'Kioxia / Toshiba',
    type: 'UFS 4.0',
    capacity: '1TB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'T3',
    explanation: 'En Kioxia / Toshiba, el código "T3" (8 Terabits = 1024 Gigabytes) indica 1TB.',
    commonModels: 'Huawei Mate 60 RS / Pura 70 Ultra 1TB, Flagships Android 1TB',
    package: 'BGA-153 UFS 4.0'
  },

  // ============================================================================
  // 9. APPLE / iPHONE NAND (BGA60 / BGA70 / BGA110 / BGA315 — 16GB a 2TB)
  // ============================================================================
  {
    code: 'H23QDG8UD1ACS',
    aliases: ['H2JTDG8UD1BMS', 'SDMFLBCB', 'THGBX5G7D2KLFXG', 'K5A3RB5896'],
    brand: 'Apple / iPhone NAND',
    type: 'Apple PCIe / Raw NAND (BGA60 / BGA70)',
    capacity: '16GB',
    ram: 'Sin RAM (RAM va en el CPU Apple A-Series)',
    ruleSegment: 'DG8',
    explanation: 'Memorias NAND de iPhone 5S / 6 / 6S de 16GB (Hynix H23QDG8 / Toshiba THGBX5G7 / SanDisk SDMFLBCB).',
    commonModels: 'iPhone 5S, iPhone 6, iPhone 6 Plus, iPhone 6S, iPhone SE 1ª Gen (16GB)',
    package: 'BGA-60 / BGA-70'
  },
  {
    code: 'H23QEG8I26ADQ-BC',
    aliases: ['H230EH8VG2ACS', 'SDMKLEDG2-32G', 'SDSBFBG11-032G', 'THGBX6G8D2LLFXG', 'K5A4RB5896'],
    brand: 'Apple / iPhone NAND',
    type: 'Apple NVMe NAND (BGA70 / BGA110)',
    capacity: '32GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'EG8',
    explanation: 'Memorias NAND de iPhone 6S / 7 / 7 Plus de 32GB (Hynix H23QEG8 / SanDisk 032G / Toshiba G8).',
    commonModels: 'iPhone 6S 32GB, iPhone 7 32GB, iPhone 7 Plus 32GB, iPad 5ª/6ª Gen 32GB',
    package: 'BGA-70 / BGA-110'
  },
  {
    code: 'H23QFG82D6ADQ-BC',
    aliases: ['H23BFG8127AED-BC', 'SDMPEGF12-064G', 'SDSBFBGI2-064G', 'KLACG2UWCAE0T3', 'THGBX4G9T4KLF0C', 'TSB3234', 'TSB3243', 'TSB3247', 'KICM223', 'K5A5RB5896'],
    brand: 'Apple / iPhone NAND',
    type: 'Apple NVMe NAND (BGA70 / BGA110)',
    capacity: '64GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'FG8',
    explanation: 'Memorias NAND de iPhone 8 / X / XR / 11 / 12 de 64GB (H23QFG8, SDM...064G, TSB3243, KICM223, KLACG).',
    commonModels: 'iPhone 8, 8 Plus, iPhone X, XS, XR, iPhone 11, iPhone 12, SE 2020/2022 (64GB)',
    package: 'BGA-110'
  },
  {
    code: 'H23B1T82D7AEQ-BC',
    aliases: ['H23Q1T83G6ADQ-BC', 'H23Q1586J6AEQ-BC', 'TSB4226', 'KICM224', 'SDMPEGF12-128G', 'SDSBFBGI2-128G', 'K5A6RB5896'],
    brand: 'Apple / iPhone NAND',
    type: 'Apple NVMe NAND (BGA110 / BGA315)',
    capacity: '128GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '1T8',
    explanation: 'Memorias NAND de iPhone 7 a iPhone 15 de 128GB (H23B1T8 / KICM224 / TSB4226 / 128G).',
    commonModels: 'iPhone 7/11/12/13/14/15 (128GB), iPhone 13 Pro / 14 Pro (128GB)',
    package: 'BGA-110 / BGA-315'
  },
  {
    code: 'KICM225-BGA110',
    aliases: ['KICM225', 'TSB4228', 'H23Q2T83G6ADQ-BC', 'SDMPEGF12-256G', 'K6A6RB5896'],
    brand: 'Apple / iPhone NAND',
    type: 'Apple NVMe NAND (BGA110 / BGA315)',
    capacity: '256GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'KICM225',
    explanation: 'Memorias NAND de iPhone 8/X/11/12/13/14/15/16 Pro de 256GB (KICM225 / H23Q2T8 / K6A6).',
    commonModels: 'iPhone X, XS, 11 Pro, 12 Pro, 13 Pro, 14 Pro, 15 Pro Max (256GB)',
    package: 'BGA-110 / BGA-315'
  },
  {
    code: 'KICM226-BGA110',
    aliases: ['KICM226', 'H23Q4T83G6ADQ-BC', 'SDMPEGF12-512G', 'K6A7RB5896'],
    brand: 'Apple / iPhone NAND',
    type: 'Apple NVMe NAND (BGA110 / BGA315)',
    capacity: '512GB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'KICM226',
    explanation: 'Memorias NAND de iPhone XS / 11 Pro / 12 Pro / 13 Pro / 14 Pro / 15 Pro de 512GB (KICM226 / H23Q4T8 / K6A7).',
    commonModels: 'iPhone XS Max, 11 Pro Max, 12/13/14/15/16 Pro & Pro Max (512GB)',
    package: 'BGA-110 / BGA-315'
  },
  {
    code: 'K6A8RB5896',
    aliases: ['KICM227', 'H23Q8T83G6ADQ-BC', 'SDMPEGF12-1TB'],
    brand: 'Apple / iPhone NAND',
    type: 'Apple NVMe NAND (BGA110 / BGA315)',
    capacity: '1TB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'K6A8',
    explanation: 'Memorias NAND de iPhone 13 Pro / 14 Pro / 15 Pro / 16 Pro de 1TB (K6A8 / KICM227 / H23Q8T8).',
    commonModels: 'iPhone 13 Pro / Pro Max 1TB, 14 Pro / Pro Max 1TB, 15/16 Pro Max 1TB, iPad Pro M2/M4 1TB',
    package: 'BGA-110 / BGA-315'
  },
  {
    code: 'K6B9RB5896',
    aliases: ['KICM228'],
    brand: 'Apple / iPhone NAND',
    type: 'Apple NVMe NAND (BGA315)',
    capacity: '2TB',
    ram: 'Sin RAM integrada',
    ruleSegment: 'K6B9',
    explanation: 'Memoria NAND Apple de ultra-alta densidad de 2TB (2048GB) para iPad Pro M1/M2/M4 e iPhone Pro Max.',
    commonModels: 'iPad Pro M1/M2/M4 2TB, iPhone 16/17 Pro Max 2TB',
    package: 'BGA-315'
  },

  // ============================================================================
  // 10. KINGSTON — eMMC / eMCP / UFS / uMCP — 4GB a 256GB
  // ============================================================================
  {
    code: 'EMMC04G-M627',
    aliases: ['EMMC04G-MT32', 'EMMC04G-CT32', 'EMMC04G-W100', 'KE4CN2H5A'],
    brand: 'Kingston',
    type: 'eMMC 5.0 / 5.1',
    capacity: '4GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '04G',
    explanation: 'En Kingston, los dígitos después de EMMC ("04G") indican directamente 4GB.',
    commonModels: 'Alcatel, ZTE, Lanix, terminales bancarias POS y cajas decodificadoras',
    package: 'BGA-153'
  },
  {
    code: 'EMMC08G-ML36',
    aliases: ['EMMC08G-M325', 'EMMC08G-CT32', 'EMMC08G-MV28', '08EMCP08-EL3DT227'],
    brand: 'Kingston',
    type: 'eMMC 5.1 / eMCP',
    capacity: '8GB',
    ram: 'Sin RAM / 1GB LPDDR3',
    ruleSegment: '08G',
    explanation: 'En Kingston, "08G" o el inicio "08EMCP" indican directamente 8GB.',
    commonModels: 'Motorola Moto C, Alcatel 1, ZTE Blade A3, tablets educativas',
    package: 'BGA-153 / BGA-221'
  },
  {
    code: 'EMMC16G-TB29',
    aliases: ['EMMC16G-MW28', 'EMMC16G-W525', '16EMCP08-EL3BT227'],
    brand: 'Kingston',
    type: 'eMMC 5.1 / eMCP',
    capacity: '16GB',
    ram: 'Sin RAM / 1GB–2GB LPDDR3',
    ruleSegment: '16G',
    explanation: 'En Kingston, "16G" o el inicio "16EMCP" indican directamente 16GB.',
    commonModels: 'Moto E5 Play, Nokia 1 Plus, ZTE Blade A5, TCL',
    package: 'BGA-153 / BGA-221'
  },
  {
    code: 'EMMC32G-TX29',
    aliases: ['EMMC32G-TB29', 'EMMC32G-TS0A', '32EMCP16-EL3BT227', '32EM16-M4JTQ0A', '32EM32-M4KTQ0A', 'UFS32G-TXA7-GA20'],
    brand: 'Kingston',
    type: 'eMMC 5.1 / eMCP / UFS',
    capacity: '32GB',
    ram: '2GB / 4GB LPDDR3/4X',
    ruleSegment: '32G',
    explanation: 'En Kingston, "32G" o el inicio "32EMCP / 32EM" indican directamente 32GB.',
    commonModels: 'Moto E6i, E7i Power, Nokia C20 / G10, ZTE Blade A31 / A51',
    package: 'BGA-153 / BGA-221 / BGA-254'
  },
  {
    code: 'EMMC64G-TY29',
    aliases: ['EMMC64G-TB29', 'EMMC64G-TB9F', '64EMCP32-EL4BT227', '64EM32-N3HTX29', 'UFS64G-TXA7-GA20'],
    brand: 'Kingston',
    type: 'eMMC 5.1 / eMCP / UFS',
    capacity: '64GB',
    ram: '4GB LPDDR4X',
    ruleSegment: '64G',
    explanation: 'En Kingston, "64G" o el inicio "64EMCP / 64EM" indican directamente 64GB.',
    commonModels: 'Moto E20, E30, G22, ZTE Blade V30 Vita, TCL 20 SE',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'EMMC128-TY29',
    aliases: ['EMMC128-TB29', 'EMMC128-IY29', '128EMCP64-EL4BT227', 'UFS128-TXA7-GA20'],
    brand: 'Kingston',
    type: 'eMMC 5.1 / eMCP / UFS',
    capacity: '128GB',
    ram: '4GB / 6GB LPDDR4X',
    ruleSegment: '128',
    explanation: 'En Kingston, el número "128" después de EMMC / UFS o al inicio de 128EMCP indica 128GB.',
    commonModels: 'Moto G22 128GB, Moto E40, ZTE Axon 40 SE, Honor X6',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: '256UMCP64-EL4BT',
    aliases: ['EMMC256-TY29', 'UFS256-TXA7-GA20'],
    brand: 'Kingston',
    type: 'uMCP UFS 2.2 / 3.1 / eMMC',
    capacity: '256GB',
    ram: '8GB LPDDR4X',
    ruleSegment: '256',
    explanation: 'En Kingston, el número "256" al inicio de 256UMCP o después de EMMC/UFS indica 256GB.',
    commonModels: 'Motorola Moto G54 / G84 256GB, ZTE Blade V50, TCL 40 NXTPAPER',
    package: 'BGA-254'
  },

  // ============================================================================
  // 11. FORESEE (Longsys) — eMMC (FEMDNN / NCEM) & UFS (FEUFS) — 4GB a 512GB
  // ============================================================================
  {
    code: 'FEMDNN004G-08A39',
    aliases: ['NCEMAD9D-04G', 'FEMDM004G'],
    brand: 'FORESEE (Longsys)',
    type: 'eMMC 5.1',
    capacity: '4GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '004G',
    explanation: 'En FORESEE (Longsys), "004G" o "-04G" indica directamente 4GB.',
    commonModels: 'TV Box, módems 4G, terminales POS y celulares básicos',
    package: 'BGA-153'
  },
  {
    code: 'FEMDNN008G-08A39',
    aliases: ['NCEMAD9D-08G', 'FEMDM008G'],
    brand: 'FORESEE (Longsys)',
    type: 'eMMC 5.1',
    capacity: '8GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '008G',
    explanation: 'En FORESEE, "008G" o "-08G" indica directamente 8GB.',
    commonModels: 'Tablets Hyundai / Ghia, celulares básicos ZTE / Blu / Bmobile',
    package: 'BGA-153'
  },
  {
    code: 'FEMDNN016G-58A43',
    aliases: ['FEMDNN016G-58A46', 'NCEMASLD-16G', 'FEMDNN016G-08A39'],
    brand: 'FORESEE (Longsys)',
    type: 'eMMC 5.1',
    capacity: '16GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '016G',
    explanation: 'En FORESEE, "016G" o "-16G" indica directamente 16GB.',
    commonModels: 'Infinix Smart, Tecno Pop, ZTE Blade L210, tablets Lenovo',
    package: 'BGA-153'
  },
  {
    code: 'FEMDNN032G-A3A55',
    aliases: ['FEMDNN032G-C9A55', 'NCEMASLD-32G', 'FEMDRM032G-58A39'],
    brand: 'FORESEE (Longsys)',
    type: 'eMMC 5.1 / eMCP',
    capacity: '32GB',
    ram: 'Sin RAM / 2GB–3GB LPDDR4X',
    ruleSegment: '032G',
    explanation: 'En FORESEE, "032G" o "-32G" indica directamente 32GB.',
    commonModels: 'Xiaomi Redmi A1 / A2, Poco C40, Tecno Spark Go, Infinix Hot 12i',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'FEMDNN064G-A3A56',
    aliases: ['FEMDNN064G-58K72', 'FEMDNN064G-A3V01', 'NCEMBSF9-64G', 'FEMDRM064G-58A43'],
    brand: 'FORESEE (Longsys)',
    type: 'eMMC 5.1 / eMCP',
    capacity: '64GB',
    ram: 'Sin RAM / 4GB LPDDR4X',
    ruleSegment: '064G',
    explanation: 'En FORESEE, "064G" o "-64G" indica directamente 64GB.',
    commonModels: 'Xiaomi Redmi 10A / 12C, Moto E13 / E22, Realme C30 / C33, Honor X5',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'FEMDNN128G-A3A56',
    aliases: ['FEMDNN128G-C9C76', 'FEMDRM128G-A3A56', 'NCEMBSF9-128G', 'FEUFS128G-B0B1'],
    brand: 'FORESEE (Longsys)',
    type: 'eMMC 5.1 / UFS 2.2 / uMCP',
    capacity: '128GB',
    ram: '4GB / 6GB / 8GB LPDDR4X',
    ruleSegment: '128G',
    explanation: 'En FORESEE, "128G" indica directamente 128GB de almacenamiento.',
    commonModels: 'Xiaomi Redmi 12C / 13C 128GB, Poco C65, Infinix Note 30, Tecno Pova',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'FEUFS256G-B0C1',
    aliases: ['FEMDNN256G-A3V01', 'FEMDRM256G'],
    brand: 'FORESEE (Longsys)',
    type: 'UFS 2.2 / 3.1 / eMMC 5.1',
    capacity: '256GB',
    ram: '8GB / 12GB LPDDR4X',
    ruleSegment: '256G',
    explanation: 'En FORESEE, "256G" indica directamente 256GB de almacenamiento.',
    commonModels: 'Infinix Note 40 Pro, Tecno Camon 20/30, Redmi 13C 256GB, Cubot / Doogee',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'FEUFS512G-B0D1',
    aliases: ['FEUFS512G'],
    brand: 'FORESEE (Longsys)',
    type: 'UFS 3.1',
    capacity: '512GB',
    ram: '12GB LPDDR5',
    ruleSegment: '512G',
    explanation: 'En FORESEE, "512G" indica directamente 512GB de almacenamiento UFS.',
    commonModels: 'Tecno Phantom V Fold / Flip 512GB, Infinix Zero Ultra, tablets de gama alta',
    package: 'BGA-153 UFS'
  },

  // ============================================================================
  // 12. YMTC (Yangtze Memory) — eMMC (YMEC) & UFS (YMN) — 32GB a 1TB
  // ============================================================================
  {
    code: 'YMEC6A2TB1A2C3',
    aliases: ['YMEC6A'],
    brand: 'YMTC (Yangtze Memory)',
    type: 'eMMC 5.1 (Xtacking 3D NAND)',
    capacity: '32GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '6A',
    explanation: 'En YMTC serie YMEC, el código "6A" corresponde a 32GB eMMC 5.1.',
    commonModels: 'Tablets y celulares económicos con memoria YMTC de 32GB',
    package: 'BGA-153'
  },
  {
    code: 'YMEC7C0TG1A2C3',
    aliases: ['YMEC7C'],
    brand: 'YMTC (Yangtze Memory)',
    type: 'eMMC 5.1 (Xtacking 3D NAND)',
    capacity: '64GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '7C',
    explanation: 'En YMTC serie YMEC, el código "7C" corresponde a 64GB eMMC 5.1.',
    commonModels: 'Huawei Nova Y61, Honor X6a, tablets de 64GB',
    package: 'BGA-153'
  },
  {
    code: 'YMN08TE1B1HC3B',
    aliases: ['YMEC8C0TG2A2C3', 'YMN08TF1B1HC3B'],
    brand: 'YMTC (Yangtze Memory)',
    type: 'UFS 2.2 / 3.1 / eMMC 5.1',
    capacity: '128GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '08T',
    explanation: 'En YMTC (Yangtze Memory), "YMN08T" o "YMEC8C" corresponde a 128GB.',
    commonModels: 'Huawei Nova 9 / 10 / 11i, Honor X8 / X9 128GB',
    package: 'BGA-153 UFS'
  },
  {
    code: 'YMN09TF1B1HC3B',
    aliases: ['YMN09TF1B1HC3C'],
    brand: 'YMTC (Yangtze Memory)',
    type: 'UFS 3.1 (Xtacking 3D NAND)',
    capacity: '256GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '09TF',
    explanation: 'En YMTC, el código "YMN09TF" corresponde a 256GB.',
    commonModels: 'Huawei P50, Mate 50, Nova 11 / 12 256GB, Honor 70 / 80 / 90',
    package: 'BGA-153 UFS'
  },
  {
    code: 'YMN10TG1B1HC6C',
    aliases: ['YMN10TF1B1RC6C', 'YMN09TC1B1RC6C', 'YMN09TC1B1JC6C'],
    brand: 'YMTC (Yangtze Memory)',
    type: 'UFS 3.1 / 4.0',
    capacity: '512GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '10T',
    explanation: 'En YMTC, "YMN10T" o "YMN09TC" corresponde a 512GB (verificado en MIC).',
    commonModels: 'Huawei Mate 60 Pro 512GB, Pura 70 Pro 512GB, Honor Magic 5/6 Pro',
    package: 'BGA-153 UFS'
  },
  {
    code: 'YMN11TH1B1AC6C',
    aliases: ['YMN11TG1B1RC6C', 'YMN0ATF1B1JCAD'],
    brand: 'YMTC (Yangtze Memory)',
    type: 'UFS 4.0',
    capacity: '1TB',
    ram: 'Sin RAM integrada',
    ruleSegment: '11T',
    explanation: 'En YMTC, el código "YMN11T" o "YMN0AT" corresponde a 1TB (1024GB).',
    commonModels: 'Huawei Mate 60 Pro+ / RS 1TB, Pura 70 Ultra 1TB',
    package: 'BGA-153 UFS 4.0'
  },

  // ============================================================================
  // 13. BIWIN, RAYSON, SCY, PHISON, SILICON MOTION (SMI), SKYHIGH, DOSILICON, XINCUN
  // ============================================================================
  {
    code: 'BWEMMC04G-M1',
    aliases: ['BWEMMC04G-T1'],
    brand: 'BIWIN',
    type: 'eMMC 5.1',
    capacity: '4GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '04G',
    explanation: 'En memorias BIWIN, "04G" indica exactamente 4GB.',
    commonModels: 'Tablets económicas, TV Box, POS y celulares de entrada',
    package: 'BGA-153'
  },
  {
    code: 'BWEMMC08G-M1',
    aliases: ['BWEMMC08G-T1'],
    brand: 'BIWIN',
    type: 'eMMC 5.1',
    capacity: '8GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '08G',
    explanation: 'En memorias BIWIN, "08G" indica exactamente 8GB.',
    commonModels: 'Tablets económicas, TV Box y celulares de 8GB',
    package: 'BGA-153'
  },
  {
    code: 'BWEMMC16G-M2',
    aliases: ['BWEMMC16G-T1'],
    brand: 'BIWIN',
    type: 'eMMC 5.1',
    capacity: '16GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '16G',
    explanation: 'En memorias BIWIN, "16G" indica exactamente 16GB.',
    commonModels: 'Tablets y celulares de entrada de 16GB',
    package: 'BGA-153'
  },
  {
    code: 'BWCTL0211X32G',
    aliases: ['BWCTASC11P32G', 'BWEMMC32G-T1'],
    brand: 'BIWIN',
    type: 'eMMC 5.1',
    capacity: '32GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '32G',
    explanation: 'En BIWIN (serie BWCT / BWEMMC), la terminación "32G" indica directamente 32GB.',
    commonModels: 'Tablets Lenovo / TCL, celulares ZTE / Blu / Hisense de 32GB',
    package: 'BGA-153'
  },
  {
    code: 'BWCTARJ21X64G',
    aliases: ['BWEMMC64G-T1'],
    brand: 'BIWIN',
    type: 'eMMC 5.1 / UFS',
    capacity: '64GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '64G',
    explanation: 'En BIWIN, la terminación "64G" indica directamente 64GB.',
    commonModels: 'Celulares Hisense, Blu, Ulefone, Oukitel y tablets de 64GB',
    package: 'BGA-153'
  },
  {
    code: 'BWEMMC128G-T2',
    aliases: ['BWUFS128G-U3'],
    brand: 'BIWIN',
    type: 'eMMC 5.1 / UFS',
    capacity: '128GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '128G',
    explanation: 'En BIWIN, "128G" indica directamente 128GB.',
    commonModels: 'Celulares y tablets de 128GB con memoria BIWIN',
    package: 'BGA-153'
  },
  {
    code: 'BWUFS256G-U3',
    aliases: ['BWEMMC256G-T2'],
    brand: 'BIWIN',
    type: 'UFS 3.1 / eMMC 5.1',
    capacity: '256GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '256G',
    explanation: 'En BIWIN, "256G" indica directamente 256GB.',
    commonModels: 'Celulares y tablets de 256GB con memoria BIWIN',
    package: 'BGA-153'
  },
  {
    code: 'RS70B32G4S15G',
    aliases: ['RS70B32G'],
    brand: 'Rayson',
    type: 'eMMC 5.1 / eMCP',
    capacity: '32GB',
    ram: 'Sin RAM / 3GB LPDDR4X',
    ruleSegment: '32G',
    explanation: 'En memorias Rayson (serie RS70B), el bloque "32G" indica 32GB.',
    commonModels: 'Doogee, Blackview, Umidigi, Itel, Tecno de 32GB',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'RS70B64G4S16G',
    aliases: ['RS70B64G'],
    brand: 'Rayson',
    type: 'eMMC 5.1 / eMCP',
    capacity: '64GB',
    ram: 'Sin RAM / 4GB LPDDR4X',
    ruleSegment: '64G',
    explanation: 'En memorias Rayson (serie RS70B), el bloque "64G" indica 64GB.',
    commonModels: 'Doogee, Blackview, Umidigi, Itel, Tecno de 64GB',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'RS70B128G4S16G',
    aliases: ['RS70B128G'],
    brand: 'Rayson',
    type: 'eMMC 5.1 / uMCP / UFS',
    capacity: '128GB',
    ram: '4GB / 6GB LPDDR4X',
    ruleSegment: '128G',
    explanation: 'En memorias Rayson, el bloque "128G" indica 128GB.',
    commonModels: 'Doogee, Blackview, Umidigi, Tecno de 128GB',
    package: 'BGA-153 / BGA-254'
  },
  {
    code: 'SCY32G-M1',
    aliases: ['SCY32G', 'DSEMMC32G'],
    brand: 'SCY / Dosilicon',
    type: 'eMMC 5.1',
    capacity: '32GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '32G',
    explanation: 'En SCY y Dosilicon (DSEMMC), "32G" indica 32GB.',
    commonModels: 'Celulares Unisoc / MediaTek y tablets de 32GB',
    package: 'BGA-153'
  },
  {
    code: 'SCY64G-M1',
    aliases: ['SCY64G', 'XCE064G', 'FBNL064G'],
    brand: 'SCY / Dosilicon / Xincun',
    type: 'eMMC 5.1',
    capacity: '64GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '64G',
    explanation: 'En SCY, Xincun (XCE) y Spectek (FBNL), "64G" / "064G" indica 64GB.',
    commonModels: 'Celulares Unisoc / MediaTek de entrada, tablets y TV Box de 64GB',
    package: 'BGA-153'
  },
  {
    code: 'SCY128G-M1',
    aliases: ['SCY128G', 'XCE128G'],
    brand: 'SCY / Xincun',
    type: 'eMMC 5.1 / UFS',
    capacity: '128GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '128G',
    explanation: 'En SCY y Xincun, "128G" indica 128GB.',
    commonModels: 'Celulares y tablets de 128GB',
    package: 'BGA-153'
  },
  {
    code: 'PTE4A0TE-32GI',
    aliases: ['SM662GX-32G'],
    brand: 'Phison / Silicon Motion',
    type: 'eMMC 5.1 Industrial / Móvil',
    capacity: '32GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '32G',
    explanation: 'En Phison (PTE) y Silicon Motion (SM662), el sufijo "-32GI" o "-32G" indica 32GB.',
    commonModels: 'Terminales POS, sistemas automotrices, IoT y celulares rugerizados de 32GB',
    package: 'BGA-153'
  },
  {
    code: 'PTE7ADTO-64GI',
    aliases: ['SM662GX-64G'],
    brand: 'Phison / Silicon Motion',
    type: 'eMMC 5.1 Industrial / Móvil',
    capacity: '64GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '64G',
    explanation: 'En Phison (PTE) y Silicon Motion (SM662), el sufijo "-64GI" o "-64G" indica 64GB.',
    commonModels: 'Terminales POS, sistemas automotrices y celulares rugerizados de 64GB',
    package: 'BGA-153'
  },
  {
    code: 'S4041-4B1',
    aliases: ['PPE2A0SL-04GI'],
    brand: 'SkyHigh / Phison',
    type: 'eMMC 5.0',
    capacity: '4GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '4B1',
    explanation: 'En SkyHigh / Cypress ("-4B1") y Phison ("-04GI") indica 4GB.',
    commonModels: 'Módulos automotrices, telemetría y equipos industriales',
    package: 'BGA-153'
  },
  {
    code: 'S4041-8B1',
    aliases: ['PSE2A0SL-08GI'],
    brand: 'SkyHigh / Phison',
    type: 'eMMC 5.0',
    capacity: '8GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '8B1',
    explanation: 'En SkyHigh / Cypress ("-8B1") y Phison ("-08GI") indica 8GB.',
    commonModels: 'Módulos automotrices, telemetría y equipos industriales de 8GB',
    package: 'BGA-153'
  },
  {
    code: 'S4041-16B1',
    aliases: ['S4041-16B'],
    brand: 'SkyHigh / Cypress',
    type: 'eMMC 5.0',
    capacity: '16GB',
    ram: 'Sin RAM integrada',
    ruleSegment: '16B1',
    explanation: 'En SkyHigh / Cypress ("-16B1") indica 16GB.',
    commonModels: 'Módulos automotrices y equipos industriales de 16GB',
    package: 'BGA-153'
  }
];
