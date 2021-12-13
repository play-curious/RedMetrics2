import React from "react";
import NotificationSystem from "react-notification-system";

import * as types from "rm2-typings";

import Paginator from "../nodes/Paginator";
import GameCard from "../nodes/GameCard";
import Wrapper from "../nodes/Wrapper";
import Button from "../nodes/Button";
import ErrorPage from "./ErrorPage";
import Warn from "../nodes/Warn";

const request = types.utils.request;

export default function Games({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();

  const [gameCount, setGameCount] = React.useState<number>();

  if (gameCount === undefined)
    request<types.api.GameCount>("Get", "/game/count", undefined)
      .then(setGameCount)
      .catch(console.error);

  if (!user.is_admin)
    return ErrorPage({
      text: "You must be administrator to access this page.",
    });

  const gamePerPage = 15;

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <h1> Games </h1>
      <h2> Actions </h2>
      <Wrapper>
        <Button to="/game/add" children="New Game" />
      </Wrapper>
      <h2 id="list"> Game List ({gameCount ?? 0}) </h2>
      {gameCount && gameCount > 0 ? (
        <>
          <Paginator
            pageCount={Math.ceil(gameCount / gamePerPage)}
            fetchPageItems={async (index) => {
              return request<types.api.Game>("Get", "/game", undefined, {
                params: {
                  offset: index * gamePerPage,
                  limit: gamePerPage,
                },
              }).then((games: types.tables.Game[]) =>
                games.map((game, i) => {
                  return <GameCard key={i} game={game} />;
                })
              );
            }}
          />
        </>
      ) : (
        <Warn type="warn"> No games found </Warn>
      )}
    </>
  );
}
