import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// ============================================================================
// DEFINIÇÃO DAS 6 SALAS LIMITADAS 360° & ESTAÇÕES EM ESCALA HUMANA 1:1
// ============================================================================
const STATIONS = [
  {
    id: 'marco-zero',
    key: '1',
    badge: 'SALA 01 • PONTO ZERO',
    name: 'Praça do Marco Zero (Rosa dos Ventos)',
    shortDesc: 'Centro histórico • Rosa dos Ventos de Cícero Dias',
    description:
      'Ponto zero do Recife Antigo e coração do Rec\'n\'Play. Em escala humana 1:1 (1.70m), observe a proporção real do prédio da Caixa Cultural, Associação Comercial e o estuário do Rio Capibaribe.',
    pos: { x: 0.0, z: 0.0 },
    yawDeg: 15,
    color: '#facc15',
    accent: '#00f0ff',
    metrics: ['Escala 1:1 Real', 'Raio da Sala: 3.5m', 'Prédios: 18m–42m'],
    panels: [
      {
        title: 'MARCO ZERO • REC\'N\'PLAY',
        subtitle: 'Gêmeo Digital 1:1 do Bairro do Recife',
        lines: [
          '• Malha fotogramétrica real extraída e tratada em escala 1:1',
          '• 1 unidade métrica no VR = 1,00 metro no mundo real',
          '• Olhe para cima: edifícios históricos em proporção real',
          '• Caminhe livremente pela praça ou salte entre as 6 salas'
        ]
      },
      {
        title: 'BBTS + COMUNIDADE IV',
        subtitle: 'O Metaverso além do hype: Valor Tangível',
        lines: [
          '• Gêmeos Digitais para operações, treinamento e cultura',
          '• Espaços limitados (Salas 360°) focados em experiência real',
          '• Conectando gestores da BBTS e talentos da Comunidade IV',
          '• Desenvolvido para o Meta Quest 3S (WebXR & Unity 6)'
        ]
      },
      {
        title: 'NAVEGAÇÃO RÁPIDA (SALAS)',
        subtitle: 'Use os controles do Quest 3S ou Teclas 1–6',
        lines: [
          '[1] Praça do Marco Zero (Rosa dos Ventos)',
          '[2] Arena BBTS — Hackathon 24h (12 a 13/11)',
          '[3] QG Comunidade IV — Hub Tech Recife',
          '[4] Boulevard Rio Branco • [5] Bom Jesus • [6] Cais do Sertão'
        ]
      }
    ]
  },
  {
    id: 'arena-bbts',
    key: '2',
    badge: 'SALA 02 • IMERSÃO 24H',
    name: 'Arena BBTS — Hackathon 24h',
    shortDesc: '12/11 (07h30) a 13/11 (07h30) • Mentoria & Inovação',
    description:
      'Sala dedicada à maratona de 24h da BB Tecnologia e Serviços (BBTS) no Rec\'n\'Play. Demonstração prática para gestores e equipes de como ambientes XR imersivos resolvem problemas reais.',
    pos: { x: -10.5, z: 62.0 },
    yawDeg: 180,
    color: '#facc15',
    accent: '#1d4ed8',
    metrics: ['24h de Imersão', 'Mentoria BBTS', '12/11 07:30 → 13/11 07:30'],
    panels: [
      {
        title: 'HACKATHON BBTS • 24 HORAS',
        subtitle: 'Das 07h30 do dia 12 às 07h30 do dia 13',
        lines: [
          '• 24h ininterruptas de código, imersão e prototipação',
          '• Mentoria ativa apoiando as equipes na criação de soluções',
          '• Foco em impacto real para o conglomerado Banco do Brasil',
          '• Inovação aberta conectada ao ecossistema do Porto Digital'
        ]
      },
      {
        title: 'POR QUE XR NA BBTS?',
        subtitle: 'Aplicações Corporativas de Alto Valor',
        lines: [
          '1. Treinamento Técnico Imersivo de infraestrutura crítica',
          '2. Salas de Situação / Digital Twins de centros operacionais',
          '3. Onboarding e colaboração remota em salas 3D limitadas',
          '4. Atendimento e showroom interativo de soluções BBTS'
        ]
      },
      {
        title: 'MENTORIA & PROTOTIPAÇÃO',
        subtitle: 'Meta Quest 3S na Prática',
        lines: [
          '• Hardware acessível + WebXR/Unity = deploy imediato',
          '• Escala humana 1:1 sem enjoo (referência de sala fixa)',
          '• Integração direta com dados, APIs e mapas reais',
          '• Bora construir o futuro nas próximas 24 horas!'
        ]
      }
    ]
  },
  {
    id: 'comunidade-iv',
    key: '3',
    badge: 'SALA 03 • COMUNIDADE TECH',
    name: 'QG Comunidade IV (Av. Rio Branco)',
    shortDesc: 'Galera Tech de Recife • Networking & Futuro',
    description:
      'Ponto de encontro da Comunidade IV no Boulevard Rio Branco. Um espaço pensado para inspirar a comunidade local de desenvolvedores, estudantes e entusiastas de tecnologia do Recife.',
    pos: { x: 24.0, z: 14.5 },
    yawDeg: -90,
    color: '#00f0ff',
    accent: '#8b5cf6',
    metrics: ['Comunidade IV', 'Porto Digital', 'Talentos de Recife'],
    panels: [
      {
        title: 'COMUNIDADE IV • RECIFE',
        subtitle: 'Protagonismo Tech no Carnaval do Conhecimento',
        lines: [
          '• Reunindo desenvolvedores, criadores e mentes inquietas',
          '• Do Embarque Digital e universidades para o mundo',
          '• Mostrando na prática que inovação se faz em comunidade',
          '• Experimente o Quest 3S e explore o Recife Antigo em 3D!'
        ]
      },
      {
        title: 'ARQUITETURA DESTE PROJETO',
        subtitle: 'Como transformamos dados aéreos em VR 1:1',
        lines: [
          '• Extração binária de 1.620 malhas glTF 2.0 (.BGL MSFS)',
          '• Decodificação de coordenadas Octree GPS para escala 1:1',
          '• Pós-processamento de texturas DDS 2K (nitidez + cor)',
          '• Combinação de Mundo 3D Real + Salas 360° Limitadas'
        ]
      },
      {
        title: 'CONECTE-SE COM A IV',
        subtitle: 'Inovação feita por pessoas reais',
        lines: [
          '• Participe das ativações pelo Bairro do Recife no Rec\'n\'Play',
          '• Troque ideia sobre IA, XR, Dev, Carreira e Comunidade',
          '• Juntos fortalecendo o ecossistema tech pernambucano!'
        ]
      }
    ]
  },
  {
    id: 'bom-jesus',
    key: '4',
    badge: 'SALA 04 • CORREDOR HISTÓRICO',
    name: 'Rua do Bom Jesus & Praça do Arsenal',
    shortDesc: 'Paço do Frevo, Torre Malakoff & Casarões',
    description:
      'Caminhe em escala 1:1 entre os casarões históricos da Rua do Bom Jesus e a Praça do Arsenal da Marinha, onde tecnologia, cultura pernambucana e economia criativa se encontram.',
    pos: { x: -35.0, z: -116.0 },
    yawDeg: 0,
    color: '#f43f5e',
    accent: '#facc15',
    metrics: ['120m ao Norte', 'Casarões 1:1', 'Praça do Arsenal'],
    panels: [
      {
        title: 'RUA DO BOM JESUS & ARSENAL',
        subtitle: 'Patrimônio Histórico + Inovação Digital',
        lines: [
          '• Eleita uma das ruas mais bonitas do mundo',
          '• Palco de ativações de rua, robótica e cultura no Rec\'n\'Play',
          '• Ao redor: Paço do Frevo, Torre Malakoff e Embaixada dos Bonecos',
          '• Proporção urbana real preservada na malha 3D'
        ]
      },
      {
        title: 'ESCALA HUMANA 1:1 VERIFICADA',
        subtitle: 'Comparativo de Altura Real na Rua',
        lines: [
          '• Altura do seu olhar: 1,70m acima do calçamento de pedra',
          '• Casarões coloniais ao redor: 12m a 18m (3 a 4 andares)',
          '• Largura real da via e da Praça do Arsenal preservada'
        ]
      },
      {
        title: 'PRÓXIMA PARADA',
        subtitle: 'Continue caminhando para o Norte ou use o Portal',
        lines: [
          '• A 130 metros adiante: Cais do Sertão & Porto Digital',
          '• Use o analógico do Quest 3S ou pressione [5] no teclado'
        ]
      }
    ]
  },
  {
    id: 'cais-do-sertao',
    key: '5',
    badge: 'SALA 05 • PALCO PORTO DIGITAL',
    name: 'Cais do Sertão & Armazéns do Porto',
    shortDesc: 'Grandes Arenas, Palestras & Economia Criativa',
    description:
      'Esplanada do Cais do Sertão e Armazéns do Porto. Sinta a escala monumental do vão livre e dos galpões portuários revitalizados que abrigam os grandes palcos do Rec\'n\'Play.',
    pos: { x: -95.0, z: -225.0 },
    yawDeg: 140,
    color: '#38bdf8',
    accent: '#facc15',
    metrics: ['Esplanada Portuária', '250m do Marco Zero', 'Arenas Rec\'n\'Play'],
    panels: [
      {
        title: 'CAIS DO SERTÃO & ARMAZÉNS',
        subtitle: 'Onde o Sertão encontra o Futuro Digital',
        lines: [
          '• Arquitetura icônica à beira da bacia do Porto do Recife',
          '• Sede das grandes arenas de conteúdo e negócios do festival',
          '• Integração perfeita entre museografia, música e tecnologia'
        ]
      },
      {
        title: 'VISÃO DE FUTURO BBTS & IV',
        subtitle: 'Turismo, Cultura e Cidades Inteligentes',
        lines: [
          '• Imagine visitar qualquer ponto histórico ou agência em 1:1',
          '• Planejamento urbano e gestão de grandes eventos em 3D',
          '• Acessibilidade: levando o Rec\'n\'Play para qualquer lugar'
        ]
      },
      {
        title: 'EXPLORE O MAPA COMPLETO',
        subtitle: 'Modo Caminhada 1:1 ou Modo Drone',
        lines: [
          '• Pressione [F] para voar sobre os Armazéns e o Rio Capibaribe',
          '• Pressione [1] para voltar instantaneamente ao Marco Zero'
        ]
      }
    ]
  },
  {
    id: 'parque-esculturas',
    key: '6',
    badge: 'SALA 06 • VISTA PANORÂMICA',
    name: 'Parque das Esculturas (Brennand)',
    shortDesc: 'Arrecifes do Porto • Skyline Completo do Recife',
    description:
      'Sobre o molhe de arrecifes a leste do Marco Zero. Daqui você tem a vista panorâmica 360° mais famosa de toda a ilha do Recife Antigo refletida nas águas do estuário.',
    pos: { x: -310.0, z: 10.0 },
    yawDeg: -90,
    color: '#a855f7',
    accent: '#00f0ff',
    metrics: ['310m a Leste', 'Sobre os Arrecifes', 'Skyline Completo 1:1'],
    panels: [
      {
        title: 'PARQUE DAS ESCULTURAS',
        subtitle: 'Coluna de Cristal de Francisco Brennand',
        lines: [
          '• Localizado sobre o molhe de pedra em frente ao Marco Zero',
          '• A 310 metros de distância real atravessando o estuário',
          '• Olhe para o Oeste: veja toda a fachada do Recife Antigo em 1:1'
        ]
      },
      {
        title: 'FIDELIDADE GEOGRÁFICA',
        subtitle: '9 Blocos de Fotogrametria Costurados',
        lines: [
          '• Área total carregada: ~1 km² do centro histórico do Recife',
          '• 350.573 vértices otimizados para rodar liso no Meta Quest 3S',
          '• Água animada em nível real da maré do Porto do Recife'
        ]
      },
      {
        title: 'RETORNAR AO HACKATHON',
        subtitle: 'Pronto para a maratona de 24h?',
        lines: [
          '• Pressione [2] para ir direto à Arena BBTS Hackathon 24h',
          '• Pressione [3] para visitar o QG da Comunidade IV'
        ]
      }
    ]
  }
];

