import * as app from "../app";
import * as types from "../types";

export const games = app.database<types.Game>("game");
export const versions = app.database<types.GameVersion>("game_version");

export function getGame(id: number): Promise<types.Game | undefined> {
  return games.where("_id", id).first();
}

export function getGameVersions(id: number): Promise<types.GameVersion[]> {
  return versions.where("game_id", id);
}
