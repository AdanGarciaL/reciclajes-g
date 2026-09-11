/* =========================================================
   ECO LÓGICA García — sitio público
   Sin formularios, sin localStorage de datos personales.
   Los precios y la galería se cargan desde data/prices.json
   y data/gallery.json (editables desde el panel admin).
   ========================================================= */

// data/prices.json y data/gallery.json se editan desde el panel admin, así
// que su texto (notas, descripciones de fotos) se escapa antes de insertarse
// como HTML: evita que una nota o un "alt" con caracteres especiales rompa el
// render o, en el peor caso, inyecte HTML/script en el sitio público.
const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}
// esc() solo protege contra HTML/inyección de etiquetas, no contra un
// esquema peligroso (javascript:, data:, etc.) guardado como URL de una red
// social. Cualquier enlace admin-editable que se use como href pasa primero
// por aquí; si no es http(s), se ignora en vez de crear un enlace real.
function isSafeHttpUrl(url) {
  try {
    const u = new URL(String(url || "").trim(), window.location.href);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_e) {
    return false;
  }
}

// Número de respaldo (por si aún no cargan los datos de sucursales); en cuanto
// carga data/branches.json se reemplaza por el contacto marcado como "principal".
let WA_NUMBER = "522227548704";
function waLinkTo(number, message) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
function waLink(message) {
  return waLinkTo(WA_NUMBER, message);
}
function formatMexPhone(rawDigits) {
  let d = String(rawDigits || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("52")) d = d.slice(2);
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d;
}

/* Los 32 estados de la República: catálogo fijo (id, nombre y coordenadas
   aproximadas de su capital) que usan tanto el mapa de cobertura como el
   selector del panel admin. Cuáles están "activos" sí es editable desde el
   panel (data/coverage.json); este catálogo de geografía no cambia. */
const MEXICO_STATES = [
  { id: "aguascalientes", name: "Aguascalientes", lat: 21.8853, lng: -102.2916 },
  { id: "baja-california", name: "Baja California", lat: 32.6245, lng: -115.4523 },
  { id: "baja-california-sur", name: "Baja California Sur", lat: 24.1426, lng: -110.3128 },
  { id: "campeche", name: "Campeche", lat: 19.8301, lng: -90.5349 },
  { id: "chiapas", name: "Chiapas", lat: 16.7569, lng: -93.1292 },
  { id: "chihuahua", name: "Chihuahua", lat: 28.6353, lng: -106.0889 },
  { id: "cdmx", name: "Ciudad de México", lat: 19.4326, lng: -99.1332 },
  { id: "coahuila", name: "Coahuila", lat: 25.4260, lng: -101.0053 },
  { id: "colima", name: "Colima", lat: 19.2452, lng: -103.7241 },
  { id: "durango", name: "Durango", lat: 24.0277, lng: -104.6532 },
  { id: "guanajuato", name: "Guanajuato", lat: 21.0190, lng: -101.2574 },
  { id: "guerrero", name: "Guerrero", lat: 17.5515, lng: -99.5058 },
  { id: "hidalgo", name: "Hidalgo", lat: 20.1011, lng: -98.7591 },
  { id: "jalisco", name: "Jalisco", lat: 20.6597, lng: -103.3496 },
  { id: "mexico", name: "Estado de México", lat: 19.2826, lng: -99.6557 },
  { id: "michoacan", name: "Michoacán", lat: 19.7008, lng: -101.1844 },
  { id: "morelos", name: "Morelos", lat: 18.9242, lng: -99.2216 },
  { id: "nayarit", name: "Nayarit", lat: 21.5041, lng: -104.8946 },
  { id: "nuevo-leon", name: "Nuevo León", lat: 25.6866, lng: -100.3161 },
  { id: "oaxaca", name: "Oaxaca", lat: 17.0732, lng: -96.7266 },
  { id: "puebla", name: "Puebla", lat: 19.0414, lng: -98.2063 },
  { id: "queretaro", name: "Querétaro", lat: 20.5888, lng: -100.3899 },
  { id: "quintana-roo", name: "Quintana Roo", lat: 18.5036, lng: -88.3055 },
  { id: "san-luis-potosi", name: "San Luis Potosí", lat: 22.1565, lng: -100.9855 },
  { id: "sinaloa", name: "Sinaloa", lat: 24.8091, lng: -107.4022 },
  { id: "sonora", name: "Sonora", lat: 29.0729, lng: -110.9559 },
  { id: "tabasco", name: "Tabasco", lat: 17.9892, lng: -92.9475 },
  { id: "tamaulipas", name: "Tamaulipas", lat: 23.7369, lng: -99.1411 },
  { id: "tlaxcala", name: "Tlaxcala", lat: 19.3139, lng: -98.2404 },
  { id: "veracruz", name: "Veracruz", lat: 19.1738, lng: -96.1342 },
  { id: "yucatan", name: "Yucatán", lat: 20.9674, lng: -89.5926 },
  { id: "zacatecas", name: "Zacatecas", lat: 22.7709, lng: -102.5832 },
];
const TOTAL_MEXICO_STATES = MEXICO_STATES.length;

