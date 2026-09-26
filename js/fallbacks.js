/* =========================================================
   ECO LÓGICA García — Fallbacks
   Datos de respaldo por si falla el fetch de data/*.json (ej. file://).

   ARCHIVO GENERADO por scripts/generar-fallbacks.js a partir de
   data/*.json. No lo edites a mano: cambia data/*.json y vuelve a
   correr "node scripts/generar-fallbacks.js". (Se desincronizó una vez
   y llegó a publicar precios hasta 14 veces menores que los reales.)
   ========================================================= */

const FALLBACK_PRICES = {
  materials: [
    {"id":"celular","name":"Lógica de celular","icon":"bi-phone","modalIcon":"📱","group":"celular","min":250,"max":10000,"unit":"/kg","note":"Desde el más barato hasta el Tipo 1, que alcanza el precio máximo del catálogo.","quick":true,"quickCopy":"Rango completo según tipo, estado y material. El Tipo 1 alcanza el precio máximo.","showInSelector":true,"directContact":false},
    {"id":"teclado","name":"Celular de teclado","icon":"bi-keyboard","modalIcon":"⌨️","group":"celular","min":250,"max":400,"unit":"/kg","note":"Placas de teléfonos antiguos con teclado mecánico o placa grande.","quick":false,"quickCopy":"","showInSelector":true,"directContact":false},
    {"id":"tablet","name":"Lógica de tablet","icon":"bi-tablet-landscape","modalIcon":"📲","group":"otros","min":100,"max":150,"unit":"/kg","note":"Placas de iPad, Samsung, Lenovo y similares.","quick":false,"quickCopy":"","showInSelector":true,"directContact":false},
    {"id":"ram","name":"Memorias RAM","icon":"bi-memory","modalIcon":"🖬","group":"otros","min":300,"max":1000,"unit":"/kg","note":"DDR a DDR5, cualquier capacidad, funcionales o defectuosas.","quick":true,"quickCopy":"Aceptamos módulos de varias generaciones y capacidades.","showInSelector":true,"directContact":false},
    {"id":"laptop","name":"Lógica de laptop","icon":"bi-laptop","modalIcon":"💻","group":"otros","min":90,"max":150,"unit":"/kg","note":"Motherboards de laptop y netbook, cualquier marca.","quick":true,"quickCopy":"Placas de laptop en diferentes condiciones y modelos.","showInSelector":true,"directContact":false},
    {"id":"sinpila","name":"Sin pila ni tapa","icon":"bi-battery","modalIcon":"🔋","group":"celular","min":250,"max":400,"unit":"/kg","note":"Celulares completos sin desmontar, sin batería.","quick":false,"quickCopy":"","showInSelector":false,"directContact":false}
  ],
  celularTypes: [
    {"id":"tipo1","priceId":"celular","label":"Tipo 1 (Primera)","shortLabel":"Tipo 1 (Primera)","min":5000,"max":10000,"specs":["Sin flex ni tiras","Sin cámaras","Debe tener su chip","Celulares de gama media a alta","Condición variable aceptable mientras el chip esté presente","256 GB en adelante"],"galleryCategory":"celular-tipo-1"},
    {"id":"tipo2","priceId":"celular","label":"Tipo 2 (Segunda)","shortLabel":"Tipo 2 (Segunda)","min":2000,"max":5000,"specs":["Sin flex ni tiras","Si no entra en Tipo 1 pasa a Tipo 2","Condición variable aceptable mientras el chip esté presente","Cualquier marca o modelo","64 GB en adelante"],"galleryCategory":"celular-tipo-2"},
    {"id":"tipo3","priceId":"celular","label":"Tipo 3 (Tercera)","shortLabel":"Tipo 3 (Tercera)","min":1000,"max":1800,"specs":["Placas tipo L","Si no entra en Tipo 1 ni en Tipo 2, pasa a Tipo 3","Condición variable aceptable mientras el chip esté presente","Cualquier marca o modelo","32 GB en adelante"],"galleryCategory":"celular-tipo-3"},
    {"id":"tipo4","priceId":"sinpila","label":"Sin pila/tapa","shortLabel":"Sin pila/tapa","min":250,"max":400,"specs":["Celulares completos sin desmontar","Sin pila: se debe retirar la batería","Sin tapa: se puede dejar como venga","Para clientes sin tiempo de desarmado","Ideal para lotes grandes y descarte","Celular de teclas o touch pero que tenga 1 cámara $250 el kilo","Celular de teclas o touch pero que tenga 2, 3 y 4 cámaras $400 el kilo"],"galleryCategory":"sin-pila-tapa"},
    {"id":"tipo-1789065008140","priceId":"celular","label":"Teclas o Grande","shortLabel":"Teclas o Grande","min":250,"max":500,"specs":["Placas con teclado o que sean completas","Celulares de gama baja","Condición variable aceptable mientras el chip esté presente","Cualquier marca o modelo","8 GB en adelante","Si no entra en Tipo 1, 2 ni 3, pasa a Teclas o Grande"],"galleryCategory":"teclas-o-grande"}
  ],
  otherMaterials: [
    {"id":"laptop","priceId":"laptop","eyebrow":"Lógica de laptop","title":"Motherboards y placas de laptop","specs":["Placas madre de laptops y netbooks","Cualquier condición, funcionales o dañadas","Cualquier marca (Dell, HP, Lenovo, etc.)","Con o sin procesador integrado","Ideal para reciclaje"],"galleryCategory":"laptop"},
    {"id":"ram","priceId":"ram","eyebrow":"Memorias RAM","title":"Módulos de memoria RAM, de DDR a DDR5","specs":["Memorias RAM de cualquier generación","DDR, DDR2, DDR3, DDR4, DDR5","Cualquier capacidad (256 MB a 32 GB+)","Funcionales o defectuosas aceptadas","Alto valor por peso, excelente para reciclar"],"galleryCategory":"ram"},
    {"id":"teclado","priceId":"teclado","eyebrow":"Teléfonos con teclado","title":"Lógicas de teléfonos con teclado mecánico","specs":["Placas de teléfonos antiguos con teclado","BlackBerry, HTC y otros modelos","Cualquier estado, rotos o funcionales","Demanda consistente en reciclaje"],"galleryCategory":"teclas-o-grande"},
    {"id":"tablet","priceId":"tablet","eyebrow":"Placas de tablet","title":"Motherboards y lógicas de tablets","specs":["Placas de tablets iPad, Samsung, Lenovo, etc.","Cualquier tamaño, de 7\" a 12\"","Funcionales o para descarte","Condición variable aceptable mientras el chip esté presente","Aceptamos grandes volúmenes"],"galleryCategory":""}
  ]
};

