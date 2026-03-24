const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const scrollProgress = document.getElementById("scrollProgress");
const brandLogo = document.getElementById("brandLogo");
const floatingAdminBtn = document.getElementById("floatingAdminBtn");

let logoTapCount = 0;
let logoTapTimer = null;

function toggleAdminAccess() {
  document.body.classList.toggle("admin-access-visible");

  if (!floatingAdminBtn) {
    return;
  }

  if (document.body.classList.contains("admin-access-visible")) {
    floatingAdminBtn.textContent = "Admin ON";
    setTimeout(() => {
      floatingAdminBtn.textContent = "Admin";
    }, 1200);
  }
}

if (brandLogo) {
  brandLogo.addEventListener("click", () => {
    logoTapCount += 1;

    if (logoTapTimer) {
      clearTimeout(logoTapTimer);
    }

    logoTapTimer = setTimeout(() => {
      logoTapCount = 0;
    }, 1200);

    if (logoTapCount >= 3) {
      logoTapCount = 0;
      toggleAdminAccess();
    }
  });
}

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const heroVisual = document.querySelector(".hero-visual");
  if (heroVisual) {
    heroVisual.addEventListener("mousemove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 6;
      const rotateX = (0.5 - y) * 5;
      heroVisual.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroVisual.addEventListener("mouseleave", () => {
      heroVisual.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    });
  }

  document.querySelectorAll(".quick-price-card, .card").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      item.style.willChange = "transform";
    });

    item.addEventListener("mouseleave", () => {
      item.style.willChange = "auto";
    });
  });
}

function updateScrollProgress() {
  if (!scrollProgress) {
    return;
  }

  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
}

window.addEventListener("scroll", updateScrollProgress);
updateScrollProgress();

// ===== MATERIAL SELECTOR MODAL LOGIC =====
const materialSelectorModal = document.getElementById("materialSelectorModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const materialBtns = document.querySelectorAll(".material-btn");
const celularTypesSection = document.getElementById("tipos-celular");
const otherMaterialSection = document.getElementById("otherMaterialDisplay");
const backBtns = document.querySelectorAll("#backBtn, #backBtn2, #backBtn3, #backBtn4");
const openSelectorButtons = document.querySelectorAll(".open-material-selector");
const campaignStrip = document.getElementById("campaignStrip");
const registerSection = document.getElementById("registro");
const heroSection = document.getElementById("inicio");
const mainElement = document.querySelector("main");

let selectedMaterial = null;

const materialThemeClasses = [
  "material-theme-celular",
  "material-theme-ram",
  "material-theme-laptop",
  "material-theme-tablet",
  "material-theme-teclado",
  "material-theme-otro",
];

function applyMaterialTheme(material) {
  materialThemeClasses.forEach((themeClass) => {
    document.body.classList.remove(themeClass);
  });

  if (material) {
    document.body.classList.add(`material-theme-${material}`);
  }
}

function initCampaignMode() {
  const params = new URLSearchParams(window.location.search);
  const campaignMode2 =
    params.get("mode") === "campaign2" ||
    params.get("modo") === "campana2" ||
    params.get("campaign") === "2" ||
    params.get("ads") === "2";

  const campaignEnabled =
    campaignMode2 ||
    params.get("modo") === "campana" ||
    params.get("mode") === "campaign" ||
    params.get("campaign") === "1" ||
    params.get("ads") === "1";

  if (!campaignEnabled) {
    return;
  }

  document.body.classList.add("campaign-mode");

  if (campaignStrip) {
    campaignStrip.style.display = "block";
  }

  if (campaignMode2) {
    document.body.classList.add("campaign-mode-2");

    if (campaignStrip) {
      campaignStrip.style.display = "none";
    }

    if (registerSection && heroSection && mainElement) {
      mainElement.insertBefore(registerSection, heroSection.nextSibling);
    }
  }

  if (openSelectorButtons.length) {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  }
}

initCampaignMode();

// Show material selector only for explicit CTA triggers.
if (materialSelectorModal) {
  openSelectorButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showMaterialSelector();
    });
  });
}

