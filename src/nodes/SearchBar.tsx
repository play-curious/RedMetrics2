import React from "react";
import Router from "react-router";
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
      <div className="search-bar">
        <input type="text" ref={input} />
        <button type="button" className="button" onClick={submit}>
          <i className="fa fa-search" />
        </button>
      </div>
    </>
  );
};

export default SearchBar;
