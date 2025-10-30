import { HStack, Text } from "@chakra-ui/react";
import { useFabric } from "../../../contexts/FabricContext";
import { useThemeApp } from "../../../contexts/ThemeAppContext";
import type { Modes } from "../../../types";

const ModeSelector = () => {
  const { mode, setMode } = useFabric();
  const { THEME } = useThemeApp();
  const modes: { mode: Modes; label: string }[] = [
    { mode: "select", label: "S" },
    { mode: "draw", label: "D" },
    { mode: "drag", label: "D" },
    { mode: "erase", label: "E" },
  ];

  return (
    <>
      {modes.map((m) => (
        <Text
          key={m.mode}
          onClick={() => setMode(m.mode)}
          color={mode === m.mode ? THEME.color.active : THEME.color.primary}
          cursor="pointer"
          _hover={{
            bgColor:
              mode === m.mode ? THEME.bgColor.active : THEME.bgColor.hover,
          }}
          borderRadius="lg"
          p={2}
          bgColor={mode === m.mode ? THEME.bgColor.active : "transparent"}
          w="2.5rem"
          h="2.5rem"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {m.label}
        </Text>
      ))}
    </>
  );
};

const SelectMode = () => {
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
      <ModeSelector />
    </HStack>
  );
};

export default SelectMode;
