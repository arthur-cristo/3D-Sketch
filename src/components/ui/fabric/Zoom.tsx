import { HStack, Text } from "@chakra-ui/react";
import { useFabric } from "../../../contexts/FabricContext";
import { Tooltip } from "../tooltip";
import THEME from "../../../constants/theme";

const Zoom = () => {
  const { canvasZoom } = useFabric();
  return (
    <HStack
      position="fixed"
      bottom={5}
      left={5}
      zIndex={1}
      bgColor={THEME.button.bgColor}
      borderRadius="lg"
      gap={8}
    >
      <Text
        color="black"
        onClick={canvasZoom.decreaseZoom}
        _hover={{ bgColor: THEME.button._hover.bgColor }}
        fontSize="lg"
        cursor="pointer"
        py={2}
        px={4}
        borderTopLeftRadius="lg"
        borderBottomLeftRadius="lg"
      >
        -
      </Text>
      <Tooltip content="Redefinir o zoom" showArrow openDelay={0}>
        <Text
          color="black"
          cursor="pointer"
          onClick={() => canvasZoom.setZoom(1)}
        >
          {(canvasZoom.zoom * 100).toFixed(0)}%
        </Text>
      </Tooltip>
      <Text
        color="black"
        onClick={canvasZoom.increaseZoom}
        _hover={{ bgColor: THEME.button._hover.bgColor }}
        fontSize="lg"
        cursor="pointer"
        py={2}
        px={4}
        borderTopRightRadius="lg"
        borderBottomRightRadius="lg"
      >
        +
      </Text>
    </HStack>
  );
};

export default Zoom;
