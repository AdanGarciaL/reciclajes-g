const LEADS_KEY = "ecoLogicaGarciaLeads";
const LEGACY_LEADS_KEY = "reciclajeLogikasLeads";
const ADMIN_SESSION_KEY = "ecoLogicaGarciaAdminSession";
const LEGACY_ADMIN_SESSION_KEY = "reciclajeLogikasAdminSession";
const ADMIN_META_KEY = "ecoLogicaGarciaAdminMeta";
const ADMIN_HISTORY_KEY = "ecoLogicaGarciaAdminHistory";
const ADMIN_USERS_KEY = "ecoLogicaGarciaAdminUsers";
const ADMIN_SESSION_USER_KEY = "ecoLogicaGarciaAdminSessionUser";
const ADMIN_ACTIVE_ZONE_KEY = "ecoLogicaGarciaAdminActiveZone";
const LEGACY_ADMIN_META_KEY = "reciclajeLogikasAdminMeta";
const LEGACY_ADMIN_HISTORY_KEY = "reciclajeLogikasAdminHistory";
const ADMIN_THEME_KEY = "theme-preference";

const DEFAULT_ADMINS = [
  { username: "AdanGL", password: "Agl252002" },
  { username: "KarlaGL", password: "Kgl12345" },
  { username: "SusanaGL", password: "Sgl12345" },
];

const adminLoginForm = document.getElementById("adminLoginForm");
const loginMsg = document.getElementById("loginMsg");
const adminPanel = document.getElementById("adminPanel");
const adminThemeToggle = document.getElementById("adminThemeToggle");
const logoutBtn = document.getElementById("logoutBtn");
const addLeadBtn = document.getElementById("addLeadBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const leadsTableBody = document.getElementById("leadsTableBody");

const summaryTotal = document.getElementById("summaryTotal");
const summaryActive = document.getElementById("summaryActive");
const summaryMin10 = document.getElementById("summaryMin10");
const summaryKilos = document.getElementById("summaryKilos");
const adminUsersForm = document.getElementById("adminUsersForm");
const adminUserSelect = document.getElementById("adminUserSelect");
const adminUserNameInput = document.getElementById("adminUserNameInput");
const adminUserPasswordInput = document.getElementById("adminUserPasswordInput");
const resetAdminUserBtn = document.getElementById("resetAdminUserBtn");

const searchInput = document.getElementById("searchInput");
const coverageFilter = document.getElementById("coverageFilter");
const stateFilter = document.getElementById("stateFilter");
const statusFilter = document.getElementById("statusFilter");
const sortBy = document.getElementById("sortBy");

const leadEditor = document.getElementById("leadEditor");
const leadEditorTitle = document.getElementById("leadEditorTitle");
const leadEditorForm = document.getElementById("leadEditorForm");
const leadEditorId = document.getElementById("leadEditorId");
const closeLeadEditorBtn = document.getElementById("closeLeadEditorBtn");
const cancelLeadEditorBtn = document.getElementById("cancelLeadEditorBtn");
const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const historyLeadFilter = document.getElementById("historyLeadFilter");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const bulkActions = document.getElementById("bulkActions");
const selectedCount = document.getElementById("selectedCount");
const bulkStatusSelect = document.getElementById("bulkStatusSelect");
const applyBulkStatusBtn = document.getElementById("applyBulkStatusBtn");
const exportSelectedBtn = document.getElementById("exportSelectedBtn");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const clearSelectionBtn = document.getElementById("clearSelectionBtn");
const selectPageCheckbox = document.getElementById("selectPageCheckbox");
const pageSizeSelect = document.getElementById("pageSizeSelect");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");
const tableRangeInfo = document.getElementById("tableRangeInfo");
const toastStack = document.getElementById("toastStack");
const adminCurrentZoneChip = document.getElementById("adminCurrentZoneChip");
const adminCurrentUserChip = document.getElementById("adminCurrentUserChip");
const adminSessionSidebarUser = document.getElementById("adminSessionSidebarUser");
const adminSessionSidebarZone = document.getElementById("adminSessionSidebarZone");
const adminZoneSections = Array.from(document.querySelectorAll(".admin-zone[data-zone-name]"));
const adminSidebarLinks = Array.from(document.querySelectorAll(".admin-sidebar-nav a[data-admin-zone]"));

const ACTIVE_COVERAGE_TERMS = [
  "puebla",
  "cdmx",
  "ciudad de mexico",
  "estado de mexico",
  "edomex",
  "veracruz",
  "hidalgo"
];

const STATUS_OPTIONS = ["Nuevo", "En contacto", "Cotizado", "Cerrado"];
const COVERAGE_FILTER_OPTIONS = ["all", "Activa", "10kg+"];
const STATUS_FILTER_OPTIONS = ["all", ...STATUS_OPTIONS];
const SORT_FILTER_OPTIONS = ["dateDesc", "dateAsc", "kilosDesc", "kilosAsc"];

const uiState = {
  search: "",
  coverage: "all",
  state: "all",
  status: "all",
  sortBy: "dateDesc",
  historyLead: "all",
  page: 1,
  pageSize: 10,
};

let currentRenderedRows = [];
let currentPageRows = [];
let recentlyDeletedLead = null;
let selectedAdminUsername = "";
const selectedLeadIds = new Set();

const ADMIN_ZONE_LABELS = {
  operation: "Operación",
  control: "Control",
  data: "Datos",
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseKilos(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateValue(value) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateLeadId() {
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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

function saveLeads(leads) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  localStorage.removeItem(LEGACY_LEADS_KEY);
}

function ensureLeadIds() {
  const leads = getLeads();
  let changed = false;
  const patched = leads.map((lead) => {
    if (lead && lead.id) {
      return lead;
    }

    changed = true;
    return {
      ...lead,
      id: generateLeadId(),
    };
  });

  if (changed) {
    saveLeads(patched);
  }

  return patched;
}

function getAdminMeta() {
  const raw = localStorage.getItem(ADMIN_META_KEY) || localStorage.getItem(LEGACY_ADMIN_META_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function saveAdminMeta(meta) {
  localStorage.setItem(ADMIN_META_KEY, JSON.stringify(meta));
  localStorage.removeItem(LEGACY_ADMIN_META_KEY);
}

function getHistory() {
  const raw = localStorage.getItem(ADMIN_HISTORY_KEY) || localStorage.getItem(LEGACY_ADMIN_HISTORY_KEY);
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

function saveHistory(items) {
  localStorage.setItem(ADMIN_HISTORY_KEY, JSON.stringify(items));
  localStorage.removeItem(LEGACY_ADMIN_HISTORY_KEY);
}

function sanitizeAdminUser(rawUser) {
  const username = String(rawUser?.username || "").trim();
  const password = String(rawUser?.password || "").trim();

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

function getAdminUsers() {
  const raw = localStorage.getItem(ADMIN_USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(sanitizeAdminUser).filter(Boolean);
  } catch (_error) {
    return [];
  }
}

function saveAdminUsers(users) {
  const sanitized = users.map(sanitizeAdminUser).filter(Boolean);
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(sanitized));
}

function ensureAdminUsers() {
  const storedUsers = getAdminUsers();
  const byUsername = new Map();

  storedUsers.forEach((user) => {
    byUsername.set(user.username, user);
  });

  DEFAULT_ADMINS.forEach((defaultUser) => {
    if (!byUsername.has(defaultUser.username)) {
      byUsername.set(defaultUser.username, defaultUser);
    }
  });

  const merged = Array.from(byUsername.values());
  saveAdminUsers(merged);
  return merged;
}

function authenticateAdmin(username, password) {
  const normalizedUsername = String(username || "").trim();
  const normalizedPassword = String(password || "").trim();

  return ensureAdminUsers().find(
    (adminUser) => adminUser.username === normalizedUsername && adminUser.password === normalizedPassword
  );
}

function resetAdminUsersForm() {
  selectedAdminUsername = "";

  if (adminUserSelect) {
    adminUserSelect.value = "";
  }

  if (adminUserNameInput) {
    adminUserNameInput.value = "";
  }

  if (adminUserPasswordInput) {
    adminUserPasswordInput.value = "";
  }
}

function renderAdminUsers() {
  if (!adminUserSelect) {
    return;
  }

  const users = ensureAdminUsers();
  const options = [
    '<option value="">Selecciona un admin</option>',
    ...users.map((user) => `<option value="${escapeHtml(user.username)}">${escapeHtml(user.username)}</option>`),
  ];

  adminUserSelect.innerHTML = options.join("");

  const canKeepSelected = selectedAdminUsername && users.some((user) => user.username === selectedAdminUsername);
  if (canKeepSelected) {
    adminUserSelect.value = selectedAdminUsername;
  } else {
    resetAdminUsersForm();
  }
}

function bindAdminUsersEvents() {
  if (!adminUsersForm || !adminUserSelect || !adminUserNameInput || !adminUserPasswordInput) {
    return;
  }

  adminUserSelect.addEventListener("change", () => {
    const selected = adminUserSelect.value;
    selectedAdminUsername = selected;

    if (!selected) {
      resetAdminUsersForm();
      return;
    }

    const selectedUser = ensureAdminUsers().find((user) => user.username === selected);
    if (!selectedUser) {
      resetAdminUsersForm();
      return;
    }

    adminUserNameInput.value = selectedUser.username;
    adminUserPasswordInput.value = selectedUser.password;
  });

  adminUsersForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Validate session state
    if (!SpecialCases.validateSessionState()) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.AUTH_ERROR, "Tu sesión expiró. Inicia sesión nuevamente.");
      return;
    }

    if (!selectedAdminUsername) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "Selecciona un admin para editar");
      return;
    }

    const previousUsername = selectedAdminUsername;
    const nextUsername = adminUserNameInput.value.trim();
    const nextPassword = adminUserPasswordInput.value.trim();

    // Validate fields using ValidationSystem
    const validationErrors = [];
    
    if (!ValidationSystem.validateField("username", nextUsername)) {
      validationErrors.push("Usuario debe tener 3+ caracteres (solo letras, números, guiones)");
    }

    if (!ValidationSystem.validateField("password", nextPassword)) {
      validationErrors.push("Contraseña debe tener 6+ caracteres");
    }

    if (validationErrors.length > 0) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.VALIDATION_ERROR, validationErrors.join(" | "));
      return;
    }

    // Get all users
    const users = ensureAdminUsers();

    // Check for duplicates using SpecialCases
    if (SpecialCases.checkDuplicate("username", nextUsername, users, "username", selectedAdminUsername)) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.CONFLICT_ERROR, `El usuario "${nextUsername}" ya existe`);
      return;
    }

    // Confirm destructive operation if name is changing
    if (previousUsername !== nextUsername) {
      if (!confirm(`¿Cambiar nombre de admin de "${previousUsername}" a "${nextUsername}"?`)) {
        ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "Cambio cancelado");
        return;
      }
    }

    // Test storage access before saving
    if (!SpecialCases.testStorageAccess()) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.STORAGE_ERROR, "No se puede acceder al almacenamiento. Intenta de nuevo.");
      return;
    }

    try {
      const updatedUsers = users.map((user) => {
        if (user.username !== selectedAdminUsername) {
          return user;
        }
        return {
          username: nextUsername,
          password: nextPassword,
        };
      });

      saveAdminUsers(updatedUsers);
      selectedAdminUsername = nextUsername;
      renderAdminUsers();

      // Update session if current user changed their credentials
      const sessionUser = localStorage.getItem(ADMIN_SESSION_USER_KEY);
      if (sessionUser === previousUsername) {
        localStorage.setItem(ADMIN_SESSION_USER_KEY, nextUsername);
        renderAdminSessionInfo(localStorage.getItem(ADMIN_ACTIVE_ZONE_KEY) || "operation");
      }

      trackHistory({
        action: "Credenciales admin actualizadas",
        detail: `${previousUsername} -> ${nextUsername}`,
        leadId: "system",
        leadName: "Administración",
      });

      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SUCCESS, `Admin actualizado exitosamente: ${nextUsername}`);
    } catch (error) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SAVE_ERROR, `Error guardando admin: ${error.message}`);
    }
  });

  if (resetAdminUserBtn) {
    resetAdminUserBtn.addEventListener("click", resetAdminUsersForm);
  }
}

