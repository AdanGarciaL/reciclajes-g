#!/usr/bin/env node
/* =========================================================
   Genera Galeria/_mini/: una miniatura WebP (640 px de ancho máximo) de
   cada foto de Galeria/, con la misma ruta relativa.

   La rejilla de la galería, las tarjetas de precio y el selector muestran
   las fotos a unos 300-360 px: descargar la original (hasta 1200 px) para
   eso era 3-4 veces más peso del necesario. Las originales se siguen
   usando en el visor a pantalla completa y en el carrusel del detalle.

   Si una foto no tiene miniatura (por ejemplo, recién subida desde el
   panel), el sitio usa la original automáticamente; la GitHub Action de
   .github/workflows/respaldo.yml corre este script en cada cambio de la
   galería. También borra las miniaturas cuya foto original ya no existe.

   Uso (desde la raíz del repositorio):
     npm install --prefix scripts
     node scripts/generar-miniaturas.js
   ========================================================= */
"use strict";
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const raiz = path.resolve(__dirname, "..");
const GALERIA = path.join(raiz, "Galeria");
const MINI = path.join(GALERIA, "_mini");
const ANCHO = 640;

function listar(dir, filtro) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const nombre of fs.readdirSync(dir)) {
    const ruta = path.join(dir, nombre);
    if (fs.statSync(ruta).isDirectory()) { if (ruta !== MINI) out.push(...listar(ruta, filtro)); }
    else if (filtro.test(nombre)) out.push(ruta);
  }
  return out;
}
const aMini = (orig) => path.join(MINI, path.relative(GALERIA, orig)).replace(/\.(png|jpe?g|webp)$/i, ".webp");

(async () => {
  const originales = listar(GALERIA, /\.(png|jpe?g|webp)$/i);
  let nuevas = 0;
  for (const orig of originales) {
    const destino = aMini(orig);
    // Solo si falta: las fotos del panel nunca se sobrescriben con el mismo
    // nombre (llevan fecha en el nombre), y comparar fechas no sirve en una
    // copia recién clonada del repositorio.
    if (fs.existsSync(destino)) continue;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    const mini = await sharp(orig).rotate().resize({ width: ANCHO, withoutEnlargement: true }).webp({ quality: 72, effort: 6 }).toBuffer();
    // Una foto que ya era chica puede salir MÁS pesada al recomprimirse: en
    // ese caso la miniatura es la propia foto (si ya es WebP).
    const original = fs.readFileSync(orig);
    fs.writeFileSync(destino, /\.webp$/i.test(orig) && mini.length >= original.length ? original : mini);
    nuevas++;
  }
  // Miniaturas huérfanas (su foto se quitó desde el panel).
  const esperadas = new Set(originales.map(aMini));
  let borradas = 0;
  for (const mini of listar(MINI, /\.webp$/i)) {
    if (!esperadas.has(mini)) { fs.unlinkSync(mini); borradas++; }
  }
  console.log(`Miniaturas: ${nuevas} nuevas o actualizadas, ${borradas} huérfanas borradas, ${originales.length} fotos en total.`);
})().catch((e) => { console.error(e); process.exit(1); });
