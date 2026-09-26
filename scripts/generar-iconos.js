#!/usr/bin/env node
/* =========================================================
   Genera css/iconos.css y fonts/iconos.woff2 con SOLO los iconos de
   Bootstrap Icons que usa el sitio.

   Antes se descargaba la librería completa desde un CDN: 86 KB de CSS
   (unos 2,000 iconos) + 130 KB de fuente, para usar unos 60. Este script
   busca las clases "bi-…" en los HTML, JS y data/*.json del sitio y
   recorta la fuente a esos iconos (unos pocos KB).

   Cuándo correrlo: si se agrega un icono nuevo en el código o en la lista
   de iconos del panel (MATERIAL_ICON_PRESETS en admin.js). Un icono que no
   esté en el recorte simplemente no se dibuja.

   Uso (desde la raíz del repositorio):
     npm install --prefix scripts
     node scripts/generar-iconos.js
   ========================================================= */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const subsetFont = require("subset-font");

const raiz = path.resolve(__dirname, "..");
const pkg = path.dirname(require.resolve("bootstrap-icons/package.json"));
const mapa = JSON.parse(fs.readFileSync(path.join(pkg, "font/bootstrap-icons.json"), "utf8"));
const fuente = fs.readFileSync(path.join(pkg, "font/fonts/bootstrap-icons.woff2"));
const version = JSON.parse(fs.readFileSync(path.join(pkg, "package.json"), "utf8")).version;

// Archivos del sitio donde pueden aparecer clases de iconos.
const IGNORAR = new Set(["node_modules", ".git", "scripts", "Galeria", "icons", "fonts"]);
const archivos = [];
(function recorrer(dir) {
  for (const nombre of fs.readdirSync(dir)) {
    if (IGNORAR.has(nombre)) continue;
    const ruta = path.join(dir, nombre);
    const st = fs.statSync(ruta);
    if (st.isDirectory()) recorrer(ruta);
    else if (/\.(html|js|json)$/.test(nombre)) archivos.push(ruta);
  }
})(raiz);

const usados = new Set();
for (const archivo of archivos) {
  const texto = fs.readFileSync(archivo, "utf8");
  for (const m of texto.matchAll(/\bbi-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) {
    if (mapa[m[1]] !== undefined) usados.add(m[1]);
  }
}
const nombres = [...usados].sort();
if (!nombres.length) { console.error("No se encontró ningún icono en uso."); process.exit(1); }

(async () => {
  const texto = nombres.map((n) => String.fromCodePoint(mapa[n])).join("");
  const recorte = await subsetFont(fuente, texto, { targetFormat: "woff2" });
  fs.mkdirSync(path.join(raiz, "fonts"), { recursive: true });
  fs.writeFileSync(path.join(raiz, "fonts/iconos.woff2"), recorte);
  // Versión = huella del contenido: si cambian los iconos, cambia la URL y
  // ningún navegador se queda con la fuente vieja en caché.
  const huella = crypto.createHash("sha1").update(recorte).digest("hex").slice(0, 8);

  const reglas = nombres.map((n) => `.bi-${n}::before { content: "\\${mapa[n].toString(16)}"; }`).join("\n");
  const css = `/* =========================================================
   Iconos del sitio — recorte de Bootstrap Icons ${version} (MIT).
   ARCHIVO GENERADO por scripts/generar-iconos.js: no lo edites
   a mano. Incluye solo los ${nombres.length} iconos que usa el sitio.
   ========================================================= */
@font-face {
  font-display: block;
  font-family: "bootstrap-icons";
  src: url("../fonts/iconos.woff2?v=${huella}") format("woff2");
}
.bi::before,
[class^="bi-"]::before,
[class*=" bi-"]::before {
  display: inline-block;
  font-family: bootstrap-icons !important;
  font-style: normal;
  font-weight: normal !important;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  vertical-align: -.125em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
${reglas}
`;
  fs.writeFileSync(path.join(raiz, "css/iconos.css"), css);
  // La precarga de index.html tiene que pedir EXACTAMENTE la misma URL
  // (con su ?v=), o el navegador descargaría la fuente dos veces.
  const index = path.join(raiz, "index.html");
  const html = fs.readFileSync(index, "utf8");
  fs.writeFileSync(index, html.replace(/href="fonts\/iconos\.woff2[^"]*"/, `href="fonts/iconos.woff2?v=${huella}"`));
  console.log(`css/iconos.css y fonts/iconos.woff2: ${nombres.length} iconos, fuente de ${(recorte.length / 1024).toFixed(1)} KB (antes ${(fuente.length / 1024).toFixed(0)} KB + 86 KB de CSS)`);
})().catch((e) => { console.error(e); process.exit(1); });
