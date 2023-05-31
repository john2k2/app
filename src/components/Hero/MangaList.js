import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import AnimeItem from "./AnimeItem";
import { useAuth } from "@/firebase/useAuth";

const MangaList = ({ listaSeleccionada }) => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const usuario = useAuth();

  console.log(mangas);

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        if (usuario && usuario.uid && listaSeleccionada) {
          const q = query(
            collection(db, "mangas"),
            where("listaNombre", "==", listaSeleccionada)
          );
          const querySnapshot = await getDocs(q);
          const mangasData = querySnapshot.docs.map((doc) => doc.data());
          setMangas(mangasData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al obtener los mangas:", error);
      }
    };

    fetchMangas();
  }, [usuario, listaSeleccionada]);

  if (loading) {
    return <p>Cargando mangas...</p>;
  }

  return (
    <div>
      {mangas.map((manga) => (
        <AnimeItem key={manga.nombre} manga={manga} />
      ))}
    </div>
  );
};

export default MangaList;
