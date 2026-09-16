// Cambiá este email por el que quieras que reciba los mensajes del formulario.
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

// Hero: los 3 cuadros del CD se van alternando con el scroll para dar sensación de giro.
const heroVisual = document.querySelector(".hero-visual");
const cdFrames = heroVisual.querySelectorAll(".cd-frames img");
const cdReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Fracción de cada tramo que dura el giro; el resto el cuadro queda quieto.
const CD_FLIP = 0.6;
// Qué tan rápido la animación alcanza al scroll (más bajo = más inercia).
const CD_EASE = 0.1;
let cdScrollEnd = 1;
let cdPos = null;
let cdRaf = null;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function cdTarget() {
  return clamp01(window.scrollY / cdScrollEnd) * (cdFrames.length - 1);
}

function renderCd(pos) {
  // Giro tipo moneda: la foto actual rota hasta quedar de canto (90°) y en ese instante
  // la reemplaza la siguiente, que completa el giro desde -90° hasta quedar de frente.
  const last = cdFrames.length - 1;
  const seg = Math.min(last - 1, Math.floor(pos));
  const angle = 180 * smoothstep((1 - CD_FLIP) / 2, (1 + CD_FLIP) / 2, pos - seg);
  const showing = angle < 90 ? seg : seg + 1;
  cdFrames.forEach((img, i) => {
    img.style.opacity = i === showing ? 1 : 0;
    if (i !== showing) return;
    const turn = i === seg ? angle : angle - 180;
    img.style.transform = cdReduceMotion ? "" : `perspective(1400px) rotateY(${turn.toFixed(2)}deg)`;
  });
}

function stepCd() {
  const target = cdTarget();
  cdPos += (target - cdPos) * CD_EASE;
  if (Math.abs(target - cdPos) < 0.001) {
    cdPos = target;
    cdRaf = null;
  } else {
    cdRaf = requestAnimationFrame(stepCd);
  }
  renderCd(cdPos);
}

function measureCd() {
  const rect = heroVisual.getBoundingClientRect();
  // La secuencia termina cuando el centro de la imagen llega al borde superior de la pantalla.
  cdScrollEnd = Math.max(1, rect.top + window.scrollY + rect.height * 0.5);
  if (cdPos === null || cdReduceMotion) {
    cdPos = cdTarget();
    renderCd(cdPos);
  } else {
    requestCd();
  }
}

function requestCd() {
  if (cdReduceMotion) {
    renderCd(cdTarget());
  } else if (cdRaf === null) {
    cdRaf = requestAnimationFrame(stepCd);
  }
}

window.addEventListener("scroll", requestCd, { passive: true });
window.addEventListener("resize", measureCd);
measureCd();

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
