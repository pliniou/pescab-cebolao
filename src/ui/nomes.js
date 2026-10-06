// Confere um nome digitado pelo aluno com o nome da estrutura (português ou latim).
// Aceita: sem acentos e maiúsculas; sem o lado (direito/esquerdo); sem o termo genérico inicial
// ("músculo", "osso", "nervo", "artéria", "veia", "glândula", "ramo", "ducto", no singular ou plural, e os equivalentes latinos);
// abreviações m., n., a., v., gl.;
// o que está entre parênteses sozinho (FDI do dente "11", vértebra "C3", nervo craniano "VI") ou omitido.
// Erros pequenos de digitação contam como certo, mostrando a grafia correta.

import dados from '../data/estruturas.json';
import { normalizar } from '../util.js';

// singular e plural ("Veias maxilares direitas"), em português e em latim
const LADOS = new Set(['direito', 'direita', 'direitos', 'direitas', 'esquerdo', 'esquerda', 'esquerdos', 'esquerdas',
  'dexter', 'dextra', 'dextri', 'dextrae', 'sinister', 'sinistra', 'sinistri', 'sinistrae']);
const LIGACAO = new Set(['de', 'do', 'da', 'dos', 'das']);
// termo genérico inicial que pode ser omitido, no singular e no plural ("veias maxilares" → "maxilares")
const GENERICOS = new Set([
  'musculo', 'musculos', 'osso', 'ossos', 'nervo', 'nervos', 'arteria', 'arterias', 'veia', 'veias', 'glandula', 'glandulas',
  'ramo', 'ramos', 'ducto', 'ductos', 'ganglio',
  'musculus', 'musculi', 'os', 'ossa', 'nervus', 'nervi', 'arteriae', 'vena', 'venae', 'glandulae', // arteria e glandula: iguais ao português
  'ramus', 'rami', 'ductus', 'ganglion', 'dens',
]);
const ABREV = {
  m: 'musculo', n: 'nervo', a: 'arteria', v: 'veia', gl: 'glandula',
  primeiro: '1', segundo: '2', terceiro: '3', '1o': '1', '2o': '2', '3o': '3',
};

function palavras(s) {
  return normalizar(s)
    .replace(/[º°ª]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim().split(' ')
    .filter(Boolean)
    .map((p) => ABREV[p] || p)
    .filter((p) => !LADOS.has(p) && !LIGACAO.has(p));
}
const juntar = (ps) => ps.join(' ');

// Formas aceitas de um nome oficial
export function formas(nome) {
  const r = new Set();
  const sem = String(nome ?? '').replace(/\(([^)]*)\)/g, ' ');
  const base = palavras(sem);
  if (base.length) {
    r.add(juntar(base));
    if (GENERICOS.has(base[0]) && base.length > 1) r.add(juntar(base.slice(1)));
  }
  for (const [, dentro] of String(nome ?? '').matchAll(/\(([^)]*)\)/g)) {
    const p = palavras(dentro);
    if (!p.length) continue;
    r.add(juntar(p));
    if (base.length) r.add(juntar([...base, ...p]));
  }
  return r;
}

// Todas as formas aceitas de todas as estruturas do atlas
let vocab = null;
function vocabulario() {
  if (!vocab) {
    vocab = new Set();
    for (const e of dados.estruturas) for (const n of [e.pt, e.la]) for (const f of formas(n)) vocab.add(f);
  }
  return vocab;
}

// Distância de edição com troca de duas letras vizinhas valendo 1 ("masetter" → "masseter" é um erro só, não dois)
function distancia(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  let ante = null; // linha i-2
  let ant = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(ant[j] + 1, cur[j - 1] + 1, ant[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], ante[j - 2] + 1);
    }
    ante = ant;
    ant = cur;
  }
  return ant[b.length];
}

// → { ok, exato, esperado }
export function conferirNome(resposta, info) {
  const esperado = info?.pt || '';
  const r = juntar(palavras(resposta));
  if (!r) return { ok: false, exato: false, esperado };
  const aceitas = new Set([...formas(info?.pt), ...formas(info?.la)]);
  if (aceitas.has(r)) return { ok: true, exato: true, esperado };
  // Tolerância palavra a palavra: só em palavras de 6+ letras, 1 letra por palavra, no máximo 2 no total.
  // Números e algarismos romanos têm de ser exatos (III × IV, 11 × 12); "interna" × "externa" (2 letras) não passa.
  // Se o que foi digitado é exatamente o nome de OUTRA estrutura (mandíbula × n. mandibular), não é erro de digitação.
  if (vocabulario().has(r)) return { ok: false, exato: false, esperado };
  const rp = r.split(' ');
  for (const a of aceitas) {
    const ap = a.split(' ');
    if (ap.length !== rp.length) continue;
    let erros = 0;
    const ok = ap.every((w, i) => {
      if (w === rp[i]) return true;
      if (w.length < 6 || /\d/.test(w) || /^[ivxl]+$/.test(w)) return false;
      if (distancia(w, rp[i]) !== 1) return false;
      return ++erros <= 2;
    });
    if (ok) return { ok: true, exato: false, esperado };
  }
  return { ok: false, exato: false, esperado };
}
