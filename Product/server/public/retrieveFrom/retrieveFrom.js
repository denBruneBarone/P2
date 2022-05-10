let Boards = [];
let selectedRepositories = [];
let selectedRepositoriesOwner = [];

// When continue button is pressed, go to overview. 
async function goToOverview() {
   getSelectedTrelloBoards()
   submitSelectedRepos()
  if (Boards.length != 0 || selectedRepositories.length != 0 || window.sessionStorage.getItem("channelID") != null) {
    window.location.replace("http://localhost:3000/overview/overview.html");
  }
  else {
    window.alert("Please select at least one location!")
  }
}

function getSelectedTrelloBoards() {
  for (i of document.getElementsByClassName("trelloBoards")) {
    if (i.checked) {
      Boards.push({ id: i.id, name: i.value });
    }
  }
  // store Boards in session storage and redirect user
  if (Boards.length > 0) {
    window.sessionStorage.setItem("Boards", JSON.stringify(Boards));
  }
}

// Sends POST-request for repositories to server and creates check-list in retrieveFrom.html
async function getGitRepositories(Tokens) {
  fetch(`/getGithubRepositories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gitToken: Tokens.github,
    }),
  }).then((response) => {
    response.json().then((responseData) => {
      const githubForm = document.getElementById("githubCheckbox");

      for (const j of responseData.Repositories) {
        githubForm.innerHTML += `<input type="checkbox" id="${j.owner}" name="${j.repositoryName}" value="${j.repositoryName}" class="githubRepositories">
        <label for="${j.repositoryName}" class="githubLabel"> ${j.repositoryName}</label> <br>`;
      }
    });
  });
}

function onLoad() {
  createLists();
}

async function createLists() {
  let Tokens = checkAuthenticationStatus();

  if (Tokens.github) {
    if (sessionStorage.githubRepositories)
      sessionStorage.removeItem("githubRepositories");

    getGitRepositories(Tokens);
  }
  else{
    githubForm.innerHTML=""
  }
  if (Tokens.trello) {
    if (sessionStorage.Boards)
      sessionStorage.removeItem("Boards");

    getTrelloBoards();
  }
  else{
    trelloForm.innerHTML= ""
  }
  if(Tokens.discord === null){
    discordForm.innerHTML=""
  }

  // GET DISCORD GUILDS??
}

// Checks each checklist-item for checkmark and saves checked repositories in session storage
function submitSelectedRepos() {

  for (const i of document.getElementsByClassName("githubRepositories")) {
    if (i.checked) {
      selectedRepositories.push(i.value);
      selectedRepositoriesOwner.push(i.id)
    }
  }
  window.sessionStorage.setItem("githubRepositories", selectedRepositories);
  window.sessionStorage.setItem("githubRepositoriesOwner", selectedRepositoriesOwner);
}

async function getTrelloBoards() {
  let key = "0b862279af0ae326479a419925f3ea7a";
  let token = window.sessionStorage.getItem("trello-token");
  // get user's boards
  let r = await fetch(
    `https://api.trello.com/1/members/me/boards?key=${key}&token=${token}`,
    {
      method: "GET",
    }
  );

  let _json = await r.json();

  // lav html element, hvor brugeren kan vælge et af sine boards
  let trelloBoardForm = document.getElementById("trelloCheckbox");
  for (i of _json) {
    trelloBoardForm.innerHTML =
      `<input class="trelloBoards" type="checkbox" id="${i.id}" value="${i.name}"><label for="${i.id}" class="container">${i.name}</label><br>` +
      trelloBoardForm.innerHTML;
  }
}

/* Retrieves an authorized discord users guild list and finds an intercection of the bot and user guilds */
async function getDiscordGuilds() {
  let discordGuilds = await fetch(`https://discord.com/api/users/@me/guilds`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + window.sessionStorage.getItem("discord-token"),
    },
  });
  let discordGuildList = await discordGuilds.json();

  let response = await fetch(`/disc_get_intersected_guilds`, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ // To minimize the amount of data sent)
      guilds: discordGuildList.map((guild) => {
        return {
          id: guild.id,
        };
      }),
    }),
  });
  let intersectedGuilds = await response.json();

  let discordGuildForm = document.getElementById("discordFormButtons");
  discordFormButtons.innerHTML = ""
  
  for (i of intersectedGuilds) {
    discordGuildForm.innerHTML =
       `<button class="discordGuilds" id="${i.id}" onclick="getDiscordChannels('${i.id}', '${i.name}')">${i.name}</button><br>` +
       discordGuildForm.innerHTML;
   }

   discordGuildForm.innerHTML=
   '<a href="https://discord.com/api/oauth2/authorize?client_id=965604229794398259&permissions=66560&scope=bot" target="_blank"> <button class="connectBotServer" id="connectBotServer">Add Server to selection</button></a>'+
   discordGuildForm.innerHTML;
} 

/*Function that finds and posts the channels from a specific guild ID */
async function getDiscordChannels(intersectedGuildID, intersectedGuildName) {

  window.sessionStorage.setItem("guildID", intersectedGuildID);
  window.sessionStorage.setItem("guildName", intersectedGuildName);

  let response = await fetch(`/disc_get_channels`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        intersectedGuild: intersectedGuildID
    }),
  })
  let discordChannels = await response.json();

  let discordChannelForm = document.getElementById("discordFormButtons");
  discordFormButtons.innerHTML = ""
  discordChannelForm.innerHTML = '<button id="backToGuilds" onclick="getDiscordGuilds()">Back To Guilds</button>'
  document.getElementById("discordHeader").innerHTML = "Select a Channel";

  for (i of discordChannels) {
    discordChannelForm.innerHTML =
      `<button class="discordChannel" id="${i.id}" onclick="saveChannel('${i.id}','${i.name}')">${i.name}</button><br>` +
      discordChannelForm.innerHTML;
  }

  document.getElementById("connectBotServer").style.visibility = "hidden";
}

async function saveChannel(channelID, channelName){
  
  document.getElementById("discordHeader").innerHTML = "Server & Channel selection complete";
  discordFormButtons.innerHTML = ''
  discordFormButtons.innerHTML =
    '<p id="checkmarkLogo" class="checkmarkLogo"</p>' +
    discordFormButtons.innerHTML
  window.sessionStorage.setItem("channelID", channelID);
  window.sessionStorage.setItem("channelName", channelName);
}