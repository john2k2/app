"use client";

// Main.js
import React from "react";
import { useAuth } from "@/firebase/useAuth";
import AnimeItem from "./AnimeItem";
import AnimeCarga from "./AnimeCarga";

const Main = () => {
  const usuario = useAuth();
  const [items, loading] = AnimeCarga(usuario);

  if (loading) {
    return <p>Cargando...</p>; // Muestra una indicación de carga mientras se obtienen los datos
  }

  return (
    <>
      {!usuario && <p>Debes iniciar sesión para ver tus datos</p>}

      {usuario && (
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-items-center gap-4">
          {items.length === 0 ? (
            <p>No Tienes Mangas En tu Lista </p>
          ) : (
            items.map((anime) => <AnimeItem anime={anime} key={anime.id} />)
          )}
        </div>
      )}
    </>
  );
};

export default Main;
