// Integridade entre o código e os dados gerados pelo pipeline: roteiros, exercícios e explosão encontram as
// estruturas pelo nome `en` do dicionário. Se o pipeline renomear uma estrutura, estes testes falham em vez de o
// roteiro ficar vazio sem aviso.
import { describe, it, expect } from 'vitest';
import { PRESETS } from '../src/ui/presets.js';
import { EXERCICIOS, pertence } from '../src/ui/pintura.js';
import { MEDIANOS } from '../src/scene/explosao.js';
import { PALETA } from '../src/scene/cores.js';
import conformidade from '../src/data/conformidade.json';
import { DADOS, CAMADAS } from './fixtures.js';

const nomes = new Set(DADOS.estruturas.map((e) => e.en));
const ids = new Set(DADOS.estruturas.map((e) => e.id));
const faltando = (lista) => lista.filter((n) => !nomes.has(n));

describe('dicionário', () => {
  it('tem ids únicos e camadas conhecidas', () => {
    expect(ids.size).toBe(DADOS.estruturas.length);
    for (const e of DADOS.estruturas) expect(CAMADAS).toContain(e.camada);
    expect(Object.keys(DADOS.camadas)).toEqual(CAMADAS);
  });
  it('toda estrutura tem nome em português e lado D, E ou M', () => {
    for (const e of DADOS.estruturas) {
      expect(e.pt, e.id).toBeTruthy();
      expect(['D', 'E', 'M'], e.id).toContain(e.lado);
    }
  });
  it('a gengiva existe (tratada à parte na cena, na explosão e no quiz)', () => {
    expect(nomes.has('gingiva')).toBe(true);
  });
  it('os avisos de conformidade apontam para estruturas existentes', () => {
    expect(Object.keys(conformidade.avisos).filter((id) => !ids.has(id))).toEqual([]);
  });
});

// O estruturas.json é gerado (etapa 05) a partir do catálogo e das descrições do pipeline. Se alguém editar um nome,
// latim ou descrição e esquecer de regerar, o app mostraria o texto antigo: este teste pega. Para regerar sem o cache
// do pipeline: node pipeline/05-dicionario.mjs
describe('dicionário em dia com o catálogo e as descrições do pipeline', () => {
  it('nome, latim, FDI, descrição e "revisar" de toda estrutura batem com catalogo.mjs e descricoes.mjs', async () => {
    const { CATALOGO, nomeComLado } = await import('../pipeline/catalogo.mjs');
    const { DESCRICOES, DESC_DENTE, REVISAR } = await import('../pipeline/descricoes.mjs');
    const divergencias = [];
    for (const e of DADOS.estruturas) {
      const c = CATALOGO.find((x) => x.camada === e.camada && x.en === e.en);
      if (!c) { divergencias.push(`${e.id}: fora do catálogo`); continue; }
      const { pt, fdi } = nomeComLado(c, e.lado);
      const descricao = DESCRICOES[e.en] || (fdi && DESC_DENTE[Number(fdi.slice(-1))]) || null;
      const revisar = !!(c.revisar || REVISAR.has(e.en) || !descricao);
      const esperado = { pt, la: c.la || null, fdi, descricao, revisar };
      const atual = { pt: e.pt, la: e.la, fdi: e.fdi, descricao: e.descricao, revisar: !!e.revisar };
      for (const k of Object.keys(esperado)) if (esperado[k] !== atual[k]) divergencias.push(`${e.id}.${k}`);
    }
    expect(divergencias, 'rode node pipeline/05-dicionario.mjs').toEqual([]);
  });
});

describe('roteiros de estudo (PRESETS)', () => {
  for (const p of PRESETS) {
    describe(p.nome, () => {
      it('cita só nomes que existem no dicionário', () => {
        for (const [camada, cfg] of Object.entries(p.camadas)) {
          expect(CAMADAS).toContain(camada);
          if (Array.isArray(cfg.so)) expect(faltando(cfg.so), camada).toEqual([]);
        }
      });
      it('mostra pelo menos uma estrutura de cada camada listada', () => {
        for (const [camada, cfg] of Object.entries(p.camadas)) {
          const membros = DADOS.estruturas.filter((e) => e.camada === camada
            && (Array.isArray(cfg.so) ? cfg.so.includes(e.en) : typeof cfg.so === 'function' ? cfg.so(e) : true)
            && (!cfg.lado || e.lado === 'M' || e.lado === cfg.lado));
          expect(membros.length, camada).toBeGreaterThan(0);
        }
      });
      if (p.selecionar) {
        it('seleciona uma estrutura que o próprio roteiro mostra', () => {
          const [en, lado] = p.selecionar;
          const e = DADOS.estruturas.find((x) => x.en === en && x.lado === lado);
          expect(e).toBeTruthy();
          const cfg = p.camadas[e.camada];
          expect(cfg).toBeTruthy();
          if (Array.isArray(cfg.so)) expect(cfg.so).toContain(en);
        });
      }
    });
  }
});

describe('exercícios de pintura', () => {
  for (const ex of EXERCICIOS) {
    describe(ex.nome, () => {
      it('cita só nomes que existem no dicionário', () => {
        for (const g of ex.grupos) if (g.en) expect(faltando(g.en), g.nome).toEqual([]);
      });
      it('todo grupo tem membros numa camada do exercício', () => {
        for (const g of ex.grupos) {
          const membros = DADOS.estruturas.filter((e) => ex.camadas[e.camada] && pertence(g, e));
          expect(membros.length, g.nome).toBeGreaterThan(0);
        }
      });
      it('nenhum membro está "a conferir" (o exercício pede o nome de cada estrutura pintada)', () => {
        const aConferir = DADOS.estruturas.filter((e) => e.revisar && ex.camadas[e.camada] && ex.grupos.some((g) => pertence(g, e)));
        expect(aConferir.map((e) => e.id)).toEqual([]);
      });
      it('grupos com cores distintas', () => {
        const cores = ex.grupos.map((g) => g.cor);
        expect(new Set(cores).size).toBe(cores.length);
      });
    });
  }
});

describe('explosão', () => {
  it('os ossos medianos com direção própria existem', () => {
    expect(faltando(Object.keys(MEDIANOS))).toEqual([]);
  });
  it('maxilas (por lado) e mandíbula existem para os dentes acompanharem', () => {
    expect(DADOS.estruturas.filter((e) => e.en === 'maxilla').map((e) => e.lado).sort()).toEqual(['D', 'E']);
    expect(nomes.has('mandible')).toBe(true);
  });
  it('todo dente com FDI é superior ou inferior pelo nome', () => {
    for (const e of DADOS.estruturas.filter((x) => x.fdi)) expect(e.en).toMatch(/^(upper|lower) /);
  });
});

describe('paleta', () => {
  it('cores hexadecimais únicas', () => {
    for (const p of PALETA) expect(p.hex).toMatch(/^#[0-9a-f]{6}$/);
    expect(new Set(PALETA.map((p) => p.hex)).size).toBe(PALETA.length);
  });
});
