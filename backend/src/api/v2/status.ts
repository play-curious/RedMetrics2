import * as app from "../../app";

import express from "express";

import * as types from "rm2-typings";

const project = require("../../../package.json");

const startedAt = new Date();

const statusHandler: express.RequestHandler = async (req, res) => {
  res.json({
    build: "",
    apiVersion: project.version,
    startedAt: startedAt.toDateString(),
  } as types.api.Status);
};

// Versioned => /v2/status
app.v2.get("/status", statusHandler);
app.v2.get("/", statusHandler);

// Shortcuts => /status
app.server.get("/status", statusHandler);
app.server.get("/", statusHandler);
