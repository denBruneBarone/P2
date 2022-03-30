// Selectors
const githubButton = document.querySelector('.githubButton');

// Event listeners
//githubButton.addEventListener('click', authorizeGithub);

// Functions
function authorizeGithub(event) {
   event.preventDefault();
   console.log("Du har trykket på GitHub-knappen din noob");

   // Gør så vi kun kan trykke på knappen igen
   githubButton.disabled = true;
}

function checkAuthenticationStatus() {
   var Tokens = {
      trello: window.sessionStorage.getItem("trello-token"),
      github: window.sessionStorage.getItem("github-token"),
      discord: window.sessionStorage.getItem("discord-token"),    
   }
   
   document.getElementById("trello_label").innerHTML = Tokens.trello ? "Authenticated" : "Not authenticated"
   document.getElementById("github_label").innerHTML = Tokens.github ? "Authenticated" : "Not authenticated"
   document.getElementById("discord_label").innerHTML = Tokens.discord ? "Authenticated" : "Not authenticated"

   console.log(Tokens)   
}      

function onPageLoad() {
   checkAuthenticationStatus()
}