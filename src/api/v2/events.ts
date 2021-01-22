import expressAsyncHandler from "express-async-handler";
import * as app from "../../app";
import * as types from "../../types";
import * as utils from "../../utils";
import * as events from "../../controllers/events";
import * as game from "../../controllers/game";

app.v2.post(
  "/session",
  utils.needRole("dev"),
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
      custom_data = req.body.custom_data,
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
  .route("/session/:id")
  .get(
    utils.needRole("user"),
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
    utils.needRole("dev"),
    expressAsyncHandler(async (req, res) => {
      // Updates the SessionMeta. Only accessible to dev and admin.

      const values: Partial<types.GameSession> = {
        custom_data: req.body.custom_data,
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

app.v2
  .route("/event")
  .get(
    utils.needRole("user"),
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
      if (req.body.game_id) {
        query = query
          .leftJoin("game_version", "game_version.id", "event.game_version_id")
          .leftJoin("game", "game.id", "game_version.game_id")
          .where("game.id", req.body.game_id);
      }
      if (req.body.version)
        query = query.andWhere("game_version.name", req.body.version);
      if (req.body.session_id)
        query = query.andWhere("session_id", req.body.session_id);
      if (req.body.type) query = query.andWhere("type", req.body.type);
      if (req.body.section) query = query.andWhere("section", req.body.section);
      if (req.body.after)
        query = query.andWhere("server_time", ">", req.body.after);
      if (req.body.before)
        query = query.andWhere("server_time", "<", req.body.before);

      res.json(await query);
    })
  )
  .post(
    utils.needRole("dev"),
    expressAsyncHandler(async (req, res) => {
      //  Adds more event information sent with the Event object, or array or Event objects.
      //  The gameVersionId query parameters is required.
      //  If no session is given, a new session will be created and returned.
      //  Since the progress object cannot be addressed by itself, no Location header will be returned.

      if (!req.body.game_version_id)
        return utils.sendError(res, {
          code: 300,
          description: "Missing game version id",
        });

      let session_id = req.body.session_id;
      if (!req.body.session_id || !(await events.getGameSession(session_id))) {
        session_id = await events.postGameSession({
          game_version_id: req.body.game_version_id,
        });
      }

      const event: types.RMEvent = {
        session_id,
        coordinates: req.body.coordinates,
        custom_data: req.body.custom_data,
        section: req.body.section,
        server_time: new Date().toTimeString(),
        type: req.body.type,
        user_time: req.body.user_time,
      };

      res.json(event);
    })
  );
