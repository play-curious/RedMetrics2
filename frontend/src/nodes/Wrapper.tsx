import React from "react";

export default function Wrapper({ children }: { children: any }) {
  return (
    <div className="flex flex-wrap items-stretch justify-start">{children}</div>
  );
}
