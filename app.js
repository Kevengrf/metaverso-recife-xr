import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// ============================================================================
// ESTAÇÕES 1:1 NO MARCO ZERO & REC'N'PLAY (BBTS HACKATHON 24H + COMUNIDADE IV)
// ============================================================================
const STATIONS = [
  {
    id: 'marco-zero',
    key: '1',
    badge: 'PONTO 01 • MARCO ZERO (IA + 3D 1:1)',
    name: 'Praça do Marco Zero (Rosa dos Ventos)',
    shortDesc: 'Piso Cícero Dias IA 4K • Caixa Cultural & Assoc. Comercial',
    description:
      'Você está no centro da Rosa dos Ventos em escala 1:1 (1,70m de altura). O piso da Rosa dos Ventos e as fachadas históricas ao redor foram reconstruídos com IA em 4K sobre a malha fotogramétrica real.',
    pos: { x: 0.0, z: 0.0 },
    yawDeg: 90,
    color: '#facc15',
    metrics: ['Rosa dos Ventos 4K IA', 'Escala 1:1 (1.70m)', '31 Ruas Mapeadas']
  },
  {
    id: 'arena-bbts',
    key: '2',
    badge: 'PONTO 02 • HACKATHON BBTS 24H',
    name: 'Esquina Caixa Cultural & Av. Alfredo Lisboa (BBTS)',
    shortDesc: '12/11 (07h30) a 13/11 (07h30) • Imersão & Mentoria',
    description:
      'Em frente à fachada neoclássica da Caixa Cultural Recife (antiga Bolsa de Valores) reconstruída por IA. Ponto estratégico para demonstrar aos gestores da BBTS e equipes do Hackathon o poder de Gêmeos Digitais 1:1.',
    pos: { x: 26.0, z: -18.0 },
    yawDeg: -65,
    color: '#facc15',
    metrics: ['Fachada IA 4K', 'BBTS 24h', 'Mentoria VR']
  },
  {
    id: 'comunidade-iv',
    key: '3',
    badge: 'PONTO 03 • COMUNIDADE IV',
    name: 'Boulevard Av. Rio Branco & Assoc. Comercial',
    shortDesc: 'QG da Galera Tech • Casarões Históricos IA 4K',
    description:
      'Entrada do Boulevard da Avenida Rio Branco entre a Associação Comercial de Pernambuco e os casarões históricos remasterizados por IA com faixas do Rec\'n\'Play.',
    pos: { x: 48.0, z: 12.0 },
    yawDeg: -90,
    color: '#00f0ff',
    metrics: ['Av. Rio Branco', 'Comunidade IV', 'Casarões IA 4K']
  },
  {
    id: 'bom-jesus',
    key: '4',
    badge: 'PONTO 04 • CORREDOR HISTÓRICO',
    name: 'Rua do Bom Jesus, Sinagoga & Paço do Frevo',
    shortDesc: 'Casarões Coloniais Coloridos IA 4K • Praça do Arsenal',
    description:
      'Caminhe pela Rua do Bom Jesus em escala humana 1:1 passando pela Sinagoga Kahal-Zur-Israel, Embaixada dos Bonecos Gigantes até o Paço do Frevo e Praça do Arsenal.',
    pos: { x: 42.0, z: -95.0 },
    yawDeg: 0,
    color: '#f43f5e',
    metrics: ['Rua do Bom Jesus', 'Sinagoga & Paço', 'Escala 1:1']
  },
  {
    id: 'cais-do-sertao',
    key: '5',
    badge: 'PONTO 05 • PORTO DIGITAL & BB',
    name: 'Cais do Sertão, CESAR & Banco do Brasil',
    shortDesc: 'Eixo de Inovação • Cais do Apolo & Armazéns',
    description:
      'Região norte do Bairro do Recife conectando o Museu Cais do Sertão, o CESAR e o edifício do Banco do Brasil na Rua/Cais do Apolo.',
    pos: { x: 35.0, z: -220.0 },
    yawDeg: 140,
    color: '#38bdf8',
    metrics: ['Porto Digital', 'Banco do Brasil', 'Cais do Sertão']
  },
  {
    id: 'parque-esculturas',
    key: '6',
    badge: 'PONTO 06 • ARRECIFES DO PORTO',
    name: 'Parque das Esculturas (Francisco Brennand)',
    shortDesc: 'Molhe de Pedra • Vista Frontal do Marco Zero',
    description:
      'Sobre os arrecifes do Porto do Recife, olhando de frente para toda a orla do Marco Zero, Centro de Artesanato, Caixa Cultural e Associação Comercial.',
    pos: { x: -135.0, z: -15.0 },
    yawDeg: -90,
    color: '#a855f7',
    metrics: ['Vista Orla 1:1', 'Coluna de Cristal', 'Estuário Capibaribe']
  }
];

