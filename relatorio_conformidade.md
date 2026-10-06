# Relatório de conformidade anatômica

Gerado por `pipeline/08-validar.mjs` em 2026-10-06, medindo os arquivos publicados em `public/models`.
Coordenadas do modelo em mm. Nenhum valor de referência foi estimado: todos vêm das fontes citadas abaixo.

## Resumo

| | Total | ✅ OK | ⚠️ Alerta | ❌ Falha |
|---|---|---|---|---|
| Medidas (camada 1) | 31 | 18 | 11 | 2 |
| Relações anatômicas (camada 2) | 15 | 8 | 7 | 0 |

- Taxa de aprovação das medidas: **58%** (OK / total com referência).
- Desvio médio absoluto em relação à média de referência: crânio **4.5%**, dentes **22.7%**.
- Sem referência verificada (não contam na taxa): 8 molares.

## Critérios de qualidade

OK: |z| ≤ 2 (dentro de média ± 2 DP da referência) · ALERTA: 2 < |z| ≤ 3 · FALHA: |z| > 3. Tolerância percentual de cada medida = 2·DP/média.

A tolerância de cada medida (coluna *Tol.*) é a faixa de ±2 DP expressa em % da média: abaixo dela o modelo está dentro de ~95% da variação humana normal do grupo de referência.

## Camada 1: validação do crânio

Referência: Howells, todos os crânios masculinos (n = 1368, 28 populações). Coluna *Japão*: só as séries japonesas de Howells (n = 105), para comparação.

| Código | Medida | Modelo | Referência (média ± DP) | Japão | Desvio | Tol. | z | Status |
|---|---|---|---|---|---|---|---|---|
| GOL | Comprimento máximo do crânio (glabela–opistocrânio) | 187.2 | 183.2 ± 7.5 | 182.2 ± 6 | +2.2% | ±8.2% | 0.54 | ✅ OK |
| XCB | Largura máxima do crânio (eurio–eurio) | 148.7 | 139.1 ± 7.1 | 140 ± 4.8 | +6.9% | ±10.2% | 1.35 | ✅ OK |
| ZYB | Largura bizigomática (zígio–zígio) | 125.6 | 135.1 ± 6.5 | 134.7 ± 4.3 | -7% | ±9.6% | -1.45 | ✅ OK |
| BBH | Altura básio–bregma | 139.8 | 134.6 ± 6.8 | 137.6 ± 5.3 | +3.8% | ±10.1% | 0.76 | ✅ OK |
| BNL | Comprimento da base do crânio (básio–násio) | 99.7 | 101.5 ± 5.4 | 101.7 ± 4.2 | -1.7% | ±10.6% | -0.33 | ✅ OK |
| BPL | Comprimento básio–próstio | 99.7 | 99.8 ± 6.2 | 98.9 ± 5.4 | -0.1% | ±12.4% | -0.01 | ✅ OK |
| NPH | Altura facial superior (násio–próstio) | 67.6 | 68 ± 5.2 | 70 ± 3.9 | -0.5% | ±15.3% | -0.07 | ✅ OK |
| FRC | Corda frontal (násio–bregma) | 110 | 111.7 ± 5 | 111.2 ± 4.5 | -1.5% | ±9% | -0.34 | ✅ OK |
| PAC | Corda parietal (bregma–lambda) | 123.3 | 112.8 ± 6.1 | 113.6 ± 6.2 | +9.3% | ±10.8% | 1.73 | ✅ OK |
| OCC | Corda occipital (lambda–opístio) | 109.4 | 96.9 ± 6 | 100.2 ± 5.6 | +12.9% | ±12.4% | 2.08 | ⚠️ ALERTA |
| MAB | Largura maxiloalveolar | 63.3 | 65.3 ± 3.7 | 66.8 ± 3.8 | -3.1% | ±11.3% | -0.55 | ✅ OK |

Pontos craniométricos localizados automaticamente na faixa mediossagital (|x| < 2,5 mm): násio = topo medial dos ossos nasais; glabela = ponto mais anterior do frontal acima do násio; opistocrânio = ponto mediano da calota mais distante da glabela; bregma = ponto mediano mais posterior do frontal; lambda = ponto mediano mais alto do occipital; básio/opístio = margens do maior intervalo ântero-posterior do occipital mediano (forame magno); próstio = ponto mais baixo da maxila mediana nos 12 mm anteriores. Larguras = extensão transversal do conjunto de ossos indicado.

## Camada 1: validação dos dentes

