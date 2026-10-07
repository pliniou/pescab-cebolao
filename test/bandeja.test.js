// Regras de comportamento da direção visual (Bandeja Clínica): índice em pares D | E e ordem FDI, régua dos cortes,
// etiqueta e fita de autoclave na ficha, foco (recuo para o campo), etiquetas 3D (seleção, "a conferir", desvio da
// lateral e da borda) e ícones SVG.
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as THREE from 'three';
import { criarPainel, nomeBase } from '../src/ui/painel.js';
import { criarInfo } from '../src/ui/info.js';
import { icone, aplicarIcones } from '../src/icones.js';
import { criarSelecao } from '../src/scene/selecao.js';
import { criarCortes } from '../src/scene/cortes.js';
import { criarRaioX, RECUO } from '../src/scene/raiox.js';
import { criarRotulos } from '../src/scene/rotulos.js';
import { criarCores } from '../src/scene/cores.js';
import { criarFoco, oclusoras } from '../src/scene/foco.js';
import { corDoTema, numeroDoTema } from '../src/scene/tema3d.js';
import { PRESETS } from '../src/ui/presets.js';
import { criarModelos, criarViewerFalso, porEn, CAMADAS, DADOS } from './fixtures.js';

afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ''; });
const clicar = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const mudar = (el, tipo = 'change') => el.dispatchEvent(new Event(tipo, { bubbles: true }));

describe('nomeBase', () => {
  it('tira o lado do nome, inclusive no meio, e o FDI dos dentes', () => {
    expect(nomeBase(porEn('masseter', 'D'))).toBe('Músculo masseter');
    expect(nomeBase(porEn('mandibular nerve', 'E'))).toBe('Nervo mandibular (V3)');
    expect(nomeBase(porEn('external carotid artery', 'D'))).toBe('Artéria carótida externa');
    expect(nomeBase(porEn('lower first secondary molar tooth', 'E'))).toBe('1º molar inferior');
    expect(nomeBase(porEn('mandible'))).toBe('Mandíbula');
  });
  it('os dois lados de toda estrutura par têm o mesmo nome-base', () => {
    const porEnLado = new Map();
    for (const e of DADOS.estruturas) if (e.lado !== 'M') (porEnLado.get(e.camada + e.en) ?? porEnLado.set(e.camada + e.en, []).get(e.camada + e.en)).push(nomeBase(e));
    for (const [chave, bases] of porEnLado) expect(new Set(bases).size, chave).toBe(1);
  });
});

