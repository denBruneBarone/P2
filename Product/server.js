const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { log } = require("console");
const app = express();
app.get("/", (req, res) => { res.sendFile(__dirname + "/public/index.html"); });

// includes the files from public folder
app.use(express.static(__dirname + '/public'));

const axios = require("axios");
const { request } = require("http");


app.get("/trello", (req,res) => {
   res.sendFile(__dirname + "/public/trelloAuthentication.html");
})


getGithubCode();
function postGithubCode
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

// the server run's
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));

