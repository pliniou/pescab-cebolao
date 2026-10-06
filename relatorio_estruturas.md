# Relatório de estruturas do Atlas 3D de Cabeça e Pescoço

**Fontes:**
- **Z-Anatomy** (CC BY-SA 4.0), modelo derivado do BodyParts3D e refinado. É a base do atlas: tudo de cabeça e pescoço que existe nele vem dele, para as peças se encaixarem entre si (mandíbula, dentes, músculos, nervos no canal).
- **BodyParts3D 4.0** (DBCLS, CC BY-SA 2.1 JP), pacote `isa_BP3D_4.0_obj_99.zip`: só para o que o Z-Anatomy não tem.

**Alinhamento BP3D → Z-Anatomy:** similaridade (escala 1.0261, rotação e translação) por ICP em 11 ossos não remodelados; distância mediana após o ajuste: **0.51 mm** (p90 1.81 mm). A mandíbula e os temporais foram remodelados no Z-Anatomy (diferença de ~3 mm) e por isso ficaram fora do ajuste.

**Coordenadas finais:** mm; x > 0 = esquerdo; y < 0 = anterior; z para cima. Lado conferido pela posição: **OK** em todas.

**Resumo:** 314 estruturas (279 do Z-Anatomy, 35 do BP3D; 125 extras). 23 itens pedidos não existem em nenhuma das duas fontes.

| Camada | Estruturas | Faces (antes da otimização) |
|---|---:|---:|
| Ossos | 23 | 113.667 |
| Vértebras cervicais | 7 | 15.712 |
| Dentes | 29 | 71.468 |
| Músculos | 90 | 313.120 |
| Nervos | 66 | 417.816 |
| Artérias | 54 | 284.376 |
| Veias | 34 | 75.720 |
| Glândulas | 11 | 12.128 |

## 1. Encontradas

Legenda: **+** extra (fora da lista, incluído por relevância odontológica) · **R** revisar · **~** trajeto modelado como curva (tubo; caminho aproximado) · ⚠ lado divergente. FMA "—" = conceito sem modelo no BP3D (só no Z-Anatomy), sem ID FMA no material baixado.

### Ossos (23)

| FMA | Nome em inglês | Nome PT-BR | Latim | Lado | Fonte (objetos) | Obs. |
|---|---|---|---|:-:|---|---|
| FMA54737 | inferior nasal concha | Concha nasal inferior direita | *Concha nasalis inferior* | D | ZA: Inferior nasal concha bone.r |  |
| FMA54738 | inferior nasal concha | Concha nasal inferior esquerda | *Concha nasalis inferior* | E | ZA: Inferior nasal concha bone.l |  |
| FMA52748 | mandible | Mandíbula | *Mandibula* | M | ZA: Mandible |  |
| FMA53649 | maxilla | Maxila direita | *Maxilla* | D | ZA: Maxilla.r |  |
| FMA53650 | maxilla | Maxila esquerda | *Maxilla* | E | ZA: Maxilla.l |  |
| FMA52736 | sphenoid bone | Osso esfenoide | *Os sphenoidale* | M | ZA: Sphenoid bone |  |
| FMA52740 | ethmoid | Osso etmoide | *Os ethmoidale* | M | ZA: Ethmoid bone |  |
| FMA52734 | frontal bone | Osso frontal | *Os frontale* | M | ZA: Frontal bone |  |
| FMA52749 | hyoid bone | Osso hioide | *Os hyoideum* | M | ZA: Hyoid bone |  |
| FMA53645 | lacrimal bone | Osso lacrimal direito | *Os lacrimale* | D | ZA: Lacrimal bone.r |  |
| FMA53646 | lacrimal bone | Osso lacrimal esquerdo | *Os lacrimale* | E | ZA: Lacrimal bone.l |  |
| FMA53647 | nasal bone | Osso nasal direito | *Os nasale* | D | ZA: Nasal bone.r |  |
| FMA53648 | nasal bone | Osso nasal esquerdo | *Os nasale* | E | ZA: Nasal bone.l |  |
| FMA52735 | occipital bone | Osso occipital | *Os occipitale* | M | ZA: Occipital bone |  |
| FMA53655 | palatine bone | Osso palatino direito | *Os palatinum* | D | ZA: Palatine bone.r |  |
| FMA53656 | palatine bone | Osso palatino esquerdo | *Os palatinum* | E | ZA: Palatine bone.l |  |
| FMA52788 | parietal bone | Osso parietal direito | *Os parietale* | D | ZA: Parietal bone.r |  |
| FMA52789 | parietal bone | Osso parietal esquerdo | *Os parietale* | E | ZA: Parietal bone.l |  |
| FMA52738 | temporal bone | Osso temporal direito | *Os temporale* | D | ZA: Temporal bone.r |  |
| FMA52739 | temporal bone | Osso temporal esquerdo | *Os temporale* | E | ZA: Temporal bone.l |  |
| FMA52892 | zygomatic bone | Osso zigomático direito | *Os zygomaticum* | D | ZA: Zygomatic bone.r |  |
| FMA52893 | zygomatic bone | Osso zigomático esquerdo | *Os zygomaticum* | E | ZA: Zygomatic bone.l |  |
| FMA9710 | vomer | Vômer | *Vomer* | M | ZA: Vomer |  |

### Vértebras cervicais (7)

| FMA | Nome em inglês | Nome PT-BR | Latim | Lado | Fonte (objetos) | Obs. |
|---|---|---|---|:-:|---|---|
| FMA12519 | atlas | Atlas (C1) | *Atlas* | M | ZA: Atlas (C1) |  |
| FMA12520 | axis | Áxis (C2) | *Axis* | M | ZA: Axis (C2) |  |
| FMA12521 | third cervical vertebra | Vértebra cervical III (C3) | *Vertebra cervicalis III* | M | ZA: Vertebra C3 |  |
| FMA12522 | fourth cervical vertebra | Vértebra cervical IV (C4) | *Vertebra cervicalis IV* | M | ZA: Vertebra C4 |  |
| FMA12523 | fifth cervical vertebra | Vértebra cervical V (C5) | *Vertebra cervicalis V* | M | ZA: Vertebra C5 |  |
| FMA12524 | sixth cervical vertebra | Vértebra cervical VI (C6) | *Vertebra cervicalis VI* | M | ZA: Vertebra C6 |  |
| FMA12525 | seventh cervical vertebra | Vértebra proeminente (C7) | *Vertebra prominens* | M | ZA: Vertebra C7 |  |

### Dentes (29)

