import * as app from "../../app";
import expressAsyncHandler from "express-async-handler";

const project = require("../../../package.json");

const startedAt = new Date();

const statusHandler = expressAsyncHandler(async (req, res) => {
  res.json({
    apiVersion: project.version,
    startedAt,
    uptime: Date.now() - startedAt.getTime(),
  });
});

// Full (versioned) route
app.v2.get("/status", statusHandler);

// Shortcuts
app.v2.get("/", statusHandler);
app.server.get("/", statusHandler);
app.server.get("/status", statusHandler);
