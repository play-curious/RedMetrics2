import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import express from "express";
import dotenv from "dotenv";
import knex from "knex";
import path from "path";
import fs from "fs";
import pg from "pg";

// Global

dotenv.config();

// Database

export const database = knex({
  client: "pg",
  pool: {
    min: Number(process.env.PG_MIN_POOL),
    max: Number(process.env.PG_MAX_POOL),
  },
  connection: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: Number(process.env.PG_PORT),
  },
});

export function keyId(id: string | number): "id" | "_id" {
  return typeof id === "string" ? "id" : "_id";
}

// Express

export const server = express();
export const v2 = express.Router();

server.listen(process.env.SERVER_PORT ?? 6627);

server.use("/api/v2/rest", v2);

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
