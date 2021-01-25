import React from "react";
import * as Router from "react-router";
import qs from "querystring";

const SearchBar: React.FunctionComponent = () => {
  const [redirect, setRedirect] = React.useState<null | string>(null);
  const input = React.useRef() as React.MutableRefObject<HTMLInputElement>;

  const submit = () => {
    const q = input.current.value;
    if (q) setRedirect("/search?" + qs.stringify({ q }));
  };

  return (
    <>
      {redirect && <Router.Redirect to={redirect} />}
      <div className="pt-2 relative mx-auto text-gray-600">
        <input
          className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
          type="text"
          ref={input}
        />
        <button
          type="button"
          className="absolute right-0 top-0 mt-5 mr-4"
          onClick={submit}
        >
          <i className="fa fa-search" />
        </button>
      </div>
    </>
  );
};

export default SearchBar;
