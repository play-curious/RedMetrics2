import * as app from "../../app";
import * as utils from "../../utils";
import expressAsyncHandler from "express-async-handler";

const project = require("../../../package.json");

const deploymentDate = new Date();

app.v2.get(
  "/status",
  expressAsyncHandler(async (req, res) => {
    res.json({
      deployedAt: deploymentDate,
      uptime: Date.now() - deploymentDate.getTime(),
      version: project.version,
      license: project.license,
      locale: utils.extractLocale(req),
    });
  })
);