describe('índice em pares D | E', () => {
  const lista = DADOS.estruturas.filter((e) => ['ossos', 'dentes'].includes(e.camada));
  let el, modelos, selecao, viewer, cortes, raiox, painel;
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    document.body.innerHTML = '<div id="app"></div>';
    el = document.body.appendChild(document.createElement('div'));
    viewer = criarViewerFalso();
    modelos = criarModelos(lista);
    selecao = criarSelecao(viewer, modelos);
    cortes = criarCortes(viewer, modelos);
    raiox = criarRaioX(modelos, CAMADAS);
    criarCores(modelos);
    // como no app: toda mudança feita pelo painel volta para ele por aoMudar (main.js: mudou → painel.sincronizar)
    painel = criarPainel(el, {
      dados: DADOS, modelos, ordem: CAMADAS, selecao, cortes, rotulos: criarRotulos(viewer, modelos, cortes), raiox,
      aoMudar: () => painel.sincronizar(), presets: PRESETS, aoPreset: () => {},
    });
  });
  const par = (e) => el.querySelector(`.estr[data-id="${e.id}"]`).closest('.par');

  it('uma linha por estrutura: pares com D à esquerda e E à direita do nome; medianas numa célula só', () => {
    const ossos = el.querySelector('.camada[data-camada="ossos"] .lista');
    const esperadas = new Set(lista.filter((e) => e.camada === 'ossos').map((e) => e.en)).size;
    expect(ossos.querySelectorAll('.par')).toHaveLength(esperadas);
    const maxila = par(porEn('maxilla', 'D'));
    const celulas = [...maxila.children].map((c) => c.className);
    expect(celulas).toEqual(['estr d', 'base', 'estr e']);
    expect(maxila.querySelector('.base').textContent).toBe('Maxila');
    expect(maxila.querySelector('.estr.d .nome-estr').getAttribute('aria-label')).toBe(porEn('maxilla', 'D').pt);
    const mand = par(porEn('mandible'));
    expect(mand.classList.contains('mediano')).toBe(true);
    expect(mand.querySelector('.nome-estr').textContent).toBe('Mandíbula');
  });

  it('dentes: os lados mostram o número FDI, como num odontograma', () => {
    const d = porEn('upper central secondary incisor tooth', 'D'), e = porEn('upper central secondary incisor tooth', 'E');
    const linha = par(d);
    expect(linha.querySelector('.estr.d .nome-estr').textContent).toBe(d.fdi);
    expect(linha.querySelector('.estr.e .nome-estr').textContent).toBe(e.fdi);
    expect(linha.querySelector('.base').textContent).toBe('Incisivo central superior');
  });

  it('estado na célula sem mexer na grade: oculta, selecionada, linha marcada', () => {
    const d = porEn('maxilla', 'D');
    const cel = el.querySelector(`.estr[data-id="${d.id}"]`);
    cel.querySelector('.vis-estr').checked = false;
    mudar(cel.querySelector('.vis-estr'));
    expect(cel.classList.contains('oculta')).toBe(true);
    expect(par(d).children).toHaveLength(3);
    clicar(cel.querySelector('.nome-estr'));
    expect(selecao.selecionada).toBe(modelos.malhas.get(d.id));
    expect(cel.classList.contains('selecionada')).toBe(true);
    expect(cel.classList.contains('oculta')).toBe(false); // selecionar pelo índice mostra a estrutura
  });


  it('dentes na ordem do odontograma: superiores 11→17, inferiores 41→47; gengiva no fim', () => {
    const linhas = [...el.querySelectorAll('.camada[data-camada="dentes"] .par')];
    const fdis = linhas.map((l) => l.querySelector('.estr.d .nome-estr')?.textContent ?? null);
    const comFdi = fdis.filter(Boolean).map(Number);
    expect(comFdi).toEqual([...comFdi].sort((a, b) => a - b));
    expect(comFdi[0]).toBe(11);
    expect(comFdi.indexOf(41)).toBe(comFdi.filter((n) => n < 40).length); // inferiores logo depois dos superiores
    expect(linhas.at(-1).classList.contains('mediano')).toBe(true); // gengiva
    // e o lado esquerdo de cada linha é o mesmo dente do outro quadrante (11 | 21, 41 | 31)
    for (const l of linhas.filter((x) => !x.classList.contains('mediano'))) {
      const [d, e] = [...l.querySelectorAll('.nome-estr')].map((b) => Number(b.textContent));
      expect(e % 10).toBe(d % 10);
    }
  });

  it('demais camadas continuam em ordem alfabética', () => {
    const bases = [...el.querySelectorAll('.camada[data-camada="ossos"] .par')]
      .map((l) => l.querySelector(l.classList.contains('mediano') ? '.nome-estr' : '.base').textContent);
    expect(bases).toEqual([...bases].sort((a, b) => a.localeCompare(b, 'pt-BR')));
  });

  it('estrutura a conferir (revisar) fica marcada no índice', () => {
    const rev = DADOS.estruturas.find((e) => e.revisar && ['ossos', 'dentes'].includes(e.camada));
    if (!rev) return; // nenhuma estrutura "revisar" nessas camadas
    expect(par(rev).classList.contains('revisar')).toBe(true);
  });

  it('régua dos cortes: posição mostrada em milímetros e escala por centímetro', () => {
    const d = el.querySelector('.corte[data-plano="sagital"]');
    const [a, b] = cortes.limites.sagital;
    expect(Number(d.querySelector('.regua').style.getPropertyValue('--cm'))).toBeCloseTo((b - a) * 100, 1);
    const ativo = d.querySelector('.ativo');
    ativo.checked = true;
    mudar(ativo, 'input');
    const pos = d.querySelector('.pos');
    pos.value = '-7';
    mudar(pos, 'input');
    expect(d.querySelector('.mm').textContent).toBe('-7 mm');
    expect(cortes.estado.sagital.valor).toBeCloseTo(-0.007);
  });
});

