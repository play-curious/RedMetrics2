import * as app from "../../app";

app.v2.get(["/game", "/games"], (req, res) => {
  // todo: Lists the games using the service as GameMeta objects (see section on Paging below)
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.post("/game", (req, res) => {
  // todo:
  //  Creates a new game.
  //  A GameMeta object should be sent in the body.
  //  A default version of the game will be created.
  //  The Location response header will contain the URL for the new game.
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.get("/game/:id", (req, res) => {
  // todo: Retrieves information about the game with that Id as a GameMeta object
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.put("/game/:id", (req, res) => {
  // todo: Updates game information with the provided GameMeta.
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.get("/game/:id/version", (req, res) => {
  // todo: Lists versions of the the game with that Id as GameVersionMeta objects (see section on Paging below)
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.post("/game/:id/version", (req, res) => {
  // todo:
  //  Creates a new version of the game.
  //  A GameVersionMeta object should be sent in the body.
  //  The Location response header will contain the URL for the new game.
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.get("/game/:id/version/:versionId", (req, res) => {
  // todo: Retrieves information about the game version as a GameVersionMeta object
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.put("/game/:id/version/:versionId", (req, res) => {
  // todo: Updates game information with the provided GameVersionMeta.
  res.status(404).json({
    error: "not implemented, ",
  });
});
