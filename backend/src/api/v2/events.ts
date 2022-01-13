import * as types from "rm2-typings";
import * as uuid from "uuid";
import * as app from "../../app";
import * as utils from "../../utils";
import * as game from "../../controllers/game";
import * as events from "../../controllers/events";

const route = types.utils.buildRouteMaker(app.v2);

route<types.api.Session>(
  "Post",
  "/session",
  utils.authentication(),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasGame(req))
      return utils.sendError(res, {
        code: 401,
        description: "You must be auth by API key.",
      });
    //  Creates a new session.
    //  A SessionMeta object should be sent in the body.
    //  The Location response header will contain the URL for the new session.
    //  Only accessible to dev and admin.

    const externalId = req.body.externalId,
      platform = req.body.platform,
      screenSize = req.body.screenSize,
      software = req.body.software,
      version = req.body.version,
      customData = JSON.stringify(req.body.customData ?? {});

    const sessionData: types.api.Session["Methods"]["Post"]["Body"] = {
      externalId,
      platform,
      screenSize,
      software,
      version,
      customData,
    };

    const session: Omit<types.tables.Session, "id"> = {
      custom_data: sessionData.customData,
      external_id: sessionData.externalId,
      platform: sessionData.platform,
      screen_size: sessionData.screenSize,
      software: sessionData.software,
      version: sessionData.version,
      game_id: req.game.id,
      closed: false,
      created_timestamp: new Date(),
      updated_timestamp: new Date(),
    };

    const id = await events.postSession(session);

    res.json({ id, ...utils.jsonRecursivelySnakeToCamelCase(session) });
  })
);

const gameSessionCheck = utils.asyncHandler(async (req, res, next) => {
  if (!utils.hasGame(req))
    return utils.sendError(res, {
      code: 401,
      description:
        "You must use this route via an API key instead of a cookie.",
    });

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
});

route<types.api.SessionById>(
  "Get",
  "/session/:id",
  utils.asyncHandler(async (req, res) => {
    // Retrieves the SessionMeta for the identified session
    res.json(
      utils.jsonRecursivelySnakeToCamelCase(
        await events.getSession(req.params.id)
      )
    );
  })
);

route<types.api.SessionById>(
  "Put",
  "/session/:id",
  utils.authentication(),
  gameSessionCheck,
  utils.asyncHandler(async (req, res) => {
    // Updates the SessionMeta. Only accessible to dev and admin.

    const values: Partial<types.api.SessionById["Methods"]["Put"]["Body"]> = {
      customData: JSON.stringify(req.body.customData ?? {}),
      software: req.body.software,
      screenSize: req.body.screenSize,
      platform: req.body.platform,
      externalId: req.body.externalId,
      closed: req.body.closed,
    };

    await events.updateGameSession(req.params.id, {
      closed: values.closed,
      custom_data: values.customData,
      external_id: values.externalId,
      platform: values.platform,
      screen_size: values.screenSize,
      software: values.software,
      updated_timestamp: new Date(),
    });

    res.json({});
  })
);

route<types.api.SessionById_Data>(
  "Get",
  "/session/:id/data.json",
  utils.authentication(async (context) => {
    const session = await events.getSession(context.params.id);
    if (!session) return false;

    const sessionGame = await game.getGame(session.game_id);
    if (!sessionGame) return false;

    return sessionGame.publisher_id === context.account.id;
  }),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    const session = (await events.getSession(
      req.params.id
    )) as types.tables.Session;

    const fullSession: types.full.FullSession =
      utils.jsonRecursivelySnakeToCamelCase({
        ...session,
        events: (await events.getAllSessionEvents(session.id)).map((e) => {
          delete e.session_id;
          return e;
        }),
      });

    res.type("application/octet-stream");
    res.json(utils.removeNullFields(fullSession));
  })
);

route<types.api.SessionById_Event>(
  "Get",
  "/session/:id/event",
  utils.authentication(
    (context) =>
      !!context.game &&
      game.gameHasSession(context.game.id as string, context.params.id)
  ),
  utils.asyncHandler(async (req, res) => {
    const total = await events.getSessionEventCount(req.params.id);

    const { offset, pageCount, perPage, page, sortBy } =
      utils.extractPagingParams(req, total);

    const items = await events.getSessionEvents(
      req.params.id,
      offset,
      perPage,
      sortBy as any
    );

    utils.setPagingHeaders(req, res, {
      perPage,
      total,
      pageCount,
      page,
    });

    res.json(utils.jsonRecursivelySnakeToCamelCase(items));
  })
);

route<types.api.Event>(
  "Get",
  "/event",
  utils.authentication(
    (context) =>
      utils.hasGame(context) && context.game.publisher_id === context.account.id
  ),
  utils.asyncHandler(async (req, res) => {
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
      query = query.andWhere("server_timestamp", ">", req.body.after);
    if (req.body.before)
      query = query.andWhere("server_timestamp", "<", req.body.before);

    if (req.body.offset) query = query.offset(+req.body.offset);
    if (req.body.count) query = query.limit(+req.body.count);

    res.json(utils.jsonRecursivelySnakeToCamelCase(await query));
  })
);

route<types.api.Event>(
  "Post",
  "/event",
  utils.authentication(),
  utils.asyncHandler(async (req, res) => {
    //  Adds more event information sent with the Event object, or array or Event objects.
    //  The gameVersionId query parameters is required.
    //  If no session is given, a new session will be created and returned.
    //  Since the progress object cannot be addressed by itself, no Location header will be returned.

    const body: types.api.Event["Methods"]["Post"]["Body"] = req.body;
    const postEvents = Array.isArray(body) ? body : [body];

    if (postEvents.length === 0)
      return utils.sendError(res, {
        code: 401,
        description: "You tried to push an empty list of events.",
      });

    async function newSession(): Promise<types.tables.Session> {
      if (!utils.hasGame(req))
        throw new Error("used event route without API key");

      const s: types.utils.Insert<types.tables.Session> = {
        game_id: req.game.id,
        created_timestamp: new Date(),
        updated_timestamp: new Date(),
        closed: false,
      };

      const id = await events.postSession(s);

      return { ...s, id };
    }

    let session: types.tables.Session;
    if (postEvents[0].sessionId) {
      const _session = await events.getSession(postEvents[0].sessionId);
      if (!_session) session = await newSession();
      else session = _session;
    } else session = await newSession();

    await events.postEvent(
      postEvents.map((postEvent) => {
        return {
          session_id: session.id,
          coordinates: JSON.stringify(postEvent.coordinates ?? {}),
          custom_data: JSON.stringify(postEvent.customData ?? {}),
          section: postEvent.section,
          server_timestamp: new Date(),
          type: postEvent.type,
          user_timestamp: postEvent.userTimestamp as string | undefined,
        };
      })
    );

    res.json(session.id);
  })
);

route<types.api.EventById>(
  "Get",
  "/event/:id" as any,
  utils.authentication(),
  utils.asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    res.json(utils.jsonRecursivelySnakeToCamelCase(await events.getEvent(id)));
  })
);
