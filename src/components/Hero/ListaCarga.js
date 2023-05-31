import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useAuth } from "@/firebase/useAuth";

const ListaCarga = () => {
  const usuario = useAuth();
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarListas = async () => {
      try {
        if (usuario && usuario.uid) {
          const db = getFirestore();
          const q = query(
            collection(db, "listas"),
            where("uid", "==", usuario.uid)
          );
          const querySnapshot = await getDocs(q);
          const listasUsuario = [];
          querySnapshot.forEach((doc) => {
            listasUsuario.push({
              id: doc.id,
              nombreLista: doc.data().nombreLista,
            });
          });
          setListas(listasUsuario);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    setLoading(true);
    setListas([]);
    cargarListas();
  }, [usuario]);

  return [listas, loading];
};

export default ListaCarga;
