// Bandeja do Consultar: a tarefa principal do app. Busca com resultados instantâneos (lista densa num só corpo de
// letra; a hierarquia vem do peso e da caixa) e, com a busca vazia, o índice por camada só para escolher. Tocar num
// resultado chama aoEscolher(m): main.js mostra a estrutura, traz para o foco e abre a ficha.
import { esc, normalizar } from '../util.js';
import { icone } from '../icones.js';
import { linhasDoIndice, linhaDoIndice } from './painel.js';

const MAX_RESULTADOS = 40;
const LADO = { D: 'direito', E: 'esquerdo', M: 'mediano' };

// Ordena por relevância: número FDI exato (o dente "12" antes de qualquer código que contenha 12), nome começando pela
// busca, uma palavra do nome começando por ela, códigos (FMA, id) começando por ela e, por fim, o resto do texto
export function pontuar(e, nome, texto, codigos, q) {
  if (e.fdi === q) return 0;
  if (nome.startsWith(q)) return 1;
  if (nome.split(' ').some((p) => p.startsWith(q))) return 2;
  if (codigos.some((c) => c.startsWith(q))) return 3;
  return texto.includes(q) ? 4 : -1;
}

export function criarConsulta(el, { dados, modelos, ordem, selecao, aoEscolher }) {
  const todas = [...modelos.malhas.values()];
  const indiceBusca = new Map(todas.map((m) => {
    const e = m.userData.info || {};
    // códigos (FMA, id) só valem pelo começo: "12" não pode achar um FMA que tem 12 no meio
    return [m, {
      e,
      texto: normalizar([e.pt, e.la, e.en].filter(Boolean).join(' ')),
      nome: normalizar(e.pt || m.userData.id),
      codigos: [e.fma, m.userData.id].filter(Boolean).map((c) => normalizar(c)),
    }];
  }));
  const porCamada = Object.fromEntries(ordem.map((c) => [c, todas.filter((m) => m.userData.camada === c)]));

  el.innerHTML = `
    <div class="busca">
      <label class="campo-busca">${icone('busca')}
        <input id="busca" type="search" placeholder="Nome, latim ou nº FDI" autocomplete="off" spellcheck="false"
          enterkeyhint="search" aria-label="Buscar estrutura" aria-controls="resultados">
      </label>
    </div>
    <p class="contagem dica" aria-live="polite"></p>
    <ol id="resultados" class="resultados" hidden></ol>
    <div class="indice-consulta">
      <h2 class="titulo-secao">Por camada</h2>
      <div class="compartimento divisorias">${ordem.map((c) => `
        <details class="camada-indice" data-camada="${c}">
          <summary><span class="cor-camada">${esc(dados.camadas[c])}</span> <span class="qtd">${porCamada[c].length}</span></summary>
          <ul class="lista">${linhasDoIndice(porCamada[c]).map((l) => linhaDoIndice(l, { visibilidade: false })).join('')}</ul>
        </details>`).join('')}</div>
    </div>`;

  const campo = el.querySelector('#busca');
  const lista = el.querySelector('.resultados');
  const contagem = el.querySelector('.contagem');
  const indice = el.querySelector('.indice-consulta');

  function buscar(texto) {
    const q = normalizar(texto.trim());
    if (!q) return null;
    return todas
      .map((m) => { const b = indiceBusca.get(m); return { m, p: pontuar(b.e, b.nome, b.texto, b.codigos, q) }; })
      .filter((r) => r.p >= 0)
      .sort((a, b) => a.p - b.p || (a.m.userData.info?.pt || '').localeCompare(b.m.userData.info?.pt || '', 'pt-BR'))
      .map((r) => r.m);
  }

  function linhaResultado(m) {
    const e = m.userData.info || {};
    const meta = [dados.camadas[m.userData.camada], LADO[e.lado], e.fdi && `FDI ${e.fdi}`].filter(Boolean).join(' · ');
    return `<li><button class="resultado${e.revisar ? ' revisar' : ''}" data-id="${esc(m.userData.id)}">
        <span class="r-nome">${esc(e.pt || m.userData.id)}${e.revisar ? ' <span class="mini-fita">a conferir</span>' : ''}</span>
        ${e.la ? `<span class="r-latim">${esc(e.la)}</span>` : ''}
        <span class="r-meta">${esc(meta)}</span>
      </button></li>`;
  }

  function atualizar() {
    const achadas = buscar(campo.value);
    indice.hidden = !!achadas;
    lista.hidden = !achadas || !achadas.length;
    if (!achadas) { contagem.textContent = ''; lista.innerHTML = ''; return; }
    if (!achadas.length) {
      contagem.textContent = `Nada encontrado para "${campo.value.trim()}". Tente o nome em latim, sem o lado, ou o número FDI.`;
      lista.innerHTML = '';
      return;
    }
    const mostradas = achadas.slice(0, MAX_RESULTADOS);
    contagem.textContent = achadas.length === 1 ? '1 estrutura'
      : achadas.length > MAX_RESULTADOS ? `${achadas.length} estruturas; as ${MAX_RESULTADOS} primeiras abaixo` : `${achadas.length} estruturas`;
    lista.innerHTML = mostradas.map(linhaResultado).join('');
    marcarSelecionada();
  }

  function marcarSelecionada() {
    const id = selecao.selecionada?.userData.id;
    for (const b of el.querySelectorAll('[data-id]')) b.classList.toggle('selecionada', b.dataset.id === id);
  }

  const escolher = (id) => { const m = modelos.malhas.get(id); if (m) aoEscolher(m); };

  campo.addEventListener('input', atualizar);
  campo.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { // Enter escolhe o primeiro resultado
      const primeiro = lista.querySelector('.resultado');
      if (primeiro) { ev.preventDefault(); escolher(primeiro.dataset.id); }
    } else if (ev.key === 'ArrowDown') {
      const primeiro = lista.querySelector('.resultado');
      if (primeiro) { ev.preventDefault(); primeiro.focus(); }
    } else if (ev.key === 'Escape' && campo.value) {
      ev.preventDefault(); // este Esc só limpa a busca; o próximo (campo vazio) fecha a ficha
      campo.value = '';
      atualizar();
    }
  });
  lista.addEventListener('keydown', (ev) => {
    const atual = ev.target.closest('li');
    if (!atual) return;
    if (ev.key === 'ArrowDown') { ev.preventDefault(); atual.nextElementSibling?.querySelector('button').focus(); }
    if (ev.key === 'ArrowUp') { ev.preventDefault(); (atual.previousElementSibling?.querySelector('button') || campo).focus(); }
  });
  el.addEventListener('click', (ev) => {
    const alvo = ev.target.closest('.resultado, .nome-estr');
    if (alvo) escolher(alvo.closest('[data-id]').dataset.id);
  });

  return {
    campo,
    focar() { campo.focus({ preventScroll: true }); },
    limpar() { campo.value = ''; atualizar(); },
    marcarSelecionada,
  };
}
