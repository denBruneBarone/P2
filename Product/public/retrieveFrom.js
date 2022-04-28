let Boards = [];

// Returns the token of each application
function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  };
  return Tokens;
}

// When continue button is pressed, go to overview. 
async function goToOverview() {
  await getSelectedTrelloBoards()
  await submitSelectedRepos()
  window.location.replace("http://localhost:3000/overview.html");
}

function getSelectedTrelloBoards() {
  for (i of document.getElementsByClassName("trello-boards")) {
    if (i.checked) {
      Boards.push({ id: i.id, name: i.value });
    }
  }
  // store Boards in session storage and redirect user
  window.sessionStorage.setItem("Boards", JSON.stringify(Boards));
}

// Sends POST-request for repositories to server and creates check-list in retrieveFrom.html
async function getGitRepositories(Tokens) {
  let Repositories = {};

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
      const githubForm = document.getElementById("githubForm");

      for (const j of responseData.Repositories) {
        githubForm.innerHTML += `<input type="checkbox" id="${j.owner}" name="${j.repositoryName}" value="${j.repositoryName}" class="githubRepositories">
        <label for="repo${j.repositoryName}"> ${j.repositoryName} </label> <br>`;
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
  if (Tokens.trello) {
    if (sessionStorage.Boards)
      sessionStorage.removeItem("Boards");

    getTrelloBoards();
  }
  if (Tokens.discord) {
    //getDiscordGuilds();
  }
}

// Checks each checklist-item for checkmark and saves checked repositories in session storage
function submitSelectedRepos() {
  let selectedRepositories = [];
  let selectedRepositoriesOwner = [];

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
  let trelloBoardForm = document.getElementById("trello-boards");
  for (i of _json) {
    trelloBoardForm.innerHTML =
      `<input class="trello-boards" type="checkbox" id="${i.id}" value="${i.name}"><label for="${i.id}">${i.name}</label><br>` +
      trelloBoardForm.innerHTML;
  }
}

/* Retrieves an authorized discord users server/guild list */
async function getDiscordGuilds() {
  let discordGuilds = await fetch(`https://discord.com/api/users/@me/guilds`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + window.sessionStorage.getItem("discord-token"),
    },
  });
  let discordGuildList = await discordGuilds.json();
  console.log(discordGuildList);


  let discordGuildForm = document.getElementById("discordGuilds");
  for (i of discordGuildList) {
    discordGuildForm.innerHTML =
      `<input class="discordGuilds" type="button" id="${i.id}" value="${i.name}" onlick="getDiscordChannels(${i.id})"><label for="${i.id}"></label><br>` +
      discordGuildForm.innerHTML;
  }
}

/* 

async function getDiscordChannels(discordGuildID){
  
  let discordChannels = await fetch(`https://discord.com/api/guilds/${discordGuildID}/preview`, {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + window.sessionStorage.getItem("discord-token"),
    }
  }
  );

  let discordChannelList = await discordChannels.json();

  for (i of discordChannelList){

    console.log(i.channels)

  }
}*/

