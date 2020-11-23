import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import * as app from "../../app";
import * as types from "../../types";
import * as utils from "../../utils";
import * as auth from "../../controllers/auth";

app.v2.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    // Login to the system with valid username and password

    const email = req.body.email,
      password = req.body.password;

    if (!email || !password)
      return utils.sendError(res, {
        description: "Missing email or passord",
        code: 401,
      });

    if (!types.isValidEmail(email)) {
      return utils.sendError(res, { code: 401, description: "Invalid email" });
    }

    const account = await auth.getAccountByEmail(email);

    if (!account) {
      return utils.sendError(res, { code: 300, description: "Unknown email" });
    }

    if (!(await bcrypt.compare(password, account.password))) {
      return utils.sendError(res, {
        code: 401,
        description: "Incorrect password",
      });
    }

    const token = await utils.generateAccessToken({ email, password });

    res.json({ token });
  })
);

app.v2.post("/account", (req, res) => {
  // todo:
  //  Registers a new account.
  //  An AccountMeta object should be sent in the body.
  //  The Location response header will contain the URL for the new account.
  res.status(404).json({
    error: "not implemented, ",
  });
});

/** “me” can be used instead of id to reference own account */
app.v2
  .route("/account/:id")
  .get((req, res) => {
    // todo:
    //  Retrieves the AccountMeta for the given account.
    //  Only admins can access accounts other than their own
    res.status(404).json({
      error: "not implemented, ",
    });
  })
  .put((req, res) => {
    // todo:
    //  Update the given account.
    //  An AccountMeta object should be sent in the body.
    //  Only admins can access accounts other than their own
    res.status(404).json({
      error: "not implemented, ",
    });
  });

app.v2.post("/account/:id/reset-password", (req, res) => {
  // todo: Request password reset. Requires confirmation by email
  res.status(404).json({
    error: "not implemented, ",
  });
});

app.v2.post("/account/:id/reset-password/confirm", (req, res) => {
  // todo : Confirms password reset. Password reset token sent as URL param. Returns new password
  res.status(404).json({
    error: "not implemented, ",
  });
});
