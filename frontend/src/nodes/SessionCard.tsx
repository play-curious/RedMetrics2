import React from "react";

import * as types from "rm2-typings";
import Card from "./Card";

export default function SessionCard({
  session,
  key,
}: {
  session: types.api.SessionById["Methods"]["Get"]["Response"];
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
