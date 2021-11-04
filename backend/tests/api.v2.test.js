const { test, describe, beforeAll, afterAll } = require("@jest/globals");
const request = require("supertest");
const uuid = require("uuid");
const app = require("../dist/app");

const data = {
  cleanPassword: "13e17ea1ee037",
  admin: {
    email: "admin@example.com",
    password: "$2b$10$9yj3GlOCSngBxZ19LkKRf.k9eBDqVYGOnDa4zRrEW8YyJKXfyRqti",
    is_admin: true,
    confirmed: true,
    created_timestamp: String(Date.now()),
  },
  user: {
    email: "user@example.com",
    password: "$2b$10$9yj3GlOCSngBxZ19LkKRf.k9eBDqVYGOnDa4zRrEW8YyJKXfyRqti",
    is_admin: false,
    confirmed: true,
    created_timestamp: String(Date.now()),
  },
  game: {
    name: "Tetris",
    description: "Just the best retro game ever",
  },
  session: {
    version: "Beta v0.5",
    external_id: "1234",
    platform: "Microsoft Windows",
    software: "Firefox",
    custom_data: JSON.stringify({
      test: true,
    }),
    updated_timestamp: String(Date.now()),
    created_timestamp: String(Date.now()),
  },
  api_key: {
    key: uuid.v4(),
    start_at: new Date(),
    description: "Basic connexion key",
  },
};

