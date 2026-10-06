// Fase 2: monta a seleção de estruturas e gera relatorio_estruturas.md.
// Base: Z-Anatomy (derivado do BP3D, internamente consistente). BodyParts3D só para o que o Z-Anatomy não tem;
// essas peças são levadas ao sistema do Z-Anatomy pela transformação de 03b-za-alinhar.mjs.
// Sistema final: milímetros, x > 0 = esquerdo, y < 0 = anterior, z para cima.
// Requer: 02-indexar, 03a-za-exportar, 03b-za-alinhar.   Uso: node pipeline/03c-filtrar.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, WORK, CACHE, CORTE_Z, CAMADAS_CORTADAS, lerJson } from './config.mjs';
import { lerObj } from './obj.mjs';
import { CATALOGO, CAMADAS, nomeComLado } from './catalogo.mjs';

const index = lerJson(path.join(WORK, 'fj_index.json'), 'node pipeline/02-indexar.mjs');
const zaRel = lerJson(path.join(CACHE, 'za_obj', '_relatorio.json'), 'node pipeline/03a-za-exportar.mjs');
const zaPorNome = new Map(zaRel.filter((r) => !r.erro).map((r) => [r.nome, r]));
const T = lerJson(path.join(WORK, 'za_transform.json'), 'node pipeline/03b-za-alinhar.mjs');

const norm = (s) => s.toLowerCase().replace(/\b(left|right) /g, '').trim();
const ladoNome = (s) => (/\bleft\b|\.l$/i.test(s) ? 'E' : /\bright\b|\.r$/i.test(s) ? 'D' : null);
const ladoPos = (min, max) => { const cx = (min[0] + max[0]) / 2; return Math.abs(cx) < 3 ? 'M' : cx > 0 ? 'E' : 'D'; };

// BP3D → Z-Anatomy: p_za = Rᵀ(p_bp − t)/s
const bp2za = (p) => {
  const d = p.map((v, i) => v - T.t[i]);
  return [0, 1, 2].map((c) => (T.R[0][c] * d[0] + T.R[1][c] * d[1] + T.R[2][c] * d[2]) / T.s);
};
function caixaBp(min, max) {
  const pts = [];
  for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) pts.push(bp2za([x, y, z]));
  return [[0, 1, 2].map((i) => Math.min(...pts.map((p) => p[i]))), [0, 1, 2].map((i) => Math.max(...pts.map((p) => p[i])))];
}
function iou(a, b) {
  let inter = 1, va = 1, vb = 1;
  for (let i = 0; i < 3; i++) {
    inter *= Math.max(0, Math.min(a.max[i], b.max[i]) - Math.max(a.min[i], b.min[i]));
    va *= a.max[i] - a.min[i]; vb *= b.max[i] - b.min[i];
  }
  return inter / (va + vb - inter);
}

// Elementos do BP3D da região (z > 1280 mm no sistema do BP3D)
const elems = index.filter((e) => e.name && !e.name.startsWith('#') && e.min && e.max[2] > 1280);
const fmaBp = (en, lado) => {
  const c = elems.filter((e) => norm(e.name) === en);
  const e = c.find((x) => ladoNome(x.name) === lado) || c.find((x) => !ladoNome(x.name));
  return e ? e.fma : null;
};

const estruturas = [];
const descartados = [];
const corrigidos = [];
const semFonte = [];