Referência: Kim SY, Lim SH, Gang SN, Kim HJ. Crown and root lengths of incisors, canines, and premolars measured by cone-beam computed tomography in patients with malocclusions. Korean J Orthod. 2013;43(6):271-278. doi:10.4041/kjod.2013.43.6.271 (acesso aberto: PMC3879283). Comprimento do dente: ponta de cúspide (borda incisal nos anteriores) ao ápice radicular. Raiz: junção amelocementária vestibular ao ápice. O artigo publica o comprimento total só agrupado (incisivos + caninos + pré-molares, masculino: 22.83 ± 2.55 mm); por tipo de dente publica apenas a raiz.

Comprimento do modelo = extensão ao longo do eixo principal do dente. *Intraósseo* = trecho do dente, a partir do ápice, dentro da maxila/mandíbula (aproxima a raiz: a raiz real começa ~1 a 2 mm acima da crista óssea). *Exposto* = comprimento − intraósseo (aproxima a coroa; referência agrupada de coroa em Kim, tab. 3: 10.38 ± 1.61 mm).

| FDI | Dente | Modelo (mm) | Referência | Desvio | z | Status | Intraósseo (mm) | Raiz de referência (Kim, tab. 4) | z do intraósseo | Exposto (mm) |
|---|---|---|---|---|---|---|---|---|---|---|
| 11 | Incisivo central superior direito (11) | 27.7 | 22.83 ± 2.55 | +21.4% | 1.92 | ✅ OK | 14 | 12.3 ± 1.55 | 1.1 | 13.7 |
| 12 | Incisivo lateral superior direito (12) | 29.5 | 22.83 ± 2.55 | +29.4% | 2.63 | ⚠️ ALERTA | 15 | 13.25 ± 1.2 | 1.5 | 14.5 |
| 13 | Canino superior direito (13) | 31.2 | 22.83 ± 2.55 | +36.8% | 3.3 | ❌ FALHA | 19 | 15.83 ± 1.49 | 2.1 | 12.2 |
| 14 | 1º pré-molar superior direito (14) | 28.1 | 22.83 ± 2.55 | +22.9% | 2.05 | ⚠️ ALERTA | 18 | 13.24 ± 1.3 | 3.7 | 10.1 |
| 15 | 2º pré-molar superior direito (15) | 25.5 | 22.83 ± 2.55 | +11.9% | 1.06 | ✅ OK | 16 | 13.18 ± 1.72 | 1.6 | 9.5 |
| 16 | 1º molar superior direito (16) | 24 | — | — | — | — sem referência | 15 | — | — | 9 |
| 17 | 2º molar superior direito (17) | 22.7 | — | — | — | — sem referência | 16 | — | — | 6.7 |
| 21 | Incisivo central superior esquerdo (21) | 27.7 | 22.83 ± 2.55 | +21.4% | 1.92 | ✅ OK | 14 | 12.3 ± 1.55 | 1.1 | 13.7 |
| 22 | Incisivo lateral superior esquerdo (22) | 29.5 | 22.83 ± 2.55 | +29.4% | 2.63 | ⚠️ ALERTA | 15 | 13.25 ± 1.2 | 1.5 | 14.5 |
| 23 | Canino superior esquerdo (23) | 31.2 | 22.83 ± 2.55 | +36.8% | 3.3 | ❌ FALHA | 19 | 15.83 ± 1.49 | 2.1 | 12.2 |
| 24 | 1º pré-molar superior esquerdo (24) | 28.1 | 22.83 ± 2.55 | +22.9% | 2.05 | ⚠️ ALERTA | 18 | 13.24 ± 1.3 | 3.7 | 10.1 |
| 25 | 2º pré-molar superior esquerdo (25) | 25.6 | 22.83 ± 2.55 | +11.9% | 1.07 | ✅ OK | 16 | 13.18 ± 1.72 | 1.6 | 9.6 |
| 26 | 1º molar superior esquerdo (26) | 24 | — | — | — | — sem referência | 15 | — | — | 9 |
| 27 | 2º molar superior esquerdo (27) | 22.7 | — | — | — | — sem referência | 16 | — | — | 6.7 |
| 31 | Incisivo central inferior esquerdo (31) | 30 | 22.83 ± 2.55 | +31.6% | 2.83 | ⚠️ ALERTA | 20 | 11.56 ± 0.87 | 9.7 | 10 |
| 32 | Incisivo lateral inferior esquerdo (32) | 29.1 | 22.83 ± 2.55 | +27.7% | 2.48 | ⚠️ ALERTA | 19 | 12.75 ± 0.95 | 6.6 | 10.1 |
| 33 | Canino inferior esquerdo (33) | 29.4 | 22.83 ± 2.55 | +28.7% | 2.57 | ⚠️ ALERTA | 20 | 15.02 ± 1.52 | 3.3 | 9.4 |
| 34 | 1º pré-molar inferior esquerdo (34) | 24.5 | 22.83 ± 2.55 | +7.4% | 0.66 | ✅ OK | 15 | 13.77 ± 1.23 | 1.0 | 9.5 |
| 35 | 2º pré-molar inferior esquerdo (35) | 24.8 | 22.83 ± 2.55 | +8.7% | 0.78 | ✅ OK | 16 | 13.58 ± 1.11 | 2.2 | 8.8 |
| 36 | 1º molar inferior esquerdo (36) | 21.7 | — | — | — | — sem referência | 13 | — | — | 8.7 |
| 37 | 2º molar inferior esquerdo (37) | 19.1 | — | — | — | — sem referência | 12 | — | — | 7.1 |
| 41 | Incisivo central inferior direito (41) | 30 | 22.83 ± 2.55 | +31.6% | 2.82 | ⚠️ ALERTA | 20 | 11.56 ± 0.87 | 9.7 | 10 |
| 42 | Incisivo lateral inferior direito (42) | 29.1 | 22.83 ± 2.55 | +27.7% | 2.48 | ⚠️ ALERTA | 19 | 12.75 ± 0.95 | 6.6 | 10.1 |
| 43 | Canino inferior direito (43) | 29.4 | 22.83 ± 2.55 | +28.7% | 2.57 | ⚠️ ALERTA | 20 | 15.02 ± 1.52 | 3.3 | 9.4 |
| 44 | 1º pré-molar inferior direito (44) | 24.5 | 22.83 ± 2.55 | +7.4% | 0.67 | ✅ OK | 15 | 13.77 ± 1.23 | 1.0 | 9.5 |
| 45 | 2º pré-molar inferior direito (45) | 24.8 | 22.83 ± 2.55 | +8.7% | 0.78 | ✅ OK | 16 | 13.58 ± 1.11 | 2.2 | 8.8 |
| 46 | 1º molar inferior direito (46) | 21.7 | — | — | — | — sem referência | 13 | — | — | 8.7 |
| 47 | 2º molar inferior direito (47) | 19.1 | — | — | — | — sem referência | 12 | — | — | 7.1 |

