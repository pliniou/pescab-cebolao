// Ficha da estrutura selecionada, presa ao instrumento: nome, latim, a etiqueta de rotuladora (camada, lado, FMA),
// a fita de autoclave com o estado (listrada = conferido; lisa = a conferir), a descrição, o aviso de dimensões e as
// ações. O estado vai por forma e por texto, não só por cor.
import conformidade from '../data/conformidade.json';
import { esc } from '../util.js';
import { icone } from '../icones.js';

const FECHAR = `<button class="bt icone-so fechar" aria-label="Fechar a ficha">${icone('fechar')}</button>`;
const LADO = { D: 'Direito', E: 'Esquerdo', M: 'Mediano' };

// aoEstudar / aoTreinar: a ficha leva a estrutura para os outros modos (ver no índice do Estudar; quiz da camada dela)
export function criarInfo(el, camadas, { aoIsolar, aoFechar, aoOcultar, aoEstudar, aoTreinar } = {}) {
  let atual = null;
  function mostrar(m) {
    atual = m;
    const e = m?.userData.info;
    if (!m) { el.hidden = true; return; }
    if (!e) {
      el.innerHTML = `${FECHAR}<h2>${esc(m.userData.id)}</h2><p>Sem dados no dicionário.</p>`;
    } else {
      const etiqueta = [camadas[e.camada] || e.camada, LADO[e.lado], e.fdi && `FDI ${e.fdi}`, e.fma].filter(Boolean);
      const avisos = conformidade.avisos[e.id] || [];
      el.innerHTML = `
        ${FECHAR}
        <h2>${esc(e.pt)}</h2>
        ${e.la ? `<p class="latim">${esc(e.la)}</p>` : ''}
        <p class="meta etiqueta">${etiqueta.map(esc).join(' · ')}</p>
        <p class="fita ${e.revisar ? 'a-conferir revisar' : 'conferido'}">${e.revisar
          ? 'A conferir: nome ou descrição marcados para revisão em livro-texto'
          : 'Conferido'}</p>
        ${e.descricao ? `<p class="descricao">${esc(e.descricao)}</p>` : ''}
        ${avisos.length ? `<details class="dimensoes"><summary>${icone('aviso')}Dimensões (conferência do modelo)</summary>
          ${avisos.map((t) => `<p>${esc(t)}</p>`).join('')}
          <p class="fonte">Medidas comparadas com Howells (crânio) e Kim et al. 2013 (dentes).</p></details>` : ''}
        <p class="fonte">Fonte do modelo: ${esc(e.fonte)}</p>
        <div class="acoes">
          <button class="bt" data-acao="isolar">Isolar</button>
          <button class="bt" data-acao="ocultar">Ocultar</button>
        </div>
        ${aoEstudar || aoTreinar ? `<div class="acoes seguir">
          ${aoEstudar ? `<button class="bt lancador" data-acao="estudar">${icone('abrir')}<span>Ver no índice do Estudar</span></button>` : ''}
          ${aoTreinar ? `<button class="bt lancador" data-acao="treinar">${icone('quiz')}<span>Quiz de ${esc((camadas[e.camada] || e.camada).toLowerCase())}</span></button>` : ''}
        </div>` : ''}`;
    }
    el.hidden = false;
    // a ficha encaixa no lugar dela (a animação fica no CSS e respeita prefers-reduced-motion)
    el.classList.remove('encaixar');
    void el.offsetWidth;
    el.classList.add('encaixar');
  }
  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || !atual) return;
    if (b.classList.contains('fechar')) aoFechar?.();
    else if (b.dataset.acao === 'isolar') aoIsolar?.(atual);
    else if (b.dataset.acao === 'ocultar') aoOcultar?.(atual);
    else if (b.dataset.acao === 'estudar') aoEstudar?.(atual);
    else if (b.dataset.acao === 'treinar') aoTreinar?.(atual);
  });
  return { mostrar };
}
