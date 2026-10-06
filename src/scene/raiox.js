// Raio-X: opacidade por camada. É a fonte única desse valor: o painel, os roteiros, o quiz e os exercícios leem e
// gravam aqui, e quem altera a opacidade de uma malha temporariamente (o "fantasma" do quiz) volta para o valor
// da camada com restaurarMalha, mesmo que o controle tenha sido mexido nesse meio-tempo.

// Abaixo disto a malha é tratada como ausente (seleção e rótulos já usam o mesmo corte)
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

export function criarRaioX(modelos, camadas, aoMudar) {
  const valores = Object.fromEntries(camadas.map((c) => [c, 1]));
  function aplicar(camada, v) {
    valores[camada] = v;
    for (const m of modelos.grupos[camada].children) if (m.isMesh) aplicarOpacidade(m.material, v);
  }
  function definir(camada, v) {
    aplicar(camada, v);
    aoMudar?.();
  }
  return {
    valor: (camada) => valores[camada],
    definir,
    restaurarMalha(m) { aplicarOpacidade(m.material, valores[m.userData.camada]); },
    salvar: () => ({ ...valores }),
    // todas as camadas de uma vez, com um só aviso (cada aviso invalida a cena e rearranja os rótulos)
    restaurar(salvo) { for (const [c, v] of Object.entries(salvo)) aplicar(c, v); aoMudar?.(); },
  };
}
