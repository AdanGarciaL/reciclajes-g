# ECO LÓGICA Garcia

Sitio web y panel interno para administrar solicitudes de compra de material electrónico para reciclaje.

**Última actualización:** 7 de abril de 2026

## Resumen

Este proyecto está pensado para que una persona pueda:

- conocer la propuesta de reciclaje;
- seleccionar el tipo de material desde el sitio público;
- registrar un lead con sus datos;
- revisar, filtrar y administrar esos registros desde un panel interno.

La información se guarda en el navegador mediante `localStorage`, por lo que el sistema funciona sin backend.

## Qué incluye

- Sitio público con navegación por secciones.
- Selector visual de materiales con modal.
- Formulario de registro con validaciones básicas.
- Tema claro y oscuro con persistencia local.
- Panel administrativo con:
  - filtros de búsqueda;
  - edición de leads;
  - acciones masivas;
  - historial de cambios;
  - exportación a CSV.
- Páginas legales:
  - `aviso-privacidad.html`
  - `terminos.html`

## Cómo usarlo

### Sitio público

1. Abre `index.html` en el navegador.
2. Recorre las secciones del sitio.
3. Usa el formulario para enviar una solicitud.

### Panel administrativo

1. Abre `admin.html` en el navegador.
2. Inicia sesión con una cuenta de administrador.
3. Usa la tabla de leads para buscar, filtrar, editar o exportar registros.

## Archivos principales

- `index.html`: página principal del sitio.
- `styles.css`: estilos del sitio público.
- `script.js`: lógica del sitio público.
- `admin.html`: panel administrativo.
- `admin.css`: estilos del panel administrativo.
- `admin.js`: lógica del panel administrativo.
- `aviso-privacidad.html`: aviso de privacidad.
- `terminos.html`: términos y condiciones.

## Funcionamiento de los datos

1. El usuario registra sus datos desde el sitio público.
2. La información se guarda en `localStorage`.
3. El panel admin lee esos datos para administrarlos.
4. Los cambios quedan disponibles mientras se conserve el almacenamiento del navegador.

## Importante

- Este proyecto no usa base de datos ni servidor.
- Si se borra el almacenamiento del navegador, los registros locales se pierden.
- Para un entorno productivo real, conviene migrar autenticación y datos a un backend.

## Publicación

Cada actualización que se sube a la rama principal se puede publicar en GitHub Pages si el repositorio está configurado para ello.

## Estado actual

- Interfaz refinada y más legible.
- Tema claro y oscuro sincronizado.
- Panel administrativo dividido por zonas.
- Manejo de errores y validaciones mejorado.
- Acciones masivas integradas junto a la tabla de leads.
