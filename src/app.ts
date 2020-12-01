import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import relative from "dayjs/plugin/relativeTime";
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
    min: +(process.env.PG_MIN_POOL ?? 0),
    max: +(process.env.PG_MAX_POOL ?? 10),
  },
  connection: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: +(process.env.PG_PORT ?? 6627),
  },
});

// Express

export const server = express();
export const v2 = express.Router();

server.use("/api/v2/rest", v2);

// View Engine

server.locals.site = {
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

utils
  .forFiles(
    path.join(__dirname, "api"),
    (filepath) => {
      require(filepath);
      console.log(chalk.blue("loaded"), filepath);
    },
    {
      recursive: true,
      filters: {
        filename: /\.js$/i,
      },
    }
  )
  .then(() => console.log(chalk.green("ready")))
  .catch(console.error);
