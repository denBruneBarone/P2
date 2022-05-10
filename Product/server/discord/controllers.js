const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const { SendOkJson, SendErrorJson } = require("../utils/utils")
const spinUpBot = require("./bot")

const client = spinUpBot(process.env.BOT_TOKEN)

async function getDiscordCode(req, res) {
    // Add the parameters
    const params = new URLSearchParams();
    params.append("client_id", "957208170365866044");
    params.append("client_secret", process.env.DISCORD_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", req.body.code);
    params.append("redirect_uri", "http://localhost:3000/discord");

    // Send the request
    var r = await fetch("https://discord.com/api/oauth2/token", {
        method: "post",
        body: params,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
    });

    const _json = await r.json();

    if (!r.ok) {
        // Make error handling
        SendErrorJson(res, _json.error)
        console.log(_json.error)
        return;
    }

    SendOkJson(res, { token: _json.access_token, error: false })

}


async function discGetIntersectedGuilds(req, res) {
    const userGuilds = req.body.guilds.map((guild) => guild.id); // Antager at de er ens
    const botGuilds = await client.guilds.fetch(); // Antager at de er ens

    const intersection = botGuilds
        .filter((botGuilds) => userGuilds.includes(botGuilds.id))
        .map((botGuilds) => {
            return {
                id: botGuilds.id,
                name: botGuilds.name,
            };
        }); // [ {"id": 123, "name": "P2"}, ]

    SendOkJson(res, intersection)
}

async function discGetMessages(req, res) {
    const channelID = req.body.discord_channel_id;
    const channelName = req.body.discord_channel_name;
    const guildName = req.body.intersectedGuildName;
    const startDate = Date.parse(req.body.start_date);
    const endDate = Date.parse(req.body.end_date);
    const channel = await client.channels.fetch(channelID);
    const location = guildName + " => " + channelName;

    let messagesFromApi = [];

    // reffferer her
    // Create message pointer
    let messagePointer = await channel.messages
      .fetch({ limit: 1 })
      .then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

    while (messagePointer) {
      await channel.messages
        .fetch({ limit: 100, before: messagePointer.id })
        .then((messagePage) => {
          messagePage.forEach((msg) => messagesFromApi.push(msg));

          // Update our message pointer to be last message in page of messages
          messagePointer =
            0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        });
    }

    let filteredMessages = messagesFromApi
      .filter((msg) => {
        return msg.createdTimestamp > startDate && msg.createdTimestamp < endDate;
      })
      .map((msgObj) => {
        return {
          author: msgObj.author.username,
          message: msgObj.content,
          date: new Date(msgObj.createdTimestamp).toISOString(),
          location: location,
          service: "Discord"
        };
      });

    SendOkJson(res, {messages: filteredMessages})
}


async function discGetChannels(req, res) {
    const guildId = req.body.intersectedGuild;
    const discordChannel = client.channels.cache
      .filter(
        (chanObj) => chanObj.type === "GUILD_TEXT" && chanObj.guildId === guildId
      )
      .map((chanObj) => {
        return {
          id: chanObj.id,
          name: chanObj.name,
        };
      });
    SendOkJson(res, discordChannel)
}


module.exports = {
  getDiscordCode,
  discGetIntersectedGuilds,
  discGetMessages,
  discGetMessages,
  discGetChannels
}