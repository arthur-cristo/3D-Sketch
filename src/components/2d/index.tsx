import { Box } from "@chakra-ui/react";
import { useFabric } from "../../contexts/FabricContext";
import Zoom from "../ui/fabric/Zoom";
import SelectMode from "../ui/fabric/SelectMode";
import Options from "../ui/fabric/options";
import { useThemeApp } from "../../contexts/ThemeAppContext";
import { useApp } from "../../contexts/AppContex";

const TwoDimensionCanvas = () => {
  const { mode } = useApp();
  const { canvasRef } = useFabric();
  const { THEME } = useThemeApp();

  return (
    <Box
      position="relative"
      zIndex={mode === "2D" ? 0 : -1}
      visibility={mode === "2D" ? "visible" : "hidden"}
      pointerEvents={mode === "2D" ? "auto" : "none"}
    >
      <Box
        id="fabric-canvas-container"
        position="fixed"
        top={0}
        bottom={0}
        left={0}
        right={0}
        bgColor={THEME.bgColor.primary}
        userSelect="none"
      >
        <canvas id="fabric-canvas" ref={canvasRef} />
        <Options />
        <SelectMode />
        <Zoom />
      </Box>
    </Box>
  );
};

export default TwoDimensionCanvas;
