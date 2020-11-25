import * as app from "../app";
import * as types from "../types";

export const accounts = app.database<types.Account>("account");

export function getAccount(id: string): Promise<types.Account | undefined> {
  return accounts.where("id", id).first();
}

export function getAccountByEmail(
  email: types.Email
): Promise<types.Account | undefined> {
  return accounts.where("email", email).first();
}

export function postAccount(account: types.Account): Promise<string> {
  return accounts.insert(account).returning("id");
}

export function updateAccount(id: string, account: Partial<types.Account>) {
  return accounts.where("id", id).update(account);
}

export function countAccounts(): Promise<number> {
  return accounts.count();
}

export async function getAccountGames(id: string): Promise<string[]> {
  const games: types.Game[] = await app.database
    .select("game.id")
    .from("account")
    .leftJoin("game_account", "game_account.account_id", "account.id")
    .leftJoin("game", "game_account.game_id", "game.id")
    .where("account.id", id)
    .groupBy("game.id");
  return games.map((game) => game.id);
}
