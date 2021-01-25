import React from "react";
import * as Dom from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <h1>404 - Not Found!</h1>
      <Dom.Link to="/">Go Home</Dom.Link>
    </>
  );
}
