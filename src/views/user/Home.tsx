import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";

import * as types from "../../types";
import * as utils from "../../utils";

import Menu from "../../nodes/Menu";

const Home: FunctionComponent<{
  user: types.SessionUser;
}> = ({ user }) => (
  <>
    <Menu>
      <Link to="/profile"> Profile </Link>
      <Link to="/game/menu"> Games </Link>
      {user.roleRank >= utils.roleRank("admin") && (
        <Link to="/accounts"> Accounts </Link>
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
        <Link className="button" to={{ pathname: "/tutorial" }}>
          Getting started
        </Link>
        <Link className="button" to={{ pathname: "/docs" }}>
          Documentation
        </Link>
      </div>
    </div>
  </>
);

export default Home;
