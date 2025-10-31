import * as fabric from "fabric";
import findSnapPoint from "../findSnapoint";
import type { DrawObjects, DrawRef } from "../../../types";
import {
  RULER_OFFSET,
  RULER_TEXT_FONT_SIZE,
  WALL_THICKNESS,
} from "../../../constants";
import { CreateRuler } from "./drawingTools.ts/CreateRuler";
import devicePxPerCm from "../../devicePxPerCm";
import { CreateWall } from "./drawingTools.ts/CreateWall";

export const handleMouseDownDraw = (
  e: fabric.TPointerEventInfo<fabric.TPointerEvent>,
  canvas: fabric.Canvas,
  drawRef: React.RefObject<DrawRef>,
  tooltipColor: string,
  scale: number
) => {
  if (!e.viewportPoint) return;

  drawRef.current.isDrawing = true;
  const pointer = canvas.getScenePoint(e.e);
  const snapPoint = findSnapPoint(canvas, pointer);

  drawRef.current.startPoint = snapPoint || pointer;
  const strokeWidth = (WALL_THICKNESS * 100 * devicePxPerCm()) / scale;
  const createRuler = new CreateRuler(
    drawRef.current.startPoint.x,
    drawRef.current.startPoint.y,
    RULER_TEXT_FONT_SIZE,
    tooltipColor,
    strokeWidth
  );
  drawRef.current.previewLine = createRuler.line();
  canvas.add(drawRef.current.previewLine);
  drawRef.current.previewRuler = createRuler.text();
  canvas.add(drawRef.current.previewRuler);
};

export const handleMouseMoveDraw = (
  e: fabric.TPointerEventInfo<fabric.TPointerEvent>,
  canvas: fabric.Canvas,
  drawRef: React.RefObject<DrawRef>,
  scale: number
) => {
  if (!e.viewportPoint || !drawRef.current.isDrawing) return;
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
    const text = cmLength < 100 ? getCmText(cmLength) : getMeterText(cmLength);

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

export const handleMouseUpDraw = (
  e: fabric.TPointerEventInfo<fabric.TPointerEvent>,
  canvas: fabric.Canvas,
  drawRef: React.RefObject<DrawRef>,
  wallColor: string,
  scale: number,
  drawObjects: DrawObjects
) => {
  if (!drawRef.current.isDrawing || !e.viewportPoint) {
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
    if (drawObjects === "ruler") {
    } else if (["rectangle", "line", "circle"].includes(drawObjects || "")) {
      const wallThicknessPx = (WALL_THICKNESS * 100 * devicePxPerCm()) / scale;
      const createWall = new CreateWall(
        drawRef.current.startPoint.x,
        drawRef.current.startPoint.y,
        endPoint.x,
        endPoint.y,
        wallColor,
        wallThicknessPx,
        drawObjects as "rectangle" | "line" | "circle"
      );
      if (drawObjects === "line") {
        const wall = createWall.line();
        canvas.add(wall);
      } else if (drawObjects === "rectangle") {
        const wall = createWall.rectangle();
        canvas.add(wall);
      } else if (drawObjects === "circle") {
        const wall = createWall.circle();
        canvas.add(wall);
      }
    }
  }

  drawRef.current.startPoint = null;
};
