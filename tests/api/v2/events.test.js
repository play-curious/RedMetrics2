const request = require("supertest");
const app = require("../../../dist/app");

const { user_tokens, user_ids } = require("./auth.test");
const { game_version_ids } = require("./game.test");

const session_ids = new Map();

module.exports = { session_ids };

describe("events", () => {
  describe("session", () => {
    describe("post", () => {
      const route = "/api/v2/rest/session";

      describe("fails", () => {
        test("missing token", (done) => {
          request(app.server).post(route).expect(401).end(done);
        });

        test("missing game version", (done) => {
          request(app.server)
            .post(route)
            .set("Authorization", `bearer ${user_tokens.get("user")}`)
            .send({
              external_id: "id",
              platform: "Microsoft Windows",
              software: "Firefox",
              custom_data: {
                test: true,
              },
            })
            .expect(401)
            .end(done);
        });
      });

      describe("success", () => {
        test("start session", (done) => {
          request(app.server)
            .post(route)
            .set("Authorization", `bearer ${user_tokens.get("user")}`)
            .send({
              external_id: "id",
              platform: "Microsoft Windows",
              software: "Firefox",
              game_version_id: game_version_ids.get("game"),
              custom_data: {
                test: true,
              },
            })
            .expect(200)
            .end((err, res) => {
              session_ids.set("session", res.body.id);
              done(err);
            });
        });
      });
    });

    {
      const route = (id) => `/api/v2/rest/session/${id}`;

      describe("get", () => {
        describe("fails", () => {
          test("missing token", (done) => {
            test("missing token", (done) => {
              request(app.server)
                .get(route(session_ids.get("session")))
                .expect(401)
                .end(done);
            });

            // todo: missing permission ? (only dev of game or other cases)

            test("missing session", (done) => {
              request(app.server)
                .get(route(-1))
                .set("Authorization", `bearer ${user_tokens.get("admin")}`)
                .expect(404)
                .end(done);
            });
          });
        });

        describe("success", () => {
          test("get session", (done) => {
            request(app.server)
              .get(route(session_ids.get("session")))
              .set("Authorization", `bearer ${user_tokens.get("admin")}`)
              .expect(404)
              .end(done);
          });
        });
      });

      describe("update", () => {
        describe("fails", () => {
          test("missing token", (done) => {
            request(app.server)
              .put(route(session_ids.get("session")))
              .send({
                platform: "Mac OSX",
                software: "Safari",
                custom_data: {
                  test: false,
                },
              })
              .expect(401)
              .end(done);
          });

          test("missing session", (done) => {
            request(app.server)
              .put(route(-1))
              .set("Authorization", `bearer ${user_tokens.get("admin")}`)
              .send({
                platform: "Mac OSX",
                software: "Safari",
                custom_data: {
                  test: false,
                },
              })
              .expect(404)
              .end(done);
          });
        });

        describe("success", () => {
          test("update session", (done) => {
            request(app.server)
              .put(route(session_ids.get("session")))
              .set("Authorization", `bearer ${user_tokens.get("admin")}`)
              .send({
                platform: "Mac OSX",
                software: "Safari",
                custom_data: {
                  test: false,
                },
              })
              .expect(404)
              .end(done);
          });
        });
      });
    }
  });

  describe("event", () => {
    const route = "/api/v2/rest/event";

    describe("get", () => {
      test("missing token", (done) => {
        request(app.server)
          .get(route)
          .send({
            // filtres
          })
          .expect(401)
          .end(done);
      });
    });

    describe("post", () => {
      describe("fails", () => {
        test("missing token", (done) => {
          request(app.server)
            .post(route)
            .send({
              game_version_id: game_version_ids.get("version"),
            })
            .expect(401)
            .end(done);
        });

        test("missing version", (done) => {
          request(app.server)
            .post(route)
            .set("Authorization", `bearer ${user_tokens.get("admin")}`)
            .send({})
            .expect(300)
            .end(done);
        });
      });

      describe("success", () => {
        test("emit event", (done) => {
          request(app.server)
            .post(route)
            .set("Authorization", `bearer ${user_tokens.get("admin")}`)
            .send({
              game_version_id: game_version_ids.get("version"),
            })
            .expect(200)
            .end(done);
        });
      });
    });
  });
});
