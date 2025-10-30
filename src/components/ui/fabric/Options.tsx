import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Menu,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useFabric } from "../../../contexts/FabricContext";
import { GiHamburgerMenu } from "react-icons/gi";
import { LuComputer, LuMoon, LuSun } from "react-icons/lu";
import { useThemeApp } from "../../../contexts/ThemeAppContext";

type ThemeModeSelectorProps = {
  THEME: ReturnType<typeof useThemeApp>["THEME"];
  themeMode: ReturnType<typeof useThemeApp>["themeMode"];
  useLightTheme: ReturnType<typeof useThemeApp>["useLightTheme"];
  useDarkTheme: ReturnType<typeof useThemeApp>["useDarkTheme"];
  useSystemTheme: ReturnType<typeof useThemeApp>["useSystemTheme"];
};

const ThemeModeSelector = ({
  THEME,
  themeMode,
  useLightTheme,
  useDarkTheme,
  useSystemTheme,
}: ThemeModeSelectorProps) => {
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

const Options = () => {
  const { showGrid, setShowGrid } = useFabric();
  const { THEME, useLightTheme, useDarkTheme, useSystemTheme, themeMode } =
    useThemeApp();
  return (
    <Box position="absolute" top={5} left={5}>
      <Menu.Root positioning={{ placement: "bottom-start" }}>
        <Menu.Trigger asChild>
          <Button
            bgColor={THEME.bgColor.secondary}
            border="none"
            _hover={{
              bgColor: THEME.bgColor.hover,
              border: "none",
            }}
            outline="none"
            zIndex={1}
            borderRadius="lg"
            p={2}
          >
            <Icon
              as={GiHamburgerMenu}
              boxSize={5}
              color={THEME.color.primary}
            />
          </Button>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content
            bgColor={THEME.bgColor.primary}
            borderRadius="lg"
            boxShadow="sm"
            w="20rem"
          >
            <Menu.ItemGroup>
              <Menu.Item
                value="show_grid"
                _hover={{ bgColor: "transparent" }}
                closeOnSelect={false}
              >
                <HStack justify="space-between" w="100%">
                  <Text fontSize="lg">Mostrar Grade</Text>
                  <Switch.Root
                    checked={showGrid}
                    onCheckedChange={(e) => setShowGrid(e.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control
                      _checked={{
                        bgColor: THEME.bgColor.cta,
                      }}
                    >
                      <Switch.Thumb />
                    </Switch.Control>
                    <Switch.Label />
                  </Switch.Root>
                </HStack>
              </Menu.Item>
              <Menu.Item
                value="toggle_grid"
                _hover={{ bgColor: "transparent" }}
                closeOnSelect={false}
              >
                <HStack justify="space-between" w="100%">
                  <Text fontSize="lg">Tema</Text>
                  <HStack
                    gap={2}
                    py={1}
                    px={2}
                    borderRadius="lg"
                    border="0.1rem solid"
                    borderColor={THEME.borderColor.separator}
                  >
                    <ThemeModeSelector
                      THEME={THEME}
                      themeMode={themeMode}
                      useLightTheme={useLightTheme}
                      useDarkTheme={useDarkTheme}
                      useSystemTheme={useSystemTheme}
                    />
                  </HStack>
                </HStack>
              </Menu.Item>
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    </Box>
  );
};

export default Options;
