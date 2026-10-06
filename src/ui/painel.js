// Bandeja do Estudar: roteiros, camadas (visibilidade, raio-X e o índice de cada camada), explosão, cortes, rótulos e
// cores. Cada ferramenta tem o seu compartimento; a busca fica no Consultar (ui/consulta.js).
// O índice lista cada estrutura uma vez por linha, com os lados espelhados em torno do nome: direito à esquerda e
// esquerdo à direita, como o corpo visto de frente; nos dentes, os lados levam o número FDI (11 | 21).
import { PLANOS } from '../scene/cortes.js';
import { esc } from '../util.js';
import { icone } from '../icones.js';

const PALAVRA_LADO = /\s+(direit|esquerd)[oa]s?\b/i; // inclui plurais: "Nervos ciliares curtos direitos"
// Nome da estrutura sem o lado (e sem o FDI, que vai no botão de cada lado)
export function nomeBase(e) {
  const n = e.pt.replace(PALAVRA_LADO, '');
  return e.fdi ? n.replace(` (${e.fdi})`, '') : n;
}

// Linhas do índice de uma camada: { base, la, revisar, D, E, M } (malhas por lado), na ordem do índice
export function linhasDoIndice(malhas) {
  const porChave = new Map();
  for (const m of malhas) {
    const e = m.userData.info;
    const chave = e ? e.en : m.userData.id;
    if (!porChave.has(chave)) porChave.set(chave, { base: e ? nomeBase(e) : m.userData.id, la: e?.la || '', revisar: !!e?.revisar });
    porChave.get(chave)[e?.lado === 'D' || e?.lado === 'E' ? e.lado : 'M'] = m;
  }
  return [...porChave.values()].sort(ordemDoIndice);
}

// Dentes seguem a numeração FDI do lado direito (arcada superior 11→18, depois inferior 41→48), como no odontograma;
// o resto (e o que não tem FDI, como a gengiva, no fim) vai em ordem alfabética.
const fdiDireito = (l) => Number(l.D?.userData.info?.fdi) || Infinity;
function ordemDoIndice(a, b) {
  const fa = fdiDireito(a), fb = fdiDireito(b);
  if (fa !== fb) return fa - fb;
  return a.base.localeCompare(b.base, 'pt-BR');
}

// visibilidade: com a caixa de mostrar/ocultar (Estudar) ou só para escolher a estrutura (Consultar)
function celula(m, lado, rotulo, visibilidade) {
  const e = m.userData.info;
  return `<span class="estr ${lado}" data-id="${esc(m.userData.id)}">
      ${visibilidade ? `<input type="checkbox" class="vis-estr" aria-label="Mostrar ${esc(e?.pt || m.userData.id)}">` : ''}
      <button class="nome-estr" aria-label="${esc(e?.pt || m.userData.id)}" title="${esc(e?.la || '')}">${esc(rotulo)}</button>
      <span class="ponto"></span>
    </span>`;
}

export function linhaDoIndice(l, { visibilidade = true } = {}) {
  const cls = `par${l.M ? ' mediano' : ''}${l.revisar ? ' revisar' : ''}`;
  if (l.M) return `<li class="${cls}">${celula(l.M, 'm', l.base, visibilidade)}</li>`;
  const lado = (m, letra) => m.userData.info.fdi || letra;
  return `<li class="${cls}">${celula(l.D, 'd', lado(l.D, 'D'), visibilidade)}<span class="base" title="${esc(l.la)}">${esc(l.base)}</span>${celula(l.E, 'e', lado(l.E, 'E'), visibilidade)}</li>`;
}

