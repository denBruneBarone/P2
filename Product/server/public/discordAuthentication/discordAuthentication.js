/* Sends the code generated from Discord to the server, which then exchanges it with the discord Token. 
The fetched token is then stored in sessionStorage. Then, the client is redirected back to index.html */
async function exchangeCodeWithToken() {
  var r = await fetch("/discord-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: window.location.search.substring(
        window.location.search.indexOf("=") + 1
      ),
    }),
  });

  const _json = await r.json();

  if (_json.error) {
    // error
    alert(_json.errorMsg + ", redirecting in 5...");
    setTimeout(() => {
      window.location.replace("http://localhost:3000/");
    }, 5000);
  } else {
    // store token in session and redirect user to index
    window.sessionStorage.setItem("discord-token", _json.token);
    window.location.replace("http://localhost:3000/");
  }
}
exchangeCodeWithToken();
