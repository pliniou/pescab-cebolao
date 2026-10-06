// Vista explodida: cada estrutura do esqueleto se afasta do centro do crânio ao longo do vetor do seu centroide.
// Ossos medianos recebem direção própria (o vetor radial deles é curto ou aponta para o lugar errado):
// o esfenoide é a peça-âncora central; etmoide vai para frente, vômer para baixo, occipital para trás.
// Os dentes acompanham o seu osso (maxila do mesmo lado ou mandíbula) e saem um pouco do alvéolo.
import * as THREE from 'three';
import { ehGengiva } from './modelos.js';

const CAMADAS_EXPLODIDAS = ['ossos', 'vertebras', 'dentes'];
// nome `en` → [direção x, y, z, distância em m a 100%]
export const MEDIANOS = {
  'sphenoid bone': [0, 0, 0],
  'ethmoid': [0, 0.25, 1, 0.045],
  'vomer': [0, -1, 0.35, 0.05],
  'occipital bone': [0, 0.1, -1, 0.09],
};
const FATOR = 0.75;       // a 100%, a distância ao centro aumenta 75%
const SAIDA_ALVEOLO = 0.014; // m

export function criarExplosao(viewer, malhas) {
  const centro = new THREE.Vector3(0, 0, 0);
  const desloc = new Map(); // id → Vector3 (deslocamento a 100%)
  const caixa = new THREE.Box3();
  const c = new THREE.Vector3();

  const centroide = (m) => { caixa.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); return caixa.getCenter(new THREE.Vector3()); };

  for (const m of malhas.values()) {
    if (!CAMADAS_EXPLODIDAS.includes(m.userData.camada)) continue;
    m.updateMatrixWorld(true);
    const en = m.userData.info?.en;
    const fixo = MEDIANOS[en];
    if (fixo) {
      desloc.set(m.userData.id, new THREE.Vector3(fixo[0], fixo[1], fixo[2]).normalize().multiplyScalar(fixo[3] || 0));
      continue;
    }
    c.copy(centroide(m)).sub(centro);
    desloc.set(m.userData.id, c.clone().multiplyScalar(FATOR));
  }

  // Dentes: deslocamento do osso de suporte + saída do alvéolo
  const porEnLado = (en, lado) => [...malhas.values()].find((m) => m.userData.info?.en === en && (!lado || m.userData.info.lado === lado));
  for (const m of malhas.values()) {
    const info = m.userData.info;
    if (m.userData.camada !== 'dentes' || !info?.fdi) continue;
    const superior = /^upper/.test(info.en);
    const osso = superior ? porEnLado('maxilla', info.lado) : porEnLado('mandible');
    const base = osso ? desloc.get(osso.userData.id).clone() : new THREE.Vector3();
    base.y += superior ? -SAIDA_ALVEOLO : SAIDA_ALVEOLO;
    desloc.set(m.userData.id, base);
  }
  // Gengiva (peça única das duas arcadas): fica parada.
  for (const m of malhas.values()) if (ehGengiva(m)) desloc.set(m.userData.id, new THREE.Vector3());

  let alvo = 0, atual = 0;
  const aplicar = () => {
    for (const [id, d] of desloc) {
      const m = malhas.get(id);
      m.position.copy(m.userData.base).addScaledVector(d, atual);
    }
    viewer.invalidar(); // as peças se moveram (rótulos e oclusão dependem disso)
  };
  viewer.tarefas.add((dt) => {
    if (atual === alvo) return false;
    // movimento reduzido (preferência do sistema): as peças vão direto para a posição final
    const direto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    atual = direto || Math.abs(alvo - atual) < 1e-4 ? alvo : atual + (alvo - atual) * Math.min(1, dt * 7);
    aplicar();
    return true;
  });

  return {
    definir: (v) => { alvo = Math.max(0, Math.min(1, v)); },
    get valor() { return alvo; },
  };
}
