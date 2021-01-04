import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import relative from "dayjs/plugin/relativeTime";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import dayjs from "dayjs";
import chalk from "chalk";
import knex from "knex";
import path from "path";
import fs from "fs";
import pg from "pg";

dayjs.extend(relative);

// Global

dotenv.config();

// Database

export const database = knex({
  client: "pg",
  pool: {
    min: +(process.env.PG_MIN_POOL ?? 2),
    max: +(process.env.PG_MAX_POOL ?? 10),
  },
  connection: {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: +(process.env.PGPORT ?? 9090),
  },
});

// Express

export const server = express();
export const v2 = express.Router();
export const view = express.Router();

server.use(bodyParser.urlencoded({ extended: false }), bodyParser.json());

server.use("/api/v2/rest", v2);
server.use("/api/v2/view", view);

// View Engine

server.use("/public", express.static("public"));

server.locals.site = {
  name: "RedMetrics",
  deployedAt: Date.now(),
  deployedSince() {
    return dayjs(this.deployedAt).fromNow();
  },
};

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "..", "views"));

// GraphQL

const rootValue = require("../graphql/resolvers");
const schema = fs.readFileSync(
  path.join(__dirname, "../graphql/schema.graphql"),
  {
    encoding: "utf-8",
  }
);

server.use(
  "/api/v2/graphql",
  graphqlHTTP({
    schema: buildSchema(schema),
    rootValue,
    graphiql: true,
  })
);

// Load routes

import * as utils from "./utils";

export const loadRoutes = (verbose: boolean) =>
  utils
    .forFiles(
      path.join(__dirname, "api"),
      (filepath) => {
        require(filepath);
        if (verbose) console.log(chalk.blue("loaded"), filepath);
      },
      {
        recursive: true,
        filters: {
          filename: /\.js$/i,
        },
      }
    )
    .then(() => {
      if (verbose) console.log(chalk.green("ready"));
    });
