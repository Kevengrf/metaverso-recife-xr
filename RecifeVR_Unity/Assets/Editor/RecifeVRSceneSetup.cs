#if UNITY_EDITOR
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

    [MenuItem("Metaverso BBTS & IV/Montar Recife Antigo 3D (Escala 1:1 + Fachadas IA 4K) na Cena")]
    public static void BuildRecifeScene()
    {
        GameObject existingCity = GameObject.Find("RecifeAntigo_3D_1to1");
        if (existingCity != null) GameObject.DestroyImmediate(existingCity);

        GameObject cityRoot = new GameObject("RecifeAntigo_3D_1to1");
        cityRoot.transform.position = Vector3.zero;

        Shader unlitShader = Shader.Find("Unlit/Texture") ?? Shader.Find("Standard");

        // 1. Instancia os 9 blocos de fotogrametria 1:1 com MeshCollider
        foreach (string slug in TileSlugs)
        {
            string objPath = $"Assets/Recife3D/{slug}.obj";
            string texPath = $"Assets/Recife3D/{slug}.jpg";

            GameObject modelPrefab = AssetDatabase.LoadAssetAtPath<GameObject>(objPath);
            Texture2D tex = AssetDatabase.LoadAssetAtPath<Texture2D>(texPath);

            if (modelPrefab == null) continue;

            GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(modelPrefab, cityRoot.transform);
            instance.name = slug;
            instance.transform.localPosition = Vector3.zero;
            instance.transform.localRotation = Quaternion.identity;
            instance.transform.localScale = Vector3.one;

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

        // 2. Aplica a Rosa dos Ventos 4K IA no chão da Praça do Marco Zero (22m x 22m em escala 1:1)
        Texture2D rosaTex = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Recife3D/AITextures/rosa_dos_ventos_hd.jpg");
        if (rosaTex != null)
        {
            GameObject rosaFloor = GameObject.CreatePrimitive(PrimitiveType.Quad);
            rosaFloor.name = "RosaDosVentos_IA_4K";
            rosaFloor.transform.SetParent(cityRoot.transform);
            rosaFloor.transform.position = new Vector3(0f, -3.92f, 0f);
            rosaFloor.transform.eulerAngles = new Vector3(90f, 0f, 0f);
            rosaFloor.transform.localScale = new Vector3(22f, 22f, 1f);
            Material rosaMat = new Material(unlitShader);
            rosaMat.mainTexture = rosaTex;
            rosaFloor.GetComponent<MeshRenderer>().sharedMaterial = rosaMat;
        }

        // 3. Aplica o Skybox 360° renderizado por IA na cena
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

        // 4. Cria o Jogador VR em Escala Humana 1:1 (1,70m) na Praça do Marco Zero
        GameObject existingPlayer = GameObject.Find("Player_VR_Quest3S");
        if (existingPlayer != null) GameObject.DestroyImmediate(existingPlayer);

        GameObject player = new GameObject("Player_VR_Quest3S");
        player.transform.position = new Vector3(0f, -3.5f, 0f);
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
        Debug.Log("[Metaverso BBTS & IV] Recife Antigo 3D (1:1) + Texturas IA 4K montados com sucesso!");
    }
}
#endif
