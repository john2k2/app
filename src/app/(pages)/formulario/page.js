"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, setDoc } from "firebase/firestore"; // Importa 'doc' y 'setDoc'
import { db, auth } from "@/firebase/firebase";

const GuardarListaForm = () => {
  const [nombreLista, setNombreLista] = useState("");
  const [urls, setUrls] = useState([""]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user.uid);
        console.log("Usuario:", user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const guardarLista = async () => {
    if (urls.every(validarUrl)) {
      try {
        const listaData = {
          uid: user,
          nombreLista,
          urls,
        };

        // Usa 'setDoc' en lugar de 'addDoc', y usa el nombreLista como el ID del documento
        await setDoc(doc(db, `${user}/${nombreLista}`), listaData);
        console.log("Lista guardada con nombre:", nombreLista);
      } catch (error) {
        console.error("Error al guardar la lista:", error);
      }
    } else {
      console.error("Alguna URL es inválida");
    }
  };

  const agregarUrl = () => {
    if (urls.length < 5) {
      setUrls((prevUrls) => [...prevUrls, ""]);
    }
  };

  const eliminarUrl = (index) => {
    if (urls.length > 1) {
      setUrls((prevUrls) => prevUrls.filter((url, i) => i !== index));
    }
  };

  const handleUrlChange = (index, newUrl) => {
    setUrls((prevUrls) =>
      prevUrls.map((url, i) => (i === index ? newUrl : url))
    );
  };

  const validarUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[80vh] bg-gray-900">
      <input
        className="border-2 border-gray-300 rounded-md p-2 m-2 w-1/2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        type="text"
        placeholder="Nombre de la Lista"
        value={nombreLista}
        onChange={(e) => setNombreLista(e.target.value)}
      />
      {urls.map((url, index) => (
        <div key={index} className="flex items-center">
          <input
            className="border-2 border-gray-300 rounded-md p-2 m-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            type="text"
            placeholder="URL del anime"
            value={url}
            onChange={(e) => handleUrlChange(index, e.target.value)}
          />
          {index === urls.length - 1 && <button onClick={agregarUrl}>+</button>}
          {index !== urls.length - 1 && (
            <button onClick={() => eliminarUrl(index)}>X</button>
          )}
        </div>
      ))}
      <button
        className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
        onClick={guardarLista}
      >
        Guardar Lista
      </button>
    </div>
  );
};

export default GuardarListaForm;
