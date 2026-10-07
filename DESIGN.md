---
name: Atlas Cabeça e Pescoço
description: Atlas 3D de cabeça e pescoço para Odontologia, montado como uma bandeja de instrumental sobre o campo cirúrgico.
colors:
  # aço e campo (tema claro)
  barra: "#dfe5e8"
  aco: "#f2f4f5"
  aco-2: "#e4e8ea"
  aco-borda: "#c6cdd1"
  aco-forte: "#7f8a91"
  campo-luz: "#bcd9d3"
  campo-borda: "#6fa49b"
  tinta: "#152026"
  tinta-2: "#45525a"
  tinta-3: "#5b6870"
  acao: "#2550c4"
  acao-forte: "#1c3d99"
  sobre-acao: "#ffffff"
  acao-suave: "rgb(37 80 196 / 0.1)"
  fita: "#efe6cf"
  fita-faixa: "#3b3830"
  fita-texto: "#2b2721"
  etiqueta: "#1d2428"
  etiqueta-texto: "#f3f6f7"
  marca-texto: "#ffe27a"
  certo: "#1d7a4c"
  errado: "#b3261e"
  aviso: "#8a5300"
  # cores próprias do 3D (o JS lê os tokens na hora do uso, ver scene/tema3d.js)
  recuo-3d: "#8fb8b0"
  selecao-3d: "#2f62ff"
  pergunta-3d: "#d946ef"
  # tema escuro (plantão noturno): mesmos papéis, sufixo -noturno
  barra-noturno: "#141a1d"
  aco-noturno: "#1b2226"
  aco-2-noturno: "#12181b"
  aco-borda-noturno: "#2e383e"
  aco-forte-noturno: "#66747c"
  campo-luz-noturno: "#1f4540"
  campo-borda-noturno: "#0c1f1c"
  tinta-noturno: "#e6ecee"
  tinta-2-noturno: "#a9b5bb"
  tinta-3-noturno: "#8d999f"
  acao-noturno: "#8eaaff"
  acao-forte-noturno: "#b5c7ff"
  sobre-acao-noturno: "#0b1530"
  acao-suave-noturno: "rgb(142 170 255 / 0.14)"
  fita-noturno: "#39352b"
  fita-faixa-noturno: "#d8cdaf"
  fita-texto-noturno: "#efe7d2"
  etiqueta-noturno: "#dfe6e9"
  etiqueta-texto-noturno: "#12181b"
  marca-texto-noturno: "#6b5a12"
  certo-noturno: "#6fcf97"
  errado-noturno: "#ff8a80"
  aviso-noturno: "#e8b44c"
  recuo-3d-noturno: "#1a3633"
typography:
  marca:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.06em"
  aba:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.06em"
  nome:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "25px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.03em"
  secao:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.09em"
  vista:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "14.5px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
  etiqueta:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "13.5px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "0.05em"
  rotulo:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
    fontFeature: "lnum, tnum"
  titulo:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "lnum"
  leitura:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  corpo:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.45
  lista:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.3
  latim:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.35
  secundario:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  meta:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    fontFeature: "tnum"
  campo:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
rounded:
  r-1: "4px"
  r-2: "8px"
  r-3: "12px"
  r-4: "16px"
  pega: "2px"
spacing:
  e-fino: "2px"
  e-1: "4px"
  e-grupo: "6px"
  e-2: "8px"
  e-3: "12px"
  e-4: "16px"
  e-5: "24px"
  e-6: "32px"
