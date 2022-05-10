

const spinUpBot = (token) => {
  // Disc client
  const Discord = require("discord.js");
  const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
  
  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
  client.login(token)
  console.log(token)
  return client
}


module.exports = spinUpBot