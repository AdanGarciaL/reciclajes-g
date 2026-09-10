/* =========================================================
   ECO LÓGICA García — Panel interno
   No hay base de datos: los cambios se guardan directamente
   en el repositorio de GitHub (data/prices.json y
   data/gallery.json) usando la API de contenidos de GitHub.
   El login de usuario/contraseña es solo una cortina de acceso
   en el navegador; la escritura real está protegida por el
   token de GitHub que cada persona conecta en su sesión.
   ========================================================= */

// Escapa texto antes de insertarlo como HTML (nombres, notas, alt de fotos).
// Aunque este panel es solo para el equipo, así un caracter especial nunca
// rompe el render ni termina interpretándose como HTML.
const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

function formatMexPhone(rawDigits) {
  let d = String(rawDigits || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("52")) d = d.slice(2);
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d;
}
function stripCountry(rawDigits) {
  const d = String(rawDigits || "").replace(/\D/g, "");
  return d.length === 12 && d.startsWith("52") ? d.slice(2) : d;
}
function normalizeWhatsapp(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.length === 10) d = "52" + d;
  return d;
}
function initials(name) {
  return String(name || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
}

/* Los 32 estados de la República: mismo catálogo fijo que usa el sitio
   público (script.js) para el mapa. Aquí solo sirve para llenar el selector
   de "agregar estado" — cuáles están activos vive en data/coverage.json. */
const MEXICO_STATES = [
  { id: "aguascalientes", name: "Aguascalientes" },
  { id: "baja-california", name: "Baja California" },
  { id: "baja-california-sur", name: "Baja California Sur" },
  { id: "campeche", name: "Campeche" },
  { id: "chiapas", name: "Chiapas" },
  { id: "chihuahua", name: "Chihuahua" },
  { id: "cdmx", name: "Ciudad de México" },
  { id: "coahuila", name: "Coahuila" },
  { id: "colima", name: "Colima" },
  { id: "durango", name: "Durango" },
  { id: "guanajuato", name: "Guanajuato" },
  { id: "guerrero", name: "Guerrero" },
  { id: "hidalgo", name: "Hidalgo" },
  { id: "jalisco", name: "Jalisco" },
  { id: "mexico", name: "Estado de México" },
  { id: "michoacan", name: "Michoacán" },
  { id: "morelos", name: "Morelos" },
  { id: "nayarit", name: "Nayarit" },
  { id: "nuevo-leon", name: "Nuevo León" },
  { id: "oaxaca", name: "Oaxaca" },
  { id: "puebla", name: "Puebla" },
  { id: "queretaro", name: "Querétaro" },
  { id: "quintana-roo", name: "Quintana Roo" },
  { id: "san-luis-potosi", name: "San Luis Potosí" },
  { id: "sinaloa", name: "Sinaloa" },
  { id: "sonora", name: "Sonora" },
  { id: "tabasco", name: "Tabasco" },
  { id: "tamaulipas", name: "Tamaulipas" },
  { id: "tlaxcala", name: "Tlaxcala" },
  { id: "veracruz", name: "Veracruz" },
  { id: "yucatan", name: "Yucatán" },
  { id: "zacatecas", name: "Zacatecas" },
];
const TOTAL_MEXICO_STATES = MEXICO_STATES.length;

const REPO_OWNER = "AdanGarciaL";
const REPO_NAME = "reciclajes-g";
const REPO_BRANCH = "main";
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

const SESSION_KEY = "ecoLogicaAdminSession";
const TOKEN_KEY = "ecoLogicaAdminGhToken";

/* Usuarios: la contraseña se compara como hash SHA-256, nunca en texto plano. */
const ADMIN_USERS = [
  { username: "AdanGL", hash: "d7c1db7e2d90a65563bd7037cea28d28e899dcca42b55e66bdd3f4be09cba056" },
  { username: "KarlaGL", hash: "ea2118429e56fdb417cf12c5ddc9fc462f555b565183fd9c1bf1722f4be55359" },
  { username: "SusanaGL", hash: "a596dbca04aca3f15db134f245e353f714336c88679c400587e6c4d287fdf4d4" },
];

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- Tema ---------- */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  if (themeIcon) themeIcon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-fill";
  try { localStorage.setItem("theme-preference", isDark ? "dark" : "light"); } catch (_e) {}
}
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("theme-preference"); } catch (_e) {}
  applyTheme(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  themeToggle?.addEventListener("click", () => applyTheme(!document.body.classList.contains("dark-mode")));
})();

/* ---------- Login / sesión ---------- */
const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");
const adminApp = document.getElementById("adminApp");
const whoAmI = document.getElementById("whoAmI");

function showLoginError(text) {
  loginMsg.textContent = text;
  loginMsg.classList.add("is-error");
}
function clearLoginError() {
  loginMsg.textContent = "";
  loginMsg.classList.remove("is-error");
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearLoginError();
  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value;
  if (!username || !password) return;

  const user = ADMIN_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
  const hash = await sha256Hex(password);
  if (!user || user.hash !== hash) {
    showLoginError("Usuario o contraseña incorrectos.");
    return;
  }

  try { sessionStorage.setItem(SESSION_KEY, user.username); } catch (_e) {}
  enterApp(user.username);
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  // Salir de la sesión NO desconecta la computadora del guardado: la llave
  // de GitHub vive por dispositivo (localStorage), no por persona. Así el
  // resto del equipo puede entrar con su propio usuario sin reconfigurar nada.
  try { sessionStorage.removeItem(SESSION_KEY); } catch (_e) {}
  window.location.reload();
});

async function enterApp(username) {
  loginScreen.hidden = true;
  adminApp.hidden = false;
  whoAmI.textContent = username;
  // Espera la conexión con GitHub antes de cargar los datos: así, si el
  // fetch local falla (ver fetchJsonOrFromGitHub), ya hay una llave lista
  // para leerlos directo de la API de GitHub en el primer intento.
  await initGitHubConnection();
  loadPricesIntoForm();
  loadGalleryIntoUI();
  loadTeamIntoForm();
  loadBranchesIntoForm();
  loadCoverageAndSocialIntoForm();
}

(function checkExistingSession() {
  let existing = null;
  try { existing = sessionStorage.getItem(SESSION_KEY); } catch (_e) {}
  if (existing) enterApp(existing);
})();

