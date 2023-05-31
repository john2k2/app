import React, { useState, useEffect } from "react";
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  db,
} from "@/firebase/firebase";
import AnimeItem from "./AnimeItem";
import { useAuth } from "@/firebase/useAuth";

const MangaList = ({ listaSeleccionada }) => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const usuario = useAuth();

  const deleteMangaIfListDoesNotExist = async (
    usuario,
    mangaDocId,
    listaNombre
  ) => {
    try {
      const listaQuery = query(
        collection(db, "listas"),
        where("nombreLista", "==", listaNombre),
        where("uid", "==", usuario.uid)
      );

      const listaSnapshot = await getDocs(listaQuery);

      // Si no existe la lista correspondiente, se elimina el manga.
      if (listaSnapshot.empty) {
        const mangaRef = doc(db, "mangas", mangaDocId);
        await deleteDoc(mangaRef);
      }
    } catch (error) {
      console.error("Error al eliminar manga:", error);
    }
  };

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        if (usuario && usuario.uid && listaSeleccionada) {
          const q = query(
            collection(db, "mangas"),
            where("listaNombre", "==", listaSeleccionada)
          );
          const querySnapshot = await getDocs(q);
          const mangasData = querySnapshot.docs.map((doc) => {
            return {
              id: doc.id, // Añadir el id del documento
              ...doc.data(),
            };
          });
          setMangas(mangasData);
          setLoading(false);

          // Para cada manga, verifica si la lista todavía existe
          for (let manga of mangasData) {
            await deleteMangaIfListDoesNotExist(
              usuario,
              manga.id,
              manga.listaNombre
            );
          }
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-[1200px] mx-auto">
      {mangas.map((manga) => (
        <AnimeItem key={manga.nombre} manga={manga} />
      ))}
    </div>
  );
};

export default MangaList;
