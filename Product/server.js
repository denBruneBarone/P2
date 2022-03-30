const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { log } = require("console");
const app = express();
app.get("/", (req, res) => { res.sendFile(__dirname + "/public/index.html"); });
app.use(express.static(__dirname + '/public'));
app.use(cors());
const axios = require("axios");
const { request } = require("http");

// this function receives the token from the request body for further processing
app.post("/token", async (req, res) => {
   console.log(req)
})
app.get("/token", (req, res) => {
   res.sendFile(__dirname + "/public/index.html");
})

app.listen(3000, () => console.log("Server is running on http://localhost:3000"));

getGithubCode();
function getGithubCode() {
   /* const url = new URL(window.location.href)
   console.log("Github code: " + url.searchParams.get("code"))
   const githubCode = url.searchParams.get("code"); */

   axios.post("https://github.com/login/oauth/access_token", {
      client_id: "de223b25bb78c82a9bd7",
      client_secret: "38fd5fec5fc324960fede9825d4d4eacb87eb528",
      code: "921077d2df259cea16c3",
      redirect_uri: "http://localhost:3000/"
      /* mode: 'no-cors', */
      /* headers: {
         /* 'Access-Control-Allow-Origin': '*', 
      },
      body: JSON.stringify({
         client_id: "de223b25bb78c82a9bd7",
         client_secret: "38fd5fec5fc324960fede9825d4d4eacb87eb528",
         code: "fbfe2450168b63d4e7c2",
         redirect_uri: "http://localhost:3000/" 
      }) */
   }).then((response) => {
      console.log(response);
   }), (error) => {
      console.log(error);
   }
}