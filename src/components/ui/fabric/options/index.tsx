import {
  Box,
  Button,
  HStack,
  Icon,
  Menu,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useFabric } from "../../../../contexts/FabricContext";
import { GiHamburgerMenu } from "react-icons/gi";
import { useThemeApp } from "../../../../contexts/ThemeAppContext";
import ThemeModeSelector from "./ThemeSelector";
import ScaleSelector from "./ScaleSelector";

const Options = () => {
  const { showGrid, setShowGrid } = useFabric();
  const { THEME } = useThemeApp();
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
            w="22rem"
          >
            <Menu.ItemGroup>
              <Menu.Item
                value="scale"
                _highlighted={{ bgColor: "transparent" }}
                closeOnSelect={false}
              >
                <HStack justify="space-between" w="100%">
                  <Text fontSize="lg">Escala</Text>
                  <HStack
                    gap={2}
                    py={1}
                    px={2}
                    borderRadius="lg"
                    border="0.1rem solid"
                    borderColor={THEME.borderColor.separator}
                  >
                    <ScaleSelector />
                  </HStack>
                </HStack>
              </Menu.Item>
              <Menu.Item
                value="show_grid"
                closeOnSelect={false}
                _highlighted={{ bgColor: "transparent" }}
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
            </Menu.ItemGroup>
            <Menu.Separator bgColor={THEME.borderColor.separator} />
            <Menu.ItemGroup>
              <Menu.Item
                value="toggle_grid"
                _highlighted={{ bgColor: "transparent" }}
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
                    <ThemeModeSelector />
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
