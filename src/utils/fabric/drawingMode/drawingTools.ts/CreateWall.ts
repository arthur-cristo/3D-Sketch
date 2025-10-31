import { Line } from "fabric";

export class CreateWall {
  startPointX: number;
  startPointY: number;
  endPointX: number;
  endPointY: number;
  wallColor: string;
  wallWidth: number;

  constructor(
    startPointX: number,
    startPointY: number,
    endPointX: number,
    endPointY: number,
    wallColor: string,
    wallWidth: number
  ) {
    this.startPointX = startPointX;
    this.startPointY = startPointY;
    this.endPointX = endPointX;
    this.endPointY = endPointY;
    this.wallColor = wallColor;
    this.wallWidth = wallWidth;
  }

  line() {
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
}