function getActiveSessionUser() {
  const currentUser = localStorage.getItem(ADMIN_SESSION_USER_KEY);
  return currentUser ? currentUser : "--";
}

function getZoneLabel(zoneName) {
  return ADMIN_ZONE_LABELS[zoneName] || ADMIN_ZONE_LABELS.operation;
}

function renderAdminSessionInfo(zoneName) {
  const sessionUser = getActiveSessionUser();
  const zoneLabel = getZoneLabel(zoneName);

  if (adminCurrentUserChip) {
    adminCurrentUserChip.textContent = `Sesion: ${sessionUser}`;
  }

  if (adminSessionSidebarUser) {
    adminSessionSidebarUser.textContent = `Admin: ${sessionUser}`;
  }

  if (adminCurrentZoneChip) {
    adminCurrentZoneChip.textContent = `Zona activa: ${zoneLabel}`;
  }

  if (adminSessionSidebarZone) {
    adminSessionSidebarZone.textContent = `Zona activa: ${zoneLabel}`;
  }
}

function buildLeadNameMap() {
  const map = new Map();
  ensureLeadIds().forEach((lead) => {
    map.set(lead.id, lead.fullName || "Sin nombre");
  });
  return map;
}

function trackHistory(payload) {
  const history = getHistory();
  const actorName = localStorage.getItem(ADMIN_SESSION_USER_KEY) || "Admin";
  history.unshift({
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    actor: actorName,
    ...payload,
  });

  saveHistory(history.slice(0, 400));
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActionTone(action) {
  const normalizedAction = String(action || "").toLowerCase();

  if (normalizedAction.includes("elimin")) {
    return "history-tag history-tag-danger";
  }

  if (normalizedAction.includes("agreg")) {
    return "history-tag history-tag-success";
  }

  if (normalizedAction.includes("estatus")) {
    return "history-tag history-tag-warning";
  }

  return "history-tag history-tag-info";
}

function summarizeLeadChanges(previousLead, nextLead) {
  if (!previousLead) {
    return "Registro inicial creado";
  }

  const fields = [
    ["fullName", "Nombre"],
    ["phone", "Telefono"],
    ["materialType", "Material"],
    ["kilos", "Kg"],
    ["state", "Estado"],
    ["locationText", "Ubicacion"],
    ["coordinates", "Coordenadas"],
    ["notes", "Notas"],
  ];

  const changed = fields
    .filter(([field]) => String(previousLead[field] || "") !== String(nextLead[field] || ""))
    .map(([, label]) => label);

  if (!changed.length) {
    return "Sin cambios en campos principales";
  }

  return `Campos actualizados: ${changed.join(", ")}`;
}

function getCoverageCategory(lead) {
  const stateOrLocation = normalizeText(lead.state || lead.locationText || "");
  const isActive = ACTIVE_COVERAGE_TERMS.some((term) => stateOrLocation.includes(term));
  return isActive
    ? { label: "Activa", className: "coverage-badge coverage-badge-active" }
    : { label: "10kg+", className: "coverage-badge coverage-badge-min10" };
}

function getPriorityCategory(coverageLabel, kilos) {
  if (coverageLabel === "Activa" && kilos >= 10) {
    return { label: "Alta", className: "priority-badge priority-high" };
  }

  if ((coverageLabel === "Activa" && kilos > 0) || (coverageLabel === "10kg+" && kilos >= 10)) {
    return { label: "Media", className: "priority-badge priority-medium" };
  }

  return { label: "Baja", className: "priority-badge priority-low" };
}

function buildLeadRows() {
  const leads = ensureLeadIds();
  const meta = getAdminMeta();

  return leads.map((lead) => {
    const id = lead.id;
    const coverage = getCoverageCategory(lead);
    const kilos = parseKilos(lead.kilos);
    const priority = getPriorityCategory(coverage.label, kilos);
    const state = (lead.state || "-").toString();

    return {
      id,
      lead,
      coverage,
      priority,
      kilos,
      dateMs: parseDateValue(lead.date),
      state,
      status: meta[id]?.status || "Nuevo",
      internalNote: meta[id]?.internalNote || "",
      searchIndex: normalizeText([
        lead.fullName,
        lead.phone,
        lead.materialType,
        state,
        lead.locationText,
      ].join(" ")),
    };
  });
}

function populateStateFilter(rows) {
  if (!stateFilter) {
    return;
  }

  const currentValue = stateFilter.value || "all";
  const uniqueStates = Array.from(
    new Set(
      rows
        .map((row) => row.state)
        .filter((state) => state && state !== "-")
    )
  ).sort((a, b) => a.localeCompare(b));

  stateFilter.innerHTML = `<option value="all">Todos</option>${uniqueStates
    .map((state) => `<option value="${escapeHtml(state)}">${escapeHtml(state)}</option>`)
    .join("")}`;

  if (uniqueStates.includes(currentValue)) {
    stateFilter.value = currentValue;
  } else {
    stateFilter.value = "all";
    uiState.state = "all";
  }
}

function resetToFirstPage() {
  uiState.page = 1;
}

function sanitizeSelectValue(value, allowedValues, fallback = "all") {
  return allowedValues.includes(value) ? value : fallback;
}

function syncFilterControlsWithState() {
  if (coverageFilter) {
    const nextCoverage = sanitizeSelectValue(uiState.coverage, COVERAGE_FILTER_OPTIONS);
    uiState.coverage = nextCoverage;
    coverageFilter.value = nextCoverage;
  }

  if (statusFilter) {
    const nextStatus = sanitizeSelectValue(uiState.status, STATUS_FILTER_OPTIONS);
    uiState.status = nextStatus;
    statusFilter.value = nextStatus;
  }

  if (sortBy) {
    const nextSort = sanitizeSelectValue(uiState.sortBy, SORT_FILTER_OPTIONS, "dateDesc");
    uiState.sortBy = nextSort;
    sortBy.value = nextSort;
  }
}

function getTotalPages(totalItems) {
  return Math.max(1, Math.ceil(totalItems / uiState.pageSize));
}

function clampPage(totalItems) {
  const totalPages = getTotalPages(totalItems);
  if (uiState.page > totalPages) {
    uiState.page = totalPages;
  }

  if (uiState.page < 1) {
    uiState.page = 1;
  }

  return totalPages;
}

function paginateRows(rows) {
  const totalItems = rows.length;
  const totalPages = clampPage(totalItems);

  const startIndex = (uiState.page - 1) * uiState.pageSize;
  const endIndex = startIndex + uiState.pageSize;
  const pageRows = rows.slice(startIndex, endIndex);

  return {
    pageRows,
    totalItems,
    totalPages,
    startIndex,
    endIndex: Math.min(endIndex, totalItems),
  };
}

function renderPagination(meta) {
  if (!pageInfo || !tableRangeInfo || !prevPageBtn || !nextPageBtn) {
    return;
  }

  const { totalItems, totalPages, startIndex, endIndex } = meta;
  pageInfo.textContent = `Página ${uiState.page} de ${totalPages}`;

  if (!totalItems) {
    tableRangeInfo.textContent = "Mostrando 0 de 0";
  } else {
    tableRangeInfo.textContent = `Mostrando ${startIndex + 1}-${endIndex} de ${totalItems}`;
  }

  prevPageBtn.disabled = uiState.page <= 1;
  nextPageBtn.disabled = uiState.page >= totalPages;
}

function showToast(config) {
  if (!toastStack) {
    return;
  }

  const { type = "info", message = "", actionLabel = "", onAction = null, duration = 3200 } = config;
  const toast = document.createElement("article");
  toast.className = `toast-item toast-${type}`;

  const messageNode = document.createElement("p");
  messageNode.textContent = message;
  toast.appendChild(messageNode);

  if (actionLabel && typeof onAction === "function") {
    const actionButton = document.createElement("button");
    actionButton.type = "button";
    actionButton.className = "btn btn-ghost toast-action";
    actionButton.textContent = actionLabel;
    actionButton.addEventListener("click", () => {
      onAction();
      closeToast();
    });
    toast.appendChild(actionButton);
  }

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "toast-close";
  closeButton.setAttribute("aria-label", "Cerrar notificación");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", closeToast);
  toast.appendChild(closeButton);

  toastStack.appendChild(toast);

  const timeoutId = window.setTimeout(closeToast, duration);

  function closeToast() {
    window.clearTimeout(timeoutId);
    toast.classList.add("is-leaving");
    window.setTimeout(() => {
      if (toast.parentElement === toastStack) {
        toastStack.removeChild(toast);
      }
    }, 160);
  }
}

// ============ MÓDULO DE VALIDACIÓN Y MANEJO DE ERRORES ============

const ValidationSystem = {
  /**
   * Validadores específicos del dominio
   */
  validators: {
    username: (value) => {
      const trimmed = String(value || "").trim();
      if (!trimmed) return { valid: false, error: "El usuario no puede estar vacío" };
      if (trimmed.length < 3) return { valid: false, error: "El usuario debe tener al menos 3 caracteres" };
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return { valid: false, error: "El usuario solo puede contener letras, números, guiones y guiones bajos" };
      return { valid: true };
    },
    password: (value) => {
      const trimmed = String(value || "").trim();
      if (!trimmed) return { valid: false, error: "La contraseña no puede estar vacía" };
      if (trimmed.length < 6) return { valid: false, error: "La contraseña debe tener al menos 6 caracteres" };
      return { valid: true };
    },
    leadName: (value) => {
      const trimmed = String(value || "").trim();
      if (!trimmed) return { valid: false, error: "El nombre del lead es obligatorio" };
      if (trimmed.length < 2) return { valid: false, error: "El nombre debe tener al menos 2 caracteres" };
      return { valid: true };
    },
    phone: (value) => {
      const trimmed = String(value || "").trim();
      if (!trimmed) return { valid: false, error: "El teléfono es obligatorio" };
      if (!/^[\d\s\+\-\(\)]{7,}$/.test(trimmed)) return { valid: false, error: "El teléfono debe tener al menos 7 caracteres" };
      return { valid: true };
    },
    kilos: (value) => {
      const num = Number.parseFloat(value);
      if (!Number.isFinite(num)) return { valid: false, error: "Los kilos deben ser un número válido" };
      if (num < 0) return { valid: false, error: "Los kilos no pueden ser negativos" };
      if (num > 9999) return { valid: false, error: "Los kilos no pueden superar 9999" };
      return { valid: true };
    },
    email: (value) => {
      const trimmed = String(value || "").trim();
      if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { valid: false, error: "Email inválido" };
      return { valid: true };
    },
  },

  /**
   * Valida un campo usando los validadores específicos
   */
  validateField: (fieldName, value) => {
    const validator = ValidationSystem.validators[fieldName];
    if (!validator) return { valid: true }; // Sin validador específico = válido
    return validator(value);
  },

  /**
   * Valida múltiples campos a la vez
   */
  validateFields: (fieldMap) => {
    const errors = {};
    Object.entries(fieldMap).forEach(([fieldName, value]) => {
      const result = ValidationSystem.validateField(fieldName, value);
      if (!result.valid) {
        errors[fieldName] = result.error;
      }
    });
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

/**
 * Sistema centralizado de manejo de errores
 */
const ErrorHandler = {
  /**
   * Tipos de errores con sus configuraciones
   */
  errorTypes: {
    VALIDATION_ERROR: { type: "error", icon: "⚠️", duration: 3200 },
    SAVE_ERROR: { type: "error", icon: "❌", duration: 3500 },
    DELETE_ERROR: { type: "error", icon: "❌", duration: 3500 },
    AUTH_ERROR: { type: "error", icon: "🔒", duration: 3500 },
    STORAGE_ERROR: { type: "error", icon: "💾", duration: 4000 },
    CONFLICT_ERROR: { type: "warning", icon: "⚡", duration: 3200 },
    SUCCESS: { type: "success", icon: "✓", duration: 2800 },
    INFO: { type: "info", icon: "ℹ️", duration: 2800 },
  },

  /**
   * Maneja un error y muestra notificación apropiada
   */
  handle: (errorCode, customMessage = null) => {
    const config = ErrorHandler.errorTypes[errorCode] || ErrorHandler.errorTypes.INFO;
    const messages = {
      VALIDATION_ERROR: "Por favor revisa los datos ingresados",
      SAVE_ERROR: "No se pudo guardar. Intenta nuevamente",
      DELETE_ERROR: "No se pudo eliminar. Intenta nuevamente",
      AUTH_ERROR: "Usuario o contraseña incorrect",
      STORAGE_ERROR: "Error al acceder al almacenamiento del dispositivo",
      CONFLICT_ERROR: "Ya existe un registro con estos datos",
      SUCCESS: "Operación completada exitosamente",
      INFO: "Información",
    };

    const message = customMessage || messages[errorCode] || "Ocurrió un error inesperado";
    showToast({
      type: config.type,
      message: `${config.icon} ${message}`,
      duration: config.duration,
    });

    // Log para debugging (solo en console, no visible para usuario)
    if (errorCode !== "SUCCESS" && errorCode !== "INFO") {
      console.warn(`[${errorCode}]`, new Date().toISOString(), message);
    }
  },

  /**
   * Envuelve una función con manejo de errores
   */
  wrap: (fn, errorCode = "SAVE_ERROR") => {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(`[ERROR] ${errorCode}:`, error);
        ErrorHandler.handle(errorCode, error.message);
        return null;
      }
    };
  },

  /**
   * Valida y maneja múltiples campos
   */
  validateAndNotify: (fieldMap, errorPrefix = "VALIDATION_ERROR") => {
    const result = ValidationSystem.validateFields(fieldMap);
    if (!result.valid) {
      const firstError = Object.values(result.errors)[0];
      ErrorHandler.handle(errorPrefix, firstError);
      return false;
    }
    return true;
  },
};

/**
 * Sistema de manejo de casos especiales y edge cases
 */
const SpecialCases = {
  /**
   * Detecta y maneja duplicados
   */
  checkDuplicate: (fieldName, newValue, existingItems = []) => {
    const normalized = (String(newValue || "")).trim().toLowerCase();
    const isDuplicate = existingItems.some(
      (item) => (String(item[fieldName] || "")).trim().toLowerCase() === normalized
    );
    if (isDuplicate) {
      ErrorHandler.handle("CONFLICT_ERROR", `Ya existe un registro con este ${fieldName}`);
      return false;
    }
    return true;
  },

  /**
   * Valida que localStorage esté disponible y accesible
   */
  testStorageAccess: () => {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      ErrorHandler.handle("STORAGE_ERROR", "No se puede acceder al almacenamiento del navegador");
      return false;
    }
  },

  /**
   * Recupera datos corruptos o faltantes
   */
  recoveryMode: (dataKey, defaultValue = []) => {
    try {
      const raw = localStorage.getItem(dataKey);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) && Array.isArray(defaultValue)) {
        console.warn(`[RECOVERY] Datos corruptos detectados en ${dataKey}, usando valores por defecto`);
        return defaultValue;
      }
      return parsed;
    } catch (error) {
      console.error(`[RECOVERY] Error al recuperar ${dataKey}:`, error);
      showToast({
        type: "warning",
        message: `⚠️ Se detectó corrupción en datos. Usando valores por defecto.`,
        duration: 4000,
      });
      return defaultValue;
    }
  },

  /**
   * Verifica integridad de sesión antes de operaciones críticas
   */
  validateSessionState: () => {
    const sessionKey = localStorage.getItem(ADMIN_SESSION_KEY);
    const sessionUser = localStorage.getItem(ADMIN_SESSION_USER_KEY);

    if (!sessionKey || !sessionUser) {
      ErrorHandler.handle("AUTH_ERROR", "La sesión ha expirado. Por favor inicia sesión nuevamente");
      setAdminView(false);
      return false;
    }
    return true;
  },

  /**
   * Confirma acciones destructivas
   */
  requestConfirmation: (action, itemDescription = "este elemento", onConfirm = null) => {
    const message = `¿Estás seguro de que deseas ${action} ${itemDescription}? Esta acción no se puede deshacer.`;
    if (window.confirm(message)) {
      if (typeof onConfirm === "function") {
        onConfirm();
      }
      return true;
    }
    return false;
  },

  /**
   * Rate limiting para operaciones frecuentes
   */
  createRateLimiter: (maxAttempts = 5, windowMs = 60000) => {
    let attempts = 0;
    let resetTimer = null;

    return {
      isAllowed: () => {
        if (attempts >= maxAttempts) {
          ErrorHandler.handle("INFO", `Demasiados intentos. Espera ${Math.ceil(windowMs / 1000)}s`);
          return false;
        }
        attempts++;
        if (!resetTimer) {
          resetTimer = window.setTimeout(() => {
            attempts = 0;
            resetTimer = null;
          }, windowMs);
        }
        return true;
      },
    };
  },
};

