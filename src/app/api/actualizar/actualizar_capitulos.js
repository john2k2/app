const os = require("os");
const fs = require("fs");
const axios = require("axios");
const { URL } = require("url");
const cheerio = require("cheerio");
const exp = require("constants");

const uid = process.argv[2] + ".json";

function limpiarTexto(texto) {
  // Limpia el texto eliminando los símbolos no deseados
  const textoLimpio = texto.replace(/[^\w\s]/g, "");
  return textoLimpio.trim();
}

async function obtenerCapitulos(url) {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const chapters = $("li.row").slice(0, 4);
      const capitulos = [];
      chapters.each((index, element) => {
        const nombreCap = limpiarTexto($(element).find("h4").text());
        const link = new URL($(element).find("a").attr("href"), url).href;
        capitulos.push({ capitulo: nombreCap, url: link, leido: false });
      });
      return capitulos;
    } else {
      console.log(`Error al realizar la solicitud HTTP a la URL: ${url}`);
      return [];
    }
  } catch (e) {
    console.log(`Error al realizar la solicitud HTTP a la URL: ${url}`);
    console.log(`Error: ${e.message}`);
    return [];
  }
}

async function obtenerAnimes(urls) {
  const animes = {};
  const capitulos = [];

  for (const url of urls) {
    try {
      const chapters = await obtenerCapitulos(url);
      if (chapters.length > 0) {
        const response = await axios.get(url);
        if (response.status === 200) {
          const $ = cheerio.load(response.data);
          const titulo = $("h1");
          const imagen = $("div.media-left.cover-detail");

          const baseUrl = response.config.url;
          const nombre = limpiarTexto($(titulo[0]).text());
          const imagenUrl = new URL(
            $(imagen[0]).find("img").attr("src"),
            baseUrl
          ).href;

          if (animes[nombre]) {
            // Actualizar los capítulos existentes
            const anime = animes[nombre];
            for (const chapter of chapters) {
              if (!anime.link.some((c) => c.capitulo === chapter.capitulo)) {
                anime.link.unshift(chapter);
              }
            }
          } else {
            animes[nombre] = {
              nombre: nombre,
              imagenUrl: imagenUrl,
              link: chapters,
            };
          }

          capitulos.push({
            id: capitulos.length + 2,
            imagenUrl: imagenUrl,
            nombre: nombre,
            link: chapters,
          });
        }
      }
    } catch (e) {
      console.log(`Error al realizar la solicitud HTTP a la URL: ${url}`);
      console.log(`Error: ${e.message}`);
    }
  }

  return [animes, capitulos];
}

function cargarResultados() {
  if (!fs.existsSync(uid) || fs.statSync(uid).size === 0) {
    return [[], 0];
  } else {
    const capitulos = require(`./${uid}`);
    const ultimoId = capitulos.reduce((maxId, c) => Math.max(maxId, c.id), 0);
    return [capitulos, ultimoId];
  }
}

function actualizarResultados(capitulos) {
  fs.writeFileSync(uid, JSON.stringify(capitulos, null, 4));
  console.log("Resultados guardados en resultados.json");
}

async function main() {
  const urls = [
    "https://www.leercapitulo.com/manga/c4kt5e/tengoku-daimakyo/",
    "https://www.leercapitulo.com/manga/5d4b5e/one-piece/",
    "https://www.leercapitulo.com/manga/5q8ord/boku-no-kokoro-no-yabai-yatsu/",
  ];

  const [animes, capitulos] = await obtenerAnimes(urls);
  const [resultadosCapitulos, ultimoId] = cargarResultados();

  // Actualizar los capítulos existentes con los nuevos enlaces
  for (const anime of resultadosCapitulos) {
    const nombre = anime.nombre;
    if (nombre in animes) {
      anime.link.push(
        ...animes[nombre].link.filter(
          (c) => !anime.link.some((ac) => ac.capitulo === c.capitulo)
        )
      );
    }
  }

  // Agregar los nuevos capítulos a los resultados existentes
  const nuevosCapitulos = capitulos.filter((c) => c.id > ultimoId);
  resultadosCapitulos.push(...nuevosCapitulos);

  actualizarResultados(resultadosCapitulos);
}

main();
