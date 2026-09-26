/* =========================================================
   ECO LÓGICA García — sitio público
   Sin formularios, sin localStorage de datos personales.
   Los precios y la galería se cargan desde data/prices.json
   y data/gallery.json (editables desde el panel admin).
   ========================================================= */

// data/prices.json y data/gallery.json se editan desde el panel admin, así
// que su texto (notas, descripciones de fotos) se escapa antes de insertarse
// como HTML usando esc() de js/utils.js

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

// Devuelve TEXTO plano: quien lo meta en innerHTML lo pasa por esc().
// Espacios no separables antes del guion y antes de la unidad: la línea
// solo puede cortarse DESPUÉS del guion ("$5,000 –⏎$10,000 /kg"), nunca
// dejando "/kg" solo en el renglón de abajo como pasaba en la barra
// fija del móvil y en los chips de la calculadora.
function formatPrice(min, max, unit = "/kg") {
  const fmt = (n) => `$${(Number(n) || 0).toLocaleString("es-MX")}`;
  return `${fmt(min)} – ${fmt(max)} ${unit}`;
}

/* ---------- Estado cargado ---------- */
let PRICES = null;
let GALLERY = null;
let TEAM = null;
let COVERAGE = null;
let BRANCHES = null;
let SOCIAL = null;

// Sin tiempo límite, una sola petición atorada en una red móvil dejaba la
// página esperando indefinidamente. A los 6 s se usa el respaldo.
const FETCH_TIMEOUT_MS = 6000;

// "no-cache" y no "no-store": igual pregunta siempre al servidor (los
// cambios del panel se ven al momento), pero si el archivo no cambió el
// servidor responde 304 y no se vuelve a descargar entero en cada visita.
// El respaldo también se usa si el JSON llega con una forma inesperada
// (por ejemplo, sin la lista que la página espera).
async function fetchJson(path, fallback, isValid) {
  const ctrl = typeof AbortController === "function" ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS) : null;
  try {
    const res = await fetch(path, { cache: "no-cache", signal: ctrl ? ctrl.signal : undefined });
    if (!res.ok) return fallback;
    const data = await res.json();
    return (!isValid || isValid(data)) ? data : fallback;
  } catch (_err) {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const hasList = (key) => (data) => !!data && Array.isArray(data[key]);

async function loadData() {
  // fetchJson nunca lanza (cada fallo cae en su respaldo), así que
  // Promise.all siempre resuelve y no hace falta un catch aquí.
  [PRICES, GALLERY, TEAM, COVERAGE, BRANCHES, SOCIAL] = await Promise.all([
    fetchJson("data/prices.json", FALLBACK_PRICES, hasList("materials")),
    fetchJson("data/gallery.json", FALLBACK_GALLERY, hasList("categories")),
    fetchJson("data/team.json", FALLBACK_TEAM, hasList("members")),
    fetchJson("data/coverage.json", FALLBACK_COVERAGE, hasList("activeStateIds")),
    fetchJson("data/branches.json", FALLBACK_BRANCHES, hasList("branches")),
    fetchJson("data/social.json", FALLBACK_SOCIAL, hasList("links")),
  ]);

  // El número de WhatsApp que usan los botones generales del sitio es el
  // contacto marcado como "principal" en Sucursales y contacto (panel admin),
  // no un valor fijo en el código. Solo se acepta un número bien formado:
  // uno mal capturado rompería TODOS los botones de WhatsApp del sitio.
  const branchList = BRANCHES.branches;
  const primary = branchList.find((b) => b.primary && isWaNumber(b.whatsapp)) || branchList.find((b) => isWaNumber(b.whatsapp));
  if (primary) WA_NUMBER = primary.whatsapp;
  renderEverything();
}

function getActiveStates() {
  const ids = (COVERAGE && Array.isArray(COVERAGE.activeStateIds)) ? COVERAGE.activeStateIds : (FALLBACK_COVERAGE.activeStateIds || []);
  return ids.map((id) => MEXICO_STATES.find((s) => s.id === id)).filter(Boolean);
}
function getStateName(id) {
  return MEXICO_STATES.find((s) => s.id === id)?.name || null;
}

function getMaterial(id) {
  return (PRICES?.materials || []).find((m) => m.id === id) || null;
}
function getGalleryImages(categoryId) {
  const cat = (GALLERY?.categories || []).find((c) => c.id === categoryId);
  return (cat && Array.isArray(cat.images)) ? cat.images : [];
}
/* Los materiales de la lista de precios no traen su propia categoría de
   galería (solo los tipos de celular y "otros materiales" la tienen), así
   que la buscamos por su priceId: así una foto real aparece desde la
   tarjeta de precio, sin tener que entrar al detalle para verla. */
function materialGalleryCategory(materialId) {
  const type = (PRICES?.celularTypes || []).find((t) => t.priceId === materialId);
  if (type) return type.galleryCategory;
  const other = (PRICES?.otherMaterials || []).find((o) => o.priceId === materialId);
  return other ? other.galleryCategory : null;
}
function materialPhoto(materialId) {
  const category = materialGalleryCategory(materialId);
  const images = category ? getGalleryImages(category) : [];
  return images[0] || null;
}

function bestCelularType() {
  const types = (PRICES?.celularTypes || []).filter((t) => Number(t.max) > 0);
  return types.find((t) => t.id === "tipo1") || types.sort((a, b) => Number(b.max) - Number(a.max))[0] || null;
}

/* ---------- Render: precios rápidos + tabla ---------- */
function renderPrices() {
  const quickGrid = document.getElementById("quickPricesGrid");
  const table = document.getElementById("priceTable");
  if (!quickGrid || !table) return;

  const quickItems = (PRICES?.materials || []).filter((m) => m.quick);
  quickGrid.innerHTML = quickItems.map((m, i) => {
    const photo = materialPhoto(m.id);
    const isFeatured = m.id === "celular";
    return `
    <article class="price-card brillo-borde ${isFeatured ? "price-card-featured brillo-fijo" : ""} reveal ${i ? "delay-" + Math.min(i, 3) : ""}">
      ${isFeatured ? `<div class="featured-price-badge"><i class="bi bi-star-fill" aria-hidden="true"></i> MEJOR PAGADO</div>` : ""}
      ${photo
        ? `<div class="price-card-photo"><img src="${esc(photo.src)}" alt="${esc(photo.alt || m.name)}" loading="lazy" onerror="this.parentElement.style.display='none'" /></div>`
        : ""}
      <span class="price-icon"><i class="bi ${esc(m.icon || "bi-cpu")}" aria-hidden="true"></i></span>
      <p class="price-tag">${esc(m.name)}</p>
      <p class="price-value">${esc(formatPrice(m.min, m.max, m.unit))}</p>
      <p class="price-copy">${esc(m.quickCopy || m.note || "")}</p>
      <button type="button" class="btn ${isFeatured ? "btn-primary" : "btn-ghost"} open-selector" data-preselect="${esc(m.id)}">${m.directContact ? "Preguntar por WhatsApp" : "Ver detalle"}</button>
    </article>`;
  }).join("");

  table.innerHTML = (PRICES?.materials || []).filter(m => !m.quick).map((m) => `
    <div class="price-row">
      <div class="row-name">
        <span class="row-icon"><i class="bi ${esc(m.icon || "bi-cpu")}" aria-hidden="true"></i></span>
        <span class="row-title">${esc(m.name)}</span>
      </div>
      <p class="row-note">${esc(m.note || "")}</p>
      <p class="row-price">${esc(formatPrice(m.min, m.max, m.unit))}</p>
    </div>
  `).join("");
  // (La nota "el material se compra para destrucción…" ya está en el
  // recuadro de abajo; aquí se repetía palabra por palabra.)

  // El "mejor precio" del hero y de la barra fija del móvil sale del tipo
  // de celular mejor pagado, no de un id fijo: si el panel recrea o
  // renombra "tipo1", antes se quedaba el precio viejo del HTML.
  const best = bestCelularType();
  if (best) {
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    // Sin "/kg" extra: formatPrice() ya lo añade por defecto.
    setText("heroBestPrice", formatPrice(best.min, best.max));
    setText("mobileStickyPrice", formatPrice(best.min, best.max));
    // "Tipo 1 (Primera)" → "Tipo 1": en la barra del móvil no cabe más.
    const corto = String(best.shortLabel || best.label || "").replace(/\s*\(.*\)\s*$/, "");
    setText("heroBestLabel", `Lógica de celular · ${corto}`);
    setText("mobileStickyLabel", `Celular ${corto}`);
  }
  const heroStatMaterials = document.getElementById("heroStatMaterials");
  if (heroStatMaterials) heroStatMaterials.textContent = (PRICES?.materials || []).length;

  // Directo al material: antes abría el modal para cerrarlo en el mismo
  // instante (y dejaba una entrada de más en el historial).
  quickGrid.querySelectorAll(".open-selector").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.preselect) selectMaterial(btn.dataset.preselect);
      else showSelector();
    });
  });
}

