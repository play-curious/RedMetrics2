import React from "react";

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
      title={new Date().setTime(Number(session.createdTimestamp)).toString()}
      url={`/game/${session.gameId}/session/show/${session.id}`}
      secondary={session.id}
    />
  );
}