// ============================================================================
// INICIALIZAÇÃO THREE.JS + WEBXR (META QUEST 3S READY)
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
renderer.toneMappingExposure = 1.12;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');

// Monta o botão oficial WebXR para quando abrir no Meta Quest 3S
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
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x9bd3f5, 0.0011);

// Rig do Jogador (Permite mover o jogador tanto no PC quanto no Meta Quest 3S em escala 1:1)
const playerRig = new THREE.Group();
playerRig.position.set(0, 0, 0);
scene.add(playerRig);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 2500);
let humanEyeHeight = 1.70; // 1.70m altura humana padrão
camera.position.set(0, humanEyeHeight, 0);
playerRig.add(camera);

// Controles 1ª Pessoa no Desktop (Mouse Look)
const fpvControls = new PointerLockControls(camera, document.body);
const crosshairEl = document.getElementById('crosshair');
const btnEnterFpv = document.getElementById('btn-enter-fpv');

btnEnterFpv.addEventListener('click', () => {
  fpvControls.lock();
});
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
// ILUMINAÇÃO REALISTA + SKY DOME 360° DO RECIFE + ÁGUA DO RIO CAPIBARIBE
// ============================================================================
const hemiLight = new THREE.HemisphereLight(0xdff4ff, 0x3b4a59, 1.35);
hemiLight.position.set(0, 300, 0);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff5e0, 1.85);
sunLight.position.set(-220, 340, 160);
scene.add(sunLight);

