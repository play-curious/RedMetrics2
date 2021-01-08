import * as app from "../app";
import * as types from "../types";

export const sessions = () => app.database<types.GameSession>("game_session");
export const events = () => app.database<types.RMEvent>("event");

export function getSession(id: string): Promise<types.GameSession | undefined> {
  return sessions().where("id", id).first();
}

export function getSessionEvents(id: string): Promise<types.RMEvent[]> {
  return events().where("session_id", id);
}

export function postSession(session: types.GameSession): Promise<string> {
  return sessions().insert(session).returning("id");
}

export function updateSession(
  id: string,
  values: Partial<types.GameSession>
): Promise<string> {
  return sessions().where("id", id).update(values).returning("id");
}

export function getEvent(id: number): Promise<types.RMEvent | undefined> {
  return events().where("id", id).first();
}

export function postEvent(event: types.RMEvent): Promise<string> {
  return events().insert(event).returning("id");
}
