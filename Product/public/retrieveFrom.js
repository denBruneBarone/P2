// selectors
const discordForm = document.querySelector("#discordForm");
const githubForm = document.querySelector("#githubForm");
const trelloForm = document.querySelector("#trelloForm");

// functions
function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  };
  return Tokens;
}

function goToOverview() {
  window.location.replace('http://localhost:3000/overview.html')
}

async function getGithubUsername(Tokens) {
  fetch(`/getGithubUsername`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gitToken: Tokens.github,
    }),
  }).then((response) => {
    response.json().then((responseData) => {
      gitUsername = responseData.gitUsername;
      console.log(responseData.username);
    })
  })
}

async function getGitRepositories(Tokens) {
  let Repositories = {};
  let gitUsername = "denBruneBarone";

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
      Repositories = responseData.Repositories;
      let i = 0;
      for (const j of Repositories) {
        githubForm.innerHTML += `<input type="checkbox" id="repo${i}" name="${j}" value="${j}" class="githubRepositories">
        <label for="repo${i}"> ${j} </label> <br>`;
        i++;
      }
    });
  });
}

function createLists() {
  let Tokens = checkAuthenticationStatus();

  if (Tokens.github) {
     let githubUsername = getGithubUsername(Tokens); 
     // console.log(githubUsername);
    getGitRepositories(Tokens);
  }
  if (Tokens.trello) {
    if (sessionStorage.Boards) {
      sessionStorage.removeItem("Boards")
    }
    getTrelloBoards()
  }
}

function submitSelectedRepos() {
  let selectedRepositories = [];
  button = document.getElementById("githubButton")
  button.innerHTML = "Github saved"
  button.disabled = true
  for (const i of document.getElementsByClassName("githubRepositories")) {
    if (i.checked) {
      selectedRepositories.push(i.value);
    }
  }
  console.log("selected repositories: " + selectedRepositories);
  window.sessionStorage.setItem("github-repositories", selectedRepositories);
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

  let Boards = [];
  const button = document.getElementById("trello-submit");
  button.addEventListener("click", () => {
    button.disabled = true
    button.innerHTML = "Trello saved."
    // iterates through the class, each id that is clicked is added to our list
    for (i of document.getElementsByClassName("trello-boards")) {
      if (i.checked) {
        Boards.push({ id: i.id, name: i.value });
      }
    }
    // store Boards in session storage and redirect user
    window.sessionStorage.setItem("Boards", JSON.stringify(Boards));
  });
}
