"use client";
import React, { useState } from "react";
import ListaSeleccionada from "./ListaSeleccionada";
import MangaList from "./MangaList";
import AnimeItem from "./AnimeItem";
import { useAuth } from "@/firebase/useAuth";

const Main = () => {
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const usuario = useAuth();

  return (
    <>
      {!usuario && <p>Debes iniciar sesión para ver tus datos</p>}

      {usuario && (
        <>
          <h1>Selecciona una lista:</h1>
          <ListaSeleccionada setListaSeleccionada={setListaSeleccionada} />

          {listaSeleccionada ? (
            <>
              <h2>Mangas de la lista seleccionada:</h2>
              <MangaList listaSeleccionada={listaSeleccionada} />
            </>
          ) : (
            <p>Selecciona una lista para ver los mangas</p>
          )}
        </>
      )}
    </>
  );
};

export default Main;