describe('rótulos × lateral sobre a vista (tablet)', () => {
  it('rótulo que cruzaria a ficha aberta não aparece; com a ficha fechada, aparece', () => {
    const e = { ...porEn('frontal bone'), pos: [0, 0, 0], tam: 0.02 };
    const modelos = criarModelos([e]);
    const viewer = criarViewerFalso({ largura: 800, altura: 600 });
    const vista = document.body.appendChild(document.createElement('main'));
    vista.appendChild(viewer.renderer.domElement);
    const lateral = document.body.appendChild(Object.assign(document.createElement('aside'), { className: 'lateral' }));
    lateral.getBoundingClientRect = () => ({ left: 300, top: 200, right: 500, bottom: 400, width: 200, height: 200 });
    const rotulos = criarRotulos(viewer, modelos, criarCortes(viewer, modelos));
    rotulos.definir(true);
    viewer.quadro();
    const obj = modelos.scene.getObjectsByProperty('isCSS2DObject', true)[0];
    expect(obj.visible).toBe(false); // a âncora está no centro da tela, sob a lateral
    lateral.getBoundingClientRect = () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }); // display: none
    viewer.invalidar();
    viewer.quadro(1);
    expect(obj.visible).toBe(true);
  });
});

describe('etiqueta da estrutura selecionada', () => {
  it('com os rótulos desligados, só a selecionada aparece; tirar a seleção esconde', () => {
    const a = { ...porEn('frontal bone'), pos: [0, 0, 0], tam: 0.02 };
    const b = { ...porEn('mandible'), pos: [0.05, -0.05, 0], tam: 0.02 };
    const modelos = criarModelos([a, b]);
    const viewer = criarViewerFalso({ largura: 800, altura: 600 });
    const rotulos = criarRotulos(viewer, modelos, criarCortes(viewer, modelos));
    const rot = (e) => modelos.scene.getObjectsByProperty('isCSS2DObject', true).find((o) => o.element.textContent === e.pt);
    rotulos.marcar(modelos.malhas.get(a.id));
    viewer.quadro();
    expect(rot(a).visible).toBe(true);
    expect(rot(a).element.classList.contains('selecionado')).toBe(true);
    expect(rot(b)).toBeUndefined(); // desligados: só a selecionada ganha rótulo (sem varrer o modelo inteiro)
    rotulos.marcar(null);
    viewer.quadro(1);
    expect(rot(a).visible).toBe(false);
  });
});

describe('etiqueta 3D de estrutura a conferir', () => {
  it('estrutura "revisar" leva a classe a-conferir; as conferidas, não', () => {
    const rev = { ...DADOS.estruturas.find((e) => e.revisar), pos: [0, 0, 0], tam: 0.02 };
    const ok = { ...porEn('frontal bone'), pos: [0.03, 0, 0], tam: 0.02 };
    const modelos = criarModelos([rev, ok]);
    const viewer = criarViewerFalso({ largura: 800, altura: 600 });
    const rotulos = criarRotulos(viewer, modelos, criarCortes(viewer, modelos));
    rotulos.definir(true);
    const div = (e) => modelos.scene.getObjectsByProperty('isCSS2DObject', true).find((o) => o.element.textContent === e.pt).element;
    expect(div(rev).classList.contains('a-conferir')).toBe(true);
    expect(div(ok).classList.contains('a-conferir')).toBe(false);
  });
});

describe('rótulos na borda da vista', () => {
  it('rótulo que sairia pela borda não aparece; o de dentro, sim', () => {
    // câmera a 1 m, campo vertical de 35° em 800×600: a borda direita fica em x ≈ 0,42 m; em x = 0,38 m a âncora
    // cai perto de 762 px e o rótulo (~153 px de largura) passaria dos 800 px
    const borda = { ...porEn('lacrimal bone', 'E'), pos: [0.38, 0, 0], tam: 0.004 };
    const centro = { ...porEn('frontal bone'), pos: [0, 0, 0], tam: 0.02 };
    const modelos = criarModelos([borda, centro]);
    const viewer = criarViewerFalso({ largura: 800, altura: 600 });
    const rotulos = criarRotulos(viewer, modelos, criarCortes(viewer, modelos));
    rotulos.definir(true);
    viewer.quadro();
    const rot = (e) => modelos.scene.getObjectsByProperty('isCSS2DObject', true).find((o) => o.element.textContent === e.pt);
    expect(rot(centro).visible).toBe(true);
    expect(rot(borda).visible).toBe(false);
  });
});

