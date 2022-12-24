import Head from "next/head";
import Header from "../components/Header";
import {
  doc,
  getFirestore,
  deleteDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../provider/UserProvider";
import Router from "next/router";
import Link from "../components/Link";
import AddLinkForm from "../components/AddLinkForm";
import { User } from "firebase/auth";

const db = getFirestore(firebaseApp);

export default function Home() {
  // useState
  const [links, setLinks] = useState<Array<{ name: string; url: string }>>([]);
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

  useEffect(() => {
    if (user?.uid) {
      const unsub = onSnapshot(
        collection(db, "users", user.uid, "links"),
        (querySnapshot) => {
          const cities: Array<{ name: string; url: string }> = [];

          querySnapshot.forEach((doc) => {
            cities.push({ name: doc.data().name, url: doc.data().url });
          });
          setLinks(cities);
        }
      );

      return () => unsub();
    }
    return;
  }, [user]);

  // functions
  const deleteLink = async (name: string) => {
    await deleteDoc(doc(db, "users", user?.uid!!, "links", name));
  };

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
            className="w-36 bg-zinc-900 text-white p-2 rounded-md"
          >
            Add Link
          </button>
          {showAddLinkForm && (
            <AddLinkForm setShowAddLinkForm={setShowAddLinkForm} />
          )}
          <div className="grid gap-2 grid-cols-auto-240">
            {links.map((link) => (
              <Link
                key={link.name}
                name={link.name}
                url={link.url}
                deleteLink={deleteLink}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
