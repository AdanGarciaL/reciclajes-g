/* =========================================================
   ECO LÓGICA García — Fallbacks
   Datos de respaldo (por si falla el fetch, ej. file://)
   ========================================================= */

const FALLBACK_PRICES = {
  materials: [
    { id: "celular", name: "Lógica de celular", icon: "bi-phone", modalIcon: "📱", group: "celular", min: 100, max: 1300, unit: "/kg", note: "El Tipo 1 alcanza el precio máximo del catálogo.", quick: true, quickCopy: "Rango completo según tipo, estado y material. El Tipo 1 alcanza el precio máximo.", showInSelector: true, directContact: false },
    { id: "teclado", name: "Celular de teclado", icon: "bi-keyboard", modalIcon: "⌨️", group: "celular", min: 100, max: 150, unit: "/kg", note: "Placas de teléfonos antiguos con teclado mecánico.", quick: false, quickCopy: "", showInSelector: true, directContact: false },
    { id: "tablet", name: "Lógica de tablet", icon: "bi-tablet-landscape", modalIcon: "📲", group: "otros", min: 100, max: 150, unit: "/kg", note: "Placas de iPad, Samsung, Lenovo y similares.", quick: false, quickCopy: "", showInSelector: true, directContact: false },
    { id: "ram", name: "Memorias RAM", icon: "bi-memory", modalIcon: "🖬", group: "otros", min: 300, max: 450, unit: "/kg", note: "DDR a DDR5, cualquier capacidad, funcionales o defectuosas.", quick: true, quickCopy: "Aceptamos módulos de varias generaciones y capacidades.", showInSelector: true, directContact: false },
    { id: "laptop", name: "Lógica de laptop", icon: "bi-laptop", modalIcon: "💻", group: "otros", min: 90, max: 150, unit: "/kg", note: "Motherboards de laptop y netbook, cualquier marca.", quick: true, quickCopy: "Placas de laptop en diferentes condiciones y modelos.", showInSelector: true, directContact: false },
    { id: "sinpila", name: "Sin pila ni tapa", icon: "bi-battery", modalIcon: "🔋", group: "celular", min: 70, max: 100, unit: "/kg", note: "Celulares completos sin desmontar, sin batería.", quick: false, quickCopy: "", showInSelector: false, directContact: false }
  ],
  celularTypes: [
    { id: "tipo1", priceId: "celular", label: "Tipo 1", shortLabel: "Tipo 1 · Premium", min: 900, max: 1300, specs: ["Sin flex ni tiras", "Sin cámaras", "Debe tener su chip", "Celulares de gama media a alta", "Condición variable aceptable mientras el chip esté presente"], galleryCategory: "celular-tipo-1" },
    { id: "tipo2", priceId: "celular", label: "Tipo 2", shortLabel: "Tipo 2 · Placas grandes", min: 220, max: 350, specs: ["Placas grandes que cubren el celular", "Si no entra en Tipo 1 pasa a Tipo 2: sin chip integrado o roto", "Pueden estar quemadas o ensambladas", "Cualquier marca o modelo", "Celulares antiguos o de gama baja"], galleryCategory: "celular-tipo-2" },
    { id: "tipo3", priceId: "celular", label: "Tipo 3", shortLabel: "Tipo 3 · Teclado y tablet", min: 100, max: 150, specs: ["Placas de teléfonos con teclado", "Placas de tablet", "Ambas categorías tienen el mismo precio", "Cualquier marca o modelo", "Condición variable aceptable"], galleryCategory: "celular-tipo-3" },
    { id: "tipo4", priceId: "sinpila", label: "Sin pila/tapa", shortLabel: "Sin pila ni tapa", min: 70, max: 100, specs: ["Celulares completos sin desmontar", "Sin pila: se debe retirar la batería", "Sin tapa: se puede dejar como venga", "Para clientes sin tiempo de desarmado", "Ideal para lotes grandes y descarte"], galleryCategory: "sin-pila-tapa" }
  ],
  otherMaterials: [
    { id: "laptop", priceId: "laptop", eyebrow: "Lógica de laptop", title: "Motherboards y placas de laptop", specs: ["Placas madre de laptops y netbooks", "Cualquier condición, funcionales o dañadas", "Cualquier marca (Dell, HP, Lenovo, etc.)", "Con o sin procesador integrado", "Ideal para reciclaje"], galleryCategory: "laptop" },
    { id: "ram", priceId: "ram", eyebrow: "Memorias RAM", title: "Módulos de memoria RAM DDR / DDR2 / DDR3 / DDR4", specs: ["Memorias RAM de cualquier generación", "DDR, DDR2, DDR3, DDR4, DDR5", "Cualquier capacidad (256 MB a 32 GB+)", "Funcionales o defectuosas aceptadas", "Alto valor por peso, excelente para reciclar"], galleryCategory: "ram" },
    { id: "teclado", priceId: "teclado", eyebrow: "Teléfonos con teclado", title: "Lógicas de teléfonos con teclado mecánico", specs: ["Placas de teléfonos antiguos con teclado", "BlackBerry, HTC y otros modelos", "Cualquier estado, rotos o funcionales", "Demanda consistente en reciclaje"], galleryCategory: "celular-tipo-3" },
    { id: "tablet", priceId: "tablet", eyebrow: "Placas de tablet", title: "Motherboards y lógicas de tablets", specs: ["Placas de tablets iPad, Samsung, Lenovo, etc.", "Cualquier tamaño, de 7\" a 12\"", "Funcionales o para descarte", "Condición variable aceptable mientras el chip esté presente", "Aceptamos grandes volúmenes"], galleryCategory: "celular-tipo-3" }
  ]
};

