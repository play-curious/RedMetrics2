import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import pg from "pg";

// Global

dotenv.config();

// Express

export const server = express();
export const v2 = express.Router();

server.listen(process.env.RMPORT ?? 6627);

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

// PostgreSQL

// export const database = new pg.Client();
// export const connected = database.connect();
