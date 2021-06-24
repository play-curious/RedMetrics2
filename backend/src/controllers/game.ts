import * as app from "../app";
import * as events from "./events";
import * as types from "rm2-typings";

export const games = () => app.database<types.Game>("game");

export function getGames(): Promise<types.Game[]> {
  return games().select();
}

export function getPublisherGames(
  publisher_id: types.Id
): Promise<types.Game[]> {
  return games().where("publisher_id", publisher_id).select();
}

export function getGame(id: types.Game["id"]): Promise<types.Game | undefined> {
  if (!id) return Promise.resolve(undefined);
  return games().where("id", id).first();
}

export function postGame(game: Omit<types.Game, "id">): Promise<string> {
  return games()
    .insert(game)
    .returning("id")
    .then((results) => results[0] as string);
}

export async function removeGame(id: types.Id): Promise<void> {
  await games().where("id", id).delete();
}

export function updateGame(
  id: string,
  values: Partial<types.Game>
): Promise<string> {
  return games().where("id", id).update(values).returning("id");
}

export async function gameHasSession(
  game_id: types.Game["id"],
  session_id: types.Session["id"] | types.Session
) {
  const session =
    typeof session_id === "string"
      ? await events.getGameSession(session_id)
      : session_id;

  if (!session) return false;

  return game_id === session.game_id;
}