function pruneSelectedLeadIds(allRows) {
  const availableIds = new Set(allRows.map((row) => row.id));
  Array.from(selectedLeadIds).forEach((id) => {
    if (!availableIds.has(id)) {
      selectedLeadIds.delete(id);
    }
  });
}

function updateBulkSelectionUI() {
  const count = selectedLeadIds.size;

  if (bulkActions) {
    bulkActions.classList.toggle("has-selection", count > 0);
    bulkActions.classList.toggle("is-empty", count === 0);
  }

  if (selectedCount) {
    selectedCount.textContent = `${count} seleccionados`;
  }

  if (applyBulkStatusBtn) {
    applyBulkStatusBtn.disabled = count === 0;
  }

  if (exportSelectedBtn) {
    exportSelectedBtn.disabled = count === 0;
  }

  if (deleteSelectedBtn) {
    deleteSelectedBtn.disabled = count === 0;
  }

  if (clearSelectionBtn) {
    clearSelectionBtn.disabled = count === 0;
  }

  if (selectPageCheckbox) {
    const pageIds = currentPageRows.map((row) => row.id);
    const selectedInPage = pageIds.filter((id) => selectedLeadIds.has(id)).length;
    selectPageCheckbox.indeterminate = selectedInPage > 0 && selectedInPage < pageIds.length;
    selectPageCheckbox.checked = pageIds.length > 0 && selectedInPage === pageIds.length;
  }
}

