import { URL } from "url";
import cheerio from "cheerio";
import axios from "axios";
import { promises as fs } from "fs";

function limpiarTexto(texto) {
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

          const animeKey = `${nombre}-${imagenUrl}`;
          if (!animes[animeKey]) {
            animes[animeKey] = {
              nombre: nombre,
              imagenUrl: imagenUrl,
              link: [],
            };
          }

          const anime = animes[animeKey];
          for (const chapter of chapters) {
            if (!anime.link.some((link) => link.url === chapter.url)) {
              anime.link.push(chapter);
            }
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

  return [Object.values(animes), capitulos];
}

async function cargarResultados(listaNombre) {
  try {
    const data = await fs.readFile(`${listaNombre}.json`, "utf8");
    if (data && data.length > 0) {
      const capitulos = JSON.parse(data);
      const ultimoId = capitulos.reduce((maxId, c) => Math.max(maxId, c.id), 0);
      return [capitulos, ultimoId];
    }
  } catch (error) {
    console.log(`Error al cargar los resultados desde ${listaNombre}.json`);
  }
  return [[], 0];
}

async function actualizarResultados(capitulos, listaNombre) {
  try {
    await fs.writeFile(
      `${listaNombre}.json`,
      JSON.stringify(capitulos, null, 4),
      "utf8"
    );
    console.log(`Resultados guardados en ${listaNombre}.json`);
  } catch (error) {
    console.log(`Error al guardar los resultados en ${listaNombre}.json`);
  }
}

async function main(uid, urls, listaNombre) {
  const [animes, capitulos] = await obtenerAnimes(urls);
  const [resultadosCapitulos, ultimoId] = await cargarResultados(listaNombre);

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

  await actualizarResultados(resultadosCapitulos, listaNombre);
}

export async function POST(request, { params }) {
  const { uid } = params.uid;
  const { urls } = (await request.json()) || [];
  const listaNombre = params.listaNombre || "lista";
  const uniqueUrls = urls.filter((url, index) => urls.indexOf(url) === index);

  await main(uid, uniqueUrls, listaNombre);

  return {
    status: 200,
    body: { uid, urls: uniqueUrls, listaNombre },
  };
}
