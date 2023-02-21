import Head from "next/head";
import Header from "../components/Header/Header";
import { useEffect } from "react";
import Bookmarks from "../components/Bookmarks/Bookmarks";
import { useThemeContext } from "../provider/ThemeProvider";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Note from "../components/Note/Note";
import Router from "next/router";

export default function Home() {
  const { theme } = useThemeContext();

  const supabase = useSupabaseClient();

  const user = useUser();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.log(error);
      }
      if (!user) {
        Router.push("/auth");
      }
    };

    getUser();
  }, [supabase.auth, user]);

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
        <div className="p-2 gap-2 flex pt-12">
          <Note />
          <Bookmarks />
        </div>
      </main>
    </div>
  );
}
