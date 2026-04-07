const LEGAL_THEME_KEY = "theme-preference";

const legalThemeToggle = document.getElementById("legalThemeToggle");

function applyLegalTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("legal-dark-mode", isDark);

  if (legalThemeToggle) {
    legalThemeToggle.textContent = isDark ? "Tema claro" : "Tema oscuro";
    legalThemeToggle.setAttribute("aria-label", isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
  }

  const themeColor = isDark ? "#08140d" : "#eef7ef";
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", themeColor);
  }
}

function initLegalTheme() {
  const savedTheme = localStorage.getItem(LEGAL_THEME_KEY) || "light";
  applyLegalTheme(savedTheme);

  if (legalThemeToggle) {
    legalThemeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("legal-dark-mode") ? "light" : "dark";
      localStorage.setItem(LEGAL_THEME_KEY, nextTheme);
      applyLegalTheme(nextTheme);
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key === LEGAL_THEME_KEY) {
      applyLegalTheme(event.newValue || "light");
    }
  });
}

initLegalTheme();