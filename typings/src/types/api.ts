import * as base from "./base"
export * from "./api/auth"
export * from "./api/game"
export * from "./api/events"

/**
 * Emitted API error
 */
export interface Error {
  code: number
  description: string
}

/**
 * @property api_version - the numeric version, containing major and minor parts (such as 3.21)
 * @property build - the build of the software
 * @property started_at - Date that the server was last started
 */
export interface Status {
  api_version: number
  build: string
  started_at: base.Date
}

export interface Item {
  Route: `/${string}`
  Params?: any
  Get?: MethodObject
  Post?: MethodObject
  Delete?: MethodObject
  Put?: MethodObject
}

interface MethodObject {
  Body?: any
  Response?: any
}
