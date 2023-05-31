import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useAuth } from "@/firebase/useAuth";

const ListaSeleccionada = ({ setListaSeleccionada }) => {
  const [listas, setListas] = useState([]);
  const usuario = useAuth();

  useEffect(() => {
    const cargarListas = async () => {
      try {
        if (usuario && usuario.uid) {
          const db = getFirestore();
          const q = query(
            collection(db, "listas"),
            where("uid", "==", usuario.uid)
          );
          const querySnapshot = await getDocs(q);
          const listasUsuario = [];
          querySnapshot.forEach((doc) => {
            listasUsuario.push({
              id: doc.id,
              nombreLista: doc.data().nombreLista,
            });
          });
          setListas(listasUsuario);
          if (listasUsuario.length > 0) {
            setListaSeleccionada(listasUsuario[0].id);
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    cargarListas();
  }, [usuario, setListaSeleccionada]);

  const cambiarListaSeleccionada = (event) => {
    setListaSeleccionada(event.target.value);
  };

  return (
    <select onChange={cambiarListaSeleccionada}>
      {listas.map((lista) => (
        <option value={lista.id} key={lista.id}>
          {lista.nombreLista}
        </option>
      ))}
    </select>
  );
};

export default ListaSeleccionada;
