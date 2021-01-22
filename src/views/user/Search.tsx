import React from "react";
import { Link } from "react-router-dom";
import Menu from "../../nodes/Menu";

export default class Search extends React.Component {
  state: {
    search: string;
    what: "game";
  } = {
    search: "",
    what: "game",
  };

  render() {
    return (
      <>
        <Menu>
          <Link to="/home"> Home </Link>
        </Menu>
        <div className="search-page"></div>
      </>
    );
  }
}
