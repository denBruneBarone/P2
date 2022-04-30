// takes an object which has the the attribute "object" which is a trello action object.
// Writes a message for the user in the original objects attribute "message"
async function sortTrello(i) {
  i.location = i.object.data.board.name
    switch (i.object.type) {
      case "enablePlugin":
        i.message = 'Enabled plugin "' + i.object.data.plugin.name + '" on board "' + i.object.data.board.name + '"'
        break
      case "removeChecklistFromCard":
        i.message = 'Removed the checklist "' + i.object.data.checklist.name + '" from card "' + i.object.data.card.name + '", board "' + i.object.data.board.name + '"'
        break
      case "updateList":
        if (i.object.data.old.name) {
          i.message =
            'Changed name of list from "' +
            i.object.data.old.name +
            '" to "' +
            i.object.data.list.name
        }
        else if (i.object.data.old.pos) {
          i.message =
            'The list "' + i.object.data.list.name + '" got moved in position'
        }
        else if (i.object.data.list.closed) {
          i.message = 'Deleted the list "' + i.object.data.list.name + '"'
        }
        break
      case "updateChecklist":
        if (i.object.data.old.name) {
          i.message = 'Changed name of checklist to "' + i.object.data.checklist.name + '" from: "' + i.object.data.old.name + '". Card: "' + i.object.data.card.name + '", board: "' + i.object.data.board.name + '"'
        }
        break
      case "createBoard":
        i.message = 'Created board "' + i.object.data.board.name + '"'
        break
      case "addAttachmentToCard":
        i.message = 'Added attachment "' + i.object.data.attachment.name + '" to card "' + i.object.data.card.name + '" on board "' + i.object.data.board.name + '"'
        break
      case "deleteAttachmentFromCard":
        i.message = 'Deleted attachment "' + i.object.data.attachment.name + '" to card "' + i.object.data.card.name + '" on board "' + i.object.data.board.name + '"'
        break
      case "addToOrganizationBoard":
        i.message = 'Added the organisation "' + i.object.data.organization.name + '" to the board "' + i.object.data.board.name + '"'
        break
      case "moveCardFromBoard":
        let boardTarget = await i.object.data.boardTarget.id;
        let responseTarget = await fetch(
          `https://api.trello.com/1/boards/${boardTarget}/?key=0b862279af0ae326479a419925f3ea7a&token=${window.sessionStorage.getItem("trello-token")}`
        );
        let _jsonTarget = await responseTarget.json();
        boardTarget = await _jsonTarget.name;
        i.message = 'Moved card "' + i.object.data.card.name + '" to board "' + boardTarget + '" (origin board: "' + i.object.data.board.name + '")'
        break
      case "moveCardToBoard":
        let boardSource = await i.object.data.boardSource.id;
        let responseSource = await fetch(
          `https://api.trello.com/1/boards/${boardSource}/?key=0b862279af0ae326479a419925f3ea7a&token=${window.sessionStorage.getItem("trello-token")}`
        );
        let _jsonSource = await responseSource.json();
        boardSource = await _jsonSource.name;
        i.message = 'Moved card "' + i.object.data.card.name + '" to board "' + i.object.data.board.name + '" (origin board: "' + boardSource + '")'
        console.log("This is doubled, check the code and the HTML for date=", i.date)
        break
      case "commentCard":
        i.message = 'Added comment to card: "' + i.object.data.card.name + '" on board: "' + i.object.data.board.name + '". Comment: "' + i.object.data.text + '"'
        break
      case "createList":
        i.message = 'Created list "' + i.object.data.list.name + '" on board "' + i.object.data.board.name + '"'
        break
      case "makeNormalMemberOfBoard":
        i.message = 'Added a normal member named "' + i.object.member.fullName + '" to Board "' + i.object.data.board.name + '"'
        break
      case "updateBoard":
        if (i.object.data.old.name) {
          i.message = 'Board name changed to: "' + i.object.data.board.name + '" (old name: "' + i.object.data.old.name + '")'
        }
        else if (i.object.data.board.closed) {
          i.message = 'Closed board "' + i.object.data.board.name + '"'
        }
        else if (i.object.data.old.prefs) {
          if (i.object.data.old.prefs.background) {
            i.message = 'Changed background on board "' + i.object.data.board.name + '"'
          }
          else if (i.object.data.old.prefs.permissionLevel) {
            i.message = 'Changed permission level to ' + i.object.data.board.prefs.permissionLevel + ' on board "' + i.object.data.board.name + '"'
          }
        }
        break
      case "createCard":
        i.message = 'created card "' + i.object.data.card.name + '" on board "' + i.object.data.board.name + '"'
        break
      case "deleteCard":
        i.message = 'Deleted a card on Board: "' + i.object.data.board.name + '", List: "' + i.object.data.list.name + '"'
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
        }
        else if (i.object.data.card.closed) {
          i.message = 'Archived card "' + i.object.data.card.name + '", board "' + i.object.data.board.name + '"'
        }
        else if (i.object.data.card.desc || i.object.data.old.desc) {
          if (i.object.data.card.desc == "") {
            i.message = 'Deleted the description on card "' + i.object.data.card.name + '", board "' + i.object.data.board.name + '"'
          }
          else {
            i.message =
              'Updated the description from the card "' +
              i.object.data.card.name +
              '" to "' +
              i.object.data.card.desc +
              '", board "' + i.object.data.board.name + '"'
          }
        }
        else if (i.object.data.card.dueComplete) {
          i.message = 'Deadline marked as accomplished on card: "' + i.object.data.card.name + '"'
        }
        else if (i.object.data.old.dueComplete) {
          i.message = 'Deadline unmarked as accomplished on card: "' + i.object.data.card.name + '"'
        }
        else if (i.object.data.card.due) {
          i.message = "Changed due date to " + i.object.data.card.due
        }
        else if (i.object.data.card.dueReminder) {
          i.message =
            "Updated due-reminder to " +
            i.object.data.card.dueReminder +
            " minutes"
        }
        else if (i.object.data.listAfter) {
          i.message =
            '"' +
            i.object.data.card.name +
            '" has been moved from the list "' +
            i.object.data.listBefore.name +
            '" to "' +
            i.object.data.listAfter.name +
            '", board "' + i.object.data.board.name
        }
        else if (i.object.data.old.name) {
          i.message =
            'renamed "' +
            i.object.data.old.name +
            '" to "' +
            i.object.data.card.name
        }
        else if (i.object.data.old.pos) {
          i.message =
            'The card "' + i.object.data.card.name + '" got moved in position'
        }
        else if (i.object.data.card.start) {
          i.message = "Start date set to " + i.object.data.card.start
        }
        break
      case "addMemberToBoard":
        i.message = `The member was added to the board "` + i.object.data.board.name + '"'
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
      case "updateCheckItemStateOnCard":
        if (i.object.data.checkItem.state == "complete") {
          i.message = 'Marked as complete: The Checkbox Item "' + i.object.data.checkItem.name + '" (Card: "' + i.object.data.card.name + '")'
        }
        else if (i.object.data.checkItem.state == "incomplete") {
          i.message = 'Marked as incomplete: The Checkbox Item "' + i.object.data.checkItem.name + '" (Card: "' + i.object.data.card.name + '")'
        }
        break
    }
    if (i.message == undefined) {
      // i.message = "json: " + JSON.stringify(i.object.data) + JSON.stringify(i.object.type)
      console.log("uncertain trello action: ", i.object)
    } else {
      i.author = i.object.memberCreator.fullName
    }
  }