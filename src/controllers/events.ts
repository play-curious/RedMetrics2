import * as app from "../app";
import * as types from "../types";

export const session = app.database<types.Session>("session");
export const events = app.database<types.RMEvent>("event");

export function getSession(
  id: string | number
): Promise<types.Session | undefined> {
  return session.where(app.keyId(id), id).first();
}

export function getSessionEvents(id: number): Promise<types.RMEvent[]> {
  return events.where("session_id", id);
}

export function getEvent(id: number): Promise<types.RMEvent | undefined> {
  return events.where("_id", id).first();
}

export function postEvent(event: types.RMEvent) {
  return events.insert(event);
}
