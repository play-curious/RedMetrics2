const request = require("supertest");
const app = require("../../../dist/app");

const user_tokens = new Map();
const user_ids = new Map();

module.exports = {
  user_tokens,
  user_ids,
};

describe("auth", () => {
  describe("register", () => {
    const route = "/api/v2/rest/account";

    describe("fails", () => {
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
    });

    describe("success", () => {
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

  describe("login", () => {
    const route = "/api/v2/rest/login";

    describe("fails", () => {
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
    });

    describe("success", () => {
      test("login", (done) => {
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

  describe("account", () => {
    const route = (id) => `/api/v2/rest/account/${id}`;

    describe("get", () => {
      describe("fails", () => {
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
      });

      describe("success", () => {
        test("get account", (done) => {
          request(app.server)
            .get(route(user_ids.get("user")))
            .set("Authorization", `bearer ${user_tokens.get("admin")}`)
            .expect(200)
            .end(done);
        });
      });
    });

    describe("update", () => {
      describe("fails", () => {
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
      });

      describe("success", () => {
        test("update user", (done) => {
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
});
