// Gera os ícones do app (crânio estilizado) em public/icons, sem dependências externas: PNG do PWA, favicon.svg e
// atlas.ico (atalho da área de trabalho). As cores vêm dos tokens do tema claro em src/style.css (fonte única do
// design system): fundo no verde-azulado do campo, crânio em aço, traços em tinta.
// Uso: node pipeline/icones.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ROOT } from './config.mjs';
import { corDoToken } from './tokens.mjs';

const OUT = path.join(ROOT, 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const css = fs.readFileSync(path.join(ROOT, 'src', 'style.css'), 'utf8');
const FUNDO = corDoToken(css, 'campo-borda'), CRANIO = corDoToken(css, 'aco'), TRACO = corDoToken(css, 'tinta');
const AZUL = FUNDO.rgb, BRANCO = CRANIO.rgb, ESCURO = TRACO.rgb;

// Formas em coordenadas 0..1; retorna a cor do pixel (ou null = transparente)
function cena(x, y, { cantos, escala }) {
  // fundo
  const r = cantos;
  const dx = Math.max(r - x, x - (1 - r), 0), dy = Math.max(r - y, y - (1 - r), 0);
  if (r > 0 && dx * dx + dy * dy > r * r) return null;
  // crânio (coordenadas centradas e escaladas)
  const u = (x - 0.5) / escala + 0.5, v = (y - 0.5) / escala + 0.5;
  const dentro = (cx, cy, rx, ry) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;
  const caixa = (x0, y0, x1, y1) => u >= x0 && u <= x1 && v >= y0 && v <= y1;
  const cranio = dentro(0.5, 0.42, 0.3, 0.29) || caixa(0.32, 0.5, 0.68, 0.66) || caixa(0.36, 0.6, 0.64, 0.8);
  if (!cranio) return AZUL;
  const olho = dentro(0.39, 0.48, 0.075, 0.07) || dentro(0.61, 0.48, 0.075, 0.07);
  const nariz = v >= 0.55 && v <= 0.63 && Math.abs(u - 0.5) <= (v - 0.55) * 0.45;
  const dentes = v >= 0.7 && v <= 0.8 && [0.43, 0.5, 0.57].some((c) => Math.abs(u - c) < 0.008);
  const boca = Math.abs(v - 0.7) < 0.008 && u > 0.36 && u < 0.64;
  if (olho || nariz || dentes || boca) return ESCURO;
  return BRANCO;
}

function png(tam, opcoes) {
  const SS = 4;
  const linhas = Buffer.alloc((tam * 4 + 1) * tam);
  for (let py = 0; py < tam; py++) {
    linhas[py * (tam * 4 + 1)] = 0;
    for (let px = 0; px < tam; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const c = cena((px + (sx + 0.5) / SS) / tam, (py + (sy + 0.5) / SS) / tam, opcoes);
        if (!c) continue;
        r += c[0]; g += c[1]; b += c[2]; a += 255;
      }
      const n = SS * SS;
      const o = py * (tam * 4 + 1) + 1 + px * 4;
      // cor média das amostras opacas; alfa = fração coberta
      linhas[o] = a ? Math.round(r / (a / 255)) : 0;
      linhas[o + 1] = a ? Math.round(g / (a / 255)) : 0;
      linhas[o + 2] = a ? Math.round(b / (a / 255)) : 0;
      linhas[o + 3] = Math.round(a / n);
    }
  }
  const crcTab = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (buf) => { let c = 0xffffffff; for (const x of buf) c = crcTab[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const bloco = (tipo, dados) => {
    const t = Buffer.from(tipo);
    const len = Buffer.alloc(4); len.writeUInt32BE(dados.length);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, dados])));
    return Buffer.concat([len, t, dados, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tam, 0); ihdr.writeUInt32BE(tam, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    bloco('IHDR', ihdr), bloco('IDAT', zlib.deflateSync(linhas, { level: 9 })), bloco('IEND', Buffer.alloc(0)),
  ]);
}

const ARQS = [
  ['icon-192.png', 192, { cantos: 0.18, escala: 0.95 }],
  ['icon-512.png', 512, { cantos: 0.18, escala: 0.95 }],
  ['maskable-512.png', 512, { cantos: 0, escala: 0.72 }],   // zona segura do ícone adaptável (Android)
  ['apple-touch-icon.png', 180, { cantos: 0, escala: 0.85 }], // iOS arredonda sozinho
];
for (const [nome, tam, o] of ARQS) {
  fs.writeFileSync(path.join(OUT, nome), png(tam, o));
  console.log(nome, tam);
}

// ICO com as imagens em PNG (formato aceito pelo Windows desde o Vista): 16, 32, 48 e 256 px
function ico(tamanhos, opcoes) {
  const imagens = tamanhos.map((t) => png(t, opcoes));
  const cab = Buffer.alloc(6);
  cab.writeUInt16LE(0, 0); cab.writeUInt16LE(1, 2); cab.writeUInt16LE(imagens.length, 4);
  let deslocamento = 6 + 16 * imagens.length;
  const entradas = imagens.map((img, i) => {
    const e = Buffer.alloc(16), t = tamanhos[i];
    e[0] = t >= 256 ? 0 : t; e[1] = t >= 256 ? 0 : t; // 0 = 256
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);      // planos, bits por pixel
    e.writeUInt32LE(img.length, 8); e.writeUInt32LE(deslocamento, 12);
    deslocamento += img.length;
    return e;
  });
  return Buffer.concat([cab, ...entradas, ...imagens]);
}
fs.writeFileSync(path.join(OUT, 'atlas.ico'), ico([16, 32, 48, 256], { cantos: 0.18, escala: 0.95 }));
console.log('atlas.ico');

fs.writeFileSync(path.join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" rx="18" fill="${FUNDO.hex}"/>
<g fill="${CRANIO.hex}"><ellipse cx="50" cy="42" rx="28.5" ry="27.5"/><rect x="33" y="50" width="34" height="15"/><rect x="36.5" y="60" width="27" height="19"/></g>
<g fill="${TRACO.hex}"><ellipse cx="39.5" cy="47.5" rx="7" ry="6.6"/><ellipse cx="60.5" cy="47.5" rx="7" ry="6.6"/><path d="M50 55 L54 63 L46 63 Z"/>
<rect x="36" y="69" width="28" height="1.6"/><rect x="42.5" y="69" width="1.5" height="10"/><rect x="49.3" y="69" width="1.5" height="10"/><rect x="56" y="69" width="1.5" height="10"/></g>
</svg>
`);
console.log('favicon.svg');
