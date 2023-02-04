import Head from "next/head";
import Header from "../components/Header";
import { useContext, useEffect } from "react";
import { UserContext } from "../provider/UserProvider";
import Router from "next/router";
import { User } from "firebase/auth";
import Links from "../components/Links";
import { ThemeContext } from "../provider/ThemeProvider";

export default function Home() {
  // useContext
  const { user, setUser } = useContext(UserContext);
  const { theme, setTheme } = useContext(ThemeContext);

  // useEffect
  useEffect(() => {
    const localStorageUser = localStorage.getItem("user");
    const localStorageTheme = localStorage.getItem("theme");

    if (localStorageTheme) {
      setTheme(localStorageTheme);
    }
    if (!localStorageUser) {
      Router.push("/auth");
    } else {
      setUser(JSON.parse(localStorageUser) as User);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <></>;

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