// Domo de Céu 360° Procedural (Horizonte Tropical do Recife)
function createSkyDome() {
  const skyGeo = new THREE.SphereGeometry(1600, 48, 24);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x0ea5e9) },
      horizonColor: { value: new THREE.Color(0xbae6fd) },
      bottomColor: { value: new THREE.Color(0x1e293b) }
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        vec3 col = mix(horizonColor, topColor, max(pow(max(h, 0.0), 0.55), 0.0));
        if (h < 0.0) {
          col = mix(horizonColor, bottomColor, min(abs(h) * 4.0, 1.0));
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
  return skyMat;
}
const skyMat = createSkyDome();

// Plano de Água Animada (Rio Capibaribe, Bacia do Porto e Oceano Atlântico)
const waterGeo = new THREE.PlaneGeometry(3000, 3000, 64, 64);
waterGeo.rotateX(-Math.PI / 2);
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x0369a1,
  roughness: 0.22,
  metalness: 0.65,
  transparent: true,
  opacity: 0.88
});
const waterMesh = new THREE.Mesh(waterGeo, waterMat);
waterMesh.position.y = -6.2; // Nível médio da lâmina d'água no estuário
scene.add(waterMesh);

// ============================================================================
// GERADOR DE PAINÉIS HOLOGRÁFICOS 3D & SALAS LIMITADAS 360° EM ESCALA 1:1
// ============================================================================
function createHoloPanelTexture(panelData, primaryColor, accentColor, badgeText) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext('2d');

  // Fundo escuro translúcido estilo vidro futurista
  const grad = ctx.createLinearGradient(0, 0, 1024, 640);
  grad.addColorStop(0, 'rgba(6, 11, 25, 0.94)');
  grad.addColorStop(1, 'rgba(12, 22, 46, 0.90)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(12, 12, 1000, 616, 28);
  ctx.fill();

  // Borda neon
  ctx.lineWidth = 5;
  ctx.strokeStyle = primaryColor;
  ctx.stroke();

  // Barra superior
  ctx.fillStyle = primaryColor;
  ctx.fillRect(48, 48, 260, 36);
  ctx.fillStyle = '#050914';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText(badgeText, 62, 73);

  // Tag BBTS + Comunidade IV no canto direito
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 20px "Space Grotesk", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('BBTS • COMUNIDADE IV • QUEST 3S', 964, 73);
  ctx.textAlign = 'left';

  // Título Principal
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Space Grotesk", sans-serif';
  ctx.fillText(panelData.title, 48, 150);

  // Subtítulo
  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 26px "Inter", sans-serif';
  ctx.fillText(panelData.subtitle, 48, 198);

  // Linha divisória
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 226);
  ctx.lineTo(976, 226);
  ctx.stroke();

  // Linhas de conteúdo
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 28px "Inter", sans-serif';
  let y = 290;
  for (const line of panelData.lines) {
    ctx.fillText(line, 56, y);
    y += 66;
  }

  // Rodapé de Escala 1:1
  ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillText('ESCALA HUMANA REAL 1:1 (ALTURA DO PAINEL: 1.65m DO CHÃO)', 48, 590);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Cria uma silhueta/avatar de referência humana em escala exata 1:1 (1,75m de altura)
