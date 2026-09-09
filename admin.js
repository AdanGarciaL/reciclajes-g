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
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (_e) {}
  window.location.reload();
});

function enterApp(username) {
  loginScreen.hidden = true;
  adminApp.hidden = false;
  whoAmI.textContent = username;
  initGitHubConnection();
  loadPricesIntoForm();
  loadGalleryIntoUI();
}

(function checkExistingSession() {
  let existing = null;
  try { existing = sessionStorage.getItem(SESSION_KEY); } catch (_e) {}
  if (existing) enterApp(existing);
})();

/* ---------- Pestañas ---------- */
document.querySelectorAll(".app-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".app-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
    const targetId = tab.dataset.tab === "precios" ? "panelPrecios" : "panelGaleria";
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

function setGhStatus(state, text) {
  const dot = document.getElementById("ghDot");
  const label = document.getElementById("ghStatusText");
  dot.classList.remove("is-connected", "is-error");
  if (state === "ok") dot.classList.add("is-connected");
  if (state === "error") dot.classList.add("is-error");
  label.textContent = text;
}

async function connectGitHub(token) {
  setGhStatus("pending", "Conectando…");
  try {
    const userRes = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
    if (!userRes.ok) throw new Error(userRes.status === 401 ? "Token inválido o vencido." : `Error al validar el token (${userRes.status}).`);
    const userData = await userRes.json();

    const repoRes = await fetch(API_BASE, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
    if (!repoRes.ok) throw new Error("No se pudo leer el repositorio con este token.");
    const repoData = await repoRes.json();
    const canWrite = !!(repoData.permissions && repoData.permissions.push);

    ghToken = token;
    ghUsername = userData.login;
    ghCanWrite = canWrite;
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch (_e) {}

    setGhStatus("ok", canWrite
      ? `Conectado como ${userData.login} · puede guardar cambios`
      : `Conectado como ${userData.login} · sin permiso de escritura en este repositorio`);
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
  try { sessionStorage.removeItem(TOKEN_KEY); } catch (_e) {}
  setGhStatus("idle", "Sin conectar");
  document.getElementById("ghConnectBtn").hidden = false;
  document.getElementById("ghDisconnectBtn").hidden = true;
}

function initGitHubConnection() {
  setGhStatus("idle", "Sin conectar");
  document.getElementById("ghConnectBtn").addEventListener("click", async () => {
    const token = document.getElementById("ghToken").value.trim();
    if (!token) return;
    await connectGitHub(token);
  });
  document.getElementById("ghDisconnectBtn").addEventListener("click", disconnectGitHub);
  document.getElementById("ghHelpToggle").addEventListener("click", () => {
    const help = document.getElementById("ghHelp");
    help.hidden = !help.hidden;
  });

  let savedToken = null;
  try { savedToken = sessionStorage.getItem(TOKEN_KEY); } catch (_e) {}
  if (savedToken) connectGitHub(savedToken);
}

function requireGitHub() {
  if (!ghToken) { alert("Conecta tu token de GitHub arriba antes de guardar."); return false; }
  if (!ghCanWrite) { alert("Tu token no tiene permiso de escritura en este repositorio."); return false; }
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
   PRECIOS
   ========================================================= */
let workingPrices = null;

async function loadPricesIntoForm() {
  const res = await fetch(`data/prices.json?t=${Date.now()}`, { cache: "no-store" });
  const data = res.ok ? await res.json() : null;
  workingPrices = JSON.parse(JSON.stringify(data || { materials: [], celularTypes: [], otherMaterials: [] }));
  renderPricesForm();
}

function renderPricesForm() {
  const materialsWrap = document.getElementById("materialsForm");
  const typesWrap = document.getElementById("typesForm");

  materialsWrap.innerHTML = workingPrices.materials.map((m, i) => `
    <div class="price-edit-row" data-material-index="${i}">
      <div class="price-edit-name"><i class="bi ${esc(m.icon || "bi-tag")}"></i>${esc(m.name)}</div>
      <div class="field"><label>Mín. $/kg</label><input type="number" min="0" step="1" class="mat-min" value="${m.min}" /></div>
      <div class="field"><label>Máx. $/kg</label><input type="number" min="0" step="1" class="mat-max" value="${m.max}" /></div>
      <div class="field"><label>Nota que se muestra en el sitio</label><input type="text" class="mat-note" value="${esc(m.note || "")}" /></div>
    </div>
  `).join("");

  typesWrap.innerHTML = workingPrices.celularTypes.map((t, i) => `
    <div class="price-edit-row" data-type-index="${i}">
      <div class="price-edit-name"><i class="bi bi-phone"></i>${esc(t.label)}</div>
      <div class="field"><label>Mín. $/kg</label><input type="number" min="0" step="1" class="type-min" value="${t.min}" /></div>
      <div class="field"><label>Máx. $/kg</label><input type="number" min="0" step="1" class="type-max" value="${t.max}" /></div>
      <div class="field"><label>Tipo</label><input type="text" value="${esc(t.shortLabel)}" disabled /></div>
    </div>
  `).join("");
}

function readPricesFromForm() {
  document.querySelectorAll("#materialsForm .price-edit-row").forEach((row) => {
    const i = Number(row.dataset.materialIndex);
    const min = Number(row.querySelector(".mat-min").value);
    const max = Number(row.querySelector(".mat-max").value);
    workingPrices.materials[i].min = Number.isFinite(min) ? min : workingPrices.materials[i].min;
    workingPrices.materials[i].max = Number.isFinite(max) ? max : workingPrices.materials[i].max;
    workingPrices.materials[i].note = row.querySelector(".mat-note").value.trim();
  });
  document.querySelectorAll("#typesForm .price-edit-row").forEach((row) => {
    const i = Number(row.dataset.typeIndex);
    const min = Number(row.querySelector(".type-min").value);
    const max = Number(row.querySelector(".type-max").value);
    workingPrices.celularTypes[i].min = Number.isFinite(min) ? min : workingPrices.celularTypes[i].min;
    workingPrices.celularTypes[i].max = Number.isFinite(max) ? max : workingPrices.celularTypes[i].max;
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
  if (!requireGitHub()) return;
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
  const res = await fetch(`data/gallery.json?t=${Date.now()}`, { cache: "no-store" });
  const data = res.ok ? await res.json() : null;
  workingGallery = JSON.parse(JSON.stringify(data || { categories: [] }));
  pendingUploads = [];
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
  if (!requireGitHub()) return;
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
