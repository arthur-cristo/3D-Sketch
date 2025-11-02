import * as fabric from "fabric";
import findSnapPoint from "../findSnapoint";
import type { DrawObjects, DrawRef } from "../../../types";
import {
  RULER_OFFSET,
  RULER_TEXT_FONT_SIZE,
  RULER_THICKNESS,
  WALL_THICKNESS,
} from "../../../constants";
import { CreateRuler } from "./drawingTools.ts/CreateRuler";
import { CreateWall } from "./drawingTools.ts/CreateWall";
import { getDistanceFromPixels } from "../../getDistanceFromPixeis";

export const handleMouseDownDraw = (
  e: fabric.TPointerEventInfo<fabric.TPointerEvent>,
  canvas: fabric.Canvas,
  drawRef: React.RefObject<DrawRef>,
  tooltipColor: string
) => {
  if (!e.viewportPoint) return;

  drawRef.current.isDrawing = true;
  const pointer = canvas.getScenePoint(e.e);
  const snapPoint = findSnapPoint(canvas, pointer);

  drawRef.current.startPoint = snapPoint || pointer;
  const createRuler = new CreateRuler(
    drawRef.current.startPoint.x,
    drawRef.current.startPoint.y,
    RULER_TEXT_FONT_SIZE,
    tooltipColor,
    RULER_THICKNESS
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

    const text = getDistanceFromPixels(pixelLength, scale);

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
  tooltipColor: string,
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
      const createRuler = new CreateRuler(
        drawRef.current.startPoint.x,
        drawRef.current.startPoint.y,
        RULER_TEXT_FONT_SIZE,
        tooltipColor,
        RULER_THICKNESS
      );
      const rulerLine = createRuler.line();
      const rulerText = createRuler.text();

      rulerLine.set({
        x2: endPoint.x,
        y2: endPoint.y,
      });

      const pixelLength = Math.hypot(
        endPoint.x - drawRef.current.startPoint.x,
        endPoint.y - drawRef.current.startPoint.y
      );

      const text = getDistanceFromPixels(pixelLength, scale);

      const midX = (drawRef.current.startPoint.x + endPoint.x) / 2;
      const midY = (drawRef.current.startPoint.y + endPoint.y) / 2;

      rulerText.set({
        text: text,
        left: midX,
        top: midY - RULER_OFFSET,
        visible: true,
      });
      const ruler = new fabric.Group([rulerLine, rulerText], {
        selectable: false,
        evented: true,
      });
      canvas.add(ruler);
    } else if (["rectangle", "line", "circle"].includes(drawObjects || "")) {
      const createWall = new CreateWall(
        drawRef.current.startPoint.x,
        drawRef.current.startPoint.y,
        endPoint.x,
        endPoint.y,
        wallColor,
        WALL_THICKNESS.fabric.medium,
        drawObjects as "rectangle" | "line" | "circle"
      );
      let wall;
      if (drawObjects === "line") {
        wall = createWall.line();
      } else if (drawObjects === "rectangle") {
        wall = createWall.rectangle();
      } else if (drawObjects === "circle") {
        wall = createWall.circle();
      }
      canvas.add(wall as fabric.Object);
    }
  }

  drawRef.current.startPoint = null;
};
