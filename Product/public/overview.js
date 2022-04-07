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

  /* fetchGithubLogs(
    githubUsername,
    Tokens.github,
    window.sessionStorage.getItem("github-repositories"),
    dateStringStart,
    dateStringEnd
  ); */
}

function authApi() {
  console.log(checkAuthenticationStatus());
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