// recolher(): no celular, a bandeja se recolhe depois de uma escolha que muda a cena (main.js decide)
export function criarPainel(el, { dados, modelos, ordem, selecao, cortes, rotulos, raiox, aoMudar, presets, aoPreset, recolher = () => {} }) {
  const porCamada = {};
  for (const c of ordem) porCamada[c] = [];
  for (const m of modelos.malhas.values()) porCamada[m.userData.camada]?.push(m);

  const corCss = (c) => {
    const m = porCamada[c][0];
    return m ? `#${(m.material.userData.corOriginal || m.material.userData.cor).getHexString()}` : 'transparent';
  };

  el.innerHTML = `
    <h2 class="titulo-secao">Roteiros de estudo</h2>
    <div class="compartimento roteiros">
      ${presets.map((p, i) => `<button class="bt roteiro" data-preset="${i}" title="${esc(p.nota)}">${esc(p.nome)}</button>`).join('')}
    </div>
    <p class="nota-roteiro dica" hidden></p>

    <h2 class="titulo-secao">Camadas</h2>
    <div class="compartimento camadas">
      ${ordem.map((c) => `
        <div class="camada" data-camada="${c}">
          <div class="cab">
            <input type="checkbox" class="vis-camada" aria-label="Mostrar ${esc(dados.camadas[c])}">
            <span class="cor" style="background:${corCss(c)}"></span>
            <button class="abrir" aria-expanded="false" aria-controls="conteudo-${c}">${esc(dados.camadas[c])} <span class="qtd">${porCamada[c].length}</span>${icone('abrir', { classe: 'seta' })}</button>
          </div>
          <label class="raiox">Raio-X <input type="range" min="0" max="100" value="100" class="opacidade" aria-label="Opacidade de ${esc(dados.camadas[c])}"><output>100%</output></label>
          <div class="conteudo" id="conteudo-${c}" hidden>
            <div class="acoes-camada">
              <button class="bt mini" data-acao="todas">Mostrar todas</button>
              <button class="bt mini" data-acao="nenhuma">Ocultar todas</button>
            </div>
            <ul class="lista">${linhasDoIndice(porCamada[c]).map((l) => linhaDoIndice(l)).join('')}</ul>
          </div>
        </div>`).join('')}
    </div>

    <h2 class="titulo-secao">Explosão</h2>
    <div class="compartimento">
      <label class="explosao">Afastar os ossos
        <input id="explosao" type="range" min="0" max="100" value="0" step="1">
        <output id="explosao-valor">0%</output>
      </label>
    </div>

    <h2 class="titulo-secao">Cortes</h2>
    <div class="compartimento cortes">
      ${Object.entries(PLANOS).map(([k, p]) => {
        const [a, b] = cortes.limites[k];
        return `
        <div class="corte" data-plano="${k}">
          <label class="liga"><input type="checkbox" class="ativo"> ${p.nome}</label>
          <button class="bt mini inverter" disabled title="Trocar o lado mantido">Inverter</button>
          <div class="regua" style="--cm:${((b - a) * 100).toFixed(2)}">
            <input type="range" class="pos" min="${(a * 1000).toFixed(0)}" max="${(b * 1000).toFixed(0)}" value="0" step="1" aria-label="Posição do corte ${p.nome.toLowerCase()}, em milímetros" disabled>
          </div>
          <output class="mm">0 mm</output>
          <span class="lado">mantém: ${p.menor}</span>
        </div>`;
      }).join('')}
    </div>

    <h2 class="titulo-secao">Rótulos</h2>
    <div class="compartimento">
      <label class="liga"><input type="checkbox" id="rotulos"> Rótulos das estruturas visíveis</label>
      <p class="dica">Rótulos sobrepostos ficam ocultos; aproxime a câmera ou isole estruturas para ver mais.</p>
    </div>

    <h2 class="titulo-secao">Cores e pintura</h2>
    <div class="compartimento sec-pintura"></div>
  `;

  const $ = (s) => el.querySelector(s);
  const linhas = new Map([...el.querySelectorAll('.estr[data-id]')].map((c) => [c.dataset.id, c]));
  const caixas = new Map([...linhas].map(([id, c]) => [id, c.querySelector('.vis-estr')])); // sem consulta ao DOM por estrutura a cada mudança
  const blocoCamada = (c) => el.querySelector(`.camada[data-camada="${c}"]`);

  function abrir(c, v) {
    const b = blocoCamada(c);
    b.querySelector('.conteudo').hidden = !v;
    b.querySelector('.abrir').setAttribute('aria-expanded', String(v));
    b.classList.toggle('aberta', v);
  }

  function sincronizar() {
    for (const c of ordem) {
      const b = blocoCamada(c);
      const cb = b.querySelector('.vis-camada');
      const ms = porCamada[c];
      const vis = ms.filter((m) => m.visible).length;
      cb.checked = modelos.grupos[c].visible && vis > 0;
      cb.indeterminate = modelos.grupos[c].visible && vis > 0 && vis < ms.length;
    }
    // o estado restiliza a célula (riscada, apagada, selecionada) sem mexer na grade do índice
    for (const [id, cel] of linhas) {
      const m = modelos.malhas.get(id);
      caixas.get(id).checked = m.visible;
      cel.classList.toggle('oculta', !m.visible);
      cel.classList.toggle('apagada', !modelos.grupos[m.userData.camada].visible);
      cel.classList.toggle('selecionada', selecao.selecionada === m);
    }
  }

  // Camadas
  el.querySelector('.camadas').addEventListener('click', (ev) => {
    const b = ev.target.closest('.camada');
    if (!b) return;
    const c = b.dataset.camada;
    if (ev.target.closest('.abrir')) { abrir(c, b.querySelector('.conteudo').hidden); return; }
    const acao = ev.target.closest('[data-acao]')?.dataset.acao;
    if (acao) {
      for (const m of porCamada[c]) m.visible = acao === 'todas';
      if (acao === 'todas') modelos.grupos[c].visible = true;
      aoMudar();
      return;
    }
    const nome = ev.target.closest('.nome-estr');
    if (nome) {
      const m = modelos.malhas.get(nome.closest('.estr').dataset.id);
      // camada oculta: liga a camada mostrando só a estrutura escolhida
      if (!modelos.grupos[c].visible) for (const o of porCamada[c]) o.visible = false;
      m.visible = true;
      modelos.grupos[c].visible = true;
      selecao.selecionar(m);
      aoMudar();
      recolher();
    }
  });
  el.querySelector('.camadas').addEventListener('change', (ev) => {
    const b = ev.target.closest('.camada');
    const c = b.dataset.camada;
    if (ev.target.classList.contains('vis-camada')) {
      modelos.grupos[c].visible = ev.target.checked;
      // ligar uma camada sem nenhuma estrutura visível mostra todas
      if (ev.target.checked && !porCamada[c].some((m) => m.visible)) for (const m of porCamada[c]) m.visible = true;
    } else if (ev.target.classList.contains('vis-estr')) {
      const m = modelos.malhas.get(ev.target.closest('.estr').dataset.id);
      m.visible = ev.target.checked;
      if (m.visible) modelos.grupos[c].visible = true;
    }
    aoMudar();
  });
  el.querySelector('.camadas').addEventListener('input', (ev) => {
    if (!ev.target.classList.contains('opacidade')) return;
    const c = ev.target.closest('.camada').dataset.camada;
    ev.target.nextElementSibling.textContent = `${ev.target.value}%`;
    raiox.definir(c, ev.target.value / 100);
  });

  // Cortes
  el.querySelector('.cortes').addEventListener('input', (ev) => {
    const d = ev.target.closest('.corte');
    if (!d) return;
    const k = d.dataset.plano;
    if (ev.target.classList.contains('ativo')) {
      d.querySelector('.pos').disabled = !ev.target.checked;
      d.querySelector('.inverter').disabled = !ev.target.checked;
      cortes.definir(k, { ativo: ev.target.checked });
    } else if (ev.target.classList.contains('pos')) {
      cortes.definir(k, { valor: ev.target.value / 1000 });
      d.querySelector('.mm').textContent = `${ev.target.value} mm`;
    }
  });
  el.querySelector('.cortes').addEventListener('click', (ev) => {
    if (!ev.target.classList.contains('inverter')) return;
    const d = ev.target.closest('.corte');
    const k = d.dataset.plano;
    const inv = !cortes.estado[k].inverter;
    cortes.definir(k, { inverter: inv });
    d.querySelector('.lado').textContent = `mantém: ${inv ? PLANOS[k].maior : PLANOS[k].menor}`;
  });

  // Roteiros
  el.querySelector('.roteiros').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-preset]');
    if (!b) return;
    const p = presets[b.dataset.preset];
    aoPreset(p);
    const nota = $('.nota-roteiro');
    nota.textContent = p.nota;
    nota.hidden = false;
    recolher();
  });

  // Controles (opacidade e cortes) a partir do estado — usado quando um roteiro muda tudo de uma vez
  function sincronizarControles() {
    for (const c of ordem) {
      const r = blocoCamada(c).querySelector('.opacidade');
      r.value = Math.round(raiox.valor(c) * 100);
      r.nextElementSibling.textContent = `${r.value}%`;
    }
    for (const [k, p] of Object.entries(PLANOS)) {
      const d = el.querySelector(`.corte[data-plano="${k}"]`);
      const e = cortes.estado[k];
      d.querySelector('.ativo').checked = e.ativo;
      d.querySelector('.pos').disabled = !e.ativo;
      d.querySelector('.pos').value = Math.round(e.valor * 1000);
      d.querySelector('.mm').textContent = `${d.querySelector('.pos').value} mm`;
      d.querySelector('.inverter').disabled = !e.ativo;
      d.querySelector('.lado').textContent = `mantém: ${e.inverter ? p.maior : p.menor}`;
    }
  }

  // Rótulos
  $('#rotulos').addEventListener('change', (ev) => rotulos.definir(ev.target.checked));

  // Rola até a estrutura selecionada (abre a camada se preciso)
  function mostrarSelecionada(m) {
    sincronizar();
    // com a bandeja do Estudar escondida (seleção feita no Consultar), não abre camadas que o usuário não abriu
    if (!m || el.closest('[hidden]')) return;
    const c = m.userData.camada;
    if (blocoCamada(c).querySelector('.conteudo').hidden) abrir(c, true);
    linhas.get(m.userData.id)?.scrollIntoView({ block: 'nearest' });
  }

  // Bolinha de cor de cada estrutura (só aparece quando a cor difere da natural: modo atlas ou pintura)
  function atualizarCores() {
    for (const [id, cel] of linhas) {
      const ud = modelos.malhas.get(id).material.userData;
      const igual = ud.corOriginal && ud.cor.equals(ud.corOriginal);
      cel.querySelector('.ponto').style.background = igual ? 'transparent' : `#${ud.cor.getHexString()}`;
    }
  }

  sincronizar();
  return {
    sincronizar, mostrarSelecionada, sincronizarControles, atualizarCores,
    secaoPintura: el.querySelector('.sec-pintura'),
    definirRotulos(v) { $('#rotulos').checked = v; rotulos.definir(v); },
  };
}