/* ---------- Datos de respaldo (por si falla el fetch, ej. file://) ---------- */
const FALLBACK_PRICES = {
  materials: [
    { id: "celular", name: "Lógica de celular", icon: "bi-phone", modalIcon: "📱", group: "celular", min: 100, max: 1300, unit: "/kg", note: "El Tipo 1 alcanza el precio máximo del catálogo.", quick: true, quickCopy: "Rango completo según tipo, estado y material. El Tipo 1 alcanza el precio máximo.", showInSelector: true, directContact: false },
    { id: "teclado", name: "Celular de teclado", icon: "bi-keyboard", modalIcon: "⌨️", group: "celular", min: 100, max: 150, unit: "/kg", note: "Placas de teléfonos antiguos con teclado mecánico.", quick: false, quickCopy: "", showInSelector: true, directContact: false },
    { id: "tablet", name: "Lógica de tablet", icon: "bi-tablet-landscape", modalIcon: "📲", group: "otros", min: 100, max: 150, unit: "/kg", note: "Placas de iPad, Samsung, Lenovo y similares.", quick: false, quickCopy: "", showInSelector: true, directContact: false },
    { id: "ram", name: "Memorias RAM", icon: "bi-memory", modalIcon: "🖬", group: "otros", min: 300, max: 450, unit: "/kg", note: "DDR a DDR5, cualquier capacidad, funcionales o defectuosas.", quick: true, quickCopy: "Aceptamos módulos de varias generaciones y capacidades.", showInSelector: true, directContact: false },
    { id: "laptop", name: "Lógica de laptop", icon: "bi-laptop", modalIcon: "💻", group: "otros", min: 90, max: 150, unit: "/kg", note: "Motherboards de laptop y netbook, cualquier marca.", quick: true, quickCopy: "Placas de laptop en diferentes condiciones y modelos.", showInSelector: true, directContact: false },
    { id: "sinpila", name: "Sin pila ni tapa", icon: "bi-battery", modalIcon: "🔋", group: "celular", min: 70, max: 100, unit: "/kg", note: "Celulares completos sin desmontar, sin batería.", quick: false, quickCopy: "", showInSelector: false, directContact: false }
  ],
  celularTypes: [
    { id: "tipo1", priceId: "celular", label: "Tipo 1", shortLabel: "Tipo 1 · Premium", min: 900, max: 1300, specs: ["Sin flex ni tiras", "Sin cámaras", "Debe tener su chip", "Celulares de gama media a alta", "Condición variable aceptable mientras el chip esté presente"], galleryCategory: "celular-tipo-1" },
    { id: "tipo2", priceId: "celular", label: "Tipo 2", shortLabel: "Tipo 2 · Placas grandes", min: 220, max: 350, specs: ["Placas grandes que cubren el celular", "Si no entra en Tipo 1 pasa a Tipo 2: sin chip integrado o roto", "Pueden estar quemadas o ensambladas", "Cualquier marca o modelo", "Celulares antiguos o de gama baja"], galleryCategory: "celular-tipo-2" },
    { id: "tipo3", priceId: "celular", label: "Tipo 3", shortLabel: "Tipo 3 · Teclado y tablet", min: 100, max: 150, specs: ["Placas de teléfonos con teclado", "Placas de tablet", "Ambas categorías tienen el mismo precio", "Cualquier marca o modelo", "Condición variable aceptable"], galleryCategory: "celular-tipo-3" },
    { id: "tipo4", priceId: "sinpila", label: "Sin pila/tapa", shortLabel: "Sin pila ni tapa", min: 70, max: 100, specs: ["Celulares completos sin desmontar", "Sin pila: se debe retirar la batería", "Sin tapa: se puede dejar como venga", "Para clientes sin tiempo de desarmado", "Ideal para lotes grandes y descarte"], galleryCategory: "sin-pila-tapa" }
  ],
  otherMaterials: [
    { id: "laptop", priceId: "laptop", eyebrow: "Lógica de laptop", title: "Motherboards y placas de laptop", specs: ["Placas madre de laptops y netbooks", "Cualquier condición, funcionales o dañadas", "Cualquier marca (Dell, HP, Lenovo, etc.)", "Con o sin procesador integrado", "Ideal para reciclaje"], galleryCategory: "laptop" },
    { id: "ram", priceId: "ram", eyebrow: "Memorias RAM", title: "Módulos de memoria RAM DDR / DDR2 / DDR3 / DDR4", specs: ["Memorias RAM de cualquier generación", "DDR, DDR2, DDR3, DDR4, DDR5", "Cualquier capacidad (256 MB a 32 GB+)", "Funcionales o defectuosas aceptadas", "Alto valor por peso, excelente para reciclar"], galleryCategory: "ram" },
    { id: "teclado", priceId: "teclado", eyebrow: "Teléfonos con teclado", title: "Lógicas de teléfonos con teclado mecánico", specs: ["Placas de teléfonos antiguos con teclado", "BlackBerry, HTC y otros modelos", "Cualquier estado, rotos o funcionales", "Demanda consistente en reciclaje"], galleryCategory: "celular-tipo-3" },
    { id: "tablet", priceId: "tablet", eyebrow: "Placas de tablet", title: "Motherboards y lógicas de tablets", specs: ["Placas de tablets iPad, Samsung, Lenovo, etc.", "Cualquier tamaño, de 7\" a 12\"", "Funcionales o para descarte", "Condición variable aceptable mientras el chip esté presente", "Aceptamos grandes volúmenes"], galleryCategory: "celular-tipo-3" }
  ]
};

const FALLBACK_GALLERY = {
  categories: [
    { id: "celular-tipo-1", label: "Celular Tipo 1", images: [{ src: "Galeria/Celular Tipo 1/logica_celular12.jpg", alt: "Lógica de celular Tipo 1" }] },
    { id: "celular-tipo-2", label: "Celular Tipo 2", images: [{ src: "Galeria/Celular Tipo 2/logica_celular2.jpg", alt: "Lógica de celular Tipo 2" }] },
    { id: "celular-tipo-3", label: "Celular y Tablet Tipo 3", images: [{ src: "Galeria/Celular y Tablet Tipo 3/logica_celular31.jpg", alt: "Lógica de celular Tipo 3" }] },
    { id: "sin-pila-tapa", label: "Sin pila y tapa Tipo 4", images: [{ src: "Galeria/Sin Pila y Tapa Tipo 4/sin_pila_y_tapa.jpg", alt: "Celular sin pila ni tapa" }] },
    { id: "laptop", label: "Laptop", images: [{ src: "Galeria/Laptop/Laptop.jpg", alt: "Lógica de laptop" }] },
    { id: "ram", label: "RAM", images: [{ src: "Galeria/RAM/RAM.jpg", alt: "Módulos de memoria RAM" }] },
    { id: "operacion", label: "Galería general", images: [
      { src: "Galeria/logica_celular.jpg", alt: "Lógicas de celular para reciclaje" },
      { src: "Galeria/logica_lapcpu.jpg", alt: "Lógicas de laptop y CPU para reciclaje" },
      { src: "Galeria/logica_ram.jpg", alt: "Módulos RAM y componentes electrónicos" }
    ] }
  ]
};

const FAQ_DATA = [
  { q: "¿Por qué el precio es más bajo que una pieza funcional?", a: "El material se compra para destrucción y desguace, no para reventa como refacción. El valor está en los metales y componentes que se recuperan, por eso el precio va por kilo y no por pieza." },
  { q: "¿El sitio guarda mis datos?", a: "No. Esta página solo informa precios, tipos de material y contactos. No hay formularios ni registros: toda la atención es por WhatsApp o directamente en sucursal." },
  { q: "¿Cómo sé en qué tipo entra mi lógica?", a: "Revisa la sección de tipos: el Tipo 1 requiere chip presente, sin flex, tiras ni cámaras. Si no cumple, baja a Tipo 2. Las placas de teclado y tablet son Tipo 3. Si tienes duda, manda fotos al WhatsApp de tu plaza." },
  { q: "Estoy en un estado sin cobertura activa, ¿me pueden comprar?", a: "Sí. En cualquier estado de la República consideramos la recolección si el lote es de 10 kg o más. En Puebla además hacemos recolección a domicilio sin ese mínimo." },
  { q: "¿El precio que aparece en el sitio es final?", a: "No. Son rangos referenciales. El precio se confirma después de revisar el lote, según el tipo de material, los kilos y el estado físico." },
  { q: "¿Cómo se hace el pago?", a: "Se define antes de cerrar el trato, junto con la forma de entrega o envío. Nunca movemos material sin que las condiciones estén acordadas." }
];

