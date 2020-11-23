import * as app from "../app";
import * as types from "../types";

export const games = app.database<types.Game>("game");
export const versions = app.database<types.GameVersion>("game_version");

export function getGames(): Promise<types.Game[]> {
  return games.select();
}

export function getGame(id: string): Promise<types.Game | undefined> {
  return games.where("id", id).first();
}

export function getGameVersion(id: string): Promise<types.GameVersion[]> {
  return versions.where("id", id);
}

export function getGameVersions(id: string): Promise<types.GameVersion[]> {
  return versions.where("game_id", id);
}
