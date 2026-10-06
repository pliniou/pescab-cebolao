// Módulos de cena sem WebGL: cortes, raio-X, cores, explosão e caixa dos objetos.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { criarCortes } from '../src/scene/cortes.js';
import { criarRaioX, aplicarOpacidade } from '../src/scene/raiox.js';
import { criarCores, PALETA } from '../src/scene/cores.js';
import { criarExplosao, MEDIANOS } from '../src/scene/explosao.js';
import { caixaDosObjetos } from '../src/scene/viewer.js';
import { ehGengiva } from '../src/scene/modelos.js';
import { criarModelos, criarViewerFalso, porEn, DADOS } from './fixtures.js';

const comPos = (e, pos, tam) => ({ ...e, pos, tam });

describe('caixaDosObjetos', () => {
  it('une as caixas no espaço do mundo; lista vazia dá caixa vazia', () => {
    const { malhas } = criarModelos([comPos(porEn('frontal bone'), [0, 0.1, 0], 0.02), comPos(porEn('mandible'), [0, -0.1, 0.05], 0.02)]);
    const c = caixaDosObjetos([...malhas.values()]);
    expect(c.min.y).toBeCloseTo(-0.11);
    expect(c.max.y).toBeCloseTo(0.11);
    expect(c.max.z).toBeCloseTo(0.06);
    expect(caixaDosObjetos([]).isEmpty()).toBe(true);
  });
});

describe('cortes', () => {
  let viewer, cortes, modelos;
  beforeEach(() => {
    viewer = criarViewerFalso();
    modelos = criarModelos([comPos(porEn('frontal bone'), [0, 0, 0], 0.2)]);
    cortes = criarCortes(viewer, modelos);
  });

  it('limites cobrem a cena com folga e nenhum plano começa ativo', () => {
    expect(cortes.limites.sagital[0]).toBeCloseTo(-0.105);
    expect(cortes.limites.axial[1]).toBeCloseTo(0.105);
    expect(viewer.renderer.clippingPlanes).toEqual([]);
  });

  it('sem inverter mantém o lado de coordenada menor; invertido, o maior', () => {
    cortes.definir('sagital', { ativo: true, valor: 0.01 });
    expect(viewer.renderer.clippingPlanes).toHaveLength(1);
    expect(cortes.mantem(new THREE.Vector3(-0.05, 0, 0))).toBe(true);
    expect(cortes.mantem(new THREE.Vector3(0.05, 0, 0))).toBe(false);
    cortes.definir('sagital', { inverter: true });
    expect(cortes.mantem(new THREE.Vector3(-0.05, 0, 0))).toBe(false);
    expect(cortes.mantem(new THREE.Vector3(0.05, 0, 0))).toBe(true);
  });

  it('cada mudança invalida a cena', () => {
    const antes = viewer.invalidacoes;
    cortes.definir('axial', { ativo: true });
    expect(viewer.invalidacoes).toBe(antes + 1);
  });

  it('recortar reduz a caixa ao lado mantido por cada corte ativo', () => {
    const caixa = () => new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
    expect(cortes.recortar(caixa()).equals(caixa())).toBe(true); // nada ativo
    cortes.definir('sagital', { ativo: true, valor: 0.2 });
    cortes.definir('axial', { ativo: true, valor: -0.5, inverter: true });
    const c = cortes.recortar(caixa());
    expect(c.max.x).toBeCloseTo(0.2);
    expect(c.min.x).toBe(-1);
    expect(c.min.y).toBeCloseTo(-0.5);
    expect(c.max.y).toBe(1);
  });

  it('recortar tudo deixa a caixa vazia', () => {
    cortes.definir('coronal', { ativo: true, valor: -2 });
    const c = cortes.recortar(new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1)));
    expect(c.isEmpty()).toBe(true);
  });
});