/* ---------- Pestañas ---------- */
const TAB_PANEL_MAP = {
  precios: "panelPrecios",
  galeria: "panelGaleria",
  equipo: "panelEquipo",
  sucursales: "panelSucursales",
  cobertura: "panelCobertura",
};
document.querySelectorAll(".app-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".app-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
    const targetId = TAB_PANEL_MAP[tab.dataset.tab];
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("is-active", p.id === targetId));
  });
});

/* =========================================================
   Cliente de GitHub (API de contenidos)
   ========================================================= */
let ghToken = null;
let ghUsername = null;
let ghCanWrite = false;

function ghHeaders() {
  return {
    Authorization: `Bearer ${ghToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

// Estado visible en dos lugares: la pastilla del header (siempre visible) y
// el modal de Ajustes (solo al abrirlo). Ambos se actualizan juntos.
function setGhStatus(state, text) {
  const pillDot = document.getElementById("ghDot");
  const modalDot = document.getElementById("ghDotModal");
  const pillText = document.getElementById("connPillText");
  const modalText = document.getElementById("ghStatusText");
  [pillDot, modalDot].forEach((dot) => {
    if (!dot) return;
    dot.classList.remove("is-connected", "is-error");
    if (state === "ok") dot.classList.add("is-connected");
    if (state === "error") dot.classList.add("is-error");
  });
  const pillLabel = state === "ok" ? "Guardado: activo" : state === "error" ? "Guardado: con problema" : "Configurar guardado";
  if (pillText) pillText.textContent = pillLabel;
  if (modalText) modalText.textContent = text;

  const banner = document.getElementById("connectBanner");
  if (banner) banner.hidden = state === "ok";
}

async function connectGitHub(token) {
  setGhStatus("pending", "Conectando…");
  try {
    const userRes = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
    if (!userRes.ok) throw new Error(userRes.status === 401 ? "Esa llave no es válida o ya venció." : `Error al validar la llave (${userRes.status}).`);
    const userData = await userRes.json();

    const repoRes = await fetch(API_BASE, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
    if (!repoRes.ok) throw new Error(repoRes.status === 404
      ? "Esta llave no tiene acceso a este repositorio (revisa que el token incluya reciclajes-g)."
      : `No se pudo leer el repositorio con esta llave (${repoRes.status}).`);
    const repoData = await repoRes.json();
    // Un token de acceso detallado ("fine-grained", el que recomendamos en
    // Ajustes) casi nunca trae el objeto "permissions" en esta respuesta,
    // así que solo lo tratamos como señal de que NO puede escribir cuando
    // dice explícitamente push:false. Si no viene, asumimos que sí puede
    // guardar (el token se configuró con "Contents: Read and write") y es
    // el propio guardado el que confirma o avisa si en verdad no puede.
    const canWrite = !(repoData.permissions && repoData.permissions.push === false);

    ghToken = token;
    ghUsername = userData.login;
    ghCanWrite = canWrite;
    // Vive en localStorage a propósito: es una configuración del DISPOSITIVO
    // (se hace una sola vez por computadora), no de cada sesión de login.
    try { localStorage.setItem(TOKEN_KEY, token); } catch (_e) {}

    setGhStatus(canWrite ? "ok" : "error", canWrite
      ? `Conectado como ${userData.login} · esta computadora ya puede guardar cambios`
      : `Conectado como ${userData.login}, pero esta llave no tiene permiso de escritura en el repositorio`);
    document.getElementById("ghConnectBtn").hidden = true;
    document.getElementById("ghDisconnectBtn").hidden = false;
    document.getElementById("ghToken").value = "";
    return true;
  } catch (err) {
    ghToken = null; ghUsername = null; ghCanWrite = false;
    setGhStatus("error", err.message || "No se pudo conectar.");
    return false;
  }
}

function disconnectGitHub() {
  ghToken = null; ghUsername = null; ghCanWrite = false;
  try { localStorage.removeItem(TOKEN_KEY); } catch (_e) {}
  setGhStatus("idle", "Esta computadora no está conectada.");
  document.getElementById("ghConnectBtn").hidden = false;
  document.getElementById("ghDisconnectBtn").hidden = true;
}

/* ---------- Modal de Ajustes ---------- */
const settingsModal = document.getElementById("settingsModal");
function openSettings() {
  settingsModal?.classList.add("active");
  settingsModal?.setAttribute("aria-hidden", "false");
}
function closeSettings() {
  settingsModal?.classList.remove("active");
  settingsModal?.setAttribute("aria-hidden", "true");
}

// Devuelve una promesa: los formularios esperan a que esto termine antes de
// cargar datos, así, si ya hay una llave guardada, pueden usarla como
// respaldo para leer los JSON directo de GitHub cuando la ruta local falla
// (por ejemplo, si esta página se abrió con doble clic en vez de con un
// servidor: ver fetchJsonOrFromGitHub más abajo).
async function initGitHubConnection() {
  setGhStatus("idle", "Revisando conexión…");

  document.getElementById("connPill")?.addEventListener("click", openSettings);
  document.getElementById("connectBannerBtn")?.addEventListener("click", openSettings);
  document.getElementById("settingsClose")?.addEventListener("click", closeSettings);
  document.getElementById("settingsOverlay")?.addEventListener("click", closeSettings);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && settingsModal?.classList.contains("active")) closeSettings();
  });

  document.getElementById("ghConnectBtn").addEventListener("click", async () => {
    const token = document.getElementById("ghToken").value.trim();
    if (!token) return;
    const ok = await connectGitHub(token);
    if (ok) setTimeout(closeSettings, 900);
  });
  document.getElementById("ghDisconnectBtn").addEventListener("click", disconnectGitHub);

  let savedToken = null;
  try { savedToken = localStorage.getItem(TOKEN_KEY); } catch (_e) {}
  if (savedToken) {
    await connectGitHub(savedToken);
  } else {
    setGhStatus("idle", "Esta computadora todavía no está conectada.");
  }
}

function requireGitHub(statusElId) {
  if (!ghToken || !ghCanWrite) {
    if (statusElId) showStatus(statusElId, "error", "Esta computadora no está conectada para guardar. Se abrió Ajustes para configurarla.");
    openSettings();
    return false;
  }
  return true;
}

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function base64ToUtf8(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\n/g, ""))));
}

async function ghGetFile(path) {
  const res = await fetch(`${API_BASE}/contents/${encodeURI(path)}?ref=${REPO_BRANCH}`, { headers: ghHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`No se pudo leer ${path} (${res.status}).`);
  return res.json();
}

async function ghPutFile(path, base64Content, message, sha) {
  const body = { message, content: base64Content, branch: REPO_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`${API_BASE}/contents/${encodeURI(path)}`, {
    method: "PUT", headers: { ...ghHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `No se pudo guardar ${path} (${res.status}).`);
  }
  return res.json();
}

/** Guarda JSON en el repo, reintenta una vez si el sha cambió (409/422). */
async function ghSaveJson(path, dataObject, message) {
  const existing = await ghGetFile(path);
  const content = utf8ToBase64(JSON.stringify(dataObject, null, 2) + "\n");
  try {
    return await ghPutFile(path, content, message, existing ? existing.sha : undefined);
  } catch (err) {
    const fresh = await ghGetFile(path);
    return ghPutFile(path, content, message, fresh ? fresh.sha : undefined);
  }
}

/* =========================================================
   Carga resiliente de los archivos de data/
   La ruta normal es un fetch relativo (funciona en GitHub Pages o en
   cualquier servidor local). Eso falla si esta página se abre con doble
   clic desde el explorador de archivos (protocolo file://): los
   navegadores bloquean ese tipo de lectura por seguridad. Como respaldo,
   si ya hay una llave de GitHub conectada, se lee el archivo actual
   directo de la API de GitHub (que sí funciona bajo file://, porque es
   una petición normal a otro sitio, no una lectura de disco). Solo si
   ambos caminos fallan se avisa con un mensaje claro, en vez de dejar
   la sección en blanco sin explicación.
   ========================================================= */
let dataLoadFailed = false;
function showDataUnavailableBanner() {
  dataLoadFailed = true;
  const banner = document.getElementById("dataUnavailableBanner");
  if (banner) banner.hidden = false;
}
// Si algo no cargó, los datos "de trabajo" de esa sección quedan vacíos por
// dentro; guardar en ese estado borraría el archivo real. Bloquea CUALQUIER
// guardado mientras falte cargar algo, hasta recargar la página con éxito.
function guardDataLoaded(statusElId) {
  if (dataLoadFailed) {
    showStatus(statusElId, "error", "No se pudo cargar la información actual del sitio, así que no se puede guardar todavía (para no borrar datos por accidente). Recarga esta página e inténtalo de nuevo.");
    return false;
  }
  return true;
}
async function fetchJsonOrFromGitHub(path) {
  try {
    const res = await fetch(`${path}?t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (_err) { /* probablemente file://: sigue con el respaldo de GitHub */ }

  if (ghToken) {
    try {
      const file = await ghGetFile(path);
      if (file) return JSON.parse(base64ToUtf8(file.content));
    } catch (_err) { /* sigue al mensaje de error */ }
  }
  return null;
}
function unavailableNoticeHtml(label) {
  return `<p class="price-hint" style="margin:0">No se pudo cargar "${esc(label)}". Conéctate en Ajustes y recarga la página, o abre este panel desde el sitio publicado en vez de abrir el archivo directamente.</p>`;
}

/* =========================================================
   PRECIOS
   ========================================================= */
let workingPrices = null;

async function loadPricesIntoForm() {
  const data = await fetchJsonOrFromGitHub("data/prices.json");
  if (!data) {
    showDataUnavailableBanner();
    workingPrices = { materials: [], celularTypes: [], otherMaterials: [] };
    document.getElementById("materialsForm").innerHTML = unavailableNoticeHtml("Materiales");
    document.getElementById("typesForm").innerHTML = "";
    document.getElementById("otherMaterialsForm").innerHTML = "";
    return;
  }
  workingPrices = JSON.parse(JSON.stringify(data));
  renderPricesForm();
}

/* ---------- Editor de características (lista dinámica de texto) ---------- */
function specsListHtml(specs) {
  return (specs || []).map((s) => `
    <div class="spec-row">
      <i class="bi bi-check2"></i>
      <input type="text" class="spec-input" value="${esc(s)}" placeholder="Característica" />
      <button type="button" class="spec-remove" aria-label="Quitar característica"><i class="bi bi-x-lg"></i></button>
    </div>
  `).join("");
}
function specsEditorHtml(specs) {
  return `
    <div class="specs-editor">
      <label>Características que se listan</label>
      <div class="specs-list">${specsListHtml(specs)}</div>
      <button type="button" class="btn btn-ghost btn-sm add-spec-btn"><i class="bi bi-plus-lg"></i> Agregar característica</button>
    </div>`;
}
function readSpecs(scopeEl) {
  return Array.from(scopeEl.querySelectorAll(".spec-input"))
    .map((input) => input.value.trim())
    .filter(Boolean);
}
// Un solo listener por contenedor (delegado) sirve para todas las filas,
// incluidas las que se agreguen después de renderizar.
function wireSpecsEditors(containerEl) {
  containerEl.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".add-spec-btn");
    if (addBtn) {
      const list = addBtn.parentElement.querySelector(".specs-list");
      const row = document.createElement("div");
      row.className = "spec-row";
      row.innerHTML = `<i class="bi bi-check2"></i><input type="text" class="spec-input" placeholder="Característica" /><button type="button" class="spec-remove" aria-label="Quitar característica"><i class="bi bi-x-lg"></i></button>`;
      list.appendChild(row);
      row.querySelector("input").focus();
      return;
    }
    const removeBtn = e.target.closest(".spec-remove");
    if (removeBtn) {
      removeBtn.closest(".spec-row")?.remove();
    }
  });
}

