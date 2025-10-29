import type { ReactNode } from "react";
import { FabricProvider } from "./FabricContext";
import { Provider } from "../components/ui/provider";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <FabricProvider>
      <Provider>{children}</Provider>
    </FabricProvider>
  );
};

export default Providers;
