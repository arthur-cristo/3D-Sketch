import { useRef, useEffect } from "react";
import * as fabric from "fabric";
import "./style.css";
import resizeCanvas from "../../utils/fabric/resizeCanvas";
import drawGrid from "../../utils/fabric/drawGrid";

const TwoDimensionCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const originalDimensionsRef = useRef<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const outerCanvasContainer = document.getElementById(
      "fabricCanvasContainer"
    );
    if (!outerCanvasContainer) return;

    if (!originalDimensionsRef.current) {
      originalDimensionsRef.current = {
        width: outerCanvasContainer.clientWidth,
        height: outerCanvasContainer.clientHeight,
      };
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: false,
      enableRetinaScaling: true,
    });
    fabricCanvasRef.current = canvas;

    const handleResize = () => {
      const currentCanvas = fabricCanvasRef.current;
      const originalDims = originalDimensionsRef.current;
      const container = document.getElementById("fabricCanvasContainer");

      if (!currentCanvas || !originalDims || !container) return;

      resizeCanvas(
        currentCanvas,
        container.clientWidth,
        container.clientHeight,
        originalDims.width
      );
      drawGrid(currentCanvas);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "red",
      width: 200,
      height: 200,
    });
    canvas.add(rect);

    return () => {
      window.removeEventListener("resize", handleResize);
      fabricCanvasRef.current?.dispose();
    };
  }, []);

  return (
    <div id="fabricCanvasContainer">
      <canvas id="fabricCanvas" ref={canvasRef} />
    </div>
  );
};

export default TwoDimensionCanvas;
