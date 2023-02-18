import Head from "next/head";
import Header from "../components/Header";
import { useContext, useEffect } from "react";
import Links from "../components/Links";
import { ThemeContext } from "../provider/ThemeProvider";
import { useUser } from "@supabase/auth-helpers-react";
import Router from "next/router";

export default function Home() {
  // useContext
  const user = useUser();
  const { theme, setTheme } = useContext(ThemeContext);

  // useEffect
  useEffect(() => {
    const localStorageTheme = localStorage.getItem("theme");

    if (localStorageTheme) {
      setTheme(localStorageTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!user) {
      Router.push("/auth");
    }
  }, []);

  return (
    <div className={theme}>
      <Head>
        <title>Dezktop</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="text-cotent">
        <Header />
        <div className="p-2 gap-2 flex flex-col pt-12">
          <Links />
        </div>
      </main>
    </div>
  );
}
