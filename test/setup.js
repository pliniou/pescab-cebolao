// Preparação dos testes: o happy-dom não carrega o src/style.css, mas o 3D lê cores dos tokens (scene/tema3d.js).
// Os tokens do tema claro são lidos do próprio CSS e aplicados ao documento: a fonte única continua sendo o CSS.
import fs from 'node:fs';
import path from 'node:path';

if (typeof document !== 'undefined') {
  const css = fs.readFileSync(path.resolve(import.meta.dirname, '../src/style.css'), 'utf8');
  const raiz = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  for (const [, nome, valor] of raiz.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    document.documentElement.style.setProperty(nome, valor.trim());
  }
}
