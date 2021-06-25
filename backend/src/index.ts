import chalk from "chalk";

import * as app from "./app";

app.loadRoutes(true).then(() => {
  app.server.listen(process.env.BACKEND_PORT ?? 6627, () => {
    console.log(chalk.magenta("listening"), process.env.BACKEND_PORT ?? 6627);
  });
});