function createHumanScaleReference(colorHex, labelText) {
  const group = new THREE.Group();

  const matBody = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.35,
    roughness: 0.3,
    transparent: true,
    opacity: 0.85
  });

  // Pernas + Tronco (0.0m até 1.42m)
  const torsoGeo = new THREE.CapsuleGeometry(0.18, 1.05, 8, 16);
  const torso = new THREE.Mesh(torsoGeo, matBody);
  torso.position.set(0, 0.75, 0);
  group.add(torso);

  // Cabeça (centro em 1.62m -> topo da cabeça em 1.75m!)
  const headGeo = new THREE.SphereGeometry(0.13, 16, 16);
  const head = new THREE.Mesh(headGeo, matBody);
  head.position.set(0, 1.62, 0);
  group.add(head);

  // Visor Meta Quest 3S no rosto do avatar!
  const visorGeo = new THREE.BoxGeometry(0.22, 0.09, 0.14);
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 1.63, 0.08);
  group.add(visor);

  // Régua vertical ao lado mostrando 1.75m (Escala Humana Real)
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(5, 10, 24, 0.9)';
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 120);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillText('HUMANO 1:1', 20, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 22px "Inter", sans-serif';
  ctx.fillText(labelText, 20, 92);

  const labelTex = new THREE.CanvasTexture(c);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.75, 0.38),
    new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide })
  );
  labelMesh.position.set(0, 2.08, 0);
  group.add(labelMesh);

  return group;
}

