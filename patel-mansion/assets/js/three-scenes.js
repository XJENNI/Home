import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/PointerLockControls.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/webxr/ARButton.js";

const GOLD = 0xd4af37;
const DEFAULT_WIDTH_RATIO = 0.9;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 320;

function getSize(host) {
  const w = host.clientWidth || host.offsetWidth || Math.max(window.innerWidth * DEFAULT_WIDTH_RATIO, MIN_WIDTH);
  const h = host.clientHeight || host.offsetHeight || MIN_HEIGHT;
  return { w: Math.max(w, 100), h: Math.max(h, 100) };
}

function createRenderer(host, alpha = false) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const { w, h } = getSize(host);
  renderer.setSize(w, h);
  host.appendChild(renderer.domElement);
  return renderer;
}

function buildHouseMesh(scene) {
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x9f8442, roughness: 0.8, metalness: 0.2 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe5dec8, roughness: 0.6 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.35, metalness: 0.55 });

  // Ground floor: 30ft x 60ft footprint (scaled 1ft = 1 unit)
  // G: single open hall/parking slab
  const gFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 60), floorMaterial);
  gFloor.position.set(0, -0.25, 0);
  scene.add(gFloor);

  // Ground floor outer walls (H=10)
  const gWalls = [
    { w: 30, h: 10, d: 0.5, x: 0,    y: 5, z: -30  },   // front
    { w: 30, h: 10, d: 0.5, x: 0,    y: 5, z:  30  },   // rear
    { w: 0.5, h: 10, d: 60, x: -15,  y: 5, z: 0    },   // left
    { w: 0.5, h: 10, d: 60, x:  15,  y: 5, z: 0    }    // right
  ];
  gWalls.forEach(({ w, h, d, x, y, z }) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMaterial);
    m.position.set(x, y, z);
    scene.add(m);
  });

  // First floor slab (deck between G and 1st)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(30, 0.6, 60), accentMaterial);
  deck.position.set(0, 10.3, 0);
  scene.add(deck);

  // First floor outer walls (H=10 starting at y=10.6)
  const fBase = 10.6;
  const fH = 10;
  const fWalls = [
    { w: 30,  h: fH, d: 0.5,  x: 0,   y: fBase + fH / 2, z: -30 },
    { w: 30,  h: fH, d: 0.5,  x: 0,   y: fBase + fH / 2, z:  30 },
    { w: 0.5, h: fH, d: 60,   x: -15, y: fBase + fH / 2, z: 0   },
    { w: 0.5, h: fH, d: 60,   x:  15, y: fBase + fH / 2, z: 0   }
  ];
  fWalls.forEach(({ w, h, d, x, y, z }) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMaterial);
    m.position.set(x, y, z);
    scene.add(m);
  });

  // First floor internal walls (room dividers)
  // Layout: Family Hall(17x18) centre, Bedroom1(11x14) left-front,
  //         Bedroom2(12x13) right-front, GuestRoom(10x10) right-rear,
  //         Kitchen(10x10) left-rear, Puja/Store corner, Staircase
  const fInternal = [
    { w: 0.5, h: fH, d: 18, x: -4,   y: fBase + fH / 2, z: -12 }, // Hall left divider
    { w: 0.5, h: fH, d: 18, x:  7,   y: fBase + fH / 2, z: -12 }, // Hall right divider
    { w: 11,  h: fH, d: 0.5, x: -9.5, y: fBase + fH / 2, z: -3  }, // Hall rear wall
    { w: 11,  h: fH, d: 0.5, x:  4,  y: fBase + fH / 2, z:  3  }, // Kitchen divider
    { w: 0.5, h: fH, d: 14, x:  2,   y: fBase + fH / 2, z:  16  }, // Rear divider
  ];
  fInternal.forEach(({ w, h, d, x, y, z }) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMaterial);
    m.position.set(x, y, z);
    scene.add(m);
  });

  // Terrace railing at roof
  const terraceRail = new THREE.Mesh(new THREE.BoxGeometry(28, 1.2, 0.4), accentMaterial);
  terraceRail.position.set(0, 21.8, -29.5);
  scene.add(terraceRail);

  // Window opening hints (front face, first floor)
  const winMat = new THREE.MeshStandardMaterial({ color: 0x7f8d97, transparent: true, opacity: 0.55 });
  const wins = [
    { w: 6, h: 3, x: -6,  z: -30 },
    { w: 6, h: 3, x:  6,  z: -30 }
  ];
  wins.forEach(({ w, h, x, z }) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), winMat);
    m.position.set(x, fBase + 5, z);
    scene.add(m);
  });
}

