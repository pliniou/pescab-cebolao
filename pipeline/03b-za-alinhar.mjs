// Fase 2c: calcula a transformação de similaridade Z-Anatomy → BodyParts3D (p_bp = s·R·p_za + t)
// por ICP sobre os ossos presentes nas duas fontes (método de Horn com quatérnios). Grava work/za_transform.json.
// Uso: node pipeline/03b-za-alinhar.mjs
import fs from 'node:fs';
import path from 'node:path';
import { CACHE, OBJ_DIR, WORK, lerJson } from './config.mjs';
import { ZA_AJUSTE } from './catalogo.mjs';
import { lerObj } from './obj.mjs';

const index = lerJson(path.join(WORK, 'fj_index.json'), 'node pipeline/02-indexar.mjs');
const arquivo = (n) => 'ZA_' + n.replace(/[^A-Za-z0-9]+/g, '_').replace(/_+$/, '');

// Pares de nuvens de pontos (cada osso só casa com o mesmo osso)
// ALINHAR_SO="Mandible" restringe a um osso (diagnóstico; não grava o arquivo)
const SO = process.env.ALINHAR_SO;
const pares = ZA_AJUSTE.filter(([, bp]) => !SO || bp === SO).map(([za, bp]) => {
  const fj = index.find((e) => e.name === bp);
  return { nome: bp, za: lerObj(path.join(CACHE, 'za_obj', arquivo(za) + '.obj')).pos, bp: lerObj(path.join(OBJ_DIR, fj.fj + '.obj')).pos };
});

// Grade espacial para vizinho mais próximo
function grade(pos, cel = 4) {
  const g = new Map();
  for (let i = 0; i < pos.length; i += 3) {
    const k = `${Math.floor(pos[i] / cel)},${Math.floor(pos[i + 1] / cel)},${Math.floor(pos[i + 2] / cel)}`;
    (g.get(k) || g.set(k, []).get(k)).push(i);
  }
  return { g, cel, pos };
}
function maisProximo({ g, cel, pos }, x, y, z) {
  const cx = Math.floor(x / cel), cy = Math.floor(y / cel), cz = Math.floor(z / cel);
  let best = -1, bd = Infinity;
  for (let r = 0; r <= 4 && (best < 0 || r <= 1); r++) {
    for (let i = cx - r; i <= cx + r; i++) for (let j = cy - r; j <= cy + r; j++) for (let k = cz - r; k <= cz + r; k++) {
      if (Math.max(Math.abs(i - cx), Math.abs(j - cy), Math.abs(k - cz)) !== r) continue;
      for (const n of g.get(`${i},${j},${k}`) || []) {
        const d = (pos[n] - x) ** 2 + (pos[n + 1] - y) ** 2 + (pos[n + 2] - z) ** 2;
        if (d < bd) { bd = d; best = n; }
      }
    }
  }
  return [best, Math.sqrt(bd)];
}

// Autovetor do maior autovalor de matriz simétrica 4×4 (Jacobi)
function autovetorMax(A) {
  const n = 4, a = A.map((r) => r.slice()), v = [...Array(n)].map((_, i) => [...Array(n)].map((_, j) => +(i === j)));
  for (let it = 0; it < 100; it++) {
    let p = 0, q = 1, m = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(a[i][j]) > m) { m = Math.abs(a[i][j]); p = i; q = j; }
    if (m < 1e-12) break;
    const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
    const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
    for (let k = 0; k < n; k++) {
      const akp = a[k][p], akq = a[k][q];
      a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq;
    }
    for (let k = 0; k < n; k++) {
      const apk = a[p][k], aqk = a[q][k];
      a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk;
    }
    for (let k = 0; k < n; k++) {
      const vkp = v[k][p], vkq = v[k][q];
      v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq;
    }
  }
  let im = 0;
  for (let i = 1; i < n; i++) if (a[i][i] > a[im][im]) im = i;
  return v.map((r) => r[im]);
}

