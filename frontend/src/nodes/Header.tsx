import React from "react";

import { tables as types } from "rm2-typings";

import MenuItem from "./MenuItem";
import Menu from "./Menu";

export default function Footer({
  user,
  fetchUser,
}: {
  user?: types.Account;
  fetchUser: () => unknown;
}) {
  return (
    <Menu user={user} deleteUser={fetchUser}>
      {user?.is_admin && <MenuItem to="/games"> Games </MenuItem>}
      {user?.is_admin && <MenuItem to="/accounts"> Accounts </MenuItem>}
      <MenuItem to="/docs"> Docs </MenuItem>
      <MenuItem to="/about"> About </MenuItem>
    </Menu>
  );
}
