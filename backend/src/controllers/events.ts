import * as app from "../app";
import * as types from "../types";

export const gameSessions = () =>
  app.database<types.GameSession>("game_session");
export const events = () => app.database<types.RMEvent>("event");

export function getGameSession(
  id: string
): Promise<types.GameSession | undefined> {
  return gameSessions().where("id", id).first();
}

export function getGameSessions(id: string): Promise<types.GameSession[]> {
  return gameSessions().where("game_version_id", id);
}

export function postGameSession(session: types.GameSession): Promise<string> {
  // @ts-ignore
  return gameSessions()
    .insert(session)
    .returning("id")
    .then((ids) => ids[0]);
}

export function updateGameSession(
  id: string,
  values: Partial<types.GameSession>
): Promise<string> {
  // @ts-ignore
  return gameSessions()
    .where("id", id)
    .update(values)
    .returning("id")
    .then((ids) => ids[0]);
}

export function getEvents(id: string): Promise<types.RMEvent[]> {
  return events().where("session_id", id);
}

export function getEvent(id: number): Promise<types.RMEvent | undefined> {
  return events().where("id", id).first();
}

export function postEvent(event: types.RMEvent): Promise<string> {
  // @ts-ignore
  return events()
    .insert(event)
    .returning("id")
    .then((ids) => ids[0]);
}
