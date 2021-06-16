import React from "react";

import Center from "../nodes/Center";
import Button from "../nodes/Button";

export default function NotFound() {
  return (
    <Center>
      <h1>
        <span className="text-red-500"> 404 </span> Not Found!
      </h1>
      <Button to="/#body">Go Home</Button>
    </Center>
  );
}
