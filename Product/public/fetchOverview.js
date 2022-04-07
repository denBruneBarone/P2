async function fetchData(){

    const channelId = clients.channels.cache.get("")
    let totalMessages = []

    let message = await channelId.messages
        .fetch({limit:1})
        .then(messagePage => (messagePage.size ===1 ? messagePage.at(0):null))

    while (message) {
        await channelId.messages
          .fetch({ limit: 100, before: message.id })
          .then(messagePage => {
            messagePage.forEach(msg => message.push(msg))
            message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null
          }
    }
}
    
function displayData(){
    //Det fetchede data bliver indsat med et time interval fra overview.js, ind i en boks som text.
}