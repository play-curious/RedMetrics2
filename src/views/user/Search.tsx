import React from "react";

export default class Search extends React.Component {
  state: {
    search: string;
    what: "game";
  } = {
    search: "",
    what: "game",
  };

  render() {
    return <div className="search-page"></div>;
  }
}
