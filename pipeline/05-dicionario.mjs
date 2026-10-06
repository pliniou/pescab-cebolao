// Gera src/data/estruturas.json a partir de work/selecao.json + descricoes.mjs.
// Sem o cache (work/selecao.json vem do 03c, que exige o BodyParts3D e o Blender), reconstrói a seleção a partir do
// próprio estruturas.json publicado: ids, FMA, camada, lado e fonte ficam como estão (são da geometria, que não muda) e
// nome, latim, FDI e "revisar" voltam do catálogo e das descrições. Assim corrigir um nome, um latim ou uma descrição
// não exige o pipeline inteiro.
// Uso: node pipeline/05-dicionario.mjs             (usa work/selecao.json se existir)
//      node pipeline/05-dicionario.mjs --publicado (força a reconstrução a partir do estruturas.json publicado)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, WORK } from './config.mjs';
import { CAMADAS, CATALOGO, nomeComLado } from './catalogo.mjs';
import { DESCRICOES, DESC_DENTE, REVISAR } from './descricoes.mjs';

const out = path.join(ROOT, 'src', 'data', 'estruturas.json');
const arqSelecao = path.join(WORK, 'selecao.json');
const doPublicado = process.argv.includes('--publicado') || !fs.existsSync(arqSelecao);

function selecaoDoPublicado() {
  if (!fs.existsSync(out)) throw new Error(`sem ${arqSelecao} e sem ${out}: rode o pipeline completo (npm run pipeline)`);
  const publicado = JSON.parse(fs.readFileSync(out, 'utf8')).estruturas;
  const faltam = [];
  const sel = publicado.map((e) => {
    const c = CATALOGO.find((x) => x.camada === e.camada && x.en === e.en);
    if (!c) { faltam.push(`${e.camada}/${e.en}`); return null; }
    const { pt, fdi } = nomeComLado(c, e.lado);
    return { id: e.id, fma: e.fma, pt, la: c.la, en: e.en, camada: e.camada, lado: e.lado, fdi, fonte: e.fonte, revisar: !!c.revisar, antes: e };
  });
  // estrutura nova ou com o "en" trocado no catálogo muda a geometria e o id: isso só o pipeline completo resolve
  if (faltam.length) throw new Error(`no estruturas.json, mas não no catálogo (renomeado?): ${faltam.join('; ')}. Rode o pipeline completo.`);
  const novas = CATALOGO.filter((c) => !publicado.some((e) => e.camada === c.camada && e.en === c.en));
  if (novas.length) console.log(`${novas.length} itens do catálogo sem modelo publicado (não encontrados nas fontes ou novos; veja relatorio_estruturas.md): ${novas.map((c) => c.en).join('; ')}`);
  return sel;
}

const sel = doPublicado ? selecaoDoPublicado() : JSON.parse(fs.readFileSync(arqSelecao, 'utf8'));
console.log(doPublicado ? 'seleção reconstruída a partir do estruturas.json publicado' : `seleção: ${path.relative(ROOT, arqSelecao)}`);
const semDesc = [];
const estruturas = sel.map((e) => {
  let descricao = DESCRICOES[e.en];
  if (!descricao && e.fdi) descricao = DESC_DENTE[Number(String(e.fdi).slice(-1))];
  if (!descricao) semDesc.push(e.en);
  const revisar = e.revisar || REVISAR.has(e.en) || !descricao;
  // no modo publicado a correção geométrica de lado do 03c (que também marca "revisar") não é conhecida: avisa se o
  // publicado tinha uma marcação que o catálogo e as descrições não explicam
  if (e.antes?.revisar && !revisar) console.log(`⚠ ${e.id}: marcado "revisar" no publicado sem motivo no catálogo (correção de lado do 03c?); confira com o pipeline completo`);
  return {
    id: e.id, fma: e.fma || null, pt: e.pt, la: e.la || null, en: e.en, camada: e.camada, lado: e.lado,
    ...(e.fdi ? { fdi: e.fdi } : {}),
    descricao: descricao || null, fonte: e.fonte,
    ...(revisar ? { revisar: true } : {}),
  };
});

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ camadas: CAMADAS, estruturas }, null, 1));
console.log(`${estruturas.length} estruturas → ${path.relative(ROOT, out)}`);
console.log('revisar:', estruturas.filter((e) => e.revisar).length);
if (semDesc.length) console.log('sem descrição:', [...new Set(semDesc)].join('; '));
