let Events = []
let TrelloActions = []

// Onclick button "send", fetch commits, board actions and Discord messages. Then displays them
async function fetchData() {
  timeInterval()

  if (document.getElementById("startTime").value == "" ||
    (document.getElementById("trello").value == "disabled" &&
      document.getElementById("github").value == "disabled" &&
      document.getElementById("discord").value == "disabled")) {
    return
  }

  Events = []
  console.log(1)
  if (window.sessionStorage.getItem("discord-token") && document.getElementById("discord").value == "enabled"){
    document.getElementById("overviewWindow").innerHTML = "<h1>Loading Discord Messages...</h1>"
    console.log(2)
    await getDiscMessages();
  }
  if (window.sessionStorage.getItem("trello-token") && document.getElementById("trello").value == "enabled" && window.sessionStorage.getItem("Boards")) {
    document.getElementById("overviewWindow").innerHTML = "<h1>Loading Trello Actions...</h1>"
    await trelloActionsUsersBoards()
  }
  if (window.sessionStorage.getItem("github-token") && document.getElementById("github").value == "enabled") {

    document.getElementById("overviewWindow").innerHTML = "<h1>Loading Github Commits...</h1>"

    let repositoriesString = window.sessionStorage.getItem("githubRepositories"),
      repositoriesOwnerString = window.sessionStorage.getItem("githubRepositoriesOwner");

    let RepositoriesArray = repositoriesString.split(","),
      RepositoriesOwnerArray = repositoriesOwnerString.split(",");

    if (RepositoriesArray.length == 1 && RepositoriesArray[0] == "") { }
    else {
      // Calls the function fetchGithubLogs for each repository selected.
      for (let i = 0; i < RepositoriesArray.length; i++) {
        await fetchGithubLogs(
          RepositoriesOwnerArray[i],
          checkAuthenticationStatus().github,
          RepositoriesArray[i],
          document.getElementById("startTime").value,
          document.getElementById("endTime").value
        )
      }

    }
  }
  Events.forEach(Event => {
    console.log(Event)
  })
  document.getElementById("overviewWindow").innerHTML = "<h1>Sorting Events...</h1>"
  Events.sort(compareDate)
  document.getElementById("overviewWindow").innerHTML = ""
  if (Events.length == 0) {
    document.getElementById("overviewWindow").innerHTML =
      `<h1>Wow, such empty...</h1>`
  }
  else {
    Events.forEach(Event => {
      document.getElementById("overviewWindow").innerHTML +=
        `<p>${Event.date} (${Event.service}) ${Event.author}: ${Event.message} (${Event.location})</p>`
    })
  }
}

// compare objects which have the property "date"
function compareDate(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

async function trelloFetchBoard(since, before, boardID) {
  let key = "0b862279af0ae326479a419925f3ea7a"
  let token = window.sessionStorage.getItem("trello-token")
  since = since == "" ? "" : "&since=" + since
  before = before == "" ? "" : "&before=" + before
  let r = await fetch(
    `https://api.trello.com/1/boards/${boardID}/actions/?key=${key}&token=${token}${since}${before}&limit=1000`
  )
  let _json = await r.json()
  for (j of _json) {
    TrelloActions.push({
      service: "trello",
      date: j.date,
      type: j.type,
      object: j,
    })
  }
  return _json.length
}

async function trelloActionsUsersBoards() {
  // iterate through boards, send request for each board and handle actions

  let since = document.getElementById("startTime").value
  let before = document.getElementById("endTime").value

  Boards = await JSON.parse(window.sessionStorage.getItem("Boards"))

  for (Board of Boards) {
    let actionCount = 0
    actionCount = await trelloFetchBoard(since, before, Board.id)

    while (actionCount == 1000) {
      actionCount = await trelloFetchBoard(
        since,
        TrelloActions[TrelloActions.length - 1].date,
        Board.id
      )
    }
  }

  document.getElementById("overviewWindow").innerHTML = await "<h1>Processing Trello Actions</h1>"
  for (Action of TrelloActions) {
    await sortTrello(Action)
    Events.push(Action)
  }
}

// Returns the token of each application
function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  }
  return Tokens
}

