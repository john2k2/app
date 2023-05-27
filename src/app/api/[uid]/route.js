import { URL } from "url";
import cheerio from "cheerio";
import axios from "axios";
import { doc, setDoc, arrayUnion, collection, db } from "firebase/firestore";

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

async function actualizarResultadosFirebase(mangas, listaNombre, uid) {
  try {
    const listaCollectionRef = collection(db, "mangas");
    const listaDocRef = doc(listaCollectionRef, uid, listaNombre);

    for (const manga of mangas) {
      if (manga.imagenUrl !== undefined) {
        await setDoc(listaDocRef, manga, { merge: true });
      } else {
        console.log(`Error: imagenUrl de ${manga.nombre} es undefined`);
      }
    }
    console.log(
      `Resultados guardados en Firebase para el usuario ${uid} en la lista ${listaNombre}`
    );
  } catch (error) {
    console.log(
      `Error al guardar los resultados en Firebase para el usuario ${uid} en la lista ${listaNombre}`
    );
    console.log(`Error: ${error.message}`);
  }
}

async function main(uid, urlsListas, nombresListas) {
  for (let i = 0; i < urlsListas.length; i++) {
    const urls = urlsListas[i];
    const listaNombre = nombresListas[i];

    const [animes, capitulos] = await obtenerAnimes(urls);
    const resultadosCapitulos = [];

    for (const anime of animes) {
      const nombre = anime.nombre;
      const imagenUrl = anime.imagenUrl;
      const link = [];

      for (const chapter of capitulos) {
        if (!anime.link.some((link) => link.url === chapter.url)) {
          link.push(chapter);
        }
      }

      const manga = {
        imagenUrl: imagenUrl,
        nombre: nombre,
        link: link,
      };

      resultadosCapitulos.push(manga);
    }

    await actualizarResultadosFirebase(resultadosCapitulos, listaNombre, uid);
  }
}

export async function POST(request, { params }) {
  const uid = params.uid;
  const { urlsListas, nombresListas } = (await request.json()) || [];
  const uniqueUrlsListas = urlsListas.map((urls) =>
    urls.filter((url, index) => urls.indexOf(url) === index)
  );

  console.log("params:", params);
  console.log("uid:", uid);
  console.log("urls:", urlsListas);
  console.log("nombres:", nombresListas);

  await main(uid, uniqueUrlsListas, nombresListas);

  return {
    status: 200,
    body: { uid, urls: uniqueUrlsListas, listaNombre: nombresListas },
  };
}
