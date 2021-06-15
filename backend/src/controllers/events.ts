import * as app from "../app";
import * as types from "rm2-typings";

export const gameSessions = () =>
  app.database<types.RawSession>("game_session");
export const events = () => app.database<types.RawRMEvent>("event");

export function getGameSession(
  id: string
): Promise<types.RawSession | undefined> {
  return gameSessions().where("id", id).first();
}

export function getGameSessions(id: string): Promise<types.RawSession[]> {
  return gameSessions().where("game_version_id", id);
}

export function postGameSession(session: types.RawSession): Promise<string> {
  // @ts-ignore
  return gameSessions()
    .insert(session)
    .returning("id")
    .then((ids) => ids[0]);
}

export function updateGameSession(
  id: string,
  values: Partial<types.RawSession>
): Promise<string> {
  // @ts-ignore
  return gameSessions()
    .where("id", id)
    .update(values)
    .returning("id")
    .then((ids) => ids[0]);
}

export function getEvents(id: string): Promise<types.RawRMEvent[]> {
  return events().where("session_id", id);
}

export function getEvent(id: number): Promise<types.RawRMEvent | undefined> {
  return events().where("id", id).first();
}

export function postEvent(event: types.RawRMEvent): Promise<string> {
  // @ts-ignore
  return events()
    .insert(event)
    .returning("id")
    .then((ids) => ids[0]);
}
