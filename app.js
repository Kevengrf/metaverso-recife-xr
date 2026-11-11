import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Visualizador 100% Limpo (Zero HUD / Zero Menus) — Foco exclusivo no Mapa 3D Liso & Imersão 360° (Escala 1:1)
const canvas = document.getElementById('xr-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);
scene.fog = new THREE.FogExp2(0xe2e8f0, 0.0008);

const playerRig = new THREE.Group();
playerRig.position.set(0, 0, 0);
scene.add(playerRig);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 3000);
const humanEyeHeight = 1.70; // 1.70m escala humana real 1:1
camera.position.set(0, humanEyeHeight, 0);
camera.rotation.set(0, Math.PI * 0.5, 0, 'YXZ'); // Olhando para a Caixa Cultural / Av. Rio Branco
playerRig.add(camera);

const fpvControls = new PointerLockControls(camera, document.body);
canvas.addEventListener('click', () => {
  if (!fpvControls.isLocked) fpvControls.lock();
});

// Skybox 360° Fotorrealista do Marco Zero
const texLoader = new THREE.TextureLoader();
const skyTex = texLoader.load('assets/ai_textures/skybox_marco_zero_360.jpg');
skyTex.colorSpace = THREE.SRGBColorSpace;
const skyDome = new THREE.Mesh(
  new THREE.SphereGeometry(1800, 64, 32),
  new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, depthWrite: false })
);
scene.add(skyDome);

// Iluminação Solar Limpa e Suave
const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x475569, 1.55);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.85);
sunLight.position.set(160, 280, 120);
scene.add(sunLight);

// Água do Estuário do Rio Capibaribe / Bacia do Porto (a Leste do Cais da Lingueta, X > 28m)
const waterGeo = new THREE.PlaneGeometry(3000, 3000);
waterGeo.rotateX(-Math.PI / 2);
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x0284c7,
  roughness: 0.18,
  metalness: 0.72
});
const waterMesh = new THREE.Mesh(waterGeo, waterMat);
waterMesh.position.set(0, -0.45, 0);
scene.add(waterMesh);

// Carregamento dos 4 modelos arquitetônicos 100% lisos e renderizados em 4K
const gltfLoader = new GLTFLoader();
async function loadSmoothMap() {
  const res = await fetch('assets/tiles/tiles_manifest.json');
  const manifest = await res.json();
  for (const item of manifest) {
    gltfLoader.load(item.file, (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          const map = child.material.map;
          if (map) {
            map.colorSpace = THREE.SRGBColorSpace;
            map.wrapS = item.slug.includes('rosa') ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
            map.wrapT = item.slug.includes('rosa') ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
            map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
            map.needsUpdate = true;
          }
          child.material = new THREE.MeshStandardMaterial({
            map: map,
            roughness: 0.75,
            metalness: 0.05,
            side: THREE.DoubleSide
          });
        }
      });
      scene.add(gltf.scene);
    });
  }
}
loadSmoothMap();

// Caminhada 1:1 Suave no Chão Liso (Y = 0.00m) + Modo Voo (F)
const keys = {};
let isDrone = false;
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyF') {
    isDrone = !isDrone;
    if (!isDrone) playerRig.position.y = 0;
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

const clock = new THREE.Clock();
const fwd = new THREE.Vector3();
const right = new THREE.Vector3();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const fIn = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  const sIn = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);

  if (fIn !== 0 || sIn !== 0) {
    const baseSpeed = isDrone ? 25.0 : 3.2;
    const speed = (keys.ShiftLeft || keys.ShiftRight) ? baseSpeed * 2.5 : baseSpeed;
    camera.getWorldDirection(fwd);
    if (!isDrone) fwd.y = 0;
    fwd.normalize();
    right.crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    playerRig.position.addScaledVector(fwd, fIn * speed * dt);
    playerRig.position.addScaledVector(right, sIn * speed * dt);
  }

  if (isDrone) {
    if (keys.Space || keys.KeyE) playerRig.position.y += 14 * dt;
    if (keys.KeyQ) playerRig.position.y = Math.max(0, playerRig.position.y - 14 * dt);
  } else {
    playerRig.position.y = 0.0;
  }

  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
