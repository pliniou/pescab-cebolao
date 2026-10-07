// Seleção por toque, isolamento, rótulos, modos (quiz/exercício) e roteiros.
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { criarSelecao } from '../src/scene/selecao.js';
import { criarRotulos } from '../src/scene/rotulos.js';
import { criarCortes } from '../src/scene/cortes.js';
import { criarRaioX } from '../src/scene/raiox.js';
import { criarModos } from '../src/ui/modos.js';
import { PRESETS, aplicarPreset } from '../src/ui/presets.js';
import { criarModelos, criarViewerFalso, porEn, tocar, CAMADAS, DADOS } from './fixtures.js';

const comPos = (e, pos, tam) => ({ ...e, pos, tam });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('seleção', () => {
  // frontal na frente (z maior), masseter atrás, no centro da tela; mandíbula fora do centro
  const lista = [comPos(porEn('frontal bone'), [0, 0, 0.1], 0.05), comPos(porEn('masseter', 'D'), [0, 0, 0], 0.05),
    comPos(porEn('mandible'), [0.3, 0, 0], 0.05)];
  let viewer, modelos, selecao, eventos, el;
  const frontal = () => modelos.malhas.get(lista[0].id);
  const masseter = () => modelos.malhas.get(lista[1].id);
  beforeEach(() => {
    viewer = criarViewerFalso();
    modelos = criarModelos(lista);
    eventos = { sel: [], iso: [] };
    selecao = criarSelecao(viewer, modelos, {
      aoSelecionar: (m) => eventos.sel.push(m), aoMudarIsolamento: (n) => eventos.iso.push(n),
    });
    el = viewer.renderer.domElement;
  });

  it('toque seleciona a estrutura opaca mais próxima e a destaca', () => {
    tocar(el, 50, 50);
    expect(selecao.selecionada).toBe(frontal());
    expect(eventos.sel).toEqual([frontal()]);
    expect(frontal().material.emissive.getHex()).not.toBe(0);
  });

  it('estrutura em raio-X (translúcida) não bloqueia a opaca atrás', () => {
    frontal().material.opacity = 0.3;
    tocar(el, 50, 50);
    expect(selecao.selecionada).toBe(masseter());
  });

  it('toque no vazio desfaz a seleção e apaga o destaque', () => {
    tocar(el, 50, 50);
    tocar(el, 2, 2);
    expect(selecao.selecionada).toBeNull();
    expect(frontal().material.emissive.getHex()).toBe(0);
  });

  it('arrasto (movimento grande) não seleciona', () => {
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 50, clientY: 50, isPrimary: true }));
    el.dispatchEvent(new PointerEvent('pointerup', { clientX: 70, clientY: 50, isPrimary: true }));
    expect(selecao.selecionada).toBeNull();
  });

  it('o filtro de corte descarta pontos cortados', () => {
    const s = criarSelecao(viewer, modelos, { filtroPonto: (p) => p.z < 0.05 });
    tocar(el, 50, 50);
    expect(s.selecionada).toBe(masseter());
  });

  it('interceptar consome o toque (quiz/pintura)', () => {
    const recebidos = [];
    selecao.interceptar = (hits) => { recebidos.push(hits.map((h) => h.object)); return true; };
    tocar(el, 50, 50);
    expect(selecao.selecionada).toBeNull();
    expect(recebidos[0][0]).toBe(frontal());
    selecao.interceptar = null;
    tocar(el, 50, 50);
    expect(selecao.selecionada).toBe(frontal());
  });

  it('toque duplo isola; desfazer restaura e reavisa o nível', () => {
    tocar(el, 50, 50);
    tocar(el, 50, 50);
    expect([...modelos.malhas.values()].filter((m) => m.visible)).toEqual([frontal()]);
    expect(selecao.nivelIsolamento).toBe(1);
    selecao.desfazer();
    expect([...modelos.malhas.values()].every((m) => m.visible)).toBe(true);
    expect(eventos.iso).toEqual([1, 0]);
    selecao.desfazer(); // pilha vazia: nada acontece
    expect(eventos.iso).toEqual([1, 0]);
  });

  it('isolar liga a camada da estrutura isolada', () => {
    modelos.grupos.musculos.visible = false;
    selecao.isolar(masseter());
    expect(modelos.grupos.musculos.visible).toBe(true);
    selecao.desfazer();
    expect(modelos.grupos.musculos.visible).toBe(false);
  });

  it('desfazer tira a seleção de estrutura que ficou oculta', () => {
    selecao.salvar();
    selecao.selecionar(masseter());
    masseter().visible = false; // ocultada depois do salvar → volta visível
    selecao.desfazer();
    expect(masseter().visible).toBe(true);
    selecao.isolar(frontal());
    selecao.selecionar(masseter());
    expect(selecao.selecionada).toBe(masseter());
    masseter().visible = true;
    frontal().visible = true;
  });

  it('mostrarOcultas mostra as estruturas, mas não liga camadas desligadas', () => {
    frontal().visible = false;
    modelos.grupos.musculos.visible = false;
    masseter().visible = false;
    selecao.mostrarOcultas();
    expect(frontal().visible).toBe(true);
    expect(masseter().visible).toBe(true);
    expect(modelos.grupos.musculos.visible).toBe(false);
    selecao.desfazer();
    expect(frontal().visible).toBe(false);
  });

  it('capturar/restaurar fica fora da pilha do Desfazer', () => {
    const s = selecao.capturar();
    selecao.selecionar(frontal());
    frontal().visible = false;
    selecao.restaurar(s);
    expect(frontal().visible).toBe(true);
    expect(selecao.nivelIsolamento).toBe(0);
    selecao.selecionar(frontal());
    const oculto = selecao.capturar();
    for (const [id] of oculto.s) oculto.s.set(id, false);
    selecao.restaurar(oculto);
    expect(selecao.selecionada).toBeNull();
  });
});

