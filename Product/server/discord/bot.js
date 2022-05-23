//Starts the bot with the needed intents on serverstart. Returns the intents, as they are needed in order to fetch the corresponding data.
const spinUpBot = (token) => {
  const Discord = require("discord.js");
  const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

  client.on("ready", () => {
    console.log(`Discord bot logged in as ${client.user.tag}!`);
  });

  client.login(token);
  return client;
};

module.exports = spinUpBot;
