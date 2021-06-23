import * as app from "../app";
import * as events from "./events";
import * as types from "rm2-typings";

export const games = () => app.database<types.Game>("game");
export const versions = () => app.database<types.Version>("game_version");

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

export function postGame(game: types.Game): Promise<string> {
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

export function getGameVersion(
  id: types.Version["id"]
): Promise<types.Version | undefined> {
  if (!id) return Promise.resolve(undefined);
  return versions()
    .where("id", id)
    .then((results) => results[0]);
}

export function postGameVersion(gameVersion: types.Version): Promise<string> {
  return versions()
    .insert(gameVersion)
    .returning("id")
    .then((results) => results[0] as string);
}

export function getGameVersions(id: types.Id): Promise<types.Version[]> {
  return versions().where("game_id", id);
}

export function updateGameVersion(
  id: string,
  values: Partial<types.Version>
): Promise<string> {
  return versions().where("id", id).update(values).returning("id");
}

export async function gameHasVersion(
  game_id: types.Game["id"],
  version_id: types.Version["id"]
) {
  const game = await getGame(game_id);
  const version = await getGameVersion(version_id);

  if (!game || !version) return false;

  return version.game_id === game.id;
}

export async function gameHasSession(
  game_id: types.Game["id"],
  session_id: types.Session["id"]
) {
  const session = await events.getGameSession(session_id);

  return gameHasVersion(game_id, session?.version_id);
}
