// Quiz: "clique na estrutura" e múltipla escolha (4 opções), filtro por camadas, placar,
// refazer as erradas e estatísticas salvas no localStorage.
// Estruturas marcadas "revisar" no dicionário ficam de fora (nome ainda não conferido).
import * as THREE from 'three';
import { esc } from '../util.js';
import { ehGengiva } from '../scene/modelos.js';
import { icone } from '../icones.js';
import { corDoTema } from '../scene/tema3d.js';

const CHAVE = 'atlas-quiz-v1';
// Cores do 3D pelos tokens do CSS (scene/tema3d.js): --certo e --errado (as tintas da interface) e --pergunta-3d
// (o magenta que contrasta com todas as camadas)
const PRETO = new THREE.Color(0);

const embaralhar = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Dados salvos no aparelho, validados campo a campo: um formato inesperado (versão antiga, edição manual, gravação
// interrompida) é descartado em vez de travar a tela do quiz
// porId[id] = [acertos, erros, quando] (quando: data da última resposta; ausente nos dados antigos, que continuam valendo)
const contagem = (v) => Array.isArray(v) && v.length >= 2 && v.slice(0, 2).every((n) => Number.isInteger(n) && n >= 0);
const registro = (v) => (Number.isFinite(v[2]) ? v.slice(0, 3) : v.slice(0, 2));
const sessao = (h) => h && typeof h === 'object' && Number.isFinite(h.data) && Number.isInteger(h.acertos) && Number.isInteger(h.total) && h.total > 0;
function lerDados() {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch {}
  const porId = {};
  if (d.porId && typeof d.porId === 'object') for (const [id, v] of Object.entries(d.porId)) if (contagem(v)) porId[id] = registro(v);
  return {
    porId,
    erradas: Array.isArray(d.erradas) ? d.erradas.filter((id) => typeof id === 'string') : [],
    historico: Array.isArray(d.historico) ? d.historico.filter(sessao) : [],
  };
}
// Revisão: as estruturas em que você mais erra (erros menos acertos) primeiro; entre as empatadas, a que você viu há
// mais tempo vem antes (sem data = vista há muito tempo). Só entra quem ainda tem saldo de erros: acertar a mesma
// estrutura tantas vezes quanto errou tira ela da lista. valida(id) filtra o que ainda existe e pode ser perguntado.
export function revisao(porId, valida = () => true) {
  return Object.entries(porId)
    .filter(([id, [a, e]]) => e - a > 0 && valida(id))
    .sort(([, x], [, y]) => (y[1] - y[0]) - (x[1] - x[0]) || (x[2] ?? 0) - (y[2] ?? 0))
    .map(([id]) => id);
}

function gravar(d) { try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch {} }

export function criarQuiz(el, { dados, modelos, ordem, viewer, selecao, raiox, aoIniciar, aoSair }) {
  const elegivel = (m) => m.userData.info && !m.userData.info.revisar && !ehGengiva(m);
  let cfg = { modo: 'clique', camadas: ['ossos'], qtd: 10 };
  let st = null;       // sessão: { fila, i, acertos, erradas, respondida, opcoes }
  let marcadas = [];   // { m, token, intensidade }: malhas com a cor de um token (refeitas ao trocar o tema)
  let pulso = null;    // { m, t }: a estrutura perguntada pulsa alguns ciclos para chamar o olhar e assenta
  let fantasmas = [];  // malhas translúcidas por fantasma(); voltam ao raio-X da camada

  // ---------- efeitos visuais ----------
  // token: nome do token de cor no CSS ('certo', 'errado', 'pergunta-3d')
  function pintar({ m, token, intensidade }) {
    corDoTema(token, m.material.color);
    m.material.emissive.copy(m.material.color);
    m.material.emissiveIntensity = intensidade;
  }
  function marcar(m, token, intensidade = 0.45) {
    const marca = { m, token, intensidade };
    pintar(marca);
    marcadas.push(marca);
  }
  function limparMarcas() {
    for (const { m } of marcadas) {
      m.material.color.copy(m.material.userData.cor);
      m.material.emissive.copy(PRETO);
      m.material.emissiveIntensity = 1;
    }
    marcadas = [];
    pulso = null;
    for (const m of fantasmas) raiox.restaurarMalha(m);
    fantasmas = [];
  }
  // Deixa tudo o que não é o alvo translúcido, para o alvo nunca ficar escondido
  function fantasma(alvo) {
    for (const m of modelos.malhas.values()) {
      if (m === alvo || !m.visible) continue;
      fantasmas.push(m);
      m.material.opacity = Math.min(m.material.opacity, 0.22);
      m.material.transparent = true;
      m.material.depthWrite = false;
      m.material.needsUpdate = true;
    }
  }
  // Pulso: ~3 ciclos e assenta no brilho da marca (a cena volta a ficar parada, sem redesenhar a cada quadro); com
  // movimento reduzido, a estrutura fica só com o brilho fixo
  const PULSO = 3.5; // s
  viewer.tarefas.add((dt) => {
    if (!pulso) return false;
    pulso.t += dt;
    const fim = pulso.t >= PULSO || matchMedia('(prefers-reduced-motion: reduce)').matches;
    pulso.m.material.emissiveIntensity = fim ? 0.55 : 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(pulso.t * 5.6));
    if (fim) pulso = null;
    return true;
  });
  // aproxima a câmera da estrutura (com margem para mostrar o contexto), mantendo a direção atual
  const enquadrar = (m) => viewer.enquadrarCaixa(new THREE.Box3().setFromObject(m).expandByScalar(0.035));

  // ---------- telas ----------
  function telaConfig() {
    const d = lerDados();
    const pool = (cs) => [...modelos.malhas.values()].filter((m) => cs.includes(m.userData.camada) && elegivel(m));
    const paraRevisar = revisao(d.porId, (id) => modelos.malhas.has(id) && elegivel(modelos.malhas.get(id)));
    const piores = paraRevisar.slice(0, 5).map((id) => modelos.malhas.get(id).userData.info.pt);
    const ult = d.historico.at(-1);
    const erradasSalvas = d.erradas.filter((id) => modelos.malhas.has(id) && elegivel(modelos.malhas.get(id)));
    el.innerHTML = `
      <button class="bt icone-so fechar" data-acao="sair" aria-label="Fechar quiz">${icone('fechar')}</button>
      <h2>Quiz</h2>
      <fieldset><legend>Modo</legend>
        <label class="liga"><input type="radio" name="modo" value="clique" ${cfg.modo === 'clique' ? 'checked' : ''}> Clique na estrutura</label>
        <label class="liga"><input type="radio" name="modo" value="multipla" ${cfg.modo === 'multipla' ? 'checked' : ''}> Múltipla escolha (4 opções)</label>
        <label class="liga"><input type="radio" name="modo" value="misto" ${cfg.modo === 'misto' ? 'checked' : ''}> Misto</label>
      </fieldset>
      <fieldset><legend>Camadas</legend>
        <div class="grade-camadas">
        ${ordem.map((c) => `<label class="liga"><input type="checkbox" name="camada" value="${c}" ${cfg.camadas.includes(c) ? 'checked' : ''}> ${esc(dados.camadas[c])} <span class="qtd">${pool([c]).length}</span></label>`).join('')}
        </div>
      </fieldset>
      <label class="liga">Perguntas
        <select name="qtd">${[10, 20, 30, 0].map((n) => `<option value="${n}" ${cfg.qtd === n ? 'selected' : ''}>${n || 'todas'}</option>`).join('')}</select>
      </label>
      <p class="dica sem-camada" hidden>Marque pelo menos uma camada para começar.</p>
      <div class="acoes fixas">
        <button class="bt primario" data-acao="comecar">Começar</button>
        ${erradasSalvas.length ? `<button class="bt" data-acao="erradas-salvas">Refazer as ${erradasSalvas.length} erradas da última vez</button>` : ''}
        ${paraRevisar.length ? `<button class="bt" data-acao="revisar">Revisar o que mais erro (${paraRevisar.length})</button>` : ''}
      </div>
      ${ult ? `<p class="dica">Último quiz${ult.parcial ? ' (interrompido)' : ''}: ${ult.acertos}/${ult.total} (${Math.round(100 * ult.acertos / ult.total)}%) em ${new Date(ult.data).toLocaleDateString('pt-BR')}.</p>` : ''}
      ${piores.length ? `<p class="dica">Você mais erra: ${piores.map(esc).join('; ')}.</p>` : ''}
      <p class="dica">Clique na estrutura pede mouse ou toque; pelo teclado, use a múltipla escolha.</p>
      <p class="dica">Itens marcados para revisão no dicionário não entram no quiz.</p>`;
    conferirCamadas();
  }
  // Sem camada marcada não há o que perguntar: o Começar desliga e a dica diz por quê
  function conferirCamadas() {
    const alguma = !!el.querySelector('input[name="camada"]:checked');
    const bt = el.querySelector('[data-acao="comecar"]');
    if (bt) bt.disabled = !alguma;
    const aviso = el.querySelector('.sem-camada');
    if (aviso) aviso.hidden = alguma;
  }
  el.addEventListener('change', (ev) => { if (ev.target.name === 'camada') conferirCamadas(); });

  function lerConfig() {
    const modo = el.querySelector('input[name="modo"]:checked').value;
    const camadas = [...el.querySelectorAll('input[name="camada"]:checked')].map((i) => i.value);
    const qtd = Number(el.querySelector('select[name="qtd"]').value);
    cfg = { modo, camadas, qtd };
  }

  function comecar(ids) {
    let fila;
    if (ids) fila = ids.map((id) => modelos.malhas.get(id)).filter((m) => m && elegivel(m));
    else {
      fila = [...modelos.malhas.values()].filter((m) => cfg.camadas.includes(m.userData.camada) && elegivel(m));
      embaralhar(fila);
      if (cfg.qtd) fila = fila.slice(0, cfg.qtd);
    }
    if (!fila.length) { conferirCamadas(); return; } // o Começar já fica desligado sem camada; aqui é só a garantia
    const camadas = ids ? [...new Set(fila.map((m) => m.userData.camada))] : cfg.camadas;
    aoIniciar(camadas);
    st = { fila, i: 0, acertos: 0, erradas: [], camadas, respostas: [], raiox: false };
    selecao.interceptar = tocar;
    pergunta();
  }

  // Grava a sessão: as erradas (para "Refazer") e uma linha no histórico. Uma sessão interrompida (troca de aba,
  // fechar no meio) grava o que já foi respondido, marcada como parcial; sem nenhuma resposta, nada muda.
  function gravarSessao(parcial) {
    if (!st || st.gravada || !st.respostas.length) return;
    st.gravada = true;
    const d = lerDados();
    d.erradas = st.erradas;
    const total = parcial ? st.respostas.length : st.fila.length;
    d.historico = [...d.historico, { data: Date.now(), acertos: st.acertos, total, modo: cfg.modo, ...(parcial && { parcial: true }) }].slice(-30);
    gravar(d);
  }

  function modoDa(i) {
    if (cfg.modo !== 'misto') return cfg.modo;
    return i % 2 ? 'multipla' : 'clique';
  }

  // título da pergunta e, logo abaixo dele, o progresso (nada de rótulo acima do título)
  function cabecalho(titulo) {
    return `<button class="bt icone-so fechar" data-acao="sair" aria-label="Sair do quiz">${icone('fechar')}</button>
      <h2>${titulo}</h2>
      <p class="placar">Pergunta ${st.i + 1} de ${st.fila.length} · acertos: ${st.acertos}</p>`;
  }
  // Nada some no treino: cada resposta da sessão fica carimbada (Certo / Errado), da mais recente para a mais antiga
  function carimbos() {
    if (!st.respostas.length) return '';
    return `<ol class="carimbos" aria-label="Respostas desta sessão">${[...st.respostas].reverse().map((r) => `
      <li><span class="carimbo ${r.certo ? 'certo' : 'errado'}">${r.certo ? 'Certo' : 'Errado'}</span> ${esc(r.pt)}</li>`).join('')}</ol>`;
  }
  // Raio-X da prova: deixa translúcidas as camadas do quiz para alcançar estruturas profundas (o modo restaura ao sair)
  function aplicarRaioX() {
    for (const c of st.camadas) raiox.definir(c, st.raiox ? 0.35 : 1);
  }

  function pergunta() {
    limparMarcas();
    const alvo = st.fila[st.i];
    st.respondida = false;
    st.modo = modoDa(st.i);
    // o alvo sempre visível (mesmo que o usuário tenha ocultado antes)
    alvo.visible = true;
    modelos.grupos[alvo.userData.camada].visible = true;
    if (st.modo === 'clique') {
      el.innerHTML = `${cabecalho(`Clique em: <span class="alvo-nome">${esc(alvo.userData.info.pt)}</span>`)}
        <p class="dica">Gire e aproxime à vontade. Para estruturas profundas, ligue o Raio-X.</p>
        <p class="retorno" aria-live="polite"></p>
        <div class="acoes">
          <button class="bt" data-acao="nao-sei">Não sei</button>
          <button class="bt" data-acao="raiox" aria-pressed="${st.raiox}">Raio-X</button>
        </div>
        ${carimbos()}`;
      focarTitulo();
    } else {
      const mesmas = [...modelos.malhas.values()].filter((m) => m !== alvo && elegivel(m) && m.userData.info.pt !== alvo.userData.info.pt);
      const daCamada = embaralhar(mesmas.filter((m) => m.userData.camada === alvo.userData.camada));
      const outras = embaralhar(mesmas.filter((m) => m.userData.camada !== alvo.userData.camada));
      // no máximo uma opção que seja a mesma estrutura do outro lado
      const base = (m) => m.userData.info.en;
      let lado = 0;
      const distratores = [];
      for (const m of [...daCamada, ...outras]) {
        if (distratores.length === 3) break;
        if (base(m) === base(alvo)) { if (lado++) continue; }
        if (distratores.some((d) => d.userData.info.pt === m.userData.info.pt)) continue;
        distratores.push(m);
      }
      st.opcoes = embaralhar([alvo, ...distratores]);
      fantasma(alvo);
      marcar(alvo, 'pergunta-3d');
      pulso = { m: alvo, t: 0 };
      enquadrar(alvo);
      el.innerHTML = `${cabecalho('Qual é a estrutura destacada?')}
        <div class="opcoes">${st.opcoes.map((m, k) => `<button class="bt opcao" data-opcao="${k}">${esc(m.userData.info.pt)}</button>`).join('')}</div>
        <p class="retorno" aria-live="polite"></p>
        ${carimbos()}`;
      el.querySelector('.opcao')?.focus(); // múltipla escolha: o teclado já começa nas opções
    }
  }
  // a cada pergunta nova o foco vai para o título (o innerHTML apagaria o foco e ele cairia no body)
  function focarTitulo() {
    const h = el.querySelector('h2');
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
  }

  function registrar(certo) {
    const alvo = st.fila[st.i];
    const d = lerDados();
    const id = alvo.userData.id;
    const [a, e] = d.porId[id] || [0, 0];
    d.porId[id] = certo ? [a + 1, e, Date.now()] : [a, e + 1, Date.now()];
    gravar(d);
    if (certo) st.acertos++; else st.erradas.push(id);
    st.respostas.push({ pt: alvo.userData.info.pt, certo });
    st.respondida = true;
  }

  function revelar(certo, clicada) {
    const alvo = st.fila[st.i];
    limparMarcas();
    marcar(alvo, 'certo');
    if (clicada && clicada !== alvo) marcar(clicada, 'errado');
    fantasma(alvo);
    if (!certo) enquadrar(alvo);
    const r = el.querySelector('.retorno');
    r.className = `retorno ${certo ? 'certo' : 'errado'}`;
    r.innerHTML = certo ? `${icone('certo')}Correto!`
      : `${icone('errado')}${clicada ? `Você marcou: <b>${esc(clicada.userData.info?.pt || clicada.userData.id)}</b>. ` : ''}A resposta é <b>${esc(alvo.userData.info.pt)}</b>, destacada no modelo.`;
    const acoes = el.querySelector('.acoes') || el.appendChild(Object.assign(document.createElement('div'), { className: 'acoes' }));
    acoes.innerHTML = `<button class="bt primario" data-acao="proxima">${st.i + 1 < st.fila.length ? 'Próxima' : 'Ver resultado'}</button>`;
    acoes.querySelector('button').focus();
    // a resposta entra carimbada na fila da sessão
    el.querySelector('.carimbos')?.remove();
    acoes.insertAdjacentHTML('afterend', carimbos());
  }

  // Toque na cena durante o quiz
  function tocar(hits) {
    if (!st) return true; // tela de configuração aberta: cliques na cena não selecionam
    if (st.modo !== 'clique' || st.respondida) return true; // ignora cliques fora do modo "clique"
    const daProva = hits.filter((h) => st.camadas.includes(h.object.userData.camada));
    if (!daProva.length) {
      const r = el.querySelector('.retorno');
      if (r) { r.className = 'retorno'; r.textContent = hits.length ? 'Essa estrutura não faz parte deste quiz; tente de novo.' : ''; }
      return true;
    }
    const m = (daProva.find((h) => h.object.material.opacity >= 0.5) || daProva[0]).object;
    const certo = m === st.fila[st.i];
    registrar(certo);
    revelar(certo, m);
    return true;
  }

  function fim() {
    limparMarcas();
    gravarSessao(false);
    const pct = Math.round(100 * st.acertos / st.fila.length);
    el.innerHTML = `
      <button class="bt icone-so fechar" data-acao="sair" aria-label="Fechar quiz">${icone('fechar')}</button>
      <h2>Resultado: ${st.acertos} de ${st.fila.length} (${pct}%)</h2>
      ${st.erradas.length ? `<h3>Erradas</h3><ul class="erradas">${st.erradas.map((id) => `<li>${esc(modelos.malhas.get(id).userData.info.pt)}</li>`).join('')}</ul>` : '<p>Gabaritou!</p>'}
      <div class="acoes">
        ${st.erradas.length ? '<button class="bt primario" data-acao="refazer">Refazer as erradas</button>' : ''}
        <button class="bt" data-acao="novo">Novo quiz</button>
        <button class="bt" data-acao="sair">Sair</button>
      </div>`;
  }

  function sair() {
    gravarSessao(true);
    limparMarcas();
    selecao.interceptar = null;
    st = null;
    el.hidden = true;
    aoSair();
  }

  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const acao = b.dataset.acao;
    if (acao === 'sair') sair();
    else if (acao === 'comecar') { lerConfig(); comecar(); }
    else if (acao === 'erradas-salvas') { lerConfig(); comecar(lerDados().erradas); }
    else if (acao === 'revisar') {
      lerConfig();
      const ids = revisao(lerDados().porId, (id) => modelos.malhas.has(id) && elegivel(modelos.malhas.get(id)));
      comecar(cfg.qtd ? ids.slice(0, cfg.qtd) : ids); // na ordem da revisão: o mais urgente primeiro
    }
    else if (acao === 'refazer') { const ids = st.erradas; comecar(embaralhar([...ids])); }
    else if (acao === 'novo') { st = null; telaConfig(); }
    else if (acao === 'nao-sei' && st && !st.respondida) { registrar(false); revelar(false, null); }
    else if (acao === 'raiox' && st) { st.raiox = !st.raiox; b.setAttribute('aria-pressed', String(st.raiox)); aplicarRaioX(); }
    else if (acao === 'proxima') { st.i++; if (st.i < st.fila.length) pergunta(); else fim(); }
    else if (b.dataset.opcao != null && st && !st.respondida) {
      const m = st.opcoes[Number(b.dataset.opcao)];
      const certo = m === st.fila[st.i];
      registrar(certo);
      for (const [k, o] of st.opcoes.entries()) {
        const bt = el.querySelector(`[data-opcao="${k}"]`);
        bt.disabled = true;
        if (o === st.fila[st.i]) bt.classList.add('certo');
        else if (o === m) bt.classList.add('errado');
      }
      revelar(certo, null);
    }
  });

  return {
    // camadas: abre a configuração já com essas camadas marcadas (o "Quiz de …" da ficha)
    abrir({ camadas } = {}) {
      if (el.hidden) { // a sessão assenta no lugar, como a ficha (CSS; respeita o movimento reduzido)
        el.classList.remove('encaixar');
        void el.offsetWidth;
        el.classList.add('encaixar');
      }
      el.hidden = false;
      selecao.interceptar = tocar;
      if (camadas?.length && !st) cfg = { ...cfg, camadas };
      if (!st) telaConfig();
    },
    get ativo() { return !el.hidden; },
    sair,
    // o tema mudou: as marcas (pergunta, certo, errado) voltam a ler os tokens do tema novo
    redestacar() { for (const marca of marcadas) pintar(marca); },
  };
}