**Diagnóstico.** Como o trecho intraósseo é menor que a raiz verdadeira, um *z do intraósseo* acima de 2 já indica raiz longa. Isso ocorre em 12 de 20 dentes (13, 14, 23, 24, 31, 32, 33, 35, 41, 42, 43, 45). A parte exposta (≈ coroa) fica entre 8.8 e 14.5 mm; 16 de 20 ficam dentro de ±2 DP da referência agrupada de coroa (10.38 ± 1.61 mm). Conclusão: o excesso de comprimento dos dentes do modelo está principalmente nas raízes. Os ápices continuam dentro do osso, e as raízes dos molares inferiores encostam no canal mandibular (camada 2).

## Camada 2: checagem das relações anatômicas

Relações topográficas descritas em livros-texto clássicos, testadas automaticamente na geometria. A página exata de cada fonte não foi conferida aqui; confira no seu exemplar.

| Teste | Medido no modelo | Status | Fonte |
|---|---|---|---|
| Osso hioide no nível de C3 | centro do hioide no nível 3.6 (disco C3/C4); a posição da cabeça altera esse nível | ⚠️ ALERTA | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Pescoço); Standring S (ed.). Gray's Anatomy: The Anatomical Basis of Clinical Practice, 41ª ed. |
| Bifurcação da a. carótida comum (D) entre C3 e C4 | fim superior da carótida comum no nível 4.5 (disco C4/C5) | ✅ OK | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Pescoço); Standring S (ed.). Gray's Anatomy: The Anatomical Basis of Clinical Practice, 41ª ed. |
| Bifurcação da a. carótida comum (E) entre C3 e C4 | fim superior da carótida comum no nível 4.5 (disco C4/C5) | ✅ OK | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Pescoço); Standring S (ed.). Gray's Anatomy: The Anatomical Basis of Clinical Practice, 41ª ed. |
| Ducto parotídeo (D) termina em frente ao 2º molar superior (17) | extremidade anterior dentro da extensão mesiodistal do 17 | ✅ OK | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Cabeça); Standring S (ed.). Gray's Anatomy: The Anatomical Basis of Clinical Practice, 41ª ed. |
| Ducto parotídeo (E) termina em frente ao 2º molar superior (27) | extremidade anterior dentro da extensão mesiodistal do 27 | ✅ OK | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Cabeça); Standring S (ed.). Gray's Anatomy: The Anatomical Basis of Clinical Practice, 41ª ed. |
| Forame mentual (D) entre os pré-molares inferiores ou abaixo do 2º pré-molar | saída do n. mentual 6.5 mm à frente do centro do 45 (44: 6.7 mm; 46: -8.4 mm) | ✅ OK | Standring S (ed.). Gray's Anatomy: The Anatomical Basis of Clinical Practice, 41ª ed.; Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. |
| Forame mentual (E) entre os pré-molares inferiores ou abaixo do 2º pré-molar | saída do n. mentual 6.5 mm à frente do centro do 35 (34: 6.7 mm; 36: -8.4 mm) | ✅ OK | Standring S (ed.). Gray's Anatomy: The Anatomical Basis of Clinical Practice, 41ª ed.; Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. |
| N. alveolar inferior (D) dentro da mandíbula (canal mandibular) | 89% dos pontos entre os forames mandibular e mentual com osso vestibular, lingual e inferior | ⚠️ ALERTA | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Cabeça) |
| N. alveolar inferior (E) dentro da mandíbula (canal mandibular) | 88% dos pontos entre os forames mandibular e mentual com osso vestibular, lingual e inferior | ⚠️ ALERTA | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Cabeça) |
| Canal mandibular abaixo do ápice do 46 | ápice 0.9 mm abaixo do topo do tronco do nervo (raiz invade o canal) | ⚠️ ALERTA | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Cabeça) |
| Canal mandibular abaixo do ápice do 47 | ápice 1.7 mm abaixo do topo do tronco do nervo (raiz invade o canal) | ⚠️ ALERTA | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Cabeça) |
| Canal mandibular abaixo do ápice do 36 | ápice 0.9 mm abaixo do topo do tronco do nervo (raiz invade o canal) | ⚠️ ALERTA | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Cabeça) |
| Canal mandibular abaixo do ápice do 37 | ápice 1.6 mm abaixo do topo do tronco do nervo (raiz invade o canal) | ⚠️ ALERTA | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed. (cap. Cabeça) |
| Ápices radiculares dentro do osso alveolar (maxila/mandíbula) | todos os 28 ápices dentro do osso | ✅ OK | Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (Clinically Oriented Anatomy), 8ª ed.; Standring S (ed.). Gray's Anatomy: The Anatomical Basis of Clinical Practice, 41ª ed. |
| Simetria bilateral das estruturas pares (dimensões D × E, tolerância 15%) | 148 pares dentro da tolerância; assimetria esperada: Artéria carótida comum (44%): a direita nasce do tronco braquiocefálico e a esquerda do arco da aorta (Moore) | ✅ OK | Critério de consistência do modelo (não é medida anatômica) |

