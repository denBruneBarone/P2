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