const stationGroups = [];
const roomWallsMeshes = [];
const silhouetteGroups = [];

function buildStations3D() {
  const radius = 3.6; // Sala de 7.2m de diâmetro (espaço limitado super confortável em escala 1:1)

  STATIONS.forEach((st, idx) => {
    const group = new THREE.Group();
    group.position.set(st.pos.x, -4.0, st.pos.z);

    // 1. Piso Delimitado da Sala (Anel Guardian + Plataforma Circular sutil no chão)
    const ringGeo = new THREE.RingGeometry(radius - 0.14, radius, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: st.color,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.04;
    group.add(ringMesh);

    const floorDiscGeo = new THREE.CircleGeometry(radius - 0.14, 64);
    floorDiscGeo.rotateX(-Math.PI / 2);
    const floorDiscMat = new THREE.MeshBasicMaterial({
      color: st.color,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const floorDisc = new THREE.Mesh(floorDiscGeo, floorDiscMat);
    floorDisc.position.y = 0.03;
    group.add(floorDisc);

    // 2. Paredes Cilíndricas Translúcidas da "Sala Limitada 360°" (3.0m de altura)
    const wallGeo = new THREE.CylinderGeometry(radius, radius, 3.0, 48, 1, true);
    const wallMat = new THREE.MeshBasicMaterial({
      color: st.color,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      wireframe: false,
      depthWrite: false
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 1.5;
    group.add(wallMesh);
    roomWallsMeshes.push(wallMesh);

    // Grade superior da Sala (a 3.0m de altura — pé-direito real de uma sala)
    const topRingGeo = new THREE.RingGeometry(radius - 0.08, radius, 48);
    topRingGeo.rotateX(-Math.PI / 2);
    const topRing = new THREE.Mesh(topRingGeo, ringMat);
    topRing.position.y = 3.0;
    wallMesh.add(topRing);

    // 3. Três Painéis Holográficos Curvos/Flutuantes na Altura Humana (centro a 1.65m do chão!)
    const angles = [-Math.PI * 0.28, 0, Math.PI * 0.28];
    st.panels.forEach((pData, pIdx) => {
      const tex = createHoloPanelTexture(pData, st.color, st.accent, st.badge);
      const panelGeo = new THREE.PlaneGeometry(2.15, 1.35);
      const panelMat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide,
        transparent: true
      });
      const panelMesh = new THREE.Mesh(panelGeo, panelMat);

      const ang = THREE.MathUtils.degToRad(st.yawDeg) + angles[pIdx];
      const dist = radius - 0.35;
      panelMesh.position.set(
        -Math.sin(ang) * dist,
        1.65, // Altura exata dos olhos de um humano em pé (1.65m)
        -Math.cos(ang) * dist
      );
      panelMesh.lookAt(group.position.x, group.position.y + 1.65, group.position.z);
      // Orienta a face do painel para quem está no centro da sala (0, 1.65, 0 local)
      panelMesh.lookAt(0, 1.65, 0);
      group.add(panelMesh);
    });

    // 4. Beacon Luminoso Vertical (visível de longe para orientar quem caminha pela cidade)
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 45, 12);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: st.color,
      transparent: true,
      opacity: 0.38
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 22.5;
    group.add(beacon);

    // 5. Avatar de Referência Humana 1:1 (1.75m) dentro da Sala
    const humanRef = createHumanScaleReference(
      st.color,
      idx === 1 ? 'Mentor BBTS (1.75m)' : 'Membro IV (1.75m)'
    );
    const refAngle = THREE.MathUtils.degToRad(st.yawDeg) + Math.PI * 0.55;
    humanRef.position.set(-Math.sin(refAngle) * 2.2, 0.02, -Math.cos(refAngle) * 2.2);
    humanRef.lookAt(0, 0.02, 0);
    group.add(humanRef);
    silhouetteGroups.push(humanRef);

    scene.add(group);
    stationGroups.push({ station: st, group });
  });
}
buildStations3D();

// ============================================================================
// CARREGAMENTO DOS 9 BLOCOS 3D (GLB) DO RECIFE ANTIGO + COLISÃO DE CHÃO 1:1
// ============================================================================
const cityGroup = new THREE.Group();
scene.add(cityGroup);
const groundMeshes = [];

const loadingOverlay = document.getElementById('loading-overlay');
const loadingBar = document.getElementById('loading-bar');
const loadingStatus = document.getElementById('loading-status');

const gltfLoader = new GLTFLoader();

async function loadRecife3DTiles() {
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
              // Material Unlit/PBR equilibrado para fotogrametria nítida em qualquer luz
              const oldMat = child.material;
              const map = oldMat.map;
              if (map) {
                map.colorSpace = THREE.SRGBColorSpace;
                map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
              }
              child.material = new THREE.MeshLambertMaterial({
                map: map
              });
              groundMeshes.push(child);
            }
          });
          cityGroup.add(gltf.scene);
          loadedCount++;
          const pct = Math.round((loadedCount / manifest.length) * 100);
          loadingBar.style.width = `${pct}%`;

          // Assim que o bloco central do Marco Zero carrega, já ajusta a altura exata das salas e libera a visão!
          if (loadedCount === 1) {
            snapAllStationsToGround();
            teleportToStation(0, false);
          }
          resolve();
        },
        undefined,
        (err) => {
          console.error('Erro ao carregar tile:', item.file, err);
          resolve();
        }
      );
    });
  }

  snapAllStationsToGround();
  teleportToStation(currentStationIdx, false);
  loadingStatus.textContent = 'Recife Antigo 3D (Escala 1:1) pronto!';
  setTimeout(() => {
    loadingOverlay.classList.add('fade-out');
  }, 350);
}

