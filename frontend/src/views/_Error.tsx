import React from "react";

import Button from "../nodes/Button";
import Wrapper from "../nodes/Wrapper";

export default function _Error({
  text,
}: {
  text: "You must be administrator to access this page." | string;
}) {
  return (
    <>
      <h1>
        <span className="text-red-500"> Error! </span> {text}
      </h1>
      <Wrapper>
        <Button to="/">Go Home</Button>
      </Wrapper>
    </>
  );
}
