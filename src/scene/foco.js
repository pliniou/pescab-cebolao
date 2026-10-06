// O foco, interação assinatura da Bandeja Clínica: com uma estrutura selecionada, ela mantém a cor (e o brilho da
// seleção) e o resto do modelo recua um passo para o campo, misturando a cor-base com o token --recuo-3d.
// Sempre parte de material.userData.cor e volta a ela (o mesmo contrato da seleção, do quiz e da pintura).
import * as THREE from 'three';
import { corDoTema } from './tema3d.js';

export const MISTURA = 0.62; // quanto do campo entra na cor das estruturas fora de foco

export function criarFoco(viewer, modelos) {
  let alvo = null;
  const campo = new THREE.Color();

  function aplicar() {
    corDoTema('recuo-3d', campo);
    for (const m of modelos.malhas.values()) {
      m.material.color.copy(m.material.userData.cor);
      if (m !== alvo) m.material.color.lerp(campo, MISTURA);
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
