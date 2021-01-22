import React from "react";
import Router from "react-router-dom";
import axios from "axios";

import * as utils from "../../utils";
import * as types from "../../types";
import * as constants from "../../constants";

import Menu from "../../nodes/Menu";
import Card from "../../nodes/Card";

const GameMenu: React.FunctionComponent<{ user: types.SessionUser }> = ({
  user,
}) => {
  const [games, setGames] = React.useState<types.Game[]>([]);

  axios
    .get<types.Game[]>("/game", {
      baseURL: constants.apiBaseURL,
    })
    .then((response) => setGames(response.data));

  return (
    <>
      <Menu>
        <Router.Link to="/profile"> Profile </Router.Link>
        {user.roleRank >= utils.roleRank("dev") && (
          <Router.Link to="/game/add"> New Game </Router.Link>
        )}
      </Menu>
      <div className="game-menu">
        {games.map((game) => {
          return (
            <Card
              url={"/game/show/" + game.id}
              title={game.name}
              description={game.description ?? "No description"}
              fields={[]}
            />
          );
        })}
      </div>
    </>
  );
};

export default GameMenu;