function renderPricesForm() {
  const materialsWrap = document.getElementById("materialsForm");
  const typesWrap = document.getElementById("typesForm");
  const otmWrap = document.getElementById("otherMaterialsForm");

  materialsWrap.innerHTML = workingPrices.materials.map((m, i) => `
    <div class="price-edit-row" data-material-index="${i}">
      <div class="field"><label>Nombre</label><input type="text" class="mat-name" value="${esc(m.name)}" /></div>
      <div class="field"><label>Mín. $/kg</label><input type="number" min="0" step="1" class="mat-min" value="${m.min}" /></div>
      <div class="field"><label>Máx. $/kg</label><input type="number" min="0" step="1" class="mat-max" value="${m.max}" /></div>
      <div class="field"><label>Nota que se muestra en el sitio</label><input type="text" class="mat-note" value="${esc(m.note || "")}" /></div>
    </div>
  `).join("");

  typesWrap.innerHTML = workingPrices.celularTypes.map((t, i) => `
    <div class="type-card" data-type-index="${i}">
      <div class="price-edit-row cols-3">
        <div class="field"><label>Nombre del tipo</label><input type="text" class="type-label" value="${esc(t.label)}" /></div>
        <div class="field"><label>Mín. $/kg</label><input type="number" min="0" step="1" class="type-min" value="${t.min}" /></div>
        <div class="field"><label>Máx. $/kg</label><input type="number" min="0" step="1" class="type-max" value="${t.max}" /></div>
      </div>
      ${specsEditorHtml(t.specs)}
    </div>
  `).join("");
  wireSpecsEditors(typesWrap);

  otmWrap.innerHTML = workingPrices.otherMaterials.map((o, i) => {
    const price = getWorkingMaterial(o.priceId);
    const priceLabel = price ? `$${price.min.toLocaleString("es-MX")} – $${price.max.toLocaleString("es-MX")} /kg (${esc(price.name)})` : "—";
    return `
    <div class="otm-card" data-otm-index="${i}">
      <div class="otm-row">
        <div class="field"><label>Etiqueta corta</label><input type="text" class="otm-eyebrow" value="${esc(o.eyebrow)}" /></div>
        <div class="field"><label>Título</label><input type="text" class="otm-title" value="${esc(o.title)}" /></div>
      </div>
      <p class="price-hint">Precio actual: <strong>${priceLabel}</strong> — se edita arriba, en "Materiales".</p>
      ${specsEditorHtml(o.specs)}
    </div>`;
  }).join("");
  wireSpecsEditors(otmWrap);
}