components:
  aba-modo:
    textColor: "{colors.tinta-2}"
    typography: "{typography.aba}"
    rounded: "{rounded.r-2}"
    height: "44px"
    padding: "0 16px"
  aba-modo-atual:
    backgroundColor: "{colors.etiqueta}"
    textColor: "{colors.etiqueta-texto}"
    typography: "{typography.aba}"
    rounded: "{rounded.r-1}"
  botao:
    backgroundColor: "{colors.aco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.r-2}"
    height: "40px"
    padding: "6px 12px"
  botao-hover:
    backgroundColor: "{colors.aco-2}"
  botao-primario:
    backgroundColor: "{colors.acao}"
    textColor: "{colors.sobre-acao}"
    rounded: "{rounded.r-2}"
    height: "40px"
    padding: "6px 12px"
  botao-primario-hover:
    backgroundColor: "{colors.acao-forte}"
  botao-pressionado:
    backgroundColor: "{colors.acao-suave}"
    textColor: "{colors.tinta}"
  botao-mini:
    rounded: "{rounded.r-1}"
    height: "32px"
    padding: "4px 8px"
  lancador:
    textColor: "{colors.tinta}"
    rounded: "{rounded.r-2}"
    height: "48px"
    width: "100%"
  compartimento:
    backgroundColor: "{colors.aco-2}"
    rounded: "{rounded.r-3}"
    padding: "12px"
  campo-busca:
    backgroundColor: "{colors.aco}"
    textColor: "{colors.tinta}"
    typography: "{typography.campo}"
    rounded: "{rounded.r-2}"
    height: "48px"
    padding: "0 12px"
  resultado:
    textColor: "{colors.tinta}"
    typography: "{typography.lista}"
    rounded: "{rounded.r-2}"
    height: "48px"
    padding: "8px 12px"
  resultado-selecionado:
    backgroundColor: "{colors.acao-suave}"
  nome-ficha:
    backgroundColor: "{colors.etiqueta}"
    textColor: "{colors.etiqueta-texto}"
    typography: "{typography.nome}"
    rounded: "{rounded.r-1}"
    padding: "4px 8px"
  etiqueta-meta:
    textColor: "{colors.tinta-2}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.r-1}"
    padding: "4px 8px"
  fita-autoclave:
    backgroundColor: "{colors.fita}"
    textColor: "{colors.fita-texto}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.r-1}"
    padding: "4px 8px"
  carimbo-certo:
    textColor: "{colors.certo}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.r-1}"
    width: "62px"
    padding: "2px 6px"
  carimbo-errado:
    textColor: "{colors.errado}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.r-1}"
    width: "62px"
    padding: "2px 6px"
  rotulo-3d:
    backgroundColor: "{colors.etiqueta}"
    textColor: "{colors.etiqueta-texto}"
    typography: "{typography.rotulo}"
    rounded: "{rounded.r-1}"
    padding: "2px 6px"
  rotulo-3d-selecionado:
    backgroundColor: "{colors.acao}"
    textColor: "{colors.sobre-acao}"
  regua-vistas:
    backgroundColor: "{colors.aco}"
    textColor: "{colors.tinta}"
    typography: "{typography.vista}"
    rounded: "{rounded.r-2}"
    height: "38px"
  folha-inferior:
    backgroundColor: "{colors.aco}"
    rounded: "{rounded.r-4}"
---

# Design System: Atlas Cabeça e Pescoço

## Overview

**Creative North Star: "A Bandeja Clínica"**

Cada modo é uma bandeja montada para um procedimento: só os instrumentos dele, cada um no seu compartimento, ao lado do campo cirúrgico onde está o modelo. O modelo 3D fica sobre um campo de algodão verde-azulado iluminado no centro como sob o foco; as ferramentas ficam em bandejas de aço inox escovado claro, com compartimentos estampados e divisórias como os encaixes de instrumentos. Os nomes vão em etiqueta de rotuladora (fita escura, caixa alta condensada); o estado de conferência vai na fita de autoclave, listrada quando conferido e lisa quando a conferir. Há um único tom de ação, o azul da luva de nitrilo.

A densidade é a de uma bandeja de instrumental: uma região dominante por modo (Consultar abre com a busca grande; Estudar com roteiros, camadas e cortes; Treinar com lançadores que, em andamento, cedem lugar ao campo e à sessão). A leitura é numa grotesca de alta legibilidade e as etiquetas e abas numa condensada em caixa alta, como a tipografia de um instrumento clínico. O estado se diz pela forma além da cor: fita listrada × lisa, carimbo de traço cheio × tracejado, aro na seleção, etiqueta escura no modo e na vista atuais.

A direção recusa o painel único com todas as ferramentas ao mesmo tempo, o visualizador médico escuro com ciano e o app de cartões genérico. O tema escuro é o plantão noturno: aço escovado escuro sobre campo verde-azulado profundo, com os mesmos papéis.

