import path from "path";
import express from "express";
import fsp from "fs/promises";
import expressAsyncHandler from "express-async-handler";
import * as uuid from "uuid";
import * as types from "./types";
import * as auth from "./controllers/auth";

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

export function needRole(role: types.Role): express.RequestHandler {
  return expressAsyncHandler(async (req, res, next) => {
    const apiKey = req.query.apikey;

    if (apiKey == null)
      return sendError(res, {
        code: 401,
        description: "Missing apiKey",
      });

    if (typeof apiKey !== "string" || !uuid.validate(apiKey))
      return sendError(res, {
        code: 400,
        description: "Invalid apiKey",
      });

    const session = await auth.getSession(apiKey);

    if (!session)
      return sendError(res, {
        code: 401,
        description: "Expired session",
      });

    const account = await auth.getAccount(session.account_id);

    if (!account)
      return sendError(res, {
        code: 404,
        description: "Account not found",
      });

    if (roleRank(account.role) < roleRank(role))
      return sendError(res, {
        code: 401,
        description: "Access denied",
      });

    // @ts-ignore
    req.user = {
      role: account.role,
      email: account.email,
      password: account.password,
    } as types.User;

    next();
  });
}

export function roleRank(role: types.Role): 0 | 1 | 2 {
  return ["user", "dev", "admin"].indexOf(role) as 0 | 1 | 2;
}

export function sendError(res: express.Response, error: types.RMError) {
  return res.status(error.code).json(error);
}

export function isUserReq(
  req: express.Request
): req is express.Request & { user: types.User } {
  return req.hasOwnProperty("user");
}

export function extractLocale(req: express.Request): string {
  return typeof req.query.locale === "string" ? req.query.locale : "en";
}

export const checkConnexionCookie: express.RequestHandler = (
  req,
  res,
  next
) => {
  console.log(req.cookies, req.signedCookies);
  next();
};
