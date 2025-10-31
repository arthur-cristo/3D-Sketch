import { Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { useFabric } from "../../../contexts/FabricContext";
import { useThemeApp } from "../../../contexts/ThemeAppContext";
import {
  LuMove,
  LuMousePointer2,
  LuMinus,
  LuSquare,
  LuCircle,
  LuRuler,
  LuEraser,
} from "react-icons/lu";

import type { DrawObjects, Modes } from "../../../types";
import type { IconType } from "react-icons";
import { Tooltip } from "../tooltip";

const ModeSelector = () => {
  const { mode, setMode, drawObject, setDrawObject } = useFabric();
  const { THEME } = useThemeApp();
  const modes: {
    mode: Modes;
    drawObject?: DrawObjects;
    icon: IconType;
    key?: string;
    tooltip?: string;
  }[] = [
    { mode: "drag", icon: LuMove, key: "", tooltip: "Arrastar" },
    { mode: "select", icon: LuMousePointer2, key: "1", tooltip: "Selecionar" },
    {
      mode: "draw",
      drawObject: "line",
      icon: LuMinus,
      key: "2",
      tooltip: "Linha",
    },
    {
      mode: "draw",
      drawObject: "rectangle",
      icon: LuSquare,
      key: "3",
      tooltip: "Retângulo",
    },
    {
      mode: "draw",
      drawObject: "circle",
      icon: LuCircle,
      key: "4",
      tooltip: "Círculo",
    },
    {
      mode: "draw",
      drawObject: "ruler",
      icon: LuRuler,
      key: "5",
      tooltip: "Régua",
    },
    { mode: "erase", icon: LuEraser, tooltip: "Apagar", key: "0" },
  ];

  return (
    <>
      {modes.map((m) => {
        const isActive =
          mode === m.mode &&
          (m.drawObject ? drawObject === m.drawObject : true);
        const Selector = (
          <Flex
            key={m.mode + m.drawObject}
            onClick={() => {
              setMode(m.mode);
              setDrawObject(m.drawObject ?? null);
            }}
            w="2.5rem"
            h="2.5rem"
            alignItems="center"
            justifyContent="center"
            color={isActive ? THEME.color.active : THEME.color.primary}
            cursor="pointer"
            _hover={{
              bgColor: isActive ? THEME.bgColor.active : THEME.bgColor.hover,
            }}
            borderRadius="lg"
            p={2}
            bgColor={isActive ? THEME.bgColor.active : "transparent"}
            position="relative"
          >
            <Icon as={m.icon} boxSize={5} />
            {m.key && (
              <Text
                position="absolute"
                fontSize="2xs"
                bottom={1}
                right={1}
                color={THEME.color.tooltip}
              >
                {m.key}
              </Text>
            )}
          </Flex>
        );
        return (
          <>
            {m.tooltip ? (
              <Tooltip content={m.tooltip} showArrow>
                {Selector}
              </Tooltip>
            ) : (
              Selector
            )}
          </>
        );
      })}
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
      boxShadow="0px 10px 15px 0px rgba(0,0,0,0.1)"
    >
      <ModeSelector />
    </HStack>
  );
};

export default SelectMode;
