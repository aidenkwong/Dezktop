import Head from "next/head";

import Header from "../components/Header";
import {
  doc,
  getFirestore,
  setDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";

import firebaseApp from "../firebase/firebase";
import firebaseAuth from "../firebase/firebaseAuth";
import { useContext, useEffect, useState } from "react";
import { getAuth, User } from "firebase/auth";
import { UserContext, UserUpdateContext } from "../provider/UserProvider";
import Router from "next/router";

export default function Home() {
  const db = getFirestore(firebaseApp);
  const [url, setUrl] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [links, setLinks] = useState<Array<{ name: string; url: string }>>([]);

  const user = useContext(UserContext);
  const updateUser = useContext(UserUpdateContext);

  async function writeUserData(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await setDoc(doc(db, "users", user?.uid!!, "links", name), {
      name,
      url,
    });
  }

  useEffect(() => {
    const localStorageUser = localStorage.getItem("user");
    if (!localStorageUser) {
      Router.push("/auth");
    } else {
      updateUser(JSON.parse(localStorageUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, "users", user?.uid!!, "links"),
      (querySnapshot) => {
        const cities: Array<{ name: string; url: string }> = [];
        querySnapshot.forEach((doc) => {
          cities.push({ name: doc.data().name, url: doc.data().url });
        });
        setLinks(cities);
      }
    );
    return () => unsub();
  }, [user]);

  if (!user) return <></>;
  return (
    <>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <div className="p-2 gap-2 flex flex-col">
          <form onSubmit={(e) => writeUserData(e)}>
            <div className="gap-2 flex">
              <input
                onChange={(e) => setName(e.target.value)}
                className="border-blue-300 border-2 outline-0 p-2"
                placeholder="Enter a name"
              />
              <input
                onChange={(e) => setUrl(e.target.value)}
                className="border-blue-300 border-2 outline-0 p-2"
                placeholder="Enter a URL"
              />
              <button className="border-blue-300 border-2 outline-0 p-2">
                Add
              </button>
            </div>
          </form>
          <div className="grid gap-2 grid-auto-fit">
            {links.map((link) => (
              <a
                href={link.url}
                key={link.name}
                className="border-sky-700 border-2 h-32"
              >
                <div>{link.name}</div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
