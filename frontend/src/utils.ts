import * as types from "rm2-typings";

export function roleRank(role: types.Role): 0 | 1 | 2 {
  return ["user", "dev", "admin"].indexOf(role) as 0 | 1 | 2;
}

export enum Permission {
  /**
   * Includes SHOW_ACCOUNTS, CREATE_ACCOUNTS, DELETE_ACCOUNTS and EDIT_ACCOUNTS. <br/>
   * By default, everyone can edit or delete he own account.
   */
  MANAGE_ACCOUNTS = "manageAccounts",
  SHOW_ACCOUNTS = "showAccounts",
  CREATE_ACCOUNTS = "createAccounts",
  DELETE_ACCOUNTS = "deleteAccounts",
  EDIT_ACCOUNTS = "editAccounts",

  /**
   * Includes SHOW_GAMES, CREATE_GAMES, DELETE_GAMES and EDIT_GAMES.
   */
  MANAGE_GAMES = "manageGames",
  SHOW_GAMES = "showGames",
  CREATE_GAMES = "createGames",
  DELETE_GAMES = "deleteGames",
  EDIT_GAMES = "editGames",
}
