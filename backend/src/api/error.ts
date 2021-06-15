import express from "express";
import * as app from "../app";

app.server.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: err.message,
      code: 500,
    });
  }
);
