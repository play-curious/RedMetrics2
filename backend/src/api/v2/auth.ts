import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import * as uuid from "uuid";
import * as app from "../../app";
import * as utils from "../../utils";
import * as constants from "../../constants";
import * as auth from "../../controllers/auth";
import * as game from "../../controllers/game";
import * as types from "rm2-typings";
import { removeUserApiKeys } from "../../controllers/auth";

app.v2.get(
  "/logout",
  utils.checkUser(),
  expressAsyncHandler(async (req, res) => {
    if (utils.hasAccount(req)) await auth.logout(req.account.id);
    res.sendStatus(200);
  })
);

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

    if (!utils.isValidEmail(email)) {
      return utils.sendError(res, { code: 401, description: "Invalid email" });
    }

    const account = await auth.getAccountByEmail(email);

    if (!account) {
      return utils.sendError(res, { code: 404, description: "Unknown email" });
    }

    if (!(await bcrypt.compare(password, account.password))) {
      return utils.sendError(res, {
        code: 401,
        description: "Incorrect password",
      });
    }

    const connectionToken = uuid.v4();

    await auth
      .accounts()
      .update({
        connection_token: connectionToken,
      })
      .where("id", account.id);

    res.cookie(constants.COOKIE_NAME, connectionToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    res.json({ token: connectionToken });
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
      is_admin = /^(?:true|1|)$/.test(String(req.body?.is_admin ?? "false"));

    if (!email || !password)
      return utils.sendError(res, {
        code: 401,
        description: "Missing email or password",
      });

    if (!utils.isValidEmail(email)) {
      return utils.sendError(res, { code: 401, description: "Invalid email" });
    }

    if (await auth.emailAlreadyUsed(email)) {
      return utils.sendError(res, {
        code: 401,
        description: "Already used email",
      });
    }

    const hash = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS as string)
    );

    const connectionToken = uuid.v4();

    const [id] = await auth.postAccount({
      email,
      password: hash,
      is_admin,
      connection_token: connectionToken,
    });

    res.cookie(constants.COOKIE_NAME, connectionToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    res.json({ id, token: connectionToken });
  })
);

app.v2.get(
  "/account",
  utils.checkUser(),
  expressAsyncHandler(async (req, res) => {
    if (utils.hasAccount(req)) res.json(req.account);
  })
);

app.v2
  .route("/account/:id")
  .all(utils.checkUser((context) => context.params.id === context.account.id))
  .delete(
    expressAsyncHandler(async (req, res) => {
      await auth.deleteAccount(req.params.id);
      res.sendStatus(200);
    })
  )
  .get(
    expressAsyncHandler(async (req, res) => {
      //  Retrieves the AccountMeta for the given account.
      //  Only admins can access accounts other than their own

      const account = await auth.getAccount(req.params.id);

      if (!account)
        return utils.sendError(res, {
          code: 404,
          description: "Account not found",
        });

      res.json(account);
    })
  )
  .put(
    expressAsyncHandler(async (req, res) => {
      //  Update the given account.
      //  An AccountMeta object should be sent in the body.
      //  Only admins can access accounts other than their own

      const id = req.params.id,
        email = req.body?.email,
        password = req.body?.password,
        is_admin = req.body?.is_admin;

      if (email && !utils.isValidEmail(email)) {
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
        hash = await bcrypt.hash(
          password,
          parseInt(process.env.SALT_ROUNDS as string)
        );
      }

      await auth.updateAccount(id, {
        email,
        password: hash,
        is_admin,
      });

      res.json({
        id,
        success: "Success",
      });
    })
  );

app.v2.get(
  "/accounts",
  utils.checkUser("admin"),
  expressAsyncHandler(async (req, res) => {
    res.json(await auth.getAccounts());
  })
);

app.v2.post(
  "/key",
  utils.checkUser(),
  expressAsyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    if (!req.body.name)
      return utils.sendError(res, {
        code: 400,
        description: "Missing 'name' property in body",
      });

    if (!req.body.game_id)
      return utils.sendError(res, {
        code: 400,
        description: "Missing 'game_id' property in body",
      });

    const currentGame = await game.getGame(req.body.game_id);

    if (!currentGame)
      return utils.sendError(res, {
        code: 404,
        description: "Game not found",
      });

    const currentSession: types.ApiKey = {
      start_at: new Date().toISOString(),
      account_id: req.account.id,
      name: req.body.name,
      key: uuid.v4(),
      game_id: req.body.game_id,
    };

    await auth.apiKeys().insert(currentSession);

    res.json({ apiKey: currentSession.key });
  })
);

app.v2.delete(
  "/key/:key",
  utils.checkUser(async (context) => {
    const apiKey = await auth.getApiKey(context.params.key);
    return apiKey?.account_id === context.account.id;
  }),
  expressAsyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;
    await auth.removeApiKey(req.params.key);
    res.sendStatus(200);
  })
);

app.v2
  .route("/keys")
  .get(
    utils.checkUser(),
    expressAsyncHandler(async (req, res) => {
      if (!utils.hasAccount(req)) return;
      res.json(await auth.getUserApiKeys(req.account.id));
    })
  )
  .delete(
    utils.checkUser(),
    expressAsyncHandler(async (req, res) => {
      if (!utils.hasAccount(req)) return;
      await auth.removeUserApiKeys(req.account.id);
      res.sendStatus(200);
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
