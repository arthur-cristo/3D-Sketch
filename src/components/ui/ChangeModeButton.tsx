import { Button } from "@chakra-ui/react";
import { useThemeApp } from "../../contexts/ThemeAppContext";
import { useApp } from "../../contexts/AppContex";

const ChangeModeButton = () => {
  const { THEME } = useThemeApp();
  const { mode, setMode } = useApp();
  return (
    <Button
      position="absolute"
      top={5}
      right={5}
      zIndex={1}
      bgColor={THEME.bgColor.cta}
      _hover={{ bgColor: THEME.bgColor.cta_hover }}
      borderRadius="lg"
      onClick={() => setMode((prev) => (prev === "2D" ? "3D" : "2D"))}
    >
      {mode === "2D" ? "Ver 3D" : "Ver 2D"}
    </Button>
  );
};

export default ChangeModeButton;
