import React from "react";

import * as types from "rm2-typings";

import MenuItem from "./MenuItem";
import Menu from "./Menu";

export default function Footer({
  user,
  deleteUser,
  setApiKey,
}: {
  user?: types.ApiKeyUser;
  setApiKey: (apiKey: string | null) => unknown;
  deleteUser: () => unknown;
}) {
  return (
    <Menu user={user} setApiKey={setApiKey} deleteUser={deleteUser}>
      {user?.permissions.some((permission) => {
        return permission === types.Permission.MANAGE_GAMES;
      }) && <MenuItem to="/games"> Games </MenuItem>}
      {user?.permissions.some((permission) => {
        return permission === types.Permission.MANAGE_ACCOUNTS;
      }) && <MenuItem to="/accounts"> Accounts </MenuItem>}
      <MenuItem to="/docs"> Docs </MenuItem>
      <MenuItem to="/tutorial"> Usage </MenuItem>
      <MenuItem to="/about"> About </MenuItem>
    </Menu>
  );
}
