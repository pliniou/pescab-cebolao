// Renderizador, câmera, OrbitControls, luzes e laço de animação.
// Renderização sob demanda: a cena só é desenhada quando algo mudou. Há dois sinais:
// - invalidar(): o estado da cena mudou (câmera, visibilidade, cores, cortes, explosão). Avisa quem depende disso
//   (aoInvalidar, p. ex. os rótulos) e pede um quadro. É chamado pelos controles da câmera, pelo resize e por toda
//   interação do usuário (toque, clique, teclado, controles do painel), que é de onde nasce qualquer mudança de estado.
// - uma tarefa por quadro que retorna true: só precisa redesenhar (animação em curso, pulso de destaque).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

// Direções da câmera (+X = esquerdo do paciente, +Y = superior, +Z = anterior)
const VISTAS = {
  anterior: [0, 0, 1],
  posterior: [0, 0, -1],
  lateralD: [-1, 0, 0],
  lateralE: [1, 0, 0],
  superior: [0, 1, 0.001],
  inferior: [0, -1, 0.001],
};

// Interações que podem mudar o estado da cena (capturadas antes dos handlers; o quadro sai depois deles).
const INTERACOES = ['pointerdown', 'pointerup', 'click', 'input', 'change', 'keydown', 'wheel'];
// Digitar num campo de texto (a busca, o nome na pintura) não muda a cena; o que a tecla provoca (Enter escolhe uma
// estrutura) invalida pelo próprio caminho. Sem esse filtro, cada letra redesenhava a cena e rearranjava os rótulos.
const ehCampoDeTexto = (alvo) => alvo instanceof HTMLInputElement && (alvo.type === 'search' || alvo.type === 'text');

// Caixa (coordenadas do mundo) que envolve os objetos; vazia se a lista for vazia.
export function caixaDosObjetos(objetos) {
  const caixa = new THREE.Box3();
  for (const o of objetos) caixa.expandByObject(o);
  return caixa;
}

