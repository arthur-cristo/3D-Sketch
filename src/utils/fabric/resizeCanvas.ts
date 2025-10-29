import type { Canvas } from "fabric";

const resizeCanvas = (
  canvas: Canvas,
  containerWidth: number,
  containerHeight: number,
  originalWidth: number
) => {
  const zoom = containerWidth / originalWidth;
  canvas.setDimensions({
    width: containerWidth,
    height: containerHeight,
  });
  canvas.setZoom(zoom);
  canvas.renderAll();
};

export default resizeCanvas;
