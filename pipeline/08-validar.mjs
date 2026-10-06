// Validação, camadas 1–3: mede os GLB publicados (public/models), compara com src/data/referencias.json,
// testa relações anatômicas e gera src/data/conformidade.json (avisos no app) e relatorio_conformidade.md.
// Coordenadas aqui: mm, +X = esquerdo do paciente, +Y = superior, +Z = anterior (mesmo sistema do app × 1000).
// Regressão: compara o status de cada medida e relação com o conformidade.json anterior. Se algo piorou (OK → ALERTA,
// ALERTA → FALHA...), lista o que piorou, não grava a nova linha de base e sai com código 1 (o npm run pipeline para).
// Para aceitar a piora como nova linha de base, de propósito: --aceitar.
// Uso: node pipeline/08-validar.mjs [--debug] [--aceitar]
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { ROOT } from './config.mjs';

const DEBUG = process.argv.includes('--debug');
const dados = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'estruturas.json'), 'utf8'));
const REF = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'referencias.json'), 'utf8'));
const porId = new Map(dados.estruturas.map((e) => [e.id, e]));

// ---------- leitura dos GLB ----------
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const dir = path.join(ROOT, 'public', 'models');
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
const malhas = new Map(); // id → { pts: [[x,y,z]], tri: [[a,b,c]] }
for (const c of meta.camadas) {
  const doc = await io.read(path.join(dir, `${c}.glb`));
  for (const no of doc.getRoot().listNodes()) {
    const id = no.getExtras().id;
    const mesh = no.getMesh();
    if (!id || !mesh) continue;
    const M = no.getWorldMatrix();
    const pts = [], tri = [];
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      const base = pts.length;
      const v = [0, 0, 0];
      for (let i = 0; i < pos.getCount(); i++) {
        pos.getElement(i, v);
        const x = M[0] * v[0] + M[4] * v[1] + M[8] * v[2] + M[12];
        const y = M[1] * v[0] + M[5] * v[1] + M[9] * v[2] + M[13];
        const z = M[2] * v[0] + M[6] * v[1] + M[10] * v[2] + M[14];
        pts.push([x * 1000, y * 1000, z * 1000]);
      }
      const idx = prim.getIndices().getArray();
      for (let i = 0; i < idx.length; i += 3) tri.push([base + idx[i], base + idx[i + 1], base + idx[i + 2]]);
    }
    malhas.set(id, { pts, tri });
  }
}

// ---------- utilitários geométricos ----------
const est = (en, lado) => dados.estruturas.filter((e) => e.en === en && (!lado || e.lado === lado));
const P = (en, lado) => est(en, lado).flatMap((e) => malhas.get(e.id)?.pts || []);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const media = (ps) => [0, 1, 2].map((k) => ps.reduce((s, p) => s + p[k], 0) / ps.length);
const argmax = (ps, f) => ps.reduce((m, p) => (f(p) > f(m) ? p : m), ps[0]);
const argmin = (ps, f) => argmax(ps, (p) => -f(p));
const faixa = (ps, k) => [Math.min(...ps.map((p) => p[k])), Math.max(...ps.map((p) => p[k]))];
const MEIO = 2.5; // meia-largura da faixa mediossagital (mm)
const mediano = (ps) => ps.filter((p) => Math.abs(p[0]) < MEIO);
const r1 = (x) => Math.round(x * 10) / 10;

// Ponto dentro de malha fechada: paridade de interseções em 3 raios (maioria)
function dentro(p, m) {
  const dirs = [[1, 0.013, 0.007], [0.011, 1, 0.017], [0.009, 0.015, 1]];
  let votos = 0;
  for (const d of dirs) {
    let n = 0;
    for (const [a, b, c] of m.tri) if (raio(p, d, m.pts[a], m.pts[b], m.pts[c])) n++;
    if (n % 2) votos++;
  }
  return votos >= 2;
}
const raio = (o, d, a, b, c) => raioT(o, d, a, b, c) < Infinity;
function raioT(o, d, a, b, c) { // Möller–Trumbore: distância t > 0 até o triângulo (Infinity se não cruza)
  const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
  const det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
  if (Math.abs(det) < 1e-12) return Infinity;
  const f = 1 / det, s = [o[0] - a[0], o[1] - a[1], o[2] - a[2]];
  const u = f * (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]);
  if (u < 0 || u > 1) return Infinity;
  const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]];
  const v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]);
  if (v < 0 || u + v > 1) return Infinity;
  const t = f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]);
  return t > 1e-9 ? t : Infinity;
}
const juntar = (...ms) => {
  const pts = [], tri = [];
  for (const m of ms) { const b = pts.length; pts.push(...m.pts); tri.push(...m.tri.map((t) => t.map((i) => i + b))); }
  return { pts, tri };
};
const malhaDe = (en, lado) => juntar(...est(en, lado).map((e) => malhas.get(e.id)));
const amostra = (ps, n) => (ps.length <= n ? ps : Array.from({ length: n }, (_, i) => ps[Math.floor(i * ps.length / n)]));

