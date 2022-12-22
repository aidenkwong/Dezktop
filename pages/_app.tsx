import "../styles/globals.css";
import type { AppProps } from "next/app";
import { createContext, useContext, useState } from "react";
import firebaseAuth from "../firebase/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import Router from "next/router";
import UserProvider from "../provider/UserProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
