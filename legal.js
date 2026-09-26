/* Tema de las páginas legales. Comparte la preferencia con el sitio
   principal ("theme-preference"). Sin preferencia guardada sigue al
   sistema operativo, igual que la portada; y solo se guarda cuando la
   persona elige con el botón. Todo acceso a localStorage va en try/catch:
   en modo privado o con el almacenamiento bloqueado lanza una excepción y
   antes dejaba el botón de tema sin funcionar. */
const LEGAL_THEME_KEY = "theme-preference";
const legalThemeToggle = document.getElementById("legalThemeToggle");
const legalPrefersDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function readLegalTheme() {
  try { return localStorage.getItem(LEGAL_THEME_KEY); } catch (_e) { return null; }
}
function saveLegalTheme(theme) {
  try { localStorage.setItem(LEGAL_THEME_KEY, theme); } catch (_e) { /* sin almacenamiento: solo esta visita */ }
}
function systemTheme() {
  return legalPrefersDark && legalPrefersDark.matches ? "dark" : "light";
}

function applyLegalTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("legal-dark-mode", isDark);

  if (legalThemeToggle) {
    legalThemeToggle.textContent = isDark ? "Tema claro" : "Tema oscuro";
    legalThemeToggle.setAttribute("aria-label", isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
  }

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) metaThemeColor.setAttribute("content", isDark ? "#0B1F13" : "#0B3B22");
}

function initLegalTheme() {
  applyLegalTheme(readLegalTheme() || systemTheme());

  if (legalThemeToggle) {
    legalThemeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("legal-dark-mode") ? "light" : "dark";
      saveLegalTheme(nextTheme);
      applyLegalTheme(nextTheme);
    });
  }

  if (legalPrefersDark) {
    const onChange = () => { if (!readLegalTheme()) applyLegalTheme(systemTheme()); };
    if (legalPrefersDark.addEventListener) legalPrefersDark.addEventListener("change", onChange);
    else if (legalPrefersDark.addListener) legalPrefersDark.addListener(onChange);
  }

  // Si se cambia el tema en otra pestaña del sitio, esta lo sigue.
  window.addEventListener("storage", (event) => {
    if (event.key === LEGAL_THEME_KEY) applyLegalTheme(event.newValue || systemTheme());
  });
}

initLegalTheme();
