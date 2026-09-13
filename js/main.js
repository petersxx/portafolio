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

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const text = encodeURIComponent(
    `Hola, soy ${data.get("name")} (${data.get("email")}).\n\n${data.get("message")}`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener");
});

document.getElementById("year").textContent = new Date().getFullYear();
