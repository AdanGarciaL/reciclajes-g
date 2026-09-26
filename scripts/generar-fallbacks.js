#!/usr/bin/env node
/* =========================================================
   Genera js/fallbacks.js a partir de data/*.json.

   js/fallbacks.js es el respaldo que usa el sitio si falla la descarga
   de data/*.json (red caída, apertura con file://). Es un ESPEJO de los
   datos, así que nunca se edita a mano: se regenera con este script.

   Uso (desde la raíz del repositorio):
     node scripts/generar-fallbacks.js

   Cuándo correrlo: después de cambiar cualquier data/*.json a mano, o
   periódicamente después de guardar cambios desde el panel (el panel
   escribe data/*.json pero no este respaldo).
   ========================================================= */
"use strict";
const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const leer = (rel) => JSON.parse(fs.readFileSync(path.join(raiz, rel), "utf8"));

const precios = leer("data/prices.json");
const galeria = leer("data/gallery.json");
const faq = leer("data/faq.json");
const sucursales = leer("data/branches.json");
const equipo = leer("data/team.json");
const cobertura = leer("data/coverage.json");
const redes = leer("data/social.json");

// Una línea JSON por elemento: el archivo se puede revisar en un diff.
const lista = (arr) => arr.map((x) => "    " + JSON.stringify(x)).join(",\n");
// De la galería basta con la primera foto de cada categoría: el respaldo
// solo tiene que llenar las tarjetas y el carrusel, no la galería entera.
const galeriaCorta = galeria.categories.map((c) => ({ ...c, images: (c.images || []).slice(0, 1) }));

const salida = `/* =========================================================
   ECO LÓGICA García — Fallbacks
   Datos de respaldo por si falla el fetch de data/*.json (ej. file://).

   ARCHIVO GENERADO por scripts/generar-fallbacks.js a partir de
   data/*.json. No lo edites a mano: cambia data/*.json y vuelve a
   correr "node scripts/generar-fallbacks.js". (Se desincronizó una vez
   y llegó a publicar precios hasta 14 veces menores que los reales.)
   ========================================================= */

const FALLBACK_PRICES = {
  materials: [
${lista(precios.materials)}
  ],
  celularTypes: [
${lista(precios.celularTypes)}
  ],
  otherMaterials: [
${lista(precios.otherMaterials)}
  ]
};

const FALLBACK_GALLERY = {
  categories: [
${lista(galeriaCorta)}
  ]
};

// Las preguntas frecuentes viven en data/faq.json.
const FAQ_DATA = [
${lista(faq.items)}
];

const FALLBACK_BRANCHES = {
  branches: [
${lista(sucursales.branches)}
  ]
};

const FALLBACK_TEAM = {
  members: [
${lista(equipo.members)}
  ]
};

const FALLBACK_COVERAGE = ${JSON.stringify({ activeStateIds: cobertura.activeStateIds })};

const FALLBACK_SOCIAL = {
  links: [
${lista(redes.links)}
  ]
};
`;

fs.writeFileSync(path.join(raiz, "js/fallbacks.js"), salida);
console.log("js/fallbacks.js regenerado desde data/*.json");