/* ---------- Render: Calculadora de Ganancias (Cotizador Express) ----------
   El peso vive en UN solo número: gramos totales (CALC.totalG). Los dos
   campos (kg y g), el deslizador y las píldoras de acceso rápido son solo
   formas de mostrarlo o cambiarlo, y todos se sincronizan desde
   syncWeightUI(). Antes cada control guardaba su parte por separado y se
   desfasaban: el deslizador se quedaba en 10 kg mientras se calculaba
   con 100, "+50 g" en el tope bajaba el peso, etc. */
const CALC_MAX_G = 1000 * 1000; // 1000 kg
const CALC = {
  materialId: "tipo1",
  totalG: 3000,
  items: [],
  bound: false,
};

// "3 kg", "3 kg 500 g" o "500 g": el texto del resultado y el mensaje de
// WhatsApp dicen exactamente lo mismo.
function formatCalcWeight(totalG) {
  const kg = Math.floor(totalG / 1000);
  const g = totalG % 1000;
  if (g > 0 && kg > 0) return `${kg} kg ${g} g`;
  if (g > 0) return `${g} g`;
  return `${kg} kg`;
}

// Materiales que se pueden cotizar, sacados de los datos: los tipos de
// celular y cada material de la lista que no sea el genérico "celular" ni
// uno que ya esté representado por un tipo (como "sin pila"). Un material
// nuevo del panel aparece solo; para ocultarlo, "calc": false en el JSON.
function getCalculatorItems() {
  const types = PRICES?.celularTypes || [];
  const materials = PRICES?.materials || [];
  const iconOf = (id) => (materials.find((m) => m.id === id) || {}).icon;
  const items = types.map((t) => ({
    id: t.id,
    name: t.label || t.shortLabel || t.id,
    min: Number(t.min) || 0,
    max: Number(t.max) || 0,
    icon: iconOf(t.priceId) || "bi-phone",
  }));
  const coveredByTypes = new Set(types.map((t) => t.priceId));
  materials
    .filter((m) => m.calc !== false && !coveredByTypes.has(m.id) && !items.some((it) => it.id === m.id))
    .forEach((m) => items.push({
      id: m.id,
      name: m.name,
      min: Number(m.min) || 0,
      max: Number(m.max) || 0,
      icon: m.icon || "bi-cpu",
    }));
  return items.filter((it) => it.max > 0);
}

function renderCalculator() {
  const chipsContainer = document.getElementById("calcMaterialChips");
  const selectEl = document.getElementById("calcMaterialSelect");
  if (!chipsContainer || !selectEl || !document.getElementById("calcWeightInput")) return;

  CALC.items = getCalculatorItems();
  if (!CALC.items.length) {
    // Sin materiales configurados no hay nada que calcular; sin esto, el
    // texto de "Cargando…" del HTML se quedaba fijo para siempre.
    chipsContainer.innerHTML = `<p class="price-hint" style="margin:0">Todavía no hay materiales configurados para cotizar.</p>`;
    const titleEl = document.getElementById("calcResultTitle");
    const formulaEl = document.getElementById("calcResultFormula");
    if (titleEl) titleEl.textContent = "Sin materiales disponibles";
    if (formulaEl) formulaEl.textContent = "Agrega materiales desde el panel para poder cotizar.";
    return;
  }
  if (!CALC.items.some((it) => it.id === CALC.materialId)) CALC.materialId = CALC.items[0].id;

  chipsContainer.innerHTML = CALC.items.map((it) => {
    const isActive = it.id === CALC.materialId;
    return `
      <button type="button" class="calc-chip-btn ${isActive ? "is-active" : ""}" data-calc-id="${esc(it.id)}" role="radio" aria-checked="${isActive}" tabindex="${isActive ? 0 : -1}">
        <span class="calc-chip-icon"><i class="bi ${esc(it.icon)}" aria-hidden="true"></i></span>
        <span class="calc-chip-title">${esc(it.name)}</span>
        <span class="calc-chip-rate">${esc(formatPrice(it.min, it.max))}</span>
      </button>`;
  }).join("");

  selectEl.innerHTML = CALC.items.map((it) => `
    <option value="${esc(it.id)}" ${it.id === CALC.materialId ? "selected" : ""}>${esc(it.name)}</option>
  `).join("");

  bindCalculatorOnce();
  syncWeightUI();
  updateCalculation();
}

function setCalcMaterial(id, { focus = false } = {}) {
  if (!CALC.items.some((it) => it.id === id)) return;
  CALC.materialId = id;
  document.querySelectorAll("#calcMaterialChips .calc-chip-btn").forEach((chip) => {
    const active = chip.dataset.calcId === id;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-checked", active ? "true" : "false");
    // Un solo chip en el orden de Tab (patrón radiogroup): las flechas
    // mueven entre ellos.
    chip.tabIndex = active ? 0 : -1;
    if (active && focus) chip.focus();
  });
  const selectEl = document.getElementById("calcMaterialSelect");
  if (selectEl) selectEl.value = id;
  updateCalculation();
}

// Cambia el peso total y refleja el valor en todos los controles, menos en
// el que el usuario está escribiendo (para no moverle el cursor).
function setCalcWeight(totalG, { except = null } = {}) {
  CALC.totalG = Math.max(0, Math.min(CALC_MAX_G, Math.round(Number(totalG) || 0)));
  syncWeightUI(except);
  updateCalculation();
}

function syncWeightUI(except = null) {
  const skip = (el) => el && (Array.isArray(except) ? except.includes(el) : except === el);
  const kg = Math.floor(CALC.totalG / 1000);
  const g = CALC.totalG % 1000;
  const weightInput = document.getElementById("calcWeightInput");
  const gramsInput = document.getElementById("calcGramsInput");
  const weightRange = document.getElementById("calcWeightRange");
  if (weightInput && !skip(weightInput)) weightInput.value = kg;
  if (gramsInput && !skip(gramsInput)) gramsInput.value = g;
  if (weightRange && !skip(weightRange)) weightRange.value = Math.min(Number(weightRange.max) || 50, kg);
  document.querySelectorAll("#calcQuickPills .quick-pill").forEach((pill) => {
    const pillG = Number(pill.dataset.kg || 0) * 1000 + Number(pill.dataset.g || 0);
    const active = pillG === CALC.totalG;
    pill.classList.toggle("is-active", active);
    pill.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function updateCalculation() {
  const item = CALC.items.find((it) => it.id === CALC.materialId) || CALC.items[0];
  if (!item) return;
  const totalKg = CALC.totalG / 1000;
  const fmt = (n) => `$${(Number(n) || 0).toLocaleString("es-MX")}`;
  const totalMin = Math.round(item.min * totalKg);
  const totalMax = Math.round(item.max * totalKg);
  const weightLabel = formatCalcWeight(CALC.totalG);

  const titleEl = document.getElementById("calcResultTitle");
  const amountEl = document.getElementById("calcResultAmount");
  const formulaEl = document.getElementById("calcResultFormula");
  const waBtn = document.getElementById("calcWaBtn");

  if (titleEl) titleEl.textContent = item.name;
  if (CALC.totalG <= 0) {
    if (amountEl) amountEl.textContent = "$0 – $0";
    if (formulaEl) formulaEl.textContent = "Ingresa los kilos o gramos de tu lote para cotizar";
    if (waBtn) waBtn.href = waLink(`Hola Eco Lógica García, quiero cotizar un lote de ${item.name}. ¿Me podrían dar informes para entrega o recolección?`);
  } else {
    if (amountEl) amountEl.textContent = `${fmt(totalMin)} – ${fmt(totalMax)}`;
    if (formulaEl) formulaEl.textContent = `Calculado para ${weightLabel} × (${formatPrice(item.min, item.max)})`;
    if (waBtn) waBtn.href = waLink(`Hola Eco Lógica García, coticé en su página web un lote de ${weightLabel} de ${item.name} con un estimado de ${fmt(totalMin)} a ${fmt(totalMax)} MXN. ¿Me podrían dar informes para entrega o recolección?`);
  }
}

// Los listeners se enganchan UNA vez y leen siempre CALC (no variables
// capturadas del primer render), así que un re-render no los deja viejos.
function bindCalculatorOnce() {
  if (CALC.bound) return;
  CALC.bound = true;
  const chipsContainer = document.getElementById("calcMaterialChips");
  const selectEl = document.getElementById("calcMaterialSelect");
  const weightInput = document.getElementById("calcWeightInput");
  const gramsInput = document.getElementById("calcGramsInput");
  const weightRange = document.getElementById("calcWeightRange");
  const gramsPart = () => CALC.totalG % 1000;
  const kgPart = () => Math.floor(CALC.totalG / 1000);

  chipsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".calc-chip-btn");
    if (chip) setCalcMaterial(chip.dataset.calcId);
  });
  // Flechas dentro del grupo de materiales (role="radiogroup").
  chipsContainer.addEventListener("keydown", (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    const i = CALC.items.findIndex((it) => it.id === CALC.materialId);
    const next = CALC.items[(i + keys[e.key] + CALC.items.length) % CALC.items.length];
    e.preventDefault();
    setCalcMaterial(next.id, { focus: true });
  });
  selectEl.addEventListener("change", (e) => setCalcMaterial(e.target.value));

  // Kilos: acepta decimales ("2.5"). Los dos campos SUMAN: 2.5 kg + 0 g =
  // 2 kg 500 g. Al salir del campo se normaliza la vista a kg + g.
  weightInput.addEventListener("input", () => {
    const raw = weightInput.value.trim().replace(",", ".");
    const kg = raw === "" ? 0 : parseFloat(raw);
    if (!isFinite(kg) || kg < 0) { setCalcWeight(gramsPart()); weightInput.value = ""; return; }
    if (kg > CALC_MAX_G / 1000) { setCalcWeight(CALC_MAX_G); return; }
    // Con decimales el campo de kilos ya trae el peso completo: mientras
    // se escribe, el de gramos muestra 0 (si mostrara 500 junto a "2.5"
    // se leería como 3 kg). Al salir del campo queda "2 kg" + "500 g".
    if (!Number.isInteger(kg)) {
      setCalcWeight(Math.round(kg * 1000), { except: [weightInput, gramsInput] });
      if (gramsInput) gramsInput.value = 0;
      return;
    }
    setCalcWeight(kg * 1000 + gramsPart(), { except: weightInput });
  });
  weightInput.addEventListener("blur", () => syncWeightUI());

  if (gramsInput) {
    gramsInput.addEventListener("input", () => {
      const raw = gramsInput.value.trim();
      const g = raw === "" ? 0 : Math.floor(Number(raw));
      if (!isFinite(g) || g < 0) { setCalcWeight(kgPart() * 1000); gramsInput.value = ""; return; }
      // 1500 g con 2 kg = 3 kg 500 g: los gramos de más pasan a kilos.
      setCalcWeight(kgPart() * 1000 + g, { except: g >= 1000 ? null : gramsInput });
    });
    gramsInput.addEventListener("blur", () => syncWeightUI());
  }

  const step = (id, deltaG) => document.getElementById(id)?.addEventListener("click", () => setCalcWeight(CALC.totalG + deltaG));
  step("calcMinusBtn", -1000);
  step("calcPlusBtn", 1000);
  step("calcMinusGramsBtn", -50);
  step("calcPlusGramsBtn", 50);

  // El deslizador fija los kilos enteros y conserva los gramos.
  if (weightRange) {
    weightRange.addEventListener("input", () => {
      setCalcWeight((parseInt(weightRange.value, 10) || 0) * 1000 + gramsPart(), { except: weightRange });
    });
  }

  document.getElementById("calcQuickPills")?.addEventListener("click", (e) => {
    const pill = e.target.closest(".quick-pill");
    if (pill) setCalcWeight(Number(pill.dataset.kg || 0) * 1000 + Number(pill.dataset.g || 0));
  });
}

