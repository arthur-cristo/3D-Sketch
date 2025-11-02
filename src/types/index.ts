import type { Point, Line, FabricText, Rect, Circle, Ellipse } from "fabric";

export type Modes = "select" | "draw" | "drag" | "erase";
export type DrawObjects = {
  type: "rectangle" | "circle" | "line" | "ruler" | null;
  color: string;
  thickness: number;
};

export type DrawRef = {
  isDrawing: boolean;
  startPoint: { x: number; y: number } | Point | null;
  previewLine?: Line | null;
  previewSquare?: Rect | null;
  previewCircle?: Circle | Ellipse | null;
  previewRuler: FabricText | null;
};
