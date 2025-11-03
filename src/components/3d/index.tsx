import { Box } from "@chakra-ui/react";
import { useApp } from "../../contexts/AppContex";
import { useThree } from "../../contexts/ThreeContex";

const ThreeDimensionsCanvas = () => {
  const { mode } = useApp();
  const { canvasRef } = useThree();
  return (
    <Box
      position="relative"
      zIndex={mode === "3D" ? 0 : -1}
      visibility={mode === "3D" ? "visible" : "hidden"}
      pointerEvents={mode === "3D" ? "auto" : "none"}
    >
      <Box
        id="three-canvas-container"
        position="fixed"
        top={0}
        bottom={0}
        left={0}
        right={0}
        userSelect="none"
      >
        <canvas id="three-canvas" ref={canvasRef} />
      </Box>
    </Box>
  );
};

export default ThreeDimensionsCanvas;
