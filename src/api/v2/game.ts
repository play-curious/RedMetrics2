import expressAsyncHandler from "express-async-handler";
import * as app from "../../app";
import * as utils from "../../utils";
import * as types from "../../types";
import * as game from "../../controllers/game";

app.v2
  .route("/game")
  .get(
    utils.needRole("user"),
    expressAsyncHandler(async (req, res) => {
      // Lists the games using the service as GameMeta objects (see section on Paging below)
      res.json(await game.getGames());
    })
  )
  .post(
    utils.needRole("dev"),
    expressAsyncHandler(async (req, res) => {
      //  Creates a new game.
      //  A GameMeta object should be sent in the body.
      //  A default version of the game will be created.
      //  The Location response header will contain the URL for the new game.

      if (!utils.isLogin(req)) return;

      if (!req.body.name)
        return utils.sendError(res, {
          code: 301,
          description: "Missing game name",
        });

      const currentGame: types.Game = {
        publisher_id: req.user.account_id,
        author: req.body.author,
        custom_data: req.body.custom_data,
        description: req.body.description,
        name: req.body.name,
      };

      const game_id = await game.postGame(currentGame);

      const game_version_id = await game.postGameVersion({
        game_id,
        name: "default",
      });

      res.json({
        game_id,
        game_version_id,
        success: "Success",
      });
    })
  );

app.v2
  .route("/game/:uuid")
  .get(
    utils.needRole("user"),
    expressAsyncHandler(async (req, res) => {
      // Retrieves information about the game with that Id as a GameMeta object

      // todo: add a v2.param("uuid") to check his validity automatically

      const targetGame = await game.getGame(req.params.uuid);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      res.json(targetGame);
    })
  )
  .put(
    utils.needRole("dev"),
    expressAsyncHandler(async (req, res) => {
      // Updates game information with the provided GameMeta.

      const targetGame = await game.getGame(req.params.uuid);

      if (!targetGame) {
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });
      }

      await game.updateGame(req.params.uuid, {
        name: req.body.name,
        description: req.body.description,
        custom_data: req.body.custom_data,
        author: req.body.author,
      });

      res.json({
        success: "Success",
      });
    })
  );

app.v2
  .route("/game/:uuid/version")
  .get(
    utils.needRole("user"),
    expressAsyncHandler(async (req, res) => {
      // Lists versions of the the game with that Id as GameVersionMeta objects (see section on Paging below)

      const targetGame = await game.getGame(req.params.uuid);

      if (!targetGame) {
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });
      }

      const targetGameVersions = await game.getGameVersions(req.params.uuid);

      res.json(targetGameVersions);
    })
  )
  .post(
    utils.needRole("dev"),
    expressAsyncHandler(async (req, res) => {
      //  Creates a new version of the game.
      //  A GameVersionMeta object should be sent in the body.
      //  The Location response header will contain the URL for the new game.

      if (!req.body.name)
        return utils.sendError(res, {
          code: 400,
          description: "Missing version name",
        });

      const targetGame = await game.getGame(req.params.uuid);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      const id = await game.postGameVersion({
        name: req.body.name,
        game_id: targetGame.id as string,
        custom_data: req.body.custom_data,
        description: req.body.description,
      });

      res.json({
        id,
        success: "Success",
      });
    })
  );

app.v2
  .route("/version/:uuid")
  .get(
    utils.needRole("user"),
    expressAsyncHandler(async (req, res) => {
      // Retrieves information about the game version as a GameVersionMeta object

      const version = await game.getGameVersion(req.params.uuid);

      if (!version)
        return utils.sendError(res, {
          code: 404,
          description: "Version not found",
        });

      res.json(version);
    })
  )
  .put(
    utils.needRole("dev"),
    expressAsyncHandler(async (req, res) => {
      // Updates game information with the provided GameVersionMeta.

      const version = await game.getGameVersion(req.params.uuid);

      if (!version)
        return utils.sendError(res, {
          code: 404,
          description: "Version not found",
        });

      const values: Partial<types.GameVersion> = {
        name: req.body.name,
        description: req.body.description,
        custom_data: req.body.custom_data,
      };

      const id = await game.updateGameVersion(req.params.uuid, values);

      res.json({
        id,
        success: "Success",
      });
    })
  );
