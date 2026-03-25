const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const scrollProgress = document.getElementById("scrollProgress");
const brandLogo = document.getElementById("brandLogo");
const floatingAdminBtn = document.getElementById("floatingAdminBtn");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const tabTriggers = document.querySelectorAll("[data-tab-target]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");

let coverageMapInstance = null;

let logoTapCount = 0;
let logoTapTimer = null;

// ===== THEME TOGGLE LOGIC =====
function initThemeToggle() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const savedTheme = localStorage.getItem("theme-preference");
  
  function updateTheme(isDark) {
    if (isDark) {
      document.body.classList.add("dark-mode");
      themeIcon.className = "bi bi-sun-fill";
    } else {
      document.body.classList.remove("dark-mode");
      themeIcon.className = "bi bi-moon-fill";
    }
    localStorage.setItem("theme-preference", isDark ? "dark" : "light");
  }

  // Set initial theme from localStorage or system preference
  if (savedTheme) {
    updateTheme(savedTheme === "dark");
  } else {
    updateTheme(prefersDark.matches);
  }

  // Listen for system theme changes
  prefersDark.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme-preference")) {
      updateTheme(e.matches);
    }
  });

  // Toggle button click
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      updateTheme(!isDark);
    });
  }
}

initThemeToggle();

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

const hashToTab = {
  "#inicio": "inicio",
  "#que-compramos": "materiales",
  "#tipos-celular": "materiales",
  "#otherMaterialDisplay": "materiales",
  "#precios": "materiales",
  "#proceso": "materiales",
  "#galeria": "materiales",
  "#cobertura": "cobertura",
  "#registro": "cotizar",
  "#contacto": "cotizar",
};

const tabToHash = {
  inicio: "#inicio",
  materiales: "#que-compramos",
  cobertura: "#cobertura",
  cotizar: "#registro",
};

function activateTab(tabId, options = {}) {
  const { updateHash = true, scrollToTop = true } = options;
  if (!tabId) {
    return;
  }

  tabPanels.forEach((panel) => {
    const shouldShow = panel.dataset.tabPanel === tabId;
    panel.hidden = !shouldShow;
    panel.classList.toggle("is-active", shouldShow);
  });

  tabTriggers.forEach((trigger) => {
    const isActive = trigger.dataset.tabTarget === tabId;
    trigger.classList.toggle("is-active", isActive);
    if (trigger.getAttribute("role") === "tab") {
      trigger.setAttribute("aria-selected", isActive ? "true" : "false");
    }
  });

  if (tabId === "cobertura") {
    initCoverageMap();
  }

  if (updateHash) {
    const nextHash = tabToHash[tabId] || "#inicio";
    history.replaceState(null, "", nextHash);
  }

  if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

tabTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    const tabId = trigger.dataset.tabTarget;
    if (!tabId) {
      return;
    }

    event.preventDefault();
    activateTab(tabId);
  });
});

window.addEventListener("hashchange", () => {
  const tabId = hashToTab[window.location.hash];
  if (tabId) {
    activateTab(tabId, { updateHash: false, scrollToTop: false });
  }
});

