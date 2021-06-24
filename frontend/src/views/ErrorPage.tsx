import React from "react";

import Center from "../nodes/Center";
import Button from "../nodes/Button";

export default function ErrorPage({
  text,
}: {
  text: "You must be administrator to access this page." | string;
}) {
  return (
    <Center>
      <h1>
        <span className="text-red-500"> Error! </span> {text}
      </h1>
      <Button to="/#body">Go Home</Button>
    </Center>
  );
}