const FALLBACK_BRANCHES = {
  branches: [
    { id: "puebla-domicilio", kind: "directo", estado: "puebla", nombre: "José G.", cobertura: "En todo el estado de Puebla", ubicacion: "", local: "", whatsapp: "522227548704", primary: true, activo: true },
    { id: "aguascalientes", kind: "sucursal", estado: "aguascalientes", nombre: "Mari G.", cobertura: "", ubicacion: "Plaza de la Tecnología", local: "Local 83", whatsapp: "522213815164", primary: false, activo: true },
    { id: "coatzacoalcos", kind: "directo", estado: "veracruz", nombre: "Adán G.", cobertura: "Coatzacoalcos y alrededores", ubicacion: "", local: "", whatsapp: "522214102306", primary: false, activo: true },
    { id: "guanajuato", kind: "directo", estado: "guanajuato", nombre: "Luis G.", cobertura: "Guanajuato y alrededores", ubicacion: "", local: "", whatsapp: "522222932290", primary: false, activo: true },
    { id: "acapulco", kind: "sucursal", estado: "guerrero", nombre: "", cobertura: "", ubicacion: "Plaza de la Tecnología", local: "", whatsapp: "", primary: false, activo: false }
  ]
};

const FALLBACK_TEAM = {
  members: [
    { id: "ceo", role: "Director General", name: "", photo: "", whatsapp: "", email: "", social: [] },
    { id: "dev", role: "Desarrollador web", name: "", photo: "", whatsapp: "", email: "", social: [] }
  ]
};

const FALLBACK_COVERAGE = { activeStateIds: ["puebla", "cdmx", "mexico", "veracruz", "hidalgo"] };

const FALLBACK_SOCIAL = {
  links: [
    { id: "facebook", network: "facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=100063747836703" }
  ]
};

function formatPrice(min, max, unit = "/kg") {
  const fmt = (n) => `$${Number(n).toLocaleString("es-MX")}`;
  return `${fmt(min)} – ${fmt(max)} ${unit}`;
}

/* ---------- Estado cargado ---------- */
let PRICES = null;
let GALLERY = null;
let TEAM = null;
let COVERAGE = null;
let BRANCHES = null;
let SOCIAL = null;

async function fetchJson(path, fallback) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    return res.ok ? await res.json() : fallback;
  } catch (_err) {
    return fallback;
  }
}

async function loadData() {
  [PRICES, GALLERY, TEAM, COVERAGE, BRANCHES, SOCIAL] = await Promise.all([
    fetchJson("data/prices.json", FALLBACK_PRICES),
    fetchJson("data/gallery.json", FALLBACK_GALLERY),
    fetchJson("data/team.json", FALLBACK_TEAM),
    fetchJson("data/coverage.json", FALLBACK_COVERAGE),
    fetchJson("data/branches.json", FALLBACK_BRANCHES),
    fetchJson("data/social.json", FALLBACK_SOCIAL),
  ]);
  // El número de WhatsApp que usan los botones generales del sitio es el
  // contacto marcado como "principal" en Sucursales y contacto (panel admin),
  // no un valor fijo en el código.
  const primary = BRANCHES.branches.find((b) => b.primary && b.whatsapp) || BRANCHES.branches.find((b) => b.whatsapp);
  if (primary) WA_NUMBER = primary.whatsapp;
  renderEverything();
}

function getActiveStates() {
  const ids = (COVERAGE && COVERAGE.activeStateIds) || [];
  return ids.map((id) => MEXICO_STATES.find((s) => s.id === id)).filter(Boolean);
}
function getStateName(id) {
  return MEXICO_STATES.find((s) => s.id === id)?.name || null;
}

function getMaterial(id) {
  return PRICES.materials.find((m) => m.id === id) || null;
}
function getGalleryImages(categoryId) {
  const cat = (GALLERY.categories || []).find((c) => c.id === categoryId);
  return cat ? cat.images : [];
}
/* Los materiales de la lista de precios no traen su propia categoría de
   galería (solo los tipos de celular y "otros materiales" la tienen), así
   que la buscamos por su priceId: así una foto real aparece desde la
   tarjeta de precio, sin tener que entrar al detalle para verla. */
function materialGalleryCategory(materialId) {
  const type = PRICES.celularTypes.find((t) => t.priceId === materialId);
  if (type) return type.galleryCategory;
  const other = PRICES.otherMaterials.find((o) => o.priceId === materialId);
  return other ? other.galleryCategory : null;
}
function materialPhoto(materialId) {
  const category = materialGalleryCategory(materialId);
  const images = category ? getGalleryImages(category) : [];
  return images[0] || null;
}

/* ---------- Render: precios rápidos + tabla ---------- */
function renderPrices() {
  const quickGrid = document.getElementById("quickPricesGrid");
  const table = document.getElementById("priceTable");
  if (!quickGrid || !table) return;

  const quickItems = PRICES.materials.filter((m) => m.quick);
  quickGrid.innerHTML = quickItems.map((m, i) => {
    const photo = materialPhoto(m.id);
    const isFeatured = m.id === "celular";
    return `
    <article class="price-card ${isFeatured ? "price-card-featured" : ""} reveal ${i ? "delay-" + Math.min(i, 3) : ""} show">
      ${isFeatured ? `<div class="featured-price-badge"><i class="bi bi-star-fill"></i> MEJOR PAGADO</div>` : ""}
      ${photo
        ? `<div class="price-card-photo"><img src="${esc(photo.src)}" alt="${esc(photo.alt || m.name)}" loading="lazy" /></div>`
        : ""}
      <span class="price-icon"><i class="bi ${esc(m.icon)}"></i></span>
      <p class="price-tag">${esc(m.name)}</p>
      <p class="price-value">${formatPrice(m.min, m.max, m.unit)}</p>
      <p class="price-copy">${esc(m.quickCopy || m.note || "")}</p>
      <button class="btn ${isFeatured ? "btn-primary" : "btn-ghost"} open-selector" data-preselect="${esc(m.id)}">${m.directContact ? "Preguntar por WhatsApp" : "Ver detalle"}</button>
    </article>`;
  }).join("");

  table.innerHTML = PRICES.materials.map((m) => `
    <div class="price-row">
      <div class="row-name">
        <span class="row-icon"><i class="bi ${esc(m.icon)}"></i></span>
        <span class="row-title">${esc(m.name)}</span>
      </div>
      <p class="row-note">${esc(m.note || "")}</p>
      <p class="row-price">${formatPrice(m.min, m.max, m.unit)}</p>
    </div>
  `).join("") + `
    <div class="price-table-foot">
      <p>El material se compra para destrucción y desguace, por eso el precio es menor que una pieza funcional de reventa.</p>
      <a href="${waLink("Hola, quiero preguntar por el precio de mi lote")}" target="_blank" rel="noopener">Preguntar por mi lote →</a>
    </div>
  `;

  const tipo1 = PRICES.celularTypes.find((t) => t.id === "tipo1");
  const heroBest = document.getElementById("heroBestPrice");
  if (heroBest && tipo1) heroBest.textContent = formatPrice(tipo1.min, tipo1.max);
  const heroStatMaterials = document.getElementById("heroStatMaterials");
  if (heroStatMaterials) heroStatMaterials.textContent = PRICES.materials.length;

  quickGrid.querySelectorAll(".open-selector").forEach((btn) => {
    btn.addEventListener("click", () => {
      showSelector();
      const preselect = btn.dataset.preselect;
      if (preselect) selectMaterial(preselect);
    });
  });
}

