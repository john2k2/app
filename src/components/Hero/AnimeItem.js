import React from "react";

const MangaItem = ({ manga }) => (
  <div className="mt-8">
    <img
      src={manga.imagenUrl}
      alt={manga.nombre}
      className="w-48 h-auto hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
    />
    <h2 className="text-xl font-bold mt-4 w-52 text-left overflow-hidden whitespace-nowrap overflow-ellipsis hover:whitespace-normal hover:overflow-visible">
      {manga.nombre}
    </h2>
    <div className="w-52 mb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-hover:shadow-lg scrollbar-track-hover:shadow-lg transition duration-300 ease-in-out">
      <ul>
        {Object.entries(manga.link).map(([key, chapter]) => (
          <li
            key={key}
            className="text-left text-sm font-semibold text-gray-500 hover:text-gray-900 transition duration-300 ease-in-out"
          >
            <a
              href={chapter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <span
                className={`${
                  chapter.leido ? "bg-red-500" : "bg-green-500"
                } w-2 h-2 rounded-full mr-2`}
              ></span>
              {chapter.capitulo}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default MangaItem;
