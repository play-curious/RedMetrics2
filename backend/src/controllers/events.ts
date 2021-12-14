import * as app from "../app";
import * as utils from "../utils";
import * as types from "rm2-typings";

export const sessions = () => app.database<types.tables.Session>("session");
export const events = () => app.database<types.tables.Event>("event");

export function getSession(
  id: types.tables.Session["id"]
): Promise<types.tables.Session | undefined> {
  return sessions().where("id", id).first();
}

export function getGameSessions(
  id: types.tables.Game["id"],
  offset: number,
  limit: number
): Promise<types.tables.Session[]> {
  return sessions().where("game_id", id).offset(offset).limit(limit);
}

export function getGameSessionCount(
  id: types.tables.Game["id"]
): Promise<number> {
  return utils.count(sessions().where("game_id", id));
}

export function getAllGameSessions(
  id: types.tables.Game["id"]
): Promise<types.tables.Session[]> {
  return sessions().where("game_id", id);
}

export function postGameSession(
  session: types.utils.Insert<types.tables.Session>
): Promise<string> {
  return sessions()
    .insert(session)
    .returning("id")
    .then((ids) => ids[0]);
}

export function updateGameSession(
  id: types.tables.Session["id"],
  values: types.utils.Update<types.tables.Session>
): Promise<string> {
  return sessions()
    .where("id", id)
    .update(values)
    .returning("id")
    .then((ids) => ids[0]);
}

export function getSessionEvents(
  id: types.tables.Session["id"],
  offset: number,
  limit: number
): Promise<types.tables.Event[]> {
  return events().where("session_id", id).offset(offset).limit(limit);
}

export function getAllSessionEvents(
  id: types.tables.Session["id"]
): Promise<types.tables.Event[]> {
  return events().where("session_id", id);
}

export function getSessionEventCount(
  id: types.tables.Session["id"]
): Promise<number> {
  return utils.count(events().where("session_id", id));
}

export function getEvent(
  id: types.tables.Event["id"]
): Promise<types.tables.Event | undefined> {
  return events().where("id", id).first();
}

export async function postEvent(
  event:
    | types.utils.Insert<types.tables.Event>
    | types.utils.Insert<types.tables.Event>[]
): Promise<void> {
  await events().insert(event);
}
