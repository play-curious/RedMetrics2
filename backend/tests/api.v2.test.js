const { test, describe, beforeAll, afterAll } = require("@jest/globals");
const request = require("supertest");
const uuid = require("uuid");
const app = require("../dist/app");

require("dotenv/config");

const data = {
  cleanPassword: "13e17ea1ee037",
  users: {
    admin: {
      email: "admin@example.com",
      password: "$2b$10$9yj3GlOCSngBxZ19LkKRf.k9eBDqVYGOnDa4zRrEW8YyJKXfyRqti",
      is_admin: true,
    },
    user: {
      email: "user@example.com",
      password: "$2b$10$9yj3GlOCSngBxZ19LkKRf.k9eBDqVYGOnDa4zRrEW8YyJKXfyRqti",
      is_admin: false,
    },
  },
  games: [
    {
      name: "Tetris",
      description: "Just the best retro game ever",
      versions: [
        {
          name: "Beta v0.5",
          sessions: [
            {
              external_id: "id",
              platform: "Microsoft Windows",
              software: "Firefox",
              custom_data: {
                test: true,
              },
            },
          ],
        },
      ],
    },
  ],
};

beforeAll(async () => {
  // start transaction
  await app.database.raw("START TRANSACTION");

  // init routes
  await app.loadRoutes(false);

  // create users
  for (const key in data.users) {
    const user = data.users[key];

    user.id = await app
      .database("account")
      .insert(user)
      .returning("id")
      .then((result) => result[0]);
  }

  // create games
  for (const game of data.games) {
    game.publisher_id = data.users.user.id;
    game.id = await app
      .database("game")
      .insert(game)
      .returning("id")
      .then((result) => result[0]);
  }

  // create versions
  for (const gameKey in data.versions) {
    for (const key in data.versions[gameKey]) {
      const version = data.versions[gameKey][key];

      version.game_id = data.games[gameKey].id;
      version.id = await app
        .database("game_version")
        .insert(version)
        .returning("id")
        .then((result) => result[0]);
    }
  }

  // create sessions
  for (const gameKey in data.sessions) {
    for (const versionKey in data.sessions[gameKey]) {
      const session = data.sessions[gameKey][versionKey];

      session.game_version_id = data.versions[gameKey][versionKey].id;
      session.id = await app
        .database("game_session")
        .insert(session)
        .returning("id")
        .then((result) => result[0]);
    }
  }
});

afterAll(async () => {
  // stop transaction
  await app.database.raw("ROLLBACK");

  // destroy clients
  return app.database.destroy();
});

