import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/PointerLockControls.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/webxr/ARButton.js";

/* ═══════════════════════════════════════════════════════════════
   PATEL MANSION — Accurate G+1 3D Model
   Plot: 30 ft wide × 60 ft deep  |  1 THREE unit = 1 foot
   Axes: x: -15 (West) → +15 (East)  |  z: -30 (Front/North) → +30 (Rear/South)
   Ground floor rooms from SVG floor-plan proportions (SVG 900×1400 → 30×60 ft)
═══════════════════════════════════════════════════════════════ */

const GOLD     = 0xd4af37;
const WALL_H   = 10;                    // floor-to-ceiling height (ft)
const SLAB_T   = 0.5;                   // concrete slab thickness (ft)
const F1_BASE  = WALL_H + SLAB_T;       // first-floor base y = 10.5
const ROOF_BASE = F1_BASE + WALL_H;     // roof base y = 20.5

// ── Material factory ─────────────────────────────────────────────
function mat(hex, rough = 0.8, metal = 0, alpha = 1) {
  const m = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal });
  if (alpha < 1) { m.transparent = true; m.opacity = alpha; }
  return m;
}

const MATS = {
  parking : mat(0x607080),
  kitchen : mat(0xbf8850),
  hall    : mat(0xd4a844),
  bath    : mat(0x3d7fa0),
  master  : mat(0x5a8a9c),
  bedroom : mat(0x6a8aaa),
  puja    : mat(0xc8943a),
  store   : mat(0x787870),
  stairs  : mat(0xa08850),
  terrace : mat(0xc0b898),
  extWall : mat(0xd8ceaa, 0.85),
  intWall : mat(0xe8dfc8, 0.85, 0, 0.35),
  slab    : mat(0xd0c8b8, 0.9),
  roof    : mat(0x888278, 0.9),
  railing : mat(GOLD, 0.35, 0.55),
  solar   : mat(0x1a3070, 0.3, 0.4),
  window  : mat(0x8bc8f0, 0.2, 0.1, 0.55),
  door    : mat(0x7a5c2e, 0.7),
  pillar  : mat(GOLD, 0.35, 0.55),
  ground  : mat(0x4a5f2a, 0.95),
};

// ── Ground floor rooms ───────────────────────────────────────────
// Derived from SVG proportions: SVG 900px = 30 ft, SVG 1400px = 60 ft
// 3D x = (svg_x – 50) / 900 × 30 – 15  |  3D z = (svg_y – 50) / 1400 × 60 – 30
const GF_ROOMS = [
  { label: "Parking",      sub: "15×20 ft",  cx: -8.33, cz: -23.57, w: 13.33, d: 12.86, key: "parking" },
  { label: "Kitchen",      sub: "10×12 ft",  cx:  8.33, cz: -24.64, w: 13.33, d: 10.71, key: "kitchen" },
  { label: "Family Hall",  sub: "15×20 ft",  cx:  0,    cz:  -8.57, w: 30,    d: 17.14, key: "hall"    },
  { label: "Common Bath",  sub: "6×5 ft",    cx: -11.67,cz:   3.21, w:  6.67, d:  6.43, key: "bath"    },
  { label: "Master Bed",   sub: "14×14 ft",  cx:  8.33, cz:   6.43, w: 13.33, d: 12.86, key: "master"  },
  { label: "Store / Open", sub: "10×14 ft",  cx: -5,    cz:  13,    w: 20,    d: 14,    key: "store"   },
  { label: "Children Bed", sub: "12×12 ft",  cx: -7.5,  cz:  23.57, w: 15,    d: 12.86, key: "bedroom" },
  { label: "Wash Area",    sub: "",          cx:  8.33, cz:  19.29, w: 13.33, d:  4.29, key: "bath"    },
  { label: "Staircase",    sub: "10×10 ft",  cx:  5,    cz:  25.71, w: 20,    d:  8.57, key: "stairs"  },
];

