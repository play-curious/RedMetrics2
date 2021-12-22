import React from "react";

import * as types from "rm2-typings";

import Card from "./Card";

export default function EventCard({
  event,
  game_id,
}: {
  event: types.tables.Event;
  game_id: types.tables.Game["id"];
}) {
  return (
    <Card
      title={event.section ?? "no section"}
      footer={event.server_timestamp}
      url={`/game/${game_id}/session/${event.session_id}/event/${event.id}`}
    >
      <pre>
        <code>{JSON.stringify(event, null, 2)}</code>
      </pre>
    </Card>
  );
}
