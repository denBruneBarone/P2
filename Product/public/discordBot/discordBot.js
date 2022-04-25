// Setup our environment variables via dotenv
require('dotenv').config()
// Import relevant classes from discord.js
const { Client, Intents } = require('discord.js');
// Instantiate a new client with some necessary parameters.
const client = new Client(
    { intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }
);
// Notify progress
    client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const guilds = client.guilds.cache.map(guild => guild.id);
    console.log(guilds);
    return guilds;
  });
  

// Authenticate
client.login(process.env.BOT_TOKEN)