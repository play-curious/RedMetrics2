import React from "react";

export default function Menu({ children }: { children: any }) {
  return (
    <>
      <nav>
        <div className="hidden sm:block sm:ml-6">
          <div className="flex space-x-4"> {children} </div>
        </div>
        <div className="block sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">{children}</div>
        </div>
      </nav>
    </>
  );
}