for (const c of CATALOGO) {
  // ── Z-Anatomy
  const zaObjs = [];
  for (const base of c.za || []) {
    for (const nome of [base, `${base}.l`, `${base}.r`]) if (zaPorNome.has(nome)) zaObjs.push(zaPorNome.get(nome));
  }
  if (zaObjs.length) {
    const lados = new Map();
    for (const o of zaObjs) {
      const lado = ladoNome(o.nome) || ladoPos(o.min, o.max);
      (lados.get(lado) || lados.set(lado, []).get(lado)).push(o);
    }
    for (const [lado, objs] of lados) {
      if (CAMADAS_CORTADAS.includes(c.camada)) {
        // caixa só da parte acima do corte (nervos e vasos que descem ao tórax)
        for (const o of objs) {
          const { pos } = lerObj(path.join(CACHE, 'za_obj', o.arquivo + '.obj'));
          o.min = [Infinity, Infinity, Infinity]; o.max = [-Infinity, -Infinity, -Infinity];
          for (let i = 0; i < pos.length; i += 3) {
            if (pos[i + 2] < CORTE_Z) continue;
            for (let k = 0; k < 3; k++) { o.min[k] = Math.min(o.min[k], pos[i + k]); o.max[k] = Math.max(o.max[k], pos[i + k]); }
          }
        }
        objs.splice(0, objs.length, ...objs.filter((o) => o.min[0] !== Infinity));
        if (!objs.length) continue;
      }
      estruturas.push({
        c, lado, fonte: 'Z-Anatomy', fma: fmaBp(c.en, lado),
        origem: objs.map((o) => o.nome),
        arquivos: objs.map((o) => ({ fonte: 'za', arquivo: o.arquivo })),
        curva: objs.some((o) => o.tipo === 'CURVE'),
        faces: objs.reduce((a, o) => a + o.faces, 0),
        min: [0, 1, 2].map((i) => Math.min(...objs.map((o) => o.min[i]))),
        max: [0, 1, 2].map((i) => Math.max(...objs.map((o) => o.max[i]))),
      });
    }
    continue;
  }
  // ── BodyParts3D
  const porLado = new Map();
  for (const e of elems.filter((x) => norm(x.name) === c.en)) {
    let fma = e.fma, en = e.name, lado = ladoNome(e.name);
    const posL = ladoPos(e.min, e.max);
    if (!lado) lado = posL;
    else if (posL !== 'M' && posL !== lado) {
      // Rótulo de lado contrário à posição (erro do BP3D): usa o conceito do lado oposto
      const oposto = elems.find((o) => o !== e && norm(o.name) === c.en && ladoNome(o.name) === posL);
      if (oposto) {
        corrigidos.push(`${e.fj}: rotulado "${e.name}" (${e.fma}), mas está do lado ${posL === 'E' ? 'esquerdo' : 'direito'} → tratado como "${oposto.name}" (${oposto.fma})`);
        fma = oposto.fma; en = oposto.name; lado = posL;
      }
    }
    let s = porLado.get(lado);
    if (!s) porLado.set(lado, (s = { fma, en, els: [], corrigido: en !== e.name }));
    const dup = s.els.find((o) => iou(o, e) > 0.5);
    if (dup) {
      descartados.push(`${e.fj} × ${dup.fj} (${e.name}, IoU ${iou(dup, e).toFixed(2)})`);
      if (e.faces > dup.faces) s.els.splice(s.els.indexOf(dup), 1, e);
      continue;
    }
    s.els.push(e);
  }
  if (!porLado.size) { semFonte.push(c); continue; }
  for (const [lado, s] of porLado) {
    const [min, max] = caixaBp(
      [0, 1, 2].map((i) => Math.min(...s.els.map((e) => e.min[i]))),
      [0, 1, 2].map((i) => Math.max(...s.els.map((e) => e.max[i]))));
    estruturas.push({
      c, lado, fonte: 'BodyParts3D', fma: s.fma, origem: s.els.map((e) => e.fj),
      arquivos: s.els.map((e) => ({ fonte: 'bp', arquivo: e.fj })), curva: false, corrigido: s.corrigido,
      faces: s.els.reduce((a, e) => a + e.faces, 0), min, max,
    });
  }
}

// ── Nomes, ids e conferência de lado
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const saida = estruturas.map((s) => {
  const { c } = s;
  const { pt, fdi: fdiN } = nomeComLado(c, s.lado);
  const posL = ladoPos(s.min, s.max);
  return {
    id: (s.fma || slug(c.en)) + (s.lado === 'M' ? '' : '_' + s.lado),
    fma: s.fma, en: c.en, pt, la: c.la, camada: c.camada, lado: s.lado, fdi: fdiN,
    fonte: s.fonte, origem: s.origem, arquivos: s.arquivos,
    curva: s.curva, extra: !!c.extra, revisar: !!(c.revisar || s.corrigido),
    faces: s.faces, min: s.min.map((v) => +v.toFixed(2)), max: s.max.map((v) => +v.toFixed(2)),
    ladoOk: s.lado === 'M' || posL === 'M' || posL === s.lado,
  };
});
const ordem = Object.keys(CAMADAS);
saida.sort((a, b) => ordem.indexOf(a.camada) - ordem.indexOf(b.camada)
  || (a.fdi || '').localeCompare(b.fdi || '') || a.pt.localeCompare(b.pt, 'pt'));
const ids = new Set();
for (const e of saida) { if (ids.has(e.id)) throw new Error('id repetido: ' + e.id); ids.add(e.id); }
fs.writeFileSync(path.join(WORK, 'selecao.json'), JSON.stringify(saida, null, 1));