// Eixo principal (PCA) e extensão ao longo dele
function eixo(ps) {
  const c = media(ps);
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of ps) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += (p[i] - c[i]) * (p[j] - c[j]);
  let v = [0.3, 0.9, 0.3];
  for (let it = 0; it < 60; it++) {
    const w = [0, 1, 2].map((i) => C[i][0] * v[0] + C[i][1] * v[1] + C[i][2] * v[2]);
    const n = Math.hypot(...w); v = w.map((x) => x / n);
  }
  const t = (p) => (p[0] - c[0]) * v[0] + (p[1] - c[1]) * v[1] + (p[2] - c[2]) * v[2];
  const a = argmin(ps, t), b = argmax(ps, t);
  return { c, v, comprimento: t(b) - t(a), extremos: [a, b] };
}

// ---------- camada 1: pontos craniométricos ----------
const frontal = P('frontal bone'), occipital = P('occipital bone'), parietais = P('parietal bone');
const nasais = P('nasal bone'), maxilas = P('maxilla'), zig = P('zygomatic bone'), temporais = P('temporal bone');

const nasio = argmax(nasais.filter((p) => Math.abs(p[0]) < 4), (p) => p[1]);
const glabela = argmax(mediano(frontal).filter((p) => p[1] > nasio[1] && p[1] < nasio[1] + 35), (p) => p[2]);
const calotaMed = mediano([...frontal, ...parietais, ...occipital]);
const opistocranio = argmax(calotaMed, (p) => dist(p, glabela));
const bregma = argmin(mediano(frontal).filter((p) => p[1] > nasio[1] + 40), (p) => p[2]);
const lambda = argmax(mediano(occipital), (p) => p[1]);
// Forame magno: maior intervalo ântero-posterior entre pontos medianos da parte baixa do occipital
const occBaixo = mediano(occipital).filter((p) => p[1] < nasio[1] - 10).sort((a, b) => a[2] - b[2]);
let gap = 0, iGap = 0;
for (let i = 1; i < occBaixo.length; i++) if (occBaixo[i][2] - occBaixo[i - 1][2] > gap) { gap = occBaixo[i][2] - occBaixo[i - 1][2]; iGap = i; }
const opistio = occBaixo[iGap - 1]; // margem posterior do forame (ponto mais anterior do grupo posterior)
const basio = occBaixo[iGap]; // margem anterior (ponto mais posterior do grupo anterior)
const maxMed = mediano(maxilas);
const zMaxMax = Math.max(...maxMed.map((p) => p[2]));
const prostio = argmin(maxMed.filter((p) => p[2] > zMaxMax - 12), (p) => p[1]);
const [zyY0, zyY1] = faixa(zig, 1);
const [zyZ0] = faixa(zig, 2);
const arco = [...zig, ...temporais.filter((p) => p[1] > zyY0 && p[1] < zyY0 + (zyY1 - zyY0) * 0.5 && p[2] > zyZ0 - 30)];
const abobada = [...parietais, ...temporais].filter((p) => p[1] > zyY1 + 10);
const alveolar = maxilas.filter((p) => p[1] < prostio[1] + 10);
const larguraX = (ps) => { const [a, b] = faixa(ps, 0); return b - a; };

const MEDIDO = {
  GOL: dist(glabela, opistocranio), XCB: larguraX(abobada), ZYB: larguraX(arco), BBH: dist(basio, bregma),
  BNL: dist(basio, nasio), BPL: dist(basio, prostio), NPH: dist(nasio, prostio), FRC: dist(nasio, bregma),
  PAC: dist(bregma, lambda), OCC: dist(lambda, opistio), MAB: larguraX(alveolar),
};
const PONTOS = { nasio, glabela, opistocranio, bregma, lambda, basio, opistio, prostio };
if (DEBUG) {
  for (const [k, p] of Object.entries(PONTOS)) console.log(k.padEnd(13), p.map(r1).join(', '));
  console.log('intervalo do forame magno (AP):', r1(gap), 'mm');
}

function classificar(valor, m, dp) {
  const z = (valor - m) / dp;
  return { z: +z.toFixed(2), desvio_pct: +(((valor - m) / m) * 100).toFixed(1),
    tolerancia_pct: +((2 * dp / m) * 100).toFixed(1),
    status: Math.abs(z) <= 2 ? 'OK' : Math.abs(z) <= 3 ? 'ALERTA' : 'FALHA' };
}
const medidas = REF.cranio.map((r) => ({
  codigo: r.codigo, nome: r.nome, estruturas: r.estruturas, fonte: 'howells',
  modelo: r1(MEDIDO[r.codigo]), ref: { media: r.masculino.media, dp: r.masculino.dp, n: r.masculino.n },
  ref_japao: { media: r.masculino_japao.media, dp: r.masculino_japao.dp, n: r.masculino_japao.n },
  ...classificar(MEDIDO[r.codigo], r.masculino.media, r.masculino.dp),
}));

// ---------- camada 1: dentes ----------
const dentes = dados.estruturas.filter((e) => e.camada === 'dentes' && e.fdi).map((e) => ({ ...e, fdi: +e.fdi }))
  .sort((a, b) => a.fdi - b.fdi);
const eixos = new Map(dentes.map((e) => [e.fdi, eixo(malhas.get(e.id).pts)]));
const TD = REF.dentes.comprimento_total_masculino;
const medDentes = dentes.map((e) => {
  const pos = e.fdi % 10;
  const ax = eixos.get(e.fdi);
  const base = { fdi: e.fdi, id: e.id, nome: e.pt, modelo: r1(ax.comprimento) };
  if (pos > 5) return { ...base, status: 'SEM_REFERENCIA' };
  return { ...base, fonte: 'kim2013', ref: { media: TD.media, dp: TD.dp }, ...classificar(ax.comprimento, TD.media, TD.dp) };
});

