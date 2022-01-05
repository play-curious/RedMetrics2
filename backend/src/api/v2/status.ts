import * as app from "../../app";

import express from "express";

import * as types from "rm2-typings";

const project = require("../../../package.json");

const startedAt = new Date();

const statusHandler: express.RequestHandler = async (req, res) => {
  res.json({
    build: "",
    api_version: project.version,
    started_at: startedAt.toDateString(),
  } as types.api.Status);
};

// Full (versioned) route
app.v2.get("/status", statusHandler);

// Shortcuts
app.v2.get("/", statusHandler);
app.server.get("/", statusHandler);
app.server.get("/status", statusHandler);
