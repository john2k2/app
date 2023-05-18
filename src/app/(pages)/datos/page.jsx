"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";

const FirestorePage = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Verificar el estado de autenticación al cargar la página
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUsuario(user.uid);
        console.log("Usuario:", usuario);
      } else {
        setUsuario(null);
      }
    });
  }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, usuario));
        const datos = [];
        querySnapshot.forEach((doc) => {
          datos.push({ id: doc.id, ...doc.data() });
        });
        console.log("Datos obtenidos:", datos);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    obtenerDatos();
  }, []);

  return <h1>Verifica la consola para ver los datos obtenidos de Firestore</h1>;
};

export default FirestorePage;
