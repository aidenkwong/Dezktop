import "../styles/globals.css";
import type { AppProps } from "next/app";
import UserProvider from "../provider/UserProvider";
import ThemeProvider from "../provider/ThemeProvider";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [supabase] = useState(() =>
    createBrowserSupabaseClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
    })
  );

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <UserProvider>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </UserProvider>
    </SessionContextProvider>
  );
}
