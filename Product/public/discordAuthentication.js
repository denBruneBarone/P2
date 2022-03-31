
// send code to server to send a post request, recieve the token back
let code = window.location.search.substring(window.location.search.indexOf("=") + 1)
console.log(typeof code)

fetch("http://localhost:3000/discord-code", {
    method: "POST",
    headers: { 
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        code: code
    })
}).then(r => {
    r.json().then(data => {
        window.sessionStorage.setItem("discord-token", data.token)
        window.location.replace("http://localhost:3000/")
    })
})
