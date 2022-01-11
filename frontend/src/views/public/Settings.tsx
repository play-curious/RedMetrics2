import React from "react";

import * as types from "rm2-typings";

export default function Settings({
  user,
}: {
  user: types.utils.SnakeToCamelCaseNested<types.tables.Account>;
}) {
  return <h1> WIP (cookie management, theme color...) </h1>;
}
