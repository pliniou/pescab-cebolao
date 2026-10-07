// Rótulos CSS2D: um por estrutura, ancorado no vértice mais próximo do centro da caixa (acompanha a explosão).
// Só aparecem para estruturas visíveis e não cortadas. Para não amontoar, rótulos que se sobreporiam a outro
// já colocado são ocultados (a estrutura selecionada tem prioridade, depois as mais próximas da câmera), assim como os
// que cruzariam a lateral (no tablet ela desce sobre a vista) ou as réguas da vista (seriam cortados por elas).
// Com os rótulos desligados, só a estrutura selecionada ganha etiqueta; cada rótulo é criado quando precisa aparecer.
// O arranjo só é recalculado quando a cena muda (viewer.aoInvalidar) e para de mudar por QUIETO segundos: durante um
// giro, uma explosão ou o arraste de um controle os rótulos acompanham a peça e o arranjo sai uma vez, no fim (um
// arranjo com todas as camadas custa dezenas de ms e, a cada 200 ms, travava o giro). Num movimento longo, ele sai
// mesmo assim a cada ESPERA_MAX segundos.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { visivel } from '../util.js';
import { INVISIVEL } from './raiox.js';

const ALTURA = 19;   // px (aprox.; condensada em caixa alta a 13 px, com o respiro da etiqueta)
const LARGURA_LETRA = 7; // px por letra: caixa alta com entreletra de 0,05em
const CHAMADA = 14;  // px, linha de chamada entre o rótulo e a peça (igual a --chamada no CSS)
const CHAMADA_SELECIONADA = 40; // px, a da estrutura selecionada (.rotulo.selecionado no CSS)
// Elementos que nenhum rótulo deve cruzar: as réguas da vista e a lateral (que no tablet desce sobre a vista; no
// desktop e no celular ela fica fora do canvas e não colide com nada)
const OBSTACULOS = '.lateral, .vistas, .barra-inferior > *, .avisos > :not([hidden])';
const QUIETO = 0.12;     // s sem mudança na cena antes de arranjar
const ESPERA_MAX = 1;    // s: num movimento contínuo, arranja ao menos nesse intervalo
// Teste de oclusão (raios contra o modelo) é o custo do arranjo: só os candidatos mais prioritários que já cabem na
// tela passam por ele; os outros ficariam escondidos pela sobreposição de qualquer forma
const MAX_OCLUSAO = 24;

