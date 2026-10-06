// Catálogo das estruturas pedidas. `en` é o nome do elemento no BodyParts3D (minúsculo, sem "left/right").
// Itens com extra:true não estavam na lista original, mas são relevantes para Odontologia e existem no BP3D.
// pt = Terminologia Anatômica em português; la = Terminologia Anatomica (latim).
// revisar:true = tradução/correspondência que precisa de conferência.

const C = (camada, en, pt, la, o = {}) => ({ camada, en, pt, la, ...o });
// Item que só existe no Z-Anatomy: `en` é o próprio nome do objeto no Z-Anatomy (sem .l/.r)
const Z = (camada, nome, pt, la, o = {}) => C(camada, nome.toLowerCase(), pt, la, { za: [nome], extra: true, ...o });

// Ossos presentes nas duas fontes e NÃO remodelados no Z-Anatomy (mandíbula e temporais foram), usados para alinhar
// as peças que vêm do BP3D ao sistema do Z-Anatomy. A maioria das peças do BP3D fica na órbita e no palato.
export const ZA_AJUSTE = [
  ['Frontal bone', 'Frontal bone'], ['Occipital bone', 'Occipital bone'], ['Sphenoid bone', 'Sphenoid bone'],
  ['Maxilla.l', 'Left maxilla'], ['Maxilla.r', 'Right maxilla'],
  ['Zygomatic bone.l', 'Left zygomatic bone'], ['Zygomatic bone.r', 'Right zygomatic bone'],
  ['Parietal bone.l', 'Left parietal bone'], ['Parietal bone.r', 'Right parietal bone'],
  ['Palatine bone.l', 'Left palatine bone'], ['Palatine bone.r', 'Right palatine bone'],
];

export const CAMADAS = {
  ossos: 'Ossos',
  vertebras: 'Vértebras cervicais',
  dentes: 'Dentes',
  musculos: 'Músculos',
  nervos: 'Nervos',
  arterias: 'Artérias',
  veias: 'Veias',
  glandulas: 'Glândulas',
};

