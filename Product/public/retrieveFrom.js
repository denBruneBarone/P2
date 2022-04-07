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

function getGitRepositories(Tokens) {
  let Repositories = {};
  let gitUsername = "denBruneBarone";

  fetch(`https://api.github.com/users/${gitUsername}/repos`, {
    method: "GET",
    headers: {
      Authorization: "token " + Tokens.github,
      accept: "application/vnd.github.v3+json",
    },
  }).then((response) => {
    console.log("response is " + response);
  });

  return Repositories;
}

function createLists() {
  let Tokens = checkAuthenticationStatus();

  if (Tokens.github !== null) {
    let githubList = getGitRepositories(Tokens);
  }
}
