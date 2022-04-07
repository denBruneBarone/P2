exchangeCodeWithToken()
async function exchangeCodeWithToken() {
    var r = await fetch("http://localhost:3000/discord-code", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: window.location.search.substring(window.location.search.indexOf("=") + 1)
        })
    })

    const _json = await r.json()

    // store token in session and redirect user to index
    window.sessionStorage.setItem("discord-token", _json.token)
    window.location.replace("http://localhost:3000/")
}