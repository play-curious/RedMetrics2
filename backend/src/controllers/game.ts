import * as app from "../app";
import * as types from "rm2-typings";

export const games = () => app.database<types.RawGame>("game");
export const versions = () =>
  app.database<types.RawGameVersion>("game_version");

export function getGames(): Promise<types.RawGame[]> {
  return games().select();
}

export function getPublisherGames(
  publisher_id: types.Id
): Promise<types.RawGame[]> {
  return games().where("publisher_id", publisher_id).select();
}

export function getGame(id: types.Id): Promise<types.RawGame | undefined> {
  if (!id) return Promise.resolve(undefined);
  return games()
    .where("id", id)
    .then((games) => games[0]);
}

export function postGame(game: types.RawGame): Promise<string> {
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
  values: Partial<types.RawGame>
): Promise<string> {
  return games().where("id", id).update(values).returning("id");
}

export function getGameVersion(
  id: string
): Promise<types.RawGameVersion | undefined> {
  if (!id) return Promise.resolve(undefined);
  return versions()
    .where("id", id)
    .then((results) => results[0]);
}

export function postGameVersion(
  gameVersion: types.RawGameVersion
): Promise<string> {
  return versions()
    .insert(gameVersion)
    .returning("id")
    .then((results) => results[0] as string);
}

export function getGameVersions(id: types.Id): Promise<types.RawGameVersion[]> {
  return versions().where("game_id", id);
}

export function updateGameVersion(
  id: string,
  values: Partial<types.RawGameVersion>
): Promise<string> {
  return versions().where("id", id).update(values).returning("id");
}
