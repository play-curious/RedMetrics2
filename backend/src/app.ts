import relative from "dayjs/plugin/relativeTime.js";
import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import dayjs from "dayjs";
import cors from "cors";
import knex from "knex";
import path from "path";
import cron from "cron";
import pg from "pg";
import fs from "fs";

import * as utils from "./utils";
import * as types from "rm2-typings";

dayjs.extend(relative);

// Global

{
  const templateConfigPath = path.join(process.cwd(), "..", ".env.template");
  const templateConfigFile = fs.readFileSync(templateConfigPath, "utf-8");
  const templateConfig = dotenv.parse(templateConfigFile);

  dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

  const missing: string[] = [];

  for (const key in templateConfig) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    console.table(missing);
    throw new (class ConfigError extends Error {})(
      `Missing ${missing.length} properties in dotenv file.`
    );
  }
}

// Database

export const database = knex({
  client: "pg",
  pool: {
    min: +(process.env.PG_MIN_POOL ?? 2),
    max: +(process.env.PG_MAX_POOL ?? 10),
  },
  connection: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: +(process.env.PG_PORT ?? 9090),
  },
});

// Express

export const server = express();

// Set the default JSON formatting to pretty-print
server.set("json spaces", 2);

server.use(
  (req, res, next) => {
    res.header("Access-Control-Expose-Headers", "Etag");
    next();
  },
  express.urlencoded({ extended: true }),
  express.json(),
  cookieParser(),
  // Allow any site to access
  cors({
    credentials: true,
    origin: true,
    exposedHeaders: [
      "Set-Cookie",
      "X-Per-Page-Count",
      "X-Total-Count",
      "X-Page-Count",
      "X-Page-Number",
      "Link",
    ],
  }),
  utils.applyLimits()
);

export const v2 = express.Router();
server.use("/v2", v2);

// Load routes

export const loadRoutes = (verbose: boolean) =>
  utils
    .forFiles(
      path.join(__dirname, "api"),
      (filepath) => {
        return import(filepath).then(() => {
          if (verbose) console.log("loaded", filepath);
        });
      },
      {
        recursive: true,
        filters: {
          filename: /\.js$/i,
        },
      }
    )
    .then(() => {
      if (verbose) console.log("ready");
    });

// remove accounts that have not confirmed emails before 1 week
cron.job("0 0 * * *", () => {
  database.raw(`
    delete from account
    where
        not confirmed and
        now() > to_timestamp(
            to_number(
                created_timestamp,
                '9999999999999999'
            ) / 1000
        ) + '7 days'::interval
  `);

  database.raw(`
    update session set closed = 1
    where
        not closed and
        now() > to_timestamp(
            to_number(
                updated_timestamp,
                '9999999999999999'
            ) / 1000
        ) + '1 hour'::interval
  `);
});
