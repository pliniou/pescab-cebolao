// Configuração compartilhada do pipeline.
// Os dados brutos (≈600 MB descompactados) ficam FORA do OneDrive, em %LOCALAPPDATA%\atlas3d-cache.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CACHE = process.env.ATLAS_CACHE
  || path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), '.cache'), 'atlas3d-cache');
export const OBJ_DIR = path.join(CACHE, 'isa_BP3D_4.0_obj_99');
export const WORK = path.join(CACHE, 'work');

export const BASE_URL = 'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST';
// Links extraídos de https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
// Só o pacote IS-A é necessário: ele contém todos os 2234 arquivos FJ (o PART-OF tem um subconjunto de 1258).
export const FILES = [
  'README_e.html',
  'isa_parts_list_e.txt',
  'isa_element_parts.txt',
  'isa_inclusion_relation_list.txt',
  'partof_parts_list_e.txt',
  'partof_element_parts.txt',
  'partof_inclusion_relation_list.txt',
  'isa_BP3D_4.0_obj_99.zip',
];

// Corte inferior (mm, sistema do Z-Anatomy) para nervos e vasos que descem ao tórax: ≈ margem superior do manúbrio.
export const CORTE_Z = 1360;
export const CAMADAS_CORTADAS = ['nervos', 'arterias', 'veias'];

export function readTsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const head = lines.shift().split('\t');
  return lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [head[i], v])));
}

// Lê um JSON intermediário do pipeline; se faltar, diz qual etapa o gera (em vez de um ENOENT cru)
export function lerJson(arquivo, etapa) {
  if (!fs.existsSync(arquivo)) throw new Error(`falta ${arquivo}: rode antes ${etapa}`);
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}