/* ---------- Render: selector de material ----------
   Los botones salen directo de PRICES.materials (lo que edita el panel
   admin): un material nuevo aparece aquí solo, sin tocar código. "Otra
   cosa" es el único botón fijo, para lo que de plano no está en el
   catálogo. */
function renderSelector() {
  const grid = document.getElementById("selectorGrid");
  if (!grid) return;
  const items = (PRICES?.materials || []).filter((m) => m.showInSelector !== false);
  grid.innerHTML = items.map((m) => {
    const photo = materialPhoto(m.id);
    return `
      <button class="selector-btn" type="button" data-material="${esc(m.id)}" data-group="${esc(m.group)}">
        ${photo
          ? `<span class="sel-photo"><img src="${esc(photo.src)}" alt="" loading="lazy" /></span>`
          : `<span class="sel-icon"><i class="bi ${esc(m.icon || "bi-cpu")}" aria-hidden="true"></i></span>`}
        <span class="sel-name">${esc(m.name)}</span>
        <span class="sel-price">${esc(formatPrice(m.min, m.max, m.unit))}</span>
      </button>`;
  }).join("") + `
      <button class="selector-btn" type="button" data-material="otro" data-group="otros">
        <span class="sel-icon"><i class="bi bi-question-circle" aria-hidden="true"></i></span>
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

// Desplazamientos por JS: suaves, salvo que el visitante pidió menos
// movimiento (el CSS ya respeta esa preferencia; el JS no lo hacía).
function scrollBehavior() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; } catch (_e) { return "smooth"; }
}

// Recuerda qué elemento tenía el foco antes de abrir el modal, para
// devolvérselo al cerrar — sin esto, alguien navegando con teclado perdía
// su lugar en la página cada vez que cerraba el selector.
let selectorLastFocused = null;
// Si el modal se cierra con history.back() (para quitar el #modal de la
// URL), lo que tenga que pasar después —como bajar al detalle— espera a
// que termine ese regreso: el navegador restaura la posición de scroll al
// volver en el historial y pisaría cualquier desplazamiento hecho antes.
let selectorAfterClose = null;
let selectorClosingViaHistory = false;

function showSelector() {
  if (!selectorModal) return;
  selectorLastFocused = document.activeElement;
  selectorModal.classList.add("active");
  selectorModal.setAttribute("aria-hidden", "false");
  // En <html> y <body>: Safari en iPhone ignora el overflow:hidden si solo
  // va en <body> y la página de atrás seguía desplazándose.
  document.documentElement.classList.add("modal-abierto");
  applySelectorMode("all");
  selectorClose?.focus({ preventScroll: true });
  // El botón "atrás" del teléfono cierra el modal en vez de salir del sitio.
  if (window.location.hash !== "#modal") {
    history.pushState(null, "", "#modal");
  }
}
function hideSelector(opts) {
  if (!selectorModal || !selectorModal.classList.contains("active")) {
    if (opts && typeof opts.then === "function") opts.then();
    return;
  }
  const fromPop = opts === true;
  const then = opts && typeof opts.then === "function" ? opts.then : null;
  const restoreFocus = !(opts && opts.restoreFocus === false);
  selectorModal.classList.remove("active");
  selectorModal.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("modal-abierto");
  if (restoreFocus && selectorLastFocused && document.contains(selectorLastFocused)) {
    selectorLastFocused.focus({ preventScroll: true });
  }
  selectorLastFocused = null;
  if (!fromPop && window.location.hash === "#modal") {
    selectorAfterClose = then;
    selectorClosingViaHistory = true;
    history.back();
    // Respaldo por si el navegador no dispara popstate.
    setTimeout(() => { if (selectorClosingViaHistory) finishSelectorClose(); }, 400);
  } else if (then) {
    then();
  }
}
function finishSelectorClose() {
  selectorClosingViaHistory = false;
  const fn = selectorAfterClose;
  selectorAfterClose = null;
  if (fn) requestAnimationFrame(fn);
}
selectorOverlay && selectorOverlay.addEventListener("click", () => hideSelector());
selectorClose && selectorClose.addEventListener("click", () => hideSelector());
document.addEventListener("keydown", (e) => {
  if (!selectorModal?.classList.contains("active")) return;
  if (e.key === "Escape") { hideSelector(); return; }
  // Retención del foco: con aria-modal, Tab no debe salir a la página de
  // atrás (antes 11 de cada 20 Tab terminaban fuera del modal).
  if (e.key === "Tab") {
    const panel = selectorModal.querySelector(".selector-panel");
    const focusables = Array.from(panel.querySelectorAll("button, a[href], input, select, [tabindex]:not([tabindex=\"-1\"])"))
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  }
});
window.addEventListener("popstate", () => {
  if (selectorClosingViaHistory) { finishSelectorClose(); return; }
  if (selectorModal?.classList.contains("active") && window.location.hash !== "#modal") {
    hideSelector(true);
  }
});
// Si se recarga la página con #modal en la URL, el modal no está abierto:
// se limpia para que "atrás" no se quede atorado en esa entrada.
if (window.location.hash === "#modal") {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
document.querySelectorAll(".open-material-selector, [data-open-selector]").forEach((btn) => {
  btn.addEventListener("click", (e) => { e.preventDefault(); showSelector(); });
});

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => applySelectorMode(btn.dataset.mode));
});
function applySelectorMode(mode) {
  document.querySelectorAll(".mode-btn").forEach((b) => {
    const active = b.dataset.mode === mode;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
  document.querySelectorAll(".selector-btn").forEach((b) => {
    const show = mode === "all" || b.dataset.group === mode;
    b.classList.toggle("is-hidden", !show);
  });
}
// Grupos de filtros (botones con aria-pressed): además de Tab, las flechas
// mueven el foco Y activan el filtro vecino (Home/End: primero/último).
// Antes eran role="tab" sin paneles, que para un lector de pantalla
// prometía pestañas que no existían.
function wireFilterArrowKeys(groupEl) {
  if (!groupEl) return;
  groupEl.addEventListener("keydown", (e) => {
    const tabs = Array.from(groupEl.querySelectorAll("button[aria-pressed]"));
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    let nextIndex = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = (currentIndex + 1) % tabs.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    e.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  });
}
wireFilterArrowKeys(document.querySelector(".selector-modes"));

/* ---------- Detalle de material (unifica tipos de celular + otros materiales) ---------- */
const materialDetail = document.getElementById("materialDetail");
let carouselImages = [];
let carouselIndex = 0;
let carouselTimer = null;
// Recuerda el foco solo en la apertura real (no en cada cambio de pestaña
// DENTRO del detalle ya abierto, como Tipo 1 -> Tipo 2): así "Elegir otro
// material"/Escape regresan el foco a donde estaba antes de entrar aquí,
// sin importar cuántas pestañas se hayan tocado mientras tanto.
let detailLastFocused = null;
function openMaterialDetailPanel() {
  const wasActive = materialDetail.classList.contains("active");
  // Si se llegó desde el modal, el foco "de origen" es el botón que abrió
  // el modal, no el botón del modal (que queda oculto al cerrarse).
  if (!wasActive) {
    detailLastFocused = selectorModal?.contains(document.activeElement) ? selectorLastFocused : document.activeElement;
  }
  materialDetail.classList.add("active");
  // setCarousel() corre antes de que el detalle esté abierto; el avance
  // automático arranca ahora que ya se ve.
  resetCarouselAutoplay();
  // preventScroll: el foco no debe provocar un salto brusco; el
  // desplazamiento suave hasta el detalle lo hace selectMaterial().
  if (!wasActive) document.getElementById("detailBack")?.focus({ preventScroll: true });
}

function openWhatsAppFor(message) {
  window.open(waLink(message), "_blank", "noopener");
}

function selectMaterial(materialId) {
  if (materialId === "otro") {
    hideSelector();
    openWhatsAppFor("Hola, tengo material electrónico que no aparece en el catálogo, ¿me pueden cotizar?");
    return;
  }
  const material = getMaterial(materialId);
  // Un material marcado como "sin ficha propia" (por ejemplo, uno recién
  // agregado desde el panel, sin tipos ni fotos todavía) manda directo a
  // WhatsApp en vez de abrir un detalle que no tendría nada que mostrar.
  if (material && material.directContact) {
    hideSelector();
    openWhatsAppFor(`Hola, tengo ${material.name.toLowerCase()} para vender, ¿me pueden cotizar?`);
    return;
  }
  const shown = materialId === "celular" ? showCelularTypes(bestCelularType()?.id) : showOtherMaterial(materialId);
  if (!shown) {
    // Sin ficha que mostrar: antes el modal se cerraba y no pasaba nada.
    hideSelector();
    openWhatsAppFor(`Hola, tengo ${material ? material.name.toLowerCase() : "material"} para vender, ¿me pueden cotizar?`);
    return;
  }
  // El foco va al detalle (no de regreso al botón que abrió el modal) y el
  // desplazamiento espera a que el modal termine de cerrarse.
  hideSelector({
    restoreFocus: false,
    then: () => materialDetail.scrollIntoView({ behavior: scrollBehavior(), block: "start" }),
  });
}

function showCelularTypes(typeId) {
  const tabsWrap = document.getElementById("detailTabs");
  const celularTypes = PRICES?.celularTypes || [];
  const type = celularTypes.find((t) => t.id === typeId) || celularTypes[0];
  if (!type) return false; // sin tipos configurados, no hay nada que mostrar
  // Si el foco estaba en una pestaña, se devuelve a la nueva pestaña
  // activa: al volver a pintar las pestañas, el botón enfocado se destruía
  // y el teclado quedaba "perdido" al inicio de la página.
  const focusInTabs = tabsWrap.contains(document.activeElement);

  document.getElementById("detailEyebrow").textContent = "Lógica de celular";
  document.getElementById("detailTitle").textContent = "Tipos y precios según características";

  tabsWrap.hidden = false;
  tabsWrap.innerHTML = celularTypes.map((t) => `
    <button type="button" class="type-tab ${t.id === type.id ? "is-active" : ""}" data-type="${esc(t.id)}" aria-pressed="${t.id === type.id}">
      <span class="tab-label">${esc(t.label)}</span>
      <span class="tab-price">${esc(formatPrice(t.min, t.max))}</span>
    </button>
  `).join("");
  tabsWrap.querySelectorAll(".type-tab").forEach((tab) => {
    tab.addEventListener("click", () => showCelularTypes(tab.dataset.type));
  });
  if (focusInTabs) tabsWrap.querySelector(".type-tab.is-active")?.focus({ preventScroll: true });

  document.getElementById("detailInfoEyebrow").textContent = type.shortLabel;
  document.getElementById("detailCaption").textContent = `Referencia · ${type.label}`;
  document.getElementById("detailPrice").textContent = formatPrice(type.min, type.max);
  document.getElementById("detailSpecs").innerHTML = (type.specs || []).map((s) => `<li><i class="bi bi-check2" aria-hidden="true"></i><span>${esc(s)}</span></li>`).join("");
  document.getElementById("detailWaLink").href = waLink(`Hola, tengo lógica de celular (${type.shortLabel}) para vender.`);

  setCarousel(getGalleryImages(type.galleryCategory));
  openMaterialDetailPanel();
  return true;
}

function showOtherMaterial(materialId) {
  // La ficha se busca por el material al que pertenece (priceId), que es
  // como la relaciona el panel; las fichas creadas desde ahí tienen un id
  // propio ("ficha-…") distinto del material, y buscando por id no se
  // abrían. Se conserva la búsqueda por id para las fichas antiguas.
  const fichas = PRICES?.otherMaterials || [];
  const data = fichas.find((o) => o.priceId === materialId) || fichas.find((o) => o.id === materialId);
  const price = getMaterial(data ? data.priceId : materialId);
  if (!data || !price) return false;

  document.getElementById("detailTabs").hidden = true;
  document.getElementById("detailTabs").innerHTML = "";

  document.getElementById("detailEyebrow").textContent = data.eyebrow;
  document.getElementById("detailTitle").textContent = data.title;
  document.getElementById("detailInfoEyebrow").textContent = "Consideraciones importantes";
  document.getElementById("detailCaption").textContent = `Referencia · ${data.eyebrow}`;
  document.getElementById("detailPrice").textContent = formatPrice(price.min, price.max, price.unit);
  document.getElementById("detailSpecs").innerHTML = (data.specs || []).map((s) => `<li><i class="bi bi-check2" aria-hidden="true"></i><span>${esc(s)}</span></li>`).join("");
  document.getElementById("detailWaLink").href = waLink(`Hola, tengo ${String(data.eyebrow || price.name).toLowerCase()} para vender.`);

  setCarousel(getGalleryImages(data.galleryCategory));
  openMaterialDetailPanel();
  return true;
}

function setCarousel(images) {
  carouselImages = images && images.length ? images : [];
  carouselIndex = 0;
  const track = document.getElementById("carouselTrack");
  const dots = document.getElementById("carouselDots");
  // Un material sin fotos propias (como tablet) mostraba fotos de placas de
  // celular: ahora se dice que las fotos vienen en camino.
  if (!carouselImages.length) {
    track.style.transform = "";
    track.innerHTML = `<div class="carousel-vacio"><i class="bi bi-camera" aria-hidden="true"></i><span>Fotos reales de este material, próximamente.</span></div>`;
    dots.innerHTML = "";
    ["carouselPrev", "carouselNext"].forEach((id) => { const b = document.getElementById(id); if (b) b.hidden = true; });
    dots.hidden = true;
    resetCarouselAutoplay();
    return;
  }
  // La primera foto sin lazy: es la que se ve al abrir el detalle.
  track.innerHTML = carouselImages.map((img, i) => `<img src="${esc(img.src)}" alt="${esc(img.alt || "")}" ${i ? "loading=\"lazy\"" : ""} decoding="async" />`).join("");
  dots.innerHTML = carouselImages.map((_, i) => `<button type="button" class="carousel-dot ${i === 0 ? "is-active" : ""}" data-index="${i}" aria-label="Imagen ${i + 1} de ${carouselImages.length}"></button>`).join("");
  // Con una sola foto, las flechas y los puntos no sirven para nada.
  const single = carouselImages.length < 2;
  ["carouselPrev", "carouselNext"].forEach((id) => { const b = document.getElementById(id); if (b) b.hidden = single; });
  dots.hidden = single;
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
  if (!carouselImages.length) return;
  carouselIndex = (index + carouselImages.length) % carouselImages.length;
  updateCarouselPosition();
  resetCarouselAutoplay();
}
// El avance automático se detiene cuando no tiene sentido o molesta: con
// "reducir movimiento" (WCAG 2.2.2), con la pestaña en segundo plano, con
// el detalle cerrado, con el puntero o el foco del teclado encima.
let carouselPaused = false;
function carouselCanAutoplay() {
  let reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (_e) {}
  return carouselImages.length > 1 && !reduced && !document.hidden && !carouselPaused
    && materialDetail && materialDetail.classList.contains("active");
}
function resetCarouselAutoplay() {
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = null;
  if (!carouselCanAutoplay()) return;
  carouselTimer = setInterval(() => goToSlide(carouselIndex + 1), 5000);
}
document.addEventListener("visibilitychange", resetCarouselAutoplay);

document.getElementById("carouselPrev")?.addEventListener("click", () => goToSlide(carouselIndex - 1));
document.getElementById("carouselNext")?.addEventListener("click", () => goToSlide(carouselIndex + 1));
const carouselViewport = document.getElementById("carouselViewport");
if (carouselViewport) {
  const pause = (v) => () => { carouselPaused = v; resetCarouselAutoplay(); };
  carouselViewport.addEventListener("mouseenter", pause(true));
  carouselViewport.addEventListener("mouseleave", pause(false));
  carouselViewport.addEventListener("focusin", pause(true));
  carouselViewport.addEventListener("focusout", pause(false));
  let touchStartX = 0, touchStartY = 0;
  carouselViewport.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  carouselViewport.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Solo cuenta como deslizar si el gesto fue sobre todo horizontal: un
    // scroll vertical que empezaba sobre la foto cambiaba de imagen.
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) goToSlide(carouselIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

function closeDetail() {
  materialDetail.classList.remove("active");
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = null;
  // De regreso a donde estaba el visitante (la tarjeta de precio o el
  // botón que abrió el selector); si llegó por un enlace directo
  // (?material=ram), a la sección de precios.
  const target = detailLastFocused && document.contains(detailLastFocused) ? detailLastFocused : null;
  detailLastFocused = null;
  if (target) {
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  } else {
    document.getElementById("precios")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }
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
/* La galería mostraba SOLO la categoría "operacion": tres fotos de las casi
   cuarenta que hay cargadas desde el panel. Ahora junta todas las
   categorías y deja filtrarlas, igual que las sucursales — así se ve el
   material de verdad y las fotos que se suben no quedan escondidas. */
let GALERIA_FILTRO = "todas";

function galeriaTodasLasFotos() {
  // Se guarda de qué categoría viene cada foto para poder filtrar sin
  // volver a recorrer el JSON en cada clic.
  return (GALLERY?.categories || []).flatMap((c) => {
    const nombre = c.label || c.id;
    const total = (c.images || []).length;
    return (c.images || []).map((img, i) => {
      const generico = !img.alt || img.alt.trim() === nombre;
      const alt = generico ? `${nombre}: lote recibido${total > 1 ? `, foto ${i + 1} de ${total}` : ""}` : img.alt;
      return { ...img, alt, categoria: c.id, categoriaNombre: nombre };
    });
  });
}

function renderGalleryGeneral() {
  const grid = document.getElementById("galleryGeneral");
  const filtros = document.getElementById("galleryFilters");
  if (!grid) return;

  const todas = galeriaTodasLasFotos();
  if (!todas.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:24px;color:var(--ink-soft);">Fotos de lotes recibidos próximamente.</p>`;
    if (filtros) filtros.innerHTML = "";
    return;
  }

  // --- Botones de filtro, uno por categoría que tenga fotos ---
  if (filtros && !filtros.dataset.listo) {
    const cats = (GALLERY?.categories || []).filter((c) => (c.images || []).length);
    filtros.innerHTML =
      `<button type="button" class="galeria-filtro is-active" data-cat="todas" aria-pressed="true">Todas <span class="galeria-cuenta">${todas.length}</span></button>` +
      cats.map((c) => `<button type="button" class="galeria-filtro" data-cat="${esc(c.id)}" aria-pressed="false">${esc(c.label || c.id)} <span class="galeria-cuenta">${c.images.length}</span></button>`).join("");
    filtros.dataset.listo = "1";
    wireFilterArrowKeys(filtros);
    filtros.addEventListener("click", (e) => {
      const btn = e.target.closest(".galeria-filtro");
      if (!btn) return;
      GALERIA_FILTRO = btn.dataset.cat || "todas";
      filtros.querySelectorAll(".galeria-filtro").forEach((b) => {
        const activo = b === btn;
        b.classList.toggle("is-active", activo);
        b.setAttribute("aria-pressed", activo ? "true" : "false");
      });
      pintarFotosGaleria();
    });
  }

  pintarFotosGaleria();
}

