import * as app from "../app";
import * as types from "rm2-typings";

export const gameSessions = () => app.database<types.Session>("game_session");
export const events = () => app.database<types.Event>("event");

export function getGameSession(
  id: types.Session["id"]
): Promise<types.Session | undefined> {
  return gameSessions().where("id", id).first();
}

export function getGameSessions(id: string): Promise<types.Session[]> {
  return gameSessions().where("game_version_id", id);
}

export function postGameSession(session: types.Session): Promise<string> {
  // @ts-ignore
  return gameSessions()
    .insert(session)
    .returning("id")
    .then((ids) => ids[0]);
}

export function updateGameSession(
  id: string,
  values: Partial<types.Session>
): Promise<string> {
  // @ts-ignore
  return gameSessions()
    .where("id", id)
    .update(values)
    .returning("id")
    .then((ids) => ids[0]);
}

export function getEvents(id: string): Promise<types.Event[]> {
  return events().where("session_id", id);
}

export function getEvent(id: number): Promise<types.Event | undefined> {
  return events().where("id", id).first();
}

export function postEvent(event: types.Event): Promise<string> {
  // @ts-ignore
  return events()
    .insert(event)
    .returning("id")
    .then((ids) => ids[0]);
}
