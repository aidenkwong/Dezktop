import Head from "next/head";
import Header from "../components/Header";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../provider/UserProvider";
import Router from "next/router";
import AddLinkForm from "../components/AddLinkForm";
import { User } from "firebase/auth";
import Links from "../components/Links";

export default function Home() {
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);

  // useContext
  const { user, setUser } = useContext(UserContext);

  // useEffect
  useEffect(() => {
    const localStorageUser = localStorage.getItem("user");

    if (!localStorageUser) {
      Router.push("/auth");
    } else {
      setUser(JSON.parse(localStorageUser) as User);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <></>;

  return (
    <>
      <Head>
        <title>Desktop</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <div className="p-2 gap-2 flex flex-col">
          <button
            onClick={() => setShowAddLinkForm(true)}
            className="w-36 bg-zinc-900 text-white p-2 rounded-md hover:text-sky-400"
          >
            Add Link
          </button>
          {showAddLinkForm && (
            <AddLinkForm setShowAddLinkForm={setShowAddLinkForm} />
          )}
          <Links />
        </div>
      </main>
    </>
  );
}