describe('rótulos', () => {
  const lista = [comPos(porEn('frontal bone'), [0, 0.05, 0], 0.02), comPos(porEn('maxilla', 'D'), [-0.1, -0.05, 0], 0.02)];
  let viewer, modelos, rotulos;
  const itens = () => modelos.scene.getObjectsByProperty('isCSS2DObject', true);
  beforeEach(() => {
    viewer = criarViewerFalso({ largura: 800, altura: 600 });
    modelos = criarModelos(lista);
    rotulos = criarRotulos(viewer, modelos, criarCortes(viewer, modelos));
  });

  it('desligados: nada é criado nem recalculado', () => {
    viewer.invalidar();
    expect(viewer.quadro()).toBe(false);
    expect(itens()).toHaveLength(0);
  });

  it('ligar cria um rótulo por estrutura e os mostra no quadro seguinte', () => {
    rotulos.definir(true);
    expect(rotulos.ligado).toBe(true);
    expect(itens()).toHaveLength(2);
    expect(itens().map((o) => o.element.textContent).sort()).toEqual([lista[0].pt, lista[1].pt].sort());
    expect(viewer.quadro()).toBe(true);
    expect(itens().every((o) => o.visible)).toBe(true);
  });

  it('só recalcula quando a cena muda e para de mudar; um movimento longo recalcula a cada segundo', () => {
    rotulos.definir(true);
    expect(viewer.quadro()).toBe(true); // ligar vale na hora
    expect(viewer.quadro(1)).toBe(false); // nada mudou
    viewer.invalidar();
    expect(viewer.quadro(0.05)).toBe(false); // a cena acabou de mudar: espera aquietar
    expect(viewer.quadro(0.1)).toBe(true);   // quieta: arranja uma vez
    expect(viewer.quadro(0.1)).toBe(false);
    // giro contínuo: muda a cada quadro, então só arranja quando passa o tempo máximo
    let arranjos = 0;
    for (let i = 0; i < 70; i++) { viewer.invalidar(); if (viewer.quadro(0.016)) arranjos++; }
    expect(arranjos).toBe(1); // ~1,1 s de giro
  });

  it('estrutura oculta perde o rótulo; desligar esconde todos', () => {
    rotulos.definir(true);
    modelos.malhas.get(lista[1].id).visible = false;
    viewer.invalidar();
    viewer.quadro(1);
    const porTexto = (t) => itens().find((o) => o.element.textContent === t);
    expect(porTexto(lista[1].pt).visible).toBe(false);
    expect(porTexto(lista[0].pt).visible).toBe(true);
    rotulos.definir(false);
    expect(itens().every((o) => !o.visible)).toBe(true);
  });

  it('rótulo atrás de estrutura opaca fica oculto; a selecionada sempre aparece', () => {
    // frontal grande na frente da maxila, no mesmo eixo da câmera
    const l = [comPos(porEn('frontal bone'), [0, 0, 0.1], 0.08), comPos(porEn('maxilla', 'D'), [0, 0, -0.1], 0.02)];
    const mods = criarModelos(l);
    const v = criarViewerFalso({ largura: 800, altura: 600 });
    const r = criarRotulos(v, mods, criarCortes(v, mods));
    r.definir(true);
    v.quadro();
    const rot = (e) => mods.scene.getObjectsByProperty('isCSS2DObject', true).find((o) => o.element.textContent === e.pt);
    expect(rot(l[0]).visible).toBe(true);
    expect(rot(l[1]).visible).toBe(false);
    r.marcar(mods.malhas.get(l[1].id));
    v.quadro(1);
    expect(rot(l[1]).visible).toBe(true);
    // frontal em raio-X (translúcido) deixa de esconder
    r.marcar(null);
    mods.malhas.get(l[0].id).material.opacity = 0.3;
    v.invalidar();
    v.quadro(1);
    expect(rot(l[1]).visible).toBe(true);
  });

  it('rótulos sobrepostos na tela: só o mais próximo da câmera aparece', () => {
    const l = [comPos(porEn('frontal bone'), [0, 0, 0.05], 0.01), comPos(porEn('maxilla', 'E'), [0.002, 0.001, 0.04], 0.01)];
    const mods = criarModelos(l);
    mods.malhas.get(l[0].id).material.opacity = 0.3; // sem oclusão: só a sobreposição decide
    mods.malhas.get(l[1].id).material.opacity = 0.3;
    const v = criarViewerFalso({ largura: 800, altura: 600 });
    const r = criarRotulos(v, mods, criarCortes(v, mods));
    r.definir(true);
    v.quadro();
    const visiveis = mods.scene.getObjectsByProperty('isCSS2DObject', true).filter((o) => o.visible);
    expect(visiveis.map((o) => o.element.textContent)).toEqual([l[0].pt]);
  });

  it('estrutura cortada ou fora da tela não tem rótulo', () => {
    const l = [comPos(porEn('frontal bone'), [0.04, 0, 0], 0.01), comPos(porEn('maxilla', 'D'), [-3, 0, 0], 0.01)];
    const mods = criarModelos(l);
    const v = criarViewerFalso({ largura: 800, altura: 600 });
    const cortes = criarCortes(v, mods);
    const r = criarRotulos(v, mods, cortes);
    r.definir(true);
    v.quadro();
    const rot = (e) => mods.scene.getObjectsByProperty('isCSS2DObject', true).find((o) => o.element.textContent === e.pt);
    expect(rot(l[0]).visible).toBe(true);
    expect(rot(l[1]).visible).toBe(false); // fora do campo de visão
    cortes.definir('sagital', { ativo: true, valor: 0 }); // mantém x < 0: frontal (x = 0,04) cortado
    v.quadro(1);
    expect(rot(l[0]).visible).toBe(false);
  });

  it('marcar destaca o rótulo da selecionada', () => {
    rotulos.definir(true);
    rotulos.marcar(modelos.malhas.get(lista[0].id));
    const sel = itens().filter((o) => o.element.classList.contains('selecionado'));
    expect(sel.map((o) => o.element.textContent)).toEqual([lista[0].pt]);
  });
});