**Key Characteristics:**
- Campo cirúrgico verde-azulado com a luz do foco no centro, como chão do modelo.
- Bandejas de aço claro com compartimentos estampados (vinco interno, nunca sombra projetada).
- Etiqueta de rotuladora para nomes, modo atual, vista atual e rótulos 3D.
- Fita de autoclave e carimbos carregando estado por forma.
- Um só tom de ação, o azul da luva de nitrilo.
- O foco como interação assinatura: a estrutura fica, o resto recua para o campo, a câmera vem até ela.

## Colors

Neutros frios de aço inox sobre o verde-azulado do campo, a fita bege da autoclave como único quente, e um azul de ação.

### Primary
- **Azul Luva de Nitrilo** (`acao`): o único tom de ação. Ação primária, botão ativo, estrutura selecionada no índice, rótulo 3D selecionado, anel de foco do teclado, cursor de texto e `accent-color` de checkbox, rádio e range. `acao-forte` é o hover da ação; `sobre-acao` é o texto sobre ela; `acao-suave` é o fundo do resultado selecionado, do botão pressionado e o halo do campo de busca em foco.
- **Azul de Seleção 3D** (`selecao-3d`): o azul da ação mais claro, para brilhar sobre o modelo. Só o 3D o usa.

### Secondary
- **Fita de Autoclave** (`fita`, com `fita-faixa` e `fita-texto`): o estado de conferência. Bege com faixas diagonais escuras quando conferido; lisa com aro quando a conferir.
- **Fita da Rotuladora** (`etiqueta`, com `etiqueta-texto`): nome na ficha, modo atual, vista atual, rótulos 3D e o aviso de offline. No escuro a fita fica clara com letra escura, para não sumir no aço.

### Tertiary
- **Campo Cirúrgico** (`campo-luz` no centro, `campo-borda` na periferia): o fundo da vista, em gradiente radial elíptico (70% × 62%, centrado em 50% 46%) que simula a luz do foco. `recuo-3d` é a cor para onde recuam as estruturas fora de foco: o próprio campo, na proporção `--recuo-mistura`.
- **Magenta da Pergunta** (`pergunta-3d`): a estrutura perguntada no quiz; contrasta com todas as camadas e com o campo.

### Neutral
- **Aço da Barra** (`barra`): barra do topo e créditos; também a `theme-color` do navegador.
- **Aço Escovado** (`aco`): a bandeja, a lateral, os botões e os campos.
- **Aço Estampado** (`aco-2`): o fundo mais fundo do compartimento e o hover dos controles.
- **Aro de Aço** (`aco-borda`): fios de 1 px, aro dos compartimentos, divisórias.
- **Aço Forte** (`aco-forte`): aro em hover, aro dos campos (busca, select, nome; 3:1 sobre o aço nos dois temas) e da etiqueta de metadados, traços da régua, pega da alça, barra de rolagem.
- **Tinta** (`tinta`): texto principal. `tinta-2` é o secundário (latim, dicas, contagens, títulos de compartimento); `tinta-3` é desabilitado e placeholder (4,5:1 sobre o aço).
- **Marca-texto** (`marca-texto`): fundo da seleção de texto.
- **Certo, Errado, Aviso** (`certo`, `errado`, `aviso`): retorno do quiz e dos exercícios, carimbos, aviso de dimensões.

### Named Rules
**The Luva Única Rule.** `acao` é o único acento de interface: seleção, ação primária, ativo e foco. Modo e vista atuais não usam o azul, vão em etiqueta de rotuladora.

**The Fonte Única Rule.** Toda cor existe só como token em `src/style.css`, nos dois temas, com o mesmo nome; regras, JS da cena, `index.html` e manifesto leem o token.

## Typography

**Display Font:** Barlow Condensed 600 (com Arial Narrow, sans-serif), auto-hospedada via `@fontsource/barlow-condensed`
**Body Font:** Atkinson Hyperlegible Next, variável 200 a 800 com itálico (com system-ui, Segoe UI, Roboto, sans-serif), auto-hospedada via `@fontsource-variable/atkinson-hyperlegible-next`

**Character:** Tipografia de instrumento clínico. A Atkinson carrega tudo o que se lê e se toca; a Barlow Condensed, sempre em caixa alta e com entreletra aberta, carrega o que se etiqueta. As duas entram no pré-cache offline em subconjunto latino.

