const fs = require("fs");
const express = require("express");
const app = express();
app.get("/", (req, res) => { res.sendFile(__dirname + "/index.html"); });
// cookie-test
/* app.get("/test-cookie", (req, res) => { res.sendFile(dirname + "/cookie_test.html") }); */

// this function receives the token from the request body for further processing
app.post("/token", async (req,res) => {})

app.post("/", async (req, res) => {
   const buffers = [];
   for await (const chunk of req) { buffers.push(chunk) }
   const data = Buffer.concat(buffers).toString();
   console.log("The user is interested in " + JSON.parse(data))
   fs.appendFile('message.txt', JSON.parse(data) + "\n", () => { })
})
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));