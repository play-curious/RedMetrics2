import * as types from "rm2-typings";

import { games } from "../controllers/game";
import { accounts } from "../controllers/auth";
import { events, sessions } from "../controllers/events";
import { database } from "../app";

const count = 20;

const email = "fixtures@fixtures.fixtures";

(async () => {
  await accounts().insert({
    created_timestamp: new Date().toLocaleString(),
    email,
    is_admin: false,
    password: "fixtures",
  } as types.utils.Insert<types.tables.Account>);

  const account = await accounts().where({ email }).first();

  await games().insert(
    new Array<types.utils.Insert<types.tables.Game>>(count).fill({
      name: "Game",
      publisher_id: account?.id,
    })
  );

  const game = await games().where({ publisher_id: account?.id }).first();

  await sessions().insert(
    new Array<types.utils.Insert<types.tables.Session>>(count).fill({
      closed: false,
      created_timestamp: new Date().toLocaleString(),
      updated_timestamp: new Date().toLocaleString(),
      game_id: game?.id as string,
    })
  );

  const session = await sessions().where({ game_id: game?.id }).first();

  await events().insert(
    new Array<types.utils.Insert<types.tables.Event>>(count).fill({
      session_id: session?.id as string,
      type: "test",
      server_time: new Date().toLocaleString(),
    })
  );

  await database.destroy();
})();
