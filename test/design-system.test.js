// Integridade do design system: o CSS é a fonte única dos tokens, o DESIGN.md os documenta sem divergir, e nem o
// CSS das regras, nem o 3D, nem os ícones repetem valores soltos. Estes testes falham se o sistema se desalinhar.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { corDoTema } from '../src/scene/tema3d.js';
import { corDoToken } from '../pipeline/tokens.mjs';
import { PALETA } from '../src/scene/cores.js';
import { EXERCICIOS } from '../src/ui/pintura.js';

const raiz = path.resolve(import.meta.dirname, '..');
const css = fs.readFileSync(path.join(raiz, 'src/style.css'), 'utf8');
const design = fs.readFileSync(path.join(raiz, 'DESIGN.md'), 'utf8');
const bloco = (seletor) => css.match(new RegExp(`${seletor.replace(/[[\]"=]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';
const tokensDe = (texto) => Object.fromEntries([...texto.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, n, v]) => [n, v.trim()]));
const claro = tokensDe(bloco(':root'));
const escuro = tokensDe(bloco(':root[data-tema="escuro"]'));
const regras = css.slice(css.indexOf('* { box-sizing'));

describe('DESIGN.md × CSS', () => {
  const frontmatter = design.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const cores = [...frontmatter.matchAll(/^ {2}([\w-]+):\s*"([^"]+)"/gm)].filter(([, , v]) => /^#|^rgb/.test(v));

  it('toda cor documentada existe no CSS com o mesmo valor (tema claro e, com -noturno, o escuro)', () => {
    expect(cores.length).toBeGreaterThan(20);
    for (const [, nome, valor] of cores) {
      const escuroNome = nome.endsWith('-noturno') ? nome.slice(0, -'-noturno'.length) : null;
      const noCss = escuroNome ? escuro[escuroNome] : claro[nome];
      expect(noCss, nome).toBeDefined();
      expect(noCss.toLowerCase(), nome).toBe(valor.toLowerCase());
    }
  });

  it('todo token de cor do tema escuro existe no claro (mesmos papéis nos dois temas)', () => {
    for (const nome of Object.keys(escuro)) expect(claro[nome], nome).toBeDefined();
  });
});

describe('regras do CSS só com tokens', () => {
  it('nenhuma cor literal fora dos blocos de tokens', () => {
    expect(regras.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g)).toBeNull();
  });
  it('nenhum tamanho de fonte em px fora dos tokens (o celular só redefine tokens)', () => {
    const fontes = regras.split('\n').filter((l) => /font(-size)?\s*:[^;]*\d+(\.\d+)?px/.test(l) && !/^\s*:root/.test(l));
    expect(fontes).toEqual([]);
  });
  it('espaços em padding, margin e gap só por tokens (fios de 1 px e geometria em calc() à parte)', () => {
    const soltos = [...regras.matchAll(/(?:padding|margin|gap)[a-z-]*\s*:\s*([^;{}]*)/g)]
      .map(([, v]) => v).filter((v) => !v.includes('calc(') && /\b\d+px\b/.test(v));
    expect(soltos).toEqual([]);
  });
});

describe('3D lê as cores dos tokens', () => {
  it('corDoTema converte o token na mesma cor que o CSS declara', () => {
    expect(corDoTema('selecao-3d').getHexString()).toBe(claro['selecao-3d'].slice(1));
    expect(corDoTema('certo').getHexString()).toBe(claro.certo.slice(1));
    const alvo = new THREE.Color();
    expect(corDoTema('pergunta-3d', alvo)).toBe(alvo);
  });
  it('token inexistente é erro, não preto silencioso', () => {
    expect(() => corDoTema('nao-existe')).toThrow('token de cor ausente');
  });
  it('nenhuma cor hexadecimal escrita no JS do app (exceções: a paleta de pintura e as luzes da cena)', () => {
    // cores.js: PALETA é conteúdo do estudante; viewer.js: luzes são iluminação, não cor do sistema
    const EXCECOES = new Set(['src/scene/cores.js', 'src/scene/viewer.js']);
    const arquivos = fs.readdirSync(path.join(raiz, 'src'), { recursive: true })
      .map((a) => `src/${a.replaceAll('\\', '/')}`).filter((a) => a.endsWith('.js') && !EXCECOES.has(a));
    expect(arquivos.length).toBeGreaterThan(15);
    for (const arq of arquivos) {
      const js = fs.readFileSync(path.join(raiz, arq), 'utf8');
      expect(js.match(/0x[0-9a-fA-F]{6}|'#[0-9a-fA-F]{6}'/g), arq).toBeNull();
    }
  });
});

describe('página e manifesto do PWA', () => {
  it('index.html e vite.config.js não escrevem cores: usam o token da barra', () => {
    for (const arq of ['index.html', 'vite.config.js']) {
      const txt = fs.readFileSync(path.join(raiz, arq), 'utf8');
      expect(txt.match(/#[0-9a-fA-F]{6}\b/g), arq).toBeNull();
    }
    expect(fs.readFileSync(path.join(raiz, 'index.html'), 'utf8')).toContain('content="%BARRA%"');
  });
});

describe('paleta de pintura', () => {
  it('as cores dos grupos dos exercícios são tintas da paleta', () => {
    const tintas = new Set(PALETA.map((p) => p.hex));
    for (const ex of EXERCICIOS) for (const g of ex.grupos) expect(tintas.has(g.cor), `${ex.nome}: ${g.nome}`).toBe(true);
  });
});

describe('ícones do app', () => {
  it('pipeline lê as cores do CSS; o favicon usa campo, aço e tinta', () => {
    // o rgb é o mesmo hex do CSS, decomposto (sem repetir o valor da cor aqui)
    const rgbDe = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    expect(corDoToken(css, 'acao')).toEqual({ hex: claro.acao, rgb: rgbDe(claro.acao) });
    expect(() => corDoToken(css, 'nao-existe')).toThrow('não encontrado');
    const svg = fs.readFileSync(path.join(raiz, 'public/icons/favicon.svg'), 'utf8');
    for (const t of ['campo-borda', 'aco', 'tinta']) expect(svg).toContain(`"${claro[t]}"`);
  });
});
