import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEV_INDEX_HTML = `<!DOCTYPE html>
<html lang="es-MX" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#030e08" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="apple-mobile-web-app-title" content="EcoLógica IC" />
    <meta name="description" content="Eco Lógica García — Detector Instantáneo de Capacidad de Chips IC (eMMC, eMCP, UFS, NAND) para Compra y Separación de Lógica de Celular." />
    <link rel="manifest" href="./manifest.json" />
    <link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png" />
    <link rel="icon" type="image/svg+xml" href="./icon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet">
    <title>ECO LÓGICA GARCÍA · Detector IC & Capacidad</title>
  </head>
  <body class="bg-[#04120a] text-white antialiased selection:bg-emerald-500 selection:text-black overflow-x-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

// Si se llama con --restore (ej. antes de vite dev), restaura index.html de desarrollo
if (process.argv.includes('--restore')) {
  fs.writeFileSync(path.join(__dirname, 'index.html'), DEV_INDEX_HTML, 'utf8');
  process.exit(0);
}

// 1. Escribir index.html de entrada para Vite
fs.writeFileSync(path.join(__dirname, 'index.html'), DEV_INDEX_HTML, 'utf8');

// 2. Limpiar assets antiguos en la raíz de logica/
const rootAssetsDir = path.join(__dirname, 'assets');
if (fs.existsSync(rootAssetsDir)) {
  fs.rmSync(rootAssetsDir, { recursive: true, force: true });
}

// 3. Ejecutar vite build
console.log('Compilando aplicación Detector IC con Vite...');
execSync('npx vite build', { cwd: __dirname, stdio: 'inherit' });

// 4. Ajustar dist/index.html para que funcione tanto en servidor web (https://) como abriendo el archivo directo en PC (file:///)
const distDir = path.join(__dirname, 'dist');
const distIndexPath = path.join(distDir, 'index.html');
if (fs.existsSync(distIndexPath)) {
  let html = fs.readFileSync(distIndexPath, 'utf8');
  html = html
    .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>')
    .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, '<link rel="stylesheet" href="$1">')
    .replace(/href="\.\/assets\/manifest-[^"]+\.json"/g, 'href="./manifest.json"')
    .replace(/href="\.\/assets\/icon-192-[^"]+\.png"/g, 'href="./icon-192.png"')
    .replace(/href="\.\/assets\/icon-[^"]+\.svg"/g, 'href="./icon.svg"')
    .replace(/href="\.\/assets\/apple-touch-icon-[^"]+\.png"/g, 'href="./apple-touch-icon.png"');
  fs.writeFileSync(distIndexPath, html, 'utf8');
}

// 5. Detectar archivos compilados en dist/assets para precachearlos 100% offline en sw.js
const distAssetsDir = path.join(distDir, 'assets');
const assetFiles = fs.existsSync(distAssetsDir)
  ? fs.readdirSync(distAssetsDir).map((f) => `./assets/${f}`)
  : [];

const swContent = `const CACHE_NAME = 'ecologica-garcia-ic-v7';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
${assetFiles.map((a) => `  '${a}',`).join('\n')}
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
`;

fs.writeFileSync(path.join(distDir, 'sw.js'), swContent, 'utf8');
fs.writeFileSync(path.join(__dirname, 'public', 'sw.js'), swContent, 'utf8');

// 6. Copiar el contenido de dist/ a la raíz de logica/ y limpiar dist/
fs.cpSync(distDir, __dirname, { recursive: true, force: true });
fs.rmSync(distDir, { recursive: true, force: true });
console.log('¡Compilación lista en /logica/ (compatible con file:///, Vercel y GitHub Pages)!');
