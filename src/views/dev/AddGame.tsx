import React, { FunctionComponent, useState } from "react";
import { Redirect } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";

import * as types from "../../types";
import * as utils from "../../utils";
import * as constants from "../../constants";

const AddGame: FunctionComponent<{ role: types.Role }> = ({ role }) => {
  const [redirect, setRedirect] = useState<null | string>(null);

  const { register, handleSubmit } = useForm<types.Game>();

  const afterSubmit = (game: types.Game) => {
    axios
      .post("/game", game, {
        baseURL: constants.apiBaseURL,
      })
      .then((response) => {
        setRedirect("/game/" + response.data.game_id);
      })
      .catch((error) => {
        setRedirect("/error");
      });
  };

  return (
    <>
      {utils.roleRank(role) < utils.roleRank("dev") && setRedirect("/home")}
      {redirect && <Redirect to={redirect} />}
      <h1> Add your game </h1>
      <form onSubmit={handleSubmit(afterSubmit)}>
        <input
          type="text"
          name="name"
          ref={register({ required: true, minLength: 3, maxLength: 256 })}
        />
        <input
          type="text"
          name="author"
          ref={register({ minLength: 3, maxLength: 256 })}
        />
        <textarea name="description" ref={register}>
          No description.
        </textarea>
        <code>
          <textarea name="custom_data" ref={register}>
            No description.
          </textarea>
        </code>
        <input className="button" type="submit" value="Add" />
      </form>
    </>
  );
};

export default AddGame;