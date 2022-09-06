import React from "react";

import MenuItem from "./MenuItem";
import Menu from "./Menu";
import Button from "./Button";
import Container from "./Container";
import Logo from "./Logo";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt, faUser } from "@fortawesome/free-solid-svg-icons";

import * as types from "rm2-typings";

export default function Header({
  user,
}: {
  user?: types.utils.SnakeToCamelCaseNested<types.tables.Account>;
}) {
  return (
    <div className="bg-gray-800">
      <Container hidden={true}>
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>
            <Menu>
              {user && <MenuItem to="/games"> Games </MenuItem>}
              {user && <MenuItem to="/api-keys"> Api Keys </MenuItem>}
              {user?.isAdmin && <MenuItem to="/accounts"> Accounts </MenuItem>}
              <MenuItem to="/docs"> Docs </MenuItem>
              <MenuItem to="/about"> About </MenuItem>
            </Menu>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="ml-3 relative">
              {/*<Dropdown user={user} deleteUser={deleteUser} />*/}
              {user ? (
                <Button to="/profile">
                  <span className="hidden md:inline mr-2">{user.email}</span>
                  <FontAwesomeIcon icon={faUser} />
                </Button>
              ) : (
                <Button to="/login">
                  <span className="hidden md:inline mr-2">Login</span>
                  <FontAwesomeIcon icon={faSignInAlt} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
