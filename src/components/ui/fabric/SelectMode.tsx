import { HStack, Text } from "@chakra-ui/react";
import { useFabric } from "../../../contexts/FabricContext";
import { useThemeApp } from "../../../contexts/ThemeAppContext";

const SelectMode = () => {
  const { mode, setMode } = useFabric();
  const { THEME } = useThemeApp();
  return (
    <HStack
      position="absolute"
      top={5}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1}
      bgColor={THEME.bgColor.primary}
      px={2}
      py={1.5}
      borderRadius="lg"
      gap={2}
      boxShadow="sm"
    >
      <Text
        onClick={() => setMode("select")}
        color={mode === "select" ? THEME.color.active : THEME.color.primary}
        cursor="pointer"
        _hover={{
          bgColor:
            mode === "select" ? THEME.bgColor.active : THEME.bgColor.hover,
        }}
        borderRadius="lg"
        p={2}
        bgColor={mode === "select" ? THEME.bgColor.active : "transparent"}
        w="2.5rem"
        h="2.5rem"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        S
      </Text>
      <Text
        onClick={() => setMode("draw")}
        color={mode === "draw" ? THEME.color.active : THEME.color.primary}
        cursor="pointer"
        _hover={{
          bgColor: mode === "draw" ? THEME.bgColor.active : THEME.bgColor.hover,
        }}
        borderRadius="lg"
        p={2}
        bgColor={mode === "draw" ? THEME.bgColor.active : "transparent"}
        w="2.5rem"
        h="2.5rem"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        D
      </Text>
      <Text
        onClick={() => setMode("drag")}
        color={mode === "drag" ? THEME.color.active : THEME.color.primary}
        cursor="pointer"
        _hover={{
          bgColor: mode === "drag" ? THEME.bgColor.active : THEME.bgColor.hover,
        }}
        borderRadius="lg"
        bgColor={mode === "drag" ? THEME.bgColor.active : "transparent"}
        w="2.5rem"
        h="2.5rem"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        D
      </Text>
    </HStack>
  );
};

export default SelectMode;