// Cuántas fotos se muestran de entrada y cuántas más con "Ver más fotos".
// Antes se pintaban las 39 de golpe: en el teléfono eran ~3,000 px de
// fotos seguidas que casi nadie recorre.
let GALERIA_VISIBLES = [];
let GALERIA_MOSTRADAS = 0;
function galeriaPaso() {
  try { return window.matchMedia("(max-width: 700px)").matches ? 8 : 12; } catch (_e) { return 12; }
}
function tarjetaGaleria(img, i) {
  return `
    <article class="gallery-card brillo-borde reveal ${i % 4 ? "delay-" + Math.min(i % 4, 3) : ""}">
      <button type="button" class="gallery-open" data-i="${i}" aria-label="Ver en grande: ${esc(img.alt)}">
        <img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" decoding="async" onerror="this.closest('.gallery-card').style.display='none'" />
        <span class="gallery-zoom" aria-hidden="true"><i class="bi bi-arrows-fullscreen"></i></span>
      </button>
      <span class="gallery-cat-tag">${esc(img.categoriaNombre)}</span>
    </article>`;
}
function actualizarBotonMas() {
  const mas = document.getElementById("galleryMore");
  if (!mas) return;
  const restantes = GALERIA_VISIBLES.length - GALERIA_MOSTRADAS;
  mas.hidden = restantes <= 0;
  mas.textContent = `Ver más fotos (${restantes})`;
}
function pintarFotosGaleria() {
  const grid = document.getElementById("galleryGeneral");
  if (!grid) return;
  const todas = galeriaTodasLasFotos();
  GALERIA_VISIBLES = GALERIA_FILTRO === "todas"
    ? todas
    : todas.filter((img) => img.categoria === GALERIA_FILTRO);
  GALERIA_MOSTRADAS = Math.min(galeriaPaso(), GALERIA_VISIBLES.length);

  // Con un filtro puesto, la etiqueta de cada foto repetiría lo que ya
  // dice el botón activo; el CSS la esconde con esta clase.
  grid.classList.toggle("filtrada", GALERIA_FILTRO !== "todas");
  grid.innerHTML = GALERIA_VISIBLES.slice(0, GALERIA_MOSTRADAS).map(tarjetaGaleria).join("");
  actualizarBotonMas();
  observeReveals();
  if (window.__KIT__) window.__KIT__.reenganchar();
}
function mostrarMasFotos() {
  const grid = document.getElementById("galleryGeneral");
  if (!grid) return;
  const desde = GALERIA_MOSTRADAS;
  GALERIA_MOSTRADAS = Math.min(GALERIA_VISIBLES.length, desde + galeriaPaso());
  grid.insertAdjacentHTML("beforeend", GALERIA_VISIBLES.slice(desde, GALERIA_MOSTRADAS).map((img, k) => tarjetaGaleria(img, desde + k)).join(""));
  actualizarBotonMas();
  observeReveals();
  // El foco pasa a la primera foto nueva: con teclado se sigue desde ahí.
  grid.querySelector(`.gallery-open[data-i="${desde}"]`)?.focus({ preventScroll: true });
}
document.getElementById("galleryMore")?.addEventListener("click", mostrarMasFotos);
document.getElementById("galleryGeneral")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".gallery-open");
  if (btn) abrirVisor(Number(btn.dataset.i), btn);
});

