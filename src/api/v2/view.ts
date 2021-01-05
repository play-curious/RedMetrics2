import expressAsyncHandler from "express-async-handler";
import * as app from "../../app";
import * as utils from "../../utils";

app.view
  .get(
    "/register",
    expressAsyncHandler(async (req, res) => {
      res.render("pages/register", { locale: utils.extractLocale(req) });
    })
  )
  .get(
    "/login",
    expressAsyncHandler(async (req, res) => {
      res.render("pages/login", { locale: utils.extractLocale(req) });
    })
  )
  .get(
    "/home",
    utils.checkConnexionCookie,
    expressAsyncHandler(async (req, res) => {
      res.render("pages/home", { locale: utils.extractLocale(req) });
    })
  )
  .get(
    "/admin",
    utils.checkConnexionCookie,
    utils.checkAdmin,
    expressAsyncHandler(async (req, res) => {
      res.render("pages/admin", { locale: utils.extractLocale(req) });
    })
  );
