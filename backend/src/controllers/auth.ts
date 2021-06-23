import * as app from "../app";
import * as types from "rm2-typings";

export const accounts = () => app.database<types.Account>("account");
export const apiKeys = () => app.database<types.ApiKey>("session");

export function getAccount(id: string): Promise<types.Account | undefined> {
  return accounts().where("id", id).first();
}

export async function deleteAccount(id: types.Account["id"]): Promise<void> {
  await accounts().where({ id }).delete();
}

export function getAccountByEmail(
  email: types.Email
): Promise<types.Account | undefined> {
  return accounts().where("email", email).first();
}

export function getAccountFromToken(
  token: types.Account["connection_token"]
): Promise<types.Account | undefined> {
  return accounts().where("connection_token", token).first();
}

export function emailAlreadyUsed(email: types.Email): Promise<boolean> {
  return accounts()
    .where({ email })
    .first()
    .then((account) => !!account);
}

export function postAccount(
  account: Omit<types.Account, "id">
): Promise<string> {
  return accounts()
    .insert(account)
    .returning("id")
    .then((ids) => ids[0]);
}

export function getApiKey(
  fingerprint: types.ApiKey["fingerprint"]
): Promise<types.ApiKey | undefined> {
  return apiKeys().where({ fingerprint }).first();
}

export function getUserApiKeys(
  account_id: types.Account["id"]
): Promise<types.ApiKey[]> {
  return apiKeys().where({ account_id });
}

export async function removeSession(
  fingerprint: types.ApiKey["fingerprint"]
): Promise<void> {
  await apiKeys().where({ fingerprint }).delete();
}

export async function updateAccount(
  id: types.Account["id"],
  account: Partial<types.Account>
): Promise<void> {
  await accounts().update(account).where({ id }).returning("id");
}

export function countAccounts(): Promise<number> {
  return accounts().count();
}

export function getAccounts(): Promise<types.Account[]> {
  return accounts().select("*");
}
