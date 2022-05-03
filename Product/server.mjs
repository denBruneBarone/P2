import { createRequire } from "module";
const require = createRequire(import.meta.url)
const fs = require("fs");
const express = require("express");
const { log } = require("console");
const axios = require("axios");
const { request } = require("http");
const fetch = require("node-fetch");
const { url } = require("inspector");
const { URLSearchParams } = require("url");

// Disc client
require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const dotenv = require("dotenv");
dotenv.config();

export function createApp() {

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

  app.get("/trelloBoards", (req, res) => {
    res.sendFile(__dirname + "/public/trelloBoards.html");
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

  // Redirects client to the temporary page githubAuthentication.html while authenticating
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

  // Sends GET-request to Githubs API to retrieve the clients repositories. Sends the response back to the client as a JSON object.
  app.post("/getGithubRepositories", async (req, res) => {
    let githubToken = req.body.gitToken;
    let githubRepositories = [];
    axios
      .get(`https://api.github.com/user/repos`, {
        headers: {
          Authorization: "token " + githubToken,
          accept: "application/vnd.github.v3+json",
        }

      })
      .then((response) => {
        for (const i of response.data) {
          let Repo = new Object();
          Repo.owner = i.owner.login;
          Repo.repositoryName = i.name
          githubRepositories.push(Repo);
        }
        res.json({ Repositories: githubRepositories });
      });
  });

  /* Sends GET-request to Githubs API to retrieve the commits from selected repository. Loops iteratively until there are no more commits to fetch. 
  Sends the response back to the client as a JSON object. */
  app.post("/getGitCommits", async (req, res) => {
    let GitCommitArray = [], loadedAllCommits = false, pageCount = 1;
    while (loadedAllCommits === false) {
      var r = await fetch(
        `https://api.github.com/repos/${req.body.gitRepositoriesOwner}/${req.body.gitRepositories}/commits?per_page=100&page=${pageCount}&since=${req.body.from}&until=${req.body.to}`,
        {
          method: "GET",
          headers: {
            Authorization: `token ${req.body.gitToken}`,
            accept: "application/vnd.github.v3+json",
          },
        }
      );
      var data = await r.json();

      if (!r.ok) console.log("not okay")
      if (data.length === 0) loadedAllCommits = true;

      for (const i of data) {
        let Commit = new Object();
        Commit.author = i.commit.author.name;
        Commit.message = i.commit.message;
        Commit.date = i.commit.author.date;
        Commit.location = req.body.gitRepositories;
        Commit.service = "github";
        GitCommitArray.push(Commit);
      }

      pageCount++;
    }
    res.json(GitCommitArray);
  });

  app.post("/disc_get_intersected_guilds", async (req, res) => {
    const userGuilds = req.body.guilds.map((guild) => guild.id); // Antager at de er ens
    const botGuilds = await client.guilds.fetch(); // Antager at de er ens

    const intersection = botGuilds
      .filter((botGuilds) => userGuilds.includes(botGuilds.id))
      .map((botGuilds) => {
        return {
          id: botGuilds.id,
          name: botGuilds.name,
        };
      }); // [ {"id": 123, "name": "P2"}, ]

    res.json(intersection);
  });

  app.post("/disc_get_channels", async (req, res) => {
    const guildId = req.body.intersectedGuild;
    const discordChannel = client.channels.cache
      .filter(
        (chanObj) => chanObj.type === "GUILD_TEXT" && chanObj.guildId === guildId
      )
      .map((chanObj) => {
        return {
          id: chanObj.id,
          name: chanObj.name,
        };
      });
    res.json(discordChannel);
  });

  app.post("/disc_get_messages", async (req, res) => {
    const channelID = req.body.discord_channel_id;
    const channelName = req.body.discord_channel_name;
    const guildName = req.body.intersectedGuildName;
    const startDate = Date.parse(req.body.start_date);
    const endDate = Date.parse(req.body.end_date);
    const channel = await client.channels.fetch(channelID);
    const location = guildName + " => " + channelName;

    let messagesFromApi = [];

    // Create message pointer
    let messagePointer = await channel.messages
      .fetch({ limit: 1 })
      .then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

    while (messagePointer) {
      await channel.messages
        .fetch({ limit: 100, before: messagePointer.id })
        .then((messagePage) => {
          messagePage.forEach((msg) => messagesFromApi.push(msg));

          // Update our message pointer to be last message in page of messages
          messagePointer =
            0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        });
    }

    let filteredMessages = messagesFromApi
      .filter((msg) => {
        return msg.createdTimestamp > startDate && msg.createdTimestamp < endDate;
      })
      .map((msgObj) => {

        return {
          author: msgObj.author.username,
          message: msgObj.content,
          date: msgObj.createdTimestamp,
          location: location,
          service: "Discord"
        };
      });

    res.json({ messages: filteredMessages });
  });

  
  return app
}

client.login(process.env.BOT_TOKEN);

// the server runs
app.listen(3000, () =>
  console.log("Server is running on http://localhost:3000")
);

