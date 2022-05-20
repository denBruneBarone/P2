let Events = [];
let TrelloActions = [];

// presets the services' toggles. If no token, a service is no longer toggleable
function checkLocations() {
  let Tokens = checkAuthenticationStatus();
  for (alias of Object.keys(Tokens)) {
    if (Tokens[alias] === null) {
      document.getElementById(alias).value = "disabled";
      document.getElementById(alias).style = "opacity: 0.5; border: none";
    } else if (alias == "discord") {
      if (!window.sessionStorage.getItem("channelID")) {
        toggleApi(alias, "channelID");
      }
    } else if (alias == "github") {
      if (sessionStorage.getItem("githubRepositories") == "") {
        toggleApi(alias, "githubRepositories");
      }
    } else if (alias == "trello") {
      if (sessionStorage.getItem("TrelloBoards") == undefined) {
        toggleApi(alias, "TrelloBoards");
      }
    }
  }
}

// Function to toggle the different services' data on and off. Will redirect user to selectLocation page, if no location.
function toggleApi(buttonID, location) {
  if (document.getElementById(buttonID).value == "enabled") {
    document.getElementById(buttonID).value = "disabled";
    document.getElementById(buttonID).style = "border-color: red";
  } else if (document.getElementById(buttonID).value == "disabled") {
    if (window.sessionStorage.getItem(buttonID + "-token") == undefined) {
      window.alert("Please authenticate our Appliction");
      window.location.replace(getAuthUrl(buttonID));
      return;
    }
    if (window.sessionStorage.getItem(location) == undefined) {
      window.alert("Please select your available locations");
      window.location.replace("/selectLocations");
      return;
    }
    document.getElementById(buttonID).value = "enabled";
    document.getElementById(buttonID).style = "border-color: #27af49";
  }
}

//Fetches the data if timeInterval is chosen and atleast one button is enabled. then sorts, then displays.
async function fetchData() {
  timeInterval();
  if (
    document.getElementById("startTime").value == "" ||
    (document.getElementById("trello").value == "disabled" &&
      document.getElementById("github").value == "disabled" &&
      document.getElementById("discord").value == "disabled")
  ) {
    return;
  }
  Events = []; // reset value
  if (
    window.sessionStorage.getItem("discord-token") &&
    document.getElementById("discord").value == "enabled"
  ) {
    document.getElementById("overviewWindow").innerHTML =
      "<h1>Loading Discord Messages...</h1>";
    await getAllDiscMessages();
  }
  if (
    window.sessionStorage.getItem("github-token") &&
    document.getElementById("github").value == "enabled"
  ) {
    document.getElementById("overviewWindow").innerHTML =
      "<h1>Loading Github Commits...</h1>";
    await getAllGithubCommits();
  }
  if (
    window.sessionStorage.getItem("trello-token") &&
    document.getElementById("trello").value == "enabled" &&
    window.sessionStorage.getItem("TrelloBoards")
  ) {
    document.getElementById("overviewWindow").innerHTML =
      "<h1>Loading Trello Actions...</h1>";
    await getAllTrelloActions();
  }
  sortData();
  displayData();
}

// Sorts all the actions in the Event array based on date attribute
async function sortData() {
  document.getElementById("overviewWindow").innerHTML =
    "<h1>Sorting Events...</h1>";
  Events.sort(compareDate);
}

// compare objects which have the property "date"
function compareDate(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

// clears the display window and then displays all the actions from the Event array.
async function displayData() {
  document.getElementById("overviewWindow").innerHTML = "";

  if (Events.length == 0) {
    document.getElementById(
      "overviewWindow"
    ).innerHTML = `<h1>Sorry, there are no events to display</h1>`;
  } else {
    Events.forEach((Event) => {
      let eventString = "";
      eventString +=
        Event.date.replace("T", " ").replace("Z", " ").slice("0", "19") +
        " | " +
        Event.author +
        ": " +
        Event.message +
        ".";

      document.getElementById("overviewWindow").innerHTML += `
      <div class="eventDisplayDiv"
        <p>
            <img class="miniPic" src="../images/${Event.service}_mini.png" />
        </p>
        <p class="${Event.service}">
          ${eventString}
        </p>
      </div>
      `;
    });
  }
}

// Sends POST-request to server to fetch messages from discord. Pushes messages to Event-array.
async function getAllDiscMessages() {
  let response = await fetch(`/disc_get_messages`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intersectedGuildName: window.sessionStorage.getItem("guildName"),
      discord_channel_name: window.sessionStorage.getItem("channelName"),
      discord_channel_id: window.sessionStorage.getItem("channelID"),
      start_date: document.getElementById("startTime").value,
      end_date: document.getElementById("endTime").value,
    }),
  });
  let responseData = await response.json();

  if (response.ok)
    responseData.messages.forEach((messages) => {
      Events.push(messages);
    });
}

