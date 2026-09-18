(() => {
  const canvas = document.getElementById("chrome");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) {
    document.documentElement.classList.add("no-webgl");
    canvas.remove();
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Liquid chrome is smooth, so rendering below CSS resolution is invisible and keeps the GPU cool.
  // Weak GPUs step down to the lower scale, and if that is still too slow the animation freezes.
  const RENDER_SCALES = [0.66, 0.4];
  let scaleLevel = 0;
  // A frame slower than this (ms, median over a sample) counts as the GPU not keeping up.
  const SLOW_FRAME = 34;
  const SAMPLE = 90;
  let frames = [];
  let frozen = false;

  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 u_res;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_light;

    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 3; i++) {
        v += a * noise(p);
        p = m * p;
        a *= 0.5;
      }
      return v;
    }

    float field(vec2 p) {
      float t = u_time * 0.05;
      vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
      float h = fbm(p + 1.8 * q + vec2(t * 0.6, -t * 0.4));
      float blob = smoothstep(0.02, 0.3, h + 0.1 * q.x);
      return blob * (0.85 + 0.35 * h);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.y;
      vec2 p = uv * 1.2 + (u_mouse - 0.5) * 0.12;
      float e = 2.0 / u_res.y;

      float h = field(p);
      float hx = field(p + vec2(e, 0.0));
      float hy = field(p + vec2(0.0, e));
      vec3 n = normalize(vec3((h - hx) / e * 0.22, (h - hy) / e * 0.22, 1.0));

      vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
      float ey = r.y * 0.9 + r.x * 0.25 + 0.12;

      vec3 ground = mix(vec3(0.012, 0.014, 0.024), vec3(0.02, 0.09, 0.42), u_light);
      ground = mix(ground, ground * 3.0 + 0.06, smoothstep(-0.9, -0.02, ey));
      vec3 horizon = mix(vec3(0.93, 0.95, 1.0), vec3(1.0), u_light);
      vec3 skyTop = mix(vec3(0.42, 0.5, 0.68), vec3(0.45, 0.65, 1.0), u_light);
      vec3 sky = mix(horizon, skyTop, smoothstep(0.0, 0.7, ey));
      vec3 col = mix(ground, sky, smoothstep(-0.035, 0.035, ey));

      vec3 L = normalize(vec3(-0.4, 0.6, 0.7));
      col += pow(max(dot(r, L), 0.0), 80.0) * 1.2;

      float slope = smoothstep(0.1, 0.7, length(n.xy));
      vec3 irid = 0.5 + 0.5 * cos(6.2831 * (n.x * 0.8 + n.y * 0.5 + vec3(0.0, 0.33, 0.67)));
      col += (1.0 - u_light) * 0.14 * irid * slope;
      col = mix(col, col * vec3(0.8, 0.9, 1.15), (1.0 - u_light) * 0.5);

      vec3 bg = mix(vec3(0.012, 0.014, 0.026), vec3(0.93, 0.955, 0.99), u_light);
      vec2 c = gl_FragCoord.xy / u_res - 0.5;
      bg += mix(vec3(0.03, 0.05, 0.12), vec3(-0.04, -0.02, 0.0), u_light) * (1.0 - dot(c, c) * 2.0);

      float mask = smoothstep(0.0, 0.1, h);
      gl_FragColor = vec4(mix(bg, col, mask), 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (err) {
    console.error(err);
    document.documentElement.classList.add("no-webgl");
    canvas.remove();
    return;
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, "u_res");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uMouse = gl.getUniformLocation(program, "u_mouse");
  const uLight = gl.getUniformLocation(program, "u_light");

  const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let light = isLight() ? 1 : 0;
  let rafId = null;
  const t0 = performance.now();

  function resize() {
    const scale = RENDER_SCALES[scaleLevel];
    canvas.width = Math.max(1, Math.floor(window.innerWidth * scale));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function render(time) {
    const target = isLight() ? 1 : 0;
    light += (target - light) * (reduceMotion || frozen ? 1 : 0.06);
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uLight, light);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  let lastFrame = 0;

  // Watches frame times; steps the resolution down, then freezes, if the GPU can't keep up.
  function checkSpeed(now) {
    if (lastFrame) frames.push(now - lastFrame);
    lastFrame = now;
    if (frames.length < SAMPLE) return;
    const median = frames.sort((a, b) => a - b)[frames.length >> 1];
    frames = [];
    if (median <= SLOW_FRAME) return;
    if (scaleLevel < RENDER_SCALES.length - 1) {
      scaleLevel++;
      resize();
    } else {
      frozen = true;
    }
  }

  function loop(now) {
    render((performance.now() - t0) / 1000 + 20);
    checkSpeed(now);
    rafId = frozen ? null : requestAnimationFrame(loop);
  }

  function start() {
    lastFrame = 0;
    frames = [];
    if (reduceMotion || frozen) {
      render(20);
    } else if (rafId === null) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function stop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion || frozen) render(20);
  });

  // If the browser drops the GL context (GPU reset, too many tabs), fall back to the CSS background.
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    stop();
    document.documentElement.classList.add("no-webgl");
    canvas.remove();
  });

  window.addEventListener("pointermove", (e) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = 1 - e.clientY / window.innerHeight;
  });

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  // Without a running loop (reduced motion, or frozen on a slow GPU) redraw on theme changes.
  new MutationObserver(() => {
    if (reduceMotion || frozen) render(20);
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  resize();
  start();
})();
