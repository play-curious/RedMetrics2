import expressAsyncHandler from "express-async-handler";
import * as types from "rm2-typings";
import * as uuid from "uuid";
import * as app from "../../app";
import * as utils from "../../utils";
import * as events from "../../controllers/events";
import * as game from "../../controllers/game";

app.v2
  .route("/session")
  .all(utils.checkGame())
  .post(
    expressAsyncHandler(async (req, res) => {
      if (!utils.hasGame(req)) return;
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

      const session: types.api.Session["Post"]["Body"] = {
        external_id,
        platform,
        screen_size,
        software,
        version,
        custom_data,
      };

      const id = await events.postGameSession({
        ...session,
        game_id: req.game.id,
        closed: false,
        created_timestamp: String(Date.now()),
        updated_timestamp: String(Date.now()),
      });

      res.json({ id, ...session });
    })
  );

app.v2
  .route("/session/:id")
  .all(
    utils.checkGame(),
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
    })
  )
  .get(
    expressAsyncHandler(async (req, res) => {
      // Retrieves the SessionMeta for the identified session
      res.json(await events.getSession(req.params.id));
    })
  )
  .put(
    utils.checkGame(),
    expressAsyncHandler(async (req, res) => {
      // Updates the SessionMeta. Only accessible to dev and admin.

      const values: Partial<types.api.SessionById["Put"]["Body"]> = {
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

app.v2.get(
  "/session/:id/data",
  utils.checkUser(async (context) => {
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

app.v2.get(
  "/session/:id/events",
  utils.checkGame((context) =>
    game.gameHasSession(context.game.id, context.params.id)
  ),
  expressAsyncHandler(async (req, res) => {
    res.json(await events.getEvents(req.params.id));
  })
);

app.v2.get(
  "/sessions/:game_id",
  utils.checkUser(
    async (context) =>
      (await game.getGame(context.params.game_id))?.publisher_id ===
        context.account.id || context.account.is_admin
  ),
  expressAsyncHandler(async (req, res) => {
    res.json(await events.getGameSessions(req.params.game_id));
  })
);

app.v2
  .route("/event")
  .get(
    utils.checkGame("own"),
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

      if (req.game.id !== req.body.game_id)
        return utils.sendError(res, {
          code: 400,
          description:
            "You request events of a game that's not linked with your API key!",
        });

      let query = events.events();

      if (req.body.game_id)
        query = query
          .leftJoin("game", "game.id", "game_id")
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
  )
  .post(
    utils.checkGame(),
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

      const event: types.api.Event["Post"]["Body"] = {
        session_id: req.body.session_id,
        coordinates: JSON.stringify(req.body.coordinates ?? {}),
        custom_data: JSON.stringify(req.body.custom_data ?? {}),
        section: req.body.section,
        server_time: new Date().toISOString(),
        type: req.body.type,
        user_time: req.body.user_time,
      };

      const id = await events.postEvent(event);

      res.json({ id, ...event });
    })
  );