describe('ficha: etiqueta e fita de autoclave', () => {
  it('a conferir leva a fita lisa e o texto de revisão; o conferido, a fita listrada; a etiqueta junta camada, lado e FMA', () => {
    const rev = DADOS.estruturas.find((e) => e.revisar);
    const ok = porEn('masseter', 'D');
    const modelos = criarModelos([rev, ok]);
    const el = document.body.appendChild(document.createElement('section'));
    const info = criarInfo(el, DADOS.camadas);
    info.mostrar(modelos.malhas.get(rev.id));
    const fita = el.querySelector('p.fita');
    expect(fita.classList.contains('a-conferir')).toBe(true);
    expect(fita.textContent).toContain('A conferir');
    expect(el.classList.contains('encaixar')).toBe(true);
    info.mostrar(modelos.malhas.get(ok.id));
    expect(el.querySelector('p.fita').classList.contains('conferido')).toBe(true);
    expect(el.querySelector('p.fita').textContent).toBe('Conferido');
    const etiqueta = el.querySelector('.etiqueta').textContent;
    expect(etiqueta).toContain('Músculos');
    expect(etiqueta).toContain('Direito');
    if (ok.fma) expect(etiqueta).toContain(ok.fma);
    expect(el.querySelector('.fechar svg.icone')).not.toBeNull();
  });
});

