import React from "react";
import Dom from "react-router-dom";
import Menu from "../../nodes/Menu";

// todo: useParams (q: string)

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
          <Dom.Link to="/home"> Home </Dom.Link>
        </Menu>
        <div className="search-page"></div>
      </>
    );
  }
}
