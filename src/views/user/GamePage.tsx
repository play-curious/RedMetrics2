import React, { useState } from "react";
import { useParams } from "react-router";
import axios from "axios";

import Card from "../../nodes/Card";

import * as constants from "../../constants";
import * as types from "../../types";
import Menu from "../../nodes/Menu";

export default function GamePage() {
  const { id } = useParams<{ id: string }>();

  const [game, setGame] = useState<types.Game>({
    name: "...",
  });

  const [versions, setVersions] = useState<types.GameVersion[]>([]);

  axios
    .get("game/" + id, {
      baseURL: constants.apiBaseURL,
    })
    .then((response) => setGame(response.data));

  axios
    .get(`game/${id}/version/`, {
      baseURL: constants.apiBaseURL,
    })
    .then((response) => setVersions(response.data));

  return (
    <>
      <Menu links={[{ path: "/home", name: "Home" }]} />
      <div className="game-page">
        <h1> {game.name} </h1>
        <p> {game.description ?? "No description"} </p>
        <div>
          {versions.map((version) => {
            return (
              <Card
                title={version.name}
                description={version.description ?? "No description."}
                fields={[]}
                url={"/version/" + version.id}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
