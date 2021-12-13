import { database } from "../app";
import { accounts } from "../controllers/auth";

(async () => {
  await accounts().delete().where({
    password: "fixtures",
  });

  await database.destroy();
})();
