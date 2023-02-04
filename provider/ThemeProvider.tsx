import { createContext, useContext, useState, useEffect } from "react";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { firebaseDB } from "../firebase/firebase";
import { UserContext } from "./UserProvider";

export const THEME_CONTEXT_DEFAULT = {
  theme: "dark",
  setTheme: (_theme: string) => {},
};

export const ThemeContext = createContext(THEME_CONTEXT_DEFAULT);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  const { user } = useContext(UserContext);

  if (!context) {
    throw new Error("useThemeContext used outside ThemeContext provider");
  }

  useEffect(() => {
    localStorage.setItem("theme", context.theme);
    document.body.classList.value =
      "transition-colors ease-in-out duration-200";
    document.body.classList.add(`theme-${context.theme}`);

    (async () => {
      try {
        await updateDoc(doc(firebaseDB, "user_info", user?.uid!!), {
          theme: context.theme,
        });
      } catch (error: any) {
        if (error.code === "not-found") {
          await setDoc(doc(firebaseDB, "user_info", user?.uid!!), {
            theme: context.theme,
          });
        }
        console.error(error);
      }
    })();
  }, [context.theme, user?.uid]);

  return context;
};

const ThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    localStorage.getItem("theme") && setTheme(localStorage.getItem("theme")!!);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