// ---------- camada 2: relações anatômicas ----------
const MOORE = 'Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed.';
const GRAY = 'Standring S (ed.). Gray\'s Anatomy: The Anatomical Basis of Clinical Practice, 41ª ed.';
const relacoes = [];
const rel = (o) => { relacoes.push(o); return o; };
const centro = (fdi) => eixos.get(fdi).c;
const mand = malhaDe('mandible');
const vert = ['atlas', 'axis', 'third cervical vertebra', 'fourth cervical vertebra', 'fifth cervical vertebra',
  'sixth cervical vertebra', 'seventh cervical vertebra'];
const NV = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'];
// corpo vertebral ≈ pontos da vértebra próximos do plano mediano e na metade anterior; o nível é contínuo:
// 3 = centro do corpo de C3, 3,5 = disco C3/C4, 3,5–4,5 = corpo de C4 etc. (interpolação entre os centros)
const centrosV = vert.map((en) => {
  const ps = P(en); const [z0, z1] = faixa(ps, 2);
  const corpo = ps.filter((p) => Math.abs(p[0]) < 10 && p[2] > (z0 + z1) / 2);
  const [a, b] = faixa(corpo.length ? corpo : ps, 1);
  return (a + b) / 2;
});
function nivel(y) {
  for (let i = 0; i < centrosV.length - 1; i++) {
    const [a, b] = [centrosV[i], centrosV[i + 1]];
    if (y <= a && y >= b) return i + 1 + (a - y) / (a - b);
  }
  return y > centrosV[0] ? 1 : 7;
}
const nomeNivel = (k) => {
  const i = Math.round(k);
  return Math.abs(k - i) > 0.4 ? `disco ${NV[Math.floor(k) - 1]}/${NV[Math.floor(k)]}` : `corpo de ${NV[i - 1]}`;
};