const FALLBACK_GALLERY = {
  categories: [
    {"id":"celular-tipo-1","label":"Celular Tipo 1 (Primera)","folder":"Galeria/Celular Tipo 1","images":[{"src":"Galeria/Celular Tipo 1/logica_celular12.webp","alt":"Lógica de celular Tipo 1"}]},
    {"id":"celular-tipo-2","label":"Celular Tipo 2 (Segunda)","folder":"Galeria/Celular Tipo 2","images":[{"src":"Galeria/Celular Tipo 2/4-1789078963111-acef.webp","alt":"Celular Tipo 2 (Segunda)"}]},
    {"id":"celular-tipo-3","label":"Celular Tipo 3 (Tercera)","folder":"Galeria/Celular y Tablet Tipo 3","images":[{"src":"Galeria/Celular y Tablet Tipo 3/3-1789094982893-f657.webp","alt":"Celular Tipo 3 (Tercera)"}]},
    {"id":"sin-pila-tapa","label":"Sin pila ni tapa","folder":"Galeria/Sin Pila y Tapa Tipo 4","images":[{"src":"Galeria/Sin Pila y Tapa Tipo 4/sin_pila_y_tapa.webp","alt":"Celular sin pila ni tapa"}]},
    {"id":"laptop","label":"Laptop","folder":"Galeria/Laptop","images":[{"src":"Galeria/Laptop/Laptop.webp","alt":"Lógica de laptop"}]},
    {"id":"ram","label":"RAM","folder":"Galeria/RAM","images":[{"src":"Galeria/RAM/RAM.webp","alt":"Módulos de memoria RAM"}]},
    {"id":"operacion","label":"Galería general","folder":"Galeria","images":[{"src":"Galeria/logica_celular.webp","alt":"Lógicas de celular para reciclaje"}]},
    {"id":"teclas-o-grande","label":"Teclas o Grande","folder":"Galeria/teclas-o-grande","images":[{"src":"Galeria/teclas-o-grande/6-1789096119666-6c5e.webp","alt":"Teclas o Grande"}]}
  ]
};

// Las preguntas frecuentes viven en data/faq.json.
const FAQ_DATA = [
    {"q":"¿Por qué el precio es más bajo que una pieza funcional?","a":"El material se compra para destrucción y desguace, no para reventa como refacción. El valor está en los metales y componentes que se recuperan, por eso el precio va por kilo y no por pieza."},
    {"q":"¿El sitio guarda mis datos?","a":"No. Esta página solo informa precios, tipos de material y contactos. No hay formularios ni registros: toda la atención es por WhatsApp o directamente en sucursal."},
    {"q":"¿Cómo sé en qué tipo entra mi lógica?","a":"Revisa la sección de tipos: el Tipo 1 requiere chip presente, sin flex, tiras ni cámaras. Si no cumple, pasa a Tipo 2, y si tampoco, a Tipo 3 (placas tipo L). Las placas de teléfonos de teclas o de placa completa van en «Teclas o Grande», y las de tablet tienen su propio precio en la lista. Si tienes duda, manda fotos al WhatsApp de tu plaza."},
    {"q":"Estoy en un estado sin cobertura activa, ¿me pueden comprar?","a":"Sí. En cualquier estado de la República consideramos la recolección si el lote es de 10 kg o más. En Puebla además hacemos recolección a domicilio sin ese mínimo."},
    {"q":"¿El precio que aparece en el sitio es final?","a":"No. Son rangos referenciales. El precio se confirma después de revisar el lote, según el tipo de material, los kilos y el estado físico."},
    {"q":"¿Cómo se hace el pago?","a":"Pagamos al momento de recibir tu material, en efectivo o por transferencia SPEI. La forma de entrega o envío se acuerda antes de cerrar el trato: nunca movemos material sin que las condiciones estén acordadas."}
];

