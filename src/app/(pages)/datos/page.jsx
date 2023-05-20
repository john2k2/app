"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/firebase/useAuth";

const FirestorePage = () => {
  const [urls, setUrls] = useState([]);
  const usuario = useAuth();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        if (usuario) {
          const querySnapshot = await getDocs(
            collection(db, usuario.uid, usuario.uid)
          );

          const datos = [];
          querySnapshot.forEach((doc) => {
            datos.push({ id: doc.id, ...doc.data() });
          });
          if (datos.length === 0) {
            console.log("No hay datos");
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    obtenerDatos();
  }, [usuario]);

  return (
    <>
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-items-center gap-4">
        {animes.map((anime) => (
          <div className="mt-8" key={anime.id}>
            <img
              src={anime.imagenUrl}
              alt={anime.nombre}
              className="w-48 h-auto hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            />
            <h2 className="text-xl font-bold mt-4 w-52 text-left overflow-hidden whitespace-nowrap overflow-ellipsis hover:whitespace-normal hover:overflow-visible">
              {anime.nombre}
            </h2>
            <div className="w-52 mb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-hover:shadow-lg scrollbar-track-hover:shadow-lg transition duration-300 ease-in-out">
              <ul>
                {anime.link.map((link) => (
                  <li
                    key={link.id}
                    className="text-left text-sm font-semibold text-gray-500 hover:text-gray-900 transition duration-300 ease-in-out"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <span
                        className={`${
                          link.leido ? "bg-green-500" : "bg-red-500"
                        } w-2 h-2 rounded-full mr-2`}
                      ></span>
                      {link.capitulo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FirestorePage;
