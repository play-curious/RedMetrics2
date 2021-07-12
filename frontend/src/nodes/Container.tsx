import React from "react";

export default function Container({ children }: { children: any }) {
  return (
    <div className="container min-h-full mx-auto shadow-lg px-3 m-0 flex-grow">
      {children}
    </div>
  );
}
