import React from "react";
import Container from "./Container";

export default function Footer({}: {}) {
  return (
    <div className="bg-gray-800 text-white">
      <Container>
        <div className="italic text-sm text-center py-2">
          Made by PlayCurious
        </div>
      </Container>
    </div>
  );
}
