// Roteiros de estudo (presets). Cada camada listada fica visível; `so` filtra as estruturas pelo nome em inglês
// do dicionário (campo `en`) ou por função; `lado` limita a 'D' ou 'E' (estruturas medianas sempre aparecem);
// `op` = opacidade (raio-X). Camadas não listadas ficam ocultas.
import { caixaDosObjetos } from '../scene/viewer.js';
import { ehGengiva } from '../scene/modelos.js';

const V3 = ['mandibular nerve', 'inferior alveolar nerve', 'lingual nerve', 'buccal nerve', 'mental nerve',
  'nerve to mylohyoid muscle', 'chorda tympani', 'trigeminal nerve'];
const RAMOS_MAXILAR = ['external carotid artery', 'maxillary artery', 'superficial temporal artery', 'middle meningeal artery',
  'inferior alveolar artery', 'mental branch of inferior alveolar artery', 'mylohyoid branch of inferior alveolar artery',
  'posterior superior alveolar artery', 'infra-orbital artery', 'buccal artery', 'anterior deep temporal artery',
  'posterior deep temporal artery', 'descending palatine artery', 'greater palatine artery',
  'posterior septal branches of sphenopalatine artery', 'posterior lateral nasal branches of sphenopalatine artery.'];
const EXPRESSAO = ['orbicularis oris', 'orbicularis oculi', 'buccinator', 'zygomaticus major', 'zygomaticus minor',
  'levator labii superioris', 'levator labii superioris alaeque nasi', 'levator anguli oris', 'depressor anguli oris',
  'depressor labii inferioris', 'mentalis', 'risorius', 'platysma', 'occipitofrontalis', 'corrugator supercilii',
  'procerus muscle', 'nasalis muscle', 'depressor septi nasi', 'epicranial aponeurosis'];
const dentesInferiores = (e) => /^lower/.test(e.en);

export const PRESETS = [
  {
    nome: 'Visão geral',
    nota: 'Crânio e dentes, sem cortes nem explosão.',
    camadas: { ossos: {}, dentes: { so: (e) => !!e.fdi } },
    vista: 'reset',
  },
  {
    nome: 'Crânio explodido',
    nota: 'Ossos do crânio afastados. O esfenoide fica no centro; os dentes acompanham maxila e mandíbula.',
    camadas: { ossos: {}, dentes: { so: (e) => !!e.fdi } },
    explosao: 1,
    vista: 'reset',
  },
  {
    nome: 'Mandíbula e forames',
    nota: 'Corte sagital visto por dentro: forame mandibular com o n. alveolar inferior entrando no canal; o n. mentual sai pelo forame mentual.',
    camadas: {
      ossos: { so: ['mandible', 'hyoid bone'] },
      dentes: { so: dentesInferiores },
      nervos: { so: ['inferior alveolar nerve', 'mental nerve', 'lingual nerve', 'nerve to mylohyoid muscle'] },
      arterias: { so: ['inferior alveolar artery', 'mental branch of inferior alveolar artery', 'mylohyoid branch of inferior alveolar artery'] },
    },
    cortes: { sagital: { ativo: true, valor: 0, inverter: false } },
    vista: 'lateralE',
    selecionar: ['inferior alveolar nerve', 'D'],
  },
  {
    nome: 'Músculos da mastigação',
    nota: 'Masseter, temporal e pterigóideos medial e lateral (lado direito). Use o raio-X para ver os pterigóideos sob o ramo.',
    camadas: {
      ossos: {}, dentes: { so: (e) => !!e.fdi },
      musculos: { so: ['masseter', 'temporalis', 'medial pterygoid', 'lateral pterygoid'], lado: 'D' },
    },
    vista: 'lateralD',
  },
  {
    nome: 'Trigêmeo V3 e anestesia',
    nota: 'N. mandibular e ramos com os ossos em raio-X: n. alveolar inferior entre o ramo e o pterigóideo medial (espaço pterigomandibular), n. lingual à frente, n. bucal.',
    camadas: {
      ossos: { op: 0.3 }, dentes: { so: (e) => !!e.fdi },
      musculos: { so: ['medial pterygoid', 'lateral pterygoid', 'pterygomandibular raphe', 'buccinator'], lado: 'D', op: 0.45 },
      nervos: { so: V3, lado: 'D' },
    },
    vista: 'lateralD',
    selecionar: ['inferior alveolar nerve', 'D'],
  },
  {
    nome: 'Nervo facial e parótida',
    nota: 'N. facial saindo do forame estilomastóideo e entrando na parótida (em raio-X). Os 5 ramos terminais do facial não existem nas fontes 3D usadas.',
    camadas: {
      ossos: {}, dentes: { so: (e) => !!e.fdi },
      musculos: { so: [...EXPRESSAO, 'masseter'], lado: 'D', op: 0.6 },
      nervos: { so: ['facial nerve', 'chorda tympani'], lado: 'D' },
      glandulas: { so: ['parotid gland', 'parotid duct'], lado: 'D', op: 0.45 },
      veias: { so: ['retromandibular vein'], lado: 'D' },
      arterias: { so: ['external carotid artery', 'superficial temporal artery', 'transverse facial artery'], lado: 'D' },
    },
    vista: 'lateralD',
    selecionar: ['facial nerve', 'D'],
  },
  {
    nome: 'Artéria maxilar e fossa infratemporal',
    nota: 'A. maxilar e ramos na fossa infratemporal, com ossos e pterigóideos em raio-X.',
    camadas: {
      ossos: { op: 0.3 }, dentes: { so: (e) => !!e.fdi },
      musculos: { so: ['medial pterygoid', 'lateral pterygoid'], lado: 'D', op: 0.35 },
      arterias: { so: RAMOS_MAXILAR, lado: 'D' },
      nervos: { so: ['inferior alveolar nerve', 'lingual nerve'], lado: 'D' },
    },
    vista: 'lateralD',
    selecionar: ['maxillary artery', 'D'],
  },
];

