import React from "react";

const footer = () => {
  return (
    <div
      className="
        flex bg-slate-500 h-[10vh]"
    >
      <div className="flex flex-col justify-center items-center w-full">
        <p className="text-white text-xl font-bold capitalize">
          todos los derechos reservados 2023 © -{" "}
          <a
            href="https://www.linkedin.com/in/ortiz--jonathan/"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            Oritz Jonathan
          </a>
        </p>
      </div>
    </div>
  );
};

export default footer;
