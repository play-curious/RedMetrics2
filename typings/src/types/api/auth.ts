import * as tables from "../tables"
import { Item } from "../api"

export interface Logout extends Item {
  Route: "/logout"
  Get: {
    Response: void
  }
}

export interface Login extends Item {
  Route: "/login"
  Post: {
    Body: Pick<tables.Account, "email" | "password">
    Response: {
      token: string
    }
  }
}

export interface Register extends Item {
  Route: "/register"
  Post: {
    Body: Pick<tables.Account, "email" | "password" | "is_admin">
    Response: {
      id: tables.Account["id"]
      token: string
    }
  }
}

export interface Account extends Item {
  Route: "/account"
  Get: {
    Response: tables.Account
  }
}

export interface AccountById extends Item {
  Route: "/account/:id"
  Params: {
    id: tables.Account["id"]
  }
  Get: {
    Response: tables.Account
  }
  Delete: {
    Response: void
  }
  Put: {
    Body: Partial<Register["Post"]["Body"]>
    Response: {
      id: tables.Account["id"]
    }
  }
}

export interface Accounts extends Item {
  Route: "/accounts"
  Get: {
    Response: tables.Account[]
  }
}

export interface Key extends Item {
  Route: "/key"
  Post: {
    Body: Pick<tables.ApiKey, "name" | "game_id">
    Response: tables.ApiKey
  }
}

export interface KeyByKey extends Item {
  Route: "/key/:key"
  Params: {
    key: tables.ApiKey["key"]
  }
  Delete: {
    Response: void
  }
}

export interface Keys extends Item {
  Route: "/keys"
  Get: {
    Response: tables.ApiKey[]
  }
  Delete: {
    Response: void
  }
}