| FMA | Nome em inglês | Nome PT-BR | Latim | Lado | Fonte (objetos) | Obs. |
|---|---|---|---|:-:|---|---|
| — | gingiva | Gengiva | *Gingiva* | M | ZA: Gingiva | + |
| FMA55681 | upper central secondary incisor tooth | Incisivo central superior direito (11) | *Dens incisivus* | D | ZA: Upper medial incisor.r |  |
| FMA55680 | upper lateral secondary incisor tooth | Incisivo lateral superior direito (12) | *Dens incisivus* | D | ZA: Upper lateral incisor.r |  |
| FMA55798 | upper secondary canine tooth | Canino superior direito (13) | *Dens caninus* | D | ZA: Upper canine.r |  |
| FMA55689 | upper first secondary premolar tooth | 1º pré-molar superior direito (14) | *Dens premolaris* | D | ZA: Upper first premolar.r |  |
| FMA55688 | upper second secondary premolar tooth | 2º pré-molar superior direito (15) | *Dens premolaris* | D | ZA: Upper second premolar.r |  |
| FMA55698 | upper first secondary molar tooth | 1º molar superior direito (16) | *Dens molaris* | D | ZA: Upper first molar tooth.r |  |
| FMA55697 | upper second secondary molar tooth | 2º molar superior direito (17) | *Dens molaris* | D | ZA: Upper second molar tooth.r |  |
| FMA55682 | upper central secondary incisor tooth | Incisivo central superior esquerdo (21) | *Dens incisivus* | E | ZA: Upper medial incisor.l |  |
| FMA55683 | upper lateral secondary incisor tooth | Incisivo lateral superior esquerdo (22) | *Dens incisivus* | E | ZA: Upper lateral incisor.l |  |
| FMA55799 | upper secondary canine tooth | Canino superior esquerdo (23) | *Dens caninus* | E | ZA: Upper canine.l |  |
| FMA55690 | upper first secondary premolar tooth | 1º pré-molar superior esquerdo (24) | *Dens premolaris* | E | ZA: Upper first premolar.l |  |
| FMA55691 | upper second secondary premolar tooth | 2º pré-molar superior esquerdo (25) | *Dens premolaris* | E | ZA: Upper second premolar.l |  |
| FMA55699 | upper first secondary molar tooth | 1º molar superior esquerdo (26) | *Dens molaris* | E | ZA: Upper first molar tooth.l |  |
| FMA55700 | upper second secondary molar tooth | 2º molar superior esquerdo (27) | *Dens molaris* | E | ZA: Upper second molar tooth.l |  |
| FMA57143 | lower central secondary incisor tooth | Incisivo central inferior esquerdo (31) | *Dens incisivus* | E | ZA: Lower medial incisor.l |  |
| FMA57141 | lower lateral secondary incisor tooth | Incisivo lateral inferior esquerdo (32) | *Dens incisivus* | E | ZA: Lower lateral incisor.l |  |
| FMA55687 | lower secondary canine tooth | Canino inferior esquerdo (33) | *Dens caninus* | E | ZA: Lower canine.l |  |
| FMA55693 | lower first secondary premolar tooth | 1º pré-molar inferior esquerdo (34) | *Dens premolaris* | E | ZA: Lower first premolar.l |  |
| FMA55692 | lower second secondary premolar tooth | 2º pré-molar inferior esquerdo (35) | *Dens premolaris* | E | ZA: Lower second premolar.l |  |
| FMA55704 | lower first secondary molar tooth | 1º molar inferior esquerdo (36) | *Dens molaris* | E | ZA: Lower first molar tooth.l |  |
| FMA55703 | lower second secondary molar tooth | 2º molar inferior esquerdo (37) | *Dens molaris* | E | ZA: Lower second molar tooth.l |  |
| FMA57142 | lower central secondary incisor tooth | Incisivo central inferior direito (41) | *Dens incisivus* | D | ZA: Lower medial incisor.r |  |
| FMA57140 | lower lateral secondary incisor tooth | Incisivo lateral inferior direito (42) | *Dens incisivus* | D | ZA: Lower lateral incisor.r |  |
| FMA55686 | lower secondary canine tooth | Canino inferior direito (43) | *Dens caninus* | D | ZA: Lower canine.r |  |
| FMA55694 | lower first secondary premolar tooth | 1º pré-molar inferior direito (44) | *Dens premolaris* | D | ZA: Lower first premolar.r |  |
| FMA55695 | lower second secondary premolar tooth | 2º pré-molar inferior direito (45) | *Dens premolaris* | D | ZA: Lower second premolar.r |  |
| FMA55705 | lower first secondary molar tooth | 1º molar inferior direito (46) | *Dens molaris* | D | ZA: Lower first molar tooth.r |  |
| FMA55706 | lower second secondary molar tooth | 2º molar inferior direito (47) | *Dens molaris* | D | ZA: Lower second molar tooth.r |  |

### Músculos (90)

