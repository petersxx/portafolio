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
  const link = document.createElement("a");
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  link.target = "_blank";
  link.rel = "noopener";
  link.click();
});

const track = document.getElementById("carouselTrack");
const carousel = track.parentElement;
const dotsWrap = document.getElementById("carouselDots");
const prevBtn = document.getElementById("carouselPrev");
const nextBtn = document.getElementById("carouselNext");
const slides = [...track.children];
const slideCount = slides.length;
let activeIndex = slideCount;
let autoplayStopped = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Infinite loop: a cloned set sits on each side; when scrolling settles on a clone we jump invisibly to its original.
function makeClone(slide) {
  const clone = slide.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  clone.inert = true;
  return clone;
}
track.prepend(...slides.map(makeClone));
track.append(...slides.map(makeClone));

const stopAutoplay = () => {
  autoplayStopped = true;
};

function carouselStep() {
  return slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
}

function currentIndex() {
  return Math.round(track.scrollLeft / carouselStep());
}

function jumpTo(index) {
  track.scrollTo({ left: index * carouselStep(), behavior: "instant" });
}

function goTo(index) {
  track.scrollTo({ left: index * carouselStep() });
}

function recenter() {
  const index = currentIndex();
  if (index < slideCount) jumpTo(index + slideCount);
  else if (index >= slideCount * 2) jumpTo(index - slideCount);
}

const dots = slides.map((_, i) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "carousel-dot";
  dot.setAttribute("aria-label", `Ir al servicio ${i + 1} de ${slideCount}`);
  dot.addEventListener("click", () => {
    stopAutoplay();
    goTo(slideCount + i);
  });
  return dot;
});
dotsWrap.append(...dots);

function updateDots() {
  activeIndex = currentIndex();
  dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === activeIndex % slideCount)));
}

prevBtn.addEventListener("click", () => {
  stopAutoplay();
  goTo(currentIndex() - 1);
});
nextBtn.addEventListener("click", () => {
  stopAutoplay();
  goTo(currentIndex() + 1);
});

track.addEventListener("pointerdown", stopAutoplay);
track.addEventListener("keydown", stopAutoplay);
track.addEventListener(
  "wheel",
  (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) stopAutoplay();
  },
  { passive: true }
);
track.addEventListener("scroll", updateDots, { passive: true });
if ("onscrollend" in window) {
  track.addEventListener("scrollend", recenter);
} else {
  let settleTimer;
  track.addEventListener(
    "scroll",
    () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(recenter, 150);
    },
    { passive: true }
  );
}
window.addEventListener("resize", () => jumpTo(activeIndex));
jumpTo(slideCount);
updateDots();

setInterval(() => {
  if (autoplayStopped || document.hidden || carousel.matches(":hover, :focus-within")) return;
  goTo(currentIndex() + 1);
}, 5000);

document.getElementById("year").textContent = new Date().getFullYear();
