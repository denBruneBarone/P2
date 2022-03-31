const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { log } = require("console");
const app = express();
app.get("/", (req, res) => { res.sendFile(__dirname + "/public/index.html"); });

// includes the files from public folder
app.use(express.static(__dirname + '/public'));
app.use(express.json());

const axios = require("axios");
const { request } = require("http");
const req = require("express/lib/request");
const { json } = require("express/lib/response");

app.get("/trello", (req, res) => {
   res.sendFile(__dirname + "/public/trelloAuthentication.html");
})

app.get("/githubAuthentication", (req, res) => {
   res.sendFile(__dirname + "/public/githubAuthentication.html")
})

/* Sends a POST request to Github and waits for response.
then it sends token back to client as a JSON object*/
app.post("/githubToken", async (req, res) => {
   let githubCode = req.body.gitCode;
   console.log("github code is: " + githubCode);

   axios.post("https://github.com/login/oauth/access_token", {
      client_id: "de223b25bb78c82a9bd7",
      client_secret: "38fd5fec5fc324960fede9825d4d4eacb87eb528",
      code: githubCode,
      redirect_uri: "http://localhost:3000/githubAuthentication"
   }).then((response) => {
      let githubToken = response.data.substring(response.data.indexOf("=") + 1, response.data.indexOf("&"))
      console.log("github token is " + githubToken);

      /* res.setHeader("Content-Type", "application/json") */
      res.json({ token: githubToken });

      /* return res.send(JSON.stringify({ token: "hej" })) */
   })
})
// the server run's
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));

