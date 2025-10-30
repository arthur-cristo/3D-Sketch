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
import type { TPointerEvent } from "fabric";

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
  mode: "select" | "draw" | "drag";
  setMode: Dispatch<SetStateAction<"select" | "draw" | "drag">>;
  showGrid: boolean;
  setShowGrid: Dispatch<SetStateAction<boolean>>;
}

export const FabricContext = createContext<FabricContext>({} as FabricContext);

export const FabricProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState(canvas?.getZoom() || 1);
  const [showGrid, setShowGrid] = useState(true);
  const WORLD_SIZE = {
    width: 1920,
    height: 1080,
  };
  const canvasZoom: CanvasZoom = {
    zoom,
    decreaseZoom: () => {
      setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.1));
    },
    increaseZoom: () => {
      setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
    },
    setZoom: (zoom: number) => {
      setZoom(zoom);
    },
  };
  const [mode, setMode] = useState<"select" | "draw" | "drag">("select");
  const dragRef = useRef({
    isDragging: false,
    lastPosX: 0,
    lastPosY: 0,
  });

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

    drawGrid(canvas);
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "red",
      width: 200,
      height: 200,
    });
    canvas.add(rect);

    return () => {
      window.removeEventListener("resize", handleResize);
      fabricCanvasRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas || canvas.getZoom() === zoom) return;
    const center = new fabric.Point(canvas.width / 2, canvas.height / 2);
    canvas.zoomToPoint(center, zoom);
  }, [zoom, canvas]);

  useEffect(() => {
    if (!canvas) return;
    const select = mode === "select";
    canvas.selection = select;
    canvas
      .getObjects()
      .filter((obj) => !(obj as any).isGrid)
      .forEach((obj) => {
        obj.selectable = select;
      });
    const handleMouseDown = (opt: fabric.TEvent) => {
      const mouseEvent = opt.e as MouseEvent;
      const touchEvent = opt.e as TouchEvent;
      const x = mouseEvent.clientX ?? touchEvent.touches[0].clientX;
      const y = mouseEvent.clientY ?? touchEvent.touches[0].clientY;
      const cordinates = {
        x: x,
        y: y,
      };
      if (mode === "drag" && cordinates.x && cordinates.y) {
        dragRef.current.isDragging = true;
        dragRef.current.lastPosX = cordinates.x;
        dragRef.current.lastPosY = cordinates.y;
      }
    };

    const handleMouseMove = (opt: fabric.TEvent) => {
      const mouseEvent = opt.e as MouseEvent;
      const touchEvent = opt.e as TouchEvent;
      const x = mouseEvent.clientX ?? touchEvent.touches[0].clientX;
      const y = mouseEvent.clientY ?? touchEvent.touches[0].clientY;
      const cordinates = {
        x: x,
        y: y,
      };
      if (dragRef.current.isDragging && cordinates.x && cordinates.y) {
        const vpt = canvas.viewportTransform;

        const deltaX = cordinates.x - dragRef.current.lastPosX;
        const deltaY = cordinates.y - dragRef.current.lastPosY;

        vpt[4] += deltaX;
        vpt[5] += deltaY;

        canvas.renderAll();

        dragRef.current.lastPosX = cordinates.x;
        dragRef.current.lastPosY = cordinates.y;
      }
    };

    const handleMouseUp = () => {
      canvas.setViewportTransform(canvas.viewportTransform);
      dragRef.current.isDragging = false;
    };

    const handleMouseWheel = (opt: fabric.TEvent<WheelEvent>) => {
      if ((opt.e as WheelEvent).ctrlKey) {
        const pointer = (opt as any).pointer;
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.1) zoom = 0.1;
        canvas.zoomToPoint(pointer, zoom);
        setZoom(zoom);
      } else if (opt.e.shiftKey) {
        const vpt = canvas.viewportTransform;
        vpt[4] -= (opt.e as WheelEvent).deltaY;
        canvas.requestRenderAll();
      } else {
        const vpt = canvas.viewportTransform;
        vpt[5] -= (opt.e as WheelEvent).deltaY;
        canvas.requestRenderAll();
      }
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    canvas.on("object:moving", (o) => {
      console.log("Object is moving", o);
    });

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("mouse:wheel", handleMouseWheel);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("mouse:wheel", handleMouseWheel);
    };
  }, [canvas, mode]);

  useEffect(() => {
    if (!canvas) return;

    const grid = canvas.getObjects().find((o) => (o as any).isGrid);
    if (grid) {
      grid.visible = showGrid;
    }
    canvas.requestRenderAll();
  }, [canvas, showGrid]);

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
      }}
    >
      {children}
    </FabricContext.Provider>
  );
};

export const useFabric = () => useContext(FabricContext);
