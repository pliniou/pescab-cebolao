// Interface: ficha da estrutura, bandejas do Consultar e do Estudar, quiz e pintura (DOM do happy-dom, malhas reais).
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { criarInfo } from '../src/ui/info.js';
import { criarPainel } from '../src/ui/painel.js';
import { criarConsulta } from '../src/ui/consulta.js';
import { criarQuiz, revisao } from '../src/quiz/quiz.js';
import { criarPintura, EXERCICIOS } from '../src/ui/pintura.js';
import { criarCores, PALETA } from '../src/scene/cores.js';
import { criarCortes } from '../src/scene/cortes.js';
import { criarRaioX } from '../src/scene/raiox.js';
import { criarRotulos } from '../src/scene/rotulos.js';
import { criarSelecao } from '../src/scene/selecao.js';
import { PRESETS } from '../src/ui/presets.js';
import conformidade from '../src/data/conformidade.json';
import { criarModelos, criarViewerFalso, porEn, CAMADAS, DADOS } from './fixtures.js';

afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ''; });
const div = () => document.body.appendChild(document.createElement('div'));
const clicar = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const mudar = (el, tipo = 'change') => el.dispatchEvent(new Event(tipo, { bubbles: true }));

// Seleção falsa: registra o interceptador e permite simular toques com uma lista de acertos
const selecaoFalsa = () => ({ f: null, set interceptar(f) { this.f = f; }, get interceptar() { return this.f; }, selecionar: vi.fn() });
const acerto = (m) => ({ object: m, point: m.position });

describe('ficha da estrutura (info)', () => {
  const idComAviso = Object.keys(conformidade.avisos)[0];
  const lista = [porEn('masseter', 'D'), DADOS.estruturas.find((e) => e.id === idComAviso), DADOS.estruturas.find((e) => e.revisar)];
  let el, modelos, cb, info;
  beforeEach(() => {
    el = div();
    modelos = criarModelos(lista);
    cb = { aoIsolar: vi.fn(), aoOcultar: vi.fn(), aoFechar: vi.fn() };
    info = criarInfo(el, DADOS.camadas, cb);
  });

  it('mostra nomes, camada, FMA, fonte e descrição', () => {
    info.mostrar(modelos.malhas.get(lista[0].id));
    expect(el.hidden).toBe(false);
    expect(el.querySelector('h2').textContent).toBe(lista[0].pt);
    expect(el.querySelector('.latim').textContent).toBe(lista[0].la);
    expect(el.querySelector('.meta').textContent).toContain('Músculos');
    expect(el.textContent).toContain(lista[0].descricao);
  });

  it('avisos de dimensões e de revisão aparecem quando existem', () => {
    info.mostrar(modelos.malhas.get(idComAviso));
    expect(el.querySelector('details.dimensoes').textContent).toContain(conformidade.avisos[idComAviso][0]);
    info.mostrar(modelos.malhas.get(lista[2].id));
    expect(el.querySelector('p.revisar')).not.toBeNull();
  });

  it('botões chamam isolar, ocultar e fechar; null esconde', () => {
    const m = modelos.malhas.get(lista[0].id);
    info.mostrar(m);
    clicar(el.querySelector('[data-acao="isolar"]'));
    clicar(el.querySelector('[data-acao="ocultar"]'));
    clicar(el.querySelector('.fechar'));
    expect(cb.aoIsolar).toHaveBeenCalledWith(m);
    expect(cb.aoOcultar).toHaveBeenCalledWith(m);
    expect(cb.aoFechar).toHaveBeenCalled();
    info.mostrar(null);
    expect(el.hidden).toBe(true);
  });

  it('a ficha leva a estrutura ao Estudar e ao quiz da camada dela (quando os callbacks existem)', () => {
    const el2 = div();
    const aoEstudar = vi.fn(), aoTreinar = vi.fn();
    const ficha = criarInfo(el2, DADOS.camadas, { aoEstudar, aoTreinar });
    const m = modelos.malhas.get(lista[0].id);
    ficha.mostrar(m);
    expect(el2.querySelector('[data-acao="treinar"]').textContent).toBe('Quiz de músculos');
    clicar(el2.querySelector('[data-acao="estudar"]'));
    clicar(el2.querySelector('[data-acao="treinar"]'));
    expect(aoEstudar).toHaveBeenCalledWith(m);
    expect(aoTreinar).toHaveBeenCalledWith(m);
    info.mostrar(m); // sem os callbacks, sem os botões
    expect(el.querySelector('.seguir')).toBeNull();
  });

  it('malha sem dados no dicionário mostra o id', () => {
    const m = modelos.malhas.get(lista[0].id);
    m.userData.info = null;
    info.mostrar(m);
    expect(el.textContent).toContain('Sem dados no dicionário');
  });
});

