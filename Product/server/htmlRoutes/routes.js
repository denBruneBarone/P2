module.exports = function setRoutes(app, __dirname) {
  app.get("/selectLocations", (req, res) => {
    res.sendFile(__dirname + "/public/selectLocations/selectLocations.html");
  });

  app.get("/overview", (req, res) => {
    res.sendFile(__dirname + "/public/overview/overview.html");
  });
};
