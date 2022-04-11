let Actions = [] // trello

async function fetchData() {
  timeInterval()

  if (document.getElementById("startTime").value == "") {
    return
  }
  if (document.getElementById("trello").value == "enabled") {
    trelloActionsUsersBoards()
  }
  if (document.getElementById("github").value == "enabled") {
    let githubCommits = await fetchGithubLogs(
      window.sessionStorage.getItem("github-username"),
      checkAuthenticationStatus().github,
      window.sessionStorage.getItem("github-repositories")
    )
    console.log(githubCommits)
    displayGitCommits(githubCommits)
  }
}

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
    Actions.push({
      userInputDateSince: since,
      userInputDateBefore: before,
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
        Actions[Actions.length - 1].date,
        i.id
      )
    }
  }
  Actions.sort(compareDate)
  overviewWindow = document.getElementById("overviewWindow")
  Actions.forEach((i) => {
    switch (i.object.type) {
      case "updateList":
        if (i.object.data.old.name) {
          i.userMessage =
            'Changed name of list from "' +
            i.object.data.old.name +
            '" to "' +
            i.object.data.list.name
        } else if (i.object.data.old.pos) {
          i.userMessage =
            'The list "' + i.object.data.list.name + '" got moved in position'
        } else if (i.object.data.list.closed) {
          i.userMessage = 'Deleted the list "' + i.object.data.list.name + '"'
        }

        break
      case "createCard":
        i.userMessage = 'created card "' + i.object.data.card.name + '"'
        break
      case "updateCard":
        if (i.object.data.card.cover != undefined) {
          // the cover was changed
          i.userMessage =
            "the cover was changed to " +
            i.object.data.card.cover.color +
            ' on "' +
            i.object.data.card.name +
            '"'
          break
        } else if (i.object.data.card.desc) {
          i.userMessage =
            'Updated the describtion from the card "' +
            i.object.data.card.name +
            '" to "' +
            i.object.data.card.desc +
            '"'
        } else if (i.object.data.card.due) {
          i.userMessage = "Changed due date to " + i.object.data.card.due
        } else if (i.object.data.card.dueReminder) {
          i.userMessage =
            "Updated due-reminder to " +
            i.object.data.card.dueReminder +
            " minutes"
        } else if (i.object.data.card.closed) {
          i.userMessage = '"' + i.object.data.card.name + '" has been archived'
        } else if (i.object.data.listAfter) {
          i.userMessage =
            '"' +
            i.object.data.card.name +
            '" has been moved from ' +
            i.object.data.listBefore.name +
            " to " +
            i.object.data.listAfter.name +
            " by " +
            i.object.memberCreator.fullName
        } else if (i.object.data.old.name) {
          i.userMessage =
            'renamed "' +
            i.object.data.old.name +
            '" to "' +
            i.object.data.card.name
        } else if (i.object.data.old.pos) {
          i.userMessage =
            'The card "' + i.object.data.card.name + '" got moved in position'
          break
        } else if (i.object.data.card.start) {
          i.userMessage = "Start date set to " + i.object.data.card.start
          break
        } else if (i.object.data.board.updateCheckItemStateOnCard) {
          i.userMessage =
            "This was updated " + i.object.data.board.updateCheckItemStateOnCard //Dette skal rettes. Dávur.
          break
        }
        break

      case "addMemberToCard":
        i.userMessage =
          "added " + i.object.member.fullName + " to " + i.object.data.card.name

        break
      case "removeMemberFromCard":
        i.userMessage =
          "removed " +
          i.object.member.fullName +
          " from " +
          i.object.data.card.name
        break
      case "addChecklistToCard":
        i.userMessage = "added a checklist to " + i.object.data.card.name
        break
      case "copyBoard":
        i.userMessage =
          'created a new board from template "' + i.object.data.board.name + '"'
        break
    }
    if (i.userMessage == undefined) {
      i.userMessage =
        "json: " + JSON.stringify(i.object.data) + JSON.stringify(i.object.type)
    } else {
      i.userMessage =
        i.date +
        " (Trello) " +
        i.object.memberCreator.fullName +
        ": " +
        i.userMessage
    }
    overviewWindow.innerHTML += `<p>${i.userMessage}</p>`
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
  return responseData
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
    document.getElementById("discord").style = "opacity: 0.5; border: none"
  }
  if (Tokens.github === null) {
    document.getElementById("github").disabled = true
    document.getElementById("github").style = "opacity: 0.5; border: none"
  }
  if (Tokens.trello === null) {
    document.getElementById("trello").disabled = true
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
