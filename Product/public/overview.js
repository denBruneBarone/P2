let Actions = [] // trello

function fetchData() {
  timeInterval()
  if (document.getElementById("startTime").value == "") {
    return
  }
  if (document.getElementById("trello").value == "enabled") { fetchTrello() }
}

async function fetchTrello() {
  // iterate through boards, send request for each board and handle actions

  let since = document.getElementById("startTime").value
  let before = document.getElementById("endTime").value
  let key = "0b862279af0ae326479a419925f3ea7a"
  let token = window.sessionStorage.getItem("trello-token")
  Boards = JSON.parse(window.sessionStorage.getItem("Boards"))
  
  for (i of Boards) {
    let r = await fetch(`https://api.trello.com/1/boards/${i.id}/actions/?key=${key}&token=${token}&since=${since}&before=${before}`)
    let _json = await r.json()
    for (j of _json) {
      Actions.push({ userInputDateSince: since, userInputDateBefore: before, date: j.date, type: j.type, object: j })
    }
  }
  // some things to work with
  Actions.forEach(i=>{
    console.log("Date: "+i.object.date+", type: "+i.object.type +", member: "+i.object.memberCreator.fullName+", card: "+i.object.data.card.name,i.object);
    if (i.object.data.list) {console.log(i.object.data.list.name)}
    if (i.object.data.listAfter) {console.log("moved to "+ i.object.data.listAfter.name+" from "+i.object.data.listBefore.name)}   
    if (i.object.data.card.closed) {console.log("This card has been archived")}
})}

function checkAuthenticationStatus() {
  var Tokens = {
    trello: window.sessionStorage.getItem("trello-token"),
    github: window.sessionStorage.getItem("github-token"),
    discord: window.sessionStorage.getItem("discord-token"),
  };
  return Tokens;
}

async function fetchGithubLogs(
  username,
  token,
  Repositories,
  fromDate,
  toDate
) {
  console.log("we in here");
  fetch("/getGitCommits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gitUsername: username,
      gitToken: token,
      gitRepositories: Repositories,
      logsFrom: fromDate,
      logsTo: toDate,
    }),
  }).then((response) => {
    response.json().then((responseData) => {
      console.log(responseData.logs);
    });
  });
}

function timeInterval() {
  var dateStringStart = Date.parse(
    document.getElementById("startTime").value
  );
  var dateStringEnd = Date.parse(document.getElementById("endTime").value);

  if (dateStringEnd < dateStringStart) {
    alert("End date cannot be less than the start date!");
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";

    return;
  }

  let Tokens = checkAuthenticationStatus();
  let githubUsername = "denBruneBarone";

  /* fetchGithubLogs(
  githubUsername,
  Tokens.github,
  window.sessionStorage.getItem("github-repositories"),
  dateStringStart,
  dateStringEnd
); */
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
