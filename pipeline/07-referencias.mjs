// Validação, camada 1: base de dados de referência → src/data/referencias.json
// - Craniometria: calculada aqui a partir dos dados brutos de Howells (2524 crânios, 28 populações), baixados de
//   https://volweb.utk.edu/~auerbach/HOWL.htm para o cache. Média e DP de todos os crânios masculinos.
// - Dentes: Kim et al. 2013 (valores transcritos das tabelas 3 e 4 do artigo, conferidos na imagem original).
// - Relações anatômicas (camada 2): definidas em 08-validar.mjs, com a fonte de cada uma.
// Uso: node pipeline/07-referencias.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CACHE } from './config.mjs';

const URL_HOWELLS = 'https://volweb.utk.edu/~auerbach/Howell.csv';
const CSV = path.join(CACHE, 'Howell.csv');
if (!fs.existsSync(CSV)) {
  const r = await fetch(URL_HOWELLS);
  if (!r.ok) throw new Error(`download falhou: ${r.status}`);
  fs.mkdirSync(CACHE, { recursive: true }); // a validação pode rodar sem o resto do pipeline (cache ainda vazio)
  fs.writeFileSync(CSV, Buffer.from(await r.arrayBuffer()));
}
const linhas = fs.readFileSync(CSV, 'utf8').trim().split(/\r\n|\r|\n/).map((l) => l.split(','));
const cab = linhas.shift();

// Definições resumidas de Howells (1973). `estruturas`: ossos que recebem o aviso no app se a medida falhar.
const MEDIDAS = {
  GOL: { nome: 'Comprimento máximo do crânio (glabela–opistocrânio)', estruturas: ['frontal bone', 'occipital bone', 'parietal bone'] },
  XCB: { nome: 'Largura máxima do crânio (eurio–eurio)', estruturas: ['parietal bone', 'temporal bone'] },
  ZYB: { nome: 'Largura bizigomática (zígio–zígio)', estruturas: ['zygomatic bone', 'temporal bone'] },
  BBH: { nome: 'Altura básio–bregma', estruturas: ['occipital bone', 'frontal bone', 'parietal bone'] },
  BNL: { nome: 'Comprimento da base do crânio (básio–násio)', estruturas: ['occipital bone', 'sphenoid bone', 'nasal bone'] },
  BPL: { nome: 'Comprimento básio–próstio', estruturas: ['occipital bone', 'maxilla'] },
  NPH: { nome: 'Altura facial superior (násio–próstio)', estruturas: ['maxilla', 'nasal bone'] },
  FRC: { nome: 'Corda frontal (násio–bregma)', estruturas: ['frontal bone'] },
  PAC: { nome: 'Corda parietal (bregma–lambda)', estruturas: ['parietal bone'] },
  OCC: { nome: 'Corda occipital (lambda–opístio)', estruturas: ['occipital bone'] },
  MAB: { nome: 'Largura maxiloalveolar', estruturas: ['maxilla'] },
};
function estat(filtro, v) {
  const i = cab.indexOf(v);
  const xs = linhas.filter(filtro).map((r) => +r[i]).filter((x) => x > 0);
  const media = xs.reduce((a, b) => a + b, 0) / xs.length;
  const dp = Math.sqrt(xs.reduce((a, b) => a + (b - media) ** 2, 0) / (xs.length - 1));
  return { n: xs.length, media: +media.toFixed(1), dp: +dp.toFixed(1), min: Math.min(...xs), max: Math.max(...xs) };
}
const cranio = Object.entries(MEDIDAS).map(([codigo, m]) => ({
  codigo, ...m, unidade: 'mm',
  masculino: estat((r) => r[1] === 'M', codigo),
  feminino: estat((r) => r[1] === 'F', codigo),
  masculino_japao: estat((r) => r[1] === 'M' && /JAPAN/.test(r[3]), codigo),
}));

const KIM = 'Kim SY, Lim SH, Gang SN, Kim HJ. Crown and root lengths of incisors, canines, and premolars measured by '
  + 'cone-beam computed tomography in patients with malocclusions. Korean J Orthod. 2013;43(6):271-278. '
  + 'doi:10.4041/kjod.2013.43.6.271 (acesso aberto: PMC3879283)';

const referencias = {
  gerado: new Date().toISOString().slice(0, 10),
  criterio: 'OK: |z| ≤ 2 (dentro de média ± 2 DP da referência) · ALERTA: 2 < |z| ≤ 3 · FALHA: |z| > 3. '
    + 'Tolerância percentual de cada medida = 2·DP/média.',
  fontes: {
    howells: 'Howells WW. Cranial Variation in Man. Papers of the Peabody Museum 67, 1973; Skull Shapes and the Map, '
      + 'Papers 79, 1989; Who\'s Who in Skulls, Papers 82, 1995. Dados brutos: ' + URL_HOWELLS
      + ' (2524 crânios de 28 populações; aqui: 1368 masculinos).',
    kim2013: KIM,
  },
  cranio,
  dentes: {
    fonte: 'kim2013',
    populacao: '62 pacientes coreanos com má oclusão (CBCT); valores do sexo masculino',
    definicao: 'Comprimento do dente: ponta de cúspide (borda incisal nos anteriores) ao ápice radicular. '
      + 'Raiz: junção amelocementária vestibular ao ápice.',
    // Tabela 3: média de todos os incisivos, caninos e pré-molares (os autores não publicam o total por dente)
    comprimento_total_masculino: { media: 22.83, dp: 2.55, dentes: 'incisivos, caninos e pré-molares (agrupados)' },
    coroa_masculino: { media: 10.38, dp: 1.61 },
    raiz_masculino_agrupada: { media: 13.53, dp: 1.77 },
    // Tabela 4: raiz por dente (masculino), chave = posição FDI 1–5 por arcada
    raiz_masculino: {
      superior: { 1: [12.30, 1.55], 2: [13.25, 1.20], 3: [15.83, 1.49], 4: [13.24, 1.30], 5: [13.18, 1.72] },
      inferior: { 1: [11.56, 0.87], 2: [12.75, 0.95], 3: [15.02, 1.52], 4: [13.77, 1.23], 5: [13.58, 1.11] },
    },
    sem_referencia: 'Molares (16, 17, 26, 27, 36, 37, 46, 47): nenhuma fonte de acesso aberto com valores verificáveis foi '
      + 'encontrada; ficam sem validação dimensional.',
  },
};
const OUT = path.join(ROOT, 'src', 'data', 'referencias.json');
fs.writeFileSync(OUT, JSON.stringify(referencias, null, 1));
console.log('referencias.json:', cranio.length, 'medidas cranianas;', 'dentes: Kim 2013');
for (const c of cranio) console.log(c.codigo, c.masculino.media, '±', c.masculino.dp, `(n=${c.masculino.n})`);
