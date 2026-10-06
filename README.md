# Atlas Cabeça e Pescoço

Atlas 3D interativo de cabeça e pescoço para estudo de Odontologia. Funciona no navegador do PC, do celular e do tablet e, depois de aberto uma vez, funciona 100% offline (PWA).

**Abrir:** <https://pliniou.github.io/pescab-cebolao/>

Modelos: **BodyParts3D**, © The Database Center for Life Science, licensed under CC Attribution-Share Alike 2.1 Japan; **Z-Anatomy**, CC BY-SA 4.0. Detalhes das fontes e do que não foi encontrado: [relatorio_estruturas.md](relatorio_estruturas.md).

## Rodar no próprio computador

Requer Node 20.19 ou mais novo.

```bash
npm install
```

```bash
npm run dev
```

O terminal mostra duas URLs: `Local` (este PC) e `Network` (ex.: `http://192.168.15.8:5173/`). Para abrir no celular ou tablet, conecte-o na mesma rede Wi-Fi e digite a URL `Network` no navegador. Se não abrir, libere o Node.js no Firewall do Windows (rede privada).

Versão final (otimizada, com modo offline):

```bash
npm run build
```

```bash
npm run preview
```

A pasta `dist/` é um site estático: pode ser servida por qualquer servidor de arquivos, inclusive num subcaminho (o build usa caminhos relativos).

## Publicação

Cada envio para a branch `main` roda os testes, compila e publica no GitHub Pages (`.github/workflows/pages.yml`). Para publicar em outro lugar, sirva a pasta `dist/` por HTTPS.

## Instalar como aplicativo (PWA)

O modo offline e a instalação exigem HTTPS ou `localhost`: use o endereço publicado acima ou, no próprio PC, `npm run build` + `npm run preview` (`http://localhost:4173`). Pela rede local (`http://192.168…`) o navegador do celular abre o app, mas não o instala nem ativa o offline.

- **Windows (Chrome ou Edge):** abra o endereço, clique no ícone de instalar na barra de endereço (ou menu ⋮ → *Instalar Atlas Cabeça e Pescoço*). O app aparece no Menu Iniciar.
- **Android (Chrome):** menu ⋮ → *Instalar app* / *Adicionar à tela inicial*.
- **iPhone/iPad (Safari):** botão Compartilhar → *Adicionar à Tela de Início*.

Abra o app uma vez com internet e espere a mensagem "Pronto para uso offline". Depois disso ele abre sem conexão.

## Como usar

O app tem três modos, nas abas do topo. No computador a bandeja do modo fica à esquerda, o modelo no centro e a ficha (ou a sessão de treino) à direita; no celular a bandeja é uma folha na parte de baixo, que se abre pela alça.

