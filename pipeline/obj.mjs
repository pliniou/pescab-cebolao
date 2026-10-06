// Leitura mínima de OBJ (v / f, triângulos ou polígonos) — usada pelo alinhamento e pela conversão.
import fs from 'node:fs';

export function lerObj(arquivo) {
  const pos = [];
  const idx = [];
  for (const l of fs.readFileSync(arquivo, 'utf8').split('\n')) {
    if (l.startsWith('v ')) {
      const p = l.split(/\s+/);
      pos.push(+p[1], +p[2], +p[3]);
    } else if (l.startsWith('f ')) {
      const f = l.trim().split(/\s+/).slice(1).map((t) => parseInt(t, 10) - 1);
      for (let i = 1; i < f.length - 1; i++) idx.push(f[0], f[i], f[i + 1]);
    }
  }
  return { pos: new Float64Array(pos), idx: new Uint32Array(idx) };
}