### Hierarchy
- **Marca** (`--tipo-marca`): nome do app na barra, caixa alta, entreletra `--caixa-alta`. No celular o token cai para 18 px.
- **Nome** (`--tipo-nome`): nome da estrutura na ficha, dentro da fita da rotuladora, caixa alta.
- **Aba** (`--tipo-aba`): os três modos, caixa alta.
- **Título** (`--tipo-titulo`): título da sessão de treino, Atkinson 700 com `lining-nums`.
- **Leitura** (`--tipo-leitura`): descrição da estrutura, até 68ch.
- **Corpo** (`--t-3`, 1,45): corpo e controles. **Lista** (`--tipo-lista`): resultados, índice, erradas.
- **Latim** (`--tipo-latim`): nome em latim, itálico 400, em `tinta-2`.
- **Seção** (`--tipo-secao`): título de compartimento, legendas e alça, caixa alta com 0,09em.
- **Etiqueta** (`--tipo-etiqueta`): etiqueta de metadados, fita, mini-fita, carimbos e meta dos resultados, caixa alta.
- **Vista** (`--tipo-vista`): régua de vistas, caixa alta. **Rótulo** (`--tipo-rotulo`): rótulos 3D, caixa alta, `lining-nums tabular-nums`.
- **Secundário e meta** (`--t-2`, `--t-1`): dicas, controles compactos, contagens, créditos; números tabulares.
- **Campo** (`--t-campo`, 16 px): campos de texto, para o iOS não dar zoom.

### Named Rules
**The Papel Completo Rule.** Cada papel `--tipo-*` é uma fonte completa (peso, tamanho, entrelinha, família); componentes usam o papel, nunca montam a fonte.

**The Condensada É Etiqueta Rule.** A condensada só aparece em caixa alta, em algo que é etiqueta, aba, título de compartimento ou rótulo; texto corrido é sempre Atkinson.

## Layout

Grade de três áreas em `#app`: barra no topo, bandeja (`--largura-bandeja`, 340 px; 300 px no tablet) à esquerda, vista (o campo) no centro, créditos embaixo. A lateral (ficha, quiz, pintura) só existe quando há algo aberto: a partir de 1024 px vira a terceira coluna (`--largura-lateral`, 384 px); entre 761 e 1023 px (tablet em pé) desce sobre a vista, no canto inferior direito, com `--r-3` e `--sombra-2`, acima da barra inferior (Desfazer continua livre). Com quiz ou exercício em andamento, no Treinar a partir de 761 px a bandeja de lançadores sai e o campo domina, com a sessão ao lado. A grade mantém sempre as mesmas trilhas (a que não está em uso tem largura 0), para que abrir e fechar a lateral ou a sessão deslize as colunas em `--encaixe` e o modelo acompanhe, em vez de saltar.

Até 760 px em pé, a barra quebra em duas linhas (marca e tema; os três modos ocupando a largura toda), o modelo fica em tela cheia e a bandeja vira folha inferior: recolhida mostra a alça e, no Consultar, só o campo de busca; aberta sobe com o conteúdo até 50dvh. A alça abre e fecha por toque e por arrasto. Ficha e sessões ocupam o lugar da bandeja como folha de até 46dvh. Dentro da folha só ela rola (o índice não tem rolagem própria).

Deitado (altura até 500 px, paisagem, até 1023 px de largura: celular na horizontal ao lado da peça, ou zoom de 200%), a vista é baixa demais para uma folha por cima: bandeja, ficha e sessões dividem uma coluna de 280 px à esquerda (a ficha ocupa o lugar da bandeja), os créditos ficam recolhidos embaixo dela e o modelo fica com toda a altura à direita. `ehDeitado()` em `util.js` usa o mesmo limite.

A régua de vistas rola numa linha com a borda direita esmaecida por máscara; só a partir de 1024 px, onde cabe, ela quebra linha. Os créditos ficam recolhidos numa linha fora do desktop largo.

Ritmo de espaço por tokens: `--e-fino` (2 px), `--e-1` (4 px), `--e-grupo` (6 px, entre itens do mesmo grupo), `--e-2` (8 px), `--e-3` (12 px, margem da vista e entre grupos), `--e-4` (16 px), `--e-5` (24 px), `--e-6` (32 px). Títulos de compartimento têm mais ar acima que abaixo. Sobre o campo, régua de vistas, barra inferior e avisos ficam a `--e-3` das bordas e acima dos rótulos 3D, que ficam acima do canvas. Alvos de toque de 40 a 48 px; com ponteiro grosso (toque), botões mini e nomes do índice sobem para 40 px.

