// Carrega um GLB por camada; cada nó é uma estrutura (nome = id do estruturas.json).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// A gengiva é uma peça única das duas arcadas: começa oculta, não acompanha a explosão e fica fora do quiz.
export const ehGengiva = (m) => m.userData.info?.en === 'gingiva';

// Prepara uma malha carregada: material próprio (cores, raio-X e destaque são por estrutura) e metadados.
export function prepararMalha(m, camada, porId) {
  // Os GLB não trazem normais (o weld seria desfeito); calculamos normais suaves aqui.
  m.geometry.computeVertexNormals();
  m.geometry.computeBoundingBox();
  m.geometry.computeBoundingSphere();
  m.material = m.material.clone();
  m.material.userData.cor = m.material.color.clone();
  const id = m.userData.id || m.name;
  m.userData.id = id;
  m.userData.camada = camada;
  m.userData.info = porId.get(id) || null;
  m.userData.base = m.position.clone();
  return m;
}

export async function carregarModelos(scene, camadas, porId, aoProgredir) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const grupos = {};
  const malhas = new Map();
  // progresso por bytes: as camadas baixam juntas e têm tamanhos muito diferentes (glândulas ~35 kB, nervos ~680 kB),
  // então contar camadas prontas parava o número enquanto as grandes chegavam
  const baixado = Object.fromEntries(camadas.map((c) => [c, { feito: 0, total: 0 }]));
  const avisar = () => {
    const bs = Object.values(baixado);
    // com o tamanho de todas conhecido, conta bytes; senão (servidor sem Content-Length), camadas prontas
    if (bs.every((b) => b.total)) aoProgredir?.(bs.reduce((s, b) => s + Math.min(b.feito, b.total), 0) / bs.reduce((s, b) => s + b.total, 0));
    else aoProgredir?.(bs.filter((b) => b.pronta).length / bs.length);
  };
  await Promise.all(camadas.map(async (camada) => {
    let gltf;
    const b = baixado[camada];
    const progresso = (ev) => {
      if (!ev.lengthComputable) return;
      b.feito = ev.loaded; b.total = ev.total;
      avisar();
    };
    try { gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/${camada}.glb`, progresso); }
    // a camada vai no erro: main.js diz ao usuário qual arquivo faltou
    catch (erro) { throw Object.assign(new Error(`não foi possível carregar a camada "${camada}"`, { cause: erro }), { camada }); }
    const grupo = new THREE.Group();
    grupo.name = camada;
    grupo.userData.camada = camada;
    const lista = [];
    gltf.scene.traverse((o) => { if (o.isMesh) lista.push(o); });
    for (const m of lista) {
      prepararMalha(m, camada, porId);
      malhas.set(m.userData.id, m);
      grupo.add(m); // o pai original é a cena do glTF, sem transformação
    }
    scene.add(grupo);
    grupos[camada] = grupo;
    b.pronta = true;
    b.feito = b.total; // pronta conta inteira (o último evento de progresso pode não chegar a 100%)
    avisar();
  }));
  return { grupos, malhas };
}
