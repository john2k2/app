"use client";

import React, { useState, useEffect } from "react";

const Main = () => {
  const [animes, setAnimes] = useState([]);

  const marcarComoLeido = (animeId, capituloId) => {
    const updatedAnimes = animes.map((anime) => {
      if (anime.id === animeId) {
        const updatedCapitulos = anime.capitulos.map((capitulo) => {
          if (capitulo.id === capituloId) {
            return { ...capitulo, leido: true };
          }
          return capitulo;
        });
        return { ...anime, capitulos: updatedCapitulos };
      }
      return anime;
    });
    setAnimes(updatedAnimes);
    localStorage.setItem("animes", JSON.stringify(updatedAnimes));
  };

  useEffect(() => {
    // Verificar y cargar el estado de leído desde el localStorage
    const animesFromLocalStorage = JSON.parse(localStorage.getItem("animes"));
    if (animesFromLocalStorage) {
      setAnimes(animesFromLocalStorage);
    }
  }, []);

  useEffect(() => {
    // Realizar la solicitud HTTP al servidor para obtener los datos
    fetch("http://localhost:3001/")
      .then((response) => response.json())
      .then((data) => setAnimes(data))

      .catch((error) =>
        console.error("Error al obtener los datos del servidor:", error)
      );
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
                <li key={capitulo.capitulo}>
                  <a
                    href={capitulo.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-sm text left font-medium transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 ${
                      capitulo.leido ? "text-red-500" : "text-green-500"
                    }`}
                    onClick={() => marcarComoLeido(anime.id, capitulo.id)}
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
