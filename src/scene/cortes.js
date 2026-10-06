// Planos de corte sagital, coronal e axial (clipping global do renderizador).
// Sem inverter, cada plano mantém o lado de coordenada MENOR: sagital → metade direita do paciente (x < 0),
// coronal → parte posterior (z < 0), axial → parte inferior (y < 0). "Inverter" mantém o outro lado.
import * as THREE from 'three';

export const PLANOS = {
  sagital: { eixo: 0, nome: 'Sagital', menor: 'direito', maior: 'esquerdo' },
  coronal: { eixo: 2, nome: 'Coronal', menor: 'posterior', maior: 'anterior' },
  axial: { eixo: 1, nome: 'Axial', menor: 'inferior', maior: 'superior' },
};

export function criarCortes(viewer, modelos) {
  const caixa = new THREE.Box3();
  for (const g of Object.values(modelos.grupos)) caixa.expandByObject(g);
  const limites = {};
  const estado = {};
  const planos = {};
  for (const [k, p] of Object.entries(PLANOS)) {
    const comp = ['x', 'y', 'z'][p.eixo];
    limites[k] = [caixa.min[comp] - 0.005, caixa.max[comp] + 0.005];
    estado[k] = { ativo: false, valor: 0, inverter: false };
    planos[k] = new THREE.Plane();
  }

  function atualizar() {
    const ativos = [];
    for (const [k, p] of Object.entries(PLANOS)) {
      const e = estado[k];
      const n = new THREE.Vector3();
      n.setComponent(p.eixo, e.inverter ? 1 : -1);
      planos[k].set(n, e.inverter ? -e.valor : e.valor);
      if (e.ativo) ativos.push(planos[k]);
    }
    viewer.renderer.clippingPlanes = ativos;
  }
  atualizar();

  return {
    limites, estado,
    definir(k, mudancas) { Object.assign(estado[k], mudancas); atualizar(); viewer.invalidar(); },
    // true se o ponto (coordenadas do mundo) não foi cortado
    mantem: (p) => viewer.renderer.clippingPlanes.every((pl) => pl.distanceToPoint(p) >= 0),
    // Reduz a caixa (Box3, coordenadas do mundo) à parte que os cortes ativos mantêm; altera e devolve a própria caixa.
    recortar(caixa) {
      for (const [k, p] of Object.entries(PLANOS)) {
        const e = estado[k];
        if (!e.ativo || caixa.isEmpty()) continue;
        const comp = ['x', 'y', 'z'][p.eixo];
        if (e.inverter) caixa.min[comp] = Math.max(caixa.min[comp], e.valor);
        else caixa.max[comp] = Math.min(caixa.max[comp], e.valor);
      }
      return caixa;
    },
  };
}