function getWorkingMaterial(id) {
  return workingPrices.materials.find((m) => m.id === id) || null;
}

function readPricesFromForm() {
  document.querySelectorAll("#materialsForm .price-edit-row").forEach((row) => {
    const i = Number(row.dataset.materialIndex);
    const min = Number(row.querySelector(".mat-min").value);
    const max = Number(row.querySelector(".mat-max").value);
    const name = row.querySelector(".mat-name").value.trim();
    if (name) workingPrices.materials[i].name = name;
    workingPrices.materials[i].min = Number.isFinite(min) ? min : workingPrices.materials[i].min;
    workingPrices.materials[i].max = Number.isFinite(max) ? max : workingPrices.materials[i].max;
    workingPrices.materials[i].note = row.querySelector(".mat-note").value.trim();
  });
  document.querySelectorAll("#typesForm .type-card").forEach((card) => {
    const i = Number(card.dataset.typeIndex);
    const min = Number(card.querySelector(".type-min").value);
    const max = Number(card.querySelector(".type-max").value);
    const label = card.querySelector(".type-label").value.trim();
    if (label) workingPrices.celularTypes[i].label = label;
    workingPrices.celularTypes[i].min = Number.isFinite(min) ? min : workingPrices.celularTypes[i].min;
    workingPrices.celularTypes[i].max = Number.isFinite(max) ? max : workingPrices.celularTypes[i].max;
    workingPrices.celularTypes[i].specs = readSpecs(card);
  });
  document.querySelectorAll("#otherMaterialsForm .otm-card").forEach((card) => {
    const i = Number(card.dataset.otmIndex);
    const eyebrow = card.querySelector(".otm-eyebrow").value.trim();
    const title = card.querySelector(".otm-title").value.trim();
    if (eyebrow) workingPrices.otherMaterials[i].eyebrow = eyebrow;
    if (title) workingPrices.otherMaterials[i].title = title;
    workingPrices.otherMaterials[i].specs = readSpecs(card);
  });
}

function validatePrices() {
  const problems = [];
  workingPrices.materials.forEach((m) => { if (m.min < 0 || m.max < 0 || m.min > m.max) problems.push(`"${esc(m.name)}": el mínimo no puede ser mayor al máximo.`); });
  workingPrices.celularTypes.forEach((t) => { if (t.min < 0 || t.max < 0 || t.min > t.max) problems.push(`"${esc(t.label)}": el mínimo no puede ser mayor al máximo.`); });
  return problems;
}

function showStatus(elId, kind, text) {
  const el = document.getElementById(elId);
  el.className = `status-msg is-visible is-${kind}`;
  el.innerHTML = kind === "info" ? `<span class="spinner"></span>${text}` : text;
}
function hideStatus(elId) {
  document.getElementById(elId).classList.remove("is-visible");
}

document.getElementById("resetPricesBtn")?.addEventListener("click", loadPricesIntoForm);

document.getElementById("savePricesBtn")?.addEventListener("click", async () => {
  if (!guardDataLoaded("pricesStatus")) return;
  if (!requireGitHub("pricesStatus")) return;
  readPricesFromForm();
  const problems = validatePrices();
  if (problems.length) { showStatus("pricesStatus", "error", problems.join(" ")); return; }

  const btn = document.getElementById("savePricesBtn");
  btn.disabled = true;
  showStatus("pricesStatus", "info", "Guardando cambios en GitHub…");
  try {
    workingPrices.updatedAt = new Date().toISOString().slice(0, 10);
    await ghSaveJson("data/prices.json", workingPrices, `Actualiza precios (panel interno, ${ghUsername})`);
    showStatus("pricesStatus", "success", "Precios guardados. El sitio público se actualiza en unos segundos.");
  } catch (err) {
    showStatus("pricesStatus", "error", err.message || "No se pudo guardar.");
  } finally {
    btn.disabled = false;
  }
});

/* =========================================================
   GALERÍA
   ========================================================= */
let workingGallery = null;
let activeCategoryId = null;
let pendingUploads = []; // { categoryId, fileName, base64, previewUrl, alt }

async function loadGalleryIntoUI() {
  const data = await fetchJsonOrFromGitHub("data/gallery.json");
  pendingUploads = [];
  if (!data) {
    showDataUnavailableBanner();
    workingGallery = { categories: [] };
    activeCategoryId = null;
    document.getElementById("galleryCats").innerHTML = unavailableNoticeHtml("Galería de fotos");
    document.getElementById("galleryThumbs").innerHTML = "";
    return;
  }
  workingGallery = JSON.parse(JSON.stringify(data));
  activeCategoryId = workingGallery.categories[0]?.id || null;
  renderGalleryCats();
  renderGalleryThumbs();
}

