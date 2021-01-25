import React from "react";
import * as Router from "react-router";

import * as types from "../../types";
import * as utils from "../../utils";

import Menu from "../../nodes/Menu";
import MenuItem from "../../nodes/MenuItem";

// todo: useParams (q: string)

const Search: React.FunctionComponent<{ user: types.SessionUser }> = ({
  user,
}) => {
  const { q } = Router.useParams<{ q: string }>();

  return (
    <>
      <Menu>
        <MenuItem to="/home"> Home </MenuItem>
      </Menu>
      {user.roleRank > utils.roleRank("user") && (
        <div>
          <h2> Your games </h2>
        </div>
      )}
      {user.roleRank > utils.roleRank("dev") && (
        <div>
          <h2> Accounts </h2>
        </div>
      )}
    </>
  );
};

export default Search;
