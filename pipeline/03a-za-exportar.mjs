// Fase 2b: exporta do Z-Anatomy (via Blender headless) os objetos mapeados no catálogo + ossos de referência para o alinhamento.
// Requer o Blender (versão da Microsoft Store: alias blender-launcher.exe) e Z-Anatomy/Startup.blend no cache.
// Na primeira execução lista os objetos do Z-Anatomy (za_listar.py → work/za_objetos.json); apague o arquivo para
// listar de novo depois de trocar o Startup.blend.
// Uso: node pipeline/03a-za-exportar.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { CACHE, WORK, ROOT } from './config.mjs';
import { CATALOGO, ZA_AJUSTE } from './catalogo.mjs';

const BLENDER = process.env.BLENDER
  || path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WindowsApps', 'blender-launcher.exe');
const BLEND = path.join(CACHE, 'Z-Anatomy', 'Startup.blend');
const SAIDA = path.join(CACHE, 'za_obj');
const RAIO = { nervos: 0.0009, arterias: 0.0013, veias: 0.0016 }; // m, só para curvas sem espessura

if (!fs.existsSync(BLEND)) {
  throw new Error(`Z-Anatomy não encontrado: ${BLEND}\nCopie a pasta Z-Anatomy (com o Startup.blend) para o cache e rode de novo.`);
}
const blender = (script, ...args) => execFileSync(BLENDER, ['-b', BLEND, '--python', path.join(ROOT, 'pipeline', script), '--', ...args], { stdio: 'inherit' });

fs.mkdirSync(WORK, { recursive: true });
const LISTA = path.join(WORK, 'za_objetos.json');
if (!fs.existsSync(LISTA)) blender('za_listar.py', LISTA);
const objetos = new Set(JSON.parse(fs.readFileSync(LISTA, 'utf8')).objects.map((o) => o.name));
const arquivo = (n) => 'ZA_' + n.replace(/[^A-Za-z0-9]+/g, '_').replace(/_+$/, '');
const pedido = [];
for (const c of CATALOGO.filter((c) => c.za)) {
  for (const base of c.za) {
    const nomes = objetos.has(base) ? [base] : [`${base}.l`, `${base}.r`].filter((n) => objetos.has(n));
    if (!nomes.length) console.log('não encontrado no Z-Anatomy:', base);
    for (const nome of nomes) pedido.push({ nome, arquivo: arquivo(nome), raio: RAIO[c.camada] });
  }
}
for (const [za] of ZA_AJUSTE) pedido.push({ nome: za, arquivo: arquivo(za) });
fs.writeFileSync(path.join(WORK, 'za_pedido.json'), JSON.stringify(pedido, null, 1));
console.log('objetos pedidos:', pedido.length);

fs.rmSync(SAIDA, { recursive: true, force: true });
blender('za_exportar.py', path.join(WORK, 'za_pedido.json'), SAIDA);

const rel = JSON.parse(fs.readFileSync(path.join(SAIDA, '_relatorio.json'), 'utf8'));
const erros = rel.filter((r) => r.erro);
console.log('exportados:', rel.length - erros.length, '| erros:', erros.length);
for (const e of erros) console.log('  ', e.nome, '→', e.erro);
const bev = rel.filter((r) => r.tipo === 'CURVE');
console.log('curvas:', bev.length, '| com espessura própria:', bev.filter((r) => !r.bevel_aplicado_mm).length);
