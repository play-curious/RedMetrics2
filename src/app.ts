import express from "express";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

export const server = express();
export const database = new pg.Client();
export const connected = database.connect();
