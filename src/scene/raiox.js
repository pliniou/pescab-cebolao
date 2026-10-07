// Raio-X: opacidade por camada. É a fonte única desse valor: o painel, os roteiros, o quiz e os exercícios leem e
// gravam aqui, e quem altera a opacidade de uma malha temporariamente (o "fantasma" do quiz) volta para o valor
// da camada com restaurarMalha, mesmo que o controle tenha sido mexido nesse meio-tempo.

// Abaixo disto a malha é tratada como ausente: não é desenhada, não recebe toque (selecao.js) nem rótulo (rotulos.js)
export const INVISIVEL = 0.05;

// Material opaco grava profundidade; translúcido não (senão esconde o que está atrás). Mudar `transparent`
// exige recompilar o material. Quase transparente não é desenhado (material.visible), para não pesar na passada
// transparente; isso não mexe na visibilidade da estrutura (Object3D.visible), que é da seleção e do painel.
export function aplicarOpacidade(material, v) {
  const opaco = v >= 1;
  if (material.transparent === opaco) material.needsUpdate = true;
  material.opacity = v;
  material.transparent = !opaco;
  material.depthWrite = opaco;
  material.visible = v > INVISIVEL;
}

// Opacidade das estruturas que ficam na frente da estrutura em foco (o foco por nome): translúcidas o bastante para
// a peça aparecer através delas, opacas o bastante para manter o contexto.
export const RECUO = 0.18;

export function criarRaioX(modelos, camadas, aoMudar) {
  const valores = Object.fromEntries(camadas.map((c) => [c, 1]));
  const recuadas = new Set(); // malhas com opacidade própria abaixo da camada (ver recuar)
  function aplicar(camada, v) {
    valores[camada] = v;
    for (const m of modelos.grupos[camada].children) {
      if (!m.isMesh) continue;
      recuadas.delete(m); // a camada mudou: a malha volta a seguir o valor dela
      aplicarOpacidade(m.material, v);
    }
  }
  function definir(camada, v) {
    aplicar(camada, v);
    aoMudar?.();
  }
  function soltar() {
    for (const m of recuadas) aplicarOpacidade(m.material, valores[m.userData.camada]);
    const havia = recuadas.size > 0;
    recuadas.clear();
    return havia;
  }
  return {
    valor: (camada) => valores[camada],
    definir,
    restaurarMalha(m) { recuadas.delete(m); aplicarOpacidade(m.material, valores[m.userData.camada]); },
    salvar: () => ({ ...valores }),
    // todas as camadas de uma vez, com um só aviso (cada aviso invalida a cena e rearranja os rótulos)
    restaurar(salvo) { for (const [c, v] of Object.entries(salvo)) aplicar(c, v); aoMudar?.(); },
    // Deixa translúcidas só estas malhas (as que escondem a estrutura em foco), sem mexer no valor das camadas; as
    // recuadas antes voltam ao valor da camada. Mudar a camada depois desfaz o recuo dela.
    recuar(malhas, v = RECUO) {
      soltar();
      for (const m of malhas) {
        if (m.material.opacity <= v) continue; // já está mais transparente que o recuo (raio-X da camada)
        recuadas.add(m);
        aplicarOpacidade(m.material, v);
      }
      aoMudar?.();
    },
    // devolve as recuadas ao valor da camada
    soltar() { if (soltar()) aoMudar?.(); },
    get recuadas() { return recuadas.size; },
  };
}
