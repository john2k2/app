import { exec } from "child_process";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send();
    return;
    // Process a POST request
  }

  exec("actualizar_capitulos.js", (error, stdout, stderr) => {
    if (error) {
      console.error("exec error ${error}");
      return;
    }

    res.status(200).send(stdout ? stdout : stderr);
  });
}
