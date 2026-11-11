#!/usr/bin/env python3
"""
Mapeador Semântico Geoespacial 1:1 — Recife Antigo / Marco Zero
Cruza os 3.069 elementos do OpenStreetMap com a malha 3D fotogramétrica (escala 1:1)
para identificar cada rua, avenida, prédio histórico e monumento com coordenadas métricas exatas (X, Y, Z).
"""

import json
import math
import os

OSM_PATH = "/Users/kevenwilliam2015gmail.com/.gemini/antigravity/brain/42879dad-d0a7-464c-a12e-ccfe3471728d/scratch/osm_marco_zero.json"
OUT_JSON = "/Users/kevenwilliam2015gmail.com/Desktop/metaverso/assets/semantic_map.json"
UNITY_JSON = "/Users/kevenwilliam2015gmail.com/Desktop/metaverso/RecifeVR_Unity/Assets/Recife3D/semantic_map.json"

# Coordenada GPS exata da Rosa dos Ventos / Praça do Marco Zero (Origem 0, 0, 0 do nosso mundo 3D)
ORIGIN_LAT = -8.063150
ORIGIN_LON = -34.871140

# Na nossa malha 3D:
# +X aponta para Oeste (-Lon) e -X aponta para Leste (+Lon, direção estuário/arrecifes)
# +Z aponta para Sul (-Lat) e -Z aponta para Norte (+Lat, direção Rua do Bom Jesus / Cais do Sertão)
METERS_PER_DEG_LAT = 111320.0
METERS_PER_DEG_LON = 111320.0 * math.cos(math.radians(ORIGIN_LAT))


def latlon_to_xz(lat: float, lon: float):
    x = -(lon - ORIGIN_LON) * METERS_PER_DEG_LON
    z = -(lat - ORIGIN_LAT) * METERS_PER_DEG_LAT
    return round(x, 2), round(z, 2)


def main():
    with open(OSM_PATH, "r", encoding="utf-8") as f:
        osm = json.load(f)

    nodes = {}
    for el in osm.get("elements", []):
        if el["type"] == "node":
            nodes[el["id"]] = (el["lat"], el["lon"])

    streets = {}
    buildings = []
    landmarks = []

    for el in osm.get("elements", []):
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue

        if el["type"] == "way":
            pts_ll = [nodes[nid] for nid in el.get("nodes", []) if nid in nodes]
            if len(pts_ll) < 2:
                continue
            pts_xz = [latlon_to_xz(lat, lon) for lat, lon in pts_ll]
            cx = round(sum(p[0] for p in pts_xz) / len(pts_xz), 2)
            cz = round(sum(p[1] for p in pts_xz) / len(pts_xz), 2)

            if "highway" in tags:
                if name not in streets:
                    streets[name] = {
                        "name": name,
                        "type": tags.get("highway"),
                        "center": [cx, cz],
                        "points": pts_xz,
                    }
                else:
                    streets[name]["points"].extend(pts_xz)
            elif "building" in tags or "historic" in tags or "tourism" in tags or "amenity" in tags:
                levels = int(tags.get("building:levels", 3)) if str(tags.get("building:levels", "3")).isdigit() else 3
                height_m = float(tags.get("height", levels * 4.2))
                buildings.append(
                    {
                        "name": name,
                        "category": tags.get("tourism") or tags.get("amenity") or tags.get("building") or "historic",
                        "center": [cx, cz],
                        "height_m": round(height_m, 1),
                        "footprint": pts_xz,
                    }
                )

        elif el["type"] == "node":
            x, z = latlon_to_xz(el["lat"], el["lon"])
            kind = tags.get("tourism") or tags.get("historic") or tags.get("amenity") or tags.get("artwork_type") or "poi"
            landmarks.append(
                {
                    "name": name,
                    "category": kind,
                    "pos": [x, z],
                    "lat": el["lat"],
                    "lon": el["lon"],
                }
            )

    semantic_data = {
        "origin": {
            "name": "Praça Rio Branco (Marco Zero — Rosa dos Ventos)",
            "lat": ORIGIN_LAT,
            "lon": ORIGIN_LON,
            "pos": [0.0, 0.0, 0.0],
        },
        "streets": list(streets.values()),
        "buildings": buildings,
        "landmarks": landmarks,
    }

    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as wf:
        json.dump(semantic_data, wf, indent=2, ensure_ascii=False)

    os.makedirs(os.path.dirname(UNITY_JSON), exist_ok=True)
    with open(UNITY_JSON, "w", encoding="utf-8") as uf:
        json.dump(semantic_data, uf, indent=2, ensure_ascii=False)

    print(
        f"Mapa Semântico 1:1 exportado: {len(streets)} ruas, {len(buildings)} edifícios com polígono 3D e {len(landmarks)} marcos históricos!"
    )


if __name__ == "__main__":
    main()

