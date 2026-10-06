# Executado pelo Blender em modo headless: lista os objetos do Z-Anatomy (nome, coleções, vértices, caixa em coordenadas de mundo).
# Gera work/za_objetos.json, lido por 03a-za-exportar.mjs (usa o campo objects[].name).
# Uso: blender -b Startup.blend --python pipeline/za_listar.py -- saida.json
import bpy, json, sys
from mathutils import Vector

out = sys.argv[sys.argv.index('--') + 1]
rows = []
for ob in bpy.data.objects:
    r = {'name': ob.name, 'type': ob.type,
         'cols': [c.name for c in ob.users_collection],
         'parent': ob.parent.name if ob.parent else None}
    if ob.type == 'MESH' and ob.data:
        r['verts'] = len(ob.data.vertices)
        r['faces'] = len(ob.data.polygons)
        if ob.data.vertices:
            cantos = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
            r['min'] = [min(p[i] for p in cantos) for i in range(3)]
            r['max'] = [max(p[i] for p in cantos) for i in range(3)]
    rows.append(r)
with open(out, 'w', encoding='utf-8') as f:
    json.dump({'objects': rows}, f, ensure_ascii=False)
print(len(rows), 'objetos ->', out)
