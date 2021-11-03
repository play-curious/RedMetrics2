import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import * as uuid from "uuid";

import * as app from "../../app";
import * as utils from "../../utils";
import * as constants from "../../constants";
import * as auth from "../../controllers/auth";
import * as game from "../../controllers/game";
import * as types from "rm2-typings";

app.v2.get(
  "/logout",
  utils.authentication(),
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
      is_admin = false;

    if (!email || !password)
      return utils.sendError(res, {
        code: 401,
        description: "Missing email or password",
      });

    if (!utils.isValidEmail(email))
      return utils.sendError(res, { code: 401, description: "Invalid email" });

    if (await auth.emailAlreadyUsed(email))
      return utils.sendError(res, {
        code: 401,
        description: "Already used email",
      });

    const hash = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS as string)
    );

    const connectionToken = uuid.v4();

    const id = await auth.postAccount({
      email,
      password: hash,
      is_admin,
      connection_token: connectionToken,
      confirmed: false,
      created_timestamp: String(Date.now()),
    });

    const account = await auth.getAccount(id);

    if (!account) return;

    await utils.sendAccountConfirmation(account);

    res.cookie(constants.COOKIE_NAME, connectionToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    res.json({ id, token: connectionToken });
  })
);

app.v2
  .route("/account")
  .get(utils.authentication(), (req, res) => {
    if (utils.hasAccount(req)) res.json(req.account);
  })
  .post(
    utils.authentication("admin", true),
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

      if (!utils.isValidEmail(email))
        return utils.sendError(res, {
          code: 401,
          description: "Invalid email",
        });

      if (await auth.emailAlreadyUsed(email))
        return utils.sendError(res, {
          code: 401,
          description: "Already used email",
        });

      const hash = await bcrypt.hash(
        password,
        parseInt(process.env.SALT_ROUNDS as string)
      );

      const id = await auth.postAccount({
        email,
        password: hash,
        is_admin,
        confirmed: false,
        created_timestamp: String(Date.now()),
      });

      const account = await auth.getAccount(id);

      if (!account) return;

      await utils.sendAccountConfirmation(account);

      res.sendStatus(200);
    })
  );

app.v2
  .route("/account/:id")
  .delete(
    utils.authentication(
      (context) => context.params.id === context.account.id,
      true
    ),
    expressAsyncHandler(async (req, res) => {
      await auth.deleteAccount(req.params.id);
      res.sendStatus(200);
    })
  )
  .get(
    utils.authentication((context) => context.params.id === context.account.id),
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
    utils.authentication(
      async (context) =>
        context.params.id === context.account.id || context.account.is_admin,
      true
    ),
    expressAsyncHandler(async (req, res) => {
      //  Update the given account.
      //  An AccountMeta object should be sent in the body.
      //  Only admins can access accounts other than their own

      if (!utils.hasAccount(req)) return;

      const body = req.body as types.api.AccountById["Put"]["Body"];

      const id = req.params.id;

      const is_admin = req.account.is_admin ? req.body?.is_admin : undefined;

      if (body.email && !utils.isValidEmail(body.email)) {
        return utils.sendError(res, {
          code: 401,
          description: "Invalid email",
        });
      }

      const account = await auth.getAccount(id);

      if (!account)
        return utils.sendError(res, {
          code: 404,
          description: "Account not found",
        });

      if (
        (account.id === id && !req.account.is_admin) ||
        !req.account.is_admin
      ) {
        if (!body.old_password)
          return utils.sendError(res, {
            code: 401,
            description: "Missing old_password",
          });

        if (!(await bcrypt.compare(body.old_password, account.password)))
          return utils.sendError(res, {
            code: 401,
            description: "Incorrect password",
          });
      }

      let hash: string | undefined;

      if (body.new_password)
        hash = await bcrypt.hash(
          body.new_password,
          parseInt(process.env.SALT_ROUNDS as string)
        );

      await auth.updateAccount(id, {
        email: body.email,
        password: hash,
        is_admin,
        confirmed: account.confirmed
          ? account.email === body.email
            ? account.confirmed
            : false
          : false,
      });

      res.json({ id });
    })
  );

app.v2.get(
  "/accounts",
  utils.authentication("admin", true),
  expressAsyncHandler(async (req, res) => {
    res.json(await auth.getAccounts());
  })
);

