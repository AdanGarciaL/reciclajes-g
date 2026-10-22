/**
 * TEMPORADA DÍA DE MUERTOS — ARTE VISUAL, CALACAS, TELARAÑAS Y CEMPASÚCHIL
 * Sin etiquetas de texto en los títulos. Decora todas las páginas y secciones
 * con figuras ilustradas SVG (Calacas mexicanas, Telarañas en esquinas con
 * araña colgante, Flores de Cempasúchil, Veladoras animadas, Mariposas Monarca
 * y Papel Picado artesanal), respetando tipografía, logo y colores oficiales.
 */
(function () {
  "use strict";

  const COOKIE_STORAGE_KEY = "eco_cookie_notice_accepted_v1";
  const PETALS_PAUSED_KEY = "eco_temporada_petals_paused_v1";

  const SVG_ART = {
    /* Telaraña de esquina detallada */
    cobwebCorner:
      '<svg viewBox="0 0 160 160" fill="none" aria-hidden="true">' +
      '<g stroke="url(#webGrad)" stroke-width="1.25" stroke-linecap="round">' +
      '<line x1="0" y1="0" x2="155" y2="12"/>' +
      '<line x1="0" y1="0" x2="142" y2="52"/>' +
      '<line x1="0" y1="0" x2="118" y2="95"/>' +
      '<line x1="0" y1="0" x2="86" y2="128"/>' +
      '<line x1="0" y1="0" x2="45" y2="148"/>' +
      '<line x1="0" y1="0" x2="8" y2="156"/>' +
      '<path d="M 32 3 Q 26 12 30 12 Q 22 20 24 22 Q 16 26 18 30 Q 10 32 10 34 Q 4 34 2 35" fill="none"/>' +
      '<path d="M 62 5 Q 52 18 58 21 Q 44 33 48 39 Q 32 46 35 52 Q 19 56 18 60 Q 8 60 4 63" fill="none"/>' +
      '<path d="M 96 8 Q 80 26 90 33 Q 68 50 75 60 Q 50 72 55 82 Q 30 88 28 95 Q 14 95 6 98" fill="none"/>' +
      '<path d="M 132 10 Q 112 34 124 45 Q 94 68 103 82 Q 68 98 75 112 Q 42 120 39 130 Q 20 130 7 135" fill="none"/>' +
      "</g>" +
      '<defs>' +
      '<linearGradient id="webGrad" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0%" stop-color="#fde047" stop-opacity="0.85"/>' +
      '<stop offset="55%" stop-color="#f59e0b" stop-opacity="0.55"/>' +
      '<stop offset="100%" stop-color="#10b981" stop-opacity="0.2"/>' +
      "</linearGradient>" +
      "</defs>" +
      "</svg>",

    /* Araña colgando de su hilo */
    hangingSpider:
      '<svg viewBox="0 0 36 140" fill="none" aria-hidden="true">' +
      '<line x1="18" y1="0" x2="18" y2="108" stroke="#fde047" stroke-width="1" stroke-opacity="0.65" stroke-dasharray="2 2"/>' +
      '<g transform="translate(18, 114)">' +
      '<path d="M-4 -2 C-10 -8 -14 -6 -16 -1 M-5 0 C-12 -3 -15 1 -17 6 M-4 3 C-11 2 -14 6 -15 11 M-3 5 C-8 7 -10 11 -11 15" stroke="#f59e0b" stroke-width="1.3" stroke-linecap="round"/>' +
      '<path d="M4 -2 C10 -8 14 -6 16 -1 M5 0 C12 -3 15 1 17 6 M4 3 C11 2 14 6 15 11 M3 5 C8 7 10 11 11 15" stroke="#f59e0b" stroke-width="1.3" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="3" rx="5.5" ry="6.5" fill="#18181b" stroke="#f59e0b" stroke-width="1.2"/>' +
      '<circle cx="0" cy="-4" r="3.4" fill="#18181b" stroke="#f59e0b" stroke-width="1.1"/>' +
      '<circle cx="-1.3" cy="-4.5" r="0.9" fill="#fde047"/>' +
      '<circle cx="1.3" cy="-4.5" r="0.9" fill="#fde047"/>' +
      '<circle cx="0" cy="3" r="1.8" fill="#ec4899"/>' +
      "</g>" +
      "</svg>",

    /* Flor de Cempasúchil detallada */
    cempasuchil:
      '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="20" fill="#ea580c" opacity="0.22"/>' +
      '<g fill="#f59e0b">' +
      '<ellipse cx="24" cy="8" rx="4.5" ry="7.5"/>' +
      '<ellipse cx="24" cy="40" rx="4.5" ry="7.5"/>' +
      '<ellipse cx="8" cy="24" rx="7.5" ry="4.5"/>' +
      '<ellipse cx="40" cy="24" rx="7.5" ry="4.5"/>' +
      '<ellipse cx="12.7" cy="12.7" rx="5" ry="7" transform="rotate(-45 12.7 12.7)"/>' +
      '<ellipse cx="35.3" cy="35.3" rx="5" ry="7" transform="rotate(-45 35.3 35.3)"/>' +
      '<ellipse cx="35.3" cy="12.7" rx="5" ry="7" transform="rotate(45 35.3 12.7)"/>' +
      '<ellipse cx="12.7" cy="35.3" rx="5" ry="7" transform="rotate(45 12.7 35.3)"/>' +
      "</g>" +
      '<g fill="#fb923c">' +
      '<circle cx="24" cy="14" r="4.2"/>' +
      '<circle cx="24" cy="34" r="4.2"/>' +
      '<circle cx="14" cy="24" r="4.2"/>' +
      '<circle cx="34" cy="24" r="4.2"/>' +
      '<circle cx="17" cy="17" r="4"/>' +
      '<circle cx="31" cy="31" r="4"/>' +
      '<circle cx="31" cy="17" r="4"/>' +
      '<circle cx="17" cy="31" r="4"/>' +
      "</g>" +
      '<circle cx="24" cy="24" r="7.5" fill="#fde047"/>' +
      '<circle cx="24" cy="24" r="4" fill="#f59e0b"/>' +
      "</svg>",

    /* Calaca Mexicana de Azúcar (Figura 1) */
    calacaFestiva:
      '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      /* Corona de Cempasúchil arriba de la calaca */
      '<circle cx="20" cy="12" r="5" fill="#f59e0b"/>' +
      '<circle cx="20" cy="12" r="2.2" fill="#fde047"/>' +
      '<circle cx="32" cy="9" r="6" fill="#ec4899"/>' +
      '<circle cx="32" cy="9" r="2.6" fill="#fde047"/>' +
      '<circle cx="44" cy="12" r="5" fill="#f59e0b"/>' +
      '<circle cx="44" cy="12" r="2.2" fill="#fde047"/>' +
      /* Cráneo */
      '<path d="M32 12C19.8 12 11 21 11 32.2c0 6.8 3.4 12.5 8.5 15.6V54a3 3 0 0 0 3 3h19a3 3 0 0 0 3-3v-6.2c5.1-3.1 8.5-8.8 8.5-15.6C53 21 44.2 12 32 12Z" fill="#fefce8" stroke="#f59e0b" stroke-width="2.2"/>' +
      /* Adornos de frente y pómulos */
      '<path d="M24 19 Q32 24 40 19" stroke="#a855f7" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
      '<circle cx="32" cy="18" r="2.2" fill="#10b981"/>' +
      /* Ojos festivos */
      '<circle cx="23.5" cy="31" r="6" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.8"/>' +
      '<circle cx="23.5" cy="31" r="2.3" fill="#fde047"/>' +
      '<circle cx="40.5" cy="31" r="6" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.8"/>' +
      '<circle cx="40.5" cy="31" r="2.3" fill="#fde047"/>' +
      /* Nariz corazón invertido */
      '<path d="M32 36 L28.5 42.5 H35.5 Z" fill="#1e1b4b"/>' +
      /* Bigote / grecas en mejillas */
      '<path d="M15 39 Q18 43 22 41 M49 39 Q46 43 42 41" stroke="#10b981" stroke-width="1.8" stroke-linecap="round"/>' +
      /* Sonrisa y dientes de calaca */
      '<line x1="22" y1="49" x2="42" y2="49" stroke="#1e1b4b" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="25" y1="46" x2="25" y2="54" stroke="#1e1b4b" stroke-width="1.8" stroke-linecap="round"/>' +
      '<line x1="29.5" y1="46" x2="29.5" y2="55" stroke="#1e1b4b" stroke-width="1.8" stroke-linecap="round"/>' +
      '<line x1="34.5" y1="46" x2="34.5" y2="55" stroke="#1e1b4b" stroke-width="1.8" stroke-linecap="round"/>' +
      '<line x1="39" y1="46" x2="39" y2="54" stroke="#1e1b4b" stroke-width="1.8" stroke-linecap="round"/>' +
      "</svg>",

    /* Calaca con Sombrero / Catrín (Figura 2) */
    calacaCatrin:
      '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      /* Sombrero ancho mexicano festivo */
      '<ellipse cx="32" cy="16" rx="28" ry="6" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2"/>' +
      '<path d="M19 15 L23 5 H41 L45 15 Z" fill="#2e1065" stroke="#ec4899" stroke-width="1.8"/>' +
      '<circle cx="26" cy="11" r="1.6" fill="#fde047"/>' +
      '<circle cx="32" cy="11" r="1.6" fill="#10b981"/>' +
      '<circle cx="38" cy="11" r="1.6" fill="#fde047"/>' +
      /* Cráneo */
      '<path d="M32 16C21 16 13 24 13 34c0 6 3 11.2 7.5 14V54a2.5 2.5 0 0 0 2.5 2.5h18A2.5 2.5 0 0 0 43.5 54v-6c4.5-2.8 7.5-8 7.5-14 0-10-8-18-19-18Z" fill="#fefce8" stroke="#f59e0b" stroke-width="2"/>' +
      '<circle cx="24" cy="33" r="5.2" fill="#091914" stroke="#10b981" stroke-width="1.6"/>' +
      '<circle cx="24" cy="33" r="2" fill="#fde047"/>' +
      '<circle cx="40" cy="33" r="5.2" fill="#091914" stroke="#10b981" stroke-width="1.6"/>' +
      '<circle cx="40" cy="33" r="2" fill="#fde047"/>' +
      '<path d="M32 37.5 L29 43 H35 Z" fill="#ec4899"/>' +
      '<path d="M20 46 Q32 51 44 46" stroke="#091914" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<line x1="26" y1="45" x2="26" y2="53" stroke="#091914" stroke-width="1.7"/>' +
      '<line x1="32" y1="46" x2="32" y2="54" stroke="#091914" stroke-width="1.7"/>' +
      '<line x1="38" y1="45" x2="38" y2="53" stroke="#091914" stroke-width="1.7"/>' +
      "</svg>",

    /* Veladoras de Ofrenda con Flama Viva (Figura 3) */
    veladorasOfrenda:
      '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      '<circle cx="32" cy="18" r="14" fill="#fde047" opacity="0.22"/>' +
      '<g class="temporada-flame">' +
      '<path d="M32 5 C36 11 38 15 38 19 a6 6 0 1 1 -12 0 C26 15 28 11 32 5 Z" fill="#f59e0b"/>' +
      '<path d="M32 9 C34.2 13 35.5 16 35.5 19 a3.5 3.5 0 1 1 -7 0 C28.5 16 29.8 13 32 9 Z" fill="#fef08a"/>' +
      "</g>" +
      '<rect x="21" y="25" width="22" height="30" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>' +
      '<path d="M21 33 H43" stroke="#ec4899" stroke-width="2"/>' +
      '<circle cx="32" cy="43" r="5" fill="#f59e0b"/>' +
      '<circle cx="32" cy="43" r="2.2" fill="#fde047"/>' +
      '<circle cx="17" cy="53" r="5.5" fill="#fb923c"/>' +
      '<circle cx="47" cy="53" r="5.5" fill="#fb923c"/>' +
      "</svg>",

    /* Mariposa Monarca de Día de Muertos (Figura 4) */
    mariposaMonarca:
      '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      '<path d="M30 28 C18 10 4 12 6 27 C7 35 16 38 28 35 Z" fill="#f59e0b" stroke="#18181b" stroke-width="2"/>' +
      '<path d="M34 28 C46 10 60 12 58 27 C57 35 48 38 36 35 Z" fill="#f59e0b" stroke="#18181b" stroke-width="2"/>' +
      '<path d="M29 36 C16 38 10 48 17 54 C23 58 28 50 30 41 Z" fill="#fb923c" stroke="#18181b" stroke-width="2"/>' +
      '<path d="M35 36 C48 38 54 48 47 54 C41 58 36 50 34 41 Z" fill="#fb923c" stroke="#18181b" stroke-width="2"/>' +
      '<circle cx="14" cy="22" r="2" fill="#fef08a"/>' +
      '<circle cx="50" cy="22" r="2" fill="#fef08a"/>' +
      '<circle cx="19" cy="48" r="1.6" fill="#fef08a"/>' +
      '<circle cx="45" cy="48" r="1.6" fill="#fef08a"/>' +
      '<rect x="30.2" y="21" width="3.6" height="24" rx="1.8" fill="#18181b"/>' +
      '<path d="M31 21 Q26 14 23 15 M33 21 Q38 14 41 15" stroke="#fde047" stroke-width="1.5" stroke-linecap="round"/>' +
      "</svg>"
  };

  function isMobileViewport() {
    try {
      return window.innerWidth <= 900 || window.matchMedia("(max-width: 900px)").matches;
    } catch (_) {
      return false;
    }
  }

  function initTopGarlandAndCornerWebs() {
    if (document.querySelector(".temporada-garland-top")) return;

    // 1. Cenefa superior de Papel Picado con Calacas y Cempasúchil
    const garland = document.createElement("div");
    garland.className = "temporada-garland-top";
    garland.setAttribute("aria-hidden", "true");
    document.body.insertBefore(garland, document.body.firstChild);

    // En móviles y tablets, no inyectar telarañas ni arañas colgantes para no estorbar el menú ni el logotipo
    if (isMobileViewport()) return;

    // 2. Telarañas en las esquinas superiores de la pantalla + Arañas colgantes (solo en pantallas amplias de escritorio)
    const webLeft = document.createElement("div");
    webLeft.className = "temporada-corner-web temporada-corner-web--left";
    webLeft.setAttribute("aria-hidden", "true");
    webLeft.innerHTML = SVG_ART.cobwebCorner;
    document.body.appendChild(webLeft);

    const webRight = document.createElement("div");
    webRight.className = "temporada-corner-web temporada-corner-web--right";
    webRight.setAttribute("aria-hidden", "true");
    webRight.innerHTML = SVG_ART.cobwebCorner;
    document.body.appendChild(webRight);

    const spiderLeft = document.createElement("div");
    spiderLeft.className = "temporada-hanging-spider";
    spiderLeft.setAttribute("aria-hidden", "true");
    spiderLeft.innerHTML = SVG_ART.hangingSpider;
    document.body.appendChild(spiderLeft);

    const spiderRight = document.createElement("div");
    spiderRight.className = "temporada-hanging-spider temporada-hanging-spider--right";
    spiderRight.setAttribute("aria-hidden", "true");
    spiderRight.innerHTML = SVG_ART.hangingSpider;
    document.body.appendChild(spiderRight);
  }

  function decorateSectionsWithFiguresAndWebs() {
    // En móviles se omite la inyección de figuras sobre las secciones para que todo luzca ordenado, limpio y sin tapar textos
    if (isMobileViewport()) return;

    const sections = document.querySelectorAll(
      "main > section, .legal-section, .section-block"
    );

    const figureSequence = [
      SVG_ART.calacaFestiva,
      SVG_ART.calacaCatrin,
      SVG_ART.veladorasOfrenda,
      SVG_ART.mariposaMonarca
    ];

    sections.forEach(function (sec, idx) {
      if (sec.querySelector(".temporada-section-emblem")) return;

      // 1. Emblema central (Calaca + 2 Flores de Cempasúchil girando) sobre la línea divisoria
      if (idx > 0 || !sec.classList.contains("hero")) {
        const emblem = document.createElement("div");
        emblem.className = "temporada-section-emblem";
        emblem.setAttribute("aria-hidden", "true");
        emblem.innerHTML =
          '<span class="emblem-flower">' +
          SVG_ART.cempasuchil +
          "</span>" +
          '<span class="emblem-skull">' +
          SVG_ART.calacaFestiva +
          "</span>" +
          '<span class="emblem-flower">' +
          SVG_ART.cempasuchil +
          "</span>";
        sec.appendChild(emblem);
      }

      // 2. Telarañas sutiles en las esquinas de la sección
      const secWebLeft = document.createElement("div");
      secWebLeft.className = "temporada-section-web temporada-section-web--left";
      secWebLeft.setAttribute("aria-hidden", "true");
      secWebLeft.innerHTML = SVG_ART.cobwebCorner;
      sec.appendChild(secWebLeft);

      const secWebRight = document.createElement("div");
      secWebRight.className = "temporada-section-web temporada-section-web--right";
      secWebRight.setAttribute("aria-hidden", "true");
      secWebRight.innerHTML = SVG_ART.cobwebCorner;
      sec.appendChild(secWebRight);

      // 3. Figura animada de Día de Muertos (Calaca, Catrín, Veladora o Mariposa Monarca)
      const figRight = document.createElement("div");
      figRight.className = "temporada-section-figure temporada-section-figure--right";
      figRight.setAttribute("aria-hidden", "true");
      figRight.innerHTML = figureSequence[idx % figureSequence.length];
      sec.appendChild(figRight);

      if (idx % 2 === 0) {
        const figLeft = document.createElement("div");
        figLeft.className = "temporada-section-figure temporada-section-figure--left";
        figLeft.setAttribute("aria-hidden", "true");
        figLeft.innerHTML = figureSequence[(idx + 2) % figureSequence.length];
        sec.appendChild(figLeft);
      }
    });
  }

  function initFloatingPetalsAndSkulls() {
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

    const particleCount = 18;
    const types = [
      "temporada-petal--marigold",
      "temporada-petal--amber",
      "temporada-petal--rosa",
      "temporada-petal--veladora",
      "temporada-petal--calaca-mini"
    ];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("span");
      const typeClass = types[i % types.length];
      particle.className = "temporada-petal " + typeClass;
      if (typeClass === "temporada-petal--calaca-mini") {
        particle.innerHTML = SVG_ART.calacaFestiva;
      }
      const left = ((i * 5.7 + 4) % 95).toFixed(1);
      const duration = (14 + (i % 5) * 2.8).toFixed(1);
      const delay = (-1 * (i * 1.6)).toFixed(1);
      particle.style.left = left + "%";
      particle.style.animationDuration = duration + "s";
      particle.style.animationDelay = delay + "s";
      layer.appendChild(particle);
    }

    document.body.appendChild(layer);

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "temporada-toggle-btn";
    toggleBtn.setAttribute("aria-pressed", String(!isPaused));
    toggleBtn.title = "Activar o pausar animaciones de Día de Muertos";

    function updateButtonLabel(paused) {
      toggleBtn.setAttribute("aria-pressed", String(!paused));
      toggleBtn.innerHTML =
        SVG_ART.calacaFestiva +
        "<span>" +
        (paused ? "Animación en pausa" : "Día de Muertos") +
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
    initTopGarlandAndCornerWebs();
    decorateSectionsWithFiguresAndWebs();
    initFloatingPetalsAndSkulls();
    ensureCookieBannerOnAllPages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTemporada);
  } else {
    initTemporada();
  }
})();
