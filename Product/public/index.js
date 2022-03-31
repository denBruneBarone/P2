function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  };

  document.getElementById("discord_label").innerHTML = Tokens.discord
    ? "Authenticated"
    : "Not authenticated";
  document.getElementById("trello_label").innerHTML = Tokens.trello
    ? "Authenticated"
    : "Not authenticated";
  document.getElementById("github_label").innerHTML = Tokens.github
    ? "Authenticated"
    : "Not authenticated";

  return Tokens;
}

function checkForContinue(Tokens) {

  if(Tokens.discord !== null){
   document.getElementById("continueButton").disabled = false;
   document.getElementById("discordButton").style = 'border-color: #27af49'
  }
  else if(Tokens.github !== null){
   document.getElementById("continueButton").disabled = false;
   document.getElementById("gitHubButton").style = 'border-color: #27af49'
  }
  else if(Tokens.trello !== null){
   document.getElementById("continueButton").disabled = false;
   document.getElementById("trelloButton").style = 'border-color: #27af49'
  }
}

function goToOverview() {
  fetch("/overview", () => {
  });
}

function onPageLoad() {
  checkForContinue(checkAuthenticationStatus());
}
