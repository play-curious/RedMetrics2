import * as app from "../app";
import * as types from "../types";

export const session = app.database<types.Session>("session");
export const events = app.database<types.RMEvent>("event");

export function getSession(id: string): Promise<types.Session | undefined> {
  return session.where("id", id).first();
}

export function getSessionEvents(id: string): Promise<types.RMEvent[]> {
  return events.where("session_id", id);
}

export function getEvent(id: number): Promise<types.RMEvent | undefined> {
  return events.where("id", id).first();
}

export function postEvent(event: types.RMEvent) {
  return events.insert(event);
}