function showMaterialSelector() {
  if (!materialSelectorModal) {
    return;
  }
  materialSelectorModal.style.display = "flex";
  materialSelectorModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function hideMaterialSelector() {
  if (!materialSelectorModal) {
    return;
  }
  materialSelectorModal.classList.remove("active");
  setTimeout(() => {
    materialSelectorModal.style.display = "none";
  }, 300);
  document.body.style.overflow = "auto";
}

if (modalClose) {
  modalClose.addEventListener("click", hideMaterialSelector);
}

if (modalOverlay) {
  modalOverlay.addEventListener("click", hideMaterialSelector);
}

// Handle material selection
materialBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const material = btn.dataset.material;
    selectedMaterial = material;
    applyMaterialTheme(material);
    hideMaterialSelector();
    handleMaterialSelection(material);
  });
});

function handleMaterialSelection(material) {
  if (!celularTypesSection || !otherMaterialSection) {
    return;
  }

  // Hide all sections first
  celularTypesSection.style.display = "none";
  otherMaterialSection.style.display = "none";

  if (material === "celular") {
    celularTypesSection.style.display = "block";
    loadTypeContent("tipo1");
    window.scrollTo({ top: celularTypesSection.offsetTop - 80, behavior: "smooth" });
  } else if (material === "laptop" || material === "ram" || material === "teclado" || material === "tablet") {
    displayOtherMaterial(material);
    window.scrollTo({ top: otherMaterialSection.offsetTop - 80, behavior: "smooth" });
  } else if (material === "otro") {
    // For "otra cosa", redirect to form
    selectedMaterial = "otro";
    fillFormAndScroll();
  }
}

// Back button functionality
backBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    celularTypesSection.style.display = "none";
    otherMaterialSection.style.display = "none";
    selectedMaterial = null;
    applyMaterialTheme(null);
    showMaterialSelector();
  });
});

// Pre-fill form when user clicks "Tengo este material"
document.querySelectorAll(".modal-actions .btn-primary").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    fillFormAndScroll();
  });
});