describe('painel (bandeja do Estudar)', () => {
  const lista = DADOS.estruturas.filter((e) => ['ossos', 'musculos'].includes(e.camada));
  let el, viewer, modelos, selecao, cortes, raiox, rotulos, aoMudar, aoPreset, painel;
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    document.body.innerHTML = '<div id="app"></div>';
    el = div();
    viewer = criarViewerFalso();
    modelos = criarModelos(lista);
    selecao = criarSelecao(viewer, modelos);
    cortes = criarCortes(viewer, modelos);
    raiox = criarRaioX(modelos, CAMADAS);
    rotulos = criarRotulos(viewer, modelos, cortes);
    aoMudar = vi.fn();
    aoPreset = vi.fn();
    criarCores(modelos);
    painel = criarPainel(el, { dados: DADOS, modelos, ordem: CAMADAS, selecao, cortes, rotulos, raiox, aoMudar, presets: PRESETS, aoPreset });
  });
  const bloco = (c) => el.querySelector(`.camada[data-camada="${c}"]`);
  const linha = (e) => el.querySelector(`.estr[data-id="${e.id}"]`);

  it('lista as camadas com a contagem de estruturas', () => {
    expect(el.querySelectorAll('.camada')).toHaveLength(CAMADAS.length);
    expect(bloco('musculos').querySelector('.qtd').textContent).toBe(String(lista.filter((e) => e.camada === 'musculos').length));
  });


  it('checkbox da camada liga/desliga o grupo e avisa', () => {
    const cb = bloco('musculos').querySelector('.vis-camada');
    cb.checked = false;
    mudar(cb);
    expect(modelos.grupos.musculos.visible).toBe(false);
    expect(aoMudar).toHaveBeenCalled();
  });

  it('checkbox da estrutura e ações "mostrar/ocultar todas"', () => {
    const e = porEn('masseter', 'E');
    const cb = linha(e).querySelector('.vis-estr');
    cb.checked = false;
    mudar(cb);
    expect(modelos.malhas.get(e.id).visible).toBe(false);
    clicar(bloco('musculos').querySelector('[data-acao="nenhuma"]'));
    expect(modelos.grupos.musculos.children.every((m) => !m.visible)).toBe(true);
    clicar(bloco('musculos').querySelector('[data-acao="todas"]'));
    expect(modelos.grupos.musculos.children.every((m) => m.visible)).toBe(true);
  });

  it('clicar no nome seleciona a estrutura, mostrando só ela se a camada estava desligada', () => {
    modelos.grupos.musculos.visible = false;
    const e = porEn('masseter', 'D');
    clicar(linha(e).querySelector('.nome-estr'));
    expect(selecao.selecionada).toBe(modelos.malhas.get(e.id));
    expect(modelos.grupos.musculos.visible).toBe(true);
    expect(modelos.grupos.musculos.children.filter((m) => m.visible)).toHaveLength(1);
  });

  it('raio-X da camada pelo controle deslizante', () => {
    const r = bloco('ossos').querySelector('.opacidade');
    r.value = '40';
    mudar(r, 'input');
    expect(raiox.valor('ossos')).toBeCloseTo(0.4);
    expect(r.nextElementSibling.textContent).toBe('40%');
  });

  it('cortes: ativar habilita os controles; posição em mm; inverter troca o lado mantido', () => {
    const d = el.querySelector('.corte[data-plano="sagital"]');
    const ativo = d.querySelector('.ativo');
    ativo.checked = true;
    mudar(ativo, 'input');
    expect(cortes.estado.sagital.ativo).toBe(true);
    expect(d.querySelector('.pos').disabled).toBe(false);
    d.querySelector('.pos').value = '12';
    mudar(d.querySelector('.pos'), 'input');
    expect(cortes.estado.sagital.valor).toBeCloseTo(0.012);
    clicar(d.querySelector('.inverter'));
    expect(cortes.estado.sagital.inverter).toBe(true);
    expect(d.querySelector('.lado').textContent).toBe('mantém: esquerdo');
  });

  it('sincronizarControles reflete raio-X e cortes alterados por fora', () => {
    raiox.definir('musculos', 0.25);
    const [min, max] = cortes.limites.axial;
    const meio = Math.round((min + max) / 2 * 1000); // mm, dentro do alcance do controle
    cortes.definir('axial', { ativo: true, valor: meio / 1000, inverter: true });
    painel.sincronizarControles();
    expect(bloco('musculos').querySelector('.opacidade').value).toBe('25');
    const d = el.querySelector('.corte[data-plano="axial"]');
    expect(d.querySelector('.ativo').checked).toBe(true);
    expect(d.querySelector('.pos').value).toBe(String(meio));
    expect(d.querySelector('.lado').textContent).toBe('mantém: superior');
  });

  it('roteiro chama aoPreset e mostra a nota', () => {
    clicar(el.querySelector('[data-preset="1"]'));
    expect(aoPreset).toHaveBeenCalledWith(PRESETS[1]);
    expect(el.querySelector('.nota-roteiro').textContent).toBe(PRESETS[1].nota);
  });

  it('rótulos pelo checkbox e por definirRotulos', () => {
    const cb = el.querySelector('#rotulos');
    cb.checked = true;
    mudar(cb);
    expect(rotulos.ligado).toBe(true);
    painel.definirRotulos(false);
    expect(cb.checked).toBe(false);
    expect(rotulos.ligado).toBe(false);
  });

  it('sincronizar marca camada parcial como indeterminada e a selecionada', () => {
    modelos.malhas.get(porEn('masseter', 'D').id).visible = false;
    painel.sincronizar();
    expect(bloco('musculos').querySelector('.vis-camada').indeterminate).toBe(true);
    const e = porEn('frontal bone');
    selecao.selecionar(modelos.malhas.get(e.id));
    painel.mostrarSelecionada(modelos.malhas.get(e.id));
    expect(linha(e).classList.contains('selecionada')).toBe(true);
    expect(bloco('ossos').querySelector('.conteudo').hidden).toBe(false);
  });

  it('escolher estrutura ou roteiro pede para recolher a bandeja (main.js decide se recolhe)', () => {
    const recolher = vi.fn();
    const el2 = div();
    criarPainel(el2, { dados: DADOS, modelos, ordem: CAMADAS, selecao, cortes, rotulos, raiox, aoMudar, presets: PRESETS, aoPreset, recolher });
    clicar(el2.querySelector(`.estr[data-id="${porEn('frontal bone').id}"] .nome-estr`));
    expect(recolher).toHaveBeenCalledTimes(1);
    clicar(el2.querySelector('[data-preset="0"]'));
    expect(recolher).toHaveBeenCalledTimes(2);
  });

  it('a bandeja do Estudar não tem busca: ela mora no Consultar', () => {
    expect(el.querySelector('#busca')).toBeNull();
    expect([...el.querySelectorAll('.titulo-secao')].map((h) => (h.querySelector('.titulo-nome') ?? h).textContent))
      .toEqual(['Roteiros de estudo', 'Camadas', 'Explosão', 'Cortes', 'Rótulos', 'Cores e pintura']);
  });

  it('explosão, cortes e pintura ficam recolhidos com o estado no título; o raio-X fora de 100% aparece na camada', () => {
    const ferramentas = [...el.querySelectorAll('details.ferramenta')];
    expect(ferramentas.map((d) => d.querySelector('.titulo-nome').textContent)).toEqual(['Explosão', 'Cortes', 'Cores e pintura']);
    expect(ferramentas.every((d) => !d.open)).toBe(true);
    const resumo = (n) => ferramentas[n].querySelector('.resumo').textContent;
    expect(resumo(0)).toBe('0%');
    expect(resumo(1)).toBe('desligados');
    const corte = el.querySelector('.corte[data-plano="sagital"]');
    corte.querySelector('.ativo').checked = true;
    corte.querySelector('.ativo').dispatchEvent(new Event('input', { bubbles: true }));
    expect(resumo(1)).toBe('sagital 0 mm');
    const r = bloco('ossos').querySelector('.opacidade');
    r.value = '40';
    r.dispatchEvent(new Event('input', { bubbles: true }));
    const marca = bloco('ossos').querySelector('.estado-raiox');
    expect(marca.hidden).toBe(false);
    expect(marca.textContent).toBe('raio-X 40%');
    expect(bloco('ossos').querySelector('.conteudo').contains(r)).toBe(true); // o controle mora dentro da camada
  });

  it('o roteiro aplicado fica marcado até o estudante mexer na cena', () => {
    const rot = () => [...el.querySelectorAll('.roteiro')].map((b) => b.getAttribute('aria-pressed'));
    clicar(el.querySelector('[data-preset="1"]'));
    expect(rot()[1]).toBe('true');
    expect(rot().filter((v) => v === 'true')).toHaveLength(1);
    clicar(bloco('musculos').querySelector('[data-acao="nenhuma"]'));
    expect(rot().every((v) => v === 'false')).toBe(true);
  });

  it('ligar uma camada sem nenhuma estrutura visível mostra todas', () => {
    clicar(bloco('musculos').querySelector('[data-acao="nenhuma"]'));
    const cb = bloco('musculos').querySelector('.vis-camada');
    modelos.grupos.musculos.visible = false;
    cb.checked = true;
    mudar(cb);
    expect(modelos.grupos.musculos.children.every((m) => m.visible)).toBe(true);
  });

  it('bolinha de cor só quando a cor difere da natural', () => {
    const m = modelos.malhas.get(porEn('frontal bone').id);
    painel.atualizarCores();
    expect(linha(porEn('frontal bone')).querySelector('.ponto').style.background).toBe('transparent');
    m.material.userData.cor.set(PALETA[0].hex);
    painel.atualizarCores();
    expect(linha(porEn('frontal bone')).querySelector('.ponto').style.background).not.toBe('transparent');
  });

  it('cliques e eventos fora dos controles não mudam nada', () => {
    const estadoCena = () => JSON.stringify({
      vis: [...modelos.malhas.values()].map((m) => m.visible), grupos: CAMADAS.map((c) => modelos.grupos[c].visible),
      raiox: CAMADAS.map((c) => raiox.valor(c)), cortes: cortes.estado,
    });
    const antes = estadoCena();
    clicar(el.querySelector('.camadas'));                  // container das camadas
    clicar(bloco('ossos').querySelector('label.raiox'));   // dentro da camada, fora de botão
    clicar(el.querySelector('.cortes'));                   // container dos cortes
    clicar(el.querySelector('.corte[data-plano="coronal"] .lado'));
    clicar(el.querySelector('.roteiros'));                 // container dos roteiros
    mudar(el.querySelector('.cortes'), 'input');
    mudar(el.querySelector('.corte[data-plano="coronal"]'), 'input');
    mudar(bloco('ossos').querySelector('.vis-camada'), 'input'); // checkbox também emite 'input'
    expect(estadoCena()).toBe(antes);
    expect(aoPreset).not.toHaveBeenCalled();
  });

  it('soltar o controle de raio-X (evento change) só sincroniza', () => {
    const r = bloco('ossos').querySelector('.opacidade');
    mudar(r);
    expect(aoMudar).toHaveBeenCalledTimes(1);
    expect(modelos.grupos.ossos.visible).toBe(true);
  });

  it('marcar uma estrutura com a camada desligada liga a camada', () => {
    modelos.grupos.musculos.visible = false;
    const e = porEn('masseter', 'D');
    modelos.malhas.get(e.id).visible = false;
    const cb = linha(e).querySelector('.vis-estr');
    cb.checked = true;
    mudar(cb);
    expect(modelos.grupos.musculos.visible).toBe(true);
  });

  it('"Inverter" duas vezes volta ao lado de coordenada menor', () => {
    const d = el.querySelector('.corte[data-plano="coronal"]');
    const ativo = d.querySelector('.ativo');
    ativo.checked = true;
    mudar(ativo, 'input');
    clicar(d.querySelector('.inverter'));
    expect(d.querySelector('.lado').textContent).toBe('mantém: anterior');
    clicar(d.querySelector('.inverter'));
    expect(cortes.estado.coronal.inverter).toBe(false);
    expect(d.querySelector('.lado').textContent).toBe('mantém: posterior');
  });

  it('mostrarSelecionada com a bandeja do Estudar escondida não abre camadas (seleção feita no Consultar)', () => {
    el.hidden = true;
    const m = modelos.malhas.get(porEn('frontal bone').id);
    selecao.selecionar(m);
    painel.mostrarSelecionada(m);
    expect(bloco('ossos').querySelector('.conteudo').hidden).toBe(true);
    expect(linha(porEn('frontal bone')).classList.contains('selecionada')).toBe(true); // o estado continua em dia
    el.hidden = false;
  });

  it('camadas: o botão que abre aponta para o conteúdo (aria-controls)', () => {
    const b = bloco('ossos').querySelector('.abrir');
    expect(el.querySelector(`#${b.getAttribute('aria-controls')}`)).toBe(bloco('ossos').querySelector('.conteudo'));
  });

  it('mostrarSelecionada: sem seleção só sincroniza; camada já aberta continua aberta', () => {
    painel.mostrarSelecionada(null);
    expect(bloco('ossos').querySelector('.conteudo').hidden).toBe(true);
    clicar(bloco('ossos').querySelector('.abrir'));
    const m = modelos.malhas.get(porEn('frontal bone').id);
    painel.mostrarSelecionada(m);
    painel.mostrarSelecionada(m);
    expect(bloco('ossos').querySelector('.conteudo').hidden).toBe(false);
  });

  it('estrutura sem dados no dicionário aparece pelo id; sem modo de cores, a amostra usa a cor do material', () => {
    // estruturas sem dados no início e no fim: a ordenação as recebe nos dois lados do comparador
    const outros = criarModelos([porEn('mandible'), porEn('frontal bone'), porEn('hyoid bone')]);
    const semInfo = outros.malhas.get(porEn('mandible').id);
    semInfo.userData.info = null;
    outros.malhas.get(porEn('hyoid bone').id).userData.info = null;
    const el2 = div();
    criarPainel(el2, {
      dados: DADOS, modelos: outros, ordem: CAMADAS, selecao: criarSelecao(viewer, outros), cortes: criarCortes(viewer, outros),
      rotulos, raiox: criarRaioX(outros, CAMADAS), aoMudar, presets: PRESETS, aoPreset,
    });
    const li = el2.querySelector(`.estr[data-id="${semInfo.userData.id}"]`);
    expect(li.querySelector('.nome-estr').textContent).toBe(semInfo.userData.id);
    expect(li.querySelector('.nome-estr').title).toBe('');
    expect(el2.querySelector('.camada[data-camada="ossos"] .cor').style.background).not.toBe('');
  });
});

