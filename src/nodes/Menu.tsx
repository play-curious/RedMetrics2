import React from "react";

// todo: add search bar

const Menu: React.FunctionComponent = ({ children }) => {
  return (
    <>
      <div className="menu">{children}</div>
    </>
  );
};

export default Menu;
