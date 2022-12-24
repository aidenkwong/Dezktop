import { User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { firebaseAuth } from "../firebase/firebase";

export const UserContext = createContext(firebaseAuth.currentUser);
export const UserUpdateContext = createContext((user: User | null) => {});

const UserProvider = ({ children }: any) => {
  // useState
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);

  // useEffect
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(authStateChanged);

    return () => unsubscribe();
  }, []);

  // functions
  const authStateChanged = async (user: any) => {
    if (!user) {
      setUser(null);
      localStorage.removeItem("user");

      return;
    }
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };
  const updateUser = (user: User | null) => {
    setUser(user);
  };

  return (
    <UserContext.Provider value={user}>
      <UserUpdateContext.Provider value={updateUser}>
        {children}
      </UserUpdateContext.Provider>
    </UserContext.Provider>
  );
};

export default UserProvider;