// ============================================================================
// INICIALIZAÇÃO THREE.JS + WEBXR (META QUEST 3S)
// ============================================================================
const canvas = document.getElementById('xr-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');

const vrBtn = VRButton.createButton(renderer);
vrBtn.style.position = 'static';
vrBtn.style.padding = '9px 14px';
vrBtn.style.borderRadius = '9px';
vrBtn.style.fontFamily = "'Space Grotesk', sans-serif";
vrBtn.style.fontWeight = '700';
vrBtn.style.fontSize = '12px';
vrBtn.style.background = 'rgba(0, 240, 255, 0.18)';
vrBtn.style.border = '1px solid #00f0ff';
vrBtn.style.color = '#00f0ff';
document.getElementById('vr-button-Mount').appendChild(vrBtn);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e293b);
scene.fog = new THREE.FogExp2(0xcbd5e1, 0.00075);

const playerRig = new THREE.Group();
scene.add(playerRig);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 3000);
let humanEyeHeight = 1.70;
camera.position.set(0, humanEyeHeight, 0);
playerRig.add(camera);

const fpvControls = new PointerLockControls(camera, document.body);
const crosshairEl = document.getElementById('crosshair');
const btnEnterFpv = document.getElementById('btn-enter-fpv');

btnEnterFpv.addEventListener('click', () => fpvControls.lock());
canvas.addEventListener('click', () => {
  if (!fpvControls.isLocked) fpvControls.lock();
});
fpvControls.addEventListener('lock', () => {
  crosshairEl.classList.remove('hidden');
  btnEnterFpv.textContent = 'ESC para liberar o mouse';
});
fpvControls.addEventListener('unlock', () => {
  crosshairEl.classList.add('hidden');
  btnEnterFpv.textContent = '🚶 Caminhar na Rua em 1ª Pessoa (1:1)';
});

// ============================================================================
// SKYBOX 360° RENDERIZADO POR IA + DOMO 360° STREET VIEW IA + ÁGUA
// ============================================================================
const texLoader = new THREE.TextureLoader();

const skyboxTex = texLoader.load('assets/ai_textures/skybox_marco_zero_360.jpg');
skyboxTex.colorSpace = THREE.SRGBColorSpace;
skyboxTex.mapping = THREE.EquirectangularReflectionMapping;

// Sky Dome gigante no horizonte (1800m) com o panorama 360° do Marco Zero gerado por IA
const skyGeo = new THREE.SphereGeometry(1800, 64, 32);
const skyMat = new THREE.MeshBasicMaterial({
  map: skyboxTex,
  side: THREE.BackSide,
  depthWrite: false
});
const skyDome = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyDome);

// Domo Imersivo 360° IA de Proximidade (Modo "Sala Street View IA 360°", ativável com tecla R)
const streetViewDomeGeo = new THREE.SphereGeometry(18, 64, 32);
const streetViewDomeMat = new THREE.MeshBasicMaterial({
  map: skyboxTex,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.96
});
const streetViewDome = new THREE.Mesh(streetViewDomeGeo, streetViewDomeMat);
streetViewDome.visible = false; // Começa mostrando a cidade 3D + fachadas IA; tecla R alterna para o Domo 360° IA puro!
scene.add(streetViewDome);

const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x334155, 1.45);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffedd5, 1.6);
sunLight.position.set(-180, 260, 120);
scene.add(sunLight);

const waterGeo = new THREE.PlaneGeometry(3500, 3500);
waterGeo.rotateX(-Math.PI / 2);
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x0c4a6e,
  roughness: 0.25,
  metalness: 0.6
});
const waterMesh = new THREE.Mesh(waterGeo, waterMat);
waterMesh.position.y = -15.5;
scene.add(waterMesh);

