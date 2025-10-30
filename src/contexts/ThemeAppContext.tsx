import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorMode, useColorModeValue } from "../components/ui/color-mode";
import { useTheme } from "next-themes";

type Theme = {
  bgColor: {
    primary: string;
    secondary: string;
    cta: string;
    hover: string;
    active: string;
  };
  color: {
    primary: string;
    secondary: string;
    active: string;
    cta: string;
    tooltip: string;
  };
  borderColor: {
    separator: string;
  };
};

interface ThemeAppContext {
  THEME: Theme;
  themeMode: "light" | "dark" | "system";
  colorMode: "light" | "dark";
  useSystemTheme: () => void;
  useLightTheme: () => void;
  useDarkTheme: () => void;
}

export const ThemeAppContext = createContext<ThemeAppContext>(
  {} as ThemeAppContext
);

export const ThemeAppProvider = ({ children }: { children: ReactNode }) => {
  const { colorMode, setColorMode } = useColorMode();
  const { systemTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(
    "system"
  );
  const useSystemTheme = () => setThemeMode("system");
  const useLightTheme = () => setThemeMode("light");
  const useDarkTheme = () => setThemeMode("dark");
  useEffect(() => {
    setColorMode(themeMode === "system" ? systemTheme! : themeMode);
  }, [themeMode]);
  const THEME: Theme = {
    bgColor: {
      primary: useColorModeValue("#ffffff", "#232329"),
      secondary: useColorModeValue("#ececf4", "#232329"),
      cta: useColorModeValue("#5B57D1", "#B2AEFF"),
      hover: useColorModeValue("#F1F0FF", "#2E2D39"),
      active: useColorModeValue("#E0DFFF", "#403E6A"),
    },
    color: {
      primary: useColorModeValue("#1B1B1F", "#E3E3E8"),
      secondary: useColorModeValue("#ffffff", "#121212"),
      active: useColorModeValue("#030064", "#E0DFFF"),
      cta: useColorModeValue("#6965DB", "#A8A5FF"),
      tooltip: useColorModeValue("#B8B8B8", "#7A7A7A"),
    },
    borderColor: {
      separator: useColorModeValue("#F1F0FF", "#2E2D39"),
    },
  };

  return (
    <ThemeAppContext.Provider
      value={{
        THEME,
        themeMode,
        colorMode,
        useSystemTheme,
        useLightTheme,
        useDarkTheme,
      }}
    >
      {children}
    </ThemeAppContext.Provider>
  );
};

export const useThemeApp = () => useContext(ThemeAppContext);
