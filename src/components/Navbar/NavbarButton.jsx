import { useState, useMemo, useCallback } from "react";
import { useObtenerDatos } from "@/components/Navbar/obtenerDatos";

export const useActualizarCapitulos = (usuario) => {
  const { listas } = useObtenerDatos(usuario);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [nuevoCapitulo, setNuevoCapitulo] = useState(false);

  const nombresListas = useMemo(() => {
    return listas.map((lista) => lista.nombreLista);
  }, [listas]);

  const urlsListas = useMemo(() => {
    return listas.map((lista) => lista.urls);
  }, [listas]);

  const actualizarCapitulos = useCallback(() => {
    setCargando(true);
    setMensaje("");
    fetch(`/api/${usuario?.uid}`, {
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
  }, [usuario?.uid, nombresListas, urlsListas]);

  return { cargando, mensaje, nuevoCapitulo, actualizarCapitulos };
};
