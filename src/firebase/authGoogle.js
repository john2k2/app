import { signInWithGoogle, signOutUser, auth } from "./firebase";
import { useState, useEffect } from "react";
import { Link } from "@mui/material";

const authGoogle = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar el estado de autenticación al cargar la página
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    // Limpieza del efecto
    return () => unsubscribe();
  }, []);

  const handleAuthGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error) {
      // Manejo de errores
      console.error("Error al autenticar con Google:", error);
    }
  };

  const handleSignOut = () => {
    try {
      signOutUser();
      setUser(null);
    } catch (error) {
      // Manejo de errores
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div
      className="
      flex "
    >
      {user ? (
        <>
          <Link href="/">
            <img
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                overflow: "hidden",
                margin: "0 10px",
                boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.5)",
              }}
              src={user.photoURL}
              alt={user.displayName}
            />
          </Link>
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      ) : (
        <button
          className="
          bg-blue-500
          hover:bg-blue-700
          text-white
          font-bold
          py-2
          px-4
          rounded
          "
          onClick={handleAuthGoogle}
        >
          Sign In
        </button>
      )}
    </div>
  );
};

export default authGoogle;
