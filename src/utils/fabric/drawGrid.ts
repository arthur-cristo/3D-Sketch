import { Line, Group, Rect } from "fabric";
import type { Canvas } from "fabric";

export const drawGrid = (
  canvas: Canvas,
  width: number,
  height: number,
  gridColor = "#ddd",
  screenCellSize = 20
) => {
  canvas
    .getObjects()
    .filter((o) => (o as any).isGrid)
    .forEach((o) => canvas.remove(o));

  const zoom = canvas.getZoom();
  const vpt = canvas.viewportTransform;
  if (!vpt) {
    return;
  }

  const viewportLeft = -vpt[4] / zoom;
  const viewportTop = -vpt[5] / zoom;
  const viewportRight = viewportLeft + width / zoom;
  const viewportBottom = viewportTop + height / zoom;

  const worldCellSize = screenCellSize / zoom;
  const strokeWidth = 1 / zoom;

  const firstCol = Math.floor(viewportLeft / worldCellSize) * worldCellSize;
  const firstRow = Math.floor(viewportTop / worldCellSize) * worldCellSize;

  const gridLines = new Group([], {
    left: 0,
    top: 0,
    selectable: false,
    evented: false,
  });
  gridLines.set({ isGridGroup: true });
  for (let x = firstCol; x <= viewportRight; x += worldCellSize) {
    const line = new Line([x, viewportTop, x, viewportBottom], {
      stroke: gridColor,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
    });
    (line as any).isGrid = true;
    gridLines.add(line);
  }

  for (let y = firstRow; y <= viewportBottom; y += worldCellSize) {
    const line = new Line([viewportLeft, y, viewportRight, y], {
      stroke: gridColor,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
    });
    (line as any).isGrid = true;
    gridLines.add(line);
  }
  const clipPath = new Rect({
    left: viewportLeft,
    top: viewportTop,
    width: width / zoom,
    height: height / zoom,
  });
  canvas.clipPath = clipPath;
  canvas.add(gridLines);
  canvas.sendObjectToBack(gridLines);
};

export default drawGrid;
