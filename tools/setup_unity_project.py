#!/usr/bin/env python3
"""
Gera o projeto Unity 6 (6000.6.8f1) completo em /Users/kevenwilliam2015gmail.com/Desktop/metaverso/RecifeVR_Unity
para compilação futura de APK Nativo (Meta Quest 3S), exportando os 9 blocos de fotogrametria 1:1
para Assets/Recife3D/ (.obj + .mtl + .jpg) com scripts C# de colisão de malha e locomoção VR 1:1.
"""

import io
import json
import os
import sqlite3
import struct
import time

UNITY_DIR = "/Users/kevenwilliam2015gmail.com/Desktop/metaverso/RecifeVR_Unity"
TILES_DIR = "/Users/kevenwilliam2015gmail.com/Desktop/metaverso/assets/tiles"
ASSETS_3D_DIR = os.path.join(UNITY_DIR, "Assets", "Recife3D")
SCRIPTS_DIR = os.path.join(UNITY_DIR, "Assets", "Scripts")
EDITOR_DIR = os.path.join(UNITY_DIR, "Assets", "Editor")
PACKAGES_DIR = os.path.join(UNITY_DIR, "Packages")
SETTINGS_DIR = os.path.join(UNITY_DIR, "ProjectSettings")


def glb_to_unity_obj(glb_path: str, slug: str, out_dir: str):
    with open(glb_path, "rb") as f:
        data = f.read()

    _, _, j_len, _ = struct.unpack("<IIII", data[4:20])
    j = json.loads(data[20 : 20 + j_len].decode("utf-8"))
    bin_start = 20 + j_len + 8
    bvs = j["bufferViews"]

    n_verts = j["accessors"][0]["count"]
    n_idx = j["accessors"][3]["count"]

    pos_off = bvs[0]["byteOffset"]
    norm_off = bvs[1]["byteOffset"]
    uv_off = bvs[2]["byteOffset"]
    idx_off = bvs[3]["byteOffset"]
    img_off = bvs[4]["byteOffset"]
    img_len = bvs[4]["byteLength"]

    # Salva textura .jpg
    jpg_path = os.path.join(out_dir, f"{slug}.jpg")
    with open(jpg_path, "wb") as jf:
        jf.write(data[bin_start + img_off : bin_start + img_off + img_len])

    # Salva arquivo .mtl
    mtl_path = os.path.join(out_dir, f"{slug}.mtl")
    with open(mtl_path, "w", encoding="utf-8") as mf:
        mf.write(f"newmtl mat_{slug}\n")
        mf.write("Ka 1.000 1.000 1.000\n")
        mf.write("Kd 1.000 1.000 1.000\n")
        mf.write("Ks 0.000 0.000 0.000\n")
        mf.write("d 1.0\n")
        mf.write("illum 1\n")
        mf.write(f"map_Kd {slug}.jpg\n")

    # Extrai buffers e escreve .obj (Nota: OBJ usa V=0 na base, portanto 1.0 - v_gltf)
    verts = struct.unpack(f"<{n_verts * 3}f", data[bin_start + pos_off : bin_start + pos_off + n_verts * 12])
    norms = struct.unpack(f"<{n_verts * 3}f", data[bin_start + norm_off : bin_start + norm_off + n_verts * 12])
    uvs = struct.unpack(f"<{n_verts * 2}f", data[bin_start + uv_off : bin_start + uv_off + n_verts * 8])
    inds = struct.unpack(f"<{n_idx}I", data[bin_start + idx_off : bin_start + idx_off + n_idx * 4])

    obj_path = os.path.join(out_dir, f"{slug}.obj")
    lines = [
        f"# Recife Antigo 1:1 Photogrammetry Tile: {slug}",
        f"mtllib {slug}.mtl",
        f"o {slug}",
        f"g {slug}",
        f"usemtl mat_{slug}",
    ]

    for i in range(n_verts):
        # Unity importa OBJ invertendo X (-x) por padrão; passamos -x para ficar idêntico à orientação geográfica real
        vx, vy, vz = -verts[i * 3], verts[i * 3 + 1], verts[i * 3 + 2]
        lines.append(f"v {vx:.4f} {vy:.4f} {vz:.4f}")

    for i in range(n_verts):
        u, v = uvs[i * 2], 1.0 - uvs[i * 2 + 1]
        lines.append(f"vt {u:.5f} {v:.5f}")

    for i in range(n_verts):
        nx, ny, nz = -norms[i * 3], norms[i * 3 + 1], norms[i * 3 + 2]
        lines.append(f"vn {nx:.4f} {ny:.4f} {nz:.4f}")

    for t in range(0, n_idx, 3):
        i1, i2, i3 = inds[t] + 1, inds[t + 1] + 1, inds[t + 2] + 1
        lines.append(f"f {i1}/{i1}/{i1} {i3}/{i3}/{i3} {i2}/{i2}/{i2}")

    with open(obj_path, "w", encoding="utf-8") as of:
        of.write("\n".join(lines) + "\n")


