# Executado pelo Blender (headless): exporta objetos do Z-Anatomy como OBJ em milímetros, no sistema de mundo do Z-Anatomy.
# Curvas (nervos/vasos) são convertidas em tubo; se a curva não tiver espessura, usa o raio pedido.
# Uso: blender -b Startup.blend --python pipeline/za_exportar.py -- pedido.json pasta_saida
import bpy, json, sys, os

args = sys.argv[sys.argv.index('--') + 1:]
pedido = json.load(open(args[0], encoding='utf-8'))
saida = args[1]
os.makedirs(saida, exist_ok=True)

relatorio = []
for item in pedido:
    ob = bpy.data.objects.get(item['nome'])
    r = {'nome': item['nome'], 'arquivo': item['arquivo']}
    if ob is None:
        r['erro'] = 'não existe'
        relatorio.append(r)
        continue
    r['tipo'] = ob.type
    if ob.type == 'CURVE':
        cu = ob.data
        r['bevel_original_mm'] = cu.bevel_depth * 1000
        r['bevel_objeto'] = cu.bevel_object.name if cu.bevel_object else None
        if cu.bevel_depth == 0 and cu.bevel_object is None and cu.extrude == 0:
            cu.bevel_depth = item.get('raio', 0.001)
            r['bevel_aplicado_mm'] = cu.bevel_depth * 1000
        cu.bevel_resolution = max(cu.bevel_resolution, 2)
        cu.use_fill_caps = True
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    try:
        me = ev.to_mesh()
    except RuntimeError as e:
        r['erro'] = str(e)
        relatorio.append(r)
        continue
    mw = ev.matrix_world
    linhas = ['# Fonte: Z-Anatomy (CC BY-SA 4.0), derivado do BodyParts3D',
              '# English name : ' + item['nome'], '# Unidade : mm (sistema de mundo do Z-Anatomy)']
    vs = []
    for v in me.vertices:
        p = mw @ v.co
        vs.append(p)
        linhas.append('v %.4f %.4f %.4f' % (p.x * 1000, p.y * 1000, p.z * 1000))
    nf = 0
    for poly in me.polygons:
        idx = list(poly.vertices)
        for i in range(1, len(idx) - 1):  # triangula em leque
            linhas.append('f %d %d %d' % (idx[0] + 1, idx[i] + 1, idx[i + 1] + 1))
            nf += 1
    r['verts'] = len(vs)
    r['faces'] = nf
    if vs:
        r['min'] = [min(p[i] for p in vs) * 1000 for i in range(3)]
        r['max'] = [max(p[i] for p in vs) * 1000 for i in range(3)]
    ev.to_mesh_clear()
    if nf == 0:
        r['erro'] = 'sem faces'
    else:
        open(os.path.join(saida, item['arquivo'] + '.obj'), 'w', encoding='utf-8').write('\n'.join(linhas) + '\n')
    relatorio.append(r)

json.dump(relatorio, open(os.path.join(saida, '_relatorio.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('exportados:', sum(1 for r in relatorio if 'erro' not in r), 'de', len(relatorio))
