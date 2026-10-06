// @vitest-environment node
// Funções puras do pipeline (as etapas em si dependem do cache de ~1 GB e do Blender).
import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { lerObj } from '../pipeline/obj.mjs';
import { readTsv, lerJson, ROOT, CACHE, OBJ_DIR, WORK } from '../pipeline/config.mjs';
import { nomeComLado, CATALOGO } from '../pipeline/catalogo.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-teste-'));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe('lerObj', () => {
  it('lê vértices e triangula polígonos em leque, com índices base 0', () => {
    const arq = path.join(tmp, 'quad.obj');
    fs.writeFileSync(arq, [
      '# comentário', 'v 0 0 0', 'v 1 0 0', 'v 1 1 0', 'v 0 1 0', 'vn 0 0 1',
      'f 1//1 2//1 3//1 4//1', 'f 1 2 3', '',
    ].join('\r\n'));
    const { pos, idx } = lerObj(arq);
    expect(Array.from(pos)).toEqual([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]);
    expect(Array.from(idx)).toEqual([0, 1, 2, 0, 2, 3, 0, 1, 2]);
  });
});

describe('config', () => {
  it('readTsv usa a primeira linha como cabeçalho e ignora linhas vazias', () => {
    expect(readTsv('fj\tnome\r\nFJ1\tmandible\n\nFJ2\tmaxilla\n')).toEqual([
      { fj: 'FJ1', nome: 'mandible' }, { fj: 'FJ2', nome: 'maxilla' },
    ]);
  });
  it('lerJson lê o intermediário ou diz qual etapa o gera', () => {
    const arq = path.join(tmp, 'x.json');
    fs.writeFileSync(arq, '{"a":1}');
    expect(lerJson(arq, 'etapa X')).toEqual({ a: 1 });
    expect(() => lerJson(path.join(tmp, 'falta.json'), 'node pipeline/02-indexar.mjs')).toThrow(/falta .*falta\.json: rode antes node pipeline\/02-indexar\.mjs/);
  });
  it('raiz do projeto e cache fora dela', () => {
    expect(fs.existsSync(path.join(ROOT, 'package.json'))).toBe(true);
    expect(path.relative(ROOT, CACHE).startsWith('..')).toBe(true);
    expect(OBJ_DIR.startsWith(CACHE)).toBe(true);
    expect(WORK.startsWith(CACHE)).toBe(true);
  });
});

describe('nomeComLado (catálogo)', () => {
  const item = (en) => CATALOGO.find((c) => c.en === en);
  it('concorda o lado em gênero e número com a primeira palavra', () => {
    expect(nomeComLado({ pt: 'Músculo masseter' }, 'D').pt).toBe('Músculo masseter direito');
    expect(nomeComLado({ pt: 'Artéria facial' }, 'E').pt).toBe('Artéria facial esquerda');
    expect(nomeComLado({ pt: 'Veias maxilares' }, 'D').pt).toBe('Veias maxilares direitas');
    expect(nomeComLado({ pt: 'Nervos ciliares curtos' }, 'E').pt).toBe('Nervos ciliares curtos esquerdos');
    expect(nomeComLado({ pt: 'Mandíbula' }, 'M')).toEqual({ pt: 'Mandíbula', fdi: undefined });
  });
  it('dentes levam o número FDI pelo lado e pela arcada', () => {
    const molar = item('lower first secondary molar tooth');
    expect(nomeComLado(molar, 'E')).toEqual({ pt: '1º molar inferior esquerdo (36)', fdi: '36' });
    expect(nomeComLado(molar, 'D').fdi).toBe('46');
  });
});
