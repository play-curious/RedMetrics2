import * as app from "../app";
import * as events from "./events";
import * as types from "rm2-typings";

export const games = () => app.database<types.tables.Game>("game");
export const apiKeys = () => app.database<types.tables.ApiKey>("api_key");

export function getGames(): Promise<types.tables.Game[]> {
  return games().select();
}

export function getPublisherGames(
  publisher_id: types.tables.Account["id"]
): Promise<types.tables.Game[]> {
  return games().where("publisher_id", publisher_id).select();
}

export function getGame(
  id: types.tables.Game["id"]
): Promise<types.tables.Game | undefined> {
  if (!id) return Promise.resolve(undefined);
  return games().where("id", id).first();
}

export function getGameKeys(
  id: types.tables.Game["id"]
): Promise<types.tables.ApiKey[]> {
  if (!id) return Promise.resolve([]);
  return apiKeys().where("game_id", id);
}

export function postGame(
  game: types.utils.Insert<types.tables.Game>
): Promise<types.tables.Game["id"]> {
  return games()
    .insert(game)
    .returning("id")
    .then((results) => results[0]);
}

export async function removeGame(id: types.tables.Game["id"]): Promise<void> {
  await games().where("id", id).delete();
}

export function updateGame(
  id: types.tables.Game["id"],
  values: types.utils.Update<types.tables.Game>
): Promise<string> {
  return games()
    .where("id", id)
    .update(values)
    .returning("id")
    .then((values) => values[0]);
}

export async function gameHasSession(
  game_id: types.tables.Game["id"],
  session_id: types.tables.Session["id"] | types.tables.Session
) {
  const session =
    typeof session_id === "string"
      ? await events.getSession(session_id)
      : session_id;

  if (!session) return false;

  return game_id === session.game_id;
}
