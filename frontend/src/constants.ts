import env from "react-dotenv";

export const API_BASE_URL = `${env.API_URL}/v2/`;
export const SESSION_DURATION = 1000 * 60 * 60 * 24 * 7;