// Sends POST-request to server to fetch commits from Github. Pushes commits to Event-array.
async function fetchGithubLogs(owner, token, Repositories, startTime, endTime) {
  let response = await fetch("/getGitCommits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gitRepositoriesOwner: owner,
      gitToken: token,
      gitRepositories: Repositories,
      from: startTime,
      to: endTime,
    }),
  })
  let responseData = await response.json()
  if (!response.ok) console.log("Error in respone on github")
  responseData.forEach(GitCommit => {
    Events.push(GitCommit)
  })
}

async function getDiscMessages(){
  const guildName = window.sessionStorage.getItem("guildName");
  const channelName = window.sessionStorage.getItem("channelName");
  const channelID = window.sessionStorage.getItem("channelID");
  const startDate = document.getElementById("startTime").value;
  const endDate = document.getElementById("endTime").value;
  console.log(3)
  let response = await fetch(`/disc_get_messages`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        intersectedGuildName: guildName,
        discord_channel_name: channelName,
        discord_channel_id: channelID,
        start_date: startDate,
        end_date: endDate
    }),
  })
  let responseData = await response.json();
  console.log(4)
  if (response.ok)
  console.log(5)
  responseData.messages.forEach(messages => {
    Events.push(messages)
  })
}

/*async function displayDiscMessages(){
  let messages = await getDiscMessages();

  overviewWindow = document.getElementById("overviewWindow")
  for (const i of messages) {
    overviewWindow.innerHTML += `<p>User: ${i.user} || Date: ${i.timestamp}<br>
    Message: ${i.content}</p><br><br>`+ overviewWindow.innerHTML
  }
}*/

//Function for when selecting a start and end date in the selector
function timeInterval() {
  var dateStringStart = Date.parse(document.getElementById("startTime").value)
  var dateStringEnd = Date.parse(document.getElementById("endTime").value)

  if (dateStringEnd < dateStringStart) {
    alert("End date cannot be less than the start date!")
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
    return
  }
}

function onLoad() {
  authApi()
}

// preset's the services toggles
function authApi() {
  let Tokens = checkAuthenticationStatus()
  for (alias of Object.keys(Tokens)) {
    if (Tokens[alias] === null) {
      document.getElementById(alias).value = "disabled"
      document.getElementById(alias).style = "opacity: 0.5; border: none"
    }
    else if (alias == "trello") {
      if (sessionStorage.getItem("Boards") == undefined) {
        toggleApi(alias)
      }
    }
    else if (alias == "github") {
      if (sessionStorage.getItem("githubRepositories") == "") {
        toggleApi(alias)
      }
    }
  }
}

function getAuthUrl(alias) {
  switch (alias) {
    case "trello":
      return "https://trello.com/1/authorize?key=0b862279af0ae326479a419925f3ea7a&return_url=http://localhost:3000/trello&scope=read"
    case "discord":
      return "https://discord.com/api/oauth2/authorize?client_id=957208170365866044&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdiscord&response_type=code&scope=guilds+messages.read"
    case "github":
      return "https://github.com/login/oauth/authorize?client_id=de223b25bb78c82a9bd7&scope=repo user"
  }
}

//Function to toggle the different services' data off and on,
function toggleApi(btn_id) {
  if (document.getElementById(btn_id).value == "enabled") {
    document.getElementById(btn_id).value = "disabled"
    document.getElementById(btn_id).style = "border-color: red"
  }
  else if (document.getElementById(btn_id).value == "disabled") {
    if (window.sessionStorage.getItem(btn_id + "-token") == undefined) {
      window.alert("Please authenticate our Appliction")
      window.location.replace(getAuthUrl(btn_id))
      return 
    }
    else if (btn_id == "trello") {
      if (window.sessionStorage.getItem("Boards") == undefined) {
        window.alert("Please select your available Trello Boards")
        window.location.replace("http://localhost:3000/retrieveFrom.html")
        return
      }
    }
    else if(btn_id == "github") {
      if (window.sessionStorage.getItem("githubRepositories") == "") {
        window.alert("Please select your available Github Repositories")
        window.location.replace("http://localhost:3000/retrieveFrom.html")
        return
      }
    }
    else if(btn_id == "discord") {
      if (window.sessionStorage.getItem("channelID") == "") {
        window.alert("Please select your available server channels")
        window.location.replace("http://localhost:3000/retrieveFrom.html")
        return
      }
    }
    document.getElementById(btn_id).value = "enabled"
    document.getElementById(btn_id).style = "border-color: #27af49"
  }
}
