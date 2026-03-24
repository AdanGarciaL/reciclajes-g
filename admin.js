const LEADS_KEY = "reciclajeLogikasLeads";
const LEGACY_LEADS_KEY = "reciclajesGLeads";
const ADMIN_SESSION_KEY = "reciclajeLogikasAdminSession";
const LEGACY_ADMIN_SESSION_KEY = "reciclajesGAdminSession";
const ADMIN_USER = "AdanGL";
const ADMIN_PASS = "Agl252002";

const adminLoginForm = document.getElementById("adminLoginForm");
const loginMsg = document.getElementById("loginMsg");
const adminPanel = document.getElementById("adminPanel");
const logoutBtn = document.getElementById("logoutBtn");
const leadsTableBody = document.getElementById("leadsTableBody");

function getLeads() {
  const raw = localStorage.getItem(LEADS_KEY) || localStorage.getItem(LEGACY_LEADS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderLeadsTable() {
  if (!leadsTableBody) {
    return;
  }

  const leads = getLeads();
  if (!leads.length) {
    leadsTableBody.innerHTML = "<tr><td colspan='8'>Aun no hay registros.</td></tr>";
    return;
  }

  leadsTableBody.innerHTML = leads
    .map(
      (lead) =>
        `<tr>
          <td>${escapeHtml(lead.date || "")}</td>
          <td>${escapeHtml(lead.fullName || "")}</td>
          <td>${escapeHtml(lead.phone || "")}</td>
          <td>${escapeHtml(lead.materialType || "")}</td>
          <td>${escapeHtml(lead.kilos || "")}</td>
          <td>${escapeHtml(lead.locationText || "")}</td>
          <td>${escapeHtml(lead.coordinates || "-")}</td>
          <td>${escapeHtml(lead.notes || "-")}</td>
        </tr>`
    )
    .join("");
}

function setAdminView(isLoggedIn) {
  if (!adminPanel || !adminLoginForm) {
    return;
  }

  if (isLoggedIn) {
    adminPanel.classList.remove("hidden");
    adminLoginForm.classList.add("hidden");
    renderLeadsTable();
    return;
  }

  adminPanel.classList.add("hidden");
  adminLoginForm.classList.remove("hidden");
}

if (adminLoginForm && loginMsg) {
  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(adminLoginForm);
    const username = formData.get("username")?.toString().trim();
    const password = formData.get("password")?.toString().trim();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem(ADMIN_SESSION_KEY, "1");
      localStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
      loginMsg.textContent = "Acceso correcto.";
      setAdminView(true);
      return;
    }

    loginMsg.textContent = "Usuario o contrasena incorrectos.";
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
    setAdminView(false);
  });
}

setAdminView(
  localStorage.getItem(ADMIN_SESSION_KEY) === "1" ||
    localStorage.getItem(LEGACY_ADMIN_SESSION_KEY) === "1"
);
