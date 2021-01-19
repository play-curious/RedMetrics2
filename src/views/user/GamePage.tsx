import React, { useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import VersionCard from "../../nodes/VersionCard";

import * as constants from "../../constants";
import * as types from "../../types";

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
      <h1> {game.name} </h1>
      <p> {game.description ?? "No description"} </p>
      <div>
        {versions.map((version) => {
          return (
            <VersionCard
              title={version.name}
              description={version.description ?? "No description."}
              fields={[]}
              url={"/version/" + version.id}
            />
          );
        })}
      </div>
    </>
  );
}
