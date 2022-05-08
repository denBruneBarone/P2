
module.exports = function setRoutes(app, __dirname){
    // GET
    app.get("/trello", (req, res) => {
        res.sendFile(__dirname + "/public/trelloAuthentication/trelloAuthentication.html");
    });

    app.get("/trelloBoards", (req, res) => {
        res.sendFile(__dirname + "/public/trelloBoards.html");
    });

    app.get("/trello-overview", (req, res) => {
        res.sendFile(__dirname + "/public/trello-get-boards.html");
    });

}
