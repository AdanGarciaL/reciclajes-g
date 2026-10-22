/**
 * TEMPORADA ESPECIAL: DÍA DE MUERTOS Y HALLOWEEN
 * Aplica decoración temática (Papel Picado, Flor de Cempasúchil, Calaveritas y Halloween)
 * en todas las páginas y secciones sin alterar tipografía, logotipo ni colores oficiales.
 * También garantiza el aviso de cookies/almacenamiento local en páginas secundarias.
 */
(function () {
  "use strict";

  const COOKIE_STORAGE_KEY = "eco_cookie_notice_accepted_v1";
  const PETALS_PAUSED_KEY = "eco_temporada_petals_paused_v1";

  const SVG_ICONS = {
    cempasuchil:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.5" fill="#fde047"/><path d="M12 2.5c1.6 2 1.6 4.2 0 5.8-1.6-1.6-1.6-3.8 0-5.8ZM12 15.7c1.6 1.6 1.6 3.8 0 5.8-1.6-2-1.6-4.2 0-5.8ZM2.5 12c2-1.6 4.2-1.6 5.8 0-1.6 1.6-3.8 1.6-5.8 0ZM15.7 12c1.6-1.6 3.8-1.6 5.8 0-2 1.6-4.2 1.6-5.8 0ZM5.3 5.3c2.2-.3 3.8 1.2 3.8 3.5-2.3 0-3.8-1.5-3.8-3.5ZM14.9 15.2c2.2-.3 3.8 1.2 3.8 3.5-2.3 0-3.8-1.5-3.8-3.5ZM18.7 5.3c0 2-1.5 3.5-3.8 3.5 0-2.3 1.6-3.8 3.8-3.5ZM9.1 15.2c0 2-1.5 3.5-3.8 3.5 0-2.3 1.6-3.8 3.8-3.5Z" fill="#f59e0b"/></svg>',
    calaverita:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3a8 8 0 0 0-8 8c0 2.8 1.4 5.2 3.5 6.6V20a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2.4A7.98 7.98 0 0 0 20 11a8 8 0 0 0-8-8Z" fill="#f8fafc" stroke="#f59e0b" stroke-width="1.5"/><circle cx="9" cy="11" r="2" fill="#a855f7"/><circle cx="15" cy="11" r="2" fill="#a855f7"/><path d="M12 13.5 10.8 15.5h2.4L12 13.5ZM9.5 18v2.5M12 18v2.5M14.5 18v2.5" stroke="#0f172a" stroke-width="1.3" stroke-linecap="round"/></svg>',
    calabaza:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c.5-1.2 1.8-1.5 2.5-1" stroke="#10b981" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="12" cy="13" rx="8.5" ry="7" fill="#ea580c" stroke="#fb923c" stroke-width="1.3"/><path d="M9 11.2 7.5 13h3L9 11.2ZM15 11.2 13.5 13h3L15 11.2ZM8.5 15.8c1.2 1.2 2.3 1.5 3.5 1.5s2.3-.3 3.5-1.5" stroke="#fde047" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function initTopGarlandAndPill() {
    if (document.querySelector(".temporada-garland-top")) return;

    const garland = document.createElement("div");
    garland.className = "temporada-garland-top";
    garland.setAttribute("aria-hidden", "true");
    document.body.insertBefore(garland, document.body.firstChild);

    // Añadir distintivo en topbar sin modificar logotipo ni tipografía
    const topbarLeft = document.querySelector(".topbar-left");
    if (topbarLeft && !topbarLeft.querySelector(".temporada-topbar-pill")) {
      const pill = document.createElement("span");
      pill.className = "temporada-topbar-pill";
      pill.innerHTML =
        SVG_ICONS.cempasuchil +
        '<span>Edición Día de Muertos y Halloween</span>' +
        SVG_ICONS.calabaza;
      topbarLeft.appendChild(pill);
    }

    // Cinta temática debajo del header principal o al inicio de main
    const mainEl = document.querySelector("main") || document.querySelector(".admin-shell");
    if (mainEl && !document.querySelector(".temporada-altar-strip")) {
      const strip = document.createElement("aside");
      strip.className = "temporada-altar-strip";
      strip.setAttribute("aria-label", "Temporada de Día de Muertos y Halloween");
      strip.innerHTML =
        '<div class="temporada-altar-strip-left">' +
        '<span class="temporada-altar-icons" aria-hidden="true">' +
        SVG_ICONS.cempasuchil +
        SVG_ICONS.calaverita +
        SVG_ICONS.calabaza +
        "</span>" +
        '<p class="temporada-altar-text">' +
        "<strong>Tradición y Reciclaje Responsable:</strong> Celebramos el mes de Día de Muertos y Halloween manteniendo nuestra operación y atención en horario normal." +
        "</p>" +
        "</div>" +
        '<div class="temporada-altar-tags">' +
        '<span class="temporada-tag temporada-tag--muertos">🏵️ Día de Muertos</span>' +
        '<span class="temporada-tag temporada-tag--halloween">🎃 Halloween</span>' +
        "</div>";

      if (mainEl.firstChild) {
        mainEl.insertBefore(strip, mainEl.firstChild);
      } else {
        mainEl.appendChild(strip);
      }
    }
  }

  function decorateAllSections() {
    const badges = [
      { icon: SVG_ICONS.cempasuchil, label: "Cempasúchil" },
      { icon: SVG_ICONS.calaverita, label: "Tradición MX" },
      { icon: SVG_ICONS.calabaza, label: "Oct · Nov" }
    ];

    const sectionKickers = document.querySelectorAll(
      ".eyebrow, .legal-kicker, .section-kicker, .legal-section > h2, .section-block-head .card-title"
    );

    sectionKickers.forEach(function (el, idx) {
      if (el.querySelector(".temporada-section-badge")) return;
      const item = badges[idx % badges.length];
      const badge = document.createElement("span");
      badge.className = "temporada-section-badge";
      badge.setAttribute("aria-hidden", "true");
      badge.innerHTML = item.icon + "<span>" + item.label + "</span>";
      el.appendChild(badge);
    });
  }

  function initFloatingPetals() {
    if (document.querySelector(".temporada-petals-layer")) return;

    let isPaused = false;
    try {
      isPaused = localStorage.getItem(PETALS_PAUSED_KEY) === "1";
    } catch (_) {}

    if (isPaused) {
      document.body.classList.add("temporada-effects-paused");
    }

    const layer = document.createElement("div");
    layer.className = "temporada-petals-layer";
    layer.setAttribute("aria-hidden", "true");

    const petalCount = 14;
    const types = [
      "temporada-petal--marigold",
      "temporada-petal--amber",
      "temporada-petal--spirit"
    ];

    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement("span");
      const typeClass = types[i % types.length];
      petal.className = "temporada-petal " + typeClass;
      const left = ((i * 7.3 + 4) % 96).toFixed(1);
      const duration = (13 + (i % 5) * 2.6).toFixed(1);
      const delay = (-1 * (i * 1.9)).toFixed(1);
      petal.style.left = left + "%";
      petal.style.animationDuration = duration + "s";
      petal.style.animationDelay = delay + "s";
      layer.appendChild(petal);
    }

    document.body.appendChild(layer);

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "temporada-toggle-btn";
    toggleBtn.setAttribute("aria-pressed", String(!isPaused));
    toggleBtn.title = "Activar o pausar pétalos de cempasúchil de temporada";

    function updateButtonLabel(paused) {
      toggleBtn.setAttribute("aria-pressed", String(!paused));
      toggleBtn.innerHTML =
        SVG_ICONS.cempasuchil +
        "<span>" +
        (paused ? "Temporada (Efecto pausado)" : "Día de Muertos · Halloween") +
        "</span>";
    }

    updateButtonLabel(isPaused);

    toggleBtn.addEventListener("click", function () {
      isPaused = !isPaused;
      document.body.classList.toggle("temporada-effects-paused", isPaused);
      updateButtonLabel(isPaused);
      try {
        localStorage.setItem(PETALS_PAUSED_KEY, isPaused ? "1" : "0");
      } catch (_) {}
    });

    document.body.appendChild(toggleBtn);
  }

  function ensureCookieBannerOnAllPages() {
    // Si la página ya cuenta con #cookieBanner (index.html o nosotros.html), script.js ya lo controla
    if (document.getElementById("cookieBanner")) return;

    let accepted = false;
    try {
      accepted = localStorage.getItem(COOKIE_STORAGE_KEY) === "1";
    } catch (_) {}

    if (accepted) return;

    const banner = document.createElement("aside");
    banner.id = "cookieBanner";
    banner.className = "cookie-banner-fallback";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Aviso de cookies y almacenamiento local");

    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
      '<div class="cookie-banner-copy">' +
      '<p class="cookie-banner-title">Aviso de Cookies y Almacenamiento Local</p>' +
      '<p class="cookie-banner-text">' +
      "Utilizamos almacenamiento local y cookies técnicas únicamente para recordar tus preferencias de navegación y tu lote de memorias en la aplicación web. No usamos cookies de rastreo publicitario. Consulta nuestro " +
      '<a href="aviso-privacidad.html#cookies">Aviso de Privacidad</a>.' +
      "</p>" +
      "</div>" +
      '<div class="cookie-banner-actions">' +
      '<button type="button" id="cookieAcceptBtnFallback" class="cookie-btn-accept">Entendido y aceptar</button>' +
      '<a href="aviso-privacidad.html#cookies" class="cookie-btn-link">Más información</a>' +
      "</div>" +
      "</div>";

    document.body.appendChild(banner);

    const acceptBtn = document.getElementById("cookieAcceptBtnFallback");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        try {
          localStorage.setItem(COOKIE_STORAGE_KEY, "1");
        } catch (_) {}
        banner.setAttribute("hidden", "");
      });
    }
  }

  function initTemporada() {
    initTopGarlandAndPill();
    decorateAllSections();
    initFloatingPetals();
    ensureCookieBannerOnAllPages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTemporada);
  } else {
    initTemporada();
  }
})();