**The Uma Região Rule.** Cada modo tem uma região dominante: o que não serve àquele momento não está na bandeja.

## Elevation & Depth

A profundidade é híbrida e contida. A bandeja e seus compartimentos são planos: o compartimento é estampado no aço com fundo mais fundo, aro de 1 px e vinco interno. Sombra projetada só no que flutua sobre o campo ou sobe sobre ele.

### Shadow Vocabulary
- **Vinco** (`--vinco`: `inset 0 1px 2px rgb(21 32 38 / 0.08)`): o compartimento estampado no aço.
- **Sombra 1** (`--sombra-1`: `0 1px 2px rgb(21 32 38 / 0.08), 0 3px 10px rgb(21 32 38 / 0.08)`): botões da barra inferior sobre o campo, avisos e dica de gestos.
- **Sombra 2** (`--sombra-2`: `0 2px 6px rgb(21 32 38 / 0.08), 0 14px 32px rgb(21 32 38 / 0.16)`): lateral flutuante no tablet.
- **Sombra da folha** (`--sombra-folha`: `0 -6px 18px rgb(21 32 38 / 0.12)`): folha inferior do celular, projetada para cima.

No escuro as quatro usam preto com opacidade maior (0,3 a 0,5), definidas no bloco `:root[data-tema="escuro"]`.

### Named Rules
**The Estampado Não Flutua Rule.** Compartimento nunca tem sombra projetada; profundidade dentro da bandeja é vinco e aro.

## Shapes

Cantos pequenos e funcionais. `--r-1` (4 px) é a forma de tudo o que é fita ou etiqueta: etiqueta de rotuladora, fita de autoclave, carimbo, rótulo 3D, botão mini e a aba do modo atual. `--r-2` (8 px) é a dos controles: botões, campo de busca, resultados, régua de vistas, select. `--r-3` (12 px) é o compartimento e a lateral flutuante. `--r-4` (16 px) é o canto superior das folhas inferiores no celular, que sobem sobre o campo com margem negativa do mesmo raio. A pega da alça é um traço de 40 × 4 px com raio de 2 px. Amostras de cor de camada e da paleta são círculos com aro interno `--contorno-amostra`.

Fios de 1 px em `aco-borda` separam compartimentos, divisórias e itens; os roteiros formam uma grade de duas colunas com divisórias internas em vez de cartões.

## Components

### Barra e abas em etiqueta
Barra em `barra` com fio inferior, marca à esquerda na largura da bandeja, abas ao centro e o tema à direita (botão só ícone, sem aro). Abas com 44 px de altura, `tinta-2`, hover com aço translúcido; a aba atual vira etiqueta de rotuladora (`etiqueta`, `etiqueta-texto`, `--r-1`). Transições em `--rapido`.

### Botões
- **Shape:** cantos de controle (`--r-2`), mínimo 40 × 40 px, aro `aco-borda`, fundo `aco`.
- **Primário / ativo:** `acao` com `sobre-acao`; primário em 700. Hover em `acao-forte`.
- **Pressionado:** fundo `acao-suave`, aro `acao`, texto `tinta`.
- **Hover:** aro `aco-forte`, fundo `aco-2`; só em aparelhos com hover (`@media (hover: hover)`), para o toque não deixar o hover preso. **Desabilitado:** `tinta-3` a 0,65.
- **Mini:** 32 px (40 px no toque), `--t-2`, `--r-1`. **Só ícone:** padding `--e-grupo`.
- **Confirmar:** ação destrutiva (apagar a pintura) confirma no próprio botão: o primeiro toque troca o texto por "Confirmar: apagar tudo" em `errado` com aro, o segundo apaga; sem o segundo em 4 s, volta. Nada de diálogo nativo.

### Lançadores
Linha inteira de 48 px que abre uma sessão (quiz, exercício): ícone em `acao`, nome em 700, sem aro nem fundo; hover em `aco`.

### Bandeja, compartimento e divisórias
A bandeja é `aco` com fio direito. Título de compartimento em `--tipo-secao`, `tinta-2`. O compartimento é `aco-2`, aro `aco-borda`, `--r-3`, `--vinco`, padding `--e-3`; dois seguidos ficam a `--e-2`. Divisórias são fios de 1 px: camadas do índice da consulta em `details` com chevron desenhado que gira em `--encaixe`, camadas do Estudar com olho, amostra de cor e contagem (o raio-X fica dentro da camada aberta; fora de 100%, aparece ao lado do nome numa etiqueta de contorno "raio-X 40%"), grade de roteiros com divisórias internas.

