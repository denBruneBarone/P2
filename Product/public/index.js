function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  };

  document.getElementById("trello_label").innerHTML = Tokens.trello
    ? "Authenticated"
    : "Not authenticated";
  document.getElementById("github_label").innerHTML = Tokens.github
    ? "Authenticated"
    : "Not authenticated";
  document.getElementById("discord_label").innerHTML = Tokens.discord
    ? "Authenticated"
    : "Not authenticated";

  console.log(Tokens);
}

function checkForContinue() {
  document.getElementById("continueButton").disabled = true;
  if (Tokens.trello || Tokens.github || Tokens.discord) {
    document.getElementById("continueButton").disabled = false;
  }
}

function onPageLoad() {
  checkAuthenticationStatus();
  // checkForContinue();
}
