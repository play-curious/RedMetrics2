import React from "react";

export default function Container({ children }: { children: any }) {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">{children}</div>
  );
}
