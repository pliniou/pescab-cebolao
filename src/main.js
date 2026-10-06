import { registerSW } from 'virtual:pwa-register';
import dados from './data/estruturas.json';
import { criarViewer, caixaDosObjetos } from './scene/viewer.js';
import { carregarModelos, ehGengiva } from './scene/modelos.js';
import { criarExplosao } from './scene/explosao.js';
import { criarSelecao } from './scene/selecao.js';
import { criarCortes } from './scene/cortes.js';
import { criarRotulos } from './scene/rotulos.js';
import { criarRaioX } from './scene/raiox.js';
import { criarCores } from './scene/cores.js';
import { criarFoco } from './scene/foco.js';
import { criarInfo } from './ui/info.js';
import { criarConsulta } from './ui/consulta.js';
import { criarPainel } from './ui/painel.js';
import { criarModos } from './ui/modos.js';
import { PRESETS, aplicarPreset } from './ui/presets.js';
import { criarPintura } from './ui/pintura.js';
import { criarQuiz } from './quiz/quiz.js';
import { ehCelular, ehLargo, esc } from './util.js';
import { aplicarIcones, icone } from './icones.js';

const $ = (s) => document.querySelector(s);
aplicarIcones();
const ORDEM = ['ossos', 'vertebras', 'dentes', 'musculos', 'nervos', 'arterias', 'veias', 'glandulas'];
const VISIVEIS_INICIO = new Set(['ossos', 'dentes']);
const app = $('#app');
let foco = null; // criados depois do carregamento; o tema pode ser trocado antes
let selecao = null;

// PWA: service worker (cache de todos os arquivos para uso offline)
registerSW({
  immediate: true,
  onOfflineReady() { avisar('Pronto para uso offline.'); },
});
// Aviso curto sobre a vista; o tempo na tela acompanha o tamanho do texto (~60 ms por letra, no mínimo 4 s)
let esconderAviso = 0;
function avisar(txt) {
  const a = $('#offline');
  a.textContent = txt;
  a.hidden = false;
  clearTimeout(esconderAviso);
  esconderAviso = setTimeout(() => { a.hidden = true; }, Math.max(4000, txt.length * 60));
}

