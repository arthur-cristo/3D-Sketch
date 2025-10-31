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
import { resizeCanvas, drawGrid, findSnapPoint } from "../utils/fabric";
import { useThemeApp } from "./ThemeAppContext";
import useIsMobile from "../hooks/useIsMobile";
import type { Modes } from "../types";
import { RULER_OFFSET, WALL_THICKNESS, ZOOM } from "../constants";
import devicePxPerCm from "../utils/devicePxPerCm";

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
}

export const FabricContext = createContext<FabricContext>({} as FabricContext);

export const FabricProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [zoom, setZoom] = useState(canvas?.getZoom() || 1);
  const [showGrid, setShowGrid] = useState(true);
  const isMobile = useIsMobile();
  const [worldSize, setWorldSize] = useState(
    isMobile ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 }
  );
  const [scale, setScale] = useState(100);
  const { THEME, colorMode } = useThemeApp();
  const canvasZoom: CanvasZoom = {
    zoom,
    decreaseZoom: () => {
      setZoom((prevZoom) => Math.max(prevZoom - ZOOM.STEP, ZOOM.MIN));
    },
    increaseZoom: () => {
      setZoom((prevZoom) => Math.min(prevZoom + ZOOM.STEP, ZOOM.MAX));
    },
    setZoom: (zoom: number) => {
      setZoom(zoom);
    },
  };
  const [mode, setMode] = useState<Modes>("select");
  const dragRef = useRef({
    isDragging: false,
    lastPosX: 0,
    lastPosY: 0,
  });
  const drawRef = useRef<{
    isDrawing: boolean;
    startPoint: { x: number; y: number } | fabric.Point | null;
    previewLine: fabric.Line | null;
    previewRuler: fabric.FabricText | null;
  }>({
    isDrawing: false,
    startPoint: null,
    previewLine: null,
    previewRuler: null,
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

  useEffect(() => {
    if (!canvas || canvas.getZoom() === zoom) return;
    const center = new fabric.Point(canvas.width / 2, canvas.height / 2);
    canvas.zoomToPoint(center, zoom);
  }, [zoom, canvas]);

  useEffect(() => {
    if (!canvas) return;

    const select = mode === "select";
    canvas.selection = select;

    if (mode === "drag") {
      canvas.defaultCursor = "grab";
      canvas.hoverCursor = "grab";
    } else if (mode === "select") {
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    } else {
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "default";
    }

    canvas
      .getObjects()
      .filter((obj) => !(obj as any).isGridGroup)
      .forEach((obj) => {
        console.log(obj);
        obj.selectable = select;
        if (mode === "drag") obj.hoverCursor = "grab";
        else if (mode === "select") obj.hoverCursor = "move";
        else obj.hoverCursor = "crosshair";
      });

    const handleMouseDown = (
      opt: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      const mouseEvent = opt.e as MouseEvent;
      const touchEvent = opt.e as TouchEvent;
      const x = mouseEvent.clientX ?? touchEvent.touches[0].clientX;
      const y = mouseEvent.clientY ?? touchEvent.touches[0].clientY;
      const cordinates = {
        x: x,
        y: y,
      };

      if (mode === "drag") {
        dragRef.current.isDragging = true;
        dragRef.current.lastPosX = cordinates.x;
        dragRef.current.lastPosY = cordinates.y;
        canvas.defaultCursor = "grabbing";
        canvas.hoverCursor = "grabbing";
      }
    };

    const handleMouseMove = (
      opt: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      if (!dragRef.current.isDragging) return;

      const e = opt.e;
      let x: number | undefined;
      let y: number | undefined;

      if (window.TouchEvent && e instanceof TouchEvent) {
        if (e.touches && e.touches.length > 0) {
          x = e.touches[0].clientX;
          y = e.touches[0].clientY;
        }
      } else if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else {
        x = (e as any).clientX;
        y = (e as any).clientY;
      }

      if (x == null || y == null) return;

      const vpt = canvas.viewportTransform;
      const deltaX = x - dragRef.current.lastPosX;
      const deltaY = y - dragRef.current.lastPosY;

      vpt[4] += deltaX;
      vpt[5] += deltaY;

      canvas.renderAll();

      dragRef.current.lastPosX = x;
      dragRef.current.lastPosY = y;
    };

    const handleMouseUp = () => {
      canvas.setViewportTransform(canvas.viewportTransform);
      dragRef.current.isDragging = false;

      if (mode === "drag") {
        canvas.defaultCursor = "grab";
        canvas.hoverCursor = "grab";
      }
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

    const handleMouseDownDraw = (
      e: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      if (mode !== "draw" || !e.viewportPoint) return;

      drawRef.current.isDrawing = true;
      const pointer = canvas.getScenePoint(e.e);
      const snapPoint = findSnapPoint(canvas, pointer);

      drawRef.current.startPoint = snapPoint || pointer;

      drawRef.current.previewLine = new fabric.Line(
        [
          drawRef.current.startPoint.x,
          drawRef.current.startPoint.y,
          drawRef.current.startPoint.x,
          drawRef.current.startPoint.y,
        ],
        {
          stroke: THEME.color.tooltip,
          strokeWidth: 2 / canvas.getZoom(),
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        }
      );
      canvas.add(drawRef.current.previewLine);
      drawRef.current.previewRuler = new fabric.FabricText("0,0 cm", {
        left: drawRef.current.startPoint.x,
        top: drawRef.current.startPoint.y - RULER_OFFSET,
        fontSize: 14,
        fill: THEME.color.tooltip,
        originX: "center",
        originY: "bottom",
        selectable: false,
        evented: false,
        visible: false,
      });
      canvas.add(drawRef.current.previewRuler);
    };

    const handleMouseMoveDraw = (
      e: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      if (!e.viewportPoint || !drawRef.current.isDrawing || mode !== "draw")
        return;
      const pointer = canvas.getScenePoint(e.e);
      const snapPoint = findSnapPoint(canvas, pointer);

      const endPoint = snapPoint || pointer;

      drawRef.current.previewLine?.set({
        x2: endPoint.x,
        y2: endPoint.y,
      });

      if (drawRef.current.previewRuler && drawRef.current.startPoint) {
        const pixelLength = Math.hypot(
          endPoint.x - drawRef.current.startPoint?.x,
          endPoint.y - drawRef.current.startPoint?.y
        );
        const cmLength = (pixelLength / devicePxPerCm()) * scale;
        console.log({
          pixelLength,
          cmLength,
          scale,
          scaleCL: (pixelLength / devicePxPerCm()) * scale,
        });
        const getCmText = (lengthInCm: number) => {
          return `${lengthInCm.toLocaleString("pt-BR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} cm`;
        };
        const getMeterText = (lengthInCm: number) => {
          return `${(lengthInCm / 100).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} m`;
        };
        const text =
          cmLength < 100 ? getCmText(cmLength) : getMeterText(cmLength);

        const midX = (drawRef.current.startPoint?.x + endPoint.x) / 2;
        const midY = (drawRef.current.startPoint?.y + endPoint.y) / 2;

        drawRef.current.previewRuler.set({
          text: text,
          left: midX,
          top: midY - RULER_OFFSET,
          visible: true,
        });
      }

      canvas.requestRenderAll();
    };

    const handleMouseUpDraw = (
      e: fabric.TPointerEventInfo<fabric.TPointerEvent>
    ) => {
      if (mode !== "draw" || !drawRef.current.isDrawing || !e.viewportPoint) {
        if (drawRef.current.previewLine) {
          canvas.remove(drawRef.current.previewLine);
          drawRef.current.previewLine = null;
        }
        drawRef.current.isDrawing = false;
        drawRef.current.startPoint = null;
        return;
      }

      drawRef.current.isDrawing = false;

      if (drawRef.current.previewLine) {
        canvas.remove(drawRef.current.previewLine);
        drawRef.current.previewLine = null;
      }

      if (drawRef.current.previewRuler) {
        canvas.remove(drawRef.current.previewRuler);
        drawRef.current.previewRuler = null;
      }

      const pointer = canvas.getScenePoint(e.e);
      const snapPoint = findSnapPoint(canvas, pointer);
      const endPoint = snapPoint || pointer;

      if (
        drawRef.current.startPoint?.x !== undefined &&
        drawRef.current.startPoint?.y !== undefined &&
        Math.hypot(
          endPoint.x - drawRef.current.startPoint?.x,
          endPoint.y - drawRef.current.startPoint?.y
        ) > 0
      ) {
        const wallThicknessPx =
          (WALL_THICKNESS * 100 * devicePxPerCm()) / scale;
        const wall = new fabric.Line(
          [
            drawRef.current.startPoint.x,
            drawRef.current.startPoint.y,
            endPoint.x,
            endPoint.y,
          ],
          {
            stroke: THEME.color.primary,
            strokeWidth: wallThicknessPx,
            selectable: false,
            evented: true,
            originX: "center",
            originY: "center",
            data: { isWall: true },
          }
        );
        canvas.add(wall);
      }

      drawRef.current.startPoint = null;
    };

    canvas.on("mouse:wheel", handleMouseWheel);
    if (mode === "draw") {
      canvas.on("mouse:down", handleMouseDownDraw);
      canvas.on("mouse:move", handleMouseMoveDraw);
      canvas.on("mouse:up", handleMouseUpDraw);
    } else if (mode === "drag") {
      canvas.on("mouse:down", handleMouseDown);
      canvas.on("mouse:move", handleMouseMove);
      canvas.on("mouse:up", handleMouseUp);
    }

    return () => {
      canvas.off("mouse:wheel", handleMouseWheel);

      canvas.off("mouse:down", handleMouseDownDraw);
      canvas.off("mouse:move", handleMouseMoveDraw);
      canvas.off("mouse:up", handleMouseUpDraw);

      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, mode, scale]);

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
      }}
    >
      {children}
    </FabricContext.Provider>
  );
};

export const useFabric = () => useContext(FabricContext);
