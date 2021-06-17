import chalk from "chalk";
import cron from "cron";

import * as app from "./app";

import * as auth from "./controllers/auth";

app.loadRoutes(true).then(() => {
  app.server.listen(process.env.SERVER_PORT ?? 6627, () => {
    console.log(chalk.magenta("listening"), process.env.SERVER_PORT ?? 6627);
  });

  new cron.CronJob("00 00 00 * * *", auth.purgeSessions).start();
});