export function criarRotulos(viewer, modelos, cortes) {
  let ligado = false;
  let selecionada = null;
  let pendente = false; // a cena mudou desde o último arranjo
  const itens = [];
  const porMalha = new Map(); // malha → item: o rótulo é criado sob demanda
  const w = new THREE.Vector3();

  // Cria o rótulo de uma malha (a âncora exige varrer os vértices dela). Com os rótulos desligados só a selecionada
  // ganha rótulo: a primeira seleção não paga a varredura do modelo inteiro.
  const c = new THREE.Vector3(), v = new THREE.Vector3();
  function criarItem(m) {
    if (porMalha.has(m)) return;
    const pos = m.geometry.attributes.position;
    m.geometry.boundingBox.getCenter(c);
    // alvo: ponto além do centro, na direção radial (a partir do centro do crânio) → âncora na face externa
    m.updateMatrixWorld(true);
    const radial = m.localToWorld(c.clone()).normalize();
    c.addScaledVector(radial, m.geometry.boundingBox.getSize(v).length() / 2);
    let melhor = Infinity;
    const ancora = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const d = v.distanceToSquared(c);
      if (d < melhor) { melhor = d; ancora.copy(v); }
    }
    const div = document.createElement('div');
    // a conferir em livro-texto: a etiqueta vira fita de autoclave lisa, como na ficha
  div.className = m.userData.info?.revisar ? 'rotulo a-conferir' : 'rotulo';
    div.textContent = m.userData.info?.pt || m.userData.id;
    const obj = new CSS2DObject(div);
    obj.position.copy(ancora);
    obj.center.set(0.5, 1 + CHAMADA / ALTURA); // a base do rótulo fica CHAMADA px acima da âncora
    m.add(obj);
    const it = { m, obj, div, larg: div.textContent.length * LARGURA_LETRA + 12 };
    itens.push(it);
    porMalha.set(m, it);
  }
  function criar() { for (const m of modelos.malhas.values()) criarItem(m); }

  // Oculto se uma estrutura opaca e visível estiver entre a câmera e a âncora do rótulo
  const ray = new THREE.Raycaster();
  const dir = new THREE.Vector3();
  function oculto(it, pos, opacas) {
    dir.copy(pos).sub(viewer.camera.position);
    const d = dir.length();
    ray.set(viewer.camera.position, dir.normalize());
    ray.far = d - 0.002;
    return ray.intersectObjects(opacas, false).some((h) => h.object !== it.m && cortes.mantem(h.point));
  }

  let quieto = 0;   // s desde a última mudança da cena
  let atraso = 0;   // s desde que há arranjo pendente
  viewer.aoInvalidar.add(() => { pendente = true; quieto = 0; });
  viewer.tarefas.add((dt) => {
    // desligados, só a etiqueta da estrutura selecionada aparece
    if ((!ligado && !selecionada) || !pendente) { atraso = 0; return false; }
    quieto += dt;
    atraso += dt;
    if (quieto < QUIETO && atraso < ESPERA_MAX) return false;
    pendente = false;
    atraso = 0;
    arranjar();
    return true; // a visibilidade dos rótulos mudou: redesenhar
  });

  function arranjar() {
    const { camera, renderer } = viewer;
    let opacas = null; // só calculadas se algum rótulo precisar do teste de oclusão
    const pos = new THREE.Vector3();
    const W = renderer.domElement.clientWidth, H = renderer.domElement.clientHeight;
    // áreas ocupadas pela lateral e pelas barras, no mesmo sistema de coordenadas dos rótulos (pixels do canvas)
    const base = renderer.domElement.getBoundingClientRect();
    const ocupadas = [...document.querySelectorAll(OBSTACULOS)]
      .map((el) => el.getBoundingClientRect())
      .filter((b) => b.width && b.height)
      .map((b) => ({ x0: b.left - base.left, x1: b.right - base.left, y0: b.top - base.top, y1: b.bottom - base.top }));
    const postos = [...ocupadas];
    const candidatos = [];
    for (const it of itens) {
      it.obj.visible = false;
      if (!ligado && it.m !== selecionada) continue;
      if (!visivel(it.m) || it.m.material.opacity <= INVISIVEL) continue;
      it.obj.getWorldPosition(w);
      if (!cortes.mantem(w)) continue;
      const dist = w.distanceToSquared(camera.position);
      w.project(camera);
      if (w.z > 1 || Math.abs(w.x) > 1.1 || Math.abs(w.y) > 1.1) continue;
      candidatos.push({ it, x: (w.x + 1) / 2 * W, y: (1 - w.y) / 2 * H, prio: it.m === selecionada ? -1 : dist });
    }
    candidatos.sort((a, b) => a.prio - b.prio);
    let testes = 0;
    for (const c of candidatos) {
      // caixa do rótulo mais a linha de chamada, até a âncora
      const chamada = c.it.m === selecionada ? CHAMADA_SELECIONADA : CHAMADA;
      const r = { x0: c.x - c.it.larg / 2, x1: c.x + c.it.larg / 2, y0: c.y - chamada - ALTURA, y1: c.y };
      if (r.x0 < 0 || r.x1 > W || r.y0 < 0 || r.y1 > H) continue; // inteiro dentro da vista, ou nada
      if (postos.some((p) => r.x0 < p.x1 && r.x1 > p.x0 && r.y0 < p.y1 && r.y1 > p.y0)) continue;
      if (c.it.m !== selecionada) {
        if (testes >= MAX_OCLUSAO) break;
        testes++;
        opacas ??= [...modelos.malhas.values()].filter((m) => visivel(m) && m.material.opacity >= 0.5);
        if (oculto(c.it, c.it.obj.getWorldPosition(pos), opacas)) continue;
      }
      postos.push(r);
      c.it.obj.visible = true;
    }
  }

  // Mudança que vale na hora (sem esperar a cena aquietar)
  function refazer() {
    viewer.invalidar();
    quieto = QUIETO;
  }

  return {
    get ligado() { return ligado; },
    definir(v) {
      if (v) criar();
      ligado = v;
      if (!v) for (const it of itens) it.obj.visible = false;
      refazer();
    },
    // a estrutura selecionada sempre ganha a etiqueta com chamada, mesmo com os rótulos desligados
    marcar(m) {
      if (m) criarItem(m);
      if (!ligado) for (const it of itens) it.obj.visible = false;
      selecionada = m;
      for (const it of itens) it.div.classList.toggle('selecionado', it.m === selecionada);
      refazer();
    },
  };
}
