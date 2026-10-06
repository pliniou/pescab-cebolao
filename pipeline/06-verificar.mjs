// Verifica os GLB de public/models: abre cada um, conta nós/triângulos, confere extras e a caixa do conjunto; ids únicos,
// iguais aos do dicionário (src/data/estruturas.json) e o orçamento de tamanho (o PWA guarda tudo no aparelho e o
// Workbox só pré-cacheia arquivos até 8 MB). Sai com código 1 se algo falhar, para o npm run pipeline parar.
// Uso: node pipeline/06-verificar.mjs
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/core';
import { MeshoptDecoder } from 'meshoptimizer';
import { ROOT } from './config.mjs';

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const dir = path.join(ROOT, 'public', 'models');
const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
const dicionario = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'estruturas.json'), 'utf8'));
// orçamento: cada GLB bem abaixo do limite de 8 MB do pré-cache (vite.config.js) e o conjunto num tamanho de celular
const LIMITE_ARQUIVO = 3 * 1024 * 1024;
const LIMITE_TOTAL = 12 * 1024 * 1024;
let ok = true;
const falhar = (msg) => { console.log('  ⚠', msg); ok = false; };
const ids = new Map(); // id → camada (para achar repetidos entre camadas)
let bytes = 0;
const gmin = [Infinity, Infinity, Infinity], gmax = [-Infinity, -Infinity, -Infinity];
for (const c of meta.camadas) {
  const doc = await io.read(path.join(dir, `${c}.glb`));
  const nodes = doc.getRoot().listNodes();
  const semExtra = nodes.filter((n) => !n.getExtras().id);
  for (const n of nodes) {
    const id = n.getExtras().id;
    if (!id) continue;
    if (ids.has(id)) falhar(`id repetido: ${id} (${ids.get(id)} e ${c})`);
    ids.set(id, c);
  }
  // o app reparenta cada malha no grupo da camada supondo que o pai dela é a cena, sem transformação (scene/modelos.js):
  // nó aninhado em outro nó sairia do lugar sem erro nenhum. A transformação do próprio nó (quantização) é preservada.
  const cena = doc.getRoot().getDefaultScene() || doc.getRoot().listScenes()[0];
  const raizes = new Set(cena.listChildren());
  for (const n of nodes) if (!raizes.has(n)) falhar(`${n.getExtras().id || n.getName()}: nó aninhado (o pai não é a cena)`);
  const tam = fs.statSync(path.join(dir, `${c}.glb`)).size;
  bytes += tam;
  if (tam > LIMITE_ARQUIVO) falhar(`${c}.glb com ${(tam / 1048576).toFixed(1)} MB (limite ${LIMITE_ARQUIVO / 1048576} MB)`);
  let tri = 0;
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) tri += p.getIndices().getCount() / 3;
  const b = getBounds(doc.getRoot().getDefaultScene() || doc.getRoot().listScenes()[0]);
  for (let i = 0; i < 3; i++) { gmin[i] = Math.min(gmin[i], b.min[i]); gmax[i] = Math.max(gmax[i], b.max[i]); }
  const dim = b.max.map((v, i) => ((v - b.min[i]) * 1000).toFixed(0)).join(' × ');
  console.log(`${c.padEnd(10)} nós ${String(nodes.length).padStart(3)}  triângulos ${String(tri).padStart(7)}  caixa ${dim} mm`
    + (semExtra.length ? `  ⚠ ${semExtra.length} sem extras` : ''));
  if (semExtra.length || !nodes.length) ok = false;
}
console.log('conjunto (L × A × P):', gmax.map((v, i) => ((v - gmin[i]) * 1000).toFixed(0)).join(' × '), 'mm');
const noDicionario = new Set(dicionario.estruturas.map((e) => e.id));
const semDicionario = [...ids.keys()].filter((id) => !noDicionario.has(id));
const semModelo = [...noDicionario].filter((id) => !ids.has(id));
if (semDicionario.length) falhar(`${semDicionario.length} nós sem entrada no dicionário (rode a etapa 05): ${semDicionario.slice(0, 5).join(', ')}`);
if (semModelo.length) falhar(`${semModelo.length} estruturas do dicionário sem malha: ${semModelo.slice(0, 5).join(', ')}`);
if (bytes > LIMITE_TOTAL) falhar(`modelos somam ${(bytes / 1048576).toFixed(1)} MB (limite ${LIMITE_TOTAL / 1048576} MB)`);
console.log(`ids: ${ids.size} únicos, ${noDicionario.size} no dicionário · modelos: ${(bytes / 1048576).toFixed(2)} MB`);
console.log(ok ? 'OK: todos os GLB abriram, ids únicos e iguais aos do dicionário, dentro do orçamento.' : 'FALHOU');
if (!ok) process.exitCode = 1;