// Tema
const TEMA = 'atlas-tema';
function aplicarTema(t) {
  document.documentElement.dataset.tema = t;
  // a barra do navegador (celular e PWA instalado) acompanha a barra do app
  const barra = getComputedStyle(document.documentElement).getPropertyValue('--barra').trim();
  if (barra) document.querySelector('meta[name="theme-color"]').content = barra;
}
let tema = null;
try { tema = localStorage.getItem(TEMA); } catch {}
aplicarTema(tema || (matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'));
$('#bt-tema').addEventListener('click', () => {
  const t = document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro';
  aplicarTema(t);
  try { localStorage.setItem(TEMA, t); } catch {}
  foco?.reaplicar(); // o recuo usa a cor do campo, que muda com o tema
  selecao?.redestacar(); // e o brilho da seleção, a cor de --selecao-3d
});

// Bandeja: coluna fixa no desktop; folha inferior no celular, recolhida (só o cabeçalho do modo) ou aberta
const btBandeja = $('#bt-bandeja');
function abrirBandeja(v) {
  app.classList.toggle('bandeja-aberta', v);
  btBandeja.setAttribute('aria-expanded', String(v));
}
const recolherBandeja = () => { if (ehCelular()) abrirBandeja(false); };
btBandeja.addEventListener('click', () => abrirBandeja(!app.classList.contains('bandeja-aberta')));
if (ehCelular()) $('.creditos details').open = false; // a atribuição recolhe numa linha para liberar a tela

const porId = new Map(dados.estruturas.map((e) => [e.id, e]));
const viewer = criarViewer($('#vista'));
viewer.enquadrar(0.19);

// Falha no carregamento (arquivo fora do cache offline, rede caída na primeira visita): diz qual camada falhou e
// oferece tentar de novo, em vez de deixar "Carregando…" para sempre
let modelos;
try {
  modelos = await carregarModelos(viewer.scene, ORDEM, porId, (p) => { $('#progresso').textContent = `${Math.round(p * 100)}%`; });
} catch (erro) {
  console.error(erro);
  const c = $('#carregando');
  c.classList.add('falhou');
  c.innerHTML = `<p>Não foi possível carregar os modelos${erro.camada ? ` (camada ${esc(dados.camadas[erro.camada] || erro.camada)})` : ''}.
    Confira a conexão: o app precisa de internet na primeira visita para guardar os modelos no aparelho.</p>
    <button class="bt primario" type="button">Tentar de novo</button>`;
  c.querySelector('button').addEventListener('click', () => location.reload());
  throw erro; // o resto do app depende dos modelos
}
$('#carregando').remove();
for (const [c, g] of Object.entries(modelos.grupos)) g.visible = VISIVEIS_INICIO.has(c);
for (const m of modelos.malhas.values()) if (ehGengiva(m)) m.visible = false;
viewer.invalidar(); // modelos chegaram (fora de qualquer interação)
const cores = criarCores(modelos); // modo de cores e pintura (salvos no aparelho)
const raiox = criarRaioX(modelos, ORDEM, viewer.invalidar);
const explosao = criarExplosao(viewer, modelos.malhas);
const cortes = criarCortes(viewer, modelos);
const rotulos = criarRotulos(viewer, modelos, cortes);
foco = criarFoco(viewer, modelos);

let painel = null;
let consulta = null;
let modos = null; // criado depois do painel; usado pela seleção
const mudou = () => {
  selecao.conferir(); // a selecionada saiu de vista (ela ou a camada): sai da seleção
  painel?.sincronizar();
};
const info = criarInfo($('#info'), dados.camadas, {
  aoIsolar: (m) => selecao.isolar(m),
  aoOcultar: (m) => { m.visible = false; mudou(); },
  aoFechar: fecharFicha,
  // da ficha para o Estudar: a estrutura continua selecionada e aparece aberta no índice da camada
  aoEstudar(m) {
    definirModo('estudar');
    painel.mostrarSelecionada(m);
    if (ehCelular()) { info.mostrar(null); abrirBandeja(true); } // no celular a bandeja ocupa o lugar da ficha
  },
  // da ficha para o Treinar: a configuração do quiz já vem com a camada da estrutura
  aoTreinar(m) {
    definirModo('treinar');
    abrirQuiz([m.userData.camada]);
  },
});
selecao = criarSelecao(viewer, modelos, {
  filtroPonto: cortes.mantem,
  aoSelecionar(m) {
    info.mostrar(m);
    rotulos.marcar(m);
    painel?.mostrarSelecionada(m);
    consulta?.marcarSelecionada();
    focar(m);
  },
  aoMudarIsolamento: (n) => { $('#bt-desfazer').disabled = n === 0; painel?.sincronizar(); },
});

// O foco: o resto recua para o campo e a câmera vem até a estrutura. Escolhida por nome (busca ou índice), a câmera
// aproxima e gira para o lado dela; tocada no modelo, ela já está à vista e a câmera só centraliza. No tablet a ficha
// cobre o canto de baixo da vista, que então sobe (no desktop e no celular a ficha tem lugar próprio).
// Com um modo (quiz ou exercício) ativo, ele controla a vista.
let porNome = false; // a próxima seleção veio de uma lista
const FOLGA_CELULAR = 1.7; // a peça ocupa ~55% da faixa visível acima da ficha
function focar(m) {
  const aproximar = porNome;
  porNome = false;
  foco.definir(m);
  if (modos?.ativo) return;
  if (!ehLargo() && !ehCelular()) viewer.deslocar(m ? 0.22 : 0);
  if (!m) return;
  const caixa = caixaDosObjetos([m]);
  if (!aproximar) { viewer.focar(caixa.getCenter(m.position.clone())); return; }
  // no celular a ficha abre como folha e encolhe a vista: enquadra depois do novo tamanho (dois quadros de layout) e mais
  // de perto, porque a faixa que sobra acima da folha é baixa
  if (ehCelular()) requestAnimationFrame(() => requestAnimationFrame(() => viewer.aproximar(caixa, FOLGA_CELULAR)));
  else viewer.aproximar(caixa);
}

const app3d = {
  viewer, modelos, ordem: ORDEM, selecao, cortes, explosao, raiox,
  definirExplosao: (v) => definirExplosao(v),
  get painel() { return painel; },
};

// Consultar: busca e índice para escolher
consulta = criarConsulta($('#painel-consultar'), {
  dados, modelos, ordem: ORDEM, selecao,
  aoEscolher(m) {
    // mostra a estrutura (e a camada dela) sem esconder o que já estava à vista
    modelos.grupos[m.userData.camada].visible = true;
    m.visible = true;
    porNome = true;
    selecao.selecionar(m);
    mudou();
    recolherBandeja();
  },
});
consulta.campo.addEventListener('focus', () => { if (ehCelular()) abrirBandeja(true); });

// Estudar: roteiros, camadas, explosão, cortes, rótulos, cores
painel = criarPainel($('#painel-estudar'), {
  dados, modelos, ordem: ORDEM, selecao, cortes, rotulos, raiox, aoMudar: mudou,
  presets: PRESETS, recolher: recolherBandeja,
  aoPreset(p) {
    aplicarPreset(p, app3d);
    // no celular a bandeja recolhe e a nota (o conteúdo didático do roteiro) sumiria com ela: vai para o aviso da vista
    if (ehCelular()) avisar(p.nota);
  },
});
const slider = $('#explosao');
function definirExplosao(v) {
  slider.value = Math.round(v * 100);
  $('#explosao-valor').textContent = `${slider.value}%`;
  explosao.definir(v);
}
slider.addEventListener('input', () => definirExplosao(slider.value / 100));

modos = criarModos({ viewer, modelos, ordem: ORDEM, selecao, cortes, raiox, rotulos, painel, fecharPainel: recolherBandeja });

// Treinar: lançadores do quiz e dos exercícios; a sessão abre na coluna lateral
$('#painel-treinar').innerHTML = `
  <h2 class="titulo-secao">Quiz</h2>
  <div class="compartimento">
    <button class="bt lancador" id="bt-quiz">${icone('quiz')}<span>Começar um quiz</span></button>
    <p class="dica">Clique na estrutura, múltipla escolha ou misto; você escolhe as camadas. Placar e erradas ficam salvos neste aparelho.</p>
  </div>
  <h2 class="titulo-secao">Exercícios de pintura</h2>
  <div class="compartimento" id="treino-exercicios"></div>`;

const quiz = criarQuiz($('#quiz'), {
  dados, modelos, ordem: ORDEM, viewer, selecao, raiox,
  aoIniciar(camadas) {
    info.mostrar(null);
    const visiveis = { ossos: camadas.includes('ossos') ? 1 : 0.35 };
    for (const c of camadas) visiveis[c] = 1;
    modos.entrar({ camadas: visiveis, mostrar: (m) => !ehGengiva(m), ocultarRotulos: true });
  },
  aoSair() { modos.sair(); },
});
function abrirQuiz(camadas) {
  pintura.sair();
  selecao.selecionar(null);
  quiz.abrir({ camadas });
  recolherBandeja();
}
$('#bt-quiz').addEventListener('click', () => abrirQuiz());

const pintura = criarPintura($('#pintura'), painel.secaoPintura, {
  modelos, cores, selecao, treino: $('#treino-exercicios'),
  aoMudarCores() { painel.atualizarCores(); foco.reaplicar(); },
  aoIniciar(ex, mostrar) {
    if (quiz.ativo) quiz.sair();
    selecao.selecionar(null);
    info.mostrar(null);
    recolherBandeja();
    if (!ex) return; // pincel livre: mantém a cena como está
    const camadas = Object.fromEntries(Object.entries(ex.camadas).map(([c, cfg]) => [c, cfg.op ?? 1]));
    modos.entrar({ camadas, mostrar, enquadrar: true, ocultarRotulos: true }); // rótulos entregariam nomes e grupos
  },
  aoSair(eraExercicio) {
    if (eraExercicio) modos.sair();
  },
});

// Modos do app (abas no topo): cada um mostra a sua bandeja; sair de um modo encerra o que só existe nele
const ABAS = [...document.querySelectorAll('.modos [role="tab"]')];
const ROTULO_BANDEJA = { consultar: 'Busca e índice', estudar: 'Ferramentas de estudo', treinar: 'Quiz e exercícios' };
let modoAtual = 'consultar';
function definirModo(nome) {
  if (nome === modoAtual) return;
  if (modoAtual === 'treinar') { if (quiz.ativo) quiz.sair(); if (pintura.exercicio) pintura.sair(); }
  if (modoAtual === 'estudar' && pintura.ativo && !pintura.exercicio) pintura.sair();
  if (nome === 'treinar') selecao.selecionar(null); // no Treinar a coluna lateral é da sessão
  modoAtual = nome;
  app.dataset.modo = nome;
  for (const aba of ABAS) {
    const ativa = aba.dataset.modo === nome;
    aba.setAttribute('aria-selected', String(ativa));
    aba.tabIndex = ativa ? 0 : -1;
  }
  for (const p of document.querySelectorAll('[data-painel]')) p.hidden = p.dataset.painel !== nome;
  $('.alca-rotulo').textContent = ROTULO_BANDEJA[nome];
  $('#bandeja-conteudo').scrollTop = 0;
}
// No celular a ficha ocupa o lugar da bandeja: tocar numa aba é pedir a bandeja, então a ficha fecha (sem isso a aba
// pareceria não responder)
for (const aba of ABAS) aba.addEventListener('click', () => {
  definirModo(aba.dataset.modo);
  if (!ehCelular()) return;
  if (!quiz.ativo && !pintura.ativo) selecao.selecionar(null);
  abrirBandeja(true);
});
// teclado nas abas: setas trocam de aba (padrão de tablist)
$('.modos').addEventListener('keydown', (ev) => {
  const i = ABAS.indexOf(document.activeElement);
  if (i < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(ev.key)) return;
  ev.preventDefault();
  const j = ev.key === 'Home' ? 0 : ev.key === 'End' ? ABAS.length - 1 : (i + (ev.key === 'ArrowRight' ? 1 : -1) + ABAS.length) % ABAS.length;
  ABAS[j].focus();
  definirModo(ABAS[j].dataset.modo);
});

// Fechar a ficha (botão ou Esc): a seleção sai e o foco do teclado volta para a busca, de onde a escolha costuma vir
// (no celular não, para não abrir o teclado virtual)
function fecharFicha() {
  const dentro = $('#info').contains(document.activeElement);
  selecao.selecionar(null);
  if (dentro || document.activeElement === document.body) { if (modoAtual === 'consultar' && !ehCelular()) consulta.focar(); }
}
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape' || ev.defaultPrevented || $('#info').hidden || quiz.ativo || pintura.ativo) return;
  fecharFicha();
});

