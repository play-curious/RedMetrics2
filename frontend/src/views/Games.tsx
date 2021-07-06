import React from "react";
import ReactPaginate from "react-paginate";
import NotificationSystem from "react-notification-system";

import axios from "axios";

import * as types from "rm2-typings";

import GameCard from "../nodes/GameCard";
import Wrapper from "../nodes/Wrapper";
import SubMenu from "../nodes/SubMenu";
import Button from "../nodes/Button";
import ErrorPage from "./ErrorPage";

export default function Games({ user }: { user: types.tables.Account }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [games, setGames] = React.useState<types.tables.Game[]>();
  const [, setOffset] = React.useState<number>(0);

  if (!user.is_admin)
    return ErrorPage({
      text: "You must be administrator to access this page.",
    });

  const gamePerPage = 15;

  if (games === undefined)
    axios
      .get<types.api.Game["Get"]["Response"]>("/game")
      .then((response) => {
        setGames(response.data);
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  return (
    <>
      <NotificationSystem ref={notificationSystem} />
      <SubMenu>
        <Button to="/game/add" children="New Game" />
      </SubMenu>
      <Wrapper>
        {games?.map((game) => {
          return <GameCard game={game} />;
        }) ?? "No games found"}
      </Wrapper>
      <ReactPaginate
        pageCount={
          games?.length !== undefined
            ? Math.ceil(games.length / gamePerPage)
            : 1
        }
        onPageChange={({ selected }) => {
          setOffset(Math.ceil(selected * gamePerPage));
        }}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        containerClassName="flex w-full justify-around mt-5"
        pageLinkClassName="cursor-pointer hover:bg-gray-200 px-2 rounded-full"
        activeClassName="border-2 bg-gray-200 rounded-full"
        disabledClassName="opacity-50 no-underline"
      />
    </>
  );
}