export const CATALOGO = [
  // ── Ossos
  C('ossos', 'frontal bone', 'Osso frontal', 'Os frontale', { za: ['Frontal bone'] }),
  C('ossos', 'parietal bone', 'Osso parietal', 'Os parietale', { za: ['Parietal bone'] }),
  C('ossos', 'temporal bone', 'Osso temporal', 'Os temporale', { za: ['Temporal bone'] }),
  C('ossos', 'occipital bone', 'Osso occipital', 'Os occipitale', { za: ['Occipital bone'] }),
  C('ossos', 'sphenoid bone', 'Osso esfenoide', 'Os sphenoidale', { za: ['Sphenoid bone'] }),
  C('ossos', 'ethmoid', 'Osso etmoide', 'Os ethmoidale', { za: ['Ethmoid bone'] }),
  C('ossos', 'maxilla', 'Maxila', 'Maxilla', { za: ['Maxilla'] }),
  C('ossos', 'zygomatic bone', 'Osso zigomático', 'Os zygomaticum', { za: ['Zygomatic bone'] }),
  C('ossos', 'nasal bone', 'Osso nasal', 'Os nasale', { za: ['Nasal bone'] }),
  C('ossos', 'lacrimal bone', 'Osso lacrimal', 'Os lacrimale', { za: ['Lacrimal bone'] }),
  C('ossos', 'palatine bone', 'Osso palatino', 'Os palatinum', { za: ['Palatine bone'] }),
  C('ossos', 'inferior nasal concha', 'Concha nasal inferior', 'Concha nasalis inferior', { za: ['Inferior nasal concha bone'] }),
  C('ossos', 'vomer', 'Vômer', 'Vomer', { za: ['Vomer'] }),
  C('ossos', 'mandible', 'Mandíbula', 'Mandibula', { za: ['Mandible'] }),
  C('ossos', 'hyoid bone', 'Osso hioide', 'Os hyoideum', { za: ['Hyoid bone'] }),
  // ── Vértebras cervicais (camada oculta por padrão)
  C('vertebras', 'atlas', 'Atlas (C1)', 'Atlas', { za: ['Atlas (C1)'] }),
  C('vertebras', 'axis', 'Áxis (C2)', 'Axis', { za: ['Axis (C2)'] }),
  C('vertebras', 'third cervical vertebra', 'Vértebra cervical III (C3)', 'Vertebra cervicalis III', { za: ['Vertebra C3'] }),
  C('vertebras', 'fourth cervical vertebra', 'Vértebra cervical IV (C4)', 'Vertebra cervicalis IV', { za: ['Vertebra C4'] }),
  C('vertebras', 'fifth cervical vertebra', 'Vértebra cervical V (C5)', 'Vertebra cervicalis V', { za: ['Vertebra C5'] }),
  C('vertebras', 'sixth cervical vertebra', 'Vértebra cervical VI (C6)', 'Vertebra cervicalis VI', { za: ['Vertebra C6'] }),
  C('vertebras', 'seventh cervical vertebra', 'Vértebra proeminente (C7)', 'Vertebra prominens', { za: ['Vertebra C7'] }),
  // ── Dentes: os 28 permanentes são gerados em dentes() abaixo; terceiros molares só para registrar ausência
  C('dentes', 'upper third secondary molar tooth', '3º molar superior (18/28)', 'Dens molaris tertius'),
  C('dentes', 'lower third secondary molar tooth', '3º molar inferior (38/48)', 'Dens molaris tertius'),
  Z('dentes', 'Gingiva', 'Gengiva', 'Gingiva'),
  // ── Músculos da mastigação
  C('musculos', 'masseter', 'Músculo masseter', 'Musculus masseter', { za: ['Superficial part of masseter', 'Deep part of masseter'] }),
  C('musculos', 'temporalis', 'Músculo temporal', 'Musculus temporalis', { za: ['Temporalis muscle'] }),
  C('musculos', 'medial pterygoid', 'Músculo pterigóideo medial', 'Musculus pterygoideus medialis', { za: ['Medial pterygoid muscle'] }),
  C('musculos', 'lateral pterygoid', 'Músculo pterigóideo lateral', 'Musculus pterygoideus lateralis', { za: ['Superior head of lateral pterygoid muscle', 'Inferior head of lateral pterygoid muscle'] }),
  // ── Expressão facial
  C('musculos', 'orbicularis oris', 'Músculo orbicular da boca', 'Musculus orbicularis oris', { za: ['Orbicularis oris muscle'] }),
  C('musculos', 'orbicularis oculi', 'Músculo orbicular do olho', 'Musculus orbicularis oculi', { za: ['Orbital part of orbicularis oculi', 'Palpebral part of orbicularis oculi'] }),
  C('musculos', 'buccinator', 'Músculo bucinador', 'Musculus buccinator', { za: ['Bucinator'] }),
  C('musculos', 'zygomaticus major', 'Músculo zigomático maior', 'Musculus zygomaticus major', { za: ['Zygomaticus major muscle'] }),
  C('musculos', 'zygomaticus minor', 'Músculo zigomático menor', 'Musculus zygomaticus minor', { za: ['Zygomaticus minor muscle'] }),
  C('musculos', 'levator labii superioris', 'Músculo levantador do lábio superior', 'Musculus levator labii superioris', { za: ['Levator labii superioris'] }),
  C('musculos', 'levator labii superioris alaeque nasi', 'Músculo levantador do lábio superior e da asa do nariz', 'Musculus levator labii superioris alaeque nasi', { za: ['Levator nasolabialis'] }),
  C('musculos', 'levator anguli oris', 'Músculo levantador do ângulo da boca', 'Musculus levator anguli oris', { za: ['Levator anguli oris'] }),
  C('musculos', 'depressor anguli oris', 'Músculo abaixador do ângulo da boca', 'Musculus depressor anguli oris', { za: ['Depressor anguli oris'] }),
  C('musculos', 'depressor labii inferioris', 'Músculo abaixador do lábio inferior', 'Musculus depressor labii inferioris', { za: ['Depressor labii inferioris'] }),
  C('musculos', 'mentalis', 'Músculo mentual', 'Musculus mentalis', { za: ['Mentalis muscle'] }),
  C('musculos', 'risorius', 'Músculo risório', 'Musculus risorius', { za: ['Risorius muscle'] }),
  C('musculos', 'platysma', 'Platisma', 'Platysma', { za: ['Platysma'] }),
  C('musculos', 'occipitofrontalis', 'Músculo occipitofrontal', 'Musculus occipitofrontalis', { za: ['Frontalis muscle', 'Occipitalis muscle'] }),
  // ── Supra e infra-hióideos, ECM
  C('musculos', 'digastric', 'Músculo digástrico', 'Musculus digastricus', { za: ['Anterior belly of digastric muscle', 'Posterior belly of digastric muscle'] }),
  C('musculos', 'intermediate tendon', 'Tendão intermédio do músculo digástrico', 'Tendo intermedius musculi digastrici', { extra: true, revisar: true, za: ['Intermediate tendon of digastric muscle'] }),
  C('musculos', 'mylohyoid', 'Músculo milo-hióideo', 'Musculus mylohyoideus', { za: ['Mylohyoid muscle'] }),
  C('musculos', 'geniohyoid', 'Músculo gênio-hióideo', 'Musculus geniohyoideus', { za: ['Geniohyoid muscle'] }),
  C('musculos', 'stylohyoid', 'Músculo estilo-hióideo', 'Musculus stylohyoideus', { za: ['Stylohyoid muscle'] }),
  C('musculos', 'sternohyoid', 'Músculo esterno-hióideo', 'Musculus sternohyoideus', { za: ['Sternohyoid muscle'] }),
  C('musculos', 'sternothyroid', 'Músculo esternotireóideo', 'Musculus sternothyroideus', { za: ['Sternothyroid muscle'] }),
  C('musculos', 'thyrohyoid', 'Músculo tíreo-hióideo', 'Musculus thyrohyoideus', { za: ['Thyrohyoid muscle'] }),
  C('musculos', 'omohyoid', 'Músculo omo-hióideo', 'Musculus omohyoideus', { za: ['Omohyoid muscle'] }),
  C('musculos', 'sternocleidomastoid', 'Músculo esternocleidomastóideo', 'Musculus sternocleidomastoideus', { za: ['Sternocleidomastoid muscle'] }),
  // ── Língua
  C('musculos', 'tongue', 'Língua', 'Lingua', { extra: true, za: ['Tongue'] }),
  C('musculos', 'genioglossus', 'Músculo genioglosso', 'Musculus genioglossus', { za: ['Genioglossus muscle'] }),
  C('musculos', 'hyoglossus', 'Músculo hioglosso', 'Musculus hyoglossus', { za: ['Hyoglossus muscle'] }),
  C('musculos', 'styloglossus', 'Músculo estiloglosso', 'Musculus styloglossus'),
  C('musculos', 'palatoglossus', 'Músculo palatoglosso', 'Musculus palatoglossus'),
  C('musculos', 'superior longitudinal muscle of tongue', 'Músculo longitudinal superior da língua', 'Musculus longitudinalis superior'),
  C('musculos', 'inferior longitudinal muscle of tongue', 'Músculo longitudinal inferior da língua', 'Musculus longitudinalis inferior'),
  C('musculos', 'transverse muscle of tongue', 'Músculo transverso da língua', 'Musculus transversus linguae'),
  C('musculos', 'vertical muscle of tongue', 'Músculo vertical da língua', 'Musculus verticalis linguae'),
  // ── Extras: palato mole, faringe e rafe pterigomandibular (referência do bloqueio do n. alveolar inferior)
  C('musculos', 'pterygomandibular raphe', 'Rafe pterigomandibular', 'Raphe pterygomandibularis', { extra: true }),
  C('musculos', 'tensor veli palatini', 'Músculo tensor do véu palatino', 'Musculus tensor veli palatini', { extra: true }),
  C('musculos', 'levator veli palatini', 'Músculo levantador do véu palatino', 'Musculus levator veli palatini', { extra: true }),
  C('musculos', 'uvular muscle', 'Músculo da úvula', 'Musculus uvulae', { extra: true }),
  C('musculos', 'palatopharyngeus', 'Músculo palatofaríngeo', 'Musculus palatopharyngeus', { extra: true, za: ['Palatopharyngeus muscle'] }),
  C('musculos', 'superior pharyngeal constrictor', 'Músculo constritor superior da faringe', 'Musculus constrictor pharyngis superior', { extra: true, za: ['Superior pharyngeal constrictor'] }),
  C('musculos', 'middle pharyngeal constrictor', 'Músculo constritor médio da faringe', 'Musculus constrictor pharyngis medius', { extra: true, za: ['Middle pharyngeal constrictor'] }),
  C('musculos', 'inferior pharyngeal constrictor', 'Músculo constritor inferior da faringe', 'Musculus constrictor pharyngis inferior', { extra: true, za: ['Inferior pharyngeal constrictor'] }),
  C('musculos', 'stylopharyngeus', 'Músculo estilofaríngeo', 'Musculus stylopharyngeus', { extra: true, za: ['Stylopharyngeus muscle'] }),
  C('musculos', 'salpingopharyngeus', 'Músculo salpingofaríngeo', 'Musculus salpingopharyngeus', { extra: true }),
  // ── Nervo trigêmeo
  C('nervos', 'trigeminal nerve', 'Nervo trigêmeo (V)', 'Nervus trigeminus', { za: ['Trigeminal nerve (V)', 'Sensory root of trigeminal nerve', 'Motor root of trigeminal nerve'] }),
  C('nervos', 'trigeminal ganglion', 'Gânglio trigeminal', 'Ganglion trigeminale'),
  C('nervos', 'ophthalmic nerve', 'Nervo oftálmico (V1)', 'Nervus ophthalmicus'),
  C('nervos', 'frontal nerve', 'Nervo frontal', 'Nervus frontalis', { extra: true }),
  C('nervos', 'supra-orbital nerve', 'Nervo supraorbital', 'Nervus supraorbitalis', { extra: true }),
  C('nervos', 'supratrochlear nerve', 'Nervo supratroclear', 'Nervus supratrochlearis', { extra: true }),
  C('nervos', 'lacrimal nerve', 'Nervo lacrimal', 'Nervus lacrimalis', { extra: true }),
  C('nervos', 'nasociliary nerve', 'Nervo nasociliar', 'Nervus nasociliaris', { extra: true }),
  C('nervos', 'communicating branch of nasociliary nerve with ciliary ganglion', 'Ramo comunicante do n. nasociliar com o gânglio ciliar', 'Ramus communicans cum ganglio ciliari', { extra: true }),
  C('nervos', 'infratrochlear nerve', 'Nervo infratroclear', 'Nervus infratrochlearis', { extra: true }),
  C('nervos', 'anterior ethmoidal nerve', 'Nervo etmoidal anterior', 'Nervus ethmoidalis anterior', { extra: true }),
  C('nervos', 'posterior ethmoidal nerve', 'Nervo etmoidal posterior', 'Nervus ethmoidalis posterior', { extra: true }),
  C('nervos', 'long ciliary nerve', 'Nervos ciliares longos', 'Nervi ciliares longi', { extra: true }),
  C('nervos', 'short ciliary nerve', 'Nervos ciliares curtos', 'Nervi ciliares breves', { extra: true }),
  C('nervos', 'ciliary ganglion', 'Gânglio ciliar', 'Ganglion ciliare', { extra: true }),
  C('nervos', 'maxillary nerve', 'Nervo maxilar (V2)', 'Nervus maxillaris', { za: ['Maxillary nerve'] }),
  C('nervos', 'infra-orbital nerve', 'Nervo infraorbital', 'Nervus infraorbitalis'),
  C('nervos', 'superior alveolar nerve', 'Nervos alveolares superiores', 'Nervi alveolares superiores'),
  C('nervos', 'greater palatine nerve', 'Nervo palatino maior', 'Nervus palatinus major'),
  C('nervos', 'lesser palatine nerve', 'Nervos palatinos menores', 'Nervi palatini minores'),
  C('nervos', 'nasopalatine nerve', 'Nervo nasopalatino', 'Nervus nasopalatinus'),
  C('nervos', 'mandibular nerve', 'Nervo mandibular (V3)', 'Nervus mandibularis', { za: ['Anterior division of mandibular nerve', 'Posterior division of mandibular nerve'] }),
  C('nervos', 'inferior alveolar nerve', 'Nervo alveolar inferior', 'Nervus alveolaris inferior', { za: ['Inferior alveolar nerve'] }),
  C('nervos', 'lingual nerve', 'Nervo lingual', 'Nervus lingualis', { za: ['Lingual nerve'] }),
  C('nervos', 'buccal nerve', 'Nervo bucal', 'Nervus buccalis', { za: ['Buccal nerve'] }),
  C('nervos', 'mental nerve', 'Nervo mentual', 'Nervus mentalis', { za: ['Mental nerve'] }),
  // ── Nervo facial
  C('nervos', 'facial nerve', 'Nervo facial (VII)', 'Nervus facialis', { za: ['Facial nerve (VII)'] }),
  C('nervos', 'temporal branch of facial nerve', 'Ramos temporais do n. facial', 'Rami temporales'),
  C('nervos', 'zygomatic branch of facial nerve', 'Ramos zigomáticos do n. facial', 'Rami zygomatici'),
  C('nervos', 'buccal branch of facial nerve', 'Ramos bucais do n. facial', 'Rami buccales'),
  C('nervos', 'marginal mandibular branch of facial nerve', 'Ramo marginal da mandíbula do n. facial', 'Ramus marginalis mandibularis'),
  C('nervos', 'cervical branch of facial nerve', 'Ramo cervical do n. facial', 'Ramus colli'),
  C('nervos', 'chorda tympani', 'Corda do tímpano', 'Chorda tympani', { za: ['Chorda tympani'] }),
  // ── Demais nervos cranianos
  C('nervos', 'olfactory nerve', 'Nervo olfatório (I)', 'Nervus olfactorius', { za: ['Olfactory nerve (I)'] }),
  C('nervos', 'optic nerve', 'Nervo óptico (II)', 'Nervus opticus', { za: ['Optic nerve (II)'] }),
  C('nervos', 'oculomotor nerve', 'Nervo oculomotor (III)', 'Nervus oculomotorius', { za: ['Oculomotor nerve (III)'] }),
  C('nervos', 'trochlear nerve', 'Nervo troclear (IV)', 'Nervus trochlearis', { za: ['Trochlear nerve (IV)'] }),
  C('nervos', 'abducent nerve', 'Nervo abducente (VI)', 'Nervus abducens', { za: ['Abducens nerve (VI)'] }),
  C('nervos', 'vestibulocochlear nerve', 'Nervo vestibulococlear (VIII)', 'Nervus vestibulocochlearis', { za: ['Vestibulocochlear nerve (VIII)'] }),
  C('nervos', 'glossopharyngeal nerve', 'Nervo glossofaríngeo (IX)', 'Nervus glossopharyngeus', { za: ['Glossopharyngeal nerve (IX)'] }),
  C('nervos', 'vagus nerve', 'Nervo vago (X)', 'Nervus vagus', { za: ['Vagus nerve (X)'] }),
  C('nervos', 'accessory nerve', 'Nervo acessório (XI)', 'Nervus accessorius', { za: ['Accessory nerve (XI)'] }),
  C('nervos', 'hypoglossal nerve', 'Nervo hipoglosso (XII)', 'Nervus hypoglossus', { za: ['Hypoglossal nerve (XII)'] }),
  // ── Artérias
  C('arterias', 'common carotid artery', 'Artéria carótida comum', 'Arteria carotis communis', { za: ['Left common carotid artery', 'Right common carotid artery'] }),
  C('arterias', 'internal carotid artery', 'Artéria carótida interna', 'Arteria carotis interna', { za: ['Internal carotid artery'] }),
  C('arterias', 'external carotid artery', 'Artéria carótida externa', 'Arteria carotis externa', { za: ['External carotid artery'] }),
  C('arterias', 'superior thyroid artery', 'Artéria tireóidea superior', 'Arteria thyroidea superior'),
  C('arterias', 'lingual artery', 'Artéria lingual', 'Arteria lingualis'),
  C('arterias', 'facial artery', 'Artéria facial', 'Arteria facialis', { za: ['Facial artery'] }),
  C('arterias', 'maxillary artery', 'Artéria maxilar', 'Arteria maxillaris', { za: ['Maxillary artery'] }),
  C('arterias', 'superficial temporal artery', 'Artéria temporal superficial', 'Arteria temporalis superficialis', { za: ['Superficial temporal artery'] }),
  C('arterias', 'occipital artery', 'Artéria occipital', 'Arteria occipitalis', { za: ['Occipital artery'] }),
  C('arterias', 'posterior auricular artery', 'Artéria auricular posterior', 'Arteria auricularis posterior'),
  C('arterias', 'middle meningeal artery', 'Artéria meníngea média', 'Arteria meningea media', { za: ['Middle meningeal artery'] }),
  // ── Veias
  C('veias', 'internal jugular vein', 'Veia jugular interna', 'Vena jugularis interna', { za: ['Internal jugular vein'] }),
  C('veias', 'external jugular vein', 'Veia jugular externa', 'Vena jugularis externa', { za: ['External jugular vein'] }),
  C('veias', 'anterior jugular vein', 'Veia jugular anterior', 'Vena jugularis anterior', { za: ['Anterior jugular vein'] }),
  C('veias', 'facial vein', 'Veia facial', 'Vena facialis', { za: ['Facial vein'] }),
  C('veias', 'retromandibular vein', 'Veia retromandibular', 'Vena retromandibularis', { za: ['Retromandibular vein'] }),
  C('veias', 'pterygoid plexus', 'Plexo pterigóideo', 'Plexus pterygoideus'),
  // ── Glândulas
  C('glandulas', 'parotid gland', 'Glândula parótida', 'Glandula parotidea', { za: ['Parotid gland'] }),
  C('glandulas', 'submandibular gland', 'Glândula submandibular', 'Glandula submandibularis', { za: ['Submandibular gland'] }),
  C('glandulas', 'sublingual gland', 'Glândula sublingual', 'Glandula sublingualis', { za: ['Sublingual gland'] }),
  // ── Extras disponíveis só no Z-Anatomy
  Z('musculos', 'Corrugator supercilii', 'Músculo corrugador do supercílio', 'Musculus corrugator supercilii'),
  Z('musculos', 'Procerus muscle', 'Músculo prócero', 'Musculus procerus'),
  Z('musculos', 'Nasalis muscle', 'Músculo nasal', 'Musculus nasalis'),
  Z('musculos', 'Depressor septi nasi', 'Músculo abaixador do septo nasal', 'Musculus depressor septi nasi'),
  Z('nervos', 'Nerve to mylohyoid muscle', 'Nervo milo-hióideo', 'Nervus mylohyoideus'),
  Z('arterias', 'Inferior alveolar artery', 'Artéria alveolar inferior', 'Arteria alveolaris inferior'),
  Z('arterias', 'Mental branch of inferior alveolar artery', 'Ramo mentual da a. alveolar inferior', 'Ramus mentalis arteriae alveolaris inferioris'),
  Z('arterias', 'Mylohyoid branch of inferior alveolar artery', 'Ramo milo-hióideo da a. alveolar inferior', 'Ramus mylohyoideus arteriae alveolaris inferioris'),
  Z('arterias', 'Posterior superior alveolar artery', 'Artéria alveolar superior posterior', 'Arteria alveolaris superior posterior'),
  Z('arterias', 'Infra-orbital artery', 'Artéria infraorbital', 'Arteria infraorbitalis'),
  Z('arterias', 'Buccal artery', 'Artéria bucal', 'Arteria buccalis'),
  Z('arterias', 'Anterior deep temporal artery', 'Artéria temporal profunda anterior', 'Arteria temporalis profunda anterior'),
  Z('arterias', 'Posterior deep temporal artery', 'Artéria temporal profunda posterior', 'Arteria temporalis profunda posterior'),
  Z('arterias', 'Descending palatine artery', 'Artéria palatina descendente', 'Arteria palatina descendens'),
  Z('arterias', 'Greater palatine artery', 'Artéria palatina maior', 'Arteria palatina major'),
  Z('arterias', 'Posterior septal branches of sphenopalatine artery', 'Ramos septais posteriores da a. esfenopalatina', 'Rami septales posteriores'),
  Z('arterias', 'Posterior lateral nasal branches of sphenopalatine artery.', 'Ramos nasais posteriores laterais da a. esfenopalatina', 'Arteriae nasales posteriores laterales'),
  Z('arterias', 'Ascending pharyngeal artery', 'Artéria faríngea ascendente', 'Arteria pharyngea ascendens'),
  Z('arterias', 'Superior labial artery', 'Artéria labial superior', 'Arteria labialis superior'),
  Z('arterias', 'Inferior labial artery', 'Artéria labial inferior', 'Arteria labialis inferior'),
  Z('arterias', 'Submental artery', 'Artéria submentual', 'Arteria submentalis'),
  Z('arterias', 'Angular artery', 'Artéria angular', 'Arteria angularis'),
  Z('arterias', 'Transverse facial artery', 'Artéria transversa da face', 'Arteria transversa faciei'),
  Z('arterias', 'Frontal branch of superficial temporal artery', 'Ramo frontal da a. temporal superficial', 'Ramus frontalis'),
  Z('veias', 'Common facial vein', 'Veia facial comum', 'Vena facialis communis', { revisar: true }),
  Z('veias', 'Anterior division of retromandibular vein', 'Divisão anterior da v. retromandibular', 'Vena retromandibularis, divisio anterior', { revisar: true }),
  Z('veias', 'Posterior division of retromandibular vein', 'Divisão posterior da v. retromandibular', 'Vena retromandibularis, divisio posterior', { revisar: true }),
  Z('veias', 'Maxillary veins', 'Veias maxilares', 'Venae maxillares'),
  Z('veias', 'Superficial temporal veins', 'Veias temporais superficiais', 'Venae temporales superficiales'),
  Z('veias', 'Posterior auricular vein', 'Veia auricular posterior', 'Vena auricularis posterior'),
  Z('veias', 'Lingual vein', 'Veia lingual', 'Vena lingualis'),
  Z('veias', 'Superior thyroid vein', 'Veia tireóidea superior', 'Vena thyroidea superior'),
  Z('veias', 'Angular vein', 'Veia angular', 'Vena angularis'),
  Z('veias', 'Superior labial vein', 'Veia labial superior', 'Vena labialis superior'),
  Z('veias', 'Inferior labial veins', 'Veias labiais inferiores', 'Venae labiales inferiores'),
  Z('veias', 'Submental vein', 'Veia submentual', 'Vena submentalis'),
  Z('musculos', 'Epicranial aponeurosis', 'Aponeurose epicrânica', 'Galea aponeurotica'),
  Z('glandulas', 'Parotid duct', 'Ducto parotídeo', 'Ductus parotideus'),
  Z('glandulas', 'Submandibular duct', 'Ducto submandibular', 'Ductus submandibularis'),
  C('glandulas', 'thyroid gland', 'Glândula tireoide', 'Glandula thyroidea', { za: ['Thyroid gland'] }),
];

