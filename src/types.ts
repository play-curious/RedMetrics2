/**
 * Containing date and time, following the ISO 8601 Extended format. <br>
 * It looks like 2015-01-27T09:44:32.418Z. <br>
 * All times are in UTC, and include milliseconds.
 */
export type RMDate = string;

export type Role = "admin" | "dev" | "user";

/**
 * String containing a server-generated unique identifier.
 */
export type Id = string;

export interface Account extends User {
  id?: Id;
  password: Hash;
  games?: Id[];
}

export interface Session {
  start_at: RMDate;
  api_key: Id;
  account_id: Id;
  type: "game" | "connexion" | "analytic";
}

export interface SessionUser extends User, Session {
  roleRank: number;
}

/**
 * A game  Since RedMetrics data is open, <br>
 * is is vital that no personally identifiable information is stored about a player.
 * @property software - String that can be user agent on browsers.
 * @property externalId - String that can be set by developers in order to link the player with another database. This must not be a personally identifiable marker such as an email address.
 */
export interface GameSession {
  id?: Id;
  game_version_id: Id;
  platform?: string;
  screen_size?: string;
  software?: string;
  external_id?: string;
  custom_data?: CustomData;
}

/**
 * @property author - Containing the name of the person or organization who created the game
 */
export interface Game {
  id?: Id;
  publisher_id: Id;
  name: string;
  author?: string;
  description?: string;
  custom_data?: CustomData;
}

export interface GameVersion {
  id?: Id;
  game_id: Id;
  name: string;
  description?: string;
  custom_data?: CustomData;
}

/**
 * naming the type of progress event that occurred.
 */
export type EventType = StandardEventType | string;

/**
 * "start" created by default. <br>
 * "end" close the session.
 */
export type StandardEventType =
  | "start"
  | "end"
  | "win"
  | "fail"
  | "restart"
  | "gain"
  | "lose";

/**
 * Array of 2 or 3 integers describing where the event occurred in "game space".
 */
export type Coordinate = [number, number] | [number, number, number];

/**
 * what "level" the player was in when the event occured. <br>
 * Adding more elements separated by points specifiy the section within a hierarchy. <br>
 * For example, “level1.section2.subsection3”
 */
export type Section = string;

/**
 * JSON data associated with the session. <br>
 * This must not contain personally identifiable markers such as name or exact address.
 */
export type CustomData = object;

/**
 * @property custom_data - JSON For "gain" and “lose” events, specifies the number of things are gained or lost.
 */
export interface RMEvent {
  id?: number;
  session_id: Id;
  type: EventType;
  server_time: RMDate;
  user_time?: RMDate;
  custom_data?: CustomData;
  section?: Section;
  coordinates?: Coordinate;
}

export interface RMError {
  code: number;
  description: string;
}

/**
 * @property apiVersion - the numeric version, containing major and minor parts (such as 3.21)
 * @property build - the build of the software
 * @property startedAt - Date that the server was last started
 */
export interface Status {
  api_version: number;
  build: string;
  started_at: RMDate;
}

export interface Login {
  email: Email;
  password: Password;
}

export interface User extends Login {
  role: Role;
}

/**
 * String validated by email regex
 */
export type Email = string;
export type Hash = Password;
export type Password = string;

export function isHash(str: string): str is Hash {
  return str.length === 60;
}

export function isValidEmail(email: any): email is Email {
  return (
    typeof email === "string" &&
    !/\s/.test(email) &&
    email.includes("@") &&
    email.includes(".")
  );
}
