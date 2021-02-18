import expressAsyncHandler from "express-async-handler";
import * as app from "../../app";
import * as types from "../../types";
import * as utils from "../../utils";
import * as events from "../../controllers/events";
import * as game from "../../controllers/game";

app.v2.post(
  "/game-session",
  utils.checkUser((context) => (
    context.session.permissions.includes(types.Permission.EDIT_GAMES) ||
    context.session.permissions.includes(types.Permission.MANAGE_GAMES)
  )),
  expressAsyncHandler(async (req, res) => {
    //  Creates a new session.
    //  A SessionMeta object should be sent in the body.
    //  The Location response header will contain the URL for the new session.
    //  Only accessible to dev and admin.

    if (!utils.isLogin(req)) return;

    const external_id = req.body.external_id,
      platform = req.body.platform,
      screen_size = req.body.screen_size,
      software = req.body.software,
      custom_data = JSON.stringify(req.body.custom_data ?? {}),
      game_version_id = req.body.game_version_id;

    if (!game_version_id || !(await game.getGameVersion(game_version_id))) {
      return utils.sendError(res, {
        code: 401,
        description: "Invalid game version uuid",
      });
    }

    const id = await events.postGameSession({
      external_id,
      platform,
      screen_size,
      software,
      custom_data,
      game_version_id,
    });

    res.json({
      id,
      success: "Success",
    });
  })
);

app.v2
  .route("/game-session/:id")
  .get(
    utils.checkUser(async (context) => (
      context.session.permissions.includes(types.Permission.SHOW_GAMES) ||
      context.session.permissions.includes(types.Permission.MANAGE_GAMES) ||
      (await game.getGame(context.params.id))?.publisher_id === context.account.id
    )),
    expressAsyncHandler(async (req, res) => {
      // Retrieves the SessionMeta for the identified session

      const session = await events.getGameSession(req.params.id);

      if (!session)
        return utils.sendError(res, {
          code: 404,
          description: "Unknown session uuid",
        });

      res.json(session);
    })
  )
  .put(
    utils.checkUser(async (context) => (
      context.session.permissions.includes(types.Permission.EDIT_GAMES) ||
      context.session.permissions.includes(types.Permission.MANAGE_GAMES) ||
      (await game.getGame(context.params.id))?.publisher_id === context.account.id
    )),
    expressAsyncHandler(async (req, res) => {
      // Updates the SessionMeta. Only accessible to dev and admin.

      const values: Partial<types.GameSession> = {
        custom_data: JSON.stringify(req.body.custom_data ?? {}),
        software: req.body.software,
        screen_size: req.body.screen_size,
        platform: req.body.platform,
        external_id: req.body.external_id,
      };

      const id = req.params.id;

      const updated = await events.getGameSession(id);

      if (!updated)
        return utils.sendError(res, {
          code: 404,
          description: "Unknown session uuid",
        });

      await events.updateGameSession(id, values);

      res.json({
        id,
        success: "Success",
      });
    })
  );

app.v2.get(
  "/event/count/:id",
  utils.checkUser(async (context) => (
    context.session.permissions.includes(types.Permission.SHOW_GAMES) ||
    context.session.permissions.includes(types.Permission.MANAGE_GAMES) ||
    (await game.getGame(context.params.id))?.publisher_id === context.account.id
  )),
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;

    if (!id)
      return utils.sendError(res, {
        description: "Missing 'id' param",
        code: 400,
      });

    const targetGame = await game.getGame(id);

    if (!targetGame)
      return utils.sendError(res, {
        code: 404,
        description: "Game not found",
      });

    res.json(await events.getEventCount(id));
  })
);

app.v2
  .route("/event")
  .get(
    utils.checkUser(async (context) => (
      context.session.permissions.includes(types.Permission.SHOW_GAMES) ||
      context.session.permissions.includes(types.Permission.MANAGE_GAMES)
    )),
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

      let query = events.events();
      if (req.params.game_id) {
        query = query
          .leftJoin("game_version", "game_version.id", "event.game_version_id")
          .leftJoin("game", "game.id", "game_version.game_id")
          .where("game.id", req.params.game_id);
      }
      if (req.params.version)
        query = query.andWhere("game_version.name", req.params.version);
      if (req.params.session_id)
        query = query.andWhere("session_id", req.params.session_id);
      if (req.params.type) query = query.andWhere("type", req.params.type);
      if (req.params.section)
        query = query.andWhere("section", req.params.section);
      if (req.params.after)
        query = query.andWhere("server_time", ">", req.params.after);
      if (req.params.before)
        query = query.andWhere("server_time", "<", req.params.before);
      if (req.params.offset) query = query.offset(+req.params.offset);
      if (req.params.count) query = query.limit(+req.params.count);

      res.json(await query);
    })
  )
  .post(
    utils.checkUser(async (context) => (
      context.session.permissions.includes(types.Permission.EDIT_GAMES) ||
      context.session.permissions.includes(types.Permission.MANAGE_GAMES)
    )),
    expressAsyncHandler(async (req, res) => {
      //  Adds more event information sent with the Event object, or array or Event objects.
      //  The gameVersionId query parameters is required.
      //  If no session is given, a new session will be created and returned.
      //  Since the progress object cannot be addressed by itself, no Location header will be returned.

      if (!req.body.game_session_id)
        return utils.sendError(res, {
          code: 300,
          description: "Missing game session id",
        });

      const event: types.RMEvent = {
        game_session_id: req.body.game_session_id,
        coordinates: JSON.stringify(req.body.coordinates ?? {}),
        custom_data: JSON.stringify(req.body.custom_data ?? {}),
        section: req.body.section,
        server_time: new Date().toISOString(),
        type: req.body.type,
        user_time: req.body.user_time,
      };

      await events.postEvent(event);

      res.json(event);
    })
  );
