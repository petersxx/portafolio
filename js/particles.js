(() => {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LINK_DIST = 130;
  const MOUSE_DIST = 170;

  let particles = [];
  let width = 0;
  let height = 0;
  let color = "124, 124, 255";
  let rafId = null;
  const mouse = { x: null, y: null };

  function readColor() {
    const hex = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    const m = hex.match(/^#([0-9a-f]{6})$/i);
    if (m) {
      const n = parseInt(m[1], 16);
      color = `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(100, Math.floor((width * height) / 14000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 1.8 + 1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      if (!reduceMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.7)`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = `rgba(${color}, ${0.25 * (1 - dist / LINK_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      if (mouse.x !== null) {
        const dist = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dist < MOUSE_DIST) {
          ctx.strokeStyle = `rgba(${color}, ${0.5 * (1 - dist / MOUSE_DIST)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    if (!reduceMotion) rafId = requestAnimationFrame(draw);
  }

  function start() {
    if (rafId === null) draw();
  }

  function stop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) draw();
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (reduceMotion) draw();
  });

  document.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  document.addEventListener("visibilitychange", () => {
    if (reduceMotion) return;
    document.hidden ? stop() : start();
  });

  new MutationObserver(() => {
    readColor();
    if (reduceMotion) draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  readColor();
  resize();
  start();
})();