def create_unity_files():
    for d in (ASSETS_3D_DIR, SCRIPTS_DIR, EDITOR_DIR, PACKAGES_DIR, SETTINGS_DIR):
        os.makedirs(d, exist_ok=True)

    # 1. ProjectVersion.txt para o Unity 6 instalado (6000.6.8f1)
    with open(os.path.join(SETTINGS_DIR, "ProjectVersion.txt"), "w", encoding="utf-8") as f:
        f.write("m_EditorVersion: 6000.6.8f1\nm_EditorVersionWithRevision: 6000.6.8f1 (000000000000)\n")

    # 2. Packages/manifest.json com suporte a XR / OpenXR (Meta Quest 3S)
    manifest = {
        "dependencies": {
            "com.unity.ugui": "2.0.0",
            "com.unity.xr.interaction.toolkit": "3.0.7",
            "com.unity.xr.management": "4.5.0",
            "com.unity.xr.openxr": "1.13.1",
            "com.unity.inputsystem": "1.11.2",
            "com.unity.modules.audio": "1.0.0",
            "com.unity.modules.imageresize": "1.0.0",
            "com.unity.modules.jsonserialize": "1.0.0",
            "com.unity.modules.physics": "1.0.0",
            "com.unity.modules.ui": "1.0.0",
            "com.unity.modules.vr": "1.0.0",
            "com.unity.modules.xr": "1.0.0",
        }
    }
    with open(os.path.join(PACKAGES_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    # 3. Script Runtime C#: Controle de Caminhada 1:1 (Meta Quest 3S Joysticks + Teclado no Editor)
    player_cs = """using UnityEngine;
using UnityEngine.XR;
using System.Collections.Generic;

[RequireComponent(typeof(CharacterController))]
public class RecifeVRPlayerController : MonoBehaviour
{
    [Header("Escala Humana Real 1:1 (Metros)")]
    public float eyeHeightMeters = 1.70f;
    public float walkSpeed = 2.4f;
    public float runSpeed = 5.5f;
    public float snapTurnAngle = 30f;
    public float gravity = -9.81f;

    [Header("Pontos de Teletransporte (Marco Zero & Rec'n'Play)")]
    public Vector3[] stationPositions = new Vector3[]
    {
        new Vector3(0f, 2f, 0f),         // 1. Praça do Marco Zero
        new Vector3(45f, 2f, 32f),       // 2. Arena BBTS Hackathon 24h
        new Vector3(88f, 2f, -12f),      // 3. QG Comunidade IV (Av. Rio Branco)
        new Vector3(65f, 2f, -145f),     // 4. Rua do Bom Jesus & Praça do Arsenal
        new Vector3(35f, 2f, -260f),     // 5. Cais do Sertão & Porto Digital
        new Vector3(-135f, 2f, -15f)     // 6. Parque das Esculturas (Brennand)
    };

    private CharacterController controller;
    private Camera headCamera;
    private float verticalVelocity = 0f;
    private float snapCooldown = 0f;
    private int currentStation = 0;
    private float yaw = 0f;
    private float pitch = 0f;

    void Start()
    {
        controller = GetComponent<CharacterController>();
        controller.height = eyeHeightMeters + 0.10f;
        controller.radius = 0.30f;
        controller.center = new Vector3(0f, controller.height * 0.5f, 0f);
        controller.stepOffset = 0.45f;

        headCamera = GetComponentInChildren<Camera>();
        if (headCamera != null)
        {
            headCamera.transform.localPosition = new Vector3(0f, eyeHeightMeters, 0f);
            headCamera.nearClipPlane = 0.1f;
            headCamera.farClipPlane = 2500f;
        }
    }

    void Update()
    {
        HandleMovement();
        HandleQuestControllers();
        HandleEditorShortcuts();
    }

    private void HandleMovement()
    {
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");

        // Também lê analógico esquerdo do Meta Quest 3S via XR InputDevices
        var leftHandDevices = new List<InputDevice>();
        InputDevices.GetDevicesAtXRNode(XRNode.LeftHand, leftHandDevices);
        if (leftHandDevices.Count > 0 && leftHandDevices[0].TryGetFeatureValue(CommonUsages.primary2DAxis, out Vector2 leftStick))
        {
            if (leftStick.sqrMagnitude > 0.02f)
            {
                h = leftStick.x;
                v = leftStick.y;
            }
        }

        Transform refTransform = headCamera != null ? headCamera.transform : transform;
        Vector3 forward = refTransform.forward;
        forward.y = 0f;
        forward.Normalize();

        Vector3 right = refTransform.right;
        right.y = 0f;
        right.Normalize();

        float speed = Input.GetKey(KeyCode.LeftShift) ? runSpeed : walkSpeed;
        Vector3 move = (forward * v + right * h) * speed;

        if (controller.isGrounded && verticalVelocity < 0f)
            verticalVelocity = -1.5f;
        else
            verticalVelocity += gravity * Time.deltaTime;

        move.y = verticalVelocity;
        controller.Move(move * Time.deltaTime);
    }

    private void HandleQuestControllers()
    {
        if (snapCooldown > 0f) snapCooldown -= Time.deltaTime;

        var rightHandDevices = new List<InputDevice>();
        InputDevices.GetDevicesAtXRNode(XRNode.RightHand, rightHandDevices);
        if (rightHandDevices.Count > 0)
        {
            var dev = rightHandDevices[0];
            if (dev.TryGetFeatureValue(CommonUsages.primary2DAxis, out Vector2 rightStick))
            {
                if (snapCooldown <= 0f && Mathf.Abs(rightStick.x) > 0.65f)
                {
                    transform.Rotate(0f, Mathf.Sign(rightStick.x) * snapTurnAngle, 0f);
                    snapCooldown = 0.32f;
                }
            }
            if (dev.TryGetFeatureValue(CommonUsages.primaryButton, out bool aPressed) && aPressed && snapCooldown <= 0f)
            {
                currentStation = (currentStation + 1) % stationPositions.Length;
                TeleportToStation(currentStation);
                snapCooldown = 0.45f;
            }
        }
    }

    private void HandleEditorShortcuts()
    {
        if (Input.GetMouseButton(1))
        {
            yaw += Input.GetAxis("Mouse X") * 3.0f;
            pitch = Mathf.Clamp(pitch - Input.GetAxis("Mouse Y") * 3.0f, -85f, 85f);
            transform.localEulerAngles = new Vector3(0f, yaw, 0f);
            if (headCamera != null)
                headCamera.transform.localEulerAngles = new Vector3(pitch, 0f, 0f);
        }

        for (int i = 0; i < stationPositions.Length; i++)
        {
            if (Input.GetKeyDown(KeyCode.Alpha1 + i))
                TeleportToStation(i);
        }
    }

    public void TeleportToStation(int index)
    {
        if (index < 0 || index >= stationPositions.Length) return;
        currentStation = index;
        controller.enabled = false;
        Vector3 target = stationPositions[index];
        if (Physics.Raycast(new Vector3(target.x, 80f, target.z), Vector3.down, out RaycastHit hit, 150f))
            target.y = hit.point.y + 0.15f;
        transform.position = target;
        controller.enabled = true;
    }
}
"""
    with open(os.path.join(SCRIPTS_DIR, "RecifeVRPlayerController.cs"), "w", encoding="utf-8") as f:
        f.write(player_cs)

    # 4. Script Editor C#: Menu no Unity 6 ("Metaverso BBTS & IV -> Montar Cidade Recife 3D 1:1 na Cena")
    editor_cs = """#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

public static class RecifeVRSceneSetup
{
    private static readonly string[] TileSlugs = new string[]
    {
        "marco_zero_centro",
        "bom_jesus_arsenal_norte",
        "recife_antigo_sul",
        "cais_santa_rita_oeste",
        "parque_esculturas_leste",
        "porto_digital_nordeste",
        "bacia_porto_sudeste",
        "ponte_limoeiro_noroeste",
        "santo_antonio_sudoeste"
    };

    [MenuItem("Metaverso BBTS & IV/Montar Recife Antigo 3D (Escala 1:1) na Cena")]
    public static void BuildRecifeScene()
    {
        GameObject existingCity = GameObject.Find("RecifeAntigo_3D_1to1");
        if (existingCity != null) GameObject.DestroyImmediate(existingCity);

        GameObject cityRoot = new GameObject("RecifeAntigo_3D_1to1");
        cityRoot.transform.position = Vector3.zero;

        foreach (string slug in TileSlugs)
        {
            string objPath = $"Assets/Recife3D/{slug}.obj";
            string texPath = $"Assets/Recife3D/{slug}.jpg";

            GameObject modelPrefab = AssetDatabase.LoadAssetAtPath<GameObject>(objPath);
            Texture2D tex = AssetDatabase.LoadAssetAtPath<Texture2D>(texPath);

            if (modelPrefab == null)
            {
                Debug.LogWarning($"[Recife 3D] Modelo não encontrado: {objPath}");
                continue;
            }

            GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(modelPrefab, cityRoot.transform);
            instance.name = slug;
            instance.transform.localPosition = Vector3.zero;
            instance.transform.localRotation = Quaternion.identity;
            instance.transform.localScale = Vector3.one; // Escala 1:1 Real (1 unidade = 1 metro)

            // Configura Material Unlit Double-Sided + MeshCollider em cada bloco para caminhar na rua
            Shader unlitShader = Shader.Find("Unlit/Texture") ?? Shader.Find("Standard");
            Material mat = new Material(unlitShader);
            if (tex != null) mat.mainTexture = tex;
            mat.SetInt("_Cull", (int)CullMode.Off);

            foreach (MeshRenderer mr in instance.GetComponentsInChildren<MeshRenderer>())
            {
                mr.sharedMaterial = mat;
                MeshFilter mf = mr.GetComponent<MeshFilter>();
                if (mf != null && mf.sharedMesh != null)
                {
                    MeshCollider mc = mr.gameObject.GetComponent<MeshCollider>();
                    if (mc == null) mc = mr.gameObject.AddComponent<MeshCollider>();
                    mc.sharedMesh = mf.sharedMesh;
                }
            }
        }

        // Cria o Jogador VR em Escala Humana 1:1 (1,70m) na Praça do Marco Zero
        GameObject existingPlayer = GameObject.Find("Player_VR_Quest3S");
        if (existingPlayer != null) GameObject.DestroyImmediate(existingPlayer);

        GameObject player = new GameObject("Player_VR_Quest3S");
        player.transform.position = new Vector3(0f, 1.0f, 0f);
        player.AddComponent<CharacterController>();
        player.AddComponent<RecifeVRPlayerController>();

        Camera mainCam = Camera.main;
        if (mainCam == null)
        {
            GameObject camObj = new GameObject("Main Camera (VR Head 1.70m)");
            camObj.tag = "MainCamera";
            mainCam = camObj.AddComponent<Camera>();
        }
        mainCam.transform.SetParent(player.transform);
        mainCam.transform.localPosition = new Vector3(0f, 1.70f, 0f);
        mainCam.transform.localRotation = Quaternion.identity;

        Selection.activeGameObject = player;
        Debug.Log("[Metaverso BBTS & IV] Cidade do Recife Antigo 3D (Escala 1:1) montada com sucesso!");
    }
}
#endif
"""
    with open(os.path.join(EDITOR_DIR, "RecifeVRSceneSetup.cs"), "w", encoding="utf-8") as f:
        f.write(editor_cs)


def register_in_unity_hub():
    hub_db = os.path.expanduser("~/Library/Application Support/UnityHub/hub.db")
    if not os.path.exists(hub_db):
        return
    conn = sqlite3.connect(hub_db)
    cur = conn.cursor()
    now_ms = int(time.time() * 1000)
    proj_data = {
        "title": "RecifeVR_Unity",
        "path": UNITY_DIR,
        "version": "6000.6.8f1",
        "architecture": "arm64",
        "changeset": "",
        "isFavorite": True,
        "localProjectId": "recife-vr-bbts-iv",
        "cloudEnabled": False,
        "lastModified": now_ms,
    }
    cur.execute(
        "INSERT OR REPLACE INTO projects (path, data, updated_at) VALUES (?, ?, ?)",
        (UNITY_DIR, json.dumps(proj_data), now_ms),
    )
    conn.commit()
    conn.close()


def main():
    create_unity_files()
    with open(os.path.join(TILES_DIR, "tiles_manifest.json"), "r", encoding="utf-8") as mf:
        manifest = json.load(mf)

    for item in manifest:
        slug = item["slug"]
        glb_path = os.path.join("/Users/kevenwilliam2015gmail.com/Desktop/metaverso", item["file"])
        glb_to_unity_obj(glb_path, slug, ASSETS_3D_DIR)
        print(f"[Unity 6 Asset] {slug}.obj + {slug}.mtl + {slug}.jpg gerados em Assets/Recife3D/")

    register_in_unity_hub()
    print(f"\nProjeto Unity 6 configurado e registrado no Unity Hub em: {UNITY_DIR}")


if __name__ == "__main__":
    main()
