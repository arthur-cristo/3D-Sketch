import type { Canvas, Line, Point as PointType } from "fabric";
import { Point } from "fabric";
import { GRID_SIZE, SNAP_THRESHOLD } from "../../constants";

function findSnapPoint(canvas: Canvas, pointer: PointType) {
  let snappedPoint = null;

  // 1. Try to snap to a wall vertex
  const walls = canvas.getObjects().filter((obj) => (obj as any).data?.isWall);

  for (const wall of walls) {
    // calcLinePoints() gives absolute canvas coordinates for endpoints
    const points = (wall as Line).calcLinePoints();

    // Check endpoint 1 (x1, y1)
    const dist1 = Math.hypot(pointer.x - points.x1, pointer.y - points.y1);
    if (dist1 < SNAP_THRESHOLD) {
      snappedPoint = new Point(points.x1, points.y1);
      break;
    }

    // Check endpoint 2 (x2, y2)
    const dist2 = Math.hypot(pointer.x - points.x2, pointer.y - points.y2);
    if (dist2 < SNAP_THRESHOLD) {
      snappedPoint = new Point(points.x2, points.y2);
      break;
    }
  }

  // 2. If no vertex snap, try to snap to the grid
  if (!snappedPoint) {
    const snappedX = Math.round(pointer.x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(pointer.y / GRID_SIZE) * GRID_SIZE;

    // Only snap to grid if we're close enough
    const distGrid = Math.hypot(pointer.x - snappedX, pointer.y - snappedY);
    if (distGrid < SNAP_THRESHOLD) {
      snappedPoint = new Point(snappedX, snappedY);
    }
  }

  return snappedPoint;
}

export default findSnapPoint;
