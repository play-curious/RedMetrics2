import React from "react";
import * as Router from "react-router";

import * as types from "rm2-typings";

import SearchBar from "../nodes/SearchBar";
import Center from "../nodes/Center";

export default function Search({ user }: { user?: types.tables.Account }) {
  const params = Router.useParams<{ q: string }>();

  const resultCount = 0;
  const pageCount = 1;

  return (
    <> WIP </> || (
      <>
        <Center>
          <SearchBar focus key="page" />
          <h1>
            {params.q} -{" "}
            <span className="text-gray-500">
              {resultCount} results ({pageCount} pages)
            </span>
          </h1>
        </Center>
        {/*{user && user.roleRank > utils.roleRank("user") && (*/}
        {/*  <div>*/}
        {/*    <h2> Your games </h2>*/}
        {/*    ...Games*/}
        {/*  </div>*/}
        {/*)}*/}
        {/*{user && user.roleRank > utils.roleRank("dev") && (*/}
        {/*  <div>*/}
        {/*    <h2> Users </h2>*/}
        {/*    ...Accounts*/}
        {/*  </div>*/}
        {/*)}*/}
      </>
    )
  );
}