| FMA | Nome em inglês | Nome PT-BR | Latim | Lado | Fonte (objetos) | Obs. |
|---|---|---|---|:-:|---|---|
| — | epicranial aponeurosis | Aponeurose epicrânica direita | *Galea aponeurotica* | D | ZA: Epicranial aponeurosis.r | + |
| — | epicranial aponeurosis | Aponeurose epicrânica esquerda | *Galea aponeurotica* | E | ZA: Epicranial aponeurosis.l | + |
| FMA54640 | tongue | Língua | *Lingua* | M | ZA: Tongue | + |
| — | depressor anguli oris | Músculo abaixador do ângulo da boca direito | *Musculus depressor anguli oris* | D | ZA: Depressor anguli oris.r |  |
| — | depressor anguli oris | Músculo abaixador do ângulo da boca esquerdo | *Musculus depressor anguli oris* | E | ZA: Depressor anguli oris.l |  |
| — | depressor labii inferioris | Músculo abaixador do lábio inferior direito | *Musculus depressor labii inferioris* | D | ZA: Depressor labii inferioris.r |  |
| — | depressor labii inferioris | Músculo abaixador do lábio inferior esquerdo | *Musculus depressor labii inferioris* | E | ZA: Depressor labii inferioris.l |  |
| — | depressor septi nasi | Músculo abaixador do septo nasal direito | *Musculus depressor septi nasi* | D | ZA: Depressor septi nasi.r | + |
| — | depressor septi nasi | Músculo abaixador do septo nasal esquerdo | *Musculus depressor septi nasi* | E | ZA: Depressor septi nasi.l | + |
| — | buccinator | Músculo bucinador direito | *Musculus buccinator* | D | ZA: Bucinator.r |  |
| — | buccinator | Músculo bucinador esquerdo | *Musculus buccinator* | E | ZA: Bucinator.l |  |
| FMA46635 | inferior pharyngeal constrictor | Músculo constritor inferior da faringe direito | *Musculus constrictor pharyngis inferior* | D | ZA: Inferior pharyngeal constrictor.r | + |
| FMA46636 | inferior pharyngeal constrictor | Músculo constritor inferior da faringe esquerdo | *Musculus constrictor pharyngis inferior* | E | ZA: Inferior pharyngeal constrictor.l | + |
| FMA46633 | middle pharyngeal constrictor | Músculo constritor médio da faringe direito | *Musculus constrictor pharyngis medius* | D | ZA: Middle pharyngeal constrictor.r | + |
| FMA46634 | middle pharyngeal constrictor | Músculo constritor médio da faringe esquerdo | *Musculus constrictor pharyngis medius* | E | ZA: Middle pharyngeal constrictor.l | + |
| FMA46631 | superior pharyngeal constrictor | Músculo constritor superior da faringe direito | *Musculus constrictor pharyngis superior* | D | ZA: Superior pharyngeal constrictor.r | + |
| FMA46632 | superior pharyngeal constrictor | Músculo constritor superior da faringe esquerdo | *Musculus constrictor pharyngis superior* | E | ZA: Superior pharyngeal constrictor.l | + |
| — | corrugator supercilii | Músculo corrugador do supercílio direito | *Musculus corrugator supercilii* | D | ZA: Corrugator supercilii.r | + |
| — | corrugator supercilii | Músculo corrugador do supercílio esquerdo | *Musculus corrugator supercilii* | E | ZA: Corrugator supercilii.l | + |
| FMA46733 | uvular muscle | Músculo da úvula | *Musculus uvulae* | M | BP3D: FJ2762 | + |
| FMA46292 | digastric | Músculo digástrico direito | *Musculus digastricus* | D | ZA: Anterior belly of digastric muscle.r, Posterior belly of digastric muscle.r |  |
| FMA46293 | digastric | Músculo digástrico esquerdo | *Musculus digastricus* | E | ZA: Anterior belly of digastric muscle.l, Posterior belly of digastric muscle.l |  |
| FMA13346 | sternohyoid | Músculo esterno-hióideo direito | *Musculus sternohyoideus* | D | ZA: Sternohyoid muscle.r |  |
| FMA13347 | sternohyoid | Músculo esterno-hióideo esquerdo | *Musculus sternohyoideus* | E | ZA: Sternohyoid muscle.l |  |
| FMA13408 | sternocleidomastoid | Músculo esternocleidomastóideo direito | *Musculus sternocleidomastoideus* | D | ZA: Sternocleidomastoid muscle.r |  |
| FMA13409 | sternocleidomastoid | Músculo esternocleidomastóideo esquerdo | *Musculus sternocleidomastoideus* | E | ZA: Sternocleidomastoid muscle.l |  |
| FMA13350 | sternothyroid | Músculo esternotireóideo direito | *Musculus sternothyroideus* | D | ZA: Sternothyroid muscle.r |  |
| FMA13351 | sternothyroid | Músculo esternotireóideo esquerdo | *Musculus sternothyroideus* | E | ZA: Sternothyroid muscle.l |  |
| FMA45826 | stylohyoid | Músculo estilo-hióideo direito | *Musculus stylohyoideus* | D | ZA: Stylohyoid muscle.r |  |
| FMA45827 | stylohyoid | Músculo estilo-hióideo esquerdo | *Musculus stylohyoideus* | E | ZA: Stylohyoid muscle.l |  |
| FMA46667 | stylopharyngeus | Músculo estilofaríngeo direito | *Musculus stylopharyngeus* | D | ZA: Stylopharyngeus muscle.r | + |
| FMA46668 | stylopharyngeus | Músculo estilofaríngeo esquerdo | *Musculus stylopharyngeus* | E | ZA: Stylopharyngeus muscle.l | + |
| FMA46326 | geniohyoid | Músculo gênio-hióideo direito | *Musculus geniohyoideus* | D | ZA: Geniohyoid muscle.r |  |
| FMA46327 | geniohyoid | Músculo gênio-hióideo esquerdo | *Musculus geniohyoideus* | E | ZA: Geniohyoid muscle.l |  |
| FMA46698 | genioglossus | Músculo genioglosso direito | *Musculus genioglossus* | D | ZA: Genioglossus muscle.r |  |
| FMA46702 | genioglossus | Músculo genioglosso esquerdo | *Musculus genioglossus* | E | ZA: Genioglossus muscle.l |  |
| FMA46703 | hyoglossus | Músculo hioglosso direito | *Musculus hyoglossus* | D | ZA: Hyoglossus muscle.r |  |
| FMA46704 | hyoglossus | Músculo hioglosso esquerdo | *Musculus hyoglossus* | E | ZA: Hyoglossus muscle.l |  |
| — | levator anguli oris | Músculo levantador do ângulo da boca direito | *Musculus levator anguli oris* | D | ZA: Levator anguli oris.r |  |
| — | levator anguli oris | Músculo levantador do ângulo da boca esquerdo | *Musculus levator anguli oris* | E | ZA: Levator anguli oris.l |  |
| — | levator labii superioris | Músculo levantador do lábio superior direito | *Musculus levator labii superioris* | D | ZA: Levator labii superioris.r |  |
| — | levator labii superioris alaeque nasi | Músculo levantador do lábio superior e da asa do nariz direito | *Musculus levator labii superioris alaeque nasi* | D | ZA: Levator nasolabialis.r | No Z-Anatomy chama-se "Levator nasolabialis" (sinônimo). |
| — | levator labii superioris alaeque nasi | Músculo levantador do lábio superior e da asa do nariz esquerdo | *Musculus levator labii superioris alaeque nasi* | E | ZA: Levator nasolabialis.l | No Z-Anatomy chama-se "Levator nasolabialis" (sinônimo). |
| — | levator labii superioris | Músculo levantador do lábio superior esquerdo | *Musculus levator labii superioris* | E | ZA: Levator labii superioris.l |  |
| FMA46728 | levator veli palatini | Músculo levantador do véu palatino direito | *Musculus levator veli palatini* | D | BP3D: FJ2753 | + |
| FMA46729 | levator veli palatini | Músculo levantador do véu palatino esquerdo | *Musculus levator veli palatini* | E | BP3D: FJ2741 | + |
| — | masseter | Músculo masseter direito | *Musculus masseter* | D | ZA: Superficial part of masseter.r, Deep part of masseter.r |  |
| — | masseter | Músculo masseter esquerdo | *Musculus masseter* | E | ZA: Superficial part of masseter.l, Deep part of masseter.l |  |
| — | mentalis | Músculo mentual direito | *Musculus mentalis* | D | ZA: Mentalis muscle.r |  |
| — | mentalis | Músculo mentual esquerdo | *Musculus mentalis* | E | ZA: Mentalis muscle.l |  |
| FMA46321 | mylohyoid | Músculo milo-hióideo direito | *Musculus mylohyoideus* | D | ZA: Mylohyoid muscle.r |  |
| FMA46322 | mylohyoid | Músculo milo-hióideo esquerdo | *Musculus mylohyoideus* | E | ZA: Mylohyoid muscle.l |  |
| — | nasalis muscle | Músculo nasal direito | *Musculus nasalis* | D | ZA: Nasalis muscle.r | + |
| — | nasalis muscle | Músculo nasal esquerdo | *Musculus nasalis* | E | ZA: Nasalis muscle.l | + |
| — | occipitofrontalis | Músculo occipitofrontal direito | *Musculus occipitofrontalis* | D | ZA: Frontalis muscle.r, Occipitalis muscle.r | Ventres frontal e occipital (a aponeurose epicrânica é uma peça separada). |
| — | occipitofrontalis | Músculo occipitofrontal esquerdo | *Musculus occipitofrontalis* | E | ZA: Frontalis muscle.l, Occipitalis muscle.l | Ventres frontal e occipital (a aponeurose epicrânica é uma peça separada). |
| FMA13348 | omohyoid | Músculo omo-hióideo direito | *Musculus omohyoideus* | D | ZA: Omohyoid muscle.r |  |
| FMA13349 | omohyoid | Músculo omo-hióideo esquerdo | *Musculus omohyoideus* | E | ZA: Omohyoid muscle.l |  |
| — | orbicularis oris | Músculo orbicular da boca direito | *Musculus orbicularis oris* | D | ZA: Orbicularis oris muscle.r |  |
| — | orbicularis oris | Músculo orbicular da boca esquerdo | *Musculus orbicularis oris* | E | ZA: Orbicularis oris muscle.l |  |
| — | orbicularis oculi | Músculo orbicular do olho direito | *Musculus orbicularis oculi* | D | ZA: Orbital part of orbicularis oculi.r, Palpebral part of orbicularis oculi.r |  |
| — | orbicularis oculi | Músculo orbicular do olho esquerdo | *Musculus orbicularis oculi* | E | ZA: Orbital part of orbicularis oculi.l, Palpebral part of orbicularis oculi.l |  |
| FMA46671 | palatopharyngeus | Músculo palatofaríngeo direito | *Musculus palatopharyngeus* | D | ZA: Palatopharyngeus muscle.r | + |
| FMA46672 | palatopharyngeus | Músculo palatofaríngeo esquerdo | *Musculus palatopharyngeus* | E | ZA: Palatopharyngeus muscle.l | + |
| — | procerus muscle | Músculo prócero direito | *Musculus procerus* | D | ZA: Procerus muscle.r | + |
| — | procerus muscle | Músculo prócero esquerdo | *Musculus procerus* | E | ZA: Procerus muscle.l | + |
| — | lateral pterygoid | Músculo pterigóideo lateral direito | *Musculus pterygoideus lateralis* | D | ZA: Superior head of lateral pterygoid muscle.r, Inferior head of lateral pterygoid muscle.r |  |
| — | lateral pterygoid | Músculo pterigóideo lateral esquerdo | *Musculus pterygoideus lateralis* | E | ZA: Superior head of lateral pterygoid muscle.l, Inferior head of lateral pterygoid muscle.l |  |
| — | medial pterygoid | Músculo pterigóideo medial direito | *Musculus pterygoideus medialis* | D | ZA: Medial pterygoid muscle.r |  |
| — | medial pterygoid | Músculo pterigóideo medial esquerdo | *Musculus pterygoideus medialis* | E | ZA: Medial pterygoid muscle.l |  |
| — | risorius | Músculo risório direito | *Musculus risorius* | D | ZA: Risorius muscle.r |  |
| — | risorius | Músculo risório esquerdo | *Musculus risorius* | E | ZA: Risorius muscle.l |  |
| FMA46669 | salpingopharyngeus | Músculo salpingofaríngeo direito | *Musculus salpingopharyngeus* | D | BP3D: FJ2757 | + |
| FMA46670 | salpingopharyngeus | Músculo salpingofaríngeo esquerdo | *Musculus salpingopharyngeus* | E | BP3D: FJ2745 | + |
| — | temporalis | Músculo temporal direito | *Musculus temporalis* | D | ZA: Temporalis muscle.r |  |
| — | temporalis | Músculo temporal esquerdo | *Musculus temporalis* | E | ZA: Temporalis muscle.l |  |
| FMA46731 | tensor veli palatini | Músculo tensor do véu palatino direito | *Musculus tensor veli palatini* | D | BP3D: FJ2760 | + |
| FMA46732 | tensor veli palatini | Músculo tensor do véu palatino esquerdo | *Musculus tensor veli palatini* | E | BP3D: FJ2748 | + |
| FMA13352 | thyrohyoid | Músculo tíreo-hióideo direito | *Musculus thyrohyoideus* | D | ZA: Thyrohyoid muscle.r |  |
| FMA13353 | thyrohyoid | Músculo tíreo-hióideo esquerdo | *Musculus thyrohyoideus* | E | ZA: Thyrohyoid muscle.l |  |
| — | zygomaticus major | Músculo zigomático maior direito | *Musculus zygomaticus major* | D | ZA: Zygomaticus major muscle.r |  |
| — | zygomaticus major | Músculo zigomático maior esquerdo | *Musculus zygomaticus major* | E | ZA: Zygomaticus major muscle.l |  |
| — | zygomaticus minor | Músculo zigomático menor direito | *Musculus zygomaticus minor* | D | ZA: Zygomaticus minor muscle.r |  |
| — | zygomaticus minor | Músculo zigomático menor esquerdo | *Musculus zygomaticus minor* | E | ZA: Zygomaticus minor muscle.l |  |
| FMA45739 | platysma | Platisma direito | *Platysma* | D | ZA: Platysma.r |  |
| FMA45740 | platysma | Platisma esquerdo | *Platysma* | E | ZA: Platysma.l |  |
| FMA55619 | pterygomandibular raphe | Rafe pterigomandibular direita | *Raphe pterygomandibularis* | D | BP3D: FJ2756 | + |
| FMA55620 | pterygomandibular raphe | Rafe pterigomandibular esquerda | *Raphe pterygomandibularis* | E | BP3D: FJ2744 | + |
| FMA258850 | intermediate tendon | Tendão intermédio do músculo digástrico direito | *Tendo intermedius musculi digastrici* | D | ZA: Intermediate tendon of digastric muscle.r | + R |
| — | intermediate tendon | Tendão intermédio do músculo digástrico esquerdo | *Tendo intermedius musculi digastrici* | E | ZA: Intermediate tendon of digastric muscle.l | + R |

