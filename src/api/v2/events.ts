import expressAsyncHandler from "express-async-handler";
import * as app from "../../app";
import * as utils from "../../utils";
import * as events from "../../controllers/events";
import * as game from "../../controllers/game";

app.v2.post(
  "/session",
  utils.needToken,
  expressAsyncHandler(async (req, res) => {
    // todo:
    //  Creates a new session.
    //  A SessionMeta object should be sent in the body.
    //  The Location response header will contain the URL for the new session.
    //  Only accessible to dev and admin.

    if (!utils.isUserReq(req)) return;

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

    events.postSession({
      external_id,
      platform,
      screen_size,
      software,
      custom_data,
      game_version_id,
    });

    res.json({
      success: "Success",
    });
  })
);

app.v2
  .route("/session/:id")
  .get((req, res) => {
    // todo: Retrieves the SessionMeta for the identified session
    res.status(404).json({
      error: "not implemented, ",
    });
  })
  .put((req, res) => {
    // todo: Updates the SessionMeta. Only accessible to dev and admin.
    res.status(404).json({
      error: "not implemented, ",
    });
  });

app.v2
  .route("/event")
  .get((req, res) => {
    // todo:
    //  Lists Event objects (see section on Paging below).
    //  Admin and dev accounts can see the game events they have access to.
    //  Otherwise restricted to one session id.
    //  Can be filtered by the following query parameters:
    //  - game - Id
    //  - version - String (can be included multiple times to form a list).
    //  - session - Id (can be included multiple times to form a list)
    //  - type - EventType (can be included multiple times to form a list)
    //  - section - Section (level.section.* finds level.section.subsection)
    //  - after - Date
    //  - before - Date
    //  - afterUserTime - Date
    //  - beforeUserTime - Date
    res.status(404).json({
      error: "not implemented, ",
    });
  })
  .post((req, res) => {
    // todo:
    //  Adds more event information sent with the Event object, or array or Event objects.
    //  The gameId query parameters is required.
    //  If no session is given, a new session will be created and returned.
    //  Since the progress object cannot be addressed by itself, no Location header will be returned.
    res.status(404).json({
      error: "not implemented, ",
    });
  });
