import * as fabric from "fabric";
import type { Dispatch, SetStateAction } from "react";
import type { Modes } from "../../types";

export const handleMouseDown = (
  opt: fabric.TPointerEventInfo<fabric.TPointerEvent>,
  dragRef: React.RefObject<{
    isDragging: boolean;
    lastPosX: number;
    lastPosY: number;
  }>,
  canvas: fabric.Canvas
) => {
  const mouseEvent = opt.e as MouseEvent;
  const touchEvent = opt.e as TouchEvent;
  const x = mouseEvent.clientX ?? touchEvent.touches[0].clientX;
  const y = mouseEvent.clientY ?? touchEvent.touches[0].clientY;
  const cordinates = {
    x: x,
    y: y,
  };

  dragRef.current.isDragging = true;
  dragRef.current.lastPosX = cordinates.x;
  dragRef.current.lastPosY = cordinates.y;
  canvas.defaultCursor = "grabbing";
  canvas.hoverCursor = "grabbing";
};

export const handleMouseMove = (
  opt: fabric.TPointerEventInfo<fabric.TPointerEvent>,
  dragRef: React.RefObject<{
    isDragging: boolean;
    lastPosX: number;
    lastPosY: number;
  }>,
  canvas: fabric.Canvas
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

export const handleMouseUp = (
  dragRef: React.RefObject<{
    isDragging: boolean;
    lastPosX: number;
    lastPosY: number;
  }>,
  canvas: fabric.Canvas
) => {
  canvas.setViewportTransform(canvas.viewportTransform);
  dragRef.current.isDragging = false;
};

export const handleMouseWheel = (
  opt: fabric.TEvent<WheelEvent>,
  canvas: fabric.Canvas,
  setZoom: Dispatch<SetStateAction<number>>
) => {
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

export const setMouse = (mode: Modes, canvas: fabric.Canvas) => {
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
};
