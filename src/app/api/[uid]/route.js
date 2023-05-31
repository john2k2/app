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

          const anime = {
            nombre: nombre,
            imagenUrl: imagenUrl,
            link: chapters, // Aquí se debe asignar la variable chapters
          };

          // Usar el nombre del anime como clave en el objeto animes
          animes[nombre] = anime;
        }
      }
    } catch (e) {
      console.log(`Error al realizar la solicitud HTTP a la URL: ${url}`);
      console.log(`Error: ${e.message}`);
    }
  }

  return Object.values(animes);
}

async function actualizarResultadosFirebase(mangas, listaNombre, uid) {
  try {
    const mangaCollectionRef = collection(db, "mangas");
    for (const manga of mangas) {
      const docId = `${uid}-${manga.nombre}`;
      const docRef = doc(mangaCollectionRef, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // El documento ya existe, actualizarlo
        await updateDoc(docRef, { ...manga, listaNombre });
      } else {
        // El documento no existe, crearlo
        await setDoc(docRef, { ...manga, listaNombre: listaNombre });
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

    const animes = await obtenerAnimes(urls);

    await actualizarResultadosFirebase(animes, listaNombre, uid);
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