describe('raio-X', () => {
  const montar = () => {
    const modelos = criarModelos([porEn('frontal bone'), porEn('masseter', 'D'), porEn('masseter', 'E')]);
    let mudancas = 0;
    const raiox = criarRaioX(modelos, ['ossos', 'musculos'], () => mudancas++);
    return { modelos, raiox, mudancas: () => mudancas };
  };

  it('aplicarOpacidade: translúcido não grava profundidade; trocar o modo recompila o material', () => {
    const mat = new THREE.MeshStandardMaterial();
    const v0 = mat.version;
    aplicarOpacidade(mat, 0.4);
    expect(mat).toMatchObject({ opacity: 0.4, transparent: true, depthWrite: false });
    expect(mat.version).toBe(v0 + 1);
    aplicarOpacidade(mat, 0.6); // continua translúcido: sem recompilar
    expect(mat.version).toBe(v0 + 1);
    aplicarOpacidade(mat, 1);
    expect(mat).toMatchObject({ opacity: 1, transparent: false, depthWrite: true });
    expect(mat.version).toBe(v0 + 2);
  });

  it('definir aplica na camada inteira e avisa', () => {
    const { modelos, raiox, mudancas } = montar();
    raiox.definir('musculos', 0.3);
    expect(raiox.valor('musculos')).toBe(0.3);
    for (const m of modelos.grupos.musculos.children) expect(m.material.opacity).toBe(0.3);
    expect(modelos.malhas.get(porEn('frontal bone').id).material.opacity).toBe(1);
    expect(mudancas()).toBe(1);
  });

  it('restaurarMalha volta ao valor atual da camada', () => {
    const { modelos, raiox } = montar();
    const m = modelos.malhas.get(porEn('masseter', 'D').id);
    raiox.definir('musculos', 0.5);
    aplicarOpacidade(m.material, 0.1);
    raiox.restaurarMalha(m);
    expect(m.material.opacity).toBe(0.5);
  });

  it('salvar/restaurar devolvem todas as camadas, com um só aviso', () => {
    const { raiox, mudancas } = montar();
    const s = raiox.salvar();
    raiox.definir('ossos', 0.2);
    raiox.definir('musculos', 0.7);
    const antes = mudancas();
    raiox.restaurar(s);
    expect(raiox.valor('ossos')).toBe(1);
    expect(raiox.valor('musculos')).toBe(1);
    expect(mudancas()).toBe(antes + 1);
  });

  it('camada a 0% deixa de ser desenhada (material.visible) sem mexer na visibilidade da estrutura', () => {
    const { modelos, raiox } = montar();
    raiox.definir('musculos', 0);
    for (const m of modelos.grupos.musculos.children) {
      expect(m.material.visible).toBe(false);
      expect(m.visible).toBe(true);
    }
    raiox.definir('musculos', 0.3);
    for (const m of modelos.grupos.musculos.children) expect(m.material.visible).toBe(true);
  });
});

describe('cores', () => {
  const lista = [porEn('maxilla', 'D'), porEn('maxilla', 'E'), porEn('frontal bone'),
    porEn('lower first secondary molar tooth', 'E'), DADOS.estruturas.find((e) => e.fdi === '46'),
    porEn('upper central secondary incisor tooth', 'D')];
  let modelos;
  beforeEach(() => {
    localStorage.clear();
    modelos = criarModelos(lista);
  });
  const malha = (e) => modelos.malhas.get(e.id);
  const hex = (e) => malha(e).material.color.getHexString();

  it('começa nas cores naturais, com cor-base = cor exibida', () => {
    const cores = criarCores(modelos);
    expect(cores.modo).toBe('natural');
    for (const m of modelos.malhas.values()) expect(m.material.userData.cor.equals(m.material.color)).toBe(true);
  });

  it('modo atlas: os dois lados com a mesma cor; dentes pela posição FDI; estruturas diferentes, cores diferentes', () => {
    const cores = criarCores(modelos);
    cores.modo = 'atlas';
    expect(hex(lista[0])).toBe(hex(lista[1]));     // maxila D = E
    expect(hex(lista[3])).toBe(hex(lista[4]));     // 36 = 46
    expect(hex(lista[0])).not.toBe(hex(lista[2])); // maxila ≠ frontal
    expect(hex(lista[3])).not.toBe(hex(lista[5])); // molar ≠ incisivo
    expect(JSON.parse(localStorage.getItem('atlas-cores-v1')).modo).toBe('atlas');
  });

  it('pintura por cima do modo, persistida; pintar null apaga', () => {
    const cores = criarCores(modelos);
    cores.pintar(malha(lista[2]), PALETA[0].hex);
    expect(cores.corCss(malha(lista[2]))).toBe(PALETA[0].hex);
    expect(cores.qtdPintadas).toBe(1);
    const recarregado = criarCores(criarModelos(lista));
    expect(recarregado.qtdPintadas).toBe(1);
    cores.pintar(malha(lista[2]), null);
    expect(cores.pintura(malha(lista[2]))).toBeNull();
    expect(cores.corCss(malha(lista[2]))).toBe(cores.corOriginalCss(malha(lista[2])));
  });

  it('modo temporário (exercícios) não grava e devolve a pintura anterior', () => {
    const cores = criarCores(modelos);
    cores.pintar(malha(lista[2]), PALETA[1].hex);
    const salvo = localStorage.getItem('atlas-cores-v1');
    const voltar = cores.iniciarTemporario();
    expect(cores.pintura(malha(lista[2]))).toBeNull();
    cores.pintar(malha(lista[0]), PALETA[3].hex);
    expect(localStorage.getItem('atlas-cores-v1')).toBe(salvo);
    voltar();
    expect(cores.pintura(malha(lista[2]))).toBe(PALETA[1].hex);
    expect(cores.pintura(malha(lista[0]))).toBeNull();
  });

  it('limpar apaga toda a pintura; dado corrompido no aparelho vira estado inicial', () => {
    const cores = criarCores(modelos);
    cores.pintar(malha(lista[0]), PALETA[2].hex);
    cores.limpar();
    expect(cores.qtdPintadas).toBe(0);
    localStorage.setItem('atlas-cores-v1', '{corrompido');
    expect(criarCores(criarModelos(lista)).modo).toBe('natural');
  });

  it('modo atlas no modelo inteiro: nenhuma cor se repete entre estruturas diferentes, nem entre camadas', () => {
    const todos = criarModelos(DADOS.estruturas);
    const cores = criarCores(todos);
    cores.modo = 'atlas';
    const chave = (m) => { const e = m.userData.info; return e.fdi ? `dente-${Number(e.fdi) % 10}` : `${m.userData.camada}|${e.en}`; };
    const porCor = new Map();
    for (const m of todos.malhas.values()) {
      const c = m.material.color.getHexString();
      if (!porCor.has(c)) porCor.set(c, new Set());
      porCor.get(c).add(chave(m));
    }
    for (const [c, chaves] of porCor) expect([...chaves], `#${c}`).toHaveLength(1);
  });

  it('estado salvo validado: modo desconhecido vira natural; pintura de id inexistente ou cor inválida é descartada', () => {
    localStorage.setItem('atlas-cores-v1', JSON.stringify({
      modo: 'arco-iris',
      pintura: { [lista[0].id]: PALETA[0].hex, id_que_sumiu: PALETA[1].hex, [lista[2].id]: 'vermelho' },
    }));
    const cores = criarCores(modelos);
    expect(cores.modo).toBe('natural');
    expect(cores.qtdPintadas).toBe(1);
    expect(cores.pintura(malha(lista[0]))).toBe(PALETA[0].hex);
    localStorage.setItem('atlas-cores-v1', 'null');
    expect(criarCores(criarModelos(lista)).qtdPintadas).toBe(0);
  });
});