// Raycaster para detectar a altura exata da rua/calçada na malha fotogramétrica
const downRaycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3();
const rayDir = new THREE.Vector3(0, -1, 0);

function sampleGroundHeight(x, z, currentGroundY = -4.04) {
  if (groundMeshes.length === 0) return currentGroundY;
  // Dispara raio de uma altura moderada acima dos pés para pegar a calçada/rua (e não o topo de um prédio alto)
  rayOrigin.set(x, currentGroundY + 3.2, z);
  downRaycaster.set(rayOrigin, rayDir);
  downRaycaster.far = 25.0;

  const hits = downRaycaster.intersectObjects(groundMeshes, false);
  if (hits.length > 0) {
    // Escolhe o ponto mais próximo do nível atual do chão para caminhar suave na rua
    let bestY = hits[0].point.y;
    for (const h of hits) {
      if (Math.abs(h.point.y - currentGroundY) < Math.abs(bestY - currentGroundY)) {
        bestY = h.point.y;
      }
    }
    return bestY;
  }

  // Fallback de busca ampla (quando teletransporta para longe)
  rayOrigin.set(x, 80, z);
  downRaycaster.set(rayOrigin, rayDir);
  downRaycaster.far = 120.0;
  const wideHits = downRaycaster.intersectObjects(groundMeshes, false);
  if (wideHits.length > 0) {
    // Pega o menor Y (nível da rua, ignorando telhados se houver múltiplos)
    return wideHits[wideHits.length - 1].point.y;
  }
  return currentGroundY;
}

function snapAllStationsToGround() {
  stationGroups.forEach(({ station, group }) => {
    const gy = sampleGroundHeight(station.pos.x, station.pos.z, -4.2);
    group.position.y = gy;
  });
}

// ============================================================================
// INTERFACE HUD, TELETRANSPORTE ENTRE SALAS E CONTROLES DE ESCALA 1:1
// ============================================================================
let currentStationIdx = 0;
let isDroneMode = false;
let isRoomVisible = true;
let currentGroundY = -4.04;
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
    btn.addEventListener('click', () => teleportToStation(idx, true));
    stationsListEl.appendChild(btn);
  });
}

