const request = require("supertest");
const app = require("../../../dist/app");

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
          .end(done);
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
          .end(done);
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
          .end(done);
      });
    });
  });
});
