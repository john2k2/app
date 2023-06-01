"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";

import MangaList from "./MangaList";
import ListaSeleccionada from "./ListaSeleccionada";

const Main = () => {
  const [mangas, setMangas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState("");


  useEffect(() => {
    const cargarMangas = async () => {
      try {
        const db = getFirestore();
        const q = query(
          collection(db, "mangas"),
          where("listaNombre", "==", listaSeleccionada)
        );
        const querySnapshot = await getDocs(q);
        const mangasUsuario = [];
        querySnapshot.forEach((doc) => {
          mangasUsuario.push(doc.data());
        });
        setMangas(mangasUsuario);
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    if (listaSeleccionada) {
      cargarMangas();
    }
  }, [listaSeleccionada]);

  return (
    <div>
      <ListaSeleccionada setListaSeleccionada={setListaSeleccionada} />
      {listaSeleccionada && <MangaList listaSeleccionada={listaSeleccionada} />}
    </div>
  );
};

export default Main;
