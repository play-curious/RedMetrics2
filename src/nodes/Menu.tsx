import React, { FunctionComponent } from "react";

// todo: add search bar

const Menu: FunctionComponent = ({ children }) => {
  return (
    <>
      <div className="menu">{children}</div>
    </>
  );
};

export default Menu;
