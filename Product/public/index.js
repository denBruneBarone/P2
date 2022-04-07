function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  };

  return Tokens;
}

function checkForContinue(Tokens) {
  if (Tokens.discord !== null) {
    document.getElementById("continueButton").disabled = false;
    document.getElementById("discordButton").disabled = true;
    document.getElementById("discordButton").style = "border-color: #27af49";
  }
  if (Tokens.github !== null) {
    document.getElementById("continueButton").disabled = false;
    document.getElementById("gitHubButton").disabled = true;
    document.getElementById("gitHubButton").style = "border-color: #27af49";
  }
  if (Tokens.trello !== null) {
    document.getElementById("continueButton").disabled = false;
    document.getElementById("trelloButton").disabled = true;
    document.getElementById("trelloButton").style = "border-color: #27af49";
  }
}

function goToOverview() {
  fetch("/overview", () => {});
}

function onPageLoad() {
  checkForContinue(checkAuthenticationStatus());
}
