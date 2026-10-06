import { describe, it, expect } from 'vitest';
import { conferirNome } from '../src/ui/nomes.js';
import { porEn } from './fixtures.js';

const masseter = porEn('masseter', 'D');      // Músculo masseter direito / Musculus masseter
const mandibula = porEn('mandible');          // Mandíbula / Mandibula
const nMandibular = porEn('mandibular nerve', 'E'); // Nervo mandibular (V3) esquerdo
const frontal = porEn('frontal bone');        // Osso frontal / Os frontale
const dente36 = porEn('lower first secondary molar tooth', 'E'); // 1º molar inferior esquerdo (36)
const c3 = porEn('third cervical vertebra');  // Vértebra cervical III (C3)
const carExt = porEn('external carotid artery', 'D'); // Artéria carótida externa direita

describe('conferirNome: formas aceitas', () => {
  it.each([
    ['Músculo masseter direito', masseter],
    ['musculo masseter', masseter],
    ['masseter', masseter],
    ['m. masseter', masseter],
    ['Musculus masseter', masseter],
    ['osso frontal', frontal],
    ['frontal', frontal],
    ['Os frontale', frontal],
    ['mandibula', mandibula],
    ['36', dente36],
    ['1º molar inferior', dente36],
    ['primeiro molar inferior', dente36],
    ['C3', c3],
    ['vertebra cervical III', c3],
    ['V3', nMandibular],
    ['n. mandibular', nMandibular],
  ])('"%s" é aceito', (resposta, info) => {
    const r = conferirNome(resposta, info);
    expect(r.ok).toBe(true);
    expect(r.exato).toBe(true);
    expect(r.esperado).toBe(info.pt);
  });
});

describe('conferirNome: tolerância a erros de digitação', () => {
  it('aceita uma letra errada em palavra longa, marcando como não exato', () => {
    const r = conferirNome('masseteer', masseter);
    expect(r).toEqual({ ok: true, exato: false, esperado: masseter.pt });
  });
  it('aceita até dois erros no total, um por palavra', () => {
    expect(conferirNome('arteria carotida externs', carExt).ok).toBe(true);
    expect(conferirNome('artersa carotida externs', carExt).ok).toBe(true);
  });
  it('recusa dois erros na mesma palavra', () => {
    expect(conferirNome('masetero', masseter).ok).toBe(false);
  });
  it('recusa erro em palavra curta, número ou algarismo romano', () => {
    expect(conferirNome('37', dente36).ok).toBe(false);
    expect(conferirNome('vertebra cervical II', c3).ok).toBe(false);
  });
  it('não trata o nome de outra estrutura como erro de digitação', () => {
    expect(conferirNome('mandibula', nMandibular).ok).toBe(false);
    expect(conferirNome('nervo mandibular', mandibula).ok).toBe(false);
  });
  it('"interna" × "externa" (duas letras) não passa', () => {
    expect(conferirNome('arteria carotida interna', carExt).ok).toBe(false);
  });
});

describe('conferirNome: lado no plural (regressão)', () => {
  it('estruturas com nome no plural também dispensam o lado', () => {
    const ciliares = porEn('short ciliary nerve', 'E');   // Nervos ciliares curtos esquerdos
    const veias = porEn('maxillary veins', 'D');          // Veias maxilares direitas
    expect(conferirNome('nervos ciliares curtos', ciliares)).toMatchObject({ ok: true, exato: true });
    expect(conferirNome('veias maxilares', veias)).toMatchObject({ ok: true, exato: true });
    expect(conferirNome('Veias maxilares direitas', veias).ok).toBe(true);
  });
  it('o termo genérico no plural também pode ser omitido, em português e em latim', () => {
    const ciliares = porEn('short ciliary nerve', 'E');
    const veias = porEn('maxillary veins', 'D');
    expect(conferirNome('maxilares', veias)).toMatchObject({ ok: true, exato: true });
    expect(conferirNome('ciliares curtos', ciliares)).toMatchObject({ ok: true, exato: true });
    if (veias.la.startsWith('Venae ')) expect(conferirNome(veias.la.slice(6), veias).ok).toBe(true);
  });
});

describe('conferirNome: letras trocadas', () => {
  it('duas letras vizinhas trocadas contam como um erro só', () => {
    expect(conferirNome('massetre', masseter)).toMatchObject({ ok: true, exato: false }); // er → re
    expect(conferirNome('arteria carotdia externa', carExt)).toMatchObject({ ok: true, exato: false });
  });
  it('troca mais outro erro na mesma palavra continua recusada', () => {
    expect(conferirNome('msaeter', masseter).ok).toBe(false);
  });
});

describe('conferirNome: entradas vazias', () => {
  it('resposta vazia ou só com lado é errada', () => {
    expect(conferirNome('', masseter).ok).toBe(false);
    expect(conferirNome('  direito ', masseter).ok).toBe(false);
  });
  it('sem dados da estrutura, nada é aceito', () => {
    expect(conferirNome('masseter', null)).toEqual({ ok: false, exato: false, esperado: '' });
  });
});
