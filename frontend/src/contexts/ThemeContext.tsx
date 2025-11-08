import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Intentar leer del localStorage
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      console.log("🎨 Tema cargado desde localStorage:", stored);
      return stored;
    }

    // 2. Por defecto usar light (sin detectar preferencia del sistema)
    console.log("🎨 Usando tema por defecto: light");
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Aplicar o remover la clase 'dark' del elemento <html>
    if (theme === "dark") {
      root.classList.add("dark");
      console.log("🌙 Modo oscuro activado");
    } else {
      root.classList.remove("dark");
      console.log("☀️ Modo claro activado");
    }

    // Persistir en localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
}
