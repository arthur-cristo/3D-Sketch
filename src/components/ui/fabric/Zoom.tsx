import { HStack, Text } from "@chakra-ui/react";
import { useFabric } from "../../../contexts/FabricContext";
import { Tooltip } from "../tooltip";
import { useThemeApp } from "../../../contexts/ThemeAppContext";

const Zoom = () => {
  const { canvasZoom } = useFabric();
  const { THEME } = useThemeApp();
  return (
    <HStack
      position="absolute"
      bottom={5}
      left={5}
      zIndex={1}
      bgColor={THEME.bgColor.secondary}
      borderRadius="lg"
      gap={6}
    >
      <Text
        color={THEME.color.primary}
        onClick={canvasZoom.decreaseZoom}
        _hover={{ bgColor: THEME.bgColor.hover }}
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
          color={THEME.color.primary}
          cursor="pointer"
          onClick={() => canvasZoom.setZoom(1)}
        >
          {(canvasZoom.zoom * 100).toFixed(0)}%
        </Text>
      </Tooltip>
      <Text
        color={THEME.color.primary}
        onClick={canvasZoom.increaseZoom}
        _hover={{ bgColor: THEME.bgColor.hover }}
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
