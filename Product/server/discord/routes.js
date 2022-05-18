const { getDiscordCode, discGetIntersectedGuilds, discGetMessages, discGetChannels } = require("./controllers")

module.exports = async function (app, __dirname){
    // GET
    app.get("/discord", (req, res) => {
        res.sendFile(__dirname + "/public/discordAuthentication/discordAuthentication.html");
    });


    // POST
    app.post("/discord-code", getDiscordCode);
    app.post("/disc_get_intersected_guilds", async(req,res)=>{await discGetIntersectedGuilds(req,res)});
    app.post("/disc_get_messages", async(req,res)=>{await discGetMessages(req,res)});
    app.post("/disc_get_channels", async(req,res)=>{await discGetChannels(req,res)});
}
