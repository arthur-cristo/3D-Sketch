import { Circle, Ellipse, Line, Rect } from "fabric";

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
        perPixelTargetFind: true,
        originX: "center",
        originY: "center",
        data: {
          isWall: true,
          color: this.wallColor,
          thickness: this.wallWidth,
          type: "line",
        },
      }
    );
  }

  rectangle(): Rect {
    return new Rect({
      left: Math.min(this.startPointX, this.endPointX),
      top: Math.min(this.startPointY, this.endPointY),
      width: Math.abs(this.startPointX - this.endPointX),
      height: Math.abs(this.startPointY - this.endPointY),
      fill: "transparent",
      stroke: this.wallColor,
      strokeWidth: this.wallWidth,
      selectable: false,
      evented: true,
      perPixelTargetFind: true,
      data: {
        isWall: true,
        color: this.wallColor,
        thickness: this.wallWidth,
        type: "rectangle",
      },
    });
  }

  circle(): Circle {
    return new Circle({
      left: this.startPointX,
      top: this.startPointY,
      radius: Math.hypot(
        this.endPointX - this.startPointX,
        this.endPointY - this.startPointY
      ),
      fill: "transparent",
      stroke: this.wallColor,
      strokeWidth: this.wallWidth,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: true,
      perPixelTargetFind: true,
      data: {
        isWall: true,
        color: this.wallColor,
        thickness: this.wallWidth,
        type: "circle",
      },
    });
  }

  ellipse(): Ellipse {
    const width = Math.abs(this.endPointX - this.startPointX);
    const height = Math.abs(this.endPointY - this.startPointY);

    const rx = width / 2;
    const ry = height / 2;

    const left = Math.min(this.startPointX, this.endPointX) + rx;
    const top = Math.min(this.startPointY, this.endPointY) + ry;

    return new Ellipse({
      left: left,
      top: top,
      rx: rx,
      ry: ry,
      fill: "transparent",
      stroke: this.wallColor,
      strokeWidth: this.wallWidth,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: true,
      perPixelTargetFind: true,
      data: {
        isWall: true,
        color: this.wallColor,
        thickness: this.wallWidth,
        type: "ellipse",
      },
    });
  }
}
