import React from "react";

import Button from "../nodes/Button";

export default function NotFound() {
  return (
    <>
      <h1>
        <span className="text-red-500"> 404 </span> Not Found!
      </h1>
      <Button to="/">Go Home</Button>
    </>
  );
}
