import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";

const Menu: FunctionComponent<{ links: { path: string; name: string }[] }> = ({
  links,
}) => {
  return (
    <>
      <div className="menu">
        {links.map((link, i) => {
          return (
            <div className="menu-item">
              <Link key={i} to={link.path}>
                {link.name}
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Menu;
