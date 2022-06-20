import React from "react";
import dayjs from "dayjs";

import * as types from "rm2-typings";

import Card from "./Card";

export default function SessionCard({
  session,
  key,
}: {
  session: types.utils.SnakeToCamelCaseNested<types.tables.Session>;
  key?: any;
}) {
  return (
    <Card
      key={key}
      title={"created at " + session.createdTimestamp}
      url={`/game/${session.gameId}/session/show/${session.id}`}
      secondary={session.id}
    />
  );
}
