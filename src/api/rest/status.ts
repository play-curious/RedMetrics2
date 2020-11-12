import * as app from "../../app";

app.server.get("/status", (req, res) => {
  // todo: Returns the Status of the server.
  res.status(404).json({
    description: "Returns the Status of the server.",
    error: "not implemented, ",
  });
});