### Comparação visual com atlas reconhecidos

Use os botões de vista do app ao lado do atlas de estudo (Netter, Sobotta ou Prometheus) e marque cada item. Imagens dos atlas não são incluídas por direitos autorais.

- **Anterior:** [ ] órbitas simétricas · [ ] abertura piriforme e septo (vômer/etmoide) na linha média · [ ] linha média entre 11/21 alinhada com 31/41 e com a sínfise
- **Lateral (D e E):** [ ] arco zigomático contínuo (processo temporal do zigomático + processo zigomático do temporal) · [ ] côndilo da mandíbula na fossa mandibular, à frente do meato acústico externo · [ ] processo coronoide sob o arco zigomático · [ ] forame mentual na altura dos pré-molares
- **Superior:** [ ] suturas coronal, sagital e lambdóidea nos encontros dos ossos · [ ] bregma e lambda na linha média
- **Inferior:** [ ] forame magno com côndilos occipitais dos dois lados · [ ] palato duro formado pelos processos palatinos da maxila e lâminas horizontais dos palatinos · [ ] arcada superior em forma parabólica
- **Posterior:** [ ] sutura lambdóidea · [ ] protuberância occipital externa na linha média · [ ] processos mastoides simétricos

## Camada 3: conferência

- Todas as medidas e relações fora do OK aparecem no app: a ficha da estrutura mostra o aviso **⚠ Dimensões** com o valor do modelo e o da referência (`src/data/conformidade.json`).
- Para refazer a conferência depois de qualquer mudança nos modelos: `node pipeline/07-referencias.mjs` e `node pipeline/08-validar.mjs`.

### Indicadores de sucesso

| Indicador | Meta | Atual |
|---|---|---|
| Medidas com fonte citada | 100% | 100% |
| Medidas de crânio dentro da tolerância | 100% | 91% |
| Dentes (11 a 15, 21 a 25, 31 a 35, 41 a 45) dentro da tolerância | 100% | 40% |
| Relações anatômicas OK | 100% (ou explicadas) | 53% |
| Falhas/alertas sem aviso no app | 0 | 0 |
