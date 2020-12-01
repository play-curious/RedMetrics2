const request = require("supertest");
const app = require("../../../dist/app");

describe("auth", () => {
  describe("register", () => {
    describe("fails", () => {
      test("missing email", (done) => {
        request(app.server)
          .post("/api/v2/rest/account")
          .send({
            password: "test",
            type: "user",
          })
          .expect(401)
          .end(done);
      });

      test("missing password", (done) => {
        request(app.server)
          .post("/api/v2/rest/account")
          .send({
            email: "test@test.test",
            type: "user",
          })
          .expect(401)
          .end(done);
      });

      test("invalid email", (done) => {
        request(app.server)
          .post("/api/v2/rest/account")
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
          .post("/api/v2/rest/account")
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
          .post("/api/v2/rest/account")
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
          .post("/api/v2/rest/account")
          .send({
            email: "test@test.test",
            password: "test",
            type: "user",
          })
          .expect(300)
          .end(done);
      });
    });
  });

  test("login", (done) => {});
});
