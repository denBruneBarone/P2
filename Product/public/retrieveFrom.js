let Boards = [];

// functions
function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  };
  return Tokens;
}

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

async function getGithubUsername(Tokens) {
  let response = await fetch(`/getGithubUsername`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gitToken: Tokens.github,
    }),
  });
  let responseData = await response.json();
  if (!response.ok) console.log("fejl");
  let gitUsername = responseData.gitUsername;
  return gitUsername;
}

async function getGitRepositories(Tokens, githubUsername) {
  let Repositories = {};
  console.log("vi er i getgitrepos");
  fetch(`/getGithubRepositories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gitToken: Tokens.github,
      username: githubUsername,
    }),
  }).then((response) => {
    response.json().then((responseData) => {
      Repositories = responseData.Repositories;
      console.log("repositiories:");
      console.log(Repositories);

      const githubForm = document.getElementById("githubForm");

      let i = 0;
      for (const j of Repositories) {
        githubForm.innerHTML += `<input type="checkbox" id="repo${i}" name="${j}" value="${j}" class="githubRepositories">
        <label for="repo${i}"> ${j} </label> <br>`;
        i++;
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
    if (sessionStorage.githubRepositories) { // Rune Lucas: har ændret navn på sessionStorage item, ellers virkede denne if statement ikke
      sessionStorage.removeItem("githubRepositories");
    }
    let githubUsername = await getGithubUsername(Tokens);

    window.sessionStorage.setItem("github-username", githubUsername);

    getGitRepositories(Tokens, githubUsername);
  }
  if (Tokens.trello) {
    if (sessionStorage.Boards) {
      sessionStorage.removeItem("Boards");
    }
    getTrelloBoards();
  }
  if (Tokens.discord) {
    //getDiscordGuilds();
  }
}

function submitSelectedRepos() {
  let selectedRepositories = [];
  // button = document.getElementById("githubButton");
  // button.innerHTML = "Github saved";
  // button.disabled = true;
  for (const i of document.getElementsByClassName("githubRepositories")) {
    if (i.checked) {
      selectedRepositories.push(i.value);
    }
  }
  console.log("selected repositories: " + selectedRepositories);
  window.sessionStorage.setItem("githubRepositories", selectedRepositories);
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

