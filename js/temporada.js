/**
 * TEMPORADA ESPECIAL: DÍA DE MUERTOS — TRADICIÓN MEXICANA
 * Aplica decoración temática (Papel Picado artesanal, Flor de Cempasúchil,
 * Calaverita de Azúcar y Veladoras de Ofrenda) en todas las páginas y secciones
 * sin alterar tipografía, logotipo ni colores oficiales.
 */
(function () {
  "use strict";

  const COOKIE_STORAGE_KEY = "eco_cookie_notice_accepted_v1";
  const PETALS_PAUSED_KEY = "eco_temporada_petals_paused_v1";

  const SVG_ICONS = {
    cempasuchil:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9.2" fill="#ea580c" opacity="0.28"/>' +
      '<path d="M12 2c1.9 2.2 1.9 4.6 0 6.4-1.9-1.8-1.9-4.2 0-6.4ZM12 15.6c1.9 1.8 1.9 4.2 0 6.4-1.9-2.2-1.9-4.6 0-6.4ZM2 12c2.2-1.9 4.6-1.9 6.4 0-1.8 1.9-4.2 1.9-6.4 0ZM15.6 12c1.8-1.9 4.2-1.9 6.4 0-2.2 1.9-4.6 1.9-6.4 0ZM4.9 4.9c2.5-.3 4.2 1.3 4.2 3.9-2.6 0-4.2-1.6-4.2-3.9ZM14.9 15.2c2.5-.3 4.2 1.3 4.2 3.9-2.6 0-4.2-1.6-4.2-3.9ZM19.1 4.9c0 2.3-1.6 3.9-4.2 3.9 0-2.6 1.7-4.2 4.2-3.9ZM9.1 15.2c0 2.3-1.6 3.9-4.2 3.9 0-2.6 1.7-4.2 4.2-3.9Z" fill="#f59e0b"/>' +
      '<circle cx="12" cy="12" r="4.8" fill="#fb923c"/>' +
      '<circle cx="12" cy="12" r="2.6" fill="#fde047"/>' +
      "</svg>",
    calaverita:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 2.8a8.2 8.2 0 0 0-8.2 8.2c0 2.9 1.5 5.4 3.7 6.8V20a1.2 1.2 0 0 0 1.2 1.2h6.6a1.2 1.2 0 0 0 1.2-1.2v-2.2a8.18 8.18 0 0 0 3.7-6.8A8.2 8.2 0 0 0 12 2.8Z" fill="#fefce8" stroke="#f59e0b" stroke-width="1.5"/>' +
      '<circle cx="12" cy="6.3" r="1.3" fill="#ec4899"/>' +
      '<circle cx="8.8" cy="11.2" r="2.2" fill="#a855f7"/>' +
      '<circle cx="8.8" cy="11.2" r="0.9" fill="#fde047"/>' +
      '<circle cx="15.2" cy="11.2" r="2.2" fill="#a855f7"/>' +
      '<circle cx="15.2" cy="11.2" r="0.9" fill="#fde047"/>' +
      '<path d="M12 13.4 10.7 15.6h2.6L12 13.4Z" fill="#ec4899"/>' +
      '<path d="M9.5 18.2v2.4M12 18.2v2.4M14.5 18.2v2.4" stroke="#0f172a" stroke-width="1.3" stroke-linecap="round"/>' +
      "</svg>",
    veladora:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="12" cy="7" r="5" fill="#fde047" opacity="0.22"/>' +
      '<path d="M12 2.5C13.8 5 14.5 6.8 14.5 8.3a2.5 2.5 0 1 1-5 0C9.5 6.8 10.2 5 12 2.5Z" fill="#fde047" stroke="#f59e0b" stroke-width="1.2"/>' +
      '<rect x="8" y="11.5" width="8" height="9.5" rx="1.8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.4"/>' +
      '<path d="M8 14.5h8" stroke="#ec4899" stroke-width="1.2"/>' +
      "</svg>"
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
        "<span>Edición Especial · Día de Muertos</span>" +
        SVG_ICONS.calaverita;
      topbarLeft.appendChild(pill);
    }

    // Banda conmemorativa de Ofrenda y Día de Muertos debajo del header principal
    const mainEl = document.querySelector("main") || document.querySelector(".admin-shell");
    if (mainEl && !document.querySelector(".temporada-altar-strip")) {
      const strip = document.createElement("aside");
      strip.className = "temporada-altar-strip";
      strip.setAttribute("aria-label", "Temporada de Día de Muertos");
      strip.innerHTML =
        '<div class="temporada-altar-strip-left">' +
        '<span class="temporada-altar-icons" aria-hidden="true">' +
        SVG_ICONS.cempasuchil +
        SVG_ICONS.calaverita +
        SVG_ICONS.veladora +
        "</span>" +
        '<p class="temporada-altar-text">' +
        "<strong>Día de Muertos · Tradición Mexicana:</strong> Honramos nuestras raíces con flor de cempasúchil y papel picado, manteniendo nuestra operación y atención en horario normal." +
        "</p>" +
        "</div>" +
        '<div class="temporada-altar-tags">' +
        '<span class="temporada-tag temporada-tag--cempasuchil">' +
        SVG_ICONS.cempasuchil +
        "<span>Flor de Cempasúchil</span>" +
        "</span>" +
        '<span class="temporada-tag temporada-tag--tradicion">' +
        SVG_ICONS.calaverita +
        "<span>Tradición Mexicana</span>" +
        "</span>" +
        '<span class="temporada-tag temporada-tag--ofrenda">' +
        SVG_ICONS.veladora +
        "<span>Día de Muertos</span>" +
        "</span>" +
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
      { icon: SVG_ICONS.calaverita, label: "Día de Muertos" },
      { icon: SVG_ICONS.veladora, label: "Tradición MX" }
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

    const petalCount = 16;
    const types = [
      "temporada-petal--marigold",
      "temporada-petal--amber",
      "temporada-petal--rosa",
      "temporada-petal--veladora"
    ];

    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement("span");
      const typeClass = types[i % types.length];
      petal.className = "temporada-petal " + typeClass;
      const left = ((i * 6.4 + 3) % 96).toFixed(1);
      const duration = (13 + (i % 5) * 2.5).toFixed(1);
      const delay = (-1 * (i * 1.7)).toFixed(1);
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
    toggleBtn.title = "Activar o pausar lluvia de pétalos de cempasúchil";

    function updateButtonLabel(paused) {
      toggleBtn.setAttribute("aria-pressed", String(!paused));
      toggleBtn.innerHTML =
        SVG_ICONS.cempasuchil +
        "<span>" +
        (paused ? "Día de Muertos (Pétalos en pausa)" : "Día de Muertos · Cempasúchil") +
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
