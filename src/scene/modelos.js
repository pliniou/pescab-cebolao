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
  let feitos = 0;
  await Promise.all(camadas.map(async (camada) => {
    let gltf;
    try { gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/${camada}.glb`); }
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
    aoProgredir?.(++feitos / camadas.length);
  }));
  return { grupos, malhas };
}