function exportRowsAsCsv(rows, fileSuffix = "seleccion") {
  try {
    if (!rows || rows.length === 0) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "No hay leads para exportar");
      return false;
    }

    const headers = [
      "Fecha",
      "Nombre",
      "Telefono",
      "Material",
      "Kg",
      "Estado",
      "Cobertura",
      "Prioridad",
      "Estatus",
      "Ubicacion",
      "Coordenadas",
      "Notas",
      "NotaInterna",
    ];

    const csvLines = [headers.join(",")];

    rows.forEach((row) => {
      const values = [
        row.lead.date || "",
        row.lead.fullName || "",
        row.lead.phone || "",
        row.lead.materialType || "",
        row.lead.kilos || "",
        row.state || "",
        row.coverage.label,
        row.priority.label,
        row.status,
        row.lead.locationText || "",
        row.lead.coordinates || "",
        row.lead.notes || "",
        row.internalNote || "",
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`);

      csvLines.push(values.join(","));
    });

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-eco-logica-garcia-${fileSuffix}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SUCCESS, `Exportados ${rows.length} leads`);
    return true;
  } catch (error) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SAVE_ERROR, `Error exportando CSV: ${error.message}`);
    return false;
  }
}

function getSelectedRows() {
  return currentRenderedRows.filter((row) => selectedLeadIds.has(row.id));
}

function applyBulkStatus(status) {
  try {
    // Validate session state
    if (!SpecialCases.validateSessionState()) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.AUTH_ERROR, "Tu sesión expiró. No se pueden cambiar los estatus.");
      return 0;
    }

    // Test storage access
    if (!SpecialCases.testStorageAccess()) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.STORAGE_ERROR, "No se puede acceder al almacenamiento.");
      return 0;
    }

    const ids = Array.from(selectedLeadIds);
    if (!ids.length || !status) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "No hay leads seleccionados");
      return 0;
    }

    const meta = getAdminMeta();
    const leadNameById = new Map(currentRenderedRows.map((row) => [row.id, row.lead.fullName || "Sin nombre"]));
    let changed = 0;

    ids.forEach((id) => {
      const previous = meta[id]?.status || "Nuevo";
      if (previous === status) {
        return;
      }

      meta[id] = {
        ...(meta[id] || {}),
        status,
      };

      trackHistory({
        leadId: id,
        leadName: leadNameById.get(id) || "Sin nombre",
        action: "Cambio de estatus masivo",
        detail: `De ${previous} a ${status}`,
      });

      changed += 1;
    });

    if (changed > 0) {
      saveAdminMeta(meta);
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SUCCESS, `Estatus actualizado en ${changed} leads`);
    } else {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "No hubo cambios de estatus");
    }

    return changed;
  } catch (error) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SAVE_ERROR, `Error en cambio masivo de estatus: ${error.message}`);
    return 0;
  }
}

function deleteLeadsByIds(ids) {
  if (!ids || ids.length === 0) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "No hay leads seleccionados");
    return [];
  }

  // Validate session state
  if (!SpecialCases.validateSessionState()) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.AUTH_ERROR, "Tu sesión expiró. No se pueden eliminar los leads.");
    return [];
  }

  // Single confirmation for bulk operation
  if (!SpecialCases.requestConfirmation(
    "Eliminar leads en masa",
    `¿Eliminar ${ids.length} leads seleccionados? Esta acción no se puede deshacer desde tabla.`
  )) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "Operación cancelada");
    return [];
  }

  // Test storage access before batch deletion
  if (!SpecialCases.testStorageAccess()) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.STORAGE_ERROR, "No se puede acceder al almacenamiento para eliminar en masa.");
    return [];
  }

  try {
    const payloads = [];
    const leads = ensureLeadIds();
    let deletedCount = 0;

    // Delete all leads at once
    const filteredLeads = leads.filter((lead) => {
      const shouldDelete = ids.includes(lead.id);
      if (shouldDelete) deletedCount++;
      return !shouldDelete;
    });

    if (deletedCount === 0) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.VALIDATION_ERROR, "Ninguno de los leads fue encontrado");
      return [];
    }

    // Build payloads for undo functionality
    ids.forEach((id) => {
      const lead = leads.find((l) => l.id === id);
      if (lead) {
        const originalIndex = leads.indexOf(lead);
        const meta = getAdminMeta();
        payloads.push({
          lead: lead,
          meta: meta[id] || null,
          originalIndex: originalIndex,
        });
      }
      selectedLeadIds.delete(id);
    });

    // Save filtered leads
    saveLeads(filteredLeads);

    // Update metadata
    const meta = getAdminMeta();
    ids.forEach((id) => {
      if (meta[id]) {
        delete meta[id];
      }
    });
    saveAdminMeta(meta);

    // Track history for bulk deletion
    trackHistory({
      leadId: "bulk",
      leadName: `${deletedCount} leads`,
      action: "Eliminación en masa",
      detail: `Se eliminaron ${deletedCount} leads desde panel admin`,
    });

    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SUCCESS, `${deletedCount} leads eliminados correctamente`);

    return payloads;
  } catch (error) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.DELETE_ERROR, `Error en eliminación en masa: ${error.message}`);
    return [];
  }
}

function restoreDeletedPayload(payload) {
  if (!payload) {
    return;
  }

  if (Array.isArray(payload.batch)) {
    payload.batch
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .forEach((item) => restoreDeletedLead(item));
    return;
  }

  restoreDeletedLead(payload);
}

function applyFilters(rows) {
  return rows.filter((row) => {
    const matchesSearch = !uiState.search || row.searchIndex.includes(uiState.search);
    const matchesCoverage = uiState.coverage === "all" || row.coverage.label === uiState.coverage;
    const matchesState = uiState.state === "all" || row.state === uiState.state;
    const matchesStatus = uiState.status === "all" || row.status === uiState.status;
    return matchesSearch && matchesCoverage && matchesState && matchesStatus;
  });
}

function applySort(rows) {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    if (uiState.sortBy === "dateAsc") {
      return a.dateMs - b.dateMs;
    }

    if (uiState.sortBy === "kilosDesc") {
      return b.kilos - a.kilos;
    }

    if (uiState.sortBy === "kilosAsc") {
      return a.kilos - b.kilos;
    }

    return b.dateMs - a.dateMs;
  });
  return sorted;
}

function updateSummary(rows) {
  if (!summaryTotal || !summaryActive || !summaryMin10 || !summaryKilos) {
    return;
  }

  const total = rows.length;
  const active = rows.filter((row) => row.coverage.label === "Activa").length;
  const min10 = rows.filter((row) => row.coverage.label === "10kg+").length;
  const kilos = rows.reduce((acc, row) => acc + row.kilos, 0);

  summaryTotal.textContent = String(total);
  summaryActive.textContent = String(active);
  summaryMin10.textContent = String(min10);
  summaryKilos.textContent = kilos.toFixed(1);
}

function populateHistoryLeadFilter(rows, history) {
  if (!historyLeadFilter) {
    return;
  }

  const selected = uiState.historyLead;
  const fromRows = rows.map((row) => ({ id: row.id, name: row.lead.fullName || "Sin nombre" }));

  const fromHistory = history
    .filter((item) => item.leadId)
    .map((item) => ({
      id: item.leadId,
      name: item.leadName || `Lead ${item.leadId}`,
    }));

  const unique = new Map();
  [...fromRows, ...fromHistory].forEach((entry) => {
    if (!unique.has(entry.id)) {
      unique.set(entry.id, entry.name);
    }
  });

  const options = Array.from(unique.entries()).sort((a, b) => a[1].localeCompare(b[1], "es"));

  historyLeadFilter.innerHTML = `
    <option value="all">Todos los leads</option>
    ${options
      .map(([id, name]) => `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`)
      .join("")}
  `;

  if (selected !== "all" && unique.has(selected)) {
    historyLeadFilter.value = selected;
  } else {
    historyLeadFilter.value = "all";
    uiState.historyLead = "all";
  }
}

function renderHistory(rows) {
  if (!historyList || !historyCount) {
    return;
  }

  const leadNames = buildLeadNameMap();
  const history = getHistory();

  populateHistoryLeadFilter(rows, history);

  const filtered = history.filter((item) => {
    if (uiState.historyLead === "all") {
      return true;
    }

    return item.leadId === uiState.historyLead;
  });

  historyCount.textContent = `${filtered.length} eventos`;

  if (!filtered.length) {
    historyList.innerHTML = "<p class='history-empty'>Aún no hay eventos para ese filtro.</p>";
    return;
  }

  historyList.innerHTML = filtered
    .slice(0, 120)
    .map((item) => {
      const resolvedName = item.leadName || leadNames.get(item.leadId) || "Lead sin nombre";

      return `
        <article class="history-item">
          <div class="history-item-top">
            <span class="${getActionTone(item.action || "Cambio")}">${escapeHtml(
              item.action || "Cambio"
            )}</span>
            <time>${escapeHtml(formatDateTime(item.at))}</time>
          </div>
          <p class="history-item-title">${escapeHtml(resolvedName)}</p>
          <p class="history-item-detail">${escapeHtml(item.detail || "Sin detalle")}</p>
        </article>
      `;
    })
    .join("");
}

function renderRows(rows) {
  if (!leadsTableBody) {
    return;
  }

  if (!rows.length) {
    leadsTableBody.innerHTML = "<tr><td colspan='15'>No hay registros con esos filtros.</td></tr>";
    return;
  }

  leadsTableBody.innerHTML = rows
    .map((row) => {
      const statusOptions = STATUS_OPTIONS
        .map(
          (status) =>
            `<option value="${status}" ${row.status === status ? "selected" : ""}>${status}</option>`
        )
        .join("");

      const copyText = [
        `Nombre: ${row.lead.fullName || "-"}`,
        `Teléfono: ${row.lead.phone || "-"}`,
        `Estado: ${row.state || "-"}`,
        `Kg: ${row.lead.kilos || "-"}`,
        `Material: ${row.lead.materialType || "-"}`,
      ].join(" | ");

      return `<tr>
        <td class="select-col"><input type="checkbox" class="row-select" data-id="${escapeHtml(
          row.id
        )}" ${selectedLeadIds.has(row.id) ? "checked" : ""} aria-label="Seleccionar lead" /></td>
        <td class="cell-date">${escapeHtml(row.lead.date || "")}</td>
        <td class="cell-name">${escapeHtml(row.lead.fullName || "")}</td>
        <td class="cell-phone">${escapeHtml(row.lead.phone || "")}</td>
        <td class="cell-material">${escapeHtml(row.lead.materialType || "")}</td>
        <td class="cell-kilos">${escapeHtml(row.lead.kilos || "")}</td>
        <td class="cell-state">${escapeHtml(row.state || "-")}</td>
        <td><span class="${row.coverage.className}">${row.coverage.label}</span></td>
        <td><span class="${row.priority.className}">${row.priority.label}</span></td>
        <td>
          <select class="status-select" data-id="${escapeHtml(row.id)}">
            ${statusOptions}
          </select>
        </td>
        <td class="cell-location">${escapeHtml(row.lead.locationText || "")}</td>
        <td class="cell-coords">${escapeHtml(row.lead.coordinates || "-")}</td>
        <td class="cell-notes">${escapeHtml(row.lead.notes || "-")}</td>
        <td>
          <input class="internal-note-input" data-id="${escapeHtml(row.id)}" value="${escapeHtml(
            row.internalNote
          )}" placeholder="Seguimiento interno" />
        </td>
        <td>
          <div class="table-actions-inline">
            <button type="button" class="btn btn-ghost copy-btn" data-copy="${escapeHtml(copyText)}">Copiar</button>
            <button type="button" class="btn btn-ghost history-btn" data-id="${escapeHtml(row.id)}">Historial</button>
            <button type="button" class="btn btn-ghost edit-btn" data-id="${escapeHtml(row.id)}">Editar</button>
            <button type="button" class="btn btn-ghost delete-btn" data-id="${escapeHtml(row.id)}">Eliminar</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