// Dentes permanentes (Z-Anatomy; nome BP3D em `en` para recuperar o FMA). Notação FDI: quadrante 1 = superior direito,
// 2 = superior esquerdo, 3 = inferior esquerdo, 4 = inferior direito. O lado e o número FDI são definidos na filtragem.
const TIPOS = [
  [1, 'central secondary incisor', 'medial incisor', 'Incisivo central', 'Dens incisivus'],
  [2, 'lateral secondary incisor', 'lateral incisor', 'Incisivo lateral', 'Dens incisivus'],
  [3, 'secondary canine', 'canine', 'Canino', 'Dens caninus'],
  [4, 'first secondary premolar', 'first premolar', '1º pré-molar', 'Dens premolaris'],
  [5, 'second secondary premolar', 'second premolar', '2º pré-molar', 'Dens premolaris'],
  [6, 'first secondary molar', 'first molar tooth', '1º molar', 'Dens molaris'],
  [7, 'second secondary molar', 'second molar tooth', '2º molar', 'Dens molaris'],
];
for (const arco of ['upper', 'lower']) {
  for (const [n, bp, za, pt, la] of TIPOS) {
    const zaNome = (arco === 'upper' ? 'Upper ' : 'Lower ') + za;
    CATALOGO.push(C('dentes', `${arco} ${bp} tooth`, `${pt} ${arco === 'upper' ? 'superior' : 'inferior'}`, la,
      { za: [zaNome], dente: { arco, n } }));
  }
}
export const fdi = ({ arco, n }, lado) => `${arco === 'upper' ? (lado === 'D' ? 1 : 2) : (lado === 'E' ? 3 : 4)}${n}`;

// Nome em português com o lado concordando em gênero e número com a primeira palavra ("Artéria … direita",
// "Veias … esquerdas"); nos dentes, o número FDI entre parênteses. Usado pelo 03c (seleção) e pelo 05 (dicionário).
const FEM = ['Artéria', 'Veia', 'Veias', 'Glândula', 'Concha', 'Maxila', 'Rafe', 'Corda', 'Gengiva', 'Língua', 'Divisão', 'Aponeurose'];
export function nomeComLado(c, lado) {
  const w = c.pt.split(' ')[0];
  const fem = FEM.includes(w);
  const plural = /s$/.test(w) && !['Atlas', 'Áxis'].includes(w);
  const ladoTxt = lado === 'M' ? '' : (lado === 'D' ? 'direit' : 'esquerd') + (fem ? 'a' : 'o') + (plural ? 's' : '');
  const fdiN = c.dente ? fdi(c.dente, lado) : undefined;
  return { pt: c.dente ? `${c.pt} ${ladoTxt} (${fdiN})` : ladoTxt ? `${c.pt} ${ladoTxt}` : c.pt, fdi: fdiN };
}
