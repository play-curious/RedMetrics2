import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import fsp from "fs/promises";
import * as types from "./types";

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

export const needToken: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return sendError(res, {
      code: 401,
      description: "Missing JWT",
    });

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err, user: any) => {
      if (err)
        return sendError(res, {
          code: 401,
          description: "Missing JWT",
        });

      // @ts-ignore
      req.user = user;

      next();
    }
  );
};

export async function generateAccessToken(login: types.Login): Promise<string> {
  login.password = await bcrypt.hash(
    login.password,
    process.env.SALT as string
  );
  return jwt.sign(login, process.env.TOKEN_SECRET as string, {
    expiresIn: "1800s",
  });
}

export function sendError(res: express.Response, error: types.RMError) {
  return res.status(error.code).json(error);
}

export function isUserReq(
  req: express.Request
): req is express.Request & { user: types.Login } {
  return req.hasOwnProperty("user");
}
