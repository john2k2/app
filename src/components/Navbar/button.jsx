import { useState } from "react";

export default function EjecutarCrawler() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);

    const uid = "resultados.json";

    fetch("/api/ejecutar-crawler", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Crawler ejecutado exitosamente:", data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al ejecutar el crawler:", error);
        setLoading(false);
      });
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Cargando..." : "Ejecutar Crawler"}
      </button>
    </div>
  );
}