No Estudar, roteiros e camadas ficam abertos; explosão, cortes e pintura são ferramentas recolhidas (`details.ferramenta`) cujo título traz o estado atual à direita ("35%", "sagital 12 mm · axial −5 mm", "desligados"), para quem não abre saber o que está ligado. O roteiro aplicado fica marcado (aro de 2 px em `acao` e fundo `acao-suave`) até o estudante mexer na cena. A troca de bandeja entra do lado da aba escolhida (deslocamento de `--e-4` e opacidade, em `--encaixe`).

### Campo de busca e resultados
- **Campo:** 48 px, fundo `aco`, aro `aco-forte`, `--r-2`, ícone de lupa em `tinta-2`, texto em `--t-campo`. **Foco:** aro dobrado em `acao` (2 px sólidos), ícone em `acao`.
- **Resultados:** um só corpo de letra (`--tipo-lista`), hierarquia por peso e caixa: nome em 700, latim em itálico `tinta-2`, meta (camada · lado) em etiqueta condensada. Separados por fio de 1 px; hover em `aco-2`; selecionado com `acao-suave` e aro interno de 1 px em `acao`.
- **Mini-fita:** pedaço de fita de autoclave lisa ("a conferir") ao lado do nome, `fita` com aro `aco-forte`, `--r-1`.

### Índice de estruturas
Pares D | E espelhados em torno do nome-base, lado direito do paciente à esquerda; dentes na ordem FDI. Selecionada em `acao` com `sobre-acao`; oculta riscada em `tinta-3`; a conferir com sublinhado tracejado em `aco-forte`.

### Ficha
Nome em etiqueta de rotuladora (`--tipo-nome`, `etiqueta`, `--r-1`), latim em itálico, etiqueta de metadados em contorno (camada · lado · FDI · FMA, aro interno `aco-forte`, `tinta-2`), fita de autoclave, descrição em `--tipo-leitura` até 68ch, aviso de dimensões em `aviso`, fonte em `--t-1`. Ao entrar em foco, a ficha encaixa: sobe 8 px, aparece e se descobre de baixo para cima em `--encaixe`; as sessões de quiz e pintura entram do mesmo jeito. Quando o foco deixou translúcido o que cobria a peça, uma nota com o ícone de camadas diz quantas estruturas ficaram translúcidas e oferece "Deixar opacas".

### Fita de autoclave
- **Conferido:** fundo `fita` com uma faixa de 26 px de listras diagonais a -45° em `fita-faixa` (4 px de faixa, 5 px de intervalo) à esquerda.
- **A conferir:** fita lisa com aro interno `aco-forte`. A forma diz o estado; o texto confirma.

### Carimbos
Cada resposta da sessão de quiz fica carimbada, da mais recente para a mais antiga: carimbo de 62 px com aro de 2 px na cor do texto, `--tipo-etiqueta`, `--r-1`. Certo em `certo` com traço cheio; errado em `errado` com traço tracejado. O carimbo mais recente entra encolhendo de 1,35 para 1.

### Régua dos cortes
Cada plano (sagital, coronal, axial) tem interruptor, botão mini Inverter, controle deslizante sobre uma régua milimetrada com um traço por centímetro em `aco-forte` (alinhada ao curso do cursor, 8 px de cada lado), posição em mm e o lado mantido. Desligado, a régua cai para 0,4.

### Régua de vistas
Régua de aço (`aco`, aro `aco-borda`, `--r-2`) no canto superior esquerdo do campo, botões de 40 px em `--tipo-vista` com divisórias internas; a vista atual vai em etiqueta de rotuladora. Rola numa linha e esmaece à direita; a partir de 1024 px quebra linha.

### Avisos sobre o campo
Acima da barra inferior, centrados e empilhados: a dica de gestos da primeira visita (etiqueta de aço com o ícone de girar em `acao`; some no primeiro giro ou na primeira escolha e não volta, `atlas-dica-v1`), o aviso de offline e, no celular, a nota do roteiro aplicado em etiqueta de rotuladora, fixa até o estudante fechar ou abrir a bandeja. Entram subindo `--e-2` em `--encaixe`.

