// ObtenerDatos.js

import { useEffect, useState } from "react";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/firebase/useAuth";

export const useObtenerDatos = (usuario) => {
  const [urls, setUrls] = useState([]);
  const [listaNombre, setListaNombre] = useState("");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        if (usuario) {
          const q = query(
            collection(db, "listas"),
            where("uid", "==", usuario.uid)
          );

          const querySnapshot = await getDocs(q);

          const datos = [];
          querySnapshot.forEach((doc) => {
            datos.push({ id: doc.id, ...doc.data() });
          });
          if (datos.length === 0) {
            console.log("No hay datos");
          } else {
            const userUrls = datos[0].urls;
            const userListaNombre = datos[0].nombreLista;
            setUrls(userUrls);
            setListaNombre(userListaNombre);
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    obtenerDatos();
  }, [usuario]);

  return { urls, listaNombre };
};
