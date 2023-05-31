"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import AnimeItem from "./AnimeItem";

const MangaList = () => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "mangas"));
        const mangasData = querySnapshot.docs.map((doc) => doc.data());
        setMangas(mangasData);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los mangas:", error);
      }
    };

    fetchMangas();
  }, []);

  if (loading) {
    return <p>Cargando mangas...</p>;
  }

  return (
    <div>
      {mangas.map((manga) => (
        <AnimeItem key={manga.nombre} mangas={manga} />
      ))}
    </div>
  );
};

export default MangaList;