// ── First floor rooms ────────────────────────────────────────────
const FF_ROOMS = [
  { label: "Bedroom 2",    sub: "12×12 ft",  cx: -8.5,  cz: -22,    w: 13,   d: 12,    key: "bedroom" },
  { label: "Guest Room",   sub: "12×10 ft",  cx:  8.5,  cz: -22,    w: 13,   d: 12,    key: "bedroom" },
  { label: "Master Bath",  sub: "10×4 ft",   cx: -13,   cz:  -3,    w:  4,   d: 10,    key: "bath"    },
  { label: "Bath 2",       sub: "10×4 ft",   cx:   0,   cz:  -3,    w:  4,   d: 10,    key: "bath"    },
  { label: "Guest Bath",   sub: "10×5 ft",   cx:  11,   cz:  -3,    w:  8,   d: 10,    key: "bath"    },
  { label: "Puja Room",    sub: "10×5 ft",   cx: -10,   cz:   8,    w: 10,   d:  5,    key: "puja"    },
  { label: "Staircase",    sub: "",          cx:   5,   cz:  20,    w: 10,   d: 10,    key: "stairs"  },
];

// ── Helpers ──────────────────────────────────────────────────────
function addBox(scene, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

function makeLabel(line1, line2 = "") {
  const W = 256, H = line2 ? 88 : 56;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  if (ctx.roundRect) {
    ctx.beginPath(); ctx.roundRect(2, 2, W - 4, H - 4, 8); ctx.fill();
  } else {
    ctx.fillRect(2, 2, W - 4, H - 4);
  }
  ctx.textAlign = "center";
  if (line2) {
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#f0d58a";
    ctx.fillText(line1, W / 2, 32);
    ctx.font = "17px Arial";
    ctx.fillStyle = "#cbbf9c";
    ctx.fillText(line2, W / 2, 62);
  } else {
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#f0d58a";
    ctx.fillText(line1, W / 2, H / 2 + 7);
  }
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(cv),
    depthTest: false,
  }));
  spr.scale.set(W / 40, H / 40, 1);
  return spr;
}

function addLabel(scene, line1, line2, x, y, z) {
  const lbl = makeLabel(line1, line2);
  lbl.position.set(x, y, z);
  scene.add(lbl);
}