/* ---------- Render: Calculadora de Ganancias (Cotizador Express) ---------- */
let CALC_STATE = {
  materialId: "tipo1",
  weight: 3, // kilos enteros
  grams: 0, // gramos adicionales (0-999), para un peso más realista que solo kilos redondos
  initialized: false
};
// "3 kg" o, si hay gramos, "3 kg 500 g" (o solo "500 g" si los kilos están
// en cero) — se usa tanto en el texto del resultado como en el mensaje de
// WhatsApp, para que ambos digan lo mismo que el admin realmente puso.
function formatCalcWeight(kg, g) {
  if (g > 0 && kg > 0) return `${kg} kg ${g} g`;
  if (g > 0) return `${g} g`;
  return `${kg} kg`;
}

function getCalculatorItems() {
  const items = [];
  if (PRICES && PRICES.celularTypes) {
    PRICES.celularTypes.forEach((t) => {
      items.push({
        id: t.id,
        name: t.label || t.shortLabel,
        min: Number(t.min) || 0,
        max: Number(t.max) || 0,
        icon: t.id === "tipo4" ? "🔋" : "📱"
      });
    });
  }
  if (PRICES && PRICES.materials) {
    const extraIds = ["ram", "laptop", "teclado"];
    extraIds.forEach((id) => {
      const mat = PRICES.materials.find((m) => m.id === id);
      if (mat && !items.some((it) => it.id === id)) {
        items.push({
          id: mat.id,
          name: mat.name,
          min: Number(mat.min) || 0,
          max: Number(mat.max) || 0,
          icon: mat.modalIcon || "🔧"
        });
      }
    });
  }
  return items;
}

function renderCalculator() {
  const chipsContainer = document.getElementById("calcMaterialChips");
  const selectEl = document.getElementById("calcMaterialSelect");
  const weightInput = document.getElementById("calcWeightInput");
  const gramsInput = document.getElementById("calcGramsInput");
  const weightRange = document.getElementById("calcWeightRange");
  const minusBtn = document.getElementById("calcMinusBtn");
  const plusBtn = document.getElementById("calcPlusBtn");
  const pillsContainer = document.getElementById("calcQuickPills");
  if (!chipsContainer || !selectEl || !weightInput) return;

  const items = getCalculatorItems();
  if (!items.length) return;

  if (!items.some((it) => it.id === CALC_STATE.materialId)) {
    CALC_STATE.materialId = items[0].id;
  }

  // Render chips
  chipsContainer.innerHTML = items.map((it) => {
    const isActive = it.id === CALC_STATE.materialId;
    const rate = formatPrice(it.min, it.max);
    return `
      <button type="button" class="calc-chip-btn ${isActive ? "is-active" : ""}" data-calc-id="${esc(it.id)}" role="radio" aria-checked="${isActive}">
        <span class="calc-chip-icon">${it.icon}</span>
        <span class="calc-chip-title">${esc(it.name)}</span>
        <span class="calc-chip-rate">${rate}</span>
      </button>
    `;
  }).join("");

  // Render select options
  selectEl.innerHTML = items.map((it) => `
    <option value="${esc(it.id)}" ${it.id === CALC_STATE.materialId ? "selected" : ""}>
      ${esc(it.name)} (${formatPrice(it.min, it.max)})
    </option>
  `).join("");

  // Nunca deja el lote en "0 kg 0 g": si alguien borra ambos campos, vuelve
  // a poner un mínimo razonable en gramos en vez de mostrar una cotización
  // de $0, que se leería como un error.
  function ensureMinimumWeight() {
    if (CALC_STATE.weight === 0 && CALC_STATE.grams === 0) {
      CALC_STATE.grams = 100;
      if (gramsInput) gramsInput.value = 100;
    }
  }

  function updateCalculation() {
    const item = items.find((it) => it.id === CALC_STATE.materialId) || items[0];
    const kg = CALC_STATE.weight;
    const g = CALC_STATE.grams;
    const totalKg = kg + g / 1000;
    const fmt = (n) => `$${Number(n).toLocaleString("es-MX")}`;

    const totalMin = Math.round(item.min * totalKg);
    const totalMax = Math.round(item.max * totalKg);
    const weightLabel = formatCalcWeight(kg, g);

    const titleEl = document.getElementById("calcResultTitle");
    const amountEl = document.getElementById("calcResultAmount");
    const formulaEl = document.getElementById("calcResultFormula");
    const waBtn = document.getElementById("calcWaBtn");

    if (titleEl) titleEl.textContent = item.name;
    if (amountEl) amountEl.textContent = `${fmt(totalMin)} – ${fmt(totalMax)}`;
    if (formulaEl) formulaEl.textContent = `Calculado para ${weightLabel} × (${fmt(item.min)} – ${fmt(item.max)} /kg)`;

    if (waBtn) {
      const msg = `Hola Ecológica García, coticé en su página web un lote de ${weightLabel} de ${item.name} con un estimado de ${fmt(totalMin)} a ${fmt(totalMax)} MXN. ¿Me podrían dar informes para entrega o recolección?`;
      waBtn.href = waLink(msg);
    }

    // Update active quick pill (solo coincide si los gramos están en cero:
    // los accesos rápidos son valores redondos de kilos exactos)
    if (pillsContainer) {
      pillsContainer.querySelectorAll(".quick-pill").forEach((pill) => {
        const pillKg = Number(pill.dataset.kg);
        pill.classList.toggle("is-active", pillKg === kg && g === 0);
      });
    }
  }

  // Bind events once
  if (!CALC_STATE.initialized) {
    CALC_STATE.initialized = true;

    // Weight range slider
    if (weightRange) {
      weightRange.addEventListener("input", (e) => {
        CALC_STATE.weight = Math.max(1, parseInt(e.target.value, 10) || 1);
        weightInput.value = CALC_STATE.weight;
        updateCalculation();
      });
    }

    // Weight number input (kilos enteros; puede llegar a 0 porque ahora el
    // campo de gramos puede cargar el peso de un lote chico por sí solo)
    weightInput.addEventListener("input", (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      if (val > 1000) val = 1000;
      CALC_STATE.weight = val;
      if (weightRange && val <= 50) weightRange.value = Math.max(1, val);
      ensureMinimumWeight();
      updateCalculation();
    });

    // Gramos adicionales, para un peso más realista que solo kilos redondos
    if (gramsInput) {
      gramsInput.addEventListener("input", (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 0) val = 0;
        // Si se pasa de 999 g, se convierte lo que sobre a kilos completos
        // (escribir 1500 g se vuelve 1 kg 500 g), para no dejar un estado
        // raro como "2 kg 1300 g".
        if (val >= 1000) {
          const extraKg = Math.floor(val / 1000);
          CALC_STATE.weight = Math.min(1000, CALC_STATE.weight + extraKg);
          val = val % 1000;
          weightInput.value = CALC_STATE.weight;
          if (weightRange && CALC_STATE.weight <= 50) weightRange.value = CALC_STATE.weight;
        }
        CALC_STATE.grams = val;
        gramsInput.value = val;
        ensureMinimumWeight();
        updateCalculation();
      });
    }

    // Plus and Minus buttons (solo tocan los kilos enteros; los gramos que
    // ya se hayan puesto se quedan igual)
    if (minusBtn) {
      minusBtn.addEventListener("click", () => {
        if (CALC_STATE.weight > 0) {
          CALC_STATE.weight -= 1;
          weightInput.value = CALC_STATE.weight;
          if (weightRange && CALC_STATE.weight <= 50) weightRange.value = Math.max(1, CALC_STATE.weight);
          ensureMinimumWeight();
          updateCalculation();
        }
      });
    }
    if (plusBtn) {
      plusBtn.addEventListener("click", () => {
        if (CALC_STATE.weight < 1000) {
          CALC_STATE.weight += 1;
          weightInput.value = CALC_STATE.weight;
          if (weightRange && CALC_STATE.weight <= 50) weightRange.value = CALC_STATE.weight;
          updateCalculation();
        }
      });
    }

    // Quick pills: valores redondos exactos, por eso ponen los gramos en 0
    if (pillsContainer) {
      pillsContainer.addEventListener("click", (e) => {
        const pill = e.target.closest(".quick-pill");
        if (!pill) return;
        const val = Number(pill.dataset.kg);
        if (val) {
          CALC_STATE.weight = val;
          CALC_STATE.grams = 0;
          weightInput.value = val;
          if (gramsInput) gramsInput.value = 0;
          if (weightRange) weightRange.value = Math.min(val, 50);
          updateCalculation();
        }
      });
    }

    // Select dropdown
    selectEl.addEventListener("change", (e) => {
      CALC_STATE.materialId = e.target.value;
      chipsContainer.querySelectorAll(".calc-chip-btn").forEach((chip) => {
        chip.classList.toggle("is-active", chip.dataset.calcId === CALC_STATE.materialId);
      });
      updateCalculation();
    });
  }

  // Event delegation on chips
  chipsContainer.onclick = (e) => {
    const chip = e.target.closest(".calc-chip-btn");
    if (!chip) return;
    CALC_STATE.materialId = chip.dataset.calcId;
    chipsContainer.querySelectorAll(".calc-chip-btn").forEach((c) => {
      const active = c.dataset.calcId === CALC_STATE.materialId;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-checked", active ? "true" : "false");
    });
    if (selectEl) selectEl.value = CALC_STATE.materialId;
    updateCalculation();
  };

  updateCalculation();
}

