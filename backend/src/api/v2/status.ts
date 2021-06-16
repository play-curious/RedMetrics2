import * as app from "../../app";
import * as utils from "../../utils";
import expressAsyncHandler from "express-async-handler";

const project = require("../../../package.json");

app.v2.get(
  "/status",
  expressAsyncHandler(async (req, res) => {
    res.json({
      deployedAt: new Date(app.server.locals.site.deployedAt),
      uptime: Date.now() - app.server.locals.site.deployedAt,
      uptimeText: app.server.locals.site.deployedSince(),
      version: project.version,
      license: project.license,
      locale: utils.extractLocale(req),
    });
  })
);