// Calls the function fetchGithubCommits for each repository selected.
async function getAllGithubCommits() {
  let RepositoriesArray = window.sessionStorage
      .getItem("githubRepositories")
      .split(","),
    RepositoriesOwnerArray = window.sessionStorage
      .getItem("githubRepositoriesOwner")
      .split(",");

  for (let i = 0; i < RepositoriesArray.length; i++) {
    await fetchGithubCommits(
      RepositoriesOwnerArray[i],
      checkAuthenticationStatus().github,
      RepositoriesArray[i],
      document.getElementById("startTime").value,
      document.getElementById("endTime").value
    );
  }
}

// Sends POST-request to server to fetch commits from Github. Pushes commits to Event-array.
async function fetchGithubCommits(
  owner,
  token,
  Repositories,
  startTime,
  endTime
) {
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
  });
  let responseData = await response.json();
  if (!response.ok) console.log("Error in respone on github");
  responseData.forEach((GitCommit) => {
    Events.push(GitCommit);
  });
}

// iterate through boards, send request for each board and handle actions. Trello API can only return 1000 actions at a time.
async function getAllTrelloActions() {
  let since = document.getElementById("startTime").value;
  let before = document.getElementById("endTime").value;

  Boards = JSON.parse(window.sessionStorage.getItem("TrelloBoards"));

  for (Board of Boards) {
    let actionCount = await fetchTrelloActions(since, before, Board.id);
    while (actionCount == 1000) {
      actionCount = await fetchTrelloActions(
        since,
        TrelloActions[TrelloActions.length - 1].date,
        Board.id
      );
    }
  }
  document.getElementById("overviewWindow").innerHTML =
    "<h1>Processing Trello Actions</h1>";
  for (Action of TrelloActions) {
    await sortTrello(Action);
    Events.push(Action);
  }
}

// fetches the action of a Trello board. Returns the amount of actions
async function fetchTrelloActions(since, before, boardID) {
  let key = "0b862279af0ae326479a419925f3ea7a";
  let token = window.sessionStorage.getItem("trello-token");
  since = since == "" ? "" : "&since=" + since;
  before = before == "" ? "" : "&before=" + before;
  let r = await fetch(
    `https://api.trello.com/1/boards/${boardID}/actions/?key=${key}&token=${token}${since}${before}&limit=1000`
  );
  let _json = await r.json();
  for (j of _json) {
    TrelloActions.push({
      service: "trello",
      date: j.date,
      type: j.type,
      object: j,
    });
  }
  return _json.length;
}

// Function for when selecting a start and end date in the selector
function timeInterval() {
  var dateStringStart = Date.parse(document.getElementById("startTime").value);
  var dateStringEnd = Date.parse(document.getElementById("endTime").value);

  if (dateStringEnd < dateStringStart) {
    alert("End date cannot be less than the start date!");
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
    return;
  }
}

//Redirects the user to the corresponding authentication site.
function getAuthUrl(alias) {
  switch (alias) {
    case "trello":
      return "https://trello.com/1/authorize?key=0b862279af0ae326479a419925f3ea7a&return_url=http://localhost:3000/trello&scope=read";
    case "discord":
      return "https://discord.com/api/oauth2/authorize?client_id=957208170365866044&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdiscord&response_type=code&scope=guilds+messages.read";
    case "github":
      return "https://github.com/login/oauth/authorize?client_id=de223b25bb78c82a9bd7&scope=repo user";
  }
}
