using UnityEngine;
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