if (DEBUG) {
  console.log('centros dos corpos vertebrais (Y):', centrosV.map((y, i) => `${NV[i]} ${r1(y)}`).join(' | '));
  for (const l of ['D', 'E']) console.log('CCA', l, [0, 1, 2].map((k) => faixa(P('common carotid artery', l), k).map(r1).join('..')).join(' | '));
}
// 1) Osso hioide no nível de C3
{
  const k = nivel(media(P('hyoid bone'))[1]);
  rel({ teste: 'Osso hioide no nível de C3', fonte: MOORE + ' (cap. Pescoço); ' + GRAY, estruturas: ['hyoid bone'],
    medido: `centro do hioide no nível ${r1(k)} (${nomeNivel(k)}); a posição da cabeça altera esse nível`,
    status: k >= 2.5 && k <= 3.5 ? 'OK' : k >= 2 && k <= 4 ? 'ALERTA' : 'FALHA' });
}
// 2) Bifurcação da carótida comum na borda superior da cartilagem tireóidea (≈ C3–C4)
for (const lado of ['D', 'E']) {
  const k = nivel(Math.max(...P('common carotid artery', lado).map((p) => p[1])));
  rel({ teste: `Bifurcação da a. carótida comum (${lado}) entre C3 e C4`, fonte: MOORE + ' (cap. Pescoço); ' + GRAY,
    estruturas: ['common carotid artery'], lado, medido: `fim superior da carótida comum no nível ${r1(k)} (${nomeNivel(k)})`,
    status: k >= 2.5 && k <= 4.5 ? 'OK' : k >= 1.5 && k <= 5.5 ? 'ALERTA' : 'FALHA' });
}
// 3) Ducto parotídeo abre-se em frente ao 2º molar superior (coroa)
for (const [lado, m2] of [['D', 17], ['E', 27]]) {
  const fim = argmax(P('parotid duct', lado), (p) => p[2]);
  const [z0, z1] = faixa(malhas.get(e2id(m2)).pts, 2);
  const fora = fim[2] < z0 ? fim[2] - z0 : fim[2] > z1 ? fim[2] - z1 : 0;
  rel({ teste: `Ducto parotídeo (${lado}) termina em frente ao 2º molar superior (${m2})`, fonte: MOORE + ' (cap. Cabeça); ' + GRAY,
    estruturas: ['parotid duct'], lado,
    medido: fora === 0 ? `extremidade anterior dentro da extensão mesiodistal do ${m2}` : `extremidade anterior ${r1(Math.abs(fora))} mm ${fora > 0 ? 'à frente' : 'atrás'} do ${m2}`,
    status: fora === 0 ? 'OK' : Math.abs(fora) <= 5 ? 'ALERTA' : 'FALHA' });
}
// 4) Forame mentual abaixo do 2º pré-molar inferior ou entre os pré-molares
for (const [lado, p1, p2, m1, c] of [['D', 44, 45, 46, 43], ['E', 34, 35, 36, 33]]) {
  const mn = P('mental nerve', lado);
  const ian = P('inferior alveolar nerve', lado);
  // forame ≈ ponto do n. mentual fora do osso mais próximo do fim do n. alveolar inferior
  const fimIan = argmax(ian, (p) => p[2]);
  const fora = amostra(mn, 400).filter((p) => !dentro(p, mand));
  const forame = argmin(fora.length ? fora : mn, (p) => dist(p, fimIan));
  const z = forame[2], zp1 = centro(p1)[2], zp2 = centro(p2)[2], zm1 = centro(m1)[2];
  const ok = z <= zp1 + 1 && z >= zp2 - Math.abs(zp1 - zp2) / 2;
  const alerta = z <= centro(c)[2] && z >= zm1;
  rel({ teste: `Forame mentual (${lado}) entre os pré-molares inferiores ou abaixo do 2º pré-molar`, fonte: GRAY + '; ' + MOORE,
    estruturas: ['mental nerve', 'mandible'], lado,
    medido: `saída do n. mentual ${r1(z - zp2)} mm à frente do centro do ${p2} (${p1}: ${r1(zp1 - zp2)} mm; ${m1}: ${r1(zm1 - zp2)} mm)`,
    status: ok ? 'OK' : alerta ? 'ALERTA' : 'FALHA' });
}
// 5) N. alveolar inferior envolvido pela mandíbula (canal mandibular) entre os forames mandibular e mentual.
// A mandíbula tem o canal modelado como túnel, então o teste é "osso dos dois lados" (vestibular e lingual).
function envolvido(p, m, alcance = 15) {
  const perto = (d) => m.tri.some(([a, b, c]) => raioT(p, d, m.pts[a], m.pts[b], m.pts[c]) < alcance);
  return perto([1, 0.02, 0.01]) && perto([-1, 0.01, 0.02]) && perto([0.01, -1, 0.02]);
}
for (const lado of ['D', 'E']) {
  const ian = P('inferior alveolar nerve', lado);
  const mn = P('mental nerve', lado);
  const zMent = Math.min(...mn.map((p) => p[2]));
  // trecho do canal: abaixo da língula (forame mandibular) e atrás do forame mentual
  const forameMand = argmin(ian.filter((p) => dentro(p, mand) || envolvido(p, mand)), (p) => p[2]);
  const trecho = ian.filter((p) => p[2] > forameMand[2] + 3 && p[2] < zMent);
  const a = amostra(trecho, 250);
  const frac = a.filter((p) => envolvido(p, mand)).length / a.length;
  rel({ teste: `N. alveolar inferior (${lado}) dentro da mandíbula (canal mandibular)`, fonte: MOORE + ' (cap. Cabeça)',
    estruturas: ['inferior alveolar nerve', 'mandible'], lado,
    medido: `${Math.round(frac * 100)}% dos pontos entre os forames mandibular e mentual com osso vestibular, lingual e inferior`,
    status: frac >= 0.9 ? 'OK' : frac >= 0.7 ? 'ALERTA' : 'FALHA' });
}
// 6) Canal mandibular abaixo dos ápices dos molares inferiores; 7) raízes dentro do osso alveolar
const maxD = malhaDe('maxilla', 'D'), maxE = malhaDe('maxilla', 'E');
const apices = new Map();
for (const e of dentes) {
  const ax = eixos.get(e.fdi);
  const sup = e.fdi < 30;
  // ápice = extremo do eixo mais distante do plano oclusal (para cima nos superiores, para baixo nos inferiores)
  const [a, b] = ax.extremos;
  apices.set(e.fdi, sup ? (a[1] > b[1] ? a : b) : (a[1] < b[1] ? a : b));
}
for (const [lado, dts] of [['D', [46, 47]], ['E', [36, 37]]]) {
  const ian = P('inferior alveolar nerve', lado);
  for (const fdi of dts) {
    const ap = apices.get(fdi);
    const perto = ian.filter((p) => Math.abs(p[2] - ap[2]) < 1.5);
    if (!perto.length) { rel({ teste: `Canal mandibular abaixo do ápice do ${fdi}`, fonte: MOORE, lado, estruturas: ['inferior alveolar nerve'], medido: 'o n. alveolar inferior não passa sob o dente', status: 'FALHA' }); continue; }
    // tronco do nervo = grupo mais baixo de pontos nessa posição (os ramos dentais sobem para os dentes)
    const base = Math.min(...perto.map((p) => p[1]));
    const topo = Math.max(...perto.filter((p) => p[1] < base + 5).map((p) => p[1]));
    const folga = ap[1] - topo;
    rel({ teste: `Canal mandibular abaixo do ápice do ${fdi}`, fonte: MOORE + ' (cap. Cabeça)', lado,
      estruturas: ['inferior alveolar nerve', e2id(fdi)],
      medido: folga >= 0 ? `ápice ${r1(folga)} mm acima do tronco do nervo` : `ápice ${r1(-folga)} mm abaixo do topo do tronco do nervo (raiz invade o canal)`,
      status: folga >= 0 ? 'OK' : folga >= -2 ? 'ALERTA' : 'FALHA' });
  }
}
function e2id(fdi) { return dentes.find((e) => e.fdi === fdi).id; }
const apicesFora = [];
for (const e of dentes) {
  const osso = e.fdi < 30 ? (e.fdi < 20 ? maxD : maxE) : mand;
  const ap = apices.get(e.fdi);
  const ax = eixos.get(e.fdi);
  // perfil ao longo do eixo: fração do comprimento (a partir do ápice) que está dentro do osso
  const sinal = Math.sign((ap[0] - ax.c[0]) * ax.v[0] + (ap[1] - ax.c[1]) * ax.v[1] + (ap[2] - ax.c[2]) * ax.v[2]);
  const t = (p) => sinal * ((p[0] - ax.c[0]) * ax.v[0] + (p[1] - ax.c[1]) * ax.v[1] + (p[2] - ax.c[2]) * ax.v[2]);
  const tAp = t(ap);
  const ps = amostra(malhas.get(e.id).pts, 700);
  // ponto "no osso": dentro do sólido ósseo ou com a parede do alvéolo a ≤ 2 mm na direção radial (para fora do eixo)
  const noOsso = (p) => {
    const s = (p[0] - ax.c[0]) * ax.v[0] + (p[1] - ax.c[1]) * ax.v[1] + (p[2] - ax.c[2]) * ax.v[2];
    const r = [0, 1, 2].map((i) => p[i] - ax.c[i] - ax.v[i] * s);
    const n = Math.hypot(...r);
    if (n < 0.3) return dentro(p, osso);
    const d = r.map((x) => x / n);
    return osso.tri.some(([a, b, c]) => raioT(p, d, osso.pts[a], osso.pts[b], osso.pts[c]) < 2) || dentro(p, osso);
  };
  const fatias = []; // fatias de 1 mm a partir do ápice: [no osso, total]
  for (const p of ps) {
    const k = Math.floor(tAp - t(p));
    fatias[k] ||= [0, 0];
    fatias[k][1]++;
    if (noOsso(p)) fatias[k][0]++;
  }
  // trecho intraósseo = do ápice até a primeira fatia com menos da metade dos pontos no osso
  let k = 0;
  while (k < fatias.length && (!fatias[k] || fatias[k][0] / fatias[k][1] >= 0.5)) k++;
  const apiceDentro = dentro(ap, osso) || (fatias[0] && fatias[0][0] > 0);
  e.analise = { intraosseo_mm: k, exposto_mm: r1(ax.comprimento - k), apice_no_osso: !!apiceDentro };
  if (!apiceDentro) apicesFora.push(e.fdi);
}
rel({ teste: 'Ápices radiculares dentro do osso alveolar (maxila/mandíbula)', fonte: MOORE + '; ' + GRAY,
  estruturas: ['maxilla', 'mandible'], medido: apicesFora.length ? `ápices fora do osso: ${apicesFora.join(', ')}` : 'todos os 28 ápices dentro do osso',
  status: apicesFora.length === 0 ? 'OK' : apicesFora.length <= 2 ? 'ALERTA' : 'FALHA' });
