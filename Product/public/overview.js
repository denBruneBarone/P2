let Events = []

async function fetchData() {
  timeInterval()
  

  if (document.getElementById("startTime").value == "" ||
    (document.getElementById("trello").value == "disabled" &&
      document.getElementById("github").value == "disabled" &&
      document.getElementById("discord").value == "disabled")) {
    return
  }
  Events = []
  if (document.getElementById("trello").value == "enabled") {
    document.getElementById("overviewWindow").innerHTML = "<h1>Loading Trello Actions...</h1>"
    await trelloActionsUsersBoards()
  }
  if (document.getElementById("github").value == "enabled") {
    
  document.getElementById("overviewWindow").innerHTML = "<h1>Loading Github Commits...</h1>"
    let githubCommits = await fetchGithubLogs(
      window.sessionStorage.getItem("github-username"),
      checkAuthenticationStatus().github,
      window.sessionStorage.getItem("github-repositories")
    )
    // console.log(githubCommits)
    // displayGitCommits(githubCommits)
  }
  document.getElementById("overviewWindow").innerHTML = "<h1>Sorting Events...</h1>"
  Events.sort(compareDate)
  document.getElementById("overviewWindow").innerHTML = ""
  Events.forEach(Event => {
  document.getElementById("overviewWindow").innerHTML += 
  `<p>${Event.date} (${Event.service}) ${Event.author}: ${Event.message}</p>`
})}

// compare objects which have the property "date"
function compareDate(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

async function trelloFetch(since, before, boardID) {
  let key = "0b862279af0ae326479a419925f3ea7a"
  let token = window.sessionStorage.getItem("trello-token")
  since = since == "" ? "" : "&since=" + since
  before = before == "" ? "" : "&before=" + before
  let r = await fetch(
    `https://api.trello.com/1/boards/${boardID}/actions/?key=${key}&token=${token}${since}${before}&limit=1000`
  )
  let _json = await r.json()
  for (j of _json) {
    Events.push({
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

  Boards = JSON.parse(window.sessionStorage.getItem("Boards"))

  for (i of Boards) {
    let actionCount = 0
    actionCount = await trelloFetch(since, before, i.id)

    while (actionCount == 1000) {
      actionCount = await trelloFetch(
        since,
        Events[Events.length - 1].date,
        i.id
      )
    }
  }
  document.getElementById("overviewWindow").innerHTML = "<h1>Processing Trello Actions</h1>"
  overviewWindow = document.getElementById("overviewWindow")
  Events.forEach((i) => {
    switch (i.object.type) {
      case "updateList":
        if (i.object.data.old.name) {
          i.message =
            'Changed name of list from "' +
            i.object.data.old.name +
            '" to "' +
            i.object.data.list.name
        } else if (i.object.data.old.pos) {
          i.message =
            'The list "' + i.object.data.list.name + '" got moved in position'
        } else if (i.object.data.list.closed) {
          i.message = 'Deleted the list "' + i.object.data.list.name + '"'
        }

        break
      case "createCard":
        i.message = 'created card "' + i.object.data.card.name + '"'
        break
      case "updateCard":
        if (i.object.data.card.cover != undefined) {
          // the cover was changed
          i.message =
            "the cover was changed to " +
            i.object.data.card.cover.color +
            ' on "' +
            i.object.data.card.name +
            '"'
          break
        } else if (i.object.data.card.desc) {
          i.message =
            'Updated the describtion from the card "' +
            i.object.data.card.name +
            '" to "' +
            i.object.data.card.desc +
            '"'
        } else if (i.object.data.card.due) {
          i.message = "Changed due date to " + i.object.data.card.due
        } else if (i.object.data.card.dueReminder) {
          i.message =
            "Updated due-reminder to " +
            i.object.data.card.dueReminder +
            " minutes"
        } else if (i.object.data.card.closed) {
          i.message = '"' + i.object.data.card.name + '" has been archived'
        } else if (i.object.data.listAfter) {
          i.message =
            '"' +
            i.object.data.card.name +
            '" has been moved from ' +
            i.object.data.listBefore.name +
            " to " +
            i.object.data.listAfter.name +
            " by " +
            i.object.memberCreator.fullName
        } else if (i.object.data.old.name) {
          i.message =
            'renamed "' +
            i.object.data.old.name +
            '" to "' +
            i.object.data.card.name
        } else if (i.object.data.old.pos) {
          i.message =
            'The card "' + i.object.data.card.name + '" got moved in position'
          break
        } else if (i.object.data.card.start) {
          i.message = "Start date set to " + i.object.data.card.start
          break
        } else if (i.object.data.board.updateCheckItemStateOnCard) {
          i.message =
            "This was updated " + i.object.data.board.updateCheckItemStateOnCard //Dette skal rettes. Dávur.
          break
        }
        break

      case "addMemberToCard":
        i.message =
          "added " + i.object.member.fullName + " to " + i.object.data.card.name

        break
      case "removeMemberFromCard":
        i.message =
          "removed " +
          i.object.member.fullName +
          " from " +
          i.object.data.card.name
        break
      case "addChecklistToCard":
        i.message = "added a checklist to " + i.object.data.card.name
        break
      case "copyBoard":
        i.message =
          'created a new board from template "' + i.object.data.board.name + '"'
        break
    }
    if (i.message == undefined) {
      i.message =
        "json: " + JSON.stringify(i.object.data) + JSON.stringify(i.object.type)
    } else {
      i.author = i.object.memberCreator.fullName
    }
  })
}

function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  }
  return Tokens
}

async function fetchGithubLogs(username, token, Repositories) {
  let response = await fetch("/getGitCommits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gitUsername: username,
      gitToken: token,
      gitRepositories: Repositories,
      /* logsFrom: fromDate,
      logsTo: toDate, */
    }),
  })
  let responseData = await response.json()
  if (!response.ok) console.log("fejl i response på github")
  responseData.forEach(GitCommit => {GitCommit.service = "github"; Events.push(GitCommit) })
  // return responseData
}

