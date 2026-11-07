/**
 * TEMPORADA NAVIDEÑA — EDICIÓN EJECUTIVA ECO LÓGICA GARCÍA
 * Decora el sitio público y páginas secundarias con arte vectorial navideño
 * artesanal (guirnalda de pino y luces cálidas, ramas de acebo en esquinas,
 * esferas colgantes de cristal, Estrella de Belén, Flor de Nochebuena,
 * Corona de Adviento, Pino Navideño, Campanas Doradas y nevada suave),
 * sin etiquetas invasivas en títulos y respetando 100% la identidad de marca.
 */
(function () {
  "use strict";

  const COOKIE_STORAGE_KEY = "eco_cookie_notice_accepted_v1";
  const SNOW_PAUSED_KEY = "eco_temporada_navidad_paused_v1";

  const SVG_ART = {
    /* Rama esquinera de pino perenne con hojas de acebo, bayas rojas y destellos */
    pineCornerBough:
      '<svg viewBox="0 0 160 160" fill="none" aria-hidden="true">' +
      /* Ramas principales de pino */
      '<g stroke="#0f5132" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M0 4 Q58 8 132 22"/>' +
      '<path d="M4 0 Q12 56 26 126"/>' +
      '<path d="M2 2 Q46 42 92 86"/>' +
      "</g>" +
      /* Agujas de pino esmeralda y bosque */
      '<g stroke="#15803d" stroke-width="1.5" stroke-linecap="round">' +
      '<path d="M24 6 L42 1 M38 8 L58 3 M56 11 L76 5 M74 14 L94 8 M94 17 L114 11 M110 20 L128 15"/>' +
      '<path d="M22 7 L38 19 M40 9 L56 22 M58 12 L74 25 M76 15 L92 28 M96 18 L110 30"/>' +
      '<path d="M6 24 L1 42 M9 40 L3 58 M12 58 L6 76 M16 76 L9 94 M20 94 L14 112"/>' +
      '<path d="M7 22 L20 38 M10 40 L23 56 M13 58 L26 74 M17 76 L30 92"/>' +
      '<path d="M22 22 L38 28 M34 34 L52 40 M48 48 L66 53 M62 62 L78 67 M22 22 L28 38 M34 34 L40 52 M48 48 L53 66"/>' +
      "</g>" +
      '<g stroke="#22c55e" stroke-width="1.1" stroke-linecap="round" opacity="0.65">' +
      '<path d="M30 8 L46 16 M64 13 L80 21 M98 18 L112 25 M10 32 L21 46 M15 66 L26 80 M38 38 L54 44"/>' +
      "</g>" +
      /* Hojas de Acebo en el vértice */
      '<path d="M10 12 C22 4 34 8 40 18 C32 20 26 26 16 24 C10 20 8 16 10 12 Z" fill="#166534" stroke="#22c55e" stroke-width="1"/>' +
      '<path d="M12 10 C4 22 8 34 18 40 C20 32 26 26 24 16 C20 10 16 8 12 10 Z" fill="#14532d" stroke="#22c55e" stroke-width="1"/>' +
      /* Racimo de bayas carmesí brillantes */
      '<circle cx="19" cy="14" r="4.2" fill="#dc2626"/>' +
      '<circle cx="14" cy="20" r="4.2" fill="#b91c1c"/>' +
      '<circle cx="22" cy="21" r="4" fill="#ef4444"/>' +
      '<circle cx="17.8" cy="12.8" r="1.2" fill="#fecaca"/>' +
      '<circle cx="20.8" cy="19.8" r="1.1" fill="#fecaca"/>' +
      /* Destellos dorados sutiles */
      '<path d="M74 36 L75.5 40.5 L80 42 L75.5 43.5 L74 48 L72.5 43.5 L68 42 L72.5 40.5 Z" fill="#fde047" opacity="0.85"/>' +
      '<circle cx="118" cy="28" r="2" fill="#fbbf24" opacity="0.8"/>' +
      '<circle cx="34" cy="106" r="1.8" fill="#fbbf24" opacity="0.75"/>' +
      "</svg>",

    /* Esfera colgante roja rubí con capuchón de oro y filigrana */
    ornamentRuby:
      '<svg viewBox="0 0 44 146" fill="none" aria-hidden="true">' +
      '<line x1="22" y1="0" x2="22" y2="96" stroke="#fbbf24" stroke-width="1.15" stroke-opacity="0.8"/>' +
      /* Moño dorado superior */
      '<path d="M22 95 C15 89 11 93 16 97 C19 98 21 96 22 95 C23 96 25 98 28 97 C33 93 29 89 22 95 Z" fill="#f59e0b" stroke="#fef08a" stroke-width="0.8"/>' +
      /* Capuchón metálico */
      '<rect x="18" y="96" width="8" height="5" rx="1.4" fill="#fbbf24" stroke="#fef08a" stroke-width="0.8"/>' +
      /* Cuerpo de cristal rubí */
      '<circle cx="22" cy="117" r="16.5" fill="#b91c1c" stroke="#fbbf24" stroke-width="1.3"/>' +
      '<circle cx="20" cy="115" r="13" fill="#dc2626"/>' +
      /* Franja decorativa dorada */
      '<path d="M6 117 Q22 123 38 117" stroke="#fde047" stroke-width="1.4" fill="none" opacity="0.9"/>' +
      '<path d="M7 113 Q22 119 37 113" stroke="#fbbf24" stroke-width="0.8" stroke-dasharray="2 2" fill="none" opacity="0.85"/>' +
      /* Estrella central y reflejo de cristal */
      '<path d="M22 107 L23.4 111 L27.5 112.4 L23.4 113.8 L22 118 L20.6 113.8 L16.5 112.4 L20.6 111 Z" fill="#fef08a"/>' +
      '<path d="M12.5 108 A11 11 0 0 1 18 103.5" stroke="#fecaca" stroke-width="2" stroke-linecap="round" opacity="0.75"/>' +
      "</svg>",

    /* Esfera colgante oro champagne con moño carmesí */
    ornamentGold:
      '<svg viewBox="0 0 44 134" fill="none" aria-hidden="true">' +
      '<line x1="22" y1="0" x2="22" y2="86" stroke="#fbbf24" stroke-width="1.15" stroke-opacity="0.8"/>' +
      /* Moño carmesí superior */
      '<path d="M22 85 C14 79 10 84 16 88 C19 89 21 87 22 85 C23 87 25 89 28 88 C34 84 30 79 22 85 Z" fill="#dc2626" stroke="#fca5a5" stroke-width="0.7"/>' +
      '<rect x="18.5" y="86" width="7" height="4.8" rx="1.3" fill="#fde047" stroke="#d97706" stroke-width="0.8"/>' +
      /* Cuerpo dorado champagne */
      '<circle cx="22" cy="106" r="15.5" fill="#d97706" stroke="#fef08a" stroke-width="1.3"/>' +
      '<circle cx="20.2" cy="104.2" r="12.2" fill="#f59e0b"/>' +
      /* Motivo esmeralda y destello */
      '<path d="M7 106 Q22 111.5 37 106" stroke="#fef9c3" stroke-width="1.3" fill="none"/>' +
      '<circle cx="22" cy="101" r="2.3" fill="#10b981" stroke="#fef9c3" stroke-width="0.8"/>' +
      '<path d="M13 97.5 A10 10 0 0 1 18.5 93.5" stroke="#fef9c3" stroke-width="2" stroke-linecap="round" opacity="0.85"/>' +
      "</svg>",

    /* Estrella de Belén de 8 puntas para emblema central */
    estrellaBelen:
      '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="16" fill="#fbbf24" opacity="0.2"/>' +
      '<path d="M24 3 L27.6 18.2 L41 11 L30.8 22.4 L45 24 L30.8 25.6 L41 37 L27.6 29.8 L24 45 L20.4 29.8 L7 37 L17.2 25.6 L3 24 L17.2 22.4 L7 11 L20.4 18.2 Z" fill="#fbbf24" stroke="#fef9c3" stroke-width="1"/>' +
      '<path d="M24 9 L26.2 20.5 L37 24 L26.2 27.5 L24 39 L21.8 27.5 L11 24 L21.8 20.5 Z" fill="#fef08a"/>' +
      '<circle cx="24" cy="24" r="3.2" fill="#ffffff"/>' +
      "</svg>",

    /* Ramita de acebo con bayas rojas para emblema divisor */
    aceboSprig:
      '<svg viewBox="0 0 36 36" fill="none" aria-hidden="true">' +
      '<path d="M6 24 C8 14 17 9 28 11 C25 19 19 25 8 26 Z" fill="#15803d" stroke="#4ade80" stroke-width="1.1"/>' +
      '<path d="M9 23 Q17 18 25 13" stroke="#86efac" stroke-width="1" stroke-linecap="round" fill="none"/>' +
      '<circle cx="10" cy="23" r="3.4" fill="#ef4444"/>' +
      '<circle cx="15" cy="26" r="3.2" fill="#dc2626"/>' +
      '<circle cx="8" cy="27.5" r="3" fill="#b91c1c"/>' +
      '<circle cx="9.2" cy="22" r="1" fill="#fecaca"/>' +
      "</svg>",

    /* Filigrana sutil de esquina interna para secciones */
    cornerFrostSprig:
      '<svg viewBox="0 0 88 88" fill="none" aria-hidden="true">' +
      '<g stroke="#10b981" stroke-width="1.2" stroke-linecap="round" opacity="0.7">' +
      '<path d="M2 6 Q34 8 72 18"/>' +
      '<path d="M6 2 Q8 34 18 72"/>' +
      '<path d="M18 8 L28 3 M36 11 L46 6 M54 14 L64 10"/>' +
      '<path d="M8 18 L3 28 M11 36 L6 46 M14 54 L10 64"/>' +
      "</g>" +
      '<circle cx="10" cy="10" r="2.6" fill="#dc2626"/>' +
      '<circle cx="15" cy="8" r="2.1" fill="#ef4444"/>' +
      '<circle cx="8" cy="15" r="2.1" fill="#ef4444"/>' +
      '<path d="M36 26 L37.2 29.8 L41 31 L37.2 32.2 L36 36 L34.8 32.2 L31 31 L34.8 29.8 Z" fill="#f59e0b" opacity="0.85"/>' +
      "</svg>",

    /* Figura 1: Flor de Nochebuena Mexicana artesanal */
    nochebuenaMexicana:
      '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      /* Hojas verdes base */
      '<g fill="#14532d" stroke="#22c55e" stroke-width="1">' +
      '<path d="M32 32 C18 14 8 14 10 26 C14 34 22 35 32 32 Z"/>' +
      '<path d="M32 32 C46 14 56 14 54 26 C50 34 42 35 32 32 Z"/>' +
      '<path d="M32 32 C18 50 8 50 10 38 C14 30 22 29 32 32 Z"/>' +
      '<path d="M32 32 C46 50 56 50 54 38 C50 30 42 29 32 32 Z"/>' +
      "</g>" +
      /* Brácteas carmesí exteriores */
      '<g fill="#b91c1c" stroke="#fca5a5" stroke-width="0.75">' +
      '<path d="M32 6 C38 16 38 24 32 32 C26 24 26 16 32 6 Z"/>' +
      '<path d="M32 58 C38 48 38 40 32 32 C26 40 26 48 32 58 Z"/>' +
      '<path d="M6 32 C16 26 24 26 32 32 C24 38 16 38 6 32 Z"/>' +
      '<path d="M58 32 C48 26 40 26 32 32 C40 38 48 38 58 32 Z"/>' +
      "</g>" +
      /* Brácteas rojas aterciopeladas interiores */
      '<g fill="#dc2626" stroke="#fecaca" stroke-width="0.75">' +
      '<path d="M14 14 C24 17 29 23 32 32 C23 29 17 24 14 14 Z"/>' +
      '<path d="M50 14 C47 24 41 29 32 32 C35 23 40 17 50 14 Z"/>' +
      '<path d="M14 50 C17 40 23 35 32 32 C29 41 24 47 14 50 Z"/>' +
      '<path d="M50 50 C40 47 35 41 32 32 C41 35 47 40 50 50 Z"/>' +
      "</g>" +
      /* Centro dorado de la Nochebuena */
      '<circle cx="32" cy="32" r="5.5" fill="#166534"/>' +
      '<circle cx="30" cy="30" r="2.1" fill="#fde047"/>' +
      '<circle cx="34.2" cy="30.2" r="2" fill="#fbbf24"/>' +
      '<circle cx="32" cy="34.2" r="2.1" fill="#fde047"/>' +
      '<circle cx="32" cy="31.8" r="1.4" fill="#fef9c3"/>' +
      "</svg>",

    /* Figura 2: Pino Navideño Esmeralda con Estrella y Esferas */
    pinoNavideno:
      '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      /* Tronco */
      '<rect x="28" y="50" width="8" height="9" rx="2" fill="#78350f" stroke="#b45309" stroke-width="1"/>' +
      /* Capas de follaje ECO LÓGICA */
      '<path d="M32 26 L10 51 H54 Z" fill="#0b3b22" stroke="#22c55e" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M32 17 L14 39 H50 Z" fill="#14532d" stroke="#34d399" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M32 10 L19 27 H45 Z" fill="#15803d" stroke="#6ee7b7" stroke-width="1.2" stroke-linejoin="round"/>' +
      /* Guirnalda dorada */
      '<path d="M22 25 Q32 30 43 24 M17 37 Q32 43 47 36 M13 48 Q32 54 51 47" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
      /* Esferas */
      '<circle cx="25" cy="32" r="2.6" fill="#ef4444"/>' +
      '<circle cx="39" cy="33" r="2.5" fill="#fde047"/>' +
      '<circle cx="21" cy="45" r="2.7" fill="#fde047"/>' +
      '<circle cx="33" cy="43" r="2.8" fill="#dc2626"/>' +
      '<circle cx="43" cy="45" r="2.6" fill="#ef4444"/>' +
      /* Estrella superior */
      '<path d="M32 2 L34.2 7.2 L39.8 7.6 L35.5 11.2 L36.8 16.6 L32 13.6 L27.2 16.6 L28.5 11.2 L24.2 7.6 L29.8 7.2 Z" fill="#fde047" stroke="#f59e0b" stroke-width="0.9"/>' +
      "</svg>",

    /* Figura 3: Corona Navideña de Pino con Moño Carmesí */
    coronaAdviento:
      '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      /* Aro de pino */
      '<circle cx="32" cy="34" r="19" stroke="#0f5132" stroke-width="10"/>' +
      '<circle cx="32" cy="34" r="19" stroke="#16a34a" stroke-width="6" stroke-dasharray="5 4"/>' +
      '<circle cx="32" cy="34" r="19" stroke="#4ade80" stroke-width="2" stroke-dasharray="2 6" opacity="0.7"/>' +
      /* Esferas y bayas en la corona */
      '<circle cx="15" cy="31" r="2.6" fill="#fde047"/>' +
      '<circle cx="49" cy="31" r="2.6" fill="#fde047"/>' +
      '<circle cx="20" cy="47" r="2.8" fill="#ef4444"/>' +
      '<circle cx="44" cy="47" r="2.8" fill="#ef4444"/>' +
      '<circle cx="32" cy="53" r="2.8" fill="#fbbf24"/>' +
      /* Moño carmesí superior */
      '<path d="M27 17 L21 28 L26 26 L29 29 L31 18 Z" fill="#b91c1c"/>' +
      '<path d="M37 17 L43 28 L38 26 L35 29 L33 18 Z" fill="#b91c1c"/>' +
      '<path d="M32 15 C22 7 15 14 23 19 C27 21 30 18 32 15 C34 18 37 21 41 19 C49 14 42 7 32 15 Z" fill="#dc2626" stroke="#fecaca" stroke-width="0.9"/>' +
      '<circle cx="32" cy="15.5" r="3" fill="#fbbf24"/>' +
      "</svg>",

    /* Figura 4: Campanas Doradas de Navidad con Acebo */
    campanasDoradas:
      '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
      /* Campana izquierda */
      '<g transform="rotate(-14 25 36)">' +
      '<path d="M25 20 C18 20 15 26 14 38 L11 43 H39 L36 38 C35 26 32 20 25 20 Z" fill="#f59e0b" stroke="#fef08a" stroke-width="1.2"/>' +
      '<circle cx="25" cy="45" r="3.4" fill="#d97706"/>' +
      "</g>" +
      /* Campana derecha */
      '<g transform="rotate(14 39 36)">' +
      '<path d="M39 20 C32 20 29 26 28 38 L25 43 H53 L50 38 C49 26 46 20 39 20 Z" fill="#fbbf24" stroke="#fef9c3" stroke-width="1.2"/>' +
      '<circle cx="39" cy="45" r="3.4" fill="#d97706"/>' +
      "</g>" +
      /* Hojas de acebo y moño superior */
      '<path d="M32 18 C23 11 16 14 18 21 C23 23 28 21 32 18 Z" fill="#15803d" stroke="#4ade80" stroke-width="0.9"/>' +
      '<path d="M32 18 C41 11 48 14 46 21 C41 23 36 21 32 18 Z" fill="#15803d" stroke="#4ade80" stroke-width="0.9"/>' +
      '<path d="M32 16 C24 9 19 15 25 19 C28 20 30 18 32 16 C34 18 36 20 39 19 C45 15 40 9 32 16 Z" fill="#dc2626" stroke="#fca5a5" stroke-width="0.8"/>' +
      '<circle cx="32" cy="17" r="3" fill="#ef4444" stroke="#fef08a" stroke-width="0.8"/>' +
      "</svg>",

    /* Copo de nieve cristalino de 6 brazos (usa currentColor para modo claro/oscuro) */
    copoCristal:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="12" y1="2" x2="12" y2="22"/>' +
      '<line x1="3.34" y1="7" x2="20.66" y2="17"/>' +
      '<line x1="20.66" y1="7" x2="3.34" y2="17"/>' +
      '<polyline points="9.5 4.5 12 7 14.5 4.5"/>' +
      '<polyline points="9.5 19.5 12 17 14.5 19.5"/>' +
      '<polyline points="4.5 10.2 7.5 9.4 6.7 6.4"/>' +
      '<polyline points="17.3 17.6 16.5 14.6 19.5 13.8"/>' +
      '<polyline points="19.5 10.2 16.5 9.4 17.3 6.4"/>' +
      '<polyline points="6.7 17.6 7.5 14.6 4.5 13.8"/>' +
      "</svg>",

    /* Destello dorado de 4 puntas */
    estrellaDestello:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
      '<path d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z" fill="#fde047"/>' +
      "</svg>",

    /* Icono compacto de pino navideño para el botón flotante */
    pinoMini:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 4 L5 19 H19 Z" fill="#16a34a" stroke="#86efac" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="M12 1.5 L13.1 4.2 L16 4.4 L13.8 6.2 L14.5 9 L12 7.4 L9.5 9 L10.2 6.2 L8 4.4 L10.9 4.2 Z" fill="#fde047"/>' +
      '<circle cx="10" cy="13" r="1.3" fill="#ef4444"/>' +
      '<circle cx="14" cy="15.5" r="1.3" fill="#fde047"/>' +
      "</svg>"
  };

  function isMobileViewport() {
    try {
      return window.innerWidth <= 900 || window.matchMedia("(max-width: 900px)").matches;
    } catch (_) {
      return false;
    }
  }

  function initTopGarlandAndCorners() {
    if (document.querySelector(".temporada-garland-top")) return;

    // 1. Guirnalda superior de pino, esferas y serie de luces cálidas:
    //    Si existe .topbar (verde bosque #0B3B22), se coloca justo debajo para
    //    fundirse sin costura con la barra superior. Si no, al inicio del body.
    const garland = document.createElement("div");
    garland.className = "temporada-garland-top";
    garland.setAttribute("aria-hidden", "true");

    const topbar = document.querySelector(".topbar");
    if (topbar && topbar.parentNode) {
      topbar.insertAdjacentElement("afterend", garland);
    } else {
      document.body.insertBefore(garland, document.body.firstChild);
    }

    // En móviles y tablets no se inyectan ramas fijas ni esferas colgantes
    if (isMobileViewport()) return;

    // 2. Ramas de pino con acebo en esquinas superiores + Esferas colgantes
    const boughLeft = document.createElement("div");
    boughLeft.className = "temporada-corner-bough temporada-corner-bough--left";
    boughLeft.setAttribute("aria-hidden", "true");
    boughLeft.innerHTML = SVG_ART.pineCornerBough;
    document.body.appendChild(boughLeft);

    const boughRight = document.createElement("div");
    boughRight.className = "temporada-corner-bough temporada-corner-bough--right";
    boughRight.setAttribute("aria-hidden", "true");
    boughRight.innerHTML = SVG_ART.pineCornerBough;
    document.body.appendChild(boughRight);

    const ornamentLeft = document.createElement("div");
    ornamentLeft.className = "temporada-hanging-ornament";
    ornamentLeft.setAttribute("aria-hidden", "true");
    ornamentLeft.innerHTML = SVG_ART.ornamentRuby;
    document.body.appendChild(ornamentLeft);

    const ornamentRight = document.createElement("div");
    ornamentRight.className = "temporada-hanging-ornament temporada-hanging-ornament--right";
    ornamentRight.setAttribute("aria-hidden", "true");
    ornamentRight.innerHTML = SVG_ART.ornamentGold;
    document.body.appendChild(ornamentRight);
  }

  function decorateSectionsWithHolidayArt() {
    if (isMobileViewport()) return;

    // Secciones de ancho completo en portada y Quiénes somos
    const mainSections = document.querySelectorAll("main:not(.legal-main) > section");
    const figureSequence = [
      SVG_ART.nochebuenaMexicana,
      SVG_ART.pinoNavideno,
      SVG_ART.coronaAdviento,
      SVG_ART.campanasDoradas
    ];

    mainSections.forEach(function (sec, idx) {
      if (sec.querySelector(".temporada-section-sprig")) return;

      // 1. Emblema central (Estrella de Belén + Hojas de Acebo) sobre el divisor
      if (idx > 0 || !sec.classList.contains("hero")) {
        const emblem = document.createElement("div");
        emblem.className = "temporada-section-emblem";
        emblem.setAttribute("aria-hidden", "true");
        emblem.innerHTML =
          '<span class="emblem-holly">' +
          SVG_ART.aceboSprig +
          "</span>" +
          '<span class="emblem-star">' +
          SVG_ART.estrellaBelen +
          "</span>" +
          '<span class="emblem-holly emblem-holly--mirror">' +
          SVG_ART.aceboSprig +
          "</span>";
        sec.appendChild(emblem);
      }

      // 2. Filigrana sutil de pino y escarcha en esquinas internas
      const sprigLeft = document.createElement("div");
      sprigLeft.className = "temporada-section-sprig temporada-section-sprig--left";
      sprigLeft.setAttribute("aria-hidden", "true");
      sprigLeft.innerHTML = SVG_ART.cornerFrostSprig;
      sec.appendChild(sprigLeft);

      const sprigRight = document.createElement("div");
      sprigRight.className = "temporada-section-sprig temporada-section-sprig--right";
      sprigRight.setAttribute("aria-hidden", "true");
      sprigRight.innerHTML = SVG_ART.cornerFrostSprig;
      sec.appendChild(sprigRight);

      // 3. Ilustración navideña flotante en márgenes amplios
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

    // En páginas legales, detalle esquinero discreto sin estorbar lectura
    const legalSections = document.querySelectorAll(".legal-section");
    legalSections.forEach(function (card) {
      if (card.querySelector(".temporada-section-sprig")) return;
      const sprigRight = document.createElement("div");
      sprigRight.className = "temporada-section-sprig temporada-section-sprig--right";
      sprigRight.setAttribute("aria-hidden", "true");
      sprigRight.innerHTML = SVG_ART.cornerFrostSprig;
      card.appendChild(sprigRight);
    });
  }

  function initGentleSnowfall() {
    if (document.querySelector(".temporada-snow-layer")) return;

    let isPaused = false;
    try {
      isPaused = localStorage.getItem(SNOW_PAUSED_KEY) === "1";
    } catch (_) {}

    if (isPaused) {
      document.body.classList.add("temporada-effects-paused");
    }

    const layer = document.createElement("div");
    layer.className = "temporada-snow-layer";
    layer.setAttribute("aria-hidden", "true");

    const particleCount = 22;
    const types = [
      "temporada-flake--crystal",
      "temporada-flake--soft",
      "temporada-flake--gold",
      "temporada-flake--soft",
      "temporada-flake--star"
    ];

    for (let i = 0; i < particleCount; i++) {
      const flake = document.createElement("span");
      const typeClass = types[i % types.length];
      flake.className = "temporada-flake " + typeClass;
      if (typeClass === "temporada-flake--crystal") {
        flake.innerHTML = SVG_ART.copoCristal;
      } else if (typeClass === "temporada-flake--star") {
        flake.innerHTML = SVG_ART.estrellaDestello;
      }
      const left = ((i * 4.5 + 2.5) % 96).toFixed(1);
      const duration = (15 + (i % 5) * 2.9).toFixed(1);
      const delay = (-1 * (i * 1.4)).toFixed(1);
      flake.style.left = left + "%";
      flake.style.animationDuration = duration + "s";
      flake.style.animationDelay = delay + "s";
      layer.appendChild(flake);
    }

    document.body.appendChild(layer);

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "temporada-toggle-btn";
    toggleBtn.setAttribute("aria-pressed", String(!isPaused));
    toggleBtn.title = "Activar o pausar nieve y animaciones de Navidad";

    function updateButtonLabel(paused) {
      toggleBtn.setAttribute("aria-pressed", String(!paused));
      toggleBtn.innerHTML =
        (paused ? SVG_ART.copoCristal : SVG_ART.pinoMini) +
        "<span>" +
        (paused ? "Nieve en pausa" : "Navidad") +
        "</span>";
    }

    updateButtonLabel(isPaused);

    toggleBtn.addEventListener("click", function () {
      isPaused = !isPaused;
      document.body.classList.toggle("temporada-effects-paused", isPaused);
      updateButtonLabel(isPaused);
      try {
        localStorage.setItem(SNOW_PAUSED_KEY, isPaused ? "1" : "0");
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
    initTopGarlandAndCorners();
    decorateSectionsWithHolidayArt();
    initGentleSnowfall();
    ensureCookieBannerOnAllPages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTemporada);
  } else {
    initTemporada();
  }
})();
