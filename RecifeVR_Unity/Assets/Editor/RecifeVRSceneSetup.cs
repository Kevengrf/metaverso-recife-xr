#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;

[InitializeOnLoad]
public static class RecifeVRSceneSetup
{
    private static readonly string[] SmoothMapSlugs = new string[]
    {
        "recife_chao_paralelepipedo_liso",
        "recife_praca_marco_zero_rosa",
        "recife_predios_monumentais_marco_zero",
        "recife_casaroes_historicos_bairro"
    };

    static RecifeVRSceneSetup()
    {
        EditorApplication.delayCall += AutoBuildIfSceneEmpty;
    }

    private static void AutoBuildIfSceneEmpty()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode) return;
        if (GameObject.Find("RecifeAntigo_MapaLiso_1to1") == null)
        {
            GameObject check = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Recife3D/recife_chao_paralelepipedo_liso.obj");
            if (check != null)
            {
                BuildRecifeScene();
            }
        }
    }

    [MenuItem("Metaverso BBTS & IV/Montar Mapa Liso & Renderizado 360 (Escala 1:1)")]
    public static void BuildRecifeScene()
    {
        GameObject oldCity = GameObject.Find("RecifeAntigo_3D_1to1");
        if (oldCity != null) GameObject.DestroyImmediate(oldCity);
        GameObject existingCity = GameObject.Find("RecifeAntigo_MapaLiso_1to1");
        if (existingCity != null) GameObject.DestroyImmediate(existingCity);

        GameObject cityRoot = new GameObject("RecifeAntigo_MapaLiso_1to1");
        cityRoot.transform.position = Vector3.zero;

        Shader litShader = Shader.Find("Standard");

        foreach (string slug in SmoothMapSlugs)
        {
            string objPath = $"Assets/Recife3D/{slug}.obj";
            string texPath = $"Assets/Recife3D/{slug}.jpg";

            TextureImporter ti = AssetImporter.GetAtPath(texPath) as TextureImporter;
            if (ti != null)
            {
                ti.wrapMode = slug.Contains("rosa") ? TextureWrapMode.Clamp : TextureWrapMode.Repeat;
                ti.anisoLevel = 8;
                ti.maxTextureSize = 4096;
                ti.SaveAndReimport();
            }

            GameObject modelPrefab = AssetDatabase.LoadAssetAtPath<GameObject>(objPath);
            Texture2D tex = AssetDatabase.LoadAssetAtPath<Texture2D>(texPath);
            if (modelPrefab == null) continue;

            GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(modelPrefab, cityRoot.transform);
            instance.name = slug;
            instance.transform.localPosition = Vector3.zero;
            instance.transform.localRotation = Quaternion.identity;
            instance.transform.localScale = Vector3.one;

            Material mat = new Material(litShader);
            if (tex != null) mat.mainTexture = tex;
            mat.SetFloat("_Glossiness", 0.15f);
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

        // Skybox 360° Fotorrealista no horizonte
        Texture2D skyTex = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Recife3D/AITextures/skybox_marco_zero_360.jpg");
        if (skyTex != null)
        {
            Shader skyShader = Shader.Find("Skybox/Panoramic");
            if (skyShader != null)
            {
                Material skyMat = new Material(skyShader);
                skyMat.SetTexture("_MainTex", skyTex);
                RenderSettings.skybox = skyMat;
            }
        }

        // Jogador VR em Escala Humana 1:1 (1,70m de altura) no centro da Praça do Marco Zero (0, 0, 0)
        GameObject existingPlayer = GameObject.Find("Player_VR_Quest3S");
        if (existingPlayer != null) GameObject.DestroyImmediate(existingPlayer);

        GameObject player = new GameObject("Player_VR_Quest3S");
        player.transform.position = new Vector3(0f, 0.1f, 0f);
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
        mainCam.transform.localRotation = Quaternion.Euler(0f, -90f, 0f);

        Directory.CreateDirectory("Assets/Scenes");
        EditorSceneManager.SaveScene(EditorSceneManager.GetActiveScene(), "Assets/Scenes/RecifeMarcoZeroVR.unity");

        Selection.activeGameObject = player;
        if (SceneView.lastActiveSceneView != null)
        {
            SceneView.lastActiveSceneView.LookAt(new Vector3(0f, 1.7f, 0f), Quaternion.Euler(8f, -90f, 0f), 12f);
        }
        Debug.Log("[Recife VR 1:1] Mapa 3D Liso & Renderizado (399 edificações + Piso 4K + Skybox 360) pronto!");
    }
}
#endif
