const LEADS_KEY = "reciclajeLogikasLeads";
const LEGACY_LEADS_KEY = "reciclajesGLeads";
const ADMIN_SESSION_KEY = "reciclajeLogikasAdminSession";
const LEGACY_ADMIN_SESSION_KEY = "reciclajesGAdminSession";
const ADMIN_META_KEY = "reciclajeLogikasAdminMeta";
const ADMIN_HISTORY_KEY = "reciclajeLogikasAdminHistory";
const ADMIN_USER = "AdanGL";
const ADMIN_PASS = "Agl252002";

const adminLoginForm = document.getElementById("adminLoginForm");
const loginMsg = document.getElementById("loginMsg");
const adminPanel = document.getElementById("adminPanel");
const logoutBtn = document.getElementById("logoutBtn");
const addLeadBtn = document.getElementById("addLeadBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const leadsTableBody = document.getElementById("leadsTableBody");

const summaryTotal = document.getElementById("summaryTotal");
const summaryActive = document.getElementById("summaryActive");
const summaryMin10 = document.getElementById("summaryMin10");
const summaryKilos = document.getElementById("summaryKilos");

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
const selectedLeadIds = new Set();

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
  const raw = localStorage.getItem(ADMIN_META_KEY);
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
}

function getHistory() {
  const raw = localStorage.getItem(ADMIN_HISTORY_KEY);
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
  history.unshift({
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    actor: "Admin",
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
  if (!rows.length) {
    return;
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
  link.download = `leads-logikas-${fileSuffix}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getSelectedRows() {
  return currentRenderedRows.filter((row) => selectedLeadIds.has(row.id));
}

function applyBulkStatus(status) {
  const ids = Array.from(selectedLeadIds);
  if (!ids.length || !status) {
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

  saveAdminMeta(meta);
  return changed;
}

function deleteLeadsByIds(ids) {
  const payloads = [];
  ids.forEach((id) => {
    const deleted = deleteLeadById(id);
    if (deleted?.lead) {
      payloads.push(deleted);
    }
    selectedLeadIds.delete(id);
  });
  return payloads;
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
  const meta = getAdminMeta();
  const previous = meta[id]?.status || "Nuevo";

  if (previous === status) {
    return;
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
}

function saveInternalNote(id, internalNote) {
  const meta = getAdminMeta();
  const previous = meta[id]?.internalNote || "";

  if (previous === internalNote) {
    return;
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
  const id = formData.get("id")?.toString().trim();
  const leadPayload = {
    id: id || generateLeadId(),
    date: new Date().toLocaleString("es-MX"),
    fullName: formData.get("fullName")?.toString().trim(),
    phone: formData.get("phone")?.toString().trim(),
    materialType: formData.get("materialType")?.toString().trim(),
    kilos: formData.get("kilos")?.toString().trim(),
    state: formData.get("state")?.toString().trim(),
    locationText: formData.get("locationText")?.toString().trim(),
    coordinates: formData.get("coordinates")?.toString().trim(),
    notes: formData.get("notes")?.toString().trim(),
  };

  const leads = ensureLeadIds();
  let previousLead = null;

  if (id) {
    const existingIndex = leads.findIndex((lead) => lead.id === id);
    if (existingIndex >= 0) {
      previousLead = { ...leads[existingIndex] };
      leadPayload.date = leads[existingIndex].date || leadPayload.date;
      leads[existingIndex] = {
        ...leads[existingIndex],
        ...leadPayload,
      };
    }
  } else {
    leads.unshift(leadPayload);
  }

  saveLeads(leads);

  const meta = getAdminMeta();
  const status = formData.get("status")?.toString().trim() || "Nuevo";
  const internalNote = formData.get("internalNote")?.toString().trim() || "";
  meta[leadPayload.id] = {
    ...(meta[leadPayload.id] || {}),
    status,
    internalNote,
  };
  saveAdminMeta(meta);

  trackHistory({
    leadId: leadPayload.id,
    leadName: leadPayload.fullName || previousLead?.fullName || "Sin nombre",
    action: id ? "Lead editado" : "Lead agregado",
    detail: summarizeLeadChanges(previousLead, leadPayload),
  });

  showToast({
    type: "success",
    message: id ? "Lead actualizado correctamente" : "Lead agregado correctamente",
  });
}

function deleteLeadById(id) {
  const leads = ensureLeadIds();
  const currentIndex = leads.findIndex((lead) => lead.id === id);
  const currentLead = leads.find((lead) => lead.id === id);
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
    leadName: currentLead?.fullName || "Sin nombre",
    action: "Lead eliminado",
    detail: "Registro eliminado desde panel admin",
  });

  return {
    lead: currentLead || null,
    meta: previousMeta,
    originalIndex: currentIndex,
  };
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
      saveStatus(id, select.value);
      renderLeadsTable();
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

    const shouldDelete = confirm("¿Eliminar este lead? Esta acción no se puede deshacer.");
    if (!shouldDelete) {
      return;
    }

    recentlyDeletedLead = deleteLeadById(id);
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
        showToast({ type: "success", message: "Eliminación deshecha" });
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
      uiState.coverage = coverageFilter.value;
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
      uiState.status = statusFilter.value;
      resetToFirstPage();
      renderLeadsTable();
    });
  }

  if (sortBy) {
    sortBy.addEventListener("change", () => {
      uiState.sortBy = sortBy.value;
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
        showToast({ type: "info", message: "No hay leads seleccionados" });
        return;
      }

      const shouldDelete = confirm(`¿Eliminar ${ids.length} leads seleccionados? Esta acción no se puede deshacer desde tabla.`);
      if (!shouldDelete) {
        return;
      }

      const batch = deleteLeadsByIds(ids);
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
          showToast({ type: "success", message: "Eliminación masiva deshecha" });
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
      saveLeadFromEditor(formData);
      closeLeadEditor();
      resetToFirstPage();
      renderLeadsTable();
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

bindAdminPanelEvents();

setAdminView(
  localStorage.getItem(ADMIN_SESSION_KEY) === "1" ||
    localStorage.getItem(LEGACY_ADMIN_SESSION_KEY) === "1"
);