// Horn (1987): similaridade que leva os pontos A nos pontos B
function horn(A, B) {
  const N = A.length / 3, ca = [0, 0, 0], cb = [0, 0, 0];
  for (let i = 0; i < A.length; i++) { ca[i % 3] += A[i] / N; cb[i % 3] += B[i] / N; }
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  let sa = 0, sb = 0;
  for (let i = 0; i < A.length; i += 3) {
    const a = [A[i] - ca[0], A[i + 1] - ca[1], A[i + 2] - ca[2]], b = [B[i] - cb[0], B[i + 1] - cb[1], B[i + 2] - cb[2]];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) S[r][c] += a[r] * b[c];
    sa += a[0] ** 2 + a[1] ** 2 + a[2] ** 2; sb += b[0] ** 2 + b[1] ** 2 + b[2] ** 2;
  }
  const [[xx, xy, xz], [yx, yy, yz], [zx, zy, zz]] = S;
  const q = autovetorMax([
    [xx + yy + zz, yz - zy, zx - xz, xy - yx],
    [yz - zy, xx - yy - zz, xy + yx, zx + xz],
    [zx - xz, xy + yx, -xx + yy - zz, yz + zy],
    [xy - yx, zx + xz, yz + zy, -xx - yy + zz],
  ]);
  const [w, x, y, z] = q;
  const R = [
    [w * w + x * x - y * y - z * z, 2 * (x * y - w * z), 2 * (x * z + w * y)],
    [2 * (x * y + w * z), w * w - x * x + y * y - z * z, 2 * (y * z - w * x)],
    [2 * (x * z - w * y), 2 * (y * z + w * x), w * w - x * x - y * y + z * z],
  ];
  const s = Math.sqrt(sb / sa); // escala simétrica de Horn
  const t = [0, 1, 2].map((r) => cb[r] - s * (R[r][0] * ca[0] + R[r][1] * ca[1] + R[r][2] * ca[2]));
  return { s, R, t };
}

const aplicar = ({ s, R, t }, x, y, z) => [0, 1, 2].map((r) => s * (R[r][0] * x + R[r][1] * y + R[r][2] * z) + t[r]);

// Inicialização pelas caixas (escala ~1,025 e translação)
let T = { s: 1, R: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], t: [0, 0, 0] };
{
  const A = [], B = [];
  for (const p of pares) {
    const bb = (pos) => [0, 1, 2].map((i) => { let mn = Infinity, mx = -Infinity; for (let k = i; k < pos.length; k += 3) { mn = Math.min(mn, pos[k]); mx = Math.max(mx, pos[k]); } return [mn, mx]; });
    const a = bb(p.za), b = bb(p.bp);
    for (const sel of [0, 1]) { A.push(...a.map((v) => v[sel])); B.push(...b.map((v) => v[sel])); }
  }
  T = horn(A, B);
}
for (const p of pares) p.grade = grade(p.bp);

function residuo(T, amostra = 3) {
  const ds = [];
  const por = {};
  for (const p of pares) {
    const d = [];
    for (let i = 0; i < p.za.length; i += 3 * amostra) d.push(maisProximo(p.grade, ...aplicar(T, p.za[i], p.za[i + 1], p.za[i + 2]))[1]);
    d.sort((a, b) => a - b);
    por[p.nome] = +d[d.length >> 1].toFixed(2);
    ds.push(...d);
  }
  ds.sort((a, b) => a - b);
  return { mediana: +ds[ds.length >> 1].toFixed(2), p90: +ds[Math.floor(ds.length * 0.9)].toFixed(2), por };
}

console.log('inicial (caixas):', JSON.stringify(residuo(T)));
for (let it = 0; it < 30; it++) {
  const A = [], B = [];
  for (const p of pares) {
    for (let i = 0; i < p.za.length; i += 6) {
      const q = aplicar(T, p.za[i], p.za[i + 1], p.za[i + 2]);
      const [n, d] = maisProximo(p.grade, ...q);
      if (n >= 0 && d < 8) { A.push(p.za[i], p.za[i + 1], p.za[i + 2]); B.push(p.bp[n], p.bp[n + 1], p.bp[n + 2]); }
    }
  }
  const novo = horn(A, B);
  const dt = Math.hypot(...novo.t.map((v, i) => v - T.t[i])) + Math.abs(novo.s - T.s) * 1000;
  T = novo;
  if (dt < 1e-3) break;
}
const fim = residuo(T, 1);
console.log('após ICP:', JSON.stringify(fim));
console.log('escala', T.s.toFixed(4), 'translação', T.t.map((v) => v.toFixed(1)).join(', '));
if (!SO) fs.writeFileSync(path.join(WORK, 'za_transform.json'), JSON.stringify({ ...T, residuo: fim }, null, 1));
