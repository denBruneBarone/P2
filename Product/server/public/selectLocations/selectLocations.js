let TrelloBoards = [];
let SelectedRepositories = [];
// the owner of selected GithubRepository is stored in a seperate array.
let SelectedRepositoriesOwner = [];

// called onload. If there already exists locations in sessionStorage, remove them. If no token can be found, removes corresponding html structure.
async function createLists() {
  let Tokens = checkAuthenticationStatus();

  if (Tokens.github) {
    if (sessionStorage.githubRepositories)
      sessionStorage.removeItem("githubRepositories");
    getGitRepositories(Tokens);
  } else {
    githubForm.innerHTML = "";
  }

  if (Tokens.trello) {
    if (sessionStorage.TrelloBoards) sessionStorage.removeItem("TrelloBoards");
    getTrelloBoards();
  } else {
    trelloForm.innerHTML = "";
  }

  if (Tokens.discord) {
    if (sessionStorage.channelID) sessionStorage.removeItem("channelID");
  } else {
    discordForm.innerHTML = "";
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
    body: JSON.stringify({
      // Returns only guild.id to minimize the amount of data sent)
      guilds: discordGuildList.map((guild) => {
        return {
          id: guild.id,
        };
      }),
    }),
  });
  let intersectedGuilds = await response.json();

  discordFormButtons.innerHTML = "";

  for (i of intersectedGuilds) {
    discordFormButtons.innerHTML =
      `<button class="discordGuilds" id="${i.id}" onclick="fetchDiscordChannels('${i.id}', '${i.name}')">${i.name}</button><br>` +
      discordFormButtons.innerHTML;
  }
  //Creates element button for adding the discord Bot to user servers.
  discordFormButtons.innerHTML =
    '<a href="https://discord.com/api/oauth2/authorize?client_id=965604229794398259&permissions=66560&scope=bot" target="_blank"> <button class="connectBotServer" id="connectBotServer">Add Server to selection</button></a>' +
    discordFormButtons.innerHTML;
}

/* Function that finds and posts the channels from a specific guild ID
Sends a post request to our server, which then sends a GET request to discords API */
async function fetchDiscordChannels(intersectedGuildID, intersectedGuildName) {
  window.sessionStorage.setItem("guildID", intersectedGuildID);
  window.sessionStorage.setItem("guildName", intersectedGuildName);

  let response = await fetch(`/disc_get_channels`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intersectedGuild: intersectedGuildID,
    }),
  });
  let discordChannels = await response.json();

  discordFormButtons.innerHTML = "";
  discordFormButtons.innerHTML =
    '<button id="backToGuilds" onclick="getDiscordGuilds()">Back To Guilds</button>';
  document.getElementById("discordHeader").innerHTML = "Select a Channel";

  for (i of discordChannels) {
    discordFormButtons.innerHTML =
      `<button class="discordChannel" id="${i.id}" onclick="saveChannel('${i.id}','${i.name}')">${i.name}</button><br>` +
      discordFormButtons.innerHTML;
  }
}

// Saves selected channel data to sessionStorage. Changes Discord header and adds an element for a checkmark.
async function saveChannel(channelID, channelName) {
  document.getElementById("discordHeader").innerHTML =
    "Server & Channel selection complete";
  discordFormButtons.innerHTML = "";
  discordFormButtons.innerHTML =
    '<p id="checkmarkLogo" class="checkmarkLogo"</p>' +
    discordFormButtons.innerHTML;
  window.sessionStorage.setItem("channelID", channelID);
  window.sessionStorage.setItem("channelName", channelName);
}

// Sends POST-request for repositories to server and creates check-list in selectLocations.html
async function getGitRepositories(Tokens) {
  let res = await fetch(`/getGithubRepositories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gitToken: Tokens.github,
    }),
  });
  let responseData = await res.json();
  const githubForm = document.getElementById("githubCheckbox");

  for (const j of responseData.Repositories) {
    githubForm.innerHTML += `<input type="checkbox" id="${j.owner}" name="${j.repositoryName}" value="${j.repositoryName}" class="githubRepositories">
    <label for="${j.repositoryName}" class="githubLabel"> ${j.repositoryName}</label> <br>`;
  }
}

// Checks each checklist-item for checkmark and saves checked repositories in session storage
function submitSelectedRepos() {
  for (const i of document.getElementsByClassName("githubRepositories")) {
    if (i.checked) {
      SelectedRepositories.push(i.value);
      SelectedRepositoriesOwner.push(i.id);
    }
  }
  window.sessionStorage.setItem("githubRepositories", SelectedRepositories);
  window.sessionStorage.setItem(
    "githubRepositoriesOwner",
    SelectedRepositoriesOwner
  );
}

// fetches Trello boards from API and adds them to an html checklist
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

  // Creates html element, where the user can select their Trello boards
  let trelloBoardForm = document.getElementById("trelloCheckbox");
  for (i of _json) {
    trelloBoardForm.innerHTML =
      `<input class="trelloBoards" type="checkbox" id="${i.id}" value="${i.name}"><label for="${i.id}" class="container">${i.name}</label><br>` +
      trelloBoardForm.innerHTML;
  }
}

// checks whether a board is selected. If so, pushes to the global array Boards
function getSelectedTrelloBoards() {
  for (checklistBoards of document.getElementsByClassName("trelloBoards")) {
    if (checklistBoards.checked) {
      TrelloBoards.push({
        id: checklistBoards.id,
        name: checklistBoards.value,
      });
    }
  }
  // store Boards in session storage and redirect user
  if (TrelloBoards.length > 0) {
    window.sessionStorage.setItem("TrelloBoards", JSON.stringify(TrelloBoards));
  }
}

// When continue button is pressed, go to overview. One location must be selected before being able to do so.
async function goToOverview() {
  getSelectedTrelloBoards();
  submitSelectedRepos();
  if (
    TrelloBoards.length != 0 ||
    SelectedRepositories.length != 0 ||
    window.sessionStorage.getItem("channelID") != null
  ) {
    window.location.replace("http://localhost:3000/overview/overview.html");
  } else {
    window.alert("Please select at least one location!");
  }
}
