import * as types from "./types";

export function roleRank(role: types.Role): 0 | 1 | 2 {
  return ["user", "dev", "admin"].indexOf(role) as 0 | 1 | 2;
}
