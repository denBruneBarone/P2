const fs = require("fs");
const express = require("express");
const app = express();
app.get("/", (req, res) => { res.sendFile(__dirname + "/public/index.html"); });

// includes the files from public folder
app.use(express.static(__dirname + '/public'));

app.get("/trello", (req,res) => {
   res.sendFile(__dirname + "/public/trelloAuthentication.html");
})

// the server run's
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));