/* ---------- Visor de fotos a pantalla completa ----------
   <dialog> nativo: retiene el foco, se cierra con Esc y queda por encima
   de todo sin pelear con z-index. Flechas del teclado, botones y deslizar
   con el dedo recorren las fotos del filtro activo (no solo las que ya se
   mostraron en la rejilla). */
const visor = document.getElementById("visorGaleria");
let visorIndice = 0;
let visorOrigen = null;
function mostrarEnVisor(i) {
  if (!visor || !GALERIA_VISIBLES.length) return;
  visorIndice = (i + GALERIA_VISIBLES.length) % GALERIA_VISIBLES.length;
  const img = GALERIA_VISIBLES[visorIndice];
  const el = document.getElementById("visorImg");
  el.src = img.src;
  el.alt = img.alt || "";
  document.getElementById("visorTitulo").textContent = img.categoriaNombre || "";
  document.getElementById("visorCuenta").textContent = `${visorIndice + 1} / ${GALERIA_VISIBLES.length}`;
  // Precarga la siguiente para que el cambio sea instantáneo.
  const sig = GALERIA_VISIBLES[(visorIndice + 1) % GALERIA_VISIBLES.length];
  if (sig) { const pre = new Image(); pre.src = sig.src; }
}
function abrirVisor(i, origen) {
  if (!visor || typeof visor.showModal !== "function") return;
  visorOrigen = origen || null;
  mostrarEnVisor(i);
  visor.showModal();
  document.documentElement.classList.add("modal-abierto");
}
function cerrarVisor() {
  if (visor && visor.open) visor.close();
}
if (visor) {
  visor.addEventListener("close", () => {
    document.documentElement.classList.remove("modal-abierto");
    if (visorOrigen && document.contains(visorOrigen)) visorOrigen.focus({ preventScroll: true });
  });
  document.getElementById("visorCerrar")?.addEventListener("click", cerrarVisor);
  document.getElementById("visorPrev")?.addEventListener("click", () => mostrarEnVisor(visorIndice - 1));
  document.getElementById("visorNext")?.addEventListener("click", () => mostrarEnVisor(visorIndice + 1));
  // Clic en el fondo oscuro (fuera de la foto y los controles) cierra.
  visor.addEventListener("click", (e) => { if (e.target === visor || e.target.id === "visorEscena") cerrarVisor(); });
  visor.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); mostrarEnVisor(visorIndice + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); mostrarEnVisor(visorIndice - 1); }
  });
  let x0 = 0, y0 = 0;
  visor.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  visor.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) mostrarEnVisor(visorIndice + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) cerrarVisor(); // deslizar hacia abajo cierra
  }, { passive: true });
}

