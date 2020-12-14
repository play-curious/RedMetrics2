const request = require("supertest");
const app = require("../dist/app");

const user_tokens = new Map();
const user_ids = new Map();
const session_ids = new Map();
const game_ids = new Map();
const game_version_ids = new Map();

describe("🔒 Auth", () => {
  describe("/account", () => {
    const route = "/api/v2/rest/account";

    describe("POST", () => {
      test("missing email", (done) => {
        request(app.server)
          .post(route)
          .send({
            password: "test",
            type: "user",
          })
          .expect(401)
          .end(done);
      });

      test("missing password", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: "test@test.test",
            type: "user",
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
            type: "user",
          })
          .expect(401)
          .end(done);
      });

      test("register as user", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: "user@test.test",
            password: "test",
            type: "user",
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
            email: "dev@test.test",
            password: "test",
            type: "dev",
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
            type: "user",
          })
          .expect(300)
          .end(done);
      });
    });
  });

  describe("/login", () => {
    const route = "/api/v2/rest/login";

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
            email: "user@test.test",
            password: "incorrect",
          })
          .expect(401)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .post(route)
          .send({
            email: "user@test.test",
            password: "test",
          })
          .expect(200)
          .end((err, res) => {
            user_tokens.set("user", res.body.token);
            done(err);
          });
      });
    });
  });

  describe("/account/:id", () => {
    const route = (id) => `/api/v2/rest/account/${id}`;

    describe("GET", () => {
      test("missing token", (done) => {
        request(app.server)
          .get(route(user_ids.get("admin")))
          .expect(401)
          .end(done);
      });

      test("unknown account", (done) => {
        request(app.server)
          .get(route(-1))
          .set("Authorization", `bearer ${user_tokens.get("user")}`)
          .expect(404)
          .end(done);
      });

      test("admin only", (done) => {
        request(app.server)
          .get(route(user_ids.get("user")))
          .set("Authorization", `bearer ${user_tokens.get("user")}`)
          .expect(300)
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
          .put(route(-1))
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
          .expect(300)
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
            type: "dev",
          })
          .expect(200)
          .end(done);
      });
    });
  });
});

describe("🔔 Events", () => {
  describe("/session", () => {
    const route = "/api/v2/rest/session";

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

  describe("/session/:id", () => {
    const route = (id) => `/api/v2/rest/session/${id}`;

    describe("GET", () => {
      test("missing token", (done) => {
        request(app.server)
          .get(route(session_ids.get("session")))
          .expect(401)
          .end(done);
      });

      test("missing session", (done) => {
        request(app.server)
          .get(route(-1))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(404)
          .end(done);
      });

      test("success", (done) => {
        request(app.server)
          .get(route(session_ids.get("session")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(404)
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
          .expect(404)
          .end(done);
      });
    });
  });

  describe("/event", () => {
    const route = "/api/v2/rest/event";

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

describe("🎮 Games", () => {
  describe("/game", () => {
    const route = "/api/v2/rest/game";

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
    const route = (id) => "/api/v2/rest/game/" + id;

    describe("GET", () => {
      describe("missing token", (done) => {
        request(app.server)
          .get(route(game_ids.get("game")))
          .expect(401)
          .end(done);
      });

      describe("unknown game", (done) => {
        request(app.server)
          .get(route(-1))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(404)
          .end(done);
      });

      describe("success", (done) => {
        request(app.server)
          .get(route(game_ids.get("game")))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .expect(200)
          .end(done);
      });
    });

    describe("PUT", () => {
      describe("missing token", (done) => {
        request(app.server)
          .put(route(game_ids.get("game")))
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(401)
          .end(done);
      });

      describe("unknown game", (done) => {
        request(app.server)
          .put(route(-1))
          .set("Authorization", `bearer ${user_tokens.get("admin")}`)
          .send({
            name: "New Name",
            description: "New Description",
          })
          .expect(404)
          .end(done);
      });

      describe("success", (done) => {
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

  describe("/version", () => {});

  describe("/version/:id", () => {});
});
