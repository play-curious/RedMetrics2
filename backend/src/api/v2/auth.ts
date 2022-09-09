import bcrypt from "bcrypt";
import * as uuid from "uuid";

import * as app from "../../app";
import * as utils from "../../utils";
import * as constants from "../../constants";
import * as auth from "../../controllers/auth";
import * as game from "../../controllers/game";

import * as types from "rm2-typings";

const route = types.utils.buildRouteMaker(app.v2);

route<types.api.Logout>(
  "Get",
  "/logout",
  utils.authentication(),
  utils.asyncHandler(async (req, res) => {
    if (utils.hasAccount(req)) await auth.logout(req.account.id);
    res.json({});
  })
);

route<types.api.Login>(
  "Post",
  "/login",
  utils.asyncHandler(async (req, res) => {
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

route<types.api.Register>(
  "Post",
  "/register",
  utils.asyncHandler(async (req, res) => {
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
      confirmed: process.env.SMTP_DISABLED === "1",
      created_timestamp: new Date(),
    });

    const account = await auth.getAccount(id);

    if (!account) return;

    if (process.env.SMTP_DISABLED !== "1") {
      try {
        await utils.sendAccountConfirmation(account);
      } catch (error) {
        return utils.sendError(res, {
          code: 201,
          description: "Incorrectly configured emails",
        });
      }
    }

    res.cookie(constants.COOKIE_NAME, connectionToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    res.json({ id, token: connectionToken });
  })
);

route<types.api.Account>(
  "Get",
  "/account",
  utils.authentication(),
  (req, res) => {
    if (utils.hasAccount(req))
      res.json(
        utils.jsonRecursivelySnakeToCamelCase({
          ...req.account,
          password: null,
        })
      );
  }
);

route<types.api.Account>(
  "Post",
  "/account",
  utils.authentication("admin", true),
  utils.asyncHandler(async (req, res) => {
    //  Registers a new account.
    //  An AccountMeta object should be sent in the body.
    //  The Location response header will contain the URL for the new account.

    const email = req.body?.email,
      password = req.body?.password,
      is_admin = /^(?:true|1)$/.test(String(req.body?.isAdmin ?? "false"));

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
      confirmed: process.env.SMTP_DISABLED === "1",
      created_timestamp: new Date(),
    });

    const account = await auth.getAccount(id);

    if (!account) return;

    if (process.env.SMTP_DISABLED !== "1") {
      try {
        await utils.sendAccountConfirmation(account);
      } catch (error) {
        return utils.sendError(res, {
          code: 201,
          description: "Failed to send confirmation email",
        });
      }
    }

    res.json({});
  })
);

route<types.api.AccountById>(
  "Delete",
  "/account/:id",
  utils.authentication(
    (context) => context.params.id === context.account.id,
    true
  ),
  utils.asyncHandler(async (req, res) => {
    await auth.deleteAccount(req.params.id);
    res.json({});
  })
);

route<types.api.AccountById>(
  "Get",
  "/account/:id",
  utils.authentication((context) => context.params.id === context.account.id),
  utils.asyncHandler(async (req, res) => {
    //  Retrieves the AccountMeta for the given account.
    //  Only admins can access accounts other than their own

    const account = await auth.getAccount(req.params.id);

    if (!account)
      return utils.sendError(res, {
        code: 404,
        description: "Account not found",
      });

    res.json(
      utils.jsonRecursivelySnakeToCamelCase({ ...account, password: null })
    );
  })
);