// Portada de cada tarjeta: primero por id de la sucursal (Acapulco tiene
// la suya) y luego por estado. Lo que no tenga portada propia usa la de la
// comunidad: antes Chilpancingo mostraba la foto de Acapulco.
const BRANCH_PORTADAS = {
  acapulco: "icons/portadas/portada-acapulco.webp",
  puebla: "icons/portadas/portada-puebla.webp",
  aguascalientes: "icons/portadas/portada-aguascalientes.webp",
  veracruz: "icons/portadas/portada-veracruz.webp",
  guanajuato: "icons/portadas/portada-guanajuato.webp",
  cdmx: "icons/portadas/portada-cdmx.webp",
  mexico: "icons/portadas/portada-edomex.webp"
};
// Nombres cortos para los chips de filtro (el nombre completo va en la
// tarjeta). Un estado que no esté aquí usa su nombre oficial.
const ESTADO_CORTO = { cdmx: "CDMX", mexico: "EdoMéx" };

/* ---------- Sucursales y contacto directo ----------
   El título de cada tarjeta es el ESTADO; debajo, según el tipo, se muestra
   "Sucursal" (+ local si aplica) o el nombre de la persona que atiende esa
   zona. El resto de los datos (ubicación/local o cobertura + WhatsApp) va
   en el cuerpo de la tarjeta. */
function renderBranches() {
  const grid = document.getElementById("sucursalesGrid");
  if (!grid) return;
  const branches = (BRANCHES && BRANCHES.branches) || [];
  actualizarPlazas(branches.filter((b) => b.activo !== false).length);
  grid.innerHTML = branches.map((b, i) => {
    const isSucursal = b.kind === "sucursal";
    const title = getStateName(b.estado) || b.cobertura || b.ubicacion || "México";
    const subtitle = isSucursal ? (b.local ? `Sucursal · ${b.local}` : "Sucursal") : (b.nombre || "Contacto directo");
    const icon = isSucursal ? "bi-shop" : "bi-geo-alt";
    const metaLine = isSucursal ? (b.ubicacion || "") : (b.cobertura || "");
    // Solo con un número válido: uno mal capturado abría "este número no
    // existe" en WhatsApp (pasó con el de CDMX, de 11 dígitos).
    const canWrite = b.activo !== false && isWaNumber(b.whatsapp);
    const portadaSrc = BRANCH_PORTADAS[b.id] || BRANCH_PORTADAS[b.estado] || "icons/portadas/portada-comunidad.webp";
    // El mensaje dice "sucursal" solo cuando lo es; a un contacto de
    // recolección a domicilio no se le entrega nada "en la sucursal".
    const donde = isSucursal ? `la sucursal de ${title}` : (b.cobertura || title);
    const saludo = "Hola " + (b.nombre ? b.nombre + ", " : "");
    // isSafeHttpUrl() bloquea esquemas peligrosos (javascript:, data:, etc.)
    // — sin esto, un enlace de grupo guardado con ese esquema se ejecutaría
    // al hacer clic cualquier visitante del sitio.
    const groupLink = b.grupoUrl && isSafeHttpUrl(b.grupoUrl)
      ? b.grupoUrl
      : (canWrite ? waLinkTo(b.whatsapp, saludo + "me interesa unirme al grupo oficial de WhatsApp de " + title) : "");
    // Un solo botón de WhatsApp con el número a la vista (antes el número
    // y "Escribir a encargado" eran dos enlaces al MISMO chat). El avatar
    // del grupo va dentro del botón del grupo, que es donde se reconoce:
    // como insignia de la tarjeta, a 48 px, los 9 avatares se veían iguales.
    const telefono = formatMexPhone(b.whatsapp);
    const encargado = b.nombre ? b.nombre : "";
    return `
    <article class="sucursal-card brillo-borde reveal ${i ? "delay-" + Math.min(i, 3) : ""} ${b.primary ? "is-primary" : ""}" data-estado="${esc(b.estado || "")}">
      <div class="sucursal-top">
        <span class="sucursal-icon"><i class="bi ${icon}" aria-hidden="true"></i></span>
        <div class="sucursal-head"><h3>${esc(title)}</h3><p>${esc(subtitle)}</p></div>
      </div>
      <div class="sucursal-bottom">
        ${metaLine ? `<p class="sucursal-meta"><i class="bi ${isSucursal ? "bi-shop-window" : "bi-signpost-2"}" aria-hidden="true"></i><span>${esc(metaLine)}</span></p>` : ""}
        ${isSucursal && encargado ? `<p class="sucursal-encargado">Encargado: ${esc(encargado)}</p>` : ""}
        ${canWrite
          ? `<div class="sucursal-actions">
               <a class="btn sucursal-wa-btn" href="${esc(waLinkTo(b.whatsapp, saludo + "me interesa entregar o cotizar material en " + donde))}" target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp ${encargado ? "a " + esc(encargado) + " " : ""}al ${esc(telefono)}, ${esc(title)}"><i class="bi bi-whatsapp" aria-hidden="true"></i><span class="sucursal-num">${esc(telefono)}</span></a>
               ${groupLink ? `<a class="btn sucursal-group-btn" href="${esc(groupLink)}" target="_blank" rel="noopener noreferrer"><img class="sucursal-grupo-avatar" src="${esc(portadaSrc)}" alt="" width="24" height="24" loading="lazy" onerror="this.remove()" /> Unirme al grupo</a>` : ""}
             </div>`
          : `<p class="sucursal-proximamente"><i class="bi bi-hourglass-split" aria-hidden="true"></i> Próximamente</p>`}
      </div>
    </article>`;
  }).join("") + `<p class="sucursales-vacio" id="sucursalesVacio" hidden>No hay contactos en este estado todavía. Escríbenos al chat general y te atendemos.</p>`;
  renderSucursalesChips(branches);
  initSucursalesFilter();
  observeReveals();
}

// Un chip por estado con contacto, en el orden en que aparecen en los
// datos, con cuántos contactos tiene. "Todos" es el único fijo en el HTML.
function renderSucursalesChips(branches) {
  const bar = document.getElementById("sucursalesFilterBar");
  if (!bar) return;
  const counts = new Map();
  branches.forEach((b) => { if (b.estado) counts.set(b.estado, (counts.get(b.estado) || 0) + 1); });
  bar.querySelectorAll(".sucursal-filter-chip:not([data-filter=\"all\"])").forEach((c) => c.remove());
  const todos = bar.querySelector("[data-filter=\"all\"]");
  if (todos) {
    todos.classList.add("is-active");
    todos.setAttribute("aria-pressed", "true");
  }
  counts.forEach((n, estado) => {
    const nombre = ESTADO_CORTO[estado] || getStateName(estado) || estado;
    bar.insertAdjacentHTML("beforeend",
      `<button type="button" class="sucursal-filter-chip" data-filter="${esc(estado)}" aria-pressed="false">${esc(nombre)}${n > 1 ? ` <span class="galeria-cuenta">${n}</span>` : ""}</button>`);
  });
}

// La banda de garantías anunciaba "7 plazas" escrito a mano mientras
// data/branches.json ya tenía 9. Se toma del mismo dato que pinta las
// tarjetas (solo las activas), así no se puede volver a desfasar.
function actualizarPlazas(total) {
  const el = document.getElementById("trustPlazas");
  if (el && total > 0) el.textContent = total;
}

function initSucursalesFilter() {
  const filterBar = document.getElementById("sucursalesFilterBar");
  if (!filterBar || filterBar.dataset.bound === "true") return;
  filterBar.dataset.bound = "true";
  wireFilterArrowKeys(filterBar);
  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".sucursal-filter-chip");
    if (!btn) return;
    filterBar.querySelectorAll(".sucursal-filter-chip").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const filter = btn.dataset.filter || "all";
    let visibles = 0;
    document.querySelectorAll(".sucursal-card").forEach((card) => {
      const match = filter === "all" || card.dataset.estado === filter;
      card.hidden = !match;
      if (match) visibles++;
    });
    const vacio = document.getElementById("sucursalesVacio");
    if (vacio) vacio.hidden = visibles > 0;
  });
}

