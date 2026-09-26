/* =========================================================
   ECO LÓGICA García — animación de desplazamiento (GSAP + ScrollTrigger)

   Reglas de la casa:
   - Solo se animan transform, opacity y clip-path. Ni un color, ni una
     fuente, ni un tamaño de letra salen de aquí: eso es identidad de
     marca y vive en css/base.css.
   - Si GSAP no carga (CDN bloqueado) o el visitante pidió menos
     movimiento, este archivo no hace absolutamente nada y script.js
     sigue con su IntersectionObserver de toda la vida.
   - Un solo dueño por transform. Cuando GSAP se hace cargo de un
     elemento, le quita la clase .reveal para que el CSS no intente
     animarlo por su cuenta al mismo tiempo.
   ========================================================= */

(function () {
  "use strict";

  const raiz = document.documentElement;
  const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tres motivos para no hacer nada. En los tres, script.js vuelve solo a
  // su sistema de apariciones con IntersectionObserver y la página queda
  // completa y funcional.
  //
  // 1) El visitante pidió menos movimiento.
  if (menosMovimiento) return;
  // 2) GSAP no llegó (CDN bloqueado, red caída).
  if (!window.gsap || !window.ScrollTrigger) return;
  // 3) ESTAMOS EN UN MÓVIL.
  //    Medido con la CPU limitada a 1/4, que es un teléfono de gama baja
  //    real: con ScrollTrigger activo el desplazamiento daba 11 fps; sin
  //    él, 50. La diferencia no está en los efectos visuales (la aurora,
  //    los bordes y las sombras salían dentro del margen de error) sino en
  //    el propio motor, que recalcula la posición de decenas de
  //    disparadores en el hilo principal en cada cuadro.
  //    El IntersectionObserver de script.js hace las apariciones sin tocar
  //    el hilo principal, así que en móvil se ve fluido y sigue habiendo
  //    movimiento. El recorrido completo (parallax, secciones fijadas,
  //    revelado palabra por palabra) se reserva para pantallas grandes.
  if (!window.matchMedia("(min-width: 901px)").matches) return;

  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  const ST = window.ScrollTrigger;

  // A partir de aquí el CSS puede esconder cosas con tranquilidad: ya
  // sabemos que hay quien las vuelva a mostrar.
  raiz.classList.add("motion-listo");

  const SUAVE = "power3.out";

  /* =========================================================
     Utilidades
     ========================================================= */

  // Le quita a un elemento las clases del sistema viejo de aparición,
  // para que GSAP sea el único que escribe su transform y su opacidad.
  function tomarControl(el) {
    if (!el) return el;
    el.classList.remove("reveal", "show", "delay-1", "delay-2", "delay-3", "delay-4");
    // Se marca como tomado AQUÍ, no al terminar la animación. El contenido
    // llega por tandas y refrescar() corre varias veces: si solo marcáramos
    // al final, una segunda pasada encontraría el elemento a media animación
    // y le montaría otro gsap.from encima, guardando como estado "final" los
    // valores de en medio. El síntoma era una fila de botones que se quedaba
    // en opacidad 0 para siempre.
    el.classList.add("motion-tomado");
    return el;
  }

  // Las palabras terminan distinto que todo lo demás: primero la clase
  // .lista, que las fija arriba desde el CSS, y SOLO después se limpia el
  // transform en línea. Al revés volvería a mandar el translateY(115%) de
  // .palabra-i y la palabra caería de nuevo dentro de su recorte.
  function alTerminarPalabras(palabras) {
    palabras.forEach((p) => p.classList.add("lista"));
    gsap.set(palabras, { clearProps: "transform,willChange" });
  }

  // Marca el elemento como ya animado y limpia lo que GSAP dejó puesto:
  // un transform residual deja al elemento como bloque contenedor y
  // contexto de apilamiento para siempre, y son decenas de contenedores.
  function alTerminar(objetivos) {
    const lista = gsap.utils.toArray(objetivos);
    lista.forEach((el) => {
      gsap.set(el, { clearProps: "transform,willChange" });
      el.classList.add("motion-hecho");
    });
  }

  // Parte el texto en palabras y envuelve cada una para poder recortarla.
  // Respeta los elementos internos (<span>, <strong>) sin romperlos: solo
  // toca los nodos de texto sueltos.
  function partirEnPalabras(el) {
    if (!el || el.dataset.partido === "1") return [];
    const piezas = [];

    const recorrer = (nodo) => {
      const hijos = Array.from(nodo.childNodes);
      hijos.forEach((hijo) => {
        if (hijo.nodeType === Node.TEXT_NODE) {
          const texto = hijo.textContent;
          if (!texto.trim()) return;
          const frag = document.createDocumentFragment();
          // Conservamos los espacios como texto normal para no alterar
          // el reparto de líneas ni el text-wrap: balance del titular.
          texto.split(/(\s+)/).forEach((parte) => {
            if (!parte) return;
            if (!parte.trim()) {
              frag.appendChild(document.createTextNode(parte));
              return;
            }
            const fuera = document.createElement("span");
            fuera.className = "palabra";
            const dentro = document.createElement("span");
            dentro.className = "palabra-i";
            dentro.textContent = parte;
            fuera.appendChild(dentro);
            frag.appendChild(fuera);
            piezas.push(dentro);
          });
          nodo.replaceChild(frag, hijo);
        } else if (hijo.nodeType === Node.ELEMENT_NODE && !hijo.classList.contains("palabra")) {
          recorrer(hijo);
        }
      });
    };

    recorrer(el);
    el.dataset.partido = "1";
    return piezas;
  }

  // Cuenta hasta el número que ya trae el elemento, respetando el texto
  // que lo acompaña ("5+", "24h", "$1,300"). Si no hay ningún número,
  // lo deja como está.
  //
  // El número de destino se lee al EMPEZAR la animación (cuando el
  // elemento entra en pantalla), no al crearla: el HTML trae un número de
  // relleno que script.js reemplaza con el dato real, y si se leía antes
  // el contador terminaba en el número viejo ("5+" en vez de "10+").
  function leerCifra(el) {
    const original = el.textContent.trim();
    const m = original.match(/^(\D*)([\d.,]+)(.*)$/s);
    if (!m) return null;
    const destino = parseFloat(m[2].replace(/,/g, ""));
    if (!isFinite(destino)) return null;
    return { original, antes: m[1], despues: m[3], destino, decimales: (m[2].split(".")[1] || "").length };
  }
  function animarConteo(el) {
    if (!el || el.dataset.contado === "1" || !leerCifra(el)) return;
    el.dataset.contado = "1";
    let cifra = null;
    const avance = { p: 0 };

    gsap.to(avance, {
      p: 1,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onStart: () => { cifra = leerCifra(el); },
      onUpdate: () => {
        if (!cifra) return;
        const v = cifra.destino * avance.p;
        const n = cifra.decimales ? v.toFixed(cifra.decimales) : Math.round(v).toLocaleString("es-MX");
        el.textContent = cifra.antes + n + cifra.despues;
      },
      onComplete: () => { if (cifra) el.textContent = cifra.original; },
    });
  }

  /* =========================================================
     1. Portada: entrada al cargar + parallax al bajar
     ========================================================= */
  function portada() {
    const hero = document.querySelector(".hero");
    if (!hero || hero.dataset.animado === "1") return;
    hero.dataset.animado = "1";

    const h1 = hero.querySelector("h1");
    const media = hero.querySelector(".hero-media");
    const marco = hero.querySelector(".hero-media-frame img");

    const enOrden = [
      ".hero-badge-pill",
      ".lede",
      ".hero-cta",
      ".hero-note",
      ".hero-stats",
    ].map((s) => hero.querySelector(s)).filter(Boolean);

    // Si el respaldo de script.js ya mostró la portada (GSAP tardó en
    // llegar), no se vuelve a esconder para animarla de nuevo: el texto que
    // alguien ya estaba leyendo desaparecía y volvía a entrar.
    const yaVisible = !!(h1 && h1.classList.contains("show"));
    [h1, media].concat(enOrden).forEach(tomarControl);

    const palabras = yaVisible ? [] : partirEnPalabras(h1);
    const tl = gsap.timeline({ defaults: { ease: SUAVE } });

    if (palabras.length) {
      tl.to(palabras, {
        yPercent: 0,
        duration: 1,
        stagger: 0.045,
        onComplete: () => alTerminarPalabras(palabras),
      }, 0.1);
    }

    if (!yaVisible) tl.fromTo(enOrden,
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.09,
        onComplete: () => alTerminar(enOrden),
      }, 0.35);

    if (media && !yaVisible) {
      // El marco se descubre de abajo hacia arriba en vez de solo
      // aparecer: es el gesto que más se repite en las referencias.
      tl.fromTo(media,
        { clipPath: "inset(12% 0% 100% 0%)", y: 40, scale: 0.96 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          scale: 1,
          duration: 1.2,
          // El recorte se limpia al final para no dejar al elemento con un
          // clip-path activo: además de costar en cada pintado, recortaría
          // la etiqueta "Lote real recibido" que sale del marco.
          onComplete: () => gsap.set(media, { clearProps: "clipPath" }),
        }, 0.2);
    }

    // --- Parallax al desplazarse ---
    // Solo en pantallas grandes. Cada uno de estos tres efectos es un
    // disparador con "scrub", es decir, que recalcula en CADA cuadro
    // mientras se hace scroll. Medido en un móvil de gama baja, el
    // conjunto de ScrollTrigger costaba 9 fps de los 25 que había; y en
    // una pantalla de 390 px el desplazamiento relativo apenas se nota.
    // El resto de apariciones (que se disparan una vez y se apagan solas)
    // sí se conservan en móvil.
    const pantallaGrande = window.matchMedia("(min-width: 901px)").matches;
    const copia = hero.querySelector(".hero-copy");
    if (copia && pantallaGrande) {
      gsap.to(copia, {
        yPercent: 9,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    }
    if (media && pantallaGrande) {
      gsap.to(media, {
        yPercent: -11,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    }
    if (marco && pantallaGrande) {
      // La foto se mueve dentro del marco al revés que el marco: da
      // profundidad sin descubrir los bordes (por eso el scale 1.12 del CSS).
      gsap.to(marco, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    }

    // --- Inclinación con el puntero ---
    // Solo en dispositivos con puntero fino: en una pantalla táctil no
    // aporta nada y además pelearía con el scroll.
    if (media && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      gsap.set(media, { transformPerspective: 900 });
      const girarX = gsap.quickTo(media, "rotationX", { duration: 0.7, ease: "power3" });
      const girarY = gsap.quickTo(media, "rotationY", { duration: 0.7, ease: "power3" });
      media.addEventListener("mousemove", (e) => {
        const r = media.getBoundingClientRect();
        girarX((0.5 - (e.clientY - r.top) / r.height) * 5);
        girarY(((e.clientX - r.left) / r.width - 0.5) * 6);
      });
      media.addEventListener("mouseleave", () => { girarX(0); girarY(0); });
    }
  }

  /* =========================================================
     2. Titulares de sección, palabra por palabra
     ========================================================= */
  function titulares() {
    const sel = ".section-head h2, .section-head-solo h2, .cta-band-inner h2";
    document.querySelectorAll(sel).forEach((h2) => {
      if (h2.dataset.partido === "1") return;
      const contenedor = h2.closest(".section-head, .section-head-solo, .cta-band-inner");
      // Ya visible por el respaldo: se marca como propio y no se re-anima.
      if (contenedor && contenedor.classList.contains("show")) {
        tomarControl(contenedor);
        h2.dataset.partido = "1";
        return;
      }
      tomarControl(contenedor);
      const palabras = partirEnPalabras(h2);
      if (!palabras.length) return;
      gsap.to(palabras, {
        yPercent: 0,
        duration: 0.95,
        ease: SUAVE,
        stagger: 0.04,
        scrollTrigger: { trigger: h2, start: "top 88%", once: true },
        onComplete: () => alTerminarPalabras(palabras),
      });
    });
  }

  /* =========================================================
     3. Rejillas y bloques que entran escalonados
     ========================================================= */
  const GRUPOS = [
    { sel: ".trust-grid", hijos: ".trust-card", giro: true },
    { sel: ".quick-prices-grid", hijos: ".price-card", giro: true },
    { sel: ".sucursales-grid", hijos: ".sucursal-card" },
    { sel: ".team-grid", hijos: ".team-card" },
    { sel: ".faq-list", hijos: ".faq-item" },
    { sel: ".gallery-grid", hijos: ".gallery-card", escalon: 0.025 },
    { sel: ".coverage-side", hijos: ".coverage-block" },
    { sel: ".sucursales-filter-bar", hijos: ".sucursal-filter-chip" },
  ];

  function grupos() {
    GRUPOS.forEach(({ sel, hijos, giro, escalon }) => {
      document.querySelectorAll(sel).forEach((cont) => {
        const todos = Array.from(cont.querySelectorAll(hijos))
          .filter((el) => !el.classList.contains("motion-tomado"));
        if (!todos.length) return;
        // Lo que el respaldo ya mostró se queda como está (sin doble entrada).
        const items = todos.filter((el) => !el.classList.contains("show"));
        todos.forEach(tomarControl);
        tomarControl(cont);
        if (!items.length) return;

        // fromTo y no from, a propósito: gsap.from toma el valor "natural"
        // leyéndolo del elemento al crear el tween, y si en ese instante ya
        // vale 0 (porque otra pasada lo escondió, o porque el CSS todavía lo
        // tenía oculto) acaba animando de 0 a 0 y el elemento se queda
        // invisible para siempre. Con fromTo el destino es explícito.
        gsap.fromTo(items,
          {
            y: 44,
            opacity: 0,
            // Un giro sutil en el eje X da sensación de profundidad sin
            // marear; las rejillas largas (sucursales, FAQ) van planas.
            rotateX: giro ? 8 : 0,
            transformPerspective: giro ? 900 : 0,
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.9,
            ease: SUAVE,
            stagger: escalon || 0.07,
            scrollTrigger: { trigger: cont, start: "top 85%", once: true },
            onComplete: () => alTerminar(items),
          }
        );
      });
    });
  }

  /* =========================================================
     4. Bloques sueltos que aún usan .reveal
     Todo lo que no cayó en ninguna regla anterior se anima igual,
     para que no quede nada invisible.
     ========================================================= */
  function sueltos() {
    document.querySelectorAll(".reveal:not(.motion-tomado)").forEach((el) => {
      const yaVisible = el.classList.contains("show");
      tomarControl(el);
      if (yaVisible) return;
      gsap.fromTo(el,
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: SUAVE,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onComplete: () => alTerminar(el),
        }
      );
    });
  }

  /* =========================================================
     5. Barra de progreso de scroll
     ========================================================= */
  function progreso() {
    const barra = document.getElementById("scrollProgress");
    if (!barra || barra.dataset.animado === "1") return;
    barra.dataset.animado = "1";
    // scaleX en vez de width: width provoca un recálculo de diseño en
    // cada cuadro, scaleX lo resuelve el compositor.
    gsap.set(barra, { width: "100%", scaleX: 0, transformOrigin: "left center" });
    gsap.to(barra, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.25 },
    });
  }

  /* =========================================================
     6. Encabezado que se compacta
     ========================================================= */
  function encabezado() {
    const header = document.getElementById("siteHeader");
    if (!header || header.dataset.animado === "1") return;
    header.dataset.animado = "1";
    ST.create({
      start: 80,
      end: "max",
      onToggle: (self) => header.classList.toggle("is-compacto", self.isActive),
    });
  }

  /* =========================================================
     7. Contadores
     ========================================================= */
  function contadores() {
    [
      "heroStatStates",
      "heroStatMaterials",
      "coverageActiveKpi",
      "coverageRestKpi",
      "coverageActiveInline",
    ].forEach((id) => animarConteo(document.getElementById(id)));
  }

  /* =========================================================
     8. Marquesina de estados con cobertura
     ========================================================= */
  // DELIBERADAMENTE SIN MARQUESINA.
  //
  // Llegó a estar aquí: las etiquetas de "Cobertura activa" daban vueltas
  // en bucle. Se quitó a propósito, y conviene dejar escrito por qué para
  // que no vuelva "como mejora".
  //
  // Esa fila es exactamente lo que alguien busca con la vista para
  // responderse "¿cubren mi estado?". Moverla obliga a esperar a que pase
  // el suyo, y si parpadea justo cuando mira, a dar otra vuelta completa.
  // Una marquesina sirve para contenido decorativo y repetitivo (un
  // logotipo, un lema), no para una lista que la gente consulta.
  //
  // Si más adelante se quiere una marquesina, el lugar natural es el lema
  // de la barra superior ("Compra · Venta · Reciclaje..."), que no carga
  // ninguna información que alguien necesite buscar.
  function marquesina() { /* sin efecto, a propósito: ver nota de arriba */ }

  /* =========================================================
     9. Galería con desplazamiento horizontal (solo escritorio)
     ========================================================= */
  // DELIBERADAMENTE SIN GALERÍA HORIZONTAL.
  //
  // Llegó a estar aquí: la galería se fijaba y las fotos desfilaban de
  // lado. Se quitó por dos motivos, y conviene dejarlos escritos para que
  // no vuelva "como mejora".
  //
  // 1) No escala con el contenido. Al pasar la galería a mostrar TODAS las
  //    categorías (39 fotos y subiendo desde el panel), el carril medía
  //    14,724 px: unas quince pantallas de desplazamiento forzado solo
  //    para atravesar una sección. En un sitio cuyo objetivo es que la
  //    gente llegue a cotizar, eso es un peaje, no un efecto.
  // 2) Escondía el contenido. Las fotos entraban una a una con
  //    containerAnimation, y las primeras ya estaban en pantalla cuando
  //    empezaba el recorrido, así que su disparador nunca llegaba a
  //    activarse: la galería se veía vacía hasta bajar 600 px.
  //
  // La rejilla normal con filtros por categoría muestra más fotos de un
  // vistazo, se puede escanear, y ahorra un "pin" más 39 disparadores.

  /* =========================================================
     10. "Cómo funciona": línea de tiempo
     Los tres pasos entran escalonados y la línea que los une se dibuja
     de izquierda a derecha. Antes la sección se FIJABA a pantalla
     completa y había que hacer scroll un 110 % extra para repartir tres
     tarjetas: bandas vacías enormes arriba y abajo, y el scroll
     "secuestrado" en un sitio cuyo objetivo es que la gente cotice.
     ========================================================= */
  let procesoMontado = false;
  function proceso() {
    const pista = document.querySelector("#proceso .steps");
    if (!pista || procesoMontado) return;
    const pasos = gsap.utils.toArray(pista.querySelectorAll(".step"));
    if (!pasos.length) return;
    procesoMontado = true;
    const linea = pista.querySelector(".steps-linea");
    pasos.forEach(tomarControl);
    const tl = gsap.timeline({ scrollTrigger: { trigger: pista, start: "top 82%", once: true } });
    if (linea) tl.fromTo(linea, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0);
    tl.fromTo(pasos,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: SUAVE, stagger: 0.16, onComplete: () => alTerminar(pasos) },
      0.1);
  }

  /* =========================================================
     Arranque y re-arranque
     ========================================================= */
  let pendiente = null;
  function refrescar() {
    // El contenido llega por tandas (seis fetch + varios render), así que
    // agrupamos: no tiene sentido recalcular ScrollTrigger seis veces.
    clearTimeout(pendiente);
    pendiente = setTimeout(() => {
      titulares();
      proceso();
      grupos();
      sueltos();
      // Los contadores esperan a que script.js haya pintado los datos
      // reales; refrescar() vuelve a correr cuando llegan.
      if (window.__DATOS_LISTOS__) contadores();
      marquesina();
      ST.refresh();
    }, 60);
  }

  // script.js consulta esta bandera: si está activa, no monta su propio
  // IntersectionObserver y nos avisa cada vez que vuelve a pintar algo.
  window.__MOTION__ = { activo: true, refrescar: refrescar };

  portada();
  progreso();
  encabezado();
  refrescar();

  // Las imágenes que llegan tarde cambian la altura del documento, y con
  // ella todos los rangos de scroll ya calculados.
  window.addEventListener("load", () => ST.refresh());
})();