export function criarViewer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // para o leitor de tela o canvas é uma imagem com nome; main.js acrescenta a estrutura selecionada
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Modelo 3D de cabeça e pescoço');
  container.appendChild(renderer.domElement);

  // os rótulos 3D repetem nomes que a ficha e o índice já dão: fora da árvore de acessibilidade
  const rotulos = new CSS2DRenderer();
  rotulos.domElement.className = 'rotulos';
  rotulos.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(rotulos.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.005, 20);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x50555c, 1.6));
  const luz = new THREE.DirectionalLight(0xffffff, 1.8);
  luz.position.set(0.3, 0.6, 0.2);
  camera.add(luz); // a luz acompanha a câmera

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.minDistance = 0.08;
  controls.maxDistance = 3;

  let sujo = true;
  const aoInvalidar = new Set();
  function invalidar() {
    sujo = true;
    for (const f of aoInvalidar) f();
  }
  controls.addEventListener('change', invalidar); // inclui a inércia (damping) e as animações de câmera
  for (const tipo of INTERACOES) {
    window.addEventListener(tipo, (ev) => { if (!ehCampoDeTexto(ev.target)) invalidar(); }, { capture: true, passive: true });
  }

  const alvo0 = new THREE.Vector3(0, -0.02, 0);
  let raio0 = 0.19; // raio da cabeça inteira (enquadrar); a distância sai dele na hora, com a proporção atual da vista
  let anim = null;
  // o usuário pegou a câmera: a animação em curso para ali, em vez de brigar com o gesto
  controls.addEventListener('start', () => { anim = null; });
  const semMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Distância que faz uma esfera de raio r caber na vista, pelo lado mais apertado (em retrato, a largura), × folga
  function distanciaPara(r, folga) {
    const fovV = THREE.MathUtils.degToRad(camera.fov / 2);
    const fovH = Math.atan(Math.tan(fovV) * camera.aspect);
    return r / Math.sin(Math.min(fovV, fovH)) * folga;
  }
  const FOLGA_INTEIRO = 1.05;

  function irPara(dir, dist = distanciaPara(raio0, FOLGA_INTEIRO), alvo = alvo0) {
    const fim = new THREE.Vector3(...dir).normalize().multiplyScalar(dist).add(alvo);
    anim = { t: 0, p0: camera.position.clone(), p1: fim, a0: controls.target.clone(), a1: alvo.clone() };
  }
  const vista = (nome) => irPara(VISTAS[nome]);
  // Enquadra uma caixa (Box3) olhando pela vista indicada (ou pela direção atual)
  function enquadrarCaixa(caixa, nome) {
    if (caixa.isEmpty()) return;
    const esfera = caixa.getBoundingSphere(new THREE.Sphere());
    const dist = distanciaPara(esfera.radius, FOLGA_INTEIRO);
    const dir = nome === 'reset' ? [0.35, 0.15, 1] : nome ? VISTAS[nome] : camera.position.clone().sub(controls.target).toArray();
    irPara(dir, dist, esfera.center);
  }
  // Leva o alvo da órbita até o ponto, mantendo a direção e a distância da câmera. Com uma animação em curso
  // (um roteiro enquadrando a cena), mantém a direção e a distância de onde ela ia chegar.
  function focar(ponto) {
    const destino = anim ? anim.p1 : camera.position, alvo = anim ? anim.a1 : controls.target;
    const off = destino.clone().sub(alvo);
    anim = { t: 0, p0: camera.position.clone(), p1: ponto.clone().add(off), a0: controls.target.clone(), a1: ponto.clone() };
  }
  // O foco da Bandeja Clínica: a câmera vai até a estrutura, aproxima até ela ocupar cerca de um terço da vista e gira
  // para o lado dela (a direção atual puxada para a direção radial, do centro da cabeça até a peça), para que uma
  // estrutura lateral ou profunda apareça em vez de ficar atrás do resto.
  const FOLGA_FOCO = 2.6;   // distância = a que enquadra a esfera da peça × folga (≈ 35% da vista)
  const PUXAO_RADIAL = 1.2; // peso da direção radial somada à direção atual
  function aproximar(caixa, folga = FOLGA_FOCO) {
    if (caixa.isEmpty()) return;
    const esfera = caixa.getBoundingSphere(new THREE.Sphere());
    const dist = distanciaPara(esfera.radius, folga);
    const dir = (anim ? anim.p1.clone().sub(anim.a1) : camera.position.clone().sub(controls.target)).normalize();
    const radial = esfera.center.clone().sub(alvo0);
    if (radial.length() > 0.015) dir.addScaledVector(radial.normalize(), PUXAO_RADIAL).normalize(); // peça fora do eixo
    irPara(dir.toArray(), dist, esfera.center);
  }
  const resetar = () => irPara([0.35, 0.15, 1]);
  // Onde a câmera está, ou para onde vai se houver animação: um modo guarda isso ao entrar e volta para lá ao sair, e
  // o foco calcula daí o que fica na frente da peça
  const destino = () => ({ p: (anim ? anim.p1 : camera.position).clone(), a: (anim ? anim.a1 : controls.target).clone() });
  function voltarPara({ p, a }) {
    anim = { t: 0, p0: camera.position.clone(), p1: p.clone(), a0: controls.target.clone(), a1: a.clone() };
  }

  function enquadrar(raio) {
    raio0 = raio;
    camera.position.set(0.35, 0.15, 1).normalize().multiplyScalar(distanciaPara(raio0, FOLGA_INTEIRO)).add(alvo0);
    controls.target.copy(alvo0);
  }

  // Desloca o centro da imagem para cima (fy, fração da altura) e para a esquerda (fx, fração da largura), quando a
  // lateral cobre um canto da vista (tablet). A imagem desliza até o novo centro junto com a câmera, em vez de saltar
  // (com movimento reduzido, vai direto).
  let deslocY = 0, deslocX = 0;
  let alvoY = 0, alvoX = 0;
  function projetar() {
    const w = container.clientWidth, h = container.clientHeight;
    if (Math.abs(deslocY) > 1e-4 || Math.abs(deslocX) > 1e-4) camera.setViewOffset(w, h, w * deslocX, h * deslocY, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function redimensionar() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    rotulos.setSize(w, h);
    camera.aspect = w / h;
    projetar();
    invalidar();
  }
  function deslocar(fy, fx = 0) {
    alvoY = fy; alvoX = fx;
    if (semMovimento()) { deslocY = fy; deslocX = fx; }
    projetar();
    invalidar();
  }
  // tarefa do laço: aproxima o deslocamento do alvo (desaceleração exponencial, ~0,3 s)
  function deslizar(dt) {
    if (deslocY === alvoY && deslocX === alvoX) return false;
    const k = 1 - Math.exp(-dt * 12);
    deslocY += (alvoY - deslocY) * k;
    deslocX += (alvoX - deslocX) * k;
    if (Math.abs(alvoY - deslocY) < 1e-3 && Math.abs(alvoX - deslocX) < 1e-3) { deslocY = alvoY; deslocX = alvoX; }
    projetar();
    invalidar();
    return true;
  }
  new ResizeObserver(redimensionar).observe(container);
  redimensionar();

  const tarefas = new Set([deslizar]); // (dt) => true se precisa redesenhar
  const relogio = new THREE.Timer();
  relogio.connect(document); // aba em segundo plano não acumula tempo
  renderer.setAnimationLoop((t) => {
    relogio.update(t);
    const dt = Math.min(relogio.getDelta(), 0.1);
    if (anim) {
      anim.t = semMovimento() ? 1 : Math.min(1, anim.t + dt / 0.45); // movimento reduzido: vai direto
      const k = 1 - Math.pow(1 - anim.t, 3);
      camera.position.lerpVectors(anim.p0, anim.p1, k);
      controls.target.lerpVectors(anim.a0, anim.a1, k);
      if (anim.t >= 1) anim = null;
    }
    for (const f of tarefas) if (f(dt)) sujo = true;
    controls.update(); // dispara 'change' (→ invalidar) se a câmera se moveu
    if (!sujo) return;
    sujo = false;
    renderer.render(scene, camera);
    rotulos.render(scene, camera);
  });

  return {
    renderer, scene, camera, controls, tarefas, aoInvalidar, invalidar,
    vista, resetar, enquadrar, irPara, focar, aproximar, enquadrarCaixa, deslocar, destino, voltarPara,
  };
}
