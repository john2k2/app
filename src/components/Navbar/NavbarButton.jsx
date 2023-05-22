import { useState, useEffect } from "react";
import { useObtenerDatos } from "./ObtenerDatos";

export const useActualizarCapitulos = (usuario) => {
  const { urls } = useObtenerDatos(usuario);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [nuevoCapitulo, setNuevoCapitulo] = useState(false);

  const actualizarCapitulos = () => {
    setCargando(true);
    setMensaje("");
    fetch(`/api/${usuario.uid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la llamada a la API");
        }
        return response.json();
      })
      .then((data) => {
        setCargando(false);
        setNuevoCapitulo(data.nuevoCapitulo);
        if (data.nuevoCapitulo) {
          setMensaje("¡Nuevo capítulo disponible!");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setCargando(false);
      });
  };

  useEffect(() => {
    if (usuario && usuario.uid && urls) {
      actualizarCapitulos();
    }
  }, [usuario, urls]);

  return { cargando, mensaje, nuevoCapitulo, actualizarCapitulos };
};
