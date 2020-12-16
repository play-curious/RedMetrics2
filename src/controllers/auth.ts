import * as app from "../app";
import * as types from "../types";

export const accounts = app.database<types.Account>("account");

export function getAccount(id: string): Promise<types.Account | undefined> {
  return accounts.where("id", id).first();
}

export function getAccountByEmail(
  email: types.Email
): Promise<types.Account | undefined> {
  return accounts.where("email", email).then((account) => account[0]);
}

export function emailAlreadyUsed(email: types.Email): Promise<boolean> {
  return accounts
    .where("email", email)
    .count("email", { as: "count" })
    .then((results) => {
      console.log(results);
      return results[0];
    })
    .then((total) => (total?.count ?? 0) > 0);
}

export function postAccount(account: types.Account): Promise<string[]> {
  return accounts.insert(account).returning("id");
}

export function updateAccount(
  id: string,
  account: Partial<types.Account>
): Promise<string[]> {
  return accounts.update(account).where("id", id).returning("id");
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
  return games.map((game) => game.id as string);
}
