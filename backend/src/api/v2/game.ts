import expressAsyncHandler from "express-async-handler";

import * as app from "../../app";
import * as utils from "../../utils";
import * as types from "rm2-typings";

import * as game from "../../controllers/game";
import * as auth from "../../controllers/auth";

app.v2
  .route("/game")
  .get(
    utils.checkUser([
      types.Permission.SHOW_GAMES,
      types.Permission.MANAGE_GAMES,
    ]),
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
    utils.checkUser([
      types.Permission.CREATE_GAMES,
      types.Permission.MANAGE_GAMES,
    ]),
    expressAsyncHandler(async (req, res) => {
      //  Creates a new game.
      //  A GameMeta object should be sent in the body.
      //  A default version of the game will be created.
      //  The Location response header will contain the URL for the new game.

      if (!utils.hasAccount(req)) return;

      if (!req.body.name)
        return utils.sendError(res, {
          code: 301,
          description: "Missing game name",
        });

      const currentGame: types.RawGame = {
        publisher_id: req.user.account_id,
        author: req.body.author,
        custom_data: JSON.stringify(req.body.custom_data ?? {}),
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
  .route("/game/:id")
  .get(
    utils.checkUser(
      [types.Permission.SHOW_GAMES, types.Permission.MANAGE_GAMES],
      async (context) =>
        (await game.getGame(context.params.id))?.publisher_id ===
        context.account.id
    ),
    expressAsyncHandler(async (req, res) => {
      // Retrieves information about the game with that Id as a GameMeta object

      // todo: add a v2.param("uuid") to check his validity automatically

      const targetGame = await game.getGame(req.params.id);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      res.json(targetGame);
    })
  )
  .put(
    utils.checkUser(
      [types.Permission.EDIT_GAMES, types.Permission.MANAGE_GAMES],
      async (context) =>
        (await game.getGame(context.params.id))?.publisher_id ===
        context.account.id
    ),
    expressAsyncHandler(async (req, res) => {
      // Updates game information with the provided GameMeta.

      if (!utils.hasAccount(req)) return;

      const targetGame = await game.getGame(req.params.id);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      await game.updateGame(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        custom_data: JSON.stringify(req.body.custom_data ?? {}),
        author: req.body.author,
      });

      res.sendStatus(200);
    })
  )
  .delete(
    utils.checkUser(
      [types.Permission.DELETE_GAMES, types.Permission.MANAGE_GAMES],
      async (context) =>
        (await game.getGame(context.params.id))?.publisher_id ===
        context.account.id
    ),
    expressAsyncHandler(async (req, res) => {
      if (!utils.hasAccount(req)) return;

      const targetGame = await game.getGame(req.params.id);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      await game.removeGame(targetGame.id as string);

      res.sendStatus(200);
    })
  );

app.v2
  .route("/game/:id/version")
  .get(
    utils.checkUser(
      [types.Permission.SHOW_GAMES, types.Permission.MANAGE_GAMES],
      async (context) =>
        (await game.getGame(context.params.id))?.publisher_id ===
        context.account.id
    ),
    expressAsyncHandler(async (req, res) => {
      // Lists versions of the the game with that Id as GameVersionMeta objects (see section on Paging below)

      const targetGame = await game.getGame(req.params.id);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      const targetGameVersions = await game.getGameVersions(req.params.id);

      res.json(targetGameVersions);
    })
  )
  .post(
    utils.checkUser(
      [types.Permission.EDIT_GAMES, types.Permission.MANAGE_GAMES],
      async (context) =>
        (await game.getGame(context.params.id))?.publisher_id ===
        context.account.id
    ),
    expressAsyncHandler(async (req, res) => {
      //  Creates a new version of the game.
      //  A GameVersionMeta object should be sent in the body.
      //  The Location response header will contain the URL for the new game.

      if (!utils.hasAccount(req)) return;

      if (!req.body.name)
        return utils.sendError(res, {
          code: 400,
          description: "Missing version name",
        });

      const targetGame = await game.getGame(req.params.id);

      if (!targetGame)
        return utils.sendError(res, {
          code: 404,
          description: "Game not found",
        });

      const id = await game.postGameVersion({
        name: req.body.name,
        game_id: targetGame.id as string,
        custom_data: JSON.stringify(req.body.custom_data ?? {}),
        description: req.body.description,
      });

      res.json({ id });
    })
  );

app.v2
  .route("/version/:id")
  .get(
    utils.checkUser([
      types.Permission.SHOW_GAMES,
      types.Permission.MANAGE_GAMES,
    ]),
    expressAsyncHandler(async (req, res) => {
      // Retrieves information about the game version as a GameVersionMeta object

      const version = await game.getGameVersion(req.params.id);

      if (!version)
        return utils.sendError(res, {
          code: 404,
          description: "Version not found",
        });

      res.json(version);
    })
  )
  .put(
    utils.checkUser([
      types.Permission.EDIT_GAMES,
      types.Permission.MANAGE_GAMES,
    ]),
    expressAsyncHandler(async (req, res) => {
      // Updates game information with the provided GameVersionMeta.

      if (!utils.hasAccount(req)) return;

      const version = await game.getGameVersion(req.params.id);

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

      const values: Partial<types.RawGameVersion> = {
        name: req.body.name,
        description: req.body.description,
        custom_data: JSON.stringify(req.body.custom_data ?? {}),
      };

      await game.updateGameVersion(req.params.id, values);

      res.sendStatus(200);
    })
  );
