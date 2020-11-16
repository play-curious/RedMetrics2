import * as app from "../../app";

app.v2.post("/session", (req, res) => {
  // todo:
  //  Creates a new session.
  //  A SessionMeta object should be sent in the body.
  //  The Location response header will contain the URL for the new session.
  //  Only accessible to dev and admin.
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.get("/session/:id", (req, res) => {
  // todo: Retrieves the SessionMeta for the identified session
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.put("/session/:id", (req, res) => {
  // todo: Updates the SessionMeta. Only accessible to dev and admin.
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.get("/event", (req, res) => {
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
});

app.v2.post("/event", (req, res) => {
  // todo:
  //  Adds more event information sent with the Event object, or array or Event objects.
  //  The gameId query parameters is required.
  //  If no session is given, a new session will be created and returned.
  //  Since the progress object cannot be addressed by itself, no Location header will be returned.
  res.status(404).json({
    error: "not implemented, ",
  });
});