const FALLBACK_BRANCHES = {
  branches: [
    {"id":"puebla-domicilio","kind":"directo","estado":"puebla","nombre":"Karla G.","cobertura":"En todo el estado de Puebla","ubicacion":"","local":"","whatsapp":"522227548704","grupoUrl":"https://chat.whatsapp.com/Bd9NvuDYmgM709AcZs6pRH","primary":true,"activo":true},
    {"id":"aguascalientes","kind":"sucursal","estado":"aguascalientes","nombre":"Mari G.","cobertura":"","ubicacion":"Plaza de la Tecnología, Aguascalientes","local":"Local 83","whatsapp":"522213815164","grupoUrl":"https://chat.whatsapp.com/HNpmj48nMbkLnoQzo0cWMQ","primary":false,"activo":true},
    {"id":"coatzacoalcos","kind":"directo","estado":"veracruz","nombre":"Adán G.","cobertura":"Coatzacoalcos y alrededores","ubicacion":"","local":"","whatsapp":"522214102306","grupoUrl":"https://chat.whatsapp.com/FYfvNUEP2BeFaWtFCkJfun","primary":false,"activo":true},
    {"id":"guanajuato","kind":"directo","estado":"guanajuato","nombre":"Luis G.","cobertura":"Guanajuato y alrededores","ubicacion":"","local":"","whatsapp":"522222932290","grupoUrl":"https://chat.whatsapp.com/BfaYmaMSoqlHNBgINDIUL9","primary":false,"activo":true},
    {"id":"acapulco","kind":"sucursal","estado":"guerrero","nombre":"José Santos G.","cobertura":"","ubicacion":"Plaza de la Tecnología, Acapulco","local":"Local 144","whatsapp":"522215855199","grupoUrl":"https://chat.whatsapp.com/IwcerzNiBqyL0Zc21Xukw4","primary":false,"activo":true},
    {"id":"cdmx","kind":"directo","estado":"cdmx","nombre":"José Luis G.","cobertura":"En toda la CDMX y área metropolitana","ubicacion":"","local":"","whatsapp":"522225012131","grupoUrl":"https://chat.whatsapp.com/Ksv3q1YxYyT0eUcjSostMQ","primary":false,"activo":true},
    {"id":"mexico","kind":"directo","estado":"mexico","nombre":"Armando","cobertura":"Toluca y municipios del Estado de México","ubicacion":"","local":"","whatsapp":"522221828545","grupoUrl":"https://chat.whatsapp.com/D1ujCUyq1TzCfALXtgVsb5","primary":false,"activo":true},
    {"id":"tlaxcala","kind":"directo","estado":"tlaxcala","nombre":"Karla G.","cobertura":"Tlaxcala Centro, Apizaco, Chiautempan y alrededores","ubicacion":"","local":"","whatsapp":"522227548704","grupoUrl":"https://chat.whatsapp.com/E4XhZydgkpcK9Dm8USfWcb","primary":false,"activo":true},
    {"id":"chilpancingo","kind":"directo","estado":"guerrero","nombre":"José Santos G.","cobertura":"Chilpancingo, Zumpango del Río, Tixtla y alrededores","ubicacion":"","local":"","whatsapp":"522215855199","grupoUrl":"https://chat.whatsapp.com/KAgXSrea19jC8tzUM375Mz","primary":false,"activo":true}
  ]
};

const FALLBACK_TEAM = {
  members: [
    {"id":"dev","role":"CEO","name":"Karla García","photo":"icons/equipo/dev-1789016156434.jpg","whatsapp":"522227548704","email":"","social":[{"network":"facebook","url":"https://www.facebook.com/karla.garcialima"}]},
    {"id":"ceo","role":"Programador","name":"Adán García","photo":"icons/equipo/ceo-1789015870434.jpg","whatsapp":"522214102306","email":"adan_rostro_@hotmail.com","social":[{"network":"facebook","url":"https://www.facebook.com/adan.garcia.79656/"}]}
  ]
};

const FALLBACK_COVERAGE = {"activeStateIds":["puebla","cdmx","mexico","veracruz","hidalgo","tlaxcala","aguascalientes","guanajuato","tamaulipas","guerrero"]};

const FALLBACK_SOCIAL = {
  links: [
    {"id":"facebook","network":"facebook","label":"Facebook","url":"https://www.facebook.com/profile.php?id=100063747836703"},
    {"id":"whatsapp-comunidad","network":"whatsapp","label":"Comunidad Oficial de WhatsApp","url":"https://chat.whatsapp.com/FqxcY8FG4lCIPCalAgIXZZ"}
  ]
};
