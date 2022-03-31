// Selectors
/* const githubButton = document.querySelector('.gitHubButton');

// Event listeners
//githubButton.addEventListener('click', authorizeGithub);

console.log("vi er i index.js");


// Functions
function authorizeGithub(event) {
   event.preventDefault();
   console.log("Du har trykket på GitHub-knappen din noob");

   // Gør så vi kun kan trykke på knappen igen
   githubButton.disabled = true;
} */






function getGithubCode() {
   const url = new URL(window.location.href)
   console.log("Github code: " + url.searchParams.get("code"))
   const githubCode = url.searchParams.get("code");

   fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      mode: 'no-cors',
      headers: {
         'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
         client_id: "de223b25bb78c82a9bd7",
         client_secret: "38fd5fec5fc324960fede9825d4d4eacb87eb528",
         code: githubCode,
         redirect_uri: "http://localhost:3000/"
      })
   }).then(res => {
      console.log("vores .then returnerer: " + res);
      console.log(res)
   });
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

function checkForContinue(){

   document.getElementById("continueButton").disabled = true;

   if(Tokens.trello || Tokens.github || Tokens.discord){
      document.getElementById("continueButton").disabled = false;
   }

}

function onPageLoad() {
   checkAuthenticationStatus()
   checkForContinue()
}