// ============================================================================
// RECONSTRUÇÃO HÍBRIDA COM IA: ROSA DOS VENTOS 4K + FACHADAS HISTÓRICAS 4K + PLACAS DE RUA
// ============================================================================
const aiEnhancementsGroup = new THREE.Group();
scene.add(aiEnhancementsGroup);

const rosaTex = texLoader.load('assets/ai_textures/rosa_dos_ventos_hd.jpg');
rosaTex.colorSpace = THREE.SRGBColorSpace;
rosaTex.anisotropy = 8;

const fachadasMarcoZeroTex = texLoader.load('assets/ai_textures/fachadas_marco_zero_hd.jpg');
fachadasMarcoZeroTex.colorSpace = THREE.SRGBColorSpace;
fachadasMarcoZeroTex.anisotropy = 8;

const fachadasColoniaisTex = texLoader.load('assets/ai_textures/fachadas_bom_jesus_rio_branco_hd.jpg');
fachadasColoniaisTex.colorSpace = THREE.SRGBColorSpace;
fachadasColoniaisTex.wrapS = THREE.RepeatWrapping;
fachadasColoniaisTex.anisotropy = 8;

// 1. Piso HD da Rosa dos Ventos de Cícero Dias (22m de diâmetro em escala 1:1 no chão do Marco Zero)
const rosaDiscGeo = new THREE.CircleGeometry(11.0, 64);
rosaDiscGeo.rotateX(-Math.PI / 2);
const rosaDiscMat = new THREE.MeshBasicMaterial({
  map: rosaTex,
  polygonOffset: true,
  polygonOffsetFactor: -2
});
const rosaDiscMesh = new THREE.Mesh(rosaDiscGeo, rosaDiscMat);
rosaDiscMesh.position.set(0, 0.08, 0);
aiEnhancementsGroup.add(rosaDiscMesh);

// Cria uma parede de fachada 3D em escala 1:1 re-renderizada por IA
function createAIFacadeWall(x1, z1, x2, z2, baseY, heightM, texture, uMin = 0, uMax = 1, label = '') {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const widthM = Math.hypot(dx, dz);
  const geo = new THREE.PlaneGeometry(widthM, heightM);

  // Ajusta UV horizontal para recortar a fachada certa do atlas 4K
  const uvAttr = geo.attributes.uv;
  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i);
    uvAttr.setX(i, uMin + u * (uMax - uMin));
  }
  uvAttr.needsUpdate = true;

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((x1 + x2) * 0.5, baseY + heightM * 0.5, (z1 + z2) * 0.5);
  const angle = Math.atan2(dx, dz) + Math.PI * 0.5;
  mesh.rotation.y = angle;
  aiEnhancementsGroup.add(mesh);
  return mesh;
}

// Cria placa 3D de identificação de Rua ou Edifício Histórico (mapeado via OpenStreetMap)
function createStreetOrBuildingSign(title, subtitle, x, y, z, badgeColor = '#facc15', isBuilding = false) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const ctx = c.getContext('2d');

  ctx.fillStyle = isBuilding ? 'rgba(6, 12, 28, 0.92)' : 'rgba(15, 35, 75, 0.92)';
  ctx.beginPath();
  ctx.roundRect(6, 6, 500, 148, 18);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = badgeColor;
  ctx.stroke();

  ctx.fillStyle = badgeColor;
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText(subtitle.toUpperCase(), 24, 44);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Space Grotesk", sans-serif';
  ctx.fillText(title.slice(0, 28), 24, 96);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 18px "Inter", sans-serif';
  ctx.fillText(`GPS 1:1 • X:${Math.round(x)}m Z:${Math.round(z)}m`, 24, 132);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.set(x, y, z);
  sprite.scale.set(isBuilding ? 5.2 : 3.6, isBuilding ? 1.65 : 1.15, 1);
  aiEnhancementsGroup.add(sprite);
  return sprite;
}

// ============================================================================
// CARREGAMENTO DO MAPA SEMÂNTICO (RUAS E CONSTRUÇÕES) + MALHA 3D 1:1
// ============================================================================
let semanticData = { streets: [], buildings: [], landmarks: [] };
const dynamicSigns = [];

async function loadSemanticMap() {
  try {
    const res = await fetch('assets/semantic_map.json');
    semanticData = await res.json();
  } catch (e) {
    console.warn('Mapa semântico ainda não carregado:', e);
  }
}

