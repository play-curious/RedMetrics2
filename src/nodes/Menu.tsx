import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import * as uuid from "uuid";

const Menu: FunctionComponent<{ links: { path: string; name: string }[] }> = ({
  links,
}) => {
  return (
    <>
      <div className="menu">
        {links.map((link) => {
          return (
            <div className="menu-item">
              <Link to={link.path}>{link.name}</Link>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Menu;
