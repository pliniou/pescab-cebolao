// Viewer e carregador com o WebGL e o GLTFLoader substituídos: o resto (OrbitControls, CSS2DRenderer, câmera,
// cena) é o real. Foco na renderização sob demanda e no enquadramento.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';

// WebGLRenderer falso: guarda o laço de animação para o teste avançar quadro a quadro e conta os desenhos
const estado = vi.hoisted(() => ({ laco: null, desenhos: 0, gltfs: {}, progresso: {} }));
vi.mock('three', async (original) => {
  const real = await original();
  class WebGLRendererFalso {
    constructor() { this.domElement = document.createElement('canvas'); this.clippingPlanes = []; }
    setPixelRatio() {}
    setSize(w, h) { this.domElement.width = w; this.domElement.height = h; }
    setAnimationLoop(f) { estado.laco = f; }
    render() { estado.desenhos++; }
  }
  return { ...real, WebGLRenderer: WebGLRendererFalso };
});
vi.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {
    setMeshoptDecoder() { return this; }
    async loadAsync(url, aoProgredir) {
      const arq = url.split('/').pop();
      for (const ev of estado.progresso[arq] ?? []) aoProgredir?.(ev); // eventos de download simulados
      const cena = estado.gltfs[arq];
      if (!cena) throw new Error('404'); // arquivo que não existe (ou fora do cache offline)
      return { scene: cena };
    }
  },
}));

const { criarViewer } = await import('../src/scene/viewer.js');
const { carregarModelos } = await import('../src/scene/modelos.js');

