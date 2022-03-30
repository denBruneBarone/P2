// Selectors
/* const githubButton = document.querySelector('.gitHubButton');

// Event listeners
githubButton.addEventListener('click', authorizeGithub);

console.log("vi er i index.js");


// Functions
function authorizeGithub(event) {
   event.preventDefault();
   console.log("Du har trykket på GitHub-knappen din noob");

   // Gør så vi kun kan trykke på knappen igen
   githubButton.disabled = true;
} */





function sendFragment() {
   console.log(window.location.hash)
   fetch("/token", {
      method: "POST",
      headers: { content_type: "text" },
      body: {
         token: window.location.hash
      }
      // api: "" // some clientside function to grab the endpoint, so we can specify the apis type (eg. Disc) in their return_urls
   })
}

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