- **Consultar** (abre por padrão): busca instantânea por português, latim, inglês ou número FDI. Enter escolhe o primeiro resultado; as setas andam pela lista; Esc limpa. Com a busca vazia aparece o índice por camada. Escolher uma estrutura liga a camada dela, traz a câmera até a peça (girando para o lado dela) e faz o resto do modelo recuar para o fundo.
- **Estudar:** roteiros de estudo, camadas e estruturas, raio-X (opacidade por camada), explosão (0 a 100%), cortes sagital/coronal/axial com régua milimetrada e *Inverter*, rótulos, cores e pintura.
- **Treinar:** quiz e exercícios de pintura. Durante a sessão a bandeja sai e o modelo ocupa a tela, com a sessão ao lado (no celular, embaixo).
- **Girar:** arrastar · **Zoom:** roda do mouse / pinça · **Mover:** botão direito / dois dedos.
- **Selecionar:** clique/toque numa estrutura → ficha com o nome em etiqueta, latim, camada, lado, FDI e FMA, a fita de conferência e a descrição. Da ficha, *Ver no índice do Estudar* leva a estrutura para o índice da camada, e *Quiz de …* abre o quiz já com a camada dela. **Esc** fecha a ficha. A estrutura selecionada ganha sempre a etiqueta 3D com linha de chamada, mesmo com os rótulos desligados. **Duplo clique/toque** isola a estrutura; **Desfazer** volta. **Câmera** volta à vista inicial.
- **Mostrar ocultas:** volta a mostrar as estruturas ocultadas uma a uma; as camadas desligadas continuam desligadas.
- Quiz e exercícios de pintura reorganizam a cena; ao sair (ou ao trocar de modo), raio-X, cortes, rótulos e o que estava visível voltam como antes.
- **Tema claro ou escuro:** botão no canto superior direito (a escolha fica salva no aparelho).
- **Quiz:** modos clicar na estrutura, múltipla escolha ou misto; escolha as camadas. *Revisar o que mais erro* monta um quiz com as estruturas em que você tem mais erros do que acertos, começando pela mais urgente (empate: a que você viu há mais tempo). Cada resposta fica carimbada (Certo/Errado) na sessão; o botão Raio-X da pergunta deixa as camadas da prova translúcidas. O placar, as erradas e as estatísticas ficam salvos neste aparelho.
- **Índice de estruturas:** cada linha traz o nome uma vez, com o lado direito à esquerda e o esquerdo à direita, como o corpo visto de frente; nos dentes, os lados mostram o número FDI e a ordem é a do odontograma (11 a 17, depois 41 a 47).
- **Conferência em livro-texto:** na ficha, a fita listrada diz *Conferido*; a fita lisa diz *A conferir* (nome ou descrição marcados para revisão). Nos resultados da busca aparece a mini-fita "a conferir" e no índice o nome sai sublinhado tracejado. Esses itens ficam fora do quiz.
- **Cores e pintura** (no Estudar; os exercícios ficam no Treinar):
  - *Cada estrutura de uma cor*: modo atlas, que facilita separar ossos vizinhos. Os dois lados e os dentes do mesmo tipo têm a mesma cor.
  - **Pintar**: pincel livre com 8 cores. Tocar de novo com a mesma cor apaga. A pintura fica salva no aparelho.
  - **Exercícios de pintura com correção**: Neurocrânio × viscerocrânio, Grupos dentais, Mastigação × expressão facial, Supra-hióideos × infra-hióideos. Use *Conferir* (mostra certas, erradas e o que falta), *Mostrar resposta* e *Recomeçar*. Os exercícios não alteram a sua pintura livre.
  - **Dar o nome de cada estrutura pintada** (ligado por padrão): depois de pintar, digite o nome. Valem o português ou o latim, com ou sem acento, sem precisar do lado e do termo genérico, no singular ou no plural ("masseter", "osso frontal", "maxilares", "36", "C3"). Duas letras vizinhas trocadas contam como um erro só. Erros pequenos de digitação passam, mas o nome de outra estrutura não ("mandíbula" ≠ "n. mandibular"). No pincel livre a correção é na hora; nos exercícios, sai junto com a das cores no *Conferir*.
- Estruturas com o aviso **Dimensões** na ficha têm medidas fora da faixa normal de referência (ver abaixo).

## Conferência anatômica (validação das dimensões)

```bash
npm run validar
```

Mede os modelos publicados e gera [relatorio_conformidade.md](relatorio_conformidade.md) e `src/data/conformidade.json` (avisos mostrados no app). São três camadas:

1. **Validação:** 11 medidas craniométricas comparadas com os dados brutos de Howells (1.368 crânios masculinos) e o comprimento dos dentes comparado com Kim et al. 2013 (CBCT). Critério: OK até ±2 DP da média de referência, alerta até ±3 DP, falha além disso.
2. **Checagem:** relações anatômicas de livro-texto testadas na geometria (hioide em C3, bifurcação carotídea, ducto parotídeo no 2º molar superior, forame mentual, canal mandibular, ápices no osso, simetria) e um roteiro de comparação visual com o atlas, vista por vista.
3. **Conferência:** relatório com desvio percentual, escore z, taxa de aprovação e indicadores de sucesso.

Achado principal: o crânio está dentro da variação normal; os dentes do modelo (BodyParts3D/Z-Anatomy) têm raízes longas demais, enquanto as coroas são compatíveis com a referência. Os molares não têm referência aberta verificada e ficam sem validação dimensional.

A validação compara cada medida e relação com a execução anterior (`src/data/conformidade.json`). Se algo piorou (OK → alerta, alerta → falha), ela lista o que piorou, não grava nada e sai com erro, o que também para o `npm run pipeline`. Se a mudança for intencional, aceite a nova linha de base com `node pipeline/08-validar.mjs --aceitar`. Os itens do roteiro visual marcados à mão (`[x]`) no relatório continuam marcados quando ele é regerado, e rodar de novo sem mudança nos modelos não altera os arquivos.

## Corrigir um nome, latim ou descrição

```bash
npm run dicionario
```

Depois de editar `pipeline/catalogo.mjs` (nomes, latim, `revisar`) ou `pipeline/descricoes.mjs`, isso regera `src/data/estruturas.json` e confere o resultado. Não precisa do cache do pipeline nem do Blender: sem a seleção intermediária, o dicionário é reconstruído a partir do próprio `estruturas.json` publicado (ids, camada e lado vêm da geometria, que não muda). Os testes falham se o dicionário ficar desatualizado em relação a esses dois arquivos. Estrutura nova ou renomeada no catálogo muda a geometria e exige o pipeline completo.