### Nervos (66)

| FMA | Nome em inglês | Nome PT-BR | Latim | Lado | Fonte (objetos) | Obs. |
|---|---|---|---|:-:|---|---|
| — | chorda tympani | Corda do tímpano direita | *Chorda tympani* | D | ZA: Chorda tympani.r | ~ |
| — | chorda tympani | Corda do tímpano esquerda | *Chorda tympani* | E | ZA: Chorda tympani.l | ~ |
| FMA53549 | ciliary ganglion | Gânglio ciliar direito | *Ganglion ciliare* | D | BP3D: FJ1339 | + |
| FMA53550 | ciliary ganglion | Gânglio ciliar esquerdo | *Ganglion ciliare* | E | BP3D: FJ1288 | + |
| — | abducent nerve | Nervo abducente (VI) direito | *Nervus abducens* | D | ZA: Abducens nerve (VI).r | ~ |
| — | abducent nerve | Nervo abducente (VI) esquerdo | *Nervus abducens* | E | ZA: Abducens nerve (VI).l | ~ |
| — | accessory nerve | Nervo acessório (XI) direito | *Nervus accessorius* | D | ZA: Accessory nerve (XI).r | ~ |
| — | accessory nerve | Nervo acessório (XI) esquerdo | *Nervus accessorius* | E | ZA: Accessory nerve (XI).l | ~ |
| — | inferior alveolar nerve | Nervo alveolar inferior direito | *Nervus alveolaris inferior* | D | ZA: Inferior alveolar nerve.r | ~ |
| — | inferior alveolar nerve | Nervo alveolar inferior esquerdo | *Nervus alveolaris inferior* | E | ZA: Inferior alveolar nerve.l | ~ |
| — | buccal nerve | Nervo bucal direito | *Nervus buccalis* | D | ZA: Buccal nerve.r | ~ |
| — | buccal nerve | Nervo bucal esquerdo | *Nervus buccalis* | E | ZA: Buccal nerve.l | ~ |
| FMA52676 | anterior ethmoidal nerve | Nervo etmoidal anterior direito | *Nervus ethmoidalis anterior* | D | BP3D: FJ1333 | + |
| FMA52677 | anterior ethmoidal nerve | Nervo etmoidal anterior esquerdo | *Nervus ethmoidalis anterior* | E | BP3D: FJ1283 | + |
| FMA52715 | posterior ethmoidal nerve | Nervo etmoidal posterior direito | *Nervus ethmoidalis posterior* | D | BP3D: FJ1366 | + |
| FMA52716 | posterior ethmoidal nerve | Nervo etmoidal posterior esquerdo | *Nervus ethmoidalis posterior* | E | BP3D: FJ1315 | + |
| — | facial nerve | Nervo facial (VII) direito | *Nervus facialis* | D | ZA: Facial nerve (VII).r | ~ Só o tronco (até a parótida); os ramos terminais da face não existem nas duas fontes. |
| — | facial nerve | Nervo facial (VII) esquerdo | *Nervus facialis* | E | ZA: Facial nerve (VII).l | ~ Só o tronco (até a parótida); os ramos terminais da face não existem nas duas fontes. |
| FMA52639 | frontal nerve | Nervo frontal direito | *Nervus frontalis* | D | BP3D: FJ1341 | + |
| FMA52640 | frontal nerve | Nervo frontal esquerdo | *Nervus frontalis* | E | BP3D: FJ1290 | + |
| — | glossopharyngeal nerve | Nervo glossofaríngeo (IX) direito | *Nervus glossopharyngeus* | D | ZA: Glossopharyngeal nerve (IX).r | ~ |
| — | glossopharyngeal nerve | Nervo glossofaríngeo (IX) esquerdo | *Nervus glossopharyngeus* | E | ZA: Glossopharyngeal nerve (IX).l | ~ |
| — | hypoglossal nerve | Nervo hipoglosso (XII) direito | *Nervus hypoglossus* | D | ZA: Hypoglossal nerve (XII).r | ~ |
| — | hypoglossal nerve | Nervo hipoglosso (XII) esquerdo | *Nervus hypoglossus* | E | ZA: Hypoglossal nerve (XII).l | ~ |
| FMA52698 | infratrochlear nerve | Nervo infratroclear direito | *Nervus infratrochlearis* | D | BP3D: FJ1347 | + |
| FMA52699 | infratrochlear nerve | Nervo infratroclear esquerdo | *Nervus infratrochlearis* | E | BP3D: FJ1296 | + |
| FMA52629 | lacrimal nerve | Nervo lacrimal direito | *Nervus lacrimalis* | D | BP3D: FJ1351 | + |
| FMA52630 | lacrimal nerve | Nervo lacrimal esquerdo | *Nervus lacrimalis* | E | BP3D: FJ1300 | + |
| — | lingual nerve | Nervo lingual direito | *Nervus lingualis* | D | ZA: Lingual nerve.r | ~ |
| — | lingual nerve | Nervo lingual esquerdo | *Nervus lingualis* | E | ZA: Lingual nerve.l | ~ |
| — | mandibular nerve | Nervo mandibular (V3) direito | *Nervus mandibularis* | D | ZA: Anterior division of mandibular nerve.r, Posterior division of mandibular nerve.r | ~ Representado pelos troncos anterior e posterior do Z-Anatomy. |
| — | mandibular nerve | Nervo mandibular (V3) esquerdo | *Nervus mandibularis* | E | ZA: Anterior division of mandibular nerve.l, Posterior division of mandibular nerve.l | ~ Representado pelos troncos anterior e posterior do Z-Anatomy. |
| — | maxillary nerve | Nervo maxilar (V2) direito | *Nervus maxillaris* | D | ZA: Maxillary nerve.r | ~ Só o tronco; os ramos (infraorbital, alveolares superiores, palatinos) não existem nas duas fontes. |
| — | maxillary nerve | Nervo maxilar (V2) esquerdo | *Nervus maxillaris* | E | ZA: Maxillary nerve.l | ~ Só o tronco; os ramos (infraorbital, alveolares superiores, palatinos) não existem nas duas fontes. |
| — | mental nerve | Nervo mentual direito | *Nervus mentalis* | D | ZA: Mental nerve.r | ~ |
| — | mental nerve | Nervo mentual esquerdo | *Nervus mentalis* | E | ZA: Mental nerve.l | ~ |
| — | nerve to mylohyoid muscle | Nervo milo-hióideo direito | *Nervus mylohyoideus* | D | ZA: Nerve to mylohyoid muscle.r | + ~ |
| — | nerve to mylohyoid muscle | Nervo milo-hióideo esquerdo | *Nervus mylohyoideus* | E | ZA: Nerve to mylohyoid muscle.l | + ~ |
| FMA52669 | nasociliary nerve | Nervo nasociliar direito | *Nervus nasociliaris* | D | BP3D: FJ1361 | + |
| FMA52670 | nasociliary nerve | Nervo nasociliar esquerdo | *Nervus nasociliaris* | E | BP3D: FJ1310 | + |
| — | oculomotor nerve | Nervo oculomotor (III) direito | *Nervus oculomotorius* | D | ZA: Oculomotor nerve (III).r | ~ |
| — | oculomotor nerve | Nervo oculomotor (III) esquerdo | *Nervus oculomotorius* | E | ZA: Oculomotor nerve (III).l | ~ |
| FMA52622 | ophthalmic nerve | Nervo oftálmico (V1) direito | *Nervus ophthalmicus* | D | BP3D: FJ1363 |  |
| FMA52623 | ophthalmic nerve | Nervo oftálmico (V1) esquerdo | *Nervus ophthalmicus* | E | BP3D: FJ1312 |  |
| — | olfactory nerve | Nervo olfatório (I) direito | *Nervus olfactorius* | D | ZA: Olfactory nerve (I).r | ~ |
| — | olfactory nerve | Nervo olfatório (I) esquerdo | *Nervus olfactorius* | E | ZA: Olfactory nerve (I).l | ~ |
| FMA50875 | optic nerve | Nervo óptico (II) direito | *Nervus opticus* | D | ZA: Optic nerve (II).r | ~ |
| FMA50878 | optic nerve | Nervo óptico (II) esquerdo | *Nervus opticus* | E | ZA: Optic nerve (II).l | ~ |
| FMA52656 | supra-orbital nerve | Nervo supraorbital direito | *Nervus supraorbitalis* | D | BP3D: FJ1376 | + |
| FMA52657 | supra-orbital nerve | Nervo supraorbital esquerdo | *Nervus supraorbitalis* | E | BP3D: FJ1325 | + |
| FMA52643 | supratrochlear nerve | Nervo supratroclear direito | *Nervus supratrochlearis* | D | BP3D: FJ1377 | + |
| FMA52644 | supratrochlear nerve | Nervo supratroclear esquerdo | *Nervus supratrochlearis* | E | BP3D: FJ1326 | + |
| — | trigeminal nerve | Nervo trigêmeo (V) direito | *Nervus trigeminus* | D | ZA: Trigeminal nerve (V).r, Sensory root of trigeminal nerve.r, Motor root of trigeminal nerve.r | ~ Tronco e raízes sensitiva e motora; o gânglio trigeminal não existe como peça própria. |
| — | trigeminal nerve | Nervo trigêmeo (V) esquerdo | *Nervus trigeminus* | E | ZA: Trigeminal nerve (V).l, Sensory root of trigeminal nerve.l, Motor root of trigeminal nerve.l | ~ Tronco e raízes sensitiva e motora; o gânglio trigeminal não existe como peça própria. |
| FMA50881 | trochlear nerve | Nervo troclear (IV) direito | *Nervus trochlearis* | D | ZA: Trochlear nerve (IV).r | ~ |
| FMA50882 | trochlear nerve | Nervo troclear (IV) esquerdo | *Nervus trochlearis* | E | ZA: Trochlear nerve (IV).l | ~ |
| — | vagus nerve | Nervo vago (X) direito | *Nervus vagus* | D | ZA: Vagus nerve (X).r | ~ |
| — | vagus nerve | Nervo vago (X) esquerdo | *Nervus vagus* | E | ZA: Vagus nerve (X).l | ~ |
| — | vestibulocochlear nerve | Nervo vestibulococlear (VIII) direito | *Nervus vestibulocochlearis* | D | ZA: Vestibulocochlear nerve (VIII).r | ~ |
| — | vestibulocochlear nerve | Nervo vestibulococlear (VIII) esquerdo | *Nervus vestibulocochlearis* | E | ZA: Vestibulocochlear nerve (VIII).l | ~ |
| FMA7041 | short ciliary nerve | Nervos ciliares curtos direitos | *Nervi ciliares breves* | D | BP3D: FJ1370 | + Saem do gânglio ciliar (não são ramos diretos do V1). |
| FMA7041 | short ciliary nerve | Nervos ciliares curtos esquerdos | *Nervi ciliares breves* | E | BP3D: FJ1319 | + Saem do gânglio ciliar (não são ramos diretos do V1). |
| FMA82734 | long ciliary nerve | Nervos ciliares longos direitos | *Nervi ciliares longi* | D | BP3D: FJ1369 | + |
| FMA82735 | long ciliary nerve | Nervos ciliares longos esquerdos | *Nervi ciliares longi* | E | BP3D: FJ1318 | + |
| FMA52673 | communicating branch of nasociliary nerve with ciliary ganglion | Ramo comunicante do n. nasociliar com o gânglio ciliar direito | *Ramus communicans cum ganglio ciliari* | D | BP3D: FJ1362 | + |
| FMA52674 | communicating branch of nasociliary nerve with ciliary ganglion | Ramo comunicante do n. nasociliar com o gânglio ciliar esquerdo | *Ramus communicans cum ganglio ciliari* | E | BP3D: FJ1311 | + |