describe('ficha: nota do recuo do foco', () => {
  it('diz quantas estruturas ficaram translúcidas e "Deixar opacas" devolve; zero esconde a nota', () => {
    const modelos = criarModelos([porEn('masseter', 'D')]);
    const m = [...modelos.malhas.values()][0];
    const el = document.createElement('section');
    const soltar = vi.fn();
    const info = criarInfo(el, DADOS.camadas, { aoSoltarRecuo: soltar });
    info.recuo(3); // sem ficha aberta: nada a fazer
    info.mostrar(m);
    const nota = el.querySelector('.nota-recuo');
    expect(nota.hidden).toBe(true);
    info.recuo(1);
    expect(nota.hidden).toBe(false);
    expect(nota.textContent).toContain('Uma estrutura na frente dela');
    info.recuo(4);
    expect(nota.textContent).toContain('4 estruturas na frente dela');
    el.querySelector('[data-acao="soltar-recuo"]').click();
    expect(soltar).toHaveBeenCalledTimes(1);
    expect(nota.hidden).toBe(true);
  });
});
describe('foco', () => {
  it('a estrutura em foco mantém a cor; as outras recuam para o campo; null e reaplicar', () => {
    const modelos = criarModelos([porEn('mandible'), porEn('frontal bone')]);
    const viewer = criarViewerFalso();
    viewer.invalidar = vi.fn();
    const foco = criarFoco(viewer, modelos);
    const [mand, front] = [porEn('mandible'), porEn('frontal bone')].map((e) => modelos.malhas.get(e.id));
    foco.reaplicar(); // sem alvo: nada a refazer
    expect(viewer.invalidar).not.toHaveBeenCalled();
    foco.definir(mand);
    expect(foco.alvo).toBe(mand);
    expect(mand.material.color.equals(mand.material.userData.cor)).toBe(true);
    const esperado = front.material.userData.cor.clone().lerp(corDoTema('recuo-3d'), numeroDoTema('recuo-mistura'));
    expect(front.material.color.getHex()).toBe(esperado.getHex());
    front.material.userData.cor.set('#ff0000'); // pintura ou modo de cores reescreveu a cor-base
    foco.reaplicar();
    expect(front.material.color.getHex()).toBe(front.material.userData.cor.clone().lerp(corDoTema('recuo-3d'), numeroDoTema('recuo-mistura')).getHex());
    foco.definir(null);
    expect(foco.alvo).toBeNull();
    expect(front.material.color.equals(front.material.userData.cor)).toBe(true);
    expect(viewer.invalidar).toHaveBeenCalledTimes(3);
  });

  it('no tema escuro o recuo mistura mais campo (o campo noturno é fundo)', () => {
    const claro = numeroDoTema('recuo-mistura');
    document.documentElement.style.setProperty('--recuo-mistura', '0.75');
    expect(numeroDoTema('recuo-mistura')).toBeGreaterThan(claro);
    document.documentElement.style.removeProperty('--recuo-mistura');
    expect(() => numeroDoTema('nao-existe')).toThrow('token numérico ausente');
  });

  // a peça profunda (masseter) atrás de uma estrutura grande (frontal) no eixo da câmera; a mandíbula fica de lado
  const comPos = (e, pos, tam) => ({ ...e, pos, tam });
  const cena = () => criarModelos([
    comPos(porEn('frontal bone'), [0, 0, 0.1], 0.06), comPos(porEn('masseter', 'D'), [0, 0, -0.1], 0.02),
    comPos(porEn('mandible'), [0.3, 0, 0], 0.02),
  ]);
  const de = new THREE.Vector3(0, 0, 1);

  it('oclusoras: acha o que fica entre a câmera e a peça; o que está de lado, oculto ou translúcido não conta', () => {
    const modelos = cena();
    const [front, mass, mand] = ['frontal bone', 'masseter', 'mandible'].map((en) => [...modelos.malhas.values()].find((m) => m.userData.info.en === en));
    expect(oclusoras(mass, de, modelos.malhas.values())).toEqual([front]);
    expect(oclusoras(front, de, modelos.malhas.values())).toEqual([]); // nada na frente dela
    front.material.opacity = 0.3; // raio-X da camada: já deixa ver através
    expect(oclusoras(mass, de, modelos.malhas.values())).toEqual([]);
    front.material.opacity = 1;
    front.visible = false;
    expect(oclusoras(mass, de, modelos.malhas.values())).toEqual([]);
    expect(oclusoras(mand, de, [mand])).toEqual([]);
  });

  it('raio-X recua só as estruturas dadas, sem mexer no valor da camada; soltar e mudar a camada desfazem', () => {
    const modelos = cena();
    const aviso = vi.fn();
    const raiox = criarRaioX(modelos, CAMADAS, aviso);
    const front = [...modelos.malhas.values()].find((m) => m.userData.info.en === 'frontal bone');
    raiox.recuar([front]);
    expect(front.material.opacity).toBe(RECUO);
    expect(front.material.depthWrite).toBe(false);
    expect(raiox.valor('ossos')).toBe(1);
    expect(raiox.recuadas).toBe(1);
    raiox.soltar();
    expect(front.material.opacity).toBe(1);
    expect(raiox.recuadas).toBe(0);
    const avisos = aviso.mock.calls.length;
    raiox.soltar(); // nada recuado: não avisa
    expect(aviso.mock.calls.length).toBe(avisos);
    raiox.recuar([front]);
    raiox.definir('ossos', 0.5); // o estudante mexeu na camada: ela manda
    expect(front.material.opacity).toBe(0.5);
    expect(raiox.recuadas).toBe(0);
    raiox.recuar([front]); // mais transparente que o recuo não é tocada
    raiox.definir('ossos', 0.1);
    raiox.recuar([front]);
    expect(front.material.opacity).toBe(0.1);
    expect(raiox.recuadas).toBe(0);
  });
});

describe('ícones', () => {
  it('SVG de traço na cor do texto, escondido de leitores de tela', () => {
    const svg = icone('pincel', { classe: 'extra' });
    expect(svg).toMatch(/^<svg class="icone extra" viewBox="0 0 24 24"/);
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('<path');
  });
  it('nome desconhecido é erro, não ícone vazio', () => {
    expect(() => icone('nao-existe')).toThrow('ícone desconhecido');
  });
  it('aplicarIcones põe o ícone antes do texto dos elementos marcados', () => {
    document.body.innerHTML = '<button data-icone="desfazer">Desfazer</button><button data-icone="tema" aria-label="Alternar tema"></button>';
    aplicarIcones();
    const [a, b] = document.querySelectorAll('button');
    expect(a.firstElementChild.tagName.toLowerCase()).toBe('svg');
    expect(a.textContent).toBe('Desfazer');
    expect(b.querySelector('svg')).not.toBeNull();
  });
});
