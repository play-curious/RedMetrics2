import expressAsyncHandler from "express-async-handler";

import * as app from "../../app";
import * as utils from "../../utils";
import * as types from "../../types";

import * as game from "../../controllers/game";
import * as auth from "../../controllers/auth";

app.v2
  .route("/game")
  .get(
    utils.needRole("user"),
    expressAsyncHandler(async (req, res) => {
      // Lists the games using the service as GameMeta objects (see section on Paging below)
      const publisher_id = req.params.publisher_id,
        offset = req.params.offset,
        count = req.params.count;

      let query: any;

      if (publisher_id) {
        const publisher = await auth.getAccount(publisher_id);

        if (!publisher)
          return utils.sendError(res, {
            description: "Publisher not found",
            code: 404,
          });

        query = game.getPublisherGames(publisher_id);
      } else {
        query = game.getGames();
      }

      if (offset) query.offset(+offset);
      if (count) query.limit(+count);

      res.json(await query);
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

      if (!utils.isLogin(req)) return;

      const targetGame = await game.getGame(req.params.uuid);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      if (
        req.user.roleRank < utils.roleRank("admin") &&
        targetGame.publisher_id !== req.user.account_id
      )
        return utils.sendError(res, {
          code: 401,
          description: "This game does not belong to you ",
        });

      await game.updateGame(req.params.uuid, {
        name: req.body.name,
        description: req.body.description,
        custom_data: req.body.custom_data,
        author: req.body.author,
      });

      res.sendStatus(200);
    })
  )
  .delete(
    utils.needRole("dev"),
    expressAsyncHandler(async (req, res) => {
      if (!utils.isLogin(req)) return;

      const targetGame = await game.getGame(req.params.uuid);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      if (
        req.user.roleRank < utils.roleRank("admin") &&
        targetGame.publisher_id !== req.user.account_id
      )
        return utils.sendError(res, {
          code: 401,
          description: "This game does not belong to you ",
        });

      await game.removeGame(targetGame.id as string);

      res.sendStatus(200);
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

      if (!utils.isLogin(req)) return;

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

      if (
        req.user.roleRank < utils.roleRank("admin") &&
        targetGame.publisher_id !== req.user.account_id
      )
        return utils.sendError(res, {
          code: 401,
          description: "This game does not belong to you ",
        });

      const id = await game.postGameVersion({
        name: req.body.name,
        game_id: targetGame.id as string,
        custom_data: req.body.custom_data,
        description: req.body.description,
      });

      res.json({ id });
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

      if (!utils.isLogin(req)) return;

      const version = await game.getGameVersion(req.params.uuid);

      if (!version)
        return utils.sendError(res, {
          code: 404,
          description: "Version not found",
        });

      const targetGame = await game.getGame(version.game_id);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      if (
        req.user.roleRank < utils.roleRank("admin") &&
        targetGame.publisher_id !== req.user.account_id
      )
        return utils.sendError(res, {
          code: 401,
          description: "This game does not belong to you ",
        });

      const values: Partial<types.GameVersion> = {
        name: req.body.name,
        description: req.body.description,
        custom_data: req.body.custom_data,
      };

      await game.updateGameVersion(req.params.uuid, values);

      res.sendStatus(200);
    })
  );
