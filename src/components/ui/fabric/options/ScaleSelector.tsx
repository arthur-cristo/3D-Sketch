import { Flex, Text } from "@chakra-ui/react";
import { SCALES } from "../../../../constants";
import { useFabric } from "../../../../contexts/FabricContext";
import { useThemeApp } from "../../../../contexts/ThemeAppContext";

const ScaleSelector = () => {
  const { THEME } = useThemeApp();
  const { scale, setScale } = useFabric();
  return (
    <>
      {SCALES.map((s) => (
        <Flex
          onClick={() => setScale(s)}
          key={s}
          bgColor={scale === s ? THEME.bgColor.cta : "transparent"}
          _hover={{
            bgColor: scale === s ? THEME.bgColor.cta : THEME.bgColor.hover,
          }}
          py={1}
          px={1.5}
          borderRadius="lg"
          cursor="pointer"
        >
          <Text
            color={scale === s ? THEME.color.secondary : THEME.color.cta}
            fontWeight={scale === s ? "bold" : "normal"}
          >
            {s}
          </Text>
        </Flex>
      ))}
    </>
  );
};

export default ScaleSelector;
