import * as types from "rm2-typings";
import faker from "faker";

import { database } from "../app";
import { games } from "../controllers/game";
import { accounts } from "../controllers/auth";
import { events, sessions } from "../controllers/events";

(async () => {
  const email = faker.internet.email();
  const key = "fixtures";

  await accounts().insert({
    created_timestamp: new Date(),
    email,
    is_admin: false,
    password: key,
  } as types.utils.Insert<types.tables.Account>);

  const account = await accounts().where({ email }).first();

  await games().insert(
    new Array<types.utils.Insert<types.tables.Game>>(20)
      .fill(null as any)
      .map(() => ({
        name: faker.company.companyName(),
        description: faker.company.catchPhraseDescriptor(),
        publisher_id: account?.id,
      }))
  );

  const gameList = await games().where({ publisher_id: account?.id });

  await sessions().insert(
    new Array<types.utils.Insert<types.tables.Session>>(50)
      .fill(null as any)
      .map(() => ({
        external_id: key,
        closed: false,
        created_timestamp: new Date(),
        updated_timestamp: new Date(),
        custom_data: JSON.stringify(key),
        game_id: gameList[Math.floor(gameList.length * Math.random())].id,
      }))
  );

  const sessionList = await sessions().where({
    external_id: key,
  });

  await events().insert(
    new Array<types.utils.Insert<types.tables.Event>>(100)
      .fill(null as any)
      .map(() => ({
        session_id:
          sessionList[Math.floor(sessionList.length * Math.random())].id,
        type: "test",
        server_timestamp: new Date(),
      }))
  );

  await database.destroy();
})();
