import express from "express";
import * as app from "../app";
import * as utils from "../utils";

app.server.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    if (req.query.view) {
      res.status(500).render("pages/error", {
        locale: utils.extractLocale(req),
        error: err.message,
        code: 500,
      });
    } else {
      res.status(500).json({
        error: err.message,
        code: 500,
      });
    }
  }
);
