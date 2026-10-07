import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { esc, semAcentos, normalizar, visivel, ehCelular, ehLargo, ehDeitado, lateralSobreVista, focoItinerante } from '../src/util.js';

afterEach(() => vi.unstubAllGlobals());

describe('esc', () => {
  it('escapa os caracteres especiais de HTML', () => {
    expect(esc('<b class="x">a & b</b>')).toBe('&lt;b class=&quot;x&quot;&gt;a &amp; b&lt;/b&gt;');
  });
  it('trata null e undefined como texto vazio e converte números', () => {
    expect(esc(null)).toBe('');
    expect(esc(undefined)).toBe('');
    expect(esc(36)).toBe('36');
  });
});

describe('semAcentos / normalizar', () => {
  it('remove acentos e cedilha', () => {
    expect(semAcentos('Mandíbula, ação, pterigóideo')).toBe('Mandibula, acao, pterigoideo');
  });
  it('normalizar também passa para minúsculas', () => {
    expect(normalizar('Glândula PARÓTIDA')).toBe('glandula parotida');
    expect(normalizar(undefined)).toBe('');
  });
});

describe('visivel', () => {
  it('exige o objeto e todos os ancestrais visíveis', () => {
    const grupo = new THREE.Group();
    const m = new THREE.Object3D();
    grupo.add(m);
    expect(visivel(m)).toBe(true);
    grupo.visible = false;
    expect(visivel(m)).toBe(false);
    grupo.visible = true;
    m.visible = false;
    expect(visivel(m)).toBe(false);
  });
});

const DEITADO = '(max-height: 500px) and (orientation: landscape) and (max-width: 1023px)';
const telas = (...verdadeiras) => vi.fn((q) => ({ matches: verdadeiras.includes(q) }));

describe('ehCelular, ehDeitado e lateralSobreVista', () => {
  it('celular em pé: consulta o mesmo limite de largura do CSS', () => {
    const mm = telas('(max-width: 760px)');
    vi.stubGlobal('matchMedia', mm);
    expect(ehCelular()).toBe(true);
    expect(ehDeitado()).toBe(false);
    expect(lateralSobreVista()).toBe(false);
    expect(mm).toHaveBeenCalledWith('(max-width: 760px)');
    expect(mm).toHaveBeenCalledWith(DEITADO);
  });
  it('deitado vale sobre o celular: a coluna à esquerda, não a folha', () => {
    vi.stubGlobal('matchMedia', telas('(max-width: 760px)', DEITADO));
    expect(ehDeitado()).toBe(true);
    expect(ehCelular()).toBe(false);
    expect(lateralSobreVista()).toBe(false);
  });
  it('só o tablet em pé põe a lateral sobre a vista', () => {
    vi.stubGlobal('matchMedia', telas());
    expect(lateralSobreVista()).toBe(true);
    vi.stubGlobal('matchMedia', telas('(min-width: 1024px)'));
    expect(lateralSobreVista()).toBe(false);
  });
});

describe('focoItinerante', () => {
  it('setas, Home e End andam entre os botões com uma só parada de Tab; outras teclas passam', () => {
    const barra = document.createElement('div');
    const bts = [0, 1, 2].map((i) => { const b = document.createElement('button'); b.tabIndex = i ? -1 : 0; barra.append(b); return b; });
    document.body.append(barra);
    const movido = vi.fn();
    focoItinerante(barra, bts, movido);
    const tecla = (key) => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    bts[0].focus();
    tecla('ArrowLeft');
    expect(document.activeElement).toBe(bts[2]);
    expect(bts.map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
    tecla('Home');
    expect(document.activeElement).toBe(bts[0]);
    tecla('End');
    tecla('ArrowRight');
    expect(document.activeElement).toBe(bts[0]);
    expect(movido).toHaveBeenLastCalledWith(bts[0]);
    tecla('a');
    expect(movido).toHaveBeenCalledTimes(4);
    barra.remove();
  });
});

describe('ehLargo', () => {
  it('consulta o limite do desktop largo do CSS (três colunas)', () => {
    const mm = vi.fn(() => ({ matches: false }));
    vi.stubGlobal('matchMedia', mm);
    expect(ehLargo()).toBe(false);
    expect(mm).toHaveBeenCalledWith('(min-width: 1024px)');
  });
});

describe('limites de largura do JS iguais aos do CSS', () => {
  it('as media queries do style.css usam os mesmos 760 px e 1024 px de util.js', () => {
    const css = fs.readFileSync(path.join(import.meta.dirname, '..', 'src', 'style.css'), 'utf8');
    expect(css).toContain('@media (max-width: 760px)');
    expect(css).toContain('@media (min-width: 761px)');
    expect(css).toContain('@media (min-width: 1024px)');
    expect(css).toContain(`@media ${DEITADO}`);
  });
});
