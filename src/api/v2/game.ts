import expressAsyncHandler from "express-async-handler";
import * as app from "../../app";
import * as game from "../../controllers/game";
import * as utils from "../../utils";

app.v2
  .route("/game")
  .get(
    utils.needToken,
    expressAsyncHandler(async (req, res) => {
      // todo: Lists the games using the service as GameMeta objects (see section on Paging below)
      res.json({
        games: await game.getGames(),
      });
    })
  )
  .post(utils.needToken, (req, res) => {
    // todo:
    //  Creates a new game.
    //  A GameMeta object should be sent in the body.
    //  A default version of the game will be created.
    //  The Location response header will contain the URL for the new game.
    res.status(404).json({
      error: "not implemented, ",
    });
  });

app.v2
  .route("/game/:uuid")
  .get(
    expressAsyncHandler(async (req, res) => {
      // todo: Retrieves information about the game with that Id as a GameMeta object

      // todo: add a v2.param("uuid") to check his validity automatically
      res.json({ game: await game.getGame(req.params.uuid) });
    })
  )
  .put((req, res) => {
    // todo: Updates game information with the provided GameMeta.
    res.status(404).json({
      error: "not implemented, ",
    });
  });

app.v2
  .route("/game/:uuid/version")
  .get((req, res) => {
    // todo: Lists versions of the the game with that Id as GameVersionMeta objects (see section on Paging below)
    res.status(404).json({
      error: "not implemented, ",
    });
  })
  .post((req, res) => {
    // todo:
    //  Creates a new version of the game.
    //  A GameVersionMeta object should be sent in the body.
    //  The Location response header will contain the URL for the new game.
    res.status(404).json({
      error: "not implemented, ",
    });
  });

app.v2
  .route("/game/:uuid/version/:versionId")
  .get((req, res) => {
    // todo: Retrieves information about the game version as a GameVersionMeta object
    res.status(404).json({
      error: "not implemented, ",
    });
  })
  .put((req, res) => {
    // todo: Updates game information with the provided GameVersionMeta.
    res.status(404).json({
      error: "not implemented, ",
    });
  });
