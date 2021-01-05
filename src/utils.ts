import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import fsp from "fs/promises";
import * as types from "./types";
import dayjs from "dayjs";

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

export const adminOnly: express.RequestHandler = (req, res, next) => {
  if (!isUserReq(req)) {
    return sendError(res, {
      code: 401,
      description: "Missing token",
    });
  }

  if (req.user.role !== "admin") {
    return sendError(res, {
      code: 401,
      description: "Access refused",
    });
  }

  next();
};

export const needToken: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return sendError(res, {
      code: 401,
      description: "Missing JWT",
    });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
    if (err)
      return sendError(res, {
        code: 401,
        description: "Missing JWT",
      });

    // @ts-ignore
    req.user = user as types.User;

    next();
  });
};

export async function generateAccessToken(user: types.User): Promise<string> {
  user.password = await bcrypt.hash(user.password, process.env.SALT as string);
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "1800s",
  });
}

export function sendError(
  res: express.Response,
  error: types.RMError,
  redirectToView?: boolean
) {
  return redirectToView
    ? res.render("pages/error", {
        error: error.description,
        code: error.code,
        locale: "en",
      })
    : res.status(error.code).json(error);
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

export const checkAdmin: express.RequestHandler = (req, res, next) => {
  next();
};
