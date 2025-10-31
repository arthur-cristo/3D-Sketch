import { Flex, Icon } from "@chakra-ui/react";
import { LuSun, LuMoon, LuComputer } from "react-icons/lu";
import { useThemeApp } from "../../../../contexts/ThemeAppContext";

const ThemeModeSelector = () => {
  const { THEME, themeMode, useLightTheme, useDarkTheme, useSystemTheme } =
    useThemeApp();
  const selectors = [
    { mode: "light", onClick: useLightTheme, icon: LuSun },
    { mode: "dark", onClick: useDarkTheme, icon: LuMoon },
    { mode: "system", onClick: useSystemTheme, icon: LuComputer },
  ];
  return (
    <>
      {selectors.map(({ mode, onClick, icon }) => (
        <Flex
          onClick={onClick}
          key={mode}
          bgColor={themeMode === mode ? THEME.bgColor.cta : "transparent"}
          _hover={{
            bgColor:
              themeMode === mode ? THEME.bgColor.cta : THEME.bgColor.hover,
          }}
          py={1}
          px={2}
          borderRadius="lg"
          cursor="pointer"
        >
          <Icon
            as={icon}
            boxSize={5}
            color={themeMode === mode ? THEME.color.secondary : THEME.color.cta}
          />
        </Flex>
      ))}
    </>
  );
};

export default ThemeModeSelector;