describe('modos (quiz e exercícios)', () => {
  const lista = [porEn('frontal bone'), porEn('masseter', 'D'), porEn('gingiva'), porEn('facial nerve', 'D')];
  let viewer, modelos, selecao, cortes, raiox, rotulos, painel, fechar, modos;
  beforeEach(() => {
    viewer = criarViewerFalso();
    modelos = criarModelos(lista);
    selecao = criarSelecao(viewer, modelos);
    cortes = criarCortes(viewer, modelos);
    raiox = criarRaioX(modelos, CAMADAS);
    rotulos = criarRotulos(viewer, modelos, cortes);
    painel = {
      sincronizar: vi.fn(), sincronizarControles: vi.fn(),
      definirRotulos: vi.fn((v) => rotulos.definir(v)),
    };
    fechar = vi.fn();
    modos = criarModos({ viewer, modelos, ordem: CAMADAS, selecao, cortes, raiox, rotulos, painel, fecharPainel: fechar });
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
  });

  it('entrar reorganiza a cena; sair devolve visibilidade, raio-X, cortes e rótulos', () => {
    const gengiva = modelos.malhas.get(lista[2].id);
    gengiva.visible = false;
    modelos.grupos.nervos.visible = false;
    raiox.definir('ossos', 0.4);
    cortes.definir('sagital', { ativo: true, valor: 0.02, inverter: true });
    rotulos.definir(true);

    modos.entrar({ camadas: { ossos: 0.35, musculos: 1 }, mostrar: (m) => m !== gengiva, ocultarRotulos: true });
    expect(modos.ativo).toBe(true);
    expect(modelos.grupos.nervos.visible).toBe(false);
    expect(modelos.grupos.musculos.visible).toBe(true);
    expect(raiox.valor('ossos')).toBe(0.35);
    expect(cortes.estado.sagital.ativo).toBe(false);
    expect(rotulos.ligado).toBe(false);
    expect(viewer.deslocar).toHaveBeenLastCalledWith(0.17);
    expect(fechar).not.toHaveBeenCalled();

    modos.sair();
    expect(modos.ativo).toBe(false);
    expect(gengiva.visible).toBe(false);
    expect(modelos.grupos.nervos.visible).toBe(false);
    expect(raiox.valor('ossos')).toBe(0.4);
    expect(cortes.estado.sagital).toEqual({ ativo: true, valor: 0.02, inverter: true });
    expect(rotulos.ligado).toBe(true);
    expect(viewer.deslocar).toHaveBeenLastCalledWith(0);
    // a câmera volta para onde estava antes do modo (o quiz enquadra cada resposta)
    expect(viewer.voltarPara).toHaveBeenCalledTimes(1);
    expect(viewer.voltarPara.mock.calls[0][0].p.toArray()).toEqual([0, 0, 1]);
  });

  it('um "Desfazer" apertado durante o modo não desalinha a restauração', () => {
    selecao.isolar(modelos.malhas.get(lista[0].id)); // isolamento do usuário antes do modo
    modos.entrar({ camadas: { musculos: 1 }, mostrar: () => true });
    selecao.desfazer(); // usuário desfaz durante o modo
    modos.sair();
    const visiveis = [...modelos.malhas.values()].filter((m) => m.visible).map((m) => m.userData.id);
    expect(visiveis).toEqual([lista[0].id]); // de volta ao isolamento de antes do modo
  });

  it('seleção só vale para o que está à vista: conferir tira a selecionada oculta ou de camada desligada; isolar outra também', () => {
    const [a, b] = [modelos.malhas.get(lista[0].id), modelos.malhas.get(lista[1].id)];
    selecao.selecionar(a);
    selecao.conferir();
    expect(selecao.selecionada).toBe(a);
    modelos.grupos[a.userData.camada].visible = false; // camada desligada no painel
    selecao.conferir();
    expect(selecao.selecionada).toBeNull();
    modelos.grupos[a.userData.camada].visible = true;
    selecao.selecionar(a);
    selecao.isolar(b);
    expect(selecao.selecionada).toBeNull();
  });

  it('redestacar relê --selecao-3d (troca de tema); sem seleção não faz nada', () => {
    const a = modelos.malhas.get(lista[0].id);
    selecao.redestacar();
    selecao.selecionar(a);
    a.material.emissive.set(0x000000);
    selecao.redestacar();
    expect(a.material.emissive.getHexString()).toBe(getComputedStyle(document.documentElement).getPropertyValue('--selecao-3d').trim().slice(1));
  });

  it('"Mostrar ocultas" e isolar durante o modo não deixam o Desfazer voltar à cena da sessão depois de sair', () => {
    const antes = selecao.capturar();
    const nivel = selecao.nivelIsolamento;
    modos.entrar({ camadas: { musculos: 1 }, mostrar: () => false });
    selecao.mostrarOcultas();
    selecao.isolar(modelos.malhas.get(lista[1].id));
    expect(selecao.nivelIsolamento).toBe(nivel + 2);
    modos.sair();
    expect(selecao.nivelIsolamento).toBe(nivel);
    selecao.desfazer(); // nada da sessão para desfazer
    const visiveis = (s) => [...s.s].filter(([, v]) => v).map(([id]) => id).sort();
    expect(visiveis(selecao.capturar())).toEqual(visiveis(antes));
  });

  it('reentrar sem sair mantém o primeiro estado salvo; sair duas vezes é inofensivo', () => {
    raiox.definir('musculos', 0.5);
    modos.entrar({ camadas: { musculos: 1 }, mostrar: () => true });
    modos.entrar({ camadas: { musculos: 0.2 }, mostrar: () => true });
    modos.sair();
    expect(raiox.valor('musculos')).toBe(0.5);
    modos.sair();
    expect(raiox.valor('musculos')).toBe(0.5);
  });

  it('no desktop largo a sessão tem coluna própria: a vista não se desloca e a bandeja fica', () => {
    vi.stubGlobal('matchMedia', (q) => ({ matches: q === '(min-width: 1024px)' }));
    modos.entrar({ camadas: { musculos: 1 }, mostrar: () => true });
    expect(viewer.deslocar).toHaveBeenLastCalledWith(0);
    expect(fechar).not.toHaveBeenCalled();
  });

  it('deitado a sessão ocupa a coluna da bandeja: a vista não se desloca e nada recolhe', () => {
    vi.stubGlobal('matchMedia', (q) => ({ matches: q.includes('max-height: 500px') || q === '(max-width: 760px)' }));
    modos.entrar({ camadas: { musculos: 1 }, mostrar: () => true });
    expect(viewer.deslocar).toHaveBeenLastCalledWith(0);
    expect(fechar).not.toHaveBeenCalled();
  });

  it('no celular a sessão é uma folha que encolhe a vista (sem deslocar) e recolhe a bandeja; enquadrar usa só o visível', () => {
    vi.stubGlobal('matchMedia', (q) => ({ matches: q === '(max-width: 760px)' }));
    modos.entrar({ camadas: { musculos: 1 }, mostrar: () => true, enquadrar: true });
    expect(viewer.deslocar).toHaveBeenLastCalledWith(0);
    expect(fechar).toHaveBeenCalled();
    const [caixa, vista] = viewer.enquadrarCaixa.mock.calls.at(-1);
    expect(vista).toBe('reset');
    const masseter = modelos.malhas.get(lista[1].id).position;
    expect(caixa.getCenter(masseter.clone()).distanceTo(masseter)).toBeLessThan(1e-9);
  });
});

