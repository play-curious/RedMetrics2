import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import * as uuid from "uuid";
import * as app from "../../app";
import * as utils from "../../utils";
import * as auth from "../../controllers/auth";
import * as game from "../../controllers/game";
import * as types from "rm2-typings";

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

    const existingSession = await auth.getUserSession(account.id as string);

    if (existingSession) {
      await auth.refreshSession(existingSession.api_key);
      return res.json({ apiKey: existingSession.api_key });
    }

    const apiKey = uuid.v4();

    await auth.postSession({
      name: "unique connexion apikey",
      api_key: apiKey,
      account_id: account.id as string,
      start_at: new Date().toISOString(),
      permissions: JSON.stringify(types.permissions[account.role].slice()),
      is_connection_key: true,
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
      name: "unique connexion apikey",
      api_key: apiKey,
      account_id: id,
      start_at: new Date().toISOString(),
      permissions: JSON.stringify(types.permissions[role].slice()),
      is_connection_key: true,
    });

    res.json({ id, apiKey });
  })
);

app.v2.get(
  "/account",
  utils.checkUser(),
  expressAsyncHandler(async (req, res) => {
    if (utils.isLogin(req)) res.json(req.user);
  })
);

app.v2.delete(
  "/account/:id",
  utils.checkUser(
    [types.Permission.DELETE_ACCOUNTS, types.Permission.MANAGE_ACCOUNTS],
    (context) => context.params.id === context.account.id
  ),
  expressAsyncHandler(async (req, res) => {
    await auth.deleteAccount(req.params.id);
    res.sendStatus(200);
  })
);

app.v2.get(
  "/accounts",
  utils.checkUser([
    types.Permission.MANAGE_ACCOUNTS,
    types.Permission.SHOW_ACCOUNTS,
  ]),
  expressAsyncHandler(async (req, res) => {
    res.json(await auth.getAccounts());
  })
);

app.v2.get(
  "/sessions",
  utils.checkUser(),
  expressAsyncHandler(async (req, res) => {
    if (!utils.isLogin(req)) return;
    res.json(await auth.getUserSessions(req.user.account_id));
  })
);

app.v2
  .route("/session")
  .all(utils.checkUser())
  .get(
    expressAsyncHandler(async (req, res) => {
      if (!utils.isLogin(req)) return;
      res.json(await auth.getSession(req.user.api_key));
    })
  )
  .post(
    expressAsyncHandler(async (req, res) => {
      if (!utils.isLogin(req)) return;

      if (!req.body.name)
        return utils.sendError(res, {
          code: 400,
          description: "Missing 'name' property in body",
        });

      if (!req.body.permissions || !Array.isArray(req.body.permissions))
        return utils.sendError(res, {
          code: 400,
          description: "Missing 'permissions' property in body",
        });

      for (const permission of req.body.permissions) {
        let error = false;

        if (!req.user.permissions.includes(permission)) {
          if (
            permission === "showAccounts" ||
            permission === "createAccounts" ||
            permission === "deleteAccounts" ||
            permission === "editAccounts"
          ) {
            if (
              !req.user.permissions.includes(types.Permission.MANAGE_ACCOUNTS)
            ) {
              error = true;
            }
          } else if (
            permission === "showGames" ||
            permission === "createGames" ||
            permission === "deleteGames" ||
            permission === "editGames"
          ) {
            if (!req.user.permissions.includes(types.Permission.MANAGE_GAMES)) {
              error = true;
            }
          }
        }

        if (error)
          return utils.sendError(res, {
            code: 400,
            description: `Bad permission is pushed to new session: ${permission}`,
          });
      }

      const currentSession: types.RawApiKey = {
        start_at: new Date().toISOString(),
        account_id: req.user.account_id,
        name: req.body.name,
        api_key: uuid.v4(),
        is_connection_key: false,
        permissions: JSON.stringify(req.body.permissions),
      };

      if (req.body.game_id) {
        const game_id = req.body.game_id;

        const currentGame = await game.getGame(game_id);

        if (!currentGame)
          return utils.sendError(res, {
            code: 404,
            description: "Game not found",
          });

        currentSession.game_id = game_id;
      }

      await auth.postSession(currentSession);

      res.json({ apiKey: currentSession.api_key });
    })
  );

app.v2.delete(
  "/session/:apikey",
  utils.checkUser(
    [types.Permission.MANAGE_ACCOUNTS],
    (context) => context.session.api_key === context.params.apikey
  ),
  expressAsyncHandler(async (req, res) => {
    if (!utils.isLogin(req)) return;
    const apikey = req.params.apikey;
    await auth.removeSession(apikey);
    res.sendStatus(200);
  })
);

app.v2.get(
  "/logout",
  utils.checkUser(),
  expressAsyncHandler(async (req, res) => {
    if (utils.isLogin(req)) await auth.removeSession(req.user.api_key);
    res.sendStatus(200);
  })
);

/** “me” can be used instead of id to reference own account */
app.v2
  .route("/account/:id")
  .get(
    utils.checkUser(
      [types.Permission.SHOW_ACCOUNTS, types.Permission.MANAGE_ACCOUNTS],
      (context) => context.params.id === context.account.id
    ),
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
    utils.checkUser(
      [types.Permission.EDIT_ACCOUNTS, types.Permission.MANAGE_ACCOUNTS],
      (context) => context.params.id === context.account.id
    ),
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