describe("🔒 Auth", () => {
  describe("/register", () => {
    const route = "/v2/register";

    describe("POST", () => {
      test("missing email", (done) => {
        request(app.server)
          .post(route)
          .send({
            ...data.users.user,
            email: null,
          })
          .expect(401)
          .end(done);
      });

      test("missing password", (done) => {
        request(app.server)
          .post(route)
          .send({
            ...data.users.user,
            password: null,
          })
          .expect(401)
          .end(done);
      });

      test("invalid email", (done) => {
        request(app.server)
          .post(route)
          .send({
            ...data.users.user,
            email: "invalid",
          })
          .expect(401)
          .end(done);
      });

      test("register is already registered user", (done) => {
        request(app.server)
          .post(route)
          .send(data.users.user)
          .expect(401)
          .end(done);
      });
    });
  });

  describe("/login", () => {
    const route = "/v2/login";

    test("missing email", (done) => {
      request(app.server)
        .post(route)
        .send({
          password: "test",
        })
        .expect(401)
        .end(done);
    });

    test("missing password", (done) => {
      request(app.server)
        .post(route)
        .send({
          email: "user@test.test",
        })
        .expect(401)
        .end(done);
    });

    test("invalid email", (done) => {
      request(app.server)
        .post(route)
        .send({
          email: "test",
          password: "test",
        })
        .expect(401)
        .end(done);
    });

    test("email not found", (done) => {
      request(app.server)
        .post(route)
        .send({
          email: "unknown@test.test",
          password: "test",
        })
        .expect(404)
        .end(done);
    });

    test("incorrect password", (done) => {
      request(app.server)
        .post(route)
        .send({
          email: data.users.user.email,
          password: "incorrect",
        })
        .expect(401)
        .end(done);
    });
  });

  describe("/connected", () => {
    const route = "/v2/login";

    beforeAll(async () => {
      for (const key in data.users) {
        data.users[key].apiKey = await new Promise((resolve, reject) => {
          request(app.server)
            .post(route)
            .send({
              email: data.users[key].email,
              password: data.cleanPassword,
            })
            .expect(200)
            .end((err, res) => {
              if (err) return reject(err);
              resolve(res.body.apiKey);
            });
        });
      }
    });

    describe("/account/:id", () => {
      const route = (id, apiKey) =>
        `/v2/account/${id}${apiKey ? "?apikey=" + apiKey : ""}`;

      describe("GET", () => {
        test("missing apikey", (done) => {
          request(app.server)
            .get(route(data.users.user.id))
            .expect(401)
            .end(done);
        });

        test("account not found", (done) => {
          request(app.server)
            .get(route(uuid.v4(), data.users.admin.apiKey))
            .expect(404)
            .end(done);
        });

        test("admin only (but it's own account)", (done) => {
          request(app.server)
            .get(route(data.users.user.id, data.users.user.apiKey))
            .expect(200)
            .end(done);
        });

        test("admin only", (done) => {
          request(app.server)
            .get(route(data.users.dev.id, data.users.user.apiKey))
            .expect(401)
            .end(done);
        });

        test("success", (done) => {
          request(app.server)
            .get(route(data.users.user.id, data.users.admin.apiKey))
            .expect(200)
            .end(done);
        });
      });

      describe("PUT", () => {
        test("missing apikey", (done) => {
          request(app.server)
            .put(route(data.users.user.id))
            .expect(401)
            .end(done);
        });

        test("account not found", (done) => {
          request(app.server)
            .put(route(uuid.v4(), data.users.admin.apiKey))
            .send({
              email: "email@user.user",
            })
            .expect(404)
            .end(done);
        });

        test("admin only (but it's own account)", (done) => {
          request(app.server)
            .put(route(data.users.user.id, data.users.user.apiKey))
            .send({
              email: "email@user.user",
            })
            .expect(200)
            .end(done);
        });

        test("admin only", (done) => {
          request(app.server)
            .put(route(data.users.dev.id, data.users.user.apiKey))
            .send({
              email: "email@user.user",
            })
            .expect(401)
            .end(done);
        });

        test("invalid email", (done) => {
          request(app.server)
            .put(route(data.users.user.id, data.users.admin.apiKey))
            .send({
              email: "test",
            })
            .expect(401)
            .end(done);
        });

        test("success", (done) => {
          request(app.server)
            .put(route(data.users.user.id, data.users.admin.apiKey))
            .send({
              email: "email@uer.user",
              password: "password",
              role: "dev",
            })
            .expect(200)
            .end(done);
        });
      });
    });

    describe("🎮 Games", () => {
      describe("/game", () => {
        const route = (apikey) =>
          "/v2/game" + (apikey ? "?apikey=" + apikey : "");

        describe("GET", () => {
          test("missing apikey", (done) => {
            request(app.server).get(route()).expect(401).end(done);
          });

          test("success", (done) => {
            request(app.server)
              .get(route(data.users.admin.apiKey))
              .expect(200)
              .end(done);
          });
        });

        describe("POST", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .post(route())
              .send({
                name: "Game name",
              })
              .expect(401)
              .end(done);
          });

          test("missing name", (done) => {
            request(app.server)
              .post(route(data.users.admin.apiKey))
              .expect(301)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .post(route(data.users.admin.apiKey))
              .send(data.games.tetris)
              .expect(200)
              .end((err, res) => {
                data.games.tetris.id = res.body.game_id;
                done(err);
              });
          });
        });
      });

      describe("/game/:id", () => {
        const route = (id, apikey) =>
          "/v2/game/" + id + (apikey ? "?apikey=" + apikey : "");

        describe("GET", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .get(route(data.games.tetris.id))
              .expect(401)
              .end(done);
          });

          test("game not found", (done) => {
            request(app.server)
              .get(route(uuid.v4(), data.users.admin.apiKey))
              .expect(404)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .get(route(data.games.tetris.id, data.users.admin.apiKey))
              .expect(200)
              .end(done);
          });
        });

        describe("PUT", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .put(route(data.games.tetris.id))
              .send({
                name: "New Name",
                description: "New Description",
              })
              .expect(401)
              .end(done);
          });

          test("game not found", (done) => {
            request(app.server)
              .put(route(uuid.v4(), data.users.admin.apiKey))
              .send({
                name: "New Name",
                description: "New Description",
              })
              .expect(404)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .put(route(data.games.tetris.id, data.users.admin.apiKey))
              .send({
                name: "New Name",
                description: "New Description",
              })
              .expect(200)
              .end(done);
          });
        });
      });

      describe("/game/:id/version", () => {
        const route = (id, apikey) =>
          `/v2/game/${id}/version${apikey ? "?apikey=" + apikey : ""}`;

        describe("GET", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .get(route(data.games.tetris.id))
              .expect(401)
              .end(done);
          });

          test("game not found", (done) => {
            request(app.server)
              .get(route(uuid.v4(), data.users.admin.apiKey))
              .expect(404)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .get(route(data.games.tetris.id, data.users.admin.apiKey))
              .expect(200)
              .end(done);
          });
        });

        describe("POST", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .post(route(data.games.tetris.id))
              .send({
                name: "Version 1",
              })
              .expect(401)
              .end(done);
          });

          test("game not found", (done) => {
            request(app.server)
              .post(route(uuid.v4(), data.users.admin.apiKey))
              .send({
                name: "Version 1",
              })
              .expect(404)
              .end(done);
          });

          test("missing name", (done) => {
            request(app.server)
              .post(route(data.games.tetris.id, data.users.admin.apiKey))
              .expect(400)
              .end(done);
          });
        });
      });

      describe("/version/:id", () => {
        const route = (id, apikey) =>
          "/v2/version/" + id + (apikey ? "?apikey=" + apikey : "");

        describe("GET", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .get(route(data.versions.tetris.beta.id))
              .expect(401)
              .end(done);
          });

          test("version not found", (done) => {
            request(app.server)
              .get(route(uuid.v4(), data.users.admin.apiKey))
              .expect(404)
              .end(done);
          });
        });

        describe("PUT", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .put(route(data.versions.tetris.beta.id))
              .send({
                name: "New Name",
                description: "New Description",
              })
              .expect(401)
              .end(done);
          });

          test("version not found", (done) => {
            request(app.server)
              .put(route(uuid.v4(), data.users.admin.apiKey))
              .send({
                name: "New Name",
                description: "New Description",
              })
              .expect(404)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .put(route(data.versions.tetris.beta.id, data.users.admin.apiKey))
              .send({
                name: "New Name",
                description: "New Description",
              })
              .expect(200)
              .end(done);
          });
        });
      });
    });

    describe("🔔 Events", () => {
      describe("/session", () => {
        const route = (apikey) =>
          "/v2/game-session" + (apikey ? "?apikey=" + apikey : "");

        describe("POST", () => {
          test("missing apikey", (done) => {
            request(app.server).post(route()).expect(401).end(done);
          });

          // TODO: currently returns a 400 and not 401
          test("missing game version", (done) => {
            request(app.server)
              .post(route(data.users.user.apiKey))
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
      });

      describe("/session/:id", () => {
        const route = (id, apikey) =>
          `/v2/game-session/${id}${apikey ? "?apikey=" + apikey : ""}`;

        describe("GET", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .get(route(data.sessions.tetris.beta.id))
              .expect(401)
              .end(done);
          });

          test("missing session", (done) => {
            request(app.server)
              .get(route(uuid.v4(), data.users.admin.apiKey))
              .expect(404)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .get(route(data.sessions.tetris.beta.id, data.users.admin.apiKey))
              .expect(200)
              .end(done);
          });
        });

        describe("PUT", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .put(route(data.sessions.tetris.beta.id))
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
              .put(route(uuid.v4(), data.users.admin.apiKey))
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

          test("success", (done) => {
            request(app.server)
              .put(route(data.sessions.tetris.beta.id, data.users.admin.apiKey))
              .send({
                platform: "Mac OSX",
                software: "Safari",
                custom_data: {
                  test: false,
                },
              })
              .expect(200)
              .end(done);
          });
        });
      });

      describe("/event", () => {
        const route = (apikey) =>
          "/v2/event" + (apikey ? "?apikey=" + apikey : "");

        describe("GET", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .get(route())
              .send({
                // filtres
              })
              .expect(401)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .get(route(data.users.admin.apiKey))
              .send({
                // filtres
              })
              .expect(200)
              .end(done);
          });
        });

        describe("POST", () => {
          test("missing apikey", (done) => {
            request(app.server)
              .post(route())
              .send({
                game_session_id: data.sessions.tetris.beta.id,
                game_version_id: data.versions.tetris.beta.id,
              })
              .expect(401)
              .end(done);
          });

          test("missing session", (done) => {
            request(app.server)
              .post(route())
              .send({
                game_version_id: data.versions.tetris.beta.id,
              })
              .expect(401)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .post(route(data.users.admin.apiKey))
              .send({
                game_version_id: data.versions.tetris.beta.id,
                game_session_id: data.sessions.tetris.beta.id,
              })
              .expect(200)
              .end(done);
          });
        });
      });
    });
  });
});