/* ---------- Render: selector de material ----------
   Los botones salen directo de PRICES.materials (lo que edita el panel
   admin): un material nuevo aparece aquí solo, sin tocar código. "Otra
   cosa" es el único botón fijo, para lo que de plano no está en el
   catálogo. */
function renderSelector() {
  const grid = document.getElementById("selectorGrid");
  if (!grid) return;
  const items = PRICES.materials.filter((m) => m.showInSelector !== false);
  grid.innerHTML = items.map((m) => {
    const photo = materialPhoto(m.id);
    return `
      <button class="selector-btn" type="button" data-material="${esc(m.id)}" data-group="${esc(m.group)}">
        ${photo
          ? `<span class="sel-photo"><img src="${esc(photo.src)}" alt="" loading="lazy" /></span>`
          : `<span class="sel-icon">${esc(m.modalIcon || "🔧")}</span>`}
        <span class="sel-name">${esc(m.name)}</span>
        <span class="sel-price">${formatPrice(m.min, m.max, m.unit)}</span>
      </button>`;
  }).join("") + `
      <button class="selector-btn" type="button" data-material="otro" data-group="otros">
        <span class="sel-icon">⚙️</span>
        <span class="sel-name">Otra cosa</span>
      </button>`;

  grid.querySelectorAll(".selector-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectMaterial(btn.dataset.material));
  });
}

/* ---------- Modal selector open/close ---------- */
const selectorModal = document.getElementById("selectorModal");
const selectorOverlay = document.getElementById("selectorOverlay");
const selectorClose = document.getElementById("selectorClose");