/* ---------- Quiénes somos ---------- */
function initials(name) {
  return String(name || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
}
function renderTeam() {
  const section = document.getElementById("equipo");
  const grid = document.getElementById("teamGrid");
  const navItem = document.getElementById("navTeamItem");
  
  const members = ((TEAM && TEAM.members) || []).filter((m) => (m.name || "").trim());
  const hasMembers = members.length > 0;
  
  if (navItem) navItem.hidden = !hasMembers;
  
  if (!section || !grid) return;
  
  if (!hasMembers) {
    // En su propia página (nosotros.html) no se deja la sección en blanco.
    grid.innerHTML = `<p class="team-vacio">Muy pronto conocerás aquí a nuestro equipo. Mientras tanto, escríbenos por WhatsApp.</p>`;
    return;
  }
  
  section.hidden = false;
  grid.innerHTML = members.map((m, i) => `
    <article class="team-card brillo-borde reveal ${i ? "delay-" + Math.min(i, 3) : ""}">
      <div class="team-photo">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy" />` : `<span class="team-photo-fallback">${esc(initials(m.name))}</span>`}</div>
      <h3 class="team-name">${esc(m.name)}</h3>
      <p class="team-role">${esc(m.role || "")}</p>
      <div class="team-contacts">
        ${isWaNumber(m.whatsapp) ? `<a class="team-contact-link" href="${waLinkTo(m.whatsapp, "Hola, quiero contactarte por Eco Lógica García")}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de ${esc(m.name)}"><i class="bi bi-whatsapp" aria-hidden="true"></i></a>` : ""}
        ${m.email ? `<a class="team-contact-link" href="mailto:${esc(m.email)}" aria-label="Correo de ${esc(m.name)}"><i class="bi bi-envelope" aria-hidden="true"></i></a>` : ""}
        ${(m.social || []).filter((s) => isSafeHttpUrl(s.url)).map((s) => `<a class="team-contact-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.network)} de ${esc(m.name)}"><i class="bi ${SOCIAL_ICONS[s.network] || "bi-globe2"}" aria-hidden="true"></i></a>`).join("")}
      </div>
    </article>
  `).join("");
  observeReveals();
}

/* ---------- Redes sociales ---------- */
const SOCIAL_ICONS = { facebook: "bi-facebook", whatsapp: "bi-whatsapp", instagram: "bi-instagram", tiktok: "bi-tiktok", youtube: "bi-youtube", x: "bi-twitter-x", other: "bi-globe2" };
function renderSocial() {
  const links = ((SOCIAL && SOCIAL.links) || []).filter((l) => isSafeHttpUrl(l.url));
  document.querySelectorAll(".js-social-links").forEach((wrap) => {
    wrap.innerHTML = links.map((l) => `
      <a class="social-link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(l.label || l.network)}">
        <i class="bi ${SOCIAL_ICONS[l.network] || "bi-globe2"}" aria-hidden="true"></i>
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
      <h3 class="faq-h">
        <button class="faq-q" type="button" id="faq-q-${i}" aria-expanded="false" aria-controls="faq-panel-${i}">
          <span>${esc(f.q)}</span>
          <i class="bi bi-plus-lg" aria-hidden="true"></i>
        </button>
      </h3>
      <div class="faq-a" id="faq-panel-${i}" role="region" aria-labelledby="faq-q-${i}" aria-hidden="true" inert><p>${esc(f.a)}</p></div>
    </div>
  `).join("");
  list.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      // Cerrada, la respuesta queda fuera del árbol accesible (aria-hidden)
      // y del orden de Tab (inert): antes el lector de pantalla leía todas
      // las respuestas aunque estuvieran "cerradas".
      list.querySelectorAll(".faq-item").forEach((other) => {
        const otherA = other.querySelector(".faq-a");
        other.classList.remove("is-open");
        otherA.style.maxHeight = null;
        otherA.setAttribute("aria-hidden", "true");
        otherA.inert = true;
        other.querySelector(".faq-q i").className = "bi bi-plus-lg";
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + 24 + "px";
        a.setAttribute("aria-hidden", "false");
        a.inert = false;
        q.querySelector("i").className = "bi bi-dash-lg";
        q.setAttribute("aria-expanded", "true");
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
// Si una sección falla al renderizar (por ejemplo, un data/*.json con una
// forma inesperada), que solo se rompa ESA sección y no toda la página: sin
// esto, un solo error sin atrapar en cualquiera de las llamadas de abajo
// detenía renderEverything() a la mitad y dejaba el resto del sitio (precios,
// galería, sucursales, etc.) sin renderizar, con la página en blanco.
function safeRender(label, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[render] Falló "${label}":`, err);
  }
}

function renderEverything() {
  safeRender("applyWaLinks", applyWaLinks);
  safeRender("renderPrices", renderPrices);
  safeRender("renderCalculator", renderCalculator);
  safeRender("renderSelector", renderSelector);
  safeRender("renderGalleryGeneral", renderGalleryGeneral);
  safeRender("renderBranches", renderBranches);
  safeRender("renderTeam", renderTeam);
  safeRender("renderSocial", renderSocial);
  safeRender("renderCoverageStats", renderCoverageStats);
  safeRender("renderFAQ", renderFAQ);
  // js/motion.js espera esta bandera para animar los contadores: si cuenta
  // antes, cuenta hasta el número de relleno del HTML ("5+") y lo deja ahí.
  window.__DATOS_LISTOS__ = true;
  observeReveals();
  // Las tarjetas recién pintadas traen botones magnéticos que aún no
  // tienen su listener; js/ui.js los engancha aquí.
  if (window.__KIT__) window.__KIT__.reenganchar();

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
  // Los mismos colores que el <meta> del HTML y el manifest (Verde
  // profundo / Carbón de la paleta oficial).
  if (meta) meta.setAttribute("content", isDark ? "#0B1F13" : "#0B3B22");
  if (themeToggle) themeToggle.setAttribute("aria-label", isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
}
// Solo se GUARDA cuando la persona elige con el botón. Antes se guardaba
// también el tema automático, y desde la primera visita el sitio dejaba de
// seguir al sistema (el teléfono pasaba a oscuro de noche y el sitio no).
function saveTheme(isDark) {
  try { localStorage.setItem("theme-preference", isDark ? "dark" : "light"); } catch (_e) {}
}
function savedTheme() {
  try { return localStorage.getItem("theme-preference"); } catch (_e) { return null; }
}
function initTheme() {
  const saved = savedTheme();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  applyTheme(saved ? saved === "dark" : prefersDark.matches);
  themeToggle?.addEventListener("click", () => {
    const next = !document.body.classList.contains("dark-mode");
    applyTheme(next);
    saveTheme(next);
  });
  const onChange = (e) => { if (!savedTheme()) applyTheme(e.matches); };
  if (prefersDark.addEventListener) prefersDark.addEventListener("change", onChange);
  else if (prefersDark.addListener) prefersDark.addListener(onChange); // Safari < 14
}
initTheme();

/* ---------- Navegación, menú móvil, header con scroll ---------- */
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const siteHeader = document.getElementById("siteHeader");
const scrollProgress = document.getElementById("scrollProgress");

function setMenu(open) {
  if (!navLinks || !menuBtn) return;
  // Se mide justo antes de abrir: el header cambia de alto al pegarse
  // arriba (y la barra superior desaparece), y con la medida de la carga el
  // menú quedaba 34 px separado del header o encimado sobre él.
  if (open) updateHeaderOffset();
  navLinks.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Cerrar" : "Menú";
}
menuBtn?.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinks?.classList.contains("open")) {
    setMenu(false);
    menuBtn.focus();
  }
});

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
// El atributo hidden solo protege la carga sin JS; a partir de aquí lo
// esconde el CSS (opacity + visibility, que lo saca del orden de Tab).
if (backToTopBtn) backToTopBtn.hidden = false;
backToTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
  // El foco sube con la página, para que el siguiente Tab no siga abajo.
  document.getElementById("contenido")?.focus({ preventScroll: true });
});

/* La marca grande de la portada encoge y se desvanece mientras el
   logotipo de la barra aparece. Se resuelve con UNA variable CSS
   (--marca-p, de 0 a 1) en vez de con GSAP, por dos motivos: en móvil
   GSAP ni se carga, y aquí ya había un listener de scroll, así que no se
   añade ninguno nuevo. El CSS (css/kit.css) hace el resto. */
const marcaIntro = document.getElementById("marcaIntro");
// Distancia en la que ocurre toda la transición. Deliberadamente corta:
// esto es un sitio para cotizar, no una presentación, y nadie debería
// tener que desplazarse media pantalla para llegar al contenido.
const MARCA_RECORRIDO = 220;