function populateSemanticWorldAndAIFacades() {
  const groundZeroY = sampleGroundHeight(0, 0, -4.0);
  rosaDiscMesh.position.y = groundZeroY + 0.06;

  // 1. Aplica as Fachadas 4K geradas por IA nos prédios históricos de frente para a Praça do Marco Zero e Ruas:
  // Caixa Cultural Recife (metade esquerda do atlas fachadas_marco_zero_hd.jpg: U de 0.02 a 0.49)
  const gyCaixa = sampleGroundHeight(34, -24, groundZeroY);
  createAIFacadeWall(36, -38, 36, -12, gyCaixa, 18.5, fachadasMarcoZeroTex, 0.02, 0.49, 'Caixa Cultural Recife');

  // Associação Comercial de Pernambuco (metade direita do atlas fachadas_marco_zero_hd.jpg: U de 0.51 a 0.98)
  const gyAssoc = sampleGroundHeight(36, 16, groundZeroY);
  createAIFacadeWall(36, 4, 36, 30, gyAssoc, 18.5, fachadasMarcoZeroTex, 0.51, 0.98, 'Associação Comercial de PE');

  // Casarões Históricos da Av. Rio Branco (fachadas_bom_jesus_rio_branco_hd.jpg)
  const gyRioBranco = sampleGroundHeight(64, 6, groundZeroY);
  createAIFacadeWall(44, -4, 92, -4, gyRioBranco, 15.5, fachadasColoniaisTex, 0.0, 1.0, 'Boulevard Av. Rio Branco');
  createAIFacadeWall(44, 18, 92, 18, gyRioBranco, 15.5, fachadasColoniaisTex, 0.0, 1.0, 'Casarões Av. Rio Branco');

  // Casarões Coloniais da Rua do Bom Jesus (fachadas_bom_jesus_rio_branco_hd.jpg)
  const gyBomJesus = sampleGroundHeight(42, -85, groundZeroY);
  createAIFacadeWall(32, -48, 42, -110, gyBomJesus, 15.0, fachadasColoniaisTex, 0.0, 1.0, 'Rua do Bom Jesus');

  // 2. Placas de Identificação 3D das Ruas e Construções Reais a partir do Marco Zero
  if (semanticData.streets) {
    semanticData.streets.forEach((st) => {
      if (st.name.match(/^\d+$/)) return;
      const [sx, sz] = st.center;
      if (Math.hypot(sx, sz) < 320) {
        const gy = sampleGroundHeight(sx, sz, groundZeroY);
        createStreetOrBuildingSign(st.name, 'VIA OFICIAL • RECIFE ANTIGO', sx, gy + 3.4, sz, '#00f0ff', false);
      }
    });
  }

  if (semanticData.buildings) {
    semanticData.buildings.forEach((b) => {
      const [bx, bz] = b.center;
      if (Math.hypot(bx, bz) < 340) {
        const gy = sampleGroundHeight(bx, bz, groundZeroY);
        createStreetOrBuildingSign(
          b.name,
          `EDIFÍCIO HISTÓRICO • ${b.height_m}m`,
          bx,
          gy + Math.min(b.height_m + 3.0, 22.0),
          bz,
          '#facc15',
          true
        );
      }
    });
  }
}

// ============================================================================
// CARREGAMENTO DOS 9 BLOCOS 3D (GLB) DO RECIFE ANTIGO + COLISÃO DE CHÃO
// ============================================================================
const cityGroup = new THREE.Group();
scene.add(cityGroup);
const groundMeshes = [];

const loadingOverlay = document.getElementById('loading-overlay');
const loadingBar = document.getElementById('loading-bar');
const loadingStatus = document.getElementById('loading-status');
const gltfLoader = new GLTFLoader();

