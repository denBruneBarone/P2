const axios = require("axios");
const fetch = require("node-fetch");
const { SendOkJson, SendErrorJson } = require("../utils/utils")


async function getGithubToken(req, res) {
  let githubCode = req.body.gitCode;

  //error handling
  var r = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: JSON.stringify({
      client_id: "de223b25bb78c82a9bd7",
      client_secret: process.env.GITHUB_SECRET,
      code: githubCode,
      redirect_uri: "http://localhost:3000/githubAuthentication",
    }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  const _json = await r.json();
  res.json({ token: _json.access_token });
}

async function getGithubRepos(req, res) {
  let githubToken = req.body.gitToken;
  let githubRepositories = [];

  var r = await fetch("https://api.github.com/user/repos",
    {
      method: "GET",
      headers: {
        Authorization: `token ${githubToken}`,
        accept: "application/vnd.github.v3+json",
      },
    }
  );
  var data = await r.json();
  if (!r.ok) console.log("got error message", r.status)

  for (const i of data) {
    let Repo = new Object();
    Repo.owner = i.owner.login;
    Repo.repositoryName = i.name
    githubRepositories.push(Repo);
  }
  res.json({ Repositories: githubRepositories });
}


async function getGitCommits(req, res) {
  let GitCommitArray = [], loadedAllCommits = false, pageCount = 1;
  while (loadedAllCommits === false) {
    var r = await fetch(
      `https://api.github.com/repos/${req.body.gitRepositoriesOwner}/${req.body.gitRepositories}/commits?per_page=100&page=${pageCount}&since=${req.body.from}&until=${req.body.to}`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${req.body.gitToken}`,
          accept: "application/vnd.github.v3+json",
        },
      }
    );
    var data = await r.json();

    if (!r.ok) {
      console.log("got error message", r.status)
      SendErrorJson(res, "error")
      return
    }
    if (data.length === 0) loadedAllCommits = true;

    for (const i of data) {
      GitCommitArray.push({
        author: i.commit.author.name,
        message: i.commit.message,
        date: i.commit.author.date,
        location: req.body.gitRepositories,
        service: "github"
      });
    }

    pageCount++;
  }
  SendOkJson(res, GitCommitArray)
}


module.exports = {
  getGitCommits,
  getGithubRepos,
  getGithubToken
}