import React from "react";

import FullNav from "./FullNav";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="bg-gray-800 py-3">
      <Container hidden={true}>
        <FullNav />
      </Container>
    </footer>
  );
}