function renderGalleryCats() {
  const wrap = document.getElementById("galleryCats");
  wrap.innerHTML = workingGallery.categories.map((c) => `
    <button type="button" class="gallery-cat-btn ${c.id === activeCategoryId ? "is-active" : ""}" data-cat="${esc(c.id)}">${esc(c.label)} (${c.images.length})</button>
  `).join("");
  wrap.querySelectorAll(".gallery-cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategoryId = btn.dataset.cat;
      renderGalleryCats();
      renderGalleryThumbs();
    });
  });
}

function currentCategory() {
  return workingGallery.categories.find((c) => c.id === activeCategoryId);
}

function renderGalleryThumbs() {
  const grid = document.getElementById("galleryThumbs");
  const cat = currentCategory();
  if (!cat) { grid.innerHTML = ""; return; }

  const existingHtml = cat.images.map((img, i) => `
    <div class="gallery-thumb" data-existing-index="${i}">
      <div class="thumb-img"><img src="${esc(img.src)}" alt="${esc(img.alt || "")}" loading="lazy" /></div>
      <div class="thumb-body">
        <input type="text" class="thumb-alt" value="${esc(img.alt || "")}" placeholder="Descripción" />
      </div>
      <button class="thumb-remove" type="button" aria-label="Quitar de la galería"><i class="bi bi-x-lg"></i></button>
    </div>
  `).join("");

  const pendingForCat = pendingUploads.filter((p) => p.categoryId === activeCategoryId);
  const pendingHtml = pendingForCat.map((p) => `
    <div class="gallery-thumb is-new" data-pending-id="${p.id}">
      <span class="thumb-badge">Nueva</span>
      <div class="thumb-img"><img src="${p.previewUrl}" alt="" /></div>
      <div class="thumb-body">
        <input type="text" class="thumb-alt-pending" value="${esc(p.alt)}" placeholder="Descripción" />
      </div>
      <button class="thumb-remove" type="button" aria-label="Cancelar"><i class="bi bi-x-lg"></i></button>
    </div>
  `).join("");

  grid.innerHTML = existingHtml + pendingHtml;

  grid.querySelectorAll("[data-existing-index] .thumb-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.closest(".gallery-thumb").dataset.existingIndex);
      cat.images.splice(idx, 1);
      renderGalleryCats();
      renderGalleryThumbs();
    });
  });
  grid.querySelectorAll("[data-pending-id] .thumb-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".gallery-thumb").dataset.pendingId;
      pendingUploads = pendingUploads.filter((p) => p.id !== id);
      renderGalleryThumbs();
    });
  });
}

function readGalleryAltEdits() {
  const cat = currentCategory();
  if (!cat) return;
  document.querySelectorAll("#galleryThumbs [data-existing-index]").forEach((el) => {
    const idx = Number(el.dataset.existingIndex);
    cat.images[idx].alt = el.querySelector(".thumb-alt").value.trim();
  });
  document.querySelectorAll("#galleryThumbs [data-pending-id]").forEach((el) => {
    const id = el.dataset.pendingId;
    const pending = pendingUploads.find((p) => p.id === id);
    if (pending) pending.alt = el.querySelector(".thumb-alt-pending").value.trim();
  });
}