describe('viewer: renderização sob demanda', () => {
  let container, viewer;
  let agora = 0;
  const quadro = () => estado.laco((agora += 16));
  beforeEach(() => {
    estado.desenhos = 0;
    agora = 0;
    vi.stubGlobal('ResizeObserver', class { observe() {} });
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 800 });
    Object.defineProperty(container, 'clientHeight', { value: 600 });
    document.body.appendChild(container);
    viewer = criarViewer(container);
    viewer.enquadrar(0.19);
  });

  it('desenha o primeiro quadro e depois fica parado', () => {
    quadro();
    expect(estado.desenhos).toBe(1);
    for (let i = 0; i < 5; i++) quadro();
    expect(estado.desenhos).toBe(1);
  });

  it('invalidar desenha um quadro e avisa os dependentes', () => {
    quadro();
    const aviso = vi.fn();
    viewer.aoInvalidar.add(aviso);
    viewer.invalidar();
    quadro();
    quadro();
    expect(estado.desenhos).toBe(2);
    expect(aviso).toHaveBeenCalledTimes(1);
  });

  it('interação do usuário (clique, teclado, controle do painel) pede quadro', () => {
    quadro();
    for (const tipo of ['click', 'keydown', 'input']) {
      document.body.dispatchEvent(new Event(tipo, { bubbles: true }));
      quadro();
    }
    expect(estado.desenhos).toBe(4);
  });

  it('tarefa que devolve true redesenha sem invalidar', () => {
    quadro();
    const aviso = vi.fn();
    viewer.aoInvalidar.add(aviso);
    let restantes = 3;
    viewer.tarefas.add(() => restantes-- > 0);
    for (let i = 0; i < 6; i++) quadro();
    expect(estado.desenhos).toBe(4);
    expect(aviso).not.toHaveBeenCalled();
  });

  it('animação de câmera redesenha até chegar e para', () => {
    quadro();
    viewer.vista('anterior');
    for (let i = 0; i < 120; i++) quadro();
    const n = estado.desenhos;
    expect(n).toBeGreaterThan(2);
    const dir = viewer.camera.position.clone().sub(viewer.controls.target).normalize();
    expect(dir.z).toBeCloseTo(1, 3);
    for (let i = 0; i < 5; i++) quadro();
    expect(estado.desenhos).toBe(n);
  });

  it('deslocar desliza a imagem até o novo centro, redesenhando até chegar; movimento reduzido vai direto', () => {
    quadro();
    viewer.deslocar(0.3);
    quadro();
    expect(estado.desenhos).toBe(2);
    expect(viewer.camera.view?.enabled).toBe(true);
    const meio = viewer.camera.view.offsetY;
    expect(meio).toBeGreaterThan(0);
    expect(meio).toBeLessThan(600 * 0.3); // ainda a caminho
    for (let i = 0; i < 60; i++) quadro();
    expect(viewer.camera.view.offsetY).toBeCloseTo(600 * 0.3, 6);
    const n = estado.desenhos;
    quadro();
    expect(estado.desenhos).toBe(n); // chegou: para de redesenhar
    viewer.deslocar(0);
    for (let i = 0; i < 60; i++) quadro();
    expect(viewer.camera.view?.enabled ?? false).toBe(false);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    viewer.deslocar(0.2);
    expect(viewer.camera.view.offsetY).toBeCloseTo(600 * 0.2, 6);
    vi.unstubAllGlobals();
  });

  it('digitar num campo de texto não redesenha; o canvas tem nome e os rótulos ficam fora do leitor de tela', () => {
    quadro();
    const campo = document.createElement('input');
    campo.type = 'search';
    document.body.appendChild(campo);
    campo.dispatchEvent(new Event('keydown', { bubbles: true }));
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    quadro();
    expect(estado.desenhos).toBe(1);
    campo.remove();
    expect(viewer.renderer.domElement.getAttribute('role')).toBe('img');
    expect(viewer.renderer.domElement.getAttribute('aria-label')).toBeTruthy();
    expect(container.querySelector('.rotulos').getAttribute('aria-hidden')).toBe('true');
  });

  it('destino e voltarPara: um modo guarda a câmera (ou para onde ela ia) e volta para lá', () => {
    viewer.vista('anterior');
    const salvo = viewer.destino();
    expect(salvo.p.clone().sub(salvo.a).normalize().z).toBeCloseTo(1, 6); // o destino da animação, não o meio do caminho
    for (let i = 0; i < 120; i++) quadro();
    viewer.vista('superior');
    for (let i = 0; i < 120; i++) quadro();
    viewer.voltarPara(salvo);
    for (let i = 0; i < 120; i++) quadro();
    expect(viewer.camera.position.distanceTo(salvo.p)).toBeLessThan(1e-6);
    expect(viewer.controls.target.distanceTo(salvo.a)).toBeLessThan(1e-6);
  });

  it('enquadrarCaixa mira o centro e afasta o suficiente para caber; focar mantém a direção', () => {
    const caixa = new THREE.Box3(new THREE.Vector3(0.1, 0.1, 0.1), new THREE.Vector3(0.2, 0.2, 0.2));
    viewer.enquadrarCaixa(caixa, 'lateralE');
    for (let i = 0; i < 120; i++) quadro();
    expect(viewer.controls.target.distanceTo(new THREE.Vector3(0.15, 0.15, 0.15))).toBeLessThan(1e-6);
    const raio = caixa.getBoundingSphere(new THREE.Sphere()).radius;
    expect(viewer.camera.position.distanceTo(viewer.controls.target)).toBeGreaterThan(raio / Math.sin(THREE.MathUtils.degToRad(17.5)));
    const dir = viewer.camera.position.clone().sub(viewer.controls.target).normalize();
    viewer.focar(new THREE.Vector3(0, 0, 0));
    for (let i = 0; i < 120; i++) quadro();
    expect(viewer.controls.target.length()).toBeLessThan(1e-6);
    expect(viewer.camera.position.clone().sub(viewer.controls.target).normalize().distanceTo(dir)).toBeLessThan(1e-6);
    viewer.enquadrarCaixa(caixa); // sem vista: mantém a direção atual
    viewer.resetar();
    for (let i = 0; i < 120; i++) quadro();
    expect(viewer.controls.target.y).toBeCloseTo(-0.02);
  });

  it('em retrato o enquadramento inicial e o reset cabem na largura (o lado mais apertado)', () => {
    const retrato = document.createElement('div');
    Object.defineProperty(retrato, 'clientWidth', { value: 300 });
    Object.defineProperty(retrato, 'clientHeight', { value: 600 });
    document.body.appendChild(retrato);
    const v = criarViewer(retrato);
    v.enquadrar(0.19);
    const meiaLargura = (dist) => dist * Math.tan(THREE.MathUtils.degToRad(v.camera.fov / 2)) * v.camera.aspect;
    expect(meiaLargura(v.camera.position.distanceTo(v.controls.target))).toBeGreaterThan(0.19);
    v.camera.position.set(0, 0, 0.3); // usuário aproximou; o reset volta à distância que cabe
    v.resetar();
    for (let i = 0; i < 120; i++) estado.laco((agora += 16));
    expect(meiaLargura(v.camera.position.distanceTo(v.controls.target))).toBeGreaterThan(0.19);
  });

  it('pegar a câmera (start) cancela a animação em curso; movimento reduzido vai direto', () => {
    quadro();
    viewer.vista('anterior');
    quadro();
    const meio = viewer.camera.position.clone();
    viewer.controls.dispatchEvent({ type: 'start' });
    for (let i = 0; i < 60; i++) quadro();
    expect(viewer.camera.position.distanceTo(meio)).toBeLessThan(1e-9); // parou onde estava
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    viewer.vista('superior');
    quadro();
    expect(viewer.camera.position.clone().sub(viewer.controls.target).normalize().y).toBeCloseTo(1, 3);
    viewer.enquadrarCaixa(new THREE.Box3()); // caixa vazia: nada muda
    viewer.aproximar(new THREE.Box3());
    quadro();
    expect(viewer.camera.position.clone().sub(viewer.controls.target).normalize().y).toBeCloseTo(1, 3);
    vi.unstubAllGlobals();
  });

  it('aproximar vai até a peça, de perto, e gira para o lado dela; peça no eixo mantém a direção', () => {
    const lateral = new THREE.Box3(new THREE.Vector3(0.06, -0.03, -0.01), new THREE.Vector3(0.08, -0.01, 0.01)); // à esquerda (x > 0)
    const dir0 = viewer.camera.position.clone().sub(viewer.controls.target).normalize();
    viewer.aproximar(lateral);
    for (let i = 0; i < 120; i++) quadro();
    const centro = lateral.getCenter(new THREE.Vector3());
    expect(viewer.controls.target.distanceTo(centro)).toBeLessThan(1e-6);
    const off = viewer.camera.position.clone().sub(viewer.controls.target);
    const raio = lateral.getBoundingSphere(new THREE.Sphere()).radius;
    expect(off.length()).toBeGreaterThan(2 * raio / Math.sin(THREE.MathUtils.degToRad(17.5))); // folga: a peça não enche a vista
    expect(off.normalize().x).toBeGreaterThan(dir0.x); // girou para o lado da peça
    const noEixo = new THREE.Box3(new THREE.Vector3(-0.005, -0.025, -0.005), new THREE.Vector3(0.005, -0.015, 0.005));
    const dir1 = viewer.camera.position.clone().sub(viewer.controls.target).normalize();
    viewer.vista('anterior'); // aproximar durante uma animação parte da direção para onde ela vai
    viewer.aproximar(noEixo);
    for (let i = 0; i < 120; i++) quadro();
    expect(viewer.camera.position.clone().sub(viewer.controls.target).normalize().z).toBeCloseTo(1, 3);
    expect(dir1.z).toBeLessThan(1);
  });
});