describe('explosão', () => {
  const lista = [
    comPos(porEn('sphenoid bone'), [0, 0, 0]),
    comPos(porEn('ethmoid'), [0, 0, 0.02]),
    comPos(porEn('frontal bone'), [0, 0.05, 0.04]),
    comPos(porEn('maxilla', 'D'), [-0.03, -0.03, 0.04]),
    comPos(porEn('mandible'), [0, -0.07, 0.03]),
    comPos(porEn('upper central secondary incisor tooth', 'D'), [-0.005, -0.04, 0.06]),
    comPos(porEn('lower first secondary molar tooth', 'E'), [0.02, -0.06, 0.03]),
    comPos(porEn('gingiva'), [0, -0.05, 0.04]),
    comPos(porEn('masseter', 'D'), [-0.05, -0.04, 0]),
  ];
  let viewer, modelos, explosao;
  const m = (i) => modelos.malhas.get(lista[i].id);
  const ate = (alvo) => { explosao.definir(alvo); for (let i = 0; i < 400 && viewer.quadro(0.05); i++); };
  beforeEach(() => {
    viewer = criarViewerFalso();
    modelos = criarModelos(lista);
    explosao = criarExplosao(viewer, modelos.malhas);
  });

  it('parada não pede quadro nem invalida', () => {
    expect(viewer.quadro()).toBe(false);
    expect(viewer.invalidacoes).toBe(0);
  });

  it('com movimento reduzido as peças vão direto para a posição final, num quadro só', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    explosao.definir(1);
    expect(viewer.quadro(0.016)).toBe(true);
    expect(explosao.valor).toBe(1);
    expect(viewer.quadro(0.016)).toBe(false);
    vi.unstubAllGlobals();
  });

  it('a 100%: esfenoide fixo, etmoide na direção própria, frontal no vetor radial ×0,75', () => {
    ate(1);
    expect(explosao.valor).toBe(1);
    expect(m(0).position.length()).toBeCloseTo(0);
    const [x, y, z, d] = MEDIANOS.ethmoid;
    const esperado = new THREE.Vector3(x, y, z).normalize().multiplyScalar(d).add(m(1).userData.base);
    expect(m(1).position.distanceTo(esperado)).toBeLessThan(1e-6);
    expect(m(2).position.y).toBeCloseTo(0.05 * 1.75);
    expect(viewer.invalidacoes).toBeGreaterThan(0);
  });

  it('dentes acompanham o osso de suporte e saem do alvéolo; gengiva e músculos ficam parados', () => {
    ate(1);
    const deslMaxila = m(3).position.clone().sub(m(3).userData.base);
    const deslIncisivo = m(5).position.clone().sub(m(5).userData.base);
    expect(deslIncisivo.x).toBeCloseTo(deslMaxila.x);
    expect(deslIncisivo.y).toBeCloseTo(deslMaxila.y - 0.014);
    const deslMandibula = m(4).position.clone().sub(m(4).userData.base);
    const deslMolar = m(6).position.clone().sub(m(6).userData.base);
    expect(deslMolar.y).toBeCloseTo(deslMandibula.y + 0.014);
    expect(ehGengiva(m(7))).toBe(true);
    expect(m(7).position.equals(m(7).userData.base)).toBe(true);
    expect(m(8).position.equals(m(8).userData.base)).toBe(true);
  });

  it('valor limitado a 0..1 e volta à posição original', () => {
    explosao.definir(5);
    expect(explosao.valor).toBe(1);
    ate(1);
    ate(-3);
    expect(explosao.valor).toBe(0);
    for (const x of modelos.malhas.values()) expect(x.position.equals(x.userData.base)).toBe(true);
  });
});