function fillFormAndScroll() {
  const materialSelect = document.querySelector('select[name="materialType"]');
  if (!materialSelect) {
    return;
  }
  
  if (selectedMaterial === "celular") {
    materialSelect.value = "Logica de celular";
  } else if (selectedMaterial === "laptop") {
    materialSelect.value = "Logica de laptop";
  } else if (selectedMaterial === "ram") {
    materialSelect.value = "RAM";
  } else if (selectedMaterial === "teclado") {
    materialSelect.value = "Logica de celular";
  } else if (selectedMaterial === "tablet") {
    materialSelect.value = "Logica de tablet";
  } else if (selectedMaterial === "otro") {
    materialSelect.value = "Otro";
  }
  
  window.location.hash = "#registro";
  setTimeout(() => {
    const formSection = document.getElementById("registro");
    formSection.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

// ===== PRODUCT DATA =====
const typeData = {
  tipo1: {
    label: "Tipo 1 - Premium",
    price: "$1,300 /kg",
    specs: [
      "Sin flex ni tiras",
      "Sin camaras",
      "Debe tener su chip",
      "Celulares de gama media a alta",
      "Condicion optima de funcionamiento"
    ],
    images: [
      "Galeria/Celular Tipo 1/logica_celular1.jpg",
      "Galeria/Celular Tipo 1/logica_celular11.jpg",
      "Galeria/Celular Tipo 1/logica_celular12.jpg",
      "Galeria/Celular Tipo 1/logica_celular13.jpg",
      "Galeria/Celular Tipo 1/logica_celular14.jpg",
      "Galeria/Celular Tipo 1/logica_celular15.jpg",
      "Galeria/Celular Tipo 1/logica_celular16.jpg",
      "Galeria/Celular Tipo 1/logica_celular17.jpg"
    ]
  },
  tipo2: {
    label: "Tipo 2 - Placas grandes",
    price: "$350 /kg",
    specs: [
      "Placas grandes que cubren el celular",
      "Sin chip integrado",
      "Pueden estar quemadas o ensambladas",
      "Cualquier marca o modelo",
      "Celulares antiguos o de gama baja"
    ],
    images: [
      "Galeria/Celular Tipo 2/logica_celular2.jpg",
      "Galeria/Celular Tipo 2/logica_celular21.jpg",
      "Galeria/Celular Tipo 2/logica_celular22.jpg",
      "Galeria/Celular Tipo 2/logica_celular23.jpg",
      "Galeria/Celular Tipo 2/logica_celular24.jpg",
      "Galeria/Celular Tipo 2/logica_celular25.jpg",
      "Galeria/Celular Tipo 2/logica_celular26.jpg",
      "Galeria/Celular Tipo 2/logica_celular27.jpg"
    ]
  },
  tipo3: {
    label: "Tipo 3 - Teclado y Tablet",
    price: "$150 /kg",
    specs: [
      "Placas de telefonos con teclado",
      "O placas de tablet",
      "Ambas categorias tienen el mismo precio",
      "Cualquier marca o modelo",
      "Condicion variable aceptable"
    ],
    images: [
      "Galeria/Celular y Tablet Tipo 3/logica_celular3.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_celular31.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_celular32.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_tablet35.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_tablet36.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_tablet37.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_tablet38.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_tablet310.jpg"
    ]
  },
  tipo4: {
    label: "Tipo 4 - Sin pila ni tapa",
    price: "$100 /kg",
    specs: [
      "Celulares completos sin desmontar",
      "Sin pila - se debe retirar bateria",
      "Sin tapa - se puede dejar como venga",
      "Para clientes sin tiempo de desarmado",
      "Ideal para lotes grandes y descarte"
    ],
    images: [
      "Galeria/Sin Pila y Tapa Tipo 4/sin_pila_y_tapa.jpg"
    ]
  }
};

const otherMaterialData = {
  laptop: {
    eyebrow: "Logica de Laptop",
    title: "Motherboards y Placas de Laptop",
    price: "$150 /kg",
    specs: [
      "Placas madre de laptops y netbooks",
      "Cualquier condicion - funcionales o danadas",
      "Cualquier marca (Dell, HP, Lenovo, etc)",
      "Con o sin procesador integrado",
      "Ideal para reciclaje y extraccion de materiales"
    ],
    images: [
      "Galeria/Laptop/Laptop.jpg",
      "Galeria/Laptop/Laptop1.jpg",
      "Galeria/Laptop/Laptop2.jpg",
      "Galeria/Laptop/Laptop3.jpg",
      "Galeria/Laptop/Laptop4.jpg",
      "Galeria/Laptop/Laptop5.jpg",
      "Galeria/Laptop/Laptop6.jpg"
    ]
  },
  ram: {
    eyebrow: "Memorias RAM",
    title: "Modulos de Memoria RAM DDR / DDR2 / DDR3 / DDR4",
    price: "$450 /kg",
    specs: [
      "Memorias RAM de cualquier generacion",
      "DDR, DDR2, DDR3, DDR4, DDR5",
      "Cualquier capacidad (256MB a 32GB+)",
      "Funcionales o defectuosas aceptadas",
      "Alto valor por peso - excelente para reciclar"
    ],
    images: [
      "Galeria/RAM/RAM.jpg",
      "Galeria/RAM/RAM1.jpg",
      "Galeria/RAM/RAM2.jpg"
    ]
  },
  teclado: {
    eyebrow: "Telefonos con Teclado",
    title: "Logicas de Telefonos con Teclado Mecanico",
    price: "$150 /kg",
    specs: [
      "Placas de telefonos antiguos con teclado",
      "BlackBerry, HTC, y otros modelos",
      "Cualquier estado - rotos o funcionales",
      "Excelente contenido de materiales preciosos",
      "Demanda consistente en reciclaje"
    ],
    images: [
      "Galeria/Celular y Tablet Tipo 3/logica_celular3.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_celular31.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_celular32.jpg"
    ]
  },
  tablet: {
    eyebrow: "Placas de Tablet",
    title: "Motherboards y Logicas de Tablets",
    price: "$150 /kg",
    specs: [
      "Placas de tablets iPad, Samsung, Lenovo, etc",
      "Cualquier tamaño - 7\" a 12\"",
      "Funcionales o para descarte",
      "Alto valor de materiales - oro, cobre, aluminio",
      "Aceptamos grandes volumenes"
    ],
    images: [
      "Galeria/Celular y Tablet Tipo 3/logica_tablet35.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_tablet36.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_tablet37.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_tablet38.jpg",
      "Galeria/Celular y Tablet Tipo 3/logica_tablet310.jpg"
    ]
  }
};

function displayOtherMaterial(material) {
  const data = otherMaterialData[material];
  if (!data) return;

  document.getElementById("otherMaterialEyebrow").textContent = data.eyebrow;
  document.getElementById("otherMaterialTitle").textContent = data.title;
  document.getElementById("priceBanner").innerHTML = `<div class="price-text">Precio: <strong>${data.price}</strong></div>`;

  document.getElementById("materialSpecsList").innerHTML = data.specs
    .map((spec) => `<li>${spec}</li>`)
    .join("");

  otherMaterialSection.style.display = "block";

  // Initialize carousel
  initMaterialCarousel(data.images);
}

// ===== CELULAR TYPES HANDLING =====
const typeBtns = document.querySelectorAll(".type-btn");
const typeGallery = document.getElementById("typeGallery");
const typeSpecs = document.getElementById("typeSpecs");

// ===== CAROUSEL STATE MANAGEMENT =====
let currentCarouselIndex = 0;
let currentMaterialCarouselIndex = 0;
let carouselAutoplay = null;
let materialCarouselAutoplay = null;

// ===== CAROUSEL FUNCTIONS FOR CELULAR TYPES =====
function initTypeCarousel(images) {
  // Clear previous autoplay
  if (carouselAutoplay) clearInterval(carouselAutoplay);

  const carouselImage = document.getElementById("carouselImage");
  const carouselDots = document.getElementById("carouselDots");
  const carouselPrev = document.getElementById("carouselPrev");
  const carouselNext = document.getElementById("carouselNext");

  if (!carouselImage || !images || images.length === 0) return;

  currentCarouselIndex = 0;

  // Create dots
  carouselDots.innerHTML = images
    .map((_, i) => `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Imagen ${i + 1}"></button>`)
    .join("");

  // Set initial image
  carouselImage.src = images[0];
  carouselImage.onerror = () => {
    carouselImage.src = "Galeria/logica_celular.jpg";
  };

  // Navigation function
  const showImage = (index) => {
    currentCarouselIndex = (index + images.length) % images.length;
    carouselImage.src = images[currentCarouselIndex];
    
    // Update dots
    carouselDots.querySelectorAll(".carousel-dot").forEach((dot) => {
      dot.classList.remove("active");
    });
    const activeDot = carouselDots.querySelector(`[data-index="${currentCarouselIndex}"]`);
    if (activeDot) {
      activeDot.classList.add("active");
    }

    // Reset autoplay
    resetCarouselAutoplay();
  };

  // Add button listeners
  carouselPrev.onclick = () => showImage(currentCarouselIndex - 1);
  carouselNext.onclick = () => showImage(currentCarouselIndex + 1);

  // Dot navigation
  carouselDots.querySelectorAll(".carousel-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      showImage(parseInt(dot.dataset.index));
    });
  });

  // Autoplay controls
  const carouselViewer = document.querySelector("#tipos-celular .carousel-viewer");
  if (carouselViewer) {
    carouselViewer.onmouseenter = () => {
      if (carouselAutoplay) clearInterval(carouselAutoplay);
    };
    carouselViewer.onmouseleave = () => {
      resetCarouselAutoplay();
    };
  }

  // Start autoplay
  resetCarouselAutoplay();

  function resetCarouselAutoplay() {
    if (carouselAutoplay) clearInterval(carouselAutoplay);
    carouselAutoplay = setInterval(() => {
      showImage(currentCarouselIndex + 1);
    }, 5000);
  }
}

