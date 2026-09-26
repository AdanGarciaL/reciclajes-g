/* =========================================================
   ECO LÓGICA García — comportamiento del kit visual

   Le da vida a las piezas de css/kit.css: el cursor que enciende el
   borde de las tarjetas, los botones que se acercan al puntero, el
   recuadro que se desliza por el menú y la aurora del fondo.

   Pensado para cargarse en las CUATRO páginas (portada, panel interno,
   términos y aviso de privacidad): todo lo que hace es opcional y se
   salta solo si el elemento no existe en esa página.

   No depende de GSAP. Si GSAP está disponible lo aprovecha para las
   interpolaciones suaves; si no, usa transiciones de CSS y listo.
   ========================================================= */

(function () {
  "use strict";

  const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const punteroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const G = window.gsap || null;

  /* =========================================================
     1. Cursor que enciende bordes y botones
     Una sola escucha de pointermove en todo el documento, en vez de una
     por tarjeta: con ~40 tarjetas en la página, 40 listeners que además
     piden getBoundingClientRect salen caros.
     ========================================================= */
  function seguirCursor() {
    if (!punteroFino) return;
    const SELECTOR = ".brillo-borde, .btn-kit";
    let pendiente = false;
    let ultimo = null;

    document.addEventListener("pointermove", (e) => {
      ultimo = e;
      if (pendiente) return;
      pendiente = true;
      // Se agrupa en el siguiente cuadro: pointermove dispara muchas
      // más veces de las que el navegador llega a pintar.
      requestAnimationFrame(() => {
        pendiente = false;
        if (!ultimo) return;
        const pieza = ultimo.target.closest && ultimo.target.closest(SELECTOR);
        if (!pieza) return;
        const r = pieza.getBoundingClientRect();
        pieza.style.setProperty("--mx", (ultimo.clientX - r.left) + "px");
        pieza.style.setProperty("--my", (ultimo.clientY - r.top) + "px");
      });
    }, { passive: true });
  }

  /* =========================================================
     2. Botones magnéticos
     El botón se desplaza un poco hacia el cursor cuando está cerca.
     El desplazamiento se limita a unos pocos píxeles: de lo contrario
     el botón "huye" del dedo y se vuelve difícil de atinar.
     ========================================================= */
  function botonesMagneticos() {
    if (!punteroFino || menosMovimiento) return;
    const botones = document.querySelectorAll(".magnetico");
    if (!botones.length) return;

    botones.forEach((btn) => {
      // reenganchar() vuelve a pasar por aquí cuando el panel o la
      // portada pintan tarjetas nuevas; sin esta marca, los botones que
      // ya estaban acabarían con el listener duplicado en cada render.
      if (btn.dataset.magnetico === "1") return;
      btn.dataset.magnetico = "1";

      const FUERZA = 0.28;
      const TOPE = 9;          // px como máximo, en cualquier dirección
      let mover = null, volver = null;

      if (G) {
        const x = G.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
        const y = G.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
        mover = (dx, dy) => { x(dx); y(dy); };
        volver = () => { x(0); y(0); };
      } else {
        mover = (dx, dy) => { btn.style.transform = `translate(${dx}px, ${dy}px)`; };
        volver = () => { btn.style.transform = ""; };
      }

      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * FUERZA;
        const dy = (e.clientY - (r.top + r.height / 2)) * FUERZA;
        mover(Math.max(-TOPE, Math.min(TOPE, dx)), Math.max(-TOPE, Math.min(TOPE, dy)));
      });
      btn.addEventListener("pointerleave", volver);
      // Al enfocar con teclado se vuelve al centro: si el botón queda
      // desplazado, el anillo de foco aparece movido respecto al texto.
      btn.addEventListener("focus", volver);
    });
  }

  /* =========================================================
     3. Recuadro que se desliza por el menú
     ========================================================= */
  function focoDelMenu() {
    const lista = document.getElementById("navLinks");
    if (!lista || !punteroFino) return;
    const enlaces = Array.from(lista.querySelectorAll("a"));
    if (!enlaces.length) return;

    const foco = document.createElement("span");
    foco.className = "nav-foco";
    foco.setAttribute("aria-hidden", "true");
    // El position:relative que necesita el recuadro lo da css/kit.css solo
    // en escritorio. Ponerlo aquí en línea pisaba el position:fixed del
    // menú desplegable en ventanas de 1024 px o menos.
    lista.appendChild(foco);

    const colocar = (a) => {
      const r = a.getBoundingClientRect();
      const base = lista.getBoundingClientRect();
      foco.style.setProperty("--foco-x", (r.left - base.left - 10) + "px");
      foco.style.setProperty("--foco-y", (r.top - base.top - 5) + "px");
      foco.style.setProperty("--foco-w", (r.width + 20) + "px");
      foco.style.setProperty("--foco-h", (r.height + 10) + "px");
      foco.classList.add("visible");
    };

    enlaces.forEach((a) => {
      a.addEventListener("pointerenter", () => colocar(a));
      a.addEventListener("focus", () => colocar(a));
    });
    lista.addEventListener("pointerleave", () => foco.classList.remove("visible"));

    // El menú se vuelve una columna a pantalla completa por debajo de
    // 1024 px; ahí el recuadro no tiene sentido y estorbaría.
    const angosto = window.matchMedia("(max-width: 1024px)");
    const revisar = () => foco.style.setProperty("display", angosto.matches ? "none" : "");
    revisar();
    angosto.addEventListener("change", revisar);
  }

  /* =========================================================
     4. Aurora del fondo
     La capa de degradados se desplaza muy despacio y en bucle. Con GSAP
     se interpola; sin GSAP se queda quieta, que también se ve bien.
     Es transform puro sobre una capa sin desenfoque, así que lo resuelve
     el compositor.
     ========================================================= */
  function auroraViva() {
    if (menosMovimiento || !G) return;
    // Solo en pantallas grandes. En un teléfono el movimiento de un fondo
    // tan tenue no se aprecia y no compensa gastar batería por él.
    if (!window.matchMedia("(min-width: 901px)").matches) return;
    const capas = document.querySelectorAll(".aurora-capa");
    if (!capas.length) return;

    capas.forEach((m, i) => {
      G.to(m, {
        xPercent: i % 2 ? -14 : 16,
        yPercent: i % 2 ? 12 : -10,
        duration: 16 + i * 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });
  }

  /* =========================================================
     5. Arranque
     ========================================================= */
  function iniciar() {
    seguirCursor();
    botonesMagneticos();
    focoDelMenu();
    auroraViva();
  }

  // js/ui.js se carga con defer, así que el DOM ya está listo; la
  // comprobación es por si alguien lo mueve al <head> sin defer.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }

  // El panel interno y la portada pintan tarjetas después de cargar los
  // datos. Los botones magnéticos nuevos necesitan engancharse también.
  window.__KIT__ = {
    reenganchar: function () {
      botonesMagneticos();
    },
  };
})();
