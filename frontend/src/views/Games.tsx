import React from "react";
import ReactPaginate from "react-paginate";
import NotificationSystem from "react-notification-system";

import axios from "axios";
import qs from "querystring";

import * as types from "rm2-typings";
import * as utils from "../utils";
import * as constants from "../constants";

import GameCard from "../nodes/GameCard";
import Wrapper from "../nodes/Wrapper";
import SubMenu from "../nodes/SubMenu";
import Button from "../nodes/Button";
import CheckUser from "../nodes/CheckUser";

export default function Games({ user }: { user?: types.ApiKeyUser }) {
  const notificationSystem = React.createRef<NotificationSystem.System>();
  const [games, setGames] = React.useState<types.Game[]>();
  const [gameCount, setGameCount] = React.useState<number>();
  const [offset, setOffset] = React.useState<number>(0);

  const gamePerPage = 15;

  if (games === undefined)
    axios
      .get<types.Game[]>(
        "/game?" +
          qs.stringify({ apikey: user?.api_key, offset, count: gamePerPage }),
        {
          baseURL: constants.API_BASE_URL,
        }
      )
      .then((response) => {
        setGames(response.data);
      })
      .catch((error) => {
        notificationSystem.current?.addNotification({
          message: error.message,
          level: "error",
        });
      });

  if (gameCount === undefined)
    axios
      .get<types.Game[]>("/game", {
        baseURL: constants.API_BASE_URL,
        params: { apikey: user?.api_key },
      })
      .then((response) => {
        setGameCount(response.data.length);
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
      <CheckUser
        user={user}
        permissions={[
          types.Permission.SHOW_GAMES,
          types.Permission.MANAGE_GAMES,
        ]}
        condition={() => false}
      />
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
          gameCount !== undefined ? Math.ceil(gameCount / gamePerPage) : 1
        }
        onPageChange={({ selected }) => {
          setOffset(Math.ceil(selected * gamePerPage));
        }}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        containerClassName="flex w-full justify-around mt-5"
        pageLinkClassName="cursor-pointer hover:bg-gray-200 px-2 rounded-full"
        activeClassName="border-2 bg-gray-200 rounded-full"
      />
    </>
  );
}
