const fs = require("fs");
const express = require("express");
const { log } = require("console");
const axios = require("axios");
const { request } = require("http");
const fetch = require("node-fetch");
const { url } = require("inspector");
const { URLSearchParams } = require("url");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
// includes the files from public folder
app.use(express.static(__dirname + "/public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const req = require("express/lib/request");
const { json } = require("express/lib/response");

app.get("/overview", (req, res) => {
  res.sendFile(__dirname + "/public/overview.html");
});

app.get("/trello", (req, res) => {
  res.sendFile(__dirname + "/public/trelloAuthentication.html");
});

app.get("/trello-boards", (req, res) => {
  res.sendFile(__dirname + "/public/trello-boards.html");
});

app.get("/trello-overview", (req, res) => {
  res.sendFile(__dirname + "/public/trello-get-boards.html");
});

app.get("/discord", (req, res) => {
  res.sendFile(__dirname + "/public/discordAuthentication.html");
});

app.post("/discord-code", async (req, res) => {
  // Add the parameters
  const params = new URLSearchParams();
  params.append("client_id", "957208170365866044");
  params.append("client_secret", process.env.DISCORD_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", req.body.code);
  params.append("redirect_uri", "http://localhost:3000/discord");

  // Send the request
  var r = await fetch("https://discord.com/api/oauth2/token", {
    method: "post",
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  });

  const _json = await r.json();

  if (!r.ok) {
    // Make error handling
    res.json({ error: true, errorMsg: _json.error });
    return;
  }

  res.json({ token: _json.access_token, error: false });
});

app.get("/githubAuthentication", (req, res) => {
  res.sendFile(__dirname + "/public/githubAuthentication.html");
});

/* Sends a POST request to Github and waits for response.
then it sends token back to client as a JSON object*/
app.post("/githubToken", async (req, res) => {
  let githubCode = req.body.gitCode;

  axios
    .post("https://github.com/login/oauth/access_token", {
      client_id: "de223b25bb78c82a9bd7",
      client_secret: process.env.GITHUB_SECRET,
      code: githubCode,
      redirect_uri: "http://localhost:3000/githubAuthentication",
    })
    .then((response) => {
      let githubToken = response.data.substring(
        response.data.indexOf("=") + 1,
        response.data.indexOf("&")
      );
      res.json({ token: githubToken });
    });
});

app.post(`/getGithubUsername`, async (req, res) => {
  var r = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `token ${req.body.gitToken}`,
    },
  });

  var data = await r.json();
  if (!r.ok) {
    console.log("not okay");
    console.log(data);
  }
  console.log(data.login);
  res.json({ gitUsername: data.login });
});

app.post("/getGithubRepositories", async (req, res) => {
  let githubToken = req.body.gitToken;
  let githubRepositories = [];
  axios
    .get(`https://api.github.com/users/${req.body.username}/repos`, {
      Authorization: "token " + githubToken,
      accept: "application/vnd.github.v3+json",
    })
    .then((response) => {
      let i = 0;
      for (const j of response.data) {
        /* console.log(`repository ${i} hedder: ${j.name}`); */
        githubRepositories[i] = j.name;
        i++;
      }
      res.json({ Repositories: githubRepositories });
    });
});

app.post("/getGitCommits", async (req, res) => {
  // hvis der ikke findes et array:
  if (req.body.gitRepositories.includes(",") === false) {
    var r = await fetch(
      `https://api.github.com/repos/${req.body.gitUsername}/${req.body.gitRepositories}/commits`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${req.body.gitToken}`,
          accept: "application/vnd.github.v3+json",
        },
      }
    );
    var data = await r.json();
    if (!r.ok) console.log("not okay");

    let GitCommitArray = [];
    for (const i of data) {
      let Commit = new Object();
      Commit.author = i.commit.author.name;
      Commit.message = i.commit.message;
      Commit.date = i.commit.author.date;
      GitCommitArray.push(Commit);
    }
    res.json(GitCommitArray);
  } else
    console.log(
      "Du har valgt mere end et repository. Den funktion har vi ikke lavet endnu :(("
    );
});

// Setup our environment variables via dotenv
require("dotenv").config();
// Import relevant classes from discord.js
const { Client, Intents } = require("discord.js");
// Instantiate a new client with some necessary parameters.
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Notify progress
client.on("ready", () => {
  console.log(`Discordbot ${client.user.tag} active and ready!`);
  let guilds = client.guilds.cache.map((guild) => guild.id);
  return guilds;
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'beep') {
		await interaction.reply('Boop!');
	}
});

const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { BOT_TOKEN } = require('./.env');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();

// Authenticate
client.login(process.env.BOT_TOKEN);

// the server run's
app.listen(3000, () =>
  console.log("Server is running on http://localhost:3000")
);
