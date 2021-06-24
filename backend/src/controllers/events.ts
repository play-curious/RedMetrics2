import * as app from "../app";
import * as types from "rm2-typings";

export const sessions = () => app.database<types.Session>("session");
export const events = () => app.database<types.Event>("event");

export function getGameSession(
  id: types.Session["id"]
): Promise<types.Session | undefined> {
  return sessions().where("id", id).first();
}

export function getGameSessions(id: string): Promise<types.Session[]> {
  return sessions().where("game_version_id", id);
}

export function postGameSession(
  session: Omit<types.Session, "id">
): Promise<string> {
  return sessions()
    .insert(session)
    .returning("id")
    .then((ids) => ids[0]);
}

export function updateGameSession(
  id: string,
  values: Partial<types.Session>
): Promise<string> {
  return sessions()
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

export function postEvent(event: Omit<types.Event, "id">): Promise<number> {
  return events()
    .insert(event)
    .returning("id")
    .then((ids) => ids[0]);
}
