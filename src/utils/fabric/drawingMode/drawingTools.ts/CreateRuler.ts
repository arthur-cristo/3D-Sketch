import { FabricText, Line } from "fabric";
import { RULER_OFFSET } from "../../../../constants";

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
      top: this.startPointY - RULER_OFFSET,
      fontSize: this.fontSize,
      fill: this.fill,
      originX: "center",
      originY: "bottom",
      selectable: false,
      evented: false,
      visible: false,
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
      }
    );
  }
}
