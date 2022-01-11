import React from "react";

import * as types from "rm2-typings";

import Card from "./Card";

export default function GameCard({
  game,
}: {
  game: types.utils.SnakeToCamelCaseNested<types.tables.Game>;
}) {
  return (
    <Card
      title={game.name}
      secondary={game.id}
      url={"/game/show/" + game.id}
      children={game.description ?? "No description"}
    />
  );
}
