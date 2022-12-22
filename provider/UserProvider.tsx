import { User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import firebaseAuth from "../firebase/firebaseAuth";

export const UserContext = createContext(firebaseAuth.currentUser);
export const UserUpdateContext = createContext((user: User | null) => {});

const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);
  const updateUser = (user: User | null) => {
    setUser(user);
  };
  const authStateChanged = async (user: any) => {
    if (!user) {
      setUser(null);
      localStorage.removeItem("user");
      return;
    }
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);
  return (
    <UserContext.Provider value={user}>
      <UserUpdateContext.Provider value={updateUser}>
        {children}
      </UserUpdateContext.Provider>
    </UserContext.Provider>
  );
};
export default UserProvider;
