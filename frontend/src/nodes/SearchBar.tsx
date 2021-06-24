import React from "react";
import * as Router from "react-router";

import qs from "querystring";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SearchBar({ focus }: { focus?: boolean }) {
  const params = Router.useParams<{ q: string }>();

  const [query, setQuery] = React.useState<string>();
  const [redirect, setRedirect] = React.useState<string>();

  if (params.q && params.q !== query) setQuery(params.q);

  const submit = () => {
    if (query) setRedirect("/search?" + qs.stringify({ q: query }));
  };

  return (
    <></> || (
      <>
        {redirect && <Router.Redirect to={redirect} />}
        <div className="relative mx-auto text-gray-600 flex justify-end">
          <input
            className="bg-white h-7 px-2 py-0 pr-10 rounded-full text-sm focus:outline-none"
            type="text"
            value={query}
            autoFocus={focus}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
          />
          <button
            type="button"
            className="absolute right-0 top-0 mt-0.5 mr-2 hover:text-red-500"
            onClick={submit}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </>
    )
  );
}
