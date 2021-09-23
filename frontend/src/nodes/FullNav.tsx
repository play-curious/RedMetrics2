import React from "react";
import * as Dom from "react-router-dom";

import "./FullNav.scss";

export default function FullNav() {
  return (
    <>
      <nav className="plan hidden md:block">
        <ul className="flex items-start justify-around">
        <li>
            <Dom.Link to="/games">
              <span>Games</span>
              <ul>
                <li>
                  <Dom.Link to="/game/add">
                    <span>Add game</span>
                  </Dom.Link>
                </li>
                <li>
                  <Dom.Link to="/games#list">
                    <span>Game list</span>
                  </Dom.Link>
                </li>
              </ul>
            </Dom.Link>
          </li>
          <li>
            <Dom.Link to="/api-keys">
              <span>API keys management</span>
            </Dom.Link>
            <ul>
              <li>
                <Dom.Link to="/api-keys#list">
                  <span>API key list</span>
                </Dom.Link>
              </li>
              <li>
                <Dom.Link to="/api-keys#add">
                  <span>Add API key</span>
                </Dom.Link>
              </li>
            </ul>
          </li>
          <li>
            <Dom.Link to="/accounts">
              <span>Account management</span>
            </Dom.Link>
            <ul>
              <li>
                <Dom.Link to="/account/create">
                  <span>Create account</span>
                </Dom.Link>
              </li>
              <li>
                <Dom.Link to="/accounts#list">
                  <span>Account list</span>
                </Dom.Link>
              </li>
            </ul>
          </li>
          <li>
            <Dom.Link to="/docs">
              <span>Documentation</span>
            </Dom.Link>
          </li>
          <li>
            <Dom.Link to="/about">About</Dom.Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
