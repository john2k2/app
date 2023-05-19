"use client";

import { uploadDataToFirestore } from "../../../firebase/firebase";
import { useState } from "react";

const Upload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (file) {
      try {
        const jsonData = await readFileAsync(file);
        await uploadDataToFirestore(jsonData);
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

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Upload;
