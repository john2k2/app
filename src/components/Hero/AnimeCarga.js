import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

const AnimeCarga = (usuario) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItemsFromFirestore = async () => {
      try {
        if (usuario && usuario.uid) {
          const docRef = doc(db, usuario.uid, usuario.uid);
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            const itemsData = docSnapshot.data().items;
            setItems(itemsData);
          } else {
            setItems([]);
          }
        } else {
          setItems([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos de Firestore:", error);
      }
    };

    setLoading(true);
    loadItemsFromFirestore();
  }, [usuario]);

  return [items, loading];
};

export default AnimeCarga;