function updateStationCard(idx) {
  const st = STATIONS[idx];
  zoneLabelEl.textContent = st.name;
  cardBadgeEl.textContent = st.badge;
  cardTitleEl.textContent = st.name;
  cardDescEl.textContent = st.description;
  cardMetricsEl.innerHTML = st.metrics
    .map((m) => `<span class="metric-chip">${m}</span>`)
    .join('');

  document.querySelectorAll('.station-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });
}

function teleportToStation(idx, smooth = false) {
  currentStationIdx = idx;
  const st = STATIONS[idx];
  const gy = sampleGroundHeight(st.pos.x, st.pos.z, -4.2);
  currentGroundY = gy;

  playerRig.position.set(st.pos.x, gy, st.pos.z);
  camera.position.set(0, humanEyeHeight, 0);

  const yawRad = THREE.MathUtils.degToRad(st.yawDeg);
  camera.rotation.set(0, yawRad, 0, 'YXZ');

  updateStationCard(idx);
}

renderStationsUI();
updateStationCard(0);

// Botões de Modo Caminhada 1:1 vs Modo Drone
const btnWalk = document.getElementById('btn-mode-walk');
const btnDrone = document.getElementById('btn-mode-drone');

function setLocomotionMode(drone) {
  isDroneMode = drone;
  btnWalk.classList.toggle('active', !drone);
  btnDrone.classList.toggle('active', drone);
  hudLocomotionEl.textContent = drone ? 'Voo Livre / Drone' : 'Caminhada no Chão (1:1)';
  if (!drone) {
    currentGroundY = sampleGroundHeight(playerRig.position.x, playerRig.position.z, currentGroundY);
    playerRig.position.y = currentGroundY;
    camera.position.y = humanEyeHeight;
  }
}

btnWalk.addEventListener('click', () => setLocomotionMode(false));
btnDrone.addEventListener('click', () => setLocomotionMode(true));

// Slider de Altura Humana (1.50m a 1.95m)
const sliderHeight = document.getElementById('slider-height');
const lblHeightVal = document.getElementById('lbl-height-val');
sliderHeight.addEventListener('input', (e) => {
  humanEyeHeight = parseFloat(e.target.value);
  lblHeightVal.textContent = `${humanEyeHeight.toFixed(2)}m`;
  hudEyeHeightEl.textContent = `${humanEyeHeight.toFixed(2)}m (1:1 Real)`;
  if (!renderer.xr.isPresenting) {
    camera.position.y = humanEyeHeight;
  }
});

// Alternar Paredes da Sala Limitada 360°
const btnToggleRoom = document.getElementById('btn-toggle-room');
function toggleRoomWalls() {
  isRoomVisible = !isRoomVisible;
  roomWallsMeshes.forEach((m) => (m.visible = isRoomVisible));
  btnToggleRoom.classList.toggle('active', isRoomVisible);
  btnToggleRoom.textContent = isRoomVisible ? 'Sala Ativa (R)' : 'Sala Oculta (R)';
}
btnToggleRoom.addEventListener('click', toggleRoomWalls);

// Alternar Silhuetas de Escala Humana 1:1
const btnSilhouettes = document.getElementById('btn-toggle-Silhouettes');
let showSilhouettes = true;
btnSilhouettes.addEventListener('click', () => {
  showSilhouettes = !showSilhouettes;
  silhouetteGroups.forEach((g) => (g.visible = showSilhouettes));
  btnSilhouettes.classList.toggle('active', showSilhouettes);
});

// Controle de Horário / Iluminação (Dia / Pôr do Sol / Noite Rec'n'Play)
document.querySelectorAll('.btn-time').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-time').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.time;
    if (mode === 'day') {
      skyMat.uniforms.topColor.value.setHex(0x0ea5e9);
      skyMat.uniforms.horizonColor.value.setHex(0xbae6fd);
      scene.fog.color.setHex(0x9bd3f5);
      hemiLight.intensity = 1.35;
      sunLight.intensity = 1.85;
      sunLight.color.setHex(0xfff5e0);
    } else if (mode === 'sunset') {
      skyMat.uniforms.topColor.value.setHex(0x311042);
      skyMat.uniforms.horizonColor.value.setHex(0xf97316);
      scene.fog.color.setHex(0xfb923c);
      hemiLight.intensity = 1.05;
      sunLight.intensity = 1.6;
      sunLight.color.setHex(0xfdba74);
    } else if (mode === 'night') {
      skyMat.uniforms.topColor.value.setHex(0x020617);
      skyMat.uniforms.horizonColor.value.setHex(0x0f172a);
      scene.fog.color.setHex(0x090d16);
      hemiLight.intensity = 0.65;
      sunLight.intensity = 0.45;
      sunLight.color.setHex(0x38bdf8);
    }
  });
});

