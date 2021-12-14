import React from "react";

import Button from "../nodes/Button";
import Wrapper from "../nodes/Wrapper";

export default function _NotFound() {
  return (
    <>
      <h1>
        <span className="text-red-500"> 404 </span> Not Found!
      </h1>
      <Wrapper>
        <Button to="/">Go Home</Button>
      </Wrapper>
    </>
  );
}