function saveStatus(id, status) {
  try {
    // Validate session state
    if (!SpecialCases.validateSessionState()) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.AUTH_ERROR, "Tu sesión expiró. No se puede cambiar el estatus.");
      return false;
    }

    // Test storage access
    if (!SpecialCases.testStorageAccess()) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.STORAGE_ERROR, "No se puede acceder al almacenamiento.");
      return false;
    }

    const meta = getAdminMeta();
    const previous = meta[id]?.status || "Nuevo";

    if (previous === status) {
      return true; // No change needed
    }

    meta[id] = {
      ...(meta[id] || {}),
      status,
    };
    saveAdminMeta(meta);

    const lead = ensureLeadIds().find((item) => item.id === id);
    trackHistory({
      leadId: id,
      leadName: lead?.fullName || "Sin nombre",
      action: "Cambio de estatus",
      detail: `De ${previous} a ${status}`,
    });

    return true;
  } catch (error) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SAVE_ERROR, `Error guardando estatus: ${error.message}`);
    return false;
  }
}

function saveInternalNote(id, internalNote) {
  try {
    // Validate session state
    if (!SpecialCases.validateSessionState()) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.AUTH_ERROR, "Tu sesión expiró. No se puede guardar la nota.");
      return false;
    }

    // Test storage access
    if (!SpecialCases.testStorageAccess()) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.STORAGE_ERROR, "No se puede guardar nota. Acceso al almacenamiento denegado.");
      return false;
    }

    const meta = getAdminMeta();
    const previous = meta[id]?.internalNote || "";

    if (previous === internalNote) {
      return true; // No change needed
    }

    meta[id] = {
      ...(meta[id] || {}),
      internalNote,
    };
    saveAdminMeta(meta);

    const lead = ensureLeadIds().find((item) => item.id === id);
    trackHistory({
      leadId: id,
      leadName: lead?.fullName || "Sin nombre",
      action: "Nota interna actualizada",
      detail: internalNote ? "Se actualizo la nota de seguimiento" : "Se limpio la nota interna",
    });

    return true;
  } catch (error) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SAVE_ERROR, `Error guardando nota: ${error.message}`);
    return false;
  }
}