route<types.api.AccountById>(
  "Put",
  "/account/:id",
  utils.authentication(
    async (context) =>
      context.params.id === context.account.id || context.account.is_admin,
    true
  ),
  utils.asyncHandler(async (req, res) => {
    //  Update the given account.
    //  An AccountMeta object should be sent in the body.
    //  Only admins can access accounts other than their own

    if (!utils.hasAccount(req)) return;

    const body: types.api.AccountById["Methods"]["Put"]["Body"] = req.body;

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

    if ((account.id === id && !req.account.is_admin) || !req.account.is_admin) {
      if (!body.oldPassword)
        return utils.sendError(res, {
          code: 401,
          description: "Missing old_password",
        });

      if (!(await bcrypt.compare(body.oldPassword, account.password)))
        return utils.sendError(res, {
          code: 401,
          description: "Incorrect password",
        });
    }

    let hash: string | undefined;

    if (body.newPassword)
      hash = await bcrypt.hash(
        body.newPassword,
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

route<types.api.AccountById_Key>(
  "Get",
  "/account/:id/key",
  utils.authentication((ctx) => ctx.params.id === ctx.account.id),
  utils.asyncHandler(async (req, res) => {
    if (utils.hasAccount(req)) {
      if (req.account.is_admin) {
        res.json(
          utils.jsonRecursivelySnakeToCamelCase(await auth.getAllApiKeys())
        );
      } else {
        res.json(
          utils.jsonRecursivelySnakeToCamelCase(
            await auth.getUserApiKeys(req.account.id)
          )
        );
      }
    }
  })
);

route<types.api.Accounts>(
  "Get",
  "/accounts",
  utils.authentication("admin", true),
  utils.asyncHandler(async (req, res) => {
    const total = await auth.getAccountCount();

    const { page, perPage, offset, pageCount, sortBy } =
      utils.extractPagingParams(req, total);

    const items = await auth.getAccounts(offset, perPage, sortBy as any);

    utils.setPagingHeaders(req, res, {
      pageCount,
      perPage,
      total,
      page,
    });

    res.send(items.map((item) => ({ ...item, password: null })));
  })
);

route<types.api.Key>(
  "Post",
  "/key",
  utils.authentication(undefined, true),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    if (!req.body.gameId)
      return utils.sendError(res, {
        code: 400,
        description: "Missing 'gameId' property in body",
      });

    const currentGame = await game.getGame(req.body.gameId);

    if (!currentGame)
      return utils.sendError(res, {
        code: 404,
        description: "Game not found",
      });

    const apiKey: types.tables.ApiKey = {
      description: req.body.description,
      start_timestamp: new Date(),
      account_id: req.account.id,
      key: uuid.v4(),
      game_id: req.body.gameId,
    };

    await auth.apiKeys().insert(apiKey);

    res.json(utils.jsonRecursivelySnakeToCamelCase(apiKey));
  })
);

route<types.api.Key>(
  "Get",
  "/key",
  utils.authentication(undefined, true),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasGame(req))
      return utils.sendError(res, {
        code: 400,
        description: "You need to access this route via API key.",
      });

    const apiKey = await auth.getApiKey(req.apiKey);

    if (!apiKey)
      return utils.sendError(res, {
        code: 404,
        description: "API key not found",
      });

    return res.json(utils.jsonRecursivelySnakeToCamelCase(apiKey));
  })
);

route<types.api.Key>(
  "Delete",
  "/key",
  utils.authentication(undefined, true),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;
    await auth.removeUserApiKeys(req.account.id);
    res.json({});
  })
);

route<types.api.KeyByKey>(
  "Delete",
  "/key/:key",
  utils.authentication(async (context) => {
    const apiKey = await auth.getApiKey(context.params.key);
    return apiKey?.account_id === context.account.id;
  }, true),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;
    await auth.removeApiKey(req.params.key);
    res.json({});
  })
);

route<types.api.ResetPassword>(
  "Post",
  "/reset-password",
  utils.asyncHandler(async (req, res) => {
    const email: types.api.ResetPassword["Methods"]["Post"]["Body"]["email"] =
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

    res.json({});
  })
);

route<types.api.ResetPassword_Confirm>(
  "Post",
  "/reset-password/confirm",
  utils.asyncHandler(async (req, res) => {
    const code: types.api.ResetPassword_Confirm["Methods"]["Post"]["Body"]["code"] =
      req.body.code;

    const confirmation = await auth.confirmations().where("code", code).first();

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

    res.json({});
  })
);

route<types.api.CheckEmail>(
  "Post",
  "/check-email",
  utils.authentication(),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    await utils.sendAccountConfirmation(req.account);

    res.json({});
  })
);

route<types.api.CheckEmail_Confirm>(
  "Post",
  "/check-email/confirm",
  utils.authentication(),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    const code: types.api.CheckEmail_Confirm["Methods"]["Post"]["Body"]["code"] =
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

    res.json({});
  })
);