### Artérias (54)

| FMA | Nome em inglês | Nome PT-BR | Latim | Lado | Fonte (objetos) | Obs. |
|---|---|---|---|:-:|---|---|
| — | inferior alveolar artery | Artéria alveolar inferior direita | *Arteria alveolaris inferior* | D | ZA: Inferior alveolar artery.r | + ~ |
| — | inferior alveolar artery | Artéria alveolar inferior esquerda | *Arteria alveolaris inferior* | E | ZA: Inferior alveolar artery.l | + ~ |
| — | posterior superior alveolar artery | Artéria alveolar superior posterior direita | *Arteria alveolaris superior posterior* | D | ZA: Posterior superior alveolar artery.r | + ~ |
| — | posterior superior alveolar artery | Artéria alveolar superior posterior esquerda | *Arteria alveolaris superior posterior* | E | ZA: Posterior superior alveolar artery.l | + ~ |
| — | angular artery | Artéria angular direita | *Arteria angularis* | D | ZA: Angular artery.r | + ~ |
| — | angular artery | Artéria angular esquerda | *Arteria angularis* | E | ZA: Angular artery.l | + ~ |
| — | buccal artery | Artéria bucal direita | *Arteria buccalis* | D | ZA: Buccal artery.r | + ~ |
| — | buccal artery | Artéria bucal esquerda | *Arteria buccalis* | E | ZA: Buccal artery.l | + ~ |
| FMA3941 | common carotid artery | Artéria carótida comum direita | *Arteria carotis communis* | D | ZA: Right common carotid artery | ~ |
| FMA4058 | common carotid artery | Artéria carótida comum esquerda | *Arteria carotis communis* | E | ZA: Left common carotid artery | ~ |
| — | external carotid artery | Artéria carótida externa direita | *Arteria carotis externa* | D | ZA: External carotid artery.r | ~ |
| — | external carotid artery | Artéria carótida externa esquerda | *Arteria carotis externa* | E | ZA: External carotid artery.l | ~ |
| FMA3949 | internal carotid artery | Artéria carótida interna direita | *Arteria carotis interna* | D | ZA: Internal carotid artery.r | ~ |
| FMA4062 | internal carotid artery | Artéria carótida interna esquerda | *Arteria carotis interna* | E | ZA: Internal carotid artery.l | ~ |
| — | facial artery | Artéria facial direita | *Arteria facialis* | D | ZA: Facial artery.r | ~ |
| — | facial artery | Artéria facial esquerda | *Arteria facialis* | E | ZA: Facial artery.l | ~ |
| — | ascending pharyngeal artery | Artéria faríngea ascendente direita | *Arteria pharyngea ascendens* | D | ZA: Ascending pharyngeal artery.r | + ~ |
| — | ascending pharyngeal artery | Artéria faríngea ascendente esquerda | *Arteria pharyngea ascendens* | E | ZA: Ascending pharyngeal artery.l | + ~ |
| — | infra-orbital artery | Artéria infraorbital direita | *Arteria infraorbitalis* | D | ZA: Infra-orbital artery.r | + ~ |
| — | infra-orbital artery | Artéria infraorbital esquerda | *Arteria infraorbitalis* | E | ZA: Infra-orbital artery.l | + ~ |
| — | inferior labial artery | Artéria labial inferior direita | *Arteria labialis inferior* | D | ZA: Inferior labial artery.r | + ~ |
| — | inferior labial artery | Artéria labial inferior esquerda | *Arteria labialis inferior* | E | ZA: Inferior labial artery.l | + ~ |
| — | superior labial artery | Artéria labial superior direita | *Arteria labialis superior* | D | ZA: Superior labial artery.r | + ~ |
| — | superior labial artery | Artéria labial superior esquerda | *Arteria labialis superior* | E | ZA: Superior labial artery.l | + ~ |
| — | maxillary artery | Artéria maxilar direita | *Arteria maxillaris* | D | ZA: Maxillary artery.r | ~ |
| — | maxillary artery | Artéria maxilar esquerda | *Arteria maxillaris* | E | ZA: Maxillary artery.l | ~ |
| — | middle meningeal artery | Artéria meníngea média direita | *Arteria meningea media* | D | ZA: Middle meningeal artery.r | ~ |
| — | middle meningeal artery | Artéria meníngea média esquerda | *Arteria meningea media* | E | ZA: Middle meningeal artery.l | ~ |
| — | occipital artery | Artéria occipital direita | *Arteria occipitalis* | D | ZA: Occipital artery.r | ~ |
| — | occipital artery | Artéria occipital esquerda | *Arteria occipitalis* | E | ZA: Occipital artery.l | ~ |
| — | descending palatine artery | Artéria palatina descendente direita | *Arteria palatina descendens* | D | ZA: Descending palatine artery.r | + ~ |
| — | descending palatine artery | Artéria palatina descendente esquerda | *Arteria palatina descendens* | E | ZA: Descending palatine artery.l | + ~ |
| — | greater palatine artery | Artéria palatina maior direita | *Arteria palatina major* | D | ZA: Greater palatine artery.r | + ~ |
| — | greater palatine artery | Artéria palatina maior esquerda | *Arteria palatina major* | E | ZA: Greater palatine artery.l | + ~ |
| — | submental artery | Artéria submentual direita | *Arteria submentalis* | D | ZA: Submental artery.r | + ~ |
| — | submental artery | Artéria submentual esquerda | *Arteria submentalis* | E | ZA: Submental artery.l | + ~ |
| — | anterior deep temporal artery | Artéria temporal profunda anterior direita | *Arteria temporalis profunda anterior* | D | ZA: Anterior deep temporal artery.r | + ~ |
| — | anterior deep temporal artery | Artéria temporal profunda anterior esquerda | *Arteria temporalis profunda anterior* | E | ZA: Anterior deep temporal artery.l | + ~ |
| — | posterior deep temporal artery | Artéria temporal profunda posterior direita | *Arteria temporalis profunda posterior* | D | ZA: Posterior deep temporal artery.r | + ~ |
| — | posterior deep temporal artery | Artéria temporal profunda posterior esquerda | *Arteria temporalis profunda posterior* | E | ZA: Posterior deep temporal artery.l | + ~ |
| — | superficial temporal artery | Artéria temporal superficial direita | *Arteria temporalis superficialis* | D | ZA: Superficial temporal artery.r | ~ |
| — | superficial temporal artery | Artéria temporal superficial esquerda | *Arteria temporalis superficialis* | E | ZA: Superficial temporal artery.l | ~ |
| — | transverse facial artery | Artéria transversa da face direita | *Arteria transversa faciei* | D | ZA: Transverse facial artery.r | + ~ |
| — | transverse facial artery | Artéria transversa da face esquerda | *Arteria transversa faciei* | E | ZA: Transverse facial artery.l | + ~ |
| — | frontal branch of superficial temporal artery | Ramo frontal da a. temporal superficial direito | *Ramus frontalis* | D | ZA: Frontal branch of superficial temporal artery.r | + ~ |
| — | frontal branch of superficial temporal artery | Ramo frontal da a. temporal superficial esquerdo | *Ramus frontalis* | E | ZA: Frontal branch of superficial temporal artery.l | + ~ |
| — | mental branch of inferior alveolar artery | Ramo mentual da a. alveolar inferior direito | *Ramus mentalis arteriae alveolaris inferioris* | D | ZA: Mental branch of inferior alveolar artery.r | + ~ |
| — | mental branch of inferior alveolar artery | Ramo mentual da a. alveolar inferior esquerdo | *Ramus mentalis arteriae alveolaris inferioris* | E | ZA: Mental branch of inferior alveolar artery.l | + ~ |
| — | mylohyoid branch of inferior alveolar artery | Ramo milo-hióideo da a. alveolar inferior direito | *Ramus mylohyoideus arteriae alveolaris inferioris* | D | ZA: Mylohyoid branch of inferior alveolar artery.r | + ~ |
| — | mylohyoid branch of inferior alveolar artery | Ramo milo-hióideo da a. alveolar inferior esquerdo | *Ramus mylohyoideus arteriae alveolaris inferioris* | E | ZA: Mylohyoid branch of inferior alveolar artery.l | + ~ |
| — | posterior lateral nasal branches of sphenopalatine artery. | Ramos nasais posteriores laterais da a. esfenopalatina direitos | *Arteriae nasales posteriores laterales* | D | ZA: Posterior lateral nasal branches of sphenopalatine artery..r | + ~ |
| — | posterior lateral nasal branches of sphenopalatine artery. | Ramos nasais posteriores laterais da a. esfenopalatina esquerdos | *Arteriae nasales posteriores laterales* | E | ZA: Posterior lateral nasal branches of sphenopalatine artery..l | + ~ |
| — | posterior septal branches of sphenopalatine artery | Ramos septais posteriores da a. esfenopalatina direitos | *Rami septales posteriores* | D | ZA: Posterior septal branches of sphenopalatine artery.r | + ~ |
| — | posterior septal branches of sphenopalatine artery | Ramos septais posteriores da a. esfenopalatina esquerdos | *Rami septales posteriores* | E | ZA: Posterior septal branches of sphenopalatine artery.l | + ~ |

