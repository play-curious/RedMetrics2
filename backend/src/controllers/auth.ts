import * as app from "../app";
import * as utils from "../utils";
import * as types from "rm2-typings";

export const confirmations = () =>
  app.database<types.tables.Confirmation>("confirmation");
export const accounts = () => app.database<types.tables.Account>("account");
export const apiKeys = () => app.database<types.tables.ApiKey>("api_key");

export async function logout(id: types.tables.Account["id"]): Promise<void> {
  await accounts().where({ id }).update({
    connection_token: "",
  });
}

export function getAccount(
  id: types.tables.Account["id"]
): Promise<types.tables.Account | undefined> {
  return accounts().where("id", id).first();
}

export async function deleteAccount(
  id: types.tables.Account["id"]
): Promise<void> {
  await accounts().where({ id }).delete();
}

export function getAccountByEmail(
  email: types.Email
): Promise<types.tables.Account | undefined> {
  return accounts().where("email", email).first();
}

export function getAccountFromToken(
  token: types.tables.Account["connection_token"]
): Promise<types.tables.Account | undefined> {
  return accounts().where("connection_token", token).first();
}

export function emailAlreadyUsed(
  email: types.tables.Account["email"]
): Promise<boolean> {
  return accounts()
    .where({ email })
    .first()
    .then((account) => !!account);
}

export function postAccount(
  account: types.utils.Insert<types.tables.Account>
): Promise<string> {
  return accounts()
    .insert(account)
    .returning("id")
    .then((ids) => ids[0]);
}

export function getApiKey(
  key: types.tables.ApiKey["key"]
): Promise<types.tables.ApiKey | undefined> {
  return apiKeys().where({ key }).first();
}

export function getUserApiKeys(account_id: types.tables.Account["id"]) {
  return apiKeys().where({ account_id });
}

export function getAllApiKeys() {
  return apiKeys();
}

export function removeUserApiKeys(account_id: types.tables.Account["id"]) {
  return getUserApiKeys(account_id).delete();
}

export async function removeApiKey(
  key: types.tables.ApiKey["key"]
): Promise<void> {
  await apiKeys().where({ key }).delete();
}

export async function updateAccount(
  id: types.tables.Account["id"],
  account: types.utils.Update<types.tables.Account>
): Promise<void> {
  await accounts().update(account).where({ id }).returning("id");
}

export function getAccounts(
  offset: number,
  limit: number,
  sortBy: { column: keyof types.tables.Account; order: "asc" | "desc" }
): Promise<types.tables.Account[]> {
  return accounts()
    .select("*")
    .offset(offset)
    .limit(limit)
    .orderBy(sortBy?.column ?? "created_timestamp", sortBy?.order ?? "desc");
}

export function getAccountCount(): Promise<number> {
  return utils.count(accounts());
}
