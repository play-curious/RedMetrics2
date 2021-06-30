import * as base from "./base"

export interface Account {
  id: base.Id
  email: base.Email
  password: base.Password
  connection_token?: string
  is_admin: boolean
}

export interface ApiKey {
  name: string
  start_at: base.Date
  key: base.Id
  account_id: Account["id"]
  game_id: Game["id"]
}

/**
 * A game  Since RedMetrics data is open, <br>
 * is is vital that no personally identifiable information is stored about a player.
 * @property software - String that can be user agent on browsers.
 * @property external_id - String that can be set by developers in order to link the player with another database. This must not be a personally identifiable marker such as an email address.
 */
export interface Session {
  id: base.Id
  game_id: Game["id"]
  version?: string
  platform?: string
  screen_size?: string
  software?: string
  external_id?: string
  custom_data?: base.CustomData
}

/**
 * @property author - Containing the name of the person or organization who created the game
 */
export interface Game {
  id: base.Id
  publisher_id?: Account["id"]
  name: string
  author?: string
  description?: string
  custom_data?: base.CustomData
}

/**
 * @property custom_data - JSON For "gain" and “lose” events, specifies the number of things are gained or lost.
 */
export interface Event {
  id: number
  session_id: Session["id"]
  type: base.EventType
  server_time: base.Date
  user_time?: base.Date
  custom_data?: base.CustomData
  section?: base.Section
  coordinates?: base.Coordinate
}
