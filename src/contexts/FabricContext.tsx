import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import * as fabric from "fabric";
import { resizeCanvas, drawGrid } from "../utils/fabric";
import { useThemeApp } from "./ThemeAppContext";
import useIsMobile from "../hooks/useIsMobile";
import type { DrawObjects, DrawRef, Modes } from "../types";
import { DEFAULT_WORLD_SIZE, ZOOM } from "../constants";
import {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseWheel,
  setMouse,
} from "../utils/fabric/handleMove";
import {
  handleMouseDownDraw,
  handleMouseMoveDraw,
  handleMouseUpDraw,
} from "../utils/fabric/drawingMode/drawingMode";

type CanvasZoom = {
  zoom: number;
  decreaseZoom: () => void;
  increaseZoom: () => void;
  setZoom: (zoom: number) => void;
};

interface FabricContext {
  canvas: fabric.Canvas | null;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasZoom: CanvasZoom;
  mode: Modes;
  setMode: Dispatch<SetStateAction<Modes>>;
  showGrid: boolean;
  setShowGrid: Dispatch<SetStateAction<boolean>>;
  worldSize: { width: number; height: number };
  setWorldSize: Dispatch<SetStateAction<{ width: number; height: number }>>;
  scale: number;
  setScale: Dispatch<SetStateAction<number>>;
  drawObject: DrawObjects;
  setDrawObject: Dispatch<SetStateAction<DrawObjects>>;
}

export const FabricContext = createContext<FabricContext>({} as FabricContext);

export const FabricProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [drawObject, setDrawObject] = useState<DrawObjects>(null);
  const isMobile = useIsMobile();
  const [worldSize, setWorldSize] = useState(
    isMobile ? DEFAULT_WORLD_SIZE.MOBILE : DEFAULT_WORLD_SIZE.DESKTOP
  );
  const [scale, setScale] = useState(100);
  const { THEME, colorMode } = useThemeApp();

  const decreaseZoom = () => {
    setZoom((prevZoom) => Math.max(prevZoom - ZOOM.STEP, ZOOM.MIN));
  };
  const increaseZoom = () => {
    setZoom((prevZoom) => Math.min(prevZoom + ZOOM.STEP, ZOOM.MAX));
  };

  const canvasZoom: CanvasZoom = {
    zoom,
    decreaseZoom,
    increaseZoom,
    setZoom,
  };
  const [mode, setMode] = useState<Modes>("select");
  const dragRef = useRef({
    isDragging: false,
    lastPosX: 0,
    lastPosY: 0,
  });
  const drawRef = useRef<DrawRef>({
    isDrawing: false,
    startPoint: null,
    previewLine: null,
    previewRuler: null,
  });

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: false,
      enableRetinaScaling: true,
    });
    setCanvas(canvas);
    fabricCanvasRef.current = canvas;

    const handleResize = () => {
      const currentCanvas = fabricCanvasRef.current;
      if (!currentCanvas) return;
      resizeCanvas(currentCanvas);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const zoom = canvas.getZoom();
    const translateX = canvas.width / 2 - (worldSize.width / 2) * zoom;
    const translateY = canvas.height / 2 - (worldSize.height / 2) * zoom;
    canvas.setViewportTransform([zoom, 0, 0, zoom, translateX, translateY]);

    drawGrid(
      canvas,
      worldSize.width,
      worldSize.height,
      THEME.borderColor.separator
    );

    return () => {
      window.removeEventListener("resize", handleResize);
      fabricCanvasRef.current?.dispose();
    };
  }, []);

  // Zoom effect
  useEffect(() => {
    if (!canvas || canvas.getZoom() === zoom) return;
    const center = new fabric.Point(canvas.width / 2, canvas.height / 2);
    canvas.zoomToPoint(center, zoom);
  }, [zoom, canvas]);

  // Controls drag mode, zoom, and cursor
  useEffect(() => {
    if (!canvas) return;
    setMouse(mode, canvas);
    canvas.on("mouse:wheel", (opt) => handleMouseWheel(opt, canvas, setZoom));
    if (mode !== "drag") return;
    canvas.on("mouse:down", (opt) => handleMouseDown(opt, dragRef, canvas));
    canvas.on("mouse:move", (opt) => handleMouseMove(opt, dragRef, canvas));
    canvas.on("mouse:up", () => handleMouseUp(dragRef, canvas));

    return () => {
      canvas.off("mouse:wheel", (opt) =>
        handleMouseWheel(opt, canvas, setZoom)
      );
      canvas.off("mouse:down", (opt) => handleMouseDown(opt, dragRef, canvas));
      canvas.off("mouse:move", (opt) => handleMouseMove(opt, dragRef, canvas));
      canvas.off("mouse:up", () => handleMouseUp(dragRef, canvas));
    };
  }, [canvas, mode]);

  // Controls drawing mode
  useEffect(() => {
    if (!canvas || mode !== "draw") return;

    canvas.on("mouse:down", (opt) =>
      handleMouseDownDraw(opt, canvas, drawRef, THEME.color.tooltip, scale)
    );
    canvas.on("mouse:move", (opt) =>
      handleMouseMoveDraw(opt, canvas, drawRef, scale)
    );
    canvas.on("mouse:up", (opt) =>
      handleMouseUpDraw(opt, canvas, drawRef, THEME.color.primary, scale)
    );

    return () => {
      canvas.off("mouse:down", (opt) =>
        handleMouseDownDraw(opt, canvas, drawRef, THEME.color.tooltip, scale)
      );
      canvas.off("mouse:move", (opt) =>
        handleMouseMoveDraw(opt, canvas, drawRef, scale)
      );
      canvas.off("mouse:up", (opt) =>
        handleMouseUpDraw(opt, canvas, drawRef, THEME.color.primary, scale)
      );
    };
  }, [canvas, mode, scale, drawObject]);

  useEffect(() => {
    if (!canvas) return;

    const grid = canvas.getObjects().find((o) => (o as any).isGridGroup);
    if (grid) {
      grid.visible = showGrid;
      grid.selectable = false;
    }
    canvas.requestRenderAll();
  }, [canvas, showGrid]);

  useEffect(() => {
    if (!canvas) return;
    const grid = canvas.getObjects().find((o) => (o as any).isGridGroup);
    if (grid) {
      (grid as fabric.Group).getObjects().forEach((line) => {
        line.set("stroke", THEME.borderColor.separator);
      });
    }
    const walls = canvas
      .getObjects()
      .filter((obj) => (obj as any).data?.isWall);
    walls.forEach((wall) => {
      wall.set("stroke", THEME.color.primary);
    });
    canvas.requestRenderAll();
  }, [canvas, colorMode]);

  return (
    <FabricContext.Provider
      value={{
        canvas,
        canvasRef,
        canvasZoom,
        mode,
        setMode,
        showGrid,
        setShowGrid,
        worldSize,
        setWorldSize,
        scale,
        setScale,
        drawObject,
        setDrawObject,
      }}
    >
      {children}
    </FabricContext.Provider>
  );
};

export const useFabric = () => useContext(FabricContext);