beforeAll(async () => {
  // start transaction
  await app.database.raw("START TRANSACTION");

  // init routes
  await app.loadRoutes(false);

  // create users
  for (const key of ["user", "admin"]) {
    const user = data[key];

    user.id = await app
      .database("account")
      .insert(user)
      .returning("id")
      .then((result) => result[0]);
  }

  // create game
  data.game.publisher_id = data.user.id;
  data.game.id = await app
    .database("game")
    .insert(data.game)
    .returning("id")
    .then((result) => result[0]);

  // create session
  data.session.game_id = data.game.id;
  data.session.id = await app
    .database("session")
    .insert(data.session)
    .returning("id")
    .then((result) => result[0]);

  // create API key
  data.api_key.game_id = data.game.id;
  data.api_key.account_id = data.user.id;
  await app.database("api_key").insert(data.api_key);
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
            ...data.user,
            email: null,
          })
          .expect(401)
          .end(done);
      });

      test("missing password", (done) => {
        request(app.server)
          .post(route)
          .send({
            ...data.user,
            password: null,
          })
          .expect(401)
          .end(done);
      });

      test("invalid email", (done) => {
        request(app.server)
          .post(route)
          .send({
            ...data.user,
            email: "invalid",
          })
          .expect(401)
          .end(done);
      });

      test("register is already registered user", (done) => {
        request(app.server).post(route).send(data.user).expect(401).end(done);
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
          email: data.user.email,
          password: "incorrect",
        })
        .expect(401)
        .end(done);
    });
  });

  describe("/connected", () => {
    const route = "/v2/login";

    beforeAll(async () => {
      for (const key of ["user", "admin"]) {
        data[key].token = await new Promise((resolve, reject) => {
          request(app.server)
            .post(route)
            .send({
              email: data[key].email,
              password: data.cleanPassword,
            })
            .expect(200)
            .end((err, res) => {
              if (err) return reject(err);
              resolve(res.body.token);
            });
        });
      }
    });

    describe("/account/:id", () => {
      const route = (id, token) =>
        `/v2/account/${id}${token ? "?token=" + token : ""}`;

      describe("GET", () => {
        test("missing token", (done) => {
          request(app.server).get(route(data.user.id)).expect(401).end(done);
        });

        test("account not found", (done) => {
          request(app.server)
            .get(route(uuid.v4(), data.admin.token))
            .expect(404)
            .end(done);
        });

        test("admin only (but it's own account)", (done) => {
          request(app.server)
            .get(route(data.user.id, data.user.token))
            .expect(200)
            .end(done);
        });

        test("admin only", (done) => {
          request(app.server)
            .get(route(data.admin.id, data.user.token))
            .expect(401)
            .end(done);
        });

        test("success", (done) => {
          request(app.server)
            .get(route(data.user.id, data.admin.token))
            .expect(200)
            .end(done);
        });
      });

      describe("PUT", () => {
        test("missing token", (done) => {
          request(app.server).put(route(data.user.id)).expect(401).end(done);
        });

        test("account not found", (done) => {
          request(app.server)
            .put(route(uuid.v4(), data.admin.token))
            .send({
              email: "email@user.user",
            })
            .expect(404)
            .end(done);
        });

        test("owner only", (done) => {
          request(app.server)
            .put(route(data.admin.id, data.user.token))
            .send({
              email: "email@user.user",
              old_password: data.cleanPassword,
            })
            .expect(401)
            .end(done);
        });

        test("admin only", (done) => {
          request(app.server)
            .put(route(data.admin.id, data.user.token))
            .send({
              email: "email@user.user",
            })
            .expect(401)
            .end(done);
        });

        test("invalid email", (done) => {
          request(app.server)
            .put(route(data.user.id, data.admin.token))
            .send({
              email: "test",
            })
            .expect(401)
            .end(done);
        });

        test("success", (done) => {
          request(app.server)
            .put(route(data.user.id, data.admin.token))
            .send({
              email: "email@uer.user",
              is_admin: false,
            })
            .expect(200)
            .end(done);
        });
      });
    });

    describe("🎮 Games", () => {
      describe("/game", () => {
        const route = (token) => "/v2/game" + (token ? "?token=" + token : "");

        describe("GET", () => {
          test("missing apikey", (done) => {
            request(app.server).get(route()).expect(401).end(done);
          });

          test("success", (done) => {
            request(app.server)
              .get(route(data.admin.token))
              .expect(200)
              .end(done);
          });
        });

        describe("POST", () => {
          test("missing token", (done) => {
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
              .post(route(data.admin.token))
              .expect(301)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .post(route(data.admin.token))
              .send(data.game)
              .expect(200)
              .end(done);
          });
        });
      });

      describe("/game/:id", () => {
        const route = (id, token) =>
          "/v2/game/" + id + (token ? "?token=" + token : "");

        describe("GET", () => {
          test("missing apikey", (done) => {
            request(app.server).get(route(data.game.id)).expect(401).end(done);
          });

          test("game not found", (done) => {
            request(app.server)
              .get(route(uuid.v4(), data.admin.token))
              .expect(404)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .get(route(data.game.id, data.admin.token))
              .expect(200)
              .end(done);
          });
        });

        describe("PUT", () => {
          test("missing token", (done) => {
            request(app.server)
              .put(route(data.game.id))
              .send({
                name: "New Name",
                description: "New Description",
              })
              .expect(401)
              .end(done);
          });

          test("game not found", (done) => {
            request(app.server)
              .put(route(uuid.v4(), data.admin.token))
              .send({
                name: "New Name",
                description: "New Description",
              })
              .expect(404)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .put(route(data.game.id, data.admin.token))
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
        const route = (token) =>
          "/v2/session" + (token ? "?token=" + token : "");

        describe("POST", () => {
          test("missing token", (done) => {
            request(app.server).post(route()).expect(401).end(done);
          });

          test("missing game version", (done) => {
            request(app.server)
              .post(route(data.user.token))
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
        const route = (id, api_key) =>
          `/v2/session/${id}${api_key ? "?apikey=" + api_key : ""}`;

        describe("GET", () => {
          test("missing API key", (done) => {
            request(app.server)
              .get(route(data.session.id))
              .expect(401)
              .end(done);
          });

          test("missing session", (done) => {
            request(app.server)
              .get(route(uuid.v4(), data.api_key.key))
              .expect(404)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .get(route(data.session.id, data.api_key.key))
              .expect(200)
              .end(done);
          });
        });

        describe("PUT", () => {
          test("missing API key", (done) => {
            request(app.server)
              .put(route(data.session.id))
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
              .put(route(uuid.v4(), data.api_key.key))
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
              .put(route(data.session.id, data.api_key.key))
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
        const route = (api_key) =>
          "/v2/event" + (api_key ? "?apikey=" + api_key : "");

        describe("GET", () => {
          test("missing API key", (done) => {
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
              .get(route(data.api_key.key))
              .send({
                game_id: data.game.id,
              })
              .expect(200)
              .end(done);
          });
        });

        describe("POST", () => {
          test("missing API key", (done) => {
            request(app.server)
              .post(route())
              .send({
                game_session_id: data.session.id,
              })
              .expect(401)
              .end(done);
          });

          test("missing session", (done) => {
            request(app.server)
              .post(route(data.api_key.key))
              .send()
              .expect(401)
              .end(done);
          });

          test("success", (done) => {
            request(app.server)
              .post(route(data.api_key.key))
              .send({
                session_id: data.session.id,
              })
              .expect(200)
              .end(done);
          });
        });
      });
    });
  });
});
