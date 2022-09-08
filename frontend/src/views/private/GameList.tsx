import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";
import * as utils from "../../utils";

import Paginator from "../../nodes/Paginator";
import GameCard from "../../nodes/cards/GameCard";
import Wrapper from "../../nodes/Wrapper";
import Button from "../../nodes/Button";
import Error from "../system/Error";

const request = types.utils.request;

export default function GameList({
  user,
}: {
  user: types.utils.SnakeToCamelCaseNested<types.tables.Account>;
}) {
  const [context, setContext] = React.useState<{
    data: types.tables.Game[];
    headers: utils.ResolvedPagingHeaders;
  }>();

  const notificationSystem = React.createRef<NotificationSystem.System>();

  const gamePerPage = 15;

  const fetchGames = (
    pageNumber: number,
    sortBy: `${string} ${"asc" | "desc"}`
  ) => {
    request<types.api.Game>("Get", "/game", undefined, {
      params: {
        publisher_id: user.isAdmin ? undefined : user.id,
        page: pageNumber,
        perPage: gamePerPage,
        sortBy,
      },
    }).then(utils.handlePagingFetch(setContext));
  };

  if (context === undefined) fetchGames(1, "id desc");

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> Games </h1>
      <h2> Actions </h2>
      <Wrapper>
        <Button to="/game/add" children="New Game" />
      </Wrapper>
      <h2 id="list"> Game List ({context?.headers.total ?? 0}) </h2>
      <Paginator
        context={context}
        onPageChange={fetchGames}
        map={(game, i) => {
          return <GameCard key={i} game={game} />;
        }}
      />
    </>
  );
}
