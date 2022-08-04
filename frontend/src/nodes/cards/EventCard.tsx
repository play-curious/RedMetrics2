import React from "react";

import * as types from "rm2-typings";

import Card from "./Card";

export default function EventCard({
  event,
  game_id,
}: {
  event: types.utils.SnakeToCamelCaseNested<types.tables.Event>;
  game_id: types.tables.Game["id"];
}) {
  return (
    <Card
      title={event.type ?? event.section ?? `Event #${event.id}`}
      footer={event.serverTimestamp}
      url={`/game/${game_id}/session/${event.sessionId}/event/${event.id}`}
    >
      <pre>
        <code>{JSON.stringify(event, null, 2)}</code>
      </pre>
    </Card>
  );
}
