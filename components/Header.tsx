import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";
import firebaseApp from "../firebase/firebase";
import Image from "next/image";
import { UserContext, UserUpdateContext } from "../provider/UserProvider";

const auth = getAuth(firebaseApp);

const Header = () => {
  const user = useContext(UserContext);
  const updateUser = useContext(UserUpdateContext);

  const signOut = async () => {
    await auth.signOut();
    updateUser(null);
    Router.push("/auth");
  };

  return (
    <div className="bg-blue-300 h-12 flex justify-between p-2">
      <h1 className="text-2xl ">Desktop</h1>
      <div className="flex gap-4">
        <p>{user?.displayName}</p>
        <Image
          src={user?.photoURL!!}
          width={32}
          height={32}
          alt={"user photo"}
        />
        <button onClick={signOut}>sign out</button>
      </div>
    </div>
  );
};
export default Header;
