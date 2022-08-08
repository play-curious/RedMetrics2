import React from "react";

import * as types from "rm2-typings";

import * as utils from "../../utils";

import Card from "./Card";

import "./EventCard.scss";

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
      <div className="code-container">
        <pre
          className="code"
          dangerouslySetInnerHTML={{ __html: utils.highlightJson(event) }}
        ></pre>
      </div>
    </Card>
  );
}
