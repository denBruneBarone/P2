// If a token had been generated then disable that applications button, apply css and enable continue button
function checkForContinue(Tokens) {
  const setButtonStatus = (pre_string) => {
    document.getElementById("continueButton").disabled = false;
    document.getElementById(pre_string + "Button").disabled = true;
    document.getElementById(pre_string + "Button").style =
      "border-color: #27af49";
  };

  if (Tokens.discord !== null) {
    setButtonStatus("discord");
  }

  if (Tokens.github !== null) {
    setButtonStatus("gitHub");
  }

  if (Tokens.trello !== null) {
    setButtonStatus("trello");
  }
}

// runs checkForContinue on page load
function onPageLoad() {
  checkForContinue(checkAuthenticationStatus());
}
