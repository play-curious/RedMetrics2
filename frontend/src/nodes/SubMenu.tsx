import React from "react";

import Container from "./Container";

export default function SubMenu({ children }: { children: any }) {
  return (
    <>
      <nav className="flex h-16 items-center">
        <Container>{children}</Container>
      </nav>
    </>
  );
}
