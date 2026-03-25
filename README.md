# Reciclaje LogiKAS

Landing page y panel interno para registro, gestión y seguimiento de leads de compra de material electrónico para reciclaje.

## Contenido del proyecto

- Sitio público con secciones por pestañas (Inicio, Materiales, Cobertura, Cotizar).
- Selector de material con modal y carruseles.
- Formulario de registro con validaciones de cobertura y regla de 10 kg.
- Modo claro/oscuro con persistencia local.
- Panel admin para gestión de leads (filtros, edición, exportación, historial y acciones masivas).
- Páginas legales mínimas:
  - `aviso-privacidad.html`
  - `terminos.html`

## Estructura principal

- `index.html`: sitio público.
- `styles.css`: estilos globales del sitio.
- `script.js`: lógica del sitio (tabs, tema, formulario, mapa, modal, carruseles).
- `admin.html`: panel administrativo.
- `admin.css`: estilos del panel administrativo.
- `admin.js`: lógica del panel administrativo.
- `aviso-privacidad.html`: aviso de privacidad.
- `terminos.html`: términos y condiciones.

## Ejecutar en local

Este proyecto es estático. Puedes abrir `index.html` directamente en navegador:

1. Doble clic en `index.html`, o
2. Desde PowerShell:

```powershell
Start-Process "index.html"
```

Para panel interno:

```powershell
Start-Process "admin.html"
```

## Flujo de leads

1. El usuario llena el formulario en el sitio público.
2. El registro se guarda en `localStorage` del navegador.
3. El panel admin consume esos datos para operar filtros, estatus, historial y exportación.

## Notas importantes

- Al ser una app estática, la persistencia depende del navegador/dispositivo (`localStorage`).
- Las credenciales admin están definidas en frontend; para producción real se recomienda migrar autenticación y datos a backend.
- Para publicar en producción, considerar HTTPS, políticas de datos, y control de accesos robusto.

## Estado actual

- UI refinada (tipografía y microanimaciones coherentes).
- Contraste y legibilidad en tema claro/oscuro corregidos.
- CTA principales y modal de material funcionales.
- Legal mínimo integrado en formulario y footer.
