import * as app from "../app";
import * as types from "../types";

export const games = () => app.database<types.Game>("game");
export const versions = () => app.database<types.GameVersion>("game_version");

export function getGames(): Promise<types.Game[]> {
  return games().select();
}

export function getGame(id: string): Promise<types.Game | undefined> {
  return games()
    .where("id", id)
    .then((games) => games[0]);
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
  id: string
): Promise<types.GameVersion | undefined> {
  return versions()
    .where("id", id)
    .then((results) => results[0]);
}

export function postGameVersion(
  gameVersion: types.GameVersion
): Promise<string> {
  return versions()
    .insert(gameVersion)
    .returning("id")
    .then((results) => results[0] as string);
}

export function getGameVersions(id: string): Promise<types.GameVersion[]> {
  return versions().where("game_id", id);
}

export function updateGameVersion(
  id: string,
  values: Partial<types.GameVersion>
): Promise<string> {
  return versions().where("id", id).update(values).returning("id");
}
