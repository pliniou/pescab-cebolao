// Cena mínima para os testes: malhas reais do three.js (caixas) preparadas como o carregador faz.
import * as THREE from 'three';
import { vi } from 'vitest';
import { prepararMalha } from '../src/scene/modelos.js';
import dados from '../src/data/estruturas.json';

export const CAMADAS = ['ossos', 'vertebras', 'dentes', 'musculos', 'nervos', 'arterias', 'veias', 'glandulas'];
export const DADOS = dados;
export const porEn = (en, lado) => dados.estruturas.find((e) => e.en === en && (!lado || e.lado === lado));

// estruturas: entradas do dicionário, com `pos` opcional ([x, y, z] em m) e `tam` (aresta da caixa)
export function criarModelos(estruturas, camadas = CAMADAS) {
  const porId = new Map(estruturas.map((e) => [e.id, e]));
  const grupos = {};
  const malhas = new Map();
  for (const c of camadas) {
    const g = new THREE.Group();
    g.name = c;
    g.userData.camada = c;
    grupos[c] = g;
  }
  estruturas.forEach((e, i) => {
    const t = e.tam ?? 0.01;
    const m = new THREE.Mesh(new THREE.BoxGeometry(t, t, t), new THREE.MeshStandardMaterial({ color: 0x808080 }));
    m.name = e.id;
    m.position.set(...(e.pos ?? [i * 0.02, 0, 0]));
    prepararMalha(m, e.camada, porId);
    grupos[e.camada].add(m);
    malhas.set(e.id, m);
  });
  const scene = new THREE.Scene();
  for (const g of Object.values(grupos)) scene.add(g);
  scene.updateMatrixWorld(true);
  return { grupos, malhas, scene };
}

// Viewer sem WebGL: mesma interface que os módulos usam de criarViewer.
export function criarViewerFalso({ largura = 100, altura = 100 } = {}) {
  const camera = new THREE.PerspectiveCamera(35, largura / altura, 0.005, 20);
  camera.position.set(0, 0, 1);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const canvas = document.createElement('canvas');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: largura, height: altura, right: largura, bottom: altura });
  Object.defineProperty(canvas, 'clientWidth', { value: largura });
  Object.defineProperty(canvas, 'clientHeight', { value: altura });
  const aoInvalidar = new Set();
  const viewer = {
    camera,
    renderer: { clippingPlanes: [], domElement: canvas },
    tarefas: new Set(),
    aoInvalidar,
    invalidacoes: 0,
    invalidar() { viewer.invalidacoes++; for (const f of aoInvalidar) f(); },
    deslocar: vi.fn(),
    enquadrarCaixa: vi.fn(),
    resetar: vi.fn(),
    // a câmera falsa não anima: o destino é onde ela está, e voltar só registra o pedido
    destino: () => ({ p: camera.position.clone(), a: new THREE.Vector3() }),
    voltarPara: vi.fn(),
    // roda as tarefas de um quadro; devolve true se alguma pediu redesenho
    quadro(dt = 0.016) { let r = false; for (const f of viewer.tarefas) if (f(dt)) r = true; return r; },
  };
  return viewer;
}

// Toque (pointerdown + pointerup no mesmo ponto) no elemento
export function tocar(el, x, y) {
  el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, isPrimary: true, bubbles: true }));
  el.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, isPrimary: true, bubbles: true }));
}
