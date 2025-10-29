import { Box } from "@chakra-ui/react";
import { useFabric } from "../../contexts/FabricContext";
import Zoom from "../ui/fabric/Zoom";
import SelectMode from "../ui/fabric/SelectMode";
import Options from "../ui/fabric/Options";

const TwoDimensionCanvas = () => {
  const { canvasRef } = useFabric();

  return (
    <Box
      id="fabric-canvas-container"
      position="fixed"
      top={0}
      bottom={0}
      left={0}
      right={0}
      bgColor="white"
      userSelect="none"
    >
      <canvas id="fabric-canvas" ref={canvasRef} />
      <Options />
      <SelectMode />
      <Zoom />
    </Box>
  );
};

export default TwoDimensionCanvas;
