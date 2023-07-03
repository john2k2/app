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

async function obtenerCapitulos(url, capitulosExistentes = []) {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const chapters = $("li.row").slice(0, 4);
      const capitulos = [];
      chapters.each((_, element) => {
        const nombreCap = limpiarTexto($(element).find("h4").text());
        const link = new URL($(element).find("a").attr("href"), url).href;

        const capituloExistente = capitulosExistentes.find(
          (cap) => cap.capitulo === nombreCap
        );
        const leido = capituloExistente ? capituloExistente.leido : false;

        capitulos.push({ capitulo: nombreCap, url: link, leido: leido });
      });
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

function addNewChapters(existingChapters, newChapters) {
  newChapters.forEach((newChapter) => {
    const existingChapterIndex = existingChapters.findIndex(
      (chapter) => chapter.url === newChapter.url
    );
    if (existingChapterIndex === -1) {
      // This is a new chapter, so add it to the list
      existingChapters.unshift(newChapter);
    }
  });
  // If there are more than 4 chapters, remove the last one
  if (existingChapters.length > 4) {
    existingChapters.pop();
  }
  return existingChapters;
}

async function obtenerAnimes(urls, uid) {
  const animes = {};

  for (const url of urls) {
    try {
      const mangaCollectionRef = collection(db, "mangas");
      const docId = `${uid}-${limpiarTexto(url)}`;
      const docRef = doc(mangaCollectionRef, docId);
      const docSnap = await getDoc(docRef);

      const newChapters = await obtenerCapitulos(url);
      if (newChapters.length > 0) {
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
            const existingChapters = docSnap.exists()
              ? docSnap.data().link
              : [];
            const updatedChapters = addNewChapters(
              existingChapters,
              newChapters
            );

            anime = {
              nombre: nombre,
              imagenUrl: docSnap.data().imagenUrl,
              link: updatedChapters,
            };
          } else {
            anime = {
              nombre: nombre,
              imagenUrl: imagenUrl,
              link: newChapters,
            };
          }
          animes[nombre] = anime;
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
    const mangaCollectionRef = collection(db, "mangas");
    for (const manga of mangas) {
      const docId = `${uid}-${manga.nombre}`;
      const docRef = doc(mangaCollectionRef, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
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
  for (let i = 0; i < urlsListas.length; i++) {
    const urls = urlsListas[i];
    const listaNombre = nombresListas[i];

    const animes = await obtenerAnimes(urls, uid);

    await actualizarResultadosFirebase(animes, listaNombre, uid);
  }
}

export async function POST(request, { params }) {
  const uid = params.uid;
  const { urlsListas, nombresListas } = (await request.json()) || [];
  const uniqueUrlsListas = urlsListas.map((urls) =>
    urls.filter((url, index) => urls.indexOf(url) === index)
  );

  await main(uid, uniqueUrlsListas, nombresListas);

  return {
    status: 200,
    body: { uid, urls: uniqueUrlsListas, listaNombre: nombresListas },
  };
}