app.v2
  .route("/key")
  .all(utils.authentication(undefined, true))
  .post(
    expressAsyncHandler(async (req, res) => {
      if (!utils.hasAccount(req)) return;

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

      const apiKey: types.tables.ApiKey = {
        description: req.body.description,
        start_at: new Date().toISOString(),
        account_id: req.account.id,
        key: uuid.v4(),
        game_id: req.body.game_id,
      };

      await auth.apiKeys().insert(apiKey);

      res.json(apiKey);
    })
  )
  .get(
    expressAsyncHandler(async (req, res) => {
      if (!utils.hasAccount(req)) return;
      res.json(await auth.getUserApiKeys(req.account.id));
    })
  )
  .delete(
    expressAsyncHandler(async (req, res) => {
      if (!utils.hasAccount(req)) return;
      await auth.removeUserApiKeys(req.account.id);
      res.sendStatus(200);
    })
  );

app.v2.delete(
  "/key/:key",
  utils.authentication(async (context) => {
    const apiKey = await auth.getApiKey(context.params.key);
    return apiKey?.account_id === context.account.id;
  }, true),
  expressAsyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;
    await auth.removeApiKey(req.params.key);
    res.sendStatus(200);
  })
);

app.v2
  .route("/lost-password")
  .post(
    expressAsyncHandler(async (req, res) => {
      const email: types.api.LostPassword["Post"]["Body"]["email"] =
        req.body.email;

      if (!email)
        return utils.sendError(res, {
          code: 401,
          description: "Missing email",
        });

      const account = await auth.getAccountByEmail(email);

      if (!account)
        return utils.sendError(res, {
          code: 404,
          description: "Account not found",
        });

      // send code by email !
      await utils.sendDigitCode(
        account,
        `<h1> Reset your password - Step 1/2 </h1>
        <h2> To reset your password, use the following code. </h2>`,
        "RedMetrics2 - Reset your password"
      );

      res.sendStatus(200);
    })
  )
  .patch(
    expressAsyncHandler(async (req, res) => {
      const code: types.api.LostPassword["Patch"]["Body"]["code"] =
        req.body.code;

      const confirmation = await auth
        .confirmations()
        .where("code", code)
        .first();

      if (!confirmation)
        return utils.sendError(res, {
          code: 422,
          description: "Confirmation code not valid",
        });

      await auth
        .confirmations()
        .where("account_id", confirmation.account_id)
        .delete();

      const account = await auth.getAccount(confirmation.account_id);

      if (!account) {
        return utils.sendError(res, {
          code: 404,
          description: "Account not found",
        });
      }

      const newPassword = uuid.v4();

      const hash = await bcrypt.hash(
        newPassword,
        parseInt(process.env.SALT_ROUNDS as string)
      );

      await auth.updateAccount(account.id, { password: hash });

      // send password by email !
      await utils.sendMail({
        to: account.email,
        subject: "Reset your password",
        text: `
          Reset your password - Step 2/2
          
          Here is your temporary password
          
          >> ${newPassword} <<
        `,
        html: utils.formatEmail(
          `<h1> Reset your password - Step 2/2 </h1>
          <h2> Here is your temporary password  </h2>`,
          `<div style="
            padding: 30px;
            border-radius: 10px;
            margin-top: 15px;
            box-shadow: inset grey 0 5px;
            font-size: 30px;
            color: red;
          ">
            ${newPassword}
          </div>`
        ),
      });

      res.sendStatus(200);
    })
  );

app.v2
  .route("/confirm-email")
  .all(utils.authentication())
  .post(
    expressAsyncHandler(async (req, res) => {
      if (!utils.hasAccount(req)) return;

      await utils.sendAccountConfirmation(req.account);

      res.sendStatus(200);
    })
  )
  .patch(
    expressAsyncHandler(async (req, res) => {
      if (!utils.hasAccount(req)) return;

      const code: types.api.ConfirmEmail["Patch"]["Body"]["code"] =
        req.body.code;

      const confirmation = await auth
        .confirmations()
        .where("code", code)
        .and.where("account_id", req.account.id)
        .first();

      if (!confirmation)
        return utils.sendError(res, {
          code: 422,
          description: "Confirmation code not valid",
        });

      await auth.confirmations().where("account_id", req.account.id).delete();

      await auth.updateAccount(req.account.id, { confirmed: true });

      res.sendStatus(200);
    })
  );
