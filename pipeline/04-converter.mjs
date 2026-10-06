// Fase 3: OBJ → GLB, um GLB por camada em public/models, um nó por estrutura (nome = id; extras = id, FMA, camada).
// Coordenadas: entrada em mm (sistema do Z-Anatomy; peças do BP3D transformadas por za_transform.json),
// saída em metros, Y para cima (three.js): (X, Y, Z) = (x, z, −y) − centro do crânio.
// Otimização com gltf-transform: weld → simplify (meshoptimizer, com limite de erro) → meshopt.
// Uso: node pipeline/04-converter.mjs
import fs from 'node:fs';
import path from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, simplify, meshopt, dedup, prune } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { ROOT, WORK, CACHE, OBJ_DIR, CORTE_Z, CAMADAS_CORTADAS, lerJson } from './config.mjs';
import { CAMADAS } from './catalogo.mjs';
import { lerObj } from './obj.mjs';

const OUT = path.join(ROOT, 'public', 'models');
fs.mkdirSync(OUT, { recursive: true });
const sel = lerJson(path.join(WORK, 'selecao.json'), 'node pipeline/03c-filtrar.mjs');
const T = lerJson(path.join(WORK, 'za_transform.json'), 'node pipeline/03b-za-alinhar.mjs');

// Simplificação por camada. `erro` é relativo ao tamanho de cada malha (meshoptimizer): o limite de erro
// impede que forames, processos e cúspides sejam apagados mesmo quando a razão pedida não é atingida.
const OPT = {
  ossos: { ratio: 0.5, erro: 0.002 },
  vertebras: { ratio: 0.4, erro: 0.003 },
  dentes: { ratio: 0.5, erro: 0.002 },
  musculos: { ratio: 0.4, erro: 0.003 },
  nervos: { ratio: 0.5, erro: 0.004 },
  arterias: { ratio: 0.5, erro: 0.004 },
  veias: { ratio: 0.5, erro: 0.004 },
  glandulas: { ratio: 0.5, erro: 0.003 },
};
const COR = {
  ossos: [0.93, 0.89, 0.8], vertebras: [0.88, 0.84, 0.75], dentes: [0.98, 0.97, 0.92], musculos: [0.75, 0.3, 0.28],
  nervos: [0.98, 0.84, 0.25], arterias: [0.85, 0.12, 0.12], veias: [0.2, 0.35, 0.8], glandulas: [0.85, 0.6, 0.4],
};

const bp2za = (x, y, z) => {
  const d = [x - T.t[0], y - T.t[1], z - T.t[2]];
  return [0, 1, 2].map((c) => (T.R[0][c] * d[0] + T.R[1][c] * d[1] + T.R[2][c] * d[2]) / T.s);
};

// Centro do conjunto = centro da caixa dos ossos do crânio (sem vértebras)
const ossos = sel.filter((e) => e.camada === 'ossos');
const cmin = [0, 1, 2].map((i) => Math.min(...ossos.map((e) => e.min[i])));
const cmax = [0, 1, 2].map((i) => Math.max(...ossos.map((e) => e.max[i])));
const centro = cmin.map((v, i) => (v + cmax[i]) / 2);
const paraThree = (x, y, z) => [(x - centro[0]) / 1000, (z - centro[2]) / 1000, -(y - centro[1]) / 1000];

function malhaDaEstrutura(e) {
  const pos = [];
  const idx = [];
  for (const a of e.arquivos) {
    const arq = a.fonte === 'za' ? path.join(CACHE, 'za_obj', a.arquivo + '.obj') : path.join(OBJ_DIR, a.arquivo + '.obj');
    const m = lerObj(arq);
    const base = pos.length / 3;
    const mm = [];
    for (let i = 0; i < m.pos.length; i += 3) {
      const p = a.fonte === 'za' ? [m.pos[i], m.pos[i + 1], m.pos[i + 2]] : bp2za(m.pos[i], m.pos[i + 1], m.pos[i + 2]);
      mm.push(p);
      pos.push(...paraThree(...p));
    }
    const cortar = CAMADAS_CORTADAS.includes(e.camada);
    for (let i = 0; i < m.idx.length; i += 3) {
      const t = [m.idx[i], m.idx[i + 1], m.idx[i + 2]];
      if (cortar && t.some((k) => mm[k][2] < CORTE_Z)) continue;
      idx.push(base + t[0], base + t[1], base + t[2]);
    }
  }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
}

const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;

const resumo = [];
for (const camada of Object.keys(CAMADAS)) {
  const lista = sel.filter((e) => e.camada === camada);
  if (!lista.length) continue;
  const doc = new Document();
  const buf = doc.createBuffer();
  const cena = doc.createScene(camada);
  const mat = doc.createMaterial(camada).setBaseColorFactor([...COR[camada], 1]).setRoughnessFactor(0.7).setMetallicFactor(0)
    .setDoubleSided(true);
  let tri0 = 0;
  for (const e of lista) {
    const { pos, idx } = malhaDaEstrutura(e);
    if (!idx.length) { console.warn('sem triângulos:', e.id); continue; }
    tri0 += idx.length / 3;
    const prim = doc.createPrimitive().setMaterial(mat)
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buf))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(idx).setBuffer(buf));
    const mesh = doc.createMesh(e.id).addPrimitive(prim);
    const node = doc.createNode(e.id).setMesh(mesh).setExtras({ id: e.id, fma: e.fma, camada });
    cena.addChild(node);
  }
  const { ratio, erro } = OPT[camada];
  await doc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error: erro, lockBorder: false }),
    // sem normals(): ele desfaz o weld (sombreamento facetado). O app calcula normais suaves ao carregar.
    dedup(),
    prune({ keepLeaves: true }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  let tri1 = 0;
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) tri1 += p.getIndices().getCount() / 3;
  const arq = path.join(OUT, `${camada}.glb`);
  await io.write(arq, doc);
  resumo.push({ camada, estruturas: lista.length, tri0, tri1, bytes: fs.statSync(arq).size });
}

fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({
  unidade: 'metro', eixos: 'Y para cima; +X = esquerdo do paciente; +Z = anterior',
  centro_mm_zanatomy: centro.map((v) => +v.toFixed(2)), camadas: resumo.map((r) => r.camada),
}, null, 1));

console.log('camada'.padEnd(11), 'estrut.'.padStart(7), 'triâng. antes'.padStart(14), 'depois'.padStart(9), 'arquivo'.padStart(10));
let total = 0;
for (const r of resumo) {
  total += r.bytes;
  console.log(r.camada.padEnd(11), String(r.estruturas).padStart(7), r.tri0.toLocaleString('pt-BR').padStart(14),
    r.tri1.toLocaleString('pt-BR').padStart(9), ((r.bytes / 1024).toFixed(0) + ' KB').padStart(10));
}
console.log('TOTAL', (total / 1048576).toFixed(2), 'MB');
