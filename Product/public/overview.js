let Events = []
let TrelloActions = []

// Onlick button "send", fetch commits, board actions and Discord messages. Then displays them
async function fetchData() {
  timeInterval()

  if (document.getElementById("startTime").value == "" ||
    (document.getElementById("trello").value == "disabled" &&
      document.getElementById("github").value == "disabled" &&
      document.getElementById("discord").value == "disabled")) {
    return
  }
  Events = []
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
  if (!response.ok) console.log("fejl i response på github")
  responseData.forEach(GitCommit => {
    Events.push(GitCommit)
  })
}

// Checks whether the selected time interval is valid.
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
function authApi() { // dry concept malthe
  let Tokens = checkAuthenticationStatus()
  for (alias of Object.keys(Tokens)) {
    console.log(alias)
    if (Tokens[alias] === null) {
      console.log(alias, "disabled")
      document.getElementById(alias).disabled = true
      document.getElementById(alias).value = "disabled"
      document.getElementById(alias).style = "opacity: 0.5; border: none"
    }
  }
}

function toggleApi(btn_id) {
  if (document.getElementById(btn_id).value == "enabled") {
    document.getElementById(btn_id).value = "disabled"
    document.getElementById(btn_id).style = "border-color: red"
    //Add function til at stoppe afsending af data i box
  }
  else if (document.getElementById(btn_id).value == "disabled") {
    if (btn_id == "trello") {
      if (!window.sessionStorage.getItem("Boards")) {
        window.alert("If you want to load your Trello Actions, please select your availible Trello Boards!")
        return
      }
    }
    document.getElementById(btn_id).value = "enabled"
    document.getElementById(btn_id).style = "border-color: #27af49"
    //Add function til at sende data i box
  }
}
