import React from "react";

import Button from "../nodes/Button";

export default function ErrorPage({
  text,
}: {
  text: "You must be administrator to access this page." | string;
}) {
  return (
    <>
      <h1>
        <span className="text-red-500"> Error! </span> {text}
      </h1>
      <Button to="/">Go Home</Button>
    </>
  );
}
