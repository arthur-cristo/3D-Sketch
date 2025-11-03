import type { ReactNode } from "react";
import { FabricProvider } from "./FabricContext";
import { Provider } from "../components/ui/provider";
import { ColorModeProvider } from "../components/ui/color-mode";
import { Theme } from "@chakra-ui/react";
import { ThemeAppProvider } from "./ThemeAppContext";
import { AppProvider } from "./AppContex";
import { ThreeProvider } from "./ThreeContex";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Provider>
      <Theme>
        <ColorModeProvider>
          <ThemeAppProvider>
            <AppProvider>
              <FabricProvider>
                <ThreeProvider>{children}</ThreeProvider>
              </FabricProvider>
            </AppProvider>
          </ThemeAppProvider>
        </ColorModeProvider>
      </Theme>
    </Provider>
  );
};

export default Providers;
