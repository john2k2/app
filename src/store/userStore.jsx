import create from "zustand";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";

export const useUserStore = create((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser }),
}));

export const UserProvider = ({ children }) => {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, [setUser]);

  return <>{children}</>;
};
