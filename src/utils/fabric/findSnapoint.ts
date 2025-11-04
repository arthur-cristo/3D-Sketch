import type { Canvas, Line, Point as PointType } from "fabric";
import { Point } from "fabric";
import { GRID_SIZE, SNAP_THRESHOLD } from "../../constants";

const ORTHO_INTENT_THRESHOLD = 15;
const LOW_GRID_SNAP_THRESHOLD = 5;

function findClosestPoint(
  points: (Point | PointType)[],
  target: PointType,
  threshold: number
): Point | null {
  for (const point of points) {
    if (!point) continue;
    const dist = Math.hypot(target.x - point.x, target.y - point.y);
    if (dist < threshold) return new Point(point.x, point.y);
  }
  return null;
}

function findSnapPoint(
  canvas: Canvas,
  pointer: PointType,
  startPoint: Point | { x: number; y: number } | null = null
): Point | null {
  // Snap to Wall
  const walls = canvas.getObjects().filter((obj) => (obj as any).data?.isWall);

  for (const wall of walls) {
    const wallType = (wall as any).data?.type;
    let vertexSnap: Point | null = null;

    wall.setCoords();

    if (wallType === "line") {
      const line = wall as Line;
      const points = line.calcLinePoints();
      const p1 = new Point(points.x1, points.y1);
      const p2 = new Point(points.x2, points.y2);
      vertexSnap = findClosestPoint([p1, p2], pointer, SNAP_THRESHOLD * 2);
    } else if (wallType === "rectangle") {
      const { tl, tr, bl, br } = wall.oCoords;
      vertexSnap = findClosestPoint(
        [tl, tr, bl, br],
        pointer,
        SNAP_THRESHOLD * 2
      );
    } else if (wallType === "circle") {
      const center = wall.getCenterPoint();
      vertexSnap = findClosestPoint([center], pointer, SNAP_THRESHOLD * 2);
    }
    if (vertexSnap) return vertexSnap;
  }

  if (startPoint) {
    const dx = Math.abs(pointer.x - startPoint.x);
    const dy = Math.abs(pointer.y - startPoint.y);

    if (dx < ORTHO_INTENT_THRESHOLD) {
      let snappedX = startPoint.x;
      let snappedY = pointer.y;

      const gridSnappedY = Math.round(pointer.y / GRID_SIZE) * GRID_SIZE;
      if (Math.abs(pointer.y - gridSnappedY) < LOW_GRID_SNAP_THRESHOLD) {
        snappedY = gridSnappedY;
      }

      return new Point(snappedX, snappedY);
    } else if (dy < ORTHO_INTENT_THRESHOLD) {
      let snappedX = pointer.x;
      let snappedY = startPoint.y;

      const gridSnappedX = Math.round(pointer.x / GRID_SIZE) * GRID_SIZE;
      if (Math.abs(pointer.x - gridSnappedX) < LOW_GRID_SNAP_THRESHOLD) {
        snappedX = gridSnappedX;
      }

      return new Point(snappedX, snappedY);
    }
  }

  const gridSnappedX = Math.round(pointer.x / GRID_SIZE) * GRID_SIZE;
  const gridSnappedY = Math.round(pointer.y / GRID_SIZE) * GRID_SIZE;

  const distGrid = Math.hypot(
    pointer.x - gridSnappedX,
    pointer.y - gridSnappedY
  );
  if (distGrid < SNAP_THRESHOLD) return new Point(gridSnappedX, gridSnappedY);

  return null;
}

export default findSnapPoint;
