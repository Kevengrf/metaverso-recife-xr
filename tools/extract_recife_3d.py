#!/usr/bin/env python3
"""
Extrator e Otimizador de Fotogrametria 3D — Recife Antigo / Marco Zero (Escala Real 1:1)
Converte os blocos LOD00 do pacote MSFS 2020 (rodukao-recife) para arquivos .glb glTF 2.0 padrão
com texturas tratadas (nitidez, contraste e cor) e coordenadas centradas na Rosa dos Ventos do Marco Zero (0, 0, 0).
"""

import io
import json
import math
import os
import struct
from PIL import Image, ImageEnhance

BGL_PATH = "/Users/kevenwilliam2015gmail.com/.gemini/antigravity/brain/42879dad-d0a7-464c-a12e-ccfe3471728d/scratch/bgl_test/rodukao-recife/scenery/rodukao-recife/rodukao-recife-modelLib.BGL"
TEX_DIR = "/Users/kevenwilliam2015gmail.com/.gemini/antigravity/brain/42879dad-d0a7-464c-a12e-ccfe3471728d/scratch/bgl_test/rodukao-recife/scenery/rodukao-recife/TEXTURE"
OUT_DIR = "/Users/kevenwilliam2015gmail.com/Desktop/metaverso/assets/tiles"

# Malha 3x3 cobrindo toda a Ilha do Recife Antigo / Marco Zero / Porto Digital (~1km x 1km em escala 1:1)
TILES_CONFIG = [
    ("03726171425142515", "marco_zero_centro", "Praça do Marco Zero & Caixa Cultural"),
    ("03726171425143404", "parque_esculturas_leste", "Parque das Esculturas de Brennand & Arrecifes"),
    ("03726171425140737", "recife_antigo_sul", "Av. Marquês de Olinda, Madre de Deus & Pontes"),
    ("03726171425141626", "bacia_porto_sudeste", "Bacia do Porto & Molhe Sul"),
    ("03726171425142517", "bom_jesus_arsenal_norte", "Rua do Bom Jesus, Paço do Frevo, Torre Malakoff & Cais do Sertão"),
    ("03726171425142514", "cais_santa_rita_oeste", "Cais de Santa Rita & Rio Capibaribe"),
    ("03726171425143406", "porto_digital_nordeste", "Cais do Sertão & Porto do Recife"),
    ("03726171425140736", "santo_antonio_sudoeste", "Ponte Maurício de Nassau & Santo Antônio"),
    ("03726171425142516", "ponte_limoeiro_noroeste", "Rio Capibaribe Norte & Santo Amaro"),
]

# Coordenada exata da área aberta da Praça do Marco Zero (em frente à Caixa Cultural e Associação Comercial)
ORIGIN_X = -238.0 * 1.0045000314712524
ORIGIN_Y = 109.20  # Nível exato da calçada da Praça do Marco Zero
ORIGIN_Z = 90.0 * 1.0045000314712524


def octree_to_grid(path: str):
    gx, gy = 0, 0
    for ch in path:
        d = int(ch)
        gx = (gx << 1) | (1 if (d & 1) else 0)
        gy = (gy << 1) | (1 if (d & 2) else 0)
    return gx, gy


def process_dds_to_jpeg(dds_path: str) -> bytes:
    """Converte textura DDS 2048x2048 para JPEG otimizado com tratamento de nitidez, cor e contraste."""
    im = Image.open(dds_path).convert("RGB")
    im = ImageEnhance.Color(im).enhance(1.22)
    im = ImageEnhance.Contrast(im).enhance(1.10)
    im = ImageEnhance.Sharpness(im).enhance(1.45)
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=90, optimize=True)
    return buf.getvalue()


