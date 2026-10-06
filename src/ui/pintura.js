// Cores e pintura: seção do painel (modo de cores, pincel livre, exercícios) e cartão flutuante do pincel.
// Exercícios: o aluno pinta cada estrutura com a cor do seu grupo e confere. Os grupos seguem classificações de
// livro-texto (fonte indicada em cada exercício); nada aqui é inventado.
import { PALETA } from '../scene/cores.js';
import { conferirNome } from './nomes.js';
import { esc } from '../util.js';
import { icone } from '../icones.js';

const MOORE = 'Moore, Dalley e Agur, Anatomia Orientada para a Clínica';
const pos = (e) => Number(e.fdi) % 10;
// Cor de um grupo = uma tinta da paleta de pintura (PALETA, cores.js), pelo nome: nenhum hex repetido aqui
const tinta = (nome) => {
  const p = PALETA.find((x) => x.nome === nome);
  if (!p) throw new Error(`tinta desconhecida na PALETA: ${nome}`);
  return p.hex;
};

// Um grupo define os membros por lista de nomes n do dicionário (conferida nos testes) ou, quando o critério
// não é o nome (posição FDI dos dentes), por uma função .
export const pertence = (g, e) => (g.en ? g.en.includes(e.en) : !!g.f(e));

export const EXERCICIOS = [
  {
    nome: 'Neurocrânio × viscerocrânio',
    instrucao: 'Pinte os ossos do neurocrânio (caixa do encéfalo) e os do viscerocrânio (esqueleto da face).',
    camadas: { ossos: {} },
    grupos: [
      { nome: 'Neurocrânio', cor: tinta('Azul'), en: ['frontal bone', 'parietal bone', 'occipital bone', 'temporal bone', 'sphenoid bone', 'ethmoid'] },
      { nome: 'Viscerocrânio', cor: tinta('Laranja'), en: ['mandible', 'maxilla', 'zygomatic bone', 'nasal bone', 'lacrimal bone', 'palatine bone', 'inferior nasal concha', 'vomer', 'ethmoid'] },
    ],
    nota: 'O etmoide participa dos dois (conta como certo em qualquer um). O hioide não entra nessa divisão e fica oculto.',
    fonte: MOORE + ' (Cabeça: neurocrânio com 8 ossos; viscerocrânio com 15 ossos).',
  },
  {
    nome: 'Grupos dentais',
    instrucao: 'Pinte os dentes por grupo: incisivos, caninos, pré-molares e molares.',
    camadas: { ossos: { op: 0.25 }, dentes: {} },
    grupos: [
      { nome: 'Incisivos', cor: tinta('Azul-claro'), f: (e) => e.fdi && pos(e) <= 2 },
      { nome: 'Caninos', cor: tinta('Vermelho'), f: (e) => e.fdi && pos(e) === 3 },
      { nome: 'Pré-molares', cor: tinta('Amarelo'), f: (e) => e.fdi && (pos(e) === 4 || pos(e) === 5) },
      { nome: 'Molares', cor: tinta('Verde'), f: (e) => e.fdi && pos(e) >= 6 },
    ],
    contexto: (e) => e.camada === 'ossos' && ['maxilla', 'mandible'].includes(e.en),
    nota: 'O modelo não tem terceiros molares.',
    fonte: 'Classificação dos dentes permanentes (anatomia dental).',
  },
  {
    nome: 'Mastigação × expressão facial',
    instrucao: 'Pinte os músculos da mastigação e os da expressão facial (mímica).',
    camadas: { ossos: { op: 0.35 }, musculos: {} },
    grupos: [
      { nome: 'Mastigação (n. trigêmeo, V3)', cor: tinta('Vermelho'), en: ['masseter', 'temporalis', 'medial pterygoid', 'lateral pterygoid'] },
      { nome: 'Expressão facial (n. facial)', cor: tinta('Roxo'), en: ['occipitofrontalis', 'orbicularis oculi', 'corrugator supercilii', 'procerus muscle',
        'nasalis muscle', 'depressor septi nasi', 'orbicularis oris', 'levator labii superioris', 'levator labii superioris alaeque nasi',
        'zygomaticus major', 'zygomaticus minor', 'levator anguli oris', 'risorius', 'depressor anguli oris', 'depressor labii inferioris',
        'mentalis', 'buccinator', 'platysma'] },
    ],
    contexto: (e) => e.camada === 'ossos',
    nota: 'O pterigóideo medial e o lateral ficam por dentro do ramo da mandíbula: gire o modelo ou use a vista inferior.',
    fonte: MOORE + ' (Cabeça: músculos da face e da mastigação).',
  },
  {
    nome: 'Supra-hióideos × infra-hióideos',
    instrucao: 'Pinte os músculos acima e abaixo do osso hioide.',
    camadas: { ossos: { op: 0.35 }, vertebras: { op: 0.35 }, musculos: {} },
    grupos: [
      { nome: 'Supra-hióideos', cor: tinta('Amarelo'), en: ['digastric', 'stylohyoid', 'mylohyoid', 'geniohyoid'] },
      { nome: 'Infra-hióideos', cor: tinta('Verde'), en: ['sternohyoid', 'omohyoid', 'sternothyroid', 'thyrohyoid'] },
    ],
    contexto: (e) => e.camada === 'ossos' || e.camada === 'vertebras',
    nota: 'O hioide (em raio-X) é a referência. Vista anterior ou inferior ajuda.',
    fonte: MOORE + ' (Pescoço: músculos supra-hióideos e infra-hióideos).',
  },
];