### Veias (34)

| FMA | Nome em inglês | Nome PT-BR | Latim | Lado | Fonte (objetos) | Obs. |
|---|---|---|---|:-:|---|---|
| — | anterior division of retromandibular vein | Divisão anterior da v. retromandibular direita | *Vena retromandibularis, divisio anterior* | D | ZA: Anterior division of retromandibular vein.r | + R ~ |
| — | anterior division of retromandibular vein | Divisão anterior da v. retromandibular esquerda | *Vena retromandibularis, divisio anterior* | E | ZA: Anterior division of retromandibular vein.l | + R ~ |
| — | posterior division of retromandibular vein | Divisão posterior da v. retromandibular direita | *Vena retromandibularis, divisio posterior* | D | ZA: Posterior division of retromandibular vein.r | + R ~ |
| — | posterior division of retromandibular vein | Divisão posterior da v. retromandibular esquerda | *Vena retromandibularis, divisio posterior* | E | ZA: Posterior division of retromandibular vein.l | + R ~ |
| — | angular vein | Veia angular direita | *Vena angularis* | D | ZA: Angular vein.r | + ~ |
| — | angular vein | Veia angular esquerda | *Vena angularis* | E | ZA: Angular vein.l | + ~ |
| — | posterior auricular vein | Veia auricular posterior direita | *Vena auricularis posterior* | D | ZA: Posterior auricular vein.r | + ~ |
| — | posterior auricular vein | Veia auricular posterior esquerda | *Vena auricularis posterior* | E | ZA: Posterior auricular vein.l | + ~ |
| — | common facial vein | Veia facial comum direita | *Vena facialis communis* | D | ZA: Common facial vein.r | + R ~ |
| — | common facial vein | Veia facial comum esquerda | *Vena facialis communis* | E | ZA: Common facial vein.l | + R ~ |
| — | facial vein | Veia facial direita | *Vena facialis* | D | ZA: Facial vein.r | ~ |
| — | facial vein | Veia facial esquerda | *Vena facialis* | E | ZA: Facial vein.l | ~ |
| — | anterior jugular vein | Veia jugular anterior direita | *Vena jugularis anterior* | D | ZA: Anterior jugular vein.r | ~ |
| — | anterior jugular vein | Veia jugular anterior esquerda | *Vena jugularis anterior* | E | ZA: Anterior jugular vein.l | ~ |
| — | external jugular vein | Veia jugular externa direita | *Vena jugularis externa* | D | ZA: External jugular vein.r | ~ |
| — | external jugular vein | Veia jugular externa esquerda | *Vena jugularis externa* | E | ZA: External jugular vein.l | ~ |
| FMA4754 | internal jugular vein | Veia jugular interna direita | *Vena jugularis interna* | D | ZA: Internal jugular vein.r | ~ |
| FMA4762 | internal jugular vein | Veia jugular interna esquerda | *Vena jugularis interna* | E | ZA: Internal jugular vein.l | ~ |
| — | superior labial vein | Veia labial superior direita | *Vena labialis superior* | D | ZA: Superior labial vein.r | + ~ |
| — | superior labial vein | Veia labial superior esquerda | *Vena labialis superior* | E | ZA: Superior labial vein.l | + ~ |
| — | lingual vein | Veia lingual direita | *Vena lingualis* | D | ZA: Lingual vein.r | + ~ |
| — | lingual vein | Veia lingual esquerda | *Vena lingualis* | E | ZA: Lingual vein.l | + ~ |
| — | retromandibular vein | Veia retromandibular direita | *Vena retromandibularis* | D | ZA: Retromandibular vein.r | ~ |
| — | retromandibular vein | Veia retromandibular esquerda | *Vena retromandibularis* | E | ZA: Retromandibular vein.l | ~ |
| — | submental vein | Veia submentual direita | *Vena submentalis* | D | ZA: Submental vein.r | + ~ |
| — | submental vein | Veia submentual esquerda | *Vena submentalis* | E | ZA: Submental vein.l | + ~ |
| — | superior thyroid vein | Veia tireóidea superior direita | *Vena thyroidea superior* | D | ZA: Superior thyroid vein.r | + ~ |
| — | superior thyroid vein | Veia tireóidea superior esquerda | *Vena thyroidea superior* | E | ZA: Superior thyroid vein.l | + ~ |
| — | inferior labial veins | Veias labiais inferiores direitas | *Venae labiales inferiores* | D | ZA: Inferior labial veins.r | + ~ |
| — | inferior labial veins | Veias labiais inferiores esquerdas | *Venae labiales inferiores* | E | ZA: Inferior labial veins.l | + ~ |
| — | maxillary veins | Veias maxilares direitas | *Venae maxillares* | D | ZA: Maxillary veins.r | + ~ |
| — | maxillary veins | Veias maxilares esquerdas | *Venae maxillares* | E | ZA: Maxillary veins.l | + ~ |
| — | superficial temporal veins | Veias temporais superficiais direitas | *Venae temporales superficiales* | D | ZA: Superficial temporal veins.r | + ~ |
| — | superficial temporal veins | Veias temporais superficiais esquerdas | *Venae temporales superficiales* | E | ZA: Superficial temporal veins.l | + ~ |