// ===== CAROUSEL FUNCTIONS FOR OTHER MATERIALS =====
function initMaterialCarousel(images) {
  // Clear previous autoplay
  if (materialCarouselAutoplay) clearInterval(materialCarouselAutoplay);

  const materialCarouselImage = document.getElementById("materialCarouselImage");
  const materialCarouselDots = document.getElementById("materialCarouselDots");
  const materialCarouselPrev = document.getElementById("materialCarouselPrev");
  const materialCarouselNext = document.getElementById("materialCarouselNext");

  if (!materialCarouselImage || !images || images.length === 0) return;

  currentMaterialCarouselIndex = 0;

  // Create dots
  materialCarouselDots.innerHTML = images
    .map((_, i) => `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Imagen ${i + 1}"></button>`)
    .join("");

  // Set initial image
  materialCarouselImage.src = images[0];
  materialCarouselImage.onerror = () => {
    materialCarouselImage.src = "Galeria/logica_lapcpu.jpg";
  };

  // Navigation function
  const showImage = (index) => {
    currentMaterialCarouselIndex = (index + images.length) % images.length;
    materialCarouselImage.src = images[currentMaterialCarouselIndex];
    
    // Update dots
    materialCarouselDots.querySelectorAll(".carousel-dot").forEach((dot) => {
      dot.classList.remove("active");
    });
    const activeDot = materialCarouselDots.querySelector(`[data-index="${currentMaterialCarouselIndex}"]`);
    if (activeDot) {
      activeDot.classList.add("active");
    }

    // Reset autoplay
    resetMaterialCarouselAutoplay();
  };

  // Add button listeners
  materialCarouselPrev.onclick = () => showImage(currentMaterialCarouselIndex - 1);
  materialCarouselNext.onclick = () => showImage(currentMaterialCarouselIndex + 1);

  // Dot navigation
  materialCarouselDots.querySelectorAll(".carousel-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      showImage(parseInt(dot.dataset.index));
    });
  });

  // Autoplay controls
  const carouselViewer = document.querySelector("#otherMaterialDisplay .carousel-viewer");
  if (carouselViewer) {
    carouselViewer.onmouseenter = () => {
      if (materialCarouselAutoplay) clearInterval(materialCarouselAutoplay);
    };
    carouselViewer.onmouseleave = () => {
      resetMaterialCarouselAutoplay();
    };
  }

  // Start autoplay
  resetMaterialCarouselAutoplay();

  function resetMaterialCarouselAutoplay() {
    if (materialCarouselAutoplay) clearInterval(materialCarouselAutoplay);
    materialCarouselAutoplay = setInterval(() => {
      showImage(currentMaterialCarouselIndex + 1);
    }, 5000);
  }
}

