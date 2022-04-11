let Actions = []; // trello

function fetchData() {
  timeInterval();
  if (document.getElementById("startTime").value == "") {
    return;
  }
  if (document.getElementById("trello").value == "enabled") {
    /* fetchTrello(); */
  }
}

// compare objects which have the property "date"
function compareDate(a, b) {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

async function fetchTrello() {
  // iterate through boards, send request for each board and handle actions

  let since =
    document.getElementById("startTime").value == ""
      ? ""
      : "&since=" + document.getElementById("startTime").value;
  let before =
    document.getElementById("endTime").value == ""
      ? ""
      : "&before=" + document.getElementById("endTime").value;
  let key = "0b862279af0ae326479a419925f3ea7a";
  let token = window.sessionStorage.getItem("trello-token");
  Boards = JSON.parse(window.sessionStorage.getItem("Boards"));

  for (i of Boards) {
    let r = await fetch(
      `https://api.trello.com/1/boards/${i.id}/actions/?key=${key}&token=${token}${since}${before}&limit=1000`
    );
    let _json = await r.json();
    for (j of _json) {
      Actions.push({
        userInputDateSince: since,
        userInputDateBefore: before,
        date: j.date,
        type: j.type,
        object: j,
      });
    }
  }
  Actions.sort(compareDate);
  overviewWindow = document.getElementById("overviewWindow");
  Actions.forEach((i) => {
    switch (i.object.type) {
      case "createCard":
        i.userMessage =
          i.object.memberCreator.fullName +
          ' created card "' +
          i.object.data.card.name +
          " at " +
          i.date;
        break;
      case "updateCard":
        if (i.object.data.card.cover != undefined) {
          // the cover was changed
          i.userMessage =
            "the cover was changed to " +
            i.object.data.card.cover.color +
            ' on "' +
            i.object.data.card.name +
            '" by ' +
            i.object.memberCreator.fullName;
          break;
        } else if (i.object.data.card.closed) {
          i.userMessage =
            '"' +
            i.object.data.card.name +
            '" has been archived at ' +
            i.date +
            " by " +
            i.object.memberCreator.fullName;
        } else if (i.object.data.listAfter) {
          i.userMessage =
            '"' +
            i.object.data.card.name +
            '" has been moved from ' +
            i.object.data.listBefore.name +
            " to " +
            i.object.data.listAfter.name +
            " at " +
            i.object.date +
            " by " +
            i.object.memberCreator.fullName;
        } else if (i.object.data.old.name) {
          i.userMessage =
            i.object.date +
            ": " +
            i.object.memberCreator.fullName +
            ' renamed "' +
            i.object.data.old.name +
            '" to "' +
            i.object.data.card.name;
        } else if (i.object.data.old.pos) {
          i.userMessage =
            '"' +
            i.object.data.card.name +
            '" got moved in position by ' +
            i.object.memberCreator.fullName;
          break;
        }
        break;
      case "addMemberToCard":
        i.userMessage =
          i.object.memberCreator.fullName +
          " added " +
          i.object.member.fullName +
          " to " +
          i.object.data.card.name +
          " at " +
          i.object.date;

        break;
      case "removeMemberFromCard":
        i.userMessage =
          i.object.memberCreator.fullName +
          " removed " +
          i.object.member.fullName +
          " from " +
          i.object.data.card.name +
          " at " +
          i.object.date;
        break;
      case "addChecklistToCard":
        i.userMessage =
          i.object.memberCreator.fullName +
          " added a checklist to " +
          i.object.data.card.name +
          " at " +
          i.object.date;
        break;
    }
    if (i.userMessage == undefined) {
      console.log("Object not displayed in HTML because of uncertainty", i);
    } else {
      i.userMessage = "Trello: " + i.userMessage;
      overviewWindow.innerHTML += `<p>${i.userMessage}</p>`;
    }
  });
}

function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  };
  return Tokens;
}

async function fetchGithubLogs(username, token, Repositories) {
  console.log("we in here");
  console.log("Repository iare");
  console.log(Repositories);
  fetch("/getGitCommits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gitUsername: username,
      gitToken: token,
      gitRepositories: Repositories,
      /* logsFrom: fromDate,
      logsTo: toDate, */
    }),
  }).then((response) => {
    response.json().then((responseData) => {
      console.log(responseData.logs);
    });
  });
}

function timeInterval() {
  var dateStringStart = Date.parse(document.getElementById("startTime").value);
  var dateStringEnd = Date.parse(document.getElementById("endTime").value);

  if (dateStringEnd < dateStringStart) {
    alert("End date cannot be less than the start date!");
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
    return;
  }
  let Tokens = checkAuthenticationStatus();
  let githubUsername = "denBruneBarone";

  fetchGithubLogs(
    githubUsername,
    Tokens.github,
    window.sessionStorage.getItem("github-repositories")
  );
}

function onLoad() {
  authApi();
}

function authApi() {
  let Tokens = checkAuthenticationStatus();
  if (Tokens.discord === null) {
    document.getElementById("discord").disabled = true;
    document.getElementById("discord").style = "opacity: 0.5; border: none";
  }
  if (Tokens.github === null) {
    document.getElementById("github").disabled = true;
    document.getElementById("github").style = "opacity: 0.5; border: none";
  }
  if (Tokens.trello === null) {
    document.getElementById("trello").disabled = true;
    document.getElementById("trello").style = "opacity: 0.5; border: none";
  }
}

function toggleApi(btn_id) {
  if (document.getElementById(btn_id).value == "enabled") {
    document.getElementById(btn_id).value = "disabled";
    document.getElementById(btn_id).style = "border-color: red";
    //Add function til at stoppe afsending af data i box
  } else if (document.getElementById(btn_id).value == "disabled") {
    document.getElementById(btn_id).value = "enabled";
    document.getElementById(btn_id).style = "border-color: #27af49";
    //Add function til at sende data i box
  }
}