function resizeImageFile(file, maxDimension = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Archivo de imagen inválido."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) { height = Math.round((height / width) * maxDimension); width = maxDimension; }
          else { width = Math.round((width / height) * maxDimension); height = maxDimension; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function slugify(text) {
  return text.toString().toLowerCase().normalize("NFD").replace(new RegExp("[̀-ͯ]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

document.getElementById("addPhotoInput")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file || !activeCategoryId) return;
  const cat = currentCategory();
  try {
    const dataUrl = await resizeImageFile(file);
    const base64 = dataUrl.split(",")[1];
    const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "foto";
    const fileName = `${baseName}-${Date.now()}.jpg`;
    pendingUploads.push({
      id: `p${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
      categoryId: activeCategoryId,
      fileName,
      path: `${cat.folder}/${fileName}`,
      base64,
      previewUrl: dataUrl,
      alt: "",
    });
    renderGalleryThumbs();
  } catch (err) {
    showStatus("galleryStatus", "error", err.message || "No se pudo procesar la imagen.");
  }
});

document.getElementById("resetGalleryBtn")?.addEventListener("click", loadGalleryIntoUI);

document.getElementById("saveGalleryBtn")?.addEventListener("click", async () => {
  if (!guardDataLoaded("galleryStatus")) return;
  if (!requireGitHub("galleryStatus")) return;
  readGalleryAltEdits();

  const btn = document.getElementById("saveGalleryBtn");
  btn.disabled = true;
  showStatus("galleryStatus", "info", `Subiendo ${pendingUploads.length} foto(s) y guardando cambios…`);
  try {
    for (const upload of pendingUploads) {
      await ghPutFile(upload.path, upload.base64, `Agrega foto de galería (panel interno, ${ghUsername})`);
      const cat = workingGallery.categories.find((c) => c.id === upload.categoryId);
      cat.images.push({ src: upload.path, alt: upload.alt || cat.label });
    }
    workingGallery.updatedAt = new Date().toISOString().slice(0, 10);
    await ghSaveJson("data/gallery.json", workingGallery, `Actualiza galería (panel interno, ${ghUsername})`);
    pendingUploads = [];
    showStatus("galleryStatus", "success", "Galería guardada. El sitio público se actualiza en unos segundos.");
    renderGalleryCats();
    renderGalleryThumbs();
  } catch (err) {
    showStatus("galleryStatus", "error", err.message || "No se pudo guardar la galería.");
  } finally {
    btn.disabled = false;
  }
});

/* =========================================================
   QUIÉNES SOMOS
   ========================================================= */
let workingTeam = null;

async function loadTeamIntoForm() {
  const data = await fetchJsonOrFromGitHub("data/team.json");
  if (!data) {
    showDataUnavailableBanner();
    workingTeam = { members: [] };
    document.getElementById("teamForm").innerHTML = unavailableNoticeHtml("Quiénes somos");
    return;
  }
  workingTeam = JSON.parse(JSON.stringify(data));
  workingTeam.members.forEach((m) => { m._pendingPhoto = null; m._removePhoto = false; });
  renderTeamForm();
}

function teamPhotoPreviewHtml(m) {
  if (m._pendingPhoto) return `<img src="${m._pendingPhoto.previewUrl}" alt="" />`;
  if (m.photo && !m._removePhoto) return `<img src="${esc(m.photo)}" alt="" />`;
  return `<span class="team-photo-fallback-admin">${esc(initials(m.name) || "?")}</span>`;
}

function renderTeamForm() {
  const wrap = document.getElementById("teamForm");
  wrap.innerHTML = workingTeam.members.map((m, i) => `
    <div class="team-edit-card" data-team-index="${i}">
      <div class="team-edit-top">
        <div class="team-photo-edit">
          <div class="team-photo-preview">${teamPhotoPreviewHtml(m)}</div>
          <label class="btn btn-ghost btn-sm team-photo-pick">
            <i class="bi bi-camera"></i> Cambiar foto
            <input type="file" accept="image/*" class="team-photo-input" hidden />
          </label>
          ${(m.photo || m._pendingPhoto) && !m._removePhoto ? `<button type="button" class="btn btn-ghost btn-sm team-photo-remove">Quitar foto</button>` : ""}
        </div>
        <div class="team-edit-fields">
          <div class="field"><label>Nombre</label><input type="text" class="team-name-input" value="${esc(m.name)}" placeholder="Nombre completo" /></div>
          <div class="field"><label>Puesto</label><input type="text" class="team-role-input" value="${esc(m.role || "")}" placeholder="Ej. Director General" /></div>
          <div class="field"><label>WhatsApp (10 dígitos, opcional)</label><input type="text" class="team-wa-input" value="${esc(stripCountry(m.whatsapp))}" placeholder="2221234567" /></div>
          <div class="field"><label>Correo (opcional)</label><input type="email" class="team-email-input" value="${esc(m.email || "")}" placeholder="correo@ejemplo.com" /></div>
        </div>
      </div>
      <button type="button" class="btn btn-danger btn-sm team-remove-btn"><i class="bi bi-trash"></i> Quitar de "Quiénes somos"</button>
    </div>
  `).join("");
}

document.getElementById("teamForm")?.addEventListener("click", (e) => {
  const removeCardBtn = e.target.closest(".team-remove-btn");
  if (removeCardBtn) {
    const i = Number(removeCardBtn.closest(".team-edit-card").dataset.teamIndex);
    workingTeam.members.splice(i, 1);
    renderTeamForm();
    return;
  }
  const removePhotoBtn = e.target.closest(".team-photo-remove");
  if (removePhotoBtn) {
    const i = Number(removePhotoBtn.closest(".team-edit-card").dataset.teamIndex);
    workingTeam.members[i]._pendingPhoto = null;
    workingTeam.members[i]._removePhoto = true;
    renderTeamForm();
  }
});
document.getElementById("teamForm")?.addEventListener("change", async (e) => {
  const fileInput = e.target.closest(".team-photo-input");
  if (!fileInput || !fileInput.files[0]) return;
  const i = Number(fileInput.closest(".team-edit-card").dataset.teamIndex);
  try {
    const dataUrl = await resizeImageFile(fileInput.files[0], 800, 0.85);
    const base64 = dataUrl.split(",")[1];
    const member = workingTeam.members[i];
    member._pendingPhoto = { base64, previewUrl: dataUrl, fileName: `${slugify(member.id || member.name || "persona")}-${Date.now()}.jpg` };
    member._removePhoto = false;
    renderTeamForm();
  } catch (err) {
    showStatus("teamStatus", "error", err.message || "No se pudo procesar la foto.");
  }
});

document.getElementById("addTeamMemberBtn")?.addEventListener("click", () => {
  workingTeam.members.push({ id: `persona-${Date.now()}`, role: "", name: "", photo: "", whatsapp: "", email: "", _pendingPhoto: null, _removePhoto: false });
  renderTeamForm();
});
document.getElementById("resetTeamBtn")?.addEventListener("click", loadTeamIntoForm);

function readTeamFromForm() {
  document.querySelectorAll("#teamForm .team-edit-card").forEach((card) => {
    const i = Number(card.dataset.teamIndex);
    const m = workingTeam.members[i];
    m.name = card.querySelector(".team-name-input").value.trim();
    m.role = card.querySelector(".team-role-input").value.trim();
    const wa = card.querySelector(".team-wa-input").value.trim();
    m.whatsapp = wa ? normalizeWhatsapp(wa) : "";
    m.email = card.querySelector(".team-email-input").value.trim();
  });
}

document.getElementById("saveTeamBtn")?.addEventListener("click", async () => {
  if (!guardDataLoaded("teamStatus")) return;
  if (!requireGitHub("teamStatus")) return;
  readTeamFromForm();
  const btn = document.getElementById("saveTeamBtn");
  btn.disabled = true;
  showStatus("teamStatus", "info", "Guardando cambios en GitHub…");
  try {
    for (const m of workingTeam.members) {
      if (m._pendingPhoto) {
        const path = `icons/equipo/${m._pendingPhoto.fileName}`;
        await ghPutFile(path, m._pendingPhoto.base64, `Actualiza foto de equipo (panel interno, ${ghUsername})`);
        m.photo = path;
      } else if (m._removePhoto) {
        m.photo = "";
      }
    }
    const toSave = {
      members: workingTeam.members.map(({ _pendingPhoto, _removePhoto, ...rest }) => rest),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    await ghSaveJson("data/team.json", toSave, `Actualiza "Quiénes somos" (panel interno, ${ghUsername})`);
    workingTeam.members.forEach((m) => { m._pendingPhoto = null; m._removePhoto = false; });
    showStatus("teamStatus", "success", "Guardado. El sitio público se actualiza en unos segundos.");
    renderTeamForm();
  } catch (err) {
    showStatus("teamStatus", "error", err.message || "No se pudo guardar.");
  } finally {
    btn.disabled = false;
  }
});

/* =========================================================
   SUCURSALES Y CONTACTO
   ========================================================= */
let workingBranches = null;

async function loadBranchesIntoForm() {
  const data = await fetchJsonOrFromGitHub("data/branches.json");
  if (!data) {
    showDataUnavailableBanner();
    workingBranches = { branches: [] };
    document.getElementById("branchesForm").innerHTML = unavailableNoticeHtml("Sucursales y contacto");
    return;
  }
  workingBranches = JSON.parse(JSON.stringify(data));
  renderBranchesForm();
}

function branchCardHtml(b, i) {
  const isSucursal = b.kind !== "directo";
  const stateOptions = MEXICO_STATES.map((s) => `<option value="${s.id}" ${b.estado === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("");
  return `
    <div class="branch-edit-card" data-branch-index="${i}">
      <div class="otm-row">
        <div class="field"><label>Tipo</label>
          <select class="branch-kind-input">
            <option value="sucursal" ${isSucursal ? "selected" : ""}>Sucursal (local fijo)</option>
            <option value="directo" ${!isSucursal ? "selected" : ""}>Contacto directo (sin local)</option>
          </select>
        </div>
        <div class="field"><label>Estado</label>
          <select class="branch-estado-input">${stateOptions}</select>
        </div>
      </div>
      <p class="price-hint">El estado es el título de la tarjeta en el sitio; abajo se muestra "Sucursal" o el nombre de quien atiende, según el tipo.</p>
      <div class="otm-row" style="margin-top:12px">
        <div class="field"><label>Nombre de quien atiende</label><input type="text" class="branch-nombre-input" value="${esc(b.nombre || "")}" placeholder="Nombre" /></div>
        <div class="field"><label>WhatsApp (10 dígitos)</label><input type="text" class="branch-wa-input" value="${esc(stripCountry(b.whatsapp))}" placeholder="2221234567" /></div>
      </div>
      <div class="otm-row branch-fields-sucursal" style="margin-top:12px" ${isSucursal ? "" : "hidden"}>
        <div class="field"><label>Ubicación (plaza o dirección)</label><input type="text" class="branch-ubicacion-input" value="${esc(b.ubicacion || "")}" placeholder="Ej. Plaza de la Tecnología" /></div>
        <div class="field"><label>Número de local (opcional)</label><input type="text" class="branch-local-input" value="${esc(b.local || "")}" placeholder="Ej. Local 83" /></div>
      </div>
      <div class="field branch-fields-directo" style="margin-top:12px" ${isSucursal ? "hidden" : ""}>
        <label>Detalle de cobertura (se muestra debajo del título)</label>
        <input type="text" class="branch-cobertura-input" value="${esc(b.cobertura || "")}" placeholder="Ej. Coatzacoalcos y alrededores" />
      </div>
      <div class="branch-toggles">
        <label class="check-inline"><input type="checkbox" class="branch-activo-input" ${b.activo !== false ? "checked" : ""} /> Activo (si no, se muestra "Próximamente")</label>
        <label class="check-inline"><input type="radio" name="branchPrimary" class="branch-primary-input" ${b.primary ? "checked" : ""} /> Número principal de WhatsApp del sitio</label>
      </div>
      <button type="button" class="btn btn-danger btn-sm branch-remove-btn"><i class="bi bi-trash"></i> Quitar</button>
    </div>`;
}
function renderBranchesForm() {
  document.getElementById("branchesForm").innerHTML = workingBranches.branches.map((b, i) => branchCardHtml(b, i)).join("");
}

document.getElementById("branchesForm")?.addEventListener("change", (e) => {
  const kindSelect = e.target.closest(".branch-kind-input");
  if (!kindSelect) return;
  const card = kindSelect.closest(".branch-edit-card");
  const isSucursal = kindSelect.value === "sucursal";
  card.querySelector(".branch-fields-sucursal").hidden = !isSucursal;
  card.querySelector(".branch-fields-directo").hidden = isSucursal;
});
document.getElementById("branchesForm")?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".branch-remove-btn");
  if (!removeBtn) return;
  const i = Number(removeBtn.closest(".branch-edit-card").dataset.branchIndex);
  workingBranches.branches.splice(i, 1);
  renderBranchesForm();
});
document.getElementById("addBranchBtn")?.addEventListener("click", () => {
  workingBranches.branches.push({ id: `contacto-${Date.now()}`, kind: "sucursal", estado: MEXICO_STATES[0].id, nombre: "", cobertura: "", ubicacion: "", local: "", whatsapp: "", primary: false, activo: true });
  renderBranchesForm();
});
document.getElementById("resetBranchesBtn")?.addEventListener("click", loadBranchesIntoForm);

function readBranchesFromForm() {
  document.querySelectorAll("#branchesForm .branch-edit-card").forEach((card) => {
    const i = Number(card.dataset.branchIndex);
    const b = workingBranches.branches[i];
    b.kind = card.querySelector(".branch-kind-input").value;
    b.estado = card.querySelector(".branch-estado-input").value;
    b.nombre = card.querySelector(".branch-nombre-input").value.trim();
    const wa = card.querySelector(".branch-wa-input").value.trim();
    b.whatsapp = wa ? normalizeWhatsapp(wa) : "";
    b.ubicacion = card.querySelector(".branch-ubicacion-input").value.trim();
    b.local = card.querySelector(".branch-local-input").value.trim();
    b.cobertura = card.querySelector(".branch-cobertura-input").value.trim();
    b.activo = card.querySelector(".branch-activo-input").checked;
    b.primary = card.querySelector(".branch-primary-input").checked;
  });
  // Garantiza que siempre quede exactamente un contacto marcado como principal.
  if (!workingBranches.branches.some((b) => b.primary && b.whatsapp)) {
    const firstWithWa = workingBranches.branches.find((b) => b.whatsapp);
    if (firstWithWa) firstWithWa.primary = true;
  }
}
function validateBranches() {
  const problems = [];
  if (!workingBranches.branches.some((b) => b.whatsapp)) problems.push("Agrega al menos un número de WhatsApp.");
  return problems;
}

document.getElementById("saveBranchesBtn")?.addEventListener("click", async () => {
  if (!guardDataLoaded("branchesStatus")) return;
  if (!requireGitHub("branchesStatus")) return;
  readBranchesFromForm();
  const problems = validateBranches();
  if (problems.length) { showStatus("branchesStatus", "error", problems.join(" ")); return; }
  const btn = document.getElementById("saveBranchesBtn");
  btn.disabled = true;
  showStatus("branchesStatus", "info", "Guardando cambios en GitHub…");
  try {
    workingBranches.updatedAt = new Date().toISOString().slice(0, 10);
    await ghSaveJson("data/branches.json", workingBranches, `Actualiza sucursales y contacto (panel interno, ${ghUsername})`);
    showStatus("branchesStatus", "success", "Guardado. El sitio público se actualiza en unos segundos.");
    renderBranchesForm();
  } catch (err) {
    showStatus("branchesStatus", "error", err.message || "No se pudo guardar.");
  } finally {
    btn.disabled = false;
  }
});

/* =========================================================
   COBERTURA Y REDES SOCIALES
   ========================================================= */
let workingCoverage = null;
let workingSocial = null;
const SOCIAL_NETWORKS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
  { value: "other", label: "Otra" },
];

async function loadCoverageAndSocialIntoForm() {
  const [covData, socData] = await Promise.all([
    fetchJsonOrFromGitHub("data/coverage.json"),
    fetchJsonOrFromGitHub("data/social.json"),
  ]);
  workingCoverage = JSON.parse(JSON.stringify(covData || { activeStateIds: [] }));
  workingSocial = JSON.parse(JSON.stringify(socData || { links: [] }));
  renderStateSelect();
  if (!covData) {
    showDataUnavailableBanner();
    document.getElementById("stateChipList").innerHTML = unavailableNoticeHtml("Cobertura activa");
    document.getElementById("coverageCountHint").textContent = "";
  } else {
    renderStateChips();
  }
  if (!socData) {
    showDataUnavailableBanner();
    document.getElementById("socialForm").innerHTML = unavailableNoticeHtml("Redes sociales");
  } else {
    renderSocialForm();
  }
}

function renderStateSelect() {
  const select = document.getElementById("stateSelect");
  const activeIds = new Set(workingCoverage.activeStateIds);
  const available = MEXICO_STATES.filter((s) => !activeIds.has(s.id));
  select.innerHTML = available.length
    ? available.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join("")
    : `<option value="">Ya agregaste los ${TOTAL_MEXICO_STATES} estados</option>`;
}
function renderStateChips() {
  const wrap = document.getElementById("stateChipList");
  const active = workingCoverage.activeStateIds.map((id) => MEXICO_STATES.find((s) => s.id === id)).filter(Boolean);
  wrap.innerHTML = active.length
    ? active.map((s) => `
      <span class="state-chip" data-state-id="${s.id}">${esc(s.name)}<button type="button" class="state-chip-remove" aria-label="Quitar ${esc(s.name)}"><i class="bi bi-x-lg"></i></button></span>
    `).join("")
    : `<p class="price-hint" style="margin:0">Todavía no hay estados con cobertura activa.</p>`;
  const restCount = Math.max(0, TOTAL_MEXICO_STATES - active.length);
  const hint = document.getElementById("coverageCountHint");
  if (hint) hint.textContent = `Activos: ${active.length} · Resto del país (recolección desde 10 kg): ${restCount}`;
}
document.getElementById("addStateBtn")?.addEventListener("click", () => {
  const select = document.getElementById("stateSelect");
  if (!select.value) return;
  workingCoverage.activeStateIds.push(select.value);
  renderStateSelect();
  renderStateChips();
});
document.getElementById("stateChipList")?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".state-chip-remove");
  if (!removeBtn) return;
  const id = removeBtn.closest(".state-chip").dataset.stateId;
  workingCoverage.activeStateIds = workingCoverage.activeStateIds.filter((s) => s !== id);
  renderStateSelect();
  renderStateChips();
});

