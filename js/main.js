// Número de WhatsApp que recibe los mensajes del formulario (con código de país, sin + ni espacios).
const WHATSAPP_NUMBER = "595991230966";

const STATS = { statProjects: 15, statYears: 3, statTech: 12 };

const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Cambiar a ice chrome" : "Cambiar a black chrome");
}

function getStoredTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

applyTheme(getStoredTheme() || "dark");

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch {}
});

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

function animateCount(el, target) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = `${target}+`;
    return;
  }
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target) + (progress === 1 ? "+" : "");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

let statsAnimated = false;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      if (!statsAnimated && entry.target.querySelector(".stats")) {
        statsAnimated = true;
        Object.entries(STATS).forEach(([id, value]) => {
          animateCount(document.getElementById(id), value);
        });
      }
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const sections = document.querySelectorAll("main section[id]");
const linkById = {};
navLinks.querySelectorAll("a").forEach((a) => {
  linkById[a.getAttribute("href").slice(1)] = a;
});

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      Object.values(linkById).forEach((a) => a.classList.remove("active"));
      linkById[entry.target.id]?.classList.add("active");
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

sections.forEach((s) => activeObserver.observe(s));

// Hero: escenario de scroll. El CD gira sobre su eje (y va cambiando de cuadro como
// una moneda) mientras crece desde su lugar del hero hasta ocupar toda la pantalla.
// Cuando termina el escenario, la caja se despega y entra el resto de la información.
const heroStage = document.querySelector(".hero-stage");
const heroSticky = document.querySelector(".hero-sticky");
const heroText = document.querySelector(".hero-text");
const heroVisual = document.querySelector(".hero-visual");
const cdStage = heroVisual.querySelector(".cd-stage");
const cdFrames = heroVisual.querySelectorAll(".cd-frames img");
const cdReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Sin movimiento no se montan los escenarios: el hero y Servicios son secciones normales.
const stagesOn = () => !cdReduceMotion;
// Fracción de cada tramo que dura el cambio de cuadro; el resto el cuadro queda quieto.
const CD_FLIP = 0.6;
// Qué tan rápido la animación alcanza al scroll (más bajo = más inercia).
const CD_EASE = 0.12;
// Grados que gira el CD sobre su propio eje en todo el recorrido.
const CD_SPIN = 540;
// Tramo final del escenario en el que el CD ya llena la pantalla y se queda quieto.
const CD_HOLD = 0.18;
// Recorte de .cd-stage dentro de .hero-visual (inset: 6%).
const CD_INSET = 0.88;
let cdScrollStart = 0;
let cdScrollEnd = 1;
let cdPos = null;
let cdRaf = null;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Progreso del escenario: 0 = CD en su sitio del hero, 1 = CD llenando la pantalla.
function cdTarget() {
  return clamp01((window.scrollY - cdScrollStart) / cdScrollEnd);
}

