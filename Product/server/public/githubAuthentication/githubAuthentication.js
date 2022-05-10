// githubCode is read from the parameters of the url
let githubCode = new URL(window.location.href).searchParams.get("code");

/* this function sends a POST request to our server containing githubCode. 
It then waits for response to be fully loaded before saving github-token to session storeage and redirecting to localhost:3000 */
async function postGithubTokenToServer(githubCode) {
    let res = await fetch("/githubToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            gitCode: githubCode,
        })
    })
    let responseData = await res.json()
    window.sessionStorage.setItem("github-token", responseData.token);
    window.location.replace("http://localhost:3000/");
}
postGithubTokenToServer(githubCode);