async function loadRecife3DTiles() {
  await loadSemanticMap();
  const res = await fetch('assets/tiles/tiles_manifest.json');
  const manifest = await res.json();

  let loadedCount = 0;
  for (const item of manifest) {
    loadingStatus.textContent = `Carregando ${item.description} (${item.slug}.glb)...`;
    await new Promise((resolve) => {
      gltfLoader.load(
        item.file,
        (gltf) => {
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              const map = child.material.map;
              if (map) {
                map.colorSpace = THREE.SRGBColorSpace;
                map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
              }
              child.material = new THREE.MeshBasicMaterial({
                map: map,
                side: THREE.DoubleSide
              });
              groundMeshes.push(child);
            }
          });
          cityGroup.add(gltf.scene);
          loadedCount++;
          loadingBar.style.width = `${Math.round((loadedCount / manifest.length) * 100)}%`;

          if (loadedCount === 1) {
            populateSemanticWorldAndAIFacades();
            teleportToStation(0);
          }
          resolve();
        },
        undefined,
        () => resolve()
      );
    });
  }

  loadingStatus.textContent = 'Cidade 3D 1:1 + Fachadas IA 4K + Mapa Semântico prontos!';
  setTimeout(() => loadingOverlay.classList.add('fade-out'), 300);
}

const downRaycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3();
const rayDir = new THREE.Vector3(0, -1, 0);

function sampleGroundHeight(x, z, currentGroundY = -4.0) {
  if (groundMeshes.length === 0) return currentGroundY;
  rayOrigin.set(x, currentGroundY + 3.2, z);
  downRaycaster.set(rayOrigin, rayDir);
  downRaycaster.far = 25.0;

  const hits = downRaycaster.intersectObjects(groundMeshes, false);
  if (hits.length > 0) {
    let bestY = hits[0].point.y;
    for (const h of hits) {
      if (Math.abs(h.point.y - currentGroundY) < Math.abs(bestY - currentGroundY)) {
        bestY = h.point.y;
      }
    }
    return bestY;
  }

  rayOrigin.set(x, 80, z);
  downRaycaster.set(rayOrigin, rayDir);
  downRaycaster.far = 120.0;
  const wideHits = downRaycaster.intersectObjects(groundMeshes, false);
  if (wideHits.length > 0) {
    return wideHits[wideHits.length - 1].point.y;
  }
  return currentGroundY;
}

// Detecta automaticamente em qual Rua e próximo a qual Prédio Histórico o usuário está caminhando!
function detectClosestStreetAndBuilding(x, z) {
  let bestStreet = 'Praça Rio Branco (Marco Zero)';
  let bestStreetDist = 9999;

  if (semanticData.streets) {
    for (const st of semanticData.streets) {
      if (st.name.match(/^\d+$/)) continue;
      for (const pt of st.points) {
        const d = Math.hypot(x - pt[0], z - pt[1]);
        if (d < bestStreetDist) {
          bestStreetDist = d;
          bestStreet = st.name;
        }
      }
    }
  }

  let bestBuilding = 'Rosa dos Ventos (Marco Zero)';
  let bestBuildingDist = 9999;
  if (semanticData.buildings) {
    for (const b of semanticData.buildings) {
      const d = Math.hypot(x - b.center[0], z - b.center[1]);
      if (d < bestBuildingDist) {
        bestBuildingDist = d;
        bestBuilding = b.name;
      }
    }
  }

  return { street: bestStreet, building: bestBuilding, dist: Math.round(bestBuildingDist) };
}

// ============================================================================
// HUD & INTERAÇÃO
// ============================================================================
let currentStationIdx = 0;
let isDroneMode = false;
let isStreetViewDomeActive = false;
let currentGroundY = -4.0;
let verticalVelocity = 0;
let isGrounded = true;

const stationsListEl = document.getElementById('stations-list');
const zoneLabelEl = document.getElementById('current-zone-label');
const cardBadgeEl = document.getElementById('card-badge');
const cardTitleEl = document.getElementById('card-title');
const cardDescEl = document.getElementById('card-desc');
const cardMetricsEl = document.getElementById('card-metrics');
const hudEyeHeightEl = document.getElementById('hud-eye-height');
const hudLocomotionEl = document.getElementById('hud-locomotion-mode');
const hudCoordsEl = document.getElementById('hud-coords');

function renderStationsUI() {
  stationsListEl.innerHTML = '';
  STATIONS.forEach((st, idx) => {
    const btn = document.createElement('button');
    btn.className = `station-btn ${idx === currentStationIdx ? 'active' : ''}`;
    btn.innerHTML = `
      <div class="station-key">${st.key}</div>
      <div class="station-meta">
        <strong>${st.name}</strong>
        <span>${st.shortDesc}</span>
      </div>
    `;
    btn.addEventListener('click', () => teleportToStation(idx));
    stationsListEl.appendChild(btn);
  });
}

