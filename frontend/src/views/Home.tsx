import React from "react";

import Logo from "../nodes/Logo";
import Button from "../nodes/Button";

export default function Home() {
  return (
    <>
      <h1 className="font-bold text-xl mt-2">
        What is RedMetrics ?
      </h1>
      <p className="my-2">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolor ducimus
        eos fugit officia, rem reprehenderit sequi totam. Accusamus consequatur
        dolores esse ipsa natus pariatur quae quo quod ratione, recusandae sint.
      </p>
      <h2 className="font-bold text-lg"> I want to use it! </h2>
      <ul>
        <Button to="/tutorial">Getting started</Button>
        <Button to="/docs">Documentation</Button>
      </ul>
    </>
  );
}
