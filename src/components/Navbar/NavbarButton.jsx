import { useState, useEffect } from "react";

export const useActualizarCapitulos = (usuario) => {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [nuevoCapitulo, setNuevoCapitulo] = useState(false);

  const actualizarCapitulos = () => {
    setCargando(true);
    setMensaje("");
    fetch(`api/${usuario.uid}`)
      .then((response) => response.json())
      .then((data) => {
        setCargando(false);
        setNuevoCapitulo(data.nuevoCapitulo);
        if (data.nuevoCapitulo) {
          setMensaje("Nuevo capítulo disponible!");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setCargando(false);
      });
  };

  useEffect(() => {
    if (usuario) {
      actualizarCapitulos();
    }
  }, [usuario]);

  return { cargando, mensaje, nuevoCapitulo, actualizarCapitulos };
};