// ── Core house builder ───────────────────────────────────────────
function buildHouseMesh(scene, { labels = true, solidWalls = false } = {}) {
  const wallMat = solidWalls ? MATS.extWall : MATS.intWall;
  const slabY   = SLAB_T / 2;
  const f1SlabY = WALL_H + SLAB_T / 2;
  const gfWallY = SLAB_T + WALL_H / 2;
  const ffWallY = F1_BASE + WALL_H / 2;

  // ── Terrain ───────────────────────────────────────────────────
  addBox(scene, 70, 0.2, 100, MATS.ground, 0, -0.1, 0);

  // ── Ground floor slab ─────────────────────────────────────────
  addBox(scene, 30, SLAB_T, 60, MATS.slab, 0, slabY, 0);

  // ── Ground floor room plates (colored floors) ─────────────────
  const gfFloorY = SLAB_T + 0.05;
  GF_ROOMS.forEach((r) => {
    addBox(scene, r.w - 0.15, 0.1, r.d - 0.15, MATS[r.key], r.cx, gfFloorY, r.cz);
    if (labels) addLabel(scene, r.label, r.sub, r.cx, gfFloorY + 5, r.cz);
  });

  // ── Ground floor exterior walls ───────────────────────────────
  // Front wall (z=-30): split around central 6 ft entrance
  addBox(scene, 12,    WALL_H, 0.5, MATS.extWall, -9,   gfWallY, -30);    // left of door
  addBox(scene, 12,    WALL_H, 0.5, MATS.extWall,  9,   gfWallY, -30);    // right of door
  addBox(scene, 6,     2,      0.5, MATS.extWall,  0,   SLAB_T + WALL_H - 1, -30); // door top beam
  addBox(scene, 6,     8,      0.4, MATS.door,     0,   SLAB_T + 4,      -29.8); // teak entrance door
  // Gold entrance pillars
  addBox(scene, 0.6, WALL_H + 2.5, 0.6, MATS.pillar, -3.2, (WALL_H + 2.5) / 2, -29.7);
  addBox(scene, 0.6, WALL_H + 2.5, 0.6, MATS.pillar,  3.2, (WALL_H + 2.5) / 2, -29.7);
  // Entrance canopy
  addBox(scene, 9, 0.4, 2.5, MATS.slab, 0, WALL_H + 2.3, -31);

  // Back wall (z=+30)
  addBox(scene, 30, WALL_H, 0.5, MATS.extWall, 0, gfWallY, 30);
  // Left wall (x=-15)
  addBox(scene, 0.5, WALL_H, 60, MATS.extWall, -15, gfWallY, 0);
  // Right wall (x=+15): with UPVC window band near Hall level (z=-8)
  addBox(scene, 0.5, WALL_H, 22,   MATS.extWall, 15, gfWallY, -19);   // front solid
  addBox(scene, 0.5, 2.5,    18,   MATS.extWall, 15, SLAB_T + WALL_H - 1.25, -2); // above window
  addBox(scene, 0.5, 2,      18,   MATS.extWall, 15, SLAB_T + 1, -2);             // below window sill
  addBox(scene, 0.5, 5.5,    18,   MATS.window,  15, SLAB_T + 4.75, -2);          // Golden Oak UPVC window
  addBox(scene, 0.5, WALL_H, 20,   MATS.extWall, 15, gfWallY, 20);    // rear solid

  // Parking side window on front-left wall
  addBox(scene, 5, 3.5, 0.1, MATS.window, -9, SLAB_T + 5, -30.1);

  // ── Internal ground floor walls (thin, semi-transparent) ──────
  // Hall / Parking+Kitchen divider (z = -17)
  addBox(scene, 30, WALL_H, 0.5, wallMat, 0, gfWallY, -17.14);
  // East–West divider between Common Bath and Master Bed corridor
  addBox(scene, 10, WALL_H, 0.5, wallMat, -10, gfWallY, 0);
  // Divider separating kitchen from entrance gap
  addBox(scene, 0.5, WALL_H, 11, wallMat, 1.67, gfWallY, -24);
  // Master Bed / Wash Area divider
  addBox(scene, 14, WALL_H, 0.5, wallMat, 8, gfWallY, 13);
  // Staircase back wall
  addBox(scene, 20, WALL_H, 0.5, wallMat, 5, gfWallY, 29.5);

  // ── Inter-floor slab (ceiling GF / floor FF) ──────────────────
  addBox(scene, 30, SLAB_T, 60, MATS.slab, 0, f1SlabY, 0);

  // ── First floor room plates ───────────────────────────────────
  const ffFloorY = F1_BASE + SLAB_T + 0.05;
  FF_ROOMS.forEach((r) => {
    addBox(scene, r.w - 0.15, 0.1, r.d - 0.15, MATS[r.key], r.cx, ffFloorY, r.cz);
    if (labels) addLabel(scene, r.label, r.sub, r.cx, ffFloorY + 5, r.cz);
  });

  // First floor terrace plate (rear 30×22 ft open terrace)
  addBox(scene, 29.5, 0.1, 21.5, MATS.terrace, 0, ffFloorY, 19.75);
  if (labels) addLabel(scene, "Terrace", "Open to Sky", 0, ffFloorY + 2, 19.75);

  // ── First floor exterior walls (only built front section ~35 ft deep) ──
  // Front wall (z=-30)
  addBox(scene, 12, WALL_H, 0.5, MATS.extWall, -9,  ffWallY, -30);
  addBox(scene, 12, WALL_H, 0.5, MATS.extWall,  9,  ffWallY, -30);
  addBox(scene, 6,  WALL_H, 0.5, MATS.extWall,  0,  ffWallY, -30); // closed front on FF
  // Balcony glass railing on FF front (replaces solid door)
  addBox(scene, 6,  1.2, 0.1, MATS.railing,  0, F1_BASE + SLAB_T + 1.2, -29.7);
  // Left wall FF (z: -30 to +5)
  addBox(scene, 0.5, WALL_H, 35, MATS.extWall, -15, ffWallY, -12.5);
  // Right wall FF (z: -30 to +5)
  addBox(scene, 0.5, WALL_H, 35, MATS.extWall,  15, ffWallY, -12.5);
  // Divider between FF rooms and terrace (z=+5)
  addBox(scene, 30, WALL_H, 0.5, MATS.extWall, 0, ffWallY, 5);

  // ── Terrace railings (gold) ────────────────────────────────────
  const terraceFloorY = F1_BASE + SLAB_T + 0.05;
  addBox(scene, 30,  1.2, 0.2, MATS.railing,  0,  terraceFloorY + 0.9, 30);     // rear edge
  addBox(scene, 0.2, 1.2, 22,  MATS.railing, -15, terraceFloorY + 0.9, 19.75);  // left edge
  addBox(scene, 0.2, 1.2, 22,  MATS.railing,  15, terraceFloorY + 0.9, 19.75);  // right edge
  addBox(scene, 30,  1.2, 0.2, MATS.railing,  0,  terraceFloorY + 0.9, 8.75);   // front terrace edge

  // ── Roof slab (over built portion only: 30×35 ft) ─────────────
  addBox(scene, 30, SLAB_T, 35, MATS.roof, 0, ROOF_BASE, -12.5);

  // Roof parapet
  addBox(scene, 30, 1.5, 0.2, MATS.extWall, 0,  ROOF_BASE + 0.75, -30);
  addBox(scene, 0.2, 1.5, 35, MATS.extWall, -15, ROOF_BASE + 0.75, -12.5);
  addBox(scene, 0.2, 1.5, 35, MATS.extWall,  15, ROOF_BASE + 0.75, -12.5);

  // Solar panels (3kW Waaree, 6 panels)
  const panelY = ROOF_BASE + 0.4;
  const tiltZ  = 0.3;
  for (let i = 0; i < 3; i++) {
    addBox(scene, 4.5, 0.05, 2, MATS.solar, -8 + i * 8, panelY + tiltZ, -28);
    addBox(scene, 4.5, 0.05, 2, MATS.solar, -8 + i * 8, panelY + tiltZ, -24);
  }

  // ── Exterior stone cladding accent bands ─────────────────────
  const bandMat = mat(0x7a7068, 0.9);
  addBox(scene, 30.2, 0.8, 0.3, bandMat, 0, F1_BASE + 0.4, -30.2);  // FF base band
  addBox(scene, 30.2, 0.8, 0.3, bandMat, 0, SLAB_T  + 0.4, -30.2);  // GF base band
}

