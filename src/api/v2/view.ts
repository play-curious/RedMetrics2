import expressAsyncHandler from "express-async-handler";
import * as app from "../../app";

app.view.get(
  "/register",
  expressAsyncHandler(async (req, res) => {
    res.render("pages/register", { locale: "en" });
  })
);