function renderCd(p) {
  // Giro tipo moneda: la foto actual rota hasta quedar de canto (90°) y en ese instante
  // la reemplaza la siguiente, que completa el giro desde -90° hasta quedar de frente.
  // Encima, todo el CD gira sobre su propio eje a medida que crece.
  const last = cdFrames.length - 1;
  const pos = p * last;
  const seg = Math.min(last - 1, Math.floor(pos));
  const angle = 180 * smoothstep((1 - CD_FLIP) / 2, (1 + CD_FLIP) / 2, pos - seg);
  const showing = angle < 90 ? seg : seg + 1;
  const spin = (CD_SPIN * p).toFixed(2);
  cdFrames.forEach((img, i) => {
    img.style.opacity = i === showing ? 1 : 0;
    if (i !== showing) return;
    const turn = i === seg ? angle : angle - 180;
    img.style.transform = `perspective(1400px) rotateY(${turn.toFixed(2)}deg) rotate(${spin}deg)`;
  });

  // Crecimiento: el CD se va corriendo al centro de la pantalla y escala hasta llenarla.
  const rect = heroVisual.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const natural = rect.width * CD_INSET;
  const scaleMax = natural > 0 ? Math.max(vw, vh) / natural : 1;
  const scale = 1 + (scaleMax - 1) * p;
  const dx = vw / 2 - (rect.left + rect.width / 2);
  const dy = vh / 2 - (rect.top + rect.height / 2);
  cdStage.style.setProperty("--cd-x", `${(dx * p).toFixed(1)}px`);
  cdStage.style.setProperty("--cd-y", `${(dy * p).toFixed(1)}px`);
  cdStage.style.setProperty("--cd-scale", scale.toFixed(4));
  cdStage.style.setProperty("--cd-bob", `${(14 / scale).toFixed(2)}px`);

  // El texto, el halo y los destellos se apagan mientras el CD toma la pantalla.
  const fade = 1 - smoothstep(0.02, 0.4, p);
  heroVisual.style.setProperty("--cd-aux", fade.toFixed(3));
  if (p < 0.001) {
    // Sin scroll dejamos que mande el CSS (así la entrada .reveal se ve completa).
    heroText.style.removeProperty("opacity");
    heroText.style.removeProperty("transform");
    heroText.style.removeProperty("transition");
  } else {
    heroText.style.transition = "none";
    heroText.style.opacity = fade.toFixed(3);
    heroText.style.transform = `translateY(${(-60 * p).toFixed(1)}px) scale(${(1 - 0.08 * p).toFixed(3)})`;
  }
}

// Deja el CD quieto en su primer cuadro y le devuelve el control al CSS.
function resetCd() {
  if (cdRaf !== null) cancelAnimationFrame(cdRaf);
  cdRaf = null;
  cdPos = null;
  cdFrames.forEach((img, i) => {
    img.style.opacity = i === 0 ? 1 : 0;
    img.style.removeProperty("transform");
  });
  ["--cd-x", "--cd-y", "--cd-scale", "--cd-bob"].forEach((v) => cdStage.style.removeProperty(v));
  heroVisual.style.removeProperty("--cd-aux");
  ["opacity", "transform", "transition"].forEach((v) => heroText.style.removeProperty(v));
}

function stepCd() {
  const target = cdTarget();
  cdPos += (target - cdPos) * CD_EASE;
  if (Math.abs(target - cdPos) < 0.0005) {
    cdPos = target;
    cdRaf = null;
  } else {
    cdRaf = requestAnimationFrame(stepCd);
  }
  renderCd(cdPos);
}

function measureCd() {
  // El escenario se mete debajo del header, así que el CSS necesita su alto real.
  const header = document.querySelector(".site-header");
  document.documentElement.style.setProperty("--hdr", `${header.offsetHeight}px`);
  if (!stagesOn()) {
    // Sin escenario (sin movimiento) el CD se queda quieto en su primer cuadro.
    resetCd();
    return;
  }
  cdScrollStart = heroStage.getBoundingClientRect().top + window.scrollY;
  // Recorrido útil: el alto del escenario menos la pantalla fija, dejando un tramo
  // final (CD_HOLD) en el que el CD ya está a pantalla completa.
  const travel = heroStage.offsetHeight - heroSticky.offsetHeight;
  cdScrollEnd = Math.max(1, travel * (1 - CD_HOLD));
  if (cdPos === null) {
    cdPos = cdTarget();
    renderCd(cdPos);
  } else {
    requestCd();
  }
}

function requestCd() {
  if (cdPos !== null && cdRaf === null) cdRaf = requestAnimationFrame(stepCd);
}

window.addEventListener("scroll", requestCd, { passive: true });
window.addEventListener("resize", measureCd);
window.addEventListener("load", measureCd);
measureCd();

