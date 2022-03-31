const fs = require("fs");
const express = require("express");
const { log } = require("console");
const axios = require("axios");
const { request } = require("http");
const fetch = require('node-fetch');
const { url } = require('inspector');
const { URLSearchParams } = require('url');

const app = express();
// includes the files from public folder
app.use(express.static(__dirname + '/public'));
app.use(express.json())

app.get("/", (req, res) => { res.sendFile(__dirname + "/public/index.html"); });

app.get("/trello", (req, res) => {
   res.sendFile(__dirname + "/public/trelloAuthentication.html");
})

app.get("/discord", (req, res) => {
   res.sendFile(__dirname + "/public/discordAuthentication.html");
})

app.post("/discord-code", async (req, res) => {
   console.log(req.body.code)

   let token = "this is from line 28"

   // Add the parameters
   const params = new URLSearchParams();
   params.append('client_id', "957208170365866044");
   params.append('client_secret', "eexruTgz0P5FkSVJhm1i4XK7ijLkDNk7");
   params.append('grant_type', 'authorization_code');
   params.append('code', req.body.code);
   params.append('redirect_uri', "http://localhost:3000/discord");

   // Send the request
   var r = await fetch('https://discord.com/api/oauth2/token', {
      method: 'post',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
   })
   
   const _json = await r.json()

   res.json({token: _json.access_token})
   

})

// send token in response to server

// postGithubCode();
function postGithubCode() {
   axios.post("https://github.com/login/oauth/access_token", {
      client_id: "de223b25bb78c82a9bd7",
      client_secret: "38fd5fec5fc324960fede9825d4d4eacb87eb528",
      code: "921077d2df259cea16c3",
      redirect_uri: "http://localhost:3000/"
   })
      .then((response) => {
         console.log(response);
      }), (error) => {
         console.log(error);
      }
}

// the server run's
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));
