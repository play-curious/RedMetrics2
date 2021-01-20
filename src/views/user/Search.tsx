import React from "react";
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
        <Menu links={[{ path: "/home", name: "Home" }]} />
        <div className="search-page"></div>
      </>
    );
  }
}
