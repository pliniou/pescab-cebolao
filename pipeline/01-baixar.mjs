// Fase 1: baixa o que falta do BodyParts3D para o cache e extrai o ZIP.
// Com o cache completo não acessa a rede (o pipeline roda offline). Cada download vai para um arquivo .part e só é
// renomeado no fim (um download interrompido não passa por arquivo bom), e o SHA-256 de cada arquivo fica registrado em
// fontes.json no cache: nas execuções seguintes o arquivo é conferido contra ele, e um arquivo corrompido é baixado de novo.
// Uso: node pipeline/01-baixar.mjs            (usa o cache; baixa só o que falta ou não confere)
//      node pipeline/01-baixar.mjs --tamanhos (consulta antes o tamanho de cada arquivo no servidor)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { execFileSync } from 'node:child_process';
import { CACHE, BASE_URL, FILES, OBJ_DIR } from './config.mjs';

const ARQUIVOS_OBJ = 2234; // arquivos do pacote IS-A (config.mjs)
const REGISTRO = path.join(CACHE, 'fontes.json');
const mb = (n) => (n / 1048576).toFixed(1) + ' MB';
fs.mkdirSync(CACHE, { recursive: true });

const sha256 = (arq) => new Promise((ok, erro) => {
  const h = crypto.createHash('sha256');
  fs.createReadStream(arq).on('data', (d) => h.update(d)).on('end', () => ok(h.digest('hex'))).on('error', erro);
});
const registro = fs.existsSync(REGISTRO) ? JSON.parse(fs.readFileSync(REGISTRO, 'utf8')) : { origem: BASE_URL, arquivos: {} };

console.log('Cache:', CACHE);
if (process.argv.includes('--tamanhos')) {
  let total = 0;
  for (const f of FILES) {
    const r = await fetch(`${BASE_URL}/${f}`, { method: 'HEAD' });
    if (!r.ok) throw new Error(`${f}: HTTP ${r.status} (o endereço mudou? veja BASE_URL em config.mjs)`);
    const n = Number(r.headers.get('content-length') || 0);
    total += n;
    console.log(`  ${f.padEnd(36)} ${(n ? mb(n) : '?').padStart(10)}`);
  }
  console.log(`  ${'TOTAL'.padEnd(36)} ${mb(total).padStart(10)}\n`);
}

// Um arquivo do cache vale se existe e, quando já tem hash registrado, confere com ele
async function confere(f) {
  const dest = path.join(CACHE, f);
  if (!fs.existsSync(dest) || !fs.statSync(dest).size) return false;
  const esperado = registro.arquivos[f]?.sha256;
  if (!esperado) return true; // cache anterior a este registro: aceito e registrado abaixo
  return (await sha256(dest)) === esperado;
}

async function baixar(f) {
  const dest = path.join(CACHE, f);
  const parcial = `${dest}.part`;
  console.log('baixando:', f);
  let r;
  try { r = await fetch(`${BASE_URL}/${f}`); } catch (e) {
    throw new Error(`${f}: sem acesso a ${BASE_URL} (${e.cause?.code || e.message}). Com o cache completo o pipeline não precisa de rede.`);
  }
  if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`);
  await pipeline(Readable.fromWeb(r.body), fs.createWriteStream(parcial)); // direto para o disco, sem o ZIP inteiro na memória
  const esperado = Number(r.headers.get('content-length') || 0);
  const recebido = fs.statSync(parcial).size;
  if (esperado && recebido !== esperado) throw new Error(`${f}: download incompleto (${recebido} de ${esperado} bytes)`);
  fs.renameSync(parcial, dest);
}

for (const f of FILES) {
  const dest = path.join(CACHE, f);
  let novo = false;
  if (await confere(f)) console.log('já existe:', f);
  else {
    if (fs.existsSync(dest)) console.log(`⚠ ${f} não confere com o hash registrado: baixando de novo`);
    await baixar(f);
    novo = true;
  }
  if (novo || !registro.arquivos[f]?.sha256) registro.arquivos[f] = { sha256: await sha256(dest), bytes: fs.statSync(dest).size };
}
fs.writeFileSync(REGISTRO, JSON.stringify(registro, null, 2));

const entradas = () => (fs.existsSync(OBJ_DIR) ? fs.readdirSync(OBJ_DIR).length : 0);
if (entradas() < ARQUIVOS_OBJ) {
  console.log('extraindo ZIP...');
  // tar do Windows 10+ (bsdtar) extrai ZIP
  execFileSync('tar', ['-xf', path.join(CACHE, 'isa_BP3D_4.0_obj_99.zip'), '-C', CACHE], { stdio: 'inherit' });
}
if (entradas() < ARQUIVOS_OBJ) throw new Error(`esperados ${ARQUIVOS_OBJ} arquivos em ${OBJ_DIR}, há ${entradas()}: ZIP incompleto?`);
console.log('OBJ disponíveis:', fs.readdirSync(OBJ_DIR).filter((f) => f.endsWith('.obj')).length);
console.log('Hashes registrados em', REGISTRO);
