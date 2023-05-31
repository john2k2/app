import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/firebase/useAuth";
import { Link } from "next/link";

const ListasExistentes = () => {
  const [listas, setListas] = useState([]);
  const usuario = useAuth();

  useEffect(() => {
    const obtenerListas = async () => {
      const listasCollectionRef = collection(db, "listas");
      const q = query(listasCollectionRef, where("uid", "==", usuario.uid));
      const querySnapshot = await getDocs(q);
      setListas(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    obtenerListas();
  }, [usuario]);

  return (
    <div>
      {listas.map((lista) => (
        <div key={lista.id}>
          <h2>{lista.nombreLista}</h2>
          {lista.urls.map((url, index) => (
            <p key={index}>{url}</p>
          ))}
          <Link to={`/editar-lista/${lista.id}`}>Editar lista</Link>
        </div>
      ))}
      <Link to="/crear-lista">Crear nueva lista</Link>
    </div>
  );
};

export default ListasExistentes;
