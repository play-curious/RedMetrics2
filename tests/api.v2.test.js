const request = require("supertest");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const app = require("../dist/app");

dotenv.config();

const user_tokens = new Map();
const user_ids = new Map();
const session_ids = new Map();
const game_ids = new Map();
const game_version_ids = new Map();
const user_emails = new Map([
  ["admin", "admin@test.test"],
  ["user", "user@test.test"],
  ["dev", "dev@test.test"],
]);

describe("⚙ Config", () => {
  describe("prepare database", () => {
    test("start transaction", (done) => {
      app.database
        .raw("START TRANSACTION")
        .then(() => done())
        .catch(done);
    });

    test("add admin account", (done) => {
      app
        .database("account")
        .insert({
          email: user_emails.get("admin"),
          password: bcrypt.hashSync("test", process.env.SALT),
          role: "admin",
        })
        .then(() => done())
        .catch(done);
    });
  });

  test("prepare endpoints", (done) => {
    app
      .loadRoutes(false)
      .then(() => done())
      .catch(done);
  });
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
            email: user_emails.get("user"),
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
            email: user_emails.get("user"),
            password: "test",
            role: "user",
          })
          .expect(200)
          .end((err, res) => {
            user_ids.set("user", res.body.id);
            done(err);
          });
      });

      test("register as dev", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: user_emails.get("dev"),
            password: "test",
            role: "dev",
          })
          .expect(200)
          .end((err, res) => {
            user_ids.set("dev", res.body.id);
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

      test("unknown email", (done) => {
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
            email: user_emails.get("user"),
            password: "incorrect",
          })
          .expect(401)
          .end(done);
      });

      test("login as user", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: user_emails.get("user"),
            password: "test",
          })
          .expect(200)
          .end((err, res) => {
            user_tokens.set("user", res.body.token);
            done(err);
          });
      });

      test("login as admin", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: user_emails.get("admin"),
            password: "test",
          })
          .expect(200)
          .end((err, res) => {
            user_tokens.set("admin", res.body.token);
            done(err);
          });
      });
    });
  });

  describe("/account/:id", () => {
    const route = (id) => `/v2/account/${id}`;

    describe("GET", () => {
      test("missing token", (done) => {
        request(app.server)
          .get(route(user_ids.get("user")))
          .expect(401)
          .end(done);
      });

      test("unknown account", (done) => {
        request(app.server)
          .get(route(uuid.v4()))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(404)
          .end(done);
      });

      test("admin only", (done) => {
        request(app.server)
          .get(route(user_ids.get("user")))
          .set("Authorization", `bearer ${user_tokens.get("user")}`)
          .expect(401)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(user_ids.get("user")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(200)
          .end(done);
      });
    });

    describe("PUT", () => {
      test("missing token", (done) => {
        request(app.server)
          .put(route(user_ids.get("user")))
          .expect(401)
          .end(done);
      });

      test("unknown account", (done) => {
        request(app.server)
          .put(route(uuid.v4()))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .send({
            email: "email@user.user",
          })
          .expect(404)
          .end(done);
      });

      test("admin only", (done) => {
        request(app.server)
          .put(route(user_ids.get("user")))
          .set("Authorization", `bearer ${user_tokens.get("user")}`)
          .expect(401)
          .end(done);
      });

      test("invalid email", (done) => {
        request(app.server)
          .put(route(user_ids.get("user")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .send({
            email: "test",
          })
          .expect(401)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .put(route(user_ids.get("user")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
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
    const route = "/v2/game";

    describe("GET", () => {
      test("missing token", (done) => {
        request(app.server).get(route).expect(401).end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route)
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(200)
          .end(done);
      });
    });

    describe("POST", () => {
      test("missing token", (done) => {
        request(app.server)
          .post(route)
          .send({
            name: "Game name",
          })
          .expect(401)
          .end(done);
      });

      test("missing name", (done) => {
        request(app.server)
          .post(route)
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(301)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .post(route)
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .send({
            name: "Game name",
          })
          .expect(200)
          .end((err, res) => {
            game_ids.set("game", res.body.game_id);
            done(err);
          });
      });
    });
  });

  describe("/game/:id", () => {
    const route = (id) => "/v2/game/" + id;

    describe("GET", () => {
      test("missing token", (done) => {
        request(app.server)
          .get(route(game_ids.get("game")))
          .expect(401)
          .end(done);
      });

      test("unknown game", (done) => {
        request(app.server)
          .get(route(uuid.v4()))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(game_ids.get("game")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(200)
          .end(done);
      });
    });

    describe("PUT", () => {
      test("missing token", (done) => {
        request(app.server)
          .put(route(game_ids.get("game")))
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(401)
          .end(done);
      });

      test("unknown game", (done) => {
        request(app.server)
          .put(route(uuid.v4()))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .put(route(game_ids.get("game")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
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
    const route = (id) => `/v2/game/${id}/version`;

    describe("GET", () => {
      test("missing token", (done) => {
        request(app.server)
          .get(route(game_ids.get("game")))
          .expect(401)
          .end(done);
      });

      test("unknown game", (done) => {
        request(app.server)
          .get(route(uuid.v4()))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(game_ids.get("game")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(200)
          .end(done);
      });
    });

    describe("POST", () => {
      test("missing token", (done) => {
        request(app.server)
          .post(route(game_ids.get("game")))
          .send({
            name: "Version 1",
          })
          .expect(401)
          .end(done);
      });

      test("unknown game", (done) => {
        request(app.server)
          .post(route(uuid.v4()))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .send({
            name: "Version 1",
          })
          .expect(404)
          .end(done);
      });

      test("missing name", (done) => {
        request(app.server)
          .post(route(game_ids.get("game")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(400)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .post(route(game_ids.get("game")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .send({
            name: "Version 1",
          })
          .expect(200)
          .end((err, res) => {
            game_version_ids.set("version", res.body.id);
            done(err);
          });
      });
    });
  });

  describe("/version/:id", () => {
    const route = (id) => "/v2/version/" + id;

    describe("GET", () => {
      test("missing token", (done) => {
        request(app.server)
          .get(route(game_version_ids.get("version")))
          .expect(401)
          .end(done);
      });

      test("unknown version", (done) => {
        request(app.server)
          .get(route(uuid.v4()))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(game_version_ids.get("version")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(200)
          .end(done);
      });
    });

    describe("PUT", () => {
      test("missing token", (done) => {
        request(app.server)
          .put(route(game_version_ids.get("version")))
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(401)
          .end(done);
      });

      test("unknown version", (done) => {
        request(app.server)
          .put(route(uuid.v4()))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .put(route(game_version_ids.get("version")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
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
    const route = "/v2/session";

    describe("POST", () => {
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

      test("success", (done) => {
        request(app.server)
          .post(route)
          .set("Authorization", `bearer ${user_tokens.get("user")}`)
          .send({
            external_id: "id",
            platform: "Microsoft Windows",
            software: "Firefox",
            game_version_id: game_version_ids.get("version"),
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

  describe("/session/:id", () => {
    const route = (id) => `/v2/session/${id}`;

    describe("GET", () => {
      test("missing token", (done) => {
        request(app.server)
          .get(route(session_ids.get("session")))
          .expect(401)
          .end(done);
      });

      test("missing session", (done) => {
        request(app.server)
          .get(route(uuid.v4()))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(session_ids.get("session")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(200)
          .end(done);
      });
    });

    describe("PUT", () => {
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
          .put(route(uuid.v4()))
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

      test("success", (done) => {
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
          .expect(200)
          .end(done);
      });
    });
  });

  describe("/event", () => {
    const route = "/v2/event";

    describe("GET", () => {
      test("missing token", (done) => {
        request(app.server)
          .get(route)
          .send({
            // filtres
          })
          .expect(401)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route)
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .send({
            // filtres
          })
          .expect(200)
          .end(done);
      });
    });

    describe("POST", () => {
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

      test("success", (done) => {
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

describe("🗑 Cleanup", () => {
  test("cleanup database", (done) => {
    // app
    //   .database("account")
    //   .truncate()
    //   .then(() => done())
    //   .catch(done);

    app.database
      .raw("ROLLBACK")
      .then(() => done())
      .catch(done);
  });
});
