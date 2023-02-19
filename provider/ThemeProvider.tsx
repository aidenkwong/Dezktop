import { createContext, useContext, useState, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export const THEME_CONTEXT_DEFAULT = {
  theme: "dark",
  setTheme: (_theme: string) => {},
};

export const ThemeContext = createContext(THEME_CONTEXT_DEFAULT);

export const useThemeContext = () => {
  const supabase = useSupabaseClient();
  const context = useContext(ThemeContext);
  const user = useUser();

  if (!context) {
    throw new Error("useThemeContext used outside ThemeContext provider");
  }

  useEffect(() => {
    if (!context.theme) return;
    localStorage.setItem("theme", context.theme);
    document.body.classList.value =
      "transition-colors ease-in-out duration-200";
    document.body.classList.add(`theme-${context.theme}`);

    (async () => {
      if (!user) return;
      const { data, error } = await supabase.from("user_info").upsert({
        user_id: user.id,
        theme: context.theme,
      });

      if (error) {
        await supabase
          .from("user_info")
          .update({
            theme: context.theme,
          })
          .eq("user_id", user.id);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.theme]);

  return context;
};

const ThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem(`theme`) || "dark"
      : "dark"
  );

  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    const fetchTheme = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("user_info")
        .select("theme")
        .eq("user_id", user?.id)
        .single();

      if (data) setTheme(data.theme);
      if (error) console.error(error);
    };

    fetchTheme();
  }, [supabase, user]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
