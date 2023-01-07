import "../styles/globals.css";
import type { AppProps } from "next/app";
import UserProvider from "../provider/UserProvider";
import ThemeProvider from "../provider/ThemeProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </UserProvider>
  );
}
