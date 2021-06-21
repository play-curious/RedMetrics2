const { test, describe, beforeAll, afterAll } = require("@jest/globals");
const request = require("supertest");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const app = require("../dist/app");

require("dotenv/config");

const ADMIN = {
  email: "admin@example.com",
  password: "$2b$10$9yj3GlOCSngBxZ19LkKRf.k9eBDqVYGOnDa4zRrEW8YyJKXfyRqti",
};

beforeAll(async () => {
  // start transaction
  await app.database.raw("START TRANSACTION");

  // create admin
  ADMIN.id = await app
    .database("account")
    .insert({
      ...ADMIN,
      role: "admin",
    })
    .returning("id")
    .first();

  // init db
  await app.loadRoutes(false);
});

afterAll(() => {
  // stop transaction
  return app.database.raw("ROLLBACK");
});

describe("🔒 Auth", () => {
  describe("/register", () => {
    const route = "/v2/register";

    describe("POST", () => {
      test("missing email", (done) => {
        request(app.server)
          .post(route)
          .send({
            password: "test",
            role: "user",
          })
          .expect(401)
          .end(done);
      });

      test("missing password", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: users.user.email,
            role: "user",
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
            role: "user",
          })
          .expect(401)
          .end(done);
      });

      test("register as user", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: users.user.email,
            password: "test",
            role: "user",
          })
          .expect(200)
          .end((err, res) => {
            users.user.id = res.body.id;
            done(err);
          });
      });

      test("register as dev", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: users.dev.email,
            password: "test",
            role: "dev",
          })
          .expect(200)
          .end((err, res) => {
            users.dev.id = res.body.id;
            done(err);
          });
      });

      test("register as already registered user", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: "user@test.test",
            password: "test",
            role: "user",
          })
          .expect(401)
          .end(done);
      });
    });
  });

  describe("/login", () => {
    const route = "/v2/login";

    describe("POST", () => {
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
          .expect(300)
          .end(done);
      });

      test("incorrect password", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: users.user.email,
            password: "incorrect",
          })
          .expect(401)
          .end(done);
      });

      test("login as user", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: users.user.email,
            password: "test",
          })
          .expect(200)
          .end((err, res) => {
            users.user.apiKey = res.body.apiKey;
            done(err);
          });
      });

      test("login as dev", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: users.dev.email,
            password: "test",
          })
          .expect(200)
          .end((err, res) => {
            users.dev.apiKey = res.body.apiKey;
            done(err);
          });
      });

      test("login as admin", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: users.admin.email,
            password: "test",
          })
          .expect(200)
          .end((err, res) => {
            users.admin.apiKey = res.body.apiKey;
            done(err);
          });
      });
    });
  });

  describe("/account/:id", () => {
    const route = (id, apiKey) =>
      `/v2/account/${id}${apiKey ? "?apikey=" + apiKey : ""}`;

    describe("GET", () => {
      test("missing apikey", (done) => {
        request(app.server).get(route(users.user.id)).expect(401).end(done);
      });

      test("account not found", (done) => {
        request(app.server)
          .get(route(uuid.v4(), users.admin.apiKey))
          .expect(404)
          .end(done);
      });

      // TODO: the user should be able to get their own account, but not another user
      // test("admin only", (done) => {
      //   request(app.server)
      //     .get(route(users.user.id, users.user.apiKey))
      //     .expect(401)
      //     .end(done);
      // });

      test("success", (done) => {
        request(app.server)
          .get(route(users.user.id, users.admin.apiKey))
          .expect(200)
          .end(done);
      });
    });

    describe("PUT", () => {
      test("missing apikey", (done) => {
        request(app.server).put(route(users.user.id)).expect(401).end(done);
      });

      test("account not found", (done) => {
        request(app.server)
          .put(route(uuid.v4(), users.admin.apiKey))
          .send({
            email: "email@user.user",
          })
          .expect(404)
          .end(done);
      });

      // TODO: the user should be able to get their own account, but not another user
      // test("admin only", (done) => {
      //   request(app.server)
      //     .put(route(users.user.id, users.user.apiKey))
      //     .expect(401)
      //     .end(done);
      // });

      test("invalid email", (done) => {
        request(app.server)
          .put(route(users.user.id, users.admin.apiKey))
          .send({
            email: "test",
          })
          .expect(401)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .put(route(users.user.id, users.admin.apiKey))
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
});

describe("🎮 Games", () => {
  describe("/game", () => {
    const route = (apikey) => "/v2/game" + (apikey ? "?apikey=" + apikey : "");

    describe("GET", () => {
      test("missing apikey", (done) => {
        request(app.server).get(route()).expect(401).end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(users.admin.apiKey))
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
          .post(route(users.admin.apiKey))
          .expect(301)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .post(route(users.admin.apiKey))
          .send({
            name: "Game name",
          })
          .expect(200)
          .end((err, res) => {
            games.game.id = res.body.game_id;
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
        request(app.server).get(route(games.game.id)).expect(401).end(done);
      });

      test("game not found", (done) => {
        request(app.server)
          .get(route(uuid.v4(), users.admin.apiKey))
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(games.game.id, users.admin.apiKey))
          .expect(200)
          .end(done);
      });
    });

    describe("PUT", () => {
      test("missing apikey", (done) => {
        request(app.server)
          .put(route(games.game.id))
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(401)
          .end(done);
      });

      test("game not found", (done) => {
        request(app.server)
          .put(route(uuid.v4(), users.admin.apiKey))
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .put(route(games.game.id, users.admin.apiKey))
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
        request(app.server).get(route(games.game.id)).expect(401).end(done);
      });

      test("game not found", (done) => {
        request(app.server)
          .get(route(uuid.v4(), users.admin.apiKey))
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(games.game.id, users.admin.apiKey))
          .expect(200)
          .end(done);
      });
    });

    describe("POST", () => {
      test("missing apikey", (done) => {
        request(app.server)
          .post(route(games.game.id))
          .send({
            name: "Version 1",
          })
          .expect(401)
          .end(done);
      });

      test("game not found", (done) => {
        request(app.server)
          .post(route(uuid.v4(), users.admin.apiKey))
          .send({
            name: "Version 1",
          })
          .expect(404)
          .end(done);
      });

      test("missing name", (done) => {
        request(app.server)
          .post(route(games.game.id, users.admin.apiKey))
          .expect(400)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .post(route(games.game.id, users.admin.apiKey))
          .send({
            name: "Version 1",
          })
          .expect(200)
          .end((err, res) => {
            games.game.versions.version.id = res.body.id;
            done(err);
          });
      });
    });
  });

  describe("/version/:id", () => {
    const route = (id, apikey) =>
      "/v2/version/" + id + (apikey ? "?apikey=" + apikey : "");

    describe("GET", () => {
      test("missing apikey", (done) => {
        request(app.server)
          .get(route(games.game.versions.version.id))
          .expect(401)
          .end(done);
      });

      test("version not found", (done) => {
        request(app.server)
          .get(route(uuid.v4(), users.admin.apiKey))
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(games.game.versions.version.id, users.admin.apiKey))
          .expect(200)
          .end(done);
      });
    });

    describe("PUT", () => {
      test("missing apikey", (done) => {
        request(app.server)
          .put(route(games.game.versions.version.id))
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(401)
          .end(done);
      });

      test("version not found", (done) => {
        request(app.server)
          .put(route(uuid.v4(), users.admin.apiKey))
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .put(route(games.game.versions.version.id, users.admin.apiKey))
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
          .post(route(users.user.apiKey))
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

      test("success", (done) => {
        request(app.server)
          .post(route(users.dev.apiKey))
          .send({
            external_id: "id",
            platform: "Microsoft Windows",
            software: "Firefox",
            game_version_id: games.game.versions.version.id,
            custom_data: {
              test: true,
            },
          })
          .expect(200)
          .end((err, res) => {
            games.game.sessions.session.id = res.body.id;
            done(err);
          });
      });
    });
  });

  describe("/session/:id", () => {
    const route = (id, apikey) =>
      `/v2/game-session/${id}${apikey ? "?apikey=" + apikey : ""}`;

    describe("GET", () => {
      test("missing apikey", (done) => {
        request(app.server)
          .get(route(games.game.sessions.session.id))
          .expect(401)
          .end(done);
      });

      test("missing session", (done) => {
        request(app.server)
          .get(route(uuid.v4(), users.admin.apiKey))
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(games.game.sessions.session.id, users.admin.apiKey))
          .expect(200)
          .end(done);
      });
    });

    describe("PUT", () => {
      test("missing apikey", (done) => {
        request(app.server)
          .put(route(games.game.sessions.session.id))
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
          .put(route(uuid.v4(), users.admin.apiKey))
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
          .put(route(games.game.sessions.session.id, users.admin.apiKey))
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
    const route = (apikey) => "/v2/event" + (apikey ? "?apikey=" + apikey : "");

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
          .get(route(users.admin.apiKey))
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
            game_version_id: games.game.versions.version.id,
          })
          .expect(401)
          .end(done);
      });

      test("missing version", (done) => {
        request(app.server)
          .post(route(users.admin.apiKey))
          .send({})
          .expect(300)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .post(route(users.admin.apiKey))
          .send({
            game_version_id: games.game.versions.version.id,
            game_session_id: games.game.sessions.session.id,
          })
          .expect(200)
          .end(done);
      });
    });
  });
});