function openLeadEditor(row) {
  if (!leadEditor || !leadEditorForm || !leadEditorTitle) {
    return;
  }

  leadEditor.classList.remove("hidden");

  if (!row) {
    leadEditorTitle.textContent = "Agregar lead";
    leadEditorForm.reset();
    if (leadEditorId) {
      leadEditorId.value = "";
    }
    return;
  }

  leadEditorTitle.textContent = "Editar lead";

  const formFields = {
    id: row.id,
    fullName: row.lead.fullName || "",
    phone: row.lead.phone || "",
    materialType: row.lead.materialType || "",
    kilos: row.lead.kilos || "",
    state: row.lead.state || "",
    coordinates: row.lead.coordinates || "",
    locationText: row.lead.locationText || "",
    notes: row.lead.notes || "",
    status: row.status || "Nuevo",
    internalNote: row.internalNote || "",
  };

  Object.entries(formFields).forEach(([name, value]) => {
    const field = leadEditorForm.elements.namedItem(name);
    if (field && "value" in field) {
      field.value = value;
    }
  });
}

function closeLeadEditor() {
  if (!leadEditor || !leadEditorForm) {
    return;
  }

  leadEditor.classList.add("hidden");
  leadEditorForm.reset();
}

function saveLeadFromEditor(formData) {
  // Validate session state
  if (!SpecialCases.validateSessionState()) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.AUTH_ERROR, "Tu sesión expiró. Inicia sesión nuevamente.");
    return false;
  }

  // Test storage access before attempting to save
  if (!SpecialCases.testStorageAccess()) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.STORAGE_ERROR, "No se puede acceder al almacenamiento. Intenta de nuevo.");
    return false;
  }

  try {
    const id = formData.get("id")?.toString().trim();
    
    // Extract and clean form data
    const fullName = formData.get("fullName")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const kilos = formData.get("kilos")?.toString().trim();
    
    // Validate required fields
    const validationErrors = [];

    if (!ValidationSystem.validateField("leadName", fullName)) {
      validationErrors.push("Nombre debe tener 2+ caracteres");
    }

    if (phone && !ValidationSystem.validateField("phone", phone)) {
      validationErrors.push("Teléfono debe tener 7+ dígitos");
    }

    if (kilos && !ValidationSystem.validateField("kilos", kilos)) {
      validationErrors.push("Kilos debe ser un número entre 0-9999");
    }

    if (validationErrors.length > 0) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.VALIDATION_ERROR, validationErrors.join(" | "));
      return false;
    }

    const leadPayload = {
      id: id || generateLeadId(),
      date: new Date().toLocaleString("es-MX"),
      fullName: fullName,
      phone: phone,
      materialType: formData.get("materialType")?.toString().trim(),
      kilos: kilos,
      state: formData.get("state")?.toString().trim(),
      locationText: formData.get("locationText")?.toString().trim(),
      coordinates: formData.get("coordinates")?.toString().trim(),
      notes: formData.get("notes")?.toString().trim(),
    };

    const leads = ensureLeadIds();
    let previousLead = null;
    const isNewLead = !id;

    // Handle existing lead
    if (id) {
      const existingIndex = leads.findIndex((lead) => lead.id === id);
      if (existingIndex >= 0) {
        previousLead = { ...leads[existingIndex] };
        leadPayload.date = leads[existingIndex].date || leadPayload.date;
        leads[existingIndex] = {
          ...leads[existingIndex],
          ...leadPayload,
        };
      } else {
        ErrorHandler.handle(ErrorHandler.ERROR_TYPES.VALIDATION_ERROR, "Lead no encontrado");
        return false;
      }
    } else {
      // Check for duplicate phone if provided
      if (phone && SpecialCases.checkDuplicate("phone", phone, leads, "phone")) {
        if (!confirm(`Un lead con teléfono "${phone}" ya existe. ¿Deseas continuar?`)) {
          ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "Operación cancelada");
          return false;
        }
      }
      leads.unshift(leadPayload);
    }

    // Save leads
    saveLeads(leads);

    // Handle metadata
    const meta = getAdminMeta();
    const status = formData.get("status")?.toString().trim() || "Nuevo";
    const internalNote = formData.get("internalNote")?.toString().trim() || "";
    meta[leadPayload.id] = {
      ...(meta[leadPayload.id] || {}),
      status,
      internalNote,
    };
    saveAdminMeta(meta);

    // Track history
    trackHistory({
      leadId: leadPayload.id,
      leadName: leadPayload.fullName || previousLead?.fullName || "Sin nombre",
      action: id ? "Lead editado" : "Lead agregado",
      detail: summarizeLeadChanges(previousLead, leadPayload),
    });

    // Show success message
    ErrorHandler.handle(
      ErrorHandler.ERROR_TYPES.SUCCESS,
      isNewLead ? "Lead agregado correctamente" : "Lead actualizado correctamente"
    );

    return true;
  } catch (error) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SAVE_ERROR, `Error guardando lead: ${error.message}`);
    return false;
  }
}

