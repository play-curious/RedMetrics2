import expressAsyncHandler from "express-async-handler";

import * as app from "../../app";
import * as utils from "../../utils";
import * as types from "rm2-typings";

import * as game from "../../controllers/game";
import * as auth from "../../controllers/auth";
import * as event from "../../controllers/events";
import * as events from "../../controllers/events";

const route = types.utils.buildRouteMaker(app.v2);

route<types.api.Game>(
  "Get",
  "/game",
  utils.authentication(undefined, true),
  expressAsyncHandler(async (req, res) => {
    // Lists the games using the service as GameMeta objects (see section on Paging below)

    const publisher_id = req.body.publisher_id,
      offset = req.body.offset,
      count = req.body.count;

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
);

route<types.api.Game>(
  "Post",
  "/game",
  utils.authentication(undefined, true),
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

    const currentGame: types.api.Game["Methods"]["Post"]["Body"] = {
      publisher_id: req.account.id,
      author: req.body.author,
      custom_data: JSON.stringify(req.body.custom_data ?? {}),
      description: req.body.description,
      name: req.body.name,
    };

    const id = await game.postGame(currentGame);

    res.json({
      id,
      ...currentGame,
    });
  })
);

route<types.api.GameById>(
  "Get",
  "/game/:id",
  utils.authentication(
    async (context) =>
      (await game.getGame(context.params.id))?.publisher_id ===
      context.account.id,
    true
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
);

route<types.api.GameById>(
  "Put",
  "/game/:id",
  utils.authentication(
    async (context) =>
      (await game.getGame(context.params.id))?.publisher_id ===
      context.account.id,
    true
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
);

route<types.api.GameById>(
  "Delete",
  "/game/:id",
  utils.authentication(
    async (context) =>
      (await game.getGame(context.params.id))?.publisher_id ===
      context.account.id,
    true
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

route<types.api.GameById_Data>(
  "Get",
  "/game/:id/data",
  utils.authentication(
    async (context) =>
      (await game.getGame(context.params.id))?.publisher_id ===
      context.account.id,
    true
  ),
  expressAsyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    const targetGame = await game.getGame(req.params.id);

    if (!targetGame)
      return utils.sendError(res, {
        code: 404,
        description: "Game not found",
      });

    const sessions = await event.getGameSessions(targetGame.id);

    const returned: types.api.GameById_Data["Methods"]["Get"]["Response"] = {
      ...targetGame,
      sessions: await Promise.all(
        sessions.map(async (session) => {
          return {
            ...session,
            events: await event.getEvents(session.id),
          };
        })
      ),
    };

    res.json(returned);
  })
);

route<types.api.GameById_Sessions>(
  "Get",
  "/game/:id/sessions",
  utils.authentication(
    async (context) =>
      (context.params.id &&
        (await game.getGame(context.params.id))?.publisher_id ===
          context.account.id) ||
      context.account.is_admin
  ),
  expressAsyncHandler(async (req, res) => {
    res.json(await events.getGameSessions(req.params.id));
  })
);
