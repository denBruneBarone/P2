// Selectors
const githubButton = document.querySelector('.githubButton');

// Event listeners
githubButton.addEventListener('click', authorizeGithub);

// Functions
function authorizeGithub(event) {
   event.preventDefault();
   console.log("Du har trykket på GitHub-knappen din noob");

   // Gør så vi kun kan trykke på knappen igen
   githubButton.disabled = true;
}

function sendToken() {
    console.log(window.location.hash)
    fetch("/token", {
       method: "POST",
       headers: {content_type: "text"},
       body: {
          token: window.location.hash
       }
       // api: "" // some clientside function to grab the endpoint, so we can specify the apis type (eg. Disc) in their return_urls
    })      
 }