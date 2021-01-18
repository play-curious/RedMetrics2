import React from "react";
import axios from "axios";
import * as constants from "../../constants";
import * as types from "../../types";
import VersionCard from "../../nodes/VersionCard";

export default class GamePage extends React.Component {
  props: {
    gameId: string | null;
  } = {
    gameId: null,
  };

  async getGame(): Promise<types.Game> {
    const response = await axios.get("game/" + this.props.gameId, {
      baseURL: constants.apiBaseURL,
    });

    return response.data;
  }

  async getVersions(): Promise<types.GameVersion[]> {
    const response = await axios.get(`game/${this.props.gameId}/version/`, {
      baseURL: constants.apiBaseURL,
    });

    return response.data;
  }

  async render() {
    const game = await this.getGame();
    const versions = await this.getVersions();
    return (
      <div className="game-page">
        <h1> {game.name} </h1>
        <p> {game.description} </p>
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
      </div>
    );
  }
}