function updateStationCard(idx) {
  const st = STATIONS[idx];
  cardBadgeEl.textContent = st.badge;
  cardTitleEl.textContent = st.name;
  cardDescEl.textContent = st.description;
  cardMetricsEl.innerHTML = st.metrics.map((m) => `<span class="metric-chip">${m}</span>`).join('');
  document.querySelectorAll('.station-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });
}

function teleportToStation(idx) {
  currentStationIdx = idx;
  const st = STATIONS[idx];
  const gy = sampleGroundHeight(st.pos.x, st.pos.z, -4.0);
  currentGroundY = gy;

  playerRig.position.set(st.pos.x, gy, st.pos.z);
  camera.position.set(0, humanEyeHeight, 0);
  camera.rotation.set(0, THREE.MathUtils.degToRad(st.yawDeg), 0, 'YXZ');
  updateStationCard(idx);
}

renderStationsUI();
updateStationCard(0);

const btnWalk = document.getElementById('btn-mode-walk');
const btnDrone = document.getElementById('btn-mode-drone');

function setLocomotionMode(drone) {
  isDroneMode = drone;
  btnWalk.classList.toggle('active', !drone);
  btnDrone.classList.toggle('active', drone);
  hudLocomotionEl.textContent = drone ? 'Voo Livre / Drone' : 'Caminhada na Rua (1:1)';
  if (!drone) {
    currentGroundY = sampleGroundHeight(playerRig.position.x, playerRig.position.z, currentGroundY);
    playerRig.position.y = currentGroundY;
    camera.position.y = humanEyeHeight;
  }
}

btnWalk.addEventListener('click', () => setLocomotionMode(false));
btnDrone.addEventListener('click', () => setLocomotionMode(true));

const sliderHeight = document.getElementById('slider-height');
const lblHeightVal = document.getElementById('lbl-height-val');
sliderHeight.addEventListener('input', (e) => {
  humanEyeHeight = parseFloat(e.target.value);
  lblHeightVal.textContent = `${humanEyeHeight.toFixed(2)}m`;
  hudEyeHeightEl.textContent = `${humanEyeHeight.toFixed(2)}m (1:1 Real)`;
  if (!renderer.xr.isPresenting) camera.position.y = humanEyeHeight;
});

// Botão R: Alterna entre "Cidade 3D + Fachadas IA" e "Domo Imersivo 360° IA (Street View IA)"
const btnToggleRoom = document.getElementById('btn-toggle-room');
btnToggleRoom.textContent = 'Domo 360° IA (R)';
function toggleStreetViewDome() {
  isStreetViewDomeActive = !isStreetViewDomeActive;
  streetViewDome.visible = isStreetViewDomeActive;
  btnToggleRoom.classList.toggle('active', isStreetViewDomeActive);
  btnToggleRoom.textContent = isStreetViewDomeActive ? 'Domo 360° IA: ON (R)' : 'Domo 360° IA: OFF (R)';
}
btnToggleRoom.addEventListener('click', toggleStreetViewDome);

// Botão de mostrar/ocultar Placas Semânticas de Ruas e Prédios
const btnSilhouettes = document.getElementById('btn-toggle-Silhouettes');
btnSilhouettes.textContent = '🏷️ Mostrar Placas de Ruas/Prédios & Fachadas IA';
let showEnhancements = true;
btnSilhouettes.addEventListener('click', () => {
  showEnhancements = !showEnhancements;
  aiEnhancementsGroup.visible = showEnhancements;
  btnSilhouettes.classList.toggle('active', showEnhancements);
});

const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  ArrowUp: false,
  ArrowLeft: false,
  ArrowDown: false,
  ArrowRight: false,
  ShiftLeft: false,
  ShiftRight: false,
  Space: false,
  KeyE: false,
  KeyQ: false
};

window.addEventListener('keydown', (e) => {
  if (e.code in keys) keys[e.code] = true;
  if (e.code === 'KeyF') setLocomotionMode(!isDroneMode);
  if (e.code === 'KeyC') setLocomotionMode(false);
  if (e.code === 'KeyR') toggleStreetViewDome();
  if (e.code === 'Space' && isGrounded && !isDroneMode) {
    verticalVelocity = 4.2;
    isGrounded = false;
  }
  if (e.key >= '1' && e.key <= '6') {
    teleportToStation(parseInt(e.key, 10) - 1);
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code in keys) keys[e.code] = false;
});