// secao: modo de cores e pincel livre (bandeja do Estudar); treino: os exercícios com correção (bandeja do Treinar).
// Sem treino, os exercícios ficam na própria secao.
export function criarPintura(card, secao, { modelos, cores, selecao, aoIniciar, aoSair, aoMudarCores, treino = secao }) {
  let ex = null;        // exercício em andamento
  let restaurar = null; // devolve as cores de antes do exercício
  let cor = PALETA[0].hex;
  let ativo = false;
  let revelado = false;
  // "Dar o nome ao pintar": depois de pintar, o aluno digita o nome da estrutura
  const NOMEAR = 'atlas-pintura-nomear';
  let nomear = true;
  try { nomear = localStorage.getItem(NOMEAR) !== '0'; } catch {}
  let pendente = null;          // malha pintada aguardando o nome
  const nomes = new Map();      // exercício: malha → { resposta, ok, exato } (conferido só no "Conferir")
  let placarLivre = { certos: 0, total: 0 };

  // ---------- seção do painel ----------
  secao.innerHTML = `
    <div class="modo-cor">
      <label class="liga"><input type="radio" name="modo-cor" value="natural"> Cores naturais</label>
      <label class="liga"><input type="radio" name="modo-cor" value="atlas"> Cada estrutura de uma cor</label>
    </div>
    <div class="acoes-camada">
      <button class="bt" data-acao="pincel">${icone('pincel')}Pintar</button>
      <button class="bt mini" data-acao="limpar-tudo">Limpar pintura</button>
    </div>`;
  const listaExercicios = `<div class="exercicios">${EXERCICIOS.map((x, i) => `<button class="bt lancador" data-ex="${i}">${icone('exercicio')}<span>${esc(x.nome)}</span></button>`).join('')}</div>`;
  if (treino === secao) secao.insertAdjacentHTML('beforeend', `<p class="dica">Exercícios de pintura (com correção):</p>${listaExercicios}`);
  else treino.innerHTML = listaExercicios;
  const sincronizarSecao = () => {
    for (const r of secao.querySelectorAll('input[name="modo-cor"]')) r.checked = r.value === cores.modo;
  };
  sincronizarSecao();
  secao.addEventListener('change', (ev) => {
    if (ev.target.name !== 'modo-cor') return;
    cores.modo = ev.target.value;
    aoMudarCores();
  });
  const aoClicarSecao = (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.acao === 'pincel') abrir(null);
    else if (b.dataset.acao === 'limpar-tudo') {
      limparTudo();
    } else if (b.dataset.ex != null) abrir(EXERCICIOS[Number(b.dataset.ex)]);
  };
  secao.addEventListener('click', aoClicarSecao);
  if (treino !== secao) treino.addEventListener('click', aoClicarSecao);

  // ---------- pincel ----------
  const membro = (m) => {
    if (!ex) return true;
    const e = m.userData.info || {};
    return ex.grupos.some((g) => pertence(g, e));
  };
  function tocar(hits) {
    const alvos = hits.filter((h) => h.object.visible && membro(h.object));
    if (!alvos.length) return true;
    const m = (alvos.find((h) => h.object.material.opacity >= 0.5) || alvos[0]).object;
    // tocar de novo com a mesma cor apaga
    const nova = cores.pintura(m) === cor ? null : cor;
    cores.pintar(m, nova);
    aoMudarCores();
    if (!nova) {
      nomes.delete(m);
      if (pendente === m) caixaNome('');
    } else if (nomear) pedirNome(m);
    if (ex) atualizarProgresso();
    return true;
  }

  // ---------- dar o nome ----------
  // A caixa existe nas duas telas do cartão (pincel e exercício); só é usada com o cartão aberto.
  function caixaNome(html) {
    card.querySelector('.caixa-nome').innerHTML = html;
    if (!html) pendente = null;
  }
  function pedirNome(m) {
    pendente = m;
    const ant = nomes.get(m)?.resposta || '';
    caixaNome(`
      <label class="rotulo-nome" for="campo-nome">Qual é o nome da estrutura que você pintou?</label>
      <div class="linha-nome">
        <input id="campo-nome" class="campo-nome" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" placeholder="Ex.: osso frontal, masseter, 36" value="${esc(ant)}">
        <button class="bt primario" data-acao="nome-ok">OK</button>
        <button class="bt" data-acao="nome-pular">Pular</button>
      </div>`);
    card.querySelector('.campo-nome').focus({ preventScroll: true });
  }
  // Disparada pelo OK ou pelo Enter do campo, que só existem enquanto há uma estrutura pendente
  function responderNome() {
    const m = pendente;
    const campo = card.querySelector('.campo-nome');
    const resposta = campo.value.trim();
    if (!resposta) { campo.focus(); return; }
    const r = conferirNome(resposta, m.userData.info);
    pendente = null; // respondida: apagar a estrutura depois não mexe mais na caixa de nome
    if (ex) {
      // no exercício a correção dos nomes sai junto com a das cores, no "Conferir"
      nomes.set(m, { resposta, ...r });
      caixaNome(`<p class="dica">Nome anotado: "${esc(resposta)}". Toque na próxima estrutura.</p>`);
      atualizarProgresso();
      return;
    }
    placarLivre.total++;
    if (r.ok) placarLivre.certos++;
    const placar = `<span class="placar">Nomes: ${placarLivre.certos} de ${placarLivre.total} certos</span>`;
    caixaNome(r.ok
      ? `<p class="retorno certo">${icone('certo')}${r.exato ? 'Certo' : 'Certo (confira a grafia)'}: ${esc(r.esperado)}</p>${placar}`
      : `<p class="retorno errado">${icone('errado')}Você escreveu "${esc(resposta)}". O nome é: <b>${esc(r.esperado)}</b></p>${placar}`);
  }

  // Apagar toda a pintura livre (salva no aparelho) sempre pede confirmação, venha do painel ou do cartão do pincel
  function limparTudo() {
    if (cores.qtdPintadas && confirm('Apagar toda a pintura?')) { cores.limpar(); aoMudarCores(); }
  }

  function paleta() {
    const itens = ex ? ex.grupos.map((g) => ({ nome: g.nome, hex: g.cor })) : PALETA;
    return `<div class="paleta ${ex ? 'grupos' : ''}">
      ${itens.map((p) => `<button class="bt amostra ${p.hex === cor ? 'ativa' : ''}" aria-pressed="${p.hex === cor}" data-cor="${p.hex}" title="${esc(p.nome)}" aria-label="${esc(p.nome)}">
        <span class="bolinha" style="background:${p.hex}"></span>${ex ? esc(p.nome) : ''}</button>`).join('')}
      <button class="bt amostra ${cor === null ? 'ativa' : ''}" aria-pressed="${cor === null}" data-cor="" title="Borracha" aria-label="Borracha">${icone('borracha')}${ex ? 'Borracha' : ''}</button>
    </div>`;
  }

  const opcaoNomear = () => `
    <label class="liga nomear"><input type="checkbox" data-acao="nomear" ${nomear ? 'checked' : ''}> ${icone('nomear')}Dar o nome de cada estrutura pintada</label>
    <div class="caixa-nome" aria-live="polite"></div>`;

  function tela() {
    pendente = null;
    if (!ex) {
      card.innerHTML = `
        <button class="bt icone-so fechar" data-acao="sair" aria-label="Fechar pincel">${icone('fechar')}</button>
        <h2>Pintar</h2>
        <p class="dica">Escolha uma cor e toque nas estruturas. Tocar de novo com a mesma cor apaga. A pintura fica salva neste aparelho.</p>
        ${paleta()}
        ${opcaoNomear()}
        <div class="acoes">
          <button class="bt" data-acao="limpar">Limpar pintura</button>
          <button class="bt primario" data-acao="sair">Concluir</button>
        </div>`;
      return;
    }
    card.innerHTML = `
      <button class="bt icone-so fechar" data-acao="sair" aria-label="Sair do exercício">${icone('fechar')}</button>
      <h2>${esc(ex.nome)}</h2>
      <p class="dica">${esc(ex.instrucao)} Escolha o grupo e toque nas estruturas.</p>
      ${paleta()}
      ${opcaoNomear()}
      <p class="progresso placar"></p>
      <p class="retorno" aria-live="polite"></p>
      <div class="acoes">
        <button class="bt primario" data-acao="conferir">Conferir</button>
        <button class="bt" data-acao="resposta">Mostrar resposta</button>
        <button class="bt" data-acao="recomecar">Recomeçar</button>
      </div>
      <p class="dica">${esc(ex.nota)} Fonte: ${esc(ex.fonte)}</p>`;
    atualizarProgresso();
  }

  const membros = () => [...modelos.malhas.values()].filter((m) => m.userData.info && ex.grupos.some((g) => pertence(g, m.userData.info)));
  // Só no exercício (a tela do pincel livre não tem progresso)
  function atualizarProgresso() {
    const p = card.querySelector('.progresso');
    const ms = membros();
    const pintadas = ms.filter((m) => cores.pintura(m));
    p.textContent = `Pintadas: ${pintadas.length} de ${ms.length}`
      + (nomear ? ` · Com nome: ${pintadas.filter((m) => nomes.has(m)).length}` : '');
  }
  // Correção dos nomes das estruturas pintadas (exercício)
  function conferirNomes() {
    const pintadas = membros().filter((m) => cores.pintura(m));
    const errados = [];
    let certos = 0, semNome = 0;
    for (const m of pintadas) {
      const n = nomes.get(m);
      if (!n) semNome++;
      else if (n.ok) certos++;
      else errados.push(n);
    }
    if (!pintadas.length) return '';
    let h = `<br>Nomes: ${certos} certos · ${errados.length} errados · ${semNome} sem nome.`;
    if (errados.length) {
      h += '<br>' + errados.slice(0, 6).map((n) => `"${esc(n.resposta)}" → <b>${esc(n.esperado)}</b>`).join('<br>')
        + (errados.length > 6 ? '<br>…' : '');
    }
    return h;
  }
  function conferir() {
    let certas = 0;
    const erradas = [], faltam = [];
    for (const m of membros()) {
      const p = cores.pintura(m);
      const aceitas = ex.grupos.filter((g) => pertence(g, m.userData.info)).map((g) => g.cor);
      if (!p) faltam.push(m);
      else if (aceitas.includes(p)) certas++;
      else erradas.push(m);
    }
    const nomesDe = (lst) => [...new Set(lst.map((m) => m.userData.info.pt))];
    const r = card.querySelector('.retorno');
    const total = certas + erradas.length + faltam.length;
    const parteNomes = nomear && !revelado ? conferirNomes() : '';
    const nomesOk = !parteNomes || [...membros()].every((m) => nomes.get(m)?.ok);
    if (!erradas.length && !faltam.length && nomesOk) {
      r.className = 'retorno certo';
      r.innerHTML = revelado ? `Resposta mostrada (${total} estruturas).`
        : `${icone('certo')}Perfeito! ${certas} de ${total} certas${parteNomes ? ', todas com o nome certo' : ''}.`;
      return;
    }
    r.className = 'retorno errado';
    r.innerHTML = `Cores: ${certas} certas · ${erradas.length} no grupo errado · ${faltam.length} sem pintar.`
      + (erradas.length ? `<br>No grupo errado: ${nomesDe(erradas).slice(0, 8).map(esc).join('; ')}${nomesDe(erradas).length > 8 ? '…' : ''}` : '')
      + parteNomes;
  }
  function resposta() {
    for (const m of membros()) {
      const atual = cores.pintura(m);
      const aceitas = ex.grupos.filter((g) => pertence(g, m.userData.info)).map((g) => g.cor);
      if (!aceitas.includes(atual)) cores.pintar(m, aceitas[0]);
    }
    revelado = true;
    aoMudarCores();
    atualizarProgresso();
    conferir();
  }

  function abrir(exercicio) {
    if (ativo) sair();
    ex = exercicio;
    revelado = false;
    nomes.clear();
    placarLivre = { certos: 0, total: 0 };
    ativo = true;
    cor = ex ? ex.grupos[0].cor : (cor || PALETA[0].hex);
    if (ex) {
      restaurar = cores.iniciarTemporario();
      aoIniciar(ex, (m) => {
        const e = m.userData.info || {};
        return ex.grupos.some((g) => pertence(g, e)) || !!ex.contexto?.(e);
      });
      aoMudarCores();
    } else aoIniciar(null);
    selecao.interceptar = tocar;
    card.hidden = false;
    tela();
  }
  function sair() {
    if (!ativo) return;
    ativo = false;
    selecao.interceptar = null;
    card.hidden = true;
    if (ex) { restaurar?.(); restaurar = null; aoSair(true); } else aoSair(false);
    ex = null;
    pendente = null;
    nomes.clear();
    sincronizarSecao();
    aoMudarCores();
  }

  card.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.cor != null) {
      cor = b.dataset.cor || null;
      for (const x of card.querySelectorAll('.amostra')) { x.classList.toggle('ativa', x === b); x.setAttribute('aria-pressed', String(x === b)); }
      return;
    }
    const a = b.dataset.acao;
    if (a === 'nome-ok') responderNome();
    else if (a === 'nome-pular') caixaNome('');
    else if (a === 'sair') sair();
    else if (a === 'limpar') limparTudo(); // a pintura livre fica salva no aparelho: apagar pede confirmação
    else if (a === 'conferir') conferir();
    else if (a === 'resposta') resposta();
    else if (a === 'recomecar') {
      for (const m of membros()) cores.pintar(m, null);
      revelado = false;
      nomes.clear();
      aoMudarCores();
      tela();
    }
  });

  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && ev.target.classList.contains('campo-nome')) { ev.preventDefault(); responderNome(); }
  });
  card.addEventListener('change', (ev) => {
    if (ev.target.dataset.acao !== 'nomear') return;
    nomear = ev.target.checked;
    try { localStorage.setItem(NOMEAR, nomear ? '1' : '0'); } catch {}
    if (!nomear) caixaNome('');
    if (ex) atualizarProgresso();
  });

  return { abrir, sair, get ativo() { return ativo; }, get exercicio() { return ativo && !!ex; } };
}
