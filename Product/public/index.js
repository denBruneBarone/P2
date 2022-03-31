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

  return Tokens;
}

function checkForContinue(Tokens) {
  if (Tokens.discord !== null || Tokens.github !== null || Tokens.trello !== null) {
    document.getElementById("continueButton").disabled = false;
  }
}

function goToOverview() {
  fetch("/overview", () => {
    console.log("det virker");
  });
}

function onPageLoad() {
  checkForContinue(checkAuthenticationStatus());
}
