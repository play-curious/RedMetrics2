import expressAsyncHandler from "express-async-handler";
import * as types from "rm2-typings";
import * as uuid from "uuid";
import * as app from "../../app";
import * as utils from "../../utils";
import * as events from "../../controllers/events";
import * as game from "../../controllers/game";

const route = types.utils.buildRouteMaker(app.v2);

route<types.api.Session>(
  "Post",
  "/session",
  utils.authentication(),
  expressAsyncHandler(async (req, res) => {
    if (!utils.hasGame(req))
      return utils.sendError(res, {
        code: 401,
        description: "You must be auth by API key.",
      });
    //  Creates a new session.
    //  A SessionMeta object should be sent in the body.
    //  The Location response header will contain the URL for the new session.
    //  Only accessible to dev and admin.

    const external_id = req.body.external_id,
      platform = req.body.platform,
      screen_size = req.body.screen_size,
      software = req.body.software,
      version = req.body.version,
      custom_data = JSON.stringify(req.body.custom_data ?? {});

    const sessionData: types.api.Session["Methods"]["Post"]["Body"] = {
      external_id,
      platform,
      screen_size,
      software,
      version,
      custom_data,
    };

    const session: Omit<types.tables.Session, "id"> = {
      ...sessionData,
      game_id: req.game.id,
      closed: false,
      created_timestamp: String(Date.now()),
      updated_timestamp: String(Date.now()),
    };

    const id = await events.postGameSession(session);

    res.json({ id, ...session });
  })
);

route<types.api.SessionById>(
  "Get",
  "/session/:id",
  utils.authentication(),
  expressAsyncHandler(async (req, res, next) => {
    if (!utils.hasGame(req)) return;

    const session = await events.getSession(req.params.id ?? uuid.v4());

    if (!session)
      return utils.sendError(res, {
        code: 404,
        description: "Session not found",
      });

    if (!(await game.gameHasSession(req.game.id, session)))
      return utils.sendError(res, {
        code: 401,
        description: `This API key deny access to this session.`,
      });

    next();
  }),
  expressAsyncHandler(async (req, res) => {
    // Retrieves the SessionMeta for the identified session
    res.json(await events.getSession(req.params.id));
  })
);

route<types.api.SessionById>(
  "Put",
  "/session/:id",
  utils.authentication(),
  expressAsyncHandler(async (req, res, next) => {
    if (!utils.hasGame(req)) return;

    const session = await events.getSession(req.params.id ?? uuid.v4());

    if (!session)
      return utils.sendError(res, {
        code: 404,
        description: "Session not found",
      });

    if (!(await game.gameHasSession(req.game.id, session)))
      return utils.sendError(res, {
        code: 401,
        description: `This API key deny access to this session.`,
      });

    next();
  }),
  expressAsyncHandler(async (req, res) => {
    // Updates the SessionMeta. Only accessible to dev and admin.

    const values: Partial<types.api.SessionById["Methods"]["Put"]["Body"]> = {
      custom_data: JSON.stringify(req.body.custom_data ?? {}),
      software: req.body.software,
      screen_size: req.body.screen_size,
      platform: req.body.platform,
      external_id: req.body.external_id,
      closed: req.body.closed,
    };

    await events.updateGameSession(req.params.id, values);

    res.sendStatus(200);
  })
);

route<types.api.SessionById_Data>(
  "Get",
  "/session/:id/data",
  utils.authentication(async (context) => {
    const session = await events.getSession(context.params.id);
    if (!session) return false;

    const sessionGame = await game.getGame(session.game_id);
    if (!sessionGame) return false;

    return sessionGame.publisher_id === context.account.id;
  }),
  expressAsyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    const session = (await events.getSession(
      req.params.id
    )) as types.tables.Session;

    const fullSession: types.full.FullSession = {
      ...session,
      events: await events.getEvents(session.id),
    };

    res.json(fullSession);
  })
);

route<types.api.SessionById_Events>(
  "Get",
  "/session/:id/events",
  utils.authentication(
    (context) =>
      !!context.game &&
      game.gameHasSession(context.game.id as string, context.params.id)
  ),
  expressAsyncHandler(async (req, res) => {
    res.json(await events.getEvents(req.params.id));
  })
);

route<types.api.Event>(
  "Get",
  "/event",
  utils.authentication(
    (context) =>
      utils.hasGame(context) && context.game.publisher_id === context.account.id
  ),
  expressAsyncHandler(async (req, res) => {
    //  Lists Event objects (see section on Paging below).
    //  Admin and dev accounts can see the game events they have access to.
    //  Otherwise restricted to one session id.
    //  Can be filtered by the following query parameters:
    //  - game - Id
    //  - version - String (can be included multiple times to form a list)
    //  - session - Id (can be included multiple times to form a list)
    //  - type - EventType (can be included multiple times to form a list)
    //  - section - Section (level.section.* finds level.section.subsection)
    //  - after - Date
    //  - before - Date
    //  - afterUserTime - Date
    //  - beforeUserTime - Date

    if (!utils.hasGame(req) || !utils.hasAccount(req)) return;

    if (req.game.id !== req.body.game_id && !req.account.is_admin)
      return utils.sendError(res, {
        code: 400,
        description:
          "Requesting events from unauthorized game.\n" +
          `targeted game id: ${req.body.game_id}\n` +
          `authorized game id: ${req.game.id}`,
      });

    let query = events.events();

    if (req.body.game_id)
      query = query
        .leftJoin("session", "session.id", "session_id")
        .leftJoin("game", "game.id", "session.game_id")
        .where("game.id", req.body.game_id);

    if (req.body.session_id)
      query = query.andWhere("session_id", req.body.session_id);

    if (req.body.type) query = query.andWhere("type", req.body.type);
    if (req.body.section) query = query.andWhere("section", req.body.section);

    if (req.body.after)
      query = query.andWhere("server_time", ">", req.body.after);
    if (req.body.before)
      query = query.andWhere("server_time", "<", req.body.before);

    if (req.body.offset) query = query.offset(+req.body.offset);
    if (req.body.count) query = query.limit(+req.body.count);

    res.json(await query);
  })
);

route<types.api.Event>(
  "Post",
  "/event",
  utils.authentication(),
  expressAsyncHandler(async (req, res) => {
    //  Adds more event information sent with the Event object, or array or Event objects.
    //  The gameVersionId query parameters is required.
    //  If no session is given, a new session will be created and returned.
    //  Since the progress object cannot be addressed by itself, no Location header will be returned.

    if (!req.body.session_id)
      return utils.sendError(res, {
        code: 401,
        description: "Missing game session id",
      });

    await events.postEvent(
      Array.isArray(req.body)
        ? req.body.map((body) => ({
            session_id: body.session_id,
            coordinates: JSON.stringify(body.coordinates ?? {}),
            custom_data: JSON.stringify(body.custom_data ?? {}),
            section: body.section,
            server_time: new Date().toISOString(),
            type: body.type,
            user_time: body.user_time,
          }))
        : {
            session_id: req.body.session_id,
            coordinates: JSON.stringify(req.body.coordinates ?? {}),
            custom_data: JSON.stringify(req.body.custom_data ?? {}),
            section: req.body.section,
            server_time: new Date().toISOString(),
            type: req.body.type,
            user_time: req.body.user_time,
          }
    );

    res.sendStatus(200);
  })
);
