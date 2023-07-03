import { useState, useMemo, useCallback } from "react";
import { useObtenerDatos } from "@/components/Navbar/obtenerDatos";
import axios from "axios";

export const useActualizarCapitulos = (usuario) => {
  const { listas } = useObtenerDatos(usuario);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [nuevoCapitulo, setNuevoCapitulo] = useState(false);
  const [error, setError] = useState(null);

  const actualizarCapitulos = useCallback(async () => {
    if (!usuario?.uid) {
      setError("El usuario no está definido o no tiene una ID válida.");
      return;
    }

    setCargando(true);
    setMensaje("");
    setError(null);

    try {
      const promesas = listas.map((lista) => {
        const data = {
          uid: usuario.uid,
          urls: lista.urls,
          listaNombre: lista.nombreLista,
        };

        return axios.post("http://127.0.0.1:5000/api/mangas", data);
      });

      const respuestas = await Promise.all(promesas);

      let nuevasActualizaciones = false;
      respuestas.forEach((response) => {
        if (response.data.nuevoCapitulo) {
          nuevasActualizaciones = true;
        }
      });

      setCargando(false);
      setNuevoCapitulo(nuevasActualizaciones);

      if (nuevasActualizaciones) {
        setMensaje("¡Nuevo capítulo disponible!");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
      setCargando(false);
    }
  }, [usuario, listas]);

  return { cargando, mensaje, nuevoCapitulo, actualizarCapitulos, error };
};
