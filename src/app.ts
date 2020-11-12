import express from "express";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

// Express

export const server = express();
export const v2 = express.Router();

server.use("/api/rest/v2", v2);

server.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: err.message,
    });
  }
);

server.listen(process.env.RMPORT ?? 6627);

// PostgreSQL

// export const database = new pg.Client();
// export const connected = database.connect();