// ── Relatório
const OBS = {
  'short ciliary nerve': 'Saem do gânglio ciliar (não são ramos diretos do V1).',
  'levator labii superioris alaeque nasi': 'No Z-Anatomy chama-se "Levator nasolabialis" (sinônimo).',
  'mandibular nerve': 'Representado pelos troncos anterior e posterior do Z-Anatomy.',
  'trigeminal nerve': 'Tronco e raízes sensitiva e motora; o gânglio trigeminal não existe como peça própria.',
  'occipitofrontalis': 'Ventres frontal e occipital (a aponeurose epicrânica é uma peça separada).',
  'maxillary nerve': 'Só o tronco; os ramos (infraorbital, alveolares superiores, palatinos) não existem nas duas fontes.',
  'facial nerve': 'Só o tronco (até a parótida); os ramos terminais da face não existem nas duas fontes.',
};
const L = [];
L.push('# Relatório de estruturas do Atlas 3D de Cabeça e Pescoço', '');
L.push('**Fontes:**');
L.push('- **Z-Anatomy** (CC BY-SA 4.0), modelo derivado do BodyParts3D e refinado. É a base do atlas: tudo de cabeça e pescoço que existe nele vem dele, para as peças se encaixarem entre si (mandíbula, dentes, músculos, nervos no canal).');
L.push('- **BodyParts3D 4.0** (DBCLS, CC BY-SA 2.1 JP), pacote `isa_BP3D_4.0_obj_99.zip`: só para o que o Z-Anatomy não tem.');
L.push('');
L.push(`**Alinhamento BP3D → Z-Anatomy:** similaridade (escala ${T.s.toFixed(4)}, rotação e translação) por ICP em 11 ossos não remodelados; `
  + `distância mediana após o ajuste: **${T.residuo.mediana} mm** (p90 ${T.residuo.p90} mm). A mandíbula e os temporais foram remodelados no Z-Anatomy (diferença de ~3 mm) e por isso ficaram fora do ajuste.`);
L.push('');
L.push('**Coordenadas finais:** mm; x > 0 = esquerdo; y < 0 = anterior; z para cima. Lado conferido pela posição: '
  + (saida.every((e) => e.ladoOk) ? '**OK** em todas.' : '**há divergências** (ver ⚠).'));
L.push('');
const faltando = semFonte;
L.push(`**Resumo:** ${saida.length} estruturas (${saida.filter((e) => e.fonte === 'Z-Anatomy').length} do Z-Anatomy, `
  + `${saida.filter((e) => e.fonte === 'BodyParts3D').length} do BP3D; ${saida.filter((e) => e.extra).length} extras). `
  + `${faltando.length} itens pedidos não existem em nenhuma das duas fontes.`, '');
L.push('| Camada | Estruturas | Faces (antes da otimização) |', '|---|---:|---:|');
for (const k of ordem) {
  const g = saida.filter((e) => e.camada === k);
  L.push(`| ${CAMADAS[k]} | ${g.length} | ${g.reduce((a, e) => a + e.faces, 0).toLocaleString('pt-BR')} |`);
}
L.push('', '## 1. Encontradas', '');
L.push('Legenda: **+** extra (fora da lista, incluído por relevância odontológica) · **R** revisar · **~** trajeto modelado como curva (tubo; caminho aproximado) · ⚠ lado divergente. '
  + 'FMA "—" = conceito sem modelo no BP3D (só no Z-Anatomy), sem ID FMA no material baixado.', '');
for (const k of ordem) {
  const g = saida.filter((e) => e.camada === k);
  if (!g.length) continue;
  L.push(`### ${CAMADAS[k]} (${g.length})`, '');
  L.push('| FMA | Nome em inglês | Nome PT-BR | Latim | Lado | Fonte (objetos) | Obs. |', '|---|---|---|---|:-:|---|---|');
  for (const e of g) {
    const flags = [e.extra && '+', e.revisar && 'R', e.curva && '~', !e.ladoOk && '⚠'].filter(Boolean).join(' ');
    const obs = [flags, OBS[e.en]].filter(Boolean).join(' ');
    L.push(`| ${e.fma || '—'} | ${e.en} | ${e.pt} | *${e.la}* | ${e.lado} | ${e.fonte === 'Z-Anatomy' ? 'ZA' : 'BP3D'}: ${e.origem.join(', ')} | ${obs} |`);
  }
  L.push('');
}
L.push('## 2. Não encontradas (nem no Z-Anatomy, nem no BodyParts3D)', '');
L.push('Nenhuma foi modelada à mão.', '');
for (const k of ordem) {
  const g = faltando.filter((c) => c.camada === k);
  if (g.length) L.push(`**${CAMADAS[k]}:** ` + g.map((c) => `${c.pt} (*${c.la}*)`).join('; ') + '.', '');
}
L.push('## 3. Ajustes nos dados', '');
for (const d of descartados) L.push(`- Duplicata descartada (BP3D): ${d}`);
for (const d of corrigidos) L.push(`- Lado trocado no BP3D, corrigido pela posição: ${d}`);
L.push('- Ramos superior/inferior do n. oculomotor do BP3D foram substituídos pelo n. oculomotor inteiro do Z-Anatomy.');
L.push('');
fs.writeFileSync(path.join(ROOT, 'relatorio_estruturas.md'), L.join('\n'));

console.log(`estruturas: ${saida.length} (ZA ${saida.filter((e) => e.fonte === 'Z-Anatomy').length}, BP ${saida.filter((e) => e.fonte === 'BodyParts3D').length}) | faltando: ${faltando.length}`);
for (const k of ordem) console.log(`  ${k}: ${saida.filter((e) => e.camada === k).length}`);
const ruins = saida.filter((e) => !e.ladoOk);
if (ruins.length) console.log('LADO DIVERGENTE:', ruins.map((e) => e.id + ' ' + e.en));
console.log('faltando:', faltando.map((c) => c.en).join('; '));