describe('carregarModelos', () => {
  it('um grupo por camada, malhas indexadas pelo id com metadados e material próprio', async () => {
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const malha = (nome, extras) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), material);
      m.name = nome;
      Object.assign(m.userData, extras);
      return m;
    };
    const cenaOssos = new THREE.Group();
    cenaOssos.add(malha('FMA52748', {}), malha('no_sem_id', { id: 'FMA52734' }));
    const cenaDentes = new THREE.Group();
    cenaDentes.add(malha('gingiva', {}));
    estado.gltfs = { 'ossos.glb': cenaOssos, 'dentes.glb': cenaDentes };
    const porId = new Map([['FMA52748', { id: 'FMA52748', en: 'mandible' }]]);
    const scene = new THREE.Scene();
    const progresso = [];
    const { grupos, malhas } = await carregarModelos(scene, ['ossos', 'dentes'], porId, (p) => progresso.push(p));
    expect(Object.keys(grupos).sort()).toEqual(['dentes', 'ossos']);
    expect(scene.children).toHaveLength(2);
    expect([...malhas.keys()].sort()).toEqual(['FMA52734', 'FMA52748', 'gingiva']);
    const mand = malhas.get('FMA52748');
    expect(mand.userData).toMatchObject({ id: 'FMA52748', camada: 'ossos', info: { en: 'mandible' } });
    expect(mand.geometry.attributes.normal).toBeTruthy();
    expect(mand.material).not.toBe(material);
    expect(mand.material.userData.cor.getHex()).toBe(0xff0000);
    expect(malhas.get('FMA52734').userData.info).toBeNull();
    expect(progresso.sort()).toEqual([0.5, 1]);
  });

  it('progresso por bytes quando o tamanho de todas é conhecido (camadas de tamanhos muito diferentes)', async () => {
    estado.gltfs = { 'ossos.glb': new THREE.Group(), 'nervos.glb': new THREE.Group() };
    const ev = (loaded, total) => ({ lengthComputable: true, loaded, total });
    estado.progresso = { 'ossos.glb': [ev(10, 100)], 'nervos.glb': [ev(0, 900), { lengthComputable: false }] };
    const progresso = [];
    await carregarModelos(new THREE.Scene(), ['ossos', 'nervos'], new Map(), (p) => progresso.push(p));
    estado.progresso = {};
    expect(progresso[0]).toBe(0);            // só uma camada com tamanho: conta camadas prontas
    expect(progresso[1]).toBeCloseTo(0.01);   // as duas com tamanho: 10 de 1000 bytes
    expect(progresso.at(-1)).toBe(1);
  });

  it('arquivo que falta: o erro diz qual camada falhou e guarda a causa', async () => {
    estado.gltfs = { 'ossos.glb': new THREE.Group() };
    const erro = await carregarModelos(new THREE.Scene(), ['ossos', 'nervos'], new Map()).catch((e) => e);
    expect(erro.camada).toBe('nervos');
    expect(erro.message).toContain('"nervos"');
    expect(erro.cause.message).toBe('404');
  });
});
