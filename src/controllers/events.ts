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

export function postGameSession(session: types.GameSession): Promise<string> {
  return gameSessions().insert(session).returning("id");
}

export function updateGameSession(
  id: string,
  values: Partial<types.GameSession>
): Promise<string> {
  return gameSessions().where("id", id).update(values).returning("id");
}

export function getEvents(id: string): Promise<types.RMEvent[]> {
  return events().where("session_id", id);
}

export function getEvent(id: number): Promise<types.RMEvent | undefined> {
  return events().where("id", id).first();
}

export function getEventCount(id: string): Promise<number> {
  return events().where("game_id", id).count();
}

export function postEvent(event: types.RMEvent): Promise<string> {
  return events().insert(event).returning("id");
}
