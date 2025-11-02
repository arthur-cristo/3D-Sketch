import { Ellipse, FabricText, Line, Rect } from "fabric";

export class CreateRuler {
  startPointX: number;
  startPointY: number;
  fontSize: number;
  fill: string;
  strokeWidth: number;

  constructor(
    startPointX: number,
    startPointY: number,
    fontSize: number,
    fill: string,
    strokeWidth: number
  ) {
    this.startPointX = startPointX;
    this.startPointY = startPointY;
    this.fontSize = fontSize;
    this.fill = fill;
    this.strokeWidth = strokeWidth;
  }

  text() {
    return new FabricText("0,0 cm", {
      left: this.startPointX,
      top: this.startPointY,
      fontSize: this.fontSize,
      fill: this.fill,
      originX: "center",
      originY: "bottom",
      selectable: false,
      evented: false,
      visible: false,
      data: { type: "ruler", color: this.fill },
    });
  }
  line() {
    return new Line(
      [this.startPointX, this.startPointY, this.startPointX, this.startPointY],
      {
        stroke: this.fill,
        strokeWidth: this.strokeWidth,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        data: { type: "ruler", color: this.fill },
      }
    );
  }
  rect() {
    return new Rect({
      left: this.startPointX,
      top: this.startPointY,
      width: 0,
      height: 0,
      fill: "transparent",
      stroke: this.fill,
      strokeWidth: this.strokeWidth,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      data: { type: "ruler", color: this.fill },
    });
  }

  ellipse() {
    return new Ellipse({
      left: this.startPointX,
      top: this.startPointY,
      rx: 0,
      ry: 0,
      stroke: this.fill,
      originX: "center",
      originY: "center",
      strokeWidth: this.strokeWidth,
      strokeDashArray: [5, 5],
      fill: "transparent",
      selectable: false,
      evented: false,
      data: { type: "ruler", color: this.fill },
    });
  }
}