$('#bt-desfazer').addEventListener('click', () => selecao.desfazer());
$('#bt-ocultas').addEventListener('click', () => selecao.mostrarOcultas());
// Abas de vista: a vista escolhida fica marcada até o usuário girar a câmera
const abasVista = [...document.querySelectorAll('[data-vista]')];
const marcarVista = (nome) => { for (const b of abasVista) b.setAttribute('aria-pressed', String(b.dataset.vista === nome)); };
for (const b of abasVista) b.addEventListener('click', () => { viewer.vista(b.dataset.vista); marcarVista(b.dataset.vista); });
// a régua é uma toolbar: uma só parada de Tab, e as setas (Home/End) andam entre as vistas
abasVista.forEach((b, i) => { b.tabIndex = i ? -1 : 0; });
$('.vistas').addEventListener('keydown', (ev) => {
  const i = abasVista.indexOf(document.activeElement);
  if (i < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(ev.key)) return;
  ev.preventDefault();
  const j = ev.key === 'Home' ? 0 : ev.key === 'End' ? abasVista.length - 1 : (i + (ev.key === 'ArrowRight' ? 1 : -1) + abasVista.length) % abasVista.length;
  abasVista[i].tabIndex = -1;
  abasVista[j].tabIndex = 0;
  abasVista[j].focus();
});
$('#bt-reset').addEventListener('click', () => { viewer.resetar(); marcarVista(null); });
viewer.controls.addEventListener('start', () => marcarVista(null));
marcarVista(null);

// O app abre no Consultar com a busca na mão (no celular, sem abrir o teclado sozinho)
if (!ehCelular()) consulta.focar();

// Para depuração no console
window.atlas = { ...app3d, rotulos, painel, consulta, quiz, dados, cores, pintura, modos, foco, definirModo };
