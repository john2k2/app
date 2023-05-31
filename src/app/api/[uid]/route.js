import { URL } from "url";
import cheerio from "cheerio";
import axios from "axios";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  db,
} from "@/firebase/firebase";

function limpiarTexto(texto) {
  console.log(`Limpiando texto: ${texto}`);
  const textoLimpio = texto.replace(/[^\w\s]/g, "");
  return textoLimpio.trim();
}

async function obtenerCapitulos(url) {
  try {
    console.log(`Obteniendo capítulos desde la URL: ${url}`);
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
      console.log(`Capítulos obtenidos: ${capitulos}`);
      return capitulos;
    } else {
      console.error(`Error al realizar la solicitud HTTP a la URL: ${url}`);
      return [];
    }
  } catch (e) {
    console.error(`Error al realizar la solicitud HTTP a la URL: ${url}`);
    console.error(`Error: ${e.message}`);
    return [];
  }
}

async function obtenerAnimes(urls, uid) {
  const animes = {};

  for (const url of urls) {
    try {
      console.log(`Obteniendo animes desde la URL: ${url}`);
      const mangaCollectionRef = collection(db, "mangas");
      const docId = `${uid}-${limpiarTexto(url)}`; // Aquí asumimos que la URL es un identificador único para el anime
      const docRef = doc(mangaCollectionRef, docId);
      const docSnap = await getDoc(docRef);

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

          let anime;
          if (docSnap.exists()) {
            anime = {
              nombre: nombre,
              imagenUrl: docSnap.data().imagenUrl,
              link: chapters,
            };
          } else {
            anime = {
              nombre: nombre,
              imagenUrl: imagenUrl,
              link: chapters,
            };
          }

          animes[nombre] = anime;
          console.log(`Anime obtenido: ${anime}`);
        }
      }
    } catch (e) {
      console.error(`Error al obtener animes de la URL: ${url}`);
      console.error(`Error: ${e.message}`);
    }
  }

  return Object.values(animes);
}

async function actualizarResultadosFirebase(mangas, listaNombre, uid) {
  try {
    console.log(
      `Actualizando resultados en Firebase para el usuario ${uid} en la lista ${listaNombre}`
    );
    const mangaCollectionRef = collection(db, "mangas");
    for (const manga of mangas) {
      const docId = `${uid}-${manga.nombre}`;
      const docRef = doc(mangaCollectionRef, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Aquí, actualizamos solo los capítulos y el nombre del manga
        await updateDoc(docRef, {
          nombre: manga.nombre,
          link: manga.link,
          listaNombre,
        });
      } else {
        await setDoc(docRef, { ...manga, listaNombre: listaNombre });
      }
    }
    console.log(
      `Resultados guardados en Firebase para el usuario ${uid} en la lista ${listaNombre}`
    );
  } catch (error) {
    console.error(
      `Error al guardar los resultados en Firebase para el usuario ${uid} en la lista ${listaNombre}`
    );
    console.error(`Error: ${error.message}`);
  }
}

async function main(uid, urlsListas, nombresListas) {
  console.log(`Iniciando función principal para el usuario ${uid}`);
  for (let i = 0; i < urlsListas.length; i++) {
    const urls = urlsListas[i];
    const listaNombre = nombresListas[i];

    console.log(`Obteniendo animes para la lista ${listaNombre}`);
    const animes = await obtenerAnimes(urls);

    console.log(
      `Actualizando resultados en Firebase para la lista ${listaNombre}`
    );
    await actualizarResultadosFirebase(animes, listaNombre, uid);
  }
}

export async function POST(request, { params }) {
  console.log(`Recibiendo solicitud POST`);
  const uid = params.uid;
  const { urlsListas, nombresListas } = (await request.json()) || [];
  const uniqueUrlsListas = urlsListas.map((urls) =>
    urls.filter((url, index) => urls.indexOf(url) === index)
  );

  console.log("params:", params);
  console.log("uid:", uid);
  console.log("urls:", urlsListas);
  console.log("nombres:", nombresListas);

  console.log(`Iniciando función principal para el usuario ${uid}`);
  await main(uid, uniqueUrlsListas, nombresListas);

  console.log(`Finalizando función principal para el usuario ${uid}`);
  return {
    status: 200,
    body: { uid, urls: uniqueUrlsListas, listaNombre: nombresListas },
  };
}