let vrSnapCooldown = 0;
function handleQuestControllers(dt) {
  const session = renderer.xr.getSession();
  if (!session) return;
  for (const source of session.inputSources) {
    if (!source.gamepad) continue;
    const axes = source.gamepad.axes;
    const buttons = source.gamepad.buttons;

    if (source.handedness === 'left' && axes.length >= 4) {
      const lx = axes[2];
      const lz = axes[3];
      if (Math.hypot(lx, lz) > 0.12) {
        const speed = 2.6;
        const xrCam = renderer.xr.getCamera();
        const forward = new THREE.Vector3();
        xrCam.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
        playerRig.position.addScaledVector(forward, -lz * speed * dt);
        playerRig.position.addScaledVector(right, lx * speed * dt);
      }
    }

    if (source.handedness === 'right' && axes.length >= 4) {
      const rx = axes[2];
      if (vrSnapCooldown <= 0 && Math.abs(rx) > 0.65) {
        playerRig.rotation.y -= Math.sign(rx) * THREE.MathUtils.degToRad(30);
        vrSnapCooldown = 0.32;
      }
      if (buttons[4] && buttons[4].pressed && vrSnapCooldown <= 0) {
        teleportToStation((currentStationIdx + 1) % STATIONS.length);
        vrSnapCooldown = 0.45;
      }
    }
  }
  if (vrSnapCooldown > 0) vrSnapCooldown -= dt;
}

const clock = new THREE.Clock();
const moveForward = new THREE.Vector3();
const moveRight = new THREE.Vector3();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.getElapsedTime();

  waterMesh.position.y = -15.5 + Math.sin(elapsed * 1.4) * 0.08;

  const fwdInput = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  const sideInput = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);

  if (fwdInput !== 0 || sideInput !== 0) {
    const baseSpeed = isDroneMode ? 24.0 : 2.4;
    const speed = (keys.ShiftLeft || keys.ShiftRight) ? baseSpeed * 2.4 : baseSpeed;

    camera.getWorldDirection(moveForward);
    if (!isDroneMode) moveForward.y = 0;
    moveForward.normalize();
    moveRight.crossVectors(moveForward, new THREE.Vector3(0, 1, 0)).normalize();

    playerRig.position.addScaledVector(moveForward, fwdInput * speed * dt);
    playerRig.position.addScaledVector(moveRight, sideInput * speed * dt);
  }

  if (isDroneMode) {
    if (keys.Space || keys.KeyE) playerRig.position.y += 14.0 * dt;
    if (keys.KeyQ) playerRig.position.y -= 14.0 * dt;
  } else {
    const targetGroundY = sampleGroundHeight(playerRig.position.x, playerRig.position.z, currentGroundY);
    if (targetGroundY - currentGroundY < 2.2) {
      currentGroundY = THREE.MathUtils.lerp(currentGroundY, targetGroundY, Math.min(1.0, dt * 12.0));
    }
    if (!isGrounded) {
      playerRig.position.y += verticalVelocity * dt;
      verticalVelocity -= 9.8 * dt;
      if (playerRig.position.y <= currentGroundY) {
        playerRig.position.y = currentGroundY;
        verticalVelocity = 0;
        isGrounded = true;
      }
    } else {
      playerRig.position.y = currentGroundY;
    }
  }

  // O Domo 360° IA acompanha a posição do usuário quando ativo
  streetViewDome.position.set(playerRig.position.x, playerRig.position.y + humanEyeHeight, playerRig.position.z);

  handleQuestControllers(dt);

  // Reconhecimento Geoespacial em Tempo Real: mostra na barra superior a Rua e o Prédio ao seu lado!
  const px = Math.round(playerRig.position.x);
  const pz = Math.round(playerRig.position.z);
  const loc = detectClosestStreetAndBuilding(playerRig.position.x, playerRig.position.z);
  zoneLabelEl.textContent = `📍 ${loc.street} • Próximo a: ${loc.building} (${loc.dist}m)`;
  hudCoordsEl.textContent = `X: ${px}m | Z: ${pz}m | ${loc.street}`;

  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

loadRecife3DTiles();
