import expressAsyncHandler from "express-async-handler";
import * as app from "../../app";

app.v2.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    // todo
  })
);
