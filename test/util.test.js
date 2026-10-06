import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { esc, semAcentos, normalizar, visivel, ehCelular, ehLargo } from '../src/util.js';

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

describe('ehCelular', () => {
  it('consulta o mesmo limite de largura do CSS', () => {
    const mm = vi.fn(() => ({ matches: true }));
    vi.stubGlobal('matchMedia', mm);
    expect(ehCelular()).toBe(true);
    expect(mm).toHaveBeenCalledWith('(max-width: 760px)');
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
  });
});
