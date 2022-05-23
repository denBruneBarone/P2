import { createRequire } from "module";
import dotenv from "dotenv";
dotenv.config({ path: "../" });
const require = createRequire(import.meta.url);
const expect = require("chai").expect;
const supertest = require("supertest");
import { createApp } from "../server.mjs";
// const Discord = require("discord.js");

const gitHubToken = process.env.GITHUB_TOKEN;

describe("API Interactions", function () {
  this.timeout(0);

  let app;

  before(() => {
    return new Promise(async (resolve) => {
      app = await createApp();

      app.listen(function (err) {
        if (err) {
          return err;
        }
        resolve();
      });
    });
  });

  it("POST /getGitCommits should return an object with correct syntax", async function (done) {
    supertest(app)
      .post("/getGitCommits")
      .send({
        gitToken: gitHubToken,
        gitRepositories: "P2",
        gitRepositoriesOwner: "denBruneBarone",
        from: "2022-04-01T00:00:00",
        to: "",
      })
      .expect(200, (err, res) => {
        if (err) {
          done(err);
        }
        console.log("res.body[i].author", res.body[0].author);
        for (let i = 0; i < res.body.length; i++) {
          expect(typeof res.body[i].author).to.equal("string");
          expect(res.body[i].author.length > 0).to.be.true;
          expect(typeof res.body[i].message).to.equal("string");
          expect(typeof res.body[i].date).to.equal("string");
          expect(typeof res.body[i].location).to.equal("string");
          expect(res.body[i].location.length > 0).to.be.true;
          expect(typeof res.body[i].service).to.equal("string");
        }
      });
    done();
  });

  it("POST /getGithubRepositories should return an object with correct syntax", async function (done) {
    supertest(app)
      .post("/getGithubRepositories")
      .send({ gitHubToken: gitHubToken })
      .expect(200, (err, res) => {
        if (err) {
          done(err);
        }
        console.log(
          "res.body.Repositories[i].repositoryName",
          res.body.Repositories[0].repositoryName
        );
        for (let i = 0; i < res.body.Repositories.length; i++) {
          expect(typeof res.body.Repositories[i].repositoryName).to.equal(
            "string"
          );
          expect(res.body.Repositories[i].repositoryName > 0).to.be.true;
          expect(typeof res.body.Repositories[i].owner).to.equal("string");
          expect(res.body.Repositories[i].owner > 0).to.be.true;
        }
      });
    done();
  });

  it("POST /disc_get_channels should return an object with correct syntax", async function (done) {
    supertest(app)
      .post("/disc_get_channels")
      .send({ intersectedGuild: "937719195611824138" })
      .expect(200, (err, res) => {
        if (err) {
          done(err);
        }
        console.log("res.body[i].id", res.body);
        for (let i = 0; i < res.body.length; i++) {
          expect(typeof res.body[i].id).to.equal("string");
          expect(typeof res.body[i].name).to.equal("string");
        }
      });
    done();
  });

  it("POST /disc_get_messages should return an object with correct syntax", async function (done) {
    supertest(app)
      .post("/disc_get_messages")
      .send({
        discord_channel_id: "937719195611824141",
        discord_channel_name: "general",
        intersectedGuildName: "P2 Vikings",
        start_date: "2022-02-01T00:00:00",
        end_date: "2022-05-01T00:00:00",
      })
      .expect(200, (err, res) => {
        if (err) {
          done(err);
        }
        console.log("res.body.messages[0].author", res.body.messages[0].author);
        for (let i = 0; i < res.body.messages.length; i++) {
          expect(typeof res.body.messages[i].author).to.equal("string");
          expect(res.body.messages[i].author.length > 0).to.be.true;
          expect(typeof res.body.messages[i].location).to.equal("string");
          expect(res.body.messages[i].location.length > 0).to.be.true;
        }
      });
    done();
  });
});