activateTab(hashToTab[window.location.hash] || "inicio", {
  updateHash: false,
  scrollToTop: false,
});

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

  // The selector modal lives inside a tab panel; ensure that panel is visible first.
  const modalHostPanel = materialSelectorModal.closest("[data-tab-panel]");
  if (modalHostPanel?.hasAttribute("hidden")) {
    activateTab(modalHostPanel.dataset.tabPanel || "materiales", {
      updateHash: false,
      scrollToTop: false,
    });
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

  activateTab("materiales", { updateHash: true, scrollToTop: false });

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

  activateTab("cotizar", { updateHash: true, scrollToTop: false });
  
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
    price: "$900 - $1,300 /kg",
    specs: [
      "Sin flex ni tiras",
      "Sin camaras",
      "Debe tener su chip",
      "Celulares de gama media a alta",
      "Condición variable aceptable mientras el chip esté presente"
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
    price: "$220 - $350 /kg",
    specs: [
      "Placas grandes que cubren el celular",
      "En caso de que si no entrara en tipo 1 se pasara a tipo 2 ya sea sin chip integrado o que este rota",
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
    price: "$100 - $150 /kg",
    specs: [
      "Placas de teléfonos con teclado",
      "placas de tablet",
      "Ambas categorias tienen el mismo precio",
      "Cualquier marca o modelo",
      "Condición variable aceptable"
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
    price: "$70 - $100 /kg",
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
    price: "$90 - $150 /kg",
    specs: [
      "Placas madre de laptops y netbooks",
      "Cualquier condición - funcionales o dañadas",
      "Cualquier marca (Dell, HP, Lenovo, etc)",
      "Con o sin procesador integrado",
      "Ideal para reciclaje"
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
    title: "Módulos de Memoria RAM DDR / DDR2 / DDR3 / DDR4",
    price: "$300 - $450 /kg",
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
    eyebrow: "Teléfonos con Teclado",
    title: "Lógicas de Teléfonos con Teclado Mecánico",
    price: "$100 - $150 /kg",
    specs: [
      "Placas de teléfonos antiguos con teclado",
      "BlackBerry, HTC, y otros modelos",
      "Cualquier estado - rotos o funcionales",
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
    price: "$100 - $150 /kg",
    specs: [
      "Placas de tablets iPad, Samsung, Lenovo, etc",
      "Cualquier tamaño - 7\" a 12\"",
      "Funcionales o para descarte",
      "Condición variable aceptable mientras el chip esté presente",
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
  document.getElementById("priceBanner").innerHTML = `<div class="price-text">Rango referencial: <strong>${data.price}</strong></div>`;

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

const ACTIVE_COVERAGE_TERMS = [
  "puebla",
  "cdmx",
  "ciudad de mexico",
  "estado de mexico",
  "edomex",
  "veracruz",
  "hidalgo"
];

const MIN_10KG_TERMS = [
  "aguascalientes",
  "baja california",
  "baja california sur",
  "campeche",
  "chiapas",
  "chihuahua",
  "coahuila",
  "colima",
  "durango",
  "guanajuato",
  "guerrero",
  "jalisco",
  "michoacan",
  "morelos",
  "nayarit",
  "nuevo leon",
  "oaxaca",
  "queretaro",
  "quintana roo",
  "cancun",
  "san luis potosi",
  "sinaloa",
  "sonora",
  "tabasco",
  "tamaulipas",
  "tlaxcala",
  "yucatan",
  "zacatecas"
];

let currentCoordinates = "";

function normalizeLocationText(value) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isInActiveCoverage(locationText) {
  const normalizedLocation = normalizeLocationText(locationText);
  return ACTIVE_COVERAGE_TERMS.some((term) => normalizedLocation.includes(term));
}

function isInMin10Coverage(locationText) {
  const normalizedLocation = normalizeLocationText(locationText);
  return MIN_10KG_TERMS.some((term) => normalizedLocation.includes(term));
}

const COVERAGE_POINTS = [
  { label: "Puebla", coords: [19.0414, -98.2063], zoneKm: 75, type: "active" },
  { label: "CDMX", coords: [19.4326, -99.1332], zoneKm: 65, type: "active" },
  { label: "Estado de México", coords: [19.2826, -99.6557], zoneKm: 70, type: "active" },
  { label: "Veracruz", coords: [19.1738, -96.1342], zoneKm: 70, type: "active" },
  { label: "Hidalgo", coords: [20.1011, -98.7591], zoneKm: 65, type: "active" },
  { label: "Tabasco", coords: [17.9892, -92.9475], zoneKm: 65, type: "min10" },
  { label: "Cancun", coords: [21.1619, -86.8515], zoneKm: 60, type: "min10" },
  { label: "Campeche", coords: [19.845, -90.5231], zoneKm: 55, type: "min10" },
  { label: "Oaxaca", coords: [17.0732, -96.7266], zoneKm: 60, type: "min10" },
  { label: "Guerrero", coords: [17.5515, -99.5058], zoneKm: 60, type: "min10" }
];

function initCoverageMap() {
  const mapContainer = document.getElementById("coverageMap");
  if (!mapContainer) {
    return;
  }

  if (coverageMapInstance) {
    setTimeout(() => {
      coverageMapInstance.invalidateSize();
    }, 120);
    return;
  }

  if (typeof window.L === "undefined") {
    mapContainer.innerHTML = "<p class='map-fallback'>No se pudo cargar el mapa. Cobertura activa en 5 estados y 5 estados sujetos a recolección desde 10 kg.</p>";
    return;
  }

  coverageMapInstance = window.L.map(mapContainer, {
    scrollWheelZoom: false,
    minZoom: 4,
    maxZoom: 10
  });

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(coverageMapInstance);

  const activeMarkerIcon = window.L.divIcon({
    className: "coverage-map-marker-wrap",
    html: "<span class='coverage-map-marker' aria-hidden='true'></span>",
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  const min10MarkerIcon = window.L.divIcon({
    className: "coverage-map-marker-wrap",
    html: "<span class='coverage-map-marker coverage-map-marker-min10' aria-hidden='true'></span>",
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  const bounds = [];
  COVERAGE_POINTS.forEach((point) => {
    bounds.push(point.coords);

    const isActive = point.type === "active";
    const zoneColor = isActive ? "#2f80ed" : "#d14f1a";

    window.L.circle(point.coords, {
      radius: point.zoneKm * 1000,
      color: zoneColor,
      weight: 1,
      opacity: 0.45,
      fillColor: zoneColor,
      fillOpacity: 0.08
    }).addTo(coverageMapInstance);

    const markerIcon = isActive ? activeMarkerIcon : min10MarkerIcon;
    const popupText = isActive
      ? `<strong>${point.label}</strong><br/>Cobertura activa`
      : `<strong>${point.label}</strong><br/>Recolección desde 10 kg`;

    window.L.marker(point.coords, { icon: markerIcon })
      .addTo(coverageMapInstance)
      .bindPopup(popupText);
  });

  coverageMapInstance.fitBounds(bounds, { padding: [30, 30] });
}

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
      geoStatus.textContent = "Tu navegador no permite geolocalización.";
      return;
    }

    geoStatus.textContent = "Detectando ubicación...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        currentCoordinates = `${lat}, ${lng}`;
        locationTextInput.value = `Coordenadas: ${currentCoordinates}`;
        geoStatus.textContent = "Ubicación detectada. Puedes editarla si quieres.";
      },
      () => {
        geoStatus.textContent = "No se pudo obtener ubicación. Escribe tu ciudad/estado manualmente.";
      }
    );
  });
}

if (leadForm && leadSuccess) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const kilosValue = Number(formData.get("kilos"));
    const stateValue = formData.get("state")?.toString().trim() || "";
    const locationValue = formData.get("locationText")?.toString().trim() || "";
    const inActiveCoverage = isInActiveCoverage(stateValue) || isInActiveCoverage(locationValue);
    const inMin10Coverage =
      isInMin10Coverage(stateValue) ||
      isInMin10Coverage(locationValue) ||
      !inActiveCoverage;

    if (inMin10Coverage && (!Number.isFinite(kilosValue) || kilosValue < 10)) {
      leadSuccess.classList.add("is-error");
      leadSuccess.textContent = "Fuera de cobertura activa, la recolección se revisa a partir de 10 kg.";
      return;
    }

    const lead = {
      date: new Date().toLocaleString("es-MX"),
      fullName: formData.get("fullName")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),
      materialType: formData.get("materialType")?.toString().trim(),
      kilos: formData.get("kilos")?.toString().trim(),
      state: stateValue,
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

    leadSuccess.classList.remove("is-error");
    leadSuccess.textContent = "Registro enviado. Gracias, te contactaremos pronto.";

  });
}
