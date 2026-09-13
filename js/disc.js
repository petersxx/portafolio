import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const MODEL_URL = "assets/models/disco.glb";
const RADIANS_PER_PX = 0.006;

const visual = document.querySelector(".hero-visual");
const canvas = document.getElementById("disc");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fail(err) {
  if (err) console.error(err);
  canvas.remove();
}

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    fail(err);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 5);

  const pivot = new THREE.Group();
  scene.add(pivot);

  const spot = new THREE.SpotLight(0xffffff, 120, 20, Math.PI / 7, 0.5, 2);
  spot.position.set(-2.2, 2.8, 3.2);
  spot.target = pivot;
  scene.add(spot);

  const rim = new THREE.DirectionalLight(0x6f9bff, 2.2);
  rim.position.set(3, -1, -2);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x0a0f1d, 0.35));

  function resize() {
    const { width, height } = visual.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(visual);

  let rotY = window.scrollY * RADIANS_PER_PX;
  let visible = true;
  let rafId = null;
  const clock = new THREE.Clock();

  function frame() {
    const target = window.scrollY * RADIANS_PER_PX;
    rotY += (target - rotY) * (reduceMotion ? 1 : 0.08);
    // Tilted up toward the spotlight so each half turn sweeps the mirror through the light's reflection.
    pivot.rotation.set(-0.3, rotY - 0.1, 0);
    if (!reduceMotion) pivot.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.06;
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId === null && visible && !document.hidden) frame();
  }

  function stop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(visual);

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(box.getCenter(new THREE.Vector3()));
      pivot.scale.setScalar(2 / Math.max(size.x, size.y));

      model.traverse((obj) => {
        if (!obj.isMesh) return;
        const src = obj.material;
        // The source texture marks the CD as non-metallic; force a mirror finish so it catches the spotlight.
        obj.material = new THREE.MeshPhysicalMaterial({
          map: src.map,
          normalMap: src.normalMap,
          roughnessMap: src.roughnessMap,
          metalness: 0.9,
          roughness: 0.35,
          iridescence: 1,
          iridescenceIOR: 1.4,
          iridescenceThicknessRange: [150, 550],
          side: THREE.DoubleSide,
        });
        src.dispose();
      });

      pivot.add(model);
      visual.classList.add("disc-ready");
      start();
    },
    undefined,
    fail
  );
}

init();
