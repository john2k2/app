"use client";
import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/firebase/useAuth";

const Upload = () => {
  const usuario = useAuth();
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (file) {
      try {
        const jsonData = await readFileAsync(file);
        const documentName = generateDocumentName(); // Genera el nombre dinámico del documento
        await uploadDataToFirestore(jsonData, documentName);
        console.log("Archivo JSON subido correctamente a Firestore");
      } catch (error) {
        console.error("Error al subir el archivo JSON a Firestore:", error);
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jsonData = JSON.parse(reader.result);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  };

  const generateDocumentName = () => {
    // Genera el nombre dinámico del documento según tus necesidades
    const dynamicValue = usuario.uid; // Valor dinámico para el nombre del documento
    return `${dynamicValue}`;
    //return `documento_${dynamicValue}`; nombre de lista de animes
  };

  const uploadDataToFirestore = async (jsonData, documentName) => {
    try {
      const collectionRef = collection(db, usuario.uid);
      const docRef = doc(collectionRef, documentName);

      const data = {
        // Aquí puedes ajustar la estructura de datos según tus necesidades
        items: jsonData,
      };

      await setDoc(docRef, data);
      console.log("Datos subidos correctamente a Firestore");
    } catch (error) {
      console.error("Error al subir los datos a Firestore:", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Upload;
