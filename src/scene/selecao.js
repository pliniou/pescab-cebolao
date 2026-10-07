// Seleção por clique/toque (distingue toque de arrasto), destaque, duplo clique/toque para isolar e desfazer.
import * as THREE from 'three';
import { visivel } from '../util.js';
import { corDoTema } from './tema3d.js';
import { INVISIVEL } from './raiox.js';

const TOLERANCIA_PX = 6;
const TEMPO_TOQUE = 500;   // ms
const DUPLO = 320;         // ms entre toques
const PRETO = new THREE.Color(0);

export function criarSelecao(viewer, modelos, { aoSelecionar, aoMudarIsolamento, filtroPonto } = {}) {
  const { renderer, camera } = viewer;
  const el = renderer.domElement;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let selecionada = null;
  let inicio = null;
  let ultimoToque = { t: 0, id: null };
  const pilha = []; // snapshots de visibilidade para desfazer o isolamento

  let interceptar = null; // (hits) => true para consumir o toque (usado pelo quiz)

  function acertos(x, y) {
    const r = el.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const alvos = [...modelos.malhas.values()].filter((m) => visivel(m) && m.material.opacity > INVISIVEL);
    return ray.intersectObjects(alvos, false).filter((h) => !filtroPonto || filtroPonto(h.point));
  }
  function escolher(hits) {
    // Camadas em raio-X (translúcidas) não "bloqueiam" o clique nas estruturas opacas atrás delas.
    const opaco = hits.find((h) => h.object.material.opacity >= 0.5);
    return (opaco || hits[0])?.object ?? null;
  }

  function destacar(m, ligar) {
    if (!m) return;
    // destaque na cor do token --selecao-3d (caneta um pouco mais clara); apagar = sem emissão
    if (ligar) corDoTema('selecao-3d', m.material.emissive); else m.material.emissive.copy(PRETO);
    m.material.emissiveIntensity = ligar ? 0.55 : 1;
  }

  function selecionar(m) {
    if (selecionada === m) return;
    destacar(selecionada, false);
    selecionada = m;
    destacar(m, true);
    aoSelecionar?.(m);
  }
  // A seleção só vale para o que está à vista: estrutura oculta (ou com a camada desligada) sai da seleção, junto com
  // a ficha, o foco e a etiqueta. Regra única, chamada por toda mudança de visibilidade.
  function conferir() {
    if (selecionada && !visivel(selecionada)) selecionar(null);
  }

  function instantaneo() {
    const s = new Map();
    for (const [id, m] of modelos.malhas) s.set(id, m.visible);
    const g = {};
    for (const [c, grupo] of Object.entries(modelos.grupos)) g[c] = grupo.visible;
    return { s, g };
  }
  function restaurar({ s, g }) {
    for (const [id, v] of s) modelos.malhas.get(id).visible = v;
    for (const [c, v] of Object.entries(g)) modelos.grupos[c].visible = v;
  }

  function isolar(ms) {
    const lista = [].concat(ms).filter(Boolean);
    if (!lista.length) return;
    pilha.push(instantaneo());
    const manter = new Set(lista);
    for (const m of modelos.malhas.values()) m.visible = manter.has(m);
    for (const m of lista) modelos.grupos[m.userData.camada].visible = true;
    conferir();
    aoMudarIsolamento?.(pilha.length);
  }
  function desfazer() {
    if (!pilha.length) return;
    restaurar(pilha.pop());
    conferir();
    aoMudarIsolamento?.(pilha.length);
  }

  el.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary) { inicio = null; return; }
    inicio = { x: e.clientX, y: e.clientY, t: performance.now() };
  });
  el.addEventListener('pointerup', (e) => {
    if (!inicio || !e.isPrimary) return;
    const mov = Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y);
    const dur = performance.now() - inicio.t;
    inicio = null;
    if (mov > TOLERANCIA_PX || dur > TEMPO_TOQUE) return; // foi arrasto (girar/mover), não toque
    const hits = acertos(e.clientX, e.clientY);
    if (interceptar?.(hits)) return;
    const m = escolher(hits);
    const agora = performance.now();
    const id = m?.userData.id ?? null;
    if (m && ultimoToque.id === id && agora - ultimoToque.t < DUPLO) {
      ultimoToque = { t: 0, id: null };
      isolar(m);
      return;
    }
    ultimoToque = { t: agora, id };
    selecionar(m);
  });
  // Mais de um dedo = gesto de zoom/giro: cancela o toque.
  el.addEventListener('pointercancel', () => { inicio = null; });

  return {
    selecionar, isolar, desfazer,
    set interceptar(f) { interceptar = f; },
    // guarda a visibilidade atual na pilha do "Desfazer" (antes de aplicar um roteiro, por exemplo)
    salvar() { pilha.push(instantaneo()); aoMudarIsolamento?.(pilha.length); },
    // captura/restauração fora da pilha (modos que devolvem a cena ao sair, sem depender do "Desfazer")
    capturar: instantaneo,
    restaurar(s) {
      restaurar(s);
      conferir();
    },
    conferir,
    // o tema mudou: o brilho da selecionada volta a ler --selecao-3d
    redestacar() { destacar(selecionada, true); },
    get selecionada() { return selecionada; },
    get nivelIsolamento() { return pilha.length; },
    // descarta o que foi empilhado depois do nível n (o que um modo empilhou não pode ser desfeito fora dele)
    cortarPilha(n) {
      if (pilha.length <= n) return;
      pilha.length = n;
      aoMudarIsolamento?.(pilha.length);
    },
    // Mostra as estruturas ocultas uma a uma; as camadas desligadas no painel continuam desligadas.
    mostrarOcultas() {
      pilha.push(instantaneo());
      for (const m of modelos.malhas.values()) m.visible = true;
      aoMudarIsolamento?.(pilha.length);
    },
  };
}
