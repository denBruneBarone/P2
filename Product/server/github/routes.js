const {
  getGithubToken,
  getGithubRepos,
  getGitCommits,
} = require("./controllers");

module.exports = function setRoutes(app, __dirname) {
  // GET
  // Redirects client to the temporary page githubAuthentication.html while authenticating
  app.get("/githubAuthentication", (req, res) => {
    res.sendFile(
      __dirname + "/public/githubAuthentication/githubAuthentication.html"
    );
  });

  // POST
  /* Sends a POST request to Github and waits for response.
then it sends token back to client as a JSON object*/
  app.post("/githubToken", getGithubToken);

  // Sends GET-request to Githubs API to retrieve the clients repositories. Sends the response back to the client as a JSON object.
  app.post("/getGithubRepositories", getGithubRepos);

  /* Sends GET-request to Githubs API to retrieve the commits from selected repository. Loops iteratively until there are no more commits to fetch. 
  Sends the response back to the client as a JSON object. */
  app.post("/getGitCommits", getGitCommits);
};
