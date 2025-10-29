import { Line } from "fabric";
import type { Canvas } from "fabric";

const drawGrid = (canvas: Canvas, desiredCell = 20) => {
  canvas
    .getObjects()
    .filter((o) => (o as any).isGrid)
    .forEach((o) => canvas.remove(o));

  const zoom = canvas.getZoom();
  const width = canvas.getWidth() / zoom;
  const height = canvas.getHeight() / zoom;
  desiredCell = desiredCell / zoom;

  const approxCols = Math.max(1, Math.round(width / desiredCell));
  const approxRows = Math.max(1, Math.round(height / desiredCell));
  const cellSize = Math.min(width / approxCols, height / approxRows);

  const cols = Math.round(width / cellSize);
  const rows = Math.round(height / cellSize);
  const strokeWidth = 1 / zoom;

  for (let i = 0; i <= cols; i++) {
    const x = Math.round(i * cellSize);
    const line = new Line([x, 0, x, height], {
      stroke: "#ddd",
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
    });
    (line as any).isGrid = true;
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }

  for (let j = 0; j <= rows; j++) {
    const y = Math.round(j * cellSize);
    const line = new Line([0, y, width, y], {
      stroke: "#ddd",
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
    });
    (line as any).isGrid = true;
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }

  canvas.requestRenderAll();
};

export default drawGrid;
