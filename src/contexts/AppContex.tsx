import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface AppContext {
  mode: "2D" | "3D";
  setMode: Dispatch<SetStateAction<"2D" | "3D">>;
}

export const AppContext = createContext<AppContext>({} as AppContext);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<"2D" | "3D">("2D");

  return (
    <AppContext.Provider value={{ mode, setMode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
