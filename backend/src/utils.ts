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
        game: types.Game;
        account: types.Account;
        params: any;
        body: any;
      }) => boolean | Promise<boolean>) = () => true
): express.RequestHandler {
  if (condition === "own")
    condition = (context) => context.game.publisher_id === context.account.id;
  else if (condition === "admin") condition = () => false;

  return expressAsyncHandler(async (req, res, next) => {
    const fingerprint =
      req.query.apikey ??
      req.query.apiKey ??
      req.body.apikey ??
      req.body.apiKey ??
      req.params.apikey ??
      req.params.apiKey;

    if (!fingerprint)
      return sendError(res, {
        code: 401,
        description: "Missing apiKey",
      });

    if (typeof fingerprint !== "string" || !uuid.validate(fingerprint))
      return sendError(res, {
        code: 400,
        description: "Invalid token",
      });

    const apiKey = await auth.getApiKey(fingerprint);

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
        account: types.Account;
        params: any;
        body: any;
      }) => boolean | Promise<boolean>) = () => true
): express.RequestHandler {
  if (condition === "admin") condition = () => false;

  return expressAsyncHandler(async (req, res, next) => {
    const cookie: Cookies.CookieAttributes | undefined =
      req.cookies[constants.COOKIE_NAME];

    if (!cookie)
      return sendError(res, {
        code: 401,
        description: "Missing cookie (please login again)",
      });

    console.log(cookie);

    const token = cookie.value;

    if (typeof token !== "string" || !uuid.validate(token))
      return sendError(res, {
        code: 400,
        description: "Invalid token",
      });

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

    // @ts-ignore
    req.account = account;

    next();
  });
}

export function sendError(res: express.Response, error: types.Error) {
  console.error(error);
  return res.status(error.code).json(error);
}

export function hasAccount(
  req: express.Request & { account?: types.Account }
): req is express.Request & { account: types.Account } {
  return "account" in req && !!req.account;
}

export function hasGame(
  req: express.Request & { game?: types.Game }
): req is express.Request & { game: types.Game } {
  return "game" in req && !!req.game;
}

export function extractLocale(req: express.Request): string {
  return typeof req.query.locale === "string" ? req.query.locale : "en";
}

export function isValidEmail(email: string): email is types.Email {
  return /^\S+@\S+\.\S+$/.test(email);
}