function loadTypeContent(typeKey) {
  const data = typeData[typeKey];
  if (!data) return;

  typeSpecs.innerHTML = data.specs
    .map((spec) => `<li>${spec}</li>`)
    .join("");

  typeBtns.forEach((btn) => {
    if (btn.dataset.type === typeKey) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Initialize carousel
  initTypeCarousel(data.images);
}

typeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const typeKey = btn.dataset.type;
    loadTypeContent(typeKey);
  });
});

loadTypeContent("tipo1");

const LEADS_KEY = "reciclajeLogikasLeads";
const LEGACY_LEADS_KEY = "reciclajesGLeads";

const leadForm = document.getElementById("leadForm");
const detectLocationBtn = document.getElementById("detectLocationBtn");
const locationTextInput = document.getElementById("locationText");
const geoStatus = document.getElementById("geoStatus");
const leadSuccess = document.getElementById("leadSuccess");

let currentCoordinates = "";

function getLeads() {
  const raw = localStorage.getItem(LEADS_KEY) || localStorage.getItem(LEGACY_LEADS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveLeads(leads) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  localStorage.removeItem(LEGACY_LEADS_KEY);
}


if (detectLocationBtn && locationTextInput && geoStatus) {
  detectLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      geoStatus.textContent = "Tu navegador no permite geolocalizacion.";
      return;
    }

    geoStatus.textContent = "Detectando ubicacion...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        currentCoordinates = `${lat}, ${lng}`;
        locationTextInput.value = `Coordenadas: ${currentCoordinates}`;
        geoStatus.textContent = "Ubicacion detectada. Puedes editarla si quieres.";
      },
      () => {
        geoStatus.textContent = "No se pudo obtener ubicacion. Escribe tu ciudad/estado manualmente.";
      }
    );
  });
}

if (leadForm && leadSuccess) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const lead = {
      date: new Date().toLocaleString("es-MX"),
      fullName: formData.get("fullName")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),
      materialType: formData.get("materialType")?.toString().trim(),
      kilos: formData.get("kilos")?.toString().trim(),
      locationText: formData.get("locationText")?.toString().trim(),
      coordinates: currentCoordinates,
      notes: formData.get("notes")?.toString().trim(),
    };

    const leads = getLeads();
    leads.unshift(lead);
    saveLeads(leads);

    leadForm.reset();
    currentCoordinates = "";
    if (geoStatus) {
      geoStatus.textContent = "";
    }

    leadSuccess.textContent = "Registro enviado. Gracias, te contactaremos pronto.";

  });
}
