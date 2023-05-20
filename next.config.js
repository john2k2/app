// next.config.js

module.exports = {
  async rewrites() {
    return [
      {
        source: "/@/:username", // Ruta a redirigir, donde ":username" es un parámetro dinámico
        destination: "/users/:username", // Ruta destino de la redirección
      },
    ];
  },
};