export function renderHouseModel(host) {
  host.innerHTML = "";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0c10);

  const { w, h } = getSize(host);
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
  camera.position.set(70, 40, 70);

  const renderer = createRenderer(host);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const hemi = new THREE.HemisphereLight(0xfff5d6, 0x3a2d12, 0.9);
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(40, 60, 30);
  scene.add(hemi, key);

  buildHouseMesh(scene);

  const grid = new THREE.GridHelper(90, 18, 0xd4af37, 0x3d3215);
  scene.add(grid);

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });

  const ro = new ResizeObserver(() => {
    const { w: nw, h: nh } = getSize(host);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
  ro.observe(host);
}

export function renderRoomModel(host, label, widthFeet, depthFeet) {
  host.innerHTML = "";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0c10);

  const { w, h } = getSize(host);
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
  camera.position.set(widthFeet * 1.4, 18, depthFeet * 1.5);

  const renderer = createRenderer(host);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const key = new THREE.DirectionalLight(0xfff7e3, 1.1);
  key.position.set(20, 35, 20);
  const fill = new THREE.AmbientLight(0x9c8450, 0.55);
  scene.add(key, fill);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(widthFeet, 0.6, depthFeet),
    new THREE.MeshStandardMaterial({ color: 0xa88a45, roughness: 0.75 })
  );
  floor.position.y = -0.3;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe8dfc8, transparent: true, opacity: 0.92 });
  const wallThickness = 0.5;
  const wallHeight = 9.5;
  const walls = [
    { w: widthFeet, h: wallHeight, d: wallThickness, x: 0, y: wallHeight / 2, z: -depthFeet / 2 },
    { w: widthFeet, h: wallHeight, d: wallThickness, x: 0, y: wallHeight / 2, z: depthFeet / 2 },
    { w: wallThickness, h: wallHeight, d: depthFeet, x: -widthFeet / 2, y: wallHeight / 2, z: 0 },
    { w: wallThickness, h: wallHeight, d: depthFeet, x: widthFeet / 2, y: wallHeight / 2, z: 0 }
  ];

  walls.forEach((w) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), wallMat);
    mesh.position.set(w.x, w.y, w.z);
    scene.add(mesh);
  });

  const namePlate = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(4, widthFeet * 0.45), 0.4, 0.4),
    new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.6, roughness: 0.35 })
  );
  namePlate.position.set(0, wallHeight + 0.2, -depthFeet / 2);
  scene.add(namePlate);

  const grid = new THREE.GridHelper(Math.max(widthFeet, depthFeet) * 2.2, 14, 0xd4af37, 0x3d3215);
  scene.add(grid);

  const tag = document.createElement("div");
  tag.className = "pill";
  tag.textContent = `${label} | ${widthFeet}ft × ${depthFeet}ft`;
  host.parentElement?.insertBefore(tag, host);

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });

  const ro = new ResizeObserver(() => {
    const { w: nw, h: nh } = getSize(host);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
  ro.observe(host);
}

export function mountARHouse(host, buttonHost) {
  host.innerHTML = "";

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const hasWebXR = typeof navigator.xr !== "undefined";
  if (isIOS && !hasWebXR) {
    host.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:24px;text-align:center;color:#cbbf9c;">
      <div>
        <div style="font-size:2rem;margin-bottom:12px;">🏠</div>
        <strong style="color:#f0d58a;">AR on iPhone</strong><br>
        <span style="font-size:0.9rem;">WebXR-based AR requires Android Chrome or Samsung Internet. On iPhone, you can use the 3D Walkthrough above to explore the model. AR Quick Look (iOS native) requires a USDZ model file.</span>
      </div>
    </div>`;
    return { renderer: null };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const renderer = createRenderer(host, true);
  renderer.xr.enabled = true;

  const hemi = new THREE.HemisphereLight(0xfff1cf, 0x3d3015, 1.2);
  scene.add(hemi);

  const group = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.4), new THREE.MeshStandardMaterial({ color: 0xa78845 }));
  const mass = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.35), new THREE.MeshStandardMaterial({ color: 0xe5dec8 }));
  mass.position.y = 0.14;
  const accent = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.02), new THREE.MeshStandardMaterial({ color: GOLD }));
  accent.position.set(0.18, 0.16, -0.175);
  group.add(floor, mass, accent);
  group.position.set(0, -0.2, -1.2);
  scene.add(group);

  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"],
    optionalFeatures: ["dom-overlay"],
    domOverlay: { root: document.body }
  });
  buttonHost.appendChild(arButton);

  renderer.setAnimationLoop(() => {
    group.rotation.y += 0.003;
    renderer.render(scene, camera);
  });

  return { renderer };
}

export function mountWalkthrough(host, clickToLockButton) {
  host.innerHTML = "";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0c10);

  const { w, h } = getSize(host);
  const camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 500);
  camera.position.set(0, 5, 18);

  const renderer = createRenderer(host);
  const controls = new PointerLockControls(camera, renderer.domElement);

  const light = new THREE.HemisphereLight(0xfff0d0, 0x2f2613, 1.0);
  scene.add(light);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 45), new THREE.MeshStandardMaterial({ color: 0x7d6637 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  buildHouseMesh(scene);

  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  const velocity = new THREE.Vector3();

  clickToLockButton.addEventListener("click", () => controls.lock());

  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyW") moveForward = true;
    if (e.code === "KeyS") moveBackward = true;
    if (e.code === "KeyA") moveLeft = true;
    if (e.code === "KeyD") moveRight = true;
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "KeyW") moveForward = false;
    if (e.code === "KeyS") moveBackward = false;
    if (e.code === "KeyA") moveLeft = false;
    if (e.code === "KeyD") moveRight = false;
  });

  renderer.setAnimationLoop(() => {
    velocity.x = 0;
    velocity.z = 0;
    if (moveForward) velocity.z = -0.25;
    if (moveBackward) velocity.z = 0.25;
    if (moveLeft) velocity.x = -0.25;
    if (moveRight) velocity.x = 0.25;

    controls.moveRight(velocity.x);
    controls.moveForward(velocity.z);

    renderer.render(scene, camera);
  });

  const ro = new ResizeObserver(() => {
    const { w: nw, h: nh } = getSize(host);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
  ro.observe(host);
}
