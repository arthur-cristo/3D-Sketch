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
import {
  handleMouseDownErase,
  handleMouseOutErase,
  handleMouseOverErase,
} from "../utils/fabric/handleErase";

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "0") {
        setMode("erase");
      } else if (e.key === "1") {
        setMode("select");
      } else if (e.key === "2") {
        setMode("draw");
        setDrawObject("line");
      } else if (e.key === "3") {
        setMode("draw");
        setDrawObject("rectangle");
      } else if (e.key === "4") {
        setMode("draw");
        setDrawObject("circle");
      } else if (e.key === "5") {
        setMode("draw");
        setDrawObject("ruler");
      }
    };
    window.addEventListener("keydown", (e) => {
      handleKeyDown(e);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
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

    const removeWheel = canvas.on("mouse:wheel", (opt) =>
      handleMouseWheel(opt, canvas, setZoom)
    );

    let removeDown: VoidFunction | undefined;
    let removeMove: VoidFunction | undefined;
    let removeUp: VoidFunction | undefined;
    let mouseOver: VoidFunction | undefined;
    let mouseOut: VoidFunction | undefined;

    if (mode === "drag") {
      removeDown = canvas.on("mouse:down", (opt) =>
        handleMouseDown(opt, dragRef, canvas)
      );
      removeMove = canvas.on("mouse:move", (opt) =>
        handleMouseMove(opt, dragRef, canvas)
      );
      removeUp = canvas.on("mouse:up", () => handleMouseUp(dragRef, canvas));
    }

    if (mode === "erase") {
      removeDown = canvas.on("mouse:down", (opt) =>
        handleMouseDownErase(opt, canvas)
      );
      mouseOver = canvas.on("mouse:over", (opt) =>
        handleMouseOverErase(opt, canvas)
      );
      mouseOut = canvas.on("mouse:out", (opt) =>
        handleMouseOutErase(opt, canvas)
      );
    }

    return () => {
      removeWheel();
      removeDown?.();
      removeMove?.();
      removeUp?.();
      mouseOver?.();
      mouseOut?.();
    };
  }, [canvas, mode]);

  // Controls drawing mode
  useEffect(() => {
    if (!canvas || mode !== "draw") return;
    const removeDown = canvas.on("mouse:down", (opt) =>
      handleMouseDownDraw(opt, canvas, drawRef, THEME.color.tooltip)
    );
    const removeMove = canvas.on("mouse:move", (opt) =>
      handleMouseMoveDraw(opt, canvas, drawRef, scale)
    );
    const removeUp = canvas.on("mouse:up", (opt) =>
      handleMouseUpDraw(
        opt,
        canvas,
        drawRef,
        THEME.color.primary,
        THEME.color.tooltip,
        scale,
        drawObject
      )
    );

    return () => {
      removeDown();
      removeMove();
      removeUp();
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
    console.log(mode, drawObject);
  }, [mode, drawObject]);

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
