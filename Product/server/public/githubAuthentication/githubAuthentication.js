// githubCode is read from the parameters of the url
let githubCode = new URL(window.location.href).searchParams.get("code");

/* this function sends a POST request to our server containing githubCode. 
It then waits for response to be fully loaded before saving github-token to session storeage and redirecting to localhost:3000 */
async function postGithubTokenToServer(githubCode) {
    fetch("/githubToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            gitCode: githubCode,
        })
    }).then(response => {
        response.json().then(responseData => {
            window.sessionStorage.setItem("github-token", responseData.token);
            window.location.replace("http://localhost:3000/");
        });
    });
}
postGithubTokenToServer(githubCode);