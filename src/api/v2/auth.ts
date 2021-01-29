import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import * as uuid from "uuid";
import * as app from "../../app";
import * as types from "../../types";
import * as utils from "../../utils";
import * as auth from "../../controllers/auth";

app.v2.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    // Login to the system with valid username and password

    const email = req.body?.email,
      password = req.body?.password;

    if (!email || !password)
      return utils.sendError(res, {
        description: "Missing email or password",
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

    const apiKey = uuid.v4();

    await auth.postSession({
      api_key: apiKey,
      account_id: account.id as string,
      start_at: new Date().toISOString(),
      type: "connexion",
    });

    res.json({ apiKey });
  })
);

app.v2.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    //  Registers a new account.
    //  An AccountMeta object should be sent in the body.
    //  The Location response header will contain the URL for the new account.

    const email = req.body?.email,
      password = req.body?.password,
      role = req.body?.role === "dev" ? "dev" : "user";

    if (!email || !password)
      return utils.sendError(res, {
        code: 401,
        description: "Missing email or password",
      });

    if (!types.isValidEmail(email)) {
      return utils.sendError(res, { code: 401, description: "Invalid email" });
    }

    if (await auth.emailAlreadyUsed(email)) {
      return utils.sendError(res, {
        code: 401,
        description: "Already used email",
      });
    }

    const hash = await bcrypt.hash(password, process.env.SALT as string);

    const [id] = await auth.postAccount({
      email,
      password: hash,
      role,
    });

    const apiKey = uuid.v4();

    await auth.postSession({
      api_key: apiKey,
      account_id: id,
      start_at: new Date().toISOString(),
      type: "connexion",
    });

    res.json({ id, apiKey });
  })
);

app.v2.get(
  "/account",
  utils.needRole("user"),
  expressAsyncHandler(async (req, res) => {
    if (utils.isLogin(req)) res.json(req.user);
  })
);

app.v2.get(
  "/accounts",
  utils.needRole("admin"),
  expressAsyncHandler(async (req, res) => {
    res.json(await auth.getAccounts());
  })
);

app.v2.get(
  "/logout",
  utils.needRole("user"),
  expressAsyncHandler(async (req, res) => {
    if (utils.isLogin(req))
      await auth.removeSession(req.user.account_id, "connexion");
    res.sendStatus(200);
  })
);

/** “me” can be used instead of id to reference own account */
app.v2
  .route("/account/:id")
  .get(
    utils.needRole("admin"),
    expressAsyncHandler(async (req, res) => {
      //  Retrieves the AccountMeta for the given account.
      //  Only admins can access accounts other than their own

      const account = await auth.getAccount(req.params.id);

      if (!account)
        return utils.sendError(res, {
          code: 404,
          description: "Account not found",
        });

      account.games = await auth.getAccountGames(account.id as string);

      res.json({
        email: account.email,
        id: account.id,
        role: account.role,
        games: account.games,
      });
    })
  )
  .put(
    utils.needRole("admin"),
    expressAsyncHandler(async (req, res) => {
      //  Update the given account.
      //  An AccountMeta object should be sent in the body.
      //  Only admins can access accounts other than their own

      const id = req.params.id,
        email = req.body?.email,
        password = req.body?.password,
        type = req.body?.type;

      if (email && !types.isValidEmail(email)) {
        return utils.sendError(res, {
          code: 401,
          description: "Invalid email",
        });
      }

      const account = await auth.getAccount(id);

      if (!account) {
        return utils.sendError(res, {
          code: 404,
          description: "Account not found",
        });
      }

      let hash: string | undefined;

      if (password) {
        hash = await bcrypt.hash(password, process.env.SALT as string);
      }

      await auth.updateAccount(id, {
        email,
        password: hash,
        role: type === "dev" ? "dev" : "user",
      });

      res.json({
        id,
        success: "Success",
      });
    })
  );

app.v2.post("/account/:id/reset-password", (req, res) => {
  // todo: Request password reset. Requires confirmation by email
  res.status(404).json({
    error: "not implemented",
  });
});

app.v2.post("/account/:id/reset-password/confirm", (req, res) => {
  // todo : Confirms password reset. Password reset token sent as URL param. Returns new password
  res.status(404).json({
    error: "not implemented",
  });
});
