import { createRequire } from "module";
import dotenv from 'dotenv'
dotenv.config({ path: "../" });
const require = createRequire(import.meta.url)
const expect = require('chai').expect;
const supertest = require('supertest');
import { createApp } from "../server.mjs"

const gitToken = process.env.GITHUB_TOKEN

describe('API Interactions', function () {
    let app;

    before(function (done) {

        app = createApp();
        app.listen(function (err) {
            if (err) { return done(err); }
            done();
        });
    });

    it('POST /getGitCommits should return an object', async function (done) {
        supertest(app)
            .post('/getGitCommits')
            .send({ gitToken: gitToken, gitRepositories: "P2", gitRepositoriesOwner: "denBruneBarone", from: '2022-04-01T00:00:00', to: '' })
            .expect(200, (err, res) => {
                if (err) { done(err) }
                expect(typeof (res.body)).to.equal("object")
            })
        done()
    });

    it('POST /getGithubRepositories should return an object', async function (done) {
        supertest(app)
            .post('/getGithubRepositories')
            .send({ gitToken: gitToken })
            .expect(200, (err, res) => {
                if (err) { done(err) }
                expect(typeof (res.body.Repositories)).to.equal("object")
            })
        done()
    });
});