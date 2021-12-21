import React from "react";

import * as types from "rm2-typings";
import Card from "./Card";

export default function SessionCard({
  session,
  key,
}: {
  session: types.tables.Session;
  key?: any;
}) {
  return (
    <Card
      key={key}
      title={new Date().setTime(Number(session.created_timestamp)).toString()}
      url={`/game/${session.game_id}/session/show/${session.id}`}
      secondary={session.id}
    />
  );
}
