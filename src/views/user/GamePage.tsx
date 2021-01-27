import React from "react";
import * as Router from "react-router";
import * as Dom from "react-router-dom";
import axios from "axios";

import * as constants from "../../constants";
import * as types from "../../types";

import Menu from "../../nodes/Menu";
import Card from "../../nodes/Card";
import MenuItem from "../../nodes/MenuItem";

const GamePage: React.FunctionComponent<{ user: types.SessionUser }> = ({
  user,
}) => {
  const { id } = Router.useParams<{ id: string }>();
  const [game, setGame] = React.useState<types.Game>({ name: "" });
  const [versions, setVersions] = React.useState<types.GameVersion[]>([]);

  axios
    .get<types.Game>("game/" + id, {
      baseURL: constants.apiBaseURL,
    })
    .then((response) => setGame(response.data));

  axios
    .get<types.GameVersion[]>(`game/${id}/version/`, {
      baseURL: constants.apiBaseURL,
    })
    .then((response) => setVersions(response.data));

  return (
    <>
      <Menu>
        <MenuItem to="/home"> Home </MenuItem>
      </Menu>
      <div className="game-page">
        <h1> {game.name} </h1>
        <p> {game.description ?? "No description"} </p>
        {user.roleRank > 0 && user.account_id === game.publisher_id && (
          <div className="flex">
            <button> Remove </button>
            <button> Edit </button>
          </div>
        )}
        <div>
          {versions.map((version) => {
            return (
              <Card title={version.name} url={"/version/" + version.id}>
                {version.description ?? "No description."}
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default GamePage;
