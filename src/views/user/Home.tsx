import React, { FunctionComponent } from "react";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import * as types from "../../types";
import Menu from "../../nodes/Menu";

const Home: FunctionComponent<{
  apiKey: string | null;
  role: types.Role;
}> = ({ apiKey }) => (
  <>
    <Menu links={[]} />
    <div className="home">
      {!apiKey && <Redirect to="/register" />}
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
