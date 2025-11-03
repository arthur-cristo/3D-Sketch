import { Button } from "@chakra-ui/react";
import { useThemeApp } from "../../../contexts/ThemeAppContext";

const ChangeTo3DButton = () => {
  const { THEME } = useThemeApp();
  return (
    <Button
      position="absolute"
      top={5}
      right={5}
      zIndex={1}
      bgColor={THEME.bgColor.cta}
      _hover={{ bgColor: THEME.bgColor.cta_hover }}
      borderRadius="lg"
    >
      Ver 3D
    </Button>
  );
};

export default ChangeTo3DButton;