function deleteLeadById(id) {
  // Validate session state - critical for destructive operations
  if (!SpecialCases.validateSessionState()) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.AUTH_ERROR, "Tu sesión expiró. No se puede eliminar.");
    return null;
  }

  // Test storage access before attempting deletion
  if (!SpecialCases.testStorageAccess()) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.STORAGE_ERROR, "No se puede acceder al almacenamiento para eliminar.");
    return null;
  }

  try {
    const leads = ensureLeadIds();
    const currentLead = leads.find((lead) => lead.id === id);
    
    if (!currentLead) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.VALIDATION_ERROR, "Lead no encontrado");
      return null;
    }

    // Request confirmation for destructive operation
    const leadName = currentLead.fullName || "Sin nombre";
    if (!SpecialCases.requestConfirmation("Eliminar Lead", `¿Eliminar a "${leadName}"? Esta acción no se puede deshacer.`)) {
      ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "Eliminación cancelada");
      return null;
    }

    const currentIndex = leads.findIndex((lead) => lead.id === id);
    const filtered = leads.filter((lead) => lead.id !== id);
    saveLeads(filtered);

    const meta = getAdminMeta();
    const previousMeta = meta[id] || null;
    if (meta[id]) {
      delete meta[id];
      saveAdminMeta(meta);
    }

    trackHistory({
      leadId: id,
      leadName: leadName,
      action: "Lead eliminado",
      detail: "Registro eliminado desde panel admin",
    });

    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SUCCESS, `Lead "${leadName}" eliminado correctamente`);

    return {
      lead: currentLead,
      meta: previousMeta,
      originalIndex: currentIndex,
    };
  } catch (error) {
    ErrorHandler.handle(ErrorHandler.ERROR_TYPES.DELETE_ERROR, `Error eliminando lead: ${error.message}`);
    return null;
  }
}

function restoreDeletedLead(payload) {
  if (!payload?.lead) {
    return;
  }

  const leads = ensureLeadIds();
  const index = Number.isInteger(payload.originalIndex) ? payload.originalIndex : 0;
  leads.splice(Math.max(0, Math.min(index, leads.length)), 0, payload.lead);
  saveLeads(leads);

  if (payload.meta) {
    const meta = getAdminMeta();
    meta[payload.lead.id] = payload.meta;
    saveAdminMeta(meta);
  }

  trackHistory({
    leadId: payload.lead.id,
    leadName: payload.lead.fullName || "Sin nombre",
    action: "Eliminacion revertida",
    detail: "Lead restaurado desde notificacion",
  });
}

function renderLeadsTable() {
  if (!leadsTableBody) {
    return;
  }

  syncFilterControlsWithState();

  const rows = buildLeadRows();
  populateStateFilter(rows);
  const filteredRows = applyFilters(rows);
  const sortedRows = applySort(filteredRows);
  const paginationMeta = paginateRows(sortedRows);

  pruneSelectedLeadIds(rows);
  currentRenderedRows = sortedRows;
  currentPageRows = paginationMeta.pageRows;
  updateSummary(sortedRows);
  renderRows(paginationMeta.pageRows);
  renderPagination(paginationMeta);
  updateBulkSelectionUI();
  renderHistory(rows);
}

function exportRowsToCsv() {
  if (!currentRenderedRows.length) {
    return;
  }
  exportRowsAsCsv(currentRenderedRows, "filtro");
}

function handleTableActions(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.classList.contains("status-select")) {
    const select = target;
    const id = select.dataset.id;
    if (id) {
      const saved = saveStatus(id, select.value);
      if (saved) {
        renderLeadsTable();
      }
    }
    return;
  }

  if (target.classList.contains("row-select")) {
    const input = target;
    const id = input.dataset.id;
    if (!id) {
      return;
    }

    if (input.checked) {
      selectedLeadIds.add(id);
    } else {
      selectedLeadIds.delete(id);
    }

    updateBulkSelectionUI();
    return;
  }

  if (target.classList.contains("copy-btn")) {
    const textToCopy = target.dataset.copy || "";
    if (!textToCopy) {
      return;
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      showToast({ type: "info", message: "Datos copiados al portapapeles" });
      return;
    }

    const aux = document.createElement("textarea");
    aux.value = textToCopy;
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    showToast({ type: "info", message: "Datos copiados al portapapeles" });
    return;
  }

  if (target.classList.contains("edit-btn")) {
    const id = target.dataset.id;
    if (!id) {
      return;
    }

    const row = currentPageRows.find((item) => item.id === id) ||
      currentRenderedRows.find((item) => item.id === id);
    if (row) {
      openLeadEditor(row);
    }
    return;
  }

  if (target.classList.contains("history-btn")) {
    const id = target.dataset.id;
    if (!id || !historyLeadFilter) {
      return;
    }

    uiState.historyLead = id;
    historyLeadFilter.value = id;
    renderHistory(buildLeadRows());
    return;
  }

  if (target.classList.contains("delete-btn")) {
    const id = target.dataset.id;
    if (!id) {
      return;
    }

    // deleteLeadById handles confirmation internally
    recentlyDeletedLead = deleteLeadById(id);
    
    // Only proceed if deletion was successful
    if (!recentlyDeletedLead) {
      return;
    }

    selectedLeadIds.delete(id);
    showToast({
      type: "warning",
      message: "Lead eliminado",
      actionLabel: "Deshacer",
      duration: 6500,
      onAction: () => {
        if (!recentlyDeletedLead) {
          return;
        }

        restoreDeletedPayload(recentlyDeletedLead);
        recentlyDeletedLead = null;
        renderLeadsTable();
        ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SUCCESS, "Eliminación deshecha");
      },
    });
    renderLeadsTable();
  }
}

function handleInternalNoteSave(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (!target.classList.contains("internal-note-input")) {
    return;
  }

  const id = target.dataset.id;
  if (!id) {
    return;
  }

  saveInternalNote(id, target.value.trim());
}

