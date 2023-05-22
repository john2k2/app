"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/firebase/useAuth";

const GuardarListaForm = () => {
  const [nombreLista, setNombreLista] = useState("");
  const [urls, setUrls] = useState([""]);
  const [listas, setListas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const usuario = useAuth();

  useEffect(() => {
    const getListas = async () => {
      try {
        if (usuario) {
          const querySnapshot = await getDocs(collection(db, "listas"));
          const listasData = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((lista) => lista.uid === usuario.uid);
          setListas(listasData);
        }
      } catch (error) {
        console.error("Error al obtener las listas:", error);
      }
    };

    getListas();
  }, [usuario]);

  const guardarLista = async () => {
    if (urls.every(validarUrl)) {
      try {
        const listaData = {
          uid: usuario?.uid,
          nombreLista,
          urls,
        };

        if (listaSeleccionada) {
          const listaRef = doc(db, "listas", listaSeleccionada);
          await updateDoc(listaRef, listaData);
          console.log("Lista actualizada con nombre:", nombreLista);
        } else {
          const listasCollectionRef = collection(db, "listas");
          const docRef = await addDoc(listasCollectionRef, listaData);
          const nuevaLista = {
            id: docRef.id,
            ...listaData,
          };
          setListas((prevListas) => [...prevListas, nuevaLista]);
          console.log("Lista guardada con nombre:", nombreLista);
        }

        resetForm();
      } catch (error) {
        console.error("Error al guardar la lista:", error);
      }
    } else {
      console.error("Alguna URL es inválida");
    }
  };

  const eliminarLista = async (listaId) => {
    try {
      const listaRef = doc(db, "listas", listaId);
      await deleteDoc(listaRef);
      console.log("Lista eliminada con ID:", listaId);
      setListas(listas.filter((lista) => lista.id !== listaId));
      if (listaSeleccionada === listaId) {
        resetForm();
      }
      if (listas.length === 1) {
        resetForm();
      }
    } catch (error) {
      console.error("Error al eliminar la lista:", error);
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

  const seleccionarLista = (lista) => {
    setListaSeleccionada(lista.id);
    setNombreLista(lista.nombreLista);
    setUrls(lista.urls);
  };

  const resetForm = () => {
    setListaSeleccionada(null);
    setNombreLista("");
    setUrls([""]);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/4 bg-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Listas Creadas</h3>
        {usuario && (
          <>
            {listas.length === 0 ? (
              <p>No tienes ninguna lista</p>
            ) : (
              listas.map((lista) => (
                <div
                  key={lista.id}
                  className={`flex items-center py-2 hover:bg-gray-100 cursor-pointer ${
                    lista.id === listaSeleccionada ? "bg-gray-300" : ""
                  }`}
                  onClick={() => seleccionarLista(lista)}
                >
                  <span className="mr-2">{lista.nombreLista}</span>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => eliminarLista(lista.id)}
                  >
                    X
                  </button>
                </div>
              ))
            )}
          </>
        )}
        <button
          className="bg-green-500 text-white font-semibold py-2 px-4 mt-4 rounded-md hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
          onClick={resetForm}
        >
          Crear Nueva Lista
        </button>
      </div>
      <div className="w-full md:w-3/4 flex flex-col justify-center items-center bg-gray-900 p-8">
        <input
          className="border-2 border-gray-300 rounded-md p-2 m-2 w-full md:w-1/2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          type="text"
          placeholder="Nombre de la Lista"
          value={nombreLista}
          onChange={(e) => setNombreLista(e.target.value)}
        />
        {urls.map((url, index) => (
          <div key={index} className="flex items-center">
            <input
              className="border-2 border-gray-300 rounded-md p-2 m-2 w-full md:w-2/3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              type="text"
              placeholder="URL del anime"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
            />
            {index === urls.length - 1 && (
              <button
                className="bg-purple-600 text-white rounded-md px-2 ml-2 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
                onClick={agregarUrl}
              >
                +
              </button>
            )}
            {index !== urls.length - 1 && (
              <button
                className="text-red-500 hover:text-red-700 rounded-md px-2 ml-2 focus:outline-none"
                onClick={() => eliminarUrl(index)}
              >
                X
              </button>
            )}
          </div>
        ))}
        <button
          className="bg-purple-600 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
          onClick={guardarLista}
        >
          {listaSeleccionada ? "Actualizar Lista" : "Guardar Lista"}
        </button>
      </div>
    </div>
  );
};

export default GuardarListaForm;
