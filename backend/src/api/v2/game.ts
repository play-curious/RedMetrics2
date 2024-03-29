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
  utils.asyncHandler(async (req, res) => {
    // Lists the games using the service as GameMeta objects (see section on Paging below)

    const publisher_id = req.query.publisher_id;

    let query: any, total: number;

    if (typeof publisher_id === "string") {
      const publisher = await auth.getAccount(publisher_id);

      if (!publisher)
        return utils.sendError(res, {
          description: "Publisher not found",
          code: 404,
        });

      query = game.getPublisherGames(publisher_id);
      total = await utils.count(
        game.games().where({ publisher_id: publisher.id })
      );
    } else {
      query = game.getGames();
      total = await utils.count(game.getGames());
    }

    const { offset, perPage, pageCount, page, sortBy } =
      utils.extractPagingParams(req, total);

    const games = await query
      .offset(offset)
      .limit(perPage)
      .orderBy(sortBy?.column ?? "name", sortBy?.order ?? "desc");

    utils.setPagingHeaders(req, res, {
      perPage,
      total,
      pageCount,
      page,
    });

    res.json(utils.jsonRecursivelySnakeToCamelCase(games));
  })
);

route<types.api.Game>(
  "Post",
  "/game",
  utils.authentication(undefined, true),
  utils.asyncHandler(async (req, res) => {
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
      publisherId: req.account.id,
      author: req.body.author,
      customData: JSON.stringify(req.body.customData ?? {}),
      description: req.body.description,
      name: req.body.name,
    };

    const id = await game.postGame({
      publisher_id: currentGame.publisherId,
      author: currentGame.author,
      custom_data: currentGame.customData,
      description: currentGame.description,
      name: currentGame.name,
    });

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
  utils.asyncHandler(async (req, res) => {
    // Retrieves information about the game with that Id as a GameMeta object

    // todo: add a v2.param("uuid") to check his validity automatically

    const targetGame = await game.getGame(req.params.id);

    if (!targetGame)
      return utils.sendError(res, {
        code: 404,
        description: "Game not found",
      });

    res.json(utils.jsonRecursivelySnakeToCamelCase(targetGame));
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
  utils.asyncHandler(async (req, res) => {
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
      custom_data: JSON.stringify(req.body.customData ?? {}),
      author: req.body.author,
    });

    res.json({});
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
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    const targetGame = await game.getGame(req.params.id);

    if (!targetGame)
      return utils.sendError(res, {
        code: 404,
        description: "Game not found",
      });

    await game.removeGame(targetGame.id as string);

    res.json({});
  })
);

route<types.api.GameById_Data>(
  "Get",
  "/game/:id/data.json",
  utils.authentication(
    async (context) =>
      (await game.getGame(context.params.id))?.publisher_id ===
      context.account.id,
    true
  ),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    const targetGame = await game.getGame(req.params.id);

    if (!targetGame)
      return utils.sendError(res, {
        code: 404,
        description: "Game not found",
      });

    const sessions = await event.getAllGameSessions(targetGame.id);

    const returned: types.api.GameById_Data["Methods"]["Get"]["Response"] =
      utils.jsonRecursivelySnakeToCamelCase({
        ...targetGame,
        sessions: await Promise.all(
          sessions.map(async (session) => {
            delete session.game_id;
            return {
              ...session,
              events: (await events.getAllSessionEvents(session.id)).map(
                (e) => {
                  delete e.session_id;
                  return e;
                }
              ),
            };
          })
        ),
      });

    res.type("application/octet-stream");
    res.json(utils.removeNullFields(returned));
  })
);

route<types.api.GameById_Session>(
  "Get",
  "/game/:id/session",
  utils.authentication(
    async (context) =>
      (context.params.id &&
        (await game.getGame(context.params.id))?.publisher_id ===
          context.account.id) ||
      context.account.is_admin
  ),
  utils.asyncHandler(async (req, res) => {
    const total = await events.getGameSessionCount(req.params.id);

    const { offset, pageCount, page, perPage, sortBy } =
      utils.extractPagingParams(req, total);

    const items = await event
      .sessions()
      .where("game_id", req.params.id)
      .offset(offset)
      .limit(perPage)
      .orderBy(sortBy?.column ?? "updated_timestamp", sortBy?.order ?? "desc");

    utils.setPagingHeaders(req, res, {
      pageCount,
      perPage,
      total,
      page,
    });

    res.json(utils.jsonRecursivelySnakeToCamelCase(items));
  })
);

route<types.api.GameById_Key>(
  "Get",
  `/game/:id/key`,
  utils.asyncHandler(async (req, res) => {
    res.json(
      utils.jsonRecursivelySnakeToCamelCase(
        await game.getGameKeys(req.params.id)
      )
    );
  })
);
