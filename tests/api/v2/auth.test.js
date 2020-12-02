const request = require("supertest");
const app = require("../../../dist/app");

const tokens = new Map();
const ids = new Map();

process.tokens = tokens;
process.ids = ids;

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
            ids.set("user", res.body.id);
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
            ids.set("dev", res.body.id);
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
            tokens.push(res.body.token);
            done(err);
          });
      });
    });
  });

  describe("account", () => {
    const route = (id) => `/api/v2/rest/account/${id}`;

    describe("get", () => {
      describe("fails", () => {
        test("unknown account", (done) => {
          request(app.server).get(route(-1)).expect(404).end(done);
        });

        test("missing token", (done) => {
          request(app.server)
            .get(route(ids.get("admin")))
            .expect(401)
            .end(done);
        });

        test("admin only", (done) => {
          request(app.server)
            .get(route(ids.get("user")))
            .set("Authorization", `bearer ${tokens.get("user")}`)
            .expect(300)
            .end(done);
        });
      });

      describe("success", () => {
        test("get account", (done) => {
          request(app.server)
            .get(route(ids.get("user")))
            .set("Authorization", `bearer ${tokens.get("admin")}`)
            .expect(200)
            .end(done);
        });
      });
    });

    describe("update", () => {
      describe("fails", () => {});

      describe("success", () => {});
    });
  });
});
