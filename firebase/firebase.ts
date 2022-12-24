import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebaseApp.config";
import { getAuth } from "firebase/auth";

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
