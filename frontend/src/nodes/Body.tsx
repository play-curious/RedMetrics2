import React from "react";

export default function Body({ children }: { children: any }) {
  return (
    <div id="body" className="min-h-screen">
      {children}
    </div>
  );
}
