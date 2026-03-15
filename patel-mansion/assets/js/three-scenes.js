import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/controls/PointerLockControls.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/webxr/ARButton.js";

const GOLD = 0xd4af37;

function createRenderer(host, alpha = false) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(host.clientWidth, host.clientHeight);
  host.appendChild(renderer.domElement);
  return renderer;
}

function buildHouseMesh(scene) {
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x9f8442, roughness: 0.8, metalness: 0.2 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe5dec8, roughness: 0.6 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.35, metalness: 0.55 });

  const baseFloor = new THREE.Mesh(new THREE.BoxGeometry(60, 1, 30), floorMaterial);
  baseFloor.position.y = -0.5;
  scene.add(baseFloor);

  const outerWalls = [
    new THREE.Mesh(new THREE.BoxGeometry(60, 10, 1), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(60, 10, 1), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(1, 10, 30), wallMaterial),
    new THREE.Mesh(new THREE.BoxGeometry(1, 10, 30), wallMaterial)
  ];

  outerWalls[0].position.set(0, 5, -14.5);
  outerWalls[1].position.set(0, 5, 14.5);
  outerWalls[2].position.set(-29.5, 5, 0);
  outerWalls[3].position.set(29.5, 5, 0);
  outerWalls.forEach((wall) => scene.add(wall));

  const internalWalls = [
    { w: 1, h: 10, d: 18, x: -10, y: 5, z: 5 },
    { w: 1, h: 10, d: 12, x: 10, y: 5, z: -6 },
    { w: 20, h: 10, d: 1, x: -10, y: 5, z: -2 },
    { w: 18, h: 10, d: 1, x: 16, y: 5, z: 4 }
  ];

  internalWalls.forEach((item) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(item.w, item.h, item.d), wallMaterial);
    wall.position.set(item.x, item.y, item.z);
    scene.add(wall);
  });

  const firstFloorPlate = new THREE.Mesh(new THREE.BoxGeometry(58, 0.6, 28), accentMaterial);
  firstFloorPlate.position.y = 10.3;
  scene.add(firstFloorPlate);

  const terraceRail = new THREE.Mesh(new THREE.BoxGeometry(42, 1.2, 0.3), accentMaterial);
  terraceRail.position.set(0, 12, -13.8);
  scene.add(terraceRail);

  const windowBand = new THREE.Mesh(new THREE.BoxGeometry(18, 2.2, 0.2), new THREE.MeshStandardMaterial({ color: 0x7f8d97 }));
  windowBand.position.set(18, 6, -14.4);
  scene.add(windowBand);
}

export function renderHouseModel(host) {
  host.innerHTML = "";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0c10);

  const camera = new THREE.PerspectiveCamera(55, host.clientWidth / host.clientHeight, 0.1, 500);
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

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
  });
}

export function renderRoomModel(host, label, widthFeet, depthFeet) {
  host.innerHTML = "";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0c10);

  const camera = new THREE.PerspectiveCamera(55, host.clientWidth / host.clientHeight, 0.1, 500);
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

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

export function mountARHouse(host, buttonHost) {
  host.innerHTML = "";
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

  const camera = new THREE.PerspectiveCamera(70, host.clientWidth / host.clientHeight, 0.1, 500);
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

  function animate() {
    velocity.x = 0;
    velocity.z = 0;
    if (moveForward) velocity.z = -0.25;
    if (moveBackward) velocity.z = 0.25;
    if (moveLeft) velocity.x = -0.25;
    if (moveRight) velocity.x = 0.25;

    controls.moveRight(velocity.x);
    controls.moveForward(velocity.z);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
  });
}
