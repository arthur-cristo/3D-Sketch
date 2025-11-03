import type { Canvas, Line, Point as PointType } from "fabric";
import { Point } from "fabric";
import { GRID_SIZE, SNAP_THRESHOLD } from "../../constants"; // Assuming these are in scope

// --- New constants for snapping logic ---

/**
 * How far (in pixels) from a perfect straight line to detect "orthogonal" intent.
 * This should be larger than the normal snap threshold.
 */
const ORTHO_INTENT_THRESHOLD = 15;

/**
 * The "low threshold" for snapping to the grid *while* drawing orthogonally.
 * This allows for a "sticky" grid snap only when you're already drawing a straight line.
 */
const LOW_GRID_SNAP_THRESHOLD = 5;

/**
 * Helper function to find the closest point from a list within a given threshold.
 * @param points - Array of points to check against.
 * @param target - The pointer's current location.
 * @param threshold - The maximum distance to snap.
 * @returns A new Point if snapped, otherwise null.
 */
function findClosestPoint(
  points: (Point | PointType)[],
  target: PointType,
  threshold: number
): Point | null {
  for (const point of points) {
    // Guard against null/undefined points which can come from oCoords
    if (!point) continue;
    const dist = Math.hypot(target.x - point.x, target.y - point.y);
    if (dist < threshold) {
      return new Point(point.x, point.y);
    }
  }
  return null;
}

/**
 * Finds a snap point on the canvas based on a priority list:
 * 1. Snap to other wall vertices (endpoints, corners, centers).
 * 2. Snap to an orthogonal line (horizontal/vertical) from the startPoint.
 * 3. While snapping orthogonally, also snap to the grid with a *low* threshold.
 * 4. Snap to the main grid with a *normal* threshold.
 *
 * @param canvas - The Fabric.js canvas instance.
 * @param pointer - The current coordinates of the mouse pointer.
 * @param startPoint - The starting point of the line being drawn (for orthogonal snapping).
 * @returns A new Point if a snap occurs, otherwise null.
 */
function findSnapPoint(
  canvas: Canvas,
  pointer: PointType,
  startPoint: Point | { x: number; y: number } | null = null
): Point | null {
  
  // --- Priority 1: Snap to Wall Vertex (Normal Threshold) ---
  const walls = canvas.getObjects().filter((obj) => (obj as any).data?.isWall);

  for (const wall of walls) {
    const wallType = (wall as any).data?.type;
    let vertexSnap: Point | null = null;

    // Ensure object coordinates are up-to-date before checking
    wall.setCoords();

    if (wallType === "line") {
      const line = wall as Line;
      const points = line.calcLinePoints();
      const p1 = new Point(points.x1, points.y1);
      const p2 = new Point(points.x2, points.y2);
      vertexSnap = findClosestPoint([p1, p2], pointer, SNAP_THRESHOLD);
    } else if (wallType === "rectangle") {
      const { tl, tr, bl, br } = wall.oCoords;
      vertexSnap = findClosestPoint([tl, tr, bl, br], pointer, SNAP_THRESHOLD);
    } else if (wallType === "circle") {
      const center = wall.getCenterPoint();
      vertexSnap = findClosestPoint([center], pointer, SNAP_THRESHOLD);
    }

    if (vertexSnap) {
      return vertexSnap; // Highest priority, return immediately
    }
  }

  // --- Priority 2 & 3: Orthogonal Snapping (with secondary grid) ---
  if (startPoint) {
    const dx = Math.abs(pointer.x - startPoint.x);
    const dy = Math.abs(pointer.y - startPoint.y);

    // Check for vertical snap intent (pointer is close to startPoint.x)
    if (dx < ORTHO_INTENT_THRESHOLD) {
      let snappedX = startPoint.x;
      let snappedY = pointer.y;

      // Priority 3: Snap to horizontal grid (low threshold)
      const gridSnappedY = Math.round(pointer.y / GRID_SIZE) * GRID_SIZE;
      if (Math.abs(pointer.y - gridSnappedY) < LOW_GRID_SNAP_THRESHOLD) {
        snappedY = gridSnappedY;
      }
      
      // Return this snap, as it's higher priority than the main grid snap
      return new Point(snappedX, snappedY);
    
    // Check for horizontal snap intent (pointer is close to startPoint.y)
    } else if (dy < ORTHO_INTENT_THRESHOLD) {
      let snappedX = pointer.x;
      let snappedY = startPoint.y;

      // Priority 3: Snap to vertical grid (low threshold)
      const gridSnappedX = Math.round(pointer.x / GRID_SIZE) * GRID_SIZE;
      if (Math.abs(pointer.x - gridSnappedX) < LOW_GRID_SNAP_THRESHOLD) {
        snappedX = gridSnappedX;
      }

      // Return this snap, as it's higher priority than the main grid snap
      return new Point(snappedX, snappedY);
    }
  }

  // --- Priority 4: Snap to Grid (Normal Threshold) ---
  // This only runs if priorities 1, 2, and 3 have failed.
  const gridSnappedX = Math.round(pointer.x / GRID_SIZE) * GRID_SIZE;
  const gridSnappedY = Math.round(pointer.y / GRID_SIZE) * GRID_SIZE;

  const distGrid = Math.hypot(pointer.x - gridSnappedX, pointer.y - gridSnappedY);
  if (distGrid < SNAP_THRESHOLD) {
    return new Point(gridSnappedX, gridSnappedY);
  }

  // --- No Snap ---
  // If no snap conditions were met, return null.
  return null;
}

export default findSnapPoint;
