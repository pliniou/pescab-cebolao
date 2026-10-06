// Leitura dos tokens do design system (src/style.css) para scripts do pipeline, como o gerador de ícones.
// O CSS é a fonte única: o pipeline nunca repete um valor de cor.

// Token de cor hexadecimal do bloco :root (tema claro) → { hex, rgb }
export function corDoToken(css, nome) {
  const raiz = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const hex = raiz.match(new RegExp(`--${nome}\\s*:\\s*(#[0-9a-fA-F]{6})\\b`))?.[1];
  if (!hex) throw new Error(`token de cor --${nome} não encontrado em :root de src/style.css`);
  return { hex: hex.toLowerCase(), rgb: [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) };
}