export function aplicarPreset(p, app) {
  const { modelos, ordem } = app;
  app.selecao.selecionar(null);
  app.selecao.salvar();
  for (const c of ordem) {
    const cfg = p.camadas[c];
    modelos.grupos[c].visible = !!cfg;
    app.raiox.definir(c, cfg?.op ?? 1);
  }
  for (const m of modelos.malhas.values()) {
    const cfg = p.camadas[m.userData.camada];
    if (!cfg) { m.visible = true; continue; }
    const e = m.userData.info || {};
    let ok = true;
    if (Array.isArray(cfg.so)) ok = cfg.so.includes(e.en);
    else if (typeof cfg.so === 'function') ok = cfg.so(e);
    else ok = !ehGengiva(m);
    if (cfg.lado && e.lado !== 'M' && e.lado !== cfg.lado) ok = false;
    m.visible = ok;
  }
  for (const k of ['sagital', 'coronal', 'axial']) app.cortes.definir(k, p.cortes?.[k] || { ativo: false, valor: 0, inverter: false });
  app.definirExplosao(p.explosao || 0);
  if (p.explosao) app.viewer.resetar();
  else {
    // enquadra o que ficou visível, só a parte que os cortes ativos mantêm
    const visiveis = [...modelos.malhas.values()].filter((m) => m.visible && m.parent.visible);
    const caixa = app.cortes.recortar(caixaDosObjetos(visiveis));
    if (!caixa.isEmpty()) app.viewer.enquadrarCaixa(caixa, p.vista);
  }
  app.painel.sincronizarControles();
  app.painel.sincronizar();
  if (p.selecionar) {
    const [en, lado] = p.selecionar;
    const m = [...modelos.malhas.values()].find((o) => o.userData.info?.en === en && o.userData.info.lado === lado && o.visible);
    if (m) app.selecao.selecionar(m);
  }
}
