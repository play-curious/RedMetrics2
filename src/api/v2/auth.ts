import * as app from "../../app";

app.v2.post("/login", (req, res) => {
  // todo: Login to the system with valid username and password
  res.status(404).json({
    error: "not implemented, ",
  });
});

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
app.v2.get("/account/:id", (req, res) => {
  // todo:
  //  Retrieves the AccountMeta for the given account.
  //  Only admins can access accounts other than their own
  res.status(404).json({
    error: "not implemented, ",
  });
});

/** “me” can be used instead of id to reference own account */
app.v2.put("/account/:id", (req, res) => {
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
