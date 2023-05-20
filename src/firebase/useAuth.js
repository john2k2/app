"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase/firebase";

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUsuario(user);
      } else {
        setUsuario(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return usuario;
};