describe('consulta', () => {
  const lista = DADOS.estruturas.filter((e) => ['ossos', 'musculos', 'dentes'].includes(e.camada));
  let el, modelos, selecao, aoEscolher, consulta;
  beforeEach(() => {
    el = div();
    modelos = criarModelos(lista);
    selecao = criarSelecao(criarViewerFalso(), modelos);
    aoEscolher = vi.fn();
    consulta = criarConsulta(el, { dados: DADOS, modelos, ordem: CAMADAS, selecao, aoEscolher });
  });
  const buscar = (txt) => { consulta.campo.value = txt; mudar(consulta.campo, 'input'); };
  const nomes = () => [...el.querySelectorAll('.resultado .r-nome')].map((n) => n.textContent);
  const tecla = (alvo, key) => alvo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

  it('vazia mostra o índice por camada; com texto, a lista de resultados no lugar dele', () => {
    expect(el.querySelector('.indice-consulta').hidden).toBe(false);
    expect(el.querySelector('.resultados').hidden).toBe(true);
    expect(el.querySelectorAll('.camada-indice')).toHaveLength(CAMADAS.length);
    expect(el.querySelector('.camada-indice .vis-estr')).toBeNull(); // no Consultar o índice só escolhe
    buscar('masseter');
    expect(el.querySelector('.indice-consulta').hidden).toBe(true);
    expect(el.querySelector('.resultados').hidden).toBe(false);
    buscar('');
    expect(el.querySelector('.indice-consulta').hidden).toBe(false);
    expect(el.querySelector('.contagem').textContent).toBe('');
  });

  it('sem acento, por português, latim, inglês ou FDI; o nome que começa pela busca vem primeiro', () => {
    buscar('MANDIBULA');
    expect(nomes()[0]).toBe(porEn('mandible').pt);
    buscar('masseter');
    expect(nomes()).toEqual(expect.arrayContaining([porEn('masseter', 'D').pt, porEn('masseter', 'E').pt]));
    expect(el.querySelector('.contagem').textContent).toMatch(/^\d+ estruturas?$/);
    const d = porEn('upper central secondary incisor tooth', 'D');
    buscar(d.fdi);
    expect(nomes()).toContain(d.pt);
    expect(el.querySelector(`.resultado[data-id="${d.id}"] .r-meta`).textContent).toContain(`FDI ${d.fdi}`);
  });

  it('número FDI põe o próprio dente em primeiro (Enter escolhe ele), para todos os dentes', () => {
    const dentes = lista.filter((e) => e.fdi);
    expect(dentes.length).toBeGreaterThan(20);
    for (const d of dentes) {
      buscar(d.fdi);
      expect(el.querySelector('.resultado').dataset.id, `FDI ${d.fdi}`).toBe(d.id);
    }
    buscar(porEn('mandible').fma); // código FMA completo ainda acha a estrutura
    expect(el.querySelector('.resultado').dataset.id).toBe(porEn('mandible').id);
  });

  it('nada encontrado explica como tentar de novo', () => {
    buscar('xyzw');
    expect(el.querySelector('.resultados').hidden).toBe(true);
    expect(el.querySelector('.contagem').textContent).toContain('Nada encontrado para "xyzw"');
  });

  it('muitas respostas: mostra as 40 primeiras e diz quantas são', () => {
    buscar('o');
    const total = Number(el.querySelector('.contagem').textContent.match(/^\d+/)[0]);
    expect(total).toBeGreaterThan(40);
    expect(el.querySelectorAll('.resultado')).toHaveLength(40);
    buscar('osso frontal');
    expect(el.querySelector('.contagem').textContent).toBe('1 estrutura');
  });

  it('clique num resultado ou no índice escolhe; Enter escolhe o primeiro', () => {
    buscar('masseter');
    clicar(el.querySelector('.resultado .r-nome'));
    expect(aoEscolher).toHaveBeenLastCalledWith(modelos.malhas.get(el.querySelector('.resultado').dataset.id));
    tecla(consulta.campo, 'Enter');
    expect(aoEscolher).toHaveBeenCalledTimes(2);
    buscar('');
    const mand = porEn('mandible');
    clicar(el.querySelector(`.estr[data-id="${mand.id}"] .nome-estr`));
    expect(aoEscolher).toHaveBeenLastCalledWith(modelos.malhas.get(mand.id));
    tecla(consulta.campo, 'Enter'); // sem resultados na tela: nada a escolher
    expect(aoEscolher).toHaveBeenCalledTimes(3);
  });

  it('setas andam pela lista e voltam ao campo; Esc limpa', () => {
    buscar('masseter');
    const [r1, r2] = el.querySelectorAll('.resultado');
    tecla(consulta.campo, 'ArrowDown');
    expect(document.activeElement).toBe(r1);
    tecla(r1, 'ArrowDown');
    expect(document.activeElement).toBe(r2);
    tecla(r2, 'ArrowUp');
    expect(document.activeElement).toBe(r1);
    tecla(r1, 'ArrowUp');
    expect(document.activeElement).toBe(consulta.campo);
    tecla(consulta.campo, 'Escape');
    expect(consulta.campo.value).toBe('');
    expect(el.querySelector('.indice-consulta').hidden).toBe(false);
    tecla(consulta.campo, 'ArrowDown'); // lista vazia: o foco fica no campo
    expect(document.activeElement).toBe(consulta.campo);
  });

  it('a estrutura selecionada fica marcada no índice e nos resultados; focar e limpar', () => {
    const m = modelos.malhas.get(porEn('masseter', 'D').id);
    selecao.selecionar(m);
    consulta.marcarSelecionada();
    expect(el.querySelector(`.estr[data-id="${m.userData.id}"]`).classList.contains('selecionada')).toBe(true);
    buscar('masseter');
    expect(el.querySelector(`.resultado[data-id="${m.userData.id}"]`).classList.contains('selecionada')).toBe(true);
    consulta.limpar();
    expect(consulta.campo.value).toBe('');
    consulta.focar();
    expect(document.activeElement).toBe(consulta.campo);
  });

  it('estrutura a conferir sai marcada nos resultados; sem dados no dicionário, aparece pelo id', () => {
    const rev = lista.find((e) => e.revisar);
    if (rev) {
      buscar(rev.pt);
      expect(el.querySelector(`.resultado[data-id="${rev.id}"]`).classList.contains('revisar')).toBe(true);
    }
    const outros = criarModelos([porEn('frontal bone'), porEn('mandible')]);
    const sem = outros.malhas.get(porEn('mandible').id);
    sem.userData.info = null;
    const el2 = div();
    const c2 = criarConsulta(el2, { dados: DADOS, modelos: outros, ordem: CAMADAS, selecao: criarSelecao(criarViewerFalso(), outros), aoEscolher });
    c2.campo.value = sem.userData.id;
    mudar(c2.campo, 'input');
    expect(el2.querySelector('.r-nome').textContent).toBe(sem.userData.id);
    expect(el2.querySelector('.r-latim')).toBeNull();
  });
});

