import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const express = require("express");

require("dotenv").config();

const setDiscordRoutes = require("./discord/routes");
const setGithubRoutes = require("./github/routes");
const setTrelloRoutes = require("./trello/routes");
const sethtmlRoutes = require("./htmlRoutes/routes");

const __filename = fileURLToPath(import.meta.url);
// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

export async function createApp() {
  const app = express();

  // includes the files from public folder
  app.use(express.static(__dirname + "/public"));
  app.use(express.json());

  setDiscordRoutes(app, __dirname);
  setGithubRoutes(app, __dirname);
  setTrelloRoutes(app, __dirname);
  sethtmlRoutes(app, __dirname);

  return app;
}

let app = await createApp();

// the server runs
app.listen(3000, () =>
  console.log("Server is running on http://localhost:3000")
);
