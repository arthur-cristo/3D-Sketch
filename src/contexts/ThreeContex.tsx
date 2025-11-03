import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

  useEffect(() => {
    if (canvasRef.current && !sceneRef.current) {
      // Sizes
      const { innerHeight: height, innerWidth: width } = window;

      // Scene
      const scene = new THREE.Scene();

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
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Floor
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({
          color: "#226622",
          metalness: 0,
          roughness: 0.6,
        })
      );
      floor.receiveShadow = true;
      floor.rotation.x = -Math.PI * 0.5;
      scene.add(floor);

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial()
      );
      ball.position.y = 0.5;
      ball.castShadow = true;
      scene.add(ball);

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
