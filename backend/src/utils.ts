import fsp from "fs/promises";
import path from "path";
import express from "express";
import nodemailer from "nodemailer";
import url from "url";

import * as uuid from "uuid";
import * as types from "rm2-typings";

import * as auth from "./controllers/auth";
import * as game from "./controllers/game";
import * as constants from "./constants";
import { type } from "os";

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

export function authentication(
  condition:
    | "admin"
    | ((context: {
        game?: types.tables.Game;
        account: types.tables.Account;
        params: any;
        body: any;
      }) => boolean | Promise<boolean>) = () => true,
  needToBeValidated?: true
): express.RequestHandler {
  return asyncHandler(async (req, res, next) => {
    if (condition === "admin") condition = () => false;

    const key =
      req.query.apikey ??
      req.query.apiKey ??
      req.body.apikey ??
      req.body.apiKey ??
      req.params.apikey ??
      req.params.apiKey;

    const token =
      req.cookies[constants.COOKIE_NAME] ??
      req.query.token ??
      req.body.token ??
      req.params.token;

    if (!token && !key)
      return sendError(res, {
        code: 401,
        description: "Missing authentication token or API key",
      });

    let account: types.tables.Account;
    let currentGame: types.tables.Game | undefined;

    if (token) {
      // use token
      if (typeof token !== "string" || !uuid.validate(token)) {
        return sendError(res, {
          code: 400,
          description: "Invalid token",
        });
      }

      account = (await auth.getAccountFromToken(token)) as types.tables.Account;
      currentGame = undefined;

      if (!account)
        return sendError(res, {
          code: 404,
          description: "Account not found",
        });
    } else {
      // use API key
      if (typeof key !== "string" || !uuid.validate(key))
        return sendError(res, {
          code: 400,
          description: "Invalid token",
        });

      const apiKey = await auth.getApiKey(key);

      if (!apiKey)
        return sendError(res, {
          code: 404,
          description: "API key not found",
        });

      currentGame = (await game.getGame(apiKey.game_id)) as types.tables.Game;
      account = (await auth.getAccount(
        apiKey.account_id
      )) as types.tables.Account;

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
    }

    if (
      !account.is_admin &&
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

    if (needToBeValidated && !account.confirmed)
      return sendError(res, {
        code: 401,
        description: "You need to have validated your email",
      });

    // @ts-ignore
    req.game = currentGame;
    // @ts-ignore
    req.account = account;

    if (hasGame(req)) req.apiKey = key;

    next();
  });
}

export function sendError(res: express.Response, error: types.api.Error) {
  console.error("Error:", error);
  return res.status(error.code).json(error);
}

export function hasAccount<R = express.Request>(
  req: R & { account?: types.tables.Account }
): req is R & { account: types.tables.Account } {
  return "account" in req && !!req.account;
}

export function hasGame<R = express.Request>(
  req: R & { game?: types.tables.Game }
): req is R & { game: types.tables.Game; apiKey: types.tables.ApiKey["key"] } {
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

export function count(qb: any): Promise<number> {
  return qb.count({ total: "*" }).then((raw: any) => Number(raw[0].total));
}

export function applyLimits(): express.RequestHandler {
  return (req, res, next) => {
    const maxLimitPerPage = Number(process.env.API_MAX_LIMIT_PER_PAGE ?? 1000);

    if (req.query.limit && Number(req.query.limit) > maxLimitPerPage)
      return sendError(res, {
        code: 401,
        description: `Max limit of paging "limit" property is exceeded. Current max: ${maxLimitPerPage} items per page.`,
      });

    next();
  };
}

export function asyncHandler(handler: express.RequestHandler): express.Handler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function setPagingHeaders(
  req: express.Request,
  res: express.Response,
  {
    pageCount,
    perPage,
    page,
    total,
  }: {
    pageCount: number;
    total: number;
  } & types.api.PagingParameters
) {
  const currentUrl = process.env.API_BASE_URL + req.originalUrl;

  const first = new url.URL(currentUrl),
    prev = new url.URL(currentUrl),
    next = new url.URL(currentUrl),
    last = new url.URL(currentUrl);

  first.searchParams.set("page", "1");
  prev.searchParams.set("page", (page - 1).toString());
  next.searchParams.set("page", (page + 1).toString());
  last.searchParams.set("page", Math.floor(total / perPage).toString());

  const headers: types.api.PagingHeaders = {
    "X-Per-Page-Count": `${perPage}`,
    "X-Total-Count": `${total}`,
    "X-Page-Number": `${page}`,
    "X-Page-Count": `${pageCount}`,
    Link: Object.entries({ first, prev, next, last })
      .map(([rel, link]) => `${link}; rel=${rel}`)
      .join(", "),
  };

  for (const name in headers) {
    const value = headers[name as keyof types.api.PagingHeaders];
    res.setHeader(name, value);
  }
}

export function extractPagingParams(
  req: express.Request,
  total: number
): Omit<types.api.AllParameters, "sortBy" | "apiKey"> & {
  sortBy: {
    column: string;
    order: "desc" | "asc";
  };
} & { offset: number; pageCount: number } {
  const sortBy =
    (String(req.query.sortBy) as types.api.AllParameters["sortBy"]) ??
    "created_timestamp desc";
  const perPage = Math.max(
    Number(req.query.perPage ?? process.env.API_MAX_LIMIT_PER_PAGE),
    1
  );
  const pageCount = Math.ceil(total / perPage);
  const page = Math.min(Math.max(Number(req.query.page ?? 1), 1), pageCount);
  const offset = Math.max((page - 1) * perPage, 0);
  return {
    page,
    perPage,
    pageCount,
    offset,
    sortBy: {
      column: sortBy.split(" ")[0],
      order: sortBy.split(" ")[1] as "desc" | "asc",
    },
  };
}

// export function jsonRecursivelySnakeToCamelCase<Value>(
//   value: Array<Value>
// ): Array<types.utils.SnakeToCamelCaseNested<Value>>;
// export function jsonRecursivelySnakeToCamelCase<Value>(
//   value: Value
// ): types.utils.SnakeToCamelCaseNested<Value>;
// export function jsonRecursivelySnakeToCamelCase<Value>(
//   value: Array<Value> | Value
// ):
//   | Array<types.utils.SnakeToCamelCaseNested<Value>>
//   | types.utils.SnakeToCamelCaseNested<Value> {
//   if (Array.isArray(value))
//     return value.map((v) => jsonRecursivelySnakeToCamelCase(v));
//
//   return Object.fromEntries(
//     Object.entries(value).map(([key, value]) => [
//       snakeToCamelCase(key),
//       /boolean|string|number/.test(typeof value) ||
//       value === null ||
//       value === undefined
//         ? value
//         : jsonRecursivelySnakeToCamelCase(value),
//     ])
//   ) as types.utils.SnakeToCamelCaseNested<Value>;
// }

export function removeNullFields(obj: object): object {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (value !== null && value !== undefined) return value;
    })
  );
}

export function snakeToCamelCase(camel: string): string {
  return camel.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
}

export function isObject(obj: any) {
  return (
    obj === Object(obj) && !Array.isArray(obj) && typeof obj !== "function"
  );
}

export function jsonRecursivelySnakeToCamelCase<Value>(
  value: Array<Value>
): Array<types.utils.SnakeToCamelCaseNested<Value>>;
export function jsonRecursivelySnakeToCamelCase<Value>(
  value: Value
): types.utils.SnakeToCamelCaseNested<Value>;
export function jsonRecursivelySnakeToCamelCase<Value>(
  value: Array<Value> | Value
):
  | Array<types.utils.SnakeToCamelCaseNested<Value>>
  | types.utils.SnakeToCamelCaseNested<Value> {
  if (isObject(value)) {
    const n: any = {};

    Object.keys(value).forEach((k) => {
      // @ts-ignore
      n[snakeToCamelCase(k)] = jsonRecursivelySnakeToCamelCase(value[k]);
    });

    return n;
  } else if (Array.isArray(value)) {
    return value.map((i) => {
      return jsonRecursivelySnakeToCamelCase(i);
    });
  }

  return value as any;
}
