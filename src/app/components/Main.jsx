"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

const Main = () => {
  const [animes, setAnimes] = useState([]);

  const marcarComoLeido = async (animeId, linkId) => {
    const updatedAnimes = animes.map((anime) => {
      if (anime.link === animeId) {
        const updatedCapitulos = anime.link.map((link) => {
          if (link.id === linkId) {
            return { ...link, leido: true };
          }
          return capitulo;
        });
        return { ...anime, link: updatedCapitulos };
      }
      return anime;
    });
    setAnimes(updatedAnimes);

    const animeDocRef = doc(db, "nombre_de_la_coleccion", animeId);
    await updateDoc(animeDocRef, {
      link: updatedAnimes.find((anime) => anime.id === animeId).link,
    });
  };

  console.log(animes.map((anime) => anime.link));

  useEffect(() => {
    const loadAnimesFromFirestore = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "nombre_de_la_coleccion")
        );
        const animeData = querySnapshot.docs[0].data().data;
        setAnimes(animeData);
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    loadAnimesFromFirestore();
  }, []);

  return (
    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-items-center gap-4">
      {animes.map((anime) => (
        <div className="mt-8" key={anime.id}>
          <img
            src={anime.imagen_url}
            alt={anime.nombre}
            className="w-48 h-auto hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
          />
          <h2 className="text-xl font-bold mt-4 w-52 text-left overflow-hidden whitespace-nowrap overflow-ellipsis hover:whitespace-normal hover:overflow-visible">
            {anime.nombre}
          </h2>
          <div className="w-52 mb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-hover:shadow-lg scrollbar-track-hover:shadow-lg transition duration-300 ease-in-out">
            <ul>
              {anime.link.map((capitulo) => (
                <li key={capitulo.id}>
                  <a
                    href={capitulo.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-sm text left font-medium transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 ${
                      capitulo.leido ? "text-red-500" : "text-green-500"
                    }`}
                    onClick={() => marcarComoLeido(anime.link)}
                  >
                    {capitulo.capitulo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Main;
