import type { Canvas, TPointerEvent, TPointerEventInfo } from "fabric";

type Opt = TPointerEventInfo<TPointerEvent>;

export const handleMouseOverErase = (opt: Opt, canvas: Canvas) => {
  const target = opt.target;
  if (target && target.type === "line") {
    target.set("stroke", "red");
    canvas.requestRenderAll();
  }
};

export const handleMouseOutErase = (opt: Opt, canvas: Canvas) => {
  const target = opt.target;
  if (target && target.type === "line") {
    target.set("stroke", (target as any).data.color);
    canvas.requestRenderAll();
  }
};

export const handleMouseDownErase = (opt: Opt, canvas: Canvas) => {
  const target = opt.target;
  if (target && target.type === "line") {
    canvas.remove(target);
    canvas.requestRenderAll();
  }
};