const FALLBACK_GALLERY = {
  categories: [
    { id: "celular-tipo-1", label: "Celular Tipo 1", images: [{ src: "Galeria/Celular Tipo 1/logica_celular12.jpg", alt: "Lógica de celular Tipo 1" }] },
    { id: "celular-tipo-2", label: "Celular Tipo 2", images: [{ src: "Galeria/Celular Tipo 2/logica_celular2.jpg", alt: "Lógica de celular Tipo 2" }] },
    { id: "celular-tipo-3", label: "Celular y Tablet Tipo 3", images: [{ src: "Galeria/Celular y Tablet Tipo 3/logica_celular31.jpg", alt: "Lógica de celular Tipo 3" }] },
    { id: "sin-pila-tapa", label: "Sin pila y tapa Tipo 4", images: [{ src: "Galeria/Sin Pila y Tapa Tipo 4/sin_pila_y_tapa.jpg", alt: "Celular sin pila ni tapa" }] },
    { id: "laptop", label: "Laptop", images: [{ src: "Galeria/Laptop/Laptop.jpg", alt: "Lógica de laptop" }] },
    { id: "ram", label: "RAM", images: [{ src: "Galeria/RAM/RAM.jpg", alt: "Módulos de memoria RAM" }] },
    { id: "operacion", label: "Galería general", images: [
      { src: "Galeria/logica_celular.jpg", alt: "Lógicas de celular para reciclaje" },
      { src: "Galeria/logica_lapcpu.jpg", alt: "Lógicas de laptop y CPU para reciclaje" },
      { src: "Galeria/logica_ram.jpg", alt: "Módulos RAM y componentes electrónicos" }
    ] }
  ]
};

const FAQ_DATA = [
  { q: "¿Por qué el precio es más bajo que una pieza funcional?", a: "El material se compra para destrucción y desguace, no para reventa como refacción. El valor está en los metales y componentes que se recuperan, por eso el precio va por kilo y no por pieza." },
  { q: "¿El sitio guarda mis datos?", a: "No. Esta página solo informa precios, tipos de material y contactos. No hay formularios ni registros: toda la atención es por WhatsApp o directamente en sucursal." },
  { q: "¿Cómo sé en qué tipo entra mi lógica?", a: "Revisa la sección de tipos: el Tipo 1 requiere chip presente, sin flex, tiras ni cámaras. Si no cumple, baja a Tipo 2. Las placas de teclado y tablet son Tipo 3. Si tienes duda, manda fotos al WhatsApp de tu plaza." },
  { q: "Estoy en un estado sin cobertura activa, ¿me pueden comprar?", a: "Sí. En cualquier estado de la República consideramos la recolección si el lote es de 10 kg o más. En Puebla además hacemos recolección a domicilio sin ese mínimo." },
  { q: "¿El precio que aparece en el sitio es final?", a: "No. Son rangos referenciales. El precio se confirma después de revisar el lote, según el tipo de material, los kilos y el estado físico." },
  { q: "¿Cómo se hace el pago?", a: "Se define antes de cerrar el trato, junto con la forma de entrega o envío. Nunca movemos material sin que las condiciones estén acordadas." }
];

const FALLBACK_BRANCHES = {
  branches: [
    { id: "puebla-domicilio", kind: "directo", estado: "puebla", nombre: "Karla G.", cobertura: "En todo el estado de Puebla", ubicacion: "", local: "", whatsapp: "522227548704", grupoUrl: "", primary: true, activo: true },
    { id: "aguascalientes", kind: "sucursal", estado: "aguascalientes", nombre: "Mari G.", cobertura: "", ubicacion: "Plaza de la Tecnología", local: "Local 83", whatsapp: "522213815164", grupoUrl: "", primary: false, activo: true },
    { id: "coatzacoalcos", kind: "directo", estado: "veracruz", nombre: "Adán G.", cobertura: "Coatzacoalcos y alrededores", ubicacion: "", local: "", whatsapp: "522214102306", grupoUrl: "", primary: false, activo: true },
    { id: "guanajuato", kind: "directo", estado: "guanajuato", nombre: "Luis G.", cobertura: "Guanajuato y alrededores", ubicacion: "", local: "", whatsapp: "522222932290", grupoUrl: "", primary: false, activo: true },
    { id: "acapulco", kind: "sucursal", estado: "guerrero", nombre: "José Santos G.", cobertura: "", ubicacion: "Plaza de la Tecnología", local: "Local 144", whatsapp: "522215855199", grupoUrl: "", primary: false, activo: true },
    { id: "cdmx", kind: "directo", estado: "cdmx", nombre: "José Luis G.", cobertura: "En toda la CDMX y área metropolitana", ubicacion: "", local: "", whatsapp: "522225012131", grupoUrl: "", primary: false, activo: true },
    { id: "mexico", kind: "directo", estado: "mexico", nombre: "Armando", cobertura: "Toluca y municipios del Estado de México", ubicacion: "", local: "", whatsapp: "522221828545", grupoUrl: "", primary: false, activo: true }
  ]
};

const FALLBACK_TEAM = {
  members: [
    { id: "ceo", role: "Director General", name: "", photo: "", whatsapp: "", email: "", social: [] },
    { id: "dev", role: "Desarrollador web", name: "", photo: "", whatsapp: "", email: "", social: [] }
  ]
};

const FALLBACK_COVERAGE = { activeStateIds: ["puebla", "cdmx", "mexico", "veracruz", "hidalgo", "tlaxcala", "aguascalientes", "guanajuato", "tamaulipas", "guerrero"] };

const FALLBACK_SOCIAL = {
  links: [
    { id: "facebook", network: "facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=100063747836703" }
  ]
};