function showSelector() {
  if (!selectorModal) return;
  selectorModal.classList.add("active");
  selectorModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  applySelectorMode("all");
}
function hideSelector() {
  if (!selectorModal) return;
  selectorModal.classList.remove("active");
  selectorModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
selectorOverlay && selectorOverlay.addEventListener("click", hideSelector);
selectorClose && selectorClose.addEventListener("click", hideSelector);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && selectorModal?.classList.contains("active")) hideSelector();
});
document.querySelectorAll(".open-material-selector, [data-open-selector]").forEach((btn) => {
  btn.addEventListener("click", (e) => { e.preventDefault(); showSelector(); });
});

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => applySelectorMode(btn.dataset.mode));
});
function applySelectorMode(mode) {
  document.querySelectorAll(".mode-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
  document.querySelectorAll(".selector-btn").forEach((b) => {
    const show = mode === "all" || b.dataset.group === mode;
    b.classList.toggle("is-hidden", !show);
  });
}

/* ---------- Detalle de material (unifica tipos de celular + otros materiales) ---------- */
const materialDetail = document.getElementById("materialDetail");
let carouselImages = [];
let carouselIndex = 0;
let carouselTimer = null;

function selectMaterial(materialId) {
  if (materialId === "otro") {
    window.open(waLink("Hola, tengo material electrónico que no aparece en el catálogo, ¿me pueden cotizar?"), "_blank", "noopener");
    hideSelector();
    return;
  }
  const material = getMaterial(materialId);
  hideSelector();
  // Un material marcado como "sin ficha propia" (por ejemplo, uno recién
  // agregado desde el panel, sin tipos ni fotos todavía) manda directo a
  // WhatsApp en vez de abrir un detalle que no tendría nada que mostrar.
  if (material && material.directContact) {
    window.open(waLink(`Hola, tengo ${material.name.toLowerCase()} para vender, ¿me pueden cotizar?`), "_blank", "noopener");
    return;
  }
  if (materialId === "celular") {
    showCelularTypes("tipo1");
  } else {
    showOtherMaterial(materialId);
  }
  materialDetail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showCelularTypes(typeId) {
  const tabsWrap = document.getElementById("detailTabs");
  const type = PRICES.celularTypes.find((t) => t.id === typeId) || PRICES.celularTypes[0];

  document.getElementById("detailEyebrow").textContent = "Lógica de celular";
  document.getElementById("detailTitle").textContent = "Tipos y precios según características";

  tabsWrap.hidden = false;
  tabsWrap.innerHTML = PRICES.celularTypes.map((t) => `
    <button type="button" class="type-tab ${t.id === type.id ? "is-active" : ""}" data-type="${esc(t.id)}">
      <span class="tab-label">${esc(t.label)}</span>
      <span class="tab-price">${formatPrice(t.min, t.max)}</span>
    </button>
  `).join("");
  tabsWrap.querySelectorAll(".type-tab").forEach((tab) => {
    tab.addEventListener("click", () => showCelularTypes(tab.dataset.type));
  });

  document.getElementById("detailInfoEyebrow").textContent = type.shortLabel;
  document.getElementById("detailCaption").textContent = `Referencia · ${type.label}`;
  document.getElementById("detailPrice").textContent = formatPrice(type.min, type.max);
  document.getElementById("detailSpecs").innerHTML = type.specs.map((s) => `<li><i class="bi bi-check2"></i><span>${esc(s)}</span></li>`).join("");
  document.getElementById("detailWaLink").href = waLink(`Hola, tengo lógica de celular (${type.shortLabel}) para vender.`);

  setCarousel(getGalleryImages(type.galleryCategory));
  materialDetail.classList.add("active");
}

function showOtherMaterial(materialId) {
  const data = PRICES.otherMaterials.find((o) => o.id === materialId);
  const price = getMaterial(data ? data.priceId : materialId);
  if (!data || !price) return;

  document.getElementById("detailTabs").hidden = true;
  document.getElementById("detailTabs").innerHTML = "";

  document.getElementById("detailEyebrow").textContent = data.eyebrow;
  document.getElementById("detailTitle").textContent = data.title;
  document.getElementById("detailInfoEyebrow").textContent = "Consideraciones importantes";
  document.getElementById("detailCaption").textContent = `Referencia · ${data.eyebrow}`;
  document.getElementById("detailPrice").textContent = formatPrice(price.min, price.max, price.unit);
  document.getElementById("detailSpecs").innerHTML = data.specs.map((s) => `<li><i class="bi bi-check2"></i><span>${esc(s)}</span></li>`).join("");
  document.getElementById("detailWaLink").href = waLink(`Hola, tengo ${data.eyebrow.toLowerCase()} para vender.`);

  setCarousel(getGalleryImages(data.galleryCategory));
  materialDetail.classList.add("active");
}

function setCarousel(images) {
  carouselImages = images && images.length ? images : [{ src: "Galeria/logica_celular.jpg", alt: "Referencia" }];
  carouselIndex = 0;
  const track = document.getElementById("carouselTrack");
  const dots = document.getElementById("carouselDots");
  track.innerHTML = carouselImages.map((img) => `<img src="${esc(img.src)}" alt="${esc(img.alt || "")}" loading="lazy" />`).join("");
  dots.innerHTML = carouselImages.map((_, i) => `<button class="carousel-dot ${i === 0 ? "is-active" : ""}" data-index="${i}" aria-label="Imagen ${i + 1}"></button>`).join("");
  dots.querySelectorAll(".carousel-dot").forEach((dot) => dot.addEventListener("click", () => goToSlide(Number(dot.dataset.index))));
  updateCarouselPosition();
  resetCarouselAutoplay();
}

function updateCarouselPosition() {
  const track = document.getElementById("carouselTrack");
  if (!track) return;
  track.style.transform = `translateX(-${carouselIndex * 100}%)`;
  document.querySelectorAll(".carousel-dot").forEach((dot, i) => dot.classList.toggle("is-active", i === carouselIndex));
}
function goToSlide(index) {
  carouselIndex = (index + carouselImages.length) % carouselImages.length;
  updateCarouselPosition();
  resetCarouselAutoplay();
}
function resetCarouselAutoplay() {
  if (carouselTimer) clearInterval(carouselTimer);
  if (carouselImages.length < 2) return;
  carouselTimer = setInterval(() => goToSlide(carouselIndex + 1), 5000);
}

document.getElementById("carouselPrev")?.addEventListener("click", () => goToSlide(carouselIndex - 1));
document.getElementById("carouselNext")?.addEventListener("click", () => goToSlide(carouselIndex + 1));
const carouselViewport = document.getElementById("carouselViewport");
if (carouselViewport) {
  carouselViewport.addEventListener("mouseenter", () => carouselTimer && clearInterval(carouselTimer));
  carouselViewport.addEventListener("mouseleave", resetCarouselAutoplay);
  let touchStartX = 0;
  carouselViewport.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carouselViewport.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goToSlide(carouselIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

function closeDetail() {
  materialDetail.classList.remove("active");
  if (carouselTimer) clearInterval(carouselTimer);
}
// Ni el enlace de arriba ("← Elegir otro material") ni el botón de abajo
// reabren ya el selector: para un admin/visitante que ya está viendo un
// detalle, esa ventana emergente resultaba un paso extra sin valor. Arriba
// simplemente se cierra el detalle (vuelve a la sección de precios); abajo
// es un enlace directo de WhatsApp (.js-wa-link, ver applyWaLinks) con un
// mensaje genérico para quien tiene un material que no coincide con lo que
// está viendo.
document.getElementById("detailBack")?.addEventListener("click", () => { closeDetail(); });

/* ---------- Galería general ---------- */
function renderGalleryGeneral() {
  const grid = document.getElementById("galleryGeneral");
  if (!grid) return;
  const images = getGalleryImages("operacion");
  grid.innerHTML = images.map((img, i) => `
    <article class="gallery-card reveal ${i ? "delay-" + Math.min(i, 3) : ""}">
      <img src="${esc(img.src)}" alt="${esc(img.alt || "")}" loading="lazy" />
    </article>
  `).join("");
  observeReveals();
}

/* ---------- Sucursales y contacto directo ----------
   El título de cada tarjeta es el ESTADO; debajo, según el tipo, se muestra
   "Sucursal" (+ local si aplica) o el nombre de la persona que atiende esa
   zona. El resto de los datos (ubicación/local o cobertura + WhatsApp) va
   en el cuerpo de la tarjeta. */
function renderBranches() {
  const grid = document.getElementById("sucursalesGrid");
  if (!grid) return;
  const branches = (BRANCHES && BRANCHES.branches) || [];
  grid.innerHTML = branches.map((b, i) => {
    const isSucursal = b.kind === "sucursal";
    const title = getStateName(b.estado) || b.cobertura || b.ubicacion || "México";
    const subtitle = isSucursal ? (b.local ? `Sucursal · ${b.local}` : "Sucursal") : (b.nombre || "Contacto directo");
    const icon = isSucursal ? "bi-shop" : "bi-geo-alt";
    const metaLine = isSucursal ? (b.ubicacion || "") : (b.cobertura || "");
    const canWrite = b.activo !== false && b.whatsapp;
    return `
    <article class="sucursal-card reveal ${i ? "delay-" + Math.min(i, 3) : ""} ${b.primary ? "is-primary" : ""}">
      <div class="sucursal-top">
        <div><h3>${esc(title)}</h3><p>${esc(subtitle)}</p></div>
        <span class="sucursal-icon"><i class="bi ${icon}"></i></span>
      </div>
      <div class="sucursal-bottom">
        ${metaLine ? `<p class="sucursal-meta">${esc(metaLine)}</p>` : ""}
        ${isSucursal ? `<p class="sucursal-encargado">${esc(b.nombre || "Próximamente")}</p>` : ""}
        ${canWrite
          ? `<a class="sucursal-tel is-link" href="${waLinkTo(b.whatsapp, "Hola, tengo material para entregar en la sucursal de " + title)}" target="_blank" rel="noopener"><i class="bi bi-telephone-fill"></i> ${esc(formatMexPhone(b.whatsapp))}</a>
             <a class="btn btn-sm sucursal-wa-btn" href="${waLinkTo(b.whatsapp, "Hola " + (b.nombre ? b.nombre + ", " : "") + "me interesa entregar o cotizar material en la sucursal de " + title)}" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Escribir a esta sucursal</a>`
          : `<p class="sucursal-tel"><i class="bi bi-whatsapp"></i>Próximamente</p>`}
      </div>
    </article>`;
  }).join("");
  observeReveals();
}

/* ---------- Quiénes somos ---------- */
function initials(name) {
  return String(name || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
}
function renderTeam() {
  const section = document.getElementById("equipo");
  const grid = document.getElementById("teamGrid");
  const navItem = document.getElementById("navTeamItem");
  if (!section || !grid) return;
  // Solo se muestra en el sitio público cuando alguien ya llenó su nombre
  // desde el panel admin; nunca se inventa contenido de relleno.
  const members = ((TEAM && TEAM.members) || []).filter((m) => (m.name || "").trim());
  if (!members.length) {
    section.hidden = true;
    if (navItem) navItem.hidden = true;
    return;
  }
  section.hidden = false;
  if (navItem) navItem.hidden = false;
  grid.innerHTML = members.map((m, i) => `
    <article class="team-card reveal ${i ? "delay-" + Math.min(i, 3) : ""}">
      <div class="team-photo">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy" />` : `<span class="team-photo-fallback">${esc(initials(m.name))}</span>`}</div>
      <p class="team-name">${esc(m.name)}</p>
      <p class="team-role">${esc(m.role || "")}</p>
      <div class="team-contacts">
        ${m.whatsapp ? `<a class="team-contact-link" href="${waLinkTo(m.whatsapp, "Hola, quiero contactarte por Eco Lógica García")}" target="_blank" rel="noopener" aria-label="WhatsApp de ${esc(m.name)}"><i class="bi bi-whatsapp"></i></a>` : ""}
        ${m.email ? `<a class="team-contact-link" href="mailto:${esc(m.email)}" aria-label="Correo de ${esc(m.name)}"><i class="bi bi-envelope"></i></a>` : ""}
        ${(m.social || []).filter((s) => isSafeHttpUrl(s.url)).map((s) => `<a class="team-contact-link" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.network)} de ${esc(m.name)}"><i class="bi ${SOCIAL_ICONS[s.network] || "bi-globe2"}"></i></a>`).join("")}
      </div>
    </article>
  `).join("");
  observeReveals();
}

/* ---------- Redes sociales ---------- */
const SOCIAL_ICONS = { facebook: "bi-facebook", instagram: "bi-instagram", tiktok: "bi-tiktok", youtube: "bi-youtube", x: "bi-twitter-x", other: "bi-globe2" };
function renderSocial() {
  const links = ((SOCIAL && SOCIAL.links) || []).filter((l) => isSafeHttpUrl(l.url));
  document.querySelectorAll(".js-social-links").forEach((wrap) => {
    wrap.innerHTML = links.map((l) => `
      <a class="social-link" href="${esc(l.url)}" target="_blank" rel="noopener" aria-label="${esc(l.label || l.network)}">
        <i class="bi ${SOCIAL_ICONS[l.network] || "bi-globe2"}"></i>
      </a>`).join("");
    wrap.hidden = links.length === 0;
  });
}

/* ---------- Estadísticas de cobertura (dinámicas, según estados activos) ---------- */
function renderCoverageStats() {
  const active = getActiveStates();
  const restCount = Math.max(0, TOTAL_MEXICO_STATES - active.length);
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setText("coverageActiveInline", active.length);
  setText("heroStatStates", `${active.length}+`);
  setText("coverageActiveKpi", active.length);
  setText("coverageRestKpi", restCount);
  const chips = document.getElementById("coverageActiveChips");
  if (chips) {
    chips.innerHTML = active.length
      ? active.map((s) => `<span class="chip chip-active">${esc(s.name)}</span>`).join("")
      : `<span class="chip">Cobertura activa próximamente</span>`;
  }
}

/* ---------- FAQ ---------- */
function renderFAQ() {
  const list = document.getElementById("faqList");
  if (!list) return;
  list.innerHTML = FAQ_DATA.map((f, i) => `
    <div class="faq-item" data-index="${i}">
      <button class="faq-q" type="button">
        <span>${f.q}</span>
        <i class="bi bi-plus-lg"></i>
      </button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>
  `).join("");
  list.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      list.querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".faq-a").style.maxHeight = null;
        other.querySelector(".faq-q i").className = "bi bi-plus-lg";
      });
      if (!isOpen) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + 24 + "px";
        q.querySelector("i").className = "bi bi-dash-lg";
      }
    });
  });
}

/* ---------- Enlaces/textos de WhatsApp fijos en el HTML ---------- */
function applyWaLinks() {
  document.querySelectorAll(".js-wa-link").forEach((el) => {
    el.setAttribute("href", waLink(el.dataset.waMsg || ""));
  });
  const display = formatMexPhone(WA_NUMBER);
  document.querySelectorAll(".js-wa-text").forEach((el) => { el.textContent = display; });
}

/* ---------- Orquesta el render inicial ---------- */
function renderEverything() {
  applyWaLinks();
  renderPrices();
  renderCalculator();
  renderSelector();
  renderGalleryGeneral();
  renderBranches();
  renderTeam();
  renderSocial();
  renderCoverageStats();
  renderFAQ();
  observeReveals();

  // Selecciona un material si viene por query string, ej. index.html?material=ram
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get("material");
  if (preselect) selectMaterial(preselect);

  if (params.get("promo") === "1") {
    const strip = document.getElementById("campaignStrip");
    if (strip) strip.hidden = false;
  }
}

/* ---------- Tema claro/oscuro ---------- */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  if (themeIcon) themeIcon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-fill";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", isDark ? "#06180f" : "#064528");
  try { localStorage.setItem("theme-preference", isDark ? "dark" : "light"); } catch (_e) {}
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("theme-preference"); } catch (_e) {}
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  applyTheme(saved ? saved === "dark" : prefersDark.matches);
  themeToggle?.addEventListener("click", () => applyTheme(!document.body.classList.contains("dark-mode")));
  const onChange = (e) => { if (!localStorage.getItem("theme-preference")) applyTheme(e.matches); };
  prefersDark.addEventListener ? prefersDark.addEventListener("change", onChange) : prefersDark.addListener?.(onChange);
}
initTheme();

/* ---------- Navegación, menú móvil, header con scroll ---------- */
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const siteHeader = document.getElementById("siteHeader");
const scrollProgress = document.getElementById("scrollProgress");

menuBtn?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
navLinks?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuBtn?.setAttribute("aria-expanded", "false");
}));

// La barra superior puede pasar a dos líneas en pantallas angostas, así que
// medimos la altura real del header en vez de asumir un alto fijo (evita que
// el menú móvil quede tapado detrás del header cuando el texto se envuelve).
function updateHeaderOffset() {
  if (!siteHeader) return;
  document.documentElement.style.setProperty("--header-total-h", `${siteHeader.getBoundingClientRect().bottom}px`);
}
updateHeaderOffset();
window.addEventListener("resize", updateHeaderOffset);
if (window.ResizeObserver && siteHeader) {
  new ResizeObserver(updateHeaderOffset).observe(siteHeader);
}

const backToTopBtn = document.getElementById("backToTop");
backToTopBtn?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

function onScroll() {
  const scrollTop = window.scrollY;
  siteHeader?.classList.toggle("is-scrolled", scrollTop > 8);
  if (scrollProgress) {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = `${scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0}%`;
  }
  if (backToTopBtn) {
    backToTopBtn.hidden = false;
    backToTopBtn.classList.toggle("is-visible", scrollTop > window.innerHeight * 0.8);
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const sections = ["precios", "que-compramos", "equipo", "cobertura", "sucursales", "faq"];
const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));
if ("IntersectionObserver" in window && navAnchors.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navAnchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((id) => { const el = document.getElementById(id); if (el) navObserver.observe(el); });
}

/* ---------- Reveal on scroll ---------- */
let revealObserver = null;
let revealFallbackTimer = null;
function observeReveals() {
  if ("IntersectionObserver" in window) {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
    }
    document.querySelectorAll(".reveal:not(.show)").forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("show"));
  }
  // Red de seguridad: si por lo que sea el observer no revela un elemento
  // a tiempo (motor lento, pestaña en segundo plano, etc.), nunca debe
  // quedar contenido invisible de forma permanente.
  clearTimeout(revealFallbackTimer);
  revealFallbackTimer = setTimeout(() => {
    document.querySelectorAll(".reveal:not(.show)").forEach((el) => el.classList.add("show"));
  }, 1800);
}

/* ---------- Interacción 3D suave del hero (deshabilitada si hay reduced motion) ---------- */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReducedMotion) {
  const heroMedia = document.querySelector(".hero-media");
  if (heroMedia) {
    heroMedia.addEventListener("mousemove", (e) => {
      const rect = heroMedia.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      heroMedia.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 4}deg) rotateY(${(x - 0.5) * 5}deg)`;
    });
    heroMedia.addEventListener("mouseleave", () => { heroMedia.style.transform = ""; });
  }
}

/* ---------- Mapa de cobertura (Leaflet) ---------- */
let coverageMapInstance = null;

function initCoverageMap() {
  const mapContainer = document.getElementById("coverageMap");
  if (!mapContainer || coverageMapInstance) return;
  const active = getActiveStates();
  if (typeof window.L === "undefined") {
    mapContainer.innerHTML = `<p class='map-fallback'>No se pudo cargar el mapa. Cobertura activa en ${active.length} estado(s); el resto del país aplica desde 10 kg.</p>`;
    return;
  }
  coverageMapInstance = window.L.map(mapContainer, { scrollWheelZoom: false, minZoom: 4, maxZoom: 10 });
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "&copy; OpenStreetMap contributors"
  }).addTo(coverageMapInstance);

  const bounds = [];
  const zoneColor = "#1fb859";
  active.forEach((state) => {
    const coords = [state.lat, state.lng];
    bounds.push(coords);
    window.L.circle(coords, { radius: 70000, color: zoneColor, weight: 1, opacity: 0.45, fillColor: zoneColor, fillOpacity: 0.08 }).addTo(coverageMapInstance);
    const icon = window.L.divIcon({
      className: "coverage-map-marker-wrap",
      html: `<span style="display:block;width:12px;height:12px;border-radius:50%;background:${zoneColor};border:2px solid #fff;box-shadow:0 0 0 2px ${zoneColor}"></span>`,
      iconSize: [14, 14], iconAnchor: [7, 7]
    });
    window.L.marker(coords, { icon }).addTo(coverageMapInstance)
      .bindPopup(`<strong>${esc(state.name)}</strong><br/>Cobertura activa`);
  });
  if (bounds.length) coverageMapInstance.fitBounds(bounds, { padding: [30, 30] });
  else coverageMapInstance.setView([23.6345, -102.5528], 5);
}
if ("IntersectionObserver" in window) {
  const coverageSection = document.getElementById("cobertura");
  if (coverageSection) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { initCoverageMap(); mapObserver.disconnect(); } });
    }, { threshold: 0.2 });
    mapObserver.observe(coverageSection);
  }
}

/* ---------- Arranque ---------- */
loadData();
