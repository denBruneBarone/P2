import { createRequire } from "module";
import dotenv from 'dotenv'
dotenv.config({ path: "../" });
const require = createRequire(import.meta.url)
const expect = require('chai').expect;
const supertest = require('supertest');
import { createApp } from "../server.mjs"

const gitHubToken = process.env.GITHUB_TOKEN

// Disc client
// require("dotenv").config();
// const Discord = require("discord.js");
// const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
// client.login(process.env.BOT_TOKEN);

describe('API Interactions', function () {
    let app;

    before(function (done) {
        app = createApp();
        app.listen(function (err) {
            if (err) { return done(err); }
            done();
        });
    });

    it('POST /getGitCommits should return an object with correct syntax', async function (done) {
        supertest(app)
            .post('/getGitCommits')
            .send({ gitToken: gitHubToken, gitRepositories: "P2", gitRepositoriesOwner: "denBruneBarone", from: '2022-04-01T00:00:00', to: '' })
            .expect(200, (err, res) => {
                if (err) { done(err) }
                expect(typeof (res.body[0].author)).to.equal("string")
                expect(typeof (res.body[0].message)).to.equal("string")
                expect(typeof (res.body[0].date)).to.equal("string")
                expect(typeof (res.body[0].location)).to.equal("string")
                expect(typeof (res.body[0].service)).to.equal("string")
            })
            done()
    });

    it('POST /getGithubRepositories should return an object with correct syntax', async function (done) {
        supertest(app)
            .post('/getGithubRepositories')
            .send({ gitHubToken: gitHubToken })
            .expect(200, (err, res) => {
                if (err) { done(err) }
                expect(typeof (res.body.Repositories[0].repositoryName)).to.equal("string")
                expect(typeof (res.body.Repositories[0].owner)).to.equal("string")
            })
            done()
    });

    // it('POST /disc_get_channels should return an object with correct syntax', async function (done) {
    //     supertest(app)
    //         .post('/disc_get_channels')
    //         .send({ intersectedGuild: "937719195611824138" })
    //         .expect(200, (err, res) => {
    //             if (err) { done(err) }
    //             console.log(res.body)
    //             // expect(typeof (res.body.Repositories[0].repositoryName)).to.equal("string")
    //             // expect(typeof (res.body.Repositories[0].owner)).to.equal("string")
    //         })
    //         done()
    // });

    // it('POST /disc_get_messages should return an object with correct syntax', async function (done) {
    //     supertest(app)
    //         .post('/disc_get_messages')
    //         .send({
    //             discord_channel_id: "937719195611824141",
    //             discord_channel_name: "general",
    //             intersectedGuildName: "P2 Vikings",
    //             start_date: "2022-02-01T00:00:00",
    //             end_date: "2022-05-01T00:00:00"
    //         })
    //         .expect(200, (err, res) => {
    //             if (err) { done(err) }
    //             console.log("res")
    //             console.log(res)
    //             // expect(typeof (res.body.Repositories[0].repositoryName)).to.equal("string")
    //             // expect(typeof (res.body.Repositories[0].owner)).to.equal("string")
    //         })
    //         done()
    // });
});