## Testes

```bash
npm test
```

```bash
npm run cobertura
```

Testes automatizados (Vitest) da lógica do app: seleção, isolamento, cortes, raio-X, explosão, cores e pintura, rótulos, roteiros, quiz, conferência de nomes e renderização sob demanda. Também conferem que todo nome citado nos roteiros e exercícios existe no dicionário gerado pelo pipeline e que o visual inteiro segue o design system (veja abaixo). A cobertura gera um relatório em `coverage/index.html`.

## Design system

O visual segue a direção **Bandeja Clínica**: o modelo 3D fica sobre o campo cirúrgico verde-azulado, e as ferramentas ficam em bandejas de aço claro com compartimentos. Nomes vão em etiqueta de rotuladora (fita escura, caixa alta condensada); o estado de conferência vai na fita de autoclave (listrada = conferido, lisa = a conferir). Um único tom de ação, o azul da luva de nitrilo. Texto em Atkinson Hyperlegible Next e etiquetas em Barlow Condensed, servidas com o app. A interação assinatura é o foco: a estrutura escolhida vem para perto e o resto recua para o campo.

- Todos os valores (cores dos dois temas, papéis tipográficos, espaços, raios, sombras, movimento e as cores do 3D) são tokens em `src/style.css`, a fonte única. O 3D, os ícones e o manifesto do PWA leem esses tokens; nenhum outro arquivo escreve cor.
- [DESIGN.md](DESIGN.md) documenta os tokens e as regras de uso.
- Os ícones do app (favicon e ícones do PWA) são gerados com as cores dos tokens:

```bash
node pipeline/icones.mjs
```

- `npm test` falha se o CSS, o DESIGN.md, o 3D ou os ícones saírem do sistema.

## Estrutura

```
pipeline/        scripts Node/Blender que geram os modelos e os dados (etapas 01–08); icones.mjs e tokens.mjs (ícones com as cores do CSS)
public/models/   um GLB por camada (ossos, vertebras, dentes, musculos, nervos, arterias, veias, glandulas)
public/icons/    favicon e ícones do PWA (gerados por pipeline/icones.mjs)
src/style.css    tokens do design system e todo o visual
src/main.js      inicialização
src/util.js      utilitários compartilhados
src/icones.js    ícones (Lucide)
src/scene/       visualização 3D (câmera, modelos, explosão, seleção, foco, cortes, raio-X, cores, rótulos, tema3d: cores do 3D)
src/ui/          consulta (busca e índice), painel (bandeja do Estudar), ficha da estrutura, roteiros, pintura, modos (quiz/exercícios)
src/quiz/        quiz
src/data/estruturas.json   dicionário (gerado por pipeline/05-dicionario.mjs)
src/data/referencias.json  base de referência das medidas (gerada por pipeline/07-referencias.mjs)
src/data/conformidade.json avisos de dimensões (gerado por pipeline/08-validar.mjs)
test/            testes (Vitest); setup.js aplica os tokens do CSS no ambiente de teste
DESIGN.md        design system (tokens e regras visuais)
.github/         workflow de publicação no GitHub Pages
```

Regerar tudo a partir das fontes (o cache fica em `%LOCALAPPDATA%\atlas3d-cache`, ou em `ATLAS_CACHE`; ocupa cerca de 1 GB e exige o Blender): `npm run pipeline`. Antes, extraia o `Z-Anatomy.zip` do repositório [Z-Anatomy/The-blend](https://github.com/Z-Anatomy/The-blend) para `atlas3d-cache\Z-Anatomy` (com o `Startup.blend`); o restante é baixado ou gerado pelos scripts. O Blender vem da variável `BLENDER` ou do atalho da Microsoft Store. Com o cache completo o pipeline roda sem internet: os downloads são conferidos pelo SHA-256 registrado em `fontes.json` no cache (um arquivo corrompido é baixado de novo), e `node pipeline/01-baixar.mjs --tamanhos` consulta antes o tamanho de cada arquivo no servidor. Depois de gerar os modelos, `npm run verificar` confere ids únicos e iguais aos do dicionário, malhas sem aninhamento e o orçamento de tamanho dos GLB (3 MB por arquivo, 12 MB no total). Diagramas da arquitetura: [ARQUITETURA.md](ARQUITETURA.md). Design system (tokens, tipografia, componentes e regras visuais): [DESIGN.md](DESIGN.md).
