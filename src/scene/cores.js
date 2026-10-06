// Cores das estruturas: "natural" (cor da camada), "atlas" (cada estrutura com uma cor, como nos atlas impressos)
// e pintura do usuário por cima (salva no aparelho). material.userData.cor guarda sempre a cor-base atual,
// que é a cor para a qual seleção e quiz voltam depois de destacar algo.
import * as THREE from 'three';

const CHAVE = 'atlas-cores-v1';

export const PALETA = [
  { nome: 'Vermelho', hex: '#e53935' }, { nome: 'Laranja', hex: '#fb8c00' }, { nome: 'Amarelo', hex: '#fdd835' },
  { nome: 'Verde', hex: '#43a047' }, { nome: 'Azul-claro', hex: '#29b6f6' }, { nome: 'Azul', hex: '#3949ab' },
  { nome: 'Roxo', hex: '#8e24aa' }, { nome: 'Rosa', hex: '#f06292' },
];

const MODOS = ['natural', 'atlas'];
const HEX = /^#[0-9a-f]{6}$/i;

// Estado salvo no aparelho, validado: modo conhecido e só pinturas com cor válida de estruturas que ainda existem
// (um id renomeado no pipeline deixaria pintura fantasma, contada no "Apagar toda a pintura?")
function ler(existe) {
  let salvo = {};
  try { salvo = JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch {}
  const pintura = {};
  if (salvo.pintura && typeof salvo.pintura === 'object') {
    for (const [id, hex] of Object.entries(salvo.pintura)) if (existe(id) && typeof hex === 'string' && HEX.test(hex)) pintura[id] = hex;
  }
  return { modo: MODOS.includes(salvo.modo) ? salvo.modo : 'natural', pintura };
}

export function criarCores(modelos) {
  const malhas = [...modelos.malhas.values()];
  for (const m of malhas) m.material.userData.corOriginal = m.material.userData.cor.clone();

  // Modo atlas: uma cor por estrutura (os dois lados com a mesma cor; dentes por tipo: incisivo central, lateral…)
  const chave = (m) => {
    const e = m.userData.info || {};
    return e.fdi ? `dente-${Number(e.fdi) % 10}` : e.en || m.userData.id;
  };
  const corAtlas = new Map();
  const porCamada = {};
  for (const m of malhas) (porCamada[m.userData.camada] ||= new Set()).add(chave(m));
  // Uma única sequência de ângulo áureo para todas as camadas, na ordem do modelo: nenhuma estrutura repete a cor de
  // outra (antes cada camada recomeçava a sequência e camadas diferentes se repetiam entre si)
  let n = 0;
  for (const camada of Object.keys(modelos.grupos)) {
    for (const k of [...(porCamada[camada] || [])].sort()) {
      // vizinhos na sequência ficam com matizes bem diferentes; claridade alternada
      const c = new THREE.Color().setHSL((n * 137.508 % 360) / 360, 0.6, n % 2 ? 0.68 : 0.55);
      corAtlas.set(`${camada}|${k}`, c);
      n++;
    }
  }

  let estado = ler((id) => modelos.malhas.has(id));
  let temporario = false; // durante exercícios a pintura não é gravada

  function base(m) {
    const p = estado.pintura[m.userData.id];
    if (p) return new THREE.Color(p);
    if (estado.modo === 'atlas') return corAtlas.get(`${m.userData.camada}|${chave(m)}`);
    return m.material.userData.corOriginal;
  }
  function aplicar(lista = malhas) {
    for (const m of lista) {
      const c = base(m);
      m.material.userData.cor.copy(c);
      m.material.color.copy(c);
    }
  }
  function gravar() {
    if (temporario) return;
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch {}
  }

  aplicar();
  return {
    get modo() { return estado.modo; },
    set modo(v) { estado.modo = v; aplicar(); gravar(); },
    pintura: (m) => estado.pintura[m.userData.id] || null,
    pintar(m, hex) {
      if (hex) estado.pintura[m.userData.id] = hex; else delete estado.pintura[m.userData.id];
      aplicar([m]); gravar();
    },
    limpar() { estado.pintura = {}; aplicar(); gravar(); },
    get qtdPintadas() { return Object.keys(estado.pintura).length; },
    corCss: (m) => `#${m.material.userData.cor.getHexString()}`,
    corOriginalCss: (m) => `#${m.material.userData.corOriginal.getHexString()}`,
    // exercícios: começam do zero e, ao sair, devolvem as cores/pintura anteriores
    iniciarTemporario() {
      const antes = estado;
      estado = { modo: 'natural', pintura: {} };
      temporario = true;
      aplicar();
      return () => { estado = antes; temporario = false; aplicar(); };
    },
  };
}
