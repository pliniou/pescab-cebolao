// O foco, interação assinatura da Bandeja Clínica: com uma estrutura selecionada, ela mantém a cor (e o brilho da
// seleção) e o resto do modelo recua um passo para o campo, misturando a cor-base com o token --recuo-3d na proporção
// --recuo-mistura (maior no tema escuro, onde o campo é mais fundo). Sempre parte de material.userData.cor e volta a
// ela (o mesmo contrato da seleção, do quiz e da pintura).
import * as THREE from 'three';
import { corDoTema, numeroDoTema } from './tema3d.js';
import { visivel } from '../util.js';
import { INVISIVEL } from './raiox.js';

export function criarFoco(viewer, modelos) {
  let alvo = null;
  const campo = new THREE.Color();

  function aplicar() {
    corDoTema('recuo-3d', campo);
    const mistura = numeroDoTema('recuo-mistura');
    for (const m of modelos.malhas.values()) {
      m.material.color.copy(m.material.userData.cor);
      if (m !== alvo) m.material.color.lerp(campo, mistura);
    }
    viewer.invalidar();
  }
  function limpar() {
    for (const m of modelos.malhas.values()) m.material.color.copy(m.material.userData.cor);
    viewer.invalidar();
  }

  return {
    // m: estrutura em foco; null tira o foco e devolve as cores-base
    definir(m) {
      alvo = m;
      if (m) aplicar(); else limpar();
    },
    // depois de algo reescrever as cores-base (modo de cores, pintura, tema), refaz o recuo
    reaplicar() { if (alvo) aplicar(); },
    get alvo() { return alvo; },
  };
}

// Estruturas opacas e à vista que ficam entre a câmera (em `de`, coordenadas do mundo) e a estrutura `alvo`: raios da
// câmera até o centro e até alguns vértices do alvo, para pegar também o que cobre só parte dele. É o que o foco por
// nome deixa translúcido para uma peça profunda (pterigóideos, nervo alveolar inferior) não ficar escondida.
const AMOSTRAS = 16;
export function oclusoras(alvo, de, malhas) {
  const opacas = [...malhas].filter((m) => m !== alvo && visivel(m) && m.material.opacity >= 0.5 && m.material.opacity > INVISIVEL);
  if (!opacas.length) return [];
  alvo.updateMatrixWorld(true);
  const pos = alvo.geometry.attributes.position;
  const pontos = [alvo.geometry.boundingBox.getCenter(new THREE.Vector3())];
  const passo = Math.max(1, Math.floor(pos.count / AMOSTRAS));
  for (let i = 0; i < pos.count; i += passo) pontos.push(new THREE.Vector3().fromBufferAttribute(pos, i));
  const ray = new THREE.Raycaster();
  const dir = new THREE.Vector3();
  const achadas = new Set();
  for (const p of pontos) {
    alvo.localToWorld(p);
    dir.copy(p).sub(de);
    const d = dir.length();
    ray.set(de, dir.normalize());
    ray.far = d - 0.001;
    for (const h of ray.intersectObjects(opacas, false)) achadas.add(h.object);
  }
  return [...achadas];
}