### Glândulas (11)

| FMA | Nome em inglês | Nome PT-BR | Latim | Lado | Fonte (objetos) | Obs. |
|---|---|---|---|:-:|---|---|
| — | parotid duct | Ducto parotídeo direito | *Ductus parotideus* | D | ZA: Parotid duct.r | + ~ |
| — | parotid duct | Ducto parotídeo esquerdo | *Ductus parotideus* | E | ZA: Parotid duct.l | + ~ |
| — | submandibular duct | Ducto submandibular direito | *Ductus submandibularis* | D | ZA: Submandibular duct.r | + ~ |
| — | submandibular duct | Ducto submandibular esquerdo | *Ductus submandibularis* | E | ZA: Submandibular duct.l | + ~ |
| — | parotid gland | Glândula parótida direita | *Glandula parotidea* | D | ZA: Parotid gland.r |  |
| — | parotid gland | Glândula parótida esquerda | *Glandula parotidea* | E | ZA: Parotid gland.l |  |
| FMA59804 | sublingual gland | Glândula sublingual direita | *Glandula sublingualis* | D | ZA: Sublingual gland.r |  |
| FMA59805 | sublingual gland | Glândula sublingual esquerda | *Glandula sublingualis* | E | ZA: Sublingual gland.l |  |
| FMA59802 | submandibular gland | Glândula submandibular direita | *Glandula submandibularis* | D | ZA: Submandibular gland.r |  |
| FMA59803 | submandibular gland | Glândula submandibular esquerda | *Glandula submandibularis* | E | ZA: Submandibular gland.l |  |
| — | thyroid gland | Glândula tireoide | *Glandula thyroidea* | M | ZA: Thyroid gland |  |

