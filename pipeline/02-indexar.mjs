// Lê o cabeçalho de cada OBJ (FJ id, FMA id, nome, bounds, nº de vértices/faces) e grava work/fj_index.json.
// Uso: node pipeline/02-indexar.mjs
import fs from 'node:fs';
import path from 'node:path';
import { OBJ_DIR, WORK } from './config.mjs';

fs.mkdirSync(WORK, { recursive: true });
const out = [];
for (const file of fs.readdirSync(OBJ_DIR).filter((f) => f.endsWith('.obj')).sort()) {
  const txt = fs.readFileSync(path.join(OBJ_DIR, file), 'utf8');
  const h = (k) => (txt.match(new RegExp(`^# ${k}[ \\t]*:[ \\t]*(.*)$`, 'm')) || [])[1]?.trim();
  const b = txt.match(/^# Bounds\(mm\):\s*\(([^)]+)\)-\(([^)]+)\)/m);
  const [min, max] = b ? [b[1], b[2]].map((s) => s.split(',').map(Number)) : [null, null];
  out.push({
    fj: path.basename(file, '.obj'),
    fma: h('Concept ID'),
    name: h('English name'),
    min, max,
    verts: (txt.match(/^v /gm) || []).length,
    faces: (txt.match(/^f /gm) || []).length,
  });
}
fs.writeFileSync(path.join(WORK, 'fj_index.json'), JSON.stringify(out, null, 1));
console.log('indexados:', out.length, '→', path.join(WORK, 'fj_index.json'));
