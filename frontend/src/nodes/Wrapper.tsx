import React from "react";

export default function Wrapper({ children }: { children: any }) {
  return <div className="flex flex-wrap justify-start">{children}</div>;
}
