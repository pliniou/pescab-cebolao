// Modos que reorganizam a cena (quiz e exercícios de pintura). Ao entrar, guarda tudo o que o modo altera
// (visibilidade, raio-X, cortes, rótulos e a câmera); ao sair, devolve a cena como estava. Trocar de um modo para outro
// passa pela saída do primeiro, então só existe um estado salvo por vez.
import { PLANOS } from '../scene/cortes.js';
import { caixaDosObjetos } from '../scene/viewer.js';
import { ehCelular, lateralSobreVista } from '../util.js';

export function criarModos({ viewer, modelos, ordem, selecao, cortes, raiox, rotulos, painel, fecharPainel }) {
  let salvo = null;

  // camadas: { camada: opacidade } — as que não estão na lista ficam ocultas
  // mostrar(m): quais estruturas das camadas visíveis aparecem
  function entrar({ camadas, mostrar, ocultarRotulos = false, enquadrar = false }) {
    selecao.selecionar(null);
    if (!salvo) {
      salvo = {
        visibilidade: selecao.capturar(),
        nivel: selecao.nivelIsolamento, // a pilha do Desfazer de antes do modo
        raiox: raiox.salvar(),
        cortes: structuredClone(cortes.estado),
        rotulos: rotulos.ligado,
        camera: viewer.destino(), // o quiz enquadra cada resposta; ao sair, a câmera volta para onde estava
      };
    }
    if (ocultarRotulos) painel.definirRotulos(false); // rótulos entregariam as respostas
    for (const c of ordem) {
      modelos.grupos[c].visible = c in camadas;
      raiox.definir(c, camadas[c] ?? 1);
    }
    for (const m of modelos.malhas.values()) m.visible = mostrar(m);
    for (const k of Object.keys(PLANOS)) cortes.definir(k, { ativo: false });
    const celular = ehCelular();
    // a sessão tem lugar próprio no desktop (coluna), no celular (folha que encolhe a vista) e deitado (coluna à
    // esquerda); só no tablet em pé ela cobre o canto de baixo da vista, que então sobe para o espaço livre
    viewer.deslocar(lateralSobreVista() ? 0.17 : 0);
    if (enquadrar) {
      const caixa = caixaDosObjetos([...modelos.malhas.values()].filter((m) => m.visible && m.parent.visible));
      if (!caixa.isEmpty()) viewer.enquadrarCaixa(caixa, 'reset');
    }
    painel.sincronizarControles();
    painel.sincronizar();
    if (celular) fecharPainel();
  }

  function sair() {
    if (!salvo) return;
    const s = salvo;
    salvo = null;
    viewer.deslocar(0);
    // isolar, "Mostrar ocultas" e Desfazer feitos durante o modo não sobrevivem a ele: fora do modo, o Desfazer
    // voltaria para a cena da sessão
    selecao.cortarPilha(s.nivel);
    raiox.restaurar(s.raiox);
    for (const [k, e] of Object.entries(s.cortes)) cortes.definir(k, e);
    painel.definirRotulos(s.rotulos);
    selecao.restaurar(s.visibilidade);
    viewer.voltarPara(s.camera);
    painel.sincronizarControles();
    painel.sincronizar();
  }

  return { entrar, sair, get ativo() { return !!salvo; } };
}
