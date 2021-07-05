import env from "react-dotenv";

export const API_BASE_URL = `${env.API_URL ?? "http://localhost:6627"}/v2/`;
export const COOKIE_NAME = "rm2-login-cookie";
