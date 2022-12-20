import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";

import { useUser } from "@auth0/nextjs-auth0/client";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  return (
    <>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <a href="/api/auth/login">Login</a>
        <a href="/api/auth/logout">Logout</a>
        {user && (
          <div>
            <Image
              src={user.picture!!}
              alt={user.name!!}
              width={96}
              height={96}
            />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        )}
      </main>
    </>
  );
}