describe('roteiros (aplicarPreset)', () => {
  const estruturas = DADOS.estruturas.filter((e) => ['ossos', 'dentes', 'nervos', 'arterias', 'musculos'].includes(e.camada))
    .map((e, i) => ({ ...e, pos: [e.lado === 'D' ? -0.03 : e.lado === 'E' ? 0.03 : 0, (i % 7) * 0.01, 0] }));
  let app, painel, explosaoValor;
  beforeEach(() => {
    const viewer = criarViewerFalso();
    const modelos = criarModelos(estruturas);
    const selecao = criarSelecao(viewer, modelos);
    painel = { sincronizar: vi.fn(), sincronizarControles: vi.fn() };
    explosaoValor = null;
    app = {
      viewer, modelos, ordem: CAMADAS, selecao,
      cortes: criarCortes(viewer, modelos), raiox: criarRaioX(modelos, CAMADAS),
      definirExplosao: (v) => { explosaoValor = v; }, painel,
    };
  });
  const visiveis = () => [...app.modelos.malhas.values()].filter((m) => m.visible && m.parent.visible);

  it('"Trigêmeo V3": só o lado direito, raio-X por camada e estrutura selecionada', () => {
    const p = PRESETS.find((x) => x.nome.startsWith('Trigêmeo'));
    aplicarPreset(p, app);
    expect(app.modelos.grupos.arterias.visible).toBe(false);
    expect(app.raiox.valor('ossos')).toBe(0.3);
    expect(app.raiox.valor('musculos')).toBe(0.45);
    const nervos = visiveis().filter((m) => m.userData.camada === 'nervos');
    expect(nervos.length).toBeGreaterThan(0);
    for (const m of nervos) expect(m.userData.info.lado).not.toBe('E');
    expect(app.selecao.selecionada.userData.info).toMatchObject({ en: 'inferior alveolar nerve', lado: 'D' });
    expect(app.selecao.nivelIsolamento).toBe(1); // o roteiro pode ser desfeito
    expect(explosaoValor).toBe(0);
    expect(painel.sincronizarControles).toHaveBeenCalled();
  });

  it('"Mandíbula e forames": o enquadramento considera só a metade mantida pelo corte sagital', () => {
    const p = PRESETS.find((x) => x.nome.startsWith('Mandíbula'));
    aplicarPreset(p, app);
    expect(app.cortes.estado.sagital.ativo).toBe(true);
    const [caixa, vista] = app.viewer.enquadrarCaixa.mock.calls.at(-1);
    expect(vista).toBe('lateralE');
    expect(caixa.max.x).toBeLessThanOrEqual(0); // sem inverter, mantém x < valor (0)
    expect(caixa.isEmpty()).toBe(false);
  });

  it('"Crânio explodido": explode e volta a câmera inicial; gengiva e camadas fora do roteiro ocultas', () => {
    const p = PRESETS.find((x) => x.explosao);
    aplicarPreset(p, app);
    expect(explosaoValor).toBe(1);
    expect(app.viewer.resetar).toHaveBeenCalled();
    expect(app.viewer.enquadrarCaixa).not.toHaveBeenCalled();
    expect(visiveis().some((m) => m.userData.info.en === 'gingiva')).toBe(false);
    expect(app.modelos.grupos.musculos.visible).toBe(false);
  });

  it('todos os roteiros se aplicam sem erro e deixam algo visível', () => {
    for (const p of PRESETS) {
      aplicarPreset(p, app);
      expect(visiveis().length, p.nome).toBeGreaterThan(0);
    }
  });
});