describe('quiz', () => {
  const lista = DADOS.estruturas.filter((e) => e.camada === 'ossos' || e.camada === 'dentes');
  let el, viewer, modelos, raiox, selecao, eventos, quiz;
  beforeEach(() => {
    localStorage.clear();
    el = div();
    el.hidden = true;
    viewer = criarViewerFalso();
    modelos = criarModelos(lista);
    raiox = criarRaioX(modelos, CAMADAS);
    selecao = selecaoFalsa();
    eventos = { ini: [], sair: 0 };
    quiz = criarQuiz(el, {
      dados: DADOS, modelos, ordem: CAMADAS, viewer, selecao, raiox,
      aoIniciar: (c) => eventos.ini.push(c), aoSair: () => eventos.sair++,
    });
  });
  const acao = (a) => clicar(el.querySelector(`[data-acao="${a}"]`));
  const modo = (v) => { el.querySelector(`input[name="modo"][value="${v}"]`).checked = true; };
  const alvoAtual = () => modelos.malhas.get([...modelos.malhas.values()].find((m) => el.querySelector('h2').textContent.endsWith(m.userData.info.pt))?.userData.id);

  it('tela de configuração: contagem por camada sem itens "revisar" nem gengiva', () => {
    quiz.abrir();
    expect(quiz.ativo).toBe(true);
    const elegiveis = (c) => lista.filter((e) => e.camada === c && !e.revisar && e.en !== 'gingiva').length;
    const qtd = (c) => el.querySelector(`input[name="camada"][value="${c}"]`).parentElement.querySelector('.qtd').textContent;
    expect(qtd('ossos')).toBe(String(elegiveis('ossos')));
    expect(qtd('dentes')).toBe(String(elegiveis('dentes')));
  });

  it('sem camada escolhida o Começar desliga e a dica diz por quê; nada começa', () => {
    quiz.abrir();
    const comecar = el.querySelector('[data-acao="comecar"]');
    expect(comecar.disabled).toBe(false);
    for (const i of el.querySelectorAll('input[name="camada"]')) { i.checked = false; i.dispatchEvent(new Event('change', { bubbles: true })); }
    expect(comecar.disabled).toBe(true);
    expect(el.querySelector('.sem-camada').hidden).toBe(false);
    comecar.disabled = false; // mesmo se o botão for acionado, não há o que perguntar
    acao('comecar');
    expect(eventos.ini).toEqual([]);
    el.querySelector('input[name="camada"]').checked = true;
    el.querySelector('input[name="camada"]').dispatchEvent(new Event('change', { bubbles: true }));
    expect(comecar.disabled).toBe(false);
    expect(el.querySelector('.sem-camada').hidden).toBe(true);
  });

  it('a pergunta pulsa ~3,5 s e assenta (para de redesenhar); com movimento reduzido o brilho é fixo', () => {
    quiz.abrir();
    modo('multipla');
    acao('comecar');
    const alvo = [...modelos.malhas.values()].find((m) => m.material.emissiveIntensity !== 1);
    expect(viewer.quadro(0.5)).toBe(true);
    for (let i = 0; i < 8; i++) viewer.quadro(0.5);
    expect(alvo.material.emissiveIntensity).toBe(0.55);
    expect(viewer.quadro(0.5)).toBe(false); // assentou: a cena volta a ficar parada
    acao('sair');
    vi.stubGlobal('matchMedia', (q) => ({ matches: q === '(prefers-reduced-motion: reduce)' }));
    quiz.abrir();
    modo('multipla');
    acao('comecar');
    viewer.quadro(0.016);
    const alvo2 = [...modelos.malhas.values()].find((m) => m.material.emissiveIntensity !== 1);
    expect(alvo2.material.emissiveIntensity).toBe(0.55);
    expect(viewer.quadro(0.016)).toBe(false);
    vi.unstubAllGlobals();
  });

  it('redestacar relê os tokens das marcas (troca de tema)', () => {
    quiz.abrir();
    modo('multipla');
    acao('comecar');
    const alvo = [...modelos.malhas.values()].find((m) => m.material.emissiveIntensity !== 1);
    alvo.material.color.set(0x000000);
    quiz.redestacar();
    const token = getComputedStyle(document.documentElement).getPropertyValue('--pergunta-3d').trim().slice(1);
    expect(alvo.material.color.getHexString()).toBe(token);
  });
  it('modo clique: acerto, erro, "não sei", resultado e erradas salvas', () => {
    quiz.abrir();
    acao('comecar');
    expect(eventos.ini).toEqual([['ossos']]);
    // 1ª: acerto
    let alvo = alvoAtual();
    expect(selecao.interceptar([acerto(alvo)])).toBe(true);
    expect(el.querySelector('.retorno').className).toContain('certo');
    acao('proxima');
    // 2ª: erro (clica em outra estrutura da prova)
    alvo = alvoAtual();
    const outra = [...modelos.malhas.values()].find((m) => m.userData.camada === 'ossos' && m !== alvo);
    selecao.interceptar([acerto(outra)]);
    expect(el.querySelector('.retorno').className).toContain('errado');
    expect(outra.material.color.getHex()).toBe(0xb3261e); // tinta de --errado
    acao('proxima');
    // 3ª: estrutura fora da prova é ignorada; depois "não sei"
    const dente = [...modelos.malhas.values()].find((m) => m.userData.camada === 'dentes');
    selecao.interceptar([acerto(dente)]);
    expect(el.querySelector('.retorno').textContent).toContain('não faz parte');
    acao('nao-sei');
    for (let i = 3; i < 10; i++) { acao('proxima'); acao('nao-sei'); }
    acao('proxima');
    expect(el.querySelector('h2').textContent).toMatch(/^Resultado: 1 de 10/);
    const salvo = JSON.parse(localStorage.getItem('atlas-quiz-v1'));
    expect(salvo.erradas).toHaveLength(9);
    expect(salvo.historico.at(-1)).toMatchObject({ acertos: 1, total: 10 });
    // cores restauradas ao fim
    expect(outra.material.color.equals(outra.material.userData.cor)).toBe(true);
    acao('refazer');
    expect(el.querySelector('.placar').textContent).toContain('de 9');
  });

  it('abrir com camadas já marca as camadas da configuração (o "Quiz de …" da ficha)', () => {
    quiz.abrir({ camadas: ['dentes'] });
    const marcadas = [...el.querySelectorAll('input[name="camada"]:checked')].map((i) => i.value);
    expect(marcadas).toEqual(['dentes']);
    acao('comecar');
    expect(eventos.ini).toEqual([['dentes']]);
  });

  it('revisao: saldo de erros primeiro; empate, a vista há mais tempo antes; sem saldo, fora', () => {
    const porId = {
      a: [0, 3, 500],  // saldo 3
      b: [1, 2, 900],  // saldo 1, vista depois
      c: [0, 1, 100],  // saldo 1, vista antes
      d: [0, 1],       // saldo 1, sem data (dado antigo): conta como vista há muito tempo
      e: [2, 2, 50],   // acertou tanto quanto errou: fora
      f: [3, 0, 10],
    };
    expect(revisao(porId)).toEqual(['a', 'd', 'c', 'b']);
    expect(revisao(porId, (id) => id !== 'a')).toEqual(['d', 'c', 'b']);
  });

  it('"Revisar o que mais erro" começa pela mais urgente, respeita o número de perguntas e grava a data', () => {
    const elegiveis = [...modelos.malhas.values()].filter((m) => m.userData.camada === 'ossos' && !m.userData.info.revisar);
    const [m1, m2, m3] = elegiveis;
    localStorage.setItem('atlas-quiz-v1', JSON.stringify({ porId: {
      [m1.userData.id]: [0, 1, 5], [m2.userData.id]: [0, 4, 9], [m3.userData.id]: [1, 1, 1], naoexiste: [0, 9, 1],
    } }));
    quiz.abrir();
    const b = el.querySelector('[data-acao="revisar"]');
    expect(b.textContent).toBe('Revisar o que mais erro (2)');
    expect(el.textContent).toContain(`Você mais erra: ${m2.userData.info.pt}; ${m1.userData.info.pt}.`);
    el.querySelector('select[name="qtd"]').value = '10';
    clicar(b);
    expect(el.querySelector('h2').textContent).toContain(m2.userData.info.pt); // a mais urgente primeiro
    expect(el.querySelector('.placar').textContent).toContain('de 2');
    const antes = Date.now();
    acao('nao-sei');
    const [a, e, quando] = JSON.parse(localStorage.getItem('atlas-quiz-v1')).porId[m2.userData.id];
    expect([a, e]).toEqual([0, 5]);
    expect(quando).toBeGreaterThanOrEqual(antes);
  });

  it('dado salvo com formato errado não trava a tela: o que não serve é descartado', () => {
    const valido = [...modelos.malhas.values()].find((m) => m.userData.info && !m.userData.info.revisar);
    localStorage.setItem('atlas-quiz-v1', JSON.stringify({
      porId: { [valido.userData.id]: [1, 3], outro: 'x', terceiro: [1] },
      erradas: 'nao-e-lista',
      historico: { at: 1 },
    }));
    quiz.abrir();
    expect(el.querySelector('h2').textContent).toBe('Quiz');
    expect(el.textContent).toContain(`Você mais erra: ${valido.userData.info.pt}`);
    expect(el.querySelector('[data-acao="erradas-salvas"]')).toBeNull();
    localStorage.setItem('atlas-quiz-v1', JSON.stringify({ historico: [{ data: 1, acertos: 'a', total: 0 }, null], porId: null }));
    quiz.sair();
    quiz.abrir();
    expect(el.textContent).not.toContain('Último quiz');
    localStorage.setItem('atlas-quiz-v1', 'null');
    quiz.sair();
    quiz.abrir();
    expect(el.querySelector('h2').textContent).toBe('Quiz');
  });

  it('sair no meio grava o que foi respondido como sessão interrompida; sem resposta, não grava nada', () => {
    quiz.abrir();
    acao('comecar');
    quiz.sair(); // nenhuma resposta
    expect(JSON.parse(localStorage.getItem('atlas-quiz-v1') || '{}').historico ?? []).toHaveLength(0);
    quiz.abrir();
    acao('comecar');
    acao('nao-sei');
    acao('proxima');
    selecao.interceptar([acerto(alvoAtual())]);
    quiz.sair();
    const d = JSON.parse(localStorage.getItem('atlas-quiz-v1'));
    expect(d.historico.at(-1)).toMatchObject({ acertos: 1, total: 2, parcial: true });
    expect(d.erradas).toHaveLength(1);
    quiz.abrir();
    expect(el.textContent).toContain('Último quiz (interrompido): 1/2');
    expect(el.querySelector('[data-acao="erradas-salvas"]').textContent).toContain('Refazer as 1 erradas');
  });

  it('o foco acompanha a pergunta: título no modo clique, primeira opção na múltipla escolha', () => {
    quiz.abrir();
    acao('comecar');
    expect(document.activeElement).toBe(el.querySelector('h2'));
    quiz.sair();
    quiz.abrir();
    modo('multipla');
    acao('comecar');
    expect(document.activeElement).toBe(el.querySelector('.opcao'));
  });

  it('cada resposta fica carimbada (Certo/Errado), da mais recente para a mais antiga', () => {
    quiz.abrir();
    acao('comecar');
    expect(el.querySelector('.carimbos')).toBeNull(); // nada respondido ainda
    const primeiro = alvoAtual();
    selecao.interceptar([acerto(primeiro)]);
    acao('proxima');
    acao('nao-sei');
    const carimbos = [...el.querySelectorAll('.carimbos li')];
    expect(carimbos).toHaveLength(2);
    expect(carimbos[0].querySelector('.carimbo').className).toContain('errado');
    expect(carimbos[1].querySelector('.carimbo').textContent).toBe('Certo');
    expect(carimbos[1].textContent).toContain(primeiro.userData.info.pt);
    acao('proxima');
    expect(el.querySelectorAll('.carimbos li')).toHaveLength(2); // a pergunta seguinte mantém a fila
  });

  it('o botão Raio-X da pergunta deixa as camadas da prova translúcidas e volta', () => {
    quiz.abrir();
    acao('comecar');
    const b = el.querySelector('[data-acao="raiox"]');
    expect(b.getAttribute('aria-pressed')).toBe('false');
    clicar(b);
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(raiox.valor('ossos')).toBeCloseTo(0.35);
    clicar(b);
    expect(raiox.valor('ossos')).toBe(1);
  });
  it('o progresso vem logo abaixo do título da pergunta, nunca acima dele', () => {
    quiz.abrir();
    acao('comecar');
    const filhos = [...el.children].map((e) => e.tagName.toLowerCase());
    expect(filhos.indexOf('h2')).toBeLessThan(filhos.indexOf('p'));
    expect(el.querySelector('h2 + .placar').textContent).toMatch(/^Pergunta 1 de 10/);
  });

  it('múltipla escolha: 4 opções distintas, uma correta', () => {
    quiz.abrir();
    modo('multipla');
    acao('comecar');
    const opcoes = [...el.querySelectorAll('.opcao')];
    expect(opcoes).toHaveLength(4);
    expect(new Set(opcoes.map((b) => b.textContent)).size).toBe(4);
    clicar(opcoes[0]);
    expect(opcoes.every((b) => b.disabled)).toBe(true);
    expect(opcoes.filter((b) => b.classList.contains('certo'))).toHaveLength(1);
  });

  it('modo misto alterna clique e múltipla escolha; "Novo quiz" volta à configuração', () => {
    quiz.abrir();
    modo('misto');
    acao('comecar');
    expect(el.querySelector('.opcao')).toBeNull(); // 1ª: clique
    acao('nao-sei');
    acao('proxima');
    expect(el.querySelectorAll('.opcao')).toHaveLength(4); // 2ª: múltipla escolha
    expect(viewer.enquadrarCaixa).toHaveBeenCalled(); // aproxima a câmera do alvo destacado
    clicar(el.querySelector('.opcao'));
    for (let i = 2; i < 10; i++) {
      acao('proxima');
      if (el.querySelector('.opcao')) clicar(el.querySelector('.opcao')); else acao('nao-sei');
    }
    acao('proxima');
    acao('novo');
    expect(el.querySelector('[data-acao="comecar"]')).not.toBeNull();
    expect(el.querySelector('input[name="modo"][value="misto"]').checked).toBe(true); // lembra a última escolha
  });

  it('toque na cena com a configuração aberta ou fora do modo clique é ignorado', () => {
    quiz.abrir();
    const m = modelos.grupos.ossos.children[0];
    expect(selecao.interceptar([acerto(m)])).toBe(true);
    modo('multipla');
    acao('comecar');
    expect(selecao.interceptar([acerto(m)])).toBe(true);
    expect(el.querySelector('.retorno').textContent).toBe('');
  });

  it('o raio-X mexido durante uma pergunta prevalece sobre o "fantasma" (regressão)', () => {
    quiz.abrir();
    modo('multipla');
    acao('comecar');
    const outras = [...modelos.malhas.values()].filter((m) => m.userData.camada === 'ossos' && m.material.opacity <= 0.22);
    expect(outras.length).toBeGreaterThan(0); // fantasma aplicado
    raiox.definir('ossos', 0.6); // usuário mexe no controle com a pergunta aberta
    clicar(el.querySelector('.opcao'));
    acao('proxima');
    acao('sair');
    expect(eventos.sair).toBe(1);
    for (const m of modelos.grupos.ossos.children) expect(m.material.opacity).toBe(0.6);
    expect(selecao.interceptar).toBeNull();
  });

  it('erradas salvas aparecem na configuração e podem ser refeitas', () => {
    const ids = lista.filter((e) => e.camada === 'ossos' && !e.revisar).slice(0, 2).map((e) => e.id);
    localStorage.setItem('atlas-quiz-v1', JSON.stringify({ porId: { [ids[0]]: [0, 3] }, erradas: ids, historico: [{ data: 0, acertos: 5, total: 10 }] }));
    quiz.abrir();
    expect(el.querySelector('[data-acao="erradas-salvas"]').textContent).toContain('2 erradas');
    expect(el.textContent).toContain('Último quiz: 5/10');
    expect(el.textContent).toContain('Você mais erra');
    acao('erradas-salvas');
    expect(el.querySelector('.placar').textContent).toContain('de 2');
  });
});

