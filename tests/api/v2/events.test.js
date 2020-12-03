const request = require("supertest");
const app = require("../../../dist/app");

const { user_tokens, user_ids } = require("./auth.test");
const { game_version_ids } = require("./game.test");

describe("events", () => {
  describe("session", () => {
    describe("post", () => {
      const route = "/session";

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
            .end(done);
        });
      });
    });

    {
      const route = (id) => `/session/${id}`

      describe("get", () => {
        describe("fails", () => {
          test("missing token", (done) => {

          })
        })

        describe("success", () => {

        })
      })

      describe("update", () => {
        describe("fails", () => {
          test("missing token", (done) => {

          })
        })

        describe("success", () => {

        })
      })
    }

  });
});
