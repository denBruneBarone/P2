
function checkForContinue(Tokens) {
  const setButtonStatus = pre_string => {
    document.getElementById("continueButton").disabled = false
    document.getElementById(pre_string + "Button").disabled = true
    document.getElementById(pre_string + "Button").style = 'border-color: #27af49'
  }

  if (Tokens.discord !== null) {
    setButtonStatus("discord")
  }

  if (Tokens.github !== null) {
    setButtonStatus("gitHub")
  }

  if (Tokens.trello !== null) {
    setButtonStatus("trello")
  }
}

function goToOverview() {
  fetch("/overview", () => {
  });
}

function onPageLoad() {
  checkForContinue(checkAuthenticationStatus());
}