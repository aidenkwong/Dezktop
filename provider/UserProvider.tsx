import { User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { firebaseAuth } from "../firebase/firebase";

export const UserContext = createContext({
  user: firebaseAuth.currentUser,
  setUser: (_user: User | null) => {},
});
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

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
