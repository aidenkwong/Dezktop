import { createContext, useState } from "react";

export const ThemeContext = createContext({
  theme: "theme-dark",
  setTheme: (_theme: any) => {},
});
const ThemeProvider = ({ children }: any) => {
  // useState
  const [theme, setTheme] = useState<any>("theme-dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
