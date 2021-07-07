import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import * as uuid from "uuid";

import * as app from "../../app";
import * as utils from "../../utils";
import * as constants from "../../constants";
import * as auth from "../../controllers/auth";
import * as game from "../../controllers/game";
import * as types from "rm2-typings";

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

app.v2
  .route("/account")
  .get(utils.checkUser(), (req, res) => {
    if (utils.hasAccount(req)) res.json(req.account);
  })
  .post(
    utils.checkUser("admin"),
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

      await auth.postAccount({
        email,
        password: hash,
        is_admin,
      });

      res.sendStatus(200);
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

      if (!utils.hasAccount(req)) return;

      const id = req.params.id,
        email = req.body?.email,
        password = req.body?.password;

      const is_admin = req.account.is_admin ? req.body?.is_admin : undefined;

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

      res.json({ id });
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

    const apiKey: types.tables.ApiKey = {
      start_at: new Date().toISOString(),
      account_id: req.account.id,
      name: req.body.name,
      key: uuid.v4(),
      game_id: req.body.game_id,
    };

    await auth.apiKeys().insert(apiKey);

    res.json(apiKey);
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

      const digit = () => String(Math.floor(Math.random() * 9.9999999));
      const code = digit() + digit() + digit() + digit() + digit() + digit();

      await auth.confirmations().insert({
        account_id: account.id,
        code,
      });

      // send code by email !
      {
        const transporter = await nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const info = await transporter.sendMail({
          from: `"PlayCurious" <hello@playcurious.Games>`,
          to: email,
          subject: "Reset your password",
          html: `
            <body style="font-family: sans-serif">
              <h1> Reset your password - Step 1/2 </h1>
              <p> To reset your password, use the following code. </p>
              <div style="
                padding: 30px;
                border-radius: 10px;
                margin-top: 15px;
                box-shadow: inset grey 0 5px;
                font-size: 30px;
              ">
                ${code}
              </div>
              <strong> You have 15 minutes to enter the code from the site! </strong>
            </body>
        `,
        });

        transporter.close();
      }

      setTimeout(() => {
        auth
          .confirmations()
          .delete()
          .where("account_id", account.id)
          .then(() => true)
          .catch(console.error);
      }, 1000 * 60 * 15);

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

      const account = await auth.getAccount(confirmation.account_id);

      if (!account) {
        await auth
          .confirmations()
          .where("account_id", confirmation.account_id)
          .delete();

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
      {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const info = await transporter.sendMail({
          from: `"PlayCurious" <hello@playcurious.Games>`,
          to: account.email,
          subject: "Reset your password",
          html: `
            <body style="font-family: sans-serif">
              <h1> Reset your password - Step 2/2 </h1>
              <p> Here is your temporary password  </p>
              <div style="
                padding: 30px;
                border-radius: 10px;
                margin-top: 15px;
                box-shadow: inset grey 0 5px;
                font-size: 30px;
              ">
                ${newPassword}
              </div>
            </body>
        `,
        });

        transporter.close();
      }

      res.sendStatus(200);
    })
  );
