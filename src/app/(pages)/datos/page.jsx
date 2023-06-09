"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/firebase/useAuth";

const ObtenerDatos = () => {
  const [listas, setListas] = useState([]);
  const usuario = useAuth();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        if (usuario) {
          const q = query(
            collection(db, "listas"),
            where("uid", "==", usuario.uid)
          );

          const querySnapshot = await getDocs(q);

          const listasData = [];
          querySnapshot.forEach((doc) => {
            listasData.push({ id: doc.id, ...doc.data() });
          });
          if (listasData.length === 0) {
            console.log("No hay datos");
          } else {
            setListas(listasData);
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    obtenerDatos();
  }, [usuario]);

  if (!usuario) {
    return null; // Si el usuario no está logueado, no se muestra nada
  }

  return (
    <>
      {listas.map((lista) => (
        <div key={lista.id}>
          <h1>Nombre de la lista: {lista.nombreLista}</h1>
          {lista.urls.map((url) => (
            <p key={url}>{url}</p>
          ))}
        </div>
      ))}
    </>
  );
};

export default ObtenerDatos;
