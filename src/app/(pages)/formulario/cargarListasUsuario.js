"use client";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

const cargarListasUsuario = async (uid) => {
  const listasCollectionRef = collection(db, "listas");
  const q = query(listasCollectionRef, where("uid", "==", uid));
  const querySnapshot = await getDocs(q);

  let listas = [];
  querySnapshot.forEach((doc) => {
    listas.push(doc.data());
  });

  return listas;
};

export default cargarListasUsuario;
