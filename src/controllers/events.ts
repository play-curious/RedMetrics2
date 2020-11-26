import * as app from "../app";
import * as types from "../types";

export const sessions = app.database<types.Session>("session");
export const events = app.database<types.RMEvent>("event");

export function getSession(id: string): Promise<types.Session | undefined> {
  return sessions.where("id", id).first();
}

export function getSessionEvents(id: string): Promise<types.RMEvent[]> {
  return events.where("session_id", id);
}

export function postSession(session: types.Session): Promise<string> {
  return sessions.insert(session).returning("id");
}

export function updateSession(
  id: string,
  values: Partial<types.Session>
): Promise<string> {
  return sessions.where("id", id).update(values);
}

export function getEvent(id: number): Promise<types.RMEvent | undefined> {
  return events.where("id", id).first();
}

export function postEvent(event: types.RMEvent): Promise<string> {
  return events.insert(event).returning("id");
}
