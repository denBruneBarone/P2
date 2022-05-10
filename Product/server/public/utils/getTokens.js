// Returns the token of each application
function checkAuthenticationStatus() {
    var Tokens = {
      trello: window.sessionStorage.getItem("trello-token"),
      github: window.sessionStorage.getItem("github-token"),
      discord: window.sessionStorage.getItem("discord-token"),
    };
    return Tokens;
  }