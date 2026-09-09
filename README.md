# ECO LÓGICA García

Sitio público y panel interno de ECO LÓGICA García, compra de lógica de celular, RAM, laptop
y componentes electrónicos para reciclaje responsable en México.

**Última actualización:** 9 de septiembre de 2026

## Resumen

El sitio es informativo: muestra precios por kilo, tipos de material, cobertura y sucursales,
y toda solicitud se resuelve **por WhatsApp**, directo con la persona encargada de cada plaza.

No hay formularios de registro, no hay cuentas de cliente y no hay base de datos: el sitio
no guarda ningún dato personal de quien lo visita.

Lo único que un administrador puede actualizar desde el panel interno son los **precios** y
la **galería de fotos**, y esos cambios se guardan directamente en este repositorio de GitHub
(no en un servidor ni base de datos propia).

## Qué incluye

- Sitio público de una sola página con navegación por secciones y animaciones de entrada.
- Identidad visual basada en el logo e ícono oficiales (`icons/`).
- Selector de materiales con precios, fotos reales y consideraciones por tipo.
- Botón flotante y enlaces directos a WhatsApp en cada sección de contacto.
- Mapa de cobertura (Leaflet) y tarjetas de sucursales con WhatsApp de cada encargado.
- Tema claro y oscuro con persistencia local (solo la preferencia de tema, ningún dato personal).
- Panel interno (`admin.html`) con:
  - acceso por usuario/contraseña (cortina de acceso, no una base de usuarios);
  - edición de precios por material y por tipo de lógica de celular;
  - gestión de galería por categoría: agregar, editar descripción y quitar fotos;
  - guardado real vía la API de GitHub, usando un token que cada persona conecta en su sesión.
- Páginas legales actualizadas: `aviso-privacidad.html` y `terminos.html`.

## Cómo usarlo

### Sitio público

Al estar publicado en GitHub Pages, basta con abrir la URL del sitio. Para probarlo en local,
sírvelo con un servidor simple (abrirlo con doble clic no permite cargar `data/*.json` en
algunos navegadores por restricciones de `file://`):

```bash
npx serve .
# o
python -m http.server 8080
```

### Panel administrativo

1. Abre `admin.html` (enlace discreto al final del sitio público) e inicia sesión.
2. En la tarjeta "Conexión para guardar cambios", pega un token de acceso de GitHub con permiso
   de escritura sobre este repositorio (instrucciones dentro del panel, botón "¿Cómo consigo un token?").
3. Edita precios o galería y usa "Guardar cambios": se crea un commit en la rama `main` con los
   archivos `data/prices.json` y/o `data/gallery.json` actualizados.
4. GitHub Pages reconstruye el sitio automáticamente en menos de un minuto.

El usuario/contraseña del panel es solo una cortina de acceso en el navegador; la escritura real
en el repositorio siempre requiere un token de GitHub válido con permiso sobre este repositorio,
así que perder o compartir la contraseña del panel no expone el repositorio por sí solo.

## Archivos principales

- `index.html`, `styles.css`, `script.js`: sitio público.
- `admin.html`, `admin.css`, `admin.js`: panel interno.
- `data/prices.json`: precios por material y por tipo de lógica de celular (editable desde el panel).
- `data/gallery.json`: fotos por categoría que alimentan las galerías y carruseles (editable desde el panel).
- `Galeria/`: archivos de imagen reales, organizados por categoría.
- `icons/`: logo e ícono oficiales de la marca, en sus variantes de color.
- `aviso-privacidad.html`, `terminos.html`, `legal.css`, `legal.js`: páginas legales.

## Cómo se guardan los cambios (sin base de datos)

1. El sitio público carga `data/prices.json` y `data/gallery.json` con `fetch` al abrir la página.
2. El panel interno también los carga para prellenar los formularios de edición.
3. Al guardar, el panel usa la API de contenidos de GitHub (`PUT /repos/.../contents/...`) para
   crear un commit con el archivo actualizado, usando el token que la persona administradora
   conectó en su sesión del navegador.
4. GitHub Pages publica el cambio automáticamente al construir la rama `main`.

Esto sustituye a una base de datos tradicional: el propio repositorio es la fuente de verdad,
versionada y con historial de cambios visible en GitHub.

## Importante

- El token de GitHub que se usa para guardar cambios se conserva únicamente en `sessionStorage`
  del navegador (se borra al cerrar la pestaña) y nunca se sube al repositorio.
- Un token con permiso de escritura debe generarse con acceso limitado solo a este repositorio
  (fine-grained personal access token), no un token con acceso a toda la cuenta.
- Quitar una foto en el panel la retira de la galería del sitio, pero no borra el archivo de
  `Galeria/` en el repositorio.

## Publicación

Este repositorio se publica con GitHub Pages desde la rama `main`. Cualquier commit a `main`
(manual o generado desde el panel interno) actualiza el sitio en vivo en un par de minutos.
