import { useState, useEffect } from "react";
import { useObtenerDatos } from "./ObtenerDatos";
import { set } from "react-hook-form";

export const useActualizarCapitulos = (usuario) => {
  const { listas } = useObtenerDatos(usuario);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [nuevoCapitulo, setNuevoCapitulo] = useState(false);
  const [nombresListas, setNombresListas] = useState([]);
  const [urlsListas, setUrlsListas] = useState([]);

  console.log("listas", listas);

  useEffect(() => {
    const nombresTemp = [];
    const urlsTemp = [];

    listas.forEach((lista) => {
      nombresTemp.push(lista.nombreLista);
      urlsTemp.push(lista.urls);
    });

    setNombresListas(nombresTemp);
    setUrlsListas(urlsTemp);
  }, [listas]);

  const actualizarCapitulos = () => {
    setCargando(true);
    setMensaje("");
    fetch(`/api/${usuario.uid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usuario, nombresListas, urlsListas }),
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
    if (usuario && usuario.uid) {
      actualizarCapitulos();
    }
  }, [usuario]);

  return { cargando, mensaje, nuevoCapitulo, actualizarCapitulos };
};