function bindAdminPanelEvents() {
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      uiState.search = normalizeText(searchInput.value);
      resetToFirstPage();
      renderLeadsTable();
    });
  }

  if (coverageFilter) {
    coverageFilter.addEventListener("change", () => {
      uiState.coverage = sanitizeSelectValue(coverageFilter.value, COVERAGE_FILTER_OPTIONS);
      coverageFilter.value = uiState.coverage;
      resetToFirstPage();
      renderLeadsTable();
    });
  }

  if (stateFilter) {
    stateFilter.addEventListener("change", () => {
      uiState.state = stateFilter.value;
      resetToFirstPage();
      renderLeadsTable();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      uiState.status = sanitizeSelectValue(statusFilter.value, STATUS_FILTER_OPTIONS);
      statusFilter.value = uiState.status;
      resetToFirstPage();
      renderLeadsTable();
    });
  }

  if (sortBy) {
    sortBy.addEventListener("change", () => {
      uiState.sortBy = sanitizeSelectValue(sortBy.value, SORT_FILTER_OPTIONS, "dateDesc");
      sortBy.value = uiState.sortBy;
      resetToFirstPage();
      renderLeadsTable();
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", () => {
      const nextSize = Number.parseInt(pageSizeSelect.value, 10);
      uiState.pageSize = Number.isFinite(nextSize) && nextSize > 0 ? nextSize : 10;
      resetToFirstPage();
      renderLeadsTable();
    });
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      uiState.page = Math.max(1, uiState.page - 1);
      renderLeadsTable();
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      uiState.page += 1;
      renderLeadsTable();
    });
  }

  if (selectPageCheckbox) {
    selectPageCheckbox.addEventListener("change", () => {
      if (selectPageCheckbox.checked) {
        currentPageRows.forEach((row) => selectedLeadIds.add(row.id));
      } else {
        currentPageRows.forEach((row) => selectedLeadIds.delete(row.id));
      }

      renderRows(currentPageRows);
      updateBulkSelectionUI();
    });
  }

  if (clearSelectionBtn) {
    clearSelectionBtn.addEventListener("click", () => {
      selectedLeadIds.clear();
      renderRows(currentPageRows);
      updateBulkSelectionUI();
      showToast({ type: "info", message: "Selección limpiada" });
    });
  }

  if (applyBulkStatusBtn) {
    applyBulkStatusBtn.addEventListener("click", () => {
      const status = bulkStatusSelect?.value || "";
      if (!status) {
        showToast({ type: "info", message: "Selecciona un estatus para aplicar" });
        return;
      }

      const changed = applyBulkStatus(status);
      renderLeadsTable();
      showToast({
        type: changed > 0 ? "success" : "info",
        message: changed > 0 ? `Estatus aplicado a ${changed} leads` : "No hubo cambios de estatus",
      });
    });
  }

  if (exportSelectedBtn) {
    exportSelectedBtn.addEventListener("click", () => {
      const selectedRows = getSelectedRows();
      if (!selectedRows.length) {
        showToast({ type: "info", message: "No hay leads seleccionados" });
        return;
      }

      exportRowsAsCsv(selectedRows, "selección");
      showToast({ type: "success", message: `Exportados ${selectedRows.length} leads` });
    });
  }

  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", () => {
      const ids = Array.from(selectedLeadIds);
      if (!ids.length) {
        ErrorHandler.handle(ErrorHandler.ERROR_TYPES.INFO, "No hay leads seleccionados");
        return;
      }

      // deleteLeadsByIds handles confirmation internally
      const batch = deleteLeadsByIds(ids);
      
      // Only proceed if deletion was successful
      if (!batch || batch.length === 0) {
        return;
      }

      recentlyDeletedLead = { batch };
      renderLeadsTable();

      showToast({
        type: "warning",
        message: `${batch.length} leads eliminados`,
        actionLabel: "Deshacer",
        duration: 7000,
        onAction: () => {
          restoreDeletedPayload(recentlyDeletedLead);
          recentlyDeletedLead = null;
          renderLeadsTable();
          ErrorHandler.handle(ErrorHandler.ERROR_TYPES.SUCCESS, "Eliminación masiva deshecha");
        },
      });
    });
  }

  if (historyLeadFilter) {
    historyLeadFilter.addEventListener("change", () => {
      uiState.historyLead = historyLeadFilter.value;
      renderHistory(buildLeadRows());
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      const shouldClear = confirm("Se eliminará el historial completo. ¿Deseas continuar?");
      if (!shouldClear) {
        return;
      }

      saveHistory([]);
      uiState.historyLead = "all";
      if (historyLeadFilter) {
        historyLeadFilter.value = "all";
      }
      renderHistory(buildLeadRows());
      showToast({ type: "info", message: "Historial limpio" });
    });
  }

  if (addLeadBtn) {
    addLeadBtn.addEventListener("click", () => {
      openLeadEditor(null);
    });
  }

  if (closeLeadEditorBtn) {
    closeLeadEditorBtn.addEventListener("click", closeLeadEditor);
  }

  if (cancelLeadEditorBtn) {
    cancelLeadEditorBtn.addEventListener("click", closeLeadEditor);
  }

  if (leadEditorForm) {
    leadEditorForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(leadEditorForm);
      const savedSuccessfully = saveLeadFromEditor(formData);
      
      // Only close editor and refresh if save was successful
      if (savedSuccessfully) {
        closeLeadEditor();
        resetToFirstPage();
        renderLeadsTable();
      }
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", exportRowsToCsv);
  }

  if (leadsTableBody) {
    leadsTableBody.addEventListener("change", handleTableActions);
    leadsTableBody.addEventListener("click", handleTableActions);
    leadsTableBody.addEventListener("blur", handleInternalNoteSave, true);
  }
}

function applyAdminZone(zoneName, options = {}) {
  if (!adminPanel || !adminZoneSections.length) {
    return;
  }

  const requestedZone = String(zoneName || "").trim();
  const fallbackZone = adminZoneSections[0]?.dataset.zoneName || "operation";
  const availableZone = adminZoneSections.some((section) => section.dataset.zoneName === requestedZone)
    ? requestedZone
    : fallbackZone;

  adminPanel.classList.add("admin-zones-enabled");

  adminZoneSections.forEach((section) => {
    section.classList.toggle("is-active", section.dataset.zoneName === availableZone);
  });

  adminSidebarLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.adminZone === availableZone);
  });

  renderAdminSessionInfo(availableZone);

  if (options.persist !== false) {
    localStorage.setItem(ADMIN_ACTIVE_ZONE_KEY, availableZone);
  }

  if (options.scrollSelector) {
    const target = document.querySelector(options.scrollSelector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function initAdminZoneNavigation() {
  if (!adminPanel || !adminZoneSections.length || !adminSidebarLinks.length) {
    return;
  }

  adminSidebarLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      applyAdminZone(link.dataset.adminZone, {
        scrollSelector: link.dataset.adminScroll || link.getAttribute("href"),
      });
    });
  });

  const savedZone = localStorage.getItem(ADMIN_ACTIVE_ZONE_KEY);
  applyAdminZone(savedZone, { persist: false });
}

function setAdminView(isLoggedIn) {
  if (!adminPanel || !adminLoginForm) {
    return;
  }

  if (isLoggedIn) {
    adminPanel.classList.remove("hidden");
    adminLoginForm.classList.add("hidden");
    renderLeadsTable();
    renderAdminUsers();
    applyAdminZone(localStorage.getItem(ADMIN_ACTIVE_ZONE_KEY), { persist: false });
    return;
  }

  renderAdminSessionInfo("operation");
  adminPanel.classList.add("hidden");
  adminLoginForm.classList.remove("hidden");
}

function applyAdminTheme(theme) {
  const normalizedTheme = theme === "light" ? "light" : "dark";
  const isLight = normalizedTheme === "light";

  document.body.classList.toggle("admin-light-mode", isLight);
  document.body.style.color = isLight ? "#102016" : "#f3fff5";

  if (adminThemeToggle) {
    adminThemeToggle.textContent = isLight ? "Tema oscuro" : "Tema claro";
    adminThemeToggle.setAttribute("aria-label", isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
  }

  localStorage.setItem(ADMIN_THEME_KEY, normalizedTheme);
}

function initAdminTheme() {
  const savedTheme = localStorage.getItem(ADMIN_THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyAdminTheme(savedTheme || (prefersDark ? "dark" : "light"));

  if (adminThemeToggle) {
    adminThemeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("admin-light-mode") ? "dark" : "light";
      applyAdminTheme(nextTheme);
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== ADMIN_THEME_KEY || !event.newValue) {
      return;
    }

    applyAdminTheme(event.newValue);
  });
}

if (adminLoginForm && loginMsg) {
  // Rate limiter para intentos de login
  const loginRateLimiter = SpecialCases.createRateLimiter(5, 60000);

  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Verificar rate limit
    if (!loginRateLimiter.isAllowed()) {
      loginMsg.textContent = "Demasiados intentos. Intenta más tarde.";
      return;
    }

    // Verificar disponibilidad de storage
    if (!SpecialCases.testStorageAccess()) {
      loginMsg.textContent = "Error al acceder al almacenamiento.";
      return;
    }

    const formData = new FormData(adminLoginForm);
    const username = (formData.get("username") || "").toString().trim();
    const password = (formData.get("password") || "").toString().trim();

    // Validar campos
    if (!ErrorHandler.validateAndNotify(
      { username, password },
      "Auth Validation"
    )) {
      loginMsg.textContent = "Completa todos los campos correctamente.";
      ErrorHandler.handle("AUTH_ERROR", "Campos de login incompletos o inválidos");
      return;
    }

    // Intentar autenticación
    const authenticatedUser = authenticateAdmin(username, password);

    if (authenticatedUser) {
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, "1");
        localStorage.setItem(ADMIN_SESSION_USER_KEY, authenticatedUser.username);
        localStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
        
        loginMsg.textContent = "✓ Acceso correcto. Cargando...";
        loginMsg.style.color = "#3ecf8e";
        
        // Reset del formulario
        adminLoginForm.reset();
        
        // Pequeño delay para UX
        window.setTimeout(() => {
          setAdminView(true);
          ErrorHandler.handle("SUCCESS", `Bienvenido, ${authenticatedUser.username}`);
        }, 300);
      } catch (error) {
        ErrorHandler.handle("STORAGE_ERROR");
        loginMsg.textContent = "Error al guardar sesión. Intenta nuevamente.";
      }
      return;
    }

    // Falló la autenticación
    loginMsg.textContent = "❌ Usuario o contraseña incorrectos.";
    loginMsg.style.color = "#f06b6b";
    ErrorHandler.handle("AUTH_ERROR");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_USER_KEY);
    setAdminView(false);
  });
}

ensureAdminUsers();
bindAdminPanelEvents();
bindAdminUsersEvents();
initAdminZoneNavigation();
initAdminTheme();

setAdminView(
  localStorage.getItem(ADMIN_SESSION_KEY) === "1" ||
    localStorage.getItem(LEGACY_ADMIN_SESSION_KEY) === "1"
);
