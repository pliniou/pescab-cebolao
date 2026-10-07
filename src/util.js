// Utilitários compartilhados pelo app (sem dependências).

// Escapa texto para interpolar em HTML (conteúdo e atributos entre aspas duplas).
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Remove acentos (decomposição NFD + descarte das marcas combinantes).
export const semAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');

// Forma de comparação para busca: sem acentos e em minúsculas.
export const normalizar = (s) => semAcentos(s).toLowerCase();

// Visível de fato: o objeto e todos os ancestrais (a camada é o grupo pai da malha).
export const visivel = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };

// Tela baixa e deitada (celular na horizontal ao lado da peça, zoom de 200%): mesmo limite do CSS. A bandeja e a
// ficha viram uma coluna estreita à esquerda e o modelo fica com o resto, em vez de uma folha que cobriria a vista.
export const ehDeitado = () => matchMedia('(max-height: 500px) and (orientation: landscape) and (max-width: 1023px)').matches;

// Mesmo limite do CSS (style.css): abaixo dele a bandeja vira folha inferior e a ficha e as sessões ocupam o lugar
// dela; deitado, vale o layout em coluna.
export const ehCelular = () => matchMedia('(max-width: 760px)').matches && !ehDeitado();

// Desktop largo (mesmo limite do CSS): três colunas, e a ficha e as sessões têm coluna própria ao lado da vista.
export const ehLargo = () => matchMedia('(min-width: 1024px)').matches;

// Tablet em pé: a ficha e as sessões descem sobre o canto da vista, que então sobe a imagem para o espaço livre.
export const lateralSobreVista = () => !ehLargo() && !ehCelular() && !ehDeitado();

// Foco itinerante numa barra de botões (abas, régua de vistas): setas, Home e End movem o foco e uma só parada de Tab
// fica no botão focado. aoMover(botao) é chamado depois do foco (as abas trocam de modo ao mover).
export function focoItinerante(container, botoes, aoMover) {
  container.addEventListener('keydown', (ev) => {
    const i = botoes.indexOf(document.activeElement);
    if (i < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(ev.key)) return;
    ev.preventDefault();
    const n = botoes.length;
    const j = ev.key === 'Home' ? 0 : ev.key === 'End' ? n - 1 : (i + (ev.key === 'ArrowRight' ? 1 : -1) + n) % n;
    botoes[i].tabIndex = -1;
    botoes[j].tabIndex = 0;
    botoes[j].focus();
    aoMover?.(botoes[j]);
  });
}
