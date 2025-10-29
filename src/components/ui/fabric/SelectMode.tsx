import { HStack, Text } from "@chakra-ui/react";
import { useFabric } from "../../../contexts/FabricContext";
import THEME from "../../../constants/theme";

const SelectMode = () => {
  const { mode, setMode } = useFabric();
  return (
    <HStack
      position="fixed"
      top={5}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1}
      bgColor="white"
      px={2}
      py={1}
      borderRadius="lg"
      gap={8}
      boxShadow="sm"
    >
      <Text
        onClick={() => setMode("select")}
        color="black"
        cursor="pointer"
        _hover={{
          bgColor:
            mode === "select"
              ? THEME.button._active.bgColor
              : THEME.button._hover.bgColor,
        }}
        borderRadius="lg"
        p={2}
        bgColor={
          mode === "select" ? THEME.button._active.bgColor : "transparent"
        }
      >
        Select
      </Text>
      <Text
        onClick={() => setMode("draw")}
        color="black"
        cursor="pointer"
        _hover={{
          bgColor:
            mode === "select"
              ? THEME.button._active.bgColor
              : THEME.button._hover.bgColor,
        }}
        borderRadius="lg"
        p={2}
        bgColor={mode === "draw" ? THEME.button._active.bgColor : "transparent"}
      >
        Draw
      </Text>
      <Text
        onClick={() => setMode("drag")}
        color="black"
        cursor="pointer"
        _hover={{
          bgColor:
            mode === "select"
              ? THEME.button._active.bgColor
              : THEME.button._hover.bgColor,
        }}
        borderRadius="lg"
        p={2}
        bgColor={mode === "drag" ? THEME.button._active.bgColor : "transparent"}
      >
        Drag
      </Text>
    </HStack>
  );
};

export default SelectMode;
