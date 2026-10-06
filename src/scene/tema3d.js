// Cores do 3D lidas dos tokens do design system (src/style.css é a fonte única; nenhum valor é repetido no JS).
// A leitura acontece no momento do uso, então acompanha a troca de tema. As luzes da cena (viewer.js) são
// iluminação, não cores do sistema, e ficam fora daqui.
import * as THREE from 'three';

export function corDoTema(token, alvo = new THREE.Color()) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
  if (!valor) throw new Error(`token de cor ausente no CSS: --${token}`);
  return alvo.setStyle(valor);
}