// Servicios: mismo recurso que el hero. La rejilla queda pegada a la pantalla mientras
// se recorre un tramo largo, y cuanto más se baja, más tarjetas aparecen (una por una).
// Si la rejilla no entra entera (mobile), además se desliza dentro de su ventana para
// que la tarjeta que está entrando quede centrada.
const srvStage = document.querySelector(".services-stage");
const srvSticky = document.querySelector(".services-sticky");
const srvViewport = document.querySelector(".services-viewport");
const srvGrid = document.querySelector(".services-grid");
const srvSlots = [...srvGrid.querySelectorAll(".service-slot")];
// Cuánto del tramo de cada tarjeta dura su aparición (menos de 1 = se solapan un poco).
const SRV_SPAN = 0.7;
// Tramo final del escenario con la rejilla ya completa, antes de que se despegue.
const SRV_HOLD = 0.15;
let srvTop = 0;
let srvTravel = 1;
let srvCenters = [];
let srvGridH = 0;
let srvPanelH = 0;
let srvRaf = null;
let srvStaged = false;

function renderSrv() {
  // Progreso del escenario leído de la posición de la caja pegajosa: 0 al llegar, 1 al final.
  const p = clamp01((srvTop - srvStage.getBoundingClientRect().top) / srvTravel);
  const step = 1 / srvSlots.length;
  srvSlots.forEach((slot, i) => {
    slot.style.setProperty("--t", smoothstep(i * step, (i + SRV_SPAN) * step, p).toFixed(3));
  });

  let shift;
  if (srvGridH <= srvPanelH) {
    // Entra entera: queda centrada en la ventana y no se mueve.
    shift = (srvPanelH - srvGridH) / 2;
  } else {
    // No entra: la rejilla se desliza para centrar la tarjeta que está apareciendo.
    const pos = Math.min(srvSlots.length - 1, Math.max(0, p / step - SRV_SPAN / 2));
    const from = srvCenters[Math.floor(pos)];
    const to = srvCenters[Math.min(srvSlots.length - 1, Math.floor(pos) + 1)];
    const center = from + (to - from) * (pos - Math.floor(pos));
    shift = Math.min(0, Math.max(srvPanelH - srvGridH, srvPanelH / 2 - center));
  }
  srvGrid.style.transform = `translateY(${shift.toFixed(1)}px)`;
}

function requestSrv() {
  if (!srvStaged || srvRaf !== null) return;
  srvRaf = requestAnimationFrame(() => {
    srvRaf = null;
    renderSrv();
  });
}

function measureSrv() {
  srvStaged = stagesOn();
  srvGrid.classList.toggle("is-staged", srvStaged);
  if (!srvStaged) {
    // Sin escenario (sin movimiento) mandan las apariciones sueltas de .reveal.
    srvSlots.forEach((slot) => slot.style.removeProperty("--t"));
    srvGrid.style.removeProperty("transform");
    srvViewport.classList.remove("is-windowed");
    return;
  }
  srvTop = parseFloat(getComputedStyle(srvSticky).top) || 0;
  srvTravel = Math.max(1, (srvStage.offsetHeight - srvSticky.offsetHeight) * (1 - SRV_HOLD));
  srvPanelH = srvViewport.clientHeight;
  // Alto real de la rejilla: con el transform puesto, offsetHeight sigue siendo el de layout.
  srvGridH = srvGrid.offsetHeight;
  srvCenters = srvSlots.map((slot) => slot.offsetTop - srvGrid.offsetTop + slot.offsetHeight / 2);
  srvViewport.classList.toggle("is-windowed", srvGridH > srvPanelH);
  renderSrv();
}

window.addEventListener("scroll", requestSrv, { passive: true });
window.addEventListener("resize", measureSrv);
window.addEventListener("load", measureSrv);
measureSrv();

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const text = encodeURIComponent(
    `Hola, soy ${data.get("name")} (${data.get("email")}).\n\n${data.get("message")}`
  );
  const link = document.createElement("a");
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  link.target = "_blank";
  link.rel = "noopener";
  link.click();
});

document.getElementById("year").textContent = new Date().getFullYear();