### Rótulos 3D
Etiqueta de rotuladora em `--tipo-rotulo`, `--r-1`, com linha de chamada de 1 px de `--chamada` (14 px) terminada em ponto de 5 px, tudo em `etiqueta`. Selecionado: a etiqueta sobe 26 px enquanto a chamada estica até 40 px sem soltar da peça (`@property --chamada`, transição em `--encaixe`), e passa para `acao` com `sobre-acao`. Rótulos não cruzam a lateral, a régua de vistas nem os botões da barra inferior.

### Folhas inferiores (celular)
Bandeja, ficha e sessões sobem do pé da tela com cantos `--r-4` e `--sombra-folha`. A bandeja tem alça (pega de 40 × 4 px em `aco-forte` e título em `--tipo-secao`) que abre por toque ou arrasto para cima e recolhe arrastando para baixo; ficha e sessões fecham pelo X. A ação principal da configuração do quiz (Começar) fica presa ao pé da folha enquanto ela rola.

### O foco (interação assinatura)
Ao selecionar uma estrutura, ela mantém a cor e o brilho da seleção (`selecao-3d`) e o resto do modelo recua um passo para o campo: a cor-base de cada outra malha mistura `--recuo-mistura` de `recuo-3d` (0,62 no claro; 0,75 no escuro, onde o campo é fundo e as cores saturadas precisariam de mais campo para recuar). Escolhida por nome (busca ou índice), a câmera aproxima até a peça ocupar cerca de um terço da vista e gira para o lado dela, e as estruturas que ficam entre a câmera e a peça ficam translúcidas (opacidade 0,18, pelo raio-X, sem mexer no valor das camadas), para que uma peça profunda como o pterigóideo medial ou o nervo alveolar inferior apareça; sair do foco ou "Deixar opacas" devolve a opacidade. Tocada no modelo, a peça já está à vista e a câmera só centraliza. Ao mesmo tempo o rótulo estica a chamada e a ficha encaixa. O recuo parte sempre da cor-base e é refeito ao trocar tema, modo de cores ou pintura.

### Ícones
Lucide, traço 1,75 com pontas e junções arredondadas, `--icone` (18 px; 16 px dentro de textos e avisos), sempre `currentColor`.

## Do's and Don'ts

### Do:
- **Do** reservar `acao` para seleção, ação primária, ativo e foco; modo e vista atuais vão em etiqueta de rotuladora.
- **Do** dizer o estado pela forma além da cor: fita listrada × lisa, carimbo cheio × tracejado, aro na seleção, sublinhado tracejado no a conferir.
- **Do** escrever etiquetas, abas, títulos de compartimento e rótulos 3D em Barlow Condensed 600 em caixa alta; leitura e controles em Atkinson Hyperlegible Next.
- **Do** usar os papéis `--tipo-*`, o espaço `--e-*` e os raios `--r-1..--r-4`; o celular só redefine tokens.
- **Do** estampar compartimentos com `--vinco` e aro de 1 px; sombra projetada só no que flutua sobre o campo.
- **Do** animar estado com `--rapido` (140 ms) e assentamento com `--encaixe` (260 ms), ambos `cubic-bezier(0.16, 1, 0.3, 1)`. Com `prefers-reduced-motion`, nada desliza, escala ou estica: o que aparece entra só por opacidade, e trocas de grade, deslocamento da imagem, câmera e chamada dos rótulos vão direto; o pulso do quiz vira brilho fixo.
- **Do** definir toda cor nova nos dois temas com o mesmo nome de token, e ler cores do 3D com `corDoTema`.
- **Do** manter campos de texto em 16 px e alvos de toque de 40 a 48 px.

### Don't:
- **Don't** usar um segundo acento, nem o visualizador médico escuro com ciano.
- **Don't** montar um painel único com todas as ferramentas ao mesmo tempo, nem empilhar cartões genéricos dentro do compartimento.
- **Don't** dar sombra projetada a compartimentos.
- **Don't** usar a condensada em texto corrido ou fora de caixa alta.
- **Don't** escrever cor, tamanho de fonte ou espaço solto nas regras do CSS, nem hex no JS da cena.
- **Don't** usar emoji ou glifo como ícone.
