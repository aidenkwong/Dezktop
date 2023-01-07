import { createContext, useState } from "react";
import defaultColors from "tailwindcss/colors";

export const colors = Object.fromEntries(
  Object.keys(defaultColors)
    .filter(
      (defaultColors) =>
        defaultColors !== "inherit" &&
        defaultColors !== "current" &&
        defaultColors !== "transparent" &&
        defaultColors !== "black" &&
        defaultColors !== "white"
    )
    .map((key) => [key, key])
);

export const ThemeContext = createContext({
  theme: colors.blue,
  setTheme: (_theme: any) => {},
});
const ThemeProvider = ({ children }: any) => {
  // useState
  const [theme, setTheme] = useState<any>(colors.purple);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