// ── createRenderer ────────────────────────────────────────────────
function createRenderer(host, alpha = false) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  const w = host.clientWidth  || host.offsetWidth  || 600;
  const h = host.clientHeight || host.offsetHeight || 360;
  renderer.setSize(w, h);
  host.appendChild(renderer.domElement);
  return renderer;
}

// ── addLighting ───────────────────────────────────────────────────
function addLighting(scene, sunIntensity = 1.2) {
  const hemi = new THREE.HemisphereLight(0xfff5e0, 0x3a2c0e, 0.9);
  const sun  = new THREE.DirectionalLight(0xfffaea, sunIntensity);
  sun.position.set(40, 60, 20);
  sun.castShadow = true;
  scene.add(hemi, sun);
}

// ═══════════════════════════════════════════════════════════════════
//  EXPORTED FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/** Orbit-controls overview 3D model — used on main dashboard */
export function renderHouseModel(host) {
  host.innerHTML = "";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0c10);

  const w = host.clientWidth  || 600;
  const h = host.clientHeight || 360;
  const camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 600);
  camera.position.set(68, 50, 68);

  const renderer = createRenderer(host);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 20;
  controls.maxDistance = 200;

  addLighting(scene);
  buildHouseMesh(scene, { labels: true, solidWalls: false });

  const grid = new THREE.GridHelper(100, 20, GOLD, 0x3d3215);
  scene.add(grid);

  (function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();

  window.addEventListener("resize", () => {
    const nw = host.clientWidth || 600, nh = host.clientHeight || 360;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
}

/** Single-room 3D preview — used on space-detail pages */
export function renderRoomModel(host, label, widthFeet, depthFeet) {
  host.innerHTML = "";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0c10);

  const w = host.clientWidth  || 600;
  const h = host.clientHeight || 360;
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
  camera.position.set(widthFeet * 1.3, widthFeet * 0.9, depthFeet * 1.4);

  const renderer = createRenderer(host);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const key  = new THREE.DirectionalLight(0xfff7e3, 1.2);
  key.position.set(20, 35, 20);
  const fill = new THREE.AmbientLight(0x9c8450, 0.6);
  scene.add(key, fill);

  // Floor
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xa88a45, roughness: 0.75 });
  addBox(scene, widthFeet, 0.6, depthFeet, floorMat, 0, -0.3, 0);

  // Semi-transparent walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe8dfc8, transparent: true, opacity: 0.88 });
  const wH = 9.5;
  [
    [widthFeet, wH, 0.5,           0,            wH / 2, -depthFeet / 2],
    [widthFeet, wH, 0.5,           0,            wH / 2,  depthFeet / 2],
    [0.5,       wH, depthFeet, -widthFeet / 2,   wH / 2,  0            ],
    [0.5,       wH, depthFeet,  widthFeet / 2,   wH / 2,  0            ],
  ].forEach(([bw, bh, bd, bx, by, bz]) => {
    addBox(scene, bw, bh, bd, wallMat, bx, by, bz);
  });

  // Gold name-plate bar
  const barW = Math.max(4, widthFeet * 0.5);
  addBox(scene, barW, 0.4, 0.4, mat(GOLD, 0.35, 0.6), 0, wH + 0.2, -depthFeet / 2);

  // Label sprite inside room
  const lbl = makeLabel(label, `${widthFeet} ft × ${depthFeet} ft`);
  lbl.position.set(0, wH / 2, 0);
  scene.add(lbl);

  const grid = new THREE.GridHelper(Math.max(widthFeet, depthFeet) * 2.5, 14, GOLD, 0x3d3215);
  scene.add(grid);

  (function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();

  window.addEventListener("resize", () => {
    const nw = host.clientWidth || 600, nh = host.clientHeight || 360;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
}

/** First-person walkthrough — used on 3d-home.html */
export function mountWalkthrough(host, lockButton, statusEl) {
  host.innerHTML = "";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111014);
  scene.fog = new THREE.Fog(0x111014, 40, 140);

  const w = host.clientWidth  || 600;
  const h = host.clientHeight || 420;
  const camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 300);
  // Start at entrance, facing inward (positive z direction)
  camera.position.set(0, 6, -25);

  const renderer = createRenderer(host);
  const controls = new PointerLockControls(camera, renderer.domElement);

  addLighting(scene, 1.0);
  // Ground plane
  addBox(scene, 100, 0.2, 120, MATS.ground, 0, -0.1, 0);
  buildHouseMesh(scene, { labels: true, solidWalls: true });

  let fwd = false, bwd = false, left = false, right = false;

  if (lockButton) {
    lockButton.addEventListener("click", () => {
      controls.lock();
    });
  }

  controls.addEventListener("lock", () => {
    if (statusEl) statusEl.textContent = "Walkthrough active — W/A/S/D to move, mouse to look, Esc to exit";
    if (lockButton) lockButton.textContent = "Walkthrough Active (Esc to exit)";
  });
  controls.addEventListener("unlock", () => {
    if (statusEl) statusEl.textContent = 'Click \u201cEnable Walkthrough\u201d then click inside the viewport.';
    if (lockButton) lockButton.textContent = "Enable Walkthrough";
    fwd = bwd = left = right = false;
  });

  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "KeyW": case "ArrowUp":    fwd   = true; break;
      case "KeyS": case "ArrowDown":  bwd   = true; break;
      case "KeyA": case "ArrowLeft":  left  = true; break;
      case "KeyD": case "ArrowRight": right = true; break;
    }
  });
  document.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "KeyW": case "ArrowUp":    fwd   = false; break;
      case "KeyS": case "ArrowDown":  bwd   = false; break;
      case "KeyA": case "ArrowLeft":  left  = false; break;
      case "KeyD": case "ArrowRight": right = false; break;
    }
  });

  const speed = 0.22;
  (function animate() {
    if (controls.isLocked) {
      if (fwd)   controls.moveForward(speed);
      if (bwd)   controls.moveForward(-speed);
      if (left)  controls.moveRight(-speed);
      if (right) controls.moveRight(speed);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();

  window.addEventListener("resize", () => {
    const nw = host.clientWidth || 600, nh = host.clientHeight || 420;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
}

/** AR model — used on 3d-home.html */
export function mountARHouse(host, buttonHost) {
  host.innerHTML = "";
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, host.clientWidth / host.clientHeight || 1.6, 0.01, 100);
  const renderer = createRenderer(host, true);
  renderer.xr.enabled = true;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x404040, 1.4);
  scene.add(hemi);

  // Scaled house model: 0.022 scale → 30 ft → ~0.66 m wide, 60 ft → ~1.32 m deep
  const SCALE = 0.022;
  const group = new THREE.Group();
  group.scale.setScalar(SCALE);
  group.position.set(0, 0, -1.5);

  // Ground slab
  const slabAR = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 60), mat(0xd0c8b8, 0.9));
  group.add(slabAR);

  // GF rooms
  GF_ROOMS.forEach((r) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(r.w, 0.15, r.d), MATS[r.key]);
    mesh.position.set(r.cx, 0.6, r.cz);
    group.add(mesh);
  });

  // GF outer walls (solid, simplified)
  const ewAR = mat(0xd8ceaa, 0.85);
  const wallsAR = [
    [30, WALL_H, 0.5, 0,   SLAB_T + WALL_H / 2, -30],
    [30, WALL_H, 0.5, 0,   SLAB_T + WALL_H / 2,  30],
    [0.5, WALL_H, 60, -15, SLAB_T + WALL_H / 2,   0],
    [0.5, WALL_H, 60,  15, SLAB_T + WALL_H / 2,   0],
  ];
  wallsAR.forEach(([bw, bh, bd, bx, by, bz]) => {
    const m2 = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), ewAR);
    m2.position.set(bx, by, bz);
    group.add(m2);
  });

  // Inter-floor slab
  const slab2AR = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 60), mat(0xd0c8b8, 0.9));
  slab2AR.position.set(0, WALL_H + 0.25, 0);
  group.add(slab2AR);

  // FF rooms
  FF_ROOMS.forEach((r) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(r.w, 0.15, r.d), MATS[r.key]);
    mesh.position.set(r.cx, F1_BASE + 0.65, r.cz);
    group.add(mesh);
  });

  // Terrace
  const terrAR = new THREE.Mesh(new THREE.BoxGeometry(29.5, 0.15, 21.5), MATS.terrace);
  terrAR.position.set(0, F1_BASE + 0.65, 19.75);
  group.add(terrAR);

  // Roof
  const roofAR = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 35), MATS.roof);
  roofAR.position.set(0, ROOF_BASE, -12.5);
  group.add(roofAR);

  // Railing
  const railAR = new THREE.Mesh(new THREE.BoxGeometry(30, 1.2, 0.2), MATS.railing);
  railAR.position.set(0, F1_BASE + SLAB_T + 0.9, 30);
  group.add(railAR);

  scene.add(group);

  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: [],
    optionalFeatures: ["dom-overlay", "hit-test"],
    domOverlay: { root: document.body },
  });
  buttonHost.appendChild(arButton);

  renderer.setAnimationLoop(() => {
    group.rotation.y += 0.004;
    renderer.render(scene, camera);
  });

  return { renderer, group };
}
