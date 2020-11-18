import * as app from "../app";
import * as types from "../types";

export const accounts = app.database<types.Account>("account");

export function getAccount(
  id: string | number
): Promise<types.Account | undefined> {
  return accounts.where(app.keyId(id), id).first();
}

export function postAccount(account: types.Account) {
  return accounts.insert(account);
}

export function updateAccount(
  id: string | number,
  account: Partial<types.Account>
) {
  return accounts.where(app.keyId(id), id).update(account);
}

export function countAccounts(): Promise<number> {
  return accounts.count();
}
