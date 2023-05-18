"use client";
import { uploadFile } from "../../../firebase/firebase";
import { useState } from "react";

const Upload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (file) {
      await uploadFile(file);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Upload;
