// Lo que comparten todas las páginas: tema, menú, apariciones con el scroll y el año del footer.
// Número de WhatsApp que recibe los mensajes del formulario (con código de país, sin + ni espacios).
const WHATSAPP_NUMBER = "595991230966";

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
  } catch (e) {
    return null;
  }
}

applyTheme(getStoredTheme() || "dark");

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch (e) {}
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

function reveal(el) {
  el.classList.add("visible");
}

// Navegadores sin IntersectionObserver: todo se muestra de una.
const hasIO = "IntersectionObserver" in window;
const revealObserver = hasIO
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    )
  : null;

document.querySelectorAll(".reveal").forEach((el) => (hasIO ? revealObserver.observe(el) : reveal(el)));
// Avisa al script del <head> que las apariciones arrancaron (si no, desoculta todo).
window.revealReady = true;

document.getElementById("year").textContent = new Date().getFullYear();

// Alto real del header (cinta + navbar): el CSS lo usa para no tapar contenido.
const siteHeader = document.querySelector(".site-header");
function measureHeader() {
  root.style.setProperty("--hdr", `${siteHeader.offsetHeight}px`);
}
measureHeader();
window.addEventListener("resize", measureHeader);
window.addEventListener("load", measureHeader);

// Al abrir un link con ancla (planes.html#standard, index.html?plan=…#contacto) el salto
// inicial se pierde: el scroll suave lo corta cuando la página cambia de alto al cargar.
// Se repite una vez terminada la carga, ya sin animación.
if (location.hash) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;
      root.style.scrollBehavior = "auto";
      target.scrollIntoView();
      root.style.scrollBehavior = "";
    }, 0);
  });
}
