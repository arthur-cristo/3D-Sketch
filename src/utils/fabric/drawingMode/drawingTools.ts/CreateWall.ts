import { Circle, Line, Rect } from "fabric";

export class CreateWall {
  startPointX: number;
  startPointY: number;
  endPointX: number;
  endPointY: number;
  wallColor: string;
  wallWidth: number;
  drawObject: "rectangle" | "line" | "circle";

  constructor(
    startPointX: number,
    startPointY: number,
    endPointX: number,
    endPointY: number,
    wallColor: string,
    wallWidth: number,
    drawObject: "rectangle" | "line" | "circle"
  ) {
    this.startPointX = startPointX;
    this.startPointY = startPointY;
    this.endPointX = endPointX;
    this.endPointY = endPointY;
    this.wallColor = wallColor;
    this.wallWidth = wallWidth;
    this.drawObject = drawObject;
  }

  line(): Line {
    return new Line(
      [this.startPointX, this.startPointY, this.endPointX, this.endPointY],
      {
        stroke: this.wallColor,
        strokeWidth: this.wallWidth,
        selectable: false,
        evented: true,
        originX: "center",
        originY: "center",
        data: { isWall: true },
      }
    );
  }

  rectangle(): Rect {
    return new Rect();
  }

  circle(): Circle {
    return new Circle();
  }
}
