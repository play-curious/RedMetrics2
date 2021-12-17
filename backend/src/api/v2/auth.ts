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
    res.sendStatus(200);
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

route<types.api.Account>(
  "Get",
  "/account",
  utils.authentication(),
  (req, res) => {
    if (utils.hasAccount(req)) res.json(req.account);
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

route<types.api.AccountById>(
  "Delete",
  "/account/:id",
  utils.authentication(
    (context) => context.params.id === context.account.id,
    true
  ),
  utils.asyncHandler(async (req, res) => {
    await auth.deleteAccount(req.params.id);
    res.sendStatus(200);
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

    res.json(account);
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

    const body = req.body as types.api.AccountById["Methods"]["Put"]["Body"];

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

route<types.api.AccountById_Keys>(
  "Get",
  "/account/:id/keys",
  utils.authentication((ctx) => ctx.params.id === ctx.account.id),
  utils.asyncHandler(async (req, res) => {
    if (utils.hasAccount(req))
      res.json(await auth.getUserApiKeys(req.account.id));
  })
);

route<types.api.Accounts>(
  "Get",
  "/accounts",
  utils.authentication("admin", true),
  utils.asyncHandler(async (req, res) => {
    const total = await auth.getAccountCount();

    const { page, perPage, offset, pageCount } = utils.extractPagingParams(
      req,
      total
    );

    const items = await auth.getAccounts(offset, perPage);

    utils.setPagingHeaders(req, res, {
      pageCount,
      perPage,
      total,
      page,
    });

    const body = JSON.stringify(items);

    res.header("coucou", "2");

    res.send(body);
  })
);

route<types.api.Key>(
  "Post",
  "/key",
  utils.authentication(undefined, true),
  utils.asyncHandler(async (req, res) => {
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
      start_timestamp: String(Date.now()),
      account_id: req.account.id,
      key: uuid.v4(),
      game_id: req.body.game_id,
    };

    await auth.apiKeys().insert(apiKey);

    res.json(apiKey);
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

    return res.json(apiKey);
  })
);

route<types.api.Key>(
  "Delete",
  "/key",
  utils.authentication(undefined, true),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;
    await auth.removeUserApiKeys(req.account.id);
    res.sendStatus(200);
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
    res.sendStatus(200);
  })
);

route<types.api.LostPassword>(
  "Post",
  "/lost-password",
  utils.asyncHandler(async (req, res) => {
    const email: types.api.LostPassword["Methods"]["Post"]["Body"]["email"] =
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
);

route<types.api.LostPassword>(
  "Patch",
  "/lost-password",
  utils.asyncHandler(async (req, res) => {
    const code: types.api.LostPassword["Methods"]["Patch"]["Body"]["code"] =
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

    res.sendStatus(200);
  })
);

route<types.api.ConfirmEmail>(
  "Post",
  "/confirm-email",
  utils.authentication(),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    await utils.sendAccountConfirmation(req.account);

    res.sendStatus(200);
  })
);

route<types.api.ConfirmEmail>(
  "Patch",
  "/confirm-email",
  utils.authentication(),
  utils.asyncHandler(async (req, res) => {
    if (!utils.hasAccount(req)) return;

    const code: types.api.ConfirmEmail["Methods"]["Patch"]["Body"]["code"] =
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
