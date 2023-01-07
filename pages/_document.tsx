import { Head, Html, Main, NextScript } from "next/document";
import { useContext } from "react";
import { ThemeContext } from "../provider/ThemeProvider";

export default function Document() {
  const { theme } = useContext(ThemeContext);

  return (
    <Html lang="en">
      <Head />
      <body className={theme}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
