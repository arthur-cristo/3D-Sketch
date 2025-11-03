import devicePxPerCm from "../utils/devicePxPerCm";

export const ZOOM = {
  MIN: 0.1,
  MAX: 2,
  STEP: 0.1,
};

export const GRID_SIZE = 1 * devicePxPerCm(); // pixels

export const SNAP_THRESHOLD = 25;
export const RULER_OFFSET = 15;
export const SCALES = [20, 25, 50, 75, 100, 125];
export const WALL_THICKNESS = {
  fabric: {
    thin: 4,
    medium: 6,
    thick: 8,
  }, // in pixels
  three: {
    thin: 0.1,
    medium: 0.125,
    thick: 0.15,
  }, // meters
};
export const RULER_THICKNESS = 2;
export const DEFAULT_WORLD_SIZE = {
  DESKTOP: { width: 1920, height: 1080 }, // pixels
  MOBILE: { width: 1080, height: 1920 }, // pixels
};
export const RULER_TEXT_FONT_SIZE = 14;