## 2. Não encontradas (nem no Z-Anatomy, nem no BodyParts3D)

Nenhuma foi modelada à mão.

**Dentes:** 3º molar superior (18/28) (*Dens molaris tertius*); 3º molar inferior (38/48) (*Dens molaris tertius*).

**Músculos:** Músculo estiloglosso (*Musculus styloglossus*); Músculo palatoglosso (*Musculus palatoglossus*); Músculo longitudinal superior da língua (*Musculus longitudinalis superior*); Músculo longitudinal inferior da língua (*Musculus longitudinalis inferior*); Músculo transverso da língua (*Musculus transversus linguae*); Músculo vertical da língua (*Musculus verticalis linguae*).

**Nervos:** Gânglio trigeminal (*Ganglion trigeminale*); Nervo infraorbital (*Nervus infraorbitalis*); Nervos alveolares superiores (*Nervi alveolares superiores*); Nervo palatino maior (*Nervus palatinus major*); Nervos palatinos menores (*Nervi palatini minores*); Nervo nasopalatino (*Nervus nasopalatinus*); Ramos temporais do n. facial (*Rami temporales*); Ramos zigomáticos do n. facial (*Rami zygomatici*); Ramos bucais do n. facial (*Rami buccales*); Ramo marginal da mandíbula do n. facial (*Ramus marginalis mandibularis*); Ramo cervical do n. facial (*Ramus colli*).

**Artérias:** Artéria tireóidea superior (*Arteria thyroidea superior*); Artéria lingual (*Arteria lingualis*); Artéria auricular posterior (*Arteria auricularis posterior*).

**Veias:** Plexo pterigóideo (*Plexus pterygoideus*).

## 3. Ajustes nos dados

- Ramos superior/inferior do n. oculomotor do BP3D foram substituídos pelo n. oculomotor inteiro do Z-Anatomy.
