import type { Canvas } from "fabric";

const resizeCanvas = (canvas: Canvas) => {
  const container = document.getElementById("fabric-canvas-container");
  if (!container) return;
  canvas.setDimensions({
    width: container.clientWidth,
    height: container.clientHeight,
  });
  canvas.renderAll();
};

export default resizeCanvas;
