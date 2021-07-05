import React from "react";
import Container from "./Container";

export default function Footer({}: {}) {
  return (
    <div className="bg-gray-800 text-white">
      <Container>
        <div className="text-sm text-center py-2">
          Created by by <a href="https://playcurious.games">Play Curious</a> and{" "}
          <a href="https://sites.google.com/view/yuvalhart/home">Yuval Hart</a>
        </div>
      </Container>
    </div>
  );
}