function displayGitCommits(CommitsArray) {
  overviewWindow = document.getElementById("overviewWindow")
  for (const Commit of CommitsArray) {
    overviewWindow.innerHTML += `<p>Author: ${Commit.author} || Date: ${Commit.date}<br>
    Message: ${Commit.message}</p><br><br>`
  }
}

function timeInterval() {
  var dateStringStart = Date.parse(document.getElementById("startTime").value)
  var dateStringEnd = Date.parse(document.getElementById("endTime").value)

  if (dateStringEnd < dateStringStart) {
    alert("End date cannot be less than the start date!")
    document.getElementById("startTime").value = ""
    document.getElementById("endTime").value = ""
    return
  }
}

function onLoad() {
  authApi()
}

function authApi() {
  let Tokens = checkAuthenticationStatus()
  if (Tokens.discord === null) {
    document.getElementById("discord").disabled = true
    document.getElementById("discord").value = "disabled"
    document.getElementById("discord").style = "opacity: 0.5; border: none"
  }
  if (Tokens.github === null) {
    document.getElementById("github").disabled = true
    document.getElementById("github").value = "disabled"
    document.getElementById("github").style = "opacity: 0.5; border: none"
  }
  if (Tokens.trello === null) {
    document.getElementById("trello").disabled = true
    document.getElementById("trello").value = "disabled"
    document.getElementById("trello").style = "opacity: 0.5; border: none"
  }
}

function toggleApi(btn_id) {
  if (document.getElementById(btn_id).value == "enabled") {
    document.getElementById(btn_id).value = "disabled"
    document.getElementById(btn_id).style = "border-color: red"
    //Add function til at stoppe afsending af data i box
  } else if (document.getElementById(btn_id).value == "disabled") {
    document.getElementById(btn_id).value = "enabled"
    document.getElementById(btn_id).style = "border-color: #27af49"
    //Add function til at sende data i box
  }
}
