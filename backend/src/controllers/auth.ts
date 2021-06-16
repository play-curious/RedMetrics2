import * as app from "../app";
import * as types from "rm2-typings";
import * as constants from "../constants";

export const accounts = () => app.database<types.Account>("account");
export const apiKeys = () => app.database<types.RawApiKey>("session");

export function getAccount(id: string): Promise<types.Account | undefined> {
  return accounts().where("id", id).first();
}

export async function deleteAccount(id: string): Promise<void> {
  await accounts().where("id", id).delete();
}

export function getAccountByEmail(
  email: types.Email
): Promise<types.Account | undefined> {
  return accounts()
    .where("email", email)
    .then((account) => account[0]);
}

export function emailAlreadyUsed(email: types.Email): Promise<boolean> {
  return accounts()
    .count("email", { as: "c" })
    .where("email", email)
    .then((r) => r[0])
    .then(({ c }) => (c ?? 0) > 0);
}

export function postAccount(account: types.Account): Promise<string[]> {
  return accounts().insert(account).returning("id");
}

export async function getSession(
  apikey: types.Id
): Promise<types.RawApiKey | undefined> {
  return apiKeys().where("api_key", apikey).first();
}

export async function getUserSession(
  account_id: types.Id
): Promise<types.RawApiKey | undefined> {
  return apiKeys()
    .where("account_id", account_id)
    .and.where("is_connection_key", true)
    .first();
}

export async function getUserSessions(
  account_id: types.Id
): Promise<types.RawApiKey[]> {
  return apiKeys().where("account_id", account_id).select("*");
}

export async function refreshSession(apikey: types.Id): Promise<void> {
  await apiKeys().where("api_key", apikey).update("start_at", new Date());
}

export async function postSession(session: types.RawApiKey): Promise<void> {
  await apiKeys().insert(session);
}

export async function purgeSessions(): Promise<void> {
  await apiKeys()
    .where("start_at", "<", new Date(Date.now() - constants.SESSION_DURATION))
    .and.where("type", "connexion")
    .delete();
}

export async function removeSession(apiKey: types.Id): Promise<void> {
  await apiKeys().where("api_key", apiKey).delete();
}

export function updateAccount(
  id: string,
  account: Partial<types.Account>
): Promise<string[]> {
  return accounts().update(account).where("id", id).returning("id");
}

export function countAccounts(): Promise<number> {
  return accounts().count();
}

export function getAccounts(): Promise<types.Account[]> {
  return accounts().select("*");
}

export async function getAccountGames(id: types.Id): Promise<string[]> {
  const games: types.Game[] = await app.database
    .select("game.id")
    .from("account")
    .leftJoin("game_account", "game_account.account_id", "account.id")
    .leftJoin("game", "game_account.game_id", "game.id")
    .where("account.id", id)
    .groupBy("game.id");
  return games.map((game) => game.id as string);
}
