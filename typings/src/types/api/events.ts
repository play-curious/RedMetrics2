import * as tables from "../tables"
import * as base from "../base"
import { Item } from "../api"

export interface Session extends Item {
  Route: "/session"
  Post: {
    Body: Omit<tables.Session, "id">
  }
  Response: tables.Session
}

export interface SessionById extends Item {
  Route: "/session/:id"
  Params: {
    id: tables.Session["id"]
  }
  Get: {
    Response: tables.Session
  }
  Put: {
    Body: Pick<
      tables.Session,
      "custom_data" | "software" | "screen_size" | "platform" | "external_id"
    >
    Response: void
  }
}

export interface SessionById_Events extends Item {
  Route: "/session/:id/events"
  Params: {
    id: tables.Session["id"]
  }
  Get: {
    Response: tables.Event[]
  }
}

export interface SessionsByGameId extends Item {
  Route: "/sessions/:game_id"
  Params: {
    game_id: tables.Game["id"]
  }
  Get: {
    Response: tables.Session[]
  }
}

export interface Event extends Item {
  Route: "/event"
  Get: {
    Body: Partial<{
      game_id: tables.Game["id"]
      session_id: tables.Session["id"]
      type: base.EventType
      section: base.Section
      after: base.Date
      before: base.Date
      offset: number
      count: number
    }>
    Response: tables.Event[]
  }
  Post: {
    Body: Omit<tables.Event, "id">
    Response: tables.Event
  }
}
