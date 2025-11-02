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
import {
  getAreaFromPixels,
  getLengthFromPixels,
} from "../../getDistanceFromPixels";

export const handleMouseDownDraw = (
  e: fabric.TPointerEventInfo<fabric.TPointerEvent>,
  canvas: fabric.Canvas,
  drawRef: React.RefObject<DrawRef>,
  tooltipColor: string,
  drawObjects: DrawObjects
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
  let previewObject: fabric.Object | null = null;
  if (drawObjects.type === "line" || drawObjects.type === "ruler") {
    previewObject = createRuler.line();
    drawRef.current.previewLine = previewObject as fabric.Line;
  } else if (drawObjects.type === "rectangle") {
    previewObject = createRuler.rect();
    drawRef.current.previewSquare = previewObject as fabric.Rect;
  } else if (drawObjects.type === "circle") {
    previewObject = createRuler.ellipse();
    drawRef.current.previewCircle = previewObject as fabric.Ellipse;
  }
  if (previewObject) canvas.add(previewObject);
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
  const startPoint = drawRef.current.startPoint;
  const pointer = canvas.getScenePoint(e.e);
  const snapPoint = findSnapPoint(canvas, pointer);

  const endPoint = snapPoint || pointer;

  if (drawRef.current.previewLine) {
    drawRef.current.previewLine.set({
      x2: endPoint.x,
      y2: endPoint.y,
    });
  } else if (drawRef.current.previewSquare) {
    if (!startPoint) return;
    const left = Math.min(startPoint.x, endPoint.x);
    const top = Math.min(startPoint.y, endPoint.y);
    const width = Math.abs(startPoint.x - endPoint.x);
    const height = Math.abs(startPoint.y - endPoint.y);

    drawRef.current.previewSquare.set({
      left: left,
      top: top,
      width: width,
      height: height,
    });
  } else if (drawRef.current.previewCircle) {
    if (!startPoint) return;
    if (e.e.shiftKey) {
      const radius = Math.hypot(
        endPoint.x - startPoint.x,
        endPoint.y - startPoint.y
      );

      drawRef.current.previewCircle.set({
        left: startPoint.x,
        top: startPoint.y,
        rx: radius,
        ry: radius,
        visible: true,
      });
    } else {
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      const rx = width / 2;
      const ry = height / 2;
      const left = Math.min(startPoint.x, endPoint.x) + rx;
      const top = Math.min(startPoint.y, endPoint.y) + ry;

      drawRef.current.previewCircle.set({
        left: left,
        top: top,
        rx: rx,
        ry: ry,
        visible: true,
      });
    }
  }

  if (drawRef.current.previewRuler && drawRef.current.startPoint) {
    let text = "";
    if (drawRef.current.previewLine) {
      const length = Math.hypot(
        endPoint.x - drawRef.current.startPoint?.x,
        endPoint.y - drawRef.current.startPoint?.y
      );
      text = getLengthFromPixels(length, scale);
    } else if (drawRef.current.previewSquare) {
      const width = Math.abs(endPoint.x - drawRef.current.startPoint.x);
      const height = Math.abs(endPoint.y - drawRef.current.startPoint.y);
      text =
        width * height > 0
          ? getAreaFromPixels(width * height, scale)
          : getLengthFromPixels(width + height, scale);
    } else if (drawRef.current.previewCircle) {
      if (e.e.shiftKey) {
        const radius = Math.hypot(
          endPoint.x - drawRef.current.startPoint.x,
          endPoint.y - drawRef.current.startPoint.y
        );
        text = getAreaFromPixels(Math.PI * radius * radius, scale);
      } else {
        const rx = Math.abs(endPoint.x - drawRef.current.startPoint.x) / 2;
        const ry = Math.abs(endPoint.y - drawRef.current.startPoint.y) / 2;
        text = getAreaFromPixels(Math.PI * rx * ry, scale);
      }
    }

    const deltaX = endPoint.x - drawRef.current.startPoint.x;
    const deltaY = endPoint.y - drawRef.current.startPoint.y;
    const isHorizontal = Math.abs(deltaX) >= Math.abs(deltaY);
    const isLine = drawRef.current.previewLine!!;
    const marginBottom = isHorizontal && isLine ? -RULER_OFFSET : 0;
    const marginLeft = !isHorizontal && isLine ? RULER_OFFSET * 2 : 0;
    const midX = (drawRef.current.startPoint?.x + endPoint.x) / 2 + marginLeft;
    const midY =
      (drawRef.current.startPoint?.y + endPoint.y) / 2 + marginBottom;
    drawRef.current.previewRuler.set({
      text: text,
      left: midX,
      top: midY,
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
  } else if (drawRef.current.previewSquare) {
    canvas.remove(drawRef.current.previewSquare);
    drawRef.current.previewSquare = null;
  } else if (drawRef.current.previewCircle) {
    canvas.remove(drawRef.current.previewCircle);
    drawRef.current.previewCircle = null;
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
    if (drawObjects.type === "ruler") {
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

      const text = getLengthFromPixels(pixelLength, scale);

      const deltaX = endPoint.x - drawRef.current.startPoint.x;
      const deltaY = endPoint.y - drawRef.current.startPoint.y;
      const isHorizontal = Math.abs(deltaX) >= Math.abs(deltaY);
      const marginBottom = isHorizontal ? -RULER_OFFSET : 0;
      const marginLeft = !isHorizontal ? RULER_OFFSET * 2 : 0;
      const midX =
        (drawRef.current.startPoint?.x + endPoint.x) / 2 + marginLeft;
      const midY =
        (drawRef.current.startPoint?.y + endPoint.y) / 2 + marginBottom;
      rulerText.set({
        text: text,
        left: midX,
        top: midY,
        visible: true,
      });
      const ruler = new fabric.Group([rulerLine, rulerText], {
        selectable: false,
        evented: true,
      });
      canvas.add(ruler);
    } else if (
      ["rectangle", "line", "circle"].includes(drawObjects.type || "")
    ) {
      const createWall = new CreateWall(
        drawRef.current.startPoint.x,
        drawRef.current.startPoint.y,
        endPoint.x,
        endPoint.y,
        wallColor,
        WALL_THICKNESS.fabric.medium,
        drawObjects.type as "rectangle" | "line" | "circle"
      );
      let wall;
      if (drawObjects.type === "line") {
        wall = createWall.line();
      } else if (drawObjects.type === "rectangle") {
        wall = createWall.rectangle();
      } else if (e.e.shiftKey) {
        wall = createWall.circle();
      } else {
        wall = createWall.ellipse();
      }
      canvas.add(wall as fabric.Object);
    }
  }

  drawRef.current.startPoint = null;
};