function renderSocialForm() {
  const wrap = document.getElementById("socialForm");
  wrap.innerHTML = workingSocial.links.length
    ? workingSocial.links.map((l, i) => `
      <div class="social-edit-card" data-social-index="${i}">
        <div class="otm-row">
          <div class="field"><label>Red social</label>
            <select class="social-network-input">
              ${SOCIAL_NETWORKS.map((n) => `<option value="${n.value}" ${l.network === n.value ? "selected" : ""}>${n.label}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label>Enlace (URL completa)</label><input type="url" class="social-url-input" value="${esc(l.url || "")}" placeholder="https://..." /></div>
        </div>
        <button type="button" class="btn btn-danger btn-sm social-remove-btn"><i class="bi bi-trash"></i> Quitar</button>
      </div>
    `).join("")
    : `<p class="price-hint" style="margin:0">Todavía no hay redes sociales agregadas.</p>`;
}
document.getElementById("socialForm")?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".social-remove-btn");
  if (!removeBtn) return;
  const i = Number(removeBtn.closest(".social-edit-card").dataset.socialIndex);
  workingSocial.links.splice(i, 1);
  renderSocialForm();
});
document.getElementById("addSocialBtn")?.addEventListener("click", () => {
  workingSocial.links.push({ id: `red-${Date.now()}`, network: "facebook", label: "", url: "" });
  renderSocialForm();
});
document.getElementById("resetCoverageBtn")?.addEventListener("click", loadCoverageAndSocialIntoForm);

function readSocialFromForm() {
  document.querySelectorAll("#socialForm .social-edit-card").forEach((card) => {
    const i = Number(card.dataset.socialIndex);
    const l = workingSocial.links[i];
    l.network = card.querySelector(".social-network-input").value;
    l.url = card.querySelector(".social-url-input").value.trim();
    l.label = SOCIAL_NETWORKS.find((n) => n.value === l.network)?.label || "";
  });
  workingSocial.links = workingSocial.links.filter((l) => l.url);
}

document.getElementById("saveCoverageBtn")?.addEventListener("click", async () => {
  if (!guardDataLoaded("coverageStatus")) return;
  if (!requireGitHub("coverageStatus")) return;
  readSocialFromForm();
  const btn = document.getElementById("saveCoverageBtn");
  btn.disabled = true;
  showStatus("coverageStatus", "info", "Guardando cambios en GitHub…");
  try {
    workingCoverage.updatedAt = new Date().toISOString().slice(0, 10);
    workingSocial.updatedAt = new Date().toISOString().slice(0, 10);
    await ghSaveJson("data/coverage.json", workingCoverage, `Actualiza cobertura (panel interno, ${ghUsername})`);
    await ghSaveJson("data/social.json", workingSocial, `Actualiza redes sociales (panel interno, ${ghUsername})`);
    showStatus("coverageStatus", "success", "Guardado. El sitio público se actualiza en unos segundos.");
    renderSocialForm();
  } catch (err) {
    showStatus("coverageStatus", "error", err.message || "No se pudo guardar.");
  } finally {
    btn.disabled = false;
  }
});
