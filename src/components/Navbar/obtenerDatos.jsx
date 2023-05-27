import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useEffect, useState } from "react";

export const useObtenerDatos = (usuario) => {
  const [listas, setListas] = useState([]);

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
            setListas(datos); // Aquí estableces el estado de `listas`
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    obtenerDatos();
  }, [usuario]);

  return { listas }; // Aquí retornas `listas` desde el hook
};
