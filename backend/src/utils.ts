import path from "path";
import express from "express";
import fsp from "fs/promises";
import Cookies from "js-cookie";
import expressAsyncHandler from "express-async-handler";

import * as uuid from "uuid";
import * as types from "rm2-typings";
import * as auth from "./controllers/auth";
import * as game from "./controllers/game";
import * as constants from "./constants";
import nodemailer from "nodemailer";

interface ForFilesOptions {
  recursive?: boolean;
  depth?: number;
  filters?: {
    filename?: RegExp;
    dirname?: RegExp;
  };
}

export async function forFiles(
  dirpath: string,
  callback: (filepath: string) => unknown,
  options?: ForFilesOptions,
  currentDepth = 1
) {
  const filenames = await fsp.readdir(dirpath);
  for (const filename of filenames) {
    const filepath = path.join(dirpath, filename);
    const stats = await fsp.stat(filepath);
    if (stats.isDirectory()) {
      if (options?.recursive) {
        if (
          Number.isNaN(options?.depth) ||
          currentDepth <= (options?.depth ?? 1)
        ) {
          if (
            !options?.filters?.dirname ||
            options.filters.dirname.test(filename)
          ) {
            await forFiles(filepath, callback, options, currentDepth + 1);
          }
        }
      }
    } else if (
      !options?.filters?.filename ||
      options.filters.filename.test(filename)
    ) {
      await callback(filepath);
    }
  }
}

export function checkGame(
  condition:
    | "own"
    | "admin"
    | ((context: {
        game: types.tables.Game;
        account: types.tables.Account;
        params: any;
        body: any;
      }) => boolean | Promise<boolean>) = () => true
): express.RequestHandler {
  if (condition === "own")
    condition = (context) => context.game.publisher_id === context.account.id;
  else if (condition === "admin") condition = () => false;

  return expressAsyncHandler(async (req, res, next) => {
    const key =
      req.query.apikey ??
      req.query.apiKey ??
      req.body.apikey ??
      req.body.apiKey ??
      req.params.apikey ??
      req.params.apiKey;

    if (!key)
      return sendError(res, {
        code: 401,
        description: "Missing apiKey",
      });

    if (typeof key !== "string" || !uuid.validate(key))
      return sendError(res, {
        code: 400,
        description: "Invalid token",
      });

    const apiKey = await auth.getApiKey(key);

    if (!apiKey)
      return sendError(res, {
        code: 404,
        description: "ApiKey not found",
      });

    const currentGame = await game.getGame(apiKey.game_id);
    const account = await auth.getAccount(apiKey.account_id);

    if (!account)
      return sendError(res, {
        code: 404,
        description: "Account not found",
      });

    if (!currentGame)
      return sendError(res, {
        code: 404,
        description: "Game not found",
      });

    if (
      !account.is_admin &&
      typeof condition !== "string" &&
      !(await condition({
        game: currentGame,
        params: req.params,
        body: req.body,
        account,
      }))
    ) {
      return sendError(res, {
        code: 401,
        description: "Access denied",
      });
    }

    // @ts-ignore
    req.game = currentGame;
    // @ts-ignore
    req.account = account;

    next();
  });
}

export function checkUser(
  condition:
    | "admin"
    | ((context: {
        account: types.tables.Account;
        params: any;
        body: any;
      }) => boolean | Promise<boolean>) = () => true,
  needToBeValidated?: true
): express.RequestHandler {
  if (condition === "admin") condition = () => false;

  return expressAsyncHandler(async (req, res, next) => {
    const token =
      req.cookies[constants.COOKIE_NAME] ??
      req.query.token ??
      req.body.token ??
      req.params.token;

    if (!token)
      return sendError(res, {
        code: 401,
        description: "Missing cookie token (please login again)",
      });

    if (typeof token !== "string" || !uuid.validate(token)) {
      return sendError(res, {
        code: 400,
        description: "Invalid token",
      });
    }

    const account = await auth.getAccountFromToken(token);

    if (!account)
      return sendError(res, {
        code: 404,
        description: "Account not found",
      });

    if (
      !account.is_admin &&
      typeof condition !== "string" &&
      !(await condition({
        account,
        params: req.params,
        body: req.body,
      }))
    ) {
      return sendError(res, {
        code: 401,
        description: "Access denied (bad token given, please login again)",
      });
    }

    if (needToBeValidated && !account.confirmed)
      return sendError(res, {
        code: 401,
        description: "You need to have validated your email",
      });

    // @ts-ignore
    req.account = account;

    next();
  });
}

export function checkGameOrUser(
  userCondition:
    | "admin"
    | ((context: {
        account: types.tables.Account;
        params: any;
        body: any;
      }) => boolean | Promise<boolean>)
) {
  return expressAsyncHandler(async (req, res, next) => {
    const key =
      req.query.apikey ??
      req.query.apiKey ??
      req.body.apikey ??
      req.body.apiKey ??
      req.params.apikey ??
      req.params.apiKey;

    if (key) return checkGame()(req, res, next);
    else return checkUser(userCondition)(req, res, next);
  });
}

export function sendError(res: express.Response, error: types.api.Error) {
  console.error("Error:", error);
  return res.status(error.code).json(error);
}

export function hasAccount(
  req: express.Request & { account?: types.tables.Account }
): req is express.Request & { account: types.tables.Account } {
  return "account" in req && !!req.account;
}

export function hasGame(
  req: express.Request & { game?: types.tables.Game }
): req is express.Request & { game: types.tables.Game } {
  return "game" in req && !!req.game;
}

export function extractLocale(req: express.Request): string {
  return typeof req.query.locale === "string" ? req.query.locale : "en";
}

export function isValidEmail(email: string): email is types.Email {
  return /^\S+@\S+\.\S+$/.test(email);
}

export async function sendDigitCode(
  account: types.tables.Account,
  title: string,
  subject: string
) {
  const digit = () => String(Math.floor(Math.random() * 9.9999999));
  const code = digit() + digit() + digit() + digit() + digit() + digit();
  const minutes = Number(process.env.TEMPORARY_CODE_TIMEOUT ?? 15);
  const timeout = minutes * 1000 * 60;

  await auth.confirmations().insert({
    account_id: account.id,
    code,
  });

  await sendMail({
    text: `
      ${title.replace(/<.+?>/g, "")}
      
      >> ${code} <<
      
      (You have ${minutes} minutes to enter the code from the site!)
    `,
    html: formatEmail(
      title,
      `
      <div style="
        padding: 30px;
        border-radius: 10px;
        margin-top: 15px;
        box-shadow: inset grey 0 5px;
        font-size: 40px;
        color: red;
      ">
        ${code}
      </div>
      <strong> You have ${minutes} minutes to enter the code from the site! </strong>`
    ),
    to: account.email,
    subject,
  });

  setTimeout(
    (account) => {
      auth
        .confirmations()
        .delete()
        .where("account_id", account.id)
        .then(() => true)
        .catch(console.error);
    },
    timeout,
    account
  );
}

export function formatEmail(title: string, content: string) {
  return `
    <body style="font-family: sans-serif">
      ${title}
      ${content}
    </body>
  `;
}

export async function sendMail(options: {
  text: string;
  html: string;
  to: string;
  subject: string;
}) {
  const transporter = await nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    ...options,
  });

  transporter.close();
}

export async function sendAccountConfirmation(account: types.tables.Account) {
  await sendDigitCode(
    account,
    `
        <h1> Confirm your account </h1>
        <h2> Use the following digit code to confirm your account </h2>
      `,
    "RedMetrics2 - Confirm your account"
  );
}
