import { Button, Text } from "@chakra-ui/react";
import { useFabric } from "../../../contexts/FabricContext";
import THEME from "../../../constants/theme";

// Temporarily simple button to toggle grid visibility
const Options = () => {
  const { showGrid, setShowGrid } = useFabric();

  return (
    <Button
      position="fixed"
      top={5}
      left={5}
      bgColor={THEME.button.bgColor}
      _hover={{ bgColor: THEME.button._hover.bgColor }}
      zIndex={1}
      borderRadius="lg"
      p={2}
      onClick={() => setShowGrid(!showGrid)}
    >
      <Text>{showGrid ? "Ocultar grade" : "Mostrar grade"}</Text>
    </Button>
  );
};

export default Options;
