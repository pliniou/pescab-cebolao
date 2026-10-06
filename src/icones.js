// Ícones de traço único (Lucide, licença ISC). Cada ícone é importado pelo nome, então só os usados entram no build.
// icone(nome) devolve o SVG como texto, para as telas montadas com template strings; o traço segue a cor do texto.
import {
  SunMoon, X, Brush, Eraser, TriangleAlert, Undo2, RotateCcw, PenLine, Check, ChevronRight, Eye, Search,
  ListChecks, Palette,
} from 'lucide';

const ICONES = {
  tema: SunMoon, fechar: X, pincel: Brush, borracha: Eraser, aviso: TriangleAlert,
  desfazer: Undo2, camera: RotateCcw, nomear: PenLine, certo: Check, errado: X, abrir: ChevronRight,
  ocultas: Eye, busca: Search, quiz: ListChecks, exercicio: Palette,
};

const atributos = (a) => Object.entries(a).map(([k, v]) => ` ${k}="${v}"`).join('');

export function icone(nome, { classe = '' } = {}) {
  const no = ICONES[nome];
  if (!no) throw new Error(`ícone desconhecido: ${nome}`);
  const filhos = no.map(([tag, a]) => `<${tag}${atributos(a)}/>`).join('');
  return `<svg class="icone${classe ? ` ${classe}` : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor"`
    + ` stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${filhos}</svg>`;
}

// Preenche os elementos estáticos do index.html marcados com data-icone="nome" (antes do texto, se houver)
export function aplicarIcones(raiz = document) {
  for (const el of raiz.querySelectorAll('[data-icone]')) el.insertAdjacentHTML('afterbegin', icone(el.dataset.icone));
}
