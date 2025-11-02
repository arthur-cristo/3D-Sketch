import type {
  Canvas,
  Group,
  TPointerEvent,
  TPointerEventInfo,
  FabricObject,
} from "fabric";

type Opt = TPointerEventInfo<TPointerEvent>;

export const handleMouseOverErase = (opt: Opt, canvas: Canvas) => {
  const target = opt.target;
  if (!target) return;

  let objects: FabricObject[] = [];
  if (target.isType("group")) {
    objects = (target as Group).getObjects();
  } else {
    objects = [target];
  }
  objects.forEach((obj) => {
    if (!obj) return;

    if (obj.stroke) obj.set("stroke", "red");
    if (obj.fill && obj.fill !== "transparent") obj.set("fill", "red");
  });

  canvas.requestRenderAll();
};

export const handleMouseOutErase = (opt: Opt, canvas: Canvas) => {
  const target = opt.target;
  if (!target) return;

  let objects: FabricObject[] = [];
  if (target.isType("group")) {
    objects = (target as Group).getObjects();
  } else {
    objects = [target];
  }

  objects.forEach((obj) => {
    if (!obj || !(obj as any).data) return;

    const originalColor = (obj as any).data.color;
    if (obj.stroke) obj.set("stroke", originalColor);
    if (obj.fill && obj.fill !== "transparent") obj.set("fill", originalColor);
  });

  canvas.requestRenderAll();
};

export const handleMouseDownErase = (opt: Opt, canvas: Canvas) => {
  const target = opt.target;
  if (target) {
    canvas.remove(target);
    canvas.requestRenderAll();
  }
};