// ============================================================================
// MOVIMENTAÇÃO TECLADO (WASD) + CONTROLES TOUCH PLUS DO META QUEST 3S
// ============================================================================
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
  if (e.code === 'KeyR') toggleRoomWalls();
  if (e.code === 'Space' && isGrounded && !isDroneMode) {
    verticalVelocity = 4.2;
    isGrounded = false;
  }
  if (e.key >= '1' && e.key <= '6') {
    teleportToStation(parseInt(e.key, 10) - 1, true);
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code in keys) keys[e.code] = false;
});

// Leitura dos Joysticks e Gatilhos do Meta Quest 3S em WebXR
let vrSnapCooldown = 0;
function handleQuestControllers(dt) {
  const session = renderer.xr.getSession();
  if (!session) return;

  for (const source of session.inputSources) {
    if (!source.gamepad) continue;
    const axes = source.gamepad.axes;
    const buttons = source.gamepad.buttons;

    // Analógico do controle esquerdo: caminhar em escala 1:1
    if (source.handedness === 'left' && axes.length >= 4) {
      const lx = axes[2];
      const lz = axes[3];
      if (Math.hypot(lx, lz) > 0.12) {
        const speed = 2.6; // Caminhada confortável em VR (m/s)
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

    // Analógico do controle direito: Snap Turn (giro confortável de 30°) + botão A/X para pular de sala
    if (source.handedness === 'right' && axes.length >= 4) {
      const rx = axes[2];
      if (vrSnapCooldown <= 0 && Math.abs(rx) > 0.65) {
        playerRig.rotation.y -= Math.sign(rx) * THREE.MathUtils.degToRad(30);
        vrSnapCooldown = 0.32;
      }
      // Botão A (buttons[4]) avança para a próxima Sala 360°!
      if (buttons[4] && buttons[4].pressed && vrSnapCooldown <= 0) {
        const nextIdx = (currentStationIdx + 1) % STATIONS.length;
        teleportToStation(nextIdx, false);
        vrSnapCooldown = 0.45;
      }
    }
  }
  if (vrSnapCooldown > 0) vrSnapCooldown -= dt;
}

// Loop Principal de Física e Renderização (60–120 FPS)
const clock = new THREE.Clock();
const moveForward = new THREE.Vector3();
const moveRight = new THREE.Vector3();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.getElapsedTime();

  // Animação suave dos anéis das salas e da água
  waterMesh.position.y = -6.2 + Math.sin(elapsed * 1.4) * 0.08;

  // Locomoção no Desktop (WASD / Setas)
  const fwdInput = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  const sideInput = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);

  if (fwdInput !== 0 || sideInput !== 0) {
    // Velocidades reais em escala 1:1: Caminhada humana = 2.2 m/s, Corrida = 5.5 m/s, Drone = 28 m/s
    const baseSpeed = isDroneMode ? 24.0 : 2.2;
    const speed = (keys.ShiftLeft || keys.ShiftRight) ? baseSpeed * 2.4 : baseSpeed;

    camera.getWorldDirection(moveForward);
    if (!isDroneMode) {
      moveForward.y = 0;
    }
    moveForward.normalize();
    moveRight.crossVectors(moveForward, new THREE.Vector3(0, 1, 0)).normalize();

    playerRig.position.addScaledVector(moveForward, fwdInput * speed * dt);
    playerRig.position.addScaledVector(moveRight, sideInput * speed * dt);
  }

  if (isDroneMode) {
    if (keys.Space || keys.KeyE) playerRig.position.y += 14.0 * dt;
    if (keys.KeyQ) playerRig.position.y -= 14.0 * dt;
  } else {
    // Gravidade e ajuste suave de calçada/rua em escala humana 1:1
    const targetGroundY = sampleGroundHeight(playerRig.position.x, playerRig.position.z, currentGroundY);

    // Só sobe degraus/calçadas se a diferença for menor que 2.2m (evita subir em parede de prédio!)
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

  // Controles do Meta Quest 3S quando em WebXR
  handleQuestControllers(dt);

  // Atualiza telemetria de coordenadas 1:1 no HUD
  const px = Math.round(playerRig.position.x);
  const pz = Math.round(playerRig.position.z);
  const alt = (playerRig.position.y + 4.04).toFixed(1);
  hudCoordsEl.textContent = `X: ${px}m | Z: ${pz}m | Alt: ${alt}m`;

  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

loadRecife3DTiles();
