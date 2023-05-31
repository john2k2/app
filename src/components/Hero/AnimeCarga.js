import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/firebase/useAuth";

const AnimeCarga = (props) => {
  const { listaSeleccionada } = props; // Accede a listaSeleccionada desde props
  const usuario = useAuth();
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMangasFromFirestore = async () => {
      try {
        if (usuario && usuario.uid && listaSeleccionada) {
          const docRef = doc(
            db,
            "listas",
            usuario.uid,
            "listas",
            listaSeleccionada
          );
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const mangasData = Object.keys(data).map((mangaKey) => {
              return { id: mangaKey, ...data[mangaKey] };
            });
            console.log(mangasData);
            setMangas(mangasData);
          } else {
            setMangas([]);
          }
        } else {
          setMangas([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    setLoading(true);
    loadMangasFromFirestore();
  }, [usuario, listaSeleccionada]);

  return [mangas, loading];
};

export default AnimeCarga;
