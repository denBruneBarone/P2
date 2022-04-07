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

  if (Tokens.github !== null) {
    /* let githubUsername = getGithubUsername(); */
    getGitRepositories(Tokens);
  }
}

function submitSelectedRepos() {
  let selectedRepositories = [];
  for (const i of document.getElementsByClassName("githubRepositories")) {
    if (i.checked) {
      selectedRepositories.push(i.value);
    }
  }
  console.log("selected repositories: " + selectedRepositories);
  window.sessionStorage.setItem("github-repositories", selectedRepositories);

  goToOverview()
}

