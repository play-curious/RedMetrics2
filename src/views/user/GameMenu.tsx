import React from "react";
import axios from "axios";

import * as utils from "../../utils";
import * as types from "../../types";
import * as constants from "../../constants";

import Menu from "../../nodes/Menu";
import Card from "../../nodes/Card";
import MenuItem from "../../nodes/MenuItem";

export default function GameMenu({ user }: { user: types.SessionUser }) {
  const [games, setGames] = React.useState<types.Game[]>([]);

  axios
    .get<types.Game[]>("/game", {
      baseURL: constants.apiBaseURL,
    })
    .then((response) => setGames(response.data));

  return (
    <>
      <Menu>
        <MenuItem to="/profile"> Profile </MenuItem>
        {user.roleRank >= utils.roleRank("dev") && (
          <MenuItem to="/game/add"> New Game </MenuItem>
        )}
      </Menu>
      <div className="game-menu">
        {games.map((game) => {
          return (
            <Card url={"/game/show/" + game.id} title={game.name}>
              {game.description ?? "No description"}
            </Card>
          );
        })}
      </div>
    </>
  );
}
