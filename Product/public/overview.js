function fetchData() {
  timeInterval()
  if (document.getElementById("startTime").value == "") {
    return
  }
  fetchTrello()
}

async function fetchTrello() {
  // iterate through boards, send request for each board and handle actions

  let since = document.getElementById("startTime").value
  let before = document.getElementById("endTime").value
  let key = "0b862279af0ae326479a419925f3ea7a"
  let token = window.sessionStorage.getItem("trello-token")
  Boards = JSON.parse(window.sessionStorage.getItem("Boards"))
  let Actions = []
  for (i of Boards) {
    let r = await fetch(`https://api.trello.com/1/boards/${i.id}/actions/?key=${key}&token=${token}&since=${since}&before=${before}`)
    let _json = await r.json()
    for (j of _json) {
      Actions.push({userInputDateSince: since, userInputDateBefore: before, date: j.date, type: j.type, object: j})
    }
  }
  console.log(Actions)
}

function timeInterval() {
  var dateStringStart = Date.parse(document.getElementById("startTime").value);
  var dateStringEnd = Date.parse(document.getElementById("endTime").value);

  if (dateStringEnd < dateStringStart) {
    alert("End date cannot be less than the start date!");
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";

    return
  }
}

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

  function fetchData() {
    timeInterval();
    if (document.getElementById("startTime").value == "") {
      return;
    }
    fetchTrello();
  }

  async function fetchTrello() {
    // iterate through boards, send request for each board and handle actions

    let since = document.getElementById("startTime").value;
    let before = document.getElementById("endTime").value;
    let key = "0b862279af0ae326479a419925f3ea7a";
    let token = window.sessionStorage.getItem("trello-token");
    Boards = JSON.parse(window.sessionStorage.getItem("Boards"));
    let Actions = [];
    for (i of Boards) {
      let r = await fetch(
        `https://api.trello.com/1/boards/${i.id}/actions/?key=${key}&token=${token}&since=${since}&before=${before}`
      );
      let _json = await r.json();
      for (j of _json) {
        Actions.push({ type: j.type, object: j });
      }
    }
    console.log(Actions);
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

  function getTrelloBoard(trelloBoard = "none") {
    console.log(document.getElementById("trello-boards").value);
  }

  async function getTrelloLogs() {
    let key = "0b862279af0ae326479a419925f3ea7a";
    let token = window.sessionStorage.getItem("trello-token");
    // get user's boards
    let r = await fetch(
      `https://api.trello.com/1/members/me/boards?key=${key}&token=${token}`,
      {
        method: "GET",
      }
    );

    let _json = await r.json();

    // lav html element, hvor brugeren kan vælge et af sine boards
    let trelloBoardForm = document.getElementById("trello-boards");
    for (i of _json) {
      trelloBoardForm.innerHTML =
        `<input class="trello-boards" type="checkbox" id="${i.id}" value="${i.name}"><label for="${i.id}">${i.name}</label><br>` +
        trelloBoardForm.innerHTML;
    }

    let Boards = [];
    const button = document.getElementById("trello-submit");
    button.addEventListener("click", () => {
      // iterates through the class, each id that is clicked is added to our list
      for (i of document.getElementsByClassName("trello-boards")) {
        if (i.checked) {
          Boards.push({ id: i.id, name: i.value });
        }
      }
      // store Boards in session storage and redirect user
      window.sessionStorage.setItem("Boards", JSON.stringify(Boards));
      window.location.replace("http://localhost:3000/index.html");
    });
  }
}
