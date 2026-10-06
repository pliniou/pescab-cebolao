// Utilitários compartilhados pelo app (sem dependências).

// Escapa texto para interpolar em HTML (conteúdo e atributos entre aspas duplas).
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Remove acentos (decomposição NFD + descarte das marcas combinantes).
export const semAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');

// Forma de comparação para busca: sem acentos e em minúsculas.
export const normalizar = (s) => semAcentos(s).toLowerCase();

// Visível de fato: o objeto e todos os ancestrais (a camada é o grupo pai da malha).
export const visivel = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };

// Mesmo limite do CSS (style.css): abaixo dele o painel vira gaveta e os cartões ocupam a parte de baixo.
export const ehCelular = () => matchMedia('(max-width: 760px)').matches;

// Desktop largo (mesmo limite do CSS): os cartões dos modos ficam na margem direita da prancha, como a legenda.
export const ehLargo = () => matchMedia('(min-width: 1024px)').matches;
