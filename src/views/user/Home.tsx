import React from "react";
import * as Dom from "react-router-dom";

import * as types from "../../types";
import * as utils from "../../utils";

import Menu from "../../nodes/Menu";
import MenuItem from "../../nodes/MenuItem";

export default function Home({ user }: { user: types.SessionUser }) {
  return (
    <>
      <Menu>
        <MenuItem to="/profile"> Profile </MenuItem>
        <MenuItem to="/game/menu"> Games </MenuItem>
        {user.roleRank >= utils.roleRank("admin") && (
          <MenuItem to="/accounts"> Accounts </MenuItem>
        )}
      </Menu>
      <div className="home">
        <div className="center">
          <h1> Home </h1>
          <h2> What is RedMetrics? </h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolor
            ducimus eos fugit officia, rem reprehenderit sequi totam. Accusamus
            consequatur dolores esse ipsa natus pariatur quae quo quod ratione,
            recusandae sint.
          </p>
          <h2> I want to use it! </h2>
          <Dom.Link className="button" to={{ pathname: "/tutorial" }}>
            Getting started
          </Dom.Link>
          <Dom.Link className="button" to={{ pathname: "/docs" }}>
            Documentation
          </Dom.Link>
        </div>
      </div>
    </>
  );
}
