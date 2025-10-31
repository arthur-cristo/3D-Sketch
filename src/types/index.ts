import type { Point, Line, FabricText } from "fabric";

export type Modes = "select" | "draw" | "drag" | "erase";
export type DrawObjects = "rectangle" | "circle" | "line" | "ruler" | null;
export type DrawRef = {
  isDrawing: boolean;
  startPoint: { x: number; y: number } | Point | null;
  previewLine: Line | null;
  previewRuler: FabricText | null;
};