describe('pintura', () => {
  const ex = EXERCICIOS.find((x) => x.nome.startsWith('Supra'));
  const lista = DADOS.estruturas.filter((e) => ['ossos', 'vertebras', 'musculos'].includes(e.camada));
  let card, secao, modelos, cores, selecao, cb, pintura;
  beforeEach(() => {
    localStorage.clear();
    card = div();
    card.hidden = true;
    secao = div();
    modelos = criarModelos(lista);
    cores = criarCores(modelos);
    selecao = selecaoFalsa();
    cb = { aoIniciar: vi.fn(), aoSair: vi.fn(), aoMudarCores: vi.fn() };
    pintura = criarPintura(card, secao, { modelos, cores, selecao, ...cb });
  });
  const malhaEn = (en, lado = 'D') => [...modelos.malhas.values()].find((m) => m.userData.info.en === en && m.userData.info.lado === lado);
  const acao = (a) => clicar(card.querySelector(`[data-acao="${a}"]`));
  const escolherCor = (hex) => clicar(card.querySelector(`[data-cor="${hex}"]`));
  const responder = (txt) => { card.querySelector('.campo-nome').value = txt; acao('nome-ok'); };

  it('modo de cores pelo painel', () => {
    const atlas = secao.querySelector('input[value="atlas"]');
    atlas.checked = true;
    mudar(atlas);
    expect(cores.modo).toBe('atlas');
    expect(cb.aoMudarCores).toHaveBeenCalled();
  });

  it('pincel livre: pinta, pede o nome e corrige na hora; mesma cor de novo apaga', () => {
    clicar(secao.querySelector('[data-acao="pincel"]'));
    expect(pintura.ativo).toBe(true);
    expect(cb.aoIniciar).toHaveBeenCalledWith(null);
    const m = malhaEn('masseter');
    escolherCor(PALETA[2].hex);
    selecao.interceptar([acerto(m)]);
    expect(cores.pintura(m)).toBe(PALETA[2].hex);
    responder('masseter');
    expect(card.querySelector('.retorno.certo')).not.toBeNull();
    selecao.interceptar([acerto(malhaEn('temporalis'))]);
    responder('mandibula');
    expect(card.querySelector('.retorno.errado').textContent).toContain(malhaEn('temporalis').userData.info.pt);
    expect(card.querySelector('.placar').textContent).toBe('Nomes: 1 de 2 certos');
    selecao.interceptar([acerto(m)]);
    expect(cores.pintura(m)).toBeNull();
    acao('sair');
    expect(cb.aoSair).toHaveBeenCalledWith(false);
    expect(cores.qtdPintadas).toBe(1); // a pintura livre fica salva
  });

  it('exercício: só membros pintam; conferir aponta grupo errado, faltas e nomes; resposta e recomeçar', () => {
    const i = EXERCICIOS.indexOf(ex);
    clicar(secao.querySelector(`[data-ex="${i}"]`));
    const [exAberto, mostrar] = cb.aoIniciar.mock.calls.at(-1);
    expect(exAberto).toBe(ex);
    expect(mostrar(malhaEn('digastric'))).toBe(true);
    expect(mostrar(malhaEn('mandible', 'M'))).toBe(true); // contexto
    expect(mostrar(malhaEn('masseter'))).toBe(false);

    const supra = ex.grupos[0], infra = ex.grupos[1];
    selecao.interceptar([acerto(malhaEn('masseter'))]); // não é membro: ignorado
    expect(cores.pintura(malhaEn('masseter'))).toBeNull();
    escolherCor(supra.cor);
    selecao.interceptar([acerto(malhaEn('digastric'))]);
    responder('digastrico');
    selecao.interceptar([acerto(malhaEn('sternohyoid'))]); // grupo errado
    acao('nome-pular');
    acao('conferir');
    const r = card.querySelector('.retorno');
    expect(r.className).toContain('errado');
    expect(r.textContent).toContain('1 no grupo errado');
    expect(r.textContent).toContain('Nomes: 1 certos');

    acao('resposta');
    expect(cores.pintura(malhaEn('sternohyoid'))).toBe(infra.cor);
    expect(card.querySelector('.retorno').textContent).toContain('Resposta mostrada');
    acao('recomecar');
    expect(cores.pintura(malhaEn('digastric'))).toBeNull();

    acao('sair');
    expect(cb.aoSair).toHaveBeenCalledWith(true);
  });

  it('exercício perfeito com nomes; não grava a pintura livre', () => {
    cores.pintar(malhaEn('masseter'), PALETA[0].hex); // pintura livre anterior
    clicar(secao.querySelector(`[data-ex="${EXERCICIOS.indexOf(ex)}"]`));
    const nomearCb = card.querySelector('[data-acao="nomear"]');
    nomearCb.checked = false;
    mudar(nomearCb);
    for (const g of ex.grupos) {
      escolherCor(g.cor);
      for (const m of modelos.malhas.values()) if (g.en.includes(m.userData.info.en)) selecao.interceptar([acerto(m)]);
    }
    acao('conferir');
    expect(card.querySelector('.retorno').textContent).toMatch(/Perfeito/);
    acao('sair');
    expect(cores.pintura(malhaEn('masseter'))).toBe(PALETA[0].hex);
    expect(cores.pintura(malhaEn('digastric'))).toBeNull();
    expect(localStorage.getItem('atlas-pintura-nomear')).toBe('0');
  });

  it('borracha apaga; toque no vazio não faz nada; "Limpar" do pincel pede confirmação antes de apagar tudo', () => {
    clicar(secao.querySelector('[data-acao="pincel"]'));
    const nomearCb = card.querySelector('[data-acao="nomear"]');
    nomearCb.checked = false;
    mudar(nomearCb);
    const m = malhaEn('masseter');
    selecao.interceptar([acerto(m)]);
    expect(cores.pintura(m)).toBe(PALETA[0].hex);
    clicar(card.querySelector('[data-cor=""]')); // borracha
    expect(card.querySelector('[data-cor=""]').classList.contains('ativa')).toBe(true);
    expect(card.querySelector('[data-cor=""]').getAttribute('aria-pressed')).toBe('true');
    expect(card.querySelector(`[data-cor="${PALETA[0].hex}"]`).getAttribute('aria-pressed')).toBe('false');
    selecao.interceptar([acerto(m)]);
    expect(cores.pintura(m)).toBeNull();
    expect(selecao.interceptar([])).toBe(true);
    escolherCor(PALETA[4].hex);
    selecao.interceptar([acerto(m)]);
    vi.useFakeTimers();
    const limpar = card.querySelector('[data-acao="limpar"]');
    acao('limpar'); // primeiro toque só arma a confirmação no próprio botão
    expect(limpar.textContent).toBe('Confirmar: apagar tudo');
    expect(cores.qtdPintadas).toBe(1);
    vi.advanceTimersByTime(4000); // sem o segundo toque, desarma
    expect(limpar.textContent).toBe('Limpar pintura');
    expect(cores.qtdPintadas).toBe(1);
    acao('limpar');
    acao('limpar'); // segundo toque confirma
    expect(cores.qtdPintadas).toBe(0);
    expect(limpar.classList.contains('confirmar')).toBe(false);
    vi.useRealTimers();
  });

  it('abrir um exercício com o pincel aberto sai do pincel primeiro', () => {
    clicar(secao.querySelector('[data-acao="pincel"]'));
    clicar(secao.querySelector('[data-ex="0"]'));
    expect(cb.aoSair).toHaveBeenCalledWith(false);
    expect(card.querySelector('h2').textContent).toBe(EXERCICIOS[0].nome);
    expect(card.querySelectorAll('.amostra')).toHaveLength(EXERCICIOS[0].grupos.length + 1);
  });

  it('nome vazio não é enviado; Enter confirma', () => {
    clicar(secao.querySelector('[data-acao="pincel"]'));
    selecao.interceptar([acerto(malhaEn('masseter'))]);
    acao('nome-ok');
    expect(card.querySelector('.campo-nome')).not.toBeNull(); // continua pedindo
    const campo = card.querySelector('.campo-nome');
    campo.value = 'masseter';
    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(card.querySelector('.retorno.certo')).not.toBeNull();
  });

  it('a sessão do exercício abre direto no título (sem rótulo acima dele)', () => {
    clicar(secao.querySelector('[data-ex="0"]'));
    const primeiroTexto = [...card.children].find((e) => !e.classList.contains('fechar'));
    expect(primeiroTexto.tagName.toLowerCase()).toBe('h2');
  });

  it('"Grupos dentais": dentes são membros; maxila e mandíbula aparecem como contexto; outros ossos não', () => {
    clicar(secao.querySelector(`[data-ex="${EXERCICIOS.findIndex((x) => x.nome === 'Grupos dentais')}"]`));
    const [, mostrar] = cb.aoIniciar.mock.calls.at(-1);
    const falsa = (e) => ({ userData: { info: e } });
    expect(mostrar(falsa(porEn('lower first secondary molar tooth', 'E')))).toBe(true);
    expect(mostrar(falsa(porEn('maxilla', 'D')))).toBe(true);
    expect(mostrar(falsa(porEn('frontal bone')))).toBe(false);
    expect(mostrar({ userData: { info: null } })).toBe(false);
  });

  it('eventos fora dos controles da seção e da sessão não fazem nada', () => {
    clicar(secao.querySelector('.dica'));
    mudar(secao);
    clicar(secao.appendChild(Object.assign(document.createElement('button'), { textContent: 'outro' })));
    expect(pintura.ativo).toBe(false);
    expect(cores.modo).toBe('natural');
    clicar(secao.querySelector('[data-acao="pincel"]'));
    clicar(card.querySelector('.dica'));
    const desconhecido = Object.assign(document.createElement('button'), { textContent: 'outro' });
    desconhecido.dataset.acao = 'desconhecida';
    clicar(card.appendChild(desconhecido));
    expect(pintura.ativo).toBe(true);
    expect(cores.qtdPintadas).toBe(0);
  });

  it('sair sem nada aberto não chama aoSair', () => {
    pintura.sair();
    expect(cb.aoSair).not.toHaveBeenCalled();
  });

  it('estrutura sem dados no exercício não é membro; acertos todos translúcidos usam o primeiro', () => {
    clicar(secao.querySelector(`[data-ex="${EXERCICIOS.indexOf(ex)}"]`));
    const semInfo = malhaEn('masseter'), a = malhaEn('digastric'), b = malhaEn('mylohyoid');
    semInfo.userData.info = null;
    selecao.interceptar([acerto(semInfo)]);
    expect(cores.pintura(semInfo)).toBeNull();
    a.material.opacity = 0.3;
    b.material.opacity = 0.3;
    selecao.interceptar([acerto(a), acerto(b)]);
    expect(cores.pintura(a)).toBe(ex.grupos[0].cor);
    expect(cores.pintura(b)).toBeNull();
  });

  it('apagar a estrutura que aguarda o nome fecha a pergunta; resposta já dada não é afetada', () => {
    clicar(secao.querySelector('[data-acao="pincel"]'));
    const m = malhaEn('masseter');
    selecao.interceptar([acerto(m)]);
    expect(card.querySelector('.campo-nome')).not.toBeNull();
    selecao.interceptar([acerto(m)]); // mesma cor: apaga
    expect(card.querySelector('.caixa-nome').innerHTML).toBe('');
    selecao.interceptar([acerto(m)]);
    responder('masseteer'); // erro de digitação aceito
    expect(card.querySelector('.retorno.certo').textContent).toContain('confira a grafia');
    selecao.interceptar([acerto(m)]); // apagar depois de responder mantém o retorno
    expect(card.querySelector('.retorno.certo')).not.toBeNull();
  });

  it('Enter confirma; outras teclas e mudanças no campo não', () => {
    clicar(secao.querySelector('[data-acao="pincel"]'));
    selecao.interceptar([acerto(malhaEn('masseter'))]);
    const campo = card.querySelector('.campo-nome');
    campo.value = 'masseter';
    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    mudar(campo);
    expect(card.querySelector('.campo-nome')).not.toBeNull();
    card.querySelector('.acoes').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(card.querySelector('.campo-nome')).not.toBeNull();
  });

  it('borracha escolhida: o pincel reabre na 1ª cor; no exercício, "Recomeçar" mantém a borracha', () => {
    clicar(secao.querySelector('[data-acao="pincel"]'));
    clicar(card.querySelector('[data-cor=""]'));
    acao('sair');
    clicar(secao.querySelector('[data-acao="pincel"]'));
    expect(card.querySelector(`[data-cor="${PALETA[0].hex}"]`).classList.contains('ativa')).toBe(true);
    acao('sair');
    clicar(secao.querySelector(`[data-ex="${EXERCICIOS.indexOf(ex)}"]`));
    clicar(card.querySelector('[data-cor=""]'));
    acao('recomecar');
    expect(card.querySelector('[data-cor=""]').classList.contains('ativa')).toBe(true);
  });

  it('a opção de dar nome é lembrada ao reabrir e pode ser religada', () => {
    clicar(secao.querySelector('[data-acao="pincel"]'));
    const cbNome = () => card.querySelector('[data-acao="nomear"]');
    cbNome().checked = false;
    mudar(cbNome());
    acao('sair');
    clicar(secao.querySelector('[data-acao="pincel"]'));
    expect(cbNome().checked).toBe(false);
    selecao.interceptar([acerto(malhaEn('masseter'))]);
    expect(card.querySelector('.campo-nome')).toBeNull();
    cbNome().checked = true;
    mudar(cbNome());
    expect(localStorage.getItem('atlas-pintura-nomear')).toBe('1');
    selecao.interceptar([acerto(malhaEn('temporalis'))]);
    expect(card.querySelector('.campo-nome')).not.toBeNull();
  });

  it('conferir sem nada pintado: só faltas, sem correção de nomes', () => {
    clicar(secao.querySelector(`[data-ex="${EXERCICIOS.indexOf(ex)}"]`));
    acao('conferir');
    const r = card.querySelector('.retorno');
    expect(r.className).toContain('errado');
    expect(r.textContent).toContain('0 no grupo errado');
    expect(r.textContent).not.toContain('No grupo errado');
    expect(r.textContent).not.toContain('Nomes');
  });

  it('poucos nomes errados aparecem todos, sem reticências', () => {
    clicar(secao.querySelector(`[data-ex="${EXERCICIOS.indexOf(ex)}"]`));
    selecao.interceptar([acerto(malhaEn('digastric'))]);
    responder('masseter');
    acao('conferir');
    const r = card.querySelector('.retorno');
    expect(r.textContent).toContain('· 1 errados');
    expect(r.innerHTML).toContain('"masseter" → <b>');
    expect(r.innerHTML).not.toContain('…');
  });

  it('muitos erros: a lista de grupo errado e a de nomes errados são resumidas', () => {
    const mx = EXERCICIOS.find((x) => x.nome.startsWith('Mastigação'));
    clicar(secao.querySelector(`[data-ex="${EXERCICIOS.indexOf(mx)}"]`));
    const [, mostrar] = cb.aoIniciar.mock.calls.at(-1);
    expect(mostrar(malhaEn('mandible', 'M'))).toBe(true);  // ossos de contexto
    expect(mostrar(malhaEn('sternohyoid'))).toBe(false);   // músculo fora do exercício
    escolherCor(mx.grupos[0].cor); // cor da mastigação em músculos da expressão
    const expressao = [...modelos.malhas.values()].filter((m) => mx.grupos[1].en.includes(m.userData.info.en)).slice(0, 9);
    expect(expressao).toHaveLength(9);
    for (const m of expressao) { selecao.interceptar([acerto(m)]); responder('nome qualquer'); }
    acao('conferir');
    const r = card.querySelector('.retorno');
    expect(r.textContent).toContain('9 no grupo errado');
    expect(r.textContent).toContain('· 9 errados');
    expect(r.innerHTML.match(/→/g)).toHaveLength(6); // só os 6 primeiros nomes errados
    expect(r.innerHTML).toContain('…');
  });

  it('exercício perfeito, com todos os nomes certos', () => {
    clicar(secao.querySelector(`[data-ex="${EXERCICIOS.indexOf(ex)}"]`));
    for (const g of ex.grupos) {
      escolherCor(g.cor);
      for (const m of modelos.malhas.values()) {
        if (!g.en.includes(m.userData.info.en)) continue;
        selecao.interceptar([acerto(m)]);
        responder(m.userData.info.pt);
      }
    }
    acao('conferir');
    expect(card.querySelector('.retorno').textContent).toMatch(/Perfeito! .* todas com o nome certo/);
  });

  it('"Limpar pintura" do painel pede confirmação no próprio botão; sem pintura, não arma', () => {
    const bt = secao.querySelector('[data-acao="limpar-tudo"]');
    clicar(bt);
    expect(bt.textContent).toBe('Limpar pintura'); // nada pintado: nada a confirmar
    cores.pintar(malhaEn('masseter'), PALETA[0].hex);
    clicar(bt);
    expect(cores.qtdPintadas).toBe(1);
    expect(bt.classList.contains('confirmar')).toBe(true);
    clicar(bt);
    expect(cores.qtdPintadas).toBe(0);
  });
});
