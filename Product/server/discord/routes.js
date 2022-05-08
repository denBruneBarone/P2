const { getDiscordCode, discGetIntersectedGuilds, discGetMessages, discGetChannels } = require("./controllers")

module.exports = function (app, __dirname){
    // GET
    app.get("/discord", (req, res) => {
        res.sendFile(__dirname + "/public/discordAuthentication/discordAuthentication.html");
    });


    // POST
    app.post("/discord-code", getDiscordCode);
    app.post("/disc_get_intersected_guilds", discGetIntersectedGuilds);
    app.post("/disc_get_messages", discGetMessages);
    app.post("/disc_get_channels", discGetChannels);
}