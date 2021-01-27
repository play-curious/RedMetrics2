import React from "react";
import * as Dom from "react-router-dom";
import Container from "../../nodes/Container";

export default function NotFound() {
  return (
    <Container>
      <h1>
        <span className="text-red-500"> 404 </span> Not Found!
      </h1>
      <Dom.Link to="/">Go Home</Dom.Link>
    </Container>
  );
}