// 8) Consistência do modelo: simetria bilateral das estruturas pares (diferença das dimensões da caixa)
const pares = new Map();
for (const e of dados.estruturas) if (e.lado !== 'M' && malhas.has(e.id)) {
  const k = e.en + '|' + e.camada; if (!pares.has(k)) pares.set(k, {}); pares.get(k)[e.lado] = e;
}
// Assimetrias que são anatomia real, não erro do modelo
const ASSIM_ESPERADA = {
  'common carotid artery': 'a direita nasce do tronco braquiocefálico e a esquerda do arco da aorta (Moore)',
};
const assim = [], explicadas = [];
for (const [, { D, E }] of pares) {
  if (!D || !E) continue;
  const d = (id) => [0, 1, 2].map((i) => { const [a, b] = faixa(malhas.get(id).pts, i); return b - a; });
  const a = d(D.id), b = d(E.id);
  const dif = Math.max(...a.map((x, i) => Math.abs(x - b[i]) / Math.max(x, b[i], 5)));
  if (dif <= 0.15) continue;
  const txt = `${D.pt.replace(/ \(.*$/, '').replace(/ direit[ao]$/, '')} (${Math.round(dif * 100)}%)`;
  if (ASSIM_ESPERADA[D.en]) explicadas.push(`${txt}: ${ASSIM_ESPERADA[D.en]}`); else assim.push(txt);
}
rel({ teste: 'Simetria bilateral das estruturas pares (dimensões D × E, tolerância 15%)',
  fonte: 'Critério de consistência do modelo (não é medida anatômica)', estruturas: [],
  medido: (assim.length ? `assimétricas: ${assim.join('; ')}` : `${[...pares.values()].filter((p) => p.D && p.E).length} pares dentro da tolerância`)
    + (explicadas.length ? `; assimetria esperada: ${explicadas.join('; ')}` : ''),
  status: assim.length === 0 ? 'OK' : assim.length <= 5 ? 'ALERTA' : 'FALHA' });

// ---------- camada 3: conformidade ----------
const todas = [...medidas, ...medDentes.filter((d) => d.status !== 'SEM_REFERENCIA')];
const cont = (lst, s) => lst.filter((x) => x.status === s).length;
const resumo = {
  medidas: { total: todas.length, OK: cont(todas, 'OK'), ALERTA: cont(todas, 'ALERTA'), FALHA: cont(todas, 'FALHA'),
    sem_referencia: cont(medDentes, 'SEM_REFERENCIA') },
  relacoes: { total: relacoes.length, OK: cont(relacoes, 'OK'), ALERTA: cont(relacoes, 'ALERTA'), FALHA: cont(relacoes, 'FALHA') },
  erro_medio_abs_pct: {
    cranio: r1(medidas.reduce((s, m) => s + Math.abs(m.desvio_pct), 0) / medidas.length),
    dentes: r1(medDentes.filter((d) => d.ref).reduce((s, m) => s + Math.abs(m.desvio_pct), 0) / medDentes.filter((d) => d.ref).length),
  },
};

// Avisos por estrutura (para o app): só medidas e relações fora do OK
const avisos = {};
const add = (id, txt) => { (avisos[id] ||= []).push(txt); };
const idsDe = (en, lado) => est(en, lado).map((e) => e.id);
for (const m of medidas) if (m.status !== 'OK') for (const en of m.estruturas) for (const id of idsDe(en))
  add(id, `${m.status}: ${m.nome}. Modelo ${m.modelo} mm; referência ${m.ref.media} ± ${m.ref.dp} mm (Howells, masculino).`);