def build_standard_glb(vertices_pos, vertices_norm, vertices_uv, indices, jpeg_bytes, tile_name):
    """Empacota geometria float32 + uint32 indices + textura JPEG em um arquivo .glb glTF 2.0 padrão."""
    n_verts = len(vertices_pos) // 3
    n_idx = len(indices)

    min_x = min(vertices_pos[0::3])
    max_x = max(vertices_pos[0::3])
    min_y = min(vertices_pos[1::3])
    max_y = max(vertices_pos[1::3])
    min_z = min(vertices_pos[2::3])
    max_z = max(vertices_pos[2::3])

    pos_bin = struct.pack(f"<{len(vertices_pos)}f", *vertices_pos)
    norm_bin = struct.pack(f"<{len(vertices_norm)}f", *vertices_norm)
    uv_bin = struct.pack(f"<{len(vertices_uv)}f", *vertices_uv)
    idx_bin = struct.pack(f"<{len(indices)}I", *indices)

    def pad4(b: bytes) -> bytes:
        rem = len(b) % 4
        return b + (b"\x00" * (4 - rem) if rem else b"")

    pos_bin = pad4(pos_bin)
    norm_bin = pad4(norm_bin)
    uv_bin = pad4(uv_bin)
    idx_bin = pad4(idx_bin)
    img_bin = pad4(jpeg_bytes)

    off_pos = 0
    off_norm = off_pos + len(pos_bin)
    off_uv = off_norm + len(norm_bin)
    off_idx = off_uv + len(uv_bin)
    off_img = off_idx + len(idx_bin)
    total_bin = pos_bin + norm_bin + uv_bin + idx_bin + img_bin

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Metaverso Recife 1:1 Photogrammetry Pipeline (BBTS & Comunidade IV)",
        },
        "scene": 0,
        "scenes": [{"name": tile_name, "nodes": [0]}],
        "nodes": [{"name": tile_name, "mesh": 0}],
        "meshes": [
            {
                "name": tile_name,
                "primitives": [
                    {
                        "attributes": {
                            "POSITION": 0,
                            "NORMAL": 1,
                            "TEXCOORD_0": 2,
                        },
                        "indices": 3,
                        "material": 0,
                        "mode": 4,
                    }
                ],
            }
        ],
        "materials": [
            {
                "name": f"mat_{tile_name}",
                "pbrMetallicRoughness": {
                    "baseColorTexture": {"index": 0},
                    "metallicFactor": 0.0,
                    "roughnessFactor": 0.9,
                },
                "doubleSided": True,
            }
        ],
        "textures": [{"source": 0, "sampler": 0}],
        "samplers": [
            {
                "magFilter": 9729,
                "minFilter": 9987,
                "wrapS": 33071,
                "wrapT": 33071,
            }
        ],
        "images": [
            {
                "name": f"tex_{tile_name}",
                "bufferView": 4,
                "mimeType": "image/jpeg",
            }
        ],
        "accessors": [
            {
                "bufferView": 0,
                "byteOffset": 0,
                "componentType": 5126,
                "count": n_verts,
                "type": "VEC3",
                "min": [min_x, min_y, min_z],
                "max": [max_x, max_y, max_z],
            },
            {
                "bufferView": 1,
                "byteOffset": 0,
                "componentType": 5126,
                "count": n_verts,
                "type": "VEC3",
            },
            {
                "bufferView": 2,
                "byteOffset": 0,
                "componentType": 5126,
                "count": n_verts,
                "type": "VEC2",
            },
            {
                "bufferView": 3,
                "byteOffset": 0,
                "componentType": 5125,
                "count": n_idx,
                "type": "SCALAR",
            },
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": off_pos, "byteLength": len(pos_bin), "target": 34962},
            {"buffer": 0, "byteOffset": off_norm, "byteLength": len(norm_bin), "target": 34962},
            {"buffer": 0, "byteOffset": off_uv, "byteLength": len(uv_bin), "target": 34962},
            {"buffer": 0, "byteOffset": off_idx, "byteLength": len(idx_bin), "target": 34963},
            {"buffer": 0, "byteOffset": off_img, "byteLength": len(jpeg_bytes)},
        ],
        "buffers": [{"byteLength": len(total_bin)}],
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    rem = len(json_bytes) % 4
    if rem:
        json_bytes += b" " * (4 - rem)

    total_length = 12 + 8 + len(json_bytes) + 8 + len(total_bin)
    header = struct.pack("<4sII", b"glTF", 2, total_length)
    chunk_json = struct.pack("<II", len(json_bytes), 0x4E4F534A) + json_bytes
    chunk_bin = struct.pack("<II", len(total_bin), 0x004E4942) + total_bin
    return header + chunk_json + chunk_bin, {
        "vertices": n_verts,
        "triangles": n_idx // 3,
        "bounds": {
            "min": [round(min_x, 2), round(min_y, 2), round(min_z, 2)],
            "max": [round(max_x, 2), round(max_y, 2), round(max_z, 2)],
        },
    }


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(BGL_PATH, "rb") as f:
        data = f.read()

    gx0, gy0 = octree_to_grid("03726171425142515")
    target_map = {code: (slug, desc) for code, slug, desc in TILES_CONFIG}

    manifest = []
    pos = 0
    while True:
        idx = data.find(b"glTF", pos)
        if idx == -1:
            break
        version, length, chunk_len, chunk_type = struct.unpack("<IIII", data[idx + 4 : idx + 20])
        try:
            j = json.loads(data[idx + 20 : idx + 20 + chunk_len].rstrip(b"\x00 ").decode("utf-8"))
        except Exception:
            pos = idx + max(length, 4)
            continue

        imgs = j.get("images", [])
        if imgs:
            img_name = imgs[0].get("name", "")
            code = img_name.replace("_LOD00", "")
            if img_name.endswith("_LOD00") and code in target_map:
                slug, desc = target_map[code]
                gx, gy = octree_to_grid(code)
                d_lon = gx - gx0
                d_lat = gy - gy0

                # Offset métrico exato 1:1 em relação à Rosa dos Ventos do Marco Zero
                tx = -d_lon * 305.75 - ORIGIN_X
                ty = -ORIGIN_Y
                tz = -d_lat * 308.24 - ORIGIN_Z

                bin_start = idx + 20 + chunk_len + 8
                accessors = j["accessors"]
                buffer_views = j["bufferViews"]
                nodes = j["nodes"]
                meshes = j["meshes"]

                all_pos = []
                all_norm = []
                all_uv = []
                all_idx = []
                v_offset = 0

                for node in nodes:
                    if "mesh" not in node:
                        continue
                    scale = node.get("scale", [1.0, 1.0, 1.0])
                    sx, sy, sz = scale[0], scale[1], scale[2]
                    mesh = meshes[node["mesh"]]
                    for prim in mesh["primitives"]:
                        pos_acc = accessors[prim["attributes"]["POSITION"]]
                        idx_acc = accessors[prim["indices"]]

                        v_bv = buffer_views[pos_acc["bufferView"]]
                        v_byte_off = v_bv.get("byteOffset", 0) + pos_acc.get("byteOffset", 0)
                        v_count = pos_acc["count"]

                        for vi in range(v_count):
                            rec = data[bin_start + v_byte_off + vi * 36 : bin_start + v_byte_off + (vi + 1) * 36]
                            px, py, pz = struct.unpack("<fff", rec[0:12])
                            nx_b, ny_b, nz_b, _ = struct.unpack("<bbbb", rec[16:20])
                            u_f16, v_f16 = struct.unpack("<ee", rec[20:24])

                            wx = px * sx + tx
                            wy = py * sy + ty
                            wz = pz * sz + tz

                            n_len = math.hypot(nx_b, ny_b, nz_b) or 1.0
                            nx, ny, nz = nx_b / n_len, ny_b / n_len, nz_b / n_len

                            all_pos.extend((wx, wy, wz))
                            all_norm.extend((nx, ny, nz))
                            all_uv.extend((float(u_f16), float(v_f16)))

                        i_bv = buffer_views[idx_acc["bufferView"]]
                        i_byte_off = i_bv.get("byteOffset", 0) + idx_acc.get("byteOffset", 0)
                        i_count = idx_acc["count"]
                        raw_indices = struct.unpack(
                            f"<{i_count}H",
                            data[bin_start + i_byte_off : bin_start + i_byte_off + i_count * 2],
                        )
                        # Inverte a ordem (i0, i2, i1) de DirectX (CW) para OpenGL/glTF/Unity (CCW)
                        for ti in range(0, i_count, 3):
                            all_idx.append(v_offset + raw_indices[ti])
                            all_idx.append(v_offset + raw_indices[ti + 2])
                            all_idx.append(v_offset + raw_indices[ti + 1])

                        v_offset += v_count

                dds_path = os.path.join(TEX_DIR, f"{code}_LOD00.PNG.DDS")
                jpeg_bytes = process_dds_to_jpeg(dds_path)
                glb_bytes, stats = build_standard_glb(all_pos, all_norm, all_uv, all_idx, jpeg_bytes, slug)

                out_file = os.path.join(OUT_DIR, f"{slug}.glb")
                with open(out_file, "wb") as wf:
                    wf.write(glb_bytes)

                entry = {
                    "code": code,
                    "slug": slug,
                    "file": f"assets/tiles/{slug}.glb",
                    "description": desc,
                    "grid": [d_lon, d_lat],
                    "size_kb": round(len(glb_bytes) / 1024, 1),
                    **stats,
                }
                manifest.append(entry)
                print(
                    f"[OK] {slug}.glb ({entry['size_kb']} KB) | {stats['vertices']} verts, {stats['triangles']} tris | grid=({d_lon:+d},{d_lat:+d})"
                )

        pos = idx + max(length, 4)

    manifest.sort(key=lambda x: abs(x["grid"][0]) + abs(x["grid"][1]))
    manifest_path = os.path.join(OUT_DIR, "tiles_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, indent=2, ensure_ascii=False)
    print(f"\nConcluído! {len(manifest)} blocos 3D exportados em escala 1:1 para {OUT_DIR}")


if __name__ == "__main__":
    main()

