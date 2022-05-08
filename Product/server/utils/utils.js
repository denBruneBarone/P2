const SendOkJson = (res, json) => {
    res.status(200)
    res.json(json)
}

const SendErrorJson = (res, err) => {
    res.status(400)
    res.json({msg: err, error: true})
}

module.exports= {
    SendOkJson,
    SendErrorJson
}