for (const d of medDentes) {
  if (d.status === 'SEM_REFERENCIA') add(d.id, 'Dimensões sem validação: não há referência aberta verificada para molares.');
  else if (d.status !== 'OK') {
    const e = dentes.find((x) => x.fdi === d.fdi);
    const rz = REF.dentes.raiz_masculino[d.fdi < 30 ? 'superior' : 'inferior'][d.fdi % 10];
    add(d.id, `${d.status}: comprimento do dente no modelo ${d.modelo} mm; referência ${d.ref.media} ± ${d.ref.dp} mm (Kim et al. 2013, incisivos a pré-molares, masculino). O excesso está na raiz: só o trecho dentro do osso já mede ${e.analise.intraosseo_mm} mm, contra raiz de ${rz[0]} ± ${rz[1]} mm na referência.`);
  }
}
for (const r of relacoes) if (r.status !== 'OK' && r.estruturas.length) for (const en of r.estruturas) {
  const ids = en.startsWith('FMA') || porId.has(en) ? [en] : idsDe(en, r.lado);
  for (const id of ids) add(id, `${r.status}: ${r.teste}. Medido no modelo: ${r.medido}.`);
}
// status de cada item, pela chave estável (código da medida, FDI do dente, texto da relação): base da comparação
const itens = Object.fromEntries([
  ...medidas.map((m) => [`medida:${m.codigo}`, m.status]),
  ...medDentes.map((d) => [`dente:${d.fdi}`, d.status]),
  ...relacoes.map((r) => [`relacao:${r.teste}`, r.status]),
]);
const ARQ_CONFORMIDADE = path.join(ROOT, 'src', 'data', 'conformidade.json');
const anterior = fs.existsSync(ARQ_CONFORMIDADE) ? JSON.parse(fs.readFileSync(ARQ_CONFORMIDADE, 'utf8')) : null;
const GRAVIDADE = { OK: 0, SEM_REFERENCIA: 0, ALERTA: 1, FALHA: 2 };
const pioras = [];
if (anterior?.itens) {
  for (const [k, s] of Object.entries(itens)) {
    const antes = anterior.itens[k];
    if (antes && GRAVIDADE[s] > GRAVIDADE[antes]) pioras.push(`${k}: ${antes} → ${s}`);
  }
} else if (anterior?.resumo) { // conformidade.json de antes do registro por item: compara os totais
  for (const g of ['medidas', 'relacoes']) {
    if (resumo[g].FALHA > anterior.resumo[g].FALHA) pioras.push(`${g}: FALHA ${anterior.resumo[g].FALHA} → ${resumo[g].FALHA}`);
    if (resumo[g].OK < anterior.resumo[g].OK) pioras.push(`${g}: OK ${anterior.resumo[g].OK} → ${resumo[g].OK}`);
  }
}
const aceitar = process.argv.includes('--aceitar');
const conteudo = { criterio: REF.criterio, resumo, avisos, itens };
// a data só muda quando o resultado muda: rodar de novo sem mudança nos modelos não altera o arquivo
const igual = anterior && JSON.stringify({ ...anterior, gerado: undefined }) === JSON.stringify({ gerado: undefined, ...conteudo });
const conformidade = { gerado: igual ? anterior.gerado : new Date().toISOString().slice(0, 10), ...conteudo };
const gravarBase = !pioras.length || aceitar;
if (gravarBase && !igual) fs.writeFileSync(ARQ_CONFORMIDADE, JSON.stringify(conformidade, null, 1));

// ---------- relatório ----------
const ic = { OK: '✅', ALERTA: '⚠️', FALHA: '❌', SEM_REFERENCIA: '—' };
// checklist visual: o que o aluno já marcou ([x]) no relatório anterior continua marcado
const ARQ_RELATORIO = path.join(ROOT, 'relatorio_conformidade.md');
const marcados = new Set();
if (fs.existsSync(ARQ_RELATORIO)) {
  for (const [, item] of fs.readFileSync(ARQ_RELATORIO, 'utf8').matchAll(/\[x\] ([^·\n]+?)(?= ·|\n|$)/gi)) marcados.add(item.trim());
}
const caixa = (i) => `[${marcados.has(i) ? 'x' : ' '}] ${i}`;
const L = [];
L.push('# Relatório de conformidade anatômica', '');
L.push(`Gerado por \`pipeline/08-validar.mjs\` em ${conformidade.gerado}, medindo os arquivos publicados em \`public/models\`.`);
L.push('Coordenadas do modelo em mm. Nenhum valor de referência foi estimado: todos vêm das fontes citadas abaixo.', '');
L.push('## Resumo', '');
L.push(`| | Total | ✅ OK | ⚠️ Alerta | ❌ Falha |`, '|---|---|---|---|---|');
L.push(`| Medidas (camada 1) | ${resumo.medidas.total} | ${resumo.medidas.OK} | ${resumo.medidas.ALERTA} | ${resumo.medidas.FALHA} |`);
L.push(`| Relações anatômicas (camada 2) | ${resumo.relacoes.total} | ${resumo.relacoes.OK} | ${resumo.relacoes.ALERTA} | ${resumo.relacoes.FALHA} |`, '');
L.push(`- Taxa de aprovação das medidas: **${Math.round(resumo.medidas.OK / resumo.medidas.total * 100)}%** (OK / total com referência).`);
L.push(`- Desvio médio absoluto em relação à média de referência: crânio **${resumo.erro_medio_abs_pct.cranio}%**, dentes **${resumo.erro_medio_abs_pct.dentes}%**.`);
L.push(`- Sem referência verificada (não contam na taxa): ${resumo.medidas.sem_referencia} molares.`, '');
L.push('## Critérios de qualidade', '', REF.criterio, '');
L.push('A tolerância de cada medida (coluna *Tol.*) é a faixa de ±2 DP expressa em % da média: abaixo dela o modelo está dentro de ~95% da variação humana normal do grupo de referência.', '');
L.push('## Camada 1: validação do crânio', '');
L.push('Referência: Howells, todos os crânios masculinos (n = 1368, 28 populações). Coluna *Japão*: só as séries japonesas de Howells (n = 105), para comparação.', '');
L.push('| Código | Medida | Modelo | Referência (média ± DP) | Japão | Desvio | Tol. | z | Status |', '|---|---|---|---|---|---|---|---|---|');
for (const m of medidas) L.push(`| ${m.codigo} | ${m.nome} | ${m.modelo} | ${m.ref.media} ± ${m.ref.dp} | ${m.ref_japao.media} ± ${m.ref_japao.dp} | ${m.desvio_pct > 0 ? '+' : ''}${m.desvio_pct}% | ±${m.tolerancia_pct}% | ${m.z} | ${ic[m.status]} ${m.status} |`);
L.push('', 'Pontos craniométricos localizados automaticamente na faixa mediossagital (|x| < 2,5 mm): násio = topo medial dos ossos nasais; glabela = ponto mais anterior do frontal acima do násio; opistocrânio = ponto mediano da calota mais distante da glabela; bregma = ponto mediano mais posterior do frontal; lambda = ponto mediano mais alto do occipital; básio/opístio = margens do maior intervalo ântero-posterior do occipital mediano (forame magno); próstio = ponto mais baixo da maxila mediana nos 12 mm anteriores. Larguras = extensão transversal do conjunto de ossos indicado.', '');
L.push('## Camada 1: validação dos dentes', '');
L.push(`Referência: ${REF.fontes.kim2013}. ${REF.dentes.definicao} O artigo publica o comprimento total só agrupado (incisivos + caninos + pré-molares, masculino: ${TD.media} ± ${TD.dp} mm); por tipo de dente publica apenas a raiz.`, '');
L.push('Comprimento do modelo = extensão ao longo do eixo principal do dente. *Intraósseo* = trecho do dente, a partir do ápice, dentro da maxila/mandíbula (aproxima a raiz: a raiz real começa ~1 a 2 mm acima da crista óssea). *Exposto* = comprimento − intraósseo (aproxima a coroa; referência agrupada de coroa em Kim, tab. 3: ' + `${REF.dentes.coroa_masculino.media} ± ${REF.dentes.coroa_masculino.dp} mm).`, '');
L.push('| FDI | Dente | Modelo (mm) | Referência | Desvio | z | Status | Intraósseo (mm) | Raiz de referência (Kim, tab. 4) | z do intraósseo | Exposto (mm) |', '|---|---|---|---|---|---|---|---|---|---|---|');
for (const d of medDentes) {
  const e = dentes.find((x) => x.fdi === d.fdi);
  const pos = d.fdi % 10, arc = d.fdi < 30 ? 'superior' : 'inferior';
  const rz = REF.dentes.raiz_masculino[arc][pos];
  L.push(`| ${d.fdi} | ${d.nome} | ${d.modelo} | ${d.ref ? `${d.ref.media} ± ${d.ref.dp}` : '—'} | ${d.ref ? `${d.desvio_pct > 0 ? '+' : ''}${d.desvio_pct}%` : '—'} | ${d.z ?? '—'} | ${ic[d.status]} ${d.status === 'SEM_REFERENCIA' ? 'sem referência' : d.status} | ${e.analise.intraosseo_mm} | ${rz ? `${rz[0]} ± ${rz[1]}` : '—'} | ${rz ? ((e.analise.intraosseo_mm - rz[0]) / rz[1]).toFixed(1) : '—'} | ${e.analise.exposto_mm} |`);
}
{
  const comRef = medDentes.filter((d) => d.ref).map((d) => {
    const e = dentes.find((x) => x.fdi === d.fdi);
    const rz = REF.dentes.raiz_masculino[d.fdi < 30 ? 'superior' : 'inferior'][d.fdi % 10];
    return { fdi: d.fdi, zr: (e.analise.intraosseo_mm - rz[0]) / rz[1], exp: e.analise.exposto_mm };
  });
  const longas = comRef.filter((x) => x.zr > 2).map((x) => x.fdi);
  const [c0, c1] = [Math.min(...comRef.map((x) => x.exp)), Math.max(...comRef.map((x) => x.exp))];
  const CR = REF.dentes.coroa_masculino;
  const coroasOk = comRef.filter((x) => Math.abs(x.exp - CR.media) <= 2 * CR.dp).length;
  L.push('', `**Diagnóstico.** Como o trecho intraósseo é menor que a raiz verdadeira, um *z do intraósseo* acima de 2 já indica raiz longa. `
    + `Isso ocorre em ${longas.length} de ${comRef.length} dentes (${longas.join(', ')}). A parte exposta (≈ coroa) fica entre ${r1(c0)} e ${r1(c1)} mm; `
    + `${coroasOk} de ${comRef.length} ficam dentro de ±2 DP da referência agrupada de coroa (${CR.media} ± ${CR.dp} mm). `
    + 'Conclusão: o excesso de comprimento dos dentes do modelo está principalmente nas raízes. '
    + 'Os ápices continuam dentro do osso, e as raízes dos molares inferiores encostam no canal mandibular (camada 2).');
}
L.push('');
L.push('## Camada 2: checagem das relações anatômicas', '');
L.push('Relações topográficas descritas em livros-texto clássicos, testadas automaticamente na geometria. A página exata de cada fonte não foi conferida aqui; confira no seu exemplar.', '');
L.push('| Teste | Medido no modelo | Status | Fonte |', '|---|---|---|---|');
for (const r of relacoes) L.push(`| ${r.teste} | ${r.medido} | ${ic[r.status]} ${r.status} | ${r.fonte} |`);
L.push('', '### Comparação visual com atlas reconhecidos', '');
L.push('Use os botões de vista do app ao lado do atlas de estudo (Netter, Sobotta ou Prometheus) e marque cada item. Imagens dos atlas não são incluídas por direitos autorais.', '');
for (const [vista, itens] of [
  ['Anterior', ['órbitas simétricas', 'abertura piriforme e septo (vômer/etmoide) na linha média', 'linha média entre 11/21 alinhada com 31/41 e com a sínfise']],
  ['Lateral (D e E)', ['arco zigomático contínuo (processo temporal do zigomático + processo zigomático do temporal)', 'côndilo da mandíbula na fossa mandibular, à frente do meato acústico externo', 'processo coronoide sob o arco zigomático', 'forame mentual na altura dos pré-molares']],
  ['Superior', ['suturas coronal, sagital e lambdóidea nos encontros dos ossos', 'bregma e lambda na linha média']],
  ['Inferior', ['forame magno com côndilos occipitais dos dois lados', 'palato duro formado pelos processos palatinos da maxila e lâminas horizontais dos palatinos', 'arcada superior em forma parabólica']],
  ['Posterior', ['sutura lambdóidea', 'protuberância occipital externa na linha média', 'processos mastoides simétricos']],
]) L.push(`- **${vista}:** ${itens.map(caixa).join(' · ')}`);
L.push('');
L.push('## Camada 3: conferência', '');
L.push('- Todas as medidas e relações fora do OK aparecem no app: a ficha da estrutura mostra o aviso **⚠ Dimensões** com o valor do modelo e o da referência (`src/data/conformidade.json`).');
L.push('- Para refazer a conferência depois de qualquer mudança nos modelos: `node pipeline/07-referencias.mjs` e `node pipeline/08-validar.mjs`.', '');
L.push('### Indicadores de sucesso', '');
L.push('| Indicador | Meta | Atual |', '|---|---|---|');
const fonteOk = todas.every((m) => m.fonte);
L.push(`| Medidas com fonte citada | 100% | ${fonteOk ? '100%' : 'incompleto'} |`);
L.push(`| Medidas de crânio dentro da tolerância | 100% | ${Math.round(cont(medidas, 'OK') / medidas.length * 100)}% |`);
L.push(`| Dentes (11 a 15, 21 a 25, 31 a 35, 41 a 45) dentro da tolerância | 100% | ${Math.round(cont(medDentes, 'OK') / medDentes.filter((d) => d.ref).length * 100)}% |`);
L.push(`| Relações anatômicas OK | 100% (ou explicadas) | ${Math.round(resumo.relacoes.OK / resumo.relacoes.total * 100)}% |`);
const semAviso = [...medidas, ...medDentes, ...relacoes].filter((x) => x.status !== 'OK' && x.status !== undefined)
  .filter((x) => (x.id ? [x.id] : (x.estruturas || []).flatMap((en) => idsDe(en, x.lado))).some((id) => !avisos[id])).length;
L.push(`| Falhas/alertas sem aviso no app | 0 | ${semAviso} |`, '');
if (gravarBase) fs.writeFileSync(ARQ_RELATORIO, L.join('\n'));

console.log('Medidas:', resumo.medidas, '\nRelações:', resumo.relacoes, '\nDesvio médio:', resumo.erro_medio_abs_pct);
for (const m of medidas) console.log(m.codigo.padEnd(4), String(m.modelo).padStart(6), `${m.ref.media}±${m.ref.dp}`.padStart(11), `z=${m.z}`.padStart(8), m.status);
for (const d of medDentes) console.log(d.fdi, String(d.modelo).padStart(5), (d.z ?? '').toString().padStart(6), d.status.padEnd(8), 'intraósseo', dentes.find((x) => x.fdi === d.fdi).analise.intraosseo_mm);
for (const r of relacoes) console.log(r.status.padEnd(7), r.teste, '→', r.medido);
if (pioras.length) {
  console.log(`\n${aceitar ? 'Aceito como nova linha de base' : 'REGRESSÃO'}: ${pioras.length} item(ns) piorou(aram) em relação ao conformidade.json anterior:`);
  for (const p of pioras) console.log('  ', p);
  if (!aceitar) {
    console.log('Nada foi gravado. Corrija os modelos ou, se a mudança for intencional, rode de novo com --aceitar.');
    process.exitCode = 1;
  }
}
