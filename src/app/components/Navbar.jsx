"use client";
import React, { useEffect, useState, useContext } from "react";
import { VscLoading } from "react-icons/vsc";
import AuthGoogle from "../../firebase/authGoogle";
import { auth } from "../../firebase/firebase";

const Navbar = () => {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [nuevoCapitulo, setNuevoCapitulo] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Verificar el estado de autenticación al cargar la página
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUsuario(user);
      } else {
        setUsuario(null);
      }
    });
  }, []);

  const actualizarCapitulos = () => {
    setCargando(true);
    setMensaje("");
    fetch(`api/actualizar_capitulos/${usuario.uid}`)
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
  }, []);

  return (
    <nav>
      <div className="logo">
        <h2>Anime App</h2>
      </div>
      <div className="auth">
        <AuthGoogle />
      </div>
      <div className="actualizar">
        {usuario && (
          <button onClick={actualizarCapitulos} disabled={cargando}>
            {cargando ? <VscLoading /> : "Actualizar capítulos"}
          </button>
        )}
        {mensaje && <p>{mensaje}</p>}
      </div>
    </nav>
  );
};

export default Navbar;
