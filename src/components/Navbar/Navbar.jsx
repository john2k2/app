"use client";

import React from "react";
import { VscLoading } from "react-icons/vsc";
import { useActualizarCapitulos } from "@/components/Navbar/NavbarButton";
import AuthGoogle from "@/firebase/authGoogle";
import Link from "next/link";
import { useAuth } from "@/firebase/useAuth";

const Navbar = () => {
  const usuario = useAuth();

  if (usuario === undefined) return null;

  const { cargando, mensaje, nuevoCapitulo, actualizarCapitulos, error } =
    useActualizarCapitulos(usuario);

  const handleClick = () => {
    actualizarCapitulos();
  };

  return (
    <>
      <nav className="flex justify-between items-center py-4 px-10 bg-gray-800 text-gray-100 shadow-sm font-mono sticky top-0 z-50">
        <h1 className="text-3xl font-bold text-white cursor-pointer">
          Anime App
        </h1>
        <li>
          <Link href="/" className="p-3">
            Inicio
          </Link>
        </li>
        <li>
          <Link href="/formulario" className="p-3">
            Listas
          </Link>
        </li>
        <div className="actualizar">
          {usuario && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleClick}
              disabled={cargando}
            >
              {cargando ? (
                <VscLoading className="animate-spin" />
              ) : (
                "Actualizar"
              )}
            </button>
          )}
          {mensaje && <p>{mensaje}</p>}
        </div>
        <AuthGoogle />
      </nav>
    </>
  );
};

export default Navbar;
