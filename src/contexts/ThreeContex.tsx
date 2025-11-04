import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useApp } from "./AppContex";
import { useFabric } from "./FabricContext";
import { DEFAULT_WORLD_SIZE, WALL_THICKNESS } from "../constants";
import devicePxPerCm from "../utils/devicePxPerCm";

interface ThreeContext {
  sceneRef: React.RefObject<THREE.Scene | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ambientLightRef: React.RefObject<THREE.AmbientLight | null>;
  directionalLightRef: React.RefObject<THREE.DirectionalLight | null>;
}

export const ThreeContext = createContext<ThreeContext>({} as ThreeContext);

export const ThreeProvider = ({ children }: { children: ReactNode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sizesRef = useRef<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const controlsRef = useRef<OrbitControls | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const { mode } = useApp();
  const { getFabricObjects } = useFabric();
  const wallGroupsRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!sceneRef.current || !controlsRef.current) return;

    // Clear all old walls from the scene
    wallGroupsRef.current.forEach((group) => {
      sceneRef.current?.remove(group);
    });
    wallGroupsRef.current = [];

    if (mode !== "3D") return;

    const { walls, center } = getFabricObjects();
    if (walls.length === 0 || !center) return;

    const pxToMeters = 1 / devicePxPerCm();
    const middleX = DEFAULT_WORLD_SIZE.DESKTOP.width / 2;
    const middleZ = DEFAULT_WORLD_SIZE.DESKTOP.height / 2;

    const targetX = (center.x - middleX) * pxToMeters;
    const targetZ = (center.y - middleZ) * pxToMeters;

    controlsRef.current.target.set(targetX, 0, targetZ);
    controlsRef.current.update();

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: "#888888",
      metalness: 0.1,
      roughness: 0.8,
    });
    const wallHeight = 3;

    walls.forEach((wall) => {
      const wallGroup = new THREE.Group();
      let mesh: THREE.Mesh | null = null;
      console.log(wall);
      if (wall.type === "line") {
        const length = wall.length * pxToMeters;
        const depth = WALL_THICKNESS.three.medium;

        const wallGeometry = new THREE.BoxGeometry(length, wallHeight, depth);
        mesh = new THREE.Mesh(wallGeometry, wallMaterial);
        if (wall.angle > 3.14) wall.angle = 0;
        if (1.56 < wall.angle && wall.angle < 1.58) wall.angle = 1.57;
        if (-1.58 < wall.angle && wall.angle < -1.56) wall.angle = -1.57;
        mesh.rotation.y = -wall.angle;
      } else if (wall.type === "rectangle") {
      } else if (wall.type === "ellipse") {
      }

      if (mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.y = wallHeight / 2;
        wallGroup.add(mesh);
      } else return;

      const posX = (wall.centerX - middleX) * pxToMeters;
      const posZ = (wall.centerY - middleZ) * pxToMeters;

      wallGroup.position.set(posX, 0, posZ);
      const angle = -THREE.MathUtils.degToRad(wall.angle || 0);
      wallGroup.rotation.y = angle;

      sceneRef.current?.add(wallGroup);
      wallGroupsRef.current.push(wallGroup);
    });
  }, [mode, getFabricObjects, sceneRef, controlsRef]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      sizesRef.current.width = window.innerWidth;
      sizesRef.current.height = window.innerHeight;
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect =
        sizesRef.current.width / sizesRef.current.height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
        sizesRef.current.width,
        sizesRef.current.height
      );
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Initialize scene, camera, renderer, controls, lights
  useEffect(() => {
    if (canvasRef.current && !sceneRef.current) {
      // Sizes
      const { innerHeight: height, innerWidth: width } = window;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#aaa");

      // Camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.y = 3;
      camera.position.z = -10;
      camera.lookAt(0, 0, 0);

      // Controls
      const controls = new OrbitControls(camera, canvasRef.current);
      controls.target.set(0, 0.75, 0);
      controls.enableDamping = true;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
      });
      renderer.shadowMap.enabled = true;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Floor
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({
          color: "#666",
          metalness: 0,
          roughness: 0.6,
        })
      );
      floor.receiveShadow = true;
      floor.rotation.x = -Math.PI * 0.5;
      scene.add(floor);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.set(1024, 1024);
      directionalLight.shadow.camera.far = 15;
      directionalLight.shadow.camera.left = -7;
      directionalLight.shadow.camera.top = 7;
      directionalLight.shadow.camera.right = 7;
      directionalLight.shadow.camera.bottom = -7;
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      controlsRef.current = controls;
      ambientLightRef.current = ambientLight;
      directionalLightRef.current = directionalLight;
    }
  }, [canvasRef.current]);

  // Animation loop
  useEffect(() => {
    const tick = () => {
      controlsRef.current?.update();

      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      const animationFrameId = window.requestAnimationFrame(tick);
      return animationFrameId;
    };

    const animationId = tick();

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <ThreeContext.Provider
      value={{
        sceneRef,
        canvasRef,
        ambientLightRef,
        directionalLightRef,
      }}
    >
      {children}
    </ThreeContext.Provider>
  );
};

export const useThree = () => useContext(ThreeContext);
