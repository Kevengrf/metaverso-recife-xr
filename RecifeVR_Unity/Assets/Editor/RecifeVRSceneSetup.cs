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