// Le avisa al CSS que puede esconder el logotipo de la barra, porque hay
// JS vivo para volver a mostrarlo al bajar. Si este archivo no llegara a
// ejecutarse, la clase no se pone y el logotipo se queda visible.
// Con "reducir movimiento" no hay transición: la marca grande no se
// muestra (kit.css) y el logotipo de la barra se queda visible desde arriba.
let quieroMenosMovimiento = false;
try { quieroMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (_e) {}
if (marcaIntro && !quieroMenosMovimiento) document.body.classList.add("marca-activa");

let marcaUltimo = -1;
function actualizarMarca(scrollTop) {
  if (!marcaIntro) return;
  const p = Math.min(1, Math.max(0, scrollTop / MARCA_RECORRIDO));
  // Dos decimales: sin redondear se escribiría un valor nuevo en cada
  // píxel de scroll, y cada escritura cuesta un recálculo de estilo.
  const v = Math.round(p * 50) / 50;
  if (v === marcaUltimo) return;
  marcaUltimo = v;

  // La variable se escribe en el PROPIO elemento, no en :root.
  // Esto importa mucho: una propiedad personalizada puesta en :root
  // invalida el estilo de TODO el documento en cada cambio, y este sitio
  // ronda los dos mil nodos (la galería sola son 39 tarjetas). Medido en
  // un móvil de gama baja, hacerlo en :root hundía el desplazamiento de
  // 60 a 28 fps; acotado al elemento, no cuesta nada.
  marcaIntro.style.setProperty("--marca-p", v);

  // El logotipo de la barra no necesita interpolarse: basta con saber si
  // ya toca mostrarlo. Una clase en <body> evita una segunda variable
  // global y deja la transición al CSS.
  document.body.classList.toggle("marca-fuera", v > 0.55);
}

// El recorrido máximo se mide aparte (al cargar, al cambiar el tamaño de
// la página) y no en cada evento de scroll: leer scrollHeight justo después
// de escribir estilos obligaba al navegador a recalcular el layout en
// cada cuadro.
let maxScroll = 1;
function medirScroll() {
  maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}
medirScroll();
window.addEventListener("resize", medirScroll);
window.addEventListener("load", medirScroll);
if (window.ResizeObserver) new ResizeObserver(medirScroll).observe(document.body);

function onScroll() {
  const scrollTop = window.scrollY;
  siteHeader?.classList.toggle("is-scrolled", scrollTop > 8);
  actualizarMarca(scrollTop);
  // Cuando js/motion.js está activo, la barra la mueve GSAP; aquí solo se
  // calcula si no hay GSAP. scaleX (compositor) en vez de width (layout).
  if (scrollProgress && !(window.__MOTION__ && window.__MOTION__.activo)) {
    scrollProgress.style.width = "100%";
    scrollProgress.style.transform = `scaleX(${Math.min(1, scrollTop / maxScroll)})`;
  }
  backToTopBtn?.classList.toggle("is-visible", scrollTop > window.innerHeight * 0.8);
}
// Un cálculo por cuadro como máximo: el evento scroll dispara muchas más
// veces de las que se pinta.
let scrollPendiente = false;
window.addEventListener("scroll", () => {
  if (scrollPendiente) return;
  scrollPendiente = true;
  requestAnimationFrame(() => { scrollPendiente = false; onScroll(); });
}, { passive: true });
onScroll();

// Secciones que resaltan su enlace del menú al pasar por ellas.
// ("Quiénes somos" ahora es su propia página, nosotros.html.)
const sections = ["inicio", "precios", "calculadora", "proceso", "sucursales", "cobertura", "galeria", "faq"];
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
// En escritorio, index.html empieza a bajar GSAP antes de que corra este
// archivo (window.__MOTION_ESPERADO__). Se le da un momento para llegar
// antes de usar el respaldo: si el respaldo mostraba la portada primero,
// al llegar GSAP la volvía a esconder y animar (entrada doble).
const MOTION_ESPERA_MS = 1500;
let motionEsperaVencida = false;
let motionEsperaTimer = null;
function observeReveals() {
  // Si js/motion.js logró cargar GSAP, él se encarga de todas las apariciones
  // (con mucho más detalle que esto) y aquí no hay nada que hacer. Este
  // camino queda como respaldo para cuando el CDN de GSAP esté bloqueado.
  if (window.__MOTION__ && window.__MOTION__.activo) {
    window.__MOTION__.refrescar();
    return;
  }
  if (window.__MOTION_ESPERADO__ && !motionEsperaVencida) {
    if (!motionEsperaTimer) {
      motionEsperaTimer = setTimeout(() => { motionEsperaVencida = true; observeReveals(); }, MOTION_ESPERA_MS);
    }
    return;
  }
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
  // Ya no hay temporizador de respaldo: el contenido solo nace en opacity:0
  // cuando html lleva la clase js-motion, y esa clase se pone desde un script
  // en línea del <head> que solo corre si el JS está vivo. Si algo falla más
  // adelante, la página simplemente nunca se oculta. El temporizador anterior
  // (1800 ms) revelaba TODA la página sin que el usuario hiciera scroll, así
  // que en la práctica anulaba el efecto que se supone que protegía.
}

/* La inclinación 3D del hero con el puntero vive ahora en js/motion.js, junto
   con el parallax, para que un solo dueño escriba el transform de .hero-media.
   La versión que estaba aquí nunca llegó a verse: escribía style.transform,
   pero .hero-media tenía "animation: floatSoft" y las animaciones CSS ganan
   sobre los estilos en línea, así que el flotado la pisaba siempre. */

/* ---------- Mapa de cobertura (Leaflet) ---------- */
let coverageMapInstance = null;
let DATOS_LISTOS = null;   // promesa de loadData(), para que el mapa la espere

// leaflet.css ya no se carga en el <head> (bloqueaba el primer render de
// toda la página por un mapa que vive hasta abajo del sitio); se inyecta
// aquí, justo antes de crear el mapa, la primera vez que el visitante
// llega a esa sección.
function ensureLeafletCss() {
  if (document.getElementById("leafletCssLink")) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.id = "leafletCssLink";
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    link.onload = () => resolve();
    link.onerror = () => resolve(); // si falla, initCoverageMap ya tiene su propio aviso de respaldo
    document.head.appendChild(link);
  });
}

// Hermana de ensureLeafletCss(): la biblioteca en sí también se baja solo
// cuando "Cobertura" se acerca a pantalla. Antes venía en un <script> normal
// de index.html, 147 KB que bloqueaban el render de toda la página por un
// mapa que está hasta el final y que mucha gente nunca llega a ver.
let leafletJsPromesa = null;
function ensureLeafletJs() {
  if (typeof window.L !== "undefined") return Promise.resolve();
  if (leafletJsPromesa) return leafletJsPromesa;
  leafletJsPromesa = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
    s.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    s.crossOrigin = "";
    // Resolvemos igual si falla: initCoverageMap ya tiene su aviso de respaldo
    // para cuando window.L no existe, así que no hace falta distinguir aquí.
    s.onload = resolve;
    s.onerror = resolve;
    document.head.appendChild(s);
  });
  return leafletJsPromesa;
}

function initCoverageMap() {
  const mapContainer = document.getElementById("coverageMap");
  if (!mapContainer || coverageMapInstance) return;
  const active = getActiveStates();
  if (typeof window.L === "undefined") {
    mapContainer.innerHTML = `<p class='map-fallback'>No se pudo cargar el mapa. Cobertura activa en ${active.length} estado(s); el resto del país aplica desde 10 kg.</p>`;
    return;
  }
  // En pantallas táctiles el mapa no se arrastra con un dedo: si no, al
  // deslizar sobre él para bajar por la página, el que se movía era el
  // mapa y la página se quedaba "atorada". Se sigue pudiendo usar el zoom.
  let tactil = false;
  try { tactil = window.matchMedia("(pointer: coarse)").matches; } catch (_e) {}
  coverageMapInstance = window.L.map(mapContainer, {
    scrollWheelZoom: false, dragging: !tactil, tap: false, minZoom: 4, maxZoom: 10, zoomControl: false,
  });
  window.L.control.zoom({ zoomInTitle: "Acercar", zoomOutTitle: "Alejar" }).addTo(coverageMapInstance);
  // Servidor de mosaicos actual de OpenStreetMap (los subdominios a/b/c
  // están en desuso).
  window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
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
    // title/alt: los marcadores se pueden enfocar con Tab y antes no
    // tenían nombre para el lector de pantalla.
    window.L.marker(coords, { icon, title: state.name, alt: `Cobertura activa en ${state.name}` }).addTo(coverageMapInstance)
      .bindPopup(`<strong>${esc(state.name)}</strong><br/>Cobertura activa`);
  });
  if (bounds.length) coverageMapInstance.fitBounds(bounds, { padding: [30, 30] });
  else coverageMapInstance.setView([23.6345, -102.5528], 5);
}
if ("IntersectionObserver" in window) {
  const coverageSection = document.getElementById("cobertura");
  if (coverageSection) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        mapObserver.disconnect();
        // Esperamos también a DATOS_LISTOS: si alguien llega directo a
        // #cobertura (o baja muy rápido) antes de que resuelvan los JSON, el
        // mapa se dibujaba con los estados de respaldo y se quedaba así,
        // porque initCoverageMap solo corre una vez.
        Promise.all([
          Promise.resolve(DATOS_LISTOS),
          ensureLeafletCss(),
          ensureLeafletJs(),
        ]).then(() => initCoverageMap());
      });
    }, { threshold: 0.2 });
    mapObserver.observe(coverageSection);
  }
}

/* ---------- Arranque ---------- */
// Lo que ya viene en el HTML (el hero, los títulos) se revela sin esperar a
// los seis JSON: en una red móvil lenta el titular y el botón de WhatsApp
// se quedaban invisibles hasta que terminaba de llegar todo.
observeReveals();
DATOS_LISTOS